import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { X, Calendar, Flag, Sparkles, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { breakDownTask } from '../../firebase/ai-service';
import { scheduleReminder } from '../../utils/reminders';
import CalendarPicker from './CalendarPicker';
import './TaskForm.css';

const TaskForm = ({ task, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueHour, setDueHour] = useState('12');
  const [dueMinute, setDueMinute] = useState('00');
  const [dueAmPm, setDueAmPm] = useState('PM');
  const [priority, setPriority] = useState('medium');
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
        // Convert to 12-hour format
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format
        setDueHour(String(hours).padStart(2, '0'));
        setDueMinute(String(minutes).padStart(2, '0'));
        setDueAmPm(ampm);
      } else {
        setDueDate('');
        setDueHour('12');
        setDueMinute('00');
        setDueAmPm('PM');
      }
      setPriority(task.priority || 'medium');
      setReminderMinutes(task.reminderMinutes || 30);
    }
  }, [task]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target) &&
        dateInputRef.current && !dateInputRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      alert('Please enter a task title first');
      return;
    }

    setAiLoading(true);
    try {
      const breakdown = await breakDownTask(title);
      setSubtasks(breakdown);
      if (breakdown.length > 0) {
        const breakdownText = breakdown.map((st, i) => `${i + 1}. ${st.title}: ${st.description}`).join('\n');
        setDescription(prev => prev ? `${prev}\n\nSubtasks:\n${breakdownText}` : `Subtasks:\n${breakdownText}`);
      }
    } catch (error) {
      console.error('Error breaking down task:', error);
      alert('Failed to generate task breakdown');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper function to parse date string in local timezone (device's timezone)
      const parseLocalDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        // Create date in local timezone (month is 0-indexed in JavaScript)
        return new Date(year, month - 1, day);
      };

      // Combine date and time into a single datetime string
      let dueDateTime = null;
      if (dueDate) {
        // Convert 12-hour format to 24-hour format
        let hours24 = parseInt(dueHour, 10);
        if (dueAmPm === 'PM' && hours24 !== 12) {
          hours24 += 12;
        } else if (dueAmPm === 'AM' && hours24 === 12) {
          hours24 = 0;
        }
        const minutes = parseInt(dueMinute, 10);

        const combinedDate = parseLocalDate(dueDate);
        combinedDate.setHours(hours24, minutes, 0, 0);
        // Convert to ISO string (UTC) for storage, but preserves the local time intent
        dueDateTime = combinedDate.toISOString();
      }

      const taskData = {
        title,
        description,
        dueDate: dueDateTime,
        priority,
        reminderMinutes,
        status: task?.status || 'pending',
        userId: auth.currentUser.uid,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (task) {
        // Update existing task
        await updateDoc(doc(db, 'tasks', task.id), taskData);
      } else {
        // Create new task
        const docRef = await addDoc(collection(db, 'tasks'), taskData);

        // Schedule reminder if due date is set
        if (dueDateTime) {
          scheduleReminder({ ...taskData, id: docRef.id }, (reminderTask) => {
            alert(`Reminder: "${reminderTask.title}" is due in ${reminderTask.reminderMinutes || 30} minutes!`);
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Enter task title"
            />
            {!task && title && (
              <button
                type="button"
                onClick={handleAIBreakdown}
                className="ai-breakdown-btn"
                disabled={aiLoading}
              >
                <Sparkles size={16} />
                {aiLoading ? 'Generating...' : 'AI Breakdown'}
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input textarea"
              placeholder="Enter task description"
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group date-picker-group">
              <label>
                <Calendar size={16} />
                Due Date
              </label>
              <div className="date-input-wrapper">
                <input
                  ref={dateInputRef}
                  type="text"
                  value={dueDate ? format(new Date(dueDate + 'T00:00:00'), 'MMM d, yyyy') : ''}
                  onClick={() => setShowCalendar(!showCalendar)}
                  readOnly
                  className="input"
                  placeholder="Click to select date"
                />
                {showCalendar && (
                  <div ref={calendarRef} className="calendar-wrapper">
                    <CalendarPicker
                      selectedDate={dueDate}
                      onSelectDate={(date) => {
                        setDueDate(date);
                        setShowCalendar(false);
                      }}
                      onClose={() => setShowCalendar(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group time-picker-group">
              <label>
                <Clock size={16} />
                Due Time (Optional)
              </label>
              <div className="time-input-wrapper">
                <select
                  value={dueHour}
                  onChange={(e) => setDueHour(e.target.value)}
                  className="input time-select"
                  disabled={!dueDate}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = String(i + 1).padStart(2, '0');
                    return (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    );
                  })}
                </select>
                <span className="time-separator">:</span>
                <select
                  value={dueMinute}
                  onChange={(e) => setDueMinute(e.target.value)}
                  className="input time-select"
                  disabled={!dueDate}
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const minute = String(i).padStart(2, '0');
                    return (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={dueAmPm}
                  onChange={(e) => setDueAmPm(e.target.value)}
                  className="input time-select ampm-select"
                  disabled={!dueDate}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              {!dueDate && (
                <small className="form-hint">Select a date first to set a time</small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Flag size={16} />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <Bell size={16} />
                Reminder
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="input"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

