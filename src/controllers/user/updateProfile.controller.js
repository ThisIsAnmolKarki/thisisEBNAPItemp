// src/controllers/users/updateProfile.controller.js
import { User } from '../../models/Users/User.model.js';
import { hashingPassword } from '../../processor/User/hashingPassword.processor.js';

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth middleware
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      profilePicture,
      Phone
    } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update object
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (password) updates.password = await hashingPassword(password);
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (profilePicture) updates.profilePicture = profilePicture;
    if (Phone) updates.Phone = Phone;

    // Update user
    await user.update(updates);

    // Remove sensitive data
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: `${error.errors[0].path} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};
