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
