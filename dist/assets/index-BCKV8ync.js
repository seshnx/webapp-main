const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AuthWizard-45qYXQJm.js","assets/edu-V9buPGJB.js","assets/vendor-mIyI6DiM.js","assets/vendor-D33SxI2g.css","assets/config-VNvva2Pv.js","assets/chat-P1NCmzAv.js","assets/vendor-framer-_HoVf1_M.js","assets/vendor-maps-CF7Z95EI.js","assets/vendor-maps-Dgihpmma.css","assets/SeshNx-PNG cCropped white text-BVqTFh8v.js","assets/AppRoutes-CSQju5BA.js","assets/MainLayout-0JmdhdrX.js"])))=>i.map(i=>d[i]);
var G=Object.defineProperty;var B=(e,a,s)=>a in e?G(e,a,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[a]=s;var F=(e,a,s)=>B(e,typeof a!="symbol"?a+"":a,s);import{r as E,bI as z,bJ as J,bK as V,bL as Y,bM as X,bN as Q,j as o,L as S,bO as K,R as Z,ao as ee,g as te,G as se,bP as ae,bQ as re,bR as ne,bS as oe,bT as ie,bU as le,bV as ce,bW as ue,bX as de,bY as pe,bZ as me}from"./vendor-mIyI6DiM.js";import{_ as D}from"./edu-V9buPGJB.js";import{L as fe,c as Ee}from"./chat-P1NCmzAv.js";import"./config-VNvva2Pv.js";import"./vendor-framer-_HoVf1_M.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};e.SENTRY_RELEASE={id:"local"}}catch{}})();try{(function(){var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="fe626445-453f-415d-82ca-9d75f2122dee",e._sentryDebugIdIdentifier="sentry-dbid-fe626445-453f-415d-82ca-9d75f2122dee")})()}catch{}(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function s(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function t(r){if(r.ep)return;r.ep=!0;const n=s(r);fetch(r.href,n)}})();function Me(e,a){E.useEffect(()=>{var s,t,r;if(e){if(e.theme){const n=document.documentElement;e.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(n.classList.add("dark"),localStorage.setItem("theme","dark")):(n.classList.remove("dark"),localStorage.setItem("theme","light")):e.theme==="dark"?(n.classList.add("dark"),localStorage.setItem("theme","dark")):(n.classList.remove("dark"),localStorage.setItem("theme","light"))}if((s=e.accessibility)!=null&&s.fontSize){const n=document.documentElement,c={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};n.style.fontSize=c[e.accessibility.fontSize]||c.medium,localStorage.setItem("fontSize",e.accessibility.fontSize)}if(((t=e.accessibility)==null?void 0:t.reducedMotion)!==void 0){const n=document.documentElement;e.accessibility.reducedMotion?(n.classList.add("reduce-motion"),n.style.setProperty("--motion-duration","0s")):(n.classList.remove("reduce-motion"),n.style.removeProperty("--motion-duration")),localStorage.setItem("reducedMotion",e.accessibility.reducedMotion)}if(((r=e.accessibility)==null?void 0:r.highContrast)!==void 0){const n=document.documentElement;e.accessibility.highContrast?n.classList.add("high-contrast"):n.classList.remove("high-contrast"),localStorage.setItem("highContrast",e.accessibility.highContrast)}e.language&&(document.documentElement.lang=e.language,localStorage.setItem("language",e.language)),e.timezone&&e.timezone!=="auto"&&localStorage.setItem("timezone",e.timezone),e.currency&&localStorage.setItem("currency",e.currency),e.dateFormat&&localStorage.setItem("dateFormat",e.dateFormat),e.timeFormat&&localStorage.setItem("timeFormat",e.timeFormat),e.numberFormat&&localStorage.setItem("numberFormat",e.numberFormat),localStorage.setItem("userSettings",JSON.stringify(e))}},[e])}function _e(){if(typeof window>"u")return null;const e=localStorage.getItem("userSettings");if(e)try{return JSON.parse(e)}catch(a){console.error("Failed to parse stored settings:",a)}return null}const ge="postgresql://neondb_owner:npg_yLHWnNa8l2tv@ep-young-glitter-ahzrw96g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",k=z(ge);async function he(e,a=[]){if(!k)throw new Error("Neon client is not configured. Check VITE_NEON_DATABASE_URL environment variable.");try{return await k(e,a)}catch(s){throw console.error("Neon query error:",s),s}}const ye={getUserById:"SELECT * FROM clerk_users WHERE id = $1",getUserByEmail:"SELECT * FROM clerk_users WHERE email = $1",getUserByUsername:"SELECT * FROM clerk_users WHERE username = $1",getProfileByUserId:"SELECT * FROM profiles WHERE user_id = $1",getActiveProfile:`
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
  `};async function Pe(e,a=[]){const s=ye[e];if(!s)throw new Error(`Query "${e}" not found.`);return he(s,a)}function Ne(e,a){throw console.error(`Database error in ${a}:`,e),new Error(`Query ${a} failed: ${e.message}`)}async function i(e,a=[],s="Unnamed Query"){if(!k)throw new Error("Neon client is not configured");try{return await k(e,a)}catch(t){Ne(t,s)}}async function be(e){return(await i("SELECT * FROM clerk_users WHERE id = $1",[e],"getUser"))[0]||null}async function Re(e){return(await i("SELECT * FROM profiles WHERE user_id = $1",[e],"getProfile"))[0]||null}async function He(e){return!e||e.length===0?[]:await i("SELECT * FROM profiles WHERE user_id = ANY($1)",[e],"getProfilesByIds")}async function Se(e){return(await i(`SELECT
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
    WHERE cu.id = $1`,[e],"getUserWithProfile"))[0]||null}async function P(e){const{id:a,email:s,phone:t=null,first_name:r=null,last_name:n=null,username:c=null,profile_photo_url:l=null,account_types:d=["Fan"],active_role:u="Fan",bio:f=null,zip_code:p=null}=e;return(await i(`
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
  `,[a,s,t,r,n,c,l,d,u,f,p],"createClerkUser"))[0]}async function Ge(e,a=null){const s=await be(e);if(s)return s;console.log("User not found in database, creating:",e);const t=a||{id:e,email:`${e}@clerk.tmp`,account_types:["Fan"],active_role:"Fan"};return await P(t)}async function Be(e,a){const s=["first_name","last_name","username","profile_photo_url","bio","zip_code","account_types","active_role","default_profile_role","settings","display_name","effective_display_name"],t=["location","website","social_links","photo_url","cover_photo_url","talent_info","engineer_info","producer_info","studio_info","education_info","label_info","profile_visibility","messaging_permission","hourly_rate","use_legal_name_only","use_user_name_only","search_terms"],r={zip:"zip_code",avatar_url:"photo_url",banner_url:"cover_photo_url",hourlyRate:"hourly_rate",useLegalNameOnly:"use_legal_name_only",useUserNameOnly:"use_user_name_only",searchTerms:"search_terms"},n={},c={};for(const[l,d]of Object.entries(a)){const u=r[l]||l;s.includes(u)?n[u]=d:t.includes(u)&&(c[u]=d)}if(Object.keys(n).length>0){const l=[],d=[];let u=1;for(const[p,m]of Object.entries(n))p==="settings"&&typeof m=="object"?(l.push(`${p} = $${u}::jsonb`),d.push(JSON.stringify(m))):p==="account_types"&&Array.isArray(m)?(l.push(`${p} = $${u}::text[]`),d.push(m)):(l.push(`${p} = $${u}`),d.push(m)),u++;d.push(e);const f=`
      UPDATE clerk_users
      SET ${l.join(", ")}, updated_at = NOW()
      WHERE id = $${u}
      RETURNING *
    `;await i(f,d,"updateClerkUser")}if(Object.keys(c).length>0){const l=[],d=[];let u=1;for(const[m,g]of Object.entries(c))typeof g=="object"&&g!==null?(l.push(`${m} = $${u}::jsonb`),d.push(JSON.stringify(g))):(l.push(`${m} = $${u}`),d.push(g)),u++;d.push(e);const f=`
      UPDATE profiles
      SET ${l.join(", ")}, updated_at = NOW()
      WHERE user_id = $${u}
      RETURNING *
    `;return(await i(f,d,"updateProfile"))[0]}return await Re(e)}async function ze(e,a,s){const{displayName:t,bio:r,photo_url:n,...c}=s,l={...c,displayName:t,bio:r},d=[e,a,t||null,r||null,n||null,JSON.stringify(l),new Date().toISOString()];try{return(await i(`
      INSERT INTO sub_profiles (user_id, account_type, display_name, bio, photo_url, profile_data, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::timestamp)
      ON CONFLICT (user_id, account_type)
      DO UPDATE SET
        display_name = $3,
        bio = $4,
        photo_url = $5,
        profile_data = $6::jsonb,
        updated_at = $7::timestamp
      RETURNING *
    `,d,"upsertSubProfile"))[0]}catch(u){if(u.message&&u.message.includes("invalid input syntax for type uuid"))return console.error("UUID constraint error in upsertSubProfile:",u.message),(await i(`
        INSERT INTO sub_profiles (user_id, account_type, display_name, bio, photo_url, profile_data, updated_at)
        VALUES ($1::text, $2, $3, $4, $5, $6::jsonb, $7::timestamp)
        ON CONFLICT (user_id, account_type)
        DO UPDATE SET
          display_name = $3,
          bio = $4,
          photo_url = $5,
          profile_data = $6::jsonb,
          updated_at = $7::timestamp
        RETURNING *
      `,d,"upsertSubProfile"))[0];throw u}}async function Je(e,a){try{return(await i("SELECT * FROM sub_profiles WHERE user_id = $1 AND account_type = $2",[e,a],"getSubProfile"))[0]||null}catch(s){if(s.message&&s.message.includes("invalid input syntax for type uuid"))return console.error("UUID constraint error in getSubProfile, retrying with cast:",s.message),(await i("SELECT * FROM sub_profiles WHERE user_id::text = $1 AND account_type = $2",[e,a],"getSubProfile"))[0]||null;throw s}}async function Ve(e){try{return await i("SELECT * FROM sub_profiles WHERE user_id = $1 ORDER BY account_type",[e],"getSubProfiles")}catch(a){if(a.message&&a.message.includes("invalid input syntax for type uuid"))return console.error("UUID constraint error in getSubProfiles, retrying with cast:",a.message),await i("SELECT * FROM sub_profiles WHERE user_id::text = $1 ORDER BY account_type",[e],"getSubProfiles");throw a}}async function Ye(e,a){try{return(await i("DELETE FROM sub_profiles WHERE user_id = $1 AND account_type = $2 RETURNING *",[e,a],"deleteSubProfile")).length>0}catch(s){if(s.message&&s.message.includes("invalid input syntax for type uuid")){console.error("UUID constraint error - this may be due to legacy database schema:",s.message);try{return(await i("DELETE FROM sub_profiles WHERE user_id::text = $1 AND account_type = $2 RETURNING *",[e,a],"deleteSubProfile")).length>0}catch(t){throw console.error("Retry also failed:",t.message),t}}throw s}}async function Xe({limit:e=50,userId:a=null,offset:s=0}={}){let t="",r=[];return a?(t=`
      SELECT
        p.*,
        cu.username,
        cu.email,
        cu.first_name,
        cu.last_name,
        cu.profile_photo_url,
        prof.display_name,
        prof.photo_url
      FROM posts p
      JOIN clerk_users cu ON p.user_id = cu.id
      LEFT JOIN profiles prof ON prof.user_id = cu.id
      WHERE p.user_id = $1
        AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,r=[a,e,s]):(t=`
      SELECT
        p.*,
        cu.username,
        cu.email,
        cu.first_name,
        cu.last_name,
        cu.profile_photo_url,
        prof.display_name,
        prof.photo_url
      FROM posts p
      JOIN clerk_users cu ON p.user_id = cu.id
      LEFT JOIN profiles prof ON prof.user_id = cu.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `,r=[e,s]),i(t,r,"getPosts")}async function Qe(e){const{user_id:a,content:s,media:t=[],mentions:r=[],hashtags:n=[],location:c=null,visibility:l="public",display_name:d=null,author_photo:u=null,posted_as_role:f=null}=e;return(await i(`
    INSERT INTO posts (
      user_id, content, media, mentions, hashtags, location, visibility,
      display_name, author_photo, posted_as_role
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,[a,s,JSON.stringify(t),r,n,c?JSON.stringify(c):null,l,d,u,f],"createPost"))[0]}async function Ke(e,a){const s=[],t=[];let r=1;for(const[l,d]of Object.entries(a))typeof d=="object"?(s.push(`${l} = $${r}::jsonb`),t.push(JSON.stringify(d))):(s.push(`${l} = $${r}`),t.push(d)),r++;if(s.length===0)throw new Error("No updates provided");t.push(e);const n=`
    UPDATE posts
    SET ${s.join(", ")}, updated_at = NOW()
    WHERE id = $${r}
    RETURNING *
  `;return(await i(n,t,"updatePost"))[0]}async function Ze(e){return(await i("UPDATE posts SET deleted_at = NOW() WHERE id = $1 RETURNING id",[e],"deletePost")).length>0}async function et(e){return i(`
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
  `,[e],"getComments")}async function tt(e){const{post_id:a,user_id:s,content:t,parent_id:r=null,mentions:n=[]}=e;return(await i(`
    INSERT INTO comments (
      post_id, user_id, content, parent_id, mentions
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,[a,s,t,r,JSON.stringify(n)],"createComment"))[0]}async function st(e){return(await i(`
    UPDATE comments
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING id
  `,[e],"deleteComment")).length>0}async function at(e,a){return(await i(`
    UPDATE posts
    SET comment_count = GREATEST(comment_count + $1, 0),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,[a,e],"updatePostCommentCount"))[0]}async function rt(e,a){return(await i(`
    UPDATE posts
    SET save_count = GREATEST(save_count + $1, 0),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,[a,e],"updatePostSaveCount"))[0]}async function nt(e,a){return(await i(`
    SELECT id FROM saved_posts
    WHERE user_id = $1 AND post_id = $2
    LIMIT 1
  `,[e,a],"checkIsSaved")).length>0}async function ot(e,a,s){const{author_id:t,author_name:r,preview:n,has_media:c=!1}=s;return(await i(`
    INSERT INTO saved_posts (
      user_id, post_id, author_id, author_name, preview, has_media, saved_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `,[e,a,t,r,n,c],"savePost"))[0]}async function it(e,a){return(await i(`
    DELETE FROM saved_posts
    WHERE user_id = $1 AND post_id = $2
    RETURNING id
  `,[e,a],"unsavePost")).length>0}async function lt(e){return(await i(`
    SELECT following_id
    FROM follows
    WHERE follower_id = $1
  `,[e],"getFollowing")).map(t=>t.following_id)}async function ct(e){return(await i(`
    SELECT follower_id
    FROM follows
    WHERE following_id = $1
  `,[e],"getFollowers")).map(t=>t.follower_id)}async function ut(e,a){return(await i(`
    INSERT INTO follows (follower_id, following_id, created_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `,[e,a],"followUser"))[0]}async function dt(e,a){return(await i(`
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
    RETURNING id
  `,[e,a],"unfollowUser")).length>0}async function pt(e){var t;return((t=(await i(`
    SELECT COUNT(*) as count
    FROM follows
    WHERE follower_id = $1
  `,[e],"getFollowingCount"))[0])==null?void 0:t.count)||0}async function mt(e){var t;return((t=(await i(`
    SELECT COUNT(*) as count
    FROM follows
    WHERE following_id = $1
  `,[e],"getFollowersCount"))[0])==null?void 0:t.count)||0}async function ft(e,a={}){const{status:s=null,limit:t=50,offset:r=0}=a;let n=`
    SELECT b.*
    FROM bookings b
    WHERE (b.sender_id = $1 OR b.target_id = $1)
  `;const c=[e];let l=2;return s&&(n+=` AND b.status = $${l}`,c.push(s),l++),n+=` ORDER BY b.created_at DESC LIMIT $${l} OFFSET $${l+1}`,c.push(t,r),i(n,c,"getBookings")}async function Et(e,a,s={}){return(await i(`
    UPDATE bookings
    SET
      status = $1,
      metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `,[a,JSON.stringify(s),e],"updateBookingStatus"))[0]}async function _t(e={}){const{category:a=null,status:s="active",limit:t=50,offset:r=0}=e;let n=`
    SELECT
      mi.*,
      cu.username,
      prof.display_name,
      prof.photo_url
    FROM market_items mi
    JOIN clerk_users cu ON mi.seller_id = cu.id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE mi.status = $1
  `;const c=[s];let l=2;return a&&(n+=` AND mi.category = $${l}`,c.push(a),l++),n+=` ORDER BY mi.created_at DESC LIMIT $${l} OFFSET $${l+1}`,c.push(t,r),i(n,c,"getMarketplaceItems")}async function gt({limit:e=50,offset:a=0,status:s=null}={}){let t="SELECT * FROM gear_listings WHERE deleted_at IS NULL";const r=[];let n=1;return s&&(t+=` AND status = $${n}`,r.push(s),n++),t+=` ORDER BY created_at DESC LIMIT $${n} OFFSET $${n+1}`,r.push(e,a),i(t,r,"getGearListings")}async function ht(e){const{seller_id:a,title:s,description:t,price:r,condition:n,images:c=[],category:l,brand:d,model:u}=e;return(await i(`
    INSERT INTO gear_listings (
      seller_id, title, description, price, condition, images, category, brand, model, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', NOW())
    RETURNING *
  `,[a,s,t,r,n,JSON.stringify(c),l,d,u],"createGearListing"))[0]}async function yt(e,a){return(await i("UPDATE gear_listings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",[a,e],"updateGearListingStatus"))[0]||null}async function Nt({userId:e,status:a}){let s="SELECT * FROM gear_orders WHERE (buyer_id = $1 OR seller_id = $1)";const t=[e];let r=2;return a&&(s+=` AND status = $${r}`,t.push(a),r++),s+=" ORDER BY created_at DESC",i(s,t,"getGearOrders")}async function bt(e){const{listing_id:a,buyer_id:s,seller_id:t,total_price:r}=e;return(await i(`
    INSERT INTO gear_orders (listing_id, buyer_id, seller_id, total_price, status, created_at)
    VALUES ($1, $2, $3, $4, 'pending', NOW())
    RETURNING *
  `,[a,s,t,r],"createGearOrder"))[0]}async function Rt(e,a){return(await i("UPDATE gear_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",[a,e],"updateGearOrderStatus"))[0]||null}async function St(e){const{listing_id:a,offeror_id:s,recipient_id:t,offer_amount:r,message:n}=e;return(await i(`
    INSERT INTO gear_offers (listing_id, offeror_id, recipient_id, offer_amount, message, status, created_at)
    VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
    RETURNING *
  `,[a,s,t,r,n],"createGearOffer"))[0]}async function $t(e,a){return(await i("UPDATE gear_offers SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",[a,e],"respondToGearOffer"))[0]||null}async function Tt({userId:e,status:a}){let s="SELECT * FROM safe_exchange_transactions WHERE buyer_id = $1 OR seller_id = $1";const t=[e];let r=2;return a&&(s+=` AND escrow_status = $${r}`,t.push(a),r++),s+=" ORDER BY created_at DESC",i(s,t,"getSafeExchangeTransactions")}async function Ot(e){return(await i("SELECT * FROM safe_exchange_transactions WHERE id = $1",[e],"getSafeExchangeTransactionById"))[0]||null}async function xt(e){const{order_id:a,buyer_id:s,seller_id:t,amount:r,itemId:n,transactionType:c,parties:l,itemDetails:d,verificationData:u,status:f}=e,p=a||null,m=s||(l==null?void 0:l.buyer),g=t||(l==null?void 0:l.seller),U=r||(d==null?void 0:d.buyerTotal)||(u==null?void 0:u.escrowAmount),v=(u==null?void 0:u.escrowStatus)||"pending";return(await i(`
    INSERT INTO safe_exchange_transactions (order_id, buyer_id, seller_id, amount, escrow_status, photo_verification, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `,[p,m,g,U,v,JSON.stringify(u?{verificationData:u}:null)],"createSafeExchangeTransaction"))[0]}async function wt(e,a){const s=Object.keys(a).map((c,l)=>`${c} = $${l+2}`).join(", "),t=Object.values(a),r=`UPDATE safe_exchange_transactions SET ${s}, updated_at = NOW() WHERE id = $1 RETURNING *`;return(await i(r,[e,...t],"updateSafeExchangeTransaction"))[0]||null}async function It(e,a){return(await i(`
    UPDATE safe_exchange_transactions
    SET verification_data = jsonb_set(
      COALESCE(verification_data, '{}'),
      '{photos}',
      COALESCE(verification_data->'photos', '[]'::jsonb) || $2::jsonb
    ),
    updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,[e,JSON.stringify([a])],"addTransactionPhoto"))[0]||null}async function Lt(e){const{userId:a,title:s,type:t,price:r,downloadUrl:n,tags:c,description:l,author:d}=e;return(await i(`
    INSERT INTO marketplace_items (title, type, price, download_url, tags, description, author, author_id, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
  `,[s,t,r,n,c,l,d,a],"createMarketplaceItemSeshFx"))[0]}async function Ut(e){return i(`
    SELECT mi.*, ul.purchase_date
    FROM user_library ul
    JOIN marketplace_items mi ON ul.item_id = mi.id
    WHERE ul.user_id = $1
    ORDER BY ul.purchase_date DESC
  `,[e],"getUserLibrary")}async function Ct(e,a){return(await i(`
    INSERT INTO user_library (user_id, item_id, purchase_date)
    VALUES ($1, $2, NOW())
    ON CONFLICT (user_id, item_id) DO NOTHING
    RETURNING *
  `,[e,a],"addToUserLibrary"))[0]||null}async function kt(e){return i("SELECT * FROM distribution_releases WHERE uploader_id = $1 ORDER BY updated_at DESC",[e],"getDistributionReleases")}async function Dt(e){const{userId:a,title:s,type:t,tracks:r=[],artworkUrl:n,releaseDate:c,primaryArtist:l,upc:d,isrcCode:u}=e;return(await i(`
    INSERT INTO distribution_releases (
      uploader_id, title, type, tracks, artwork_url, release_date, primary_artist, upc, isrc_code, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Draft', NOW(), NOW())
    RETURNING *
  `,[a,s,t,JSON.stringify(r),n,c,l,d,u],"createDistributionRelease"))[0]}async function vt(e,a){const s=[],t=[];let r=1;for(const[l,d]of Object.entries(a))["tracks","metadata"].includes(l)?(s.push(`${l} = $${r}::jsonb`),t.push(JSON.stringify(d))):(s.push(`${l} = $${r}`),t.push(d)),r++;if(s.length===0)throw new Error("No updates provided");t.push(e);const n=`UPDATE distribution_releases SET ${s.join(", ")}, updated_at = NOW() WHERE id = $${r} RETURNING *`;return(await i(n,t,"updateDistributionRelease"))[0]||null}async function At(e){return(await i("DELETE FROM distribution_releases WHERE id = $1 AND status IN ('Draft', 'Action Needed')",[e],"deleteDistributionRelease")).length>0}async function Ft(e){var s;return((s=(await i("SELECT balance FROM wallets WHERE user_id = $1",[e],"getWalletBalance"))[0])==null?void 0:s.balance)||0}async function jt(e,a=0){return(await i(`
    INSERT INTO wallets (user_id, balance)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET
      balance = GREATEST(0, wallets.balance + $2),
      updated_at = NOW()
    RETURNING *
  `,[e,a],"upsertWallet"))[0]}async function Wt(e,a={}){const{unreadOnly:s=!1,limit:t=50,offset:r=0}=a;let n="SELECT * FROM notifications WHERE user_id = $1";const c=[e];return s&&(n+=" AND read = false"),n+=" ORDER BY created_at DESC LIMIT $2 OFFSET $3",c.push(t,r),i(n,c,"getNotifications")}async function qt(e){return(await i(`
    INSERT INTO notifications (
      user_id, type, title, message, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,[e.user_id,e.type,e.title||"",e.message||"",e.reference_type||null,e.reference_id||null,e.metadata?JSON.stringify(e.metadata):"{}"],"createNotification"))[0]}async function Mt(e){return(await i("UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1 RETURNING id",[e],"markNotificationAsRead")).length>0}async function Pt(e){return(await i("UPDATE notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND read = false RETURNING id",[e],"markAllNotificationsAsRead")).length}async function Ht(e){return(await i("UPDATE notifications SET deleted = true WHERE id = $1 RETURNING id",[e],"deleteNotification")).length>0}async function Gt(e){return(await i("UPDATE notifications SET deleted = true WHERE user_id = $1 AND deleted = false RETURNING id",[e],"clearAllNotifications")).length}async function Bt(e){return i(`
    SELECT * FROM external_artists
    WHERE label_id = $1
    ORDER BY created_at DESC
  `,[e],"getExternalArtists")}async function zt(e,a){const{name:s,email:t,phone:r,stage_name:n,genre:c=[],primary_role:l,social_links:d={},contract_type:u,signed_date:f}=a;return i(`
    INSERT INTO external_artists (
      label_id, name, email, phone, stage_name, genre, primary_role,
      social_links, contract_type, signed_date, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'invited')
    RETURNING *
  `,[e,s,t||null,r||null,n||null,JSON.stringify(c),l||null,JSON.stringify(d),u||null,f||null],"createExternalArtist")}async function Jt(e){return await i(`
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
  `,[e],"getLabelMetrics")}async function Vt(e){return await i(`
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
  `,[e],"getStudioMetrics")}async function Yt(e){return await i(`
    SELECT
      COUNT(*) as total_releases,
      COUNT(*) FILTER (WHERE status = 'Live' OR status = 'distributed') as live_releases,
      COUNT(*) FILTER (WHERE status = 'Draft' OR status = 'draft') as draft_releases
    FROM releases
    WHERE artist_id = $1 OR label_id = $1
  `,[e],"getDistributionMetrics")}async function Xt(){const a=await i(`
    SELECT
      category,
      subcategory,
      id,
      name,
      brand,
      model,
      description,
      specifications
    FROM equipment_database
    WHERE verified = true
    ORDER BY category, subcategory, brand, name
  `,[],"getEquipmentGrouped"),s={};return a.forEach(t=>{s[t.category]||(s[t.category]={}),s[t.category][t.subcategory]||(s[t.category][t.subcategory]=[]),s[t.category][t.subcategory].push(t)}),s}async function Qt(e=20){return i(`
    SELECT * FROM equipment_submissions
    WHERE status = 'pending'
    ORDER BY timestamp DESC
    LIMIT $1
  `,[e],"getPendingSubmissions")}async function Kt(e){const a=`
    INSERT INTO equipment_submissions (
      brand, model, category, sub_category, specs,
      submitted_by, submitter_name, status, votes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,s=[e.brand,e.model,e.category,e.subcategory||null,e.specs,e.submittedBy,e.submitterName||null,e.status||"pending",JSON.stringify(e.votes||{yes:[],fake:[],duplicate:[]})];return(await i(a,s,"createEquipmentSubmission"))[0]}async function Zt(e,a){return(await i(`
    UPDATE equipment_submissions
    SET votes = $2
    WHERE id = $1
    RETURNING *
  `,[e,JSON.stringify(a)],"updateSubmissionVotes"))[0]}async function es(e,a){const s=await i("SELECT * FROM equipment_submissions WHERE id = $1",[e],"getSubmissionForApproval");if(!s[0])throw new Error("Submission not found");const t=s[0],r=await i(`INSERT INTO equipment_database (
      name, brand, model, category, subcategory, verified, verified_by, added_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,[t.model,t.brand,t.model,t.category,t.sub_category,!0,[a],t.submitted_by],"approveSubmission");return await i("UPDATE equipment_submissions SET status = 'approved' WHERE id = $1",[e],"updateSubmissionStatus"),r[0]}async function ts(e){return(await i(`
    UPDATE equipment_submissions
    SET status = 'rejected'
    WHERE id = $1
    RETURNING *
  `,[e],"rejectEquipmentSubmission"))[0]}const I=E.lazy(()=>D(()=>import("./AuthWizard-45qYXQJm.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))),$e=E.lazy(()=>D(()=>import("./AppRoutes-CSQju5BA.js"),__vite__mapDeps([10,1,2,3,4,5,6]))),Te=E.lazy(()=>D(()=>import("./MainLayout-0JmdhdrX.js"),__vite__mapDeps([11,1,2,3,4,5,6])));function Oe(){const{isLoaded:e,isSignedIn:a,userId:s}=J(),{user:t}=V(),r=Y(),[n,c]=E.useState(null),[l,d]=E.useState(!0),u=X(),f=Q(),[p,m]=E.useState(()=>typeof window<"u"?localStorage.getItem("theme")==="dark"||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches:!1);E.useEffect(()=>{const h=_e();if(h){const $=document.documentElement;h.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?($.classList.add("dark"),m(!0)):($.classList.remove("dark"),m(!1)):h.theme==="dark"?($.classList.add("dark"),m(!0)):($.classList.remove("dark"),m(!1))}},[]),E.useEffect(()=>{var h,$,x;if(n!=null&&n.settings){const N=n.settings,y=document.documentElement;if(N.theme&&(N.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(y.classList.add("dark"),m(!0)):(y.classList.remove("dark"),m(!1)):N.theme==="dark"?(y.classList.add("dark"),m(!0)):(y.classList.remove("dark"),m(!1))),(h=N.accessibility)!=null&&h.fontSize){const w={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};y.style.fontSize=w[N.accessibility.fontSize]||w.medium}($=N.accessibility)!=null&&$.reducedMotion?(y.classList.add("reduce-motion"),y.style.setProperty("--motion-duration","0s")):(y.classList.remove("reduce-motion"),y.style.removeProperty("--motion-duration")),(x=N.accessibility)!=null&&x.highContrast?y.classList.add("high-contrast"):y.classList.remove("high-contrast"),N.language&&(document.documentElement.lang=N.language)}},[n==null?void 0:n.settings]),E.useEffect(()=>{p?(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark")):(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"))},[p]);const g=()=>m(!p);E.useEffect(()=>{if(!e)return;let h=!0;return(async()=>{var x,N,y,w,j,W,q;if(!s||!a){h&&(c(null),d(!1));return}try{const _=await Se(s);if(_){const b={id:s,firstName:(t==null?void 0:t.firstName)||_.first_name||"User",lastName:(t==null?void 0:t.lastName)||_.last_name||"",email:((x=t==null?void 0:t.primaryEmailAddress)==null?void 0:x.emailAddress)||_.email||"",accountTypes:_.account_types||["Fan"],activeProfileRole:_.active_role||((N=_.account_types)==null?void 0:N[0])||"Fan",preferredRole:_.preferred_role||((y=_.account_types)==null?void 0:y[0])||"Fan",photoURL:(t==null?void 0:t.imageUrl)||_.photo_url||_.avatar_url||null,settings:_.settings||{},effectiveDisplayName:_.effective_display_name||(t==null?void 0:t.firstName)||_.first_name||"User",zipCode:_.zip_code,..._};h&&c(b)}else{const b=(t==null?void 0:t.publicMetadata)||{},H={id:s,firstName:(t==null?void 0:t.firstName)||b.first_name||"User",lastName:(t==null?void 0:t.lastName)||b.last_name||"",email:((w=t==null?void 0:t.primaryEmailAddress)==null?void 0:w.emailAddress)||"",accountTypes:b.account_types||["Fan"],activeProfileRole:b.active_role||"Fan",photoURL:(t==null?void 0:t.imageUrl)||null,settings:{},effectiveDisplayName:(t==null?void 0:t.firstName)||b.first_name||"User"};h&&c(H);try{console.log("📝 Creating user in Neon database...");const R=(t==null?void 0:t.publicMetadata)||{};await P({id:s,email:((j=t==null?void 0:t.primaryEmailAddress)==null?void 0:j.emailAddress)||"",phone:((W=t==null?void 0:t.primaryPhoneNumber)==null?void 0:W.phoneNumber)||null,first_name:(t==null?void 0:t.firstName)||R.first_name||null,last_name:(t==null?void 0:t.lastName)||R.last_name||null,username:(t==null?void 0:t.username)||R.username||null,profile_photo_url:(t==null?void 0:t.imageUrl)||null,account_types:R.account_types||["Fan"],active_role:R.active_role||"Fan",bio:R.bio||null,zip_code:R.zip_code||null}),console.log("✅ User created in Neon database")}catch(R){console.error("❌ Failed to create user in Neon:",R)}}h&&d(!1)}catch(_){if(console.error("Error loading user data:",_),h){const b=(t==null?void 0:t.publicMetadata)||{};c({id:s,firstName:(t==null?void 0:t.firstName)||b.first_name||"User",lastName:(t==null?void 0:t.lastName)||b.last_name||"",email:((q=t==null?void 0:t.primaryEmailAddress)==null?void 0:q.emailAddress)||"",accountTypes:b.account_types||["Fan"],activeProfileRole:b.active_role||"Fan",photoURL:(t==null?void 0:t.imageUrl)||null,settings:{}}),d(!1)}}})(),()=>{h=!1}},[s,a,e,t]);const U=E.useCallback(async()=>{try{console.log("=== APP LOGOUT ==="),r&&(await r.signOut(),console.log("✅ Clerk signOut successful")),c(null),console.log("✅ Local state cleared"),u("/login",{replace:!0}),console.log("✅ Navigated to login")}catch(h){console.error("Logout error:",h),c(null),u("/login",{replace:!0})}},[u,r]);if(!e||l)return o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})});const v=new URLSearchParams(window.location.search).get("intent")==="signup",T=a&&s,O=n&&n.id,C=f.pathname==="/login",A=f.pathname==="/test-login";return!T&&!C&&!A?o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})}),children:o.jsx(I,{darkMode:p,toggleTheme:g,onSuccess:()=>u("/"),isNewUser:!1})}):T&&!O&&!C&&!A?o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})}):A?T&&O?(u("/debug-report",{replace:!0}),null):o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})}),children:o.jsx(I,{darkMode:p,toggleTheme:g,onSuccess:()=>u("/debug-report"),isNewUser:!1})}):C?T&&O?(u("/",{replace:!0}),null):o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})}),children:o.jsx(I,{darkMode:p,toggleTheme:g,onSuccess:()=>u("/"),isNewUser:!1})}):T&&!O&&v?o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})}),children:o.jsx(I,{user:t,isNewUser:!0,darkMode:p,toggleTheme:g,onSuccess:()=>u("/debug-report")})}):!T||!O?o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:48})}),children:o.jsx(I,{darkMode:p,toggleTheme:g,onSuccess:()=>u("/"),isNewUser:!1})}):o.jsx(fe,{userData:n,children:o.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:[o.jsx(K,{position:"bottom-right",toastOptions:{style:{background:"#333",color:"#fff"}}}),f.pathname==="/settings"||f.pathname==="/debug-report"?o.jsx("main",{className:"p-6",children:o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"flex items-center justify-center min-h-screen",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:32})}),children:o.jsx($e,{user:{id:s,...t},userData:n,loading:l,darkMode:p,toggleTheme:g,handleLogout:U})})}):o.jsx(E.Suspense,{fallback:o.jsx("div",{className:"flex items-center justify-center min-h-screen",children:o.jsx(S,{className:"animate-spin text-brand-blue",size:32})}),children:o.jsx(Te,{user:{id:s,...t},userData:n,loading:l,darkMode:p,toggleTheme:g,handleLogout:U})})]})})}const xe="pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk",we={publishableKey:xe,appearance:{elements:{primaryButton:{backgroundColor:"hsl(222, 78%, 58%)",color:"white","&:hover":{backgroundColor:"hsl(223, 82%, 57%)"}},input:{borderColor:"#e2e8f0","&:focus":{borderColor:"#3D84ED"}}},variables:{colorPrimary:"#3D84ED",colorBackground:"white",colorInputBackground:"white",colorDanger:"#ef4444",colorSuccess:"#22c55e"}},debug:!1};let L=null,M=!1;const Ie=async()=>{var a,s;if(L!==null)return L;if(M)return null;const e="https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712";M=!0;try{const t=await D(()=>import("./vendor-mIyI6DiM.js").then(d=>d.dV),__vite__mapDeps([2,3]));L=t;const{init:r,BrowserTracing:n,Replay:c}=t,l=(a=t.getCurrentHub)==null?void 0:a.call(t);return(s=l==null?void 0:l.getClient)!=null&&s.call(l)||r({dsn:e,environment:"production",tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1,integrations:[new n,new c]}),L}catch{return L=!1,null}},Le=(e,a={},s={})=>{const t={message:(e==null?void 0:e.message)||"Unknown error",stack:e==null?void 0:e.stack,name:e==null?void 0:e.name,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,url:window.location.href,...a,context:s};Ie().then(r=>{r&&r.captureException&&r.captureException(e,{extra:t,tags:{component:s.component||"Unknown",errorBoundary:s.errorBoundary||"None"},contexts:{custom:s}})}).catch(()=>{});try{const r=JSON.parse(localStorage.getItem("seshnx_errors")||"[]");r.unshift(t),r.splice(10),localStorage.setItem("seshnx_errors",JSON.stringify(r))}catch{}return t};class Ue extends Z.Component{constructor(s){super(s);F(this,"handleReset",()=>{if(this.setState({hasError:!1,error:null,errorInfo:null,errorId:null,copied:!1}),this.props.onReset)this.props.onReset();else{const s=window.location.pathname;s!=="/"&&s!=="/dashboard"?window.location.href="/?tab=dashboard":window.location.reload()}});F(this,"handleCopyError",async()=>{var t,r,n;const s=`
Error ID: ${this.state.errorId}
Message: ${((t=this.state.error)==null?void 0:t.message)||"Unknown error"}
Stack: ${((r=this.state.error)==null?void 0:r.stack)||"No stack trace"}
Component Stack: ${((n=this.state.errorInfo)==null?void 0:n.componentStack)||"No component stack"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();try{await navigator.clipboard.writeText(s),this.setState({copied:!0}),setTimeout(()=>this.setState({copied:!1}),2e3)}catch(c){console.error("Failed to copy error:",c)}});this.state={hasError:!1,error:null,errorInfo:null,meme:"Unexpected signal chain failure.",errorId:null,copied:!1}}static getDerivedStateFromError(s){return{hasError:!0,error:s,errorId:`ERR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}}componentDidCatch(s,t){const r={componentStack:t.componentStack,errorBoundary:this.props.name||"Default",props:this.props.context||{}},n=Le(s,t,r);this.setState({errorInfo:{...t,errorId:this.state.errorId||n.timestamp}})}componentDidMount(){const s=["CoreAudio Overload detected.","The plugin crashed the session.","Buffer underrun exception.","Who deleted the master fader?","Sample rate mismatch: Reality is 44.1k, we are 48k.","The drummer kicked the power cable.","Ilok license not found.","Fatal Error: Not enough headroom.","The mix bus is clipping... hard.","Phantom power failure."];this.setState({meme:s[Math.floor(Math.random()*s.length)]})}render(){var s,t;return this.state.hasError?o.jsx("div",{className:"min-h-screen bg-[#1f2128] flex flex-col items-center justify-center p-4 text-center text-white font-sans",children:o.jsxs("div",{className:"bg-[#2c2e36] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden",children:[o.jsx("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"}),o.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[o.jsx("div",{className:"w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500",children:o.jsx(ee,{size:32,strokeWidth:2})}),o.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Session Crashed"}),o.jsxs("p",{className:"text-xl text-[#3D84ED] font-medium mb-6 italic",children:['"',this.state.meme,'"']}),o.jsxs("div",{className:"bg-[#1f2128] p-4 rounded-lg w-full mb-6 text-left border border-gray-700",children:[o.jsxs("div",{className:"flex justify-between items-center mb-2",children:[o.jsx("p",{className:"text-xs text-gray-500 uppercase font-bold tracking-wider",children:"Error Details"}),o.jsx("button",{onClick:this.handleCopyError,className:"text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors",title:"Copy error details",children:this.state.copied?o.jsxs(o.Fragment,{children:[o.jsx(te,{size:12}),"Copied!"]}):o.jsxs(o.Fragment,{children:[o.jsx(se,{size:12}),"Copy"]})})]}),o.jsxs("div",{className:"space-y-2",children:[this.state.errorId&&o.jsxs("div",{children:[o.jsx("span",{className:"text-xs text-gray-500",children:"Error ID: "}),o.jsx("code",{className:"text-xs text-blue-400 font-mono",children:this.state.errorId})]}),o.jsx("code",{className:"text-sm text-red-400 font-mono break-words block",children:((s=this.state.error)==null?void 0:s.message)||"Unknown error occurred"}),((t=this.state.error)==null?void 0:t.stack)&&o.jsxs("details",{className:"mt-2",children:[o.jsx("summary",{className:"text-xs text-gray-500 cursor-pointer hover:text-gray-400",children:"Stack Trace"}),o.jsx("pre",{className:"text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32",children:this.state.error.stack})]})]})]}),o.jsxs("div",{className:"flex gap-4 w-full",children:[o.jsx("button",{onClick:()=>window.history.back(),className:"flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",children:"Go Back"}),o.jsxs("button",{onClick:this.handleReset,className:"flex-1 bg-[#3D84ED] hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",children:[o.jsx(ae,{size:18}),"Reload App"]})]})]})]})}):this.props.children}}const Ce="https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712";re({dsn:Ce,environment:"production",release:"local-dev",integrations:[ne({tracePropagationTargets:["localhost",/^https:\/\/(app\.seshnx\.com|webapp-main-.*\.vercel\.app)/]}),oe({maskAllText:!1,blockAllMedia:!1}),ie(),le({levels:["error"]})],tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1,beforeSend(e,a){var s,t,r,n,c,l,d,u;return(n=(r=(t=(s=e.exception)==null?void 0:s.values)==null?void 0:t[0])==null?void 0:r.value)!=null&&n.includes("localStorage")||(u=(d=(l=(c=e.exception)==null?void 0:c.values)==null?void 0:l[0])==null?void 0:d.value)!=null&&u.includes("QuotaExceededError")?null:(e.contexts={...e.contexts,app:{name:"SeshNx Webapp",environment:"production"}},e)},initialScope:{tags:{framework:"react",runtime:"vite"}}});const ke=({children:e})=>o.jsx(me,{fallback:({error:a,resetError:s})=>o.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:o.jsxs("div",{className:"text-center p-8",children:[o.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white mb-4",children:"Something went wrong"}),o.jsx("p",{className:"text-gray-600 dark:text-gray-400 mb-6",children:(a==null?void 0:a.message)||"An unexpected error occurred"}),o.jsx("button",{onClick:s,className:"px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors",children:"Try again"})]})}),children:e});ce.createRoot(document.getElementById("root")).render(o.jsx(ke,{children:o.jsx(Ue,{name:"Root",children:o.jsx(ue,{...we,children:o.jsx(de,{client:Ee,children:o.jsx(pe,{children:o.jsx(Oe,{})})})})})}));const De=()=>{const e=document.getElementById("loading-fallback");e&&(e.classList.add("fade-out"),setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="auto"},400))};setTimeout(De,600);export{It as $,dt as A,mt as B,pt as C,Mt as D,Ue as E,Pt as F,Ht as G,Gt as H,Wt as I,qt as J,ft as K,Et as L,Qt as M,Zt as N,es as O,jt as P,ts as Q,Kt as R,Je as S,Jt as T,Vt as U,Yt as V,At as W,vt as X,Dt as Y,Ct as Z,Lt as _,ze as a,wt as a0,xt as a1,$t as a2,St as a3,Rt as a4,bt as a5,yt as a6,ht as a7,Ot as a8,kt as a9,gt as aa,Nt as ab,Tt as ac,Ut as ad,Bt as ae,zt as af,Pe as ag,Xt as ah,Ft as b,Me as c,Ye as d,Re as e,ct as f,Ve as g,He as h,lt as i,_t as j,et as k,tt as l,at as m,st as n,nt as o,Ke as p,he as q,it as r,rt as s,ot as t,Be as u,Ze as v,Xe as w,Ge as x,Qe as y,ut as z};
