import React from 'react';
import { CheckSquare, LayoutDashboard, BarChart3, Sun, Moon, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, currentUser, onLogout, isDarkMode, onToggleTheme }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <CheckSquare size={26} color="var(--accent-primary)" />
          <span className="logo-text">ZenTask</span>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => onTabChange('analytics')}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={onToggleTheme}>
          {isDarkMode ? (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <div className="user-profile-badge">
          <div className="user-avatar">{getInitials(currentUser?.username)}</div>
          <div className="user-details">
            <span className="user-name">{currentUser?.username || 'User'}</span>
            <span className="user-role">{currentUser?.email || 'member'}</span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onLogout} style={{ display: 'flex', width: '100%', gap: '0.5rem', justifyContent: 'center' }}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
