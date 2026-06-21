import React, { useState, useEffect, useCallback } from 'react';
import { api } from './utils/api';
import { initSocket, disconnectSocket } from './utils/socket';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Login from './components/Login';
import Signup from './components/Signup';
import Toast from './components/Toast';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'signup'
  const [toasts, setToasts] = useState([]);

  // Toast system helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme Management
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // Fetch Current User Profile
  const fetchUser = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.success) {
        setCurrentUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Fetch user failed:', err.message);
      handleLogout();
    }
    return null;
  };

  // Fetch Tasks List
  const fetchTasks = async () => {
    try {
      const data = await api.get('/tasks');
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Fetch tasks failed:', err.message);
    }
  };

  // Setup WebSockets
  const setupWebSockets = useCallback((userId) => {
    const socket = initSocket(userId);

    const onConnect = () => {
      setIsSocketConnected(true);
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Initial check
    setIsSocketConnected(socket.connected);

    socket.on('taskEvent', ({ type, task, taskId, senderSocketId }) => {
      const activeSocketId = localStorage.getItem('socketId');
      const isCurrentSession = activeSocketId === senderSocketId;

      if (type === 'TASK_CREATED') {
        setTasks((prev) => {
          if (prev.some((t) => t._id === task._id)) return prev;
          return [task, ...prev];
        });
        if (!isCurrentSession) {
          addToast(`Task "${task.title}" created on another device`, 'success');
        }
      } else if (type === 'TASK_UPDATED') {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
        if (!isCurrentSession) {
          addToast(`Task "${task.title}" updated on another device`, 'warning');
        }
      } else if (type === 'TASK_DELETED') {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        if (!isCurrentSession) {
          addToast(`A task was deleted on another device`, 'danger');
        }
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('taskEvent');
      disconnectSocket();
    };
  }, [addToast]);

  // Auth Action handlers
  const handleLoginSuccess = (userToken, user) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setCurrentUser(user);
    addToast(`Welcome back, ${user.username}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentUser(null);
    setTasks([]);
    disconnectSocket();
    setIsSocketConnected(false);
    addToast('Logged out successfully', 'success');
  };

  // Orchestrate Initial Hydration & Sockets
  useEffect(() => {
    let cleanupSocket = () => {};

    if (token) {
      const initializeSession = async () => {
        const user = await fetchUser();
        if (user) {
          await fetchTasks();
          cleanupSocket = setupWebSockets(user.id);
        }
      };
      initializeSession();
    }

    return () => {
      cleanupSocket();
    };
  }, [token, setupWebSockets]);

  // CRUD API Actions
  const handleCreateTask = async (taskData) => {
    try {
      const data = await api.post('/tasks', taskData);
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        addToast('Task created successfully', 'success');
      }
    } catch (err) {
      addToast(err.message, 'danger');
      throw err;
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const data = await api.put(`/tasks/${taskId}`, taskData);
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
        addToast('Task updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.message, 'danger');
      throw err;
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const data = await api.put(`/tasks/${taskId}`, { status });
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
        addToast(`Task moved to ${status}`, 'success');
      }
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const data = await api.delete(`/tasks/${taskId}`);
        if (data.success) {
          setTasks((prev) => prev.filter((t) => t._id !== taskId));
          addToast('Task deleted successfully', 'success');
        }
      } catch (err) {
        addToast(err.message, 'danger');
      }
    }
  };

  // If not authenticated, render Login/Signup Screens
  if (!token || !currentUser) {
    return (
      <>
        {authScreen === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onToggleAuth={() => setAuthScreen('signup')}
          />
        ) : (
          <Signup
            onSignupSuccess={handleLoginSuccess}
            onToggleAuth={() => setAuthScreen('login')}
          />
        )}
        <Toast toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Screen panel area */}
      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <Dashboard
            tasks={tasks}
            currentUser={currentUser}
            isSocketConnected={isSocketConnected}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <Analytics tasks={tasks} />
        )}
      </main>

      {/* Floating notification Alerts */}
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default App;
