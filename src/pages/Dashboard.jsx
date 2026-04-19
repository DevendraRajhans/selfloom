import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Flame, Target, Smile, Clock, Loader2, BookOpen, PlusCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';


export const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }
    const fetchData = async () => {
      try {
        const res = await API.get('/dashboard/summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard summary', err);
      }
    };
    fetchData();
  }, [navigate]);

  const getMoodColor = (mood) => {
    if (mood === 'Happy') return '#4CAF50';
    if (mood === 'Neutral') return '#FFC107';
    if (mood === 'Sad') return '#F44336';
    return '#ccc';
  };

  const processedMoodData = (summary?.moodSummary || []).map(m => ({
    ...m,
    color: getMoodColor(m.name)
  }));

  const processedTimeData = summary?.timeUsage ? [
    { name: 'Study', hours: summary.timeUsage.study || 0 },
    { name: 'Waste', hours: summary.timeUsage.waste || 0 },
    { name: 'Score', hours: summary.timeUsage.productiveScore || 0 },
  ] : [];

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = summary.streak === 0 && summary.totalStudyTime === 0 && (summary.weeklyProductivity || []).every(d => d.value === 0);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-24 h-24 bg-primary-light/50 rounded-full flex items-center justify-center text-primary mb-4">
          <BookOpen strokeWidth={1.5} size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No entries yet. Start logging today.</h2>
        <p className="text-gray-500 max-w-sm">Build your consistency and unlock deep insights.</p>
        <Button onClick={() => navigate('/daily-entry')} size="lg" className="mt-4 flex items-center gap-2">
          <PlusCircle size={20} />
          Log Today's Entry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name || 'User'}</h1>
          <p className="text-gray-500">Here's a summary of your recent activity.</p>
        </div>
        <Button onClick={() => navigate('/daily-entry')}>Log Today's Entry</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Current Streak</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.streak ?? 0} Days</p>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Productivity</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.avgProductivity ?? 0}%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center">
            <Smile size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dominant Mood</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.dominantMood || '-'}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Study Time</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.totalStudyTime ?? 0}h</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Productivity</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.weeklyProductivity || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={3} dot={{r: 4, fill: '#4CAF50', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Mood Summary</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedMoodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {processedMoodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm font-medium text-gray-600">
            {processedMoodData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Time Usage (Week)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedTimeData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} width={60} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="hours" fill="#4CAF50" radius={[0, 4, 4, 0]} barSize={32}>
                  {
                    processedTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4CAF50' : index === 1 ? '#F44336' : '#2196F3'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 px-1">Smart Suggestions</h3>
          {summary?.suggestions && summary.suggestions.length > 0 ? (
            summary.suggestions.map((suggestion, idx) => (
              <Card key={idx} className={`border-l-4 ${idx % 2 === 0 ? 'border-l-primary bg-primary-light/30' : 'border-l-yellow-400 bg-yellow-50/50'}`}>
                <h4 className="font-bold text-gray-900 mb-1">Insight</h4>
                <p className="text-sm text-gray-600">{suggestion}</p>
              </Card>
            ))
          ) : (
            <Card className="border-l-4 border-l-gray-400 bg-gray-50/50 p-5">
              <p className="text-sm text-gray-600">No suggestions available yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
