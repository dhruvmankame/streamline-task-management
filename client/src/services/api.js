
import axios from 'axios';

// Base URL from environment with fallback (documented in .env.example)
export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';

// Single axios instance
const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// This interceptor automatically adds the JWT token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- AUTHENTICATION API CALLS ---
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data || { success: false, error: 'Unexpected server response' };
    }
    if (error.request) {
      return { success: false, error: 'Network unreachable. Check server availability.' };
    }
    return { success: false, error: 'Request setup failed' };
  }
};

export const verifyBackupCode = async (tempToken, backupCode) => {
  try {
    const response = await api.post('/auth/verify-backup-code', { tempToken, backupCode });
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    if (error.request) return { success: false, error: 'Network unreachable.' };
    return { success: false, error: 'Request setup failed' };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    if (error.request) return { success: false, error: 'Network unreachable.' };
    return { success: false, error: 'Request setup failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    if (error.request) return { success: false, error: 'Network unreachable.' };
    return { success: false, error: 'Request setup failed' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    if (error.request) return { success: false, error: 'Network unreachable.' };
    return { success: false, error: 'Request setup failed' };
  }
};

// --- PROJECTS API CALLS ---
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (projectData) => api.post('/projects', projectData);
export const updateProject = (projectId, projectData) => api.put(`/projects/${projectId}`, projectData);
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);
export const getProjectAnalytics = (projectId) => api.get(`/projects/${projectId}/analytics`);
export const addProjectComment = (projectId, comment) => api.post(`/projects/${projectId}/comments`, { text: comment });
export const uploadProjectFile = (projectId, formData) => api.post(`/projects/${projectId}/upload`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// --- TASKS API CALLS ---
export const getTasks = (projectId) => {
  if (projectId) {
    return api.get(`/tasks?project=${projectId}`);
  }
  return api.get('/tasks');
};
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

// --- TEAM API CALLS (Manager Only) ---
export const getTeamMembers = () => api.get('/team');
export const getTeamOverview = () => api.get('/team/overview');
export const getAvailableUsers = (excludeIds = []) => {
  const params = new URLSearchParams();
  if (excludeIds.length) params.set('exclude', excludeIds.join(','));
  return api.get(`/team/available-users?${params.toString()}`);
};
export const addExistingMembers = (userIds) => api.post('/team/add-members', { userIds });
export const createTeam = (payload) => api.post('/team/create', payload);
export const updateTeamMembers = (teamId, memberIds) => api.patch(`/team/${teamId}/members`, { memberIds });
export const deleteTeam = (teamId) => api.delete(`/team/${teamId}`);

// --- MESSAGES API CALLS ---
export const getTeamMessages = (teamId, params = {}) => api.get(`/messages/${teamId}`, { params });
export const sendTeamMessage = (teamId, data) => api.post(`/messages/${teamId}`, data);
export const markMessagesAsRead = (teamId, messageIds) => api.patch(`/messages/${teamId}/read`, { messageIds });
export const deleteMessage = (messageId) => api.delete(`/messages/${messageId}`);
export const getTeamMessageStats = (teamId) => api.get(`/messages/${teamId}/stats`);

// --- DIRECT MESSAGES API CALLS ---
export const getAllUsers = () => api.get('/direct-messages/users');
export const getConversations = () => api.get('/direct-messages/conversations');
export const getDirectMessages = (userId) => api.get(`/direct-messages/${userId}`);
export const sendDirectMessage = (userId, data) => api.post(`/direct-messages/${userId}`, data);
export const markDirectMessagesAsRead = (userId) => api.patch(`/direct-messages/${userId}/read`);
export const deleteDirectMessage = (messageId) => api.delete(`/direct-messages/${messageId}`);
export const clearDirectMessages = (userId) => api.delete(`/direct-messages/clear/${userId}`);

// --- Reports API Calls ---
export const getDashboardStats = () => api.get('/reports/dashboard-stats');
export const getProjectStats = () => api.get('/reports/project-stats');

// --- Notifications ---
export const getNotificationPreferences = () => api.get('/notifications/preferences');
export const updateNotificationPreferences = (payload) => api.put('/notifications/preferences', payload);
export const listNotifications = (params = {}) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

// --- Security Log ---
export const getSecurityLogs = (params = {}) => api.get('/security/logs', { params });

// --- 2FA ---
export const setupTOTP = () => api.post('/2fa/setup-totp');
export const enable2FA = (code) => api.post('/2fa/enable', { code });
export const disable2FA = () => api.post('/2fa/disable');
export const generateBackupCodes = () => api.post('/users/generate-backup-codes');
export const verifyMFAAndLogin = ({ mfaToken, code, backupCode }) => api.post('/auth/mfa/verify', { mfaToken, code, backupCode });

// --- USER API CALLS ---
export const getSecurityActivity = () => api.get('/users/security-activity');

// --- ACCOUNT RECOVERY ---
export const requestAccountRecovery = (email, reason) => api.post('/recovery/request-recovery', { email, reason });
export const verifyRecoveryToken = (token) => api.post('/recovery/verify-recovery', { token });
export const emergencyLogin = (token) => api.post('/recovery/emergency-login', { token });

// --- REGENERATE BACKUP CODES ---
export const regenerateBackupCodes = async (email, backupCode) => {
  try {
    const response = await api.post('/auth/regenerate-backup-codes-with-code', { email, backupCode });
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    if (error.request) return { success: false, error: 'Network unreachable.' };
    return { success: false, error: 'Request setup failed' };
  }
};

// --- ENHANCED RECOVERY ---
export const generateCodesWithMethod = (method, verificationData) => api.post('/enhanced-recovery/generate-codes-methods', { method, verificationData });
export const requestEmailVerification = () => api.post('/enhanced-recovery/request-email-verification');
export const selfServiceRegenerate = (data) => api.post('/enhanced-recovery/self-service-regenerate', data);

// --- NOTIFICATIONS API CALLS ---
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (notificationId) => api.patch(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');
export const clearAllNotifications = () => api.delete('/notifications/clear');

// --- STATUS CHANGE REQUESTS ---
export const createStatusRequest = (data) => api.post('/status-requests', data);
export const getStatusRequests = (params = {}) => api.get('/status-requests', { params });
export const reviewStatusRequest = (requestId, action, comment) => api.put(`/status-requests/${requestId}`, { action, comment });
export const cancelStatusRequest = (requestId) => api.delete(`/status-requests/${requestId}`);

// --- TASK REPORTS ---
export const submitTaskReport = (data) => api.post('/task-reports', data);
export const getTaskReports = (params = {}) => api.get('/task-reports', { params });
export const reviewTaskReport = (reportId, comment) => api.put(`/task-reports/${reportId}/review`, { comment });
export const acknowledgeTaskReport = (reportId) => api.put(`/task-reports/${reportId}/acknowledge`);
export const deleteTaskReport = (reportId) => api.delete(`/task-reports/${reportId}`);

// Simple connectivity check
export const healthCheck = () => api.get('/health');

export default api;