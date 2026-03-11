import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployerProfile, updateEmployerProfile } from '../../api/employer.api';
import toast from 'react-hot-toast';
import { Skeleton, Box, Stack } from '@mui/material';
import {
    HiOutlineBuildingOffice2,
    HiOutlineGlobeAlt,
    HiOutlineMapPin,
    HiOutlineEnvelope,
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineBriefcase,
    HiOutlinePencilSquare,
    HiOutlineCheckCircle,
    HiOutlineXMark,
    HiOutlineCamera
} from 'react-icons/hi2';

const COMPANY_SIZE_OPTIONS = [
    { value: '1-10', label: '1–10 employees' },
    { value: '11-50', label: '11–50 employees' },
    { value: '51-200', label: '51–200 employees' },
    { value: '201-500', label: '201–500 employees' },
    { value: '501-1000', label: '501–1000 employees' },
    { value: '1000+', label: '1000+ employees' },
];

const INDUSTRY_OPTIONS = [
    'Information Technology',
    'Healthcare',
    'Finance & Banking',
    'Education',
    'Manufacturing',
    'Retail & E-commerce',
    'Telecommunications',
    'Media & Entertainment',
    'Real Estate',
    'Consulting',
    'Automotive',
    'Energy & Utilities',
    'Hospitality & Tourism',
    'Legal',
    'Non-Profit',
    'Other',
];

const CompanyProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [companyData, setCompanyData] = useState({
        companyName: '',
        description: '',
        website: '',
        industry: '',
        companySize: '1-10',
        location: '',
        contactEmail: '',
        logo: '',
        avatar: '',
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getEmployerProfile();
                const details = res.data?.details;
                if (details && Object.keys(details).length > 0) {
                    const profileData = {
                        companyName: details.companyName || '',
                        description: details.companyDescription || details.description || '',
                        website: details.companyWebsite || details.website || '',
                        industry: details.industry || '',
                        companySize: details.companySize || '1-10',
                        location: details.companyLocation || details.location || '',
                        contactEmail: details.contactEmail || details.companyEmail || '',
                        logo: details.logo || '',
                    };
                    setCompanyData(profileData);
                    setOriginalData(profileData);
                    if (details.logo) setLogoPreview(details.logo);
                }
            } catch (err) {
                console.error('Failed to load employer profile', err);
                toast.error('Failed to load company profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (field, value) => {
        setCompanyData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!companyData.companyName.trim()) {
            return toast.error('Company Name is required');
        }

        setIsSaving(true);
        try {
            const dataToSend = { ...companyData };
            if (logoFile) {
                dataToSend.logo = logoPreview;
            }

            await updateEmployerProfile(dataToSend);
            setOriginalData({ ...companyData, logo: dataToSend.logo });
            setIsEditing(false);
            setLogoFile(null);
            toast.success('Company profile saved successfully!');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save company profile';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setCompanyData({ ...originalData });
        setLogoPreview(originalData.logo);
        setLogoFile(null);
        setIsEditing(false);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Logo size should be less than 2MB');
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
                setCompanyData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const inputCls = (editable = true) =>
        `w-full px-4 py-2.5 border rounded-[10px] text-[14px] font-medium transition-all outline-none ${editable && isEditing
            ? 'bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 text-slate-800 shadow-sm'
            : 'bg-slate-50 border-slate-100 text-slate-500 cursor-default'
        }`;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Skeleton variant="text" width={250} height={40} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={400} height={20} sx={{ borderRadius: 1, mt: 1 }} />
                    </Box>
                    <Skeleton variant="rounded" width={140} height={48} sx={{ borderRadius: '14px' }} />
                </Box>

                <Box sx={{ bgcolor: 'white', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, display: 'flex', gap: 3, alignItems: 'center', bgcolor: 'slate.50/50' }}>
                        <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: '16px' }} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width={200} height={32} sx={{ borderRadius: 1 }} />
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: 1 }} />
                            </Stack>
                        </Box>
                    </Box>
                    <Box sx={{ p: 4, spaceY: 4 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Box key={i} sx={{ spaceY: 1.5 }}>
                                    <Skeleton variant="text" width={100} height={20} sx={{ borderRadius: 0.5 }} />
                                    <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: '10px' }} />
                                </Box>
                            ))}
                        </div>
                        <Box sx={{ mt: 4 }}>
                            <Skeleton variant="text" width={120} height={20} sx={{ borderRadius: 0.5 }} />
                            <Skeleton variant="rounded" width="100%" height={150} sx={{ borderRadius: '10px', mt: 1 }} />
                        </Box>
                    </Box>
                </Box>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in relative">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Profile</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Showcase your brand and give candidates an inside look at your company culture.
                    </p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-[14px] shadow-sm transition-all"
                    >
                        <HiOutlinePencilSquare className="w-5 h-5" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-[14px] transition-all shadow-sm"
                        >
                            <HiOutlineXMark className="w-5 h-5" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-[14px] shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden shadow-sm">

                {/* Clean Logo Header Area */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-5 items-start md:items-center bg-slate-50/50">
                    <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-[16px] bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                            {logoPreview ? (
                                <img src={logoPreview.startsWith('http') || logoPreview.startsWith('data:') || logoPreview.startsWith('blob:') ? logoPreview : `${import.meta.env.VITE_API_URL}${logoPreview}`} alt="Company Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-300" />
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white rounded-[16px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                                <HiOutlineCamera className="w-5 h-5 mb-0.5" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                            </label>
                        )}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">
                            {companyData.companyName || 'Your Company Name'}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium text-slate-500">
                            {companyData.industry && (
                                <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                                    <HiOutlineBriefcase className="w-4 h-4 text-primary-500" />
                                    {companyData.industry}
                                </span>
                            )}
                            {companyData.location && (
                                <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                                    <HiOutlineMapPin className="w-4 h-4 text-primary-500" />
                                    {companyData.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Elements */}
                <div className="p-5 space-y-5">

                    {/* Basic Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineBuildingOffice2 className="w-5 h-5 text-slate-400" />
                                Company Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="e.g. Acme Corporation"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineBriefcase className="w-5 h-5 text-slate-400" />
                                Industry <span className="text-rose-500">*</span>
                            </label>
                            {isEditing ? (
                                <select
                                    value={companyData.industry}
                                    onChange={(e) => handleChange('industry', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[10px] text-[14px] font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none appearance-none cursor-pointer shadow-sm text-slate-800"
                                >
                                    <option value="" className="text-slate-400">Select an industry</option>
                                    {INDUSTRY_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={companyData.industry || 'Not specified'}
                                    readOnly
                                    className={inputCls(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Location & Size Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineMapPin className="w-5 h-5 text-slate-400" />
                                Location / Headquarters <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="e.g. San Francisco, CA"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineUsers className="w-5 h-5 text-slate-400" />
                                Team Size
                            </label>
                            {isEditing ? (
                                <select
                                    value={companyData.companySize}
                                    onChange={(e) => handleChange('companySize', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[10px] text-[14px] font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none appearance-none cursor-pointer shadow-sm text-slate-800"
                                >
                                    {COMPANY_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={COMPANY_SIZE_OPTIONS.find(o => o.value === companyData.companySize)?.label || companyData.companySize}
                                    readOnly
                                    className={inputCls(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Contact Links Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineGlobeAlt className="w-5 h-5 text-slate-400" />
                                Website URL
                            </label>
                            <input
                                type="url"
                                value={companyData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="https://www.yourcompany.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineEnvelope className="w-5 h-5 text-slate-400" />
                                Public Contact Email
                            </label>
                            <input
                                type="email"
                                value={companyData.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="careers@yourcompany.com"
                            />
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100 my-5"></div>

                    {/* About Company */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <HiOutlineDocumentText className="w-5 h-5 text-slate-400" />
                            About the Company
                        </label>
                        <textarea
                            value={companyData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            readOnly={!isEditing}
                            rows="6"
                            className={`${inputCls()} resize-y leading-relaxed`}
                            placeholder="What does your company do? What is your mission and company culture? Share details that will attract top talent..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
