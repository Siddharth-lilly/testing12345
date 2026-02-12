// src/components/stages/TestStagePanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, TestTube, PlayCircle, CheckCircle, XCircle,
  AlertCircle, Loader2, RefreshCw, ChevronDown, ChevronRight,
  ClipboardList, Bug, BarChart3, Clock
} from 'lucide-react';
import api from '../../services/api';

const TestStagePanel = ({ projectId, onRefresh }) => {
  const [dashboard, setDashboard] = useState(null);
  const [testPlan, setTestPlan] = useState(null);
  const [testCases, setTestCases] = useState(null);
  const [testResults, setTestResults] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingCases, setIsGeneratingCases] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  const [expandedSuites, setExpandedSuites] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const dashboardResult = await api.getTestDashboard(projectId);
      setDashboard(dashboardResult);
      
      if (dashboardResult.has_test_plan) {
        const planResult = await api.getTestPlan(projectId);
        if (planResult.status === 'success') {
          setTestPlan(planResult.test_plan);
        }
      }
      
      if (dashboardResult.has_test_cases) {
        const casesResult = await api.getTestCases(projectId);
        if (casesResult.status === 'success') {
          setTestCases(casesResult);
        }
      }
    } catch (err) {
      console.error('Failed to load test data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const result = await api.generateTestPlan(projectId, 'user');
      setTestPlan(result.test_plan);
      setDashboard(prev => ({ ...prev, has_test_plan: true }));
      setActiveTab('plan');
    } catch (err) {
      console.error('Failed to generate test plan:', err);
      alert(`Failed to generate test plan: ${err.message}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateCases = async () => {
    setIsGeneratingCases(true);
    try {
      const result = await api.generateTestCases(projectId, 'user');
      setTestCases(result);
      setDashboard(prev => ({ ...prev, has_test_cases: true }));
      setActiveTab('cases');
    } catch (err) {
      console.error('Failed to generate test cases:', err);
      alert(`Failed to generate test cases: ${err.message}`);
    } finally {
      setIsGeneratingCases(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const result = await api.runTests(projectId, null, 'user');
      setTestResults(result);
      setDashboard(prev => ({ 
        ...prev, 
        has_test_results: true,
        latest_run_summary: result.summary 
      }));
      setActiveTab('results');
    } catch (err) {
      console.error('Failed to run tests:', err);
      alert(`Failed to run tests: ${err.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const toggleSuite = (suiteId) => {
    setExpandedSuites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suiteId)) {
        newSet.delete(suiteId);
      } else {
        newSet.add(suiteId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700',
      'High': 'bg-orange-100 text-orange-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-gray-100 text-gray-700'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || colors['Medium']}`}>
        {priority}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Test Stage</span>
          </div>
          <button onClick={loadData} className="p-1.5 hover:bg-gray-200 rounded" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex gap-1">
          {['overview', 'plan', 'cases', 'results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === tab ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${dashboard?.has_test_plan ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${dashboard?.has_test_plan ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Test Plan</span>
                </div>
                <span className={`text-xs ${dashboard?.has_test_plan ? 'text-green-600' : 'text-gray-500'}`}>
                  {dashboard?.has_test_plan ? 'Generated' : 'Not created'}
                </span>
              </div>
              
              <div className={`p-3 rounded-lg border ${dashboard?.has_test_cases ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className={`w-4 h-4 ${dashboard?.has_test_cases ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Test Cases</span>
                </div>
                <span className={`text-xs ${dashboard?.has_test_cases ? 'text-green-600' : 'text-gray-500'}`}>
                  {dashboard?.test_cases_summary?.total_test_cases 
                    ? `${dashboard.test_cases_summary.total_test_cases} cases` 
                    : 'Not created'}
                </span>
              </div>
              
              <div className={`p-3 rounded-lg border ${dashboard?.has_test_results ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className={`w-4 h-4 ${dashboard?.has_test_results ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Results</span>
                </div>
                <span className={`text-xs ${dashboard?.has_test_results ? 'text-green-600' : 'text-gray-500'}`}>
                  {dashboard?.latest_run_summary?.pass_rate 
                    ? `${dashboard.latest_run_summary.pass_rate}% pass rate` 
                    : 'Not run'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Test Plan...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    {dashboard?.has_test_plan ? 'Regenerate Test Plan' : 'Generate Test Plan'}
                  </>
                )}
              </button>
              
              <button
                onClick={handleGenerateCases}
                disabled={isGeneratingCases}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingCases ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Test Cases...
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-4 h-4" />
                    {dashboard?.has_test_cases ? 'Regenerate Test Cases' : 'Generate Test Cases'}
                  </>
                )}
              </button>
              
              <button
                onClick={handleRunTests}
                disabled={isRunningTests || !dashboard?.has_test_cases}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    Run Tests
                  </>
                )}
              </button>
            </div>

            {dashboard?.latest_run_summary && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Latest Test Run</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-green-100 rounded">
                    <div className="text-lg font-bold text-green-700">{dashboard.latest_run_summary.passed || 0}</div>
                    <div className="text-xs text-green-600">Passed</div>
                  </div>
                  <div className="p-2 bg-red-100 rounded">
                    <div className="text-lg font-bold text-red-700">{dashboard.latest_run_summary.failed || 0}</div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded">
                    <div className="text-lg font-bold text-yellow-700">{dashboard.latest_run_summary.blocked || 0}</div>
                    <div className="text-xs text-yellow-600">Blocked</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <div className="text-lg font-bold text-gray-700">{dashboard.latest_run_summary.skipped || 0}</div>
                    <div className="text-xs text-gray-600">Skipped</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {testPlan ? (
              <>
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {testPlan.document_info?.title || 'Test Plan'}
                  </h3>
                  <p className="text-sm text-gray-600">{testPlan.executive_summary}</p>
                </div>

                {testPlan.scope && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Scope</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-1">In Scope</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {testPlan.scope.in_scope?.map((item, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-1">Out of Scope</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {testPlan.scope.out_of_scope?.map((item, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <XCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {testPlan.test_strategy?.testing_types && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Testing Types</h4>
                    <div className="space-y-3">
                      {testPlan.test_strategy.testing_types.map((type, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{type.type}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {type.coverage_target}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{type.description}</p>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {type.tools?.map((tool, j) => (
                              <span key={j} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {testPlan.risk_assessment && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                    <div className="space-y-2">
                      {testPlan.risk_assessment.map((risk, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="font-medium text-gray-900">{risk.risk}</span>
                          </div>
                          <div className="flex gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              risk.probability === 'High' ? 'bg-red-100 text-red-700' : 
                              risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              P: {risk.probability}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              risk.impact === 'High' ? 'bg-red-100 text-red-700' : 
                              risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              I: {risk.impact}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Mitigation: {risk.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No test plan generated yet</p>
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGeneratingPlan}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Generate Test Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Test Cases Tab */}
        {activeTab === 'cases' && (
          <div className="space-y-3">
            {testCases?.test_suites?.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{testCases.summary?.total_test_cases || 0} test cases in {testCases.test_suites.length} suites</span>
                </div>
                
                {testCases.test_suites.map((suite) => (
                  <div key={suite.suite_id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSuite(suite.suite_id)}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        {expandedSuites.has(suite.suite_id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-medium text-gray-900">{suite.name}</span>
                        <span className="text-xs text-gray-500">({suite.test_cases?.length || 0} cases)</span>
                      </div>
                      {getPriorityBadge(suite.priority)}
                    </button>
                    
                    {expandedSuites.has(suite.suite_id) && (
                      <div className="divide-y">
                        {suite.test_cases?.map((tc) => (
                          <div key={tc.case_id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                                    {tc.case_id}
                                  </span>
                                  <span className="font-medium text-gray-900">{tc.title}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{tc.description}</p>
                                <div className="flex gap-2">
                                  {getPriorityBadge(tc.priority)}
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    tc.category === 'Positive' ? 'bg-green-100 text-green-700' :
                                    tc.category === 'Negative' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {tc.category}
                                  </span>
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                    {tc.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No test cases generated yet</p>
                <button
                  onClick={handleGenerateCases}
                  disabled={isGeneratingCases}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Generate Test Cases
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {testResults ? (
              <>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Test Run {testResults.test_run?.run_id}</h4>
                      <p className="text-sm text-gray-500">{testResults.test_run?.environment}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {testResults.summary?.pass_rate?.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Pass Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-green-100 rounded">
                      <div className="text-lg font-bold text-green-700">{testResults.summary?.passed || 0}</div>
                      <div className="text-xs text-green-600">Passed</div>
                    </div>
                    <div className="p-2 bg-red-100 rounded">
                      <div className="text-lg font-bold text-red-700">{testResults.summary?.failed || 0}</div>
                      <div className="text-xs text-red-600">Failed</div>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded">
                      <div className="text-lg font-bold text-yellow-700">{testResults.summary?.blocked || 0}</div>
                      <div className="text-xs text-yellow-600">Blocked</div>
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <div className="text-lg font-bold text-gray-700">{testResults.summary?.skipped || 0}</div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                  </div>
                </div>

                {testResults.defects_found?.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Bug className="w-4 h-4 text-red-500" />
                      Defects Found ({testResults.defects_found.length})
                    </h4>
                    <div className="space-y-2">
                      {testResults.defects_found.map((defect) => (
                        <div key={defect.defect_id} className="p-3 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded">
                              {defect.defect_id}
                            </span>
                            <span className="font-medium text-gray-900">{defect.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              defect.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                              defect.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {defect.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{defect.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {testResults.recommendations?.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {testResults.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-500">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
                  <div className="space-y-2">
                    {testResults.results?.map((result) => (
                      <div key={result.case_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                            {result.case_id}
                          </span>
                          <span className="text-sm text-gray-700">{result.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {result.execution_time_ms}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No test results yet</p>
                <button
                  onClick={handleRunTests}
                  disabled={isRunningTests || !dashboard?.has_test_cases}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Run Tests
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStagePanel;