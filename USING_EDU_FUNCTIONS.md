# Using Convex EDU Functions in React Components

Examples of how to use schools, students, staff, classes, enrollments, and internships features.

---

## 1. School Search and Listing

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function SchoolSearch() {
  const [searchParams, setSearchParams] = useState({
    searchQuery: '',
    city: '',
    state: '',
    schoolType: '',
  });

  const schools = useQuery(api.edu.searchSchools, {
    ...searchParams,
    limit: 20,
  });

  return (
    <div className="school-search">
      {/* Search Filters */}
      <input
        type="text"
        placeholder="Search schools..."
        value={searchParams.searchQuery}
        onChange={(e) => setSearchParams({
          ...searchParams,
          searchQuery: e.target.value
        })}
      />

      <input
        type="text"
        placeholder="City"
        value={searchParams.city}
        onChange={(e) => setSearchParams({
          ...searchParams,
          city: e.target.value
        })}
      />

      <select
        value={searchParams.schoolType}
        onChange={(e) => setSearchParams({
          ...searchParams,
          schoolType: e.target.value
        })}
      >
        <option value="">All Types</option>
        <option value="conservatory">Conservatory</option>
        <option value="university">University</option>
        <option value="institute">Institute</option>
        <option value="online">Online</option>
      </select>

      {/* Results */}
      <div className="schools-grid">
        {schools?.map((school) => (
          <SchoolCard key={school._id} school={school} />
        ))}
      </div>
    </div>
  );
}

function SchoolCard({ school }: { school: any }) {
  return (
    <div className="school-card">
      {school.logo && (
        <img src={school.logo} alt={school.name} className="school-logo" />
      )}

      <h3>{school.name}</h3>
      <p>{school.description}</p>

      <div className="location">
        <span>{school.city}, {school.state}</span>
      </div>

      <div className="school-type">
        <span className="type-badge">{school.schoolType}</span>
      </div>

      {school.programsOffered && school.programsOffered.length > 0 && (
        <div className="programs">
          <strong>Programs:</strong>
          {school.programsOffered.slice(0, 3).map((program) => (
            <span key={program} className="program-tag">
              {program}
            </span>
          ))}
        </div>
      )}

      {school.financialAidAvailable && (
        <span className="financial-aid-badge">✓ Financial Aid Available</span>
      )}

      <button onClick={() => {/* Navigate to school details */}}>
        View Details
      </button>
    </div>
  );
}
```

---

## 2. School Details Dashboard

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

function SchoolDashboard({ schoolId }: { schoolId: Id<"schools"> }) {
  const school = useQuery(api.edu.getSchoolById, { schoolId });
  const students = useQuery(api.edu.getStudentsBySchool, {
    schoolId,
    status: 'active',
    limit: 100,
  });
  const staff = useQuery(api.edu.getStaffBySchool, {
    schoolId,
    status: 'active',
    limit: 100,
  });
  const classes = useQuery(api.edu.getClassesBySchool, {
    schoolId,
    status: 'active',
  });

  if (school === undefined) return <div>Loading...</div>;
  if (school === null) return <div>School not found</div>;

  return (
    <div className="school-dashboard">
      {/* Header */}
      <div className="school-header">
        {school.logo && <img src={school.logo} alt={school.name} />}
        <div>
          <h1>{school.name}</h1>
          <p>{school.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{school.currentEnrollment || 0}</h3>
          <p>Students Enrolled</p>
        </div>
        <div className="stat-card">
          <h3>{staff?.length || 0}</h3>
          <p>Staff Members</p>
        </div>
        <div className="stat-card">
          <h3>{classes?.length || 0}</h3>
          <p>Active Classes</p>
        </div>
        <div className="stat-card">
          <h3>{school.averageRating.toFixed(1)}</h3>
          <p>Average Rating</p>
        </div>
      </div>

      {/* Info */}
      <div className="school-info">
        <div className="info-section">
          <h3>Contact Information</h3>
          <p><strong>Address:</strong> {school.address}, {school.city}, {school.state} {school.zipCode}</p>
          {school.phone && <p><strong>Phone:</strong> {school.phone}</p>}
          {school.email && <p><strong>Email:</strong> {school.email}</p>}
          {school.website && <p><strong>Website:</strong> <a href={school.website}>{school.website}</a></p>}
        </div>

        {school.programsOffered && (
          <div className="info-section">
            <h3>Programs Offered</h3>
            <ul>
              {school.programsOffered.map((program) => (
                <li key={program}>{program}</li>
              ))}
            </ul>
          </div>
        )}

        {school.facilities && (
          <div className="info-section">
            <h3>Facilities</h3>
            <ul>
              {school.facilities.map((facility) => (
                <li key={facility}>{facility}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Student Enrollment

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function StudentEnrollment({ schoolId, userId }: {
  schoolId: Id<"schools">;
  userId: string;
}) {
  const [status, setStatus] = useState<'loading' | 'enrolled' | 'not-enrolled'>('loading');
  const [formData, setFormData] = useState({
    major: '',
    minor: '',
    expectedGraduation: '',
  });

  // Check if student exists
  const student = useQuery(api.edu.getStudentByUserId, { userId });
  const createStudent = useMutation(api.edu.createStudent);
  const updateStudent = useMutation(api.edu.updateStudent);

  // Get available classes
  const classes = useQuery(api.edu.getClassesBySchool, {
    schoolId,
    status: 'scheduled',
  });

  // Get student's enrollments
  const enrollments = useQuery(api.edu.getEnrollmentsByStudent, {
    studentId: student?._id!,
    status: 'enrolled',
  });

  const handleEnrollAsStudent = async () => {
    try {
      // Get user profile data
      const user = await getCurrentUser(); // Your auth function

      await createStudent({
        schoolId,
        userId,
        studentName: `${user.firstName} ${user.lastName}`,
        studentEmail: user.email,
        major: formData.major || undefined,
        minor: formData.minor || undefined,
        expectedGraduationDate: formData.expectedGraduation || undefined,
      });

      setStatus('enrolled');
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll as student');
    }
  };

  if (student === undefined) return <div>Loading...</div>;

  return (
    <div className="enrollment-page">
      {student ? (
        <StudentDashboard student={student} classes={classes} enrollments={enrollments} />
      ) : (
        <div className="enrollment-form">
          <h2>Enroll as Student</h2>

          <div className="form-group">
            <label>Major</label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="e.g., Music Performance"
            />
          </div>

          <div className="form-group">
            <label>Minor (Optional)</label>
            <input
              type="text"
              value={formData.minor}
              onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
              placeholder="e.g., Music Production"
            />
          </div>

          <div className="form-group">
            <label>Expected Graduation Date</label>
            <input
              type="date"
              value={formData.expectedGraduation}
              onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
            />
          </div>

          <button onClick={handleEnrollAsStudent}>
            Enroll Now
          </button>
        </div>
      )}
    </div>
  );
}

function StudentDashboard({ student, classes, enrollments }: {
  student: any;
  classes: any[];
  enrollments: any[];
}) {
  const enrollStudent = useMutation(api.edu.enrollStudent);
  const dropStudent = useMutation(api.edu.dropStudent);

  const handleEnroll = async (classId: Id<"classes">) => {
    try {
      await enrollStudent({
        studentId: student._id,
        classId,
      });
      alert('Successfully enrolled!');
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert(error.message);
    }
  };

  const handleDrop = async (classId: Id<"classes">) => {
    try {
      await dropStudent({
        studentId: student._id,
        classId,
        reason: 'Student request',
      });
      alert('Successfully dropped class');
    } catch (error) {
      console.error('Drop failed:', error);
      alert('Failed to drop class');
    }
  };

  const enrolledClassIds = new Set(enrollments?.map((e) => e.classId.toString()));

  return (
    <div className="student-dashboard">
      <div className="student-header">
        <h1>Welcome, {student.studentName}!</h1>
        <div className="student-info">
          <p><strong>Major:</strong> {student.major || 'Not declared'}</p>
          {student.minor && <p><strong>Minor:</strong> {student.minor}</p>}
          <p><strong>GPA:</strong> {student.gpa?.toFixed(2) || 'N/A'}</p>
          <p><strong>Credits:</strong> {student.credits || 0}</p>
        </div>
      </div>

      <div className="two-column">
        {/* Available Classes */}
        <div className="section">
          <h2>Available Classes</h2>
          <div className="classes-list">
            {classes?.filter((c) => !enrolledClassIds.has(c._id.toString())).map((class_) => (
              <ClassCard
                key={class_._id}
                class={class_}
                onEnroll={() => handleEnroll(class_._id)}
                actionLabel="Enroll"
              />
            ))}
          </div>
        </div>

        {/* Current Enrollments */}
        <div className="section">
          <h2>My Classes</h2>
          <div className="classes-list">
            {enrollments?.map((enrollment) => {
              const class_ = classes?.find((c) => c._id === enrollment.classId);
              if (!class_) return null;
              return (
                <ClassCard
                  key={enrollment._id}
                  class={class_}
                  onDrop={() => handleDrop(class_._id)}
                  actionLabel="Drop"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassCard({ class_, onEnroll, onDrop, actionLabel }: {
  class_: any;
  onEnroll?: () => void;
  onDrop?: () => void;
  actionLabel: string;
}) {
  return (
    <div className="class-card">
      <h3>{class_.name}</h3>
      {class_.code && <p className="code">{class_.code}</p>}
      <p>{class_.description}</p>

      <div className="class-details">
        <span><strong>Subject:</strong> {class_.subject}</span>
        <span><strong>Level:</strong> {class_.level}</span>
        <span><strong>Credits:</strong> {class_.credits}</span>
        <span><strong>Instructor:</strong> TBD</span>
        <span><strong>Schedule:</strong> {class_.schedule}</span>
        {class_.room && <span><strong>Room:</strong> {class_.room}</span>}
        <span><strong>Capacity:</strong> {class_.enrollmentCount || 0}/{class_.capacity}</span>
      </div>

      {onEnroll && <button onClick={onEnroll}>{actionLabel}</button>}
      {onDrop && <button onClick={onDrop} className="drop-btn">{actionLabel}</button>}
    </div>
  );
}
```

---

## 4. Instructor Dashboard

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

function InstructorDashboard({ staffId }: { staffId: Id<"staff"> }) {
  const staff = useQuery(api.edu.getStaffById, { staffId });
  const classes = useQuery(api.edu.getClassesByInstructor, {
    instructorId: staffId,
    status: 'active',
  });

  if (staff === undefined) return <div>Loading...</div>;
  if (staff === null) return <div>Instructor not found</div>;

  return (
    <div className="instructor-dashboard">
      <div className="header">
        <h1>Welcome, {staff.staffName}!</h1>
        <p>{staff.title || 'Instructor'}</p>
        {staff.department && <p><strong>Department:</strong> {staff.department}</p>}
      </div>

      <div className="my-classes">
        <h2>My Classes</h2>
        {classes?.map((class_) => (
          <InstructorClassCard key={class_._id} class={class_} />
        ))}
      </div>
    </div>
  );
}

function InstructorClassCard({ class_ }: { class_: any }) {
  const enrollments = useQuery(api.edu.getEnrollmentsByClass, {
    classId: class_._id,
  });

  const addGrade = useMutation(api.edu.addGrade);

  const handleGrade = async (enrollmentId: Id<"enrollments">, grade: string) => {
    try {
      await addGrade({
        enrollmentId,
        grade,
        creditsEarned: class_.credits,
      });
      alert('Grade submitted!');
    } catch (error) {
      console.error('Grade submission failed:', error);
      alert('Failed to submit grade');
    }
  };

  return (
    <div className="class-card expanded">
      <h3>{class_.name}</h3>
      <p>{class_.code}</p>
      <p><strong>Students:</strong> {enrollments?.length || 0}</p>

      <div className="roster">
        <h4>Class Roster</h4>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {enrollments?.map((enrollment) => (
              <tr key={enrollment._id}>
                <td>{enrollment.studentName}</td>
                <td>{enrollment.studentEmail}</td>
                <td>
                  <span className={`status-badge ${enrollment.status}`}>
                    {enrollment.status}
                  </span>
                </td>
                <td>{enrollment.grade || '-'}</td>
                <td>
                  {enrollment.status === 'enrolled' && !enrollment.grade && (
                    <GradeDropdown
                      onSelect={(grade) => handleGrade(enrollment._id, grade)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GradeDropdown({ onSelect }: { onSelect: (grade: string) => void }) {
  const grades = ['A', 'B', 'C', 'D', 'F', 'Pass', 'Fail'];

  return (
    <select onChange={(e) => {
      if (e.target.value) {
        onSelect(e.target.value);
        e.target.value = '';
      }
    }}>
      <option value="">Add Grade...</option>
      {grades.map((grade) => (
        <option key={grade} value={grade}>{grade}</option>
      ))}
    </select>
  );
}
```

---

## 5. Internship Management

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function InternshipManager({ studentId }: { studentId: Id<"students"> }) {
  const internships = useQuery(api.edu.getInternshipsByStudent, {
    studentId,
  });

  const createInternship = useMutation(api.edu.createInternship);
  const startInternship = useMutation(api.edu.startInternship);
  const completeInternship = useMutation(api.edu.completeInternship);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    supervisorName: '',
    supervisorEmail: '',
    startDate: '',
    endDate: '',
    hoursPerWeek: 20,
    isPaid: false,
    stipend: 0,
  });

  const handleCreate = async () => {
    try {
      // Get school ID from student
      // This would come from your student data
      const schoolId = 'SCHOOL_ID';

      await createInternship({
        schoolId,
        studentId,
        ...formData,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
      });

      setShowForm(false);
      setFormData({
        title: '',
        companyName: '',
        supervisorName: '',
        supervisorEmail: '',
        startDate: '',
        endDate: '',
        hoursPerWeek: 20,
        isPaid: false,
        stipend: 0,
      });
    } catch (error) {
      console.error('Creation failed:', error);
      alert('Failed to create internship');
    }
  };

  return (
    <div className="internship-manager">
      <div className="header">
        <h2>My Internships</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Internship'}
        </button>
      </div>

      {showForm && (
        <div className="internship-form">
          <h3>Create Internship</h3>

          <div className="form-group">
            <label>Position Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Supervisor Name</label>
            <input
              type="text"
              value={formData.supervisorName}
              onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Supervisor Email</label>
            <input
              type="email"
              value={formData.supervisorEmail}
              onChange={(e) => setFormData({ ...formData, supervisorEmail: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hours Per Week</label>
              <input
                type="number"
                value={formData.hoursPerWeek}
                onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label>Is Paid?</label>
              <input
                type="checkbox"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              />
            </div>
          </div>

          {formData.isPaid && (
            <div className="form-group">
              <label>Stipend</label>
              <input
                type="number"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: parseInt(e.target.value) })}
              />
            </div>
          )}

          <button onClick={handleCreate}>Create Internship</button>
        </div>
      )}

      <div className="internships-list">
        {internships?.map((internship) => (
          <InternshipCard
            key={internship._id}
            internship={internship}
            onStart={() => startInternship({ internshipId: internship._id })}
            onComplete={(grade, credits) => completeInternship({
              internshipId: internship._id,
              finalGrade: grade,
              creditsEarned: credits,
            })}
          />
        ))}
      </div>
    </div>
  );
}

function InternshipCard({ internship, onStart, onComplete }: {
  internship: any;
  onStart: () => void;
  onComplete: (grade: string, credits: number) => void;
}) {
  const [grade, setGrade] = useState('');
  const [credits, setCredits] = useState(internship.credits || 3);

  return (
    <div className={`internship-card status-${internship.status.toLowerCase()}`}>
      <h3>{internship.title}</h3>
      <p><strong>Company:</strong> {internship.companyName}</p>
      <p><strong>Supervisor:</strong> {internship.supervisorName} ({internship.supervisorEmail})</p>

      <div className="dates">
        <span><strong>Start:</strong> {new Date(internship.startDate).toLocaleDateString()}</span>
        <span><strong>End:</strong> {new Date(internship.endDate).toLocaleDateString()}</span>
      </div>

      <div className="details">
        <span><strong>Hours/Week:</strong> {internship.hoursPerWeek}</span>
        <span><strong>Type:</strong> {internship.isPaid ? `Paid ($${internship.stipend})` : 'Unpaid'}</span>
        <span><strong>Credits:</strong> {internship.credits}</span>
      </div>

      <div className="status">
        <span className={`status-badge ${internship.status}`}>
          {internship.status}
        </span>
      </div>

      <div className="actions">
        {internship.status === 'pending' && (
          <button onClick={onStart}>Start Internship</button>
        )}

        {internship.status === 'active' && (
          <div className="complete-form">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select Grade...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value))}
              placeholder="Credits"
            />
            <button
              onClick={() => grade && onComplete(grade, credits)}
              disabled={!grade}
            >
              Complete
            </button>
          </div>
        )}

        {internship.status === 'completed' && (
          <div className="completion-info">
            <span><strong>Grade:</strong> {internship.finalGrade}</span>
            <span><strong>Credits Earned:</strong> {internship.creditsEarned}</span>
            {internship.evaluation && <p><strong>Evaluation:</strong> {internship.evaluation}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 6. School Admin Dashboard

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

function SchoolAdminDashboard({ schoolId }: { schoolId: Id<"schools"> }) {
  const students = useQuery(api.edu.getStudentsBySchool, { schoolId });
  const staff = useQuery(api.edu.getStaffBySchool, { schoolId });
  const classes = useQuery(api.edu.getClassesBySchool, { schoolId });
  const internships = useQuery(api.edu.getInternshipsBySchool, { schoolId });

  return (
    <div className="admin-dashboard">
      <h1>School Administration</h1>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{students?.length || 0}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>{staff?.length || 0}</h3>
          <p>Total Staff</p>
        </div>
        <div className="stat-card">
          <h3>{classes?.length || 0}</h3>
          <p>Total Classes</p>
        </div>
        <div className="stat-card">
          <h3>{internships?.filter((i) => i.status === 'active').length || 0}</h3>
          <p>Active Internships</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Enrollments</h2>
        <RecentEnrollments schoolId={schoolId} />

        <h2>Pending Internships</h2>
        <PendingInternships schoolId={schoolId} />
      </div>
    </div>
  );
}

function RecentEnrollments({ schoolId }: { schoolId: Id<"schools"> }) {
  const classes = useQuery(api.edu.getClassesBySchool, { schoolId });

  const recentEnrollments = (
    classes
      ?.flatMap((class_) =>
        class_._id
          ? // Would need to fetch enrollments for each class
            []
          : []
      )
      .sort((a, b) => b.enrollmentDate - a.enrollmentDate)
      .slice(0, 10)
  );

  return (
    <div className="recent-list">
      {recentEnrollments?.length === 0 ? (
        <p>No recent enrollments</p>
      ) : (
        recentEnrollments.map((enrollment) => (
          <div key={enrollment._id} className="enrollment-item">
            <span>{enrollment.studentName}</span>
            <span>enrolled in</span>
            <span>{enrollment.className}</span>
            <span>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
          </div>
        ))
      )}
    </div>
  );
}

function PendingInternships({ schoolId }: { schoolId: Id<"schools"> }) {
  const internships = useQuery(api.edu.getInternshipsBySchool, {
    schoolId,
    status: 'pending',
  });

  const startInternship = useMutation(api.edu.startInternship);

  return (
    <div className="pending-list">
      {internships?.length === 0 ? (
        <p>No pending internships</p>
      ) : (
        internships.map((internship) => (
          <div key={internship._id} className="internship-item">
            <span>{internship.studentName}</span>
            <span>{internship.title}</span>
            <span>at {internship.companyName}</span>
            <button
              onClick={() => startInternship({
                internshipId: internship._id,
              })}
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}
```

---

## Common Patterns

### Loading States
```typescript
const student = useQuery(api.edu.getStudentByUserId, { userId });

if (student === undefined) return <div>Loading...</div>;
if (student === null) return <div>Student profile not found</div>;
```

### Error Handling
```typescript
const enrollStudent = useMutation(api.edu.enrollStudent);

const handleEnroll = async () => {
  try {
    await enrollStudent({ studentId, classId });
    alert('Enrolled successfully!');
  } catch (error) {
    console.error('Enrollment failed:', error);
    alert(error.message || 'Failed to enroll');
  }
};
```

### Date Formatting
```typescript
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

---

## Next Steps

1. ✅ EDU functions created
2. ⏳ Use in your components
3. ⏳ Add transcript generation
4. ⏳ Add attendance tracking
5. ⏳ Add assignment/gradebook features

All your education management features are ready to go! 🎓
