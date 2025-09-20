import WorkCenter from '../models/WorkCenterModel.js';

export class WorkCenterController {
    /**
     * Create a new work center
     */
    static async createWorkCenter(req, res) {
        try {
            const { name, capacity_per_hour, hourly_rate } = req.body;

            // Basic validation
            if (!name || !capacity_per_hour || !hourly_rate) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, capacity per hour, and hourly rate are required'
                });
            }

            const workCenter = new WorkCenter(req.body);
            await workCenter.save();

            res.status(201).json({
                success: true,
                message: 'Work center created successfully',
                data: workCenter
            });
        } catch (error) {
            // Handle unique name error from MongoDB
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'A work center with this name already exists.' });
            }
            res.status(500).json({ success: false, message: 'Failed to create work center', error: error.message });
        }
    }

    /**
     * Get all work centers with filtering
     */
    static async getAllWorkCenters(req, res) {
        try {
            const { is_active, search } = req.query;
            const filter = {};

            if (is_active !== undefined) {
                filter.is_active = is_active === 'true';
            }

            if (search) {
                // Case-insensitive search on name or description
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const workCenters = await WorkCenter.find(filter);

            res.json({
                success: true,
                message: 'Work centers retrieved successfully',
                data: workCenters
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve work centers', error: error.message });
        }
    }

    /**
     * Get a single work center by ID
     */
    static async getWorkCenterById(req, res) {
        try {
            const workCenter = await WorkCenter.findById(req.params.id);

            if (!workCenter) {
                return res.status(404).json({ success: false, message: 'Work center not found' });
            }
            res.json({ success: true, data: workCenter });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve work center', error: error.message });
        }
    }

    /**
     * Update a work center
     */
    static async updateWorkCenter(req, res) {
        try {
            const updatedWorkCenter = await WorkCenter.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true } // {new: true} returns the updated document
            );

            if (!updatedWorkCenter) {
                return res.status(404).json({ success: false, message: 'Work center not found' });
            }
            res.json({ success: true, message: 'Work center updated successfully', data: updatedWorkCenter });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to update work center', error: error.message });
        }
    }

    /**
     * Delete a work center (soft delete)
     */
    static async deleteWorkCenter(req, res) {
        try {
            const deactivatedWorkCenter = await WorkCenter.findByIdAndUpdate(
                req.params.id,
                { is_active: false },
                { new: true }
            );

            if (!deactivatedWorkCenter) {
                return res.status(404).json({ success: false, message: 'Work center not found' });
            }
            res.json({ success: true, message: 'Work center deactivated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to deactivate work center', error: error.message });
        }
    }
}