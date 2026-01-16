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
  Share2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Globe,
  Check,
  X,
  AlertTriangle,
  Zap,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Link,
  Minus,
  Lock,
  Terminal,
  Copy,
  BookOpen,
  Monitor
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

interface ImageVersion {
  id: string;
  label: string;
  size: string;
}

interface ImageItem {
  id: string;
  name: string;
  versions: ImageVersion[];
  author?: string;
  badge?: string;
  iconType?: string;
  iconColor?: string;
}

const IMAGES_BY_CAT: Record<string, ImageItem[]> = {
  prebuilt: [
    { 
      id: 'baidulinux', 
      name: 'BaiduLinux', 
      iconColor: 'bg-blue-600',
      versions: [{ id: 'bd-1', label: '3.0 x86_64 (64bit) / m-h4rTECpu', size: '1.2GB' }] 
    },
    { 
      id: 'centos', 
      name: 'CentOS', 
      iconColor: 'bg-purple-500',
      versions: [
        { id: 'ct-7', label: 'CentOS 7.9 64bit / Kernel 3.10', size: '1.5GB' },
        { id: 'ct-8', label: 'CentOS 8.4 64bit / Kernel 4.18', size: '1.8GB' }
      ] 
    },
    { 
      id: 'ubuntu', 
      name: 'Ubuntu', 
      iconColor: 'bg-orange-600',
      versions: [
        { id: 'ub-22', label: 'Ubuntu 22.04 LTS 64bit / Kernel 5.15', size: '2.1GB' },
        { id: 'ub-20', label: 'Ubuntu 20.04 LTS 64bit / Kernel 5.4', size: '1.9GB' },
        { id: 'ub-24', label: 'Ubuntu 24.04 LTS 64bit / Kernel 6.8', size: '2.4GB' }
      ] 
    },
    { 
      id: 'windows', 
      name: 'Windows Server', 
      iconColor: 'bg-sky-500',
      versions: [
        { id: 'win-2022', label: 'Windows Server 2022 Datacenter', size: '15GB' },
        { id: 'win-2019', label: 'Windows Server 2019 Datacenter', size: '14GB' }
      ] 
    },
    { 
      id: 'rocky', 
      name: 'Rocky Linux', 
      iconColor: 'bg-emerald-600',
      versions: [{ id: 'rk-9', label: 'Rocky Linux 9.2 Blue Onyx', size: '1.4GB' }] 
    },
    { 
      id: 'alma', 
      name: 'AlmaLinux', 
      iconColor: 'bg-rose-500',
      versions: [{ id: 'al-9', label: 'AlmaLinux 9.2 Sapphire Caracal', size: '1.4GB' }] 
    },
    { 
      id: 'debian', 
      name: 'Debian', 
      iconColor: 'bg-red-600',
      versions: [
        { id: 'db-11', label: 'Debian 11.7 Bullseye', size: '1.1GB' },
        { id: 'db-12', label: 'Debian 12.0 Bookworm', size: '1.2GB' }
      ] 
    },
    { 
      id: 'opensuse', 
      name: 'OpenSUSE', 
      iconColor: 'bg-green-500',
      versions: [{ id: 'os-15', label: 'OpenSUSE Leap 15.5', size: '1.6GB' }] 
    },
    { 
      id: 'fedora', 
      name: 'Fedora', 
      iconColor: 'bg-indigo-700',
      versions: [{ id: 'fd-38', label: 'Fedora Server 38', size: '1.3GB' }] 
    },
  ],
  custom: [
    { 
      id: 'my-model-base', 
      name: 'LLM-Training-Base', 
      badge: '私有镜像',
      versions: [
        { id: 'v1-0', label: 'Base/CUDA 12.1/Python 3.10/v1.0-stable', size: '42.5GB' },
        { id: 'v1-1-beta', label: 'Base/CUDA 12.1/Python 3.10/v1.1-beta', size: '42.8GB' }
      ] 
    }
  ],
  shared: [
    { 
      id: 'team-diffusion', 
      name: 'Team-SDXL-Optimized', 
      badge: '团队共享',
      versions: [{ id: 'v1', label: 'SDXL/WebUI/ControlNet v1.1/Optimized', size: '18.5GB' }],
      author: 'AI-Team'
    }
  ],
  external: [] 
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

const DEFAULT_TEMPLATES = {
  initPackage: `# 以下命令目前均为注释状态，请根据所选镜像情况按需修改。若是所选镜像为开发机保存而来，通常不需要修改
# 允许 root 用户基于密码登录
# mkdir -p /etc/ssh
# echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config`,
  initSSH: `# 以下命令初始化 root 密码及相关 k8s 环境变量，通常不需要修改
# 配置 sshd 的监听端口
sed -i '/^[#[:space:]]*Port[[:space:]]/d' /etc/ssh/sshd_config
echo "Port \${EBCS_SSH_PORT}" >> /etc/ssh/sshd_config`,
  launch: `# 以下命令启动 jupyter-lab 及 sshd 服务，通常不需要修改
# 后台启动 jupyter-lab
if command -v jupyter-lab >/dev/null 2>&1 && [ -n "\${EBCS_JUPYTER_PORT}" ] && [ -n "\${EBCS_JUPYTER_TOKEN}" ]; then
    cd /root && jupyter-lab --allow-root --ip=0.0.0.0 --port=\${EBCS_JUPYTER_PORT} --NotebookApp.token=\${EBCS_JUPYTER_TOKEN} &
fi`
};

const InstanceDeployment: React.FC<InstanceDeploymentProps> = ({ onBack }) => {
  const [selectedPartition, setSelectedPartition] = useState('hb1');
  const [selectedGpu, setSelectedGpu] = useState('a100');
  const [selectedDriver, setSelectedDriver] = useState(DRIVER_VERSIONS[0]);
  const [gpuCount, setGpuCount] = useState(1);
  const [instanceCount, setInstanceCount] = useState(1);
  
  // Image Selection State
  const [imageCategory, setImageCategory] = useState('prebuilt');
  const [selectedImageId, setSelectedImageId] = useState('ubuntu');
  const [selectedVersionMap, setSelectedVersionMap] = useState<Record<string, string>>({
    'ubuntu': 'ub-22',
    'centos': 'ct-7',
    'baidulinux': 'bd-1',
    'windows': 'win-2022',
    'rocky': 'rk-9',
    'alma': 'al-9',
    'debian': 'db-11',
    'opensuse': 'os-15',
    'fedora': 'fd-38',
    'my-model-base': 'v1-0',
    'team-diffusion': 'v1'
  });

  // Startup Command Template States
  const [commandTemplates, setCommandTemplates] = useState(DEFAULT_TEMPLATES);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
    initPackage: true,
    initSSH: true,
    launch: true
  });

  const [externalUrl, setExternalUrl] = useState('');
  const [hasExternalAuth, setHasExternalAuth] = useState(false);
  const [externalUsername, setExternalUsername] = useState('');
  const [externalPassword, setExternalPassword] = useState('');

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

  const toggleBlock = (id: string) => {
    setExpandedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetBlock = (id: keyof typeof DEFAULT_TEMPLATES) => {
    setCommandTemplates(prev => ({ ...prev, [id]: DEFAULT_TEMPLATES[id] }));
    showToast(`已重置该段启动命令`);
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
  const imagesToShow = IMAGES_BY_CAT[imageCategory] || [];
  const activeImage = imagesToShow.find(img => img.id === selectedImageId);
  const activeVersionId = selectedVersionMap[selectedImageId];
  const activeVersion = activeImage?.versions.find(v => v.id === activeVersionId);

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

  const handleVersionChange = (imageId: string, versionId: string) => {
    setSelectedVersionMap(prev => ({
      ...prev,
      [imageId]: versionId
    }));
  };

  const renderCodeBlock = (id: keyof typeof DEFAULT_TEMPLATES, title: string) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-600">
        <Zap size={14} className="text-blue-500" />
        <span>{title}</span>
      </div>
      <div className="bg-[#f8fafc] border border-gray-100 rounded-xl overflow-hidden">
        <div className={`px-4 py-3 transition-all ${expandedBlocks[id] ? 'h-auto' : 'h-14 overflow-hidden'}`}>
          <textarea
            value={commandTemplates[id]}
            onChange={(e) => setCommandTemplates(prev => ({ ...prev, [id]: e.target.value }))}
            className="w-full bg-transparent text-xs font-mono text-slate-700 outline-none resize-none leading-relaxed placeholder:text-gray-300 min-h-[80px]"
            spellCheck={false}
          />
        </div>
        <div className="px-4 py-2 border-t border-gray-100/50 bg-gray-50/30 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <button 
                onClick={() => toggleBlock(id)}
                className="flex items-center space-x-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
              >
                {expandedBlocks[id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                <span>{expandedBlocks[id] ? '收起' : '展开'}</span>
              </button>
              <button 
                onClick={() => resetBlock(id)}
                className="flex items-center space-x-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
              >
                <RotateCcw size={12} />
                <span>重置</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  const getOsIcon = (img: ImageItem) => {
    if (img.id === 'windows') return <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><Monitor size={20} /></div>;
    return <div className={`p-1.5 ${img.iconColor || 'bg-gray-100'} text-white rounded-lg`}><Zap size={20} /></div>;
  };

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
                <span>高级配置（K8S集群）</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-gray-50">
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
                      <option value="c-sz-01">SZ-South-Edge-Cluster-02</option>
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
                <h2 className="font-bold text-gray-800">2. 存储配置</h2>
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
                {[
                  { id: 'prebuilt', label: '预制镜像' },
                  { id: 'custom', label: '自定义镜像' },
                  { id: 'shared', label: '共享镜像' },
                  { id: 'external', label: '外部镜像' }
                ].map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setImageCategory(cat.id)} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${imageCategory === cat.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {imageCategory === 'prebuilt' ? (
              <div className="space-y-6 animate-in fade-in">
                {/* OS Grid Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {IMAGES_BY_CAT.prebuilt.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageId(img.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        selectedImageId === img.id
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="mb-3">
                        {getOsIcon(img)}
                      </div>
                      <span className={`text-xs font-bold ${selectedImageId === img.id ? 'text-blue-600' : 'text-gray-700'}`}>
                        {img.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Shared Version Selector for Prebuilt */}
                <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <select
                      value={activeVersionId}
                      onChange={(e) => handleVersionChange(selectedImageId, e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                    >
                      {activeImage?.versions.map(v => (
                        <option key={v.id} value={v.id}>{v.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {activeVersion?.size && (
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      预计大小: {activeVersion.size}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageCategory !== 'external' && imagesToShow.length > 0 ? imagesToShow.map((img: ImageItem) => {
                  const currentVersionId = selectedVersionMap[img.id];
                  const isSelected = selectedImageId === img.id;

                  return (
                    <div 
                      key={img.id} 
                      onClick={() => setSelectedImageId(img.id)}
                      className={`p-5 rounded-2xl border-2 flex flex-col text-left transition-all cursor-pointer relative group ${
                        isSelected ? 'border-blue-400 bg-white shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      {(img.badge || img.author) && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[11px] font-bold">
                            {img.badge || img.author}
                          </span>
                        </div>
                      )}

                      <div className="mb-1.5">
                        <h4 className="text-xl font-bold text-gray-900">
                          {img.name}
                        </h4>
                      </div>

                      <div className="flex items-center group/version mb-1 relative" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex-1">
                          <select 
                            value={currentVersionId}
                            onChange={(e) => handleVersionChange(img.id, e.target.value)}
                            className="w-full appearance-none bg-transparent text-blue-500 text-sm font-medium pr-8 outline-none cursor-pointer"
                          >
                            {img.versions.map(v => (
                              <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/version:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                }) : imageCategory !== 'external' ? (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Box size={32} className="opacity-20 mb-2" />
                    <p className="text-sm">该分类下暂无可用镜像</p>
                  </div>
                ) : null}
              </div>
            )}

            <div className="pt-4 border-t border-gray-50 space-y-6">
              {['custom', 'shared'].includes(imageCategory) && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 flex items-center">
                      <Terminal size={16} className="mr-2 text-blue-500" /> 启动命令 (STARTUP COMMAND)
                    </label>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-600">
                        <BookOpen size={14} />
                        <span>参数解释</span>
                      </button>
                      <button className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-600">
                        <Copy size={14} />
                        <span>复制</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-8 shadow-sm">
                    <div className="space-y-4">
                       <div className="text-xs font-mono text-gray-400"># 1. Initialize 阶段：安装必要软件包，初始化环境配置</div>
                       <div className="text-xs font-mono text-indigo-600">{'if [ -z "${EBCS_SYS_INITIALIZED}" ] || [ "${EBCS_SYS_INITIALIZED}" = "False" ]; then'}</div>
                       
                       <div className="pl-6 space-y-6">
                          {renderCodeBlock('initPackage', '# Initialize Package: 安装必要软件包')}
                          {renderCodeBlock('initSSH', '# Initialize Config: 初始化环境配置')}
                       </div>
                       
                       <div className="text-xs font-mono text-indigo-600">fi</div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-50">
                       <div className="text-xs font-mono text-gray-400"># 2. Launch 阶段：启动 jupyter-lab 后台运行，启动 sshd 作为主进程运行</div>
                       <div className="pl-6">
                          {renderCodeBlock('launch', '# Launch: 启动服务')}
                       </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">留空则执行镜像默认 Entrypoint 或 CMD</p>
                </div>
              )}

              {imageCategory === 'external' && (
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 space-y-6 animate-in slide-in-from-top-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                       <Globe size={14} className="mr-2 text-blue-500" /> 外部镜像地址
                    </label>
                    <input 
                      type="text"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="registry.example.com/my-image:latest"
                      className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setHasExternalAuth(!hasExternalAuth)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${hasExternalAuth ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${hasExternalAuth ? 'translate-x-4' : ''}`}></div>
                    </button>
                    <span className="text-sm font-bold text-gray-700">此镜像需要身份验证</span>
                  </div>

                  {hasExternalAuth && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">用户名</label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={externalUsername}
                            onChange={(e) => setExternalUsername(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-xl py-2 px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">密码 / Access Token</label>
                        <div className="relative">
                          <input 
                            type="password"
                            value={externalPassword}
                            onChange={(e) => setExternalPassword(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-xl py-2 px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                    <span className="text-gray-400 font-medium">数据盘: </span>
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
                  <span className="text-gray-400 font-medium">镜像: </span>
                  <span className="text-gray-900 font-bold truncate max-w-[120px]" title={imageCategory === 'external' ? '外部镜像' : activeImage?.name}>
                    {imageCategory === 'external' ? '外部镜像' : (activeImage?.name || '未选择')}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400 font-medium">镜像版本: </span>
                  <span className="text-gray-900 font-bold text-xs truncate max-w-[120px]">
                    {imageCategory === 'external' ? (externalUrl || '未输入地址') : (activeVersion?.label.split('/')[0] || 'Base Version')}
                  </span>
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
                    {instanceCount.toFixed(0)}
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