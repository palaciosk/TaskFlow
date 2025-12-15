import { useMemo } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import './TaskStats.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const TaskStats = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const byPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // Weekly completion trend
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weeklyData = weekDays.map(day => {
      const dayTasks = tasks.filter(t => {
        if (!t.updatedAt) return false;
        const taskDate = new Date(t.updatedAt);
        return isSameDay(taskDate, day) && t.status === 'completed';
      });
      return dayTasks.length;
    });

    return {
      total,
      completed,
      pending,
      overdue,
      byPriority,
      weeklyData,
      weekDays: weekDays.map(d => format(d, 'EEE'))
    };
  }, [tasks]);

  const statusChartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.completed, stats.pending],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderColor: ['#10b981', '#f59e0b'],
        borderWidth: 2
      }
    ]
  };

  const priorityChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 2
      }
    ]
  };

  const weeklyChartData = {
    labels: stats.weekDays,
    datasets: [
      {
        label: 'Tasks Completed',
        data: stats.weeklyData,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: '#6366f1',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a0a0b0',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 32, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#a0a0b0',
        borderColor: '#2a2a3a',
        borderWidth: 1,
        padding: 12
      }
    }
  };

  return (
    <div className="task-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            📊
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            ✅
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            ⏳
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            ⚠️
          </div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Task Status</h3>
          <div className="chart-container">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          <div className="chart-container">
            <Bar data={priorityChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Weekly Completion Trend</h3>
          <div className="chart-container">
            <Line data={weeklyChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;

