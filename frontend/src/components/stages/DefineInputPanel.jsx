// src/components/workspace/DefineInputPanel.jsx
import React from 'react';
import { 
  FileText, Send, Loader2, CheckCircle2, AlertCircle, 
  BookOpen, ListTodo, ChevronRight, RefreshCw, Lock
} from 'lucide-react';

const GENERATION_STEPS = [
  { id: 'init', label: 'Loading Discover artifacts...', icon: FileText },
  { id: 'brd', label: 'Generating Business Requirements Document...', icon: BookOpen },
  { id: 'stories', label: 'Creating User Stories...', icon: ListTodo },
  { id: 'complete', label: 'Define Stage Complete!', icon: CheckCircle2 },
];

const DefineInputPanel = ({ 
  projectId,
  projectName,
  discoverArtifacts,
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
  const hasDiscoverArtifacts = discoverArtifacts && discoverArtifacts.length >= 2;
  const hasExistingArtifacts = existingArtifacts && existingArtifacts.length > 0;

  const problemStatement = discoverArtifacts?.find(a => 
    a.name?.includes('Problem Statement') || a.meta_data?.artifact_subtype === 'problem_statement'
  );
  const stakeholderAnalysis = discoverArtifacts?.find(a => 
    a.name?.includes('Stakeholder') || a.meta_data?.artifact_subtype === 'stakeholder_analysis'
  );

  const handleGenerate = async () => {
    if (!hasDiscoverArtifacts || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGenerationStep(0);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationStep(1);

      const result = await api.generateDefine(
        projectId,
        problemStatement.artifact_id,
        stakeholderAnalysis.artifact_id,
        'demo_user'
      );
      
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

  // Locked state - Discover not complete
  if (!hasDiscoverArtifacts) {
    return (
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600">Define Stage Locked</h3>
            <p className="text-xs text-gray-500">Complete Discover stage first</p>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (hasExistingArtifacts && !isGenerating) {
    return (
      <div className="p-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Define Complete</h3>
              <p className="text-xs text-green-600">BRD & User Stories generated</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
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
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Define Agent</h3>
            <p className="text-xs text-gray-500">Generate BRD & User Stories</p>
          </div>
        </div>

        {/* Source Artifacts */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Problem Statement</span>
              <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />
            </div>
            <p className="text-[10px] text-gray-500 truncate">{problemStatement?.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Stakeholder Analysis</span>
              <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />
            </div>
            <p className="text-[10px] text-gray-500 truncate">{stakeholderAnalysis?.name}</p>
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
                      isComplete ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      isComplete ? 'text-green-700' : isActive ? 'text-blue-700 font-medium' : 'text-gray-500'
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

        {/* Generate Button */}
        {!isGenerating && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-500">
              AI will create BRD & User Stories from Discover outputs
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              Generate
            </button>
          </div>
        )}
      </div>

      {/* Stage Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Stage 2 of 7: Define</span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Next: Design</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default DefineInputPanel;