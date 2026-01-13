import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Box, 
  HardDrive, 
  ShieldCheck, 
  CheckCircle2,
  Info,
  Layers,
  Cloud,
  Database,
  Plus,
  Trash2,
  Download,
  Share2,
  Settings2,
  Terminal,
  Code2,
  Key,
  Lock,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  Check,
  X,
  Bell,
  AlertTriangle,
  FolderOpen,
  Zap,
  Link,
  Archive
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
  { id: 'nas_ssd', name: '共享存储 (SSD)', icon: <Share2 size={16} />, desc: '全闪架构共享存储，适合高并发读写', color: 'indigo', unitPrice: 0, badge: 'SSD' },
  { id: 'nas_hdd', name: '共享存储 (HDD)', icon: <HardDrive size={16} />, desc: '大容量低成本共享存储，适合模型仓库', color: 'slate', unitPrice: 0.004, badge: 'HDD' },
  { id: 'baidu', name: '百度网盘 (Netdisk)', icon: <Cloud size={16} />, desc: '直连网盘，支持模型/资源高速同步', color: 'cyan', unitPrice: 0, badge: 'NET' },
  { id: 'local', name: '本地 NVMe 盘', icon: <Zap size={16} />, desc: '物理机直连超高性能盘，释放后清空', color: 'orange', unitPrice: 0, badge: 'LOCAL' },
];

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
}

const MOCK_EXISTING_SSD = [
  { id: 'ssd-vol-881', name: 'Shared-SSD-ClusterA (1024GB)', size: 1024 },
  { id: 'ssd-vol-992', name: 'Model-Weights-Mirror (512GB)', size: 512 },
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
      if (storageDropdownRef.current && !storageDropdownRef.current.contains(event.target as Node)) {
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
    const typeCount = extraStorage.filter(s => s.type === typeId).length + 1;
    
    let path = `/mnt/data${extraStorage.length + 1}`;
    while (mountPaths.includes(path)) {
      nextIdx++;
      path = `/mnt/data${nextIdx}`;
    }

    const newStorage: StorageItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: typeId,
      name: `${storageType.name.split(' (')[0]}-${typeCount}`,
      mountPath: path,
      size: typeId === 'local' ? 500 : (typeId === 'nas_ssd' ? 1024 : 50),
      config: typeId === 'baidu' ? { syncDir: '/app/models' } : {},
      sharedId: typeId === 'nas_ssd' ? MOCK_EXISTING_SSD[0].id : '',
      isNew: typeId === 'nas_hdd' ? false : false // By default HDD is not "new" until explicitly chosen
    };
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
    if (typeInfo && typeInfo.unitPrice) {
      // Logic: SSD is free. HDD is only paid if isNew. Others are paid.
      if (s.type === 'nas_ssd') return acc;
      if (s.type === 'nas_hdd' && !s.isNew) return acc;
      return acc + (s.size * typeInfo.unitPrice);
    }
    return acc;
  }, 0);

  const totalPrice = ((currentGpu?.price || 0) * gpuCount + storagePrice).toFixed(2);
  const activePartition = PARTITIONS.find(p => p.id === selectedPartition);

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
                      <Lock size={14} className="mr-2" /> 命名空间
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
                             {type.unitPrice > 0 && <span className="text-[10px] text-blue-500 font-bold">¥{type.unitPrice}/G</span>}
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

              {extraStorage.map(storage => {
                const typeInfo = STORAGE_TYPES.find(t => t.id === storage.type);
                
                // Logic per request:
                // SSD: Shared ID selector, Free, show capacity.
                // HDD: Simulation of none, shared ID empty, has "Create New" which allows name/path/cap/price.
                
                if (storage.type === 'nas_ssd') {
                   const selectedVol = MOCK_EXISTING_SSD.find(v => v.id === storage.sharedId);
                   return (
                    <div key={storage.id} className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><Share2 size={24} /></div>
                          <div>
                             <h5 className="text-sm font-bold text-gray-800">已购共享存储挂载 (SSD)</h5>
                             <p className="text-[11px] text-green-600 font-bold mt-1">✓ 挂载免费 (不消耗账户余额)</p>
                          </div>
                        </div>
                        <button onClick={() => setExtraStorage(extraStorage.filter(s => s.id !== storage.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={20} /></button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">共享存储 ID</label>
                          <select 
                            value={storage.sharedId}
                            onChange={(e) => updateStorage(storage.id, { sharedId: e.target.value, size: MOCK_EXISTING_SSD.find(v => v.id === e.target.value)?.size || 0 })}
                            className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg font-bold"
                          >
                            {MOCK_EXISTING_SSD.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">挂载路径</label>
                          <input 
                            type="text" 
                            value={storage.mountPath}
                            onChange={(e) => updateStorage(storage.id, { mountPath: e.target.value })}
                            className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg font-mono text-blue-600"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">当前卷容量</label>
                          <div className="w-full text-xs p-2.5 bg-white/50 border border-dashed border-gray-200 rounded-lg font-black text-gray-700 flex items-center justify-between">
                            <span>{selectedVol?.size} GB</span>
                            <span className="text-[9px] bg-gray-100 px-1 rounded text-gray-400">RO/RW</span>
                          </div>
                        </div>
                      </div>
                    </div>
                   );
                }

                if (storage.type === 'nas_hdd') {
                  const currentPrice = (storage.size * (typeInfo?.unitPrice || 0)).toFixed(3);
                  return (
                    <div key={storage.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-2xl bg-slate-50 text-slate-600"><HardDrive size={24} /></div>
                          <div>
                             <h5 className="text-sm font-bold text-gray-800">共享存储挂载 (HDD)</h5>
                             <p className="text-[10px] text-gray-400 mt-1">模拟没有共享存储的情形：下拉可选新建</p>
                          </div>
                        </div>
                        <button onClick={() => setExtraStorage(extraStorage.filter(s => s.id !== storage.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={20} /></button>
                      </div>

                      <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">选择共享存储 ID</label>
                          <select 
                            value={storage.isNew ? 'new' : ''}
                            onChange={(e) => updateStorage(storage.id, { isNew: e.target.value === 'new', name: e.target.value === 'new' ? 'New-HDD-Volume' : storage.name })}
                            className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg font-bold"
                          >
                            <option value="">(空) 无可用共享存储</option>
                            <option value="new">+ 新建共享存储卷</option>
                          </select>
                        </div>

                        {storage.isNew && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">卷名称</label>
                                <input 
                                  type="text" 
                                  value={storage.name}
                                  onChange={(e) => updateStorage(storage.id, { name: e.target.value })}
                                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg font-bold"
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">挂载路径</label>
                                <input 
                                  type="text" 
                                  value={storage.mountPath}
                                  onChange={(e) => updateStorage(storage.id, { mountPath: e.target.value })}
                                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg font-mono text-blue-600"
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">容量 (GB)</label>
                                <input 
                                  type="number" 
                                  value={storage.size}
                                  onChange={(e) => updateStorage(storage.id, { size: parseInt(e.target.value) || 0 })}
                                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg font-black"
                                />
                             </div>
                             <div className="flex flex-col justify-end">
                                <p className="text-[11px] font-bold text-blue-500 mb-1">价格: ¥{currentPrice}/h</p>
                                <div className="text-[9px] bg-blue-50 text-blue-600 p-1.5 rounded font-bold text-center border border-blue-100 uppercase">NEW VOLUME</div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Default rendering for other storage types (Cloud Disk, Netdisk, etc.)
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

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default InstanceDeployment;