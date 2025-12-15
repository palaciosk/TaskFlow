import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Edit, Trash2, Calendar, Flag, CheckCircle2, Circle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import './TaskList.css';

const TaskList = ({ tasks, onEdit }) => {
  const [filter, setFilter] = useState('all');

  const handleToggleComplete = async (task) => {
    const taskRef = doc(db, 'tasks', task.id);
    await updateDoc(taskRef, {
      status: task.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteDoc(doc(db, 'tasks', taskId));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const getDueDateLabel = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const timeStr = format(date, 'h:mm a'); // Format time as "3:45 PM"
    
    if (isPast(date) && !isToday(date)) {
      return `Overdue - ${format(date, 'MMM d')} ${timeStr}`;
    }
    if (isToday(date)) {
      return `Today at ${timeStr}`;
    }
    if (isTomorrow(date)) {
      return `Tomorrow at ${timeStr}`;
    }
    return `${format(date, 'MMM d')} at ${timeStr}`;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No tasks yet</h3>
        <p>Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({tasks.filter(t => t.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.status === 'completed').length})
        </button>
      </div>

      <div className="task-grid">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
          >
            <div className="task-header">
              <button
                className="task-checkbox"
                onClick={() => handleToggleComplete(task)}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 size={20} color="var(--success)" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <h3 className="task-title">{task.title}</h3>
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-meta">
              {task.dueDate && (
                <div className="task-meta-item">
                  <Calendar size={16} />
                  <span className={isPast(new Date(task.dueDate)) && task.status !== 'completed' ? 'overdue' : ''}>
                    {getDueDateLabel(task.dueDate)}
                  </span>
                </div>
              )}
              {task.priority && (
                <div className="task-meta-item">
                  <Flag size={16} color={getPriorityColor(task.priority)} />
                  <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                </div>
              )}
            </div>

            <div className="task-actions">
              <button
                className="task-action-btn"
                onClick={() => onEdit(task)}
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="task-action-btn danger"
                onClick={() => handleDelete(task.id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;

