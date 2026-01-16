
import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  MapPin, 
  Plus, 
  ArrowLeft,
  Search,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MOCK_CLUSTERS } from '../constants';
import { Cluster, ClusterNode } from '../types';

const ClusterManagement: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  if (selectedCluster) {
    return <ClusterDetail cluster={selectedCluster} onBack={() => setSelectedCluster(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">集群管理</h1>
          <p className="text-sm text-gray-500">管理您的专属 GPU 算力集群。若集群 15 天内无资源使用，系统将自动释放以节省配额。</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} />
          <span>创建私有算力集群</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center space-x-3 text-blue-800 text-sm">
        <AlertCircle size={18} className="shrink-0 text-blue-500" />
        <p>系统默认在每个分区（华北一区、华北二区、西北一区）为您维护一个默认集群。创建实例或专属节点池时将自动启用。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CLUSTERS.map((cluster) => {
          const usagePercent = Math.round((cluster.usedGpu / cluster.totalGpu) * 100);
          const isWarning = usagePercent > 80 || cluster.status === 'Warning';
          
          return (
            <div 
              key={cluster.id} 
              onClick={() => setSelectedCluster(cluster)}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative group flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl ${
                  cluster.status === 'Healthy' ? 'bg-green-50 text-green-500' : 
                  'bg-orange-50 text-orange-500'
                }`}>
                  <Server size={24} />
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                  cluster.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {cluster.status === 'Healthy' ? 'HEALTHY' : 'WARNING'}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center">
                {cluster.name}
              </h3>
              
              <div className="flex items-center space-x-4 text-[11px] text-gray-400 mt-2 mb-6 font-medium">
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{cluster.region}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShieldCheck size={12} />
                  <span>K8s 已就绪</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">物理节点数</p>
                  <p className="text-xl font-black text-gray-800">{cluster.nodes}</p>
                </div>
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">GPU 总卡数</p>
                  <p className="text-xl font-black text-gray-800">{cluster.totalGpu}</p>
                </div>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-end">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500 font-bold tracking-tight">GPU 资源池占用</span>
                    <span className={`font-black ${isWarning ? 'text-orange-500' : 'text-blue-600'}`}>{usagePercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isWarning ? 'bg-orange-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <span>已占用 {cluster.usedGpu} 卡</span>
                    <span>剩余 {cluster.totalGpu - cluster.usedGpu} 卡</span>
                  </div>
                </div>

                {cluster.status === 'Warning' && (
                  <div className="mt-2 flex items-center space-x-2 text-[10px] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <Clock size={12} />
                    <span>该集群 12 天无活跃任务，预计 3 天后自动释放</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ClusterDetail: React.FC<{ cluster: Cluster; onBack: () => void }> = ({ cluster, onBack }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-full transition-all">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{cluster.name}</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
              <span>{cluster.region}</span>
              <span>•</span>
              <span className={`font-bold uppercase ${cluster.status === 'Healthy' ? 'text-green-500' : 'text-orange-500'}`}>{cluster.status}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
            编辑集群配置
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            添加物理节点
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '平均 GPU 使用率', value: `${Math.round((cluster.usedGpu / cluster.totalGpu) * 100)}%`, icon: <Zap className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: '活跃节点', value: `${cluster.nodes - 1}/${cluster.nodes}`, icon: <Server className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'POD 运行数', value: '142', icon: <Activity className="text-green-500" />, bg: 'bg-green-50' },
          { label: '算力健康得分', value: cluster.status === 'Healthy' ? '98' : '82', icon: <CheckCircle2 className="text-indigo-500" />, bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">集群节点列表 (Worker Nodes)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="搜索节点名称/IP" className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="px-6 py-4">节点 ID / 名称</th>
              <th className="px-6 py-4">内网 IP</th>
              <th className="px-6 py-4">GPU 规格 (块/节点)</th>
              <th className="px-6 py-4">CPU 占用率</th>
              <th className="px-6 py-4">GPU 占用率</th>
              <th className="px-6 py-4">节点状态</th>
              <th className="px-6 py-4 text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cluster.nodeDetails.map(node => (
              <tr key={node.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{node.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{node.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-500 text-xs">{node.ip}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center space-x-2">
                     <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{node.gpuCount} * {node.gpuType}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20 overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: `${node.cpuUsage}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{node.cpuUsage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20 overflow-hidden">
                      <div className={`h-full ${node.gpuUsage > 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${node.gpuUsage}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{node.gpuUsage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${node.status === 'Online' ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-orange-500 shadow-sm shadow-orange-200'}`}></span>
                    <span className="text-xs font-medium">{node.status === 'Online' ? '在线' : '维护中'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 font-bold hover:underline">维护</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClusterManagement;
