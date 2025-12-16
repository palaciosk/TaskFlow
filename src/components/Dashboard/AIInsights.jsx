import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getProductivityInsights } from '../../firebase/ai-service';
import './AIInsights.css';

const AIInsights = ({ tasks }) => {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateInsights = async () => {
    if (tasks.length === 0) {
      alert('Please create some tasks first to get insights!');
      return;
    }

    setLoading(true);
    try {
      const generatedInsights = await getProductivityInsights(tasks);
      setInsights(generatedInsights);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const taskSummary = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
  };

  const completionRate = taskSummary.total > 0
    ? Math.round((taskSummary.completed / taskSummary.total) * 100)
    : 0;

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <div>
          <h2>AI Productivity Insights</h2>
          <p>Get personalized recommendations based on your task patterns</p>
        </div>
        <button
          onClick={handleGenerateInsights}
          className="btn btn-primary"
          disabled={loading || tasks.length === 0}
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="spinning" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Insights
            </>
          )}
        </button>
      </div>

      <div className="insights-content">
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{completionRate}%</div>
            <div className="quick-stat-label">Completion Rate</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{taskSummary.pending}</div>
            <div className="quick-stat-label">Pending Tasks</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{taskSummary.overdue}</div>
            <div className="quick-stat-label">Overdue</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{taskSummary.highPriority}</div>
            <div className="quick-stat-label">High Priority</div>
          </div>
        </div>

        {loading && (
          <div className="insights-loading">
            <div className="loading-spinner"></div>
            <p>AI is analyzing your tasks...</p>
          </div>
        )}

        {!loading && insights && (
          <div className="insights-card">
            <div className="insights-card-header">
              <Sparkles size={20} color="var(--accent-primary)" />
              <h3>Your Personalized Insights</h3>
            </div>
            <div className="insights-text">
              {insights.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {!loading && !insights && hasGenerated && (
          <div className="insights-empty">
            <p>Unable to generate insights at this time. Please try again.</p>
          </div>
        )}

        {!loading && !insights && !hasGenerated && (
          <div className="insights-empty">
            <Sparkles size={48} color="var(--text-muted)" />
            <h3>Ready for Insights</h3>
            <p>Click "Generate Insights" to get AI-powered productivity recommendations based on your tasks.</p>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="insights-empty">
            <p>Create some tasks to get AI-powered insights!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;

