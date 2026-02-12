// src/components/workspace/AISpecialist.jsx - Complete with Develop Stage
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ChevronLeft, ChevronRight, Send, Loader2, 
  AlertCircle, Lock, X, Settings, Trash2,
  ChevronDown, ChevronUp, Github, CheckCircle,
  Search, FileText, Building2, Code, FlaskConical, 
  Cog, Rocket
} from 'lucide-react';
import ArchitectureOptionsModal from '../stages/ArchitectureOptions';
import api from '../../services/api';

// Use Lucide icons instead of emojis for reliability
const specialistConfig = {
  discover: {
    name: 'Business Analyst',
    icon: Search,
    iconColor: 'text-blue-600',
    shortDesc: 'Explore & document your idea',
    placeholder: 'Ask about your project...',
    actionLabel: 'Generate Analysis',
    welcomeMessage: "Hi! Tell me about your project idea and I'll help you explore it."
  },
  define: {
    name: 'Technical Writer',
    icon: FileText,
    iconColor: 'text-green-600',
    shortDesc: 'Define requirements',
    placeholder: 'Discuss requirements...',
    actionLabel: 'Generate BRD & Stories',
    welcomeMessage: "Let's refine your requirements. What features are most important?"
  },
  design: {
    name: 'Solution Architect',
    icon: Building2,
    iconColor: 'text-purple-600',
    shortDesc: 'Design architecture',
    placeholder: 'Discuss architecture...',
    actionLabel: 'Generate Options',
    welcomeMessage: "I'll help you think through the technical architecture. Any constraints?"
  },
  develop: {
    name: 'Senior Developer',
    icon: Code,
    iconColor: 'text-orange-600',
    shortDesc: 'Plan implementation',
    placeholder: 'Ask about implementation...',
    actionLabel: 'Generate Tickets',
    welcomeMessage: "Ready to create implementation tickets. Let's break down the work!"
  },
  test: {
    name: 'QA Lead',
    icon: FlaskConical,
    iconColor: 'text-teal-600',
    shortDesc: 'Plan testing',
    placeholder: 'Discuss testing...',
    actionLabel: 'Generate Tests',
    welcomeMessage: "Let's plan your testing strategy. What's your coverage goal?"
  },
  build: {
    name: 'DevOps Engineer',
    icon: Cog,
    iconColor: 'text-gray-600',
    shortDesc: 'Setup CI/CD',
    placeholder: 'Discuss deployment...',
    actionLabel: 'Generate Pipeline',
    welcomeMessage: "I'll help set up your pipeline. What's your target environment?"
  },
  deploy: {
    name: 'Release Manager',
    icon: Rocket,
    iconColor: 'text-red-600',
    shortDesc: 'Plan release',
    placeholder: 'Discuss release...',
    actionLabel: 'Plan Release',
    welcomeMessage: "Let's plan your release. What's your timeline?"
  }
};

const AISpecialist = ({ 
  stage = 'discover', 
  projectId,
  previousStageArtifacts = [],
  onGenerationComplete,
  isStageAccessible = true,
  // NEW: GitHub config passed from parent (single source of truth)
  githubConfig = null,
  onOpenGitHubModal
}) => {
  const config = specialistConfig[stage] || specialistConfig.discover;
  const IconComponent = config.icon;
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Panel state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);
  
  // Design stage specific
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [architectureOptions, setArchitectureOptions] = useState(null);
  const [constraints, setConstraints] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSelectingArchitecture, setIsSelectingArchitecture] = useState(false);

  // Derive GitHub configured status from prop
  const githubConfigured = githubConfig?.is_configured || false;

  useEffect(() => {
    if (projectId && stage) {
      loadChatHistory();
    }
    return () => {
      setChatMessages([]);
      setChatInput('');
      setError(null);
    };
  }, [projectId, stage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadChatHistory = async () => {
    setChatLoading(true);
    try {
      const response = await api.getChatHistory(projectId, stage);
      if (response.messages && response.messages.length > 0) {
        setChatMessages(response.messages);
      } else {
        setChatMessages([{
          id: 'welcome',
          role: 'assistant',
          content: config.welcomeMessage,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setChatMessages([{
        id: 'welcome',
        role: 'assistant',
        content: config.welcomeMessage,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending || !projectId) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setIsSending(true);
    setError(null);
    
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, tempUserMsg]);
    
    try {
      const response = await api.sendChatMessage(projectId, stage, userMessage);
      setChatMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, response.user_message, response.assistant_message];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      setChatMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear chat history?')) return;
    try {
      await api.clearChatHistory(projectId, stage);
      setChatMessages([{
        id: 'welcome',
        role: 'assistant',
        content: config.welcomeMessage,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const generationSteps = {
    discover: ['Analyzing...', 'Creating Problem Statement...', 'Generating Stakeholders...', 'Done!'],
    define: ['Reading artifacts...', 'Generating BRD...', 'Creating Stories...', 'Done!'],
    design: ['Gathering context...', 'Analyzing...', 'Generating options...', 'Creating diagrams...', 'Done!'],
    develop: ['Reading artifacts...', 'Analyzing architecture...', 'Creating tickets...', 'Organizing...', 'Done!']
  };

  const handleGenerate = async () => {
    if (!projectId) return;
    
    setIsGenerating(true);
    setError(null);
    setGenerationStep(0);

    try {
      if (stage === 'discover') {
        const conversationContext = chatMessages
          .filter(m => m.id !== 'welcome')
          .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n\n');
        
        const ideaFromChat = conversationContext || 'Project idea from conversation';
        
        const stepInterval = setInterval(() => {
          setGenerationStep(prev => Math.min(prev + 1, 3));
        }, 2000);

        const result = await api.generateDiscover(projectId, ideaFromChat, 'user');
        clearInterval(stepInterval);
        setGenerationStep(4);
        
        if (onGenerationComplete) onGenerationComplete(result);
        
        setChatMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: '✅ Done! Problem Statement and Stakeholder Analysis created. Check the editor panel.',
          created_at: new Date().toISOString()
        }]);
        
      } else if (stage === 'define') {
        const problemStatement = previousStageArtifacts.find(a => 
          a.name?.toLowerCase().includes('problem') || a.artifact_type === 'problem_statement'
        );
        const stakeholderAnalysis = previousStageArtifacts.find(a => 
          a.name?.toLowerCase().includes('stakeholder') || a.artifact_type === 'stakeholder_analysis'
        );

        if (!problemStatement || !stakeholderAnalysis) {
          throw new Error('Missing artifacts from Discover stage');
        }

        const stepInterval = setInterval(() => {
          setGenerationStep(prev => Math.min(prev + 1, 3));
        }, 3000);

        const result = await api.generateDefine(
          projectId,
          problemStatement.artifact_id || problemStatement.id,
          stakeholderAnalysis.artifact_id || stakeholderAnalysis.id,
          'user'
        );
        clearInterval(stepInterval);
        setGenerationStep(4);

        if (onGenerationComplete) onGenerationComplete(result);
        
        setChatMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: '✅ Done! BRD and User Stories created.',
          created_at: new Date().toISOString()
        }]);
        
      } else if (stage === 'design') {
        const stepInterval = setInterval(() => {
          setGenerationStep(prev => Math.min(prev + 1, 4));
        }, 3000);

        const result = await api.generateDesign(
          projectId,
          Object.keys(constraints).length > 0 ? constraints : null,
          uploadedFiles.length > 0 ? uploadedFiles : null,
          'user'
        );
        clearInterval(stepInterval);
        setGenerationStep(5);
        
        if (result.data && result.data.options) {
          setArchitectureOptions(result.data);
          setShowArchitectureModal(true);
        } else {
          throw new Error('Failed to generate architecture options');
        }

      } else if (stage === 'develop') {
        // Check GitHub is configured first - use prop
        if (!githubConfigured) {
          if (onOpenGitHubModal) {
            onOpenGitHubModal();
          }
          throw new Error('Please configure GitHub before generating tickets.');
        }

        const stepInterval = setInterval(() => {
          setGenerationStep(prev => Math.min(prev + 1, 4));
        }, 2500);

        const result = await api.generateDevelopTickets(projectId, 'user');
        clearInterval(stepInterval);
        setGenerationStep(5);

        console.log('Tickets generated:', result);

        if (onGenerationComplete) {
          onGenerationComplete({
            stage: 'develop',
            tickets: result.tickets,
            summary: result.summary,
            artifact_id: result.artifact_id
          });
        }
        
        const ticketCount = result.tickets?.length || 0;
        const totalHours = result.summary?.total_estimated_hours || 0;
        
        setChatMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: `✅ Generated ${ticketCount} development tickets!\n\n📊 Summary:\n• Total estimated: ${totalHours} hours\n• Frontend: ${result.summary?.by_type?.frontend || 0}\n• Backend: ${result.summary?.by_type?.backend || 0}\n• Database: ${result.summary?.by_type?.database || 0}\n\nSelect a ticket from the list to start implementing!`,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err.message || 'Generation failed');
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Error: ${err.message}`,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleArchitectureSelect = async (selectedOptionId, optionsData) => {
    setIsSelectingArchitecture(true);
    try {
      const result = await api.selectArchitecture(projectId, selectedOptionId, optionsData, 'user');
      
      setShowArchitectureModal(false);
      setArchitectureOptions(null);
      
      if (onGenerationComplete) {
        onGenerationComplete(result);
      }
      
      setChatMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: '✅ Architecture selected and documented! Check the editor panel.',
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Architecture selection failed:', err);
      setError(err.message);
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Failed to save architecture: ${err.message}`,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsSelectingArchitecture(false);
    }
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 px-2 bg-gray-50 border-l border-gray-200 w-12">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 mb-3"
          title={`Open ${config.name}`}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div 
          className="text-xs text-gray-500 font-medium tracking-wide flex flex-col items-center gap-2"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
          <span>{config.name}</span>
        </div>
      </div>
    );
  }

  // Locked state
  if (!isStageAccessible) {
    return (
      <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200 w-80">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 opacity-50 ${config.iconColor}`} />
            <span className="text-sm font-medium text-gray-400">{config.name}</span>
          </div>
          <button onClick={() => setIsCollapsed(true)} className="p-1 hover:bg-gray-200 rounded">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Complete previous stages</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-white border-l border-gray-200 w-80">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-white shadow-sm`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{config.name}</h3>
              <p className="text-xs text-gray-500">{config.shortDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
              title="Collapse"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GitHub Status for Develop Stage - uses prop */}
        {stage === 'develop' && (
          <div 
            className={`px-3 py-2 border-b flex items-center justify-between text-xs cursor-pointer ${
              githubConfigured ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
            }`}
            onClick={() => !githubConfigured && onOpenGitHubModal && onOpenGitHubModal()}
          >
            <div className="flex items-center gap-2">
              <Github className={`w-4 h-4 ${githubConfigured ? 'text-green-600' : 'text-amber-600'}`} />
              <span className={githubConfigured ? 'text-green-700' : 'text-amber-700'}>
                {githubConfigured 
                  ? `Connected: ${githubConfig?.github_repo || 'Repository'}`
                  : 'Click to configure GitHub'}
              </span>
            </div>
            {githubConfigured && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {chatLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-3 mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Design Constraints */}
        {stage === 'design' && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <Settings className="w-3 h-3" />
              Constraints
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showAdvanced && (
              <div className="mt-2 p-2 bg-gray-50 rounded space-y-2 text-xs">
                <select
                  value={constraints.cloud_provider || ''}
                  onChange={(e) => setConstraints({...constraints, cloud_provider: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Cloud: Any</option>
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="gcp">GCP</option>
                </select>
                <select
                  value={constraints.budget_range || ''}
                  onChange={(e) => setConstraints({...constraints, budget_range: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Budget: Any</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={config.placeholder}
              disabled={isSending || isGenerating}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isSending || isGenerating}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (stage === 'develop' && !githubConfigured)}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{generationSteps[stage]?.[generationStep] || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{config.actionLabel}</span>
              </>
            )}
          </button>
          
          {stage === 'develop' && !githubConfigured && (
            <p 
              className="text-xs text-amber-600 mt-2 text-center cursor-pointer hover:underline"
              onClick={() => onOpenGitHubModal && onOpenGitHubModal()}
            >
              Click here to configure GitHub first
            </p>
          )}
        </div>
      </div>

      {/* Architecture Modal */}
      <ArchitectureOptionsModal
        isOpen={showArchitectureModal}
        onClose={() => {
          setShowArchitectureModal(false);
          setArchitectureOptions(null);
        }}
        optionsData={architectureOptions}
        onConfirmSelection={handleArchitectureSelect}
        isSelecting={isSelectingArchitecture}
      />
    </>
  );
};

export default AISpecialist;