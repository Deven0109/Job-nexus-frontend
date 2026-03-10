import api from './axios';

// Get list of public jobs
export const getPublicJobs = async (params) => {
    const response = await api.get('/jobs', { params });
    return response.data;
};

// Get single job details
export const getPublicJobById = async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
};

// Get top 5 popular job categories
export const getPopularCategories = async () => {
    const response = await api.get('/jobs/popular-categories');
    return response.data;
};

// Get available categories managed by recruiters
export const getAvailableCategories = async () => {
    const response = await api.get('/jobs/available-categories');
    return response.data;
};
