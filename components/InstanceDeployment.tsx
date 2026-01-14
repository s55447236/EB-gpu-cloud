
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
  RotateCcw,
  RefreshCw,
  Link,
  Minus
} from 'lucide-react';

interface InstanceDeploymentProps {
  onBack: () => void;
}

interface GpuSpec {
  id: string;
  name: string;
  vram: string;
  baseCores: number;
  baseRam: number;
  price: number;
  availableIn: string[];
}

const ALL_GPU_SPECS: GpuSpec[] = [
  { id: 'h100', name: 'NVIDIA H100', vram: '80GB', baseCores: 96, baseRam: 512, price: 28.50, availableIn: ['hb1', 'hb2'] },
  { id: 'a100', name: 'NVIDIA A100', vram: '80GB', baseCores: 12, baseRam: 64, price: 12.80, availableIn: ['hb1', 'hb2'] },
  { id: '4090', name: 'NVIDIA RTX 4090', vram: '24GB', baseCores: 8, baseRam: 32, price: 2.50, availableIn: ['hb1', 'hd1'] },
  { id: '4090d', name: 'NVIDIA RTX 4090D', vram: '24GB', baseCores: 8, baseRam: 32, price: 2.20, availableIn: ['hb1'] },
  { id: 'cpu', name: 'Intel Xeon Platinum', vram: 'N/A', baseCores: 16, baseRam: 64, price: 0.85, availableIn: ['hb1'] },
];

const DRIVER_VERSIONS = [
  '535.129.03 (CUDA 12.2)',
  '525.105.17 (CUDA 12.0)',
  '515.65.01 (CUDA 11.7)',
  '470.182.03 (CUDA 11.4)',
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
  { id: 'block', name: '云硬盘 (Block)', icon: <Database size={16} />, desc: '持久化块存储，支持快照，极高性能', color: 'blue', unitPrice: 0.005, badge: 'BLOCK' },
  { id: 'shared', name: '共享存储 (NAS)', icon: <Share2 size={16} />, desc: '高性能共享文件存储，支持多实例挂载', color: 'indigo', unitPrice: 0.8, badge: 'SHARED' },
  { id: 'local', name: '本地NVMe盘', icon: <Zap size={16} />, desc: '物理机直连超高性能盘，释放后清空', color: 'orange', unitPrice: 0.01, badge: 'LOCAL' },
];

const PARTITIONS = [
  { id: 'hb1', name: '华北一区', desc: '推荐分区' },
  { id: 'hb2', name: '华北一区', desc: 'A800专专区' },
  { id: 'hd1', name: '华东一区', desc: '4090专区' },
];

interface StorageItem {
  id: string;
  type: string;
  name: string;
  mountPath: string;
  size: number;
  isNew: boolean;
  selectedVolumeId?: string;
  isInitial?: boolean;
}

const MOCK_EXISTING_VOLUMES: Record<string, { id: string, name: string, size: number }[]> = {
  block: [
    { id: 'vol-bk-001', name: '训练数据集-A', size: 500 },
    { id: 'vol-bk-002', name: '模型Checkpoint归档', size: 200 },
  ],
  shared: [
    { id: 'vol-sh-881', name: 'shared-nas-volume', size: 2000 },
    { id: 'vol-sh-992', name: 'global-weights-repo', size: 512 },
  ],
  local: [] 
};

const InstanceDeployment: React.FC<InstanceDeploymentProps> = ({ onBack }) => {
  const [selectedPartition, setSelectedPartition] = useState('hb1');
  const [selectedGpu, setSelectedGpu] = useState('a100');
  const [selectedDriver, setSelectedDriver] = useState(DRIVER_VERSIONS[0]);
  const [gpuCount, setGpuCount] = useState(1);
  const [instanceCount, setInstanceCount] = useState(1);
  const [imageCategory, setImageCategory] = useState('preinstalled');
  const [selectedImage, setSelectedImage] = useState('pt21');
  const [extraStorage, setExtraStorage] = useState<StorageItem[]>([]);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    let path = `/root/data${extraStorage.length > 0 ? extraStorage.length + 1 : ''}`;
    while (mountPaths.includes(path)) {
      nextIdx++;
      path = `/root/data${nextIdx}`;
    }

    const existingVolumes = MOCK_EXISTING_VOLUMES[typeId] || [];
    const forceNew = existingVolumes.length === 0;

    const newStorage: StorageItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: typeId,
      name: forceNew ? `eb-${typeId}-vol-${(extraStorage.filter(s => s.type === typeId).length + 1).toString().padStart(2, '0')}` : '',
      mountPath: path,
      size: typeId === 'shared' ? 2000 : 50,
      isNew: forceNew,
      isInitial: !forceNew
    };

    setExtraStorage([...extraStorage, newStorage]);
    setShowStorageDropdown(false);
    showToast(`已添加: ${storageType.name}`);
  };

  const updateStorage = (id: string, updates: Partial<StorageItem>) => {
    setExtraStorage(extraStorage.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...updates };

      if (updates.isNew === true && !s.isNew) {
        updated.isInitial = false;
        if (!updated.name || updated.name === '') {
          const typeCount = extraStorage.filter(item => item.type === s.type && item.isNew).length + 1;
          updated.name = `eb-${s.type}-vol-${typeCount.toString().padStart(2, '0')}`;
        }
        updated.selectedVolumeId = undefined;
      } else if (updates.selectedVolumeId) {
        const existing = MOCK_EXISTING_VOLUMES[s.type]?.find(v => v.id === updates.selectedVolumeId);
        if (existing) {
          updated.name = existing.name;
          updated.size = existing.size;
          updated.isNew = false;
          updated.isInitial = false;
        }
      } else if (updates.isNew === false && s.isNew) {
         updated.isInitial = true;
         updated.name = '';
      }
      
      return updated;
    }));
  };

  const currentGpu = ALL_GPU_SPECS.find(g => g.id === selectedGpu);
  const imagesToShow = ADVANCED_IMAGES[imageCategory] || [];
  const extraStorageSize = extraStorage.reduce((acc, s) => acc + s.size, 0);
  const storagePrice = extraStorage.reduce((acc, s) => {
    if (!s.isNew) return acc;
    const typeInfo = STORAGE_TYPES.find(t => t.id === s.type);
    if (typeInfo && typeInfo.unitPrice) return acc + (s.size * typeInfo.unitPrice);
    return acc;
  }, 0);

  const scaledCores = (currentGpu?.baseCores || 0) * gpuCount;
  const scaledRam = (currentGpu?.baseRam || 0) * gpuCount;
  const gpuSubtotal = (currentGpu?.price || 0) * gpuCount;
  const totalPrice = ((gpuSubtotal + storagePrice) * instanceCount).toFixed(2);
  const activePartition = PARTITIONS.find(p => p.id === selectedPartition);
  const activeImage = imagesToShow.find(img => img.id === selectedImage);

  const renderMountButton = () => (
    <div className="relative" ref={storageDropdownRef}>
      <button 
        onClick={() => setShowStorageDropdown(!showStorageDropdown)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
      >
        <Plus size={18} />
        <span>挂载数据盘</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${showStorageDropdown ? 'rotate-180' : ''}`} />
      </button>
      {showStorageDropdown && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-4">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">选择存储类型</div>
          {STORAGE_TYPES.map(type => (
            <button 
              key={type.id} 
              onClick={() => addStorage(type.id)} 
              className="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl text-left transition-colors group/item"
            >
              <div className={`mt-0.5 p-2 rounded-lg bg-${type.color}-50 text-${type.color}-600 group-hover/item:scale-110 transition-transform`}>{type.icon}</div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{type.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 transform ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
        }`}>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-blue-400">
            <div className="bg-white/20 p-1.5 rounded-lg"><CheckCircle2 size={18} /></div>
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
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">定制 GPU 智算实例</h1>
            <p className="text-xs text-gray-500 mt-0.5">控制台 / 算力服务 / 部署实例</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section 1: GPU Specs & Cluster */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
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
                className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors py-1 px-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100"
              >
                <Settings2 size={14} />
                <span>高级配置</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                    <Globe size={14} className="mr-2 text-gray-400" /> 集群
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                    >
                      <option value="c-sh-01">SH-Fast-H100-Auto-Scaling-01</option>
                      <option value="c-bj-01">BJ-North-Cluster-GPU-30</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                    <Link size={14} className="mr-2 text-gray-400" /> 命名空间
                  </label>
                  <input 
                    type="text"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="default"
                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ALL_GPU_SPECS.map(gpu => (
                <div key={gpu.id} className="relative h-full">
                  <button
                    onClick={() => handleGpuSelect(gpu)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all h-full flex flex-col group ${
                      selectedGpu === gpu.id 
                        ? 'border-blue-600 bg-white shadow-lg ring-1 ring-blue-600/10' 
                        : gpu.availableIn.includes(selectedPartition) 
                          ? 'border-gray-100 hover:border-blue-200 bg-white'
                          : 'border-gray-50 opacity-60 hover:opacity-100 hover:border-yellow-200 bg-gray-50/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{gpu.name}</span>
                      <span className="text-xs font-bold text-blue-600">¥{gpu.price}/h</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-gray-500 mb-4">
                      <p>显存: {gpu.vram}</p>
                      <div className="flex items-center space-x-3">
                        <span>CPU: {gpu.baseCores}core</span>
                        <span>内存: {gpu.baseRam}GB</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100/50">
                      <div className="flex items-center space-x-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter shrink-0">驱动版本</label>
                        <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            disabled={!gpu.availableIn.includes(selectedPartition)}
                            className={`w-full text-[10px] font-bold py-1 px-2 rounded-lg border outline-none appearance-none transition-colors ${
                              selectedGpu === gpu.id 
                              ? 'bg-[#f8fafc] border-gray-100 text-gray-700' 
                              : 'bg-gray-50/80 border-gray-100 text-gray-600'
                            }`}
                          >
                            {DRIVER_VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
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
                  <button 
                    key={num} 
                    onClick={() => setGpuCount(num)} 
                    className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                      gpuCount === num ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 flex items-center space-x-3 mt-4">
              <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                <Zap size={16} />
              </div>
              <p className="text-sm text-blue-900 font-medium">
                当前所选：<span className="font-bold">{currentGpu?.name} * {gpuCount}</span> <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black mx-1 uppercase">CORE {scaledCores}</span>, 内存 <span className="font-bold">{scaledRam}GB</span>
              </p>
            </div>
          </section>

          {/* Section 2: Storage Configuration */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-100">
                  <HardDrive size={18} />
                </div>
                <h2 className="font-bold text-gray-800">存储配置</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                    <HardDrive size={18} />
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">系统盘 (Root SSD)</span>
                    <span className="text-sm text-gray-500">空间: 30GB</span>
                    <span className="text-sm text-blue-500 font-bold uppercase">免费</span>
                  </div>
                </div>
              </div>

              {extraStorage.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                      <Database size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-900">数据盘</span>
                  </div>

                  <div className="space-y-6">
                    {extraStorage.map((storage) => {
                      const typeInfo = STORAGE_TYPES.find(t => t.id === storage.type);
                      const existingVolumes = MOCK_EXISTING_VOLUMES[storage.type] || [];

                      return (
                        <div key={storage.id} className="relative grid grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-1">
                          <div className="col-span-4 space-y-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <label className="text-xs text-gray-400 font-medium">{typeInfo?.name.split(' (')[0]}名称</label>
                              {storage.isNew && <span className="bg-green-50 text-green-600 px-1 rounded text-[9px] font-black uppercase">新建</span>}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                {storage.isNew ? (
                                  <input 
                                    type="text" 
                                    value={storage.name}
                                    onChange={(e) => updateStorage(storage.id, { name: e.target.value })}
                                    className="w-full bg-white border border-blue-400 rounded-lg py-2 px-3 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="输入硬盘名称"
                                  />
                                ) : (
                                  <div className="relative">
                                    <select 
                                      value={storage.isInitial ? 'none' : storage.selectedVolumeId} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'new') updateStorage(storage.id, { isNew: true });
                                        else if (val === 'none') return;
                                        else updateStorage(storage.id, { selectedVolumeId: val });
                                      }}
                                      className={`w-full bg-white border rounded-lg py-2 px-3 text-sm font-medium outline-none appearance-none pr-10 transition-colors ${
                                        storage.isInitial ? 'text-gray-400 border-gray-200 hover:border-blue-300' : 'text-gray-900 border-gray-200 hover:border-blue-400'
                                      }`}
                                    >
                                      <option value="none">请选择</option>
                                      <option value="new">创建新 {typeInfo?.name.split(' (')[0]}</option>
                                      {existingVolumes.length > 0 && <optgroup label="挂载已有卷">
                                        {existingVolumes.map(v => <option key={v.id} value={v.id}>{v.name} ({v.size}GB)</option>)}
                                      </optgroup>}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={() => {
                                  if (storage.isNew && existingVolumes.length > 0) {
                                    updateStorage(storage.id, { isNew: false, isInitial: true, name: '' });
                                  }
                                }}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                                title="切换/刷新存储"
                              >
                                {storage.isNew && existingVolumes.length > 0 ? <RotateCcw size={16} /> : <RefreshCw size={16} />}
                              </button>
                            </div>
                          </div>

                          <div className="col-span-3 space-y-2">
                            <label className="text-xs text-gray-400 font-medium">挂载路径</label>
                            <input 
                              type="text" 
                              value={storage.mountPath} 
                              onChange={(e) => updateStorage(storage.id, { mountPath: e.target.value })}
                              placeholder="如：/root/data"
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium outline-none placeholder:text-gray-300 focus:border-blue-500 transition-colors"
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <label className="text-xs text-gray-400 font-medium">容量</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                value={storage.size} 
                                readOnly={!storage.isNew}
                                onChange={(e) => updateStorage(storage.id, { size: parseInt(e.target.value) || 0 })}
                                className={`w-full border rounded-lg py-2 px-3 text-sm font-medium outline-none pr-10 transition-colors ${
                                  storage.isNew ? 'bg-white border-gray-200 focus:border-blue-500' : 'bg-gray-50 border-transparent text-gray-500'
                                }`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">GB</span>
                            </div>
                          </div>

                          <div className="col-span-2 space-y-2 pb-2">
                            <label className="text-xs text-gray-400 font-medium block">预估价格</label>
                            {storage.isNew ? (
                              <span className="text-sm font-bold text-blue-600">¥ {((typeInfo?.unitPrice || 0) * storage.size).toFixed(2)}/h</span>
                            ) : (
                              <span className="text-xs font-bold text-gray-400">—</span>
                            )}
                          </div>

                          <div className="col-span-1 pb-1.5 text-right">
                            <button 
                              onClick={() => setExtraStorage(extraStorage.filter(s => s.id !== storage.id))}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4">
                    {renderMountButton()}
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  {renderMountButton()}
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Images */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-100"><Box size={18} /></div>
                <h2 className="font-bold text-gray-800">3. 镜像选择与基础环境</h2>
              </div>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                {['official', 'preinstalled', 'community'].map(cat => (
                  <button key={cat} onClick={() => setImageCategory(cat)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${imageCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                    {cat === 'official' ? '基础镜像' : cat === 'preinstalled' ? '深度学习' : '社区应用'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagesToShow.map((img: ImageItem) => (
                <button key={img.id} onClick={() => setSelectedImage(img.id)} className={`p-4 rounded-xl border-2 flex flex-col text-left transition-all ${selectedImage === img.id ? 'border-blue-600 bg-blue-50/20' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{img.name}</h4>
                      <p className="text-xs text-blue-500 font-medium mt-0.5">{img.version}</p>
                    </div>
                    {img.author && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{img.author}</span>}
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-[10px] text-gray-400 font-bold uppercase">
                    <span className="flex items-center"><Download size={10} className="mr-1" /> {img.downloads}</span>
                    <span className="flex items-center"><HardDrive size={10} className="mr-1" /> {img.size}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-6 space-y-5 flex flex-col">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">配置概要</h3>

            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center text-sm">
                <div>
                   <span className="text-gray-400 font-medium">资源分区: </span>
                   <span className="text-gray-900 font-bold">{activePartition?.name}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                   <span className="text-gray-400 font-medium">规格: </span>
                   <span className="text-gray-900 font-bold">{currentGpu?.name}*{gpuCount}</span>
                </div>
                <span className="text-[11px] font-bold text-orange-500">¥{gpuSubtotal.toFixed(1)}/小时</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400 font-medium">驱动版本: </span>
                  <span className="text-gray-900 font-bold">{selectedDriver.split(' ')[0]}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400 font-medium">cpu/内存: </span>
                  <span className="text-gray-900 font-bold">{scaledCores}core /{scaledRam}GB</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400 font-medium">系统盘: </span>
                  <span className="text-gray-900 font-bold">30GB</span>
                </div>
              </div>
              
              {extraStorage.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-400 font-medium">块存储: </span>
                    <span className="text-gray-900 font-bold">{extraStorageSize}GB</span>
                  </div>
                  {storagePrice > 0 && <span className="text-[11px] font-bold text-orange-500">¥{storagePrice.toFixed(1)}/小时</span>}
                </div>
              )}
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400 font-medium">镜像版本: </span>
                  <span className="text-gray-900 font-bold">{activeImage?.version.split(' / ')[0] || 'Base Version'}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-900 font-bold">数量</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button 
                    onClick={() => setInstanceCount(Math.max(1, instanceCount - 1))}
                    className="p-2 hover:bg-gray-50 text-gray-400 transition-colors border-r border-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="px-5 py-2 text-sm font-bold text-gray-700 w-16 text-center">
                    {instanceCount.toFixed(2)}
                  </div>
                  <button 
                    onClick={() => setInstanceCount(instanceCount + 1)}
                    className="p-2 hover:bg-gray-50 text-gray-400 transition-colors border-l border-gray-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-5">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-gray-900">合计</span>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-black text-orange-500">¥ {totalPrice}</span>
                  <span className="text-xs text-gray-400 font-bold">/小时</span>
                  <Info size={14} className="text-gray-300 cursor-help ml-1" />
                </div>
              </div>
              
              <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]">
                <span>立即部署实例</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceDeployment;
