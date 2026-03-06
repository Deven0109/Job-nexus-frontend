import api from './axios';

// Get candidate dashboard overview
export const getDashboardStats = async () => {
    const response = await api.get('/candidate/dashboard');
    return response.data;
};

// Get candidate own profile
export const getCandidateProfile = async () => {
    const response = await api.get('/candidate/profile');
    return response.data;
};

// Update candidate own profile
export const updateCandidateProfile = async (profileData) => {
    const response = await api.put('/candidate/profile', profileData);
    return response.data;
};

// Parse resume to json (preview only)
export const parseResumeFile = async (formData) => {
    const response = await api.post('/candidate/resume/parse', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
