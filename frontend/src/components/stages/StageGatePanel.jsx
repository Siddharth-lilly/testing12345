// src/components/workspace/StageGatePanel.jsx
import React from 'react';
import { Check, Clock, User } from 'lucide-react';

// Stage-specific dummy data
const stageGateData = {
  discover: {
    checklist: [
      { id: 1, label: 'Problem statement documented', completed: true, completedBy: 'Siva', completedAt: '1 week ago' },
      { id: 2, label: 'Stakeholder interviews completed', completed: true, completedBy: 'Maya', completedAt: '1 week ago' },
      { id: 3, label: 'Current state analysis done', completed: true, completedBy: 'Raj', completedAt: '6 days ago' },
      { id: 4, label: 'Risk assessment completed', completed: true, completedBy: 'Priya', completedAt: '4 days ago' }
    ],
    approvals: [
      { name: 'Maya', status: 'approved', role: 'BA Lead', comment: 'Good discovery work, ready to move forward', date: new Date().toLocaleString() },
      { name: 'Priya', status: 'approved', role: 'Tech Lead', comment: 'Comprehensive analysis', date: new Date().toLocaleString() }
    ]
  },
  define: {
    checklist: [
      { id: 1, label: 'BRD approved by stakeholders', completed: true, completedBy: 'Siva', completedAt: '3 days ago' },
      { id: 2, label: 'User stories reviewed', completed: true, completedBy: 'Maya', completedAt: '2 days ago' },
      { id: 3, label: 'Acceptance criteria defined', completed: true, completedBy: 'Raj', completedAt: '2 days ago' },
      { id: 4, label: 'Requirements traceability complete', completed: true, completedBy: 'Priya', completedAt: '1 day ago' }
    ],
    approvals: [
      { name: 'Siva', status: 'approved', role: 'Product Owner', comment: 'Requirements are clear and complete', date: new Date().toLocaleString() },
      { name: 'Maya', status: 'approved', role: 'BA Lead', comment: 'All user stories are well-defined', date: new Date().toLocaleString() }
    ]
  },
  design: {
    checklist: [
      { id: 1, label: 'Architecture design reviewed', completed: true, completedBy: 'Priya', completedAt: '2 days ago' },
      { id: 2, label: 'Database schema finalized', completed: true, completedBy: 'Amit', completedAt: '1 day ago' },
      { id: 3, label: 'API contracts defined', completed: true, completedBy: 'Raj', completedAt: '1 day ago' },
      { id: 4, label: 'Security review completed', completed: true, completedBy: 'Siva', completedAt: '1 day ago' }
    ],
    approvals: [
      { name: 'Priya', status: 'approved', role: 'Architect', comment: 'Solid architecture, scalable design', date: new Date().toLocaleString() },
      { name: 'Amit', status: 'approved', role: 'Dev Lead', comment: 'Ready for implementation', date: new Date().toLocaleString() }
    ]
  },
  develop: {
    checklist: [
      { id: 1, label: 'Code review completed', completed: true, completedBy: 'Amit', completedAt: '1 day ago' },
      { id: 2, label: 'Unit tests passing (>80% coverage)', completed: true, completedBy: 'Raj', completedAt: '1 day ago' },
      { id: 3, label: 'Integration tests passing', completed: true, completedBy: 'Priya', completedAt: '12 hours ago' },
      { id: 4, label: 'Code quality standards met', completed: true, completedBy: 'Maya', completedAt: '12 hours ago' }
    ],
    approvals: [
      { name: 'Amit', status: 'approved', role: 'Dev Lead', comment: 'Code quality is excellent', date: new Date().toLocaleString() },
      { name: 'Priya', status: 'approved', role: 'Architect', comment: 'Follows architectural guidelines', date: new Date().toLocaleString() }
    ]
  },
  test: {
    checklist: [
      { id: 1, label: 'Test plan approved', completed: true, completedBy: 'Maya', completedAt: '2 days ago' },
      { id: 2, label: 'All test cases executed', completed: true, completedBy: 'QA Team', completedAt: '1 day ago' },
      { id: 3, label: 'Critical bugs resolved', completed: true, completedBy: 'Amit', completedAt: '12 hours ago' },
      { id: 4, label: 'UAT completed successfully', completed: true, completedBy: 'Stakeholders', completedAt: '6 hours ago' }
    ],
    approvals: [
      { name: 'Maya', status: 'approved', role: 'QA Lead', comment: 'All tests passed, ready for production', date: new Date().toLocaleString() },
      { name: 'Siva', status: 'approved', role: 'Product Owner', comment: 'Meets all acceptance criteria', date: new Date().toLocaleString() }
    ]
  },
  build: {
    checklist: [
      { id: 1, label: 'CI/CD pipeline configured', completed: true, completedBy: 'DevOps', completedAt: '1 day ago' },
      { id: 2, label: 'Build artifacts generated', completed: true, completedBy: 'Jenkins', completedAt: '12 hours ago' },
      { id: 3, label: 'Security scan passed', completed: true, completedBy: 'Security Team', completedAt: '8 hours ago' },
      { id: 4, label: 'Performance benchmarks met', completed: true, completedBy: 'Priya', completedAt: '6 hours ago' }
    ],
    approvals: [
      { name: 'Amit', status: 'approved', role: 'Dev Lead', comment: 'Build is stable and ready', date: new Date().toLocaleString() },
      { name: 'DevOps', status: 'approved', role: 'DevOps Lead', comment: 'Infrastructure ready for deployment', date: new Date().toLocaleString() }
    ]
  },
  deploy: {
    checklist: [
      { id: 1, label: 'Deployment plan reviewed', completed: true, completedBy: 'Siva', completedAt: '1 day ago' },
      { id: 2, label: 'Rollback procedures tested', completed: true, completedBy: 'DevOps', completedAt: '12 hours ago' },
      { id: 3, label: 'Production monitoring configured', completed: true, completedBy: 'Ops Team', completedAt: '6 hours ago' },
      { id: 4, label: 'Stakeholder signoff received', completed: true, completedBy: 'Business', completedAt: '2 hours ago' }
    ],
    approvals: [
      { name: 'Siva', status: 'approved', role: 'Product Owner', comment: 'Ready for production release', date: new Date().toLocaleString() },
      { name: 'DevOps', status: 'approved', role: 'Release Manager', comment: 'All systems go for deployment', date: new Date().toLocaleString() }
    ]
  }
};

const StageGatePanel = ({ stage, onClose, onMoveNext }) => {
  if (!stage) return null;

  const data = stageGateData[stage] || stageGateData.discover;
  const stageName = stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : '';
  
  // Define next stage
  const stageOrder = ['discover', 'define', 'design', 'develop', 'test', 'build', 'deploy'];
  const currentIndex = stageOrder.indexOf(stage);
  const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
  const nextStageName = nextStage ? nextStage.charAt(0).toUpperCase() + nextStage.slice(1) : 'Complete';

  const completedChecks = data.checklist.filter(c => c.completed).length;
  const totalChecks = data.checklist.length;
  const checklistProgress = (completedChecks / totalChecks) * 100;

  const approvedCount = data.approvals.filter(a => a.status === 'approved').length;
  const totalApprovals = data.approvals.length;
  const approvalProgress = (approvedCount / totalApprovals) * 100;

  const allPassed = checklistProgress === 100 && approvalProgress === 100;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stage Gate: {stageName} Review</h2>
              <p className="text-sm text-gray-500 mt-1">
                {stage.toUpperCase()} → {nextStage ? nextStage.toUpperCase() : 'COMPLETE'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${
              allPassed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {allPassed ? 'Passed' : 'In Review'}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Gate Type: <strong className="text-gray-900">Stage Transition</strong></span>
            <span>Required Approvals: <strong className="text-gray-900">{totalApprovals}</strong></span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checklist Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Checklist
              </h3>
              <span className={`text-sm ${completedChecks === totalChecks ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {completedChecks}/{totalChecks} complete
                {completedChecks === totalChecks && ' ✓'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            {/* Checklist Items */}
            <ul className="space-y-3">
              {data.checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className={`
                    mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}
                  `}>
                    {item.completed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <span className={item.completed ? 'text-gray-900' : 'text-gray-600'}>
                      {item.label}
                    </span>
                    {item.completed && item.completedBy && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.completedBy} • {item.completedAt}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Approvals Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Approvals
              </h3>
              <span className={`text-sm ${approvedCount >= totalApprovals ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {approvedCount}/{totalApprovals} required
                {approvedCount >= totalApprovals && ' ✓'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${approvalProgress}%` }}
              />
            </div>

            {/* Approval List */}
            <ul className="space-y-4">
              {data.approvals.map((approval, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold flex-shrink-0">
                    {approval.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{approval.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({approval.role})</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        approval.status === 'approved' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {approval.status === 'approved' ? '✓ Approved' : '⏱ Pending'}
                      </span>
                    </div>
                    {approval.comment && (
                      <p className="text-sm text-gray-600 mt-1">"{approval.comment}"</p>
                    )}
                    {approval.date && (
                      <p className="text-xs text-gray-400 mt-1">{approval.date}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {allPassed 
                ? `✓ All requirements met. Ready to move to ${nextStageName}.`
                : 'Complete all checklist items and obtain required approvals to proceed.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Back to Workspace
              </button>
              {nextStage && (
                <button
                  onClick={() => onMoveNext(nextStage)}
                  disabled={!allPassed}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    allPassed
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Move to {nextStageName}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gate Passed Message */}
        {allPassed && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800">Gate Passed!</h3>
            <p className="text-sm text-green-600 mt-1">
              This stage has been approved and is ready to proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageGatePanel;