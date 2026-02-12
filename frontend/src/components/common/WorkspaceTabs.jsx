// src/components/workspace/WorkspaceTabs.jsx
import React from 'react';
import { FileText, Shield, History } from 'lucide-react';

const WorkspaceTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: FileText },
    { id: 'stagegate', label: 'Stage Gate', icon: Shield },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="flex border-b border-gray-200 bg-white px-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all text-sm font-medium
              ${isActive 
                ? 'border-lilly-500 text-lilly-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default WorkspaceTabs;