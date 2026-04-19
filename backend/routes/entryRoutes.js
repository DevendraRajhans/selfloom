const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const auth = require('../middleware/auth');

router.post('/add', auth, entryController.addEntry);
router.get('/all', auth, entryController.getAllEntries);
router.get('/today', auth, entryController.getTodayEntry);
router.put('/update/:id', auth, entryController.updateEntry);
router.delete('/delete/:id', auth, entryController.deleteEntry);

module.exports = router;
