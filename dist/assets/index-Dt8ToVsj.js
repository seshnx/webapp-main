const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AuthWizard-CkZ8EGqv.js","assets/edu-Dgdq2qcb.js","assets/vendor-B4TWoEsZ.js","assets/vendor-D33SxI2g.css","assets/config-BtSfFN2A.js","assets/chat-Cerp6E0m.js","assets/vendor-framer-BXMxQmsa.js","assets/vendor-maps-MUiHD7aJ.js","assets/vendor-maps-Dgihpmma.css","assets/SeshNx-PNG cCropped white text-Bxw2rtHV.js","assets/AppRoutes-C66erBOG.js","assets/MainLayout-BXHY1wnO.js"])))=>i.map(i=>d[i]);
import{r as $,aS as G,aT as Y,aU as J,aV as V,aW as X,aX as K,j as i,L as O,aY as Q,aZ as Z,a_ as ee,R as te,aN as se,J as re,ab as ae,a$ as ie,b0 as ne,b1 as oe,b2 as le,b3 as ce,b4 as ue,b5 as de,b6 as pe,b7 as fe,b8 as me,b9 as _e}from"./vendor-B4TWoEsZ.js";import{n as W,_ as P}from"./edu-Dgdq2qcb.js";import{L as Ee,c as q,b as he}from"./chat-Cerp6E0m.js";import"./config-BtSfFN2A.js";import"./vendor-framer-BXMxQmsa.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};e.SENTRY_RELEASE={id:"local"};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="62a7e639-580a-4d9f-8e1c-bfb8c53f97f7",e._sentryDebugIdIdentifier="sentry-dbid-62a7e639-580a-4d9f-8e1c-bfb8c53f97f7")}catch{}})();(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();function Pe(e,t){$.useEffect(()=>{if(e){if(e.theme){const s=document.documentElement;e.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(s.classList.add("dark"),localStorage.setItem("theme","dark")):(s.classList.remove("dark"),localStorage.setItem("theme","light")):e.theme==="dark"?(s.classList.add("dark"),localStorage.setItem("theme","dark")):(s.classList.remove("dark"),localStorage.setItem("theme","light"))}if(e.accessibility?.fontSize){const s=document.documentElement,r={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};s.style.fontSize=r[e.accessibility.fontSize]||r.medium,localStorage.setItem("fontSize",e.accessibility.fontSize)}if(e.accessibility?.reducedMotion!==void 0){const s=document.documentElement;e.accessibility.reducedMotion?(s.classList.add("reduce-motion"),s.style.setProperty("--motion-duration","0s")):(s.classList.remove("reduce-motion"),s.style.removeProperty("--motion-duration")),localStorage.setItem("reducedMotion",String(e.accessibility.reducedMotion))}if(e.accessibility?.highContrast!==void 0){const s=document.documentElement;e.accessibility.highContrast?s.classList.add("high-contrast"):s.classList.remove("high-contrast"),localStorage.setItem("highContrast",String(e.accessibility.highContrast))}e.language&&(document.documentElement.lang=e.language,localStorage.setItem("language",e.language)),e.timezone&&e.timezone!=="auto"&&localStorage.setItem("timezone",e.timezone),e.currency&&localStorage.setItem("currency",e.currency),e.dateFormat&&localStorage.setItem("dateFormat",e.dateFormat),e.timeFormat&&localStorage.setItem("timeFormat",e.timeFormat),e.numberFormat&&localStorage.setItem("numberFormat",e.numberFormat),localStorage.setItem("userSettings",JSON.stringify(e))}},[e])}function ge(){if(typeof window>"u")return null;const e=localStorage.getItem("userSettings");if(e)try{return JSON.parse(e)}catch(t){console.error("Failed to parse stored settings:",t)}return null}function ye(e,t){throw console.error(`Database error in ${t}:`,e),new Error(`Query ${t} failed: ${e instanceof Error?e.message:String(e)}`)}async function n(e,t=[],s="Unnamed Query"){if(!W)throw new Error("Neon client is not configured");try{return await W(e,t)}catch(r){ye(r,s)}}async function Se(e){return(await n("SELECT * FROM clerk_users WHERE id = $1",[e],"getUser"))[0]||null}async function Fe(e){let t=await n("SELECT * FROM profiles WHERE user_id = $1",[e],"getProfile");if(!t||t.length===0){console.log(`[getProfile] No profile found for user ${e}, attempting to create default profile`);try{const r=(await n("SELECT first_name, last_name, username FROM clerk_users WHERE id = $1",[e],"getProfile-fetchUser"))?.[0];if(!r)return console.warn(`[getProfile] User ${e} not found in clerk_users table, cannot create profile`),null;const a=r?.first_name&&r?.last_name?`${r.first_name} ${r.last_name}`:r?.username||r?.first_name||"New User",o=await n("INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) RETURNING *",[e,a],"getProfile-create");return console.log(`[getProfile] Successfully created profile for user ${e}`),o[0]||null}catch(s){return console.error("[getProfile] Failed to create default profile:",s),s?.message?.includes("foreign key constraint")&&console.warn(`[getProfile] Cannot create profile: user ${e} does not exist in clerk_users table`),null}}return t[0]||null}async function We(e){return!e||e.length===0?[]:await n("SELECT * FROM profiles WHERE user_id = ANY($1)",[e],"getProfilesByIds")}async function He(e={}){const{searchQuery:t,accountTypes:s,minRate:r,maxRate:a,experience:o,verifiedOnly:l,availableNow:d,hasPortfolio:S,vocalRange:h,vocalStyle:_,djStyle:f,productionStyle:u,engineeringSpecialty:R,genres:b,location:x,sortBy:A="relevance",limit:k=100,excludeUserId:C}=e;let g=`
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
  `;const T=[];let E=1;if(C&&(g+=` AND cu.id != $${E++}`,T.push(C)),s&&s.length>0&&!s.includes("All")&&(g+=` AND cu.account_types && $${E++}`,T.push(s)),l&&(g+=" AND p.verified = true"),S&&(g+=" AND (p.reputation_score > 0 OR p.talent_info->>'portfolio' IS NOT NULL)"),o){const p={beginner:[0,2],intermediate:[2,5],advanced:[5,10],expert:[10,100]},[c,m]=p[o];g+=` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) >= $${E++}`,g+=` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) < $${E++}`,T.push(c,m)}if(r!==void 0||a!==void 0){const p=r!==void 0?r:0;g+=` AND CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) >= $${E++}`,T.push(p)}if(a!==void 0&&(g+=` AND CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) <= $${E++}`,T.push(a)),h&&(g+=` AND p.talent_info->>'vocalRange' = $${E++}`,T.push(h)),b&&b.length>0&&(g+=" AND p.talent_info->>'genres' IS NOT NULL"),t){g+=` AND (
      cu.first_name ILIKE $${E++} OR
      cu.last_name ILIKE $${E++} OR
      cu.username ILIKE $${E++} OR
      cu.bio ILIKE $${E++} OR
      p.display_name ILIKE $${E++}
    )`;const p=`%${t}%`;T.push(p,p,p,p,p)}switch(A){case"rating":g+=" ORDER BY p.reputation_score DESC NULLS LAST";break;case"rate_low":g+=" ORDER BY CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) ASC";break;case"rate_high":g+=" ORDER BY CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) DESC";break;case"recent":g+=" ORDER BY cu.updated_at DESC";break;default:g+=" ORDER BY p.reputation_score DESC NULLS LAST, cu.updated_at DESC"}g+=` LIMIT $${E++}`,T.push(k);let y=await n(g,T,"searchProfiles");if(_&&(y=y.filter(p=>p.talent_info?.vocalStyles?.includes(_)||p.talent_info?.genres?.includes(_))),f&&(y=y.filter(p=>p.talent_info?.djStyles?.includes(f)||p.talent_info?.genres?.includes(f))),u&&(y=y.filter(p=>p.talent_info?.productionStyles?.includes(u)||p.talent_info?.genres?.includes(u))),R&&(y=y.filter(p=>p.talent_info?.skills?.includes(R)||p.engineer_info?.specialties?.includes(R))),b&&b.length>0&&(y=y.filter(p=>b.some(c=>p.talent_info?.genres?.includes(c)))),d){const p=new Date(Date.now()-36e5);y=y.filter(c=>new Date(c.updated_at)>p)}return x&&x.lat&&x.lng&&(y=y.filter(p=>{const c=p.talent_info?.location||p.profile_location;if(!c||!c.lat||!c.lng)return!1;const m=3959,v=(c.lat-x.lat)*Math.PI/180,L=(c.lng-x.lng)*Math.PI/180,M=Math.sin(v/2)*Math.sin(v/2)+Math.cos(x.lat*Math.PI/180)*Math.cos(c.lat*Math.PI/180)*Math.sin(L/2)*Math.sin(L/2),N=2*Math.atan2(Math.sqrt(M),Math.sqrt(1-M));return m*N<=x.radius})),y}async function be(e){return(await n(`SELECT
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
    WHERE cu.id = $1`,[e],"getUserWithProfile"))[0]||null}async function B(e){const{id:t,email:s,phone:r=null,first_name:a=null,last_name:o=null,username:l=null,profile_photo_url:d=null,account_types:S=["Fan"],active_role:h="Fan",bio:_=null,zip_code:f=null}=e,u=Array.isArray(S)?`{${S.join(",")}}`:S||"{Fan}";return(await n(`INSERT INTO clerk_users (
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
    RETURNING *`,[t,s,r,a,o,l,d,u,h,_,f],"createClerkUser"))[0]}async function qe(e,t=null){const s=await Se(e);return s||await B({id:e,...t})}async function Be(e,t){const s=[],r=[];let a=1;const{active_role:o,account_types:l,preferred_role:d,zip_code:S,zip:h,first_name:_,last_name:f,email:u,use_legal_name_only:R,use_user_name_only:b,effective_display_name:x,...A}=t,k=S!==void 0?S:h;if(o!==void 0&&await n("UPDATE clerk_users SET active_role = $1 WHERE id = $2",[o,e],"updateProfile-active_role"),l!==void 0){const T=Array.isArray(l)?`{${l.join(",")}}`:l;await n("UPDATE clerk_users SET account_types = $1 WHERE id = $2",[T,e],"updateProfile-account_types")}d!==void 0&&await n("UPDATE clerk_users SET preferred_role = $1 WHERE id = $2",[d,e],"updateProfile-preferred_role"),k!==void 0&&await n("UPDATE clerk_users SET zip_code = $1 WHERE id = $2",[k,e],"updateProfile-zip_code"),_!==void 0&&await n("UPDATE clerk_users SET first_name = $1 WHERE id = $2",[_,e],"updateProfile-first_name"),f!==void 0&&await n("UPDATE clerk_users SET last_name = $1 WHERE id = $2",[f,e],"updateProfile-last_name"),u!==void 0&&await n("UPDATE clerk_users SET email = $1 WHERE id = $2",[u,e],"updateProfile-email"),R!==void 0&&await n("UPDATE clerk_users SET use_legal_name_only = $1 WHERE id = $2",[R,e],"updateProfile-use_legal_name_only"),b!==void 0&&await n("UPDATE clerk_users SET use_user_name_only = $1 WHERE id = $2",[b,e],"updateProfile-use_user_name_only"),x!==void 0&&await n("UPDATE clerk_users SET effective_display_name = $1 WHERE id = $2",[x,e],"updateProfile-effective_display_name");const C=["username","profile_photo_url","hourlyRate"];for(const[T,E]of Object.entries(A))if(!C.includes(T))if(T==="search_terms"&&Array.isArray(E)){const I=E.map((y,p)=>`$${a+p}`);s.push(`${T} = ARRAY[${I.join(",")}]`),E.forEach(y=>{r.push(y||"")}),a+=E.length}else s.push(`${T} = $${a}`),r.push(E),a++;return s.length===0?(await n("SELECT * FROM profiles WHERE user_id = $1",[e],"updateProfile-fetch"))[0]||{}:(r.push(e),(await n(`UPDATE profiles SET ${s.join(", ")}, updated_at = NOW() WHERE user_id = $${a} RETURNING *`,r,"updateProfile"))[0])}async function ze(e,t={}){const{limit:s=50,offset:r=0}=t;return await n(`SELECT * FROM bookings
     WHERE (sender_id::text = $1 OR target_id::text = $1 OR studio_owner_id = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,[e,s,r],"getBookings")}async function Ge(e){const{sender_id:t,target_id:s,studio_owner_id:r,status:a="Pending",service_type:o,date:l,time:d,duration:S,offer_amount:h,message:_}=e;return(await n(`INSERT INTO bookings (
      sender_id, target_id, studio_owner_id, status, service_type,
      date, time, duration, offer_amount, message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,[t,s,r,a,o,l,d,S,h,_],"createBooking"))[0]}async function Ye(e){try{return await n(`SELECT * FROM blocked_dates
       WHERE studio_id = $1
       ORDER BY date ASC`,[e],"getBlockedDates")}catch(t){if(t.message.includes("does not exist"))return[];throw t}}async function Je(e,t={}){const{limit:s=50,offset:r=0}=t;return await n(`SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,[e,s,r],"getNotifications")}async function Ve(e){const{user_id:t,type:s,title:r,message:a=null,read:o=!1,reference_type:l=null,reference_id:d=null,metadata:S={}}=e;return(await n(`INSERT INTO notifications (
      user_id, type, title, message, read, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,[t,s,r,a,o,l,d,JSON.stringify(S)],"createNotification"))[0]}async function Xe(e){return(await n("UPDATE notifications SET read = true WHERE id = $1 RETURNING *",[e],"markNotificationAsRead"))[0]}async function Ke(e){await n("UPDATE notifications SET read = true WHERE user_id = $1",[e],"markAllNotificationsAsRead")}async function Qe(e){return(await n("DELETE FROM notifications WHERE id = $1 RETURNING *",[e],"deleteNotification"))[0]}async function Ze(e){await n("DELETE FROM notifications WHERE user_id = $1",[e],"clearAllNotifications")}async function et(e){return(await n("SELECT following_id FROM follows WHERE follower_id = $1",[e],"getFollowing")).map(s=>s.following_id)}async function tt(e,t,s){const a={Talent:"talent_info",Engineer:"engineer_info",Producer:"producer_info",Studio:"studio_info",EDUStaff:"education_info",EDUAdmin:"education_info",Student:"education_info",Intern:"education_info",Label:"label_info",Agent:"label_info",Technician:"technician_info"}[t];if(!a)throw new Error(`Invalid role for sub-profile: ${t}`);const o=await n(`UPDATE profiles
     SET ${a} = $2::jsonb,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING ${a}`,[e,JSON.stringify(s)],"upsertSubProfile");return o.length===0?(await n(`INSERT INTO profiles (user_id, ${a})
       VALUES ($1, $2::jsonb)
       RETURNING ${a}`,[e,JSON.stringify(s)],"upsertSubProfile-insert"))[0][a]:o[0][a]}async function st(e){const t=await n(`SELECT
       sp.account_type,
       sp.profile_data,
       sp.is_active
     FROM sub_profiles sp
     WHERE sp.user_id = $1 AND sp.is_active = true`,[e],"getSubProfiles");return t.length===0?[]:t.map(s=>({...s.profile_data,account_type:s.account_type}))}async function rt(e){const{reporterId:t,targetType:s,targetId:r,reason:a,description:o}=e,d=(await n(`INSERT INTO content_reports (
      reporter_id, target_type, target_id, reason, description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,[t,s,r,a,o||null],"reportContent"))[0];return await n(`INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
    SELECT cu.id, 'system', 'New content report', $1
    FROM clerk_users cu
    WHERE cu.account_types @> ARRAY['GAdmin'::TEXT]
       OR cu.account_types @> ARRAY['EDUAdmin'::TEXT]
    LIMIT 10`,[`New ${a} report submitted for ${s}`],"notifyModerators"),d}async function at(e){return(await n(`SELECT
      COUNT(DISTINCT CASE WHEN status = 'Open' THEN id END) as open_requests,
      COUNT(DISTINCT CASE WHEN status IN ('Assigned', 'In Progress') THEN id END) as active_jobs,
      COUNT(DISTINCT CASE WHEN status = 'Completed' THEN id END) as completed_jobs,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN actual_cost ELSE 0 END), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN status IN ('Assigned', 'In Progress') THEN estimated_cost ELSE 0 END), 0) as pending_earnings,
      COALESCE((SELECT AVG(r.rating)::numeric(3,2) FROM reviews r WHERE r.target_id::text = $1), 0) as average_rating
     FROM service_requests sr
     WHERE sr.tech_id::text = $1`,[e],"getTechMetrics"))[0]||{}}async function it(e){return await n(`SELECT
      COUNT(DISTINCT lr.artist_id) as total_artists,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as active_releases,
      COALESCE(SUM(ds.lifetime_earnings), 0) as total_revenue,
      COALESCE(SUM(ds.lifetime_streams), 0) as total_streams
     FROM label_roster lr
     LEFT JOIN releases r ON r.artist_id = lr.artist_id
     LEFT JOIN distribution_stats ds ON ds.release_id = r.id
     WHERE lr.label_id::text = $1`,[e],"getLabelMetrics")}async function nt(e){return await n(`SELECT
      COUNT(DISTINCT sr.id) as total_rooms,
      COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings
     FROM studio_rooms sr
     LEFT JOIN bookings b ON b.studio_owner_id = $1 AND (b.venue_id = sr.id OR b.venue_id IS NULL)
     WHERE sr.studio_id = $1`,[e],"getStudioMetrics")}async function ot(e){return await n(`SELECT
      COUNT(DISTINCT r.id) as total_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as live_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'draft' THEN r.id END) as draft_releases
     FROM releases r
     WHERE r.artist_id::text = $1 OR r.label_id::text = $1`,[e],"getDistributionMetrics")}async function lt(e,t={}){const{status:s,limit:r=50,offset:a=0}=t;let o=`SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    WHERE sr.tech_id::text = $1`;const l=[e];let d=2;return s&&(o+=` AND sr.status = $${d}`,l.push(s),d++),o+=` ORDER BY sr.created_at DESC LIMIT $${d} OFFSET $${d+1}`,l.push(r,a),await n(o,l,"getTechServiceRequests")}async function ct(e={}){const{category:t,limit:s=50,offset:r=0}=e;let a=`SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo,
    pp.location->>'city' as city,
    pp.location->>'state' as state
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    LEFT JOIN tech_public_profiles pp ON pp.user_id = sr.requester_id::text
    WHERE sr.status = 'Open'`;const o=[];let l=1;return t&&(a+=` AND sr.service_category = $${l}`,o.push(t),l++),a+=` ORDER BY sr.created_at DESC LIMIT $${l} OFFSET $${l+1}`,o.push(s,r),await n(a,o,"getOpenServiceRequests")}async function ut(e){const{requester_id:t,title:s,description:r,service_category:a,equipment_name:o,equipment_brand:l,equipment_model:d,issue_description:S,logistics:h="Drop-off",preferred_date:_,budget_cap:f,priority:u="Normal"}=e;if(!t||!s||!a||!o)throw new Error("Missing required fields for service request");return(await n(`INSERT INTO service_requests (
      requester_id, title, description, service_category, equipment_name,
      equipment_brand, equipment_model, issue_description, logistics,
      preferred_date, budget_cap, priority, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Open')
    RETURNING *`,[t,s,r,a,o,l,d,S,h,_,f,u],"createServiceRequest"))[0]}async function dt(e,t,s){const r=await n(`UPDATE service_requests
     SET status = $1, tech_id = COALESCE($2, tech_id), updated_at = NOW()
     WHERE id = $3 RETURNING *`,[t,s||null,e],"updateServiceRequestStatus");if(r.length===0)throw new Error(`Service request ${e} not found`);return r[0]}async function pt(e={}){const{specialty:t,location:s,availability:r,minRating:a,maxRate:o,maxResponseTime:l,limit:d=50,offset:S=0}=e;let _=`WITH tech_response_times AS (
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
    WHERE 'Technician' = ANY(cu.account_types)`;const f=[];let u=1;if(t&&(_+=` AND $${u} = ANY(pp.specialties)`,f.push(t),u++),r&&r!=="any"&&(_+=` AND pp.availability_status = $${u}`,f.push(r),u++),a&&(_+=` AND COALESCE(pp.rating_average, 0) >= $${u}`,f.push(a),u++),o&&(_+=` AND (pp.hourly_rate IS NULL OR pp.hourly_rate <= $${u})`,f.push(o),u++),l&&(_+=` AND (trt.avg_hours IS NULL OR trt.avg_hours <= $${u})`,f.push(l),u++),s&&s.lat&&s.lng&&s.radius){const b=s.radius/69,x=s.radius/(69*Math.cos(s.lat*Math.PI/180));_+=` AND
      (pp.location->>'lat')::float BETWEEN $${u} AND $${u+1}
      AND (pp.location->>'lng')::float BETWEEN $${u+2} AND $${u+3}`,f.push(s.lat-b,s.lat+b,s.lng-x,s.lng+x),u+=4}return _+=` ORDER BY pp.completed_jobs DESC, pp.rating_average DESC
           LIMIT $${u} OFFSET $${u+1}`,f.push(d,S),(await n(_,f,"searchTechnicians")).map(b=>({...b,avg_response_hours:b.avg_hours||null,distance:s&&b.location?.lat&&b.location?.lng?Ne(s.lat,s.lng,b.location.lat,b.location.lng):void 0}))}function Ne(e,t,s,r){const o=(s-e)*Math.PI/180,l=(r-t)*Math.PI/180,d=Math.sin(o/2)*Math.sin(o/2)+Math.cos(e*Math.PI/180)*Math.cos(s*Math.PI/180)*Math.sin(l/2)*Math.sin(l/2);return 3959*(2*Math.atan2(Math.sqrt(d),Math.sqrt(1-d)))}async function ft(e){return(await n(`SELECT
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
     WHERE pp.user_id = $1`,[e],"getTechnicianProfile"))[0]||null}async function mt(e,t){const s=[],r=[];let a=1;for(const[l,d]of Object.entries(t))l==="specialties"&&Array.isArray(d)?(s.push(`${l} = $${a}`),r.push(d)):l==="location"&&typeof d=="object"?(s.push(`${l} = $${a}`),r.push(JSON.stringify(d))):l==="certifications"&&Array.isArray(d)?(s.push(`${l} = $${a}`),r.push(d)):l!=="user_id"&&l!=="first_name"&&l!=="last_name"&&l!=="email"&&(s.push(`${l} = $${a}`),r.push(d)),a++;if(s.length===0)throw new Error("No valid fields to update");r.push(e);const o=await n(`UPDATE tech_public_profiles SET ${s.join(", ")}, updated_at = NOW()
     WHERE user_id = $${a} RETURNING *`,r,"updateTechnicianProfile");if(o.length===0)throw new Error(`Technician profile for user ${e} not found`);return o[0]}async function _t(e,t={}){const{limit:s=50,offset:r=0}=t;return await n(`SELECT sr.*,
      cu.first_name || ' ' || cu.last_name as requester_name,
      cu.profile_photo_url as requester_photo
     FROM service_requests sr
     JOIN clerk_users cu ON cu.id = sr.requester_id::text
     WHERE sr.tech_id::text = $1 AND sr.status = 'Completed'
     ORDER BY sr.completed_at DESC
     LIMIT $2 OFFSET $3`,[e,s,r],"getTechEarnings")}async function Et(e){const t=await n(`SELECT COALESCE(balance, 0) as balance
     FROM wallets
     WHERE user_id = $1`,[e],"getWalletBalance");return parseFloat(t[0]?.balance||"0")}async function ht(e=20){return await n(`SELECT id, brand, model, category, sub_category, specs, submitted_by, submitter_name, votes, timestamp
     FROM equipment_submissions
     WHERE status = 'pending'
     ORDER BY timestamp DESC
     LIMIT $1`,[e],"getPendingSubmissions")}async function gt(e,t){await n(`UPDATE equipment_submissions
     SET votes = $2::jsonb
     WHERE id = $1`,[e,JSON.stringify(t)],"updateSubmissionVotes")}async function yt(e,t){const s=await n(`SELECT brand, model, category, sub_category, specs, submitted_by
     FROM equipment_submissions
     WHERE id = $1`,[e],"approveEquipmentSubmission-get");if(s.length===0)throw new Error("Submission not found");const r=s[0];await n(`INSERT INTO equipment_database (name, brand, model, category, subcategory, specifications, added_by, verified_by)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, ARRAY[$7])`,[`${r.brand} ${r.model}`,r.brand,r.model,r.category,r.sub_category,r.specs,r.submitted_by],"approveEquipmentSubmission-insert"),await n(`UPDATE equipment_submissions
     SET status = 'approved'
     WHERE id = $1`,[e],"approveEquipmentSubmission-update")}async function St(e){await n(`UPDATE equipment_submissions
     SET status = 'rejected'
     WHERE id = $1`,[e],"rejectEquipmentSubmission")}async function bt(e){return(await n(`INSERT INTO equipment_submissions (brand, model, category, sub_category, specs, submitted_by, submitter_name, status, votes, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', '{"yes": [], "fake": [], "duplicate": []}'::jsonb, NOW())
     RETURNING *`,[e.brand,e.model,e.category,e.subCategory||null,e.specs||"{}",e.submittedBy,e.submitterName||null],"createEquipmentSubmission"))[0]}async function Nt(e,t){await n(`INSERT INTO wallets (user_id, balance, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET balance = wallets.balance + $2,
         updated_at = NOW()`,[e,t],"upsertWallet")}async function $t(e){return await n(`SELECT id, name, email, stage_name, primary_role, genre, contract_type,
            status, signed_date, notes, created_at, updated_at
     FROM external_artists
     WHERE label_id = $1
     ORDER BY created_at DESC`,[e],"getExternalArtists")}async function Tt(e,t){return(await n(`INSERT INTO external_artists (
       label_id, name, email, stage_name, primary_role,
       genre, contract_type, signed_date, notes, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'invited')
     RETURNING *`,[e,t.name,t.email||null,t.stage_name||null,t.primary_role||null,t.genre||[],t.contract_type||null,t.signed_date||null,t.notes||null],"createExternalArtist"))[0]}async function Rt(e){return(await n("SELECT get_pending_bookings_count($1) as count",[e],"getBookingCount"))[0]?.count||0}async function xt(e){await n("SELECT record_user_metrics($1)",[e],"recordUserMetrics")}async function wt(e,t,s=30){const a=(await n("SELECT get_trend_percentage($1, $2, $3) as get_trend_percentage",[e,t,s],"getTrendPercentage"))[0]?.get_trend_percentage||0;return`${a>=0?"+":""}${a}%`}async function vt(e){const t=await n("SELECT COUNT(*) as count FROM metrics_history WHERE user_id = $1",[e],"hasHistoricalData");return parseInt(t[0]?.count||"0",10)>=2}const $e=new G({defaultOptions:{queries:{staleTime:1e3*60*5,gcTime:1e3*60*30,retry:1,retryDelay:e=>Math.min(1e3*2**e,3e4),refetchOnWindowFocus:!1,refetchOnReconnect:!0,refetchOnMount:!0},mutations:{retry:1,retryDelay:1e3}}}),U=$.lazy(()=>P(()=>import("./AuthWizard-CkZ8EGqv.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))),Te=$.lazy(()=>P(()=>import("./AppRoutes-C66erBOG.js"),__vite__mapDeps([10,1,2,3,4,5,6]))),Re=$.lazy(()=>P(()=>import("./MainLayout-BXHY1wnO.js"),__vite__mapDeps([11,1,2,3,4,5,6])));function xe(){const{isLoaded:e,isSignedIn:t,userId:s}=Y(),{user:r}=J(),a=V(),[o,l]=$.useState(null),[d,S]=$.useState(!0),h=X(),_=K(),[f,u]=$.useState(()=>typeof window<"u"?localStorage.getItem("theme")==="dark"||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches:!1);$.useEffect(()=>{const c=ge();if(c){const m=document.documentElement;c.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(m.classList.add("dark"),u(!0)):(m.classList.remove("dark"),u(!1)):c.theme==="dark"?(m.classList.add("dark"),u(!0)):(m.classList.remove("dark"),u(!1))}},[]),$.useEffect(()=>{if(o?.settings){const c=o.settings,m=document.documentElement;if(c.theme&&(c.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(m.classList.add("dark"),u(!0)):(m.classList.remove("dark"),u(!1)):c.theme==="dark"?(m.classList.add("dark"),u(!0)):(m.classList.remove("dark"),u(!1))),c.accessibility?.fontSize){const v={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};m.style.fontSize=v[c.accessibility.fontSize]||v.medium}c.accessibility?.reducedMotion?(m.classList.add("reduce-motion"),m.style.setProperty("--motion-duration","0s")):(m.classList.remove("reduce-motion"),m.style.removeProperty("--motion-duration")),c.accessibility?.highContrast?m.classList.add("high-contrast"):m.classList.remove("high-contrast"),c.language&&(document.documentElement.lang=c.language)}},[o?.settings]),$.useEffect(()=>{f?(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark")):(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"))},[f]);const R=()=>u(!f);$.useEffect(()=>{if(!e)return;let c=!0;return(async()=>{const v=a.__internal?.()?.getState()??{},L=s||v.userId,M=t||v.session||v.user;if(!L||!M){c&&(l(null),S(!1));return}try{const N=await be(L);if(N){const w={id:L,firstName:r?.firstName||N.first_name||"User",lastName:r?.lastName||N.last_name||"",email:r?.primaryEmailAddress?.emailAddress||N.email||"",accountTypes:N.account_types||["Fan"],activeProfileRole:N.active_role||N.account_types?.[0]||"Fan",preferredRole:N.preferred_role||N.account_types?.[0]||"Fan",photoURL:r?.imageUrl||N.photo_url||N.avatar_url||null,settings:N.settings||{},effectiveDisplayName:N.effective_display_name||r?.firstName||N.first_name||"User",zipCode:N.zip_code,...N};c&&l(w)}else{const w=r?.publicMetadata||{},z={id:L,firstName:r?.firstName||w.first_name||"User",lastName:r?.lastName||w.last_name||"",email:r?.primaryEmailAddress?.emailAddress||"",accountTypes:w.account_types||["Fan"],activeProfileRole:w.active_role||"Fan",photoURL:r?.imageUrl||null,settings:{},effectiveDisplayName:r?.firstName||w.first_name||"User"};c&&l(z);try{console.log("📝 Creating user in Neon database...");const D=r?.publicMetadata||{};await B({id:L,email:r?.primaryEmailAddress?.emailAddress||"",phone:r?.primaryPhoneNumber?.phoneNumber||null,first_name:r?.firstName||D.first_name||null,last_name:r?.lastName||D.last_name||null,username:r?.username||D.username||null,profile_photo_url:r?.imageUrl||null,account_types:D.account_types||["Fan"],active_role:D.active_role||"Fan",bio:D.bio||null,zip_code:D.zip_code||null}),console.log("✅ User created in Neon database")}catch(D){console.error("❌ Failed to create user in Neon:",D)}}c&&S(!1)}catch(N){if(console.error("Error loading user data:",N),c){const w=r?.publicMetadata||{};l({id:s,firstName:r?.firstName||w.first_name||"User",lastName:r?.lastName||w.last_name||"",email:r?.primaryEmailAddress?.emailAddress||"",accountTypes:w.account_types||["Fan"],activeProfileRole:w.active_role||"Fan",photoURL:r?.imageUrl||null,settings:{}}),S(!1)}}})(),()=>{c=!1}},[s,t,e,r]);const b=$.useCallback(c=>{l(c)},[]),x=$.useCallback(async()=>{try{console.log("=== APP LOGOUT ===");const m=(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="5173")&&!1;a&&(await a.signOut(),console.log("✅ Clerk signOut successful")),l(null),console.log("✅ Local state cleared"),h("/login",{replace:!0}),console.log("✅ Navigated to login")}catch(c){console.error("Logout error:",c),l(null),h("/login",{replace:!0})}},[h,a,o]);if(!e||d)return i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})});const A=new URLSearchParams(window.location.search).get("intent")==="signup",C=(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="5173")&&!1,g=a.__internal?.()?.getState()??{},T=g.session||g.user,E=t&&s||T,I=o&&o.id,y=_.pathname==="/login",p=_.pathname==="/test-login";return!E&&!C&&!y&&!p?i.jsx($.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:f,toggleTheme:R,onSuccess:()=>h("/"),isNewUser:!1})}):E&&!I&&!y&&!p?i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})}):p?E&&I||C?(h("/debug-report",{replace:!0}),null):i.jsx($.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:f,toggleTheme:R,onSuccess:()=>h("/debug-report"),isNewUser:!1})}):y?E&&I||C?(h("/",{replace:!0}),null):i.jsx($.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:f,toggleTheme:R,onSuccess:()=>h("/"),isNewUser:!1})}):E&&!I&&A&&!C?i.jsx($.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{user:r,isNewUser:!0,darkMode:f,toggleTheme:R,onSuccess:()=>h("/debug-report")})}):!E&&!C?i.jsx($.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:f,toggleTheme:R,onSuccess:()=>h("/"),isNewUser:!1})}):i.jsx(Q,{client:$e,children:i.jsx(Ee,{userData:o,children:i.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:[i.jsx(Z,{position:"bottom-right",toastOptions:{style:{background:"#333",color:"#fff"}}}),i.jsx(ee,{}),_.pathname==="/settings"||_.pathname==="/debug-report"?i.jsx("main",{className:"p-6",children:i.jsx($.Suspense,{fallback:i.jsx("div",{className:"flex items-center justify-center min-h-screen",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:32})}),children:i.jsx(Te,{user:{id:s,...r},userData:o,loading:d,darkMode:f,toggleTheme:R,handleLogout:x,onUserDataUpdate:b})})}):i.jsx($.Suspense,{fallback:i.jsx("div",{className:"flex items-center justify-center min-h-screen",children:i.jsx(O,{className:"animate-spin text-brand-blue",size:32})}),children:i.jsx(Re,{user:{id:s,...r},userData:o,loading:d,darkMode:f,toggleTheme:R,handleLogout:x,onRoleSwitch:c=>{l(m=>m?{...m,activeProfileRole:c,preferredRole:c}:null)}})})]})})})}const F=q("pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk");F||console.error("❌ Clerk: Missing publishable key in production");const we={publishableKey:F,router:"virtual",appearance:{elements:{primaryButton:{backgroundColor:"hsl(222, 78%, 58%)",color:"white","&:hover":{backgroundColor:"hsl(223, 82%, 57%)"}},input:{borderColor:"#e2e8f0","&:focus":{borderColor:"#3D84ED"}}},variables:{colorPrimary:"#3D84ED",colorBackground:"white",colorInputBackground:"white",colorDanger:"#ef4444",colorSuccess:"#22c55e"}},debug:!1};q(void 0);let j=null,H=!1;const ve=async()=>{if(j!==null)return j;if(H)return null;const e=`https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712
`;H=!0;try{const t=await P(()=>import("./vendor-B4TWoEsZ.js").then(a=>a.db),__vite__mapDeps([2,3]));j=t;const{init:s}=t;return t.getCurrentHub?.()?.getClient?.()||s({dsn:e,environment:"production",tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),j}catch{return j=!1,null}},Ce=(e,t={},s={})=>{const r={message:e?.message||"Unknown error",stack:e?.stack,name:e?.name,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,url:window.location.href,...t,context:s};ve().then(a=>{a&&a.captureException&&a.captureException(e,{extra:r,tags:{component:s.component||"Unknown",errorBoundary:s.errorBoundary||"None"},contexts:{custom:s}})}).catch(()=>{});try{const a=JSON.parse(localStorage.getItem("seshnx_errors")||"[]");a.unshift(r),a.splice(10),localStorage.setItem("seshnx_errors",JSON.stringify(a))}catch{}return r};class De extends te.Component{constructor(t){super(t),this.state={hasError:!1,error:null,errorInfo:null,meme:"Unexpected signal chain failure.",errorId:null,copied:!1}}static getDerivedStateFromError(t){return{hasError:!0,error:t,errorId:`ERR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}}componentDidCatch(t,s){const r={componentStack:s.componentStack,errorBoundary:this.props.name||"Default",props:this.props.context||{}},a=Ce(t,s,r);this.setState({errorInfo:{...s,errorId:this.state.errorId||a.timestamp}})}componentDidMount(){const t=["CoreAudio Overload detected.","The plugin crashed the session.","Buffer underrun exception.","Who deleted the master fader?","Sample rate mismatch: Reality is 44.1k, we are 48k.","The drummer kicked the power cable.","Ilok license not found.","Fatal Error: Not enough headroom.","The mix bus is clipping... hard.","Phantom power failure."];this.setState({meme:t[Math.floor(Math.random()*t.length)]})}handleReset=()=>{if(this.setState({hasError:!1,error:null,errorInfo:null,errorId:null,copied:!1}),this.props.onReset)this.props.onReset();else{const t=window.location.pathname;t!=="/"&&t!=="/dashboard"?window.location.href="/?tab=dashboard":window.location.reload()}};handleCopyError=async()=>{const t=`
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message||"Unknown error"}
Stack: ${this.state.error?.stack||"No stack trace"}
Component Stack: ${this.state.errorInfo?.componentStack||"No component stack"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();try{await navigator.clipboard.writeText(t),this.setState({copied:!0}),setTimeout(()=>this.setState({copied:!1}),2e3)}catch(s){console.error("Failed to copy error:",s)}};render(){return this.state.hasError?i.jsx("div",{className:"min-h-screen bg-[#1f2128] flex flex-col items-center justify-center p-4 text-center text-white font-sans",children:i.jsxs("div",{className:"bg-[#2c2e36] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden",children:[i.jsx("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"}),i.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[i.jsx("div",{className:"w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500",children:i.jsx(se,{size:32,strokeWidth:2})}),i.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Session Crashed"}),i.jsxs("p",{className:"text-xl text-[#3D84ED] font-medium mb-6 italic",children:['"',this.state.meme,'"']}),i.jsxs("div",{className:"bg-[#1f2128] p-4 rounded-lg w-full mb-6 text-left border border-gray-700",children:[i.jsxs("div",{className:"flex justify-between items-center mb-2",children:[i.jsx("p",{className:"text-xs text-gray-500 uppercase font-bold tracking-wider",children:"Error Details"}),i.jsx("button",{onClick:this.handleCopyError,className:"text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors",title:"Copy error details",children:this.state.copied?i.jsxs(i.Fragment,{children:[i.jsx(re,{size:12}),"Copied!"]}):i.jsxs(i.Fragment,{children:[i.jsx(ae,{size:12}),"Copy"]})})]}),i.jsxs("div",{className:"space-y-2",children:[this.state.errorId&&i.jsxs("div",{children:[i.jsx("span",{className:"text-xs text-gray-500",children:"Error ID: "}),i.jsx("code",{className:"text-xs text-blue-400 font-mono",children:this.state.errorId})]}),i.jsx("code",{className:"text-sm text-red-400 font-mono break-words block",children:this.state.error?.message||"Unknown error occurred"}),this.state.error?.stack&&i.jsxs("details",{className:"mt-2",children:[i.jsx("summary",{className:"text-xs text-gray-500 cursor-pointer hover:text-gray-400",children:"Stack Trace"}),i.jsx("pre",{className:"text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32",children:this.state.error.stack})]})]})]}),i.jsxs("div",{className:"flex gap-4 w-full",children:[i.jsx("button",{onClick:()=>window.history.back(),className:"flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",children:"Go Back"}),i.jsxs("button",{onClick:this.handleReset,className:"flex-1 bg-[#3D84ED] hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",children:[i.jsx(ie,{size:18}),"Reload App"]})]})]})]})}):this.props.children}}const Oe=`https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712
`;ne({dsn:Oe,environment:"production",release:"local-dev",integrations:[oe({tracePropagationTargets:["localhost",/^https:\/\/(app\.seshnx\.com|webapp-main-.*\.vercel\.app)/]}),le({maskAllText:!1,blockAllMedia:!1}),ce(),ue({levels:["error"]})],tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1,beforeSend(e){return e.exception?.values?.[0]?.value?.includes("localStorage")||e.exception?.values?.[0]?.value?.includes("QuotaExceededError")?null:(e.contexts={...e.contexts,app:{name:"SeshNx Webapp",environment:"production"}},e)},initialScope:{tags:{framework:"react",runtime:"vite"}}});const Le=({children:e})=>i.jsx(_e,{fallback:({error:t,resetError:s})=>i.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:i.jsxs("div",{className:"text-center p-8",children:[i.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white mb-4",children:"Something went wrong"}),i.jsx("p",{className:"text-gray-600 dark:text-gray-400 mb-6",children:t?.message||"An unexpected error occurred"}),i.jsx("button",{onClick:s,className:"px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors",children:"Try again"})]})}),children:e});F||console.error("❌ Clerk: VITE_CLERK_PUBLISHABLE_KEY is not set. Get your key from https://dashboard.clerk.com/ and add it to your .env.local file.");de.createRoot(document.getElementById("root")).render(i.jsx(Le,{children:i.jsx(De,{name:"Root",children:i.jsx(pe,{...we,children:i.jsx(fe,{client:he,children:i.jsx(me,{children:i.jsx(xe,{})})})})})}));const Ie=()=>{const e=document.getElementById("loading-fallback");e&&(e.classList.add("fade-out"),setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="auto"},400))};setTimeout(Ie,600);export{Nt as A,St as B,bt as C,Ye as D,De as E,it as F,nt as G,ot as H,at as I,lt as J,_t as K,ft as L,mt as M,$t as N,Tt as O,vt as P,wt as Q,xt as R,He as S,Ge as T,tt as a,Et as b,Rt as c,Pe as d,be as e,Fe as f,st as g,et as h,We as i,qe as j,Ke as k,Qe as l,Xe as m,Ze as n,Je as o,Ve as p,ze as q,rt as r,ct as s,dt as t,Be as u,pt as v,ut as w,ht as x,gt as y,yt as z};
