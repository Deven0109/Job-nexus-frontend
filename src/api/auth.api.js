import api from './axios';

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    updateProfile: (data) => api.put('/auth/update-profile', data),
    verifyLoginOtp: (data) => api.post('/auth/verify-login-otp', data),
    resendLoginOtp: (data) => api.post('/auth/resend-login-otp', data),
};
