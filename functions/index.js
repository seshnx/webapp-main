const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Use environment variables for keys, fallback to process.env if not set via functions:config
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const shippo = require('shippo')(process.env.SHIPPO_API_TOKEN);

const APP_NAME = 'SeshNx';

// --- 1. EMAIL CONFIGURATION (Zoho) ---
// Using functions.config() is standard for Firebase Functions environment variables set via CLI
const zohoUser = functions.config().email ? functions.config().email.user : process.env.ZOHO_USER;   
const zohoPass = functions.config().email ? functions.config().email.pass : process.env.ZOHO_PASS;   
const zohoAlias = functions.config().email ? functions.config().email.alias : process.env.ZOHO_ALIAS; 
const appUrl = (functions.config().app && functions.config().app.url) || process.env.APP_URL || 'https://app.seshnx.com';

// Only create transport if credentials exist to avoid crash on deploy if env vars missing
let mailTransport = null;
if (zohoUser && zohoPass) {
    mailTransport = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: zohoUser,
            pass: zohoPass,
        },
    });
}

/**
 * Helper: Check User Preferences & Send Push/Email
 */
const sendNotification = async (userId, notification) => {
    const appId = process.env.APP_ID || 'seshnx-70c04';
    
    try {
        const userDoc = await db.doc(`artifacts/${appId}/users/${userId}/profiles/main`).get();
        if (!userDoc.exists) return;

        const userData = userDoc.data();
        const settings = userData.settings?.notifications || { email: true, push: true };
        const fcmTokens = userData.fcmTokens || []; 

        // A. Send Push Notification (FCM)
        if (settings.push && fcmTokens.length > 0) {
            const payload = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: `${appUrl}/pwa-192x192.png`, 
                },
                data: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    ...notification.data 
                }
            };

            try {
                await admin.messaging().sendToDevice(fcmTokens, payload);
                console.log(`Push sent to ${userId}`);
            } catch (error) {
                console.error("FCM Error:", error);
            }
        }

        // B. Send Email via Zoho
        if (settings.email && userData.email && mailTransport) {
            const mailOptions = {
                from: `${APP_NAME} <${zohoAlias}>`,
                to: userData.email,
                subject: notification.title,
                text: notification.body,
                html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #3D84ED; margin: 0;">${APP_NAME}</h2>
                    </div>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-top: 0;">${notification.title}</h3>
                        <p style="font-size: 16px; line-height: 1.5;">${notification.body}</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${appUrl}" style="background-color: #3D84ED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Open App
                            </a>
                        </div>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
                    You received this email because you have notifications enabled on your SeshNx account.
                    </p>
                </div>
                `
            };

            try {
                await mailTransport.sendMail(mailOptions);
                console.log(`Email sent to ${userId} via Zoho (${zohoAlias})`);
            } catch (error) {
                console.error("Zoho Email Error:", error);
            }
        }
    } catch (e) {
        console.error("Notification Logic Error:", e);
    }
};

/**
 * Helper to dynamically fetch token packages from Firestore.
 */
const fetchTokenPackages = async (appId) => {
    try {
        const tokensRef = db.doc(`artifacts/${appId}/public/config/subscriptions/token_packages`);
        const snap = await tokensRef.get();
        
        if (snap.exists) {
            const tokenMap = {};
            Object.values(snap.data()).forEach(pack => {
                if (pack.id) tokenMap[pack.id] = pack;
            });
            return tokenMap;
        }
    } catch (e) {
        console.warn("Failed to fetch token packages:", e);
    }
    return {}; 
};

// ==================================================================
// EXPORTED FUNCTIONS
// ==================================================================

exports.createTokenPurchaseIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { packId } = data;
    const appId = process.env.APP_ID || 'seshnx-70c04';

    const tokenPackagesMap = await fetchTokenPackages(appId);
    const pack = tokenPackagesMap[packId];
    
    if (!pack || !pack.price || !pack.tokens) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid token package.');
    }

    const amountInCents = Math.round(pack.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
            userId: context.auth.uid,
            packId: packId,
            tokens: pack.tokens,
            type: 'token_purchase'
        }
    });

    return { clientSecret: paymentIntent.client_secret };
});

exports.createConnectAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    const userId = context.auth.uid;
    const appId = process.env.APP_ID || 'seshnx-70c04';
    const userDocRef = db.doc(`artifacts/${appId}/users/${userId}/profiles/main`);

    let stripeAccountId;
    const userSnap = await userDocRef.get();
    
    if (userSnap.exists && userSnap.data().stripeAccountId) {
        stripeAccountId = userSnap.data().stripeAccountId;
    } else {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: userSnap.data().email || context.auth.token.email,
            capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
            metadata: { userId: userId }
        });
        stripeAccountId = account.id;
        await userDocRef.set({ stripeAccountId: stripeAccountId }, { merge: true });
    }

    const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${appUrl}/?tab=payments&accountRefresh=true`,
        return_url: `${appUrl}/?tab=payments&accountOnboarded=true`,
        type: 'account_onboarding',
    });

    return { url: accountLink.url };
});

exports.createSessionPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { amount, targetId, bookingId } = data;
    const amountInCents = Math.round(amount * 100);
    const appId = process.env.APP_ID || 'seshnx-70c04';

    const talentDocRef = db.doc(`artifacts/${appId}/users/${targetId}/profiles/main`);
    const talentSnap = await talentDocRef.get();
    
    if (!talentSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Talent profile not found.');
    }

    const stripeAccountId = talentSnap.data().stripeAccountId;

    if (!stripeAccountId) {
        throw new functions.https.HttpsError('failed-precondition', 'Talent has not set up payout account.');
    }

    const applicationFeeAmount = Math.max(50, Math.round(amountInCents * 0.10)); 

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method_types: ['card'],
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: stripeAccountId },
        metadata: {
            bookingId: bookingId,
            payerId: context.auth.uid,
            talentId: targetId
        }
    });

    return { clientSecret: paymentIntent.client_secret };
});

exports.initiatePayout = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { amount } = data;
    const userId = context.auth.uid;
    const appId = process.env.APP_ID || 'seshnx-70c04';

    if (!amount || amount <= 0) throw new functions.https.HttpsError('invalid-argument', 'Invalid amount.');

    const amountInCents = Math.round(amount * 100);
    const walletRef = db.doc(`artifacts/${appId}/users/${userId}/wallet/account`);
    const profileRef = db.doc(`artifacts/${appId}/users/${userId}/profiles/main`);

    try {
        const transferResult = await db.runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(walletRef);
            const profileDoc = await transaction.get(profileRef);

            if (!walletDoc.exists) throw new functions.https.HttpsError('not-found', 'Wallet not found.');

            const currentBalance = walletDoc.data().payoutBalance || 0;
            const stripeAccountId = profileDoc.data().stripeAccountId;

            if (!stripeAccountId) throw new functions.https.HttpsError('failed-precondition', 'No connected bank account.');
            if (currentBalance < amount) throw new functions.https.HttpsError('failed-precondition', 'Insufficient funds.');

            const transfer = await stripe.transfers.create({
                amount: amountInCents,
                currency: 'usd',
                destination: stripeAccountId,
                metadata: { userId: userId, type: 'payout_cashout' }
            });

            const newBalance = currentBalance - amount;
            transaction.update(walletRef, { 
                payoutBalance: newBalance,
                lastPayout: admin.firestore.FieldValue.serverTimestamp()
            });

            return { newBalance, transferId: transfer.id };
        });

        return { success: true, ...transferResult };

    } catch (error) {
        console.error("Payout Transaction Failed:", error);
        throw new functions.https.HttpsError('internal', 'Payout failed.');
    }
});

exports.releaseEscrowFunds = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    const appId = process.env.APP_ID || 'seshnx-70c04';
    const now = admin.firestore.Timestamp.now();
    const cutoffMillis = now.toMillis() - (24 * 60 * 60 * 1000);
    const cutoffTimestamp = admin.firestore.Timestamp.fromMillis(cutoffMillis);

    try {
        const bookingsRef = db.collection(`artifacts/${appId}/public/data/bookings`);
        const snapshot = await bookingsRef
            .where('status', '==', 'Completed')
            .where('paymentStatus', '==', 'Escrow')
            .where('completedAt', '<=', cutoffTimestamp)
            .get();

        if (snapshot.empty) return null;

        const batch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            const booking = doc.data();
            const amount = parseFloat(booking.offerAmount || booking.totalAmount || 0);

            if (booking.targetId && amount > 0) {
                const walletRef = db.doc(`artifacts/${appId}/users/${booking.targetId}/wallet/account`);
                batch.update(walletRef, {
                    escrowBalance: admin.firestore.FieldValue.increment(-amount),
                    payoutBalance: admin.firestore.FieldValue.increment(amount)
                });
                batch.update(doc.ref, { paymentStatus: 'Released', fundsReleasedAt: now });
                count++;
            }
        }

        await batch.commit();
    } catch (error) {
        console.error("Escrow Release Failed:", error);
    }
    return null;
});

exports.notifyOnBooking = functions.firestore
    .document('artifacts/{appId}/public/data/bookings/{bookingId}')
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        if (booking.type === 'Broadcast') return; 

        await sendNotification(booking.targetId, {
            title: 'New Booking Request',
            body: `${booking.senderName} wants to book a ${booking.serviceType || 'Session'}.`,
            data: { type: 'booking', bookingId: context.params.bookingId }
        });
    });

exports.notifyOnMessage = functions.database
    .ref('/messages/{chatId}/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message = snapshot.val();
        const { chatId } = context.params;
        const senderId = message.s;
        const content = message.b;

        let recipientIds = [];
        const chatMetaSnap = await admin.database().ref(`chats/${chatId}`).once('value');
        
        if (chatMetaSnap.exists()) {
            recipientIds = Object.keys(chatMetaSnap.val().members || {}).filter(uid => uid !== senderId);
        } else {
            const parts = chatId.split('_');
            recipientIds = parts.filter(uid => uid !== senderId);
        }

        const promises = recipientIds.map(uid => 
            sendNotification(uid, {
                title: `New Message from ${message.n || 'User'}`,
                body: content.length > 50 ? content.substring(0, 50) + '...' : content,
                data: { type: 'message', chatId: chatId }
            })
        );

        await Promise.all(promises);
    });

exports.createSplitPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required.');

    const { totalAmount, transfers, description } = data;
    const amountInCents = Math.round(totalAmount * 100);
    const appId = process.env.APP_ID || 'seshnx-70c04';

    // 1. Create the Payment Intent (Charge the Booker)
    // We do NOT set a single destination here because there are multiple.
    // The Platform collects the funds first.
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method_types: ['card'],
        description: description,
        metadata: {
            bookerId: context.auth.uid,
            type: 'split_session',
            // Store the split logic in metadata for the webhook to process later
            // (Limit: 500 chars, so for large groups, store in Firestore and pass ID)
            transferMap: JSON.stringify(transfers.map(t => ({ id: t.recipientId, amt: t.amount })))
        }
    });

    return { 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
    };
});

// Update the Webhook to handle the transfers upon success
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const appId = process.env.APP_ID || 'seshnx-70c04';

    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        const { type, transferMap } = intent.metadata;

        // --- NEW LOGIC: SPLIT PAYMENTS ---
        if (type === 'split_session' && transferMap) {
            const recipients = JSON.parse(transferMap);
            
            // Loop through recipients and initiate transfers
            // In production, use a queue/batch to ensure reliability
            for (const recipient of recipients) {
                try {
                    // 1. Get Destination Stripe ID
                    const userDoc = await db.doc(`artifacts/${appId}/users/${recipient.id}/profiles/main`).get();
                    const stripeAccountId = userDoc.data()?.stripeAccountId;

                    if (stripeAccountId) {
                        const amountCents = Math.round(recipient.amt * 100);
                        // Platform Fee Logic: We transfer the full amount minus platform fee
                        // Example: 10% platform fee
                        const payoutAmount = Math.round(amountCents * 0.90);

                        await stripe.transfers.create({
                            amount: payoutAmount,
                            currency: 'usd',
                            destination: stripeAccountId,
                            transfer_group: intent.id // Link to original charge
                        });
                        
                        // Update Wallet Doc
                        await db.doc(`artifacts/${appId}/users/${recipient.id}/wallet/account`).update({
                            payoutBalance: admin.firestore.FieldValue.increment(recipient.amt * 0.90) // Store as float dollar
                        });
                    }
                } catch (err) {
                    console.error(`Transfer failed for ${recipient.id}`, err);
                }
            }
            
            // Update Bookings to "Paid"
            const bookingsSnap = await db.collection(`artifacts/${appId}/public/data/bookings`)
                .where('paymentIntentId', '==', intent.id).get();
            
            bookingsSnap.forEach(doc => {
                doc.ref.update({ status: 'Approved', paymentStatus: 'Paid' });
            });
        }

        if (type === 'token_purchase' && userId && tokens) {
            const walletRef = db.doc(`artifacts/${appId}/users/${userId}/wallet/account`);
            await walletRef.set({
                balance: admin.firestore.FieldValue.increment(parseInt(tokens))
            }, { merge: true });
        }
    }
    
    if (event.type === 'account.updated') {
        const account = event.data.object;
        const userId = account.metadata?.userId;
        if (userId) {
             const accountRef = db.doc(`artifacts/${appId}/users/${userId}/profiles/main`);
             const canPayout = account.capabilities?.transfers === 'active' && account.capabilities?.card_payments === 'active';
             await accountRef.set({
                 payoutsEnabled: account.payouts_enabled,
                 chargesEnabled: account.charges_enabled,
                 onboardingComplete: canPayout 
             }, { merge: true });
        }
    }

    res.json({received: true});
});

exports.exportUserData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const userId = context.auth.uid;
    const appId = process.env.APP_ID || 'seshnx-70c04';
    const exportData = {};

    try {
        const profileSnap = await db.doc(`artifacts/${appId}/users/${userId}/profiles/main`).get();
        if (profileSnap.exists) exportData.profile = profileSnap.data();

        const walletSnap = await db.doc(`artifacts/${appId}/users/${userId}/wallet/account`).get();
        if (walletSnap.exists) exportData.wallet = walletSnap.data();

        const postsSnap = await db.collection(`artifacts/${appId}/public/data/posts`)
            .where('userId', '==', userId).get();
        exportData.posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const marketSnap = await db.collection(`artifacts/${appId}/public/data/market_items`)
            .where('authorId', '==', userId).get();
        exportData.marketItems = marketSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const sentBookings = await db.collection(`artifacts/${appId}/public/data/bookings`)
            .where('senderId', '==', userId).get();
        const receivedBookings = await db.collection(`artifacts/${appId}/public/data/bookings`)
            .where('targetId', '==', userId).get();
        
        exportData.bookings = {
            sent: sentBookings.docs.map(d => ({ id: d.id, ...d.data() })),
            received: receivedBookings.docs.map(d => ({ id: d.id, ...d.data() }))
        };

        return { data: JSON.stringify(exportData, null, 2) };

    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to generate data export.');
    }
});

exports.getShippingRates = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { listingId, buyerAddress } = data; 
    const appId = process.env.APP_ID || 'seshnx-70c04';

    try {
        const itemDoc = await db.doc(`artifacts/${appId}/public/data/gear_listings/${listingId}`).get();
        if (!itemDoc.exists) throw new functions.https.HttpsError('not-found', 'Item not found.');
        const item = itemDoc.data();

        const sellerDoc = await db.doc(`artifacts/${appId}/users/${item.sellerId}/profiles/main`).get();
        const seller = sellerDoc.data();

        if (!seller.address || !seller.zip) {
            throw new functions.https.HttpsError('failed-precondition', 'Seller address is missing.');
        }

        const addressFrom = {
            name: item.sellerName,
            street1: seller.address,
            city: seller.city,
            state: seller.state,
            zip: seller.zip,
            country: 'US' 
        };

        const addressTo = {
            name: buyerAddress.name,
            street1: buyerAddress.street1,
            city: buyerAddress.city,
            state: buyerAddress.state,
            zip: buyerAddress.zip,
            country: 'US'
        };

        const parcel = {
            length: item.length || "12",
            width: item.width || "12",
            height: item.height || "12",
            distance_unit: "in",
            weight: item.weight || "2",
            mass_unit: "lb"
        };

        const shipment = await shippo.shipment.create({
            address_from: addressFrom,
            address_to: addressTo,
            parcels: [parcel],
            async: false
        });

        return { rates: shipment.rates };

    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.purchaseShippingLabel = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { rateObjectId, orderId } = data; 
    const appId = process.env.APP_ID || 'seshnx-70c04';

    try {
        const transaction = await shippo.transaction.create({
            rate: rateObjectId,
            label_file_type: "PDF",
            async: false
        });

        if (transaction.status !== "SUCCESS") {
            throw new Error(`Label purchase failed: ${transaction.messages[0]?.text}`);
        }

        await db.doc(`artifacts/${appId}/public/data/orders/${orderId}`).set({
            shippingLabelUrl: transaction.label_url,
            trackingNumber: transaction.tracking_number,
            trackingUrl: transaction.tracking_url_provider,
            carrier: transaction.rate.provider,
            status: 'Ready to Ship'
        }, { merge: true });

        return { success: true, labelUrl: transaction.label_url };

    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * 12. Inbox Fan-Out (Realtime DB Trigger)
 * Listens for new messages and updates the 'conversations' inbox for all recipients.
 * This fixes the PERMISSION_DENIED error by doing the update server-side.
 */
exports.fanOutInboxUpdates = functions.database
    .ref('/messages/{chatId}/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message = snapshot.val();
        const { chatId } = context.params;
        
        let recipientIds = [];
        const chatMetaSnap = await admin.database().ref(`chats/${chatId}`).once('value');
        
        if (chatMetaSnap.exists()) {
            // Group Chat: Get all members except sender
            const members = chatMetaSnap.val().members || {};
            recipientIds = Object.keys(members).filter(uid => uid !== message.s);
        } else {
            // Direct Chat: Parse ID (uid1_uid2)
            const parts = chatId.split('_');
            recipientIds = parts.filter(uid => uid !== message.s);
        }

        if (recipientIds.length === 0) return null;

        const updates = {};
        const preview = message.media 
            ? `[${message.media.type}] ${message.b || ''}` 
            : message.b.substring(0, 100);

        recipientIds.forEach(uid => {
            const convoPath = `conversations/${uid}/${chatId}`;
            updates[`${convoPath}/lm`] = preview;
            updates[`${convoPath}/lmt`] = admin.database.ServerValue.TIMESTAMP;
            updates[`${convoPath}/uc`] = admin.database.ServerValue.increment(1);
            updates[`${convoPath}/ls`] = message.s;
            
            // Self-healing: Ensure ID exists
            updates[`${convoPath}/id`] = chatId;
        });

        return admin.database().ref().update(updates);
    });

exports.createStripeCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { price, mode, success_url, cancel_url } = data;
    const userId = context.auth.uid;
    const email = context.auth.token.email;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: mode,
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [
                {
                    price: price,
                    quantity: 1,
                },
            ],
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
                userId: userId
            }
        });
        
        return { url: session.url };
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Fetch OpenGraph metadata from a URL for link previews.
 * Called from the frontend to get rich link previews in chat.
 */
exports.getLinkPreview = functions.https.onCall(async (data, context) => {
    const { url } = data;

    if (!url) {
        throw new functions.https.HttpsError('invalid-argument', 'URL is required.');
    }

    // Validate URL format
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid URL format.');
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid URL protocol.');
    }

    return new Promise((resolve, reject) => {
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const requestOptions = {
            method: 'GET',
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SeshNx LinkBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml'
            }
        };

        const req = protocol.get(parsedUrl.href, requestOptions, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                protocol.get(res.headers.location, requestOptions, handleResponse);
                return;
            }

            handleResponse(res);
        });

        function handleResponse(res) {
            let html = '';
            res.setEncoding('utf8');
            
            res.on('data', (chunk) => {
                html += chunk;
                // Limit to first 50KB to avoid memory issues
                if (html.length > 50000) {
                    res.destroy();
                }
            });

            res.on('end', () => {
                try {
                    const result = parseOpenGraphTags(html, url);
                    resolve(result);
                } catch (e) {
                    resolve({
                        url: url,
                        title: extractDomain(url),
                        description: null,
                        image: null
                    });
                }
            });
        }

        req.on('error', (e) => {
            // Return basic fallback on error
            resolve({
                url: url,
                title: extractDomain(url),
                description: null,
                image: null
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                url: url,
                title: extractDomain(url),
                description: null,
                image: null
            });
        });
    });
});

/**
 * Parse OpenGraph and standard meta tags from HTML
 */
function parseOpenGraphTags(html, originalUrl) {
    const result = {
        url: originalUrl,
        title: null,
        description: null,
        image: null,
        siteName: null
    };

    // Extract OG tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);

    // Fallback to standard meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

    // Twitter card fallback
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

    // Apply values with priority
    result.title = ogTitleMatch?.[1] || titleMatch?.[1] || extractDomain(originalUrl);
    result.description = ogDescMatch?.[1] || descMatch?.[1] || null;
    result.image = ogImageMatch?.[1] || twitterImageMatch?.[1] || null;
    result.siteName = ogSiteMatch?.[1] || null;

    // Decode HTML entities
    result.title = decodeHTMLEntities(result.title);
    if (result.description) result.description = decodeHTMLEntities(result.description);

    // Make relative image URLs absolute
    if (result.image && !result.image.startsWith('http')) {
        try {
            const urlObj = new URL(originalUrl);
            result.image = result.image.startsWith('/') 
                ? `${urlObj.protocol}//${urlObj.host}${result.image}`
                : `${urlObj.protocol}//${urlObj.host}/${result.image}`;
        } catch (e) {
            result.image = null;
        }
    }

    return result;
}

function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return url;
    }
}

function decodeHTMLEntities(text) {
    if (!text) return text;
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&nbsp;/g, ' ');
}
