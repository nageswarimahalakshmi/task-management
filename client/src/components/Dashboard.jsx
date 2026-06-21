import React, { useState } from 'react';
import { Kanban, List, Plus, Inbox, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from './Header';
import TaskBoard from './TaskBoard';
import TaskList from './TaskList';
import TaskModal from './TaskModal';

const Dashboard = ({
  tasks,
  currentUser,
  isSocketConnected,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('Todo');

  // Compute visual dashboard metrics
  const metrics = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const progress = tasks.filter((t) => t.status === 'In Progress').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'Completed'
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, progress, overdue, completionRate };
  }, [tasks]);

  const handleOpenAddModal = (status = 'Todo') => {
    setTaskToEdit(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (taskData) => {
    if (taskToEdit) {
      await onUpdateTask(taskToEdit._id, taskData);
    } else {
      await onCreateTask(taskData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Top Welcome Bar */}
      <Header currentUser={currentUser} isSocketConnected={isSocketConnected} />

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-info">
            <span className="metric-value">{metrics.total}</span>
            <span className="metric-label">Total Tasks</span>
          </div>
          <div className="metric-icon">
            <ClipboardList size={22} />
          </div>
          <div className="metric-progress-wrapper">
            <div className="metric-progress-bar" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="glass-card metric-card completed">
          <div className="metric-info">
            <span className="metric-value">{metrics.completed}</span>
            <span className="metric-label">Completed</span>
          </div>
          <div className="metric-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-progress-wrapper">
            <div className="metric-progress-bar" style={{ width: `${metrics.completionRate}%` }}></div>
          </div>
        </div>

        <div className="glass-card metric-card progress">
          <div className="metric-info">
            <span className="metric-value">{metrics.progress}</span>
            <span className="metric-label">In Progress</span>
          </div>
          <div className="metric-icon">
            <Inbox size={22} />
          </div>
          <div className="metric-progress-wrapper">
            <div className="metric-progress-bar" style={{ width: `${metrics.total > 0 ? (metrics.progress / metrics.total) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="glass-card metric-card overdue">
          <div className="metric-info">
            <span className="metric-value">{metrics.overdue}</span>
            <span className="metric-label">Overdue</span>
          </div>
          <div className="metric-icon">
            <AlertCircle size={22} />
          </div>
          <div className="metric-progress-wrapper">
            <div className="metric-progress-bar" style={{ width: `${metrics.total > 0 ? (metrics.overdue / metrics.total) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Layout Control and Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Toggle between Board and List View */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
            onClick={() => setViewMode('board')}
          >
            <Kanban size={16} />
            <span>Kanban Board</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            <span>List Table</span>
          </button>
        </div>

        {/* Global create trigger */}
        <button className="btn btn-primary" onClick={() => handleOpenAddModal('Todo')}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Active Inner View Panel */}
      <div style={{ minHeight: '400px' }}>
        {viewMode === 'board' ? (
          <TaskBoard
            tasks={tasks}
            onEditTask={handleOpenEditModal}
            onDeleteTask={onDeleteTask}
            onUpdateStatus={onUpdateStatus}
            onOpenAddModal={handleOpenAddModal}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onEditTask={handleOpenEditModal}
            onDeleteTask={onDeleteTask}
          />
        )}
      </div>

      {/* Shared Edit/Create Task Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatus}
      />
    </div>
  );
};

export default Dashboard;
