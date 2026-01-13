
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
  { id: 'block', name: '高性能云盘 (SSD)', icon: <Database size={16} />, desc: '持久化块存储，支持快照，极高性能', color: 'blue', unitPrice: 0.005, badge: 'BLOCK' },
  { id: 'nas_ssd', name: '共享存储 (SSD)', icon: <Share2 size={16} />, desc: '全闪架构共享存储，适合高并发读写', color: 'indigo', unitPrice: 0.01, badge: 'SSD' },
  { id: 'nas_hdd', name: '共享存储 (HDD)', icon: <HardDrive size={16} />, desc: '大容量低成本共享存储，适合模型仓库', color: 'slate', unitPrice: 0.004, badge: 'HDD' },
  { id: 'baidu', name: '百度网盘 (Netdisk)', icon: <Cloud size={16} />, desc: '直连网盘，支持模型/资源高速同步', color: 'cyan', unitPrice: 0, badge: 'NET' },
  { id: 'local', name: '本地 NVMe 盘', icon: <Zap size={16} />, desc: '物理机直连超高性能盘，释放后清空', color: 'orange', unitPrice: 0, badge: 'LOCAL' },
];

const PARTITIONS = [
  { id: 'hb1', name: '华北一区', desc: '推荐分区' },
  { id: 'hb2', name: '华北二区', desc: 'A800专区' },
  { id: 'hd1', name: '华东一区', desc: '4090专区' },
];

interface StorageItem {
  id: string;
  type: string;
  name: string;
  mountPath: string;
  size: number;
  config?: any;
}

const InstanceDeployment: React.FC<InstanceDeploymentProps> = ({ onBack }) => {
  const [selectedPartition, setSelectedPartition] = useState('hb1');
  const [selectedGpu, setSelectedGpu] = useState('a100');
  const [gpuCount, setGpuCount] = useState(1);
  const [imageCategory, setImageCategory] = useState('preinstalled');
  const [selectedImage, setSelectedImage] = useState('pt21');
  const [extraStorage, setExtraStorage] = useState<StorageItem[]>([]);
  
  const [showAdvanced, setShowAdvanced] = useState(true); // Default to open as per reference image
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
      size: typeId === 'local' ? 500 : 50,
      config: typeId === 'baidu' ? { syncDir: '/app/models' } : {}
    };
    setExtraStorage([...extraStorage, newStorage]);
    setShowStorageDropdown(false);
    showToast(`已添加: ${storageType.name}`);
  };

  const updateStorageName = (id: string, newName: string) => {
    setExtraStorage(extraStorage.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const currentGpu = ALL_GPU_SPECS.find(g => g.id === selectedGpu);
  const imagesToShow = ADVANCED_IMAGES[imageCategory] || [];
  
  const storagePrice = extraStorage.reduce((acc, s) => {
    const typeInfo = STORAGE_TYPES.find(t => t.id === s.type);
    if (typeInfo && typeInfo.unitPrice) {
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
              {/* Default System Disk (Old / Fixed) */}
              <div className="relative flex items-center justify-between p-5 bg-white rounded-2xl border border-blue-200 shadow-sm ring-1 ring-blue-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100">
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">系统盘 (Root SSD)</h5>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center">
                        挂载点: <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono