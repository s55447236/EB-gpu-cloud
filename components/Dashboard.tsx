
import React from 'react';
import { 
  Zap, 
  Shield, 
  CreditCard, 
  Cpu, 
  Server, 
  Activity, 
  ChevronRight,
  PlusCircle,
  Clock
} from 'lucide-react';
import { MOCK_CLUSTERS, MOCK_INSTANCES } from '../constants';
import { InstanceStatus } from '../types';

interface DashboardProps {
  onCreateInstance: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateInstance }) => {
  const activeInstances = MOCK_INSTANCES.filter(i => i.status === InstanceStatus.RUNNING).length;
  const usedGpu = MOCK_CLUSTERS.reduce((acc, c) => acc + c.usedGpu, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">欢迎回来, ebcloud 用户</h1>
            <p className="text-blue-100 opacity-80 mb-6">您的私有算力集群运行状态良好，今日已处理 1,280 个推理请求。</p>
            <div className="flex space-x-4">
              <button 
                onClick={onCreateInstance}
                className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <PlusCircle size={18} />
                <span>立即创建实例</span>
              </button>
              <button className="bg-blue-600/30 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                查看集群文档
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 -mr-20 -mt-20 rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-400 opacity-10 rounded-full blur-2xl"></div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">账户余额</span>
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">¥ 12,850.42</span>
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium flex items-center">
              <Shield size={12} className="mr-1" /> 已开启欠费保护
            </p>
          </div>
          <div className="mt-6 flex space-x-3">
            <button className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 border border-gray-200">
              财务记录
            </button>
            <button className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-100">
              立即充值
            </button>
          </div>
        </div>
      </div>

      {/* Resource Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '运行中实例', value: activeInstances, icon: <Zap />, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: '集群节点总数', value: 24, icon: <Server />, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'GPU 在线数', value: usedGpu, icon: <Cpu />, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: '今日调用量', value: '42.8k', icon: <Activity />, color: 'text-green-500', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              {/* Fix: Explicitly cast React.ReactElement to accept custom props like 'size' during cloneElement */}
              {React.cloneElement(stat.icon as React.ReactElement<{ size?: number }>, { size: 24 })}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">核心集群状态</h3>
            <button className="text-blue-600 text-sm font-medium flex items-center hover:underline">
              所有集群 <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_CLUSTERS.slice(0, 2).map((cluster) => (
              <div key={cluster.id} className="p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-700">{cluster.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    cluster.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {cluster.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">GPU 利用率</span>
                    <span className="font-bold text-gray-600">{Math.round((cluster.usedGpu / cluster.totalGpu) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${(cluster.usedGpu / cluster.totalGpu) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{cluster.usedGpu} 已用 / {cluster.totalGpu} 总计</span>
                    <span>{cluster.region}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">最近动态</h3>
          </div>
          <div className="p-6 space-y-6">
            {[
              { title: '成功创建实例', time: '10 分钟前', desc: 'Stable-Diffusion-WebUI 已启动', icon: <PlusCircle size={14} className="text-green-500" /> },
              { title: 'API Key 创建', time: '2 小时前', desc: '生产环境 Key 已下发', icon: <Shield size={14} className="text-blue-500" /> },
              { title: '资源预警', time: '5 小时前', desc: '北京华北集群 GPU 负载超过 90%', icon: <Activity size={14} className="text-orange-500" /> },
            ].map((item, i) => (
              <div key={i} className="flex space-x-3">
                <div className="mt-1">{item.icon}</div>
                <div>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <span className="text-[10px] text-gray-400 flex items-center">
                      <Clock size={10} className="mr-1" /> {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 text-xs text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-50">
            查看全部操作日志
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
