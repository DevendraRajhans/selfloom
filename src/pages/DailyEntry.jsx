import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/cn';
import API from '../api';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const DailyEntry = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState(null);
  const [studyTime, setStudyTime] = useState('');
  const [wasteTime, setWasteTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }
    const fetchTodayEntry = async () => {
      try {
        const res = await API.get('/entries/today');
        if (res.data) {
          setExistingEntryId(res.data._id);
          setMood(res.data.mood ? res.data.mood.toLowerCase() : null);
          setStudyTime(res.data.studyTime || '');
          setWasteTime(res.data.wasteTime || '');
          setNotes(res.data.notes || '');
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Failed to fetch today's entry", err);
        }
      }
    };
    fetchTodayEntry();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood) {
      toast.error('Please select a mood');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mood: mood.charAt(0).toUpperCase() + mood.slice(1), // Match backend enum
        studyTime: Number(studyTime),
        wasteTime: Number(wasteTime),
        notes,
        tags: []
      };

      if (existingEntryId) {
        if (!window.confirm("Are you sure you want to update today's entry?")) {
          setLoading(false);
          return;
        }
        await API.put(`/entries/update/${existingEntryId}`, payload);
        toast.success('Entry Updated!');
      } else {
        await API.post('/entries/add', payload);
        toast.success('Entry Saved!');
        // reset form
        setMood(null);
        setStudyTime('');
        setWasteTime('');
        setNotes('');
        // We could also fetch the entry or set existingEntryId here to let them update it subsequently without refreshing,
        // but typically they're done for the day or will navigate away.
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Entry</h1>
        <p className="text-gray-500">How was your day today?</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-base font-bold text-gray-900 block">How are you feeling?</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setMood('happy')}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300',
                  mood === 'happy' 
                    ? 'border-primary bg-primary-light/30' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                )}
              >
                <span className="text-4xl mb-2">😊</span>
                <span className={cn('text-sm font-medium', mood === 'happy' ? 'text-primary' : 'text-gray-600')}>Happy</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMood('neutral')}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300',
                  mood === 'neutral' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                )}
              >
                <span className="text-4xl mb-2">😐</span>
                <span className={cn('text-sm font-medium', mood === 'neutral' ? 'text-yellow-600' : 'text-gray-600')}>Neutral</span>
              </button>

              <button
                type="button"
                onClick={() => setMood('sad')}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300',
                  mood === 'sad' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                )}
              >
                <span className="text-4xl mb-2">😔</span>
                <span className={cn('text-sm font-medium', mood === 'sad' ? 'text-red-500' : 'text-gray-600')}>Sad</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input 
              label="Study / Flow Time (hours)" 
              type="number" 
              step="0.5" 
              placeholder="e.g. 4.5" 
              value={studyTime}
              onChange={(e) => setStudyTime(e.target.value)}
              required 
            />
            <Input 
              label="Waste / Distracted Time (hours)" 
              type="number" 
              step="0.5" 
              placeholder="e.g. 2.0" 
              value={wasteTime}
              onChange={(e) => setWasteTime(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Notes & Reflections</label>
            <textarea
              rows={4}
              className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 resize-none"
              placeholder="What went well? What could be better tomorrow?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <Button type="submit" size="lg" className="w-full flex justify-center" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (existingEntryId ? "Update Today's Entry" : 'Save Journal Entry')}
          </Button>
        </form>
      </Card>
    </div>
  );
};
