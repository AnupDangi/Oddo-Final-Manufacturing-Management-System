import express from 'express';
import { StockLedgerController } from '../controllers/StockLedgerController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post(
    '/',
    auth,
    authorize('Admin', 'Inventory Manager'),
    StockLedgerController.createTransaction
);

router.get(
    '/ledger',
    auth,
    authorize('Admin', 'Inventory Manager', 'Manufacturing Manager'),
    StockLedgerController.getStockLedger
);

router.get(
    '/history/:productId',
    auth,
    authorize('Admin', 'Inventory Manager', 'Manufacturing Manager'),
    StockLedgerController.getProductStockHistory
);

export default router;