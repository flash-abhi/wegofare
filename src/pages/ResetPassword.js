import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import './ResetPassword.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    // Verify token on page load
    const verifyToken = async () => {
      if (!email || !token) {
        setMessage({
          type: 'error',
          text: 'Invalid reset link'
        });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/password-reset/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, token })
        });

        const data = await response.json();

        if (data.success) {
          setTokenValid(true);
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Invalid or expired reset link'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to verify reset link'
        });
      }
    };

    verifyToken();
  }, [email, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters'
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: '✅ Password reset successful!'
        });
        
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to reset password'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <div className="icon-circle">
            {tokenValid ? <Lock size={32} /> : <CheckCircle size={32} />}
          </div>
          <h1>Reset Password</h1>
          {tokenValid && <p>Enter your new password below</p>}
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {tokenValid && (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {!tokenValid && !message.text && (
          <div className="loading">Verifying reset link...</div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
