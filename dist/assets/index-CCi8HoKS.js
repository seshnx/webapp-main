const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AuthWizard-C4RBZ-ta.js","assets/edu-RzAe-4UK.js","assets/vendor-Y4e9NvvL.js","assets/vendor-D33SxI2g.css","assets/config-qjJGY2oX.js","assets/chat-RkqlWne8.js","assets/vendor-framer-BqubDqAU.js","assets/vendor-maps-2sOZK3TB.js","assets/vendor-maps-Dgihpmma.css","assets/SeshNx-PNG cCropped white text-BVqTFh8v.js","assets/AppRoutes-3rr2hUeg.js","assets/MainLayout-BsQpz79x.js"])))=>i.map(i=>d[i]);
var re=Object.defineProperty;var ie=(e,a,s)=>a in e?re(e,a,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[a]=s;var B=(e,a,s)=>ie(e,typeof a!="symbol"?a+"":a,s);import{r as R,bI as ne,bJ as oe,bK as le,bL as ce,bM as ue,bN as de,j as n,L as U,bO as pe,R as fe,ao as me,g as Ee,G as _e,bP as ge,bQ as he,bR as ye,bS as Se,bT as Ne,bU as be,bV as Te,bW as Re,bX as $e,bY as xe,bZ as Oe}from"./vendor-Y4e9NvvL.js";import{_ as q}from"./edu-RzAe-4UK.js";import{L as we,c as Ce}from"./chat-RkqlWne8.js";import"./config-qjJGY2oX.js";import"./vendor-framer-BqubDqAU.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};e.SENTRY_RELEASE={id:"local"}}catch{}})();try{(function(){var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="b5a7432c-5b26-41bb-b2ea-d7320b747e99",e._sentryDebugIdIdentifier="sentry-dbid-b5a7432c-5b26-41bb-b2ea-d7320b747e99")})()}catch{}(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function s(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(r){if(r.ep)return;r.ep=!0;const i=s(r);fetch(r.href,i)}})();function et(e,a){R.useEffect(()=>{var s,t,r;if(e){if(e.theme){const i=document.documentElement;e.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(i.classList.add("dark"),localStorage.setItem("theme","dark")):(i.classList.remove("dark"),localStorage.setItem("theme","light")):e.theme==="dark"?(i.classList.add("dark"),localStorage.setItem("theme","dark")):(i.classList.remove("dark"),localStorage.setItem("theme","light"))}if((s=e.accessibility)!=null&&s.fontSize){const i=document.documentElement,o={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};i.style.fontSize=o[e.accessibility.fontSize]||o.medium,localStorage.setItem("fontSize",e.accessibility.fontSize)}if(((t=e.accessibility)==null?void 0:t.reducedMotion)!==void 0){const i=document.documentElement;e.accessibility.reducedMotion?(i.classList.add("reduce-motion"),i.style.setProperty("--motion-duration","0s")):(i.classList.remove("reduce-motion"),i.style.removeProperty("--motion-duration")),localStorage.setItem("reducedMotion",String(e.accessibility.reducedMotion))}if(((r=e.accessibility)==null?void 0:r.highContrast)!==void 0){const i=document.documentElement;e.accessibility.highContrast?i.classList.add("high-contrast"):i.classList.remove("high-contrast"),localStorage.setItem("highContrast",String(e.accessibility.highContrast))}e.language&&(document.documentElement.lang=e.language,localStorage.setItem("language",e.language)),e.timezone&&e.timezone!=="auto"&&localStorage.setItem("timezone",e.timezone),e.currency&&localStorage.setItem("currency",e.currency),e.dateFormat&&localStorage.setItem("dateFormat",e.dateFormat),e.timeFormat&&localStorage.setItem("timeFormat",e.timeFormat),e.numberFormat&&localStorage.setItem("numberFormat",e.numberFormat),localStorage.setItem("userSettings",JSON.stringify(e))}},[e])}function Ie(){if(typeof window>"u")return null;const e=localStorage.getItem("userSettings");if(e)try{return JSON.parse(e)}catch(a){console.error("Failed to parse stored settings:",a)}return null}const Le=`postgresql://neondb_owner:npg_yLHWnNa8l2tv@ep-young-glitter-ahzrw96g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
`,H=ne(Le);async function ee(e,a=[]){if(!H)throw new Error("Neon client is not configured. Check VITE_NEON_DATABASE_URL environment variable.");try{return await H(e,a)}catch(s){throw console.error("Neon query error:",s),s}}const te={getUserById:"SELECT * FROM clerk_users WHERE id = $1",getUserByEmail:"SELECT * FROM clerk_users WHERE email = $1",getUserByUsername:"SELECT * FROM clerk_users WHERE username = $1",getProfileByUserId:"SELECT * FROM profiles WHERE user_id = $1",getActiveProfile:`
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
  `};async function ve(e,a=[]){const s=te[e];if(!s)throw new Error(`Query "${e}" not found.`);return ee(s,a)}const tt=Object.freeze(Object.defineProperty({__proto__:null,executeQuery:ve,neonClient:H,queries:te,query:ee},Symbol.toStringTag,{value:"Module"}));function De(e,a){throw console.error(`Database error in ${a}:`,e),new Error(`Query ${a} failed: ${e instanceof Error?e.message:String(e)}`)}async function l(e,a=[],s="Unnamed Query"){if(!H)throw new Error("Neon client is not configured");try{return await H(e,a)}catch(t){De(t,s)}}async function Ae(e){return(await l("SELECT * FROM clerk_users WHERE id = $1",[e],"getUser"))[0]||null}async function st(e){var s;let a=await l("SELECT * FROM profiles WHERE user_id = $1",[e],"getProfile");if(!a||a.length===0){console.log(`[getProfile] No profile found for user ${e}, attempting to create default profile`);try{const t=await l("SELECT first_name, last_name, username FROM clerk_users WHERE id = $1",[e],"getProfile-fetchUser"),r=t==null?void 0:t[0];if(!r)return console.warn(`[getProfile] User ${e} not found in clerk_users table, cannot create profile`),null;const i=r!=null&&r.first_name&&(r!=null&&r.last_name)?`${r.first_name} ${r.last_name}`:(r==null?void 0:r.username)||(r==null?void 0:r.first_name)||"New User",o=await l("INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) RETURNING *",[e,i],"getProfile-create");return console.log(`[getProfile] Successfully created profile for user ${e}`),o[0]||null}catch(t){return console.error("[getProfile] Failed to create default profile:",t),(s=t==null?void 0:t.message)!=null&&s.includes("foreign key constraint")&&console.warn(`[getProfile] Cannot create profile: user ${e} does not exist in clerk_users table`),null}}return a[0]||null}async function at(e){return!e||e.length===0?[]:await l("SELECT * FROM profiles WHERE user_id = ANY($1)",[e],"getProfilesByIds")}async function rt(e={}){const{searchQuery:a,accountTypes:s,minRate:t,maxRate:r,experience:i,verifiedOnly:o,availableNow:d,hasPortfolio:y,vocalRange:g,vocalStyle:h,djStyle:f,productionStyle:u,engineeringSpecialty:w,genres:T,location:$,sortBy:M="relevance",limit:P=100,excludeUserId:v}=e;let S=`
    SELECT
      cu.id,
      cu.email,
      cu.first_name,
      cu.last_name,
      cu.username,
      cu.profile_photo_url,
      cu.account_types,
      cu.active_role,
      cu.bio,
      cu.created_at,
      cu.updated_at,
      p.id as profile_id,
      p.display_name,
      p.photo_url as profile_photo,
      p.location as profile_location,
      p.talent_info,
      p.engineer_info,
      p.producer_info,
      p.followers_count,
      p.posts_count,
      p.reputation_score as rating,
      COALESCE(p.reputation_score, 0) as review_count
    FROM clerk_users cu
    LEFT JOIN profiles p ON p.user_id = cu.id
    WHERE 1=1
  `;const x=[];let _=1;if(v&&(S+=` AND cu.id != $${_++}`,x.push(v)),s&&s.length>0&&!s.includes("All")&&(S+=` AND cu.account_types && $${_++}`,x.push(s)),o&&(S+=" AND p.verified = true"),y&&(S+=" AND (p.reputation_score > 0 OR p.talent_info->>'portfolio' IS NOT NULL)"),i){const p={beginner:[0,2],intermediate:[2,5],advanced:[5,10],expert:[10,100]},[E,b]=p[i];S+=` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) >= $${_++}`,S+=` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) < $${_++}`,x.push(E,b)}if(t!==void 0||r!==void 0){const p=t!==void 0?t:0;S+=` AND CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) >= $${_++}`,x.push(p)}if(r!==void 0&&(S+=` AND CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) <= $${_++}`,x.push(r)),g&&(S+=` AND p.talent_info->>'vocalRange' = $${_++}`,x.push(g)),T&&T.length>0&&(S+=" AND p.talent_info->>'genres' IS NOT NULL"),a){S+=` AND (
      cu.first_name ILIKE $${_++} OR
      cu.last_name ILIKE $${_++} OR
      cu.username ILIKE $${_++} OR
      cu.bio ILIKE $${_++} OR
      p.display_name ILIKE $${_++}
    )`;const p=`%${a}%`;x.push(p,p,p,p,p)}switch(M){case"rating":S+=" ORDER BY p.reputation_score DESC NULLS LAST";break;case"rate_low":S+=" ORDER BY CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) ASC";break;case"rate_high":S+=" ORDER BY CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) DESC";break;case"recent":S+=" ORDER BY cu.updated_at DESC";break;default:S+=" ORDER BY p.reputation_score DESC NULLS LAST, cu.updated_at DESC"}S+=` LIMIT $${_++}`,x.push(P);let N=await l(S,x,"searchProfiles");if(h&&(N=N.filter(p=>{var E,b,c,m;return((b=(E=p.talent_info)==null?void 0:E.vocalStyles)==null?void 0:b.includes(h))||((m=(c=p.talent_info)==null?void 0:c.genres)==null?void 0:m.includes(h))})),f&&(N=N.filter(p=>{var E,b,c,m;return((b=(E=p.talent_info)==null?void 0:E.djStyles)==null?void 0:b.includes(f))||((m=(c=p.talent_info)==null?void 0:c.genres)==null?void 0:m.includes(f))})),u&&(N=N.filter(p=>{var E,b,c,m;return((b=(E=p.talent_info)==null?void 0:E.productionStyles)==null?void 0:b.includes(u))||((m=(c=p.talent_info)==null?void 0:c.genres)==null?void 0:m.includes(u))})),w&&(N=N.filter(p=>{var E,b,c,m;return((b=(E=p.talent_info)==null?void 0:E.skills)==null?void 0:b.includes(w))||((m=(c=p.engineer_info)==null?void 0:c.specialties)==null?void 0:m.includes(w))})),T&&T.length>0&&(N=N.filter(p=>T.some(E=>{var b,c;return(c=(b=p.talent_info)==null?void 0:b.genres)==null?void 0:c.includes(E)}))),d){const p=new Date(Date.now()-36e5);N=N.filter(E=>new Date(E.updated_at)>p)}return $&&$.lat&&$.lng&&(N=N.filter(p=>{var A;const E=((A=p.talent_info)==null?void 0:A.location)||p.profile_location;if(!E||!E.lat||!E.lng)return!1;const b=3959,c=(E.lat-$.lat)*Math.PI/180,m=(E.lng-$.lng)*Math.PI/180,D=Math.sin(c/2)*Math.sin(c/2)+Math.cos($.lat*Math.PI/180)*Math.cos(E.lat*Math.PI/180)*Math.sin(m/2)*Math.sin(m/2),C=2*Math.atan2(Math.sqrt(D),Math.sqrt(1-D));return b*C<=$.radius})),N}async function ke(e){return(await l(`SELECT
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
    WHERE cu.id = $1`,[e],"getUserWithProfile"))[0]||null}async function se(e){const{id:a,email:s,phone:t=null,first_name:r=null,last_name:i=null,username:o=null,profile_photo_url:d=null,account_types:y=["Fan"],active_role:g="Fan",bio:h=null,zip_code:f=null}=e,u=Array.isArray(y)?`{${y.join(",")}}`:y||"{Fan}";return(await l(`INSERT INTO clerk_users (
      id, email, phone, first_name, last_name, username, profile_photo_url,
      account_types, active_role, bio, zip_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      username = EXCLUDED.username,
      profile_photo_url = EXCLUDED.profile_photo_url,
      account_types = EXCLUDED.account_types,
      active_role = EXCLUDED.active_role,
      bio = EXCLUDED.bio,
      zip_code = EXCLUDED.zip_code,
      updated_at = NOW()
    RETURNING *`,[a,s,t,r,i,o,d,u,g,h,f],"createClerkUser"))[0]}async function it(e,a=null){const s=await Ae(e);return s||await se({id:e,...a})}async function nt(e,a){const s=[],t=[];let r=1;const{active_role:i,account_types:o,preferred_role:d,zip_code:y,zip:g,first_name:h,last_name:f,email:u,use_legal_name_only:w,use_user_name_only:T,effective_display_name:$,...M}=a,P=y!==void 0?y:g;if(i!==void 0&&await l("UPDATE clerk_users SET active_role = $1 WHERE id = $2",[i,e],"updateProfile-active_role"),o!==void 0){const x=Array.isArray(o)?`{${o.join(",")}}`:o;await l("UPDATE clerk_users SET account_types = $1 WHERE id = $2",[x,e],"updateProfile-account_types")}d!==void 0&&await l("UPDATE clerk_users SET preferred_role = $1 WHERE id = $2",[d,e],"updateProfile-preferred_role"),P!==void 0&&await l("UPDATE clerk_users SET zip_code = $1 WHERE id = $2",[P,e],"updateProfile-zip_code"),h!==void 0&&await l("UPDATE clerk_users SET first_name = $1 WHERE id = $2",[h,e],"updateProfile-first_name"),f!==void 0&&await l("UPDATE clerk_users SET last_name = $1 WHERE id = $2",[f,e],"updateProfile-last_name"),u!==void 0&&await l("UPDATE clerk_users SET email = $1 WHERE id = $2",[u,e],"updateProfile-email"),w!==void 0&&await l("UPDATE clerk_users SET use_legal_name_only = $1 WHERE id = $2",[w,e],"updateProfile-use_legal_name_only"),T!==void 0&&await l("UPDATE clerk_users SET use_user_name_only = $1 WHERE id = $2",[T,e],"updateProfile-use_user_name_only"),$!==void 0&&await l("UPDATE clerk_users SET effective_display_name = $1 WHERE id = $2",[$,e],"updateProfile-effective_display_name");const v=["username","profile_photo_url","hourlyRate"];for(const[x,_]of Object.entries(M))if(!v.includes(x))if(x==="search_terms"&&Array.isArray(_)){const j=_.map((N,p)=>`$${r+p}`);s.push(`${x} = ARRAY[${j.join(",")}]`),_.forEach(N=>{t.push(N||"")}),r+=_.length}else s.push(`${x} = $${r}`),t.push(_),r++;return s.length===0?(await l("SELECT * FROM profiles WHERE user_id = $1",[e],"updateProfile-fetch"))[0]||{}:(t.push(e),(await l(`UPDATE profiles SET ${s.join(", ")}, updated_at = NOW() WHERE user_id = $${r} RETURNING *`,t,"updateProfile"))[0])}async function ot(e,a={}){const{limit:s=50,offset:t=0}=a;return await l(`SELECT * FROM bookings
     WHERE (sender_id::text = $1 OR target_id::text = $1 OR studio_owner_id = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,[e,s,t],"getBookings")}async function lt(e){try{return await l(`SELECT * FROM blocked_dates
       WHERE studio_id = $1
       ORDER BY date ASC`,[e],"getBlockedDates")}catch(a){if(a.message.includes("does not exist"))return[];throw a}}async function ct(e,a={}){const{limit:s=50,offset:t=0}=a;return await l(`SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,[e,s,t],"getNotifications")}async function ut(e){const{user_id:a,type:s,title:t,message:r=null,read:i=!1,reference_type:o=null,reference_id:d=null,metadata:y={}}=e;return(await l(`INSERT INTO notifications (
      user_id, type, title, message, read, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,[a,s,t,r,i,o,d,JSON.stringify(y)],"createNotification"))[0]}async function dt(e){return(await l("UPDATE notifications SET read = true WHERE id = $1 RETURNING *",[e],"markNotificationAsRead"))[0]}async function pt(e){await l("UPDATE notifications SET read = true WHERE user_id = $1",[e],"markAllNotificationsAsRead")}async function ft(e){return(await l("DELETE FROM notifications WHERE id = $1 RETURNING *",[e],"deleteNotification"))[0]}async function mt(e){await l("DELETE FROM notifications WHERE user_id = $1",[e],"clearAllNotifications")}async function Et(e){return(await l("SELECT following_id FROM follows WHERE follower_id = $1",[e],"getFollowing")).map(s=>s.following_id)}async function _t(e,a,s){const r={Talent:"talent_info",Engineer:"engineer_info",Producer:"producer_info",Studio:"studio_info",EDUStaff:"education_info",EDUAdmin:"education_info",Student:"education_info",Intern:"education_info",Label:"label_info",Agent:"label_info",Technician:"technician_info"}[a];if(!r)throw new Error(`Invalid role for sub-profile: ${a}`);const i=await l(`UPDATE profiles
     SET ${r} = $2::jsonb,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING ${r}`,[e,JSON.stringify(s)],"upsertSubProfile");return i.length===0?(await l(`INSERT INTO profiles (user_id, ${r})
       VALUES ($1, $2::jsonb)
       RETURNING ${r}`,[e,JSON.stringify(s)],"upsertSubProfile-insert"))[0][r]:i[0][r]}async function gt(e){const a=await l(`SELECT
       sp.account_type,
       sp.profile_data,
       sp.is_active
     FROM sub_profiles sp
     WHERE sp.user_id = $1 AND sp.is_active = true`,[e],"getSubProfiles");return a.length===0?[]:a.map(s=>({...s.profile_data,account_type:s.account_type}))}async function ht(e){const{reporterId:a,targetType:s,targetId:t,reason:r,description:i}=e,d=(await l(`INSERT INTO content_reports (
      reporter_id, target_type, target_id, reason, description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,[a,s,t,r,i||null],"reportContent"))[0];return await l(`INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
    SELECT cu.id, 'system', 'New content report', $1
    FROM clerk_users cu
    WHERE cu.account_types @> ARRAY['GAdmin'::TEXT]
       OR cu.account_types @> ARRAY['EDUAdmin'::TEXT]
    LIMIT 10`,[`New ${r} report submitted for ${s}`],"notifyModerators"),d}async function yt(e){return(await l(`SELECT
      COUNT(DISTINCT CASE WHEN status = 'Open' THEN id END) as open_requests,
      COUNT(DISTINCT CASE WHEN status IN ('Assigned', 'In Progress') THEN id END) as active_jobs,
      COUNT(DISTINCT CASE WHEN status = 'Completed' THEN id END) as completed_jobs,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN actual_cost ELSE 0 END), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN status IN ('Assigned', 'In Progress') THEN estimated_cost ELSE 0 END), 0) as pending_earnings,
      COALESCE((SELECT AVG(r.rating)::numeric(3,2) FROM reviews r WHERE r.target_id::text = $1), 0) as average_rating
     FROM service_requests sr
     WHERE sr.tech_id::text = $1`,[e],"getTechMetrics"))[0]||{}}async function St(e){return await l(`SELECT
      COUNT(DISTINCT lr.artist_id) as total_artists,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as active_releases,
      COALESCE(SUM(ds.lifetime_earnings), 0) as total_revenue,
      COALESCE(SUM(ds.lifetime_streams), 0) as total_streams
     FROM label_roster lr
     LEFT JOIN releases r ON r.artist_id = lr.artist_id
     LEFT JOIN distribution_stats ds ON ds.release_id = r.id
     WHERE lr.label_id::text = $1`,[e],"getLabelMetrics")}async function Nt(e){return await l(`SELECT
      COUNT(DISTINCT sr.id) as total_rooms,
      COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings
     FROM studio_rooms sr
     LEFT JOIN bookings b ON b.studio_owner_id = $1 AND (b.venue_id = sr.id OR b.venue_id IS NULL)
     WHERE sr.studio_id = $1`,[e],"getStudioMetrics")}async function bt(e){return await l(`SELECT
      COUNT(DISTINCT r.id) as total_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as live_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'draft' THEN r.id END) as draft_releases
     FROM releases r
     WHERE r.artist_id::text = $1 OR r.label_id::text = $1`,[e],"getDistributionMetrics")}async function Tt(e,a={}){const{status:s,limit:t=50,offset:r=0}=a;let i=`SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    WHERE sr.tech_id::text = $1`;const o=[e];let d=2;return s&&(i+=` AND sr.status = $${d}`,o.push(s),d++),i+=` ORDER BY sr.created_at DESC LIMIT $${d} OFFSET $${d+1}`,o.push(t,r),await l(i,o,"getTechServiceRequests")}async function Rt(e={}){const{category:a,limit:s=50,offset:t=0}=e;let r=`SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo,
    pp.location->>'city' as city,
    pp.location->>'state' as state
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    LEFT JOIN tech_public_profiles pp ON pp.user_id = sr.requester_id::text
    WHERE sr.status = 'Open'`;const i=[];let o=1;return a&&(r+=` AND sr.service_category = $${o}`,i.push(a),o++),r+=` ORDER BY sr.created_at DESC LIMIT $${o} OFFSET $${o+1}`,i.push(s,t),await l(r,i,"getOpenServiceRequests")}async function $t(e){const{requester_id:a,title:s,description:t,service_category:r,equipment_name:i,equipment_brand:o,equipment_model:d,issue_description:y,logistics:g="Drop-off",preferred_date:h,budget_cap:f,priority:u="Normal"}=e;if(!a||!s||!r||!i)throw new Error("Missing required fields for service request");return(await l(`INSERT INTO service_requests (
      requester_id, title, description, service_category, equipment_name,
      equipment_brand, equipment_model, issue_description, logistics,
      preferred_date, budget_cap, priority, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Open')
    RETURNING *`,[a,s,t,r,i,o,d,y,g,h,f,u],"createServiceRequest"))[0]}async function xt(e,a,s){const t=await l(`UPDATE service_requests
     SET status = $1, tech_id = COALESCE($2, tech_id), updated_at = NOW()
     WHERE id = $3 RETURNING *`,[a,s||null,e],"updateServiceRequestStatus");if(t.length===0)throw new Error(`Service request ${e} not found`);return t[0]}async function Ot(e={}){const{specialty:a,location:s,availability:t,minRating:r,maxRate:i,maxResponseTime:o,limit:d=50,offset:y=0}=e;let h=`WITH tech_response_times AS (
    SELECT tech_id, AVG(EXTRACT(EPOCH FROM (assigned_at - created_at)) / 3600) as avg_hours
    FROM service_requests
    WHERE assigned_at IS NOT NULL
    GROUP BY tech_id
  )
    SELECT DISTINCT
      pp.user_id,
      pp.display_name,
      pp.bio,
      pp.specialties,
      pp.certifications,
      pp.years_experience,
      pp.hourly_rate,
      pp.location,
      pp.service_radius,
      pp.availability_status,
      pp.rating_average,
      pp.review_count,
      pp.completed_jobs,
      pp.profile_photo,
      pp.is_verified_tech,
      cu.first_name,
      cu.last_name,
      cu.email,
      COALESCE(pp.rating_average, 0) as rating,
      trt.avg_hours
    FROM tech_public_profiles pp
    JOIN clerk_users cu ON cu.id = pp.user_id
    LEFT JOIN tech_response_times trt ON trt.tech_id = pp.user_id
    WHERE 'Technician' = ANY(cu.account_types)`;const f=[];let u=1;if(a&&(h+=` AND $${u} = ANY(pp.specialties)`,f.push(a),u++),t&&t!=="any"&&(h+=` AND pp.availability_status = $${u}`,f.push(t),u++),r&&(h+=` AND COALESCE(pp.rating_average, 0) >= $${u}`,f.push(r),u++),i&&(h+=` AND (pp.hourly_rate IS NULL OR pp.hourly_rate <= $${u})`,f.push(i),u++),o&&(h+=` AND (trt.avg_hours IS NULL OR trt.avg_hours <= $${u})`,f.push(o),u++),s&&s.lat&&s.lng&&s.radius){const T=s.radius/69,$=s.radius/(69*Math.cos(s.lat*Math.PI/180));h+=` AND
      (pp.location->>'lat')::float BETWEEN $${u} AND $${u+1}
      AND (pp.location->>'lng')::float BETWEEN $${u+2} AND $${u+3}`,f.push(s.lat-T,s.lat+T,s.lng-$,s.lng+$),u+=4}return h+=` ORDER BY pp.completed_jobs DESC, pp.rating_average DESC
           LIMIT $${u} OFFSET $${u+1}`,f.push(d,y),(await l(h,f,"searchTechnicians")).map(T=>{var $,M;return{...T,avg_response_hours:T.avg_hours||null,distance:s&&(($=T.location)!=null&&$.lat)&&((M=T.location)!=null&&M.lng)?Ue(s.lat,s.lng,T.location.lat,T.location.lng):void 0}})}function Ue(e,a,s,t){const i=(s-e)*Math.PI/180,o=(t-a)*Math.PI/180,d=Math.sin(i/2)*Math.sin(i/2)+Math.cos(e*Math.PI/180)*Math.cos(s*Math.PI/180)*Math.sin(o/2)*Math.sin(o/2);return 3959*(2*Math.atan2(Math.sqrt(d),Math.sqrt(1-d)))}async function wt(e){return(await l(`SELECT
      pp.user_id,
      pp.display_name,
      pp.bio,
      pp.specialties,
      pp.certifications,
      pp.years_experience,
      pp.hourly_rate,
      pp.location,
      pp.service_radius,
      pp.availability_status,
      pp.rating_average,
      pp.review_count,
      pp.completed_jobs,
      pp.profile_photo,
      pp.is_verified_tech,
      cu.first_name,
      cu.last_name,
      cu.email
     FROM tech_public_profiles pp
     JOIN clerk_users cu ON cu.id = pp.user_id::text
     WHERE pp.user_id = $1`,[e],"getTechnicianProfile"))[0]||null}async function Ct(e,a){const s=[],t=[];let r=1;for(const[o,d]of Object.entries(a))o==="specialties"&&Array.isArray(d)?(s.push(`${o} = $${r}`),t.push(d)):o==="location"&&typeof d=="object"?(s.push(`${o} = $${r}`),t.push(JSON.stringify(d))):o==="certifications"&&Array.isArray(d)?(s.push(`${o} = $${r}`),t.push(d)):o!=="user_id"&&o!=="first_name"&&o!=="last_name"&&o!=="email"&&(s.push(`${o} = $${r}`),t.push(d)),r++;if(s.length===0)throw new Error("No valid fields to update");t.push(e);const i=await l(`UPDATE tech_public_profiles SET ${s.join(", ")}, updated_at = NOW()
     WHERE user_id = $${r} RETURNING *`,t,"updateTechnicianProfile");if(i.length===0)throw new Error(`Technician profile for user ${e} not found`);return i[0]}async function It(e,a={}){const{limit:s=50,offset:t=0}=a;return await l(`SELECT sr.*,
      cu.first_name || ' ' || cu.last_name as requester_name,
      cu.profile_photo_url as requester_photo
     FROM service_requests sr
     JOIN clerk_users cu ON cu.id = sr.requester_id::text
     WHERE sr.tech_id::text = $1 AND sr.status = 'Completed'
     ORDER BY sr.completed_at DESC
     LIMIT $2 OFFSET $3`,[e,s,t],"getTechEarnings")}async function Lt(e={}){const{type:a,limit:s=50,offset:t=0}=e;let r=`SELECT mi.*, cu.username, cu.profile_photo_url
     FROM marketplace_items mi
     JOIN clerk_users cu ON cu.id = mi.seller_id::TEXT`;const i=[];let o=1;return a&&(r+=` AND mi.item_type = $${o}`,i.push(a),o++),r+=` ORDER BY mi.created_at DESC LIMIT $${o} OFFSET $${o+1}`,i.push(s,t),await l(r,i,"getMarketplaceItems")}async function vt(e){var s;const a=await l(`SELECT COALESCE(balance, 0) as balance
     FROM wallets
     WHERE user_id = $1`,[e],"getWalletBalance");return parseFloat(((s=a[0])==null?void 0:s.balance)||"0")}async function Dt(e=20){return await l(`SELECT id, brand, model, category, sub_category, specs, submitted_by, submitter_name, votes, timestamp
     FROM equipment_submissions
     WHERE status = 'pending'
     ORDER BY timestamp DESC
     LIMIT $1`,[e],"getPendingSubmissions")}async function At(e,a){await l(`UPDATE equipment_submissions
     SET votes = $2::jsonb
     WHERE id = $1`,[e,JSON.stringify(a)],"updateSubmissionVotes")}async function kt(e,a){const s=await l(`SELECT brand, model, category, sub_category, specs, submitted_by
     FROM equipment_submissions
     WHERE id = $1`,[e],"approveEquipmentSubmission-get");if(s.length===0)throw new Error("Submission not found");const t=s[0];await l(`INSERT INTO equipment_database (name, brand, model, category, subcategory, specifications, added_by, verified_by)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, ARRAY[$7])`,[`${t.brand} ${t.model}`,t.brand,t.model,t.category,t.sub_category,t.specs,t.submitted_by],"approveEquipmentSubmission-insert"),await l(`UPDATE equipment_submissions
     SET status = 'approved'
     WHERE id = $1`,[e],"approveEquipmentSubmission-update")}async function Ut(e){await l(`UPDATE equipment_submissions
     SET status = 'rejected'
     WHERE id = $1`,[e],"rejectEquipmentSubmission")}async function Mt(e){return(await l(`INSERT INTO equipment_submissions (brand, model, category, sub_category, specs, submitted_by, submitter_name, status, votes, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', '{"yes": [], "fake": [], "duplicate": []}'::jsonb, NOW())
     RETURNING *`,[e.brand,e.model,e.category,e.subCategory||null,e.specs||"{}",e.submittedBy,e.submitterName||null],"createEquipmentSubmission"))[0]}async function jt(e,a){await l(`INSERT INTO wallets (user_id, balance, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET balance = wallets.balance + $2,
         updated_at = NOW()`,[e,a],"upsertWallet")}async function Pt(e){return await l(`SELECT id, name, email, stage_name, primary_role, genre, contract_type,
            status, signed_date, notes, created_at, updated_at
     FROM external_artists
     WHERE label_id = $1
     ORDER BY created_at DESC`,[e],"getExternalArtists")}async function Ft(e,a){return(await l(`INSERT INTO external_artists (
       label_id, name, email, stage_name, primary_role,
       genre, contract_type, signed_date, notes, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'invited')
     RETURNING *`,[e,a.name,a.email||null,a.stage_name||null,a.primary_role||null,a.genre||[],a.contract_type||null,a.signed_date||null,a.notes||null],"createExternalArtist"))[0]}async function Wt(e){var s;return((s=(await l("SELECT get_pending_bookings_count($1) as count",[e],"getBookingCount"))[0])==null?void 0:s.count)||0}async function Ht(e){await l("SELECT record_user_metrics($1)",[e],"recordUserMetrics")}async function qt(e,a,s=30){var o;const r=((o=(await l("SELECT get_trend_percentage($1, $2, $3) as get_trend_percentage",[e,a,s],"getTrendPercentage"))[0])==null?void 0:o.get_trend_percentage)||0;return`${r>=0?"+":""}${r}%`}async function Bt(e){var s;const a=await l("SELECT COUNT(*) as count FROM metrics_history WHERE user_id = $1",[e],"hasHistoricalData");return parseInt(((s=a[0])==null?void 0:s.count)||"0",10)>=2}const F=R.lazy(()=>q(()=>import("./AuthWizard-C4RBZ-ta.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))),Me=R.lazy(()=>q(()=>import("./AppRoutes-3rr2hUeg.js"),__vite__mapDeps([10,1,2,3,4,5,6]))),je=R.lazy(()=>q(()=>import("./MainLayout-BsQpz79x.js"),__vite__mapDeps([11,1,2,3,4,5,6])));function Pe(){var E,b;const{isLoaded:e,isSignedIn:a,userId:s}=oe(),{user:t}=le(),r=ce(),[i,o]=R.useState(null),[d,y]=R.useState(!0),g=ue(),h=de(),[f,u]=R.useState(()=>typeof window<"u"?localStorage.getItem("theme")==="dark"||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches:!1);R.useEffect(()=>{const c=Ie();if(c){const m=document.documentElement;c.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(m.classList.add("dark"),u(!0)):(m.classList.remove("dark"),u(!1)):c.theme==="dark"?(m.classList.add("dark"),u(!0)):(m.classList.remove("dark"),u(!1))}},[]),R.useEffect(()=>{var c,m,D;if(i!=null&&i.settings){const C=i.settings,I=document.documentElement;if(C.theme&&(C.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(I.classList.add("dark"),u(!0)):(I.classList.remove("dark"),u(!1)):C.theme==="dark"?(I.classList.add("dark"),u(!0)):(I.classList.remove("dark"),u(!1))),(c=C.accessibility)!=null&&c.fontSize){const A={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};I.style.fontSize=A[C.accessibility.fontSize]||A.medium}(m=C.accessibility)!=null&&m.reducedMotion?(I.classList.add("reduce-motion"),I.style.setProperty("--motion-duration","0s")):(I.classList.remove("reduce-motion"),I.style.removeProperty("--motion-duration")),(D=C.accessibility)!=null&&D.highContrast?I.classList.add("high-contrast"):I.classList.remove("high-contrast"),C.language&&(document.documentElement.lang=C.language)}},[i==null?void 0:i.settings]),R.useEffect(()=>{f?(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark")):(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"))},[f]);const w=()=>u(!f);R.useEffect(()=>{if(!e)return;let c=!0;return(async()=>{var A,z,Y,J,G,V,X,K,Q;const D=((z=(A=r.__internal)==null?void 0:A.call(r))==null?void 0:z.getState())??{},C=s||D.userId,I=a||D.session||D.user;if(!C||!I){c&&(o(null),y(!1));return}try{const O=await ke(C);if(O){const L={id:C,firstName:(t==null?void 0:t.firstName)||O.first_name||"User",lastName:(t==null?void 0:t.lastName)||O.last_name||"",email:((Y=t==null?void 0:t.primaryEmailAddress)==null?void 0:Y.emailAddress)||O.email||"",accountTypes:O.account_types||["Fan"],activeProfileRole:O.active_role||((J=O.account_types)==null?void 0:J[0])||"Fan",preferredRole:O.preferred_role||((G=O.account_types)==null?void 0:G[0])||"Fan",photoURL:(t==null?void 0:t.imageUrl)||O.photo_url||O.avatar_url||null,settings:O.settings||{},effectiveDisplayName:O.effective_display_name||(t==null?void 0:t.firstName)||O.first_name||"User",zipCode:O.zip_code,...O};c&&o(L)}else{const L=(t==null?void 0:t.publicMetadata)||{},ae={id:C,firstName:(t==null?void 0:t.firstName)||L.first_name||"User",lastName:(t==null?void 0:t.lastName)||L.last_name||"",email:((V=t==null?void 0:t.primaryEmailAddress)==null?void 0:V.emailAddress)||"",accountTypes:L.account_types||["Fan"],activeProfileRole:L.active_role||"Fan",photoURL:(t==null?void 0:t.imageUrl)||null,settings:{},effectiveDisplayName:(t==null?void 0:t.firstName)||L.first_name||"User"};c&&o(ae);try{console.log("📝 Creating user in Neon database...");const k=(t==null?void 0:t.publicMetadata)||{};await se({id:C,email:((X=t==null?void 0:t.primaryEmailAddress)==null?void 0:X.emailAddress)||"",phone:((K=t==null?void 0:t.primaryPhoneNumber)==null?void 0:K.phoneNumber)||null,first_name:(t==null?void 0:t.firstName)||k.first_name||null,last_name:(t==null?void 0:t.lastName)||k.last_name||null,username:(t==null?void 0:t.username)||k.username||null,profile_photo_url:(t==null?void 0:t.imageUrl)||null,account_types:k.account_types||["Fan"],active_role:k.active_role||"Fan",bio:k.bio||null,zip_code:k.zip_code||null}),console.log("✅ User created in Neon database")}catch(k){console.error("❌ Failed to create user in Neon:",k)}}c&&y(!1)}catch(O){if(console.error("Error loading user data:",O),c){const L=(t==null?void 0:t.publicMetadata)||{};o({id:s,firstName:(t==null?void 0:t.firstName)||L.first_name||"User",lastName:(t==null?void 0:t.lastName)||L.last_name||"",email:((Q=t==null?void 0:t.primaryEmailAddress)==null?void 0:Q.emailAddress)||"",accountTypes:L.account_types||["Fan"],activeProfileRole:L.active_role||"Fan",photoURL:(t==null?void 0:t.imageUrl)||null,settings:{}}),y(!1)}}})(),()=>{c=!1}},[s,a,e,t]);const T=R.useCallback(c=>{o(c)},[]),$=R.useCallback(async()=>{try{console.log("=== APP LOGOUT ===");const m=(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="5173")&&!1;r&&(await r.signOut(),console.log("✅ Clerk signOut successful")),o(null),console.log("✅ Local state cleared"),g("/login",{replace:!0}),console.log("✅ Navigated to login")}catch(c){console.error("Logout error:",c),o(null),g("/login",{replace:!0})}},[g,r,i]);if(!e||d)return n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})});const M=new URLSearchParams(window.location.search).get("intent")==="signup",v=(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="5173")&&!1,S=((b=(E=r.__internal)==null?void 0:E.call(r))==null?void 0:b.getState())??{},x=S.session||S.user,_=a&&s||x,j=i&&i.id,N=h.pathname==="/login",p=h.pathname==="/test-login";return!_&&!v&&!N&&!p?n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})}),children:n.jsx(F,{darkMode:f,toggleTheme:w,onSuccess:()=>g("/"),isNewUser:!1})}):_&&!j&&!N&&!p?n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})}):p?_&&j||v?(g("/debug-report",{replace:!0}),null):n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})}),children:n.jsx(F,{darkMode:f,toggleTheme:w,onSuccess:()=>g("/debug-report"),isNewUser:!1})}):N?_&&j||v?(g("/",{replace:!0}),null):n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})}),children:n.jsx(F,{darkMode:f,toggleTheme:w,onSuccess:()=>g("/"),isNewUser:!1})}):_&&!j&&M&&!v?n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})}),children:n.jsx(F,{user:t,isNewUser:!0,darkMode:f,toggleTheme:w,onSuccess:()=>g("/debug-report")})}):!_&&!v?n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:48})}),children:n.jsx(F,{darkMode:f,toggleTheme:w,onSuccess:()=>g("/"),isNewUser:!1})}):n.jsx(we,{userData:i,children:n.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:[n.jsx(pe,{position:"bottom-right",toastOptions:{style:{background:"#333",color:"#fff"}}}),h.pathname==="/settings"||h.pathname==="/debug-report"?n.jsx("main",{className:"p-6",children:n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"flex items-center justify-center min-h-screen",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:32})}),children:n.jsx(Me,{user:{id:s,...t},userData:i,loading:d,darkMode:f,toggleTheme:w,handleLogout:$,onUserDataUpdate:T})})}):n.jsx(R.Suspense,{fallback:n.jsx("div",{className:"flex items-center justify-center min-h-screen",children:n.jsx(U,{className:"animate-spin text-brand-blue",size:32})}),children:n.jsx(je,{user:{id:s,...t},userData:i,loading:d,darkMode:f,toggleTheme:w,handleLogout:$,onRoleSwitch:c=>{o(m=>m?{...m,activeProfileRole:c,preferredRole:c}:null)}})})]})})}const Fe=`pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk
`,We={publishableKey:Fe,appearance:{elements:{primaryButton:{backgroundColor:"hsl(222, 78%, 58%)",color:"white","&:hover":{backgroundColor:"hsl(223, 82%, 57%)"}},input:{borderColor:"#e2e8f0","&:focus":{borderColor:"#3D84ED"}}},variables:{colorPrimary:"#3D84ED",colorBackground:"white",colorInputBackground:"white",colorDanger:"#ef4444",colorSuccess:"#22c55e"}},debug:!1};let W=null,Z=!1;const He=async()=>{var a,s;if(W!==null)return W;if(Z)return null;const e=`https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712
`;Z=!0;try{const t=await q(()=>import("./vendor-Y4e9NvvL.js").then(o=>o.d$),__vite__mapDeps([2,3]));W=t;const{init:r}=t,i=(a=t.getCurrentHub)==null?void 0:a.call(t);return(s=i==null?void 0:i.getClient)!=null&&s.call(i)||r({dsn:e,environment:"production",tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),W}catch{return W=!1,null}},qe=(e,a={},s={})=>{const t={message:(e==null?void 0:e.message)||"Unknown error",stack:e==null?void 0:e.stack,name:e==null?void 0:e.name,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,url:window.location.href,...a,context:s};He().then(r=>{r&&r.captureException&&r.captureException(e,{extra:t,tags:{component:s.component||"Unknown",errorBoundary:s.errorBoundary||"None"},contexts:{custom:s}})}).catch(()=>{});try{const r=JSON.parse(localStorage.getItem("seshnx_errors")||"[]");r.unshift(t),r.splice(10),localStorage.setItem("seshnx_errors",JSON.stringify(r))}catch{}return t};class Be extends fe.Component{constructor(s){super(s);B(this,"handleReset",()=>{if(this.setState({hasError:!1,error:null,errorInfo:null,errorId:null,copied:!1}),this.props.onReset)this.props.onReset();else{const s=window.location.pathname;s!=="/"&&s!=="/dashboard"?window.location.href="/?tab=dashboard":window.location.reload()}});B(this,"handleCopyError",async()=>{var t,r,i;const s=`
Error ID: ${this.state.errorId}
Message: ${((t=this.state.error)==null?void 0:t.message)||"Unknown error"}
Stack: ${((r=this.state.error)==null?void 0:r.stack)||"No stack trace"}
Component Stack: ${((i=this.state.errorInfo)==null?void 0:i.componentStack)||"No component stack"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();try{await navigator.clipboard.writeText(s),this.setState({copied:!0}),setTimeout(()=>this.setState({copied:!1}),2e3)}catch(o){console.error("Failed to copy error:",o)}});this.state={hasError:!1,error:null,errorInfo:null,meme:"Unexpected signal chain failure.",errorId:null,copied:!1}}static getDerivedStateFromError(s){return{hasError:!0,error:s,errorId:`ERR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}}componentDidCatch(s,t){const r={componentStack:t.componentStack,errorBoundary:this.props.name||"Default",props:this.props.context||{}},i=qe(s,t,r);this.setState({errorInfo:{...t,errorId:this.state.errorId||i.timestamp}})}componentDidMount(){const s=["CoreAudio Overload detected.","The plugin crashed the session.","Buffer underrun exception.","Who deleted the master fader?","Sample rate mismatch: Reality is 44.1k, we are 48k.","The drummer kicked the power cable.","Ilok license not found.","Fatal Error: Not enough headroom.","The mix bus is clipping... hard.","Phantom power failure."];this.setState({meme:s[Math.floor(Math.random()*s.length)]})}render(){var s,t;return this.state.hasError?n.jsx("div",{className:"min-h-screen bg-[#1f2128] flex flex-col items-center justify-center p-4 text-center text-white font-sans",children:n.jsxs("div",{className:"bg-[#2c2e36] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden",children:[n.jsx("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"}),n.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[n.jsx("div",{className:"w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500",children:n.jsx(me,{size:32,strokeWidth:2})}),n.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Session Crashed"}),n.jsxs("p",{className:"text-xl text-[#3D84ED] font-medium mb-6 italic",children:['"',this.state.meme,'"']}),n.jsxs("div",{className:"bg-[#1f2128] p-4 rounded-lg w-full mb-6 text-left border border-gray-700",children:[n.jsxs("div",{className:"flex justify-between items-center mb-2",children:[n.jsx("p",{className:"text-xs text-gray-500 uppercase font-bold tracking-wider",children:"Error Details"}),n.jsx("button",{onClick:this.handleCopyError,className:"text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors",title:"Copy error details",children:this.state.copied?n.jsxs(n.Fragment,{children:[n.jsx(Ee,{size:12}),"Copied!"]}):n.jsxs(n.Fragment,{children:[n.jsx(_e,{size:12}),"Copy"]})})]}),n.jsxs("div",{className:"space-y-2",children:[this.state.errorId&&n.jsxs("div",{children:[n.jsx("span",{className:"text-xs text-gray-500",children:"Error ID: "}),n.jsx("code",{className:"text-xs text-blue-400 font-mono",children:this.state.errorId})]}),n.jsx("code",{className:"text-sm text-red-400 font-mono break-words block",children:((s=this.state.error)==null?void 0:s.message)||"Unknown error occurred"}),((t=this.state.error)==null?void 0:t.stack)&&n.jsxs("details",{className:"mt-2",children:[n.jsx("summary",{className:"text-xs text-gray-500 cursor-pointer hover:text-gray-400",children:"Stack Trace"}),n.jsx("pre",{className:"text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32",children:this.state.error.stack})]})]})]}),n.jsxs("div",{className:"flex gap-4 w-full",children:[n.jsx("button",{onClick:()=>window.history.back(),className:"flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",children:"Go Back"}),n.jsxs("button",{onClick:this.handleReset,className:"flex-1 bg-[#3D84ED] hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",children:[n.jsx(ge,{size:18}),"Reload App"]})]})]})]})}):this.props.children}}const ze=`https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712
`;he({dsn:ze,environment:"production",release:"local-dev",integrations:[ye({tracePropagationTargets:["localhost",/^https:\/\/(app\.seshnx\.com|webapp-main-.*\.vercel\.app)/]}),Se({maskAllText:!1,blockAllMedia:!1}),Ne(),be({levels:["error"]})],tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1,beforeSend(e,a){var s,t,r,i,o,d,y,g;return(i=(r=(t=(s=e.exception)==null?void 0:s.values)==null?void 0:t[0])==null?void 0:r.value)!=null&&i.includes("localStorage")||(g=(y=(d=(o=e.exception)==null?void 0:o.values)==null?void 0:d[0])==null?void 0:y.value)!=null&&g.includes("QuotaExceededError")?null:(e.contexts={...e.contexts,app:{name:"SeshNx Webapp",environment:"production"}},e)},initialScope:{tags:{framework:"react",runtime:"vite"}}});const Ye=({children:e})=>n.jsx(Oe,{fallback:({error:a,resetError:s})=>n.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:n.jsxs("div",{className:"text-center p-8",children:[n.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white mb-4",children:"Something went wrong"}),n.jsx("p",{className:"text-gray-600 dark:text-gray-400 mb-6",children:(a==null?void 0:a.message)||"An unexpected error occurred"}),n.jsx("button",{onClick:s,className:"px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors",children:"Try again"})]})}),children:e});Te.createRoot(document.getElementById("root")).render(n.jsx(Ye,{children:n.jsx(Be,{name:"Root",children:n.jsx(Re,{...We,children:n.jsx($e,{client:Ce,children:n.jsx(xe,{children:n.jsx(Pe,{})})})})})}));const Je=()=>{const e=document.getElementById("loading-fallback");e&&(e.classList.add("fade-out"),setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="auto"},400))};setTimeout(Je,600);export{xt as A,Ot as B,$t as C,Dt as D,Be as E,At as F,kt as G,jt as H,Ut as I,Mt as J,lt as K,St as L,Nt as M,bt as N,yt as O,Tt as P,It as Q,wt as R,Ct as S,Pt as T,Ft as U,ve as V,rt as W,tt as X,_t as a,vt as b,Wt as c,et as d,ke as e,st as f,gt as g,at as h,Lt as i,Bt as j,qt as k,Et as l,it as m,dt as n,pt as o,ft as p,ee as q,Ht as r,mt as s,ct as t,nt as u,ut as v,H as w,ot as x,ht as y,Rt as z};
