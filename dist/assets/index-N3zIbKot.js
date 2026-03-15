const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AuthWizard-DpMOI8RS.js","assets/edu-Dgdq2qcb.js","assets/vendor-B4TWoEsZ.js","assets/vendor-D33SxI2g.css","assets/config-BtSfFN2A.js","assets/chat-Cerp6E0m.js","assets/vendor-framer-BXMxQmsa.js","assets/vendor-maps-MUiHD7aJ.js","assets/vendor-maps-Dgihpmma.css","assets/SeshNx-PNG cCropped white text-Bxw2rtHV.js","assets/AppRoutes-CsQ3Oe3b.js","assets/MainLayout-Ckzyh8a4.js"])))=>i.map(i=>d[i]);
import{aS as G,r as N,aT as Y,aU as J,aV as V,aW as X,aX as K,j as i,L as I,aY as Q,aZ as Z,a_ as ee,R as te,aN as se,J as re,ab as ae,a$ as ie,b0 as ne,b1 as oe,b2 as le,b3 as ce,b4 as ue,b5 as de,b6 as pe,b7 as fe,b8 as me,b9 as _e}from"./vendor-B4TWoEsZ.js";import{n as W,_ as P}from"./edu-Dgdq2qcb.js";import{L as Ee,c as q,b as ge}from"./chat-Cerp6E0m.js";import"./config-BtSfFN2A.js";import"./vendor-framer-BXMxQmsa.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};e.SENTRY_RELEASE={id:"local"};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="d3b39992-7324-4387-acd2-adfb52f35143",e._sentryDebugIdIdentifier="sentry-dbid-d3b39992-7324-4387-acd2-adfb52f35143")}catch{}})();(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function s(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(a){if(a.ep)return;a.ep=!0;const n=s(a);fetch(a.href,n)}})();function he(){if(typeof window>"u")return null;const e=localStorage.getItem("userSettings");if(e)try{return JSON.parse(e)}catch(t){console.error("Failed to parse stored settings:",t)}return null}function ye(e,t){throw console.error(`Database error in ${t}:`,e),new Error(`Query ${t} failed: ${e instanceof Error?e.message:String(e)}`)}async function o(e,t=[],s="Unnamed Query"){if(!W)throw new Error("Neon client is not configured");try{return await W(e,t)}catch(r){ye(r,s)}}async function be(e){return(await o("SELECT * FROM clerk_users WHERE id = $1",[e],"getUser"))[0]||null}async function Pe(e){let t=await o("SELECT * FROM profiles WHERE user_id = $1",[e],"getProfile");if(!t||t.length===0){console.log(`[getProfile] No profile found for user ${e}, attempting to create default profile`);try{const r=(await o("SELECT first_name, last_name, username FROM clerk_users WHERE id = $1",[e],"getProfile-fetchUser"))?.[0];if(!r)return console.warn(`[getProfile] User ${e} not found in clerk_users table, cannot create profile`),null;const a=r?.first_name&&r?.last_name?`${r.first_name} ${r.last_name}`:r?.username||r?.first_name||"New User",n=await o("INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) RETURNING *",[e,a],"getProfile-create");return console.log(`[getProfile] Successfully created profile for user ${e}`),n[0]||null}catch(s){return console.error("[getProfile] Failed to create default profile:",s),s?.message?.includes("foreign key constraint")&&console.warn(`[getProfile] Cannot create profile: user ${e} does not exist in clerk_users table`),null}}return t[0]||null}async function Fe(e){return!e||e.length===0?[]:await o("SELECT * FROM profiles WHERE user_id = ANY($1)",[e],"getProfilesByIds")}async function We(e={}){const{searchQuery:t,accountTypes:s,minRate:r,maxRate:a,experience:n,verifiedOnly:l,availableNow:p,hasPortfolio:y,vocalRange:g,vocalStyle:E,djStyle:m,productionStyle:u,engineeringSpecialty:R,genres:S,location:x,sortBy:k="relevance",limit:M=100,excludeUserId:O}=e;let h=`
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
  `;const D=[];let _=1;if(O&&(h+=` AND cu.id != $${_++}`,D.push(O)),s&&s.length>0&&!s.includes("All")&&(h+=` AND cu.account_types && $${_++}`,D.push(s)),l&&(h+=" AND p.verified = true"),y&&(h+=" AND (p.reputation_score > 0 OR p.talent_info->>'portfolio' IS NOT NULL)"),n){const f={beginner:[0,2],intermediate:[2,5],advanced:[5,10],expert:[10,100]},[c,d]=f[n];h+=` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) >= $${_++}`,h+=` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) < $${_++}`,D.push(c,d)}if(r!==void 0||a!==void 0){const f=r!==void 0?r:0;h+=` AND CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) >= $${_++}`,D.push(f)}if(a!==void 0&&(h+=` AND CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) <= $${_++}`,D.push(a)),g&&(h+=` AND p.talent_info->>'vocalRange' = $${_++}`,D.push(g)),S&&S.length>0&&(h+=" AND p.talent_info->>'genres' IS NOT NULL"),t){h+=` AND (
      cu.first_name ILIKE $${_++} OR
      cu.last_name ILIKE $${_++} OR
      cu.username ILIKE $${_++} OR
      cu.bio ILIKE $${_++} OR
      p.display_name ILIKE $${_++}
    )`;const f=`%${t}%`;D.push(f,f,f,f,f)}switch(k){case"rating":h+=" ORDER BY p.reputation_score DESC NULLS LAST";break;case"rate_low":h+=" ORDER BY CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) ASC";break;case"rate_high":h+=" ORDER BY CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) DESC";break;case"recent":h+=" ORDER BY cu.updated_at DESC";break;default:h+=" ORDER BY p.reputation_score DESC NULLS LAST, cu.updated_at DESC"}h+=` LIMIT $${_++}`,D.push(M);let b=await o(h,D,"searchProfiles");if(E&&(b=b.filter(f=>f.talent_info?.vocalStyles?.includes(E)||f.talent_info?.genres?.includes(E))),m&&(b=b.filter(f=>f.talent_info?.djStyles?.includes(m)||f.talent_info?.genres?.includes(m))),u&&(b=b.filter(f=>f.talent_info?.productionStyles?.includes(u)||f.talent_info?.genres?.includes(u))),R&&(b=b.filter(f=>f.talent_info?.skills?.includes(R)||f.engineer_info?.specialties?.includes(R))),S&&S.length>0&&(b=b.filter(f=>S.some(c=>f.talent_info?.genres?.includes(c)))),p){const f=new Date(Date.now()-36e5);b=b.filter(c=>new Date(c.updated_at)>f)}return x&&x.lat&&x.lng&&(b=b.filter(f=>{const c=f.talent_info?.location||f.profile_location;if(!c||!c.lat||!c.lng)return!1;const d=3959,$=(c.lat-x.lat)*Math.PI/180,w=(c.lng-x.lng)*Math.PI/180,v=Math.sin($/2)*Math.sin($/2)+Math.cos(x.lat*Math.PI/180)*Math.cos(c.lat*Math.PI/180)*Math.sin(w/2)*Math.sin(w/2),T=2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));return d*T<=x.radius})),b}async function Ne(e){return(await o(`SELECT
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
    WHERE cu.id = $1`,[e],"getUserWithProfile"))[0]||null}async function B(e){const{id:t,email:s,phone:r=null,first_name:a=null,last_name:n=null,username:l=null,profile_photo_url:p=null,account_types:y=["Fan"],active_role:g="Fan",bio:E=null,zip_code:m=null}=e,u=Array.isArray(y)?`{${y.join(",")}}`:y||"{Fan}";return(await o(`INSERT INTO clerk_users (
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
    RETURNING *`,[t,s,r,a,n,l,p,u,g,E,m],"createClerkUser"))[0]}async function He(e,t=null){const s=await be(e);return s||await B({id:e,...t})}async function qe(e,t){const s=[],r=[];let a=1;const{active_role:n,account_types:l,preferred_role:p,zip_code:y,zip:g,first_name:E,last_name:m,email:u,display_name:R,use_legal_name_only:S,use_user_name_only:x,effective_display_name:k,...M}=t,O=y!==void 0?y:g;if(n!==void 0&&await o("UPDATE clerk_users SET active_role = $1 WHERE id = $2",[n,e],"updateProfile-active_role"),l!==void 0){const _=Array.isArray(l)?`{${l.join(",")}}`:l;await o("UPDATE clerk_users SET account_types = $1 WHERE id = $2",[_,e],"updateProfile-account_types")}p!==void 0&&await o("UPDATE clerk_users SET preferred_role = $1 WHERE id = $2",[p,e],"updateProfile-preferred_role"),O!==void 0&&await o("UPDATE clerk_users SET zip_code = $1 WHERE id = $2",[O,e],"updateProfile-zip_code"),E!==void 0&&await o("UPDATE clerk_users SET first_name = $1 WHERE id = $2",[E,e],"updateProfile-first_name"),m!==void 0&&await o("UPDATE clerk_users SET last_name = $1 WHERE id = $2",[m,e],"updateProfile-last_name"),u!==void 0&&await o("UPDATE clerk_users SET email = $1 WHERE id = $2",[u,e],"updateProfile-email"),R!==void 0&&await o("UPDATE clerk_users SET display_name = $1 WHERE id = $2",[R,e],"updateProfile-display_name"),S!==void 0&&await o("UPDATE clerk_users SET use_legal_name_only = $1 WHERE id = $2",[S,e],"updateProfile-use_legal_name_only"),x!==void 0&&await o("UPDATE clerk_users SET use_user_name_only = $1 WHERE id = $2",[x,e],"updateProfile-use_user_name_only"),k!==void 0&&await o("UPDATE clerk_users SET effective_display_name = $1 WHERE id = $2",[k,e],"updateProfile-effective_display_name");const h=["username","profile_photo_url","hourlyRate"];for(const[_,A]of Object.entries(M))if(!h.includes(_))if(_==="search_terms"&&Array.isArray(A)){const b=A.map((f,c)=>`$${a+c}`);s.push(`${_} = ARRAY[${b.join(",")}]`),A.forEach(f=>{r.push(f||"")}),a+=A.length}else s.push(`${_} = $${a}`),r.push(A),a++;return s.length===0?(await o("SELECT * FROM profiles WHERE user_id = $1",[e],"updateProfile-fetch"))[0]||{}:(r.push(e),(await o(`UPDATE profiles SET ${s.join(", ")}, updated_at = NOW() WHERE user_id = $${a} RETURNING *`,r,"updateProfile"))[0])}async function Be(e,t={}){const{limit:s=50,offset:r=0}=t;return await o(`SELECT * FROM bookings
     WHERE (sender_id::text = $1 OR target_id::text = $1 OR studio_owner_id = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,[e,s,r],"getBookings")}async function ze(e){const{sender_id:t,target_id:s,studio_owner_id:r,status:a="Pending",service_type:n,date:l,time:p,duration:y,offer_amount:g,message:E}=e;return(await o(`INSERT INTO bookings (
      sender_id, target_id, studio_owner_id, status, service_type,
      date, time, duration, offer_amount, message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,[t,s,r,a,n,l,p,y,g,E],"createBooking"))[0]}async function Ge(e){try{return await o(`SELECT * FROM blocked_dates
       WHERE studio_id = $1
       ORDER BY date ASC`,[e],"getBlockedDates")}catch(t){if(t.message.includes("does not exist"))return[];throw t}}async function Ye(e,t={}){const{limit:s=50,offset:r=0}=t;return await o(`SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,[e,s,r],"getNotifications")}async function Je(e){const{user_id:t,type:s,title:r,message:a=null,read:n=!1,reference_type:l=null,reference_id:p=null,metadata:y={}}=e;return(await o(`INSERT INTO notifications (
      user_id, type, title, message, read, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,[t,s,r,a,n,l,p,JSON.stringify(y)],"createNotification"))[0]}async function Ve(e){return(await o("UPDATE notifications SET read = true WHERE id = $1 RETURNING *",[e],"markNotificationAsRead"))[0]}async function Xe(e){await o("UPDATE notifications SET read = true WHERE user_id = $1",[e],"markAllNotificationsAsRead")}async function Ke(e){return(await o("DELETE FROM notifications WHERE id = $1 RETURNING *",[e],"deleteNotification"))[0]}async function Qe(e){await o("DELETE FROM notifications WHERE user_id = $1",[e],"clearAllNotifications")}async function Ze(e){return(await o("SELECT following_id FROM follows WHERE follower_id = $1",[e],"getFollowing")).map(s=>s.following_id)}async function et(e,t,s){const a={Talent:"talent_info",Engineer:"engineer_info",Producer:"producer_info",Studio:"studio_info",EDUStaff:"education_info",EDUAdmin:"education_info",Student:"education_info",Intern:"education_info",Label:"label_info",Agent:"label_info",Technician:"technician_info"}[t];if(!a)throw new Error(`Invalid role for sub-profile: ${t}`);const n=await o(`UPDATE profiles
     SET ${a} = $2::jsonb,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING ${a}`,[e,JSON.stringify(s)],"upsertSubProfile");return n.length===0?(await o(`INSERT INTO profiles (user_id, ${a})
       VALUES ($1, $2::jsonb)
       RETURNING ${a}`,[e,JSON.stringify(s)],"upsertSubProfile-insert"))[0][a]:n[0][a]}async function tt(e){const t=await o(`SELECT
       sp.account_type,
       sp.profile_data,
       sp.is_active
     FROM sub_profiles sp
     WHERE sp.user_id = $1 AND sp.is_active = true`,[e],"getSubProfiles");return t.length===0?[]:t.map(s=>({...s.profile_data,account_type:s.account_type}))}async function st(e){const{reporterId:t,targetType:s,targetId:r,reason:a,description:n}=e,p=(await o(`INSERT INTO content_reports (
      reporter_id, target_type, target_id, reason, description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,[t,s,r,a,n||null],"reportContent"))[0];return await o(`INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
    SELECT cu.id, 'system', 'New content report', $1
    FROM clerk_users cu
    WHERE cu.account_types @> ARRAY['GAdmin'::TEXT]
       OR cu.account_types @> ARRAY['EDUAdmin'::TEXT]
    LIMIT 10`,[`New ${a} report submitted for ${s}`],"notifyModerators"),p}async function rt(e){return(await o(`SELECT
      COUNT(DISTINCT CASE WHEN status = 'Open' THEN id END) as open_requests,
      COUNT(DISTINCT CASE WHEN status IN ('Assigned', 'In Progress') THEN id END) as active_jobs,
      COUNT(DISTINCT CASE WHEN status = 'Completed' THEN id END) as completed_jobs,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN actual_cost ELSE 0 END), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN status IN ('Assigned', 'In Progress') THEN estimated_cost ELSE 0 END), 0) as pending_earnings,
      COALESCE((SELECT AVG(r.rating)::numeric(3,2) FROM reviews r WHERE r.target_id::text = $1), 0) as average_rating
     FROM service_requests sr
     WHERE sr.tech_id::text = $1`,[e],"getTechMetrics"))[0]||{}}async function at(e){return await o(`SELECT
      COUNT(DISTINCT lr.artist_id) as total_artists,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as active_releases,
      COALESCE(SUM(ds.lifetime_earnings), 0) as total_revenue,
      COALESCE(SUM(ds.lifetime_streams), 0) as total_streams
     FROM label_roster lr
     LEFT JOIN releases r ON r.artist_id = lr.artist_id
     LEFT JOIN distribution_stats ds ON ds.release_id = r.id
     WHERE lr.label_id::text = $1`,[e],"getLabelMetrics")}async function it(e){return await o(`SELECT
      COUNT(DISTINCT sr.id) as total_rooms,
      COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings
     FROM studio_rooms sr
     LEFT JOIN bookings b ON b.studio_owner_id = $1 AND (b.venue_id = sr.id OR b.venue_id IS NULL)
     WHERE sr.studio_id = $1`,[e],"getStudioMetrics")}async function nt(e){return await o(`SELECT
      COUNT(DISTINCT r.id) as total_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as live_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'draft' THEN r.id END) as draft_releases
     FROM releases r
     WHERE r.artist_id::text = $1 OR r.label_id::text = $1`,[e],"getDistributionMetrics")}async function ot(e,t={}){const{status:s,limit:r=50,offset:a=0}=t;let n=`SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    WHERE sr.tech_id::text = $1`;const l=[e];let p=2;return s&&(n+=` AND sr.status = $${p}`,l.push(s),p++),n+=` ORDER BY sr.created_at DESC LIMIT $${p} OFFSET $${p+1}`,l.push(r,a),await o(n,l,"getTechServiceRequests")}async function lt(e={}){const{category:t,limit:s=50,offset:r=0}=e;let a=`SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo,
    pp.location->>'city' as city,
    pp.location->>'state' as state
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    LEFT JOIN tech_public_profiles pp ON pp.user_id = sr.requester_id::text
    WHERE sr.status = 'Open'`;const n=[];let l=1;return t&&(a+=` AND sr.service_category = $${l}`,n.push(t),l++),a+=` ORDER BY sr.created_at DESC LIMIT $${l} OFFSET $${l+1}`,n.push(s,r),await o(a,n,"getOpenServiceRequests")}async function ct(e){const{requester_id:t,title:s,description:r,service_category:a,equipment_name:n,equipment_brand:l,equipment_model:p,issue_description:y,logistics:g="Drop-off",preferred_date:E,budget_cap:m,priority:u="Normal"}=e;if(!t||!s||!a||!n)throw new Error("Missing required fields for service request");return(await o(`INSERT INTO service_requests (
      requester_id, title, description, service_category, equipment_name,
      equipment_brand, equipment_model, issue_description, logistics,
      preferred_date, budget_cap, priority, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Open')
    RETURNING *`,[t,s,r,a,n,l,p,y,g,E,m,u],"createServiceRequest"))[0]}async function ut(e,t,s){const r=await o(`UPDATE service_requests
     SET status = $1, tech_id = COALESCE($2, tech_id), updated_at = NOW()
     WHERE id = $3 RETURNING *`,[t,s||null,e],"updateServiceRequestStatus");if(r.length===0)throw new Error(`Service request ${e} not found`);return r[0]}async function dt(e={}){const{specialty:t,location:s,availability:r,minRating:a,maxRate:n,maxResponseTime:l,limit:p=50,offset:y=0}=e;let E=`WITH tech_response_times AS (
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
    WHERE 'Technician' = ANY(cu.account_types)`;const m=[];let u=1;if(t&&(E+=` AND $${u} = ANY(pp.specialties)`,m.push(t),u++),r&&r!=="any"&&(E+=` AND pp.availability_status = $${u}`,m.push(r),u++),a&&(E+=` AND COALESCE(pp.rating_average, 0) >= $${u}`,m.push(a),u++),n&&(E+=` AND (pp.hourly_rate IS NULL OR pp.hourly_rate <= $${u})`,m.push(n),u++),l&&(E+=` AND (trt.avg_hours IS NULL OR trt.avg_hours <= $${u})`,m.push(l),u++),s&&s.lat&&s.lng&&s.radius){const S=s.radius/69,x=s.radius/(69*Math.cos(s.lat*Math.PI/180));E+=` AND
      (pp.location->>'lat')::float BETWEEN $${u} AND $${u+1}
      AND (pp.location->>'lng')::float BETWEEN $${u+2} AND $${u+3}`,m.push(s.lat-S,s.lat+S,s.lng-x,s.lng+x),u+=4}return E+=` ORDER BY pp.completed_jobs DESC, pp.rating_average DESC
           LIMIT $${u} OFFSET $${u+1}`,m.push(p,y),(await o(E,m,"searchTechnicians")).map(S=>({...S,avg_response_hours:S.avg_hours||null,distance:s&&S.location?.lat&&S.location?.lng?Se(s.lat,s.lng,S.location.lat,S.location.lng):void 0}))}function Se(e,t,s,r){const n=(s-e)*Math.PI/180,l=(r-t)*Math.PI/180,p=Math.sin(n/2)*Math.sin(n/2)+Math.cos(e*Math.PI/180)*Math.cos(s*Math.PI/180)*Math.sin(l/2)*Math.sin(l/2);return 3959*(2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p)))}async function pt(e){return(await o(`SELECT
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
     WHERE pp.user_id = $1`,[e],"getTechnicianProfile"))[0]||null}async function ft(e,t){const s=[],r=[];let a=1;for(const[l,p]of Object.entries(t))l==="specialties"&&Array.isArray(p)?(s.push(`${l} = $${a}`),r.push(p)):l==="location"&&typeof p=="object"?(s.push(`${l} = $${a}`),r.push(JSON.stringify(p))):l==="certifications"&&Array.isArray(p)?(s.push(`${l} = $${a}`),r.push(p)):l!=="user_id"&&l!=="first_name"&&l!=="last_name"&&l!=="email"&&(s.push(`${l} = $${a}`),r.push(p)),a++;if(s.length===0)throw new Error("No valid fields to update");r.push(e);const n=await o(`UPDATE tech_public_profiles SET ${s.join(", ")}, updated_at = NOW()
     WHERE user_id = $${a} RETURNING *`,r,"updateTechnicianProfile");if(n.length===0)throw new Error(`Technician profile for user ${e} not found`);return n[0]}async function mt(e,t={}){const{limit:s=50,offset:r=0}=t;return await o(`SELECT sr.*,
      cu.first_name || ' ' || cu.last_name as requester_name,
      cu.profile_photo_url as requester_photo
     FROM service_requests sr
     JOIN clerk_users cu ON cu.id = sr.requester_id::text
     WHERE sr.tech_id::text = $1 AND sr.status = 'Completed'
     ORDER BY sr.completed_at DESC
     LIMIT $2 OFFSET $3`,[e,s,r],"getTechEarnings")}async function _t(e){const t=await o(`SELECT COALESCE(balance, 0) as balance
     FROM wallets
     WHERE user_id = $1`,[e],"getWalletBalance");return parseFloat(t[0]?.balance||"0")}async function Et(e=20){return await o(`SELECT id, brand, model, category, sub_category, specs, submitted_by, submitter_name, votes, timestamp
     FROM equipment_submissions
     WHERE status = 'pending'
     ORDER BY timestamp DESC
     LIMIT $1`,[e],"getPendingSubmissions")}async function gt(e,t){await o(`UPDATE equipment_submissions
     SET votes = $2::jsonb
     WHERE id = $1`,[e,JSON.stringify(t)],"updateSubmissionVotes")}async function ht(e,t){const s=await o(`SELECT brand, model, category, sub_category, specs, submitted_by
     FROM equipment_submissions
     WHERE id = $1`,[e],"approveEquipmentSubmission-get");if(s.length===0)throw new Error("Submission not found");const r=s[0];await o(`INSERT INTO equipment_database (name, brand, model, category, subcategory, specifications, added_by, verified_by)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, ARRAY[$7])`,[`${r.brand} ${r.model}`,r.brand,r.model,r.category,r.sub_category,r.specs,r.submitted_by],"approveEquipmentSubmission-insert"),await o(`UPDATE equipment_submissions
     SET status = 'approved'
     WHERE id = $1`,[e],"approveEquipmentSubmission-update")}async function yt(e){await o(`UPDATE equipment_submissions
     SET status = 'rejected'
     WHERE id = $1`,[e],"rejectEquipmentSubmission")}async function bt(e){return(await o(`INSERT INTO equipment_submissions (brand, model, category, sub_category, specs, submitted_by, submitter_name, status, votes, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', '{"yes": [], "fake": [], "duplicate": []}'::jsonb, NOW())
     RETURNING *`,[e.brand,e.model,e.category,e.subCategory||null,e.specs||"{}",e.submittedBy,e.submitterName||null],"createEquipmentSubmission"))[0]}async function Nt(e,t){await o(`INSERT INTO wallets (user_id, balance, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET balance = wallets.balance + $2,
         updated_at = NOW()`,[e,t],"upsertWallet")}async function St(e){return await o(`SELECT id, name, email, stage_name, primary_role, genre, contract_type,
            status, signed_date, notes, created_at, updated_at
     FROM external_artists
     WHERE label_id = $1
     ORDER BY created_at DESC`,[e],"getExternalArtists")}async function $t(e,t){return(await o(`INSERT INTO external_artists (
       label_id, name, email, stage_name, primary_role,
       genre, contract_type, signed_date, notes, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'invited')
     RETURNING *`,[e,t.name,t.email||null,t.stage_name||null,t.primary_role||null,t.genre||[],t.contract_type||null,t.signed_date||null,t.notes||null],"createExternalArtist"))[0]}async function Tt(e){return(await o("SELECT get_pending_bookings_count($1) as count",[e],"getBookingCount"))[0]?.count||0}async function Rt(e){await o("SELECT record_user_metrics($1)",[e],"recordUserMetrics")}async function xt(e,t,s=30){const a=(await o("SELECT get_trend_percentage($1, $2, $3) as get_trend_percentage",[e,t,s],"getTrendPercentage"))[0]?.get_trend_percentage||0;return`${a>=0?"+":""}${a}%`}async function wt(e){const t=await o("SELECT COUNT(*) as count FROM metrics_history WHERE user_id = $1",[e],"hasHistoricalData");return parseInt(t[0]?.count||"0",10)>=2}const $e=new G({defaultOptions:{queries:{staleTime:1e3*60*5,gcTime:1e3*60*30,retry:1,retryDelay:e=>Math.min(1e3*2**e,3e4),refetchOnWindowFocus:!1,refetchOnReconnect:!0,refetchOnMount:!0},mutations:{retry:1,retryDelay:1e3}}}),U=N.lazy(()=>P(()=>import("./AuthWizard-DpMOI8RS.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))),Te=N.lazy(()=>P(()=>import("./AppRoutes-CsQ3Oe3b.js"),__vite__mapDeps([10,1,2,3,4,5,6]))),Re=N.lazy(()=>P(()=>import("./MainLayout-Ckzyh8a4.js"),__vite__mapDeps([11,1,2,3,4,5,6])));function xe(){const{isLoaded:e,isSignedIn:t,userId:s}=Y(),{user:r}=J(),a=V(),[n,l]=N.useState(null),[p,y]=N.useState(!0),g=X(),E=K(),[m,u]=N.useState(()=>typeof window<"u"?localStorage.getItem("theme")==="dark"||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches:!1);N.useEffect(()=>{const c=he();if(c){const d=document.documentElement;if(c.theme==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?(d.classList.add("dark"),u(!0)):(d.classList.remove("dark"),u(!1)):c.theme==="dark"?(d.classList.add("dark"),u(!0)):c.theme==="light"&&(d.classList.remove("dark"),u(!1)),c.accessibility?.fontSize){const $={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};d.style.fontSize=$[c.accessibility.fontSize]||$.medium}c.accessibility?.reducedMotion?(d.classList.add("reduce-motion"),d.style.setProperty("--motion-duration","0s")):(d.classList.remove("reduce-motion"),d.style.removeProperty("--motion-duration")),c.accessibility?.highContrast?d.classList.add("high-contrast"):d.classList.remove("high-contrast"),c.language&&(document.documentElement.lang=c.language)}},[]),N.useEffect(()=>{if(n?.settings?.theme){const c=n.settings.theme;if(c==="dark")u(!0);else if(c==="light")u(!1);else{const d=window.matchMedia("(prefers-color-scheme: dark)").matches;u(d)}}},[n?.settings?.theme]),N.useEffect(()=>{if(n?.settings?.theme!=="system")return;const c=window.matchMedia("(prefers-color-scheme: dark)"),d=$=>{u($.matches)};return c.addEventListener("change",d),()=>c.removeEventListener("change",d)},[n?.settings?.theme]),N.useEffect(()=>{if(!n?.settings)return;const c=n.settings,d=document.documentElement;if(c.accessibility?.fontSize){const $={small:"14px",medium:"16px",large:"18px",xlarge:"20px"};d.style.fontSize=$[c.accessibility.fontSize]||$.medium}c.accessibility?.reducedMotion!==void 0&&(c.accessibility.reducedMotion?(d.classList.add("reduce-motion"),d.style.setProperty("--motion-duration","0s")):(d.classList.remove("reduce-motion"),d.style.removeProperty("--motion-duration"))),c.accessibility?.highContrast!==void 0&&(c.accessibility.highContrast?d.classList.add("high-contrast"):d.classList.remove("high-contrast")),c.language&&(document.documentElement.lang=c.language)},[n?.settings]),N.useEffect(()=>{(async()=>{const d=n?.id||n?.uid;if(d)try{const $=await fetch(`/api/user/settings?user_id=${encodeURIComponent(d)}`);if($.ok){const w=await $.json();l(v=>({...v,settings:{...v?.settings,theme:w.theme||v?.settings?.theme,language:w.language||v?.settings?.language,dateFormat:w.dateFormat||v?.settings?.dateFormat,timeFormat:w.timeFormat||v?.settings?.timeFormat,timezone:w.timezone||v?.settings?.timezone,currency:w.currency||v?.settings?.currency,accessibility:{...v?.settings?.accessibility,...w.accessibility}}}))}}catch($){console.error("Failed to load MongoDB settings:",$)}})()},[n?.id,n?.uid]);const R=()=>u(!m);N.useEffect(()=>{if(!e)return;let c=!0;return(async()=>{const $=a.__internal?.()?.getState()??{},w=s||$.userId,v=t||$.session||$.user;if(!w||!v){c&&(l(null),y(!1));return}try{const T=await Ne(w);if(T){const C={id:w,firstName:r?.firstName||T.first_name||"User",lastName:r?.lastName||T.last_name||"",email:r?.primaryEmailAddress?.emailAddress||T.email||"",accountTypes:T.account_types||["Fan"],activeProfileRole:T.active_role||T.account_types?.[0]||"Fan",preferredRole:T.preferred_role||T.account_types?.[0]||"Fan",photoURL:r?.imageUrl||T.photo_url||T.avatar_url||null,settings:T.settings||{},effectiveDisplayName:T.effective_display_name||r?.firstName||T.first_name||"User",zipCode:T.zip_code,...T};c&&l(C)}else{const C=r?.publicMetadata||{},z={id:w,firstName:r?.firstName||C.first_name||"User",lastName:r?.lastName||C.last_name||"",email:r?.primaryEmailAddress?.emailAddress||"",accountTypes:C.account_types||["Fan"],activeProfileRole:C.active_role||"Fan",photoURL:r?.imageUrl||null,settings:{},effectiveDisplayName:r?.firstName||C.first_name||"User"};c&&l(z);try{console.log("📝 Creating user in Neon database...");const L=r?.publicMetadata||{};await B({id:w,email:r?.primaryEmailAddress?.emailAddress||"",phone:r?.primaryPhoneNumber?.phoneNumber||null,first_name:r?.firstName||L.first_name||null,last_name:r?.lastName||L.last_name||null,username:r?.username||L.username||null,profile_photo_url:r?.imageUrl||null,account_types:L.account_types||["Fan"],active_role:L.active_role||"Fan",bio:L.bio||null,zip_code:L.zip_code||null}),console.log("✅ User created in Neon database")}catch(L){console.error("❌ Failed to create user in Neon:",L)}}c&&y(!1)}catch(T){if(console.error("Error loading user data:",T),c){const C=r?.publicMetadata||{};l({id:s,firstName:r?.firstName||C.first_name||"User",lastName:r?.lastName||C.last_name||"",email:r?.primaryEmailAddress?.emailAddress||"",accountTypes:C.account_types||["Fan"],activeProfileRole:C.active_role||"Fan",photoURL:r?.imageUrl||null,settings:{}}),y(!1)}}})(),()=>{c=!1}},[s,t,e,r]);const S=N.useCallback(c=>{l(c)},[]),x=N.useCallback(async()=>{try{console.log("=== APP LOGOUT ===");const d=(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="5173")&&!1;a&&(await a.signOut(),console.log("✅ Clerk signOut successful")),l(null),console.log("✅ Local state cleared"),g("/login",{replace:!0}),console.log("✅ Navigated to login")}catch(c){console.error("Logout error:",c),l(null),g("/login",{replace:!0})}},[g,a,n]);if(!e||p)return i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})});const k=new URLSearchParams(window.location.search).get("intent")==="signup",O=(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="5173")&&!1,h=a.__internal?.()?.getState()??{},D=h.session||h.user,_=t&&s||D,A=n&&n.id,b=E.pathname==="/login",f=E.pathname==="/test-login";return!_&&!O&&!b&&!f?i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:m,toggleTheme:R,onSuccess:()=>g("/"),isNewUser:!1})}):_&&!A&&!b&&!f?i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})}):f?_&&A||O?(g("/debug-report",{replace:!0}),null):i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:m,toggleTheme:R,onSuccess:()=>g("/debug-report"),isNewUser:!1})}):b?_&&A||O?(g("/",{replace:!0}),null):i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:m,toggleTheme:R,onSuccess:()=>g("/"),isNewUser:!1})}):_&&!A&&k&&!O?i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{user:r,isNewUser:!0,darkMode:m,toggleTheme:R,onSuccess:()=>g("/debug-report")})}):!_&&!O?i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:48})}),children:i.jsx(U,{darkMode:m,toggleTheme:R,onSuccess:()=>g("/"),isNewUser:!1})}):i.jsx(Q,{client:$e,children:i.jsx(Ee,{userData:n,children:i.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:[i.jsx(Z,{position:"bottom-right",toastOptions:{style:{background:"#333",color:"#fff"}}}),i.jsx(ee,{}),E.pathname==="/settings"||E.pathname==="/debug-report"?i.jsx("main",{className:"p-6",children:i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"flex items-center justify-center min-h-screen",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:32})}),children:i.jsx(Te,{user:{id:s,...r},userData:n,loading:p,darkMode:m,toggleTheme:R,handleLogout:x,onUserDataUpdate:S})})}):i.jsx(N.Suspense,{fallback:i.jsx("div",{className:"flex items-center justify-center min-h-screen",children:i.jsx(I,{className:"animate-spin text-brand-blue",size:32})}),children:i.jsx(Re,{user:{id:s,...r},userData:n,loading:p,darkMode:m,toggleTheme:R,handleLogout:x,onRoleSwitch:c=>{l(d=>d?{...d,activeProfileRole:c,preferredRole:c}:null)}})})]})})})}const F=q("pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk");F||console.error("❌ Clerk: Missing publishable key in production");const we={publishableKey:F,router:"virtual",appearance:{elements:{primaryButton:{backgroundColor:"hsl(222, 78%, 58%)",color:"white","&:hover":{backgroundColor:"hsl(223, 82%, 57%)"}},input:{borderColor:"#e2e8f0","&:focus":{borderColor:"#3D84ED"}}},variables:{colorPrimary:"#3D84ED",colorBackground:"white",colorInputBackground:"white",colorDanger:"#ef4444",colorSuccess:"#22c55e"}},debug:!1};q(void 0);let j=null,H=!1;const ve=async()=>{if(j!==null)return j;if(H)return null;const e=`https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712
`;H=!0;try{const t=await P(()=>import("./vendor-B4TWoEsZ.js").then(a=>a.db),__vite__mapDeps([2,3]));j=t;const{init:s}=t;return t.getCurrentHub?.()?.getClient?.()||s({dsn:e,environment:"production",tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),j}catch{return j=!1,null}},Ce=(e,t={},s={})=>{const r={message:e?.message||"Unknown error",stack:e?.stack,name:e?.name,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,url:window.location.href,...t,context:s};ve().then(a=>{a&&a.captureException&&a.captureException(e,{extra:r,tags:{component:s.component||"Unknown",errorBoundary:s.errorBoundary||"None"},contexts:{custom:s}})}).catch(()=>{});try{const a=JSON.parse(localStorage.getItem("seshnx_errors")||"[]");a.unshift(r),a.splice(10),localStorage.setItem("seshnx_errors",JSON.stringify(a))}catch{}return r};class De extends te.Component{constructor(t){super(t),this.state={hasError:!1,error:null,errorInfo:null,meme:"Unexpected signal chain failure.",errorId:null,copied:!1}}static getDerivedStateFromError(t){return{hasError:!0,error:t,errorId:`ERR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}}componentDidCatch(t,s){const r={componentStack:s.componentStack,errorBoundary:this.props.name||"Default",props:this.props.context||{}},a=Ce(t,s,r);this.setState({errorInfo:{...s,errorId:this.state.errorId||a.timestamp}})}componentDidMount(){const t=["CoreAudio Overload detected.","The plugin crashed the session.","Buffer underrun exception.","Who deleted the master fader?","Sample rate mismatch: Reality is 44.1k, we are 48k.","The drummer kicked the power cable.","Ilok license not found.","Fatal Error: Not enough headroom.","The mix bus is clipping... hard.","Phantom power failure."];this.setState({meme:t[Math.floor(Math.random()*t.length)]})}handleReset=()=>{if(this.setState({hasError:!1,error:null,errorInfo:null,errorId:null,copied:!1}),this.props.onReset)this.props.onReset();else{const t=window.location.pathname;t!=="/"&&t!=="/dashboard"?window.location.href="/?tab=dashboard":window.location.reload()}};handleCopyError=async()=>{const t=`
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message||"Unknown error"}
Stack: ${this.state.error?.stack||"No stack trace"}
Component Stack: ${this.state.errorInfo?.componentStack||"No component stack"}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();try{await navigator.clipboard.writeText(t),this.setState({copied:!0}),setTimeout(()=>this.setState({copied:!1}),2e3)}catch(s){console.error("Failed to copy error:",s)}};render(){return this.state.hasError?i.jsx("div",{className:"min-h-screen bg-[#1f2128] flex flex-col items-center justify-center p-4 text-center text-white font-sans",children:i.jsxs("div",{className:"bg-[#2c2e36] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden",children:[i.jsx("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"}),i.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[i.jsx("div",{className:"w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500",children:i.jsx(se,{size:32,strokeWidth:2})}),i.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Session Crashed"}),i.jsxs("p",{className:"text-xl text-[#3D84ED] font-medium mb-6 italic",children:['"',this.state.meme,'"']}),i.jsxs("div",{className:"bg-[#1f2128] p-4 rounded-lg w-full mb-6 text-left border border-gray-700",children:[i.jsxs("div",{className:"flex justify-between items-center mb-2",children:[i.jsx("p",{className:"text-xs text-gray-500 uppercase font-bold tracking-wider",children:"Error Details"}),i.jsx("button",{onClick:this.handleCopyError,className:"text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors",title:"Copy error details",children:this.state.copied?i.jsxs(i.Fragment,{children:[i.jsx(re,{size:12}),"Copied!"]}):i.jsxs(i.Fragment,{children:[i.jsx(ae,{size:12}),"Copy"]})})]}),i.jsxs("div",{className:"space-y-2",children:[this.state.errorId&&i.jsxs("div",{children:[i.jsx("span",{className:"text-xs text-gray-500",children:"Error ID: "}),i.jsx("code",{className:"text-xs text-blue-400 font-mono",children:this.state.errorId})]}),i.jsx("code",{className:"text-sm text-red-400 font-mono break-words block",children:this.state.error?.message||"Unknown error occurred"}),this.state.error?.stack&&i.jsxs("details",{className:"mt-2",children:[i.jsx("summary",{className:"text-xs text-gray-500 cursor-pointer hover:text-gray-400",children:"Stack Trace"}),i.jsx("pre",{className:"text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32",children:this.state.error.stack})]})]})]}),i.jsxs("div",{className:"flex gap-4 w-full",children:[i.jsx("button",{onClick:()=>window.history.back(),className:"flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",children:"Go Back"}),i.jsxs("button",{onClick:this.handleReset,className:"flex-1 bg-[#3D84ED] hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",children:[i.jsx(ie,{size:18}),"Reload App"]})]})]})]})}):this.props.children}}const Oe=`https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712
`;ne({dsn:Oe,environment:"production",release:"local-dev",integrations:[oe({tracePropagationTargets:["localhost",/^https:\/\/(app\.seshnx\.com|webapp-main-.*\.vercel\.app)/]}),le({maskAllText:!1,blockAllMedia:!1}),ce(),ue({levels:["error"]})],tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1,beforeSend(e){return e.exception?.values?.[0]?.value?.includes("localStorage")||e.exception?.values?.[0]?.value?.includes("QuotaExceededError")?null:(e.contexts={...e.contexts,app:{name:"SeshNx Webapp",environment:"production"}},e)},initialScope:{tags:{framework:"react",runtime:"vite"}}});const Ae=({children:e})=>i.jsx(_e,{fallback:({error:t,resetError:s})=>i.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a1d21]",children:i.jsxs("div",{className:"text-center p-8",children:[i.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white mb-4",children:"Something went wrong"}),i.jsx("p",{className:"text-gray-600 dark:text-gray-400 mb-6",children:t?.message||"An unexpected error occurred"}),i.jsx("button",{onClick:s,className:"px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors",children:"Try again"})]})}),children:e});F||console.error("❌ Clerk: VITE_CLERK_PUBLISHABLE_KEY is not set. Get your key from https://dashboard.clerk.com/ and add it to your .env.local file.");de.createRoot(document.getElementById("root")).render(i.jsx(Ae,{children:i.jsx(De,{name:"Root",children:i.jsx(pe,{...we,children:i.jsx(fe,{client:ge,children:i.jsx(me,{children:i.jsx(xe,{})})})})})}));const Le=()=>{const e=document.getElementById("loading-fallback");e&&(e.classList.add("fade-out"),setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="auto"},400))};setTimeout(Le,600);export{yt as A,bt as B,Ge as C,at as D,De as E,it as F,nt as G,rt as H,ot as I,mt as J,pt as K,ft as L,St as M,$t as N,wt as O,xt as P,Rt as Q,We as R,ze as S,et as a,_t as b,Tt as c,Ne as d,Pe as e,Ze as f,tt as g,Fe as h,He as i,Xe as j,Ke as k,Qe as l,Ve as m,Ye as n,Je as o,Be as p,lt as q,st as r,ut as s,dt as t,qe as u,ct as v,Et as w,gt as x,ht as y,Nt as z};
