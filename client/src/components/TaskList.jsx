import React, { useState, useMemo } from 'react';
import { Edit3, Trash2, Calendar, Search, ArrowUp, ArrowDown, FilterX } from 'lucide-react';

const TaskList = ({ tasks, onEditTask, onDeleteTask }) => {
  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Sorting states
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Get unique categories list for filter dropdown
  const categories = useMemo(() => {
    const cats = tasks.map(t => t.category || 'General');
    return ['General', ...new Set(cats.filter(c => c !== 'General'))];
  }, [tasks]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const priorityWeights = { High: 3, Medium: 2, Low: 1 };

  // Filter & Sort tasks locally
  const processedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        const matchesCategory = !categoryFilter || (task.category || 'General') === categoryFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Weight priorities if sorting by priority
        if (sortField === 'priority') {
          valA = priorityWeights[a.priority] || 0;
          valB = priorityWeights[b.priority] || 0;
        }

        // Handle empty due dates
        if (sortField === 'dueDate') {
          if (!valA) return 1; // Put tasks without due dates at the end
          if (!valB) return -1;
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortField, sortOrder]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'tag-priority-high';
      case 'Medium': return 'tag-priority-medium';
      case 'Low': return 'tag-priority-low';
      default: return 'tag-priority-low';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Todo': return 'status-todo';
      case 'In Progress': return 'status-progress';
      case 'Completed': return 'status-completed';
      default: return 'status-todo';
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Dynamic Filter Panel */}
      <div className="action-bar glass-card">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Todo">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="select-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            className="select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {(searchQuery || statusFilter || priorityFilter || categoryFilter) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={clearFilters}
              style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
            >
              <FilterX size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main List Table */}
      <div className="list-view-container">
        <table className="task-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('title')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Title {getSortIcon('title')}
                </span>
              </th>
              <th>Description</th>
              <th className="sortable" onClick={() => handleSort('priority')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Priority {getSortIcon('priority')}
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort('status')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Status {getSortIcon('status')}
                </span>
              </th>
              <th>Category</th>
              <th className="sortable" onClick={() => handleSort('dueDate')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Due Date {getSortIcon('dueDate')}
                </span>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedTasks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No matching tasks found. Try tweaking your search filters or add a new task!
                </td>
              </tr>
            ) : (
              processedTasks.map((task) => (
                <tr key={task._id}>
                  <td className="table-title-cell">{task.title}</td>
                  <td className="table-desc-cell" title={task.description}>
                    {task.description || <span style={{ color: 'var(--text-muted)' }}>No description</span>}
                  </td>
                  <td>
                    <span className={`tag ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span className="tag tag-category">{task.category || 'General'}</span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {task.dueDate && <Calendar size={12} />}
                      {formatDate(task.dueDate)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
