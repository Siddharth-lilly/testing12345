// src/pages/WorkspaceView.jsx - COMPLETE with Develop Stage
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import StageIndicator from '../components/stages/StageIndicator';
import Sidebar from '../components/layout/Sidebar';
import EditorPanel from '../components/project/EditorPanel';
import TeamChat from '../components/chat/TeamChat';
import AISpecialist from '../components/chat/AISpecialist';
import WorkspaceTabs from '../components/common/WorkspaceTabs';
import HistoryTab from '../components/project/HistoryTab';
import StageGatePanel from '../components/stages/StageGatePanel';
import GitHubConfigModal from '../components/project/GitHubConfigModal';
import DevelopStagePanel from '../components/stages/DevelopStagePanel';
import TestStagePanel from '../components/stages/TestStagePanel';  // ADD THIS LINE
import api from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

const WorkspaceView = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // GitHub state - SINGLE SOURCE OF TRUTH
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [gitHubConfig, setGitHubConfig] = useState(null);
  const [isCheckingGitHub, setIsCheckingGitHub] = useState(false);
  
  // Core state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [currentStage, setCurrentStage] = useState('discover');
  const [viewingStage, setViewingStage] = useState('discover');

  // Develop stage state
  const [developTickets, setDevelopTickets] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Artifacts state
  const [artifacts, setArtifacts] = useState({
    discover: [], define: [], design: [], develop: [], test: [], build: [], deploy: []
  });

  // Stage data for indicator
  const [stageData, setStageData] = useState({
    discover: { status: 'active', itemCount: 0 },
    define: { status: 'pending', itemCount: 0 },
    design: { status: 'pending', itemCount: 0 },
    develop: { status: 'pending', itemCount: 0 },
    test: { status: 'pending', itemCount: 0 },
    build: { status: 'pending', itemCount: 0 },
    deploy: { status: 'pending', itemCount: 0 }
  });

  // Chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: 'System', content: 'Welcome to SDLC Studio!', time: 'Just now', isAI: true }
  ]);

  // Commit history
  const [commitHistory, setCommitHistory] = useState([]);

  // Reusable GitHub config check
  const checkGitHubConfig = useCallback(async () => {
    if (!projectId) return;
    
    setIsCheckingGitHub(true);
    try {
      const config = await api.getGitHubConfig(projectId);
      setGitHubConfig(config);
      return config;
    } catch (err) {
      console.error('Failed to check GitHub config:', err);
      setGitHubConfig({ is_configured: false });
      return { is_configured: false };
    } finally {
      setIsCheckingGitHub(false);
    }
  }, [projectId]);

  // Check GitHub config when viewing develop stage
  useEffect(() => {
    if (viewingStage === 'develop') {
      checkGitHubConfig().then(config => {
        if (!config?.is_configured) {
          setShowGitHubModal(true);
        }
      });
    }
  }, [viewingStage, checkGitHubConfig]);

  // Load project on mount
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Set initial stage from URL
  useEffect(() => {
    const stageParam = searchParams.get('stage');
    if (stageParam) setViewingStage(stageParam);
  }, [searchParams]);

  const isValidUUID = (str) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  const loadProjectData = async () => {
    if (!isValidUUID(projectId)) {
      setError(`Invalid project ID: "${projectId}".`);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const projectData = await api.getProject(projectId);
      setProject(projectData);
      
      const projectStage = (projectData.current_stage || 'discover').toLowerCase();
      setCurrentStage(projectStage);
      setViewingStage(searchParams.get('stage') || projectStage);
      
      let allArtifacts = [];
      try {
        const resp = await api.listProjectArtifacts(projectId);
        allArtifacts = Array.isArray(resp) ? resp : (resp?.artifacts || []);
      } catch (e) {
        console.log('No artifacts yet');
      }
      
      const artifactsByStage = {
        discover: [], define: [], design: [], develop: [], test: [], build: [], deploy: []
      };
      
      allArtifacts.forEach(a => {
        const stage = (a.stage || 'discover').toLowerCase();
        if (artifactsByStage[stage]) artifactsByStage[stage].push(a);
      });
      
      setArtifacts(artifactsByStage);
      updateStageData(artifactsByStage, projectStage);
      
      try {
        const commits = await api.getProjectCommits(projectId);
        setCommitHistory(Array.isArray(commits) ? commits : []);
      } catch (e) {
        setCommitHistory([]);
      }

      // Load develop tickets if we have them
      if (projectStage === 'develop' || artifactsByStage.develop.length > 0) {
        try {
          const ticketsResult = await api.getDevelopTickets(projectId);
          if (ticketsResult.status === 'success') {
            setDevelopTickets({
              tickets: ticketsResult.tickets,
              summary: ticketsResult.summary,
              artifact_id: ticketsResult.artifact_id
            });
          }
        } catch (e) {
          console.log('No tickets yet');
        }
      }
      
    } catch (err) {
      setError('Failed to load project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStageData = (artifactsData, currentStg) => {
    const stages = ['discover', 'define', 'design', 'develop', 'test', 'build', 'deploy'];
    const currentIndex = stages.indexOf(currentStg.toLowerCase());
    
    const newStageData = {};
    stages.forEach((stage, index) => {
      const count = artifactsData[stage]?.length || 0;
      let status = 'pending';
      if (index < currentIndex) status = 'passed';
      else if (index === currentIndex) status = count > 0 ? 'passed' : 'active';
      newStageData[stage] = { status, itemCount: count };
    });
    
    setStageData(newStageData);
  };

  const getProjectFiles = () => {
    const stages = ['discover', 'define', 'design', 'develop', 'test', 'build', 'deploy'];
    return stages.map(stage => ({
      id: stage,
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      gateStatus: stageData[stage]?.status || 'pending',
      files: (artifacts[stage] || []).map(artifact => ({
        id: artifact.artifact_id || artifact.id,
        name: artifact.name,
        modified: false,
        lastEditedBy: artifact.created_by || 'AI',
        lastEditedTime: artifact.created_at ? new Date(artifact.created_at).toLocaleString() : 'Unknown',
        content: artifact.content,
        artifactData: artifact
      }))
    }));
  };

  // GitHub config success handler - updates the SINGLE SOURCE OF TRUTH
  const handleGitHubConfigSuccess = useCallback((data) => {
    const newConfig = {
      is_configured: true,
      github_repo: data.repo,
      default_branch: data.default_branch
    };
    setGitHubConfig(newConfig);
    setShowGitHubModal(false);
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      author: 'System',
      content: `✅ GitHub connected to **${data.repo}**`,
      time: 'Just now',
      isAI: true
    }]);
  }, []);

  // Unified generation complete handler
  const handleGenerationComplete = (result) => {
    console.log('Generation complete:', result);
    
    // Handle develop stage - ticket generation
    if (result.stage === 'develop' || result.tickets) {
      setDevelopTickets({
        tickets: result.tickets,
        summary: result.summary,
        artifact_id: result.artifact_id
      });
      
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        author: 'AI',
        content: `✅ Generated ${result.tickets?.length || 0} development tickets!`,
        time: 'Just now',
        isAI: true
      }]);
      return;
    }
    
    // Handle discover stage
    if (result.problem_statement && result.stakeholder_analysis) {
      const newArtifacts = [
        {
          artifact_id: result.problem_statement.artifact_id,
          name: 'Problem Statement',
          content: result.problem_statement.content,
          created_at: result.problem_statement.created_at,
          created_by: 'AI Business Analyst',
          stage: 'discover'
        },
        {
          artifact_id: result.stakeholder_analysis.artifact_id,
          name: 'Stakeholder Analysis',
          content: result.stakeholder_analysis.content,
          created_at: result.stakeholder_analysis.created_at,
          created_by: 'AI Business Analyst',
          stage: 'discover'
        }
      ];

      setArtifacts(prev => ({ ...prev, discover: newArtifacts }));
      setStageData(prev => ({
        ...prev,
        discover: { status: 'passed', itemCount: 2 },
        define: { status: 'active', itemCount: 0 }
      }));
      setCurrentStage('define');

      setSelectedFile({
        id: result.problem_statement.artifact_id,
        name: 'Problem Statement',
        content: result.problem_statement.content,
        lastEditedBy: 'AI Business Analyst',
        lastEditedTime: new Date().toLocaleString()
      });
      setFileContent(result.problem_statement.content);
      return;
    }
    
    // Handle define stage
    if (result.brd && result.user_stories) {
      const newArtifacts = [
        {
          artifact_id: result.brd.artifact_id,
          name: 'Business Requirements Document',
          content: result.brd.content,
          created_at: result.brd.created_at,
          created_by: 'AI Technical Writer',
          stage: 'define'
        },
        {
          artifact_id: result.user_stories.artifact_id,
          name: 'User Stories',
          content: result.user_stories.content,
          created_at: result.user_stories.created_at,
          created_by: 'AI Technical Writer',
          stage: 'define'
        }
      ];

      setArtifacts(prev => ({ ...prev, define: newArtifacts }));
      setStageData(prev => ({
        ...prev,
        define: { status: 'passed', itemCount: 2 },
        design: { status: 'active', itemCount: 0 }
      }));
      setCurrentStage('design');

      setSelectedFile({
        id: result.brd.artifact_id,
        name: 'Business Requirements Document',
        content: result.brd.content,
        lastEditedBy: 'AI Technical Writer',
        lastEditedTime: new Date().toLocaleString()
      });
      setFileContent(result.brd.content);
      return;
    }
    
    // Handle design stage
    if (result.architecture) {
      const newArtifacts = [{
        artifact_id: result.architecture.artifact_id,
        name: result.architecture.name || 'Solution Architecture Document',
        content: result.architecture.content,
        created_at: result.architecture.created_at,
        created_by: 'AI Solution Architect',
        stage: 'design'
      }];

      setArtifacts(prev => ({ ...prev, design: newArtifacts }));
      setStageData(prev => ({
        ...prev,
        design: { status: 'passed', itemCount: 1 },
        develop: { status: 'active', itemCount: 0 }
      }));
      setCurrentStage('develop');

      setSelectedFile({
        id: result.architecture.artifact_id,
        name: result.architecture.name || 'Solution Architecture Document',
        content: result.architecture.content,
        lastEditedBy: 'AI Solution Architect',
        lastEditedTime: new Date().toLocaleString()
      });
      setFileContent(result.architecture.content);
      return;
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    console.log('Selected ticket:', ticket);
    // Could show ticket details in editor panel
    setSelectedFile({
      id: ticket.key,
      name: `${ticket.key}: ${ticket.summary}`,
      content: `# ${ticket.key}: ${ticket.summary}\n\n**Type:** ${ticket.type}\n**Priority:** ${ticket.priority}\n**Estimated Hours:** ${ticket.estimated_hours}\n\n## Description\n${ticket.description}\n\n## Acceptance Criteria\n${ticket.acceptance_criteria.map(ac => `- [ ] ${ac}`).join('\n')}\n\n## Tech Stack\n${ticket.tech_stack.join(', ')}`,
      lastEditedBy: 'System',
      lastEditedTime: new Date().toLocaleString()
    });
    setFileContent(`# ${ticket.key}: ${ticket.summary}\n\n**Type:** ${ticket.type}\n**Priority:** ${ticket.priority}\n**Estimated Hours:** ${ticket.estimated_hours}\n\n## Description\n${ticket.description}\n\n## Acceptance Criteria\n${ticket.acceptance_criteria.map(ac => `- [ ] ${ac}`).join('\n')}\n\n## Tech Stack\n${ticket.tech_stack.join(', ')}`);
  };

  const handleStageClick = async (stageId) => {
    setViewingStage(stageId);
    setSelectedFile(null);
    setFileContent('');
    setSelectedTicket(null);
    
    // GitHub check happens in useEffect when viewingStage changes to 'develop'
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFileContent(file.content || `# ${file.name}\n\nLoading...`);
    setSelectedTicket(null);
  };

  const handleSendMessage = (message) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(), author: 'You', content: message, time: 'Just now', isAI: false
    }]);
  };

  const isStageAccessible = (stageId) => {
    const stages = ['discover', 'define', 'design', 'develop', 'test', 'build', 'deploy'];
    return stages.indexOf(stageId) <= stages.indexOf(currentStage.toLowerCase());
  };

  const getPreviousStageArtifacts = () => {
    const stages = ['discover', 'define', 'design', 'develop', 'test', 'build', 'deploy'];
    const idx = stages.indexOf(viewingStage);
    if (viewingStage === 'design') return [...(artifacts.discover || []), ...(artifacts.define || [])];
    if (viewingStage === 'develop') return [...(artifacts.discover || []), ...(artifacts.define || []), ...(artifacts.design || [])];
    if (idx > 0) return artifacts[stages[idx - 1]] || [];
    return [];
  };

  const handleMoveToNextStage = async (nextStage) => {
    setCurrentStage(nextStage);
    setViewingStage(nextStage);
    setActiveTab('workspace');
    setStageData(prev => {
      const newData = { ...prev };
      newData[currentStage] = { ...newData[currentStage], status: 'passed' };
      newData[nextStage] = { ...newData[nextStage], status: 'active' };
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg">
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stagegate':
        return <StageGatePanel stage={viewingStage} onClose={() => setActiveTab('workspace')} onMoveNext={handleMoveToNextStage} />;
      case 'history':
        return <div className="flex-1 overflow-y-auto bg-gray-50"><HistoryTab commits={commitHistory} /></div>;
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Sidebar or DevelopStagePanel */}
            {viewingStage === 'develop' ? (
              <div className="w-80 border-r border-gray-200 flex-shrink-0 bg-white">
                <DevelopStagePanel
                  projectId={projectId}
                  ticketsData={developTickets}
                  selectedTicket={selectedTicket}
                  onTicketSelect={handleTicketSelect}
                  githubConfig={gitHubConfig}
                  onGitHubConfigChange={setGitHubConfig}
                  onOpenGitHubModal={() => setShowGitHubModal(true)}
                />
              </div>
            ) : viewingStage === 'test' ? (
              <div className="w-80 border-r border-gray-200 flex-shrink-0 bg-white">
                <TestStagePanel
                  projectId={projectId}
                  onRefresh={loadProjectData}
                />
              </div>
            ) : (
              <Sidebar 
                projectFiles={getProjectFiles()} 
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                viewingStage={viewingStage}
                currentStage={currentStage}
              />
            )}
            
            {/* Middle: Editor Panel */}
            <EditorPanel 
              file={selectedFile}
              content={fileContent}
              onContentChange={setFileContent}
            />
            
            {/* Right: AI Specialist - pass GitHub config as prop */}
            <AISpecialist 
              stage={viewingStage}
              projectId={projectId}
              projectName={project?.name}
              previousStageArtifacts={getPreviousStageArtifacts()}
              existingArtifacts={artifacts[viewingStage] || []}
              onGenerationComplete={handleGenerationComplete}
              api={api}
              isStageAccessible={isStageAccessible(viewingStage)}
              githubConfig={gitHubConfig}
              onOpenGitHubModal={() => setShowGitHubModal(true)}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header projectName={project?.name || 'Loading...'} />
      <StageIndicator 
        currentStage={currentStage} 
        viewingStage={viewingStage}
        stageData={stageData}
        onStageClick={handleStageClick}
      />
      <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
      <TeamChat messages={chatMessages} onSendMessage={handleSendMessage} />
      
      {showGitHubModal && (
        <GitHubConfigModal
          isOpen={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
          onSuccess={handleGitHubConfigSuccess}
          projectId={projectId}
          api={api}
        />
      )}
    </div>
  );
};

export default WorkspaceView;