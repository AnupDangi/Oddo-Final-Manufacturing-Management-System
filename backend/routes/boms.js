import express from 'express';
import { BOMController } from '../controllers/BOMController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes - only accessible by Admin and Manufacturing Manager
router.post(
    '/boms',
    auth,
    authorize('Admin', 'Manufacturing Manager'),
    BOMController.createBOM
);

router.get(
    '/boms',
    auth,
    authorize('Admin', 'Manufacturing Manager', 'Operator'),
    BOMController.getAllBOMs
);

router.get(
    '/boms/:id',
    auth,
    authorize('Admin', 'Manufacturing Manager', 'Operator'),
    BOMController.getBOMById
);

router.put(
    '/boms/:id',
    auth,
    authorize('Admin', 'Manufacturing Manager'),
    BOMController.updateBOM
);

router.delete(
    '/boms/:id',
    auth,
    authorize('Admin'),
    BOMController.deleteBOM
);

export default router;