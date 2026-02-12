// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, FileText, Folder, FolderOpen,
  Check, Circle, Clock, Eye, Sparkles
} from 'lucide-react';

const Sidebar = ({ 
  projectFiles = [], 
  onFileSelect, 
  selectedFile,
  viewingStage,
  currentStage 
}) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  // Auto-expand viewing stage
  useEffect(() => {
    setExpandedFolders(prev => ({ ...prev, [viewingStage]: true }));
  }, [viewingStage]);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const getGateStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <Check className="w-3.5 h-3.5 text-green-600" />;
      case 'active': return <Circle className="w-3 h-3 text-blue-600 fill-blue-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      passed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Complete' },
      active: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'In Progress' },
      pending: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Pending' }
    };
    const c = configs[status] || configs.pending;
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
        {c.label}
      </span>
    );
  };

  const totalFiles = projectFiles.reduce((sum, folder) => sum + (folder.files?.length || 0), 0);

  return (
    <div className="w-60 bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Files</h3>
          <span className="text-xs text-gray-400">{totalFiles}</span>
        </div>
        {viewingStage && (
          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
            <Eye className="w-3 h-3" />
            <span className="capitalize font-medium">{viewingStage}</span>
          </div>
        )}
      </div>

      {/* File Tree */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {projectFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Folder className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No files yet</p>
          </div>
        ) : (
          projectFiles.map((folder) => {
            const isExpanded = expandedFolders[folder.id];
            const isViewing = viewingStage === folder.id;
            const hasFiles = folder.files && folder.files.length > 0;
            
            return (
              <div key={folder.id} className="mb-0.5">
                {/* Folder Header */}
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-all
                    ${isViewing 
                      ? 'bg-red-50 border border-red-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {hasFiles ? (
                      isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    ) : <span className="w-3.5" />}
                    {isExpanded ? (
                      <FolderOpen className={`w-4 h-4 ${isViewing ? 'text-red-600' : 'text-amber-500'}`} />
                    ) : (
                      <Folder className={`w-4 h-4 ${isViewing ? 'text-red-600' : 'text-amber-500'}`} />
                    )}
                    <span className={`font-medium text-sm ${isViewing ? 'text-red-700' : 'text-gray-700'}`}>
                      {folder.name}
                    </span>
                    {hasFiles && <span className="text-[10px] text-gray-400">({folder.files.length})</span>}
                  </div>
                  {getGateStatusIcon(folder.gateStatus)}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                    {/* Status Badge */}
                    <div className="py-1">
                      {getStatusBadge(folder.gateStatus)}
                    </div>

                    {/* Files */}
                    {hasFiles ? (
                      folder.files.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => onFileSelect(file)}
                          className={`
                            w-full flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-lg transition-all
                            ${selectedFile?.id === file.id 
                              ? 'bg-red-100 text-red-800 font-medium border border-red-200' 
                              : 'hover:bg-gray-50 text-gray-600'
                            }
                          `}
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate flex-1 text-left text-xs">{file.name}</span>
                          {file.modified && (
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-2.5 py-2 text-[10px] text-gray-400 italic flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Generate artifacts
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100 bg-gray-50/50">
        <div className="text-[10px] text-gray-400 flex items-center justify-between px-1">
          <span className="capitalize">{viewingStage}</span>
          <span>{projectFiles.find(f => f.id === viewingStage)?.files?.length || 0} files</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;