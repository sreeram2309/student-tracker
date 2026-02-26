import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { results, assessments } from './mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
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

      const studentResults = results.filter(
        (r) => r.studentId === parsedUser.id
      );

      let totalPercent = 0;
      let validGradesCount = 0;

      const formattedGrades = studentResults.map((result) => {
        const testInfo =
          assessments.find((a) => a.id === result.assessmentId) || {
            title: 'Unknown Assessment',
            subject: 'General',
            date: '2026-01-01',
            maxScore: 100
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

      formattedGrades.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setMyGrades(formattedGrades);

      if (validGradesCount > 0) {
        setOverallAvg(Math.round(totalPercent / validGradesCount));
      }

      const subjectAverages = {};
      formattedGrades.forEach((grade) => {
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
      console.error('Dashboard failed to load data:', error);
      localStorage.removeItem('currentUser');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully!');
    navigate('/');
  };

  if (!student)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          color: 'var(--text-main)'
        }}
      >
        <h2>Loading Dashboard...</h2>
      </div>
    );

  const PageWrapper = ({ children, keyName }) => (
    <motion.div
      key={keyName}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  const sharedShadow =
    '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)';

  const renderDashboard = () => (
    <PageWrapper keyName="dashboard">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>
          Student Portal
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Welcome back, {student.name}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: sharedShadow
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>
            Overall Average
          </h4>
          <h2
            style={{
              margin: 0,
              fontSize: '36px',
              color: overallAvg >= 70 ? '#52c41a' : '#f5222d'
            }}
          >
            {overallAvg}%
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: sharedShadow
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>
            Assessments Completed
          </h4>
          <h2 style={{ margin: 0, fontSize: '36px', color: '#6366f1' }}>
            {myGrades.length}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div
          style={{
            flex: '2 1 500px',
            backgroundColor: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: sharedShadow
          }}
        >
          <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>
            Progress Over Time
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={[...myGrades].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="testName" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#6366f1"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          style={{
            flex: '1 1 300px',
            backgroundColor: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: sharedShadow
          }}
        >
          <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>
            Subject Mastery
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  dataKey="score"
                  stroke="#722ed1"
                  fill="#722ed1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageWrapper>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        role={student.role}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div style={{ flex: 1, padding: '40px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && renderDashboard()}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StudentDashboard;