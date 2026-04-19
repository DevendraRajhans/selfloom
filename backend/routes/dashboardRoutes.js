const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/summary', auth, dashboardController.getSummary);
router.get('/insights', auth, dashboardController.getInsights);
router.get('/calendar', auth, dashboardController.getCalendarEntries);

module.exports = router;
