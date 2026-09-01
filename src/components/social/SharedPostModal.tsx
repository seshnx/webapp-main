import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, MessageCircle, Share2, Bookmark, DollarSign,
  Sparkles, Smile, User, Send, Music, Loader2, ArrowLeft,
  Volume2, ExternalLink, Link2, Check, Edit3, FileEdit, Trash2, MoreHorizontal
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import UserAvatar from '../shared/UserAvatar';
import AudioWaveformPlayer from './AudioWaveformPlayer';
import CommentSection from './CommentSection';
import TipModal from './TipModal';
import PostEditAmendModal from './PostEditAmendModal';
import AuthPromptModal from '../shared/AuthPromptModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const detectMediaType = (url: string): 'image' | 'video' | 'audio' => {
  if (!url || typeof url !== 'string') return 'image';
  const path = url.split('?')[0].toLowerCase();
  if (/\.(mp4|webm|mov|avi|mkv|m4v)(\/|$)/i.test(path) || path.includes('/video') || path.includes('video/')) return 'video';
  if (/\.(mp3|wav|ogg|aac|flac|m4a|wma)(\/|$)/i.test(path) || path.includes('/audio') || path.includes('audio/')) return 'audio';
  return 'image';
};

const normalizePostAttachments = (p: any): Array<{ url: string; type: 'image' | 'video' | 'audio'; name?: string }> => {
  if (!p) return [];

  // 1. Structured attachments
  if (Array.isArray(p.attachments) && p.attachments.length > 0) {
    return p.attachments.map((att: any, idx: number) => ({
      url: typeof att === 'string' ? att : att.url,
      type: (typeof att === 'object' && att.type) ? att.type : detectMediaType(typeof att === 'string' ? att : att.url),
      name: typeof att === 'object' ? att.name : `Attachment ${idx + 1}`,
    })).filter((a: any) => Boolean(a.url));
  }

  // 2. mediaAttachments array
  if (Array.isArray(p.mediaAttachments) && p.mediaAttachments.length > 0) {
    return p.mediaAttachments.map((att: any, idx: number) => ({
      url: att.url,
      type: att.type || detectMediaType(att.url),
      name: att.name || `Attachment ${idx + 1}`,
    })).filter((a: any) => Boolean(a.url));
  }

  // 3. mediaUrls array
  if (Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0) {
    return p.mediaUrls.map((url: string, idx: number) => ({
      url,
      type: detectMediaType(url),
      name: `Attachment ${idx + 1}`,
    })).filter((a: any) => Boolean(a.url));
  }

  // 4. Single properties
  const list: Array<{ url: string; type: 'image' | 'video' | 'audio'; name?: string }> = [];
  if (p.audioUrl) {
    list.push({ url: p.audioUrl, type: 'audio', name: p.audioName || 'Audio Track' });
  }
  if (p.imageUrl) {
    list.push({ url: p.imageUrl, type: 'image', name: 'Image' });
  }
  if (p.videoUrl) {
    list.push({ url: p.videoUrl, type: 'video', name: 'Video' });
  }
  return list;
};

const renderText = (text: string | undefined) => {
  if (!text) return null;
  return text.split(/(\s+)/).map((part, i) => {
    if (part.match(/^#\w+/)) return <span key={i} className="text-brand-blue font-bold">{part}</span>;
    if (part.match(/^@\w+/)) return <span key={i} className="text-brand-blue font-bold">{part}</span>;
    return part;
  });
};

const REACTION_SET = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface SharedPostModalProps {
  postId: string;
  currentUser?: any;
  currentUserData?: any;
  onClose: () => void;
  openPublicProfile?: (userId: string) => void;
}

export default function SharedPostModal({
  postId,
  currentUser,
  currentUserData,
  onClose,
  openPublicProfile,
}: SharedPostModalProps) {
  const navigate = useNavigate();
  const userId = currentUser?.id || currentUser?.uid;
  const isAuthenticated = !!userId;

  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authActionText, setAuthActionText] = useState('interact with this post');
  const [showTipModal, setShowTipModal] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [showEditAmendModal, setShowEditAmendModal] = useState(false);
  const [editAmendMode, setEditAmendMode] = useState<'edit' | 'amend'>('edit');
  const [linkCopied, setLinkCopied] = useState(false);

  // Convex Queries
  const post = useQuery(api.posts.get, { postId });
  const convexReactions = useQuery(
    api.social.getReactions,
    postId ? { targetId: postId, targetType: 'post' } : 'skip'
  );
  const myReactionData = useQuery(
    api.social.hasReacted,
    userId && postId ? { clerkId: userId, targetId: postId, targetType: 'post' } : 'skip'
  );
  const isSavedQuery = useQuery(
    api.social.isSaved,
    userId && postId ? { clerkId: userId, postId: postId as Id<'posts'> } : 'skip'
  );

  // Author & Owner check
  const authorClerkId = (post as any)?.authorClerkId || (post as any)?.clerkId;
  const authorDocId = (post as any)?.authorId || (post as any)?.userId;
  const isOwnPost = Boolean(
    (userId && (userId === authorClerkId || userId === (post as any)?.userId)) ||
    (currentUserData && authorDocId && (currentUserData._id === authorDocId || currentUserData.clerkId === authorClerkId))
  );

  const postCreatedAt = (post as any)?.createdAt || (post as any)?._creationTime;
  const postAgeMs = postCreatedAt ? (Date.now() - new Date(postCreatedAt).getTime()) : 0;
  const canEditOriginal = isOwnPost && postAgeMs <= 30 * 60 * 1000;

  // Normalize post body text and attachments from Convex schema
  const postText = post?.content || post?.text || '';
  const attachments: Array<{ url: string; type: 'image' | 'video' | 'audio'; name?: string }> =
    (post as any)?.mediaAttachments || (post as any)?.attachments || (
      (post as any)?.mediaUrls ? (post as any).mediaUrls.map((url: string) => ({
        url,
        type: url.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i) ? 'audio' : (url.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? 'video' : 'image'),
        name: 'Attachment',
      })) : ((post as any)?.imageUrl ? [{ url: (post as any).imageUrl, type: 'image', name: 'Image' }] : [])
    );
  const audioAttachment = attachments.find((a) => a.type === 'audio');
  const audioUrl = (post as any)?.audioUrl || audioAttachment?.url;
  const audioName = (post as any)?.audioName || audioAttachment?.name || 'Audio Track';
  const nonAudioAttachments = attachments.filter((a) => a.type !== 'audio');

  // Convex Mutations
  const toggleReactionMutation = useMutation(api.social.toggleReaction);
  const savePostMutation = useMutation(api.social.savePost);
  const unsavePostMutation = useMutation(api.social.unsavePost);
  const createCommentMutation = useMutation(api.comments.createComment);
  const deletePostMutation = useMutation(api.social.deletePost);

  const handleDeletePost = async () => {
    if (!isOwnPost || !userId) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePostMutation({
        postId: postId as Id<'posts'>,
        authorId: userId,
      });
      toast.success('Post deleted successfully');
      handleCloseModal();
    } catch (e) {
      console.error('Delete failed:', e);
      toast.error("Couldn't delete post");
    }
  };

  const requireAuth = (action: string): boolean => {
    if (!isAuthenticated) {
      setAuthActionText(action);
      setAuthPromptOpen(true);
      return false;
    }
    return true;
  };

  const handleToggleReaction = async (emoji: string) => {
    if (!requireAuth(`react with ${emoji}`)) return;
    try {
      await toggleReactionMutation({
        userId,
        targetId: postId,
        targetType: 'post',
        emoji,
      });
      setShowReactionMenu(false);
    } catch (err) {
      console.warn('Failed to toggle reaction:', err);
    }
  };

  const handleToggleSave = async () => {
    if (!requireAuth('bookmark this post')) return;
    try {
      if (isSavedQuery) {
        await unsavePostMutation({ userId, postId: postId as Id<'posts'> });
        toast.success('Removed from bookmarks');
      } else {
        await savePostMutation({ userId, postId: postId as Id<'posts'> });
        toast.success('Saved to bookmarks');
      }
    } catch (err) {
      console.warn('Failed to toggle save:', err);
    }
  };

  const handleTip = () => {
    if (!requireAuth('tip this creator')) return;
    setShowTipModal(true);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setLinkCopied(true);
      toast.success('Post link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const [isOpen, setIsOpen] = useState(true);

  // Sync isOpen if postId changes
  useEffect(() => {
    setIsOpen(true);
  }, [postId]);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
    sessionStorage.removeItem('seshnx_pending_post_modal');
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseModal]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div
        onClick={handleCloseModal}
        className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-white my-auto max-h-[92vh] relative cursor-default"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900/60 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Shared Post
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                  /post/{postId.slice(0, 8)}...
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isOwnPost && (
                <div className="relative">
                  <button
                    onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                    className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-1 text-xs"
                    title="Post options"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  <AnimatePresence>
                    {showOwnerMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 top-full mt-1 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-30"
                      >
                        {canEditOriginal ? (
                          <button
                            onClick={() => {
                              setEditAmendMode('edit');
                              setShowEditAmendModal(true);
                              setShowOwnerMenu(false);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-gray-700 transition text-brand-blue"
                          >
                            <Edit3 size={14} />
                            <span>Edit post</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditAmendMode('amend');
                              setShowEditAmendModal(true);
                              setShowOwnerMenu(false);
                              toast('Original editing closed after 30 mins. Opening amendment.', { icon: 'ℹ️' });
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-gray-700 transition text-gray-400"
                          >
                            <Edit3 size={14} />
                            <div className="flex flex-col">
                              <span>Edit post</span>
                              <span className="text-[9px] text-amber-400 font-medium">30m limit (Amend)</span>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditAmendMode('amend');
                            setShowEditAmendModal(true);
                            setShowOwnerMenu(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-gray-700 transition text-emerald-400"
                        >
                          <FileEdit size={14} />
                          <span>Add amendment</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowOwnerMenu(false);
                            handleDeletePost();
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-gray-700 transition text-red-400"
                        >
                          <Trash2 size={14} />
                          <span>Delete post</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={handleCopyLink}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-1 text-xs"
                title="Copy share link"
              >
                {linkCopied ? <Check size={16} className="text-emerald-400" /> : <Link2 size={16} />}
                <span className="hidden sm:inline text-[11px]">Share</span>
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
                aria-label="Close post"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-1">
            {post === undefined ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                <Loader2 size={32} className="animate-spin text-brand-blue" />
                <span className="text-xs font-semibold">Loading post...</span>
              </div>
            ) : post === null ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                  <X size={24} />
                </div>
                <h4 className="font-bold text-base text-white">Post Not Found</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  This post may have been deleted or the link is invalid.
                </p>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition mt-2"
                >
                  Return to Feed
                </button>
              </div>
            ) : (
              <>
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-pointer"
                      onClick={() => openPublicProfile && post.authorId && openPublicProfile(post.authorId)}
                    >
                      <UserAvatar src={post.authorPhoto} name={post.displayName || post.authorName} size="md" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white hover:underline cursor-pointer">
                          {post.displayName || post.authorName || 'Creator'}
                        </span>
                        {post.role && (
                          <span className="text-[10px] font-bold bg-brand-blue/20 text-blue-300 border border-brand-blue/30 px-2 py-0.2 rounded-full">
                            {post.role}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span>@{post.username || post.authorUsername || 'user'} •{' '}
                        {new Date(post.createdAt || post._creationTime || Date.now()).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                        {post.isEdited && (
                          <span className="text-[10px] text-gray-500 italic">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tip Creator Action */}
                  <button
                    onClick={handleTip}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <DollarSign size={14} />
                    <span>Tip</span>
                  </button>
                </div>

                {/* Category & Tags */}
                {((post as any)?.category || (post as any)?.hashtags?.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(post as any)?.category && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-blue/15 text-blue-300 border border-brand-blue/30">
                        {(post as any).category}
                      </span>
                    )}
                    {(post as any)?.hashtags?.map((tag: string, i: number) => (
                      <span key={i} className="text-xs font-semibold text-brand-blue">
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Body Text */}
                {postText && (
                  <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {renderText(postText)}
                  </p>
                )}

                {/* Audio Track Player */}
                {audioUrl && (
                  <div className="mt-2">
                    <AudioWaveformPlayer
                      audioUrl={audioUrl}
                      title={audioName}
                      gearUsed={(post as any)?.equipment || (post as any)?.software}
                    />
                  </div>
                )}

                {/* Images & Video Attachments */}
                {nonAudioAttachments && nonAudioAttachments.length > 0 && (
                  <div className={`grid gap-2 pt-1 ${nonAudioAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {nonAudioAttachments.map((att: any, idx: number) => {
                      if (att.type === 'image') {
                        return (
                          <div key={idx} className="rounded-2xl overflow-hidden border border-gray-800 bg-black/40">
                            <img
                              src={att.url}
                              alt={att.name || 'Post attachment'}
                              className="w-full max-h-96 object-contain"
                              loading="lazy"
                            />
                          </div>
                        );
                      }
                      if (att.type === 'video') {
                        return (
                          <div key={idx} className="rounded-2xl overflow-hidden border border-gray-800 bg-black">
                            <video src={att.url} controls className="w-full max-h-96" />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {/* Equipment & Software Tags */}
                {((post as any)?.equipment?.length > 0 || (post as any)?.software?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-gray-400">
                    {(post as any)?.equipment?.map((gear: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800/80 border border-gray-700/60 rounded-md text-gray-300">
                        🎛️ {gear}
                      </span>
                    ))}
                    {(post as any)?.software?.map((sw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800/80 border border-gray-700/60 rounded-md text-gray-300">
                        💻 {sw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Embedded Original Post Card (For Reposts) */}
                {(post as any)?.originalPost && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-gray-800/50 border border-gray-700/80 space-y-2.5">
                    {(post as any).originalPost.isDeleted ? (
                      <div className="text-xs text-gray-400 italic py-1 flex items-center gap-2">
                        <Trash2 size={13} className="text-gray-400" />
                        <span>This original post is no longer available.</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar
                              src={(post as any).originalPost.authorPhoto}
                              name={(post as any).originalPost.displayName || (post as any).originalPost.authorName}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-white truncate">
                                  {(post as any).originalPost.displayName || (post as any).originalPost.authorName || 'Creator'}
                                </span>
                                {(post as any).originalPost.role && (
                                  <span className="text-[10px] font-semibold bg-brand-blue/20 text-blue-300 border border-brand-blue/30 px-1.5 py-0.2 rounded-md">
                                    {(post as any).originalPost.role}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                @{(post as any).originalPost.username || (post as any).originalPost.authorUsername || 'user'}
                              </span>
                            </div>
                          </div>

                          {/* View Original Button */}
                          <button
                            onClick={() => {
                              const origId = (post as any).originalPost._id || (post as any).originalPost.id || (post as any).repostOf;
                              if (origId) {
                                navigate(`/post/${origId}`);
                              }
                            }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:text-blue-400 transition px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 shrink-0"
                            title="View original post"
                          >
                            <ExternalLink size={12} />
                            <span>View Original</span>
                          </button>
                        </div>

                        {((post as any).originalPost.content || (post as any).originalPost.text) && (
                          <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {renderText((post as any).originalPost.content || (post as any).originalPost.text)}
                          </p>
                        )}

                        {/* Original Attachments */}
                        {(() => {
                          const origAttachments = normalizePostAttachments((post as any).originalPost);
                          const origAudios = origAttachments.filter((a) => a.type === 'audio');
                          const origNonAudios = origAttachments.filter((a) => a.type !== 'audio');

                          return (
                            <>
                              {/* Audio Tracks */}
                              {origAudios.map((att, i) => (
                                <div key={i} className="w-full">
                                  <AudioWaveformPlayer
                                    audioUrl={att.url}
                                    title={att.name || (post as any).originalPost.audioName || 'Audio Track'}
                                    gearUsed={(post as any).originalPost.equipment || (post as any).originalPost.software}
                                  />
                                </div>
                              ))}

                              {/* Images & Video */}
                              {origNonAudios.length > 0 && (
                                <div className={`grid gap-2 rounded-xl overflow-hidden ${origNonAudios.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                  {origNonAudios.map((att, idx) => (
                                    <div key={idx} className="rounded-xl overflow-hidden bg-black/40 border border-gray-800">
                                      {att.type === 'image' ? (
                                        <img
                                          src={att.url}
                                          alt={att.name || 'Attachment'}
                                          className="w-full max-h-72 object-contain"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <video src={att.url} controls className="w-full max-h-72 bg-black" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}

                {/* Amendments List */}
                {(post as any)?.amendments && (post as any).amendments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                    <div className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                      <FileEdit size={13} />
                      Amendments ({(post as any).amendments.length})
                    </div>
                    {(post as any).amendments.map((amendment: any, index: number) => (
                      <div
                        key={index}
                        className="bg-emerald-950/25 border border-emerald-800/40 rounded-xl p-3 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span className="font-semibold text-emerald-300">
                            Amendment #{index + 1}
                          </span>
                          <span>
                            {amendment.createdAt
                              ? new Date(amendment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                              : 'Recent'}
                          </span>
                        </div>
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                          {renderText(amendment.text)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions & Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-gray-400 text-xs">
                  {/* Reactions group */}
                  <div className="relative flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleReaction('❤️')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                        Boolean(myReactionData && typeof myReactionData === 'object' && 'reacted' in myReactionData && myReactionData.reacted)
                          ? 'bg-rose-500/20 text-rose-400 font-bold'
                          : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <Heart
                        size={15}
                        className={
                          Boolean(myReactionData && typeof myReactionData === 'object' && 'reacted' in myReactionData && myReactionData.reacted)
                            ? 'fill-rose-400 text-rose-400'
                            : ''
                        }
                      />
                      <span>{Array.isArray(convexReactions) ? convexReactions.length : (post.reactionCount || 0)}</span>
                    </button>

                    {/* Emoji Reaction Selector */}
                    <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-xl border border-gray-700/40">
                      {REACTION_SET.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(emoji)}
                          className="p-1 hover:scale-125 transition text-xs"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                      isSavedQuery
                        ? 'bg-brand-blue/20 text-blue-300 font-bold'
                        : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Bookmark size={15} className={isSavedQuery ? 'fill-brand-blue text-brand-blue' : ''} />
                    <span className="hidden sm:inline">{isSavedQuery ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                {/* Comment Section */}
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <h4 className="font-bold text-xs text-gray-400 flex items-center gap-2">
                    <MessageCircle size={14} className="text-brand-blue" />
                    Comments
                  </h4>

                  <CommentSection
                    post={{
                      id: postId,
                      userId: post.userId || post.authorId || '',
                      text: post.text,
                      ...post,
                    }}
                    currentUser={currentUser}
                    currentUserData={currentUserData}
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Auth Prompt Modal for unauthenticated actions */}
        {authPromptOpen && (
          <AuthPromptModal
            isOpen={authPromptOpen}
            onClose={() => setAuthPromptOpen(false)}
            onConfirmSignIn={() => {
              if (postId) {
                sessionStorage.setItem('seshnx_pending_post_modal', postId);
              }
              setAuthPromptOpen(false);
              onClose();
            }}
            actionText={authActionText}
            creatorName={post?.displayName || post?.authorName}
            postId={postId}
          />
        )}

        {/* Tip Modal */}
        {showTipModal && post && (
          <TipModal
            creatorName={post.displayName || post.authorName || 'Creator'}
            creatorPhoto={post.authorPhoto}
            creatorUserId={post.authorId}
            currentUser={currentUser}
            onClose={() => setShowTipModal(false)}
          />
        )}

        {/* Edit / Amend Modal */}
        {isOwnPost && userId && post && (
          <PostEditAmendModal
            isOpen={showEditAmendModal}
            mode={editAmendMode}
            postId={postId}
            authorId={userId}
            initialContent={postText}
            postCreatedAt={postCreatedAt}
            onClose={() => setShowEditAmendModal(false)}
          />
        )}
      </div>
    </AnimatePresence>,
    document.body
  );
}
