import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { useNavigate } from 'react-router-dom';
import { createJobRequest, listActiveCategories } from '../../api/employer.api';
import toast from 'react-hot-toast';
import {
    HiOutlineClipboardDocumentList,
    HiOutlineArrowLeft,
    HiOutlinePaperAirplane,
    HiOutlineXMark,
} from 'react-icons/hi2';

// Removed static CATEGORIES array for dynamic ones from backend

const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High'];
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED'];

const CreateJobRequest = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        vacancies: 1,
        experience: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'INR', // Default to INR
        workType: 'Onsite',
        countryCode: 'IN', // Default to India internally
        country: 'India',
        stateCode: '',
        state: '',
        city: '',
        pincode: '',
        skills: [],
        description: '',
        urgency: 'Medium',
    });

    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    // Initialize states on load since default is India
    useEffect(() => {
        setStatesList(State.getStatesOfCountry('IN'));
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await listActiveCategories();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addSkills = (input) => {
        const newSkills = input
            .split(',')
            .map(s => s.trim())
            .filter(s => s && !formData.skills.includes(s));
        if (newSkills.length > 0) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
        }
        setSkillInput('');
    };

    const handleAddSkill = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
            e.preventDefault();
            addSkills(skillInput);
        }
    };

    const handleSkillInputBlur = () => {
        if (skillInput.trim()) {
            addSkills(skillInput);
        }
    };

    const handleRemoveSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) return toast.error('Job title is required');
        if (!formData.category) return toast.error('Category is required');
        if (!formData.experience.trim()) return toast.error('Experience is required');
        if (!formData.salaryMin) return toast.error('Minimum salary is required');
        if (!formData.salaryMax) return toast.error('Maximum salary is required');
        if (!formData.currency) return toast.error('Currency is required');
        if (Number(formData.salaryMax) < Number(formData.salaryMin)) return toast.error('Max salary must be ≥ min salary');
        if (!formData.country) return toast.error('Country is required');
        if (!formData.state) return toast.error('State is required');
        if (!formData.city) return toast.error('City is required');
        if (formData.skills.length === 0) return toast.error('At least one skill is required');
        if (!formData.description.trim()) return toast.error('Description is required');

        setIsSubmitting(true);
        try {
            await createJobRequest({
                jobTitle: formData.title,
                jobCategory: formData.category,
                numberOfVacancies: Number(formData.vacancies),
                experienceRequired: formData.experience,
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                currency: formData.currency,
                workType: formData.workType,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                pincode: formData.pincode,
                requiredSkills: formData.skills,
                jobDescription: formData.description,
                urgency: formData.urgency
            });
            toast.success('Job request submitted successfully!');
            navigate('/employer/job-requests');
        } catch (error) {
            const errorData = error.response?.data;
            const message = errorData?.message || error.message || 'Failed to submit job request';

            if (errorData?.errors && errorData.errors.length > 0) {
                // If the backend returns express-validator detailed errors
                const detailedMessage = errorData.errors.map(err => err.msg || err.message).join(', ');
                toast.error(detailedMessage);
            } else {
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400";
    const labelCls = "block text-sm font-bold text-slate-700 mb-2";

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/employer/job-requests')}
                    className="p-2 rounded-xl border border-dark-200 text-dark-500 hover:bg-dark-50 transition-colors"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                        <HiOutlineClipboardDocumentList className="w-6 h-6 text-primary-500" />
                        New Job Request
                    </h2>
                    <p className="text-sm text-dark-500 mt-0.5">Fill in the details for your hiring request</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Card: Basic Info */}
                <div className="card p-8">
                    <h3 className="text-base font-bold text-dark-800 mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className={labelCls}>Job Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={inputCls}
                                placeholder="e.g. Senior Backend Developer"
                                maxLength={200}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className={`${inputCls} appearance-none cursor-pointer`}
                                disabled={loadingCategories}
                            >
                                <option value="">{loadingCategories ? 'Loading categories...' : 'Select category'}</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                                {!loadingCategories && categories.length === 0 && (
                                    <option value="" disabled>No categories available</option>
                                )}
                            </select>
                        </div>

                        {/* Vacancies */}
                        <div>
                            <label className={labelCls}>Number of Vacancies <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={formData.vacancies}
                                onChange={(e) => handleChange('vacancies', e.target.value)}
                                className={inputCls}
                                min="1"
                                placeholder="e.g. 2"
                            />
                        </div>

                        {/* Experience */}
                        <div>
                            <label className={labelCls}>Experience Required <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.experience}
                                onChange={(e) => handleChange('experience', e.target.value)}
                                className={inputCls}
                                placeholder="e.g. 2-4 years"
                            />
                        </div>

                        {/* Location */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelCls}>Country <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.countryCode}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        const name = e.target.options[e.target.selectedIndex].text;
                                        setFormData(p => ({ ...p, countryCode: code, country: name, stateCode: '', state: '', city: '' }));
                                        setStatesList(State.getStatesOfCountry(code));
                                        setCitiesList([]);
                                    }}
                                    className={`${inputCls} appearance-none cursor-pointer`}
                                >
                                    <option value="">Select Country</option>
                                    {Country.getAllCountries().map(c => (
                                        <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>State <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.stateCode}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        const name = e.target.options[e.target.selectedIndex].text;
                                        setFormData(p => ({ ...p, stateCode: code, state: name, city: '' }));
                                        setCitiesList(City.getCitiesOfState(formData.countryCode, code));
                                    }}
                                    className={`${inputCls} appearance-none cursor-pointer`}
                                    disabled={!formData.countryCode}
                                >
                                    <option value="">Select State</option>
                                    {statesList.map(s => (
                                        <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>City <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className={`${inputCls} appearance-none cursor-pointer`}
                                    disabled={!formData.stateCode}
                                >
                                    <option value="">Select City</option>
                                    {citiesList.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Pincode */}
                        <div>
                            <label className={labelCls}>Pincode</label>
                            <input
                                type="text"
                                value={formData.pincode}
                                onChange={(e) => handleChange('pincode', e.target.value)}
                                className={inputCls}
                                placeholder="Enter pincode"
                            />
                        </div>
                    </div>
                </div>

                {/* Card: Salary & Work Type */}
                <div className="card p-8">
                    <h3 className="text-base font-bold text-dark-800 mb-6">Compensation & Work Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Currency */}
                        <div>
                            <label className={labelCls}>Currency <span className="text-red-500">*</span></label>
                            <select
                                value={formData.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className={`${inputCls} appearance-none cursor-pointer`}
                            >
                                {CURRENCIES.map(curr => (
                                    <option key={curr} value={curr}>{curr}</option>
                                ))}
                            </select>
                        </div>

                        {/* Salary Min & Max */}
                        <div className="md:col-span-1">
                            <label className={labelCls}>Salary Range <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    value={formData.salaryMin}
                                    onChange={(e) => handleChange('salaryMin', e.target.value)}
                                    className={inputCls}
                                    min="0"
                                    placeholder="Min (e.g. 40000)"
                                />
                                <input
                                    type="number"
                                    value={formData.salaryMax}
                                    onChange={(e) => handleChange('salaryMax', e.target.value)}
                                    className={inputCls}
                                    min="0"
                                    placeholder="Max (e.g. 70000)"
                                />
                            </div>
                        </div>

                        {/* Work Type */}
                        <div>
                            <label className={labelCls}>Work Type <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-3">
                                {WORK_TYPES.map(type => (
                                    <label
                                        key={type}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${formData.workType === type
                                            ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="workType"
                                            value={type}
                                            checked={formData.workType === type}
                                            onChange={(e) => handleChange('workType', e.target.value)}
                                            className="sr-only"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Urgency */}
                        <div>
                            <label className={labelCls}>Urgency <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-3">
                                {URGENCY_LEVELS.map(level => (
                                    <label
                                        key={level}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${formData.urgency === level
                                            ? level === 'High'
                                                ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-100'
                                                : level === 'Medium'
                                                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-100'
                                                    : 'border-slate-400 bg-slate-50 text-slate-700 ring-2 ring-slate-100'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value={level}
                                            checked={formData.urgency === level}
                                            onChange={(e) => handleChange('urgency', e.target.value)}
                                            className="sr-only"
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card: Skills */}
                <div className="card p-8">
                    <h3 className="text-base font-bold text-dark-800 mb-6">Required Skills</h3>
                    <div className="flex flex-wrap gap-2 p-4 min-h-[64px] bg-white border border-slate-200 rounded-2xl mb-2">
                        {formData.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 font-semibold text-sm rounded-lg border border-primary-100"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(index)}
                                    className="hover:text-danger-500 transition-colors"
                                >
                                    <HiOutlineXMark className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleAddSkill}
                            onBlur={handleSkillInputBlur}
                            className="flex-1 min-w-[150px] bg-transparent outline-none font-medium placeholder:text-slate-400 text-sm py-1.5"
                            placeholder="Type a skill and press Enter..."
                        />
                    </div>
                    <p className="text-xs text-slate-400">Press Enter to add each skill. At least one skill is required.</p>
                </div>

                {/* Card: Description */}
                <div className="card p-8">
                    <h3 className="text-base font-bold text-dark-800 mb-6">Job Description</h3>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows="6"
                        maxLength={5000}
                        className={`${inputCls} resize-none leading-relaxed`}
                        placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity great..."
                    />
                    <p className="text-xs text-slate-400 text-right mt-1">{formData.description.length} / 5000 characters</p>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/employer/job-requests')}
                        className="px-8 py-3.5 border border-dark-200 text-dark-600 text-sm font-bold rounded-2xl hover:bg-dark-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <HiOutlinePaperAirplane className="w-4 h-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Job Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateJobRequest;
