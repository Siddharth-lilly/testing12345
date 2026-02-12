// src/pages/ProjectsPage.jsx - Updated with Project Dashboard View
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Plus, FolderOpen, Clock, Users, ChevronRight, ChevronLeft,
  Loader2, AlertCircle, Check, Sparkles, X, ArrowRight, TrendingUp,
  FileText, Settings, Bell
} from 'lucide-react';
import api from '../services/api';

// Stage colors
const stageColors = {
  discover: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  define: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  design: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  develop: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  test: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  build: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  deploy: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500' },
};

const stages = [
  { id: 'discover', name: 'DISCOVER' },
  { id: 'define', name: 'DEFINE' },
  { id: 'design', name: 'DESIGN' },
  { id: 'develop', name: 'DEVELOP' },
  { id: 'test', name: 'TESTING (UAT)' },
  { id: 'build', name: 'BUILD' },
  { id: 'deploy', name: 'DEPLOY' }
];

const defaultTeam = [
  { id: 1, name: 'Siva', initials: 'S', color: 'bg-red-500' },
  { id: 2, name: 'Raj', initials: 'R', color: 'bg-blue-500' },
  { id: 3, name: 'Priya', initials: 'P', color: 'bg-purple-500' },
  { id: 4, name: 'Amit', initials: 'A', color: 'bg-green-500' },
  { id: 5, name: 'Maya', initials: 'M', color: 'bg-orange-500' }
];

const defaultActivity = [
  { user: 'Priya', action: 'committed arch diagram v2', time: '2h ago' },
  { user: 'Siva', action: 'approved BRD gate', time: 'yesterday' },
  { user: 'AI', action: 'suggested 3 NFRs', time: 'yesterday' }
];

// Stage Indicator Component for Dashboard
const DashboardStageIndicator = ({ currentStage, stageData = {} }) => {
  const getStageStatus = (stageId) => {
    const stageOrder = stages.map(s => s.id);
    const currentIdx = stageOrder.indexOf(currentStage);
    const stageIdx = stageOrder.indexOf(stageId);
    if (stageIdx < currentIdx) return 'passed';
    if (stageIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getItemCount = (stageId) => stageData[stageId]?.itemCount || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          const isPassed = status === 'passed';
          const isActive = status === 'active';
          const itemCount = getItemCount(stage.id);
          
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`
                  w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                  ${isActive 
                    ? 'border-red-400 bg-red-50' 
                    : isPassed 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }
                `}>
                  <div className="mb-1">
                    {isPassed ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : isActive ? (
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold text-center leading-tight px-1 ${
                    isActive ? 'text-red-600' : isPassed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5">
                    {itemCount} items
                  </span>
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div className={`w-8 h-0.5 ${isPassed ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Project Dashboard Component
const ProjectDashboard = ({ project, onBack, onEnterWorkspace }) => {
  const [stageData, setStageData] = useState({
    discover: { status: 'passed', itemCount: 12 },
    define: { status: 'passed', itemCount: 8 },
    design: { status: 'active', itemCount: 3 },
    develop: { status: 'pending', itemCount: 0 },
    test: { status: 'pending', itemCount: 0 },
    build: { status: 'pending', itemCount: 0 },
    deploy: { status: 'pending', itemCount: 0 }
  });
  
  const currentStage = project?.current_stage || 'discover';
  const progress = currentStage === 'design' ? 60 : currentStage === 'define' ? 40 : 20;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">SDLC Studio</span>
              </div>
              
              <div className="h-6 w-px bg-gray-200" />
              
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <FolderOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{project?.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">5</span>
                <Users className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                SS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Back Button & Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
            <p className="text-gray-500 mt-1">Track progress across all development stages</p>
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>

        {/* Stage Indicator */}
        <DashboardStageIndicator currentStage={currentStage} stageData={stageData} />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main Dashboard Card */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Project Dashboard
            </h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Team */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Team ({defaultTeam.length})</h3>
                <div className="grid grid-cols-3 gap-4">
                  {defaultTeam.map(member => (
                    <div key={member.id} className="text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold mx-auto mb-2 ${member.color}`}>
                        {member.initials}
                      </div>
                      <span className="text-xs text-gray-600">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {defaultActivity.map((activity, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                      <span className="text-gray-400 text-xs block">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onEnterWorkspace}
              className="mt-6 w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              Enter Workspace
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stage Progress Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Stage: <span className="uppercase">{currentStage}</span>
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-gray-900 font-medium">Blockers: 1</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Next Gate: <span className="capitalize">{currentStage}</span> Review</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main Projects Page Component
const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    created_by: 'demo_user'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.listProjects();
      setProjects(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Is the backend running?');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setCreating(true);
      const project = await api.createProject(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', created_by: 'demo_user' });
      navigate(`/workspace/${project.id}?stage=discover&new=true`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const handleEnterWorkspace = () => {
    if (selectedProject) {
      navigate(`/workspace/${selectedProject.id}`);
    }
  };

  const getStageColor = (stage) => {
    const colors = stageColors[stage] || stageColors.discover;
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Show Project Dashboard if a project is selected
  if (selectedProject) {
    return (
      <ProjectDashboard 
        project={selectedProject}
        onBack={handleBackToProjects}
        onEnterWorkspace={handleEnterWorkspace}
      />
    );
  }

  // Projects List View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SDLC Studio</h1>
                <p className="text-xs text-gray-500">AI-Powered Development</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={loadProjects} className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm">
              Retry
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
          <p className="text-sm text-gray-500 mt-1">Select a project to view dashboard</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStageColor(project.current_stage)}`}>
                    {project.current_stage}
                  </span>
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.created_by}
                  </span>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">View dashboard</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  New Project
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Start your AI-powered development</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Legal Request Intake App"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what you want to build..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-700">
                  <strong>Next:</strong> You'll describe your project idea to the AI Discover Agent.
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;