import api from './axios';

// Get employer own profile (company info)
export const getEmployerProfile = async () => {
    const response = await api.get('/employer/profile');
    return response.data;
};

// Update employer own profile (company info)
export const updateEmployerProfile = async (profileData) => {
    const response = await api.put('/employer/profile', profileData);
    return response.data;
};

// Get active jobs for this employer (posted by recruiter)
export const getEmployerActiveJobs = async (params) => {
    const response = await api.get('/employer/active-jobs', { params });
    return response.data;
};

// Get recent activity for employer dashboard
export const getEmployerRecentActivity = async () => {
    const response = await api.get('/employer/recent-activity');
    return response.data;
};



// ==================== JOB REQUESTS ====================

// Create a new job request
export const createJobRequest = async (data) => {
    const response = await api.post('/job-requests', data);
    return response.data;
};

// Get employer's own job requests
export const getMyJobRequests = async (params) => {
    const response = await api.get('/job-requests/my', { params });
    return response.data;
};

// Get single own job request
export const getMyJobRequestById = async (id) => {
    const response = await api.get(`/job-requests/my/${id}`);
    return response.data;
};

// Update a pending job request
export const updateJobRequest = async (id, data) => {
    const response = await api.put(`/job-requests/my/${id}`, data);
    return response.data;
};

// Cancel a pending job request
export const cancelJobRequest = async (id) => {
    const response = await api.delete(`/job-requests/my/${id}`);
    return response.data;
};

// ==================== CATEGORIES ====================

// List active categories (for job request category dropdown)
export const listActiveCategories = async () => {
    const response = await api.get('/categories', { params: { isVisible: true } });
    return response.data;
};

// Fetch master categories and job titles
export const getMasterCategories = async () => {
    const response = await api.get('/categories/master');
    return response.data;
};
