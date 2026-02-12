// src/components/workspace/DiscoverInputPanel.jsx
import React, { useState } from 'react';
import { 
  Sparkles, Send, Loader2, CheckCircle2, AlertCircle, 
  FileText, Users, ChevronRight, RefreshCw
} from 'lucide-react';

const GENERATION_STEPS = [
  { id: 'init', label: 'Initializing AI Agent...', icon: Sparkles },
  { id: 'problem', label: 'Generating Problem Statement...', icon: FileText },
  { id: 'stakeholder', label: 'Analyzing Stakeholders...', icon: Users },
  { id: 'complete', label: 'Generation Complete!', icon: CheckCircle2 },
];

const DiscoverInputPanel = ({ 
  projectId, 
  projectName,
  onGenerationComplete, 
  existingArtifacts,
  isGenerating,
  setIsGenerating,
  generationStep,
  setGenerationStep,
  error,
  setError,
  api
}) => {
  const [userIdea, setUserIdea] = useState('');
  const hasExistingArtifacts = existingArtifacts && existingArtifacts.length > 0;

  const handleGenerate = async () => {
    if (!userIdea.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGenerationStep(0);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationStep(1);

      const result = await api.generateDiscover(projectId, userIdea, 'demo_user');
      
      setGenerationStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationStep(3);
      
      if (onGenerationComplete) onGenerationComplete(result);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
  };

  // Show completion state
  if (hasExistingArtifacts && !isGenerating) {
    return (
      <div className="p-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Discover Complete</h3>
              <p className="text-xs text-green-600">Problem Statement & Stakeholder Analysis generated</p>
            </div>
          </div>
          <button
            onClick={() => setUserIdea('')}
            className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1 px-2 py-1 hover:bg-green-100 rounded transition"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Discover Agent</h3>
            <p className="text-xs text-gray-500">Describe your project idea</p>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3">
              {GENERATION_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === generationStep;
                const isComplete = index < generationStep;
                const isPending = index > generationStep;

                return (
                  <div key={step.id} className={`flex items-center gap-3 ${isPending ? 'opacity-40' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-100' : isActive ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      isComplete ? 'text-green-700' : isActive ? 'text-purple-700 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-lilly-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">Generation Failed</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        {!isGenerating && (
          <>
            <div className="relative">
              <textarea
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Describe your project idea for "${projectName}"...\n\nExample: "Build a legal request intake system that allows employees to submit legal requests, track their status, and enables the legal team to manage and prioritize incoming requests efficiently."`}
                rows={4}
                className="input resize-none text-sm"
                disabled={isGenerating}
              />
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                Ctrl + Enter
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-gray-500">
                AI will generate Problem Statement & Stakeholder Analysis
              </p>
              <button
                onClick={handleGenerate}
                disabled={!userIdea.trim() || isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  userIdea.trim() && !isGenerating
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Generate
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stage Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Stage 1 of 7: Discover</span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Next: Define</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default DiscoverInputPanel;