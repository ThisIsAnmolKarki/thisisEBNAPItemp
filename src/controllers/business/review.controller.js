// src/controllers/review/review.controller.js
import Review from '../../models/review.model.js';
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { User } from '../../models/Users/User.model.js';
import { sequelize } from '../../db/db.js';

// src/controllers/review/review.controller.js
export const createReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { businessId, rating, comment, title } = req.body;

    // Validate title
    if (!title || title.length < 5 || title.length > 100) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Title must be between 5 and 100 characters'
      });
    }

    // Check if user has already reviewed this business
    const existingReview = await Review.findOne({
      where: {
        user_id: userId,  // Changed from userId to user_id
        business_id: businessId  // Changed from businessId to business_id
      }
    });

    if (existingReview) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this business. You can update your existing review instead.'
      });
    }

    // Create review
    const review = await Review.create({
      user_id: userId,  // Changed from userId to user_id
      business_id: businessId,  // Changed from businessId to business_id
      title,
      rating,
      comment
    }, { transaction });

    // Update business information average rating
    const reviews = await Review.findAll({
      where: { business_id: businessId },  // Changed from businessId to business_id
      attributes: ['rating']
    }, { transaction });

    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, rating) / (reviews.length + 1);

    await BusinessInformation.update({
      rating: averageRating
    }, {
      where: { business_id: businessId },  // Changed from businessId to business_id
      transaction
    });

    await transaction.commit();

    // Fetch complete review data with associations
    const completeReview = await Review.findOne({
      where: { id: review.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ]
    });

    // Format the response
    const formattedReview = {
      id: completeReview.id,
      title: completeReview.title,
      rating: completeReview.rating,
      comment: completeReview.comment,
      is_edited: completeReview.is_edited,
      createdAt: completeReview.createdAt,
      updatedAt: completeReview.updatedAt,
      user: {
        username: completeReview.user.username,
        firstName: completeReview.user.firstName,
        lastName: completeReview.user.lastName,
        profilePicture: completeReview.user.profilePicture || null
      },
      business: completeReview.business
    };

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: formattedReview
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

export const updateReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!review) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Update review
    await review.update({
      rating,
      comment,
      isEdited: true
    }, { transaction });

    // Update business information average rating
    const reviews = await Review.findAll({
      where: { businessId: review.businessId },
      attributes: ['rating']
    }, { transaction });

    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await BusinessInformation.update({
      rating: averageRating
    }, {
      where: { business_id: review.businessId },
      transaction
    });

    await transaction.commit();

    // Fetch updated review with associations
    const updatedReview = await Review.findOne({
      where: { id: reviewId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ]
    });

    // Format the response
    const formattedReview = {
      id: updatedReview.id,
      title: updatedReview.title,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      is_edited: updatedReview.is_edited,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      user: {
        username: updatedReview.user.username,
        firstName: updatedReview.user.firstName,
        lastName: updatedReview.user.lastName,
        profilePicture: updatedReview.user.profilePicture || null
      },
      business: updatedReview.business
    };

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: formattedReview
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

export const deleteReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await Review.findOne({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!review) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    const businessId = review.businessId;

    // Delete review
    await review.destroy({ transaction });

    // Update business information average rating
    const reviews = await Review.findAll({
      where: { businessId },
      attributes: ['rating']
    }, { transaction });

    const averageRating = reviews.length ? 
      reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 
      0;

    await BusinessInformation.update({
      rating: averageRating
    }, {
      where: { business_id: businessId },
      transaction
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

export const getBusinessReviews = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.findAndCountAll({
      where: { business_id: businessId },
      include: [
        {
          model: User,
          as: 'user',
          // Updated to include profilePicture
          attributes: ['username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(reviews.count / parseInt(limit));

    // Format the response to ensure profile picture is properly structured
    const formattedReviews = reviews.rows.map(review => ({
      id: review.id,
      title: review.title,
      rating: review.rating,
      comment: review.comment,
      is_edited: review.is_edited,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        username: review.user.username,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        profilePicture: review.user.profilePicture || null // Provide fallback if no picture
      },
      business: review.business // Keep existing business data structure
    }));

    res.status(200).json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          total: reviews.count,
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};
