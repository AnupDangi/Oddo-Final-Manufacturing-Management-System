import WorkOrder from '../models/WorkOrderModel.js';

export class WorkOrderController {
    /**
     * Create a new work order
     */
    static async createWorkOrder(req, res) {
        try {
            const { manufacturing_order, work_center, sequence_number, planned_hours } = req.body;

            if (!manufacturing_order || !work_center || !sequence_number || !planned_hours) {
                return res.status(400).json({
                    success: false,
                    message: 'Manufacturing Order, Work Center, Sequence, and Planned Hours are required'
                });
            }

            const workOrder = new WorkOrder({ ...req.body });
            await workOrder.save();

            res.status(201).json({
                success: true,
                message: 'Work order created successfully',
                data: workOrder
            });
        } catch (error) {
            // Handle unique constraint violation
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'This sequence number already exists for this manufacturing order.' });
            }
            res.status(500).json({ success: false, message: 'Failed to create work order', error: error.message });
        }
    }

    /**
     * Get all work orders with filtering
     */
    static async getAllWorkOrders(req, res) {
        try {
            const { status, manufacturing_order, work_center, operator } = req.query;
            const filter = {};
            if (status) filter.status = status;
            if (manufacturing_order) filter.manufacturing_order = manufacturing_order;
            if (work_center) filter.work_center = work_center;
            if (operator) filter.operator = operator;

            const workOrders = await WorkOrder.find(filter)
                .populate('manufacturing_order')
                .populate('work_center')
                .populate('operator', 'name email');

            res.json({
                success: true,
                message: 'Work orders retrieved successfully',
                data: workOrders
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve work orders', error: error.message });
        }
    }

    /**
     * Get a single work order by ID
     */
    static async getWorkOrderById(req, res) {
        try {
            const workOrder = await WorkOrder.findById(req.params.id)
                .populate('manufacturing_order')
                .populate('work_center')
                .populate('operator', 'name email');

            if (!workOrder) {
                return res.status(404).json({ success: false, message: 'Work order not found' });
            }
            res.json({ success: true, data: workOrder });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve work order', error: error.message });
        }
    }

    /**
     * Start a work order
     */
    static async startWorkOrder(req, res) {
        try {
            const workOrder = await WorkOrder.findById(req.params.id);
            if (!workOrder) {
                return res.status(404).json({ success: false, message: 'Work order not found' });
            }
            if (workOrder.status !== 'Pending') {
                return res.status(400).json({ success: false, message: `Cannot start a work order with status: ${workOrder.status}` });
            }

            workOrder.status = 'In Progress';
            workOrder.operator = req.user.id; // Assumes auth middleware provides req.user.id
            workOrder.start_time = new Date();
            await workOrder.save();

            res.json({ success: true, message: 'Work order started successfully', data: workOrder });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to start work order', error: error.message });
        }
    }
    
    /**
     * Complete a work order
     */
    static async completeWorkOrder(req, res) {
        try {
            const workOrder = await WorkOrder.findById(req.params.id);
            if (!workOrder) {
                return res.status(404).json({ success: false, message: 'Work order not found' });
            }
            if (workOrder.status !== 'In Progress') {
                 return res.status(400).json({ success: false, message: `Cannot complete a work order with status: ${workOrder.status}` });
            }

            workOrder.status = 'Completed';
            workOrder.end_time = new Date();
            
            // Calculate actual hours worked
            if (workOrder.start_time) {
                const durationInMs = workOrder.end_time - workOrder.start_time;
                workOrder.actual_hours = parseFloat((durationInMs / (1000 * 60 * 60)).toFixed(2));
            }
            
            await workOrder.save();

            res.json({ success: true, message: 'Work order completed successfully', data: workOrder });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to complete work order', error: error.message });
        }
    }
}