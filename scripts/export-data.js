/**
 * Export Data from Neon and MongoDB
 * Run this before Convex migration
 */

const { neon } = require('@neondatabase/serverless');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const NEON_URL = process.env.VITE_NEON_DATABASE_URL;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'sesh-nx';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// =====================================================
// NEON EXPORT FUNCTIONS
// =====================================================

/**
 * Export users from Neon
 * Merges clerk_users and profiles tables
 */
async function exportUsersFromNeon() {
  console.log('📥 Exporting users from Neon...');

  const sql = neon(NEON_URL);

  // Get clerk users
  const clerkUsers = await sql`
    SELECT
      id,
      email,
      username,
      email_verified,
      created_at,
      updated_at
    FROM clerk_users
    ORDER BY created_at
  `;

  // Get profiles
  const profiles = await sql`
    SELECT
      user_id,
      display_name,
      bio,
      headline,
      photo_url,
      banner_url,
      location,
      website,
      skills,
      genres,
      instruments,
      software,
      account_types,
      active_role,
      school_id,
      student_id,
      staff_id,
      intern_id
    FROM profiles
  `;

  // Merge users and profiles
  const users = clerkUsers.map((user) => {
    const profile = profiles.find((p) => p.user_id === user.id) || {};

    return {
      clerkId: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.email_verified,
      displayName: profile.display_name,
      bio: profile.bio,
      headline: profile.headline,
      avatarUrl: profile.photo_url,
      bannerUrl: profile.banner_url,
      location: profile.location,
      website: profile.website,
      skills: profile.skills || [],
      genres: profile.genres || [],
      instruments: profile.instruments || [],
      software: profile.software || [],
      accountTypes: profile.account_types || [],
      activeRole: profile.active_role,
      subRoles: [],
      schoolId: profile.school_id,
      studentId: profile.student_id,
      staffId: profile.staff_id,
      internId: profile.intern_id,
      createdAt: new Date(user.created_at).getTime(),
      updatedAt: new Date(user.updated_at).getTime(),
    };
  });

  // Write to file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'users.json'),
    JSON.stringify(users, null, 2)
  );

  console.log(`✅ Exported ${users.length} users`);
  return users;
}

/**
 * Export bookings from Neon
 */
async function exportBookingsFromNeon() {
  console.log('📥 Exporting bookings from Neon...');

  const sql = neon(NEON_URL);

  const bookings = await sql`
    SELECT
      id,
      studio_id,
      client_id,
      service_type,
      date,
      time,
      duration,
      status,
      offer_amount,
      message,
      created_at,
      updated_at
    FROM bookings
    ORDER BY created_at
  `;

  const formattedBookings = bookings.map((booking) => ({
    id: booking.id,
    studio_id: booking.studio_id,
    client_id: booking.client_id,
    service_type: booking.service_type,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    status: booking.status,
    offer_amount: booking.offer_amount,
    message: booking.message,
    created_at: new Date(booking.created_at).getTime(),
    updated_at: new Date(booking.updated_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'bookings.json'),
    JSON.stringify(formattedBookings, null, 2)
  );

  console.log(`✅ Exported ${bookings.length} bookings`);
  return bookings;
}

/**
 * Export schools from Neon
 */
async function exportSchoolsFromNeon() {
  console.log('📥 Exporting schools from Neon...');

  const sql = neon(NEON_URL);

  const schools = await sql`
    SELECT
      id,
      name,
      code,
      description,
      logo_url,
      location,
      admin_id,
      is_active,
      created_at,
      updated_at
    FROM schools
    ORDER BY created_at
  `;

  const formattedSchools = schools.map((school) => ({
    id: school.id,
    name: school.name,
    code: school.code,
    description: school.description,
    logo_url: school.logo_url,
    location: school.location,
    admin_id: school.admin_id,
    is_active: school.is_active,
    created_at: new Date(school.created_at).getTime(),
    updated_at: new Date(school.updated_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'schools.json'),
    JSON.stringify(formattedSchools, null, 2)
  );

  console.log(`✅ Exported ${schools.length} schools`);
  return schools;
}

/**
 * Export students from Neon
 */
async function exportStudentsFromNeon() {
  console.log('📥 Exporting students from Neon...');

  const sql = neon(NEON_URL);

  const students = await sql`
    SELECT
      id,
      user_id,
      school_id,
      student_id,
      major,
      year,
      gpa,
      is_active,
      enrolled_at,
      expected_graduation
    FROM students
    ORDER BY enrolled_at
  `;

  const formattedStudents = students.map((student) => ({
    user_id: student.user_id,
    school_id: student.school_id,
    student_id: student.student_id,
    major: student.major,
    year: student.year,
    gpa: student.gpa,
    is_active: student.is_active,
    enrolled_at: new Date(student.enrolled_at).getTime(),
    expected_graduation: student.expected_graduation
      ? new Date(student.expected_graduation).getTime()
      : null,
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'students.json'),
    JSON.stringify(formattedStudents, null, 2)
  );

  console.log(`✅ Exported ${students.length} students`);
  return students;
}

/**
 * Export studios from Neon
 */
async function exportStudiosFromNeon() {
  console.log('📥 Exporting studios from Neon...');

  const sql = neon(NEON_URL);

  const studios = await sql`
    SELECT
      id,
      owner_id,
      name,
      description,
      location,
      photos,
      logo_url,
      hourly_rate,
      currency,
      is_active,
      created_at,
      updated_at
    FROM studios
    ORDER BY created_at
  `;

  const formattedStudios = studios.map((studio) => ({
    id: studio.id,
    owner_id: studio.owner_id,
    name: studio.name,
    description: studio.description,
    location: studio.location,
    photos: studio.photos,
    logo_url: studio.logo_url,
    hourly_rate: studio.hourly_rate,
    currency: studio.currency,
    is_active: studio.is_active,
    created_at: new Date(studio.created_at).getTime(),
    updated_at: new Date(studio.updated_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'studios.json'),
    JSON.stringify(formattedStudios, null, 2)
  );

  console.log(`✅ Exported ${studios.length} studios`);
  return studios;
}

/**
 * Export rooms from Neon
 */
async function exportRoomsFromNeon() {
  console.log('📥 Exporting rooms from Neon...');

  const sql = neon(NEON_URL);

  const rooms = await sql`
    SELECT
      id,
      studio_id,
      name,
      description,
      capacity,
      hourly_rate,
      amenities,
      is_active,
      created_at
    FROM rooms
    ORDER BY created_at
  `;

  const formattedRooms = rooms.map((room) => ({
    id: room.id,
    studio_id: room.studio_id,
    name: room.name,
    description: room.description,
    capacity: room.capacity,
    hourly_rate: room.hourly_rate,
    amenities: room.amenities,
    is_active: room.is_active,
    created_at: new Date(room.created_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'rooms.json'),
    JSON.stringify(formattedRooms, null, 2)
  );

  console.log(`✅ Exported ${rooms.length} rooms`);
  return rooms;
}

/**
 * Export staff from Neon
 */
async function exportStaffFromNeon() {
  console.log('📥 Exporting staff from Neon...');

  const sql = neon(NEON_URL);

  const staff = await sql`
    SELECT
      id,
      user_id,
      school_id,
      staff_id,
      role,
      department,
      title,
      is_active,
      hired_at
    FROM staff
    ORDER BY hired_at
  `;

  const formattedStaff = staff.map((s) => ({
    user_id: s.user_id,
    school_id: s.school_id,
    staff_id: s.staff_id,
    role: s.role,
    department: s.department,
    title: s.title,
    is_active: s.is_active,
    hired_at: new Date(s.hired_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'staff.json'),
    JSON.stringify(formattedStaff, null, 2)
  );

  console.log(`✅ Exported ${staff.length} staff`);
  return staff;
}

/**
 * Export market items from Neon
 */
async function exportMarketItemsFromNeon() {
  console.log('📥 Exporting market items from Neon...');

  const sql = neon(NEON_URL);

  const items = await sql`
    SELECT
      id,
      seller_id,
      title,
      description,
      category,
      price,
      currency,
      condition,
      images,
      location,
      status,
      shipping_available,
      shipping_cost,
      created_at,
      updated_at
    FROM market_items
    ORDER BY created_at
  `;

  const formattedItems = items.map((item) => ({
    id: item.id,
    seller_id: item.seller_id,
    title: item.title,
    description: item.description,
    category: item.category,
    price: item.price,
    currency: item.currency,
    condition: item.condition,
    images: item.images,
    location: item.location,
    status: item.status,
    shipping_available: item.shipping_available,
    shipping_cost: item.shipping_cost,
    created_at: new Date(item.created_at).getTime(),
    updated_at: new Date(item.updated_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'market-items.json'),
    JSON.stringify(formattedItems, null, 2)
  );

  console.log(`✅ Exported ${items.length} market items`);
  return items;
}

/**
 * Export labels from Neon
 */
async function exportLabelsFromNeon() {
  console.log('📥 Exporting labels from Neon...');

  const sql = neon(NEON_URL);

  const labels = await sql`
    SELECT
      id,
      owner_id,
      name,
      description,
      logo_url,
      location,
      website,
      is_active,
      created_at,
      updated_at
    FROM labels
    ORDER BY created_at
  `;

  const formattedLabels = labels.map((label) => ({
    id: label.id,
    owner_id: label.owner_id,
    name: label.name,
    description: label.description,
    logo_url: label.logo_url,
    location: label.location,
    website: label.website,
    is_active: label.is_active,
    created_at: new Date(label.created_at).getTime(),
    updated_at: new Date(label.updated_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'labels.json'),
    JSON.stringify(formattedLabels, null, 2)
  );

  console.log(`✅ Exported ${labels.length} labels`);
  return labels;
}

/**
 * Export label roster from Neon
 */
async function exportLabelRosterFromNeon() {
  console.log('📥 Exporting label roster from Neon...');

  const sql = neon(NEON_URL);

  const roster = await sql`
    SELECT
      label_id,
      artist_id,
      role,
      status,
      contract_start,
      contract_end,
      created_at
    FROM label_roster
    ORDER BY created_at
  `;

  const formattedRoster = roster.map((entry) => ({
    label_id: entry.label_id,
    artist_id: entry.artist_id,
    role: entry.role,
    status: entry.status,
    contract_start: new Date(entry.contract_start).getTime(),
    contract_end: entry.contract_end
      ? new Date(entry.contract_end).getTime()
      : null,
    created_at: new Date(entry.created_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'label-roster.json'),
    JSON.stringify(formattedRoster, null, 2)
  );

  console.log(`✅ Exported ${roster.length} label roster entries`);
  return roster;
}

/**
 * Export notifications from Neon
 */
async function exportNotificationsFromNeon() {
  console.log('📥 Exporting notifications from Neon...');

  const sql = neon(NEON_URL);

  const notifications = await sql`
    SELECT
      id,
      user_id,
      type,
      title,
      message,
      actor_id,
      actor_name,
      actor_photo,
      target_id,
      target_type,
      metadata,
      read,
      read_at,
      created_at
    FROM notifications
    ORDER BY created_at
  `;

  const formattedNotifications = notifications.map((notif) => ({
    id: notif.id,
    user_id: notif.user_id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    actor_id: notif.actor_id,
    actor_name: notif.actor_name,
    actor_photo: notif.actor_photo,
    target_id: notif.target_id,
    target_type: notif.target_type,
    metadata: notif.metadata,
    read: notif.read,
    read_at: notif.read_at ? new Date(notif.read_at).getTime() : null,
    created_at: new Date(notif.created_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'notifications.json'),
    JSON.stringify(formattedNotifications, null, 2)
  );

  console.log(`✅ Exported ${notifications.length} notifications`);
  return notifications;
}

// =====================================================
// MONGODB EXPORT FUNCTIONS
// =====================================================

/**
 * Export posts from MongoDB
 */
async function exportPostsFromMongoDB() {
  console.log('📥 Exporting posts from MongoDB...');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  const posts = await db
    .collection('posts')
    .find({ deleted_at: null })
    .sort({ created_at: -1 })
    .toArray();

  const formattedPosts = posts.map((post) => ({
    id: post.id,
    author_id: post.author_id,
    content: post.content,
    media_urls: post.media_urls,
    media_type: post.media_type,
    hashtags: post.hashtags,
    mentions: post.mentions,
    category: post.category,
    visibility: post.visibility,
    repost_of: post.repost_of,
    parent_id: post.parent_id,
    equipment: post.equipment,
    software: post.software,
    custom_fields: post.custom_fields,
    created_at: new Date(post.created_at).getTime(),
    updated_at: new Date(post.updated_at).getTime(),
    deleted_at: post.deleted_at ? new Date(post.deleted_at).getTime() : null,
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'posts.json'),
    JSON.stringify(formattedPosts, null, 2)
  );

  await client.close();
  console.log(`✅ Exported ${posts.length} posts`);
  return posts;
}

/**
 * Export comments from MongoDB
 */
async function exportCommentsFromMongoDB() {
  console.log('📥 Exporting comments from MongoDB...');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  const comments = await db
    .collection('comments')
    .find({ deleted_at: null })
    .sort({ created_at: -1 })
    .toArray();

  const formattedComments = comments.map((comment) => ({
    id: comment.id,
    post_id: comment.post_id,
    author_id: comment.author_id,
    content: comment.content,
    parent_id: comment.parent_id,
    reaction_count: comment.reaction_count || 0,
    created_at: new Date(comment.created_at).getTime(),
    updated_at: comment.updated_at ? new Date(comment.updated_at).getTime() : null,
    deleted_at: comment.deleted_at ? new Date(comment.deleted_at).getTime() : null,
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'comments.json'),
    JSON.stringify(formattedComments, null, 2)
  );

  await client.close();
  console.log(`✅ Exported ${comments.length} comments`);
  return comments;
}

/**
 * Export reactions from MongoDB
 */
async function exportReactionsFromMongoDB() {
  console.log('📥 Exporting reactions from MongoDB...');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  const reactions = await db
    .collection('reactions')
    .find()
    .toArray();

  const formattedReactions = reactions.map((reaction) => ({
    target_id: reaction.target_id,
    target_type: reaction.target_type,
    emoji: reaction.emoji,
    user_id: reaction.user_id,
    created_at: new Date(reaction.created_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'reactions.json'),
    JSON.stringify(formattedReactions, null, 2)
  );

  await client.close();
  console.log(`✅ Exported ${reactions.length} reactions`);
  return reactions;
}

/**
 * Export follows from MongoDB
 */
async function exportFollowsFromMongoDB() {
  console.log('📥 Exporting follows from MongoDB...');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  const follows = await db
    .collection('follows')
    .find()
    .toArray();

  const formattedFollows = follows.map((follow) => ({
    follower_id: follow.follower_id,
    following_id: follow.following_id,
    created_at: new Date(follow.created_at).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'follows.json'),
    JSON.stringify(formattedFollows, null, 2)
  );

  await client.close();
  console.log(`✅ Exported ${follows.length} follows`);
  return follows;
}

/**
 * Export broadcasts from MongoDB
 */
async function exportBroadcastsFromMongoDB() {
  console.log('📥 Exporting broadcasts from MongoDB...');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  const broadcasts = await db
    .collection('broadcasts')
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  const formattedBroadcasts = broadcasts.map((broadcast) => ({
    _id: broadcast._id.toString(),
    senderId: broadcast.senderId,
    senderName: broadcast.senderName,
    targetId: broadcast.targetId,
    targetName: broadcast.targetName,
    serviceType: broadcast.serviceType,
    offerAmount: broadcast.offerAmount,
    date: broadcast.date,
    requirements: broadcast.requirements,
    location: broadcast.location,
    locationName: broadcast.locationName,
    status: broadcast.status,
    createdAt: new Date(broadcast.createdAt).getTime(),
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'broadcasts.json'),
    JSON.stringify(formattedBroadcasts, null, 2)
  );

  await client.close();
  console.log(`✅ Exported ${broadcasts.length} broadcasts`);
  return broadcasts;
}

// =====================================================
// MAIN EXPORT FUNCTION
// =====================================================

async function exportAllData() {
  console.log('🚀 Starting data export...\n');

  try {
    // Export from Neon
    await exportUsersFromNeon();
    await exportBookingsFromNeon();
    await exportStudiosFromNeon();
    await exportRoomsFromNeon();
    await exportSchoolsFromNeon();
    await exportStudentsFromNeon();
    await exportStaffFromNeon();
    await exportMarketItemsFromNeon();
    await exportLabelsFromNeon();
    await exportLabelRosterFromNeon();
    await exportNotificationsFromNeon();

    // Export from MongoDB
    await exportPostsFromMongoDB();
    await exportCommentsFromMongoDB();
    await exportReactionsFromMongoDB();
    await exportFollowsFromMongoDB();
    await exportBroadcastsFromMongoDB();

    console.log('\n✅ All data exported successfully!');
    console.log(`📁 Data saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run export if called directly
if (require.main === module) {
  exportAllData();
}

module.exports = {
  exportAllData,
  exportUsersFromNeon,
  exportBookingsFromNeon,
  exportStudiosFromNeon,
  exportRoomsFromNeon,
  exportSchoolsFromNeon,
  exportStudentsFromNeon,
  exportStaffFromNeon,
  exportMarketItemsFromNeon,
  exportLabelsFromNeon,
  exportLabelRosterFromNeon,
  exportNotificationsFromNeon,
  exportPostsFromMongoDB,
  exportCommentsFromMongoDB,
  exportReactionsFromMongoDB,
  exportFollowsFromMongoDB,
  exportBroadcastsFromMongoDB,
};
