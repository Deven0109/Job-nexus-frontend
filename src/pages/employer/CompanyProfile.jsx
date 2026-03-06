import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployerProfile, updateEmployerProfile } from '../../api/employer.api';
import toast from 'react-hot-toast';
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
        avatar: '', // Support for User model profile pic
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

            // Handle logo upload if a new file was selected
            if (logoFile) {
                // In a real app with S3, you'd upload here. 
                // For now, we'll use a FileReader to get a base64 string as a placeholder
                // or just send the file if the backend expects multipart.
                // Since updateEmployerProfile uses JSON (PUT), we'll use base64 for simplicity in this demo.
                // NOTE: Production apps should use S3/Cloudinary.
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
        `w-full px-5 py-3.5 border rounded-2xl text-sm font-medium transition-all outline-none ${editable && isEditing
            ? 'bg-white border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-800'
            : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'
        }`;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="card p-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array(6).fill().map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-12 bg-slate-100 rounded-2xl"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                        <HiOutlineBuildingOffice2 className="w-6 h-6 text-blue-500" />
                        Company Profile
                    </h2>
                    <p className="text-sm text-dark-500 mt-0.5">
                        Manage your company information and details
                    </p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <HiOutlineXMark className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Company Info Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

                {/* Banner */}
                <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMjAgMzAtMTAtMTBMIDIwIDEwbDEwIDEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                    <div className="absolute bottom-0 left-8 translate-y-1/2">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl bg-white flex items-center justify-center overflow-hidden">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                    <HiOutlinePencilSquare className="w-5 h-5" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="px-8 lg:px-12 pt-16 pb-10">

                    {/* Company Name & Industry Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineBuildingOffice2 className="w-4 h-4 text-slate-400" />
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="Enter company name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineBriefcase className="w-4 h-4 text-slate-400" />
                                Industry <span className="text-red-500">*</span>
                            </label>
                            {isEditing ? (
                                <select
                                    value={companyData.industry}
                                    onChange={(e) => handleChange('industry', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Select Industry</option>
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

                    {/* Location & Company Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineMapPin className="w-4 h-4 text-slate-400" />
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="e.g. Mumbai, India"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineUsers className="w-4 h-4 text-slate-400" />
                                Company Size
                            </label>
                            {isEditing ? (
                                <select
                                    value={companyData.companySize}
                                    onChange={(e) => handleChange('companySize', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
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

                    {/* Website & Contact Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineGlobeAlt className="w-4 h-4 text-slate-400" />
                                Website
                            </label>
                            <input
                                type="url"
                                value={companyData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="https://www.example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <HiOutlineEnvelope className="w-4 h-4 text-slate-400" />
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={companyData.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                readOnly={!isEditing}
                                className={inputCls()}
                                placeholder="hr@company.com"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <HiOutlineDocumentText className="w-4 h-4 text-slate-400" />
                            Company Description
                        </label>
                        <textarea
                            value={companyData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            readOnly={!isEditing}
                            rows="5"
                            maxLength={2000}
                            className={`${inputCls()} resize-none leading-relaxed`}
                            placeholder="Tell us about your company, its mission, culture, and what makes it a great place to work..."
                        />
                        {isEditing && (
                            <p className="text-xs text-slate-400 text-right font-medium">
                                {companyData.description.length} / 2000 characters
                            </p>
                        )}
                    </div>

                    {/* Bottom Save Bar (visible in edit mode) */}
                    {isEditing && (
                        <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-slate-100">
                            <button
                                onClick={handleCancel}
                                className="px-8 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Company Profile'}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
