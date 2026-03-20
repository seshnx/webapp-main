import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// SCHOOLS
// =============================================================================

export const getSchools = query({
  args: {},
  handler: async (ctx) => {
    const schools = await ctx.db
      .query("schools")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return schools;
  },
});

export const getSchoolById = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school || !school.isActive) return null;
    return school;
  },
});

export const getSchoolsByAdmin = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    const schools = await ctx.db
      .query("schools")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return schools;
  },
});

export const searchSchools = query({
  args: {
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let schools = await ctx.db
      .query("schools")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter by search query
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      schools = schools.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.location?.toLowerCase().includes(query)
      );
    }

    // Limit results
    if (args.limit) {
      schools = schools.slice(0, args.limit);
    }

    return schools;
  },
});

export const createSchool = mutation({
  args: {
    adminId: v.id("users"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const schoolId = await ctx.db.insert("schools", {
      name: args.name,
      code: args.code,
      description: args.description,
      location: args.location,
      logoUrl: args.logoUrl,
      adminId: args.adminId,
      staffIds: [args.adminId],
      isActive: true,
      settings: args.settings,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, schoolId };
  },
});

export const updateSchool = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    adminId: v.optional(v.id("users")),
    staffIds: v.optional(v.array(v.id("users"))),
    isActive: v.optional(v.boolean()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { schoolId, ...updates } = args;
    const school = await ctx.db.get(schoolId);

    if (!school) {
      throw new Error("School not found");
    }

    await ctx.db.patch(schoolId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteSchool = mutation({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);

    if (!school) {
      throw new Error("School not found");
    }

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.schoolId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// STUDENTS
// =============================================================================

export const getStudentsBySchool = query({
  args: {
    schoolId: v.id("schools"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const students = await ctx.db
      .query("students")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.limit) {
      return students.slice(0, args.limit);
    }

    return students;
  },
});

export const getStudentByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!student || !student.isActive) return null;
    return student;
  },
});

export const getStudentById = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || !student.isActive) return null;
    return student;
  },
});

export const createStudent = mutation({
  args: {
    userId: v.id("users"),
    schoolId: v.id("schools"),
    studentId: v.string(),
    major: v.optional(v.string()),
    year: v.optional(v.number()),
    gpa: v.optional(v.number()),
    expectedGraduation: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const newStudentId = await ctx.db.insert("students", {
      userId: args.userId,
      schoolId: args.schoolId,
      studentId: args.studentId,
      major: args.major,
      year: args.year,
      gpa: args.gpa,
      expectedGraduation: args.expectedGraduation,
      isActive: true,
      enrolledAt: now,
    });

    return { success: true, studentId: newStudentId };
  },
});

export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    major: v.optional(v.string()),
    year: v.optional(v.number()),
    gpa: v.optional(v.number()),
    expectedGraduation: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;
    const student = await ctx.db.get(studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    await ctx.db.patch(studentId, updates);

    return { success: true };
  },
});

export const deleteStudent = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    // Soft delete
    await ctx.db.patch(args.studentId, {
      isActive: false,
    });

    return { success: true };
  },
});

// =============================================================================
// STAFF
// =============================================================================

export const getStaffBySchool = query({
  args: {
    schoolId: v.id("schools"),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("staff")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId));

    let staff = await q.collect();

    // Filter by role
    if (args.role) {
      staff = staff.filter((s) => s.role === args.role);
    }

    // Filter by department
    if (args.department) {
      staff = staff.filter((s) => s.department === args.department);
    }

    // Filter out inactive
    staff = staff.filter((s) => s.isActive);

    // Sort by hire date
    staff.sort((a, b) => b.hiredAt - a.hiredAt);

    if (args.limit) {
      staff = staff.slice(0, args.limit);
    }

    return staff;
  },
});

export const getStaffByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!staff || !staff.isActive) return null;
    return staff;
  },
});

export const getStaffById = query({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff || !staff.isActive) return null;
    return staff;
  },
});

export const createStaff = mutation({
  args: {
    userId: v.id("users"),
    schoolId: v.id("schools"),
    staffId: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const newStaffId = await ctx.db.insert("staff", {
      userId: args.userId,
      schoolId: args.schoolId,
      staffId: args.staffId,
      role: args.role,
      department: args.department,
      title: args.title,
      isActive: true,
      hiredAt: now,
    });

    return { success: true, staffId: newStaffId };
  },
});

export const updateStaff = mutation({
  args: {
    staffId: v.id("staff"),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    title: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { staffId, ...updates } = args;
    const staff = await ctx.db.get(staffId);

    if (!staff) {
      throw new Error("Staff not found");
    }

    await ctx.db.patch(staffId, updates);

    return { success: true };
  },
});

export const deleteStaff = mutation({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);

    if (!staff) {
      throw new Error("Staff not found");
    }

    // Soft delete
    await ctx.db.patch(args.staffId, {
      isActive: false,
    });

    return { success: true };
  },
});

// =============================================================================
// CLASSES
// =============================================================================

export const getClassesBySchool = query({
  args: {
    schoolId: v.id("schools"),
    instructorId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let classes = await ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    // Filter by instructor if specified
    if (args.instructorId) {
      classes = classes.filter((c) => c.instructorId === args.instructorId);
    }

    // Filter out inactive
    classes = classes.filter((c) => c.isActive);

    if (args.limit) {
      classes = classes.slice(0, args.limit);
    }

    return classes;
  },
});

export const getClassById = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const class_ = await ctx.db.get(args.classId);
    if (!class_ || !class_.isActive) return null;
    return class_;
  },
});

export const getClassesByInstructor = query({
  args: {
    instructorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.limit) {
      return classes.slice(0, args.limit);
    }

    return classes;
  },
});

export const createClass = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    instructorId: v.id("users"),
    schedule: v.optional(v.string()),
    room: v.optional(v.string()),
    credits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const classId = await ctx.db.insert("classes", {
      schoolId: args.schoolId,
      name: args.name,
      code: args.code,
      description: args.description,
      instructorId: args.instructorId,
      schedule: args.schedule,
      room: args.room,
      credits: args.credits,
      isActive: true,
      createdAt: now,
    });

    return { success: true, classId };
  },
});

export const updateClass = mutation({
  args: {
    classId: v.id("classes"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    instructorId: v.optional(v.id("users")),
    schedule: v.optional(v.string()),
    room: v.optional(v.string()),
    credits: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { classId, ...updates } = args;
    const class_ = await ctx.db.get(classId);

    if (!class_) {
      throw new Error("Class not found");
    }

    await ctx.db.patch(classId, updates);

    return { success: true };
  },
});

export const deleteClass = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const class_ = await ctx.db.get(args.classId);

    if (!class_) {
      throw new Error("Class not found");
    }

    // Soft delete
    await ctx.db.patch(args.classId, {
      isActive: false,
    });

    return { success: true };
  },
});

// =============================================================================
// ENROLLMENTS
// =============================================================================

export const getEnrollmentsByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    return enrollments;
  },
});

export const getEnrollmentsByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    return enrollments;
  },
});

export const enrollStudent = mutation({
  args: {
    classId: v.id("classes"),
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if already enrolled
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_class_student", (q) =>
        q.eq("classId", args.classId)
      )
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .first();

    if (existing) {
      throw new Error("Student already enrolled in this class");
    }

    const enrollmentId = await ctx.db.insert("enrollments", {
      classId: args.classId,
      studentId: args.studentId,
      status: "Active",
      enrolledAt: now,
    });

    return { success: true, enrollmentId };
  },
});

export const unenrollStudent = mutation({
  args: {
    classId: v.id("classes"),
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_class_student", (q) =>
        q.eq("classId", args.classId)
      )
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .first();

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    await ctx.db.delete(enrollment._id);

    return { success: true };
  },
});
