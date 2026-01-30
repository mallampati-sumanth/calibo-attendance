-- Update KL University Students List
-- Run this in Supabase SQL Editor

-- Clear existing KL University students before inserting new ones
DELETE FROM students WHERE batch = 'KL University';

-- Insert all KL University students with roll numbers (extracted from emails or generated)
INSERT INTO students (roll_number, first_name, last_name, email, phone, batch, course, status) VALUES
('2300030791', 'Ambati', 'Abhinay', '2300030791cseelge@gmail.com', '7799826164', 'KL University', 'Calibo Training', 'active'),
('KLU8328116581', 'Anke Goutham', 'Kumar', 'agoutham004@gmail.com', '8328116581', 'KL University', 'Calibo Training', 'active'),
('2300030063', 'Balaboina Jyoti', 'Yadav', '2300030063cseh@gmail.com', '9827278982', 'KL University', 'Calibo Training', 'active'),
('2300030131', 'Chevuri', 'Jahnavi', '2300030131cse@gmail.com', '9347428871', 'KL University', 'Calibo Training', 'active'),
('2300080218', 'Chinni P Lakshmi Venkata Sai', 'Manikanta', '2300080218aidsh@gmail.com', '7989132992', 'KL University', 'Calibo Training', 'active'),
('2300030154', 'Darapu', 'Keerthana', '2300030154cse1@gmail.com', '6281633654', 'KL University', 'Calibo Training', 'active'),
('2300031704', 'Darapu Prem', 'Reddy', '2300031704cse1@gmail.com', '9392771808', 'KL University', 'Calibo Training', 'active'),
('2300030181', 'Ega Lakshmi', 'Pravalika', '2300030181cser@gmail.com', '7330693969', 'KL University', 'Calibo Training', 'active'),
('2300031803', 'Gadamsetty Rohit', 'Malyadri', '2300031803cser@gmail.com', '9866042275', 'KL University', 'Calibo Training', 'active'),
('KLU9493836545', 'Guntaka Chakra Vaishnav', 'Reddy', 'guntakachakravaishnav@gmail.com', '9493836545', 'KL University', 'Calibo Training', 'active'),
('2300030244', 'Gurivi Reddy', 'Yasaswini', '2300030244cseelge@gmail.com', '7013370527', 'KL University', 'Calibo Training', 'active'),
('2300032995', 'Harsh', 'Raj', '2300032995csehte@gmail.com', '7320089048', 'KL University', 'Calibo Training', 'active'),
('2300080295', 'Jandhyala Sai', 'Adithya', '2300080295aids@gmail.com', '9704300547', 'KL University', 'Calibo Training', 'active'),
('KLU9032611376', 'Kancharlapalli Eshwar', 'Krishna', 'eswarlazypanda@gmail.com', '9032611376', 'KL University', 'Calibo Training', 'active'),
('2300030326', 'Kodali', 'Ramyasri', '2300030326cseelge@gmail.com', '9347069254', 'KL University', 'Calibo Training', 'active'),
('2300033618', 'Lebaku Charaneeswara', 'Reddy', '2300033618cse1@gmail.com', '9666557327', 'KL University', 'Calibo Training', 'active'),
('2300040361', 'Mallampati', 'Sumanth', '2300040361ece@gmail.com', '7816065892', 'KL University', 'Calibo Training', 'active'),
('KLU9550949636', 'Marani Sashi', 'Vardhan', 'sashiontop@gmail.com', '9550949636', 'KL University', 'Calibo Training', 'active'),
('2300031810', 'Mekala Maria Sanjith', 'Reddy', '2300031810cseh1@gmail.com', '8688295123', 'KL University', 'Calibo Training', 'active'),
('2300032166', 'Modepalli Sai', 'Kala', '2300032166cse1@gmail.com', '7093119102', 'KL University', 'Calibo Training', 'active'),
('2300031099', 'Nallapaneni Lakshmi', 'Sowjanya', '2300031099cseh@gmail.com', '9492216178', 'KL University', 'Calibo Training', 'active'),
('KLU9182142205', 'Pasupuleti Revathi', 'Meenakshi', 'meenakshi1976ml@gmail.com', '9182142205', 'KL University', 'Calibo Training', 'active'),
('2300060175', 'Pendela Naga', 'Abhinay', '2300060175aidselge@gmail.com', '9121292095', 'KL University', 'Calibo Training', 'active'),
('2300033256', 'Pinnam Vasavi', 'Kalyani', '2300033256cse1@gmail.com', '7569991494', 'KL University', 'Calibo Training', 'active'),
('2300060003', 'Purna Mani Sai Indu Harshitha', 'Pattem', '2300060003aidshte@gmail.com', '9133449119', 'KL University', 'Calibo Training', 'active'),
('2300030570', 'Rachapudi Sai', 'Sree', '2300030570cseelge@gmail.com', '8328664192', 'KL University', 'Calibo Training', 'active'),
('2300030578', 'Raunak Kumar', 'Singh', '2300030578cseh1@gmail.com', '9525811966', 'KL University', 'Calibo Training', 'active'),
('2300030609', 'Setti', 'Ruchita', '2300030609cseelge@gmail.com', '7093993777', 'KL University', 'Calibo Training', 'active'),
('KLU9494909195', 'Shaik Mastan', 'Saheb', 'mastan8957@gmail.com', '9494909195', 'KL University', 'Calibo Training', 'active'),
('2300032095', 'Vadlamudi', 'Rajanandini', '2300032095cseh@gmail.com', '7095061812', 'KL University', 'Calibo Training', 'active'),
('2300033171', 'Vattikuti', 'Hanivarshitha', '2300033171csemdie@gmail.com', '8686277775', 'KL University', 'Calibo Training', 'active')
ON CONFLICT (roll_number) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    batch = EXCLUDED.batch,
    course = EXCLUDED.course,
    status = EXCLUDED.status;

-- Verify the data
SELECT COUNT(*) as total_kl_students FROM students WHERE batch = 'KL University';
SELECT * FROM students WHERE batch = 'KL University' ORDER BY first_name;
