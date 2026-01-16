
import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Box, 
  Layers, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  ScanLine, 
  Key, 
  BarChart3, 
  Gift,
  Home,
  Grid
} from 'lucide-react';
import { MenuItem, Instance, InstanceStatus, Cluster, ClusterNode, ResourcePool } from './types';

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: '控制台概览', icon: <Home size={18} />, category: '首页' },
  { id: 'instances', label: '实例', icon: <LayoutDashboard size={18} />, category: 'GPU算力服务' },
  { id: 'clusters', label: '集群', icon: <Layers size={18} />, category: 'GPU算力服务' },
  { id: 'resource-pools', label: '资源池', icon: <Grid size={18} />, category: 'GPU算力服务' },
  { id: 'models', label: '模型库', icon: <Box size={18} />, category: 'GPU算力服务' },
  { id: 'disks', label: '云硬盘', icon: <Database size={18} />, category: 'GPU算力服务' },
  { id: 'storage', label: '云存储', icon: <Cloud size={18} />, category: 'GPU算力服务' },
  { id: 'firewall', label: '外网防火墙', icon: <ShieldCheck size={18} />, category: 'GPU算力服务' },
  { id: 'arena', label: '模型广场', icon: <LayoutDashboard size={18} />, category: '模型API服务' },
  { id: 'chat', label: '文本对话', icon: <MessageSquare size={18} />, category: '模型API服务' },
  { id: 'image-gen', label: '图片生成', icon: <ImageIcon size={18} />, category: '模型API服务' },
  { id: 'video-gen', label: '视频生成', icon: <Video size={18} />, category: '模型API服务' },
  { id: 'ocr', label: 'DeepSeek-OCR', icon: <ScanLine size={18} />, category: '模型API服务' },
  { id: 'api-keys', label: 'API KEY', icon: <Key size={18} />, category: '管理' },
  { id: 'stats', label: '调用统计', icon: <BarChart3 size={18} />, category: '管理' },
];

const createNodes = (prefix: string, count: number): ClusterNode[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `node-${prefix}-${i}`,
    name: `${prefix}-node-0${i + 1}`,
    ip: `192.168.1.${10 + i}`,
    gpuType: prefix === 'hb1' ? 'NVIDIA A100' : 'NVIDIA H100',
    gpuCount: 8,
    cpuUsage: Math.floor(Math.random() * 40) + 10,
    gpuUsage: Math.floor(Math.random() * 60) + 20,
    status: Math.random() > 0.1 ? 'Online' : 'Maintenance',
  }));
};

export const MOCK_CLUSTERS: Cluster[] = [
  { 
    id: 'c-hb1', 
    name: '华北一区-默认集群', 
    region: '华北一区', 
    nodes: 12, 
    totalGpu: 96, 
    usedGpu: 64, 
    status: 'Healthy',
    nodeDetails: createNodes('hb1', 6)
  },
  { 
    id: 'c-hb2', 
    name: '华北二区-专属集群', 
    region: '华北二区', 
    nodes: 8, 
    totalGpu: 32, 
    usedGpu: 30, 
    status: 'Warning',
    nodeDetails: createNodes('hb2', 4)
  },
  { 
    id: 'c-nw1', 
    name: '西北一区-边缘集群', 
    region: '西北一区', 
    nodes: 4, 
    totalGpu: 16, 
    usedGpu: 2, 
    status: 'Healthy',
    nodeDetails: createNodes('nw1', 2)
  },
];

export const MOCK_RESOURCE_POOLS: ResourcePool[] = [
  {
    id: 'pool-hb1-h100-4',
    name: '华北一区-H100专属节点池',
    region: '华北一区',
    gpuType: 'NVIDIA H100',
    totalCards: 4,
    usedCards: 1,
    expiryDate: '2024-12-31',
    status: 'Healthy'
  },
  {
    id: 'pool-hd1-a100-8',
    name: '华东一区-A100专属节点池',
    region: '华东一区',
    gpuType: 'NVIDIA A100',
    totalCards: 8,
    usedCards: 8,
    expiryDate: '2024-11-15',
    status: 'Warning'
  }
];

export const MOCK_INSTANCES: Instance[] = [
  {
    id: 'ins-82731',
    name: 'Stable-Diffusion-WebUI',
    specs: 'NVIDIA A100 80GB x 1',
    image: 'Ubuntu 22.04 / CUDA 12.1',
    type: '按量计费',
    cpu: '12 核',
    memory: '64 GB',
    gpu: 'A100 (80G)',
    status: InstanceStatus.RUNNING,
    cluster: '华北一区-默认集群',
    createTime: '2024-05-20 14:22'
  },
  {
    id: 'ins-99212',
    name: 'LLM-Training-Task',
    specs: 'NVIDIA H100 80GB x 8',
    image: 'Pytorch 2.1.0 / Python 3.10',
    type: '按量计费',
    cpu: '96 核',
    memory: '512 GB',
    gpu: 'H100 x 8',
    status: InstanceStatus.STARTING,
    cluster: '华北二区-专属集群',
    createTime: '2024-05-21 09:15'
  },
  {
    id: 'ins-11203',
    name: 'Jupyter-Notebook-Dev',
    specs: 'NVIDIA RTX 4090 x 1',
    image: 'Deep Learning Base',
    type: '按量计费',
    cpu: '8 核',
    memory: '32 GB',
    gpu: 'RTX 4090',
    status: InstanceStatus.STOPPED,
    cluster: '华北一区-默认集群',
    createTime: '2024-05-18 11:45'
  }
];
