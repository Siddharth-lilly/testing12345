/**
 * SDLC Studio API Service
 * 
 * Centralized API client for all backend communication.
 * Organized by domain/feature area.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Base request method with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return { message: text, status: response.status };
      }
      
      if (!response.ok) {
        const errorMessage = data.detail || data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Is the backend running on ' + this.baseURL + '?');
      }
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== HEALTH ====================
  
  async healthCheck() {
    return this.request('/api/health');
  }

  // ==================== PROJECTS ====================
  
  async createProject(projectData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(projectId) {
    return this.request(`/api/projects/${projectId}`);
  }

  async listProjects() {
    return this.request('/api/projects');
  }

  async updateProject(projectId, data) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ARTIFACTS ====================
  
  async getArtifact(artifactId) {
    return this.request(`/api/artifacts/${artifactId}`);
  }

  async getStageArtifacts(projectId, stage) {
    return this.request(`/api/artifacts/project/${projectId}/stage/${stage}`);
  }

  async listProjectArtifacts(projectId, stage = null, artifactType = null) {
    let endpoint = `/api/artifacts/project/${projectId}`;
    const params = new URLSearchParams();
    if (stage) params.append('stage', stage);
    if (artifactType) params.append('artifact_type', artifactType);
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    const response = await this.request(endpoint);
    
    // Ensure we always return an array
    if (Array.isArray(response)) {
      return response;
    } else if (response?.artifacts && Array.isArray(response.artifacts)) {
      return response.artifacts;
    } else {
      console.warn('Unexpected artifacts response format:', response);
      return [];
    }
  }

  async regenerateArtifact(artifactId, feedback, createdBy = 'user') {
    return this.request('/api/artifacts/regenerate', {
      method: 'POST',
      body: JSON.stringify({
        artifact_id: artifactId,
        feedback: feedback,
        created_by: createdBy,
      }),
    });
  }

  // ==================== DISCOVER STAGE ====================
  
  /**
   * Generate Discover stage artifacts (Problem Statement + Stakeholder Analysis)
   * Chat history is automatically fetched and used as context by the backend.
   * 
   * @param {string} projectId - Project UUID
   * @param {string} userIdea - Optional initial idea (will extract from chat if not provided)
   * @param {string} createdBy - User identifier
   */
  async generateDiscover(projectId, userIdea = null, createdBy = 'user') {
    return this.request('/api/stages/discover/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        user_idea: userIdea,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Convenience method called by AISpecialist component
   * Generates Discover stage using chat history as the source of requirements
   */
  async generateDiscoverStage(projectId, createdBy = 'user') {
    return this.request('/api/stages/discover/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        user_idea: null, // Backend will extract from chat history
        created_by: createdBy,
      }),
    });
  }

  // ==================== DEFINE STAGE ====================
  
  /**
   * Generate Define stage artifacts (BRD + User Stories)
   * @param {string} projectId - Project UUID  
   * @param {string} problemStatementId - Optional (will auto-fetch if not provided)
   * @param {string} stakeholderAnalysisId - Optional (will auto-fetch if not provided)
   * @param {string} createdBy - User identifier
   */
  async generateDefine(projectId, problemStatementId = null, stakeholderAnalysisId = null, createdBy = 'user') {
    return this.request('/api/stages/define/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        problem_statement_artifact_id: problemStatementId,
        stakeholder_analysis_artifact_id: stakeholderAnalysisId,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Convenience method called by AISpecialist component
   * Generates Define stage, auto-fetching previous artifacts and using chat context
   */
  async generateDefineStage(projectId, createdBy = 'user') {
    return this.request('/api/stages/define/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        // Backend will auto-fetch artifacts and use all chat history
        problem_statement_artifact_id: null,
        stakeholder_analysis_artifact_id: null,
        created_by: createdBy,
      }),
    });
  }

  // ==================== DESIGN STAGE ====================
  
  /**
   * Generate 3 solution architecture options
   * All chat history from previous stages is automatically included.
   * 
   * @param {string} projectId - Project UUID
   * @param {Object} constraints - Optional constraints
   * @param {Object[]} uploadedFiles - Optional array of {name, content}
   * @param {string} createdBy - User identifier
   */
  async generateDesign(projectId, constraints = null, uploadedFiles = null, createdBy = 'user') {
    return this.request('/api/stages/design/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        constraints: constraints,
        uploaded_files: uploadedFiles,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Convenience method called by AISpecialist component
   * Generates architecture options using all available context
   */
  async generateDesignOptions(projectId, constraints = null, createdBy = 'user') {
    return this.request('/api/stages/design/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        constraints: constraints,
        uploaded_files: null,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Select an architecture option and create artifact
   * @param {string} projectId - Project UUID
   * @param {string} selectedOptionId - Option ID (option_1, option_2, option_3)
   * @param {Object} optionsData - Full options data from generation (optional, will use cached if not provided)
   * @param {string} createdBy - User identifier
   */
  async selectArchitecture(projectId, selectedOptionId, optionsData = null, createdBy = 'user') {
    return this.request('/api/stages/design/select', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        selected_option_id: selectedOptionId,
        options_data: optionsData,
        created_by: createdBy,
      }),
    });
  }

  // ==================== DEVELOP STAGE ====================
  
  /**
   * Generate development tickets from project artifacts
   */
  async generateDevelopTickets(projectId, createdBy = 'user') {
    return this.request('/api/stages/develop/generate-tickets', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Get existing development tickets for a project
   */
  async getDevelopTickets(projectId) {
    return this.request(`/api/stages/develop/${projectId}/tickets`);
  }

  /**
   * Update a ticket's status
   */
  async updateTicketStatus(projectId, ticketKey, status) {
    return this.request(`/api/stages/develop/${projectId}/tickets/${ticketKey}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Start implementing a ticket
   */
  async startTicketImplementation(projectId, ticketKey) {
    return this.request('/api/stages/develop/start-implementation', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        ticket_key: ticketKey,
      }),
    });
  }

  /**
   * Implement a ticket - creates branch, issue, generates code, commits, and creates PR
   */
  async implementTicket(projectId, ticketKey, createdBy = 'user') {
    return this.request('/api/stages/develop/implement', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        ticket_key: ticketKey,
        created_by: createdBy,
      }),
    });
  }

  // ==================== CHAT ====================
  
  /**
   * Send a chat message to the AI specialist
   */
  async sendChatMessage(projectId, stage, message, userId = 'user') {
    return this.request('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        stage: stage,
        message: message,
        user_id: userId,
      }),
    });
  }

  /**
   * Get chat history for a project stage
   */
  async getChatHistory(projectId, stage, limit = 50) {
    return this.request(`/api/chat/${projectId}/${stage}/history?limit=${limit}`);
  }

  /**
   * Clear chat history for a project stage
   */
  async clearChatHistory(projectId, stage) {
    return this.request(`/api/chat/${projectId}/${stage}/history`, {
      method: 'DELETE',
    });
  }

  // ==================== GITHUB ====================
  
  /**
   * Validate GitHub credentials
   */
  async validateGitHubConfig(token, repo, defaultBranch = 'main') {
    return this.request('/api/github/validate', {
      method: 'POST',
      body: JSON.stringify({
        token,
        repo,
        default_branch: defaultBranch,
      }),
    });
  }

  /**
   * Save GitHub configuration for a project
   */
  async saveGitHubConfig(projectId, config) {
    return this.request(`/api/github/projects/${projectId}/config`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Get GitHub configuration status for a project
   */
  async getGitHubConfig(projectId) {
    return this.request(`/api/github/projects/${projectId}/config`);
  }

  /**
   * Delete GitHub configuration for a project
   */
  async deleteGitHubConfig(projectId) {
    return this.request(`/api/github/projects/${projectId}/config`, {
      method: 'DELETE',
    });
  }

  // ==================== COMMITS & ACTIVITY ====================
  
  async getProjectCommits(projectId, stage = null, limit = 20) {
    let endpoint = `/api/projects/${projectId}/commits?limit=${limit}`;
    if (stage) endpoint += `&stage=${stage}`;
    return this.request(endpoint);
  }

  async getProjectActivity(projectId, limit = 50) {
    return this.request(`/api/projects/${projectId}/activity?limit=${limit}`);
  }
  // ==================== TEST STAGE ====================
  
  /**
   * Get test stage dashboard overview
   */
  async getTestDashboard(projectId) {
    return this.request(`/api/stages/test/${projectId}/dashboard`);
  }

  /**
   * Generate a comprehensive test plan
   */
  async generateTestPlan(projectId, createdBy = 'user') {
    return this.request('/api/stages/test/generate-plan', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Get existing test plan for a project
   */
  async getTestPlan(projectId) {
    return this.request(`/api/stages/test/${projectId}/plan`);
  }

  /**
   * Generate detailed test cases
   */
  async generateTestCases(projectId, createdBy = 'user') {
    return this.request('/api/stages/test/generate-cases', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Get existing test cases for a project
   */
  async getTestCases(projectId) {
    return this.request(`/api/stages/test/${projectId}/cases`);
  }

  /**
   * Run/simulate test execution
   */
  async runTests(projectId, testSuiteIds = null, createdBy = 'user') {
    return this.request('/api/stages/test/run', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        test_suite_ids: testSuiteIds,
        created_by: createdBy,
      }),
    });
  }

  /**
   * Manually update a test case status
   */
  async updateTestCaseStatus(projectId, caseId, status, notes = null, failureDetails = null) {
    return this.request(`/api/stages/test/${projectId}/cases/${caseId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        notes,
        failure_details: failureDetails,
      }),
    });
  }
}






// Export singleton instance
export const api = new ApiService(API_BASE_URL);
export default api;