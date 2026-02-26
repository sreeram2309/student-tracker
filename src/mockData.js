// 1. Fake Users Database (1 Teacher, 10 Students)
export const users = [
  { id: 1, name: "Rajesh Kumar", email: "teacher@school.com", password: "123", role: "teacher" },
  { id: 2, name: "Aaditya Patel", email: "aaditya@school.com", password: "123", role: "student" },
  { id: 3, name: "Diya Sharma", email: "diya@school.com", password: "123", role: "student" },
  { id: 4, name: "Rohan Desai", email: "rohan@school.com", password: "123", role: "student" },
  { id: 5, name: "Kavya Singh", email: "kavya@school.com", password: "123", role: "student" },
  { id: 6, name: "Arjun Reddy", email: "arjun@school.com", password: "123", role: "student" },
  { id: 7, name: "Neha Gupta", email: "neha@school.com", password: "123", role: "student" },
  { id: 8, name: "Vikram Iyer", email: "vikram@school.com", password: "123", role: "student" },
  { id: 9, name: "Anjali Menon", email: "anjali@school.com", password: "123", role: "student" },
  { id: 10, name: "Siddharth Joshi", email: "siddharth@school.com", password: "123", role: "student" },
  { id: 11, name: "Priya Verma", email: "priya@school.com", password: "123", role: "student" }
];

// 2. Fake Assessments (Notice Quiz 102 is out of 50 points!)
export const assessments = [
  { id: 101, title: "Web Dev Basics", date: "2026-01-10", maxScore: 100, subject: "Frontend" },
  { id: 102, title: "Data Structures Quiz", date: "2026-01-25", maxScore: 50, subject: "Algorithms" },
  { id: 103, title: "Database Schema Design", date: "2026-02-05", maxScore: 100, subject: "Backend" },
  { id: 104, title: "Midterm Exam", date: "2026-02-15", maxScore: 100, subject: "Mathematics" },
  { id: 105, title: "UI/UX Case Study", date: "2026-02-20", maxScore: 100, subject: "Design" }
];

// 3. Fake Results (50 total grades to populate the charts beautifully)
export const results = [
  // Aaditya (High Performer)
  { id: 1001, studentId: 2, assessmentId: 101, score: 92, feedback: "Great attention to detail." },
  { id: 1002, studentId: 2, assessmentId: 102, score: 48, feedback: "Excellent logic." },
  { id: 1003, studentId: 2, assessmentId: 103, score: 88, feedback: "Good ER diagram." },
  { id: 1004, studentId: 2, assessmentId: 104, score: 95, feedback: "Perfect score on calculus." },
  { id: 1005, studentId: 2, assessmentId: 105, score: 90, feedback: "Clean UI mockups." },

  // Diya (Above Average)
  { id: 1006, studentId: 3, assessmentId: 101, score: 85, feedback: "CSS needs minor tweaks." },
  { id: 1007, studentId: 3, assessmentId: 102, score: 42, feedback: "Review sorting algorithms." },
  { id: 1008, studentId: 3, assessmentId: 103, score: 89, feedback: "Solid SQL queries." },
  { id: 1009, studentId: 3, assessmentId: 104, score: 82, feedback: "Good effort." },
  { id: 1010, studentId: 3, assessmentId: 105, score: 88, feedback: "Nice color palette choice." },

  // Rohan (Average)
  { id: 1011, studentId: 4, assessmentId: 101, score: 75, feedback: "Ensure elements are responsive." },
  { id: 1012, studentId: 4, assessmentId: 102, score: 35, feedback: "Struggled with graphs." },
  { id: 1013, studentId: 4, assessmentId: 103, score: 78, feedback: "Normalization needs work." },
  { id: 1014, studentId: 4, assessmentId: 104, score: 72, feedback: "Review chapter 4." },
  { id: 1015, studentId: 4, assessmentId: 105, score: 80, feedback: "Good user flow." },

  // Kavya (Top of the class)
  { id: 1016, studentId: 5, assessmentId: 101, score: 98, feedback: "Flawless execution." },
  { id: 1017, studentId: 5, assessmentId: 102, score: 50, feedback: "Perfect!" },
  { id: 1018, studentId: 5, assessmentId: 103, score: 95, feedback: "Highly optimized database." },
  { id: 1019, studentId: 5, assessmentId: 104, score: 96, feedback: "Outstanding." },
  { id: 1020, studentId: 5, assessmentId: 105, score: 94, feedback: "Very professional presentation." },

  // Arjun (At Risk)
  { id: 1021, studentId: 6, assessmentId: 101, score: 60, feedback: "Incomplete assignment." },
  { id: 1022, studentId: 6, assessmentId: 102, score: 20, feedback: "Please attend office hours." },
  { id: 1023, studentId: 6, assessmentId: 103, score: 55, feedback: "Missing key tables." },
  { id: 1024, studentId: 6, assessmentId: 104, score: 50, feedback: "Needs significant review." },
  { id: 1025, studentId: 6, assessmentId: 105, score: 65, feedback: "Rushed work." },

  // Neha (Average)
  { id: 1026, studentId: 7, assessmentId: 101, score: 80, feedback: "Good layout." },
  { id: 1027, studentId: 7, assessmentId: 102, score: 38, feedback: "Watch out for off-by-one errors." },
  { id: 1028, studentId: 7, assessmentId: 103, score: 75, feedback: "Decent understanding." },
  { id: 1029, studentId: 7, assessmentId: 104, score: 85, feedback: "Solid math skills." },
  { id: 1030, studentId: 7, assessmentId: 105, score: 78, feedback: "Wireframes are a bit messy." },

  // Vikram (High Performer)
  { id: 1031, studentId: 8, assessmentId: 101, score: 88, feedback: "Great JavaScript logic." },
  { id: 1032, studentId: 8, assessmentId: 102, score: 45, feedback: "Good tree traversals." },
  { id: 1033, studentId: 8, assessmentId: 103, score: 92, feedback: "Excellent use of indexes." },
  { id: 1034, studentId: 8, assessmentId: 104, score: 89, feedback: "Very close to perfect." },
  { id: 1035, studentId: 8, assessmentId: 105, score: 91, feedback: "Strong design principles." },

  // Anjali (Borderline At Risk)
  { id: 1036, studentId: 9, assessmentId: 101, score: 68, feedback: "Layout broke on mobile." },
  { id: 1037, studentId: 9, assessmentId: 102, score: 28, feedback: "Review Big O notation." },
  { id: 1038, studentId: 9, assessmentId: 103, score: 72, feedback: "Okay, but could be better." },
  { id: 1039, studentId: 9, assessmentId: 104, score: 65, feedback: "Please double check your formulas." },
  { id: 1040, studentId: 9, assessmentId: 105, score: 70, feedback: "Missed accessibility requirements." },

  // Siddharth (At Risk)
  { id: 1041, studentId: 10, assessmentId: 101, score: 45, feedback: "Did not follow instructions." },
  { id: 1042, studentId: 10, assessmentId: 102, score: 15, feedback: "See me after class." },
  { id: 1043, studentId: 10, assessmentId: 103, score: 50, feedback: "Fundamental concepts missing." },
  { id: 1044, studentId: 10, assessmentId: 104, score: 40, feedback: "Failed." },
  { id: 1045, studentId: 10, assessmentId: 105, score: 55, feedback: "Needs a lot more detail." },

  // Priya (Excellent Performer)
  { id: 1046, studentId: 11, assessmentId: 101, score: 95, feedback: "Beautiful UI!" },
  { id: 1047, studentId: 11, assessmentId: 102, score: 49, feedback: "One tiny syntax error, otherwise perfect." },
  { id: 1048, studentId: 11, assessmentId: 103, score: 98, feedback: "Flawless schema." },
  { id: 1049, studentId: 11, assessmentId: 104, score: 92, feedback: "Great analytical skills." },
  { id: 1050, studentId: 11, assessmentId: 105, score: 96, feedback: "Highly intuitive UX." }
];