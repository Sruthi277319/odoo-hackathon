import express from 'express';
import { getExpenses, createExpense, getExpenseSummary, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.get('/summary', getExpenseSummary);

router.route('/:id')
  .delete(deleteExpense);

export default router;
