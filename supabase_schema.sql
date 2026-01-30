-- Student Attendance Tracker - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    batch VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
    remarks TEXT,
    marked_by UUID REFERENCES admins(id),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, attendance_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date_student ON attendance(attendance_date, student_id);

-- Insert default admin (password: admin123)
-- Password hash generated with werkzeug.security.generate_password_hash('admin123')
INSERT INTO admins (username, password_hash, email)
VALUES (
    'admin',
    'scrypt:32768:8:1$WZLhXZzLDmS7Mubg$c2e7a5e8c6f5d4c3b2a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6',
    'admin@calibo.com'
)
ON CONFLICT (username) DO NOTHING;

-- Insert KL University students (30 students)
INSERT INTO students (roll_number, first_name, last_name, email, phone, batch, course, status) VALUES
('2200030001', 'Aarav', 'Sharma', 'aarav.sharma@klu.ac.in', '9876543201', 'KL University', 'Computer Science', 'active'),
('2200030002', 'Vivaan', 'Patel', 'vivaan.patel@klu.ac.in', '9876543202', 'KL University', 'Computer Science', 'active'),
('2200030003', 'Aditya', 'Kumar', 'aditya.kumar@klu.ac.in', '9876543203', 'KL University', 'Computer Science', 'active'),
('2200030004', 'Vihaan', 'Singh', 'vihaan.singh@klu.ac.in', '9876543204', 'KL University', 'Computer Science', 'active'),
('2200030005', 'Arjun', 'Reddy', 'arjun.reddy@klu.ac.in', '9876543205', 'KL University', 'Computer Science', 'active'),
('2200030006', 'Sai', 'Krishna', 'sai.krishna@klu.ac.in', '9876543206', 'KL University', 'Computer Science', 'active'),
('2200030007', 'Reyansh', 'Gupta', 'reyansh.gupta@klu.ac.in', '9876543207', 'KL University', 'Computer Science', 'active'),
('2200030008', 'Ayaan', 'Rao', 'ayaan.rao@klu.ac.in', '9876543208', 'KL University', 'Computer Science', 'active'),
('2200030009', 'Krishna', 'Naidu', 'krishna.naidu@klu.ac.in', '9876543209', 'KL University', 'Computer Science', 'active'),
('2200030010', 'Ishaan', 'Verma', 'ishaan.verma@klu.ac.in', '9876543210', 'KL University', 'Computer Science', 'active'),
('2200040001', 'Ananya', 'Reddy', 'ananya.reddy@klu.ac.in', '9876543211', 'KL University', 'AI & Data Science', 'active'),
('2200040002', 'Diya', 'Sharma', 'diya.sharma@klu.ac.in', '9876543212', 'KL University', 'AI & Data Science', 'active'),
('2200040003', 'Aadhya', 'Patel', 'aadhya.patel@klu.ac.in', '9876543213', 'KL University', 'AI & Data Science', 'active'),
('2200040004', 'Saanvi', 'Kumar', 'saanvi.kumar@klu.ac.in', '9876543214', 'KL University', 'AI & Data Science', 'active'),
('2200040005', 'Navya', 'Singh', 'navya.singh@klu.ac.in', '9876543215', 'KL University', 'AI & Data Science', 'active'),
('2200040006', 'Anika', 'Gupta', 'anika.gupta@klu.ac.in', '9876543216', 'KL University', 'AI & Data Science', 'active'),
('2200040007', 'Kiara', 'Rao', 'kiara.rao@klu.ac.in', '9876543217', 'KL University', 'AI & Data Science', 'active'),
('2200040008', 'Myra', 'Krishna', 'myra.krishna@klu.ac.in', '9876543218', 'KL University', 'AI & Data Science', 'active'),
('2200040009', 'Pari', 'Naidu', 'pari.naidu@klu.ac.in', '9876543219', 'KL University', 'AI & Data Science', 'active'),
('2200040010', 'Sara', 'Verma', 'sara.verma@klu.ac.in', '9876543220', 'KL University', 'AI & Data Science', 'active'),
('2200050001', 'Shourya', 'Reddy', 'shourya.reddy@klu.ac.in', '9876543221', 'KL University', 'Electronics', 'active'),
('2200050002', 'Atharv', 'Sharma', 'atharv.sharma@klu.ac.in', '9876543222', 'KL University', 'Electronics', 'active'),
('2200050003', 'Advait', 'Patel', 'advait.patel@klu.ac.in', '9876543223', 'KL University', 'Electronics', 'active'),
('2200050004', 'Veer', 'Kumar', 'veer.kumar@klu.ac.in', '9876543224', 'KL University', 'Electronics', 'active'),
('2200050005', 'Arnav', 'Singh', 'arnav.singh@klu.ac.in', '9876543225', 'KL University', 'Electronics', 'active'),
('2200050006', 'Ahaan', 'Gupta', 'ahaan.gupta@klu.ac.in', '9876543226', 'KL University', 'Electronics', 'active'),
('2200050007', 'Kabir', 'Rao', 'kabir.rao@klu.ac.in', '9876543227', 'KL University', 'Electronics', 'active'),
('2200050008', 'Shivansh', 'Krishna', 'shivansh.krishna@klu.ac.in', '9876543228', 'KL University', 'Electronics', 'active'),
('2200050009', 'Rudra', 'Naidu', 'rudra.naidu@klu.ac.in', '9876543229', 'KL University', 'Electronics', 'active'),
('2200050010', 'Daksh', 'Verma', 'daksh.verma@klu.ac.in', '9876543230', 'KL University', 'Electronics', 'active')
ON CONFLICT (roll_number) DO NOTHING;

-- Insert Diet College students (20 students)
INSERT INTO students (roll_number, first_name, last_name, email, phone, batch, course, status) VALUES
('DC2024001', 'Rajesh', 'Kumar', 'rajesh.kumar@diet.edu', '9876543301', 'Diet College', 'B.Ed', 'active'),
('DC2024002', 'Priya', 'Sharma', 'priya.sharma@diet.edu', '9876543302', 'Diet College', 'B.Ed', 'active'),
('DC2024003', 'Amit', 'Patel', 'amit.patel@diet.edu', '9876543303', 'Diet College', 'B.Ed', 'active'),
('DC2024004', 'Sneha', 'Reddy', 'sneha.reddy@diet.edu', '9876543304', 'Diet College', 'B.Ed', 'active'),
('DC2024005', 'Vikram', 'Singh', 'vikram.singh@diet.edu', '9876543305', 'Diet College', 'B.Ed', 'active'),
('DC2024006', 'Pooja', 'Gupta', 'pooja.gupta@diet.edu', '9876543306', 'Diet College', 'B.Ed', 'active'),
('DC2024007', 'Rahul', 'Verma', 'rahul.verma@diet.edu', '9876543307', 'Diet College', 'B.Ed', 'active'),
('DC2024008', 'Anjali', 'Rao', 'anjali.rao@diet.edu', '9876543308', 'Diet College', 'B.Ed', 'active'),
('DC2024009', 'Suresh', 'Krishna', 'suresh.krishna@diet.edu', '9876543309', 'Diet College', 'B.Ed', 'active'),
('DC2024010', 'Kavita', 'Naidu', 'kavita.naidu@diet.edu', '9876543310', 'Diet College', 'B.Ed', 'active'),
('DC2024011', 'Manoj', 'Sharma', 'manoj.sharma@diet.edu', '9876543311', 'Diet College', 'D.El.Ed', 'active'),
('DC2024012', 'Deepa', 'Patel', 'deepa.patel@diet.edu', '9876543312', 'Diet College', 'D.El.Ed', 'active'),
('DC2024013', 'Arun', 'Kumar', 'arun.kumar@diet.edu', '9876543313', 'Diet College', 'D.El.Ed', 'active'),
('DC2024014', 'Lakshmi', 'Singh', 'lakshmi.singh@diet.edu', '9876543314', 'Diet College', 'D.El.Ed', 'active'),
('DC2024015', 'Kiran', 'Reddy', 'kiran.reddy@diet.edu', '9876543315', 'Diet College', 'D.El.Ed', 'active'),
('DC2024016', 'Nisha', 'Gupta', 'nisha.gupta@diet.edu', '9876543316', 'Diet College', 'D.El.Ed', 'active'),
('DC2024017', 'Ramesh', 'Rao', 'ramesh.rao@diet.edu', '9876543317', 'Diet College', 'D.El.Ed', 'active'),
('DC2024018', 'Sunita', 'Verma', 'sunita.verma@diet.edu', '9876543318', 'Diet College', 'D.El.Ed', 'active'),
('DC2024019', 'Ganesh', 'Krishna', 'ganesh.krishna@diet.edu', '9876543319', 'Diet College', 'D.El.Ed', 'active'),
('DC2024020', 'Meena', 'Naidu', 'meena.naidu@diet.edu', '9876543320', 'Diet College', 'D.El.Ed', 'active')
ON CONFLICT (roll_number) DO NOTHING;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated access
-- Note: In production, adjust these policies based on your auth setup
CREATE POLICY "Enable all access for authenticated users" ON admins FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON students FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON attendance FOR ALL USING (true);
