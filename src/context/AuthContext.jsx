import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('jobnexus_app_user');
        const token = localStorage.getItem('jobnexus_app_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const completeLogin = (accessToken, userData) => {
        // Prevent login for admin role in this app
        if (userData.role === 'admin') {
            throw new Error('Admins must use the dedicated Admin Panel.');
        }

        localStorage.setItem('jobnexus_app_token', accessToken);
        localStorage.setItem('jobnexus_app_user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        return userData;
    };

    const login = async (credentials) => {
        try {
            const { data } = await authAPI.login(credentials);
            const payload = data.data;

            // First-time login OTP flow
            if (payload?.requiresOtp) {
                if (payload.email) {
                    sessionStorage.setItem('jobnexus_login_otp_email', payload.email);
                }
                return { requiresOtp: true, email: payload.email };
            }

            const { accessToken, user: userData } = payload;
            return completeLogin(accessToken, userData);
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await authAPI.register(userData);
            return data.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('jobnexus_app_token');
            localStorage.removeItem('jobnexus_app_user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('jobnexus_app_user', JSON.stringify(updated));
            return updated;
        });
    };

    const loginWithToken = (accessToken, userData) => completeLogin(accessToken, userData);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        loginWithToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
