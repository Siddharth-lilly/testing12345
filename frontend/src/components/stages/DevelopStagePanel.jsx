// src/components/stages/DevelopStagePanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  Github, Settings, Loader2, AlertCircle, CheckCircle,
  RefreshCw, ExternalLink, X, Ticket
} from 'lucide-react';
import TicketList from '../project/TicketList';
import api from '../../services/api';

const DevelopStagePanel = ({ 
  projectId, 
  onTicketSelect,
  selectedTicket,
  ticketsData,
  onRefreshTickets,
  // NEW: GitHub config from parent (single source of truth)
  githubConfig,
  onGitHubConfigChange,
  onOpenGitHubModal
}) => {
  const [tickets, setTickets] = useState(ticketsData?.tickets || []);
  const [summary, setSummary] = useState(ticketsData?.summary || {});
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementingKey, setImplementingKey] = useState(null);

  // Derive configured status from prop
  const isConfigured = githubConfig?.is_configured || false;

  useEffect(() => {
    loadTickets();
  }, [projectId]);

  useEffect(() => {
    if (ticketsData) {
      setTickets(ticketsData.tickets || []);
      setSummary(ticketsData.summary || {});
    }
  }, [ticketsData]);

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const result = await api.getDevelopTickets(projectId);
      if (result.status === 'success') {
        setTickets(result.tickets || []);
        setSummary(result.summary || {});
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleImplementTicket = async (ticket) => {
    setIsImplementing(true);
    setImplementingKey(ticket.key);
    
    try {
      // Call the full implementation endpoint
      const result = await api.implementTicket(projectId, ticket.key, 'user');
      
      console.log('Implementation complete:', result);
      
      // Update local state with implementation details
      setTickets(prev => prev.map(t => 
        t.key === ticket.key ? { 
          ...t, 
          status: 'in_progress',
          implementation: {
            branch: result.branch_name,
            issue_number: result.issue_number,
            issue_url: result.issue_url,
            pr_number: result.pr_number,
            pr_url: result.pr_url,
            commit_sha: result.commit_sha,
            files: result.files_created
          }
        } : t
      ));

      // Notify parent
      if (onTicketSelect) {
        onTicketSelect({
          ...ticket,
          status: 'in_progress',
          implementation: result
        });
      }

      // Show success message
      alert(`Implementation created!\n\nPR #${result.pr_number}: ${result.pr_url}\n\nFiles created: ${result.files_created.length}`);
      
    } catch (err) {
      console.error('Implementation failed:', err);
      alert(`Implementation failed: ${err.message}`);
    } finally {
      setIsImplementing(false);
      setImplementingKey(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* GitHub Config Header - uses prop */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-900">GitHub Integration</span>
          </div>
          
          {isConfigured ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {githubConfig.github_repo}
              </span>
              <button
                onClick={() => onOpenGitHubModal && onOpenGitHubModal()}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="Change settings"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenGitHubModal && onOpenGitHubModal()}
              className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              Connect GitHub
            </button>
          )}
        </div>
      </div>

      {/* Tickets Section */}
      {!isConfigured ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Github className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect GitHub to Continue
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">
              Link a GitHub repository to generate development tickets and start implementing features.
            </p>
            <button
              onClick={() => onOpenGitHubModal && onOpenGitHubModal()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 mx-auto"
            >
              <Github className="w-4 h-4" />
              Connect Repository
            </button>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Tickets Yet
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">
              Click "Generate Tickets" in the AI panel to create development tickets from your project artifacts.
            </p>
            {isLoadingTickets && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading tickets...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <TicketList
            tickets={tickets}
            summary={summary}
            onImplement={(ticket) => {
              console.log('DevelopStagePanel: onImplement called', ticket.key);
              handleImplementTicket(ticket);
            }}
            isImplementing={isImplementing}
            implementingKey={implementingKey}
            selectedTicket={selectedTicket}
          />
        </div>
      )}

      {/* Refresh Button */}
      {isConfigured && tickets.length > 0 && (
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <button
            onClick={loadTickets}
            disabled={isLoadingTickets}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTickets ? 'animate-spin' : ''}`} />
            Refresh Tickets
          </button>
        </div>
      )}
    </div>
  );
};

export default DevelopStagePanel;