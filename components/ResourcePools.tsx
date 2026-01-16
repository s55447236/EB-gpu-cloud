
import React from 'react';
import { 
  Grid, 
  MapPin, 
  Calendar, 
  Zap, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Search,
  RotateCw
} from 'lucide-react';
import { MOCK_RESOURCE_POOLS } from '../constants';

const ResourcePools: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">资源池管理</h1>
          <p className="text-sm text-gray-500">查看和管理已订购的专属 GPU 资源池。</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} />
          <span>订购专属资源池</span>
        </button>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="搜索资源池名称"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all">
            <RotateCw size={18} />
          </button>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-gray-400">
           <span>按过期时间排序</span>
           <ChevronRight size={14} className="rotate-90" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_RESOURCE_POOLS.map((pool) => (
          <div 
            key={pool.id} 
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                <Grid size={24} />
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                pool.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {pool.status === 'Healthy' ? '运行中' : '即将到期'}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {pool.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400 mt-2 mb-6">
              <div className="flex items-center space-x-1">
                <MapPin size={12} />
                <span>{pool.region}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap size={12} className="text-blue-500" />
                <span className="font-bold text-gray-600">{pool.gpuType}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>到期日期: {pool.expiryDate}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-tight">显卡使用率</span>
                  <span className="font-black text-blue-600">{Math.round((pool.usedCards / pool.totalCards) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      (pool.usedCards / pool.totalCards) >= 1 ? 'bg-orange-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${(pool.usedCards / pool.totalCards) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold">
                  <span className="text-gray-400 uppercase">已用: {pool.usedCards} 卡</span>
                  <span className="text-blue-500 uppercase">总量: {pool.totalCards} 卡</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
               <div className="flex items-center space-x-2 text-[11px] font-bold text-green-600">
                 <ShieldCheck size={14} />
                 <span>专属节点已就绪</span>
               </div>
               <button className="text-blue-600 text-sm font-bold hover:underline flex items-center space-x-1">
                 <span>进入资源池</span>
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcePools;
