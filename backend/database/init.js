const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'attendance.db');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
    // Admin table for authentication
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);

    // Students table
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_number TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            course TEXT,
            batch TEXT,
            admission_date DATE,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Attendance records table
    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            attendance_date DATE NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
            marked_by INTEGER NOT NULL,
            marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            remarks TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (marked_by) REFERENCES admins(id),
            UNIQUE(student_id, attendance_date)
        )
    `);

    // Sessions table for better session management
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            admin_id INTEGER,
            data TEXT,
            expires_at DATETIME,
            FOREIGN KEY (admin_id) REFERENCES admins(id)
        )
    `);

    // Create default admin account
    const defaultPassword = 'admin123'; // Change this in production
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
            console.error('Error creating default admin:', err);
            return;
        }
        
        db.run(`
            INSERT OR IGNORE INTO admins (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, ['admin', 'admin@institute.com', hash], function(err) {
            if (err) {
                console.error('Error inserting default admin:', err);
            } else if (this.changes > 0) {
                console.log('✅ Default admin created - Username: admin, Password: admin123');
                console.log('⚠️  Please change the default password after first login!');
            }
        });
    });

    // Insert sample students for testing - 50 students total
    // KL University - 30 students
    // Diet College - 20 students
    const sampleStudents = [
        // KL University Students (30) - Real Data
        ['KLU001', 'Ambati', 'Abhinay', '2300030791cseelge@gmail.com', '7799826164', 'Calibo Training', 'KL University'],
        ['KLU002', 'Anke Goutham', 'Kumar', 'agoutham004@gmail.com', '8328116581', 'Calibo Training', 'KL University'],
        ['KLU003', 'Balaboina Jyoti', 'Yadav', '2300030063cseh@gmail.com', '9827278982', 'Calibo Training', 'KL University'],
        ['KLU004', 'Chevuri', 'Jahnavi', '2300030131cseelge@gmail.com', '9347428871', 'Calibo Training', 'KL University'],
        ['KLU005', 'Chinni P Lakshmi Venkata Sai', 'Manikanta', '2300080218aidsh@gmail.com', '7989132992', 'Calibo Training', 'KL University'],
        ['KLU006', 'Darapu', 'Keerthana', '2300030154cse1@gmail.com', '6281633654', 'Calibo Training', 'KL University'],
        ['KLU007', 'Darapu Prem', 'Reddy', '2300031704cse1@gmail.com', '9392771808', 'Calibo Training', 'KL University'],
        ['KLU008', 'Ega Lakshmi', 'Pravalika', '2300030181cser@gmail.com', '7330693969', 'Calibo Training', 'KL University'],
        ['KLU009', 'Gadamsetty Rohit', 'Malyadri', '2300031803cseh1@gmail.com', '9866042275', 'Calibo Training', 'KL University'],
        ['KLU010', 'Guntaka Chakra Vaishnav', 'Reddy', 'guntakachakravaishnavreddy@gmail.com', '9493836545', 'Calibo Training', 'KL University'],
        ['KLU011', 'Gurivi Reddy', 'Yasaswini', '2300030244cseelge@gmail.com', '7013370527', 'Calibo Training', 'KL University'],
        ['KLU012', 'Harsh', 'Raj', '2300032995csehte@gmail.com', '7320089048', 'Calibo Training', 'KL University'],
        ['KLU013', 'Jandhyala Sai', 'Adithya', '2300080295aids@gmail.com', '9704300547', 'Calibo Training', 'KL University'],
        ['KLU014', 'Kancharlapalli Eshwar', 'Krishna', 'eswarlazypanda@gmail.com', '9032611376', 'Calibo Training', 'KL University'],
        ['KLU015', 'Kodali', 'Ramyasri', '2300030326cseelge@gmail.com', '9347069254', 'Calibo Training', 'KL University'],
        ['KLU016', 'Lebaku Charaneeswara', 'Reddy', '2300033618cse1@gmail.com', '9666557327', 'Calibo Training', 'KL University'],
        ['KLU017', 'Mallampati', 'Sumanth', '2300040361eceelge@gmail.com', '7816065892', 'Calibo Training', 'KL University'],
        ['KLU018', 'Marani Sashi', 'Warddhan', 'sashiontop@gmail.com', '9550949636', 'Calibo Training', 'KL University'],
        ['KLU019', 'Mekala Maria Sanjith', 'Reddy', '2300031810cseh1@gmail.com', '8688295123', 'Calibo Training', 'KL University'],
        ['KLU020', 'Modepalli Sai', 'Kala', '2300032166cse1@gmail.com', '7093119102', 'Calibo Training', 'KL University'],
        ['KLU021', 'Nallapaneni Lakshmi', 'Sowjanya', '2300031099cseh@gmail.com', '9492216178', 'Calibo Training', 'KL University'],
        ['KLU022', 'Pasupuleti Revathi', 'Meenakshi', 'meenakshi1976ml@gmail.com', '9182142205', 'Calibo Training', 'KL University'],
        ['KLU023', 'Pendela Naga', 'Abhinay', '2300080175aidselge@gmail.com', '9121292095', 'Calibo Training', 'KL University'],
        ['KLU024', 'Pinnam Vasavi', 'Kalyani', '2300033256cse1@gmail.com', '7569991494', 'Calibo Training', 'KL University'],
        ['KLU025', 'Purna Mani Sai Indu Harshitha', 'Pattem', '2300060003aidshte@gmail.com', '9133449119', 'Calibo Training', 'KL University'],
        ['KLU026', 'Rachapudi Sai', 'Sree', '2300030570cseelge@gmail.com', '8328664192', 'Calibo Training', 'KL University'],
        ['KLU027', 'Raunak Kumar', 'Singh', '2300030578cseh1@gmail.com', '9525811966', 'Calibo Training', 'KL University'],
        ['KLU028', 'Setti', 'Ruchita', '2300030609cseelge@gmail.com', '7093993777', 'Calibo Training', 'KL University'],
        ['KLU029', 'Shaik Mastan', 'Saheb', 'mastan8957@gmail.com', '9494909195', 'Calibo Training', 'KL University'],
        ['KLU030', 'Student', 'Placeholder', 'placeholder30@klu.ac.in', '0000000000', 'Calibo Training', 'KL University'],
        
        // Diet College Students (20)
        ['DCL001', 'Abhishek', 'Singh', 'abhishek.singh@dietcollege.ac.in', '9876543240', 'Calibo Training', 'Diet College'],
        ['DCL002', 'Megha', 'Sharma', 'megha.sharma@dietcollege.ac.in', '9876543241', 'Calibo Training', 'Diet College'],
        ['DCL003', 'Rajesh', 'Kumar', 'rajesh.kumar@dietcollege.ac.in', '9876543242', 'Calibo Training', 'Diet College'],
        ['DCL004', 'Pooja', 'Gupta', 'pooja.gupta@dietcollege.ac.in', '9876543243', 'Calibo Training', 'Diet College'],
        ['DCL005', 'Suresh', 'Patel', 'suresh.patel@dietcollege.ac.in', '9876543244', 'Calibo Training', 'Diet College'],
        ['DCL006', 'Kavya', 'Reddy', 'kavya.reddy@dietcollege.ac.in', '9876543245', 'Calibo Training', 'Diet College'],
        ['DCL007', 'Deepak', 'Joshi', 'deepak.joshi@dietcollege.ac.in', '9876543246', 'Calibo Training', 'Diet College'],
        ['DCL008', 'Simran', 'Kaur', 'simran.kaur@dietcollege.ac.in', '9876543247', 'Calibo Training', 'Diet College'],
        ['DCL009', 'Naveen', 'Chand', 'naveen.chand@dietcollege.ac.in', '9876543248', 'Calibo Training', 'Diet College'],
        ['DCL010', 'Riya', 'Bansal', 'riya.bansal@dietcollege.ac.in', '9876543249', 'Calibo Training', 'Diet College'],
        ['DCL011', 'Mohit', 'Agarwal', 'mohit.agarwal@dietcollege.ac.in', '9876543250', 'Calibo Training', 'Diet College'],
        ['DCL012', 'Priyanka', 'Verma', 'priyanka.verma@dietcollege.ac.in', '9876543251', 'Calibo Training', 'Diet College'],
        ['DCL013', 'Gaurav', 'Mittal', 'gaurav.mittal@dietcollege.ac.in', '9876543252', 'Calibo Training', 'Diet College'],
        ['DCL014', 'Aditi', 'Saxena', 'aditi.saxena@dietcollege.ac.in', '9876543253', 'Calibo Training', 'Diet College'],
        ['DCL015', 'Vishal', 'Rao', 'vishal.rao@dietcollege.ac.in', '9876543254', 'Calibo Training', 'Diet College'],
        ['DCL016', 'Nisha', 'Pandey', 'nisha.pandey@dietcollege.ac.in', '9876543255', 'Calibo Training', 'Diet College'],
        ['DCL017', 'Ankit', 'Dubey', 'ankit.dubey@dietcollege.ac.in', '9876543256', 'Calibo Training', 'Diet College'],
        ['DCL018', 'Shruti', 'Mishra', 'shruti.mishra@dietcollege.ac.in', '9876543257', 'Calibo Training', 'Diet College'],
        ['DCL019', 'Lokesh', 'Yadav', 'lokesh.yadav@dietcollege.ac.in', '9876543258', 'Calibo Training', 'Diet College'],
        ['DCL020', 'Anchal', 'Tiwari', 'anchal.tiwari@dietcollege.ac.in', '9876543259', 'Calibo Training', 'Diet College']
    ];

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO students 
        (roll_number, first_name, last_name, email, phone, course, batch, admission_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))
    `);

    sampleStudents.forEach(student => {
        stmt.run(student);
    });
    
    stmt.finalize(() => {
        console.log('✅ Sample students inserted');
    });

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number)');
    db.run('CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch)');
});

module.exports = db;