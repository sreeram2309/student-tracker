import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { users } from './mockData';
import toast from 'react-hot-toast'; // <-- Import the toast trigger

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      
      // 🎉 FIRE A SUCCESS TOAST!
      toast.success(`Welcome back, ${foundUser.name}!`);
      
      if (foundUser.role === 'teacher') navigate('/teacher');
      else if (foundUser.role === 'student') navigate('/student');
    } else {
      // ❌ FIRE AN ERROR TOAST!
      toast.error('Invalid email or password. Try again!');
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginTop: 0 }}>EduTracker</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Sign in to your account</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d9d9d9', boxSizing: 'border-box', fontSize: '16px' }} placeholder="teacher@school.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d9d9d9', boxSizing: 'border-box', fontSize: '16px' }} placeholder="••••••••" />
          </div>
          <button type="submit" style={{ padding: '14px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
            Login to Dashboard
          </button>
        </form>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>Demo Accounts:</strong>
          <div>🧑‍🏫 Teacher: teacher@school.com / 123</div>
          <div style={{ marginTop: '4px' }}>🎓 Student: alice@school.com / 123</div>
        </div>
      </div>
    </div>
  );
}

export default Login;