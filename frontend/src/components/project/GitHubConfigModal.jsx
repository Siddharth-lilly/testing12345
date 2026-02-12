// src/components/workspace/GitHubConfigModal.jsx
import React, { useState } from 'react';
import { 
  X, Github, Key, FolderGit2, Loader2, 
  CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff 
} from 'lucide-react';

const GitHubConfigModal = ({ isOpen, onClose, onSuccess, projectId, api }) => {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToken, setShowToken] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!token.trim()) {
        throw new Error('GitHub token is required');
      }
      if (!repo.trim()) {
        throw new Error('Repository is required');
      }
      if (!repo.includes('/') || repo.split('/').length !== 2) {
        throw new Error('Repository must be in format "owner/repo"');
      }

      // Call API to save config
      const response = await api.saveGitHubConfig(projectId, {
        github_token: token.trim(),
        github_repo: repo.trim()
      });

      if (response.status === 'success') {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      console.error('GitHub config error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to configure GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Connect GitHub Repository</h2>
              <p className="text-sm text-gray-500">Required for the Develop stage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Connect a GitHub repository to enable code generation. The AI will create branches, 
              commit code, and open pull requests automatically.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Configuration Failed</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Token Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Personal Access Token
              </div>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 font-mono text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Need a token?{' '}
              <a 
                href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=SDLC%20Studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Create one here <ExternalLink className="w-3 h-3" />
              </a>
              {' '}(requires <code className="bg-gray-100 px-1 rounded">repo</code> scope)
            </p>
          </div>

          {/* Repo Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4" />
                Repository
              </div>
            </label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="owner/repository"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              disabled={isLoading}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              The repository where code will be generated (e.g., <code className="bg-gray-100 px-1 rounded">myorg/myproject</code>)
            </p>
          </div>

          {/* Required Permissions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">Required Token Permissions</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                <span><strong>repo</strong> - Full control of private repositories</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                <span><strong>workflow</strong> - Update GitHub Action workflows (optional)</span>
              </li>
            </ul>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !token || !repo}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                Connect Repository
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubConfigModal;