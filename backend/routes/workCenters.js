import express from 'express';
import WorkCenterController from '../controllers/WorkCenterController.js';
import { 
  requireAuth, 
  requireAdmin, 
  requireAdminOrManager,
  requireMinimumRole,
  requireActiveUser,
  authenticateToken
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication and active user check to all routes
router.use(authenticateToken);
router.use(requireActiveUser);

// ===== WORK CENTER CRUD ROUTES =====

/**
 * @route   POST /api/v1/work-centers
 * @desc    Create a new work center
 * @access  Private (Admin/Manager)
 */
router.post('/', requireAdminOrManager, WorkCenterController.createWorkCenter);

/**
 * @route   GET /api/v1/work-centers
 * @desc    Get all work centers with pagination and filtering
 * @access  Private (All authenticated users)
 * @query   page, limit, is_active, search, location
 */
router.get('/', requireAuth, WorkCenterController.getAllWorkCenters);

/**
 * @route   GET /api/v1/work-centers/search
 * @desc    Search work centers for dropdown/autocomplete
 * @access  Private (All authenticated users)
 * @query   q (search term)
 */
router.get('/search', requireAuth, WorkCenterController.searchWorkCenters);

/**
 * @route   GET /api/v1/work-centers/statistics
 * @desc    Get work center statistics overview
 * @access  Private (Manager/Admin)
 */
router.get('/statistics', requireAdminOrManager, WorkCenterController.getWorkCenterStatistics);

/**
 * @route   GET /api/v1/work-centers/:workCenterId
 * @desc    Get work center by ID
 * @access  Private (All authenticated users)
 */
router.get('/:workCenterId', requireAuth, WorkCenterController.getWorkCenterById);

/**
 * @route   PUT /api/v1/work-centers/:workCenterId
 * @desc    Update work center by ID
 * @access  Private (Admin/Manager)
 */
router.put('/:workCenterId', requireAdminOrManager, WorkCenterController.updateWorkCenter);

/**
 * @route   DELETE /api/v1/work-centers/:workCenterId
 * @desc    Deactivate work center (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:workCenterId', requireAdmin, WorkCenterController.deleteWorkCenter);

/**
 * @route   PUT /api/v1/work-centers/:workCenterId/working-hours
 * @desc    Update working hours for work center (internal use)
 * @access  Private (Manager/Admin)
 */
router.put('/:workCenterId/working-hours', requireAdminOrManager, WorkCenterController.updateWorkingHours);

// ===== DOWNTIME MANAGEMENT ROUTES =====

/**
 * @route   POST /api/v1/work-centers/:workCenterId/downtime
 * @desc    Log downtime for a work center
 * @access  Private (Manager/Operator minimum)
 * @body    { start_time, end_time?, reason }
 */
router.post('/:workCenterId/downtime', requireMinimumRole('Operator'), WorkCenterController.logDowntime);

/**
 * @route   GET /api/v1/work-centers/:workCenterId/downtime
 * @desc    Get downtime logs for a work center
 * @access  Private (All authenticated users)
 * @query   page, limit, start_date, end_date
 */
router.get('/:workCenterId/downtime', requireAuth, WorkCenterController.getDowntimeLogs);

/**
 * @route   PUT /api/v1/work-centers/downtime/:downtimeId/end
 * @desc    End downtime for a work center
 * @access  Private (Manager/Operator minimum)
 * @body    { end_time? }
 */
router.put('/downtime/:downtimeId/end', requireMinimumRole('Operator'), WorkCenterController.endDowntime);

// ===== UTILIZATION AND ANALYTICS ROUTES =====

/**
 * @route   GET /api/v1/work-centers/:workCenterId/utilization
 * @desc    Get work center utilization statistics
 * @access  Private (Manager/Admin)
 * @query   start_date, end_date
 */
router.get('/:workCenterId/utilization', requireAdminOrManager, WorkCenterController.getUtilizationStats);

// ===== VALIDATION MIDDLEWARE =====

/**
 * Validation middleware for work center creation/update
 */
const validateWorkCenterData = (req, res, next) => {
  const { name, hourly_cost, capacity_per_hour } = req.body;
  const errors = [];

  // Name validation
  if (name && name.trim().length < 2) {
    errors.push('Work center name must be at least 2 characters long');
  }

  // Hourly cost validation
  if (hourly_cost !== undefined && (isNaN(hourly_cost) || parseFloat(hourly_cost) < 0)) {
    errors.push('Hourly cost must be a non-negative number');
  }

  // Capacity validation
  if (capacity_per_hour !== undefined && (isNaN(capacity_per_hour) || parseFloat(capacity_per_hour) <= 0)) {
    errors.push('Capacity per hour must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for downtime logging
 */
const validateDowntimeData = (req, res, next) => {
  const { start_time, end_time, reason } = req.body;
  const errors = [];

  // Start time validation
  if (!start_time) {
    errors.push('Start time is required');
  } else if (isNaN(new Date(start_time).getTime())) {
    errors.push('Start time must be a valid date');
  }

  // End time validation (optional)
  if (end_time && isNaN(new Date(end_time).getTime())) {
    errors.push('End time must be a valid date');
  }

  // Validate end time is after start time
  if (start_time && end_time) {
    const start = new Date(start_time);
    const end = new Date(end_time);
    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }

  // Reason validation
  if (!reason || reason.trim().length < 3) {
    errors.push('Reason is required and must be at least 3 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Apply validation to relevant routes
router.post('/', validateWorkCenterData);
router.put('/:workCenterId', validateWorkCenterData);
router.post('/:workCenterId/downtime', validateDowntimeData);

// ===== ROUTE PARAMETER VALIDATION =====

/**
 * Validate work center ID parameter
 */
const validateWorkCenterId = (req, res, next) => {
  const { workCenterId } = req.params;
  
  if (!workCenterId || isNaN(workCenterId) || parseInt(workCenterId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid work center ID is required'
    });
  }

  req.params.workCenterId = parseInt(workCenterId);
  next();
};

/**
 * Validate downtime ID parameter
 */
const validateDowntimeId = (req, res, next) => {
  const { downtimeId } = req.params;
  
  if (!downtimeId || isNaN(downtimeId) || parseInt(downtimeId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid downtime ID is required'
    });
  }

  req.params.downtimeId = parseInt(downtimeId);
  next();
};

// Apply ID validation to routes that need it
router.get('/:workCenterId', validateWorkCenterId);
router.put('/:workCenterId', validateWorkCenterId);
router.delete('/:workCenterId', validateWorkCenterId);
router.put('/:workCenterId/working-hours', validateWorkCenterId);
router.post('/:workCenterId/downtime', validateWorkCenterId);
router.get('/:workCenterId/downtime', validateWorkCenterId);
router.get('/:workCenterId/utilization', validateWorkCenterId);
router.put('/downtime/:downtimeId/end', validateDowntimeId);

export default router;