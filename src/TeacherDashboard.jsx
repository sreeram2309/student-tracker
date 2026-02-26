import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { users, results, assessments } from './mockData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast'; 
import { motion, AnimatePresence } from 'framer-motion';

function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [studentStats, setStudentStats] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);
  
  // --- NEW STATE FOR TWO SEPARATE MODALS ---
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  
  // We keep a local state of assessments so the page updates instantly when we add one
  const [assessmentList, setAssessmentList] = useState(assessments);
  
  const [newGrade, setNewGrade] = useState({ studentId: '', assessmentId: '', score: '', feedback: '' });
  const [newAssessment, setNewAssessment] = useState({ title: '', subject: '', maxScore: '100', date: new Date().toISOString().split('T')[0] });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const navigate = useNavigate();

  const calculateStats = () => {
    const allStudents = users.filter(u => u.role === 'student');
    let totalClassPercentage = 0;
    let riskCount = 0;
    const stats = allStudents.map(student => {
      const studentGrades = results.filter(r => r.studentId === student.id);
      let totalPercentage = 0;
      studentGrades.forEach(grade => {
        // Find the assessment from our local list
        const testInfo = assessmentList.find(a => a.id === grade.assessmentId);
        if (testInfo) {
          totalPercentage += (grade.score / testInfo.maxScore) * 100;
        }
      });
      const average = studentGrades.length > 0 ? (totalPercentage / studentGrades.length).toFixed(1) : 0;
      const numAvg = parseFloat(average);
      totalClassPercentage += numAvg;
      if (numAvg < 70) riskCount++;
      return { id: student.id, name: student.name, average: numAvg };
    });
    setStudentStats(stats);
    if (stats.length > 0) setClassAverage((totalClassPercentage / stats.length).toFixed(1));
    setAtRiskCount(riskCount);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) { navigate('/'); return; }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'teacher') { navigate('/student'); return; }
    setTeacher(parsedUser);
    calculateStats();
  }, [navigate, assessmentList]); // Recalculate if assessments change

  const handleLogout = () => { 
    localStorage.removeItem('currentUser'); 
    toast.success('Logged out successfully!'); 
    navigate('/'); 
  };

  // --- NEW: CREATE AN ASSIGNMENT ---
  const handleAddAssessment = (e) => {
    e.preventDefault();
    const newId = Math.floor(Math.random() * 10000);
    const createdAssessment = {
      id: newId,
      title: newAssessment.title,
      subject: newAssessment.subject,
      maxScore: Number(newAssessment.maxScore),
      date: newAssessment.date
    };
    
    // Push to fake DB and update local state
    assessments.push(createdAssessment);
    setAssessmentList([...assessments]);
    
    setIsAssessmentModalOpen(false);
    setNewAssessment({ title: '', subject: '', maxScore: '100', date: new Date().toISOString().split('T')[0] });
    toast.success('New assignment created!'); 
  };

  // --- NEW: GRADE A STUDENT FOR AN EXISTING ASSIGNMENT ---
  const handleAddGrade = (e) => {
    e.preventDefault();
    results.push({ 
      id: Math.floor(Math.random() * 10000), 
      studentId: Number(newGrade.studentId), 
      assessmentId: Number(newGrade.assessmentId), 
      score: Number(newGrade.score), 
      feedback: newGrade.feedback || "Reviewed offline." // Custom remark!
    });
    
    calculateStats();
    setIsGradeModalOpen(false);
    setNewGrade({ studentId: '', assessmentId: '', score: '', feedback: '' });
    toast.success('Grade & remark saved successfully!'); 
  };

  const generateReport = () => {
    const headers = ['Student Name,Overall Average (%),Status'];
    const rows = studentStats.map(stat => `${stat.name},${stat.average},${stat.average >= 70 ? 'On Track' : 'Needs Support'}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "class_performance_report.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success('Report downloaded!');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedStudents = [...studentStats].filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  let selectedStudent = null;
  let selectedStudentGrades = [];
  if (selectedStudentId) {
    selectedStudent = users.find(u => u.id === selectedStudentId);
    selectedStudentGrades = results.filter(r => r.studentId === selectedStudentId).map(result => {
      const testInfo = assessmentList.find(a => a.id === result.assessmentId);
      return { 
        testName: testInfo ? testInfo.title : 'Unknown', 
        percentage: testInfo ? Math.round((result.score / testInfo.maxScore) * 100) : 0, 
        score: result.score, 
        maxScore: testInfo ? testInfo.maxScore : 100, 
        feedback: result.feedback 
      };
    });
  }

  if (!teacher) return null;
  const studentsList = users.filter(u => u.role === 'student');

  // ==========================================
  // VIEW RENDERERS 
  // ==========================================

  const PageWrapper = ({ children, keyName }) => (
    <motion.div key={keyName} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );

  const renderDashboard = () => (
    <PageWrapper keyName="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h1 style={{ margin: 0, color: 'var(--text-main)' }}>Educator Portal</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Logged in as {teacher.name}</p></div>
        <button onClick={() => setIsGradeModalOpen(true)} style={{ padding: '12px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Grade Student</button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Total Students</h4><h2 style={{ margin: 0, fontSize: '36px', color: '#6366f1' }}>{studentStats.length}</h2></div>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Class Average</h4><h2 style={{ margin: 0, fontSize: '36px', color: classAverage >= 70 ? '#52c41a' : '#faad14' }}>{classAverage}%</h2></div>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Students at Risk</h4><h2 style={{ margin: 0, fontSize: '36px', color: atRiskCount > 0 ? '#f5222d' : '#52c41a' }}>{atRiskCount}</h2></div>
      </div>
      
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Performance Overview</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={studentStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Student Roster</h3>
          <input type="text" placeholder="🔍 Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', width: '250px' }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
              <th onClick={() => handleSort('name')} style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', color: 'var(--text-muted)' }}>Student Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => handleSort('average')} style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', color: 'var(--text-muted)' }}>Overall Average {sortConfig.key === 'average' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {processedStudents.map((stat, index) => (
              <tr key={index} onClick={() => setSelectedStudentId(stat.id)} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <td style={{ padding: '16px', color: '#6366f1', fontWeight: 'bold' }}>{stat.name}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{stat.average}%</td>
                <td style={{ padding: '16px' }}><span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: stat.average >= 70 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(245, 34, 45, 0.1)', color: stat.average >= 70 ? '#52c41a' : '#f5222d' }}>{stat.average >= 70 ? 'On Track' : 'Needs Support'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );

  const renderAssessments = () => (
    <PageWrapper keyName="assessments">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h1 style={{ margin: 0, color: 'var(--text-main)' }}>Assignments Manager</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Create new assignments for your classes.</p></div>
        <button onClick={() => setIsAssessmentModalOpen(true)} style={{ padding: '12px 24px', backgroundColor: '#722ed1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>➕ New Assignment</button>
      </div>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Title</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Subject</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Max Score</th>
            </tr>
          </thead>
          <tbody>
            {assessmentList.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{a.title}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{a.subject}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{a.date}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{a.maxScore} pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );

  const renderReports = () => (
    <PageWrapper keyName="reports">
      <div style={{ marginBottom: '30px' }}><h1 style={{ margin: 0, color: 'var(--text-main)' }}>Analytics & Reports</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Generate data exports for administrative review.</p></div>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📑</div>
        <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Class Performance Export</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '20px' }}>Download a complete, unformatted CSV file containing all current student averages and tracking statuses.</p>
        <button onClick={generateReport} style={{ padding: '12px 24px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>📊 Download CSV Report</button>
      </div>
    </PageWrapper>
  );

  const renderSettings = () => (
    <PageWrapper keyName="settings">
      <div style={{ marginBottom: '30px' }}><h1 style={{ margin: 0, color: 'var(--text-main)' }}>Account Settings</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage your profile and preferences.</p></div>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>Full Name</label><input type="text" disabled value={teacher.name} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '6px' }} /></div>
        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>Email Address</label><input type="email" disabled value={teacher.email} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '6px' }} /></div>
        <button onClick={() => toast('Settings updating feature coming soon!')} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Change Password</button>
      </div>
    </PageWrapper>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      
      <Sidebar role={teacher.role} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'assessments' && renderAssessments()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MODAL 1: GRADE A STUDENT FOR AN EXISTING ASSIGNMENT --- */}
      <AnimatePresence>
        {isGradeModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-main)' }}>Grade Student</h2>
              <form onSubmit={handleAddGrade} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Select Assignment</label>
                  <select required value={newGrade.assessmentId} onChange={e => setNewGrade({...newGrade, assessmentId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="">Choose an assignment...</option>
                    {assessmentList.map(a => <option key={a.id} value={a.id}>{a.title} ({a.maxScore} pts)</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Select Student</label>
                  <select required value={newGrade.studentId} onChange={e => setNewGrade({...newGrade, studentId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="">Choose a student...</option>
                    {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Score Achieved</label>
                  <input required type="number" value={newGrade.score} onChange={e => setNewGrade({...newGrade, score: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Educator Remarks</label>
                  <textarea required rows="3" placeholder="e.g., Great work on the logic section." value={newGrade.feedback} onChange={e => setNewGrade({...newGrade, feedback: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsGradeModalOpen(false)} style={{ padding: '10px 15px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Grade</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: CREATE A NEW ASSIGNMENT GLOBALLY --- */}
      <AnimatePresence>
        {isAssessmentModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-main)' }}>Create Assignment</h2>
              <form onSubmit={handleAddAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Assignment Title</label><input required type="text" placeholder="e.g., Final Project" value={newAssessment.title} onChange={e => setNewAssessment({...newAssessment, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Subject Domain</label><input required type="text" placeholder="e.g., Computer Science" value={newAssessment.subject} onChange={e => setNewAssessment({...newAssessment, subject: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Max Possible Score</label><input required type="number" min="1" value={newAssessment.maxScore} onChange={e => setNewAssessment({...newAssessment, maxScore: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} /></div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAssessmentModalOpen(false)} style={{ padding: '10px 15px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#722ed1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStudentId && selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, scale: 0.9, opacity: 0 }} style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-light)', paddingBottom: '15px', marginBottom: '20px' }}><div><h2 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{selectedStudent.name}'s Profile</h2><span style={{ color: 'var(--text-muted)' }}>{selectedStudent.email}</span></div><button onClick={() => setSelectedStudentId(null)} style={{ padding: '8px 12px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button></div>
              <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Progress Timeline</h3><div style={{ width: '100%', height: 250, backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '10px', marginBottom: '20px' }}><ResponsiveContainer><LineChart data={selectedStudentGrades}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="testName" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)' }} /><Line type="monotone" dataKey="percentage" stroke="#722ed1" strokeWidth={3} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>
              <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Assessment History</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{selectedStudentGrades.map((grade, index) => (<div key={index} style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>{grade.testName}</h4><span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{grade.feedback}"</span></div><strong style={{ color: grade.percentage >= 70 ? '#52c41a' : '#f5222d', fontSize: '18px' }}>{grade.score} / {grade.maxScore}</strong></div>))}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeacherDashboard;