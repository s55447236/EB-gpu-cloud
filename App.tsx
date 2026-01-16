
import React, { useState } from 'react';
import Layout from './components/Layout';
import InstanceList from './components/InstanceList';
import ClusterManagement from './components/ClusterManagement';
import ResourcePools from './components/ResourcePools';
import Dashboard from './components/Dashboard';
import InstanceDeployment from './components/InstanceDeployment';
import DesignGuidelines from './components/DesignGuidelines';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onCreateInstance={() => setActiveTab('deploy-instance')} />;
      case 'instances':
        return <InstanceList onDeploy={() => setActiveTab('deploy-instance')} />;
      case 'deploy-instance':
        return <InstanceDeployment onBack={() => setActiveTab('instances')} />;
      case 'clusters':
        return <ClusterManagement />;
      case 'resource-pools':
        return <ResourcePools />;
      case 'design-guidelines':
        return <DesignGuidelines />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400">
             <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                <AlertCircle size={48} className="mb-4 text-gray-200" />
                <h2 className="text-lg font-semibold text-gray-600 mb-2">正在开发中</h2>
                <p className="text-sm text-gray-400">"{activeTab}" 功能模块即将上线，敬请期待。</p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  返回控制台概览
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
