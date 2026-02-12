// src/components/layout/StageIndicator.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';

export const stages = [
  { id: 'discover', name: 'Discover' },
  { id: 'define', name: 'Define' },
  { id: 'design', name: 'Design' },
  { id: 'develop', name: 'Develop' },
  { id: 'test', name: 'Test' },
  { id: 'build', name: 'Build' },
  { id: 'deploy', name: 'deploy' }
];

const StageIndicator = ({ 
  currentStage, 
  viewingStage,
  stageData = {}, 
  onStageClick 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [height, setHeight] = useState(100);
  const [isResizing, setIsResizing] = useState(false);

  const MIN_HEIGHT = 70;
  const MAX_HEIGHT = 140;

  const getStageStatus = (stageId) => stageData[stageId]?.status || 'pending';
  const getStageItemCount = (stageId) => stageData[stageId]?.itemCount || 0;

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      const handleMove = (e) => {
        const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, e.clientY - 56));
        setHeight(newHeight);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseUp]);

  return (
    <div className="relative flex-shrink-0 bg-white border-b border-gray-200">
      {/* Collapsible Content */}
      <div 
        style={{ 
          height: isCollapsed ? '0px' : `${height}px`,
          transition: isResizing ? 'none' : 'height 0.3s ease',
          overflow: 'hidden'
        }}
      >
        <div className="h-full flex items-center px-6">
          <div className="w-full flex items-center justify-between">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.id);
              const isViewingStage = viewingStage === stage.id;
              const isPassed = status === 'passed';
              const isActive = status === 'active';
              const itemCount = getStageItemCount(stage.id);
              
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex flex-col items-center flex-1">
                    <button 
                      onClick={() => onStageClick?.(stage.id)}
                      className={`
                        w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center
                        transition-all duration-200 cursor-pointer hover:scale-105
                        ${isViewingStage 
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md' 
                          : isPassed 
                            ? 'border-green-400 bg-green-50 hover:border-green-500' 
                            : isActive
                              ? 'border-red-400 bg-red-50 hover:border-red-500'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="mb-0.5">
                        {isPassed ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <span className={`text-[10px] font-bold text-center leading-tight uppercase tracking-wide
                        ${isViewingStage ? 'text-blue-700' : isPassed ? 'text-green-700' : isActive ? 'text-red-600' : 'text-gray-500'}
                      `}>
                        {stage.name}
                      </span>
                      {itemCount > 0 && (
                        <span className="text-[8px] text-gray-400 mt-0.5">
                          {itemCount} items
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div className={`w-6 h-0.5 flex-shrink-0 ${isPassed ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Resize Handle - inside collapsible area */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize group hover:bg-blue-100/50 transition-colors"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Collapse/Expand Button - Always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute left-1/2 -translate-x-1/2 z-40 w-6 h-6 bg-white border border-gray-300 
          rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition
          ${isCollapsed ? 'top-1' : '-bottom-3'}
        `}
      >
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Minimal collapsed state indicator */}
      {isCollapsed && (
        <div className="h-4 flex items-center justify-center">
          <span className="text-[10px] text-gray-400 font-medium">
            {stages.map(s => s.id).indexOf(currentStage) + 1}/7 Stages
          </span>
        </div>
      )}
    </div>
  );
};

export default StageIndicator;