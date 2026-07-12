import express from 'express';
import { getFuelLogs, createFuelLog, deleteFuelLog } from '../controllers/fuelController.js';

const router = express.Router();

router.route('/')
  .get(getFuelLogs)
  .post(createFuelLog);

router.route('/:id')
  .delete(deleteFuelLog);

export default router;
