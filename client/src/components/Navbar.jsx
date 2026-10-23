import React from 'react';
import { IconNotes, IconUser, IconLogOut } from './Icons';

export const Navbar = ({ user, onLogout, dbStatus }) => {
  // Extract initials for user avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-content">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-logo-badge">
            <IconNotes size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Personal Notes</span>
            <span className="brand-badge">MERN</span>
          </div>
        </div>

        {/* User Status & Actions */}
        <div className="navbar-user-area">
          {/* Database connection badge */}
          {dbStatus && (
            <div className={`db-status-pill ${dbStatus === 'connected' ? 'connected' : 'standalone'}`} title={dbStatus === 'connected' ? 'Connected to MongoDB' : 'Running in local fallback mode'}>
              <span className="status-dot"></span>
              <span className="status-text">{dbStatus === 'connected' ? 'MongoDB Online' : 'Local Mode'}</span>
            </div>
          )}

          {/* User profile capsule */}
          <div className="user-capsule">
            <div className="user-avatar" title={user?.name || 'User'}>
              {getInitials(user?.name)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Personal Workspace'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            className="btn-logout"
            title="Sign out of your account"
            id="logout-btn"
          >
            <IconLogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
