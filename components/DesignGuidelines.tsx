
import React from 'react';
import { 
  Palette, 
  Type, 
  Component, 
  Layers, 
  Layout as LayoutIcon, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle,
  MousePointer2
} from 'lucide-react';

const DesignGuidelines: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">ebcloud UI 设计规范</h1>
        <p className="text-lg text-gray-500">构建高性能、直观且美观的 AI 云计算交互体验。遵循极简、高效、一致的视觉语言。</p>
      </div>

      {/* Color Palette */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-gray-800">
          <Palette className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold">色彩系统 (Color Palette)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">品牌主色 (Primary)</h3>
            <div className="space-y-2">
              <div className="bg-blue-600 h-24 rounded-2xl flex flex-col justify-end p-4 text-white shadow-lg shadow-blue-100">
                <span className="font-bold">Blue 600</span>
                <span className="text-xs opacity-80">#2563EB</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 h-12 rounded-xl flex items-center justify-center text-blue-600 text-[10px] font-bold">Blue 50</div>
                <div className="bg-blue-700 h-12 rounded-xl flex items-center justify-center text-white text-[10px] font-bold">Blue 700</div>
              </div>
            </div>
          </div>

          {/* Neutral */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">中性色 (Neutral)</h3>
            <div className="space-y-2">
              <div className="bg-gray-900 h-24 rounded-2xl flex flex-col justify-end p-4 text-white">
                <span className="font-bold">Gray 900</span>
                <span className="text-xs opacity-80">#111827</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 h-10 rounded-lg border border-gray-100"></div>
                <div className="bg-gray-100 h-10 rounded-lg border border-gray-200"></div>
                <div className="bg-gray-200 h-10 rounded-lg"></div>
                <div className="bg-gray-400 h-10 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Semantic */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">语义色 (Semantic)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-green-500 h-16 rounded-xl flex flex-col justify-end p-2 text-white">
                  <span className="text-[10px] font-bold">Success</span>
                </div>
                <div className="bg-orange-500 h-16 rounded-xl flex flex-col justify-end p-2 text-white">
                  <span className="text-[10px] font-bold">Warning</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-red-500 h-16 rounded-xl flex flex-col justify-end p-2 text-white">
                  <span className="text-[10px] font-bold">Danger</span>
                </div>
                <div className="bg-indigo-600 h-16 rounded-xl flex flex-col justify-end p-2 text-white">
                  <span className="text-[10px] font-bold">Indigo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-gray-800">
          <Type className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold">文字排版 (Typography)</h2>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
          <div>
            <p className="text-xs font-bold text-gray-400 mb-4 tracking-widest">字体家族: Inter, system-ui, sans-serif</p>
            <div className="space-y-6">
              <div className="flex items-baseline space-x-6">
                <span className="w-24 text-xs font-mono text-gray-400">Heading 1</span>
                <h1 className="text-4xl font-black text-gray-900">36px / Black / ebcloud</h1>
              </div>
              <div className="flex items-baseline space-x-6">
                <span className="w-24 text-xs font-mono text-gray-400">Heading 2</span>
                <h2 className="text-2xl font-bold text-gray-800">24px / Bold / 算力资源概览</h2>
              </div>
              <div className="flex items-baseline space-x-6">
                <span className="w-24 text-xs font-mono text-gray-400">Body Large</span>
                <p className="text-lg text-gray-600">18px / Regular / 欢迎使用下一代智算云平台。</p>
              </div>
              <div className="flex items-baseline space-x-6">
                <span className="w-24 text-xs font-mono text-gray-400">Body Normal</span>
                <p className="text-sm text-gray-500 leading-relaxed">14px / Regular / 通过 ebcloud 控制台，您可以轻松部署全球顶尖的 GPU 算力实例，并享受丝滑的运维体验。</p>
              </div>
              <div className="flex items-baseline space-x-6">
                <span className="w-24 text-xs font-mono text-gray-400">Caption</span>
                <p className="text-xs font-medium text-gray-400">12px / Medium / 最后更新: 2024-05-20</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-gray-800">
          <Component className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold">组件规范 (Components)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">按钮 (Buttons)</h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Primary Action</button>
              <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">Secondary</button>
              <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors">Ghost Blue</button>
            </div>
          </div>

          {/* Badges/Status */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">状态标签 (Badges)</h3>
            <div className="flex flex-wrap gap-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Running</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Starting</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Warning</span>
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Stopped</span>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">卡片容器 (Cards)</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600">
                  <Layers size={16} />
                </div>
                <span className="font-bold text-gray-800">标准卡片容器</span>
              </div>
              <p className="text-xs text-gray-400">使用 rounded-2xl (1rem) 圆角，border-gray-100 边框。</p>
            </div>
          </div>

          {/* Feedbacks */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">交互反馈 (Feedback)</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded-lg text-xs font-bold">
                <CheckCircle2 size={14} /> <span>操作成功</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-2 rounded-lg text-xs font-bold">
                <Info size={14} /> <span>信息提示</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-2 rounded-lg text-xs font-bold">
                <AlertTriangle size={14} /> <span>警告提示</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Effects */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-gray-800">
          <Layers className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold">视觉效果 (Visual Effects)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">阴影 (Shadows)</h3>
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">Shadow SM</span>
              </div>
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg shadow-blue-100/50 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-blue-400">Color Shadow</span>
              </div>
              <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl shadow-black/5 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">Shadow 2XL</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">渐变 (Gradients)</h3>
            <div className="h-24 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-4 text-white flex items-center justify-between">
              <span className="font-bold">Brand Gradient</span>
              <LayoutIcon className="opacity-20" size={48} />
            </div>
          </div>
        </div>
      </section>

      {/* Design Principles Footer */}
      <div className="pt-12 border-t border-gray-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4 shadow-xl shadow-blue-100">eb</div>
        <p className="text-sm font-bold text-gray-800 mb-1 font-mono">EBCLOUD DESIGN SYSTEM v1.0.4</p>
        <p className="text-xs text-gray-400 tracking-widest uppercase">Consistency • Efficiency • Aesthetics</p>
      </div>
    </div>
  );
};

export default DesignGuidelines;
