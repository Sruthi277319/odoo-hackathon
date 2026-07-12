import express from 'express';
import {
  getSmartDashboard,
  recommendVehicle,
  getVehicleTimeline,
  sendLicenseReminder,
} from '../controllers/smartFeaturesController.js';

const router = express.Router();

router.get('/dashboard', getSmartDashboard);
router.get('/recommendation', recommendVehicle);
router.get('/timeline/:id', getVehicleTimeline);
router.post('/license-reminder', sendLicenseReminder);

export default router;
