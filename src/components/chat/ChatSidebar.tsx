import React, { useState, useMemo } from 'react';
import { Users, Plus, X, Search, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isConvexAvailable } from '../../config/convex';
import ConversationItem from './ConversationItem';
import UserAvatar from '../shared/UserAvatar';
import ProfileSelectionModal from '../shared/ProfileSelectionModal';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Search result interface
 */
interface SearchResult {
    id: string;
    clerkId?: string;
    convexId?: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    photoURL?: string;
    role?: string;
    username?: string;
}

/**
 * Group member interface
 */
interface GroupMember {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    photoURL?: string;
    [key: string]: any;
}

/**
 * Conversation interface
 */
interface Conversation {
    id: string;
    uid?: string;
    name?: string;
    type: 'direct' | 'group';
    profileRole?: string;
    [key: string]: any;
}

/**
 * ChatSidebar props
 */
export interface ChatSidebarProps {
    user?: any;
    userData?: any;
    subProfiles?: Record<string, any>;
    conversations?: Conversation[];
    activeChat?: Conversation | null;
    onSelectChat?: (chat: Conversation | null) => void;
}

export default function ChatSidebar({ user, userData, subProfiles = {}, conversations = [], activeChat, onSelectChat }: ChatSidebarProps) {
    const { t } = useLanguage();

    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [pendingChatTarget, setPendingChatTarget] = useState<SearchResult | null>(null);
    const [selectedChatProfile, setSelectedChatProfile] = useState<string | null>(null);
    const [searchMode, setSearchMode] = useState<'direct' | 'add_member'>('direct');
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const [groupName, setGroupName] = useState<string>('');
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Convex mutations
    const createGroupChatMutation = useMutation(api.conversations.createGroupChat);
    const deleteConversationMutation = useMutation(api.conversations.deleteConversation);

    // Current user identifier
    const currentUserId = user?.id || user?.uid;

    // Search users query via Convex
    const searchUsersData = useQuery(
        api.users.searchUsers,
        showSearch ? { searchText: searchQuery.trim(), limit: 30 } : "skip"
    );

    // Map and filter results
    const searchResults: SearchResult[] = useMemo(() => {
        if (!searchUsersData) return [];
        return searchUsersData
            .filter((u: any) => u.clerkId !== currentUserId && u._id !== currentUserId)
            .map((u: any) => ({
                id: u.clerkId || u._id,
                clerkId: u.clerkId,
                convexId: u._id,
                firstName: u.firstName || u.displayName?.split(' ')[0] || u.username || 'User',
                lastName: u.lastName || u.displayName?.split(' ').slice(1).join(' ') || '',
                displayName: u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User',
                photoURL: u.profilePhoto || u.imageUrl || u.avatarUrl,
                role: u.activeProfileRole || (Array.isArray(u.accountTypes) ? u.accountTypes[0] : u.accountTypes) || 'Creator',
                username: u.username
            }));
    }, [searchUsersData, currentUserId]);

    const handleSelectSearchResult = (result: SearchResult) => {
        const userId = user?.id || user?.uid;
        if (searchMode === 'direct') {
            const targetUserId = result.clerkId || result.id;
            const chatId = [userId, targetUserId].sort().join('_');
            const targetName = result.displayName || `${result.firstName} ${result.lastName}`.trim() || result.username || 'User';
            const currentRole = userData?.activeProfileRole || (Array.isArray(userData?.accountTypes) ? userData.accountTypes[0] : 'User');

            onSelectChat?.({
                id: chatId,
                uid: targetUserId,
                name: targetName,
                type: 'direct',
                profileRole: currentRole,
                photo: result.photoURL
            });
            closeSearch();
        } else if (searchMode === 'add_member') {
            if (!groupMembers.find(m => m.id === result.id)) {
                setGroupMembers(prev => [...prev, result as GroupMember]);
            }
            closeSearch();
        }
    };

    const handleProfileConfirmed = (role: string) => {
        setSelectedChatProfile(role);
        if (pendingChatTarget) {
            const userId = user?.id || user?.uid;
            const targetUserId = pendingChatTarget.clerkId || pendingChatTarget.id;
            const chatId = [userId, targetUserId].sort().join('_');
            const targetName = pendingChatTarget.displayName || `${pendingChatTarget.firstName} ${pendingChatTarget.lastName}`.trim() || pendingChatTarget.username || 'User';
            onSelectChat?.({
                id: chatId,
                uid: targetUserId,
                name: targetName,
                type: 'direct',
                profileRole: role,
                photo: pendingChatTarget.photoURL
            });
            setPendingChatTarget(null);
        }
        closeSearch();
    };

    const closeSearch = () => {
        setShowSearch(false);
        setSearchQuery('');
    };

    const openGroupModal = () => {
        setGroupName('');
        setGroupMembers([]);
        setShowGroupModal(true);
    };

    const handleAddMemberClick = () => {
        setSearchMode('add_member');
        setShowSearch(true);
    };

    const handleCreateGroup = async () => {
        if (!groupName || groupMembers.length === 0) return alert("Name and members required.");
        if (!isConvexAvailable()) {
            alert("Chat functionality is not available. Convex is not configured.");
            return;
        }
        setIsCreating(true);

        try {
            const userId = user?.id || user?.uid;
            const memberIds = groupMembers.map(m => m.id);
            const { chatId: newGroupId } = await createGroupChatMutation({
                creatorId: userId,
                chatName: groupName,
                memberIds,
            });

            setShowGroupModal(false);
            onSelectChat?.({ id: newGroupId, name: groupName, type: 'group' });

        } catch (e: any) {
            console.error("Group creation failed", e);
            alert("Group creation failed: " + e.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (!window.confirm("Delete this conversation?")) return;
        if (!isConvexAvailable()) {
            alert("Chat functionality is not available. Convex is not configured.");
            return;
        }
        try {
            const userId = user?.id || user?.uid;
            await deleteConversationMutation({ userId, chatId });
            if (activeChat?.id === chatId) onSelectChat?.(null);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#1f2128]">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f] shrink-0">
                <h2 className="font-extrabold text-lg dark:text-white tracking-tight">{t('messages')}</h2>
                <div className="flex gap-2">
                    <button onClick={openGroupModal} className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:text-brand-blue transition" title={t('newGroup')}><Users size={18}/></button>
                    <button onClick={() => { setSearchMode('direct'); setShowSearch(true); }} className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:text-brand-blue transition" title={t('newMessage')}><Plus size={18}/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.map(c => (
                    <ConversationItem
                        key={c.id}
                        conversation={c}
                        activeChat={activeChat}
                        currentUserId={user?.id || user?.uid}
                        onSelect={onSelectChat || (() => {})}
                        onDelete={(chatId) => {
                            if (window.confirm("Delete this conversation?")) {
                                handleDeleteChat({ stopPropagation: () => {} } as React.MouseEvent, chatId);
                            }
                        }}
                    />
                ))}
            </div>

            {/* Group Modal */}
            {showGroupModal && (
                <div className="absolute inset-0 bg-white dark:bg-[#1f2128] z-20 flex flex-col animate-in slide-in-from-right-10 duration-200">
                    <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-[#23262f]">
                        <button onClick={() => setShowGroupModal(false)} className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full"><ArrowLeft size={20}/></button>
                        <h3 className="font-bold dark:text-white">{t('newGroup')}</h3>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. {t('groupName')}</label>
                            <input
                                className="w-full p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                                placeholder={t('groupName') + '...'}
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">2. {t('addMembers')} ({groupMembers.length})</label>
                                <button onClick={handleAddMemberClick} className="text-xs font-bold text-brand-blue flex items-center gap-1 hover:underline"><Plus size={14}/> {t('addMembers')}</button>
                            </div>
                            <div className="space-y-2">
                                {groupMembers.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed dark:border-gray-700 rounded-xl text-gray-400 text-sm">{t('noMembersSelected')}</div>
                                ) : (
                                    groupMembers.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar src={m.photoURL} name={m.firstName} size="sm" />
                                                <span className="text-sm font-bold dark:text-white">{m.firstName} {m.lastName}</span>
                                            </div>
                                            <button onClick={() => setGroupMembers(prev => prev.filter(p => p.id !== m.id))} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t dark:border-gray-700">
                        <button onClick={handleCreateGroup} disabled={!groupName || groupMembers.length === 0 || isCreating} className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex justify-center items-center gap-2">
                            {isCreating ? <Loader2 className="animate-spin" size={20}/> : <>{t('createGroup')} <ChevronRight size={18}/></>}
                        </button>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {showSearch && (
                <div className="absolute inset-0 bg-white dark:bg-[#1f2128] z-30 flex flex-col animate-in fade-in duration-200">
                    <div className="p-3 border-b dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-[#1f2128]">
                        <Search size={18} className="text-gray-400 ml-2"/>
                        <input
                            autoFocus
                            className="flex-1 p-2 bg-transparent outline-none dark:text-white placeholder-gray-400 text-sm"
                            placeholder="Search creators, producers, engineers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchUsersData === undefined && (
                            <Loader2 size={16} className="animate-spin text-brand-blue mr-1" />
                        )}
                        <button onClick={closeSearch} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <X size={20} className="text-gray-500"/>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {searchResults.length === 0 && searchUsersData !== undefined && searchQuery.length > 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">{t('noUsersFound')}.</div>
                        )}
                        {searchResults.length === 0 && searchUsersData !== undefined && searchQuery.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">Type a name, handle, or specialty to search.</div>
                        )}
                        {searchResults.map(res => {
                            const isSelected = searchMode === 'add_member' && groupMembers.find(m => m.id === res.id);
                            return (
                                <div
                                    key={res.id}
                                    onClick={() => handleSelectSearchResult(res)}
                                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition mb-1 ${isSelected ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <UserAvatar src={res.photoURL} name={res.displayName || res.firstName} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold dark:text-white truncate">
                                            {res.displayName || `${res.firstName} ${res.lastName}`.trim()}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                                            {res.username && <span>@{res.username}</span>}
                                            {res.username && res.role && <span>•</span>}
                                            <span className="text-brand-blue font-medium">{res.role || 'Creator'}</span>
                                        </div>
                                    </div>
                                    {searchMode === 'add_member' && <Plus size={18} className="text-brand-blue shrink-0"/>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Profile Selection Modal */}
            <ProfileSelectionModal
                show={showProfileModal}
                onConfirm={handleProfileConfirmed}
                onCancel={() => {
                    setShowProfileModal(false);
                    setPendingChatTarget(null);
                }}
                userData={userData}
                subProfiles={subProfiles}
                title="Select Chat Profile"
                message={`You're starting a chat with ${pendingChatTarget?.firstName || 'this user'}. Which profile would you like to use?`}
                excludeRoles={['Fan', 'User']}
            />
        </div>
    );
}
