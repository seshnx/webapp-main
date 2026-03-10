import{bg as o,r as u}from"./vendor-CaCbEmOf.js";import{n as _}from"./edu-BE-a0PY_.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};e.SENTRY_RELEASE={id:"local"};var r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="9a144a8f-81c4-4ecf-863d-2a47fbcebec4",e._sentryDebugIdIdentifier="sentry-dbid-9a144a8f-81c4-4ecf-863d-2a47fbcebec4")}catch{}})();async function c(e,r=[],t="Unnamed Query"){if(!_)throw new Error("Neon client is not configured");try{return await _(e,r)}catch(s){throw console.error(`Database error in ${t}:`,s),new Error(`Query ${t} failed: ${s instanceof Error?s.message:String(s)}`)}}async function y(e={}){const{limit:r=50,status:t,category:s,sellerId:a}=e;let i=`SELECT gl.*,
    cu.username as seller_username,
    cu.profile_photo_url as seller_photo
    FROM gear_listings gl
    LEFT JOIN clerk_users cu ON cu.id = gl.seller_id::TEXT
    WHERE 1=1`;const n=[];let l=1;return t&&(i+=` AND gl.status = $${l}`,n.push(t),l++),s&&(i+=` AND gl.category = $${l}`,n.push(s),l++),a&&(i+=` AND gl.seller_id = $${l}`,n.push(a),l++),i+=` ORDER BY gl.created_at DESC LIMIT $${l}`,n.push(r),await c(i,n,"getGearListingsNeon")}async function E(e){return(await c(`INSERT INTO gear_listings (
      seller_id, title, description, brand, model, category, condition,
      price, original_price, images, specifications, location,
      shipping_available, local_pickup_available, safe_exchange_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,[e.seller_id,e.title,e.description||null,e.brand||null,e.model||null,e.category||"Other",e.condition||"Good",e.price,e.original_price||null,JSON.stringify(e.images||[]),JSON.stringify(e.specifications||{}),e.location?JSON.stringify(e.location):null,e.shipping_available!==!1,e.local_pickup_available!==!1,e.safe_exchange_enabled!==!1],"createGearListingNeon"))[0]}async function $(e,r){await c("UPDATE gear_listings SET status = $1, updated_at = NOW() WHERE id = $2",[r,e],"updateGearListingStatusNeon")}async function m(e={}){const{userId:r,status:t,limit:s=50}=e;let a=`SELECT go.*,
    gl.title as listing_title,
    gl.images as listing_images,
    buyer.username as buyer_username,
    seller.username as seller_username
    FROM gear_orders go
    LEFT JOIN gear_listings gl ON gl.id = go.listing_id
    LEFT JOIN clerk_users buyer ON buyer.id = go.buyer_id::TEXT
    LEFT JOIN clerk_users seller ON seller.id = go.seller_id::TEXT
    WHERE 1=1`;const i=[];let n=1;return r&&(a+=` AND (go.buyer_id = $${n} OR go.seller_id = $${n})`,i.push(r),n++),t&&(a+=` AND go.status = $${n}`,i.push(t),n++),a+=` ORDER BY go.created_at DESC LIMIT $${n}`,i.push(s),await c(a,i,"getGearOrdersNeon")}async function N(e){return(await c(`INSERT INTO gear_orders (
      listing_id, buyer_id, seller_id, price, shipping_method, shipping_address
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,[e.listing_id,e.buyer_id,e.seller_id,e.price,e.shipping_method||"pickup",e.shipping_address?JSON.stringify(e.shipping_address):null],"createGearOrderNeon"))[0]}async function T(e,r){await c("UPDATE gear_orders SET status = $1, updated_at = NOW() WHERE id = $2",[r,e],"updateGearOrderStatusNeon")}async function w(e){return(await c(`INSERT INTO gear_offers (
      listing_id, buyer_id, seller_id, offer_price, message, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,[e.listing_id,e.buyer_id,e.seller_id,e.offer_price,e.message||null,e.expires_at||null],"createGearOfferNeon"))[0]}async function O(e,r){await c("UPDATE gear_offers SET status = $1, updated_at = NOW() WHERE id = $2",[r,e],"respondToGearOfferNeon")}async function R(e={}){const{userId:r,status:t,limit:s=50}=e;let a=`SELECT setx.*,
    go.price as order_price,
    gl.title as listing_title,
    gl.images as listing_images,
    buyer.username as buyer_username,
    seller.username as seller_username
    FROM safe_exchange_transactions setx
    LEFT JOIN gear_orders go ON go.id = setx.order_id
    LEFT JOIN gear_listings gl ON gl.id = go.listing_id
    LEFT JOIN clerk_users buyer ON buyer.id = setx.buyer_id::TEXT
    LEFT JOIN clerk_users seller ON seller.id = setx.seller_id::TEXT
    WHERE 1=1`;const i=[];let n=1;return r&&(a+=` AND (setx.buyer_id = $${n} OR setx.seller_id = $${n})`,i.push(r),n++),t&&(a+=` AND setx.escrow_status = $${n}`,i.push(t),n++),a+=` ORDER BY setx.created_at DESC LIMIT $${n}`,i.push(s),await c(a,i,"getSafeExchangeTransactionsNeon")}async function b(e){return(await c(`SELECT setx.*,
      go.price as order_price,
      gl.title as listing_title,
      gl.images as listing_images,
      buyer.username as buyer_username,
      seller.username as seller_username
      FROM safe_exchange_transactions setx
      LEFT JOIN gear_orders go ON go.id = setx.order_id
      LEFT JOIN gear_listings gl ON gl.id = go.listing_id
      LEFT JOIN clerk_users buyer ON buyer.id = setx.buyer_id::TEXT
      LEFT JOIN clerk_users seller ON seller.id = setx.seller_id::TEXT
      WHERE setx.id = $1`,[e],"getSafeExchangeTransactionByIdNeon"))[0]||null}async function S(e){return(await c(`INSERT INTO safe_exchange_transactions (
      order_id, buyer_id, seller_id, amount
    ) VALUES ($1, $2, $3, $4)
    RETURNING *`,[e.order_id||null,e.buyer_id,e.seller_id,e.amount],"createSafeExchangeTransactionNeon"))[0]}async function k(e,r){const t=[],s=[];let a=1;r.escrow_status&&(t.push(`escrow_status = $${a}`),s.push(r.escrow_status),a++),r.buyer_verified!==void 0&&(t.push(`buyer_verified = $${a}`),s.push(r.buyer_verified),a++),r.seller_verified!==void 0&&(t.push(`seller_verified = $${a}`),s.push(r.seller_verified),a++),r.shipping_verified!==void 0&&(t.push(`shipping_verified = $${a}`),s.push(r.shipping_verified),a++),r.photo_verification&&(t.push(`photo_verification = $${a}`),s.push(JSON.stringify(r.photo_verification)),a++),t.length!==0&&(s.push(e),await c(`UPDATE safe_exchange_transactions SET ${t.join(", ")}, updated_at = NOW() WHERE id = $${a}`,s,"updateSafeExchangeTransactionNeon"))}async function L(e={}){const{type:r,category:t,limit:s=50}=e;let a=`SELECT mi.*,
    cu.username as seller_username,
    cu.profile_photo_url as seller_photo
    FROM marketplace_items mi
    LEFT JOIN clerk_users cu ON cu.id = mi.seller_id::TEXT
    WHERE mi.status = 'active'`;const i=[];let n=1;return r&&(a+=` AND mi.category = $${n}`,i.push(r),n++),t&&(a+=` AND mi.genre = $${n}`,i.push(t),n++),a+=` ORDER BY mi.created_at DESC LIMIT $${n}`,i.push(s),await c(a,i,"getMarketplaceItemsByCategory")}async function x(e){return(await c(`INSERT INTO marketplace_items (
      seller_id, title, description, category, price,
      preview_audio_url, preview_image_url, file_url, file_size,
      tags, genre, bpm, key
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,[e.seller_id,e.title,e.description||null,e.category||"Other",e.price,e.preview_audio_url||null,e.preview_image_url||null,e.file_url||null,e.file_size||null,e.tags||[],e.genre||null,e.bpm||null,e.key||null],"createMarketplaceItemNeon"))[0]}async function I(e,r=50){return await c(`SELECT ul.*,
      mi.title,
      mi.description,
      mi.category,
      mi.preview_image_url,
      mi.file_url,
      mi.tags,
      mi.genre,
      mi.bpm,
      mi.key,
      seller.username as seller_username
      FROM user_library ul
      LEFT JOIN marketplace_items mi ON mi.id = ul.item_id
      LEFT JOIN clerk_users seller ON seller.id = mi.seller_id::TEXT
      WHERE ul.user_id = $1
      ORDER BY ul.purchased_at DESC
      LIMIT $2`,[e,r],"getUserLibraryNeon")}async function v(e,r){await c(`INSERT INTO user_library (user_id, item_id) VALUES ($1, $2)
    ON CONFLICT (user_id, item_id) DO NOTHING`,[e,r],"purchaseMarketplaceItemNeon"),await c(`UPDATE marketplace_items
    SET sales_count = sales_count + 1,
        downloads_count = downloads_count + 1,
        updated_at = NOW()
    WHERE id = $1`,[r],"purchaseMarketplaceItemNeon")}async function F(e,r=50){return await c(`SELECT dr.*,
      cu.username as creator_username
      FROM distribution_releases dr
      LEFT JOIN clerk_users cu ON cu.id = dr.creator_id::TEXT
      WHERE dr.creator_id = $1
      ORDER BY dr.created_at DESC
      LIMIT $2`,[e,r],"getDistributionReleasesNeon")}async function G(e){return(await c(`INSERT INTO distribution_releases (
      creator_id, title, artist_name, genre, release_date, tracks, artwork_url, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,[e.creator_id,e.title,e.artist_name,e.genre||null,e.release_date||null,e.tracks?JSON.stringify(e.tracks):[],e.artwork_url||null,e.status||"draft"],"createDistributionReleaseNeon"))[0]}async function M(e,r){const t=[],s=[];let a=1;r.title&&(t.push(`title = $${a}`),s.push(r.title),a++),r.artist_name&&(t.push(`artist_name = $${a}`),s.push(r.artist_name),a++),r.genre&&(t.push(`genre = $${a}`),s.push(r.genre),a++),r.release_date&&(t.push(`release_date = $${a}`),s.push(r.release_date),a++),r.tracks&&(t.push(`tracks = $${a}`),s.push(JSON.stringify(r.tracks)),a++),r.artwork_url&&(t.push(`artwork_url = $${a}`),s.push(r.artwork_url),a++),r.status&&(t.push(`status = $${a}`),s.push(r.status),a++),t.length!==0&&(s.push(e),await c(`UPDATE distribution_releases SET ${t.join(", ")}, updated_at = NOW() WHERE id = $${a}`,s,"updateDistributionReleaseNeon"))}async function A(e){await c("DELETE FROM distribution_releases WHERE id = $1",[e],"deleteDistributionReleaseNeon")}async function U(e={}){try{return await y(e)}catch(r){return console.error("Failed to fetch gear listings:",r),o(r,{tags:{service:"marketplace",function:"fetchGearListings"}}),[]}}async function J(e){try{return await E(e)}catch(r){throw console.error("Failed to create gear listing:",r),o(r,{tags:{service:"marketplace",function:"createListing"}}),r}}async function W(e,r){try{await $(e,r)}catch(t){throw console.error("Failed to update listing status:",t),o(t,{tags:{service:"marketplace",function:"updateListingStatus"},extra:{listingId:e,status:r}}),t}}async function C(e={}){try{return await m(e)}catch(r){return console.error("Failed to fetch gear orders:",r),o(r,{tags:{service:"marketplace",function:"fetchGearOrders"}}),[]}}async function H(e){try{return await N(e)}catch(r){throw console.error("Failed to create gear order:",r),o(r,{tags:{service:"marketplace",function:"createOrder"}}),r}}async function P(e,r){try{await T(e,r)}catch(t){throw console.error("Failed to update order status:",t),o(t,{tags:{service:"marketplace",function:"updateOrderStatus"},extra:{orderId:e,status:r}}),t}}async function B(e){try{return await w(e)}catch(r){throw console.error("Failed to create gear offer:",r),o(r,{tags:{service:"marketplace",function:"createOffer"}}),r}}async function X(e,r){try{await O(e,r)}catch(t){throw console.error("Failed to respond to offer:",t),o(t,{tags:{service:"marketplace",function:"respondToOffer"},extra:{offerId:e,response:r}}),t}}async function V(e={}){try{return await R(e)}catch(r){return console.error("Failed to fetch safe exchange transactions:",r),o(r,{tags:{service:"marketplace",function:"fetchSafeExchangeTransactions"}}),[]}}async function p(e){try{return await b(e)}catch(r){return console.error("Failed to fetch safe exchange transaction:",r),o(r,{tags:{service:"marketplace",function:"fetchSafeExchangeTransaction"},extra:{transactionId:e}}),null}}async function Y(e){try{return await S(e)}catch(r){throw console.error("Failed to create safe exchange transaction:",r),o(r,{tags:{service:"marketplace",function:"createTransaction"}}),r}}async function h(e,r){try{await k(e,r)}catch(t){throw console.error("Failed to update transaction:",t),o(t,{tags:{service:"marketplace",function:"updateTransaction"},extra:{transactionId:e}}),t}}async function q(e,r){try{const s=(await p(e))?.photo_verification||{},a=s.photos||[];a.push(r),await h(e,{photo_verification:{...s,photos:a,updated_at:new Date().toISOString()}})}catch(t){throw console.error("Failed to add photo:",t),o(t,{tags:{service:"marketplace",function:"addPhoto"},extra:{transactionId:e,photoUrl:r}}),t}}async function Q(e={}){try{return await L(e)}catch(r){return console.error("Failed to fetch marketplace items:",r),o(r,{tags:{service:"marketplace",function:"fetchMarketplaceItems"}}),[]}}async function j(e){try{return await x(e)}catch(r){throw console.error("Failed to create marketplace item:",r),o(r,{tags:{service:"marketplace",function:"createMarketplaceItem"}}),r}}async function z(e,r){try{await v(e,r)}catch(t){throw console.error("Failed to purchase item:",t),o(t,{tags:{service:"marketplace",function:"purchaseItem"},extra:{userId:e,itemId:r}}),t}}async function K(e,r=50){try{return await I(e,r)}catch(t){return console.error("Failed to fetch user library:",t),o(t,{tags:{service:"marketplace",function:"fetchUserLibrary"},extra:{userId:e}}),[]}}async function Z(e,r=50){try{return await F(e,r)}catch(t){return console.error("Failed to fetch distribution releases:",t),o(t,{tags:{service:"marketplace",function:"fetchDistributionReleases"},extra:{userId:e}}),[]}}async function D(e){try{return await G(e)}catch(r){throw console.error("Failed to create distribution release:",r),o(r,{tags:{service:"marketplace",function:"createRelease"}}),r}}async function ee(e,r){try{await M(e,r)}catch(t){throw console.error("Failed to update release:",t),o(t,{tags:{service:"marketplace",function:"updateRelease"},extra:{releaseId:e}}),t}}async function re(e){try{await A(e)}catch(r){throw console.error("Failed to delete release:",r),o(r,{tags:{service:"marketplace",function:"deleteRelease"},extra:{releaseId:e}}),r}}const te=3e4;function f(e,r,t=!0){const[s,a]=u.useState([]),[i,n]=u.useState(!0),l=u.useRef(e);l.current=e;const g=u.useCallback(async()=>{if(t){n(!0);try{const d=await l.current();a(d)}catch(d){console.error("Polling error:",d)}finally{n(!1)}}},[t]);return u.useEffect(()=>{if(g(),!t)return;const d=setInterval(g,te);return()=>clearInterval(d)},[t,g,...r]),{data:s,loading:i,refresh:g}}function ne(e={}){return f(async()=>await U(e),[e.limit,e.status])}function ie(e,r){return f(async()=>e?await C({userId:e,status:void 0}):[],[e,r],!!e)}function ce(e,r){return f(async()=>e?await V({userId:e,status:void 0}):[],[e,r],!!e)}function oe(e){const[r,t]=u.useState(null),[s,a]=u.useState(!0);return u.useEffect(()=>{if(!e){a(!1);return}(async()=>{a(!0);try{const n=await p(e);t(n)}catch(n){console.error("Error fetching transaction:",n)}finally{a(!1)}})()},[e]),{transaction:r,loading:s}}function le(e={}){return f(async()=>await Q(e),[e.type])}function ue(e){return f(async()=>e?await K(e):[],[e],!!e)}function fe(e){return f(async()=>e?await Z(e):[],[e],!!e)}function de(){return{createListing:async e=>await J(e),updateListingStatus:async(e,r)=>await W(e,r),createOrder:async e=>await H(e),updateOrderStatus:async(e,r)=>await P(e,r),createOffer:async e=>await B(e),respondToOffer:async(e,r)=>await X(e,r),createTransaction:async e=>await Y(e),updateTransaction:async(e,r)=>await h(e,r),addPhoto:async(e,r)=>await q(e,r),createMarketplaceItem:async e=>await j(e),purchaseItem:async(e,r)=>await z(e,r),createRelease:async e=>await D(e),updateRelease:async(e,r)=>await ee(e,r),deleteRelease:async e=>await re(e)}}export{de as a,ne as b,ce as c,ie as d,le as e,ue as f,fe as g,oe as u};
