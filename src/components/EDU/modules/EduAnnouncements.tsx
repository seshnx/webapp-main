import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Trash2, Users, User, Shield } from 'lucide-react';

/**
 * Announcement interface
 */
interface Announcement {
    id: string;
    title?: string;
    message?: string;
    target?: string;
    school_id?: string;
    schoolId?: string;
    author_id?: string;
    authorId?: string;
    author_name?: string;
    authorName?: string;
    author_role?: string;
    authorRole?: string;
    created_at?: any;
    createdAt?: any;
    [key: string]: any;
}

/**
 * Announcement form interface
 */
interface AnnouncementForm {
    title: string;
    message: string;
    target: string;
}

/**
 * EduAnnouncements props
 */
export interface EduAnnouncementsProps {
    schoolId?: string;
    logAction?: (action: string, details: string) => Promise<void> | void;
    user?: any;
    userData?: any;
}

export default function EduAnnouncements({ schoolId, logAction, user, userData }: EduAnnouncementsProps) {
    // TODO: Migrate to Neon/Convex - Supabase legacy code
    // @ts-ignore - supabase is global for legacy support
    const supabase = (window as any).supabase;

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sending, setSending] = useState<boolean>(false);

    const [form, setForm] = useState<AnnouncementForm>({
        title: '',
        message: '',
        target: 'All'
    });

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;

        const fetchNews = async () => {
            setLoading(true);
            try {
                const { data: announcementsData, error } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('school_id', schoolId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setAnnouncements((announcementsData || []).map((a: any) => ({
                    id: a.id,
                    ...a,
                    schoolId: a.school_id,
                    authorId: a.author_id,
                    authorName: a.author_name,
                    authorRole: a.author_role,
                    createdAt: a.created_at
                })));
            } catch (e) {
                console.error("Error loading announcements:", e);
            }
            setLoading(false);
        };
        fetchNews();
    }, [schoolId]);

    // --- ACTIONS ---

    const handlePost = async () => {
        if (!form.title.trim() || !form.message.trim() || !supabase) {
            if (!form.title.trim() || !form.message.trim()) alert("Title and Message required.");
            return;
        }

        const userId = user?.id || user?.uid;
        setSending(true);

        try {
            const { data: newPost, error } = await supabase
                .from('announcements')
                .insert({
                    school_id: schoolId,
                    title: form.title,
                    message: form.message,
                    target: form.target,
                    author_id: userId,
                    author_name: userData?.displayName || userData?.effectiveDisplayName || 'School Admin',
                    author_role: userData?.activeProfileRole || 'Admin',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Optimistic Update
            setAnnouncements(prev => [{
                id: newPost.id,
                ...newPost,
                schoolId: newPost.school_id,
                authorId: newPost.author_id,
                authorName: newPost.author_name,
                authorRole: newPost.author_role,
                createdAt: newPost.created_at
            }, ...prev]);

            if (logAction) await logAction('Post Announcement', `Posted: ${form.title}`);
            setForm({ title: '', message: '', target: 'All' });

        } catch (e) {
            console.error("Post failed:", e);
            alert("Failed to post announcement.");
        }
        setSending(false);
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Delete this announcement?") || !supabase) return;
        try {
            await supabase
                .from('announcements')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);

            setAnnouncements(prev => prev.filter(a => a.id !== id));
            if (logAction) await logAction('Delete Announcement', 'Removed a post');
        } catch (e) {
            console.error("Delete failed:", e);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading News...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Composer */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Megaphone size={18} className="text-indigo-600"/> Post New Announcement
                </h3>

                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-bold"
                                placeholder="Headline / Title"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>
                        <div className="sm:w-1/4">
                            <select
                                className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white cursor-pointer"
                                value={form.target}
                                onChange={e => setForm({...form, target: e.target.value})}
                            >
                                <option value="All">Everyone</option>
                                <option value="Student">Students Only</option>
                                <option value="EDUStaff">Staff Only</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white min-h-[100px]"
                        placeholder="Write your message here..."
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handlePost}
                            disabled={sending || !form.title}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition"
                        >
                            {sending ? 'Posting...' : <><Send size={16}/> Post Announcement</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 border-2 border-dashed dark:border-gray-700 rounded-xl">
                        No announcements yet.
                    </div>
                ) : (
                    announcements.map(post => (
                        <div key={post.id} className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-lg font-bold dark:text-white">{post.title}</h4>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1">
                                            <User size={12}/> {post.authorName}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            {post.target === 'All' ? <Users size={12}/> : <Shield size={12}/>}
                                            {post.target}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                                    title="Delete Post"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>

                            <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                                {post.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
