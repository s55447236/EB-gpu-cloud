
import React from 'react';

export enum InstanceStatus {
  RUNNING = '运行中',
  STOPPED = '已停止',
  STARTING = '启动中',
  ERROR = '异常'
}

/* Add missing Instance interface */
export interface Instance {
  id: string;
  name: string;
  specs: string;
  image: string;
  type: string;
  cpu: string;
  memory: string;
  gpu: string;
  status: InstanceStatus;
  cluster: string;
  createTime: string;
}

export interface Node {
  id: string;
  name: string;
  ip: string;
  gpuType: string;
  gpuCount: number;
  cpuUsage: number;
  gpuUsage: number;
  status: 'Online' | 'Offline' | 'Maintenance';
}

export interface Cluster {
  id: string;
  name: string;
  region: string;
  nodes: number;
  totalGpu: number;
  usedGpu: number;
  status: 'Healthy' | 'Warning' | 'Scaling';
  nodeDetails: Node[];
}

export type ViewType = 'LIST' | 'CARD';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}
