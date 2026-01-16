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
  Monitor,
  Search,
  Layers,
  Calendar
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
    },
    { 
      id: 'sd-xl-custom', 
      name: 'Stable-Diffusion-XL-Custom', 
      badge: '私有镜像',
      versions: [
        { id: 'v2-0', label: 'SDXL/WebUI/FP16/v2.0', size: '12.2GB' },
        { id: 'v2-1', label: 'SDXL/WebUI/FP16/v2.1', size: '12.5GB' }
      ] 
    },
    { 
      id: 'llama-3-quant', 
      name: 'Llama-3-70B-Quantized', 
      badge: '私有镜像',
      versions: [
        { id: 'int8', label: 'Llama3/vLLM/Int8/Latest', size: '38.0GB' }
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
  { id: 'hb2', name: '华北一区', desc: 'A800专区' },
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
  initPackage: `# 以下命令目前均为注释状态，请根据所选镜像情况按需修改
# 允许 root 用户基于密码登录
# mkdir -p /etc/ssh
# echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config`,
  initSSH: `# 以下命令初始化 root 密码及相关 k8s 环境变量
sed -i '/^[#[:space:]]*Port[[:space:]]/d' /etc/ssh/sshd_config
echo "Port \${EBCS_SSH_PORT}" >> /etc/ssh/sshd_config`,
  launch: `# 以下命令启动 jupyter-lab 及 sshd 服务
if command -v jupyter-lab >/dev/null 2>&1 && [ -n "\${EBCS_JUPYTER_PORT}" ] && [ -n "\${EBCS_JUPYTER_TOKEN}" ]; then
    cd /root && jupyter-lab --allow-root --ip=0.0.0.0 --port=\${EBCS_JUPYTER_PORT} --NotebookApp.token=\${EBCS_JUPYTER_TOKEN} &
fi`
};

const PAID_NODE_POOL = {
  id: 'pool-hb1-h100-4',
  name: '华北一区-H100专属节点池',
  regionId: 'hb1',
  gpuId: 'h100',
  totalCards: 4,
  usedCards: 1,
  expiryDate: '2024-12-31',
};

const InstanceDeployment: React.FC<InstanceDeploymentProps> = ({ onBack }) => {
  const [useExistingPool, setUseExistingPool] = useState(false);
  const [selectedPartition, setSelectedPartition] = useState('hb1');
  const [selectedGpu, setSelectedGpu] = useState('a100');
  const [selectedDriver, setSelectedDriver] = useState(DRIVER_VERSIONS[0]);
  const [gpuCount, setGpuCount] = useState(1);
  const [instanceCount, setInstanceCount] = useState(1);
  const [billingCycle, setBillingCycle] = useState('hourly'); 
  
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
    'team-diffusion': 'v1',
    'sd-xl-custom': 'v2-0',
    'llama-3-quant': 'int8'
  });

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSearchTerm, setImageSearchTerm] = useState('');

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

  const [selectedCustomImageId, setSelectedCustomImageId] = useState<string>('my-model-base');
  const [selectedSharedImageId, setSelectedSharedImageId] = useState<string>('team-diffusion');

  useEffect(() => {
    if (useExistingPool) {
      setSelectedPartition(PAID_NODE_POOL.regionId);
      setSelectedGpu(PAID_NODE_POOL.gpuId);
      if (gpuCount > (PAID_NODE_POOL.totalCards - PAID_NODE_POOL.usedCards)) setGpuCount(1);
    }
  }, [useExistingPool]);

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
    if (useExistingPool) return; // Locked in pool mode
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
  let currentActiveId = selectedImageId;
  if (imageCategory === 'custom') currentActiveId = selectedCustomImageId;
  else if (imageCategory === 'shared') currentActiveId = selectedSharedImageId;
  let activeImage = imagesToShow.find(img => img.id === currentActiveId);
  if (!activeImage && imagesToShow.length > 0) activeImage = imagesToShow[0];
  const activeVersionId = activeImage ? selectedVersionMap[activeImage.id] : undefined;
  const activeVersion = activeImage?.versions.find(v => v.id === activeVersionId) || activeImage?.versions[0];

  const extraStorageSize = extraStorage.reduce((acc, s) => acc + s.size, 0);
  const storagePrice = extraStorage.reduce((acc, s) => {
    if (!s.isNew) return acc;
    const typeInfo = STORAGE_TYPES.find(t => t.id === s.type);
    if (typeInfo && typeInfo.unitPrice) return acc + (s.size * typeInfo.unitPrice);
    return acc;
  }, 0);

  const scaledCores = (currentGpu?.baseCores || 0) * gpuCount;
  const scaledRam = (currentGpu?.baseRam || 0) * gpuCount;
  const gpuSubtotal = useExistingPool ? 0 : (currentGpu?.price || 0) * gpuCount;
  
  let periodMultiplier = 1;
  let unitSuffix = '/小时';
  let discountFactor = 1.0;

  if (billingCycle === 'daily') {
    periodMultiplier = 24;
    unitSuffix = '/天';
    discountFactor = 0.95;
  } else if (billingCycle === 'monthly') {
    periodMultiplier = 24 * 30;
    unitSuffix = '/月';
    discountFactor = 0.9;
  }

  const totalPriceValue = ((gpuSubtotal + storagePrice) * instanceCount * periodMultiplier * discountFactor);
  const totalPrice = totalPriceValue.toFixed(2);
  const activePartition = PARTITIONS.find(p => p.id === selectedPartition);

  const renderMountButton = () => (
    <div className="relative" ref={storageDropdownRef}>
      <button onClick={() => setShowStorageDropdown(!showStorageDropdown)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all active:scale-95 shadow-lg shadow-blue-100">
        <Plus size={18} />
        <span>挂载数据盘</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${showStorageDropdown ? 'rotate-180' : ''}`} />
      </button>
      {showStorageDropdown && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-4">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">选择存储类型</div>
          {STORAGE_TYPES.map(type => (
            <button key={type.id} onClick={() => addStorage(type.id)} className="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl text-left transition-colors group/item">
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
    setSelectedVersionMap(prev => ({ ...prev, [imageId]: versionId }));
  };

  const renderCodeBlock = (id: keyof typeof DEFAULT_TEMPLATES, title: string) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-600">
        <Zap size={14} className="text-blue-500" />
        <span>{title}</span>
      </div>
      <div className="bg-[#f8fafc] border border-gray-100 rounded-xl overflow-hidden">
        <div className={`px-4 py-3 transition-all ${expandedBlocks[id] ? 'h-auto' : 'h-14 overflow-hidden'}`}>
          <textarea value={commandTemplates[id]} onChange={(e) => setCommandTemplates(prev => ({ ...prev, [id]: e.target.value }))} className="w-full bg-transparent text-xs font-mono text-slate-700 outline-none resize-none leading-relaxed min-h-[80px]" spellCheck={false} />
        </div>
        <div className="px-4 py-2 border-t border-gray-100/50 bg-gray-50/30 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <button onClick={() => toggleBlock(id)} className="flex items-center space-x-1 text-[10px] font-bold text-blue-500 hover:text-blue-700">
                {expandedBlocks[id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                <span>{expandedBlocks[id] ? '收起' : '展开'}</span>
              </button>
              <button onClick={() => resetBlock(id)} className="flex items-center space-x-1 text-[10px] font-bold text-blue-500 hover:text-blue-700">
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

  const filteredModalImages = imagesToShow.filter(img => img.name.toLowerCase().includes(imageSearchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 relative">
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">选择镜像</h3>
              </div>
              <button onClick={() => setIsImageModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="搜索镜像名称..." value={imageSearchTerm} onChange={(e) => setImageSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">镜像名称</th>
                      <th className="px-6 py-4">版本选择</th>
                      <th className="px-6 py-4">镜像大小</th>
                      <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredModalImages.map(img => (
                      <tr key={img.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">{img.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select value={selectedVersionMap[img.id]} onChange={(e) => handleVersionChange(img.id, e.target.value)} className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs font-bold text-gray-700 outline-none">
                            {img.versions.map(v => <option key={v.id} value={v.id}>{v.label.split('/')[0]}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{img.versions[0]?.size}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { if (imageCategory === 'custom') setSelectedCustomImageId(img.id); else if (imageCategory === 'shared') setSelectedSharedImageId(img.id); else setSelectedImageId(img.id); setIsImageModalOpen(false); }} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold">选择此镜像</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-blue-400">
            <CheckCircle2 size={18} />
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">创建开发机</h1>
            <p className="text-xs text-gray-500 mt-0.5">控制台 / GPU容器服务 / 创建开发机</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* Node Pool Selection Banner */}
          {!useExistingPool && (
            <div className="bg-gradient-to-r from-blue-600/90 to-indigo-700/90 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center space-x-5">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                   <Layers size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">检测到已有包月专属节点池</h3>
                  <p className="text-sm opacity-90 mt-1 leading-relaxed">
                    您在 <span className="font-black underline decoration-blue-300 underline-offset-4 decoration-2">{PARTITIONS.find(p => p.id === PAID_NODE_POOL.regionId)?.name}</span> 拥有一个 <span className="font-black">4卡 H100</span> 的专属资源池。
                    <br />
                    <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold">
                      <Zap size={12} className="mr-1 text-yellow-300" /> 
                      当前池状态: 已占用 {PAID_NODE_POOL.usedCards} / {PAID_NODE_POOL.totalCards} 卡
                    </span>
                    <span className="ml-3 inline-flex items-center mt-2 px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold">
                      <Calendar size={12} className="mr-1 text-blue-200" />
                      有效期至: {PAID_NODE_POOL.expiryDate}
                    </span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setUseExistingPool(true); showToast("已切换至包月节点池模式"); }}
                className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-blue-50 transition-all flex items-center space-x-2 shadow-lg shadow-black/10 active:scale-95 whitespace-nowrap"
              >
                <span>使用该节点池</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Section 1: GPU Specs & Cluster */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
            {useExistingPool && (
              <div className="absolute top-0 right-0 p-4 z-10">
                <button 
                  onClick={() => { setUseExistingPool(false); setGpuCount(1); }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all"
                >
                  <RotateCcw size={14} />
                  <span>切换回普通模式</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm">
                    <Cpu size={18} />
                  </div>
                  <h2 className="font-bold text-gray-800 whitespace-nowrap">1. 算力规格与集群配置</h2>
                </div>
                
                <div className="relative">
                  <button 
                    disabled={useExistingPool}
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
                      useExistingPool 
                      ? 'bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <span>{activePartition?.name}</span>
                    {useExistingPool ? <Lock size={14} /> : <ChevronDown size={14} className={`text-blue-400 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />}
                  </button>
                  {!useExistingPool && showRegionDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-50">
                      {PARTITIONS.map(p => (
                        <button key={p.id} onClick={() => { setSelectedPartition(p.id); setShowRegionDropdown(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left ${selectedPartition === p.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                          <div><p className="text-sm font-bold">{p.name}</p></div>
                          {selectedPartition === p.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!useExistingPool && (
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 py-1 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <Settings2 size={14} />
                  <span>高级配置（K8S集群）</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ALL_GPU_SPECS.map(gpu => {
                const isLocked = useExistingPool && gpu.id !== PAID_NODE_POOL.gpuId;
                const isSelected = selectedGpu === gpu.id;
                
                return (
                  <div key={gpu.id} className="relative h-full">
                    <button
                      onClick={() => handleGpuSelect(gpu)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all h-full flex flex-col group ${
                        isSelected 
                          ? 'border-blue-600 bg-white shadow-lg ring-1 ring-blue-600/10' 
                          : isLocked 
                            ? 'border-gray-50 opacity-40 cursor-not-allowed bg-gray-50/10'
                            : gpu.availableIn.includes(selectedPartition) 
                              ? 'border-gray-100 hover:border-blue-200 bg-white'
                              : 'border-gray-50 opacity-60 hover:opacity-100 hover:border-yellow-200 bg-gray-50/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900">{gpu.name}</span>
                        {useExistingPool && isSelected ? (
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded border border-blue-100">已付费开机</span>
                        ) : (
                          <span className={`text-xs font-bold ${isLocked ? 'text-gray-300' : 'text-blue-600'}`}>¥{gpu.price}/h</span>
                        )}
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
                          <label className="text-[10px] font-bold text-gray-400 uppercase shrink-0">驱动版本</label>
                          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                            <select 
                              value={selectedDriver}
                              onChange={(e) => setSelectedDriver(e.target.value)}
                              disabled={isLocked || !gpu.availableIn.includes(selectedPartition)}
                              className={`w-full text-[10px] font-bold py-1 px-2 rounded-lg border outline-none appearance-none transition-colors ${
                                isSelected ? 'bg-[#f8fafc] border-gray-100 text-gray-700' : 'bg-gray-50 border-gray-100 text-gray-600'
                              }`}
                            >
                              {DRIVER_VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">卡数量</label>
              <div className="flex p-1 bg-gray-50 rounded-xl w-fit border border-gray-100">
                {(useExistingPool ? [1, 2, 3] : [1, 2, 3, 4, 8]).map(num => (
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
              {useExistingPool && (
                <p className="mt-2 text-[10px] text-indigo-500 font-bold">
                  * 专属池当前剩余可用: {PAID_NODE_POOL.totalCards - PAID_NODE_POOL.usedCards} 卡
                </p>
              )}
            </div>

            <div className={`border rounded-xl px-4 py-3 flex items-center space-x-3 mt-4 transition-colors ${
              useExistingPool ? 'bg-indigo-50/50 border-indigo-100' : 'bg-blue-50/50 border-blue-100'
            }`}>
              <div className={`p-1.5 rounded-lg ${useExistingPool ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                {useExistingPool ? <Layers size={16} /> : <Zap size={16} />}
              </div>
              <p className={`text-sm font-medium ${useExistingPool ? 'text-indigo-900' : 'text-blue-900'}`}>
                当前所选：<span className="font-bold">{currentGpu?.name} * {gpuCount}</span> 
                <span className={`text-white px-2 py-0.5 rounded text-[10px] font-black mx-2 uppercase ${useExistingPool ? 'bg-indigo-600' : 'bg-blue-600'}`}>CORE {scaledCores}</span>
                内存 <span className="font-bold">{scaledRam}GB</span>
                {useExistingPool && <span className="ml-3 text-indigo-500 font-bold">(专属节点池已付费，可立即开机)</span>}
              </p>
            </div>
          </section>

          {/* Section 2: Storage Configuration */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm"><HardDrive size={18} /></div>
                <h2 className="font-bold text-gray-800">2. 存储配置</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><HardDrive size={18} /></div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">系统盘 (Root SSD)</span>
                    <span className="text-sm text-gray-500">空间: 30GB</span>
                    <span className="text-sm text-blue-500 font-bold uppercase">免费</span>
                  </div>
                </div>
              </div>
              {extraStorage.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm animate-in fade-in">
                  <div className="flex items-center space-x-3 mb-6"><div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><Database size={18} /></div><span className="text-sm font-bold text-gray-900">数据盘</span></div>
                  <div className="space-y-6">
                    {extraStorage.map((storage) => {
                      const typeInfo = STORAGE_TYPES.find(t => t.id === storage.type);
                      const existingVolumes = MOCK_EXISTING_VOLUMES[storage.type] || [];
                      return (
                        <div key={storage.id} className="grid grid-cols-12 gap-4 items-end animate-in fade-in">
                          <div className="col-span-4 space-y-2">
                            <div className="flex items-center space-x-2 mb-1"><label className="text-xs text-gray-400 font-medium">名称</label></div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                {storage.isNew ? (
                                  <input type="text" value={storage.name} onChange={(e) => updateStorage(storage.id, { name: e.target.value })} className="w-full bg-white border border-blue-400 rounded-lg py-2 px-3 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500" placeholder="硬盘名称" />
                                ) : (
                                  <select value={storage.isInitial ? 'none' : storage.selectedVolumeId} onChange={(e) => { const val = e.target.value; if (val === 'new') updateStorage(storage.id, { isNew: true }); else if (val !== 'none') updateStorage(storage.id, { selectedVolumeId: val }); }} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium outline-none appearance-none pr-10">
                                    <option value="none">请选择</option>
                                    <option value="new">创建新硬盘</option>
                                    {existingVolumes.map(v => <option key={v.id} value={v.id}>{v.name} ({v.size}GB)</option>)}
                                  </select>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-3 space-y-2">
                            <label className="text-xs text-gray-400 font-medium">挂载路径</label>
                            <input type="text" value={storage.mountPath} onChange={(e) => updateStorage(storage.id, { mountPath: e.target.value })} placeholder="/root/data" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none" />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <label className="text-xs text-gray-400 font-medium">容量</label>
                            <input type="number" value={storage.size} readOnly={!storage.isNew} onChange={(e) => updateStorage(storage.id, { size: parseInt(e.target.value) || 0 })} className={`w-full border rounded-lg py-2 px-3 text-sm outline-none ${storage.isNew ? 'bg-white' : 'bg-gray-50'}`} />
                          </div>
                          <div className="col-span-1 pb-1.5 text-right"><button onClick={() => setExtraStorage(extraStorage.filter(s => s.id !== storage.id))} className="p-2 text-gray-300 hover:text-red-500"><X size={20} /></button></div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4">{renderMountButton()}</div>
                </div>
              ) : (
                <div className="pt-2">{renderMountButton()}</div>
              )}
            </div>
          </section>

          {/* Section 3: Images */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm"><Box size={18} /></div>
                <h2 className="font-bold text-gray-800">3. 镜像选择与基础环境</h2>
              </div>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                {['prebuilt', 'custom', 'shared', 'external'].map(cat => (
                  <button key={cat} onClick={() => setImageCategory(cat)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${imageCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                    {cat === 'prebuilt' ? '预制镜像' : cat === 'custom' ? '自定义镜像' : cat === 'shared' ? '共享镜像' : '外部镜像'}
                  </button>
                ))}
              </div>
            </div>
            {imageCategory === 'prebuilt' ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {IMAGES_BY_CAT.prebuilt.map((img) => (
                    <button key={img.id} onClick={() => setSelectedImageId(img.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedImageId === img.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <div className="mb-3">{getOsIcon(img)}</div>
                      <span className={`text-xs font-bold ${selectedImageId === img.id ? 'text-blue-600' : 'text-gray-700'}`}>{img.name}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <select value={selectedVersionMap[selectedImageId]} onChange={(e) => handleVersionChange(selectedImageId, e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm font-medium outline-none appearance-none pr-10">
                      {IMAGES_BY_CAT.prebuilt.find(img => img.id === selectedImageId)?.versions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-6 space-y-5 flex flex-col">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">配置概要</h3>

            {!useExistingPool && (
              <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-xl">
                <button onClick={() => setBillingCycle('hourly')} className={`relative py-2 px-1 text-[11px] font-bold rounded-lg ${billingCycle === 'hourly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>按量</button>
                <button onClick={() => setBillingCycle('daily')} className={`relative py-2 px-1 text-[11px] font-bold rounded-lg ${billingCycle === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>包日</button>
                <button onClick={() => setBillingCycle('monthly')} className={`relative py-2 px-1 text-[11px] font-bold rounded-lg ${billingCycle === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>包月</button>
              </div>
            )}

            {useExistingPool && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-700">
                  <Layers size={14} className="shrink-0" />
                  <span className="text-xs font-bold">专属节点池开机模式</span>
                </div>
                <div className="flex items-center space-x-2 text-indigo-600 text-[10px]">
                  <Calendar size={12} className="shrink-0" />
                  <span className="font-bold">有效期至: {PAID_NODE_POOL.expiryDate}</span>
                </div>
              </div>
            )}

            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center text-sm">
                <div><span className="text-gray-400 font-medium">资源分区: </span><span className="text-gray-900 font-bold">{activePartition?.name}</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div><span className="text-gray-400 font-medium">规格: </span><span className="text-gray-900 font-bold">{currentGpu?.name}*{gpuCount}</span></div>
                {useExistingPool ? (
                  <span className="text-[10px] font-black text-indigo-500 uppercase">已付费</span>
                ) : (
                  <span className="text-[11px] font-bold text-orange-500">¥{(gpuSubtotal * periodMultiplier * discountFactor).toFixed(1)}{unitSuffix}</span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <div><span className="text-gray-400 font-medium">cpu/内存: </span><span className="text-gray-900 font-bold">{scaledCores}c /{scaledRam}G</span></div>
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <div><span className="text-gray-400 font-medium">系统盘: </span><span className="text-gray-900 font-bold">30GB</span></div>
              </div>
              {extraStorage.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div><span className="text-gray-400 font-medium">数据盘: </span><span className="text-gray-900 font-bold">{extraStorageSize}GB</span></div>
                  {storagePrice > 0 && <span className="text-[11px] font-bold text-orange-500">¥{(storagePrice * periodMultiplier * discountFactor).toFixed(1)}{unitSuffix}</span>}
                </div>
              )}
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-900 font-bold">实例数量</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button onClick={() => setInstanceCount(Math.max(1, instanceCount - 1))} className="p-2 hover:bg-gray-50 text-gray-400 border-r border-gray-200"><Minus size={14} /></button>
                  <div className="px-5 py-2 text-sm font-bold text-gray-700 w-16 text-center">{instanceCount}</div>
                  <button onClick={() => setInstanceCount(instanceCount + 1)} className="p-2 hover:bg-gray-50 text-gray-400 border-l border-gray-200"><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="space-y-5">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-gray-900">合计</span>
                <div className="flex items-center space-x-1">
                  {useExistingPool && totalPriceValue === 0 ? (
                    <span className="text-2xl font-black text-indigo-500">¥ 0.00 <span className="text-xs ml-1">(已付费)</span></span>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-orange-500">¥ {totalPrice}</span>
                      <span className="text-xs text-gray-400 font-bold">{unitSuffix}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <button className={`w-full py-3.5 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.98] ${
                  useExistingPool ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                }`}>
                  <span>{useExistingPool ? '立即开机' : '立即部署开发机'}</span>
                  <ChevronRight size={18} />
                </button>
                <p className="text-[10px] text-gray-400 leading-relaxed text-center">
                  {useExistingPool ? '专属节点池开机不会产生额外费用（不含数据盘费用）。' : '包日及包月会自动专属节点池。如果删除开发机，可在专属节点池再次创建。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceDeployment;
