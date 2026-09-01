/**
 * Avatar & Identity Resolution Utility
 *
 * Centralizes avatar URL and display name resolution across:
 * - Per-Profile Persona avatars & logos (Studio logo, Producer photo, Engineer avatar, etc.)
 * - Per-Profile Display Names (Studio name, Artist stage name, Business title)
 * - Global Convex user document records (userData.avatarUrl, userData.photoURL)
 * - Global Clerk OAuth pulled profile image (Google / Apple account user.imageUrl)
 * - Graceful fallbacks (color-hashed initials, icons)
 */

export interface AvatarResolvable {
    imageUrl?: string | null;
    photoURL?: string | null;
    avatarUrl?: string | null;
    photoUrl?: string | null;
    photo_url?: string | null;
    logoUrl?: string | null;
    logo_url?: string | null;
    profileImageUrl?: string | null;
    profilePhoto?: string | null;
    image?: string | null;
    avatar?: string | null;
    authorPhoto?: string | null;
    profile_data?: {
        photoURL?: string | null;
        photoUrl?: string | null;
        photo_url?: string | null;
        avatarUrl?: string | null;
        logoUrl?: string | null;
        logo_url?: string | null;
        imageUrl?: string | null;
        [key: string]: any;
    };
    [key: string]: any;
}

/**
 * Resolves the best available avatar URL in order of specificity:
 * 1. Explicit source URL string
 * 2. Active per-profile persona avatar/logo (e.g. Studio logo, Producer photo)
 * 3. Convex user document avatar (userData.avatarUrl, userData.photoURL, etc.)
 * 4. Clerk user object / OAuth pulled image (user.imageUrl)
 *
 * @param src - Direct image URL if provided
 * @param userData - Convex user record
 * @param user - Clerk user record
 * @param subProfile - Active subprofile persona record
 * @returns Best available image URL string or undefined
 */
export function getUserAvatarUrl(
    src?: string | null,
    userData?: AvatarResolvable | null,
    user?: AvatarResolvable | null,
    subProfile?: AvatarResolvable | null
): string | undefined {
    // 1. Direct explicit src passed
    if (src && typeof src === 'string' && src.trim() !== '') {
        return src.trim();
    }

    // 2. Check active per-profile persona (e.g. Studio logo, Artist avatar)
    // If avatarPreference is explicitly 'global', bypass to global avatar
    if (subProfile && subProfile.avatarPreference !== 'global') {
        const subUrl =
            subProfile.photoUrl ||
            subProfile.photo_url ||
            subProfile.logoUrl ||
            subProfile.logo_url ||
            subProfile.avatarUrl ||
            subProfile.photoURL ||
            subProfile.imageUrl ||
            subProfile.profile_data?.photoUrl ||
            subProfile.profile_data?.photoURL ||
            subProfile.profile_data?.photo_url ||
            subProfile.profile_data?.logoUrl ||
            subProfile.profile_data?.logo_url ||
            subProfile.profile_data?.avatarUrl ||
            subProfile.profile_data?.imageUrl;

        if (subUrl && typeof subUrl === 'string' && subUrl.trim() !== '') {
            return subUrl.trim();
        }
    }

    // 3. Check Convex user document (global user avatar)
    if (userData) {
        if (typeof userData === 'string' && (userData as string).trim() !== '') {
            return (userData as string).trim();
        }

        const convexUrl =
            userData.avatarUrl ||
            userData.photoURL ||
            userData.imageUrl ||
            userData.photoUrl ||
            userData.photo_url ||
            userData.logoUrl ||
            userData.profileImageUrl ||
            userData.profilePhoto ||
            userData.image ||
            userData.avatar ||
            userData.authorPhoto;

        if (convexUrl && typeof convexUrl === 'string' && convexUrl.trim() !== '') {
            return convexUrl.trim();
        }
    }

    // 4. Check Clerk user object (global Google/OAuth pulled photo)
    if (user) {
        if (typeof user === 'string' && (user as string).trim() !== '') {
            return (user as string).trim();
        }

        const clerkUrl =
            user.imageUrl ||
            user.avatarUrl ||
            user.photoURL ||
            user.profileImageUrl ||
            user.photoUrl;

        if (clerkUrl && typeof clerkUrl === 'string' && clerkUrl.trim() !== '') {
            return clerkUrl.trim();
        }
    }

    return undefined;
}

/**
 * Resolves the best available display name from multiple possible data sources:
 * 1. Active per-profile persona name (Studio name, Stage name, Producer alias)
 * 2. Convex user document (global displayName / profileName)
 * 3. Clerk user object (global Google / Clerk full name or username)
 */
export function getUserDisplayName(
    userData?: any,
    user?: any,
    subProfile?: any
): string {
    // 1. Per-profile persona display name (e.g. Studio name, Stage name)
    if (subProfile) {
        const subName =
            subProfile.displayName ||
            subProfile.customDisplayName ||
            subProfile.display_name ||
            subProfile.name ||
            subProfile.profile_data?.displayName ||
            subProfile.profile_data?.customDisplayName ||
            subProfile.profile_data?.display_name ||
            subProfile.profile_data?.name;

        if (subName && typeof subName === 'string' && subName.trim() !== '') {
            return subName.trim();
        }
    }

    // 2. Convex user document (global displayName / profileName)
    if (userData) {
        const convexName =
            userData.displayName ||
            userData.effectiveDisplayName ||
            userData.profileName ||
            [userData.firstName, userData.lastName].filter(Boolean).join(' ') ||
            userData.username ||
            userData.name;

        if (convexName && typeof convexName === 'string' && convexName.trim() !== '') {
            return convexName.trim();
        }
    }

    // 3. Clerk user object (global Google / Clerk account name)
    if (user) {
        const clerkName =
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
            user.username ||
            user.primaryEmailAddress?.emailAddress?.split('@')[0];

        if (clerkName && typeof clerkName === 'string' && clerkName.trim() !== '') {
            return clerkName.trim();
        }
    }

    return 'User';
}
