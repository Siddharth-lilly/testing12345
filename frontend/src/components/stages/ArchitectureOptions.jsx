// src/components/workspace/ArchitectureOptions.jsx - Clean, Full-Screen Modal Design
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, ChevronRight, ChevronDown, Clock, DollarSign, 
  Shield, TrendingUp, AlertTriangle, Database, Star, Layers,
  ArrowRight, CheckCircle2, Loader2, FileText, Code, Box, Zap, Server, Wrench
} from 'lucide-react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

// Mermaid Diagram Component
const MermaidDiagram = ({ chart, id }) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !containerRef.current) return;
      
      try {
        const cleanChart = chart.replace(/\\n/g, '\n').trim();
        const uniqueId = `mermaid-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram');
      }
    };
    renderDiagram();
  }, [chart, id]);

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
        <Code className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-container overflow-auto bg-gray-50 rounded-lg p-4 border border-gray-200"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

// Simple Badge Component
const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700'
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[variant]}`}>
      {children}
    </span>
  );
};

// Option Card - Compact for grid view
const OptionCard = ({ option, isRecommended, isSelected, onSelect, onViewDetails }) => {
  const getComplexityVariant = (c) => c === 'Low' ? 'success' : c === 'High' ? 'danger' : 'warning';

  return (
    <div 
      className={`
        relative bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md
        ${isSelected ? 'border-blue-500 shadow-md' : isRecommended ? 'border-blue-300' : 'border-gray-200'}
      `}
      onClick={() => onSelect(option.id)}
    >
      {isRecommended && (
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
          Recommended
        </div>
      )}

      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <h3 className="font-semibold text-gray-900 mt-1 mb-2 pr-6">{option.name}</h3>
      
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={getComplexityVariant(option.complexity)}>{option.complexity}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Cost</p>
          <p className="font-semibold text-gray-900">{option.monthly_cost}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Timeline</p>
          <p className="font-semibold text-gray-900">{option.mvp_timeline_weeks} weeks</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {option.tech_stack?.slice(0, 3).map((tech, idx) => (
          <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {tech}
          </span>
        ))}
        {option.tech_stack?.length > 3 && (
          <span className="px-1.5 py-0.5 text-gray-400 text-xs">+{option.tech_stack.length - 3}</span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onViewDetails(option); }}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        View Details →
      </button>
    </div>
  );
};

// Detail Modal - Full Screen
const OptionDetailModal = ({ option, isOpen, onClose, onSelect, isRecommended }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !option) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'database', label: 'Database' },
    { id: 'risks', label: 'Risks' },
    { id: 'timeline', label: 'Timeline' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{option.name}</h2>
            {isRecommended && (
              <Badge variant="info">Recommended</Badge>
            )}
            <Badge variant={option.complexity === 'Low' ? 'success' : option.complexity === 'High' ? 'danger' : 'warning'}>
              {option.complexity} Complexity
            </Badge>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-2 border-b border-gray-100 flex gap-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Monthly Cost', value: option.monthly_cost, icon: DollarSign },
                  { label: 'MVP Timeline', value: `${option.mvp_timeline_weeks} weeks`, icon: Clock },
                  { label: 'Scalability', value: option.scalability, icon: TrendingUp },
                  { label: 'Compliance', value: option.compliance_fit, icon: Shield }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <stat.icon className="w-4 h-4 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{option.detailed_description}</p>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {option.tech_stack?.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-green-700 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {option.strengths?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-amber-700 mb-3">Trade-offs</h3>
                  <ul className="space-y-2">
                    {option.tradeoffs?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Components */}
              {option.components?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Key Components</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {option.components.map((comp, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900 text-sm">{comp.name}</p>
                        <p className="text-xs text-blue-600 mb-1">{comp.technology}</p>
                        <p className="text-xs text-gray-500">{comp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">System Architecture</h3>
                <MermaidDiagram chart={option.architecture_diagram} id={`arch-${option.id}`} />
              </div>

              {option.deployment_diagram && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Deployment Architecture</h3>
                  <MermaidDiagram chart={option.deployment_diagram} id={`deploy-${option.id}`} />
                </div>
              )}

              {option.api_design && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">API Design</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Style: <span className="font-medium">{option.api_design.style}</span></p>
                    <p className="text-sm text-gray-500 mb-2">Key Endpoints:</p>
                    <div className="space-y-1">
                      {option.api_design.key_endpoints?.map((ep, idx) => (
                        <code key={idx} className="block text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                          {ep}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              {option.database_design && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Database Type</p>
                      <p className="font-semibold text-gray-900">{option.database_design.type}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Technology</p>
                      <p className="font-semibold text-gray-900">{option.database_design.technology}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Schema Overview</h3>
                    <p className="text-gray-600 text-sm">{option.database_design.schema_overview}</p>
                  </div>

                  {option.database_design.diagram && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Entity Relationship Diagram</h3>
                      <MermaidDiagram chart={option.database_design.diagram} id={`db-${option.id}`} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              {/* Security */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Security Considerations</h3>
                <ul className="space-y-2">
                  {option.security_considerations?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Assessment */}
              {option.risk_assessment?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Risk Assessment</h3>
                  <div className="space-y-3">
                    {option.risk_assessment.map((risk, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">{risk.risk}</span>
                          <Badge variant={risk.severity === 'High' ? 'danger' : risk.severity === 'Medium' ? 'warning' : 'success'}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          <span className="text-gray-700">Mitigation:</span> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600">Total MVP Timeline</p>
                <p className="text-2xl font-bold text-blue-700">{option.mvp_timeline_weeks} weeks</p>
              </div>

              {option.implementation_phases?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Implementation Phases</h3>
                  <div className="space-y-4">
                    {option.implementation_phases.map((phase, idx) => (
                      <div key={idx} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                        <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-blue-500" />
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                            <span className="text-sm text-blue-600">{phase.duration_weeks} weeks</span>
                          </div>
                          <ul className="space-y-1">
                            {phase.deliverables?.map((d, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-3 h-3 text-green-500" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
            Close
          </button>
          <button
            onClick={() => { onSelect(option.id); onClose(); }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
          >
            Select This Architecture
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Architecture Options Modal
const ArchitectureOptionsModal = ({ 
  isOpen,
  onClose,
  optionsData, 
  onConfirmSelection,
  isSelecting = false
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [detailOption, setDetailOption] = useState(null);

  if (!isOpen || !optionsData?.options) return null;

  const options = Object.values(optionsData.options);
  const recommendedOption = optionsData.recommended_option;

  const handleConfirm = () => {
    if (selectedOption && onConfirmSelection) {
      onConfirmSelection(selectedOption, optionsData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Solution Architecture Options</h2>
            <p className="text-sm text-gray-500">Select an architecture to proceed</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Analysis Summary */}
          {optionsData.analysis_summary && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Analysis Summary
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{optionsData.analysis_summary}</p>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isRecommended={option.id === recommendedOption}
                isSelected={selectedOption === option.id}
                onSelect={setSelectedOption}
                onViewDetails={setDetailOption}
              />
            ))}
          </div>

          {/* Recommendation */}
          {optionsData.recommendation_reasoning && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Why We Recommend: {options.find(o => o.id === recommendedOption)?.name}
              </h3>
              <p className="text-sm text-blue-700">{optionsData.recommendation_reasoning}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {selectedOption && (
              <span className="text-sm text-gray-600">
                Selected: <span className="font-medium">{options.find(o => o.id === selectedOption)?.name}</span>
              </span>
            )}
            <button
              onClick={handleConfirm}
              disabled={!selectedOption || isSelecting}
              className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                selectedOption && !isSelecting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSelecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Confirm Selection
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <OptionDetailModal
        option={detailOption}
        isOpen={!!detailOption}
        onClose={() => setDetailOption(null)}
        onSelect={setSelectedOption}
        isRecommended={detailOption?.id === recommendedOption}
      />
    </div>
  );
};

export default ArchitectureOptionsModal;