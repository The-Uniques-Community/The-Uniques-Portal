import express from 'express';
import { getPendingFines, getFineHistory } from '../../controller/admin/fineController.js';

const memberFineRoute = express.Router();

memberFineRoute.get('/profile/fines/pending', async (req, res) => {
    // Set the member ID from the authenticated user
    req.params.memberId = req.user._id;
    return getPendingFines(req, res);
  });
  
  
memberFineRoute.get('/profile/fines', async (req, res) => {
    // Set the member ID from the authenticated user
    req.params.memberId = req.user._id;
    return getFineHistory(req, res);
  });

export default memberFineRoute;