import express from 'express';
import {
  getMaintenances,
  createMaintenance,
  updateMaintenance,
  closeMaintenance,
  getMaintenanceById,
  deleteMaintenance,
} from '../controllers/maintenanceController.js';

const router = express.Router();

router.route('/')
  .get(getMaintenances)
  .post(createMaintenance);

router.route('/:id')
  .get(getMaintenanceById)
  .put(updateMaintenance)
  .delete(deleteMaintenance);

router.put('/:id/close', closeMaintenance);

export default router;
