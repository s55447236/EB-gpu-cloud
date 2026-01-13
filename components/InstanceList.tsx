
import React, { useState } from 'react';
import { 
  Search, 
  RotateCw, 
  Trash2, 
  MoreHorizontal, 
  LayoutGrid, 
  List,
  AlertCircle
} from 'lucide-react';
import { MOCK_INSTANCES } from '../constants';
import { InstanceStatus, ViewType } from '../types';

interface InstanceListProps {
  onDeploy: () => void;
}

const InstanceList: React.FC<InstanceListProps> = ({ onDeploy }) => {
  const [viewType, setViewType] = useState<ViewType>('LIST');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstances = MOCK_INSTANCES.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex items-center space-x-3 text-yellow-800 text-sm">
        <AlertCircle size={18} className="shrink-0 text-yellow-500" />
        <p>按量计费的实例连续关机 10 天后自动释放，释放后数据将被清空且不可恢复。</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onDeploy}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            部署实例
          </button>
          <button className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            启动
          </button>
          <button className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            关闭
          </button>
          <button className="bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="实例ID/名称"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
             <button 
              onClick={() => setViewType('CARD')}
              className={`p-1.5 rounded ${viewType === 'CARD' ? 'bg-gray-100 text-blue-600' : 'text-gray-400'}`}
             >
               <LayoutGrid size={18} />
             </button>
             <button 
              onClick={() => setViewType('LIST')}
              className={`p-1.5 rounded ${viewType === 'LIST' ? 'bg-gray-100 text-blue-600' : 'text-gray-400'}`}
             >
               <List size={18} />
             </button>
          </div>
          <button className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-200 transition-all">
            <RotateCw size={18} />
          </button>
        </div>
      </div>

      {/* Data Area */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 w-10">
                <input type="checkbox" className="rounded text-blue-600" />
              </th>
              <th className="px-6 py-4">镜像名称/ID</th>
              <th className="px-6 py-4">所属集群</th>
              <th className="px-6 py-4">规格详情</th>
              <th className="px-6 py-4">镜像</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4">创建时间</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredInstances.length > 0 ? filteredInstances.map((inst) => (
              <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded text-blue-600" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{inst.name}</span>
                    <span className="text-xs text-gray-400">{inst.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {inst.cluster}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex flex-col">
                    <span>{inst.specs}</span>
                    <span className="text-xs text-blue-500 font-medium">{inst.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-[150px]" title={inst.image}>
                  {inst.image}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      inst.status === InstanceStatus.RUNNING ? 'bg-green-500' : 
                      inst.status === InstanceStatus.STARTING ? 'bg-blue-500 animate-pulse' : 
                      'bg-gray-400'
                    }`}></span>
                    <span className="text-gray-700">{inst.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {inst.createTime}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-3 text-blue-600">
                    <button className="hover:underline">登录</button>
                    <button className="hover:underline">监控</button>
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle size={48} className="mb-2 opacity-20" />
                    <p>暂无数据</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>总计 {filteredInstances.length} 条</span>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>&lt;</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>&gt;</button>
            <select className="border border-gray-200 rounded px-1 py-1">
              <option>10 条/页</option>
              <option>20 条/页</option>
              <option>50 条/页</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceList;
