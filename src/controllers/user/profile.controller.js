// src/controllers/user/profile.controller.js
import { User } from '../../models/Users/User.model.js';

export const profile = async(req, res) => {
    try {
        // Get user ID from auth middleware
        const userId = req.user.id;

        // Find user in database
        const user = await User.findByPk(userId, {
            attributes: { 
                exclude: ['password'] // Exclude password from the response
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Send user data
        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};