// src/components/workspace/HistoryTab.jsx
import React, { useState } from 'react';
import { GitCommit, Clock, FileText, ChevronRight, RotateCcw, Eye, GitCompare, Filter, Search, ChevronDown } from 'lucide-react';

const stageColors = {
  discover: 'bg-purple-100 text-purple-700',
  define: 'bg-blue-100 text-blue-700',
  design: 'bg-amber-100 text-amber-700',
  develop: 'bg-emerald-100 text-emerald-700',
  build: 'bg-cyan-100 text-cyan-700',
  testing: 'bg-yellow-100 text-yellow-700',
  deploy: 'bg-pink-100 text-pink-700'
};

const CommitCard = ({ commit, onViewDiff, onPreview, onRollback }) => {
  const [expanded, setExpanded] = useState(false);
  const stage = commit.stage || 'discover';
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <GitCommit className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">{commit.message}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-medium">
                      {(commit.author || 'A')[0].toUpperCase()}
                    </div>
                    {commit.author || 'AI Agent'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {commit.timestamp || commit.created_at || 'Recently'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${stageColors[stage]}`}>
                    {stage}
                  </span>
                </div>
              </div>
              <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {(commit.id || commit.commit_id || '').slice(0, 7)}
              </code>
            </div>
            
            {/* Artifacts */}
            {commit.artifacts && commit.artifacts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {commit.artifacts.map((artifact, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-sm border border-gray-200">
                    <FileText className="w-3 h-3 text-gray-500" />
                    {artifact.name}
                    <span className="text-green-600 text-xs font-medium">{artifact.changes}</span>
                  </span>
                ))}
              </div>
            )}
            
            {/* Expandable details */}
            {commit.description && (
              <>
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                  {expanded ? 'Hide details' : 'Show details'}
                </button>
                {expanded && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    {commit.description}
                  </div>
                )}
              </>
            )}
            
            {/* Actions */}
            <div className="mt-3 flex items-center gap-4">
              <button onClick={() => onViewDiff?.(commit)} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <GitCompare className="w-4 h-4" /> View Changes
              </button>
              <button onClick={() => onPreview?.(commit)} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button onClick={() => onRollback?.(commit)} className="text-sm text-[#E11932] hover:text-[#C81530] flex items-center gap-1">
                <RotateCcw className="w-4 h-4" /> Rollback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryTab = ({ commits = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const defaultCommits = [
    { id: 'c8f2a1b', message: 'Updated architecture diagram with async queue pattern', author: 'Priya', timestamp: '2 hours ago', stage: 'design', artifacts: [{ name: 'Architecture Diagram', changes: '+15 -3' }, { name: 'Solution Design Document', changes: '+42 -8' }] },
    { id: 'b7e3d2c', message: 'Completed security review section in SDD', author: 'Siva', timestamp: '5 hours ago', stage: 'design', artifacts: [{ name: 'Solution Design Document', changes: '+28 -2' }] },
    { id: 'f5b2a1d', message: 'Finalized Business Requirements Document', author: 'Raj', timestamp: '2 days ago', stage: 'define', artifacts: [{ name: 'Business Requirements Document', changes: '+124 -15' }] },
    { id: 'e4c1b0f', message: 'Generated Problem Statement and Stakeholder Analysis', author: 'AI Agent', timestamp: '5 days ago', stage: 'discover', artifacts: [{ name: 'Problem Statement', changes: '+new' }, { name: 'Stakeholder Analysis', changes: '+new' }] }
  ];

  const data = commits.length > 0 ? commits : defaultCommits;
  const stages = ['all', ...new Set(data.map(c => c.stage))];
  
  const filteredCommits = data.filter(commit => {
    const matchesSearch = commit.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         commit.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || commit.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GitCommit className="w-6 h-6" />
            Version History
          </h2>
          <p className="text-sm text-gray-500 mt-1">{data.length} commits in this project</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search commits by message or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E11932] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E11932]"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>
                  {stage === 'all' ? 'All Stages' : stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Commits List */}
      <div className="space-y-4">
        {filteredCommits.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <GitCommit className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No commits found matching your filters</p>
          </div>
        ) : (
          filteredCommits.map((commit) => (
            <CommitCard
              key={commit.id || commit.commit_id}
              commit={commit}
              onViewDiff={(c) => alert(`View changes for ${c.id}`)}
              onPreview={(c) => alert(`Preview ${c.id}`)}
              onRollback={(c) => confirm(`Rollback to ${c.id}?`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryTab;