import React from 'react';
import { Plus, Edit3, Trash2, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

const TaskBoard = ({ tasks, onEditTask, onDeleteTask, onUpdateStatus, onOpenAddModal }) => {
  const columns = [
    { id: 'Todo', title: 'To Do', color: 'var(--text-secondary)' },
    { id: 'In Progress', title: 'In Progress', color: 'var(--warning)' },
    { id: 'Completed', title: 'Completed', color: 'var(--success)' },
  ];

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'tag-priority-high';
      case 'Medium': return 'tag-priority-medium';
      case 'Low': return 'tag-priority-low';
      default: return 'tag-priority-low';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  };

  return (
    <div className="kanban-board">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="kanban-column">
            <div className="column-header">
              <span className="column-title" style={{ color: col.color }}>
                {col.title}
              </span>
              <span className="column-badge">{colTasks.length}</span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAddModal(col.id)}
              style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: '0.25rem' }}
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>

            <div className="column-cards-container">
              {colTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  No tasks here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div key={task._id} className="task-card">
                    <div className="task-card-header">
                      <h4 className="task-card-title">{task.title}</h4>
                      <span className={`tag ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="task-card-desc">{task.description}</p>
                    )}

                    <div className="task-card-tags">
                      <span className="tag tag-category">{task.category || 'General'}</span>
                    </div>

                    <div className="task-card-footer">
                      <div className={`task-card-date ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
                        {task.dueDate && (
                          <>
                            <Calendar size={12} />
                            <span>{formatDate(task.dueDate)}</span>
                          </>
                        )}
                      </div>

                      <div className="task-card-actions">
                        {col.id !== 'Todo' && (
                          <button
                            className="card-action-btn"
                            title="Move back"
                            onClick={() => onUpdateStatus(task._id, col.id === 'Completed' ? 'In Progress' : 'Todo')}
                          >
                            <ArrowLeft size={14} />
                          </button>
                        )}

                        <button
                          className="card-action-btn"
                          title="Edit Task"
                          onClick={() => onEditTask(task)}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          className="card-action-btn btn-delete"
                          title="Delete Task"
                          onClick={() => onDeleteTask(task._id)}
                        >
                          <Trash2 size={14} />
                        </button>

                        {col.id !== 'Completed' && (
                          <button
                            className="card-action-btn"
                            title="Move forward"
                            onClick={() => onUpdateStatus(task._id, col.id === 'Todo' ? 'In Progress' : 'Completed')}
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
