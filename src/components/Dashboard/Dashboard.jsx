import { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { LogOut, Plus, Sparkles, BarChart3, Settings } from 'lucide-react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskStats from './TaskStats';
import AIInsights from './AIInsights';
import PhoneNumberModal from './PhoneNumberModal';
import SettingsModal from './SettingsModal';
import { scheduleReminder } from '../../utils/reminders';
import './Dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [userPhoneNumber, setUserPhoneNumber] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [phoneNumberChecked, setPhoneNumberChecked] = useState(false);
  const navigate = useNavigate();
  const reminderTimeouts = useRef({});

  // Fetch user phone number on mount and check if modal should be shown
  useEffect(() => {
    const fetchUserPhoneNumber = async () => {
      if (!auth.currentUser || phoneNumberChecked) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        let phone = null;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          phone = userData.phoneNumber || null;
        }

        setUserPhoneNumber(phone);
        setPhoneNumberChecked(true);

        // Show modal if user doesn't have a phone number
        // Small delay to let the dashboard render first
        if (!phone) {
          setTimeout(() => {
            setShowPhoneModal(true);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching user phone number:', error);
        setPhoneNumberChecked(true);
      }
    };

    fetchUserPhoneNumber();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!auth.currentUser) return;

    console.log('[Dashboard Debug] Setting up task listener. Current userPhoneNumber:', userPhoneNumber);

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);

      console.log('[Dashboard Debug] Tasks updated. Scheduling reminders with phone:', userPhoneNumber);

      // Schedule reminders for pending tasks with due dates
      tasksData.forEach(task => {
        if (task.status === 'pending' && task.dueDate) {
          // Clear existing reminder if any
          if (reminderTimeouts.current[task.id]) {
            clearTimeout(reminderTimeouts.current[task.id]);
          }

          // Schedule new reminder with user's phone number
          const timeoutId = scheduleReminder(task, (reminderTask) => {
            const minutes = reminderTask.reminderMinutes || 30;
            let timeText = `${minutes} minutes`;
            if (minutes >= 60) timeText = `${Math.floor(minutes / 60)} hours`;

            // Only alert if the document has focus to avoid double-double with native notification
            if (document.hasFocus()) {
              alert(`⏰ Reminder: "${reminderTask.title}" is due in ${timeText}!`);
            }
          }, userPhoneNumber);

          if (timeoutId) {
            reminderTimeouts.current[task.id] = timeoutId;
          }
        } else if (reminderTimeouts.current[task.id]) {
          // Clear reminder if task is completed or has no due date
          clearTimeout(reminderTimeouts.current[task.id]);
          delete reminderTimeouts.current[task.id];
        }
      });
    });

    return () => {
      console.log('[Dashboard Debug] Cleaning up task listener');
      unsubscribe();
      // Clear all reminders on unmount
      Object.values(reminderTimeouts.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, [userPhoneNumber]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handlePhoneModalClose = () => {
    setShowPhoneModal(false);
  };

  const handlePhoneNumberUpdate = (phoneNumber) => {
    setUserPhoneNumber(phoneNumber);
    setShowPhoneModal(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <Sparkles className="title-icon" />
              TaskFlow
            </h1>
          </div>
          <div className="header-right">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="btn btn-secondary icon-btn"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
        <button
          className={`nav-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <Sparkles size={18} />
          AI Insights
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>My Tasks</h2>
              <button onClick={handleCreateTask} className="btn btn-primary">
                <Plus size={18} />
                New Task
              </button>
            </div>
            <TaskList tasks={tasks} onEdit={handleEditTask} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <TaskStats tasks={tasks} />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-section">
            <AIInsights tasks={tasks} />
          </div>
        )}
      </main>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}

      {showPhoneModal && (
        <PhoneNumberModal
          onClose={handlePhoneModalClose}
          onSuccess={handlePhoneNumberUpdate}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onUpdate={(newNumber, newTheme) => {
            setUserPhoneNumber(newNumber);
            if (newTheme) {
              import('../../utils/themes').then(({ applyTheme }) => {
                applyTheme(newTheme);
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

