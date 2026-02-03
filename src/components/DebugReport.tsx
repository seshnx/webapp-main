import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Copy, RefreshCw, Download, LucideIcon } from 'lucide-react';

/**
 * Props for DebugReport component
 */
export interface DebugReportProps {
    user?: any;
    userData?: any;
}

/**
 * Report data interface
 */
interface ReportData {
    timestamp: string;
    environment: {
        nodeEnv: string;
        isDev: boolean;
        isProd: boolean;
        baseUrl: string;
        anonKey: string;
    };
    browser: {
        userAgent: string;
        platform: string;
        language: string;
        cookieEnabled: boolean;
        onLine: boolean;
        storage: {
            localStorage: string;
            sessionStorage: string;
        };
    };
    authentication: {
        userExists: boolean;
        userDataExists: boolean;
        userId: string;
        userEmail: string;
        userMetadata: Record<string, any>;
        appMetadata: Record<string, any>;
        createdAt: string;
        lastSignIn: string;
        confirmedAt: string;
    };
    userData: any;
    supabase: {
        initialized: boolean;
        authUrl: string;
        authKey: string;
    };
    session: {
        exists: boolean;
        accessToken: string;
        refreshToken: string;
        expiresAt: string | null;
        error: string | null;
    } | null;
    profile: {
        exists: boolean;
        data: any;
        error: string | null;
    } | null;
    errors: string[];
}

export default function DebugReport({ user, userData }: DebugReportProps) {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        generateReport();
    }, [user, userData]);

    const generateReport = async () => {
        setLoading(true);
        const reportData: ReportData = {
            timestamp: new Date().toISOString(),
            environment: {
                nodeEnv: import.meta.env.MODE,
                isDev: import.meta.env.DEV,
                isProd: import.meta.env.PROD,
                baseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
                anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
            },
            browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                storage: {
                    localStorage: typeof Storage !== 'undefined' ? 'Available' : 'Unavailable',
                    sessionStorage: typeof sessionStorage !== 'undefined' ? 'Available' : 'Unavailable',
                }
            },
            authentication: {
                userExists: !!user,
                userDataExists: !!userData,
                userId: user?.id || 'N/A',
                userEmail: user?.email || 'N/A',
                userMetadata: user?.user_metadata || {},
                appMetadata: user?.app_metadata || {},
                createdAt: user?.created_at || 'N/A',
                lastSignIn: user?.last_sign_in_at || 'N/A',
                confirmedAt: user?.confirmed_at || 'N/A',
            },
            userData: userData || null,
            supabase: {
                initialized: !!(window as any).supabase,
                authUrl: (window as any).supabase?.supabaseUrl || 'N/A',
                authKey: (window as any).supabase?.supabaseKey ? 'Set' : 'Missing',
            },
            session: null,
            profile: null,
            errors: [],
        };

        // Test Supabase connection
        // TODO: Migrate to Neon/Convex - Supabase legacy code
        try {
            const supabase = (window as any).supabase;
            if (supabase && user?.id) {
                // Get current session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                reportData.session = {
                    exists: !!sessionData?.session,
                    accessToken: sessionData?.session?.access_token ? 'Present' : 'Missing',
                    refreshToken: sessionData?.session?.refresh_token ? 'Present' : 'Missing',
                    expiresAt: sessionData?.session?.expires_at || 'N/A',
                    error: sessionError?.message || null,
                };

                // Get profile from database
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                reportData.profile = {
                    exists: !!profileData,
                    data: profileData || null,
                    error: profileError?.message || null,
                };

                // Test a simple query
                const { error: testError } = await supabase
                    .from('profiles')
                    .select('id')
                    .limit(1);

                if (testError) {
                    reportData.errors.push(`Database query test failed: ${testError.message}`);
                }
            }
        } catch (err: any) {
            reportData.errors.push(`Error during checks: ${err.message}`);
        }

        setReport(reportData);
        setLoading(false);
    };

    const copyToClipboard = () => {
        if (!report) return;
        const reportText = JSON.stringify(report, null, 2);
        navigator.clipboard.writeText(reportText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const downloadReport = () => {
        if (!report) return;
        const reportText = JSON.stringify(report, null, 2);
        const blob = new Blob([reportText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    interface StatusIconProps {
        status: boolean | string;
    }

    const StatusIcon = ({ status }: StatusIconProps) => {
        if (status === true || status === 'Available' || status === 'Set' || status === 'Present') {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
        if (status === false || status === 'Unavailable' || status === 'Missing') {
            return <XCircle className="w-5 h-5 text-red-500" />;
        }
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21] p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow p-6">
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="animate-spin text-brand-blue w-8 h-8" />
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Generating debug report...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21] p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow p-6">
                        <p className="text-red-500">Failed to generate report</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21] p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold dark:text-white">Debug Report</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={generateReport}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                {copied ? 'Copied!' : 'Copy JSON'}
                            </button>
                            <button
                                onClick={downloadReport}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generated: {new Date(report.timestamp).toLocaleString()}
                    </p>
                </div>

                {/* Environment */}
                <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                    <h2 className="text-xl font-semibold dark:text-white mb-4">Environment</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.environment.isDev ? 'Dev' : 'Prod'} />
                            <span className="dark:text-gray-300">Mode: {report.environment.nodeEnv}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.environment.baseUrl} />
                            <span className="dark:text-gray-300">Supabase URL: {report.environment.baseUrl}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.environment.anonKey} />
                            <span className="dark:text-gray-300">Supabase Key: {report.environment.anonKey}</span>
                        </div>
                    </div>
                </div>

                {/* Browser */}
                <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                    <h2 className="text-xl font-semibold dark:text-white mb-4">Browser</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.browser.storage.localStorage} />
                            <span className="dark:text-gray-300">LocalStorage: {report.browser.storage.localStorage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.browser.storage.sessionStorage} />
                            <span className="dark:text-gray-300">SessionStorage: {report.browser.storage.sessionStorage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.browser.cookieEnabled} />
                            <span className="dark:text-gray-300">Cookies: {report.browser.cookieEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User Agent:</p>
                            <p className="text-xs dark:text-gray-300 break-all">{report.browser.userAgent}</p>
                        </div>
                    </div>
                </div>

                {/* Authentication */}
                <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                    <h2 className="text-xl font-semibold dark:text-white mb-4">Authentication</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.authentication.userExists} />
                            <span className="dark:text-gray-300">User Object: {report.authentication.userExists ? 'Exists' : 'Missing'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon status={report.authentication.userDataExists} />
                            <span className="dark:text-gray-300">User Data: {report.authentication.userDataExists ? 'Exists' : 'Missing'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">User ID:</p>
                                <p className="dark:text-gray-300 font-mono">{report.authentication.userId}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Email:</p>
                                <p className="dark:text-gray-300">{report.authentication.userEmail}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Created At:</p>
                                <p className="dark:text-gray-300">{report.authentication.createdAt}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Last Sign In:</p>
                                <p className="dark:text-gray-300">{report.authentication.lastSignIn}</p>
                            </div>
                        </div>
                        {Object.keys(report.authentication.userMetadata).length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">User Metadata:</p>
                                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto">
                                    {JSON.stringify(report.authentication.userMetadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Session */}
                {report.session && (
                    <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                        <h2 className="text-xl font-semibold dark:text-white mb-4">Session</h2>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <StatusIcon status={report.session.exists} />
                                <span className="dark:text-gray-300">Session: {report.session.exists ? 'Active' : 'Missing'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusIcon status={report.session.accessToken} />
                                <span className="dark:text-gray-300">Access Token: {report.session.accessToken}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusIcon status={report.session.refreshToken} />
                                <span className="dark:text-gray-300">Refresh Token: {report.session.refreshToken}</span>
                            </div>
                            {report.session.error && (
                                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                                    <p className="text-sm text-red-600 dark:text-red-400">Error: {report.session.error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile */}
                {report.profile && (
                    <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                        <h2 className="text-xl font-semibold dark:text-white mb-4">Database Profile</h2>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <StatusIcon status={report.profile.exists} />
                                <span className="dark:text-gray-300">Profile: {report.profile.exists ? 'Found' : 'Not Found'}</span>
                            </div>
                            {report.profile.error && (
                                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                                    <p className="text-sm text-red-600 dark:text-red-400">Error: {report.profile.error}</p>
                                </div>
                            )}
                            {report.profile.data && (
                                <div className="mt-4">
                                    <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto">
                                        {JSON.stringify(report.profile.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* User Data */}
                {report.userData && (
                    <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                        <h2 className="text-xl font-semibold dark:text-white mb-4">User Data (State)</h2>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(report.userData, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Errors */}
                {report.errors.length > 0 && (
                    <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow mb-6 p-6">
                        <h2 className="text-xl font-semibold dark:text-white mb-4 text-red-500">Errors</h2>
                        <div className="space-y-2">
                            {report.errors.map((error, idx) => (
                                <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Raw JSON */}
                <div className="bg-white dark:bg-[#1f2128] rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold dark:text-white mb-4">Raw JSON</h2>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(report, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
