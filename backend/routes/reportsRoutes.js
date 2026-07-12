import express from 'express';
import { getExportData, getReportsSummary } from '../controllers/reportsController.js';

const router = express.Router();

router.get('/export', getExportData);
router.get('/summary', getReportsSummary);

export default router;
