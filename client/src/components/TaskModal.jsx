import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSubmit, taskToEdit, defaultStatus }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryPresets = ['General', 'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Urgent'];

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'Todo');
      setPriority(taskToEdit.priority || 'Medium');
      setCategory(taskToEdit.category || 'General');
      
      if (taskToEdit.dueDate) {
        // Formulate date string as YYYY-MM-DD for date input
        const dateObj = new Date(taskToEdit.dueDate);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        setDueDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setDueDate('');
      }
    } else {
      // Clear fields for new task creation
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || 'Todo');
      setPriority('Medium');
      setCategory('General');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, defaultStatus, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return setError('Title is required');
    }

    try {
      setError('');
      setLoading(true);

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        category: category.trim() || 'General',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      await onSubmit(taskData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="glass-card modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              className="form-control"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className="form-control"
              placeholder="Add details, notes, or subtasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Todo">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-category">Category</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="task-category"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Work, Shopping"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ flexGrow: 1 }}
                  list="category-options"
                />
                <datalist id="category-options">
                  {categoryPresets.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '100px' }}>
              {loading ? (
                <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
              ) : taskToEdit ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default TaskModal;
