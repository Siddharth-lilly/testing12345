// src/components/workspace/TicketList.jsx - FIXED
import React, { useState } from 'react';
import { 
  Code, Server, Database, Globe, Settings, 
  Clock, ChevronDown, ChevronRight, CheckCircle2,
  Circle, Play, AlertCircle, Layers, ExternalLink,
  GitBranch, GitPullRequest, FileCode, Loader2
} from 'lucide-react';

const typeIcons = {
  backend: Server,
  frontend: Code,
  database: Database,
  integration: Globe,
  infrastructure: Settings,
};

const priorityColors = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
};

const statusConfig = {
  todo: { icon: Circle, color: 'text-gray-400', label: 'To Do', bg: 'bg-gray-100' },
  in_progress: { icon: Play, color: 'text-blue-500', label: 'In Progress', bg: 'bg-blue-100' },
  done: { icon: CheckCircle2, color: 'text-green-500', label: 'Done', bg: 'bg-green-100' },
};

const TicketCard = ({ ticket, isSelected, onImplement, isImplementing, implementingKey }) => {
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = typeIcons[ticket.type] || Code;
  
  // FIX: Default to 'todo' if status is undefined
  const currentStatus = ticket.status || 'todo';
  const status = statusConfig[currentStatus];
  const StatusIcon = status.icon;
  
  const isThisImplementing = implementingKey === ticket.key;
  const hasImplementation = ticket.implementation;
  
  // FIX: Use currentStatus instead of ticket.status
  const canImplement = currentStatus === 'todo' && !isImplementing;

  const handleImplementClick = (e) => {
    e.stopPropagation();
    console.log('Implement button clicked:', { 
      ticketKey: ticket.key, 
      canImplement, 
      currentStatus,
      isImplementing,
      hasOnImplement: !!onImplement 
    });
    
    if (canImplement && onImplement) {
      onImplement(ticket);
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 transition-all ${
      isSelected ? 'border-blue-500 shadow-md' : 
      isThisImplementing ? 'border-purple-500 shadow-lg animate-pulse' :
      'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            ticket.type === 'frontend' ? 'bg-purple-100 text-purple-600' :
            ticket.type === 'backend' ? 'bg-blue-100 text-blue-600' :
            ticket.type === 'database' ? 'bg-green-100 text-green-600' :
            ticket.type === 'integration' ? 'bg-orange-100 text-orange-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <TypeIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-gray-500">{ticket.key}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded border ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{ticket.summary}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {ticket.estimated_hours}h
              </span>
              <span className="capitalize">{ticket.type}</span>
              {hasImplementation && (
                <span className="flex items-center gap-1 text-green-600">
                  <GitPullRequest className="w-3 h-3" />
                  PR #{ticket.implementation.pr_number}
                </span>
              )}
            </div>
          </div>

          <button className="p-1 hover:bg-gray-100 rounded" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-3">
          <p className="text-sm text-gray-600">{ticket.description}</p>

          {/* Acceptance Criteria */}
          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Acceptance Criteria</h5>
            <ul className="space-y-1">
              {ticket.acceptance_criteria?.map((ac, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-500 mt-0.5">•</span>
                  {ac}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1">
            {ticket.tech_stack?.map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tech}
              </span>
            ))}
          </div>

          {/* Dependencies */}
          {ticket.dependencies?.length > 0 && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Depends on:</span> {ticket.dependencies.join(', ')}
            </div>
          )}

          {/* Implementation Info */}
          {hasImplementation && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <h5 className="text-xs font-semibold text-green-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Implementation Created
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href={ticket.implementation.issue_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  <AlertCircle className="w-3 h-3" />
                  Issue #{ticket.implementation.issue_number}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href={ticket.implementation.pr_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  <GitPullRequest className="w-3 h-3" />
                  PR #{ticket.implementation.pr_number}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Branch:</span> 
                <code className="ml-1 px-1 bg-gray-100 rounded text-xs">{ticket.implementation.branch}</code>
              </div>
              {ticket.implementation.files?.length > 0 && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Files ({ticket.implementation.files.length}):</span>
                  <ul className="mt-1 space-y-0.5">
                    {ticket.implementation.files.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-gray-400" />
                        <code className="text-xs truncate">{f}</code>
                      </li>
                    ))}
                    {ticket.implementation.files.length > 3 && (
                      <li className="text-gray-400 text-xs">...and {ticket.implementation.files.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleImplementClick}
            disabled={!canImplement || isThisImplementing}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isThisImplementing 
                ? 'bg-purple-600 text-white cursor-wait' :
              hasImplementation
                ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' :
              canImplement 
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer shadow-sm hover:shadow' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isThisImplementing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Implementing... This may take a minute
              </>
            ) : hasImplementation ? (
              <>
                <ExternalLink className="w-4 h-4" />
                View PR #{ticket.implementation.pr_number}
              </>
            ) : currentStatus === 'in_progress' ? (
              <>
                <Play className="w-4 h-4" />
                In Progress
              </>
            ) : (
              <>
                <Code className="w-4 h-4" />
                Implement This Ticket
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const TicketList = ({ 
  tickets = [], 
  summary = {}, 
  onImplement, 
  isImplementing = false,
  implementingKey = null,
  selectedTicket = null
}) => {
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTickets = tickets.filter(t => {
    const ticketStatus = t.status || 'todo';
    const statusMatch = filter === 'all' || ticketStatus === filter;
    const typeMatch = typeFilter === 'all' || t.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const todoCount = tickets.filter(t => !t.status || t.status === 'todo').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const doneCount = tickets.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col h-full">
      {/* Summary Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Development Tickets
          </h3>
          <span className="text-xs text-gray-500">{summary.total_estimated_hours || 0}h total</span>
        </div>
        
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-2 py-1 rounded text-xs font-medium transition ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}>
            All ({tickets.length})
          </button>
          <button onClick={() => setFilter('todo')} className={`px-2 py-1 rounded text-xs font-medium transition ${filter === 'todo' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}>
            To Do ({todoCount})
          </button>
          <button onClick={() => setFilter('in_progress')} className={`px-2 py-1 rounded text-xs font-medium transition ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
            In Progress ({inProgressCount})
          </button>
          <button onClick={() => setFilter('done')} className={`px-2 py-1 rounded text-xs font-medium transition ${filter === 'done' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            Done ({doneCount})
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="px-3 py-2 border-b border-gray-100 flex gap-1 overflow-x-auto">
        {['all', 'frontend', 'backend', 'database', 'integration', 'infrastructure'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-2 py-0.5 rounded text-xs whitespace-nowrap transition ${
              typeFilter === type ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tickets match the filter</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.key}
              ticket={ticket}
              isSelected={selectedTicket?.key === ticket.key}
              onImplement={onImplement}
              isImplementing={isImplementing}
              implementingKey={implementingKey}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;