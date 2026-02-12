// src/components/workspace/ProjectDashboard.jsx
import React from 'react';
import { ArrowRight, AlertCircle, TrendingUp, Clock, FileText, Users, CheckCircle2 } from 'lucide-react';

const ProjectDashboard = ({ 
  project, 
  stageData, 
  onEnterWorkspace, 
  recentActivity = [],
  teamMembers = []
}) => {
  const currentStage = project?.current_stage || 'discover';
  const currentStageData = stageData?.[currentStage] || {};
  
  const defaultTeam = [
    { id: 1, name: 'Siva', initials: 'S', color: 'bg-red-500', role: 'PM' },
    { id: 2, name: 'Raj', initials: 'R', color: 'bg-blue-500', role: 'BA' },
    { id: 3, name: 'Priya', initials: 'P', color: 'bg-purple-500', role: 'Architect' },
    { id: 4, name: 'Amit', initials: 'A', color: 'bg-green-500', role: 'Dev Lead' },
    { id: 5, name: 'Maya', initials: 'M', color: 'bg-orange-500', role: 'QA Lead' },
  ];
  
  const defaultActivity = [
    { user: 'AI Agent', action: 'generated Problem Statement', time: 'Just now', type: 'ai' },
    { user: 'Priya', action: 'committed arch diagram v2', time: '2h ago', type: 'commit' },
    { user: 'Siva', action: 'approved BRD gate', time: 'yesterday', type: 'approval' },
    { user: 'AI', action: 'suggested 3 NFRs', time: 'yesterday', type: 'ai' }
  ];

  const team = teamMembers.length > 0 ? teamMembers : defaultTeam;
  const activity = recentActivity.length > 0 ? recentActivity : defaultActivity;

  const getProgressPercent = () => {
    const stageOrder = ['discover', 'define', 'design', 'develop', 'testing', 'build', 'deploy'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const baseProgress = (currentIndex / stageOrder.length) * 100;
    const stageProgress = currentStageData.itemCount ? Math.min(30, currentStageData.itemCount * 5) : 0;
    return Math.min(100, baseProgress + stageProgress);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto">
        {/* Project Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{project?.name || 'Project'}</h1>
          <p className="text-gray-500 mt-1">Track progress across all development stages</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Dashboard Card */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Project Dashboard
              </h2>

              <div className="grid grid-cols-2 gap-8">
                {/* Team Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team ({team.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="text-center group">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold mx-auto mb-2
                          ${member.color} group-hover:scale-105 transition-transform cursor-pointer
                        `}>
                          {member.initials}
                        </div>
                        <span className="text-xs text-gray-700 font-medium block">{member.name}</span>
                        <span className="text-[10px] text-gray-400">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {activity.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                          ${item.type === 'ai' ? 'bg-purple-100' : item.type === 'approval' ? 'bg-green-100' : 'bg-blue-100'}
                        `}>
                          {item.type === 'ai' ? '✨' : item.type === 'approval' ? '✓' : '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-gray-900">{item.user}</span>
                            <span className="text-gray-600"> {item.action}</span>
                          </p>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enter Workspace Button */}
            <div className="px-6 pb-6">
              <button
                onClick={onEnterWorkspace}
                className="w-full py-3 bg-[#E11932] text-white rounded-lg hover:bg-[#C81530] transition-all font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                Enter Workspace
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stage Progress Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Stage: <span className="text-[#E11932] uppercase">{currentStage}</span>
              </h3>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{Math.round(getProgressPercent())}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-[#E11932] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercent()}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Artifacts:</span>
                  <span className="font-medium text-gray-900">{currentStageData.itemCount || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-gray-600">Blockers:</span>
                  <span className="font-medium text-amber-600">1</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Next Gate:</span>
                  <span className="font-medium text-gray-900 capitalize">{currentStage} Review</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(stageData || {}).filter(s => s.status === 'passed').length}
                  </div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(stageData || {}).reduce((sum, s) => sum + (s.itemCount || 0), 0)}
                  </div>
                  <div className="text-xs text-blue-700">Total Items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;