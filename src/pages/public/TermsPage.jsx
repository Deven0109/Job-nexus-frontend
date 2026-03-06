import React, { useEffect } from 'react';

const TermsPage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: (
                <p>
                    By accessing or using Job Nexus (the "Platform"), including our website and related services, you agree
                    to be bound by these Terms and Conditions. If you do not agree, you must not use the Platform.
                </p>
            )
        },
        {
            title: "2. About the Platform",
            content: (
                <p>
                    Job Nexus connects candidates with companies and recruiters to discover, post, and apply for job
                    opportunities. We provide tools such as profile creation, resume uploads, job postings, and application
                    management.
                </p>
            )
        },
        {
            title: "3. User Accounts and Eligibility",
            content: (
                <div className="space-y-4">
                    <p>
                        You must be at least 16 years old to create an account. You are responsible for maintaining the
                        confidentiality of your credentials and for all activities under your account.
                    </p>
                    <p>
                        You agree that all information you provide is accurate, current, and complete, and you will promptly
                        update any changes (e.g., name, company details, contact information).
                    </p>
                </div>
            )
        },
        {
            title: "4. Candidate Responsibilities",
            content: (
                <p>
                    Candidates are responsible for the accuracy of their profiles, resumes, and applications. Do not upload
                    misleading, plagiarized, or unlawful content. You grant Job Nexus a limited license to display your
                    submitted materials to companies for recruitment purposes.
                </p>
            )
        },
        {
            title: "5. Company/Recruiter Responsibilities",
            content: (
                <div className="space-y-4">
                    <p>
                        Companies must ensure job postings are genuine, lawful, and include accurate information such as job
                        title, location, description, and eligibility. You agree not to post roles that are discriminatory, deceptive,
                        or violate local laws.
                    </p>
                    <p>
                        You may only contact candidates for relevant openings and must not harvest data or use candidate
                        information for unsolicited marketing.
                    </p>
                </div>
            )
        },
        {
            title: "6. Content, Ownership, and License",
            content: (
                <p>
                    Users retain ownership of the content they submit. By submitting content, you grant Job Nexus a
                    non-exclusive, worldwide, royalty-free license to host, display, and distribute the content as necessary to
                    operate the Platform.
                </p>
            )
        },
        {
            title: "7. Prohibited Conduct",
            content: (
                <p>
                    You agree not to: (i) post unlawful, offensive, or infringing content; (ii) impersonate any person or entity;
                    (iii) interfere with Platform security; (iv) scrape or harvest data; (v) advertise pyramid schemes or
                    unrelated products; or (vi) circumvent Platform features or limits.
                </p>
            )
        },
        {
            title: "8. Privacy",
            content: (
                <p>
                    Your use of the Platform is also governed by our Privacy Policy, which explains how we collect, use, and
                    safeguard personal data. By using Job Nexus, you consent to such processing.
                </p>
            )
        },
        {
            title: "9. Availability and Updates",
            content: (
                <p>
                    We may modify, suspend, or discontinue any feature at any time without liability. We strive for uptime
                    but do not guarantee uninterrupted access.
                </p>
            )
        },
        {
            title: "10. Disclaimers",
            content: (
                <p>
                    Job Nexus does not guarantee hiring outcomes or the accuracy of third-party postings. The Platform is
                    provided on an "as is" and "as available" basis to the fullest extent permitted by law.
                </p>
            )
        },
        {
            title: "11. Limitation of Liability",
            content: (
                <p>
                    To the maximum extent allowed by law, Job Nexus and its affiliates are not liable for indirect, incidental,
                    special, consequential, or punitive damages, or for loss of data, profits, or goodwill arising from your
                    use of the Platform.
                </p>
            )
        },
        {
            title: "12. Termination",
            content: (
                <p>
                    We may suspend or terminate your access if you breach these Terms or for security/operational
                    reasons. You may stop using the Platform at any time.
                </p>
            )
        },
        {
            title: "13. Changes to these Terms",
            content: (
                <p>
                    We may update these Terms from time to time. Continued use after updates constitutes acceptance of
                    the revised Terms.
                </p>
            )
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen pt-12 pb-24 font-sans text-slate-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-16 px-4">
                    <h1 className="text-4xl md:text-5xl font-[900] text-[#334D6E] mb-6 tracking-tight">Terms and Conditions</h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Please read these terms carefully before using Job Nexus. By using our services, you
                        agree to be bound by these Terms and Conditions.
                    </p>
                    <p className="mt-8 text-sm font-semibold text-slate-400">
                        Last updated: February 2026
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200">
                            <h2 className="text-2xl font-bold text-[#334D6E] mb-5 tracking-tight flex items-center">
                                {section.title}
                            </h2>
                            <div className="text-slate-500 font-medium leading-[1.8] text-[15px] space-y-4 max-w-3xl">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 md:p-10 rounded-3xl mt-12 !mt-12">
                        <h2 className="text-xl font-bold text-[#334D6E] mb-4">Contact</h2>
                        <div className="text-slate-500 font-medium leading-[1.8] text-[15px] space-y-4">
                            <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                            <div className="space-y-3 pt-2">
                                <p className="flex items-start gap-3">
                                    <span className="font-bold text-[#334D6E] min-w-[70px]">Address:</span>
                                    <span>Raghuvir Symphony Shoppers, 310-311, Bhimrad-Althan Rd, opp. Green Victory, Apcha Nagar, Surat, Gujarat 395007</span>
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="font-bold text-[#334D6E] min-w-[70px]">Phone:</span>
                                    <span>098792 08321</span>
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="font-bold text-[#334D6E] min-w-[70px]">Email:</span>
                                    <span>info@itfuturz.com</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Legal Notice */}
                    <div className="bg-blue-50/60 border border-blue-100/80 p-6 md:p-8 rounded-2xl mt-12 shadow-sm">
                        <h2 className="text-xl font-bold text-blue-700 mb-3 tracking-tight">Legal Notice</h2>
                        <p className="text-blue-600 font-medium leading-[1.8] text-[15px]">
                            By using our services, you agree to these Terms in full. If you disagree with any part, please discontinue use of the Platform. These Terms constitute a legally binding agreement between you and Job Nexus.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TermsPage;
