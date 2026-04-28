import React, { useState } from 'react';
import { Shield, FileText, Lock, Globe, Cookie, ChevronRight, LucideIcon } from 'lucide-react';

/**
 * Props for LegalDocs component
 */
export interface LegalDocsProps {
    isEmbedded?: boolean;
}

export default function LegalDocs({ isEmbedded = false }: LegalDocsProps) {
    const [activeSection, setActiveSection] = useState<string>('tos');

    const sections: Array<{
        id: string;
        label: string;
        icon: LucideIcon;
    }> = [
        { id: 'tos', label: 'Terms of Service', icon: FileText },
        { id: 'privacy', label: 'Privacy Policy', icon: Lock },
        { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
        { id: 'dmca', label: 'DMCA & Copyright', icon: Shield },
    ];

    return (
        <div className={`flex flex-col md:flex-row bg-white dark:bg-[#1f2128] h-full ${!isEmbedded ? 'max-w-6xl mx-auto rounded-2xl shadow-xl border dark:border-gray-700 overflow-hidden min-h-[600px]' : ''}`}>

            {/* SIDEBAR NAVIGATION */}
            <div className={`w-full md:w-72 bg-gray-50 dark:bg-[#23262f] border-r dark:border-gray-700 flex flex-col shrink-0`}>
                {!isEmbedded && (
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-2xl font-extrabold dark:text-white flex items-center gap-2">
                            <Shield className="text-brand-blue" /> Legal Center
                        </h2>
                    </div>
                )}

                <div className="p-4 space-y-1 overflow-y-auto flex-1">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left
                            ${activeSection === s.id
                                ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm border border-gray-200 dark:border-gray-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-3">
                                <s.icon size={18} className={activeSection === s.id ? 'text-brand-blue' : 'text-gray-400 group-hover:text-gray-500'} />
                                <span className="font-bold text-sm">{s.label}</span>
                            </div>
                            {activeSection === s.id && <ChevronRight size={16} className="text-brand-blue"/>}
                        </button>
                    ))}
                </div>

                {/* Compliance Badge */}
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs mb-2">
                        <Globe size={14}/> US Compliance Standard
                    </div>
                    <p className="text-[10px] text-blue-600 dark:text-blue-300 leading-relaxed opacity-80">
                        Documents compliant with CCPA, DMCA, and federal payment regulations.
                    </p>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 bg-white dark:bg-[#1f2128] relative overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeSection === 'tos' && <TermsOfService />}
                        {activeSection === 'privacy' && <PrivacyPolicy />}
                        {activeSection === 'cookies' && <CookiePolicy />}
                        {activeSection === 'dmca' && <DMCA />}

                        <div className="mt-20 pt-8 border-t dark:border-gray-800">
                            <p className="text-xs text-gray-400 text-center font-medium">
                                Last updated: November 29, 2025 • SeshNx Legal Department
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- TYPOGRAPHY HELPERS --- */

interface DocTitleProps {
    children: React.ReactNode;
}

const DocTitle = ({ children }: DocTitleProps) => (
    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
        {children}
    </h1>
);

interface DocSectionProps {
    title: string;
    children: React.ReactNode;
}

const DocSection = ({ title, children }: DocSectionProps) => (
    <div className="mb-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            {title}
        </h3>
        <div className="text-gray-600 dark:text-gray-300 leading-7 text-sm md:text-base space-y-4">
            {children}
        </div>
    </div>
);

interface DocListProps {
    items: string[];
}

// FIX: Added dangerouslySetInnerHTML to parse <strong> tags properly
const DocList = ({ items }: DocListProps) => (
    <ul className="space-y-2 mt-2">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0"></div>
                <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
        ))}
    </ul>
);

/* --- DOCUMENT CONTENT --- */

const TermsOfService = () => (
    <>
        <DocTitle>Terms of Service</DocTitle>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Welcome to SeshNx. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
        </p>

        <DocSection title="1. Platform Services">
            <p>SeshNx provides a marketplace and collaboration tool for music professionals ("Creatives") and educational institutions ("Schools"). We facilitate bookings, payments, and content sharing but are not a party to the actual service contracts between users.</p>
        </DocSection>

        <DocSection title="2. User Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years old to use SeshNx. Users under 18 require parental consent or School authorization to participate in educational programs.</p>
        </DocSection>

        <DocSection title="3. Payments & Fees">
            <p>Payments are processed securely via Stripe. By using our payment features, you agree to the <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noreferrer" className="text-brand-blue hover:underline font-bold">Stripe Connected Account Agreement</a>.</p>
            <p>SeshNx charges a platform fee on transactions (ranging from 0% to 20% depending on your subscription tier), which is automatically deducted at the time of payout.</p>
        </DocSection>

        <DocSection title="4. User Generated Content">
            <p>You retain full ownership of the content you upload (audio, images, text). By uploading, you grant SeshNx a non-exclusive, worldwide license to display, transcode, and distribute your content strictly for the purpose of operating the service.</p>
        </DocSection>

        <DocSection title="5. Prohibited Conduct">
            <p>You agree not to use SeshNx for:</p>
            <DocList items={[
                "Harassment, hate speech, or bullying.",
                "Distribution of malware or unauthorized automated scraping.",
                "Fraudulent transactions or money laundering.",
                "Copyright infringement or uploading content you do not own."
            ]} />
            <p className="mt-2">We reserve the right to suspend or ban accounts violating these rules without prior notice.</p>
        </DocSection>
    </>
);

const PrivacyPolicy = () => (
    <>
        <DocTitle>Privacy Policy</DocTitle>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Your privacy is critical to us. This policy explains how we collect, use, and share your data in compliance with US and international standards.
        </p>

        <DocSection title="1. Information We Collect">
            <DocList items={[
                "<strong>Account Data:</strong> Name, email, password (hashed), and profile bio.",
                "<strong>Financial Data:</strong> Bank account and tax info (processed and stored securely via Stripe; SeshNx does not store full credit card numbers).",
                "<strong>Usage Data:</strong> Location (for studio search), IP address, and browser type.",
                "<strong>Content:</strong> Direct messages, audio files, and images you upload."
            ]} />
        </DocSection>

        <DocSection title="2. How We Use Information">
            <p>We use your data to: provide and personalize services, process payments, verify student enrollment with partner schools, improve platform performance, and comply with legal obligations.</p>
        </DocSection>

        <DocSection title="3. Data Sharing">
            <p>We do not sell your personal data. We only share data with:</p>
            <DocList items={[
                "<strong>Service Providers:</strong> Google (Hosting/Auth), Stripe (Payments).",
                "<strong>Educational Institutions:</strong> If you link a student account, your School Administrators can view your internship activity logs.",
                "<strong>Legal Authorities:</strong> When required by valid legal process or subpoena."
            ]} />
        </DocSection>

        <DocSection title="4. CCPA / California Rights">
            <p>California residents have the right to request access to or deletion of their personal data. Please contact <strong>legal@seshnx.com</strong> to exercise these rights.</p>
        </DocSection>
    </>
);

const CookiePolicy = () => (
    <>
        <DocTitle>Cookie Policy</DocTitle>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            SeshNx uses cookies to enhance your experience. By using our site, you consent to our use of cookies.
        </p>

        <DocSection title="Types of Cookies We Use">
            <DocList items={[
                "<strong>Essential Cookies:</strong> Required for login authentication (e.g., Firebase Auth tokens). The site cannot function without these.",
                "<strong>Functional Cookies:</strong> Remember your preferences, such as Dark Mode settings and Sidebar state.",
                "<strong>Analytics Cookies:</strong> Help us understand how you use the site to improve features. These are aggregated and anonymous."
            ]} />
        </DocSection>

        <DocSection title="Managing Cookies">
            <p>You can control or delete cookies through your browser settings. However, please note that disabling Essential Cookies will prevent you from logging in to SeshNx.</p>
        </DocSection>
    </>
);

const DMCA = () => (
    <>
        <DocTitle>DMCA & Copyright</DocTitle>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            SeshNx respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA).
        </p>

        <DocSection title="Reporting Infringement">
            <p>If you believe your copyrighted work has been infringed on SeshNx, please send a notice to our Designated Agent at <strong>legal@seshnx.com</strong> including:</p>
            <DocList items={[
                "Identification of the copyrighted work claimed to have been infringed.",
                "Identification of the infringing material (URL or Post ID).",
                "Your contact information (Email, Phone).",
                "A statement of good faith belief that the use is unauthorized.",
                "A statement, under penalty of perjury, that the information is accurate and you are the copyright owner."
            ]} />
        </DocSection>

        <DocSection title="Counter-Notices">
            <p>If your content was removed by mistake, you may file a counter-notice. We may restore the content within 10-14 business days if the complainant does not file a court action against you.</p>
        </DocSection>
    </>
);
