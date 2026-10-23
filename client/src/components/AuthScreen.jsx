import React, { useState } from 'react';
import { api } from '../services/api';
import { IconNotes, IconUser, IconMail, IconLock, IconSpinner, IconAlert } from './Icons';

export const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await api.auth.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name.');
        }
        response = await api.auth.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onAuthSuccess(response.user, isLogin ? 'Welcome back!' : 'Account created successfully!');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setFormData({
      name: 'Alex Developer',
      email: 'alex@example.com',
      password: 'password123',
    });
    setError(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glow" />
      <div className="auth-card glass-panel animate-scale-up">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <IconNotes size={28} className="auth-logo-icon" />
          </div>
          <h1 className="auth-title">Personal Notes App</h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Welcome back! Sign in to access your personal notes.'
              : 'Create an account to start organizing your thoughts.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-banner animate-fade-in">
            <IconAlert size={18} className="auth-error-icon" />
            <span>{error}</span>
            <button
              type="button"
              className="auth-error-close"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group animate-fade-in">
              <label htmlFor="auth-name">Full Name</label>
              <div className="input-with-icon">
                <IconUser size={18} className="input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-with-icon">
              <IconMail size={18} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <IconLock size={18} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
            {!isLogin && (
              <span className="form-hint">Minimum 6 characters required</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-content-loading">
                <IconSpinner size={18} />
                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </span>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Free Account'}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="auth-footer">
          <button
            type="button"
            className="demo-fill-btn"
            onClick={handleFillDemo}
          >
            Fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
