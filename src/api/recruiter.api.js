import api from './axios';

// ==================== JOB REQUESTS ====================

// List all job requests (from verified employers)
export const listJobRequests = async (params) => {
    const response = await api.get('/job-requests', { params });
    return response.data;
};

// Get single job request detail
export const getJobRequestById = async (id) => {
    const response = await api.get(`/job-requests/${id}`);
    return response.data;
};

// Update job request
export const updateJobRequest = async (id, data) => {
    const response = await api.put(`/job-requests/${id}`, data);
    return response.data;
};

// Approve a pending job request
export const approveJobRequest = async (id) => {
    const response = await api.patch(`/job-requests/${id}/approve`);
    return response.data;
};

// Reject a pending job request
export const rejectJobRequest = async (id, reason) => {
    const response = await api.patch(`/job-requests/${id}/reject`, { reason });
    return response.data;
};

// Activate an approved job request
export const activateJobRequest = async (id) => {
    const response = await api.post(`/job-requests/${id}/activate`);
    return response.data;
};

// Toggle job request status (for recruiters managing pending requests)
export const toggleJobRequestStatus = async (id) => {
    const response = await api.patch(`/job-requests/${id}/toggle-status`);
    return response.data;
};

// ==================== JOBS ====================

// List all jobs managed by the recruiter
export const getMyJobs = async (params) => {
    const response = await api.get('/recruiter/jobs', { params });
    return response.data;
};

// Delete a job posting
export const deleteJob = async (id) => {
    const response = await api.delete(`/recruiter/jobs/${id}`);
    return response.data;
};

// Toggle status of a live job (active/inactive)
export const toggleJobStatus = async (id) => {
    const response = await api.patch(`/recruiter/jobs/${id}/toggle-status`);
    return response.data;
};


// ==================== CATEGORIES ====================

// List all mapped categories for the recruiter
export const listCategories = async () => {
    const response = await api.get('/recruiter/categories');
    return response.data;
};

// Create a new mapped category
export const createCategory = async (data) => {
    const response = await api.post('/recruiter/categories', data);
    return response.data;
};

// Update a mapped category
export const updateCategory = async (id, data) => {
    const response = await api.put(`/recruiter/categories/${id}`, data);
    return response.data;
};

// Delete a mapped category
export const deleteCategory = async (id) => {
    const response = await api.delete(`/recruiter/categories/${id}`);
    return response.data;
};

// Get master list of categories and jobs
export const getMasterCategories = async () => {
    const response = await api.get('/categories/master');
    return response.data;
};

// ==================== DASHBOARD ====================

// Get Dashboard Stats
export const getDashboardStats = async () => {
    const response = await api.get('/recruiter/dashboard');
    return response.data;
};

