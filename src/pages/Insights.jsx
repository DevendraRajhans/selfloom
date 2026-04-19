import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Card } from '../components/ui/Card';
import { Trophy, Smartphone, LineChart, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Insights = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }
    const fetchInsights = async () => {
      try {
        const res = await API.get('/dashboard/insights');
        setInsights(res.data);
      } catch (err) {
        console.error('Failed to fetch insights', err);
      }
    };
    fetchInsights();
  }, [navigate]);

  if (!insights) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = insights.bestDayOfWeek === 'N/A' && insights.topDistraction === 'N/A' && insights.averageMood === 'N/A';

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-24 h-24 bg-primary-light/50 rounded-full flex items-center justify-center text-primary mb-4">
          <BrainCircuit strokeWidth={1.5} size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">More entries needed to generate insights.</h2>
        <p className="text-gray-500 max-w-sm">Keep journaling daily to uncover patterns about your focus, distractions, and mood.</p>
        <Button onClick={() => navigate('/daily-entry')} size="lg" className="mt-4">
          Start Journaling
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Insights</h1>
        <p className="text-gray-500">Deep dive into your habits and patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Best Day of Week</h3>
            <p className="text-3xl font-black text-gray-900 mb-2">{insights?.bestDayOfWeek || 'N/A'}</p>
            <p className="text-sm text-gray-600">You average more study time on this day.</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Top Distraction</h3>
            <p className="text-3xl font-black text-gray-900 mb-2">{insights?.topDistraction || 'N/A'}</p>
            <p className="text-sm text-gray-600">Your most frequent distraction.</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-100 text-yellow-500 flex items-center justify-center">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Average Mood</h3>
            <p className="text-3xl font-black text-gray-900 mb-2">{insights?.averageMood || 'N/A'}</p>
            <p className="text-sm text-gray-600">Your general mood trend.</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
            <LineChart size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Progress Trend</h3>
            <p className="text-3xl font-black text-gray-900 mb-2">{(insights?.progressTrend > 0 ? '+' : '')}{insights?.progressTrend ?? 0}%</p>
            <p className="text-sm text-gray-600">Productivity change compared to last week.</p>
          </div>
        </Card>
      </div>

      <Card className="mt-8 bg-gradient-to-br from-primary/10 to-primary-light/5 border-none">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Reflections & Suggestions</h3>
        <div className="text-gray-700 leading-relaxed max-w-3xl space-y-2">
          {insights?.suggestions?.length > 0 ? (
            <ul className="list-disc pl-5">
              {insights.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p>Log a few more entries to unlock personalized reflections.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
