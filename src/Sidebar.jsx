import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function Sidebar({ role, onLogout, activeTab, setActiveTab }) {
  const [isDark, setIsDark] = useState(false);

  // 1. Check for saved theme when the app loads
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      setIsDark(true);
    }
  }, []);

  // 2. The switch!
  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      toast('Switched to Light Mode', { icon: '☀️' });
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      toast('Switched to Dark Mode', { icon: '🌙' });
    }
  };

  const getTabStyle = (tabName) => ({
    padding: '15px 25px', 
    cursor: 'pointer', 
    backgroundColor: activeTab === tabName ? '#1890ff' : 'transparent', 
    borderRight: activeTab === tabName ? '4px solid #fff' : 'none', 
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    opacity: activeTab === tabName ? 1 : 0.7,
    transition: '0.3s'
  });

  return (
    <div style={{ width: '250px', backgroundColor: 'var(--sidebar-bg)', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, transition: '0.3s' }}>
      
      <div style={{ padding: '20px', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🎓 EduTracker
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 0', flex: 1 }}>
        <div style={getTabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
        <div style={getTabStyle('assessments')} onClick={() => setActiveTab('assessments')}>📝 Assessments</div>
        {role === 'teacher' && (
          <div style={getTabStyle('reports')} onClick={() => setActiveTab('reports')}>📑 Reports</div>
        )}
        <div style={getTabStyle('settings')} onClick={() => setActiveTab('settings')}>⚙️ Settings</div>
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* THE NEW THEME TOGGLE BUTTON */}
        <button onClick={toggleTheme} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s' }}>
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <button onClick={onLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🚪 Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;