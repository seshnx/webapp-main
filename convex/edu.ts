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
      .withIndex("by_name")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return schools;
  },
});

export const getSchoolById = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school || school.deletedAt) return null;
    return school;
  },
});

export const getSchoolsByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const schools = await ctx.db
      .query("schools")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return schools;
  },
});

export const searchSchools = query({
  args: {
    searchQuery: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    schoolType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let schools = await ctx.db
      .query("schools")
      .withIndex("by_name")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Filter by search query
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      schools = schools.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.city?.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (args.city) {
      schools = schools.filter((s) => s.city?.toLowerCase() === args.city?.toLowerCase());
    }
    if (args.state) {
      schools = schools.filter((s) => s.state?.toLowerCase() === args.state?.toLowerCase());
    }

    // Filter by school type
    if (args.schoolType) {
      schools = schools.filter((s) => s.schoolType === args.schoolType);
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
    ownerId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    schoolType: v.string(), // 'conservatory', 'university', 'institute', 'online'
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    accreditation: v.optional(v.string()),
    programsOffered: v.optional(v.array(v.string())),
    facilities: v.optional(v.array(v.string())),
    photos: v.optional(v.array(v.string())),
    logo: v.optional(v.string()),
    enrollmentCapacity: v.optional(v.number()),
    tuitionInfo: v.optional(v.string()),
    financialAidAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const schoolId = await ctx.db.insert("schools", {
      ...args,
      verified: false,
      currentEnrollment: 0,
      averageRating: 0,
      totalReviews: 0,
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
    description: v.optional(v.string()),
    schoolType: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    accreditation: v.optional(v.string()),
    programsOffered: v.optional(v.array(v.string())),
    facilities: v.optional(v.array(v.string())),
    photos: v.optional(v.array(v.string())),
    logo: v.optional(v.string()),
    enrollmentCapacity: v.optional(v.number()),
    tuitionInfo: v.optional(v.string()),
    financialAidAvailable: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
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

    // Soft delete
    await ctx.db.patch(args.schoolId, {
      deletedAt: Date.now(),
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
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("students")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let students = await q.collect();

    // Sort by enrollment date
    students.sort((a, b) => b.enrollmentDate - a.enrollmentDate);

    if (args.limit) {
      students = students.slice(0, args.limit);
    }

    return students;
  },
});

export const getStudentByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!student || student.deletedAt) return null;
    return student;
  },
});

export const getStudentById = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || student.deletedAt) return null;
    return student;
  },
});

export const searchStudents = query({
  args: {
    schoolId: v.id("schools"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const query = args.searchQuery.toLowerCase();
    const filtered = allStudents.filter(
      (s) =>
        s.studentName?.toLowerCase().includes(query) ||
        s.studentEmail?.toLowerCase().includes(query) ||
        s.major?.toLowerCase().includes(query)
    );

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const createStudent = mutation({
  args: {
    schoolId: v.id("schools"),
    userId: v.string(),
    studentName: v.string(),
    studentEmail: v.string(),
    studentPhone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    major: v.optional(v.string()),
    minor: v.optional(v.string()),
    enrollmentDate: v.optional(v.number()),
    expectedGraduationDate: v.optional(v.string()),
    gpa: v.optional(v.number()),
    credits: v.optional(v.number()),
    status: v.optional(v.string()), // 'active', 'inactive', 'graduated', 'suspended'
    photo: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const studentId = await ctx.db.insert("students", {
      ...args,
      status: args.status || "active",
      enrollmentDate: args.enrollmentDate || now,
      createdAt: now,
      updatedAt: now,
    });

    // Update school enrollment count
    const school = await ctx.db.get(args.schoolId);
    if (school) {
      await ctx.db.patch(args.schoolId, {
        currentEnrollment: (school.currentEnrollment || 0) + 1,
      });
    }

    return { success: true, studentId };
  },
});

export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    studentName: v.optional(v.string()),
    studentEmail: v.optional(v.string()),
    studentPhone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    major: v.optional(v.string()),
    minor: v.optional(v.string()),
    expectedGraduationDate: v.optional(v.string()),
    gpa: v.optional(v.number()),
    credits: v.optional(v.number()),
    status: v.optional(v.string()),
    photo: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;
    const student = await ctx.db.get(studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    await ctx.db.patch(studentId, {
      ...updates,
      updatedAt: Date.now(),
    });

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
      deletedAt: Date.now(),
    });

    // Update school enrollment count
    const school = await ctx.db.get(student.schoolId);
    if (school) {
      await ctx.db.patch(student.schoolId, {
        currentEnrollment: Math.max(0, (school.currentEnrollment || 0) - 1),
      });
    }

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
    status: v.optional(v.string()),
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

    // Filter by status
    if (args.status) {
      staff = staff.filter((s) => s.status === args.status);
    }

    // Filter out deleted
    staff = staff.filter((s) => !s.deletedAt);

    // Sort by hire date
    staff.sort((a, b) => b.hireDate - a.hireDate);

    if (args.limit) {
      staff = staff.slice(0, args.limit);
    }

    return staff;
  },
});

export const getStaffByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!staff || staff.deletedAt) return null;
    return staff;
  },
});

export const getStaffById = query({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff || staff.deletedAt) return null;
    return staff;
  },
});

export const searchStaff = query({
  args: {
    schoolId: v.id("schools"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allStaff = await ctx.db
      .query("staff")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const query = args.searchQuery.toLowerCase();
    const filtered = allStaff.filter(
      (s) =>
        s.staffName?.toLowerCase().includes(query) ||
        s.staffEmail?.toLowerCase().includes(query) ||
        s.department?.toLowerCase().includes(query)
    );

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const createStaff = mutation({
  args: {
    schoolId: v.id("schools"),
    userId: v.string(),
    staffName: v.string(),
    staffEmail: v.string(),
    staffPhone: v.optional(v.string()),
    role: v.string(), // 'EDUAdmin', 'EDUStaff', 'Instructor', 'DepartmentHead'
    department: v.optional(v.string()),
    title: v.optional(v.string()),
    hireDate: v.optional(v.number()),
    specialization: v.optional(v.string()),
    bio: v.optional(v.string()),
    officeLocation: v.optional(v.string()),
    officeHours: v.optional(v.string()),
    status: v.optional(v.string()), // 'active', 'inactive', 'onLeave'
    photo: v.optional(v.string()),
    salary: v.optional(v.number()),
    employmentType: v.optional(v.string()), // 'fullTime', 'partTime', 'contract'
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const staffId = await ctx.db.insert("staff", {
      ...args,
      status: args.status || "active",
      hireDate: args.hireDate || now,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, staffId };
  },
});

export const updateStaff = mutation({
  args: {
    staffId: v.id("staff"),
    staffName: v.optional(v.string()),
    staffEmail: v.optional(v.string()),
    staffPhone: v.optional(v.string()),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    title: v.optional(v.string()),
    specialization: v.optional(v.string()),
    bio: v.optional(v.string()),
    officeLocation: v.optional(v.string()),
    officeHours: v.optional(v.string()),
    status: v.optional(v.string()),
    photo: v.optional(v.string()),
    salary: v.optional(v.number()),
    employmentType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { staffId, ...updates } = args;
    const staff = await ctx.db.get(staffId);

    if (!staff) {
      throw new Error("Staff not found");
    }

    await ctx.db.patch(staffId, {
      ...updates,
      updatedAt: Date.now(),
    });

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
      deletedAt: Date.now(),
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
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let classes = await q.collect();

    // Sort by start date
    classes.sort((a, b) => a.startDate - b.startDate);

    if (args.limit) {
      classes = classes.slice(0, args.limit);
    }

    return classes;
  },
});

export const getClassesByInstructor = query({
  args: {
    instructorId: v.id("staff"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("classes")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    const classes = await q.collect();

    return classes;
  },
});

export const getClassById = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const class_ = await ctx.db.get(args.classId);
    if (!class_ || class_.deletedAt) return null;
    return class_;
  },
});

export const searchClasses = query({
  args: {
    schoolId: v.id("schools"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allClasses = await ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const query = args.searchQuery.toLowerCase();
    const filtered = allClasses.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.subject?.toLowerCase().includes(query)
    );

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const createClass = mutation({
  args: {
    schoolId: v.id("schools"),
    instructorId: v.id("staff"),
    name: v.string(),
    code: v.optional(v.string()), // e.g., "MUS101"
    description: v.optional(v.string()),
    subject: v.optional(v.string()),
    level: v.optional(v.string()), // 'beginner', 'intermediate', 'advanced'
    credits: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
    schedule: v.optional(v.string()), // e.g., "Mon, Wed 10:00-11:30"
    room: v.optional(v.string()),
    capacity: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),
    syllabus: v.optional(v.string()),
    materials: v.optional(v.array(v.string())),
    status: v.optional(v.string()), // 'scheduled', 'active', 'completed', 'cancelled'
    photo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const classId = await ctx.db.insert("classes", {
      ...args,
      status: args.status || "scheduled",
      enrollmentCount: 0,
      createdAt: now,
      updatedAt: now,
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
    subject: v.optional(v.string()),
    level: v.optional(v.string()),
    credits: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    schedule: v.optional(v.string()),
    room: v.optional(v.string()),
    capacity: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),
    syllabus: v.optional(v.string()),
    materials: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    photo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { classId, ...updates } = args;
    const class_ = await ctx.db.get(classId);

    if (!class_) {
      throw new Error("Class not found");
    }

    await ctx.db.patch(classId, {
      ...updates,
      updatedAt: Date.now(),
    });

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
      deletedAt: Date.now(),
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
  args: {
    studentId: v.id("students"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    const enrollments = await q.collect();

    return enrollments;
  },
});

export const getEnrollment = query({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .first();

    return enrollment;
  },
});

export const enrollStudent = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    enrollmentDate: v.optional(v.number()),
    status: v.optional(v.string()), // 'enrolled', 'dropped', 'completed', 'failed'
  },
  handler: async (ctx, args) => {
    // Check if already enrolled
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .first();

    if (existing) {
      throw new Error("Student is already enrolled in this class");
    }

    // Check class capacity
    const class_ = await ctx.db.get(args.classId);
    if (class_ && class_.capacity) {
      const currentEnrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_class", (q) => q.eq("classId", args.classId))
        .filter((q) => q.neq(q.field("status"), "dropped"))
        .collect();

      if (currentEnrollments.length >= class_.capacity) {
        throw new Error("Class is at full capacity");
      }
    }

    const now = Date.now();

    const enrollmentId = await ctx.db.insert("enrollments", {
      ...args,
      enrollmentDate: args.enrollmentDate || now,
      status: args.status || "enrolled",
      createdAt: now,
      updatedAt: now,
    });

    // Update class enrollment count
    if (class_) {
      await ctx.db.patch(args.classId, {
        enrollmentCount: (class_.enrollmentCount || 0) + 1,
      });
    }

    return { success: true, enrollmentId };
  },
});

export const dropStudent = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    reason: v.optional(v.string()),
    dropDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .first();

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const now = Date.now();

    await ctx.db.patch(enrollment._id, {
      status: "dropped",
      dropReason: args.reason,
      dropDate: args.dropDate || now,
      updatedAt: now,
    });

    // Update class enrollment count
    const class_ = await ctx.db.get(args.classId);
    if (class_ && class_.enrollmentCount > 0) {
      await ctx.db.patch(args.classId, {
        enrollmentCount: class_.enrollmentCount - 1,
      });
    }

    return { success: true };
  },
});

export const updateEnrollmentStatus = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    status: v.string(),
    grade: v.optional(v.string()),
    creditsEarned: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { enrollmentId, status, grade, creditsEarned } = args;

    const enrollment = await ctx.db.get(enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const updates: any = {
      status,
      updatedAt: Date.now(),
    };

    if (grade !== undefined) {
      updates.grade = grade;
    }

    if (creditsEarned !== undefined) {
      updates.creditsEarned = creditsEarned;
    }

    await ctx.db.patch(enrollmentId, updates);

    return { success: true };
  },
});

export const addGrade = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    grade: v.string(), // 'A', 'B', 'C', 'D', 'F', or Pass/Fail
    creditsEarned: v.optional(v.number()),
    gradedBy: v.optional(v.id("staff")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const class_ = await ctx.db.get(enrollment.classId);
    const credits = args.creditsEarned || (class_?.credits || 3);

    await ctx.db.patch(args.enrollmentId, {
      grade: args.grade,
      creditsEarned: credits,
      gradedBy: args.gradedBy,
      gradeNotes: args.notes,
      gradedAt: Date.now(),
      status: "completed",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// INTERNSHIPS
// =============================================================================

export const getInternshipsBySchool = query({
  args: {
    schoolId: v.id("schools"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("internships")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let internships = await q.collect();

    // Sort by start date
    internships.sort((a, b) => a.startDate - b.startDate);

    if (args.limit) {
      internships = internships.slice(0, args.limit);
    }

    return internships;
  },
});

export const getInternshipsByStudent = query({
  args: {
    studentId: v.id("students"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("internships")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    const internships = await q.collect();

    return internships;
  },
});

export const getInternshipById = query({
  args: { internshipId: v.id("internships") },
  handler: async (ctx, args) => {
    const internship = await ctx.db.get(args.internshipId);
    if (!internship || internship.deletedAt) return null;
    return internship;
  },
});

export const createInternship = mutation({
  args: {
    schoolId: v.id("schools"),
    studentId: v.id("students"),
    title: v.string(),
    companyName: v.string(),
    companyAddress: v.optional(v.string()),
    supervisorName: v.string(),
    supervisorEmail: v.string(),
    supervisorPhone: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    hoursPerWeek: v.optional(v.number()),
    totalHours: v.optional(v.number()),
    description: v.optional(v.string()),
    responsibilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()), // 'pending', 'active', 'completed', 'terminated'
    isPaid: v.optional(v.boolean()),
    stipend: v.optional(v.number()),
    credits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const internshipId = await ctx.db.insert("internships", {
      ...args,
      status: args.status || "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, internshipId };
  },
});

export const updateInternship = mutation({
  args: {
    internshipId: v.id("internships"),
    title: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companyAddress: v.optional(v.string()),
    supervisorName: v.optional(v.string()),
    supervisorEmail: v.optional(v.string()),
    supervisorPhone: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    hoursPerWeek: v.optional(v.number()),
    totalHours: v.optional(v.number()),
    description: v.optional(v.string()),
    responsibilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    isPaid: v.optional(v.boolean()),
    stipend: v.optional(v.number()),
    credits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { internshipId, ...updates } = args;
    const internship = await ctx.db.get(internshipId);

    if (!internship) {
      throw new Error("Internship not found");
    }

    await ctx.db.patch(internshipId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const startInternship = mutation({
  args: {
    internshipId: v.id("internships"),
    supervisorId: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    const internship = await ctx.db.get(args.internshipId);

    if (!internship) {
      throw new Error("Internship not found");
    }

    await ctx.db.patch(args.internshipId, {
      status: "active",
      supervisorId: args.supervisorId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const completeInternship = mutation({
  args: {
    internshipId: v.id("internships"),
    finalGrade: v.optional(v.string()),
    creditsEarned: v.optional(v.number()),
    evaluation: v.optional(v.string()),
    completedDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const internship = await ctx.db.get(args.internshipId);

    if (!internship) {
      throw new Error("Internship not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.internshipId, {
      status: "completed",
      finalGrade: args.finalGrade,
      creditsEarned: args.creditsEarned || internship.credits,
      evaluation: args.evaluation,
      completedDate: args.completedDate || now,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const deleteInternship = mutation({
  args: { internshipId: v.id("internships") },
  handler: async (ctx, args) => {
    const internship = await ctx.db.get(args.internshipId);

    if (!internship) {
      throw new Error("Internship not found");
    }

    // Soft delete
    await ctx.db.patch(args.internshipId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});
