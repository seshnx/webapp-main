const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AuthWizard-Yt1DFLjE.js","assets/edu-BMUxkX2v.js","assets/vendor-Dl7DtIXW.js","assets/vendor-D33SxI2g.css","assets/chat-BYF7Vx2D.js","assets/vendor-framer-CUELlS5e.js","assets/config-DGZTEYpI.js","assets/vendor-maps-C5QNFLlQ.js","assets/vendor-maps-Dgihpmma.css","assets/SeshNx-PNG cCropped white text-BVqTFh8v.js","assets/AppRoutes-D-93kSDE.js","assets/MainLayout-DyntEdBV.js"])))=>i.map(i=>d[i]);
var q=Object.defineProperty;var H=(e,r,s)=>r in e?q(e,r,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[r]=s;var C=(e,r,s)=>H(e,typeof r!="symbol"?r+"":r,s);import{r as u,bI as z,bJ as B,bK as J,bL as G,bM as Y,j as a,L as R,bN as V,R as K,ao as X,n as Q,G as Z,bO as ee,bP as te,bQ as se,bR as re,bS as ae}from"./vendor-Dl7DtIXW.js";import{_ as U}from"./edu-BMUxkX2v.js";import{L as oe,c as ne}from"./chat-BYF7Vx2D.js";import"./config-DGZTEYpI.js";import"./vendor-framer-CUELlS5e.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};e.SENTRY_RELEASE={id:"local"}}catch{}})();try{(function(){var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="6422d0f1-c228-44ab-b5bc-636a8e66ec5b",e._sentryDebugIdIdentifier="sentry-dbid-6422d0f1-c228-44ab-b5bc-636a8e66ec5b")})()}catch{}(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();function Ie(e,r){u.useEffect(()=>{var s,t,n;if(e){if(e.theme){const o=document.documentElement;e.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(o.classList.add("dark"),localStorage.setItem("theme","dark")):(o.classList.remove("dark"),localStorage.setItem("theme","light")):e.theme==="dark"?(o.classList.add("dark"),localStorage.setItem("theme","dark")):(o.classList.remove("dark"),localStorage.setItem("theme","light"))}if((s=e.accessibility)!=null&&s.fontSize){const o=document.documentElement,i={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};o.style.fontSize=i[e.accessibility.fontSize]||i.medium,localStorage.setItem("fontSize",e.accessibility.fontSize)}if(((t=e.accessibility)==null?void 0:t.reducedMotion)!==void 0){const o=document.documentElement;e.accessibility.reducedMotion?(o.classList.add("reduce-motion"),o.style.setProperty("--motion-duration","0s")):(o.classList.remove("reduce-motion"),o.style.removeProperty("--motion-duration")),localStorage.setItem("reducedMotion",e.accessibility.reducedMotion)}if(((n=e.accessibility)==null?void 0:n.highContrast)!==void 0){const o=document.documentElement;e.accessibility.highContrast?o.classList.add("high-contrast"):o.classList.remove("high-contrast"),localStorage.setItem("highContrast",e.accessibility.highContrast)}e.language&&(document.documentElement.lang=e.language,localStorage.setItem("language",e.language)),e.timezone&&e.timezone!=="auto"&&localStorage.setItem("timezone",e.timezone),e.currency&&localStorage.setItem("currency",e.currency),e.dateFormat&&localStorage.setItem("dateFormat",e.dateFormat),e.timeFormat&&localStorage.setItem("timeFormat",e.timeFormat),e.numberFormat&&localStorage.setItem("numberFormat",e.numberFormat),localStorage.setItem("userSettings",JSON.stringify(e))}},[e])}function ie(){if(typeof window>"u")return null;const e=localStorage.getItem("userSettings");if(e)try{return JSON.parse(e)}catch(r){console.error("Failed to parse stored settings:",r)}return null}console.error("❌ Neon: Missing database connection string in production");async function le(e,r=[]){throw new Error("Neon client is not configured. Check VITE_NEON_DATABASE_URL environment variable.")}const ce={getUserById:"SELECT * FROM clerk_users WHERE id = $1",getUserByEmail:"SELECT * FROM clerk_users WHERE email = $1",getUserByUsername:"SELECT * FROM clerk_users WHERE username = $1",getProfileByUserId:"SELECT * FROM profiles WHERE user_id = $1",getActiveProfile:`
    SELECT p.*, cu.active_role, cu.account_types
    FROM profiles p
    JOIN clerk_users cu ON p.user_id = cu.id
    WHERE p.user_id = $1
  `,getPosts:`
    SELECT p.*, cu.username, cu.email, sp.display_name, sp.photo_url
    FROM posts p
    JOIN clerk_users cu ON p.user_id = cu.id
    LEFT JOIN profiles sp ON sp.user_id = cu.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT $1
  `,getPostsByUser:`
    SELECT * FROM posts
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $2
  `,getPostById:"SELECT * FROM posts WHERE id = $1",getCommentsByPostId:`
    SELECT c.*, cu.username, sp.display_name, sp.photo_url
    FROM comments c
    JOIN clerk_users cu ON c.user_id = cu.id
    LEFT JOIN profiles sp ON sp.user_id = cu.id
    WHERE c.post_id = $1 AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
  `,getNotificationsByUserId:`
    SELECT * FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `,getUnreadNotificationsCount:`
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 AND read = false
  `,getBookingsByUser:`
    SELECT * FROM bookings
    WHERE (sender_id = $1 OR target_id = $1)
    ORDER BY created_at DESC
    LIMIT $2
  `,getBookingById:"SELECT * FROM bookings WHERE id = $1",getMarketItems:`
    SELECT mi.*, cu.username, sp.display_name
    FROM market_items mi
    JOIN clerk_users cu ON mi.seller_id = cu.id
    LEFT JOIN profiles sp ON sp.user_id = cu.id
    WHERE mi.status = 'active'
    ORDER BY mi.created_at DESC
    LIMIT $1
  `};async function $e(e,r=[]){const s=ce[e];if(!s)throw new Error(`Query "${e}" not found.`);return le(s,r)}async function l(e,r=[],s="Unnamed Query"){throw new Error("Neon client is not configured")}async function de(e){return(await l("SELECT * FROM profiles WHERE user_id = $1",[e],"getProfile"))[0]||null}async function ke(e){return!e||e.length===0?[]:await l("SELECT * FROM profiles WHERE user_id = ANY($1)",[e],"getProfilesByIds")}async function ue(e){return(await l(`SELECT
      cu.id,
      cu.email,
      cu.phone,
      cu.first_name,
      cu.last_name,
      cu.username,
      cu.profile_photo_url,
      cu.account_types,
      cu.active_role,
      cu.bio as clerk_bio,
      cu.zip_code,
      cu.created_at,
      cu.updated_at,
      p.id as profile_id,
      p.display_name,
      p.photo_url as profile_photo_url,
      p.bio as profile_bio,
      p.location,
      p.website,
      p.social_links,
      p.talent_info,
      p.engineer_info,
      p.producer_info,
      p.studio_info,
      p.education_info,
      p.label_info,
      p.followers_count,
      p.following_count,
      p.posts_count,
      p.reputation_score
    FROM clerk_users cu
    LEFT JOIN profiles p ON p.user_id = cu.id
    WHERE cu.id = $1`,[e],"getUserWithProfile"))[0]||null}async function me(e){const{id:r,email:s,phone:t=null,first_name:n=null,last_name:o=null,username:i=null,profile_photo_url:c=null,account_types:d=["Fan"],active_role:m="Fan",bio:y=null,zip_code:f=null}=e;return(await l(`
    INSERT INTO clerk_users (
      id, email, phone, first_name, last_name, username,
      profile_photo_url, account_types, active_role, bio, zip_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      username = EXCLUDED.username,
      profile_photo_url = EXCLUDED.profile_photo_url,
      updated_at = NOW()
    RETURNING *
  `,[r,s,t,n,o,i,c,d,m,y,f],"createClerkUser"))[0]}async function Ce(e,r){const s=["first_name","last_name","username","profile_photo_url","bio","zip_code","account_types","active_role"],t=["display_name","location","website","social_links","photo_url","cover_photo_url","talent_info","engineer_info","producer_info","studio_info","education_info","label_info","profile_visibility","messaging_permission"],n={},o={};for(const[i,c]of Object.entries(r))s.includes(i)?n[i]=c:t.includes(i)&&(o[i]=c);if(Object.keys(n).length>0){const i=[],c=[];let d=1;for(const[y,f]of Object.entries(n))i.push(`${y} = $${d}`),c.push(f),d++;c.push(e);const m=`
      UPDATE clerk_users
      SET ${i.join(", ")}, updated_at = NOW()
      WHERE id = $${d}
      RETURNING *
    `;await l(m,c,"updateClerkUser")}if(Object.keys(o).length>0){const i=[],c=[];let d=1;for(const[f,E]of Object.entries(o))typeof E=="object"&&E!==null?(i.push(`${f} = $${d}::jsonb`),c.push(JSON.stringify(E))):(i.push(`${f} = $${d}`),c.push(E)),d++;c.push(e);const m=`
      UPDATE profiles
      SET ${i.join(", ")}, updated_at = NOW()
      WHERE user_id = $${d}
      RETURNING *
    `;return(await l(m,c,"updateProfile"))[0]}return await de(e)}async function ve(e,r,s){const t=[e,r,JSON.stringify(s),new Date().toISOString()];return(await l(`
    INSERT INTO sub_profiles (user_id, role, data, updated_at)
    VALUES ($1, $2, $3::jsonb, $4::timestamp)
    ON CONFLICT (user_id, role)
    DO UPDATE SET
      data = $3::jsonb,
      updated_at = $4::timestamp
    RETURNING *
  `,t,"upsertSubProfile"))[0]}async function Ue({limit:e=50,userId:r=null,offset:s=0}={}){let t="",n=[];return r?(t=`
      SELECT
        p.*,
        cu.username,
        cu.email,
        prof.display_name,
        prof.photo_url
      FROM posts p
      JOIN clerk_users cu ON p.user_id = cu.id
      LEFT JOIN profiles prof ON prof.user_id = cu.id
      WHERE p.user_id = $1
        AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,n=[r,e,s]):(t=`
      SELECT
        p.*,
        cu.username,
        cu.email,
        prof.display_name,
        prof.photo_url
      FROM posts p
      JOIN clerk_users cu ON p.user_id = cu.id
      LEFT JOIN profiles prof ON prof.user_id = cu.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `,n=[e,s]),l(t,n,"getPosts")}async function je(e){const{user_id:r,content:s,media_urls:t=[],mentions:n=[],hashtags:o=[],metadata:i={}}=e;return(await l(`
    INSERT INTO posts (
      user_id, content, media_urls, mentions, hashtags, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,[r,s,JSON.stringify(t),JSON.stringify(n),JSON.stringify(o),JSON.stringify(i)],"createPost"))[0]}async function De(e,r){const s=[],t=[];let n=1;for(const[c,d]of Object.entries(r))typeof d=="object"?(s.push(`${c} = $${n}::jsonb`),t.push(JSON.stringify(d))):(s.push(`${c} = $${n}`),t.push(d)),n++;if(s.length===0)throw new Error("No updates provided");t.push(e);const o=`
    UPDATE posts
    SET ${s.join(", ")}, updated_at = NOW()
    WHERE id = $${n}
    RETURNING *
  `;return(await l(o,t,"updatePost"))[0]}async function Fe(e){return(await l("UPDATE posts SET deleted_at = NOW() WHERE id = $1 RETURNING id",[e],"deletePost")).length>0}async function Ae(e){return l(`
    SELECT
      c.*,
      cu.username,
      prof.display_name,
      prof.photo_url
    FROM comments c
    JOIN clerk_users cu ON c.user_id = cu.id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE c.post_id = $1 AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
  `,[e],"getComments")}async function Me(e){const{post_id:r,user_id:s,content:t,parent_id:n=null,mentions:o=[]}=e;return(await l(`
    INSERT INTO comments (
      post_id, user_id, content, parent_id, mentions
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,[r,s,t,n,JSON.stringify(o)],"createComment"))[0]}async function Pe(e){return(await l(`
    UPDATE comments
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING id
  `,[e],"deleteComment")).length>0}async function We(e,r){return(await l(`
    UPDATE posts
    SET comment_count = GREATEST(comment_count + $1, 0),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,[r,e],"updatePostCommentCount"))[0]}async function qe(e,r){return(await l(`
    UPDATE posts
    SET save_count = GREATEST(save_count + $1, 0),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,[r,e],"updatePostSaveCount"))[0]}async function He(e,r){return(await l(`
    SELECT id FROM saved_posts
    WHERE user_id = $1 AND post_id = $2
    LIMIT 1
  `,[e,r],"checkIsSaved")).length>0}async function ze(e,r,s){const{author_id:t,author_name:n,preview:o,has_media:i=!1}=s;return(await l(`
    INSERT INTO saved_posts (
      user_id, post_id, author_id, author_name, preview, has_media, saved_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `,[e,r,t,n,o,i],"savePost"))[0]}async function Be(e,r){return(await l(`
    DELETE FROM saved_posts
    WHERE user_id = $1 AND post_id = $2
    RETURNING id
  `,[e,r],"unsavePost")).length>0}async function Je(e){return(await l(`
    SELECT following_id
    FROM follows
    WHERE follower_id = $1
  `,[e],"getFollowing")).map(t=>t.following_id)}async function Ge(e){return(await l(`
    SELECT follower_id
    FROM follows
    WHERE following_id = $1
  `,[e],"getFollowers")).map(t=>t.follower_id)}async function Ye(e,r){return(await l(`
    INSERT INTO follows (follower_id, following_id, created_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `,[e,r],"followUser"))[0]}async function Ve(e,r){return(await l(`
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
    RETURNING id
  `,[e,r],"unfollowUser")).length>0}async function Ke(e){var t;return((t=(await l(`
    SELECT COUNT(*) as count
    FROM follows
    WHERE follower_id = $1
  `,[e],"getFollowingCount"))[0])==null?void 0:t.count)||0}async function Xe(e){var t;return((t=(await l(`
    SELECT COUNT(*) as count
    FROM follows
    WHERE following_id = $1
  `,[e],"getFollowersCount"))[0])==null?void 0:t.count)||0}async function Qe(e,r={}){const{unreadOnly:s=!1,limit:t=50,offset:n=0}=r;let o="SELECT * FROM notifications WHERE user_id = $1";const i=[e];return s&&(o+=" AND read = false"),o+=" ORDER BY created_at DESC LIMIT $2 OFFSET $3",i.push(t,n),l(o,i,"getNotifications")}async function Ze(e){return(await l(`
    INSERT INTO notifications (
      user_id, type, title, message, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,[e.user_id,e.type,e.title||"",e.message||"",e.reference_type||null,e.reference_id||null,e.metadata?JSON.stringify(e.metadata):"{}"],"createNotification"))[0]}async function et(e){return(await l("UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1 RETURNING id",[e],"markNotificationAsRead")).length>0}async function tt(e){return(await l("UPDATE notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND read = false RETURNING id",[e],"markAllNotificationsAsRead")).length}async function st(e){return(await l("UPDATE notifications SET deleted = true WHERE id = $1 RETURNING id",[e],"deleteNotification")).length>0}async function rt(e){return(await l("UPDATE notifications SET deleted = true WHERE user_id = $1 AND deleted = false RETURNING id",[e],"clearAllNotifications")).length}async function at(e){return l(`
    SELECT * FROM external_artists
    WHERE label_id = $1
    ORDER BY created_at DESC
  `,[e],"getExternalArtists")}async function ot(e,r){const{name:s,email:t,phone:n,stage_name:o,genre:i=[],primary_role:c,social_links:d={},contract_type:m,signed_date:y}=r;return l(`
    INSERT INTO external_artists (
      label_id, name, email, phone, stage_name, genre, primary_role,
      social_links, contract_type, signed_date, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'invited')
    RETURNING *
  `,[e,s,t||null,n||null,o||null,JSON.stringify(i),c||null,JSON.stringify(d),m||null,y||null],"createExternalArtist")}async function nt(e){return await l(`
    WITH artist_counts AS (
      SELECT COUNT(*) as total_artists
      FROM label_roster
      WHERE label_id = $1 AND status = 'active'
    ),
    release_counts AS (
      SELECT COUNT(*) as active_releases
      FROM releases
      WHERE label_id = $1 AND status IN ('distributed', 'submitted')
    ),
    revenue_data AS (
      SELECT COALESCE(SUM(lifetime_earnings), 0) as total_revenue,
             COALESCE(SUM(lifetime_streams), 0) as total_streams
      FROM distribution_stats
      WHERE user_id IN (SELECT artist_id FROM label_roster WHERE label_id = $1)
    )
    SELECT * FROM artist_counts, release_counts, revenue_data
  `,[e],"getLabelMetrics")}async function it(e){return await l(`
    WITH room_stats AS (
      SELECT COUNT(*) as total_rooms
      FROM studio_rooms
      WHERE studio_id = $1
    ),
    booking_stats AS (
      SELECT
        COUNT(*) FILTER (WHERE status = 'Pending') as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed_bookings
      FROM bookings
      WHERE studio_owner_id = $1
    )
    SELECT * FROM room_stats, booking_stats
  `,[e],"getStudioMetrics")}async function lt(e){return await l(`
    SELECT
      COUNT(*) as total_releases,
      COUNT(*) FILTER (WHERE status = 'Live' OR status = 'distributed') as live_releases,
      COUNT(*) FILTER (WHERE status = 'Draft' OR status = 'draft') as draft_releases
    FROM releases
    WHERE artist_id = $1 OR label_id = $1
  `,[e],"getDistributionMetrics")}const I=u.lazy(()=>U(()=>import("./AuthWizard-Yt1DFLjE.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))),fe=u.lazy(()=>U(()=>import("./AppRoutes-D-93kSDE.js"),__vite__mapDeps([10,1,2,3,4,5,6]))),pe=u.lazy(()=>U(()=>import("./MainLayout-DyntEdBV.js"),__vite__mapDeps([11,1,2,3,4,5,6])));function Ee(){const{isLoaded:e,isSignedIn:r,userId:s}=z(),{user:t}=B(),n=J(),[o,i]=u.useState(null),[c,d]=u.useState(!0),m=G(),y=Y(),[f,E]=u.useState(()=>typeof window<"u"?localStorage.getItem("theme")==="dark"||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches:!1);u.useEffect(()=>{const _=ie();if(_){const x=document.documentElement;_.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(x.classList.add("dark"),E(!0)):(x.classList.remove("dark"),E(!1)):_.theme==="dark"?(x.classList.add("dark"),E(!0)):(x.classList.remove("dark"),E(!1))}},[]),u.useEffect(()=>{var _,x,O;if(o!=null&&o.settings){const g=o.settings,h=document.documentElement;if(g.theme&&(g.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(h.classList.add("dark"),E(!0)):(h.classList.remove("dark"),E(!1)):g.theme==="dark"?(h.classList.add("dark"),E(!0)):(h.classList.remove("dark"),E(!1))),(_=g.accessibility)!=null&&_.fontSize){const w={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};h.style.fontSize=w[g.accessibility.fontSize]||w.medium}(x=g.accessibility)!=null&&x.reducedMotion?(h.classList.add("reduce-motion"),h.style.setProperty("--motion-duration","0s")):(h.classList.remove("reduce-motion"),h.style.removeProperty("--motion-duration")),(O=g.accessibility)!=null&&O.highContrast?h.classList.add("high-contrast"):h.classList.remove("high-contrast"),g.language&&(document.documentElement.lang=g.language)}},[o==null?void 0:o.settings]),u.useEffect(()=>{f?(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark")):(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"))},[f]);const S=()=>E(!f);u.useEffect(()=>{if(!e)return;let _=!0;return(async()=>{var O,g,h,w,D,F,A;if(!s||!r){_&&(i(null),d(!1));return}try{const p=await ue(s);if(p){const N={id:s,firstName:(t==null?void 0:t.firstName)||p.first_name||"User",lastName:(t==null?void 0:t.lastName)||p.last_name||"",email:((O=t==null?void 0:t.primaryEmailAddress)==null?void 0:O.emailAddress)||p.email||"",accountTypes:p.account_types||["Fan"],activeProfileRole:p.active_role||((g=p.account_types)==null?void 0:g[0])||"Fan",preferredRole:p.preferred_role||((h=p.account_types)==null?void 0:h[0])||"Fan",photoURL:(t==null?void 0:t.imageUrl)||p.photo_url||p.avatar_url||null,settings:p.settings||{},effectiveDisplayName:p.effective_display_name||(t==null?void 0:t.firstName)||p.first_name||"User",zipCode:p.zip_code,...p};_&&i(N)}else{const N=(t==null?void 0:t.publicMetadata)||{},W={id:s,firstName:(t==null?void 0:t.firstName)||N.first_name||"User",lastName:(t==null?void 0:t.lastName)||N.last_name||"",email:((w=t==null?void 0:t.primaryEmailAddress)==null?void 0:w.emailAddress)||"",accountTypes:N.account_types||["Fan"],activeProfileRole:N.active_role||"Fan",photoURL:(t==null?void 0:t.imageUrl)||null,settings:{},effectiveDisplayName:(t==null?void 0:t.firstName)||N.first_name||"User"};_&&i(W);try{console.log("📝 Creating user in Neon database...");const b=(t==null?void 0:t.publicMetadata)||{};await me({id:s,email:((D=t==null?void 0:t.primaryEmailAddress)==null?void 0:D.emailAddress)||"",phone:((F=t==null?void 0:t.primaryPhoneNumber)==null?void 0:F.phoneNumber)||null,first_name:(t==null?void 0:t.firstName)||b.first_name||null,last_name:(t==null?void 0:t.lastName)||b.last_name||null,username:(t==null?void 0:t.username)||b.username||null,profile_photo_url:(t==null?void 0:t.imageUrl)||null,account_types:b.account_types||["Fan"],active_role:b.active_role||"Fan",bio:b.bio||null,zip_code:b.zip_code||null}),console.log("✅ User created in Neon database")}catch(b){console.error("❌ Failed to create user in Neon:",b)}}_&&d(!1)}catch(p){if(console.error("Error loading user data:",p),_){const N=(t==null?void 0:t.publicMetadata)||{};i({id:s,firstName:(t==null?void 0:t.firstName)||N.first_name||"User",lastName:(t==null?void 0:t.lastName)||N.last_name||"",email:((A=t==null?void 0:t.primaryEmailAddress)==null?void 0:A.emailAddress)||"",accountTypes:N.account_types||["Fan"],activeProfileRole:N.active_role||"Fan",photoURL:(t==null?void 0:t.imageUrl)||null,settings:{}}),d(!1)}}})(),()=>{_=!1}},[s,r,e,t]);const j=u.useCallback(async()=>{try{console.log("=== APP LOGOUT ==="),n&&(await n.signOut(),console.log("✅ Clerk signOut successful")),i(null),console.log("✅ Local state cleared"),m("/login",{replace:!0}),console.log("✅ Navigated to login")}catch(_){console.error("Logout error:",_),i(null),m("/login",{replace:!0})}},[m,n]);if(!e||c)return a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})});const P=new URLSearchParams(window.location.search).get("intent")==="signup",T=r&&s,L=o&&o.id,$=y.pathname==="/login",k=y.pathname==="/test-login";return!T&&!$&&!k?a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})}),children:a.jsx(I,{darkMode:f,toggleTheme:S,onSuccess:()=>m("/"),isNewUser:!1})}):T&&!L&&!$&&!k?a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})}):k?T&&L?(m("/debug-report",{replace:!0}),null):a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})}),children:a.jsx(I,{darkMode:f,toggleTheme:S,onSuccess:()=>m("/debug-report"),isNewUser:!1})}):$?T&&L?(m("/",{replace:!0}),null):a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})}),children:a.jsx(I,{darkMode:f,toggleTheme:S,onSuccess:()=>m("/"),isNewUser:!1})}):T&&!L&&P?a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})}),children:a.jsx(I,{user:t,isNewUser:!0,darkMode:f,toggleTheme:S,onSuccess:()=>m("/debug-report")})}):!T||!L?a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:48})}),children:a.jsx(I,{darkMode:f,toggleTheme:S,onSuccess:()=>m("/"),isNewUser:!1})}):a.jsx(oe,{userData:o,children:a.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:[a.jsx(V,{position:"bottom-right",toastOptions:{style:{background:"#333",color:"#fff"}}}),y.pathname==="/settings"||y.pathname==="/debug-report"?a.jsx("main",{className:"p-6",children:a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"flex items-center justify-center min-h-screen",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:32})}),children:a.jsx(fe,{user:{id:s,...t},userData:o,loading:c,darkMode:f,toggleTheme:S,handleLogout:j})})}):a.jsx(u.Suspense,{fallback:a.jsx("div",{className:"flex items-center justify-center min-h-screen",children:a.jsx(R,{className:"animate-spin text-brand-blue",size:32})}),children:a.jsx(pe,{user:{id:s,...t},userData:o,loading:c,darkMode:f,toggleTheme:S,handleLogout:j})})]})})}const _e=void 0;console.error("❌ Clerk: Missing publishable key in production");const he={publishableKey:_e,appearance:{elements:{primaryButton:{backgroundColor:"hsl(222, 78%, 58%)",color:"white","&:hover":{backgroundColor:"hsl(223, 82%, 57%)"}},input:{borderColor:"#e2e8f0","&:focus":{borderColor:"#3D84ED"}}},variables:{colorPrimary:"#3D84ED",colorBackground:"white",colorInputBackground:"white",colorDanger:"#ef4444",colorSuccess:"#22c55e"}},debug:!1};let v=null,M=!1;const ge=async()=>v!==null?v:(M||(M=!0,v=!1),null),Ne=(e,r={},s={})=>{const t={message:(e==null?void 0:e.message)||"Unknown error",stack:e==null?void 0:e.stack,name:e==null?void 0:e.name,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,url:window.location.href,...r,context:s};ge().then(n=>{n&&n.captureException&&n.captureException(e,{extra:t,tags:{component:s.component||"Unknown",errorBoundary:s.errorBoundary||"None"},contexts:{custom:s}})}).catch(()=>{});try{const n=JSON.parse(localStorage.getItem("seshnx_errors")||"[]");n.unshift(t),n.splice(10),localStorage.setItem("seshnx_errors",JSON.stringify(n))}catch{}return t};class ye extends K.Component{constructor(s){super(s);C(this,"handleReset",()=>{if(this.setState({hasError:!1,error:null,errorInfo:null,errorId:null,copied:!1}),this.props.onReset)this.props.onReset();else{const s=window.location.pathname;s!=="/"&&s!=="/dashboard"?window.location.href="/?tab=dashboard":window.location.reload()}});C(this,"handleCopyError",async()=>{var t,n,o;const s=`
Error ID: ${this.state.errorId}
Message: ${((t=this.state.error)==null?void 0:t.message)||"Unknown error"}
Stack: ${((n=this.state.error)==null?void 0:n.stack)||"No stack trace"}
Component Stack: ${((o=this.state.errorInfo)==null?void 0:o.componentStack)||"No component stack"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();try{await navigator.clipboard.writeText(s),this.setState({copied:!0}),setTimeout(()=>this.setState({copied:!1}),2e3)}catch(i){console.error("Failed to copy error:",i)}});this.state={hasError:!1,error:null,errorInfo:null,meme:"Unexpected signal chain failure.",errorId:null,copied:!1}}static getDerivedStateFromError(s){return{hasError:!0,error:s,errorId:`ERR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}}componentDidCatch(s,t){const n={componentStack:t.componentStack,errorBoundary:this.props.name||"Default",props:this.props.context||{}},o=Ne(s,t,n);this.setState({errorInfo:{...t,errorId:this.state.errorId||o.timestamp}})}componentDidMount(){const s=["CoreAudio Overload detected.","The plugin crashed the session.","Buffer underrun exception.","Who deleted the master fader?","Sample rate mismatch: Reality is 44.1k, we are 48k.","The drummer kicked the power cable.","Ilok license not found.","Fatal Error: Not enough headroom.","The mix bus is clipping... hard.","Phantom power failure."];this.setState({meme:s[Math.floor(Math.random()*s.length)]})}render(){var s,t;return this.state.hasError?a.jsx("div",{className:"min-h-screen bg-[#1f2128] flex flex-col items-center justify-center p-4 text-center text-white font-sans",children:a.jsxs("div",{className:"bg-[#2c2e36] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden",children:[a.jsx("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"}),a.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[a.jsx("div",{className:"w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500",children:a.jsx(X,{size:32,strokeWidth:2})}),a.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Session Crashed"}),a.jsxs("p",{className:"text-xl text-[#3D84ED] font-medium mb-6 italic",children:['"',this.state.meme,'"']}),a.jsxs("div",{className:"bg-[#1f2128] p-4 rounded-lg w-full mb-6 text-left border border-gray-700",children:[a.jsxs("div",{className:"flex justify-between items-center mb-2",children:[a.jsx("p",{className:"text-xs text-gray-500 uppercase font-bold tracking-wider",children:"Error Details"}),a.jsx("button",{onClick:this.handleCopyError,className:"text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors",title:"Copy error details",children:this.state.copied?a.jsxs(a.Fragment,{children:[a.jsx(Q,{size:12}),"Copied!"]}):a.jsxs(a.Fragment,{children:[a.jsx(Z,{size:12}),"Copy"]})})]}),a.jsxs("div",{className:"space-y-2",children:[this.state.errorId&&a.jsxs("div",{children:[a.jsx("span",{className:"text-xs text-gray-500",children:"Error ID: "}),a.jsx("code",{className:"text-xs text-blue-400 font-mono",children:this.state.errorId})]}),a.jsx("code",{className:"text-sm text-red-400 font-mono break-words block",children:((s=this.state.error)==null?void 0:s.message)||"Unknown error occurred"}),((t=this.state.error)==null?void 0:t.stack)&&a.jsxs("details",{className:"mt-2",children:[a.jsx("summary",{className:"text-xs text-gray-500 cursor-pointer hover:text-gray-400",children:"Stack Trace"}),a.jsx("pre",{className:"text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32",children:this.state.error.stack})]})]})]}),a.jsxs("div",{className:"flex gap-4 w-full",children:[a.jsx("button",{onClick:()=>window.history.back(),className:"flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",children:"Go Back"}),a.jsxs("button",{onClick:this.handleReset,className:"flex-1 bg-[#3D84ED] hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",children:[a.jsx(ee,{size:18}),"Reload App"]})]})]})]})}):this.props.children}}const be=({children:e})=>a.jsx(a.Fragment,{children:e});console.error("❌ Clerk: VITE_CLERK_PUBLISHABLE_KEY is not set. Get your key from https://dashboard.clerk.com/ and add it to your .env.local file.");te.createRoot(document.getElementById("root")).render(a.jsx(be,{children:a.jsx(ye,{name:"Root",children:a.jsx(se,{...he,children:a.jsx(re,{client:ne,children:a.jsx(ae,{children:a.jsx(Ee,{})})})})})}));const Re=()=>{const e=document.getElementById("loading-fallback");e&&(e.classList.add("fade-out"),setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="auto"},400))};setTimeout(Re,600);export{rt as A,Qe as B,Ze as C,nt as D,ye as E,it as F,lt as G,at as H,ot as I,$e as J,ve as a,Ie as b,ke as c,Je as d,de as e,Ae as f,Ge as g,Me as h,We as i,Pe as j,He as k,De as l,Be as m,qe as n,Fe as o,Ue as p,je as q,Ye as r,ze as s,Ve as t,Ce as u,Xe as v,Ke as w,et as x,tt as y,st as z};
