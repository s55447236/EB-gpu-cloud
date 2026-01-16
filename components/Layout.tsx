
import React from 'react';
import { Bell, User, ChevronDown, ExternalLink, Gift } from 'lucide-react';
import { MENU_ITEMS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const categories = Array.from(new Set(MENU_ITEMS.map(item => item.category)));

  return (
    <div className="flex h-screen bg-[#f3f6fb] overflow-hidden font-['Inter']">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white font-bold text-lg">eb</span>
          </div>
          <span className="text-xl font-bold text-gray-800">ebcloud</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-6 pt-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <ul className="space-y-1">
                {MENU_ITEMS.filter(item => item.category === category).map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.id === 'firewall' && (
                        <span className="ml-auto bg-green-100 text-green-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Beta</span>
                      )}
                      {item.id === 'arena' && (
                        <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">New</span>
                      )}
                      {item.id === 'ocr' && (
                        <ExternalLink size={14} className="ml-auto text-gray-400" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Financial Sidebar Card */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 flex items-center space-x-3">
             <div className="bg-white p-2 rounded-full shadow-sm">
                <Gift className="text-blue-500" size={20} />
             </div>
             <div>
               <p className="text-xs font-bold text-blue-800">推荐有礼</p>
               <p className="text-[10px] text-blue-600 font-medium">邀请好友返利 10%</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-8 text-sm font-bold text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">镜像社区</a>
            <button 
              onClick={() => setActiveTab('deploy-instance')} 
              className={`hover:text-blue-600 transition-colors ${activeTab === 'deploy-instance' ? 'text-blue-600' : ''}`}
            >
              部署GPU实例
            </button>
            <a href="#" className="hover:text-blue-600 transition-colors">模型API</a>
            <button 
              onClick={() => setActiveTab('design-guidelines')} 
              className={`hover:text-blue-600 transition-colors ${activeTab === 'design-guidelines' ? 'text-blue-600' : ''}`}
            >
              文档中心
            </button>
            <a href="#" className="hover:text-blue-600 transition-colors">常见问题 (FAQ)</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-1.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              控制台
            </button>
            <button className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-100">
              发布社区镜像
            </button>
            <div className="flex items-center space-x-2 pl-4 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-xl transition-colors">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <User size={20} className="text-gray-400" />
              </div>
              <span className="text-sm font-bold text-gray-700">eb_user_772</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f3f6fb]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
