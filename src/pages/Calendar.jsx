import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { ChevronLeft, ChevronRight, X, BookOpen, Loader2 } from 'lucide-react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }
    fetchMonthEntries();
  }, [currentDate, navigate]);

  const fetchMonthEntries = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 1-12
      const res = await API.get(`/dashboard/calendar?month=${month}&year=${year}`);
      
      const entriesMap = {};
      res.data.forEach(entry => {
         entriesMap[entry.date] = entry;
      });
      setEntries(entriesMap);
    } catch (err) {
      console.error("Failed to fetch calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayStr) => {
    setSelectedDateString(dayStr);
    setSelectedEntry(entries[dayStr] || null);
    setIsModalOpen(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const pad = (num) => num.toString().padStart(2, '0');
  
  const today = new Date();
  const todayString = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
          <p className="text-gray-500">Track your consistency over time.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">{monthName} {year}</h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {Object.keys(entries).length === 0 && (
              <div className="mb-6 p-6 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <BookOpen size={24} />
                </div>
                <p className="text-gray-600 font-medium">No entries for this month.</p>
              </div>
            )}
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-bold text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="aspect-square rounded-xl bg-transparent"></div>
              ))}
              
              {days.map(day => {
                const dayStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                const entry = entries[dayStr];
                
                let isProductive = false;
                let isLow = false;
                let isNeutral = false;

                if (entry) {
                  if (entry.studyTime > entry.wasteTime) isProductive = true;
                  else if (entry.wasteTime > entry.studyTime) isLow = true;
                  else isNeutral = true;
                }

                const isToday = dayStr === todayString;

                return (
                  <div 
                    key={day}
                    onClick={() => handleDayClick(dayStr)}
                    className={cn(
                      'aspect-square rounded-xl flex items-center justify-center font-medium text-sm md:text-base cursor-pointer transform hover:scale-105 transition-all duration-300 border-2',
                      isProductive
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : isLow 
                          ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' 
                          : isNeutral
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-md shadow-yellow-400/20'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300',
                      isToday && !entry && 'border-primary text-primary',
                      isToday && entry && 'ring-2 ring-offset-2 ring-primary'
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap gap-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span className="text-sm text-gray-600 font-medium">Productive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600 font-medium">Low Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <span className="text-sm text-gray-600 font-medium">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-100 bg-white"></div>
            <span className="text-sm text-gray-600 font-medium">No Entry</span>
          </div>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
          <Card className="w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{new Date(selectedDateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            
            {selectedEntry ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Mood</span>
                  <span className="font-bold text-gray-900">{selectedEntry.mood || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Study Time</span>
                  <span className="font-bold text-gray-900">{selectedEntry.studyTime}h</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Waste Time</span>
                  <span className="font-bold text-gray-900">{selectedEntry.wasteTime}h</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Score</span>
                  <span className="font-bold text-gray-900">{selectedEntry.score}</span>
                </div>
                {selectedEntry.notes && (
                  <div className="pt-2">
                    <span className="text-gray-500 font-medium block mb-1">Notes</span>
                    <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-xl">{selectedEntry.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <p>No entry for this day.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
