import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const Header = ({ currentUser, isSocketConnected }) => {
  return (
    <header className="dashboard-header">
      <div className="header-welcome">
        <h1>Welcome back, {currentUser?.username || 'User'}!</h1>
        <p>Stay focused, organised, and productive today.</p>
      </div>

      <div className="header-controls">
        <div className="sync-indicator">
          <div className={`sync-dot ${isSocketConnected ? 'connected' : 'disconnected'}`}></div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {isSocketConnected ? (
              <>
                <Wifi size={14} style={{ color: 'var(--success)' }} />
                <span>Live Syncing</span>
              </>
            ) : (
              <>
                <WifiOff size={14} style={{ color: 'var(--danger)' }} />
                <span>Offline Mode</span>
              </>
            )}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
