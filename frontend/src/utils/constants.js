/**
 * Application constants
 */

// SDLC Stage definitions
export const STAGES = {
  DISCOVER: 'discover',
  DEFINE: 'define',
  DESIGN: 'design',
  DEVELOP: 'develop',
  TEST: 'test',
  DEPLOY: 'deploy',
  MAINTAIN: 'maintain',
};

// Stage order for navigation
export const STAGE_ORDER = [
  STAGES.DISCOVER,
  STAGES.DEFINE,
  STAGES.DESIGN,
  STAGES.DEVELOP,
  STAGES.TEST,
  STAGES.DEPLOY,
  STAGES.MAINTAIN,
];

// Stage display names
export const STAGE_NAMES = {
  [STAGES.DISCOVER]: 'Discover',
  [STAGES.DEFINE]: 'Define',
  [STAGES.DESIGN]: 'Design',
  [STAGES.DEVELOP]: 'Develop',
  [STAGES.TEST]: 'Test',
  [STAGES.DEPLOY]: 'Deploy',
  [STAGES.MAINTAIN]: 'Maintain',
};

// Stage descriptions
export const STAGE_DESCRIPTIONS = {
  [STAGES.DISCOVER]: 'Understand the problem and stakeholders',
  [STAGES.DEFINE]: 'Define requirements and user stories',
  [STAGES.DESIGN]: 'Design the solution architecture',
  [STAGES.DEVELOP]: 'Implement the solution',
  [STAGES.TEST]: 'Test and validate',
  [STAGES.DEPLOY]: 'Deploy to production',
  [STAGES.MAINTAIN]: 'Monitor and maintain',
};

// Artifact types
export const ARTIFACT_TYPES = {
  PROBLEM_STATEMENT: 'problem_statement',
  STAKEHOLDER_ANALYSIS: 'stakeholder_analysis',
  BRD: 'brd',
  USER_STORIES: 'user_stories',
  ARCHITECTURE: 'architecture',
  CODE: 'code',
  TEST_PLAN: 'test_plan',
  DEPLOYMENT_PLAN: 'deployment_plan',
};

// Ticket statuses
export const TICKET_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

// Ticket priorities
export const TICKET_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};
