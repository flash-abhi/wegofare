import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        if (data.resetLink) {
          // Email not configured, show the link directly
          setMessage({
            type: 'success',
            text: `✅ Reset link generated! Click here to reset your password:`,
            link: data.resetLink
          });
        } else {
          setMessage({
            type: 'success',
            text: '✅ Password reset link sent! Check your email.'
          });
        }
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to send reset email'
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
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <button className="back-btn" onClick={() => navigate('/admin/login')}>
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="forgot-password-header">
          <div className="icon-circle">
            <Mail size={32} />
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            {message.link && (
              <div style={{ marginTop: '10px' }}>
                <a 
                  href={message.link} 
                  style={{ 
                    color: '#0ea5e9', 
                    wordBreak: 'break-all',
                    display: 'block',
                    padding: '10px',
                    background: '#f0f0ff',
                    borderRadius: '5px',
                    marginTop: '5px'
                  }}
                >
                  {message.link}
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@wegofare.com"
              required
              disabled={isLoading}
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
                Sending...
              </>
            ) : (
              <>
                <Mail size={20} />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="help-text">
          <p>Remember your password? <a href="/admin/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
