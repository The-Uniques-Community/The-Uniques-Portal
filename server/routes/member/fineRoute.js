/**
 * @file fineRoute.js
 * @description Member-facing fine router providing self-service endpoints to view personal pending fines and fine history.
 * @architecture Mounted at `/api/fine` in server/index.js, proxying authenticated member context into admin fineController queries.
 */
import express from 'express';
import { getPendingFines, getFineHistory } from '../../controller/admin/fineController.js';
import verifyToken from '../../middlewares/verifyToken.js';

const memberFineRoute = express.Router();

memberFineRoute.get('/profile/fines/pending', verifyToken, async (req, res) => {
  req.params.memberId = req.user?._id || req.user?.id;
  return getPendingFines(req, res);
});

memberFineRoute.get('/profile/fines', verifyToken, async (req, res) => {
  req.params.memberId = req.user?._id || req.user?.id;
  return getFineHistory(req, res);
});

export default memberFineRoute;