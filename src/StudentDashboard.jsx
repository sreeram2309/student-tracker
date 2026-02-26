import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { results, assessments } from './mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast'; 
import { motion, AnimatePresence } from 'framer-motion';

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [myGrades, setMyGrades] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [overallAvg, setOverallAvg] = useState(0);
  const [weakestSubject, setWeakestSubject] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        navigate('/');
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      setStudent(parsedUser);

      const studentResults = results.filter((r) => r.studentId === parsedUser.id);
      let totalPercent = 0;
      let validGradesCount = 0;
      
      const formattedGrades = studentResults.map((result) => {
        const testInfo = assessments.find((a) => a.id === result.assessmentId) || {
          title: 'Unknown Assessment', subject: 'General', date: '2026-01-01', maxScore: 100
        };
        
        const safeMaxScore = testInfo.maxScore > 0 ? testInfo.maxScore : 100;
        const percentage = (result.score / safeMaxScore) * 100;
        
        totalPercent += percentage;
        validGradesCount++;
        
        return {
          ...result,
          testName: testInfo.title,
          subject: testInfo.subject,
          date: testInfo.date,
          maxScore: safeMaxScore,
          percentage: Math.round(percentage)
        };
      });

      formattedGrades.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMyGrades(formattedGrades);

      if (validGradesCount > 0) {
        setOverallAvg(Math.round(totalPercent / validGradesCount));
      }

      const subjectAverages = {};
      formattedGrades.forEach(grade => {
        const subj = grade.subject || 'General';
        if (!subjectAverages[subj]) {
          subjectAverages[subj] = { total: 0, count: 0 };
        }
        subjectAverages[subj].total += grade.percentage;
        subjectAverages[subj].count += 1;
      });

      const radarArray = [];
      let lowestScore = 101;
      let lowestSubjectName = '';

      for (const [subj, data] of Object.entries(subjectAverages)) {
        const avg = Math.round(data.total / data.count);
        radarArray.push({ subject: subj, score: avg, fullMark: 100 });
        if (avg < lowestScore) {
          lowestScore = avg;
          lowestSubjectName = subj;
        }
      }
      
      setRadarData(radarArray);
      setWeakestSubject(lowestSubjectName);
      
    } catch (error) {
      console.error("Dashboard failed to load data:", error);
      localStorage.removeItem('currentUser');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully!'); 
    navigate('/');
  };

  if (!student) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: 'var(--text-main)' }}><h2>Loading Dashboard...</h2></div>;

  // ==========================================
  // VIEW RENDERERS (With CSS Variables for Dark Mode!)
  // ==========================================

  const PageWrapper = ({ children, keyName }) => (
    <motion.div key={keyName} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );

  const renderDashboard = () => (
    <PageWrapper keyName="dashboard">
      <div style={{ marginBottom: '30px' }}><h1 style={{ margin: 0, color: 'var(--text-main)' }}>Student Portal</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome back, {student.name}</p></div>
      {weakestSubject && (
        <div style={{ backgroundColor: 'rgba(250, 173, 20, 0.1)', borderLeft: '5px solid #faad14', padding: '15px 20px', borderRadius: '4px', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#d48806' }}>💡 Area for Improvement Identified</h4>
          <p style={{ margin: 0, color: 'var(--text-main)' }}>Your current performance in <strong>{weakestSubject}</strong> is lower than your other subjects. Consider reviewing recent feedback and dedicating extra study time here.</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Overall Average</h4><h2 style={{ margin: 0, fontSize: '36px', color: overallAvg >= 70 ? '#52c41a' : '#f5222d' }}>{overallAvg}%</h2></div>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Assessments Completed</h4><h2 style={{ margin: 0, fontSize: '36px', color: '#6366f1' }}>{myGrades.length}</h2></div>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 500px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Progress Over Time</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={[...myGrades].reverse()}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="testName" tick={{ fill: 'var(--text-muted)' }} /><YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)' }} /><Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={4} activeDot={{ r: 8 }} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Subject Mastery</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}><PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} /><Radar name="Student" dataKey="score" stroke="#722ed1" fill="#722ed1" fillOpacity={0.5} /><Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }} /></RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageWrapper>
  );

  const renderAssessments = () => (
    <PageWrapper keyName="assessments">
      <div style={{ marginBottom: '30px' }}><h1 style={{ margin: 0, color: 'var(--text-main)' }}>My Assessments</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Review your past grades and educator feedback.</p></div>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {myGrades.map((grade) => (
            <div key={grade.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid var(--border-light)`, padding: '15px', borderRadius: '8px' }}>
              <div><h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{grade.testName} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '10px' }}>({grade.subject}) - {grade.date}</span></h4><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>💬 "{grade.feedback}"</p></div>
              <div style={{ textAlign: 'right' }}><strong style={{ fontSize: '20px', color: grade.percentage >= 70 ? '#52c41a' : '#f5222d' }}>{grade.percentage}%</strong><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{grade.score}/{grade.maxScore} pts</div></div>
            </div>
          ))}
          {myGrades.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No assessments graded yet.</p>}
        </div>
      </div>
    </PageWrapper>
  );

  const renderSettings = () => (
    <PageWrapper keyName="settings">
      <div style={{ marginBottom: '30px' }}><h1 style={{ margin: 0, color: 'var(--text-main)' }}>Account Settings</h1><p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage your student profile.</p></div>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>Full Name</label><input type="text" disabled value={student.name} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '6px' }} /></div>
        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>Student Email</label><input type="email" disabled value={student.email} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '6px' }} /></div>
        <button onClick={() => toast('Settings updating feature coming soon!')} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Change Password</button>
      </div>
    </PageWrapper>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      <Sidebar role={student.role} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'assessments' && renderAssessments()}
            {activeTab === 'settings' && renderSettings()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;