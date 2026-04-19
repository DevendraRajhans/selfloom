const Entry = require('../models/Entry');

const getLocalDayRange = (dateString = null) => {
  let d;
  if (dateString) {
    const parts = dateString.split('-');
    d = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    d = new Date();
  }
  
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  
  const start = new Date(y, m, day, 0, 0, 0, 0);
  const end = new Date(y, m, day, 23, 59, 59, 999);
  const localDate = new Date(y, m, day, 0, 0, 0, 0);
  
  return { start, end, localDate };
};

// @route   POST /api/entries/add
// @desc    Add a new daily entry
exports.addEntry = async (req, res) => {
  try {
    const { date, mood, studyTime, wasteTime, notes, tags } = req.body;

    const score = studyTime - wasteTime;
    const { start, end, localDate } = getLocalDayRange(date);

    const existingEntry = await Entry.findOne({
      userId: req.user,
      date: { $gte: start, $lte: end }
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'An entry already exists for this date. Please update it instead.' });
    }

    const entry = await Entry.create({
      userId: req.user,
      date: localDate,
      mood,
      studyTime,
      wasteTime,
      notes,
      tags,
      score
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error adding entry', error: error.message });
  }
};

// @route   GET /api/entries/all
// @desc    Get all entries for the logged-in user
exports.getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entries', error: error.message });
  }
};

// @route   GET /api/entries/today
// @desc    Get the entry for today
exports.getTodayEntry = async (req, res) => {
  try {
    const { start, end } = getLocalDayRange();

    const entry = await Entry.findOne({
      userId: req.user,
      date: { $gte: start, $lte: end }
    });

    if (!entry) {
      return res.status(404).json({ message: 'No entry found for today' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today’s entry', error: error.message });
  }
};

// @route   PUT /api/entries/update/:id
// @desc    Update an existing entry by ID
exports.updateEntry = async (req, res) => {
  try {
    const { mood, studyTime, wasteTime, notes, tags } = req.body;
    let entry = await Entry.findOne({ _id: req.params.id, userId: req.user });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found or unauthorized' });
    }

    if (mood) entry.mood = mood;
    if (studyTime !== undefined) entry.studyTime = studyTime;
    if (wasteTime !== undefined) entry.wasteTime = wasteTime;
    if (notes !== undefined) entry.notes = notes;
    if (tags !== undefined) entry.tags = tags;

    // pre-save hook will recalculate the score
    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating entry', error: error.message });
  }
};

// @route   DELETE /api/entries/delete/:id
// @desc    Delete an entry by ID
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found or unauthorized' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting entry', error: error.message });
  }
};
