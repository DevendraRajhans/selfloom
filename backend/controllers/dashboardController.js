const Entry = require('../models/Entry');
const mongoose = require('mongoose');

// Helper to calculate streak
const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries descending by date
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has an entry, if not, check if yesterday has an entry
  // For a basic streak, if the first entry is today or yesterday, we start counting
  const firstEntryDate = new Date(sorted[0].date);
  firstEntryDate.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(currentDate - firstEntryDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 0; // Streak broken

  let checkDate = new Date(firstEntryDate);

  for (let i = 0; i < sorted.length; i++) {
    const entryDate = new Date(sorted[i].date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // Move back one day
    } else if (entryDate.getTime() > checkDate.getTime()) {
      continue; // Duplicate entry on the same day can be ignored for streak
    } else {
      break; // Gap found, streak ends
    }
  }

  return streak;
};

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary statistics
exports.getSummary = async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user }).sort({ date: 1 });

    if (entries.length === 0) {
      return res.json({
        streak: 0,
        avgProductivity: 0,
        dominantMood: 'N/A',
        totalStudyTime: 0,
        weeklyProductivity: [],
        moodSummary: [],
        timeUsage: { study: 0, waste: 0, productiveScore: 0 },
        suggestions: []
      });
    }

    const streak = calculateStreak(entries);
    
    let totalStudyTime = 0;
    let totalWasteTime = 0;
    let totalScore = 0;
    const moodCounts = { Happy: 0, Neutral: 0, Sad: 0 };
    
    let sadMoodCountLast7Days = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let recentStudyTime = 0;
    let previousStudyTime = 0;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    entries.forEach(entry => {
      totalStudyTime += entry.studyTime;
      totalWasteTime += entry.wasteTime;
      totalScore += entry.score;
      if (entry.mood) moodCounts[entry.mood]++;
      
      if (entry.date >= sevenDaysAgo && entry.mood === 'Sad') {
        sadMoodCountLast7Days++;
      }
      if (entry.date >= sevenDaysAgo) {
        recentStudyTime += entry.studyTime;
      } else if (entry.date >= fourteenDaysAgo && entry.date < sevenDaysAgo) {
        previousStudyTime += entry.studyTime;
      }
    });

    const avgProductivity = totalStudyTime > 0 ? ((totalScore / totalStudyTime) * 100).toFixed(1) : 0;
    
    let dominantMood = 'Neutral';
    let maxMoodCount = -1;
    const moodSummary = [];
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxMoodCount) {
        maxMoodCount = count;
        dominantMood = mood;
      }
      moodSummary.push({ name: mood, value: count });
    }

    // Weekly data (last 7 days reversed so oldest is first)
    const weeklyProductivity = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayEntry = entries.find(e => {
        const d = new Date(e.date);
        d.setHours(0,0,0,0);
        return d.getTime() === targetDate.getTime();
      });

      weeklyProductivity.push({
        day: dayName,
        value: dayEntry ? dayEntry.score : 0,
      });
    }

    const timeUsage = {
      study: totalStudyTime,
      waste: totalWasteTime,
      productiveScore: totalScore
    };

    let progressTrend = 0;
    if (previousStudyTime > 0) {
      progressTrend = ((recentStudyTime - previousStudyTime) / previousStudyTime) * 100;
    } else if (recentStudyTime > 0) {
      progressTrend = 100;
    }

    const suggestions = [];
    if (totalWasteTime > totalStudyTime) {
      suggestions.push("Your waste time is exceeding study time. Consider reducing distractions.");
    }
    if (sadMoodCountLast7Days >= 3) {
      suggestions.push("Multiple sad entries recently. Remember to take breaks and rest.");
    }
    if (streak > 5) {
      suggestions.push(`Fantastic ${streak}-day streak! Keep up the great consistency.`);
    }
    if (progressTrend > 10) {
      suggestions.push(`Great progress! Study time increased by ${progressTrend.toFixed(0)}% vs last week.`);
    }
    if (suggestions.length === 0) {
       suggestions.push("Log more entries to unlock personalized insights.");
    }

    res.json({
      streak,
      avgProductivity: parseFloat(avgProductivity),
      dominantMood,
      totalStudyTime,
      weeklyProductivity,
      moodSummary,
      timeUsage,
      suggestions
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};

// @route   GET /api/dashboard/insights
// @desc    Get dashboard insights and rule-based suggestions
exports.getInsights = async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user }).sort({ date: 1 });

    if (entries.length === 0) {
      return res.json({
        bestDayOfWeek: 'N/A',
        topDistraction: 'N/A',
        averageMood: 'N/A',
        progressTrend: 0,
        suggestions: []
      });
    }

    const dayStats = {};
    const tagsCount = {};
    let totalMoodScore = 0; // Happy=3, Neutral=2, Sad=1
    let totalWasteTime = 0;
    let totalStudyTime = 0;

    let sadMoodCountLast7Days = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    entries.forEach(entry => {
      // Day of week
      const date = new Date(entry.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayStats[day]) dayStats[day] = { count: 0, score: 0 };
      dayStats[day].count++;
      dayStats[day].score += entry.score;

      // Dynamic Top Distraction logic based on rules
      if (entry.wasteTime > 0) {
        const lowerNotes = (entry.notes || '').toLowerCase();
        let cat = "Uncategorized";
        
        if (/(youtube|reels|instagram|facebook|scrolling)/.test(lowerNotes)) {
          cat = "Social Media";
        } else if (/(game|gaming|pubg|bgmi|freefire)/.test(lowerNotes)) {
          cat = "Gaming";
        } else if (/(sleep|nap|tired|lazy|overslept)/.test(lowerNotes)) {
          cat = "Sleep / Low Energy";
        } else if (/(friends|outing|chatting|call|party)/.test(lowerNotes)) {
          cat = "Social / Friends";
        } else if (/(movie|netflix|anime|webseries)/.test(lowerNotes)) {
          cat = "Entertainment";
        } else if (/(phone|mobile|notifications)/.test(lowerNotes)) {
          cat = "Phone Usage";
        } else if (/(procrastination|delayed|avoided|distracted)/.test(lowerNotes)) {
          cat = "Procrastination";
        }
        
        // Use weighted score: higher wasteTime entries count more
        tagsCount[cat] = (tagsCount[cat] || 0) + entry.wasteTime;
      }

      // Mood
      if (entry.mood === 'Happy') totalMoodScore += 3;
      else if (entry.mood === 'Neutral') totalMoodScore += 2;
      else if (entry.mood === 'Sad') totalMoodScore += 1;

      if (entry.date >= sevenDaysAgo && entry.mood === 'Sad') {
        sadMoodCountLast7Days++;
      }

      totalWasteTime += entry.wasteTime;
      totalStudyTime += entry.studyTime;
    });

    // Best Day
    let bestDayOfWeek = 'N/A';
    let maxAvgScore = -Infinity;
    for (const [day, stats] of Object.entries(dayStats)) {
      const avg = stats.score / stats.count;
      if (avg > maxAvgScore) {
        maxAvgScore = avg;
        bestDayOfWeek = day;
      }
    }

    // Top distraction
    let topDistraction = 'No clear distraction trend';
    let maxTagScore = 0;
    for (const [tag, score] of Object.entries(tagsCount)) {
      if (tag === 'Uncategorized' || tag === 'General Distraction') continue;

      if (score > maxTagScore) {
        maxTagScore = score;
        topDistraction = tag;
      }
    }

    // Average Mood
    const avgMoodScore = totalMoodScore / entries.length;
    let averageMood = 'Neutral';
    if (avgMoodScore > 2.5) averageMood = 'Happy';
    else if (avgMoodScore < 1.5) averageMood = 'Sad';

    // Progress trend (comparing last 7 days to previous 7 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let recentStudyTime = 0;
    let previousStudyTime = 0;

    let recentWasteTime = 0;
    let previousWasteTime = 0;

    entries.forEach(entry => {
      if (entry.date >= sevenDaysAgo) {
        recentStudyTime += entry.studyTime;
        recentWasteTime += entry.wasteTime;
      } else if (entry.date >= fourteenDaysAgo && entry.date < sevenDaysAgo) {
        previousStudyTime += entry.studyTime;
        previousWasteTime += entry.wasteTime;
      }
    });

    let progressTrend = 0;
    if (previousStudyTime > 0) {
      progressTrend = ((recentStudyTime - previousStudyTime) / previousStudyTime) * 100;
    } else if (recentStudyTime > 0) {
      progressTrend = 100; // infinite % up if previous was 0 and now we have time
    }

    // Dynamic Rule-based suggestions
    const suggestions = [];
    
    if (progressTrend > 0) {
      suggestions.push("Great progress! Your study time increased this week.");
    }
    
    if (recentWasteTime > previousWasteTime) {
      suggestions.push("Waste time increased recently. Consider reducing distractions.");
    }

    if (averageMood === 'Sad') {
      suggestions.push("Your recent mood trend is low. Consider breaks and lighter goals.");
    }

    if (averageMood === 'Happy' && recentStudyTime > 10) { // arbitrary "high study" threshold
      suggestions.push("You perform best on positive mood days. Repeat those habits.");
    }

    const streak = calculateStreak(entries);
    if (streak >= 2) {
      suggestions.push("You are building consistency. Keep the streak alive.");
    }

    if (suggestions.length === 0) {
      suggestions.push("Start logging entries daily to unlock insights.");
    }

    const finalSuggestions = suggestions.slice(0, 4);

    res.json({
      bestDayOfWeek,
      topDistraction,
      averageMood,
      progressTrend: parseFloat(progressTrend.toFixed(1)),
      suggestions: finalSuggestions
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching insights', error: error.message });
  }
};

// @route   GET /api/dashboard/calendar
// @desc    Get entries for a specific month and year
exports.getCalendarEntries = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    // Convert to Date objects
    // Note: month is 1-indexed from front-end
    const m = parseInt(month) - 1;
    const y = parseInt(year);
    
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    
    const entries = await Entry.find({
      userId: req.user,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });
    
    res.json(entries.map(e => {
      const y = e.date.getFullYear();
      const m = String(e.date.getMonth() + 1).padStart(2, '0');
      const d = String(e.date.getDate()).padStart(2, '0');
      return {
        id: e._id,
        date: `${y}-${m}-${d}`,
        mood: e.mood,
        studyTime: e.studyTime,
        wasteTime: e.wasteTime,
        score: e.score,
        notes: e.notes
      };
    }));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar entries', error: error.message });
  }
};
