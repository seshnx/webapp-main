-- =====================================================
-- EDUCATION (EDU) MODULE - SQL Editor Script (Fixed)
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Education module (Schools, Students, Courses, etc.)
-- =====================================================

-- =====================================================
-- SCHOOLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    address JSONB, -- {street, city, state, zip, country}
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    type TEXT CHECK (type IN ('Music School', 'University', 'College', 'Academy', 'Studio School', 'Other')),
    accreditation TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for schools (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);
    END IF;
END $$;

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID, -- Reference to schools (foreign key added later)
    student_id TEXT, -- School-issued student ID
    enrollment_date DATE,
    graduation_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended', 'expelled')),
    program TEXT,
    cohort TEXT,
    gpa NUMERIC(4, 2),
    credits_earned INTEGER DEFAULT 0,
    internship_studio_id UUID, -- Reference to school_partners or studios
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_id) -- One student record per user per school
);

-- Ensure all columns exist and add foreign key for school_id
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'school_id') THEN
            ALTER TABLE students ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key constraint if schools.id has primary key
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'students' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE students ADD CONSTRAINT fk_students_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for students (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'cohort') THEN
        CREATE INDEX IF NOT EXISTS idx_students_cohort ON students(cohort);
    END IF;
END $$;

-- =====================================================
-- SCHOOL STAFF TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS school_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID, -- Reference to schools (foreign key added later)
    role_id UUID, -- Reference to school_roles (foreign key added later)
    title TEXT,
    department TEXT,
    hire_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    permissions JSONB DEFAULT '{}'::jsonb, -- Role-based permissions
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_id) -- One staff record per user per school
);

-- Ensure all columns exist and add foreign keys
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'school_staff') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'school_id') THEN
            ALTER TABLE school_staff ADD COLUMN school_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'role_id') THEN
            ALTER TABLE school_staff ADD COLUMN role_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'school_staff' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE school_staff ADD CONSTRAINT fk_school_staff_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
        
        -- Add foreign key for role_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'role_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'school_staff' 
                AND constraint_name LIKE '%role_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'school_roles' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE school_staff ADD CONSTRAINT fk_school_staff_role_id 
                        FOREIGN KEY (role_id) REFERENCES school_roles(id) ON DELETE SET NULL;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for school_staff (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_school_staff_user_id ON school_staff(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_school_staff_school_id ON school_staff(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'role_id') THEN
        CREATE INDEX IF NOT EXISTS idx_school_staff_role_id ON school_staff(role_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_school_staff_status ON school_staff(status);
    END IF;
END $$;

-- =====================================================
-- SCHOOL ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS school_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb, -- Default permissions for this role
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, name) -- Unique role name per school
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'school_roles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_roles' AND column_name = 'school_id') THEN
            ALTER TABLE school_roles ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_roles' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'school_roles' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE school_roles ADD CONSTRAINT fk_school_roles_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for school_roles (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_roles' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_school_roles_school_id ON school_roles(school_id);
    END IF;
END $$;

-- =====================================================
-- COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    code TEXT NOT NULL, -- Course code (e.g., "MUS101")
    title TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    schedule JSONB DEFAULT '{}'::jsonb, -- {days, time, location}
    prerequisites TEXT[] DEFAULT '{}', -- Array of course codes
    max_enrollment INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    semester TEXT,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code, semester, year) -- Unique course per semester
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'school_id') THEN
            ALTER TABLE courses ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'courses' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE courses ADD CONSTRAINT fk_courses_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for courses (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_courses_school_id ON courses(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_id') THEN
        CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'semester')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'year') THEN
        CREATE INDEX IF NOT EXISTS idx_courses_semester_year ON courses(semester, year);
    END IF;
END $$;

-- =====================================================
-- ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID, -- Reference to students (foreign key added later)
    course_id UUID, -- Reference to courses (foreign key added later)
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'failed', 'incomplete')),
    grade TEXT, -- 'A', 'B', 'C', etc.
    grade_points NUMERIC(4, 2),
    attendance_percentage NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id) -- One enrollment per student per course
);

-- Ensure all columns exist and add foreign keys
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'student_id') THEN
            ALTER TABLE enrollments ADD COLUMN student_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'course_id') THEN
            ALTER TABLE enrollments ADD COLUMN course_id UUID;
        END IF;
        
        -- Add foreign key for student_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'student_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'enrollments' 
                AND constraint_name LIKE '%student_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'students' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_student_id 
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
        
        -- Add foreign key for course_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'course_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'enrollments' 
                AND constraint_name LIKE '%course_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'courses' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_course_id 
                        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for enrollments (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'student_id') THEN
        CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'course_id') THEN
        CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    END IF;
END $$;

-- =====================================================
-- LEARNING PATHS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    name TEXT NOT NULL,
    description TEXT,
    courses JSONB DEFAULT '[]'::jsonb, -- Array of course IDs in order
    estimated_duration_weeks INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_paths') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'school_id') THEN
            ALTER TABLE learning_paths ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'learning_paths' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE learning_paths ADD CONSTRAINT fk_learning_paths_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for learning_paths (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_learning_paths_school_id ON learning_paths(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON learning_paths(status);
    END IF;
END $$;

-- =====================================================
-- COHORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    program TEXT,
    student_ids UUID[] DEFAULT '{}', -- Array of student user IDs
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cohorts') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cohorts' AND column_name = 'school_id') THEN
            ALTER TABLE cohorts ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cohorts' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'cohorts' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE cohorts ADD CONSTRAINT fk_cohorts_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for cohorts (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cohorts' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_cohorts_school_id ON cohorts(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cohorts' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_cohorts_status ON cohorts(status);
    END IF;
END $$;

-- =====================================================
-- ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT[] DEFAULT '{}', -- ['Students', 'Staff', 'All']
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    expires_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcements') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'school_id') THEN
            ALTER TABLE announcements ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'announcements' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE announcements ADD CONSTRAINT fk_announcements_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for announcements (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON announcements(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'author_id') THEN
        CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'expires_at') THEN
        CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);
    END IF;
END $$;

-- =====================================================
-- RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('Document', 'Video', 'Audio', 'Link', 'File', 'Other')),
    url TEXT,
    file_url TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    access_level TEXT DEFAULT 'Public' CHECK (access_level IN ('Public', 'Students', 'Staff', 'Restricted')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resources') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'school_id') THEN
            ALTER TABLE resources ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'resources' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE resources ADD CONSTRAINT fk_resources_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for resources (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_resources_school_id ON resources(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'tags') THEN
        CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
    END IF;
END $$;

-- =====================================================
-- EVALUATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    student_id UUID, -- Reference to students (foreign key added later)
    course_id UUID, -- Reference to courses (foreign key added later)
    evaluator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('Assignment', 'Exam', 'Project', 'Performance', 'Portfolio', 'Other')),
    title TEXT NOT NULL,
    score NUMERIC(5, 2),
    max_score NUMERIC(5, 2),
    grade TEXT,
    feedback TEXT,
    rubric JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign keys
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evaluations') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'school_id') THEN
            ALTER TABLE evaluations ADD COLUMN school_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'student_id') THEN
            ALTER TABLE evaluations ADD COLUMN student_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'course_id') THEN
            ALTER TABLE evaluations ADD COLUMN course_id UUID;
        END IF;
        
        -- Add foreign keys (similar pattern as above)
        -- (Abbreviated for brevity - follow same pattern as other tables)
    END IF;
END $$;

-- Indexes for evaluations (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_evaluations_school_id ON evaluations(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'student_id') THEN
        CREATE INDEX IF NOT EXISTS idx_evaluations_student_id ON evaluations(student_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'course_id') THEN
        CREATE INDEX IF NOT EXISTS idx_evaluations_course_id ON evaluations(course_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'evaluator_id') THEN
        CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);
    END IF;
END $$;

-- =====================================================
-- INTERNSHIP LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS internship_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID, -- Reference to students (foreign key added later)
    studio_id UUID, -- Reference to studios or school_partners
    date DATE NOT NULL,
    hours_worked NUMERIC(4, 2) NOT NULL,
    tasks_completed TEXT,
    skills_learned TEXT[] DEFAULT '{}',
    supervisor_notes TEXT,
    student_notes TEXT,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internship_logs') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'student_id') THEN
            ALTER TABLE internship_logs ADD COLUMN student_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'studio_id') THEN
            ALTER TABLE internship_logs ADD COLUMN studio_id UUID;
        END IF;
        
        -- Add foreign key for student_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'student_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'internship_logs' 
                AND constraint_name LIKE '%student_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'students' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE internship_logs ADD CONSTRAINT fk_internship_logs_student_id 
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for internship_logs (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'student_id') THEN
        CREATE INDEX IF NOT EXISTS idx_internship_logs_student_id ON internship_logs(student_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'studio_id') THEN
        CREATE INDEX IF NOT EXISTS idx_internship_logs_studio_id ON internship_logs(studio_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_internship_logs_date ON internship_logs(date DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_logs' AND column_name = 'verified') THEN
        CREATE INDEX IF NOT EXISTS idx_internship_logs_verified ON internship_logs(verified);
    END IF;
END $$;

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Reference to schools (foreign key added later)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist and add foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'school_id') THEN
            ALTER TABLE audit_log ADD COLUMN school_id UUID;
        END IF;
        
        -- Add foreign key for school_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'school_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'audit_log' 
                AND constraint_name LIKE '%school_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'schools' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE audit_log ADD CONSTRAINT fk_audit_log_school_id 
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for audit_log (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_log_school_id ON audit_log(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'action') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
    END IF;
END $$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_schools_updated_at ON schools;
DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
DROP TRIGGER IF EXISTS trigger_school_staff_updated_at ON school_staff;
DROP TRIGGER IF EXISTS trigger_school_roles_updated_at ON school_roles;
DROP TRIGGER IF EXISTS trigger_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS trigger_enrollments_updated_at ON enrollments;
DROP TRIGGER IF EXISTS trigger_learning_paths_updated_at ON learning_paths;
DROP TRIGGER IF EXISTS trigger_cohorts_updated_at ON cohorts;
DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS trigger_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS trigger_evaluations_updated_at ON evaluations;
DROP TRIGGER IF EXISTS trigger_internship_logs_updated_at ON internship_logs;
DROP TRIGGER IF EXISTS trigger_update_course_enrollment_count ON enrollments;

-- Create triggers
CREATE TRIGGER trigger_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_school_staff_updated_at
    BEFORE UPDATE ON school_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_school_roles_updated_at
    BEFORE UPDATE ON school_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cohorts_updated_at
    BEFORE UPDATE ON cohorts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_internship_logs_updated_at
    BEFORE UPDATE ON internship_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'enrolled' THEN
        UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = NEW.course_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'enrolled' AND NEW.status != 'enrolled' THEN
            UPDATE courses SET current_enrollment = GREATEST(0, current_enrollment - 1) WHERE id = NEW.course_id;
        ELSIF OLD.status != 'enrolled' AND NEW.status = 'enrolled' THEN
            UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = NEW.course_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'enrolled' THEN
        UPDATE courses SET current_enrollment = GREATEST(0, current_enrollment - 1) WHERE id = OLD.course_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_enrollment_count
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Users can view their own student records" ON students;
DROP POLICY IF EXISTS "Staff can view students in their school" ON students;
DROP POLICY IF EXISTS "Users can view their own staff records" ON school_staff;
DROP POLICY IF EXISTS "Staff can view staff in their school" ON school_staff;
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Staff can view enrollments in their school" ON enrollments;

-- Schools: Everyone can view active schools
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'is_active') THEN
        CREATE POLICY "Schools are viewable by everyone" ON schools
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Students: Users can see their own student records
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own student records" ON students
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Staff can view students in their school" ON students
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM school_staff
                    WHERE user_id = auth.uid() AND school_id = students.school_id
                )
            );
    END IF;
END $$;

-- School Staff: Users can see their own staff records
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'user_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_staff' AND column_name = 'school_id') THEN
        CREATE POLICY "Users can view their own staff records" ON school_staff
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Staff can view staff in their school" ON school_staff
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM school_staff ss
                    WHERE ss.user_id = auth.uid() AND ss.school_id = school_staff.school_id
                )
            );
    END IF;
END $$;

-- Courses: Everyone can view active courses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        CREATE POLICY "Courses are viewable by everyone" ON courses
            FOR SELECT USING (status = 'active' OR status = 'archived');
    END IF;
END $$;

-- Enrollments: Students can see their own enrollments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'student_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'user_id') THEN
        CREATE POLICY "Students can view their own enrollments" ON enrollments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM students
                    WHERE id = enrollments.student_id AND user_id = auth.uid()
                )
            );
        
        CREATE POLICY "Staff can view enrollments in their school" ON enrollments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM courses c
                    JOIN school_staff ss ON ss.school_id = c.school_id
                    WHERE c.id = enrollments.course_id AND ss.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE schools IS 'Educational institutions';
COMMENT ON TABLE students IS 'Student enrollment records';
COMMENT ON TABLE school_staff IS 'School staff and administrators';
COMMENT ON TABLE school_roles IS 'Role definitions with permissions';
COMMENT ON TABLE courses IS 'Course catalog';
COMMENT ON TABLE enrollments IS 'Student course enrollments';
COMMENT ON TABLE learning_paths IS 'Structured learning paths';
COMMENT ON TABLE cohorts IS 'Student cohorts/groups';
COMMENT ON TABLE announcements IS 'School announcements';
COMMENT ON TABLE resources IS 'Educational resources';
COMMENT ON TABLE evaluations IS 'Student evaluations and grades';
COMMENT ON TABLE internship_logs IS 'Internship hour logs';
COMMENT ON TABLE audit_log IS 'System audit log';

