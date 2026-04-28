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

export const getStudentByUserAndSchool = query({
  args: { userId: v.id("users"), schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
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

export const getStaffByUserAndSchool = query({
  args: { userId: v.id("users"), schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
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

export const addStaffByEmail = mutation({
  args: {
    schoolId: v.id("schools"),
    email: v.string(),
    roleId: v.id("schoolRoles"),
    roleName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Find User by Email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("User not found. They must sign up for SeshNx first.");
    }

    // 2. Check if already staff in this school
    const existingStaff = await ctx.db
      .query("staff")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (existingStaff && existingStaff.isActive) {
      throw new Error("User is already a staff member in this school.");
    }

    // 3. Create or update staff entry
    const timestamp = Date.now();
    if (existingStaff) {
      await ctx.db.patch(existingStaff._id, {
        roleId: args.roleId,
        roleName: args.roleName,
        isActive: true,
        updatedAt: timestamp,
      });
    } else {
      await ctx.db.insert("staff", {
        schoolId: args.schoolId,
        userId: user._id,
        email: args.email,
        name: `${user.firstName} ${user.lastName}`,
        roleId: args.roleId,
        roleName: args.roleName,
        isActive: true,
        addedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // 4. Update user profile
    const currentTypes = user.accountTypes || [];
    if (!currentTypes.includes("EDUStaff")) {
      await ctx.db.patch(user._id, {
        accountTypes: [...currentTypes, "EDUStaff"],
        schoolId: args.schoolId,
      });
    }

    return { success: true };
  },
});

export const removeStaff = mutation({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.staffId, {
      isActive: false,
      updatedAt: Date.now(),
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
// =============================================================================
// EVALUATIONS
// =============================================================================

export const getEvaluationsByStudent = query({
  args: { studentId: v.id("users"), schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("evaluations")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("schoolId"), args.schoolId))
      .order("desc")
      .collect();
  },
});

export const createEvaluation = mutation({
  args: {
    studentId: v.id("users"),
    schoolId: v.id("schools"),
    technical: v.number(),
    softSkills: v.number(),
    notes: v.optional(v.string()),
    evaluator: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const evaluationId = await ctx.db.insert("evaluations", {
      studentId: args.studentId,
      schoolId: args.schoolId,
      technical: args.technical,
      softSkills: args.softSkills,
      notes: args.notes,
      evaluator: args.evaluator,
      date: timestamp,
      createdAt: timestamp,
    });
    return evaluationId;
  },
});

// =============================================================================
// RESOURCE RULES
// =============================================================================

export const getResourceRulesBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resourceRules")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();
  },
});

export const createResourceRule = mutation({
  args: {
    schoolId: v.id("schools"),
    resource: v.string(),
    limit: v.number(),
    unit: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const ruleId = await ctx.db.insert("resourceRules", {
      schoolId: args.schoolId,
      resource: args.resource,
      limit: args.limit,
      unit: args.unit,
      role: args.role,
      createdAt: Date.now(),
    });
    return ruleId;
  },
});

export const deleteResourceRule = mutation({
  args: { ruleId: v.id("resourceRules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.ruleId);
    return { success: true };
  },
});

export const batchCreateStudents = mutation({
  args: {
    schoolId: v.id("schools"),
    students: v.array(v.object({
      email: v.string(),
      name: v.string(),
      cohort: v.optional(v.string()),
      studentId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let count = 0;

    for (const s of args.students) {
      // Find user by email
      let user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", s.email))
        .first();

      let userId;
      if (!user) {
        // Create a skeleton user
        userId = await ctx.db.insert("users", {
          email: s.email,
          name: s.name,
          role: "student",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        } as any);
      } else {
        userId = user._id;
      }

      // Add to students table
      await ctx.db.insert("students", {
        userId,
        schoolId: args.schoolId,
        studentId: s.studentId || `S-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        isActive: true,
        enrolledAt: now,
      });
      count++;
    }

    return { success: true, count };
  },
});

// =============================================================================
// INTERNSHIP LOGS
// =============================================================================

export const getEduOverviewStats = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    // 1. Student Count
    const students = await ctx.db
      .query("students")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();
    
    const studentCount = students.length;
    const activeInterns = students.filter(s => s.isActive).length;

    // 2. Pending Logs
    const pendingLogs = await ctx.db
      .query("internshipLogs")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("status"), "pending_approval"))
      .collect();

    // 3. Recent Activity
    const activity = await ctx.db
      .query("auditLogs")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .order("desc")
      .take(5);

    return {
      studentCount,
      activeInterns,
      pendingLogsCount: pendingLogs.length,
      recentActivity: activity
    };
  },
});

export const getInternshipLogsBySchool = query({
  args: { schoolId: v.id("schools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("internshipLogs")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .order("desc")
      .take(args.limit || 100);
  },
});

export const updateInternshipLogStatus = mutation({
  args: {
    logId: v.id("internshipLogs"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// =============================================================================
// LEARNING PATHS
// =============================================================================

export const getLearningPathsBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learningPaths")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();
  },
});

export const createLearningPath = mutation({
  args: {
    schoolId: v.id("schools"),
    title: v.string(),
    description: v.optional(v.string()),
    courses: v.optional(v.array(v.string())),
    badges: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    mentorshipEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const pathId = await ctx.db.insert("learningPaths", {
      ...args,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return pathId;
  },
});

export const updateLearningPath = mutation({
  args: {
    pathId: v.id("learningPaths"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    courses: v.optional(v.array(v.string())),
    badges: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    mentorshipEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { pathId, ...updates } = args;
    await ctx.db.patch(pathId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const deleteLearningPath = mutation({
  args: { pathId: v.id("learningPaths") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.pathId);
    return { success: true };
  },
});

export const getCoursesBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();
  },
});

// =============================================================================
// LESSONS
// =============================================================================

export const getLessonsByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .order("asc")
      .collect();
  },
});

export const createLesson = mutation({
  args: {
    classId: v.id("classes"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    content: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const lessonId = await ctx.db.insert("lessons", {
      ...args,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return lessonId;
  },
});

export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    content: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { lessonId, ...updates } = args;
    await ctx.db.patch(lessonId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.lessonId);
    return { success: true };
  },
});

// =============================================================================
// SCHOOL ROLES
// =============================================================================

export const getSchoolRolesBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schoolRoles")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();
  },
});

export const createSchoolRole = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.string(),
    color: v.optional(v.string()),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const roleId = await ctx.db.insert("schoolRoles", {
      ...args,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return roleId;
  },
});

export const updateSchoolRolePermissions = mutation({
  args: {
    roleId: v.id("schoolRoles"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roleId, {
      permissions: args.permissions,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const deleteSchoolRole = mutation({
  args: { roleId: v.id("schoolRoles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.roleId);
    return { success: true };
  },
});

// =============================================================================
// AUDIT LOGS
// =============================================================================

export const getAuditLogsBySchool = query({
  args: { schoolId: v.id("schools"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .order("desc")
      .take(args.limit || 50);
  },
});

export const createAuditLog = mutation({
  args: {
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    changes: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    await ctx.db.insert("auditLog", {
      userId: args.userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      changes: args.changes,
      timestamp,
    });
  },
});
