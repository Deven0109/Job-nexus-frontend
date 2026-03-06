import API from './axios';

export const applyToJob = async (jobId) => {
    const response = await API.post(`/applications/apply/${jobId}`);
    return response.data;
};

export const getMyApplications = async () => {
    const response = await API.get('/applications/my');
    return response.data;
};

// Recruiter APIs
export const getJobApplications = async (jobId) => {
    const response = await API.get(`/applications/recruiter/job/${jobId}`);
    return response.data;
};

export const getJobPipeline = async (jobId) => {
    const response = await API.get(`/applications/recruiter/job/${jobId}/pipeline`);
    return response.data;
};

export const updateApplicationStatus = async (id, statusAction, data = {}) => {
    // statusAction: review, reject, shortlist, next-round, final-select, reject-after-interview
    const response = await API.put(`/applications/recruiter/application/${id}/${statusAction}`, data);
    return response.data;
};

export const scheduleInterview = async (id, data) => {
    const response = await API.put(`/applications/recruiter/application/${id}/schedule-interview`, data);
    return response.data;
};

// Employer APIs
export const getEmployerShortlisted = async (jobId) => {
    const response = await API.get(`/applications/employer/job/${jobId}/shortlisted`);
    return response.data;
};

export const updateEmployerStatus = async (id, action) => {
    // action: approve or reject
    const response = await API.put(`/applications/employer/application/${id}/${action}`);
    return response.data;
};

export const employerApproveApplication = async (id) => {
    const response = await API.put(`/applications/employer/application/${id}/approve`);
    return response.data;
};

export const employerRejectApplication = async (id) => {
    const response = await API.put(`/applications/employer/application/${id}/reject`);
    return response.data;
};

