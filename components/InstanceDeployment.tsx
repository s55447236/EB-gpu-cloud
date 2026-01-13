
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Box, 
  HardDrive, 
  CheckCircle2,
  Info,
  Database,
  Plus,
  Trash2,
  Download,
  Share2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  Check,
  X,
  AlertTriangle,
  Zap,
  Cloud,
  ChevronRight,
  Key,
  RotateCcw
} from 'lucide-react';

interface InstanceDeploymentProps {
  onBack: () => void;
}

interface GpuSpec {
  id: string;
  name: string;
  memory: string;
  cores: string;
  ram: string;
  price: number;
  availableIn: string[];
}

const ALL_GPU_SPECS: GpuSpec[] = [
  { id: 'h100', name: 'NVIDIA H100', memory: '80GB', cores: '96核', ram: '512GB', price: 28.50, availableIn: ['hb1', 'hb2'] },
  { id: 'a100', name: 'NVIDIA A100', memory: '80GB', cores: '12核', ram: '64GB', price: 12.80, availableIn: ['hb1', 'hb2'] },
  { id: '4090', name: 'NVIDIA RTX 4090', memory: '24GB', cores: '8核', ram: '32GB', price: 2.50, availableIn: ['hb1', 'hd1'] },
  { id: '4090d', name: 'NVIDIA RTX 4090D', memory: '24GB', cores: '8核', ram: '32GB', price: 2.20, availableIn: ['hb1'] },
  { id: 'cpu', name: 'Intel Xeon Platinum', memory: 'N/A', cores: '16核', ram: '64GB', price: 0.85, availableIn: ['hb1'] },
];

interface ImageItem {
  id: string;
  name: string;
  version: string;
  downloads: string;
  size: string;
  author?: string;
}

const ADVANCED_IMAGES: Record<string, ImageItem[]> = {
  official: [
    { id: 'u22', name: 'Ubuntu 22.04 LTS', version: 'Base / Clean', downloads: '1.2M', size: '2.1GB' },
    { id: 'u20', name: 'Ubuntu 20.04 LTS', version: 'Base / Clean', downloads: '800K', size: '1.8GB' },
  ],
  preinstalled: [
    { id: 'pt21', name: 'PyTorch 2.1.0', version: 'CUDA 12.1 / Python 3.10', downloads: '450K', size: '12.4GB' },
    { id: 'tf215', name: 'TensorFlow 2.15', version: 'CUDA 11.8 / Python 3.9', downloads: '210K', size: '10.2GB' },
  ],
  community: [
    { id: 'sd-xl', name: 'Stable Diffusion XL 1.0', version: 'WebUI / ComfyUI / ControlNet', downloads: '15K', size: '18.5GB', author: '秋叶' },
    { id: 'llama3', name: 'Llama-3-70B-Chat', version: 'Int4 / Ollama Runtime', downloads: '8K', size: '42GB', author: 'Llama-Family' },
  ]
};

const STORAGE_TYPES = [
  { id: 'block', name: '云硬盘（块存储）', icon: <Database size={16} />, desc: '持久化块存储，支持快照，极高性能', color: 'blue', unitPrice: 0.005, badge: 'BLOCK' },
  { id: 'shared', name: '共享存储 (NAS)', icon: <Share2 size={16} />, desc: '高性能共享文件存储，支持多实例挂载', color: 'indigo', unitPrice: 0, badge: 'SHARED' },
  { id: 'baidu', name: '百度网盘 (Netdisk)', icon: <Cloud size={16} />, desc: '直连网盘，支持模型/资源高速同步', color: 'cyan', unitPrice: 0, badge: 'NET' },
  { id: 'local', name: '本地 NVMe 盘', icon: <Zap size={16} />, desc: '物理机直连超高性能盘，释放后清空', color: 'orange', unitPrice: 0, badge: 'LOCAL' },
];

const SHARED_STORAGE_PRICING = {
  SSD: 0.005,
  HDD: 0.004
};

const PARTITIONS = [
  { id: 'hb1', name: '华北一区', desc: '推荐分区' },
  { id: 'hb2', name: '华北一区', desc: 'A800专区' },
  { id: 'hd1', name: '华东一区', desc: '4090专区' },
];

interface StorageItem {
  id: string;
  type: string;
  name: string;
  mountPath: string;
  size: number;
  config?: any;
  sharedId?: string;
  isNew?: boolean;
  subType?: 'SSD' | 'HDD';
}

const MOCK_EXISTING_SHARED = [
  { id: 'vol-sh-881', name: 'Shared-SSD-ClusterA', type: 'SSD', size: 1024 },
  { id: 'vol-sh-992', name: 'Model-Weights-Mirror', type: 'HDD', size: 512 },
];

const InstanceDeployment: React.FC<InstanceDeploymentProps> = ({ onBack }) => {
  const [selectedPartition, setSelectedPartition] = useState('hb1');
  const [selectedGpu, setSelectedGpu] = useState('a100');
  const [gpuCount, setGpuCount] = useState(1);
  const [imageCategory, setImageCategory] = useState('preinstalled');
  const [selectedImage, setSelectedImage] = useState('pt21');
  const [extraStorage, setExtraStorage] = useState<StorageItem[]>([]);
  
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState('c-sh-01');
  const [namespace, setNamespace] = useState('default');

  const [pendingGpuId, setPendingGpuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const storageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storageDropdownRef.current && !storageDropdownRef.current.contains(event.target as HTMLElement)) {
        setShowStorageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ message, show: true });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(prev => prev ? { ...prev, show: false } : null);
    }, 3000);
  };

  const handleGpuSelect = (gpu: GpuSpec) => {
    if (gpu.availableIn.includes(selectedPartition)) {
      setSelectedGpu(gpu.id);
      setPendingGpuId(null);
    } else {
      setPendingGpuId(gpu.id);
    }
  };

  const confirmSwitchPartition = (gpu: GpuSpec) => {
    const targetPartitionId = gpu.availableIn[0];
    const targetPartitionName = PARTITIONS.find(p => p.id === targetPartitionId)?.name;
    setSelectedPartition(targetPartitionId);
    setSelectedGpu(gpu.id);
    setPendingGpuId(null);
    showToast(`已成功为您切换分区至: ${targetPartitionName}`);
  };

  const addStorage = (typeId: string) => {
    const storageType = STORAGE_TYPES.find(t => t.id === typeId);
    if (!storageType) return;
    
    const mountPaths = extraStorage.map(s => s.mountPath);
    let nextIdx = 1;
    let path = `/mnt/data${extraStorage.length + 1}`;
    while (mountPaths.includes(path)) {
      nextIdx++;
      path = `/mnt/data${nextIdx}`;
    }

    const newStorage: StorageItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: typeId,
      name: typeId === 'shared' ? 'Shared-Volume-New' : `${storageType.name.split(' (')[0]}`,
      mountPath: path,
      size: typeId === 'shared' ? 1024 : 50,
      config: typeId === 'baidu' ? { syncDir: '/app/models' } : {},
      sharedId: typeId === 'shared' ? MOCK_EXISTING_SHARED[0].id : '',
      isNew: false, 
      subType: 'SSD'
    };

    if (typeId === 'shared') {
      newStorage.subType = MOCK_EXISTING_SHARED[0].type as 'SSD' | 'HDD';
      newStorage.size = MOCK_EXISTING_SHARED[0].size;
    }

    setExtraStorage([...extraStorage, newStorage]);
    setShowStorageDropdown(false);
    showToast(`已添加: ${storageType.name}`);
  };

  const updateStorage = (id: string, updates: Partial<StorageItem>) => {
    setExtraStorage(extraStorage.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const currentGpu = ALL_GPU_SPECS.find(g => g.id === selectedGpu);
  const imagesToShow = ADVANCED_IMAGES[imageCategory] || [];
  
  const storagePrice = extraStorage.reduce((acc, s) => {
    const typeInfo = STORAGE_TYPES.find(t => t.id === s.type);
    if (s.type === 'shared') {
      if (!s.isNew) return acc;
      const rate = s.subType === 'HDD' ? SHARED_STORAGE_PRICING.HDD : SHARED_STORAGE_PRICING.SSD;
      return acc + (s.size * rate);
    }
    if (typeInfo && typeInfo.unitPrice) {
      return acc + (s.size * typeInfo.unitPrice);
    }
    return acc;
  }, 0);

  const totalPrice = ((currentGpu?.price || 0) * gpuCount + storagePrice).toFixed(2);
  const activePartition = PARTITIONS.find(p => p.id === selectedPartition);

  // Group Shared Storage items
  const sharedStorageItems = extraStorage.filter(s => s.type === 'shared');
  const otherStorageItems = extraStorage.filter(s => s.type !== 'shared');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 transform ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
        }`}>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-blue-400">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-sm font-bold tracking-tight">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">定制 GPU 智算实例</h1>
            <p className="text-xs text-gray-500 mt-0.5">控制台 / 算力服务 / 部署实例</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section 1: GPU Specs & Advanced */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-100">
                    <Cpu size={18} />
                  </div>
                  <h2 className="font-bold text-gray-800 whitespace-nowrap">1. 算力规格与集群配置</h2>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all shadow-sm"
                  >
                    <span>{activePartition?.name}</span>
                    <ChevronDown size={14} className={`text-blue-400 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showRegionDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      {PARTITIONS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPartition(p.id); setShowRegionDropdown(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                            selectedPartition === p.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold">{p.name}</p>
                            <p className="text-[10px] opacity-60">{p.desc}</p>
                          </div>
                          {selectedPartition === p.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  showAdvanced 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <Settings2 size={14} />
                <span>高级设置 (K8s 集群)</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showAdvanced && (
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                      <Globe size={14} className="mr-2" /> 集群
                    </label>
                    <select 
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="c-sh-01">SH-Fast-H100-Auto-Scaling-01</option>
                      <option value="c-bj-01">BJ-North-Cluster-GPU-30</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                      <Key size={14} className="mr-2" /> 命名空间
                    </label>
                    <input 
                      type="text"
                      value={namespace}
                      onChange={(e) => setNamespace(e.target.value)}
                      placeholder="default"
                      className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ALL_GPU_SPECS.map(gpu => (
                <div key={gpu.id} className="relative h-full">
                  <button
                    onClick={() => handleGpuSelect(gpu)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all h-full flex flex-col ${
                      selectedGpu === gpu.id 
                        ? 'border-blue-600 bg-blue-50/20 ring-4 ring-blue-50/50' 
                        : gpu.availableIn.includes(selectedPartition) 
                          ? 'border-gray-100 hover:border-blue-200 bg-white'
                          : 'border-gray-50 opacity-60 hover:opacity-100 hover:border-yellow-200 bg-gray-50/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{gpu.name}</span>
                      <span className="text-xs font-bold text-blue-600">¥{gpu.price}/h</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-gray-500">
                      <p>显存: {gpu.memory}</p>
                      <p>核心: {gpu.cores} | 内存: {gpu.ram}</p>
                    </div>
                  </button>
                  {pendingGpuId === gpu.id && (
                    <div className="absolute inset-x-0 bottom-full mb-3 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[280px] mx-auto relative animate-in zoom-in-95">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45"></div>
                        <div className="flex items-start space-x-3 mb-4">
                          <AlertTriangle size={16} className="text-orange-500" />
                          <p className="text-xs text-gray-600">当前分区不支持，是否切换至 {PARTITIONS.find(p => p.id === gpu.availableIn[0])?.name}？</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => setPendingGpuId(null)} className="px-3 py-1.5 text-[11px] font-bold text-gray-400">取消</button>
                          <button onClick={() => confirmSwitchPartition(gpu)} className="px-4 py-1.5 text-[11px] font-bold text-white bg-blue-600 rounded-lg">切换</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">卡数量</label>
              <div className="flex p-1 bg-gray-50 rounded-xl w-fit border border-gray-100">
                {[1, 2, 3, 4, 8].map(num => (
                  <button key={num} onClick={() => setGpuCount(num)} className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${gpuCount === num ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{num}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Comprehensive Data Disk Management */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-100">
                  <HardDrive size={18} />
                </div>
                <h2 className="font-bold text-gray-800">2. 分层存储挂载 (Data Disks & Shared Storage)</h2>
              </div>
              <div className="relative" ref={storageDropdownRef}>
                <button 
                  onClick={() => setShowStorageDropdown(!showStorageDropdown)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  <Plus size={16} />
                  <span>挂载数据盘</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showStorageDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showStorageDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-2xl rounded-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">选择存储类型</div>
                    {STORAGE_TYPES.map(type => (
                      <button 
                        key={type.id} 
                        onClick={() => addStorage(type.id)} 
                        className="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl text-left transition-colors group/item"
                      >
                        <div className={`mt-0.5 p-2 rounded-lg bg-${type.color}-50 text-${type.color}-600 group-hover/item:scale-110 transition-transform`}>{type.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <p className="text-xs font-bold text-gray-800">{type.name}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{type.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Default System Disk */}
              <div className="relative flex items-center justify-between p-5 bg-white rounded-2xl border border-blue-200 shadow-sm ring-1 ring-blue-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100">
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">系统盘 (Root SSD)</h5>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center">
                        挂载点: <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono ml-1">/</span>
                      </span>
                      <span>|</span>
                      <span>空间: 30GB</span>
                      <span>|</span>
                      <span className="text-blue-500 font-bold">免费赠送</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-widest border border-blue-100">DEFAULT</div>
              </div>

              {/* Shared Storage Grouped Card */}
              {sharedStorageItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                      <Share2 size={24} />
                    </div>
                    <h5 className="text-sm font-bold text-gray-800">共享存储挂载</h5>
                  </div>
                  
                  <div className="space-y-3">
                    {sharedStorageItems.map((storage) => {
                      const selectedVol = MOCK_EXISTING_SHARED.find(v => v.id === storage.sharedId);
                      const currentRate = storage.isNew ? (storage.subType === 'HDD' ? SHARED_STORAGE_PRICING.HDD : SHARED_STORAGE_PRICING.SSD) : 0;
                      const estimatedPrice = (storage.size * currentRate).toFixed(3);

                      return (
                        <div key={storage.id} className={`p-4 bg-gray-50/50 rounded-xl border group transition-all duration-300 ${storage.isNew ? 'border-indigo-200 bg-indigo-50/20 shadow-inner shadow-indigo-50/10' : 'border-gray-100'}`}>
                          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                            
                            {/* 1. Merged ID / Name Input Field */}
                            <div className="flex-1 min-w-[240px]">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">选择共享存储 ID / 卷名称</label>
                              <div className="relative flex items-center">
                                {storage.isNew ? (
                                  <div className="relative w-full">
                                    <input 
                                      type="text" 
                                      value={storage.name}
                                      onChange={(e) => updateStorage(storage.id, { name: e.target.value })}
                                      className="w-full text-xs p-2 pr-20 bg-white border border-indigo-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                      placeholder="输入新卷名称"
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                                      <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase">NEW</span>
                                      <button 
                                        onClick={() => updateStorage(storage.id, { isNew: false, name: '共享存储挂载', sharedId: MOCK_EXISTING_SHARED[0].id })}
                                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                        title="返回选择现有卷"
                                      >
                                        <RotateCcw size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <select 
                                    value={storage.sharedId}
                                    onChange={(e) => {
                                      if (e.target.value === 'new') {
                                        updateStorage(storage.id, { isNew: true, name: 'New-Shared-Volume', size: 50, subType: 'SSD' });
                                      } else {
                                        const vol = MOCK_EXISTING_SHARED.find(v => v.id === e.target.value);
                                        updateStorage(storage.id, { isNew: false, sharedId: e.target.value, size: vol?.size || 0, subType: vol?.type as any });
                                      }
                                    }}
                                    className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                  >
                                    <optgroup label="现有共享卷">
                                      {MOCK_EXISTING_SHARED.map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
                                    </optgroup>
                                    <option value="new">+ 新建共享存储卷</option>
                                  </select>
                                )}
                              </div>
                            </div>

                            {/* 2. Storage Type */}
                            <div className="flex-none w-28">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">存储类型</label>
                              {storage.isNew ? (
                                <select 
                                  value={storage.subType}
                                  onChange={(e) => updateStorage(storage.id, { subType: e.target.value as any })}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                >
                                  <option value="SSD">SSD</option>
                                  <option value="HDD">HDD</option>
                                </select>
                              ) : (
                                <div className="text-[11px] font-bold text-gray-600 bg-white border border-gray-100 rounded-lg p-2 text-center uppercase">
                                  {selectedVol?.type}
                                </div>
                              )}
                            </div>

                            {/* 3. Mount Path */}
                            <div className="flex-1 min-w-[180px]">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">挂载路径</label>
                              <input 
                                type="text" 
                                value={storage.mountPath}
                                onChange={(e) => updateStorage(storage.id, { mountPath: e.target.value })}
                                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg font-mono text-blue-600 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                              />
                            </div>

                            {/* 4. Capacity */}
                            <div className="flex-none w-24">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">容量 (GB)</label>
                              {storage.isNew ? (
                                <input 
                                  type="number" 
                                  value={storage.size}
                                  onChange={(e) => updateStorage(storage.id, { size: parseInt(e.target.value) || 0 })}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg font-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                />
                              ) : (
                                <div className="text-[11px] font-black text-gray-700 bg-white border border-gray-100 rounded-lg p-2 text-center">
                                  {selectedVol?.size}
                                </div>
                              )}
                            </div>

                            {/* 5. Price / Info (Moved after capacity on the same line) */}
                            <div className="flex-none min-w-[140px]">
                               <div className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${storage.isNew ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-blue-50 border-blue-100'}`}>
                                  <div className="flex flex-col items-center">
                                    <p className={`text-[11px] font-bold ${storage.isNew ? 'text-indigo-600' : 'text-blue-600'}`}>
                                      {storage.isNew ? `¥${estimatedPrice}/h` : '已购买卷'}
                                    </p>
                                    <p className="text-[8px] text-gray-400 uppercase font-black tracking-tighter leading-none mt-0.5">
                                      {storage.isNew ? '预估价格 / 状态' : '读写挂载中'}
                                    </p>
                                  </div>
                               </div>
                            </div>

                            {/* 6. Delete Button */}
                            <div className="flex-none flex items-center justify-center">
                              <button 
                                onClick={() => setExtraStorage(extraStorage.filter(s => s.id !== storage.id))}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Row Button inside the Shared Card */}
                  <button 
                    onClick={() => addStorage('shared')}
                    className="w-full mt-2 py-3 border-2 border-dashed border-indigo-100 rounded-xl text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center space-x-2 text-xs font-bold"
                  >
                    <Plus size={16} />
                    <span>增加一条共享存储挂载列</span>
                  </button>
                </div>
              )}

              {/* Other Storage Cards (Block, Netdisk, etc.) */}
              {otherStorageItems.map(storage => {
                const typeInfo = STORAGE_TYPES.find(t => t.id === storage.type);
                const currentPrice = (storage.size * (typeInfo?.unitPrice || 0)).toFixed(3);
                
                return (
                  <div key={storage.id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 space-y-4 md:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-2xl bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors`}>{typeInfo?.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text"
                              value={storage.name}
                              onChange={(e) => updateStorage(storage.id, { name: e.target.value })}
                              className="text-sm font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-blue-200 focus:border-blue-500 focus:outline-none transition-colors px-1 -ml-1"
                              placeholder="磁盘名称"
                            />
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">{typeInfo?.badge}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400">挂载至:</span>
                            <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg px-2 py-1 flex items-center">
                              <span className="text-blue-600 font-mono text-[11px]">{storage.mountPath}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-8">
                        {storage.type !== 'baidu' && (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                              <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-tighter">容量:</span>
                              <div className="flex items-center bg-white rounded-lg border border-gray-200 pr-2">
                                <input type="number" value={storage.size} onChange={(e) => updateStorage(storage.id, { size: parseInt(e.target.value) || 0 })} className="w-16 px-2.5 py-1.5 text-sm font-bold text-gray-800 outline-none text-right" />
                                <span className="ml-1 text-[11px] font-black text-gray-400">GB</span>
                              </div>
                            </div>
                            {typeInfo && typeInfo.unitPrice > 0 && <p className="text-[11px] text-blue-500 font-bold mt-1.5 pr-2">预估价格: ¥{currentPrice}/h</p>}
                          </div>
                        )}
                        <button onClick={() => setExtraStorage(extraStorage.filter(s => s.id !== storage.id))} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={22} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section 3: Images */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-100">
                  <Box size={18} />
                </div>
                <h2 className="font-bold text-gray-800">3. 镜像选择与基础环境</h2>
              </div>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                {['official', 'preinstalled', 'community'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setImageCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      imageCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {cat === 'official' ? '基础镜像' : cat === 'preinstalled' ? '深度学习' : '社区应用'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagesToShow.map((img: ImageItem) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.id)}
                  className={`p-4 rounded-xl border-2 flex flex-col transition-all relative ${
                    selectedImage === img.id ? 'border-blue-600 bg-blue-50/20 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900">{img.name}</h4>
                      <p className="text-xs text-blue-500 font-medium mt-0.5">{img.version}</p>
                    </div>
                    {img.author && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{img.author}</span>}
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    <span className="flex items-center"><Download size={10} className="mr-1" /> {img.downloads}</span>
                    <span className="flex items-center"><HardDrive size={10} className="mr-1" /> {img.size}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 sticky top-6 space-y-8 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="font-bold text-gray-800">实例清单概要</h3>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">配置确认</span>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">资源分区</span>
                <span className="font-bold text-gray-700">{activePartition?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">硬件规格</span>
                <span className="font-bold text-gray-700">{currentGpu?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">GPU 数量</span>
                <span className="font-bold text-blue-600">{gpuCount} 卡</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">镜像模板</span>
                <span className="font-bold text-gray-700 truncate ml-4" title={selectedImage}>{selectedImage.toUpperCase()}</span>
              </div>
              
              <div className="p-4 bg-gray-50/50 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">命名空间</span>
                  <span className="font-bold text-gray-600 truncate ml-2 max-w-[100px]">{namespace}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">额外存储</span>
                  <span className="font-bold text-gray-600">{extraStorage.length} 块</span>
                </div>
                {storagePrice > 0 && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">存储费用</span>
                    <span className="font-bold text-blue-500">¥{storagePrice.toFixed(2)}/h</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">访问控制</span>
                <div className="flex space-x-1">
                  <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-bold text-[9px]">SSH</span>
                  <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold text-[9px]">LAB</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">配置总价</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-blue-600">¥{totalPrice}</span>
                  <span className="text-xs text-gray-400 font-medium tracking-tighter"> /小时</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-medium mb-6">
                <Info size={12} />
                <span>实时按量计费，每小时自动扣除。</span>
              </div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 transform active:scale-95 flex items-center justify-center space-x-2">
                <span>立即部署实例</span>
                <ChevronRight size={18} className="opacity-50" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceDeployment;
