import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Inbox } from 'lucide-react';

const Analytics = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const todo = tasks.filter(t => t.status === 'Todo').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'Completed').length;

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priorities
    const high = tasks.filter(t => t.priority === 'High').length;
    const medium = tasks.filter(t => t.priority === 'Medium').length;
    const low = tasks.filter(t => t.priority === 'Low').length;

    // Categories
    const catCounts = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categoryStats = Object.keys(catCounts).map(cat => ({
      name: cat,
      count: catCounts[cat],
      percentage: total > 0 ? Math.round((catCounts[cat] / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      rate,
      high,
      medium,
      low,
      categoryStats
    };
  }, [tasks]);

  if (stats.total === 0) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', textAlign: 'center' }}>
        <Inbox size={48} color="var(--text-muted)" />
        <div>
          <h3>No tasks found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create some tasks on the dashboard to see your analytics charts.</p>
        </div>
      </div>
    );
  }

  // Circular progress calculations for SVG
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.rate / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2>Performance Analytics</h2>

      {/* Top metrics row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-info">
            <span className="metric-value">{stats.total}</span>
            <span className="metric-label">Total Tasks</span>
          </div>
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="glass-card metric-card completed">
          <div className="metric-info">
            <span className="metric-value">{stats.completed}</span>
            <span className="metric-label">Completed</span>
          </div>
          <div className="metric-icon">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="glass-card metric-card overdue">
          <div className="metric-info">
            <span className="metric-value">{stats.overdue}</span>
            <span className="metric-label">Overdue</span>
          </div>
          <div className="metric-icon">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Left card: Priorities & Categories */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1.25rem' }}>Tasks by Priority</h3>
            <div className="analytics-chart-container">
              <div className="bar-chart-row">
                <span className="bar-chart-label">High Priority</span>
                <div className="bar-chart-fill-wrapper">
                  <div className="bar-chart-fill" style={{ width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%`, background: 'var(--danger)' }}></div>
                </div>
                <span className="bar-chart-value">{stats.high}</span>
              </div>

              <div className="bar-chart-row">
                <span className="bar-chart-label">Medium Priority</span>
                <div className="bar-chart-fill-wrapper">
                  <div className="bar-chart-fill" style={{ width: `${stats.total > 0 ? (stats.medium / stats.total) * 100 : 0}%`, background: 'var(--warning)' }}></div>
                </div>
                <span className="bar-chart-value">{stats.medium}</span>
              </div>

              <div className="bar-chart-row">
                <span className="bar-chart-label">Low Priority</span>
                <div className="bar-chart-fill-wrapper">
                  <div className="bar-chart-fill" style={{ width: `${stats.total > 0 ? (stats.low / stats.total) * 100 : 0}%`, background: 'var(--accent-primary)' }}></div>
                </div>
                <span className="bar-chart-value">{stats.low}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Tasks by Category</h3>
            <div className="analytics-chart-container">
              {stats.categoryStats.map(cat => (
                <div key={cat.name} className="bar-chart-row">
                  <span className="bar-chart-label">{cat.name}</span>
                  <div className="bar-chart-fill-wrapper">
                    <div className="bar-chart-fill" style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                  <span className="bar-chart-value">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right card: Completion rates */}
        <div className="glass-card circular-progress-container">
          <h3>Task Completion</h3>
          
          <div className="circular-progress-ring">
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="var(--border-color)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="var(--success)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="circular-progress-text">
              {stats.rate}%
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              You have completed <strong>{stats.completed}</strong> out of <strong>{stats.total}</strong> assigned tasks.
            </p>
            {stats.rate === 100 ? (
              <p style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.85rem' }}>🔥 Fantastic job! All caught up!</p>
            ) : stats.rate > 50 ? (
              <p style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.85rem' }}>👍 You are making great progress!</p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Keep ticking items off your list!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
