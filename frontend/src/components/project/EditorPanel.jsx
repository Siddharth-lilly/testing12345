// src/components/workspace/EditorPanel.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, FileText, Save, Check, Copy, Download, RefreshCw, 
  Eye, Edit3, CheckCircle, AlertCircle, X, Loader2, Sparkles
} from 'lucide-react';
import api from '../../services/api';

// Separate Modal Component to prevent re-renders from parent
const RegenerateModal = React.memo(({ 
  isOpen, 
  fileName, 
  onClose, 
  onSubmit, 
  isRegenerating, 
  error 
}) => {
  const [feedback, setFeedback] = useState('');
  const textareaRef = useRef(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Reset feedback when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFeedback('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(feedback);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Regenerate Document</h3>
              <p className="text-sm text-white/80">{fileName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to change or improve?
          </label>
          <textarea
            ref={textareaRef}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`Examples:
• Add a legal requirements section
• Include more detailed acceptance criteria
• Add security requirements for HIPAA compliance
• Expand the stakeholder analysis with IT Operations team
• Add performance requirements (response time < 200ms)`}
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
            disabled={isRegenerating}
          />
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Tip:</strong> The AI will use all your previous chat conversations 
              as context when regenerating. Be specific about what sections or details you want 
              to add or change.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isRegenerating}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRegenerating || !feedback.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              isRegenerating || !feedback.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

RegenerateModal.displayName = 'RegenerateModal';

const EditorPanel = ({ file, content, onContentChange, onRegenerate, onApprove, onArtifactUpdated }) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  // Regeneration modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState(null);

  useEffect(() => {
    if (file) {
      setIsEditing(false);
      setIsApproved(file.artifactData?.meta_data?.approved || false);
    }
  }, [file?.id]);

  const handleSave = () => {
    if (!file || !content) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }, 500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApprove = () => {
    setIsApproved(true);
    if (onApprove) onApprove(file);
  };

  const handleRegenerateClick = () => {
    setRegenerateError(null);
    setShowRegenerateModal(true);
  };

  const handleCloseModal = useCallback(() => {
    setShowRegenerateModal(false);
    setRegenerateError(null);
  }, []);

  const handleRegenerateSubmit = useCallback(async (feedback) => {
    if (!feedback.trim()) {
      setRegenerateError('Please provide feedback for regeneration');
      return;
    }

    const artifactId = file?.artifactData?.artifact_id || file?.artifactData?.id || file?.id;
    if (!artifactId) {
      setRegenerateError('Cannot regenerate: No artifact ID found');
      return;
    }

    setIsRegenerating(true);
    setRegenerateError(null);

    try {
      console.log('🔄 Regenerating artifact:', artifactId);
      console.log('📝 Feedback:', feedback);
      
      const result = await api.regenerateArtifact(artifactId, feedback);
      
      console.log('✅ Regeneration complete:', result);
      
      // Close modal
      setShowRegenerateModal(false);
      
      // Update the content with new version
      if (result.content && onContentChange) {
        onContentChange(result.content);
      }
      
      // Notify parent to refresh artifacts list
      if (onArtifactUpdated) {
        onArtifactUpdated(result);
      }
      
      // Also call the old onRegenerate if provided
      if (onRegenerate) {
        onRegenerate(result);
      }
      
    } catch (err) {
      console.error('❌ Regeneration failed:', err);
      setRegenerateError(err.message || 'Failed to regenerate artifact');
    } finally {
      setIsRegenerating(false);
    }
  }, [file, onContentChange, onArtifactUpdated, onRegenerate]);

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  // Empty state
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No File Selected</h3>
          <p className="text-sm text-gray-500">
            Select a file from the sidebar to view its contents, or generate new artifacts using the stage panel above.
          </p>
        </div>
      </div>
    );
  }

  // Render markdown content
  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full h-full font-mono text-sm p-6 border-0 focus:outline-none focus:ring-0 resize-none bg-white"
          placeholder="Start typing..."
        />
      );
    }

    return (
      <div className="prose prose-sm max-w-none p-6">
        <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
          {content.split('\n').map((line, index) => {
            if (line.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-6">{line.replace('# ', '')}</h1>;
            }
            if (line.includes('**')) {
              const parts = line.split(/\*\*(.*?)\*\*/g);
              return (
                <p key={index} className="mb-2">
                  {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part)}
                </p>
              );
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return <li key={index} className="ml-4 mb-1 text-gray-700">{line.substring(2)}</li>;
            }
            if (line.match(/^\d+\. /)) {
              return <li key={index} className="ml-4 mb-1 list-decimal text-gray-700">{line.replace(/^\d+\. /, '')}</li>;
            }
            if (line.startsWith('- [ ]')) {
              return (
                <div key={index} className="flex items-center gap-2 mb-1 ml-4">
                  <input type="checkbox" disabled className="rounded border-gray-300" />
                  <span className="text-gray-700">{line.replace('- [ ] ', '')}</span>
                </div>
              );
            }
            if (line.startsWith('- [x]')) {
              return (
                <div key={index} className="flex items-center gap-2 mb-1 ml-4">
                  <input type="checkbox" checked disabled className="rounded border-gray-300" />
                  <span className="line-through text-gray-400">{line.replace('- [x] ', '')}</span>
                </div>
              );
            }
            if (line.startsWith('|')) {
              return <code key={index} className="block text-sm bg-gray-50 px-2 py-1 rounded">{line}</code>;
            }
            if (line === '---') {
              return <hr key={index} className="my-6 border-gray-200" />;
            }
            if (line.trim() === '') {
              return <div key={index} className="h-3" />;
            }
            return <p key={index} className="mb-2 text-gray-700">{line}</p>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-gray-200 min-w-0">
      {/* Regenerate Modal - Separate component with its own state */}
      <RegenerateModal
        isOpen={showRegenerateModal}
        fileName={file?.name}
        onClose={handleCloseModal}
        onSubmit={handleRegenerateSubmit}
        isRegenerating={isRegenerating}
        error={regenerateError}
      />

      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <h2 className="text-base font-semibold text-gray-900 truncate">{file.name}</h2>
          {file.artifactData?.version > 1 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex-shrink-0">
              v{file.artifactData.version}
            </span>
          )}
          {isApproved && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
              <CheckCircle className="w-3 h-3" />
              Approved
            </span>
          )}
          {showSaveSuccess && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full animate-fade-in flex-shrink-0">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* View/Edit Toggle */}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition ${isEditing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
            title={isEditing ? 'View mode' : 'Edit mode'}
          >
            {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>

          {/* Copy */}
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download */}
          <button 
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Save (only in edit mode) */}
          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}

          {/* Regenerate - Always visible for artifacts */}
          <button 
            onClick={handleRegenerateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-medium"
            title="Regenerate with feedback"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>

          {/* Approve */}
          {!isApproved && (
            <button 
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 flex items-center justify-between bg-gray-50 flex-shrink-0">
        <span className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>
            {file.lastEditedBy && `By: ${file.lastEditedBy}`}
            {file.lastEditedTime && ` • ${file.lastEditedTime}`}
          </span>
        </span>
        <span className="flex items-center gap-3 text-gray-400">
          <span>{isEditing ? 'Edit mode' : 'View mode'}</span>
          <span>•</span>
          <span>{formatLastSaved()}</span>
        </span>
      </div>
    </div>
  );
};

export default EditorPanel;