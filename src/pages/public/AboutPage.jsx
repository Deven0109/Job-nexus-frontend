import { Link } from 'react-router-dom';
import {
    HiOutlineCheckCircle,
    HiOutlineLightBulb,
    HiOutlineUserGroup,
    HiOutlineStar,
    HiOutlineUserPlus,
    HiOutlineMagnifyingGlass,
    HiOutlineBriefcase
} from 'react-icons/hi2';

const AboutPage = () => {
    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* ======= HERO SECTION ======= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left Image */}
                    <div className="w-full lg:w-1/2">
                        <div className="rounded-xl overflow-hidden shadow-sm">
                            <img
                                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Modern Office"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="w-full lg:w-1/2">
                        <h1 className="text-[40px] font-bold text-[#1e293b] leading-tight mb-6">
                            Millions of Jobs. Find the <br />
                            one that <span className="text-[#2563eb]">suits you.</span>
                        </h1>
                        <p className="text-[#64748b] text-[16px] leading-relaxed mb-8 max-w-lg">
                            Discover thousands of job opportunities from top companies. Get personalized job recommendations, salary insights, and connect with employers who value your skills and experience.
                        </p>

                        <div className="space-y-5 mb-10">
                            {[
                                'Advanced job matching algorithms for better opportunities',
                                'Direct communication with hiring managers and recruiters',
                                'Real-time application tracking and status updates'
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-[#22c55e]" />
                                    <span className="text-[#475569] text-[15px] font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Link to="/jobs" className="inline-block px-8 py-3.5 bg-[#2563eb] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>

            {/* ======= STATS SECTION ======= */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <h2 className="text-[42px] font-extrabold text-[#2563eb] mb-1">47+</h2>
                        <p className="text-[#64748b] text-[14px] font-medium uppercase tracking-wider">Active Job Seekers</p>
                    </div>
                    <div>
                        <h2 className="text-[42px] font-extrabold text-[#2563eb] mb-1">55+</h2>
                        <p className="text-[#64748b] text-[14px] font-medium uppercase tracking-wider">Job Opportunities</p>
                    </div>
                    <div>
                        <h2 className="text-[42px] font-extrabold text-[#2563eb] mb-1">26+</h2>
                        <p className="text-[#64748b] text-[14px] font-medium uppercase tracking-wider">Partner Companies</p>
                    </div>
                </div>
            </div>

            {/* ======= TEXT CONTENT SECTION ======= */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className="text-[32px] font-bold text-[#1e293b] mb-12">About Job Nexus</h2>
                <div className="space-y-8 text-[#64748b] text-[16px] leading-[1.8]">
                    <p>
                        Job Nexus is a comprehensive platform that connects talented professionals with top-tier companies across various industries. We believe that finding the right job should be simple, efficient, and rewarding for both job seekers and employers.
                    </p>
                    <p>
                        Our mission is to bridge the gap between talent and opportunity, providing a seamless experience that empowers individuals to build meaningful careers while helping companies discover exceptional talent. With advanced matching algorithms and personalized recommendations, we make job searching more effective than ever.
                    </p>
                    <p>
                        Whether you're a recent graduate starting your career journey or an experienced professional seeking new challenges, Job Nexus provides the tools, resources, and opportunities you need to succeed in today's competitive job market.
                    </p>
                </div>
            </div>

            {/* ======= MISSION & VALUES ======= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-[32px] font-bold text-[#1e293b] mb-4">Our Mission & Values</h2>
                    <p className="text-[#64748b]">We're committed to creating a better future for job seekers and employers</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-[#eff6ff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#2563eb]">
                            <HiOutlineLightBulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Innovation</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">Continuously improving our platform with cutting-edge technology and features.</p>
                    </div>
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-6 text-[#16a34a]">
                            <HiOutlineMagnifyingGlass className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Trust</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">Building transparent relationships between job seekers and employers.</p>
                    </div>
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-[#faf5ff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#9333ea]">
                            <HiOutlineUserGroup className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Community</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">Fostering a supportive community where everyone can achieve their career goals.</p>
                    </div>
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-[#eff6ff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#2563eb]">
                            <HiOutlineStar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Excellence</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">Delivering exceptional service and results for all our users.</p>
                    </div>
                </div>
            </div>

            {/* ======= TESTIMONIALS ======= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-0">
                <div className="text-center mb-16">
                    <h2 className="text-[32px] font-bold text-[#1e293b] mb-4">Testimonials From Our Candidate</h2>
                    <p className="text-[#64748b]">Hear from those who found success with our platform</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-[#1e293b] mb-4">Platform for Recruiters</h4>
                        <p className="text-[#64748b] text-[14px] leading-relaxed italic mb-8">
                            "As a hiring manager, I've found Job Nexus to be incredibly effective for finding qualified candidates. The candidate profiles are detailed, and the application process is streamlined. We've successfully hired 5 excellent team members through this platform."
                        </p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/150?u=12" alt="Avatar" className="w-10 h-10 rounded-full" />
                            <div>
                                <h5 className="text-[14px] font-bold text-[#1e293b]">Michael Chen</h5>
                                <p className="text-[12px] text-[#94a3b8]">HR Director</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-[#1e293b] mb-4">Perfect for Career Growth</h4>
                        <p className="text-[#64748b] text-[14px] leading-relaxed italic mb-8">
                            "After 3 years in my previous role, I was ready for new challenges. Job Nexus helped me discover opportunities I never knew existed. The salary insights and company reviews were particularly helpful in making informed career decisions."
                        </p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/150?u=15" alt="Avatar" className="w-10 h-10 rounded-full" />
                            <div>
                                <h5 className="text-[14px] font-bold text-[#1e293b]">Emily Rodriguez</h5>
                                <p className="text-[12px] text-[#94a3b8]">Product Manager</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-[#1e293b] mb-4">Streamlined Hiring Process</h4>
                        <p className="text-[#64748b] text-[14px] leading-relaxed italic mb-8">
                            "The application tracking feature is a game-changer. I could see exactly where I stood with each application, and the direct communication with employers made the entire process transparent and efficient. Highly recommended!"
                        </p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/150?u=18" alt="Avatar" className="w-10 h-10 rounded-full" />
                            <div>
                                <h5 className="text-[14px] font-bold text-[#1e293b]">David Kim</h5>
                                <p className="text-[12px] text-[#94a3b8]">Data Scientist</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#cbd5e1]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#2563eb]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#cbd5e1]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#cbd5e1]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#cbd5e1]"></div>
                </div>
            </div>

            {/* ======= HOW IT WORKS ======= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mb-10">
                <div className="text-center mb-16">
                    <h2 className="text-[32px] font-bold text-[#1e293b] mb-4">How It Works</h2>
                    <p className="text-[#64748b]">Simple steps for job seekers and companies</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="text-center border border-slate-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-[#fff7ed] rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden">
                            <div className="text-amber-500 font-bold text-2xl flex items-center justify-center h-full">
                                <HiOutlineUserPlus />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Create Your Account</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">
                            Sign up as a Job Seeker or Company. Verify your email and complete your profile/company details so we can personalize recommendations and applications.
                        </p>
                    </div>

                    <div className="text-center border border-slate-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-[#f0f9ff] rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden">
                            <div className="text-blue-500 font-bold text-2xl flex items-center justify-center h-full">
                                <HiOutlineMagnifyingGlass />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Find or Post Jobs</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">
                            Job seekers browse and filter by category, location, salary range, experience level, and skills. Companies create job posts with rich details, salary range, and required skills.
                        </p>
                    </div>

                    <div className="text-center border border-slate-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-[#f0fdf4] rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden">
                            <div className="text-emerald-500 font-bold text-2xl flex items-center justify-center h-full">
                                <HiOutlineBriefcase />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-3">Apply, Manage & Track</h3>
                        <p className="text-[#64748b] text-[14px] leading-relaxed">
                            Candidates apply with one click and track statuses. Companies review applicants, toggle job visibility, and manage hiring from a unified dashboard—all in real time.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AboutPage;
