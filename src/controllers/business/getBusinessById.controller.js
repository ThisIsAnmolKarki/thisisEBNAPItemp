// src/controllers/business/getBusinessById.controller.js
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { User } from '../../models/Users/User.model.js';
import Review from '../../models/review.model.js';
import { Sequelize } from 'sequelize';

export const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findOne({
      where: { id: businessId },
      include: [
        {
          model: BusinessInformation,
          as: 'businessInformation'
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "reviews"
              WHERE "reviews"."business_id" = "Business"."id"
            )`),
            'reviewCount'
          ],
          [
            Sequelize.literal(`(
              CASE 
                WHEN (SELECT COUNT(*) FROM "reviews" WHERE "reviews"."business_id" = "Business"."id") > 0 
                THEN (
                  SELECT AVG(rating)
                  FROM "reviews"
                  WHERE "reviews"."business_id" = "Business"."id"
                )
                ELSE (
                  SELECT COALESCE(rating, 0)
                  FROM "Business_Information"
                  WHERE "Business_Information"."business_id" = "Business"."id"
                )
              END
            )`),
            'averageRating'
          ]
        ]
      }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: business.id,
        businessName: business.businessName,
        description: business.description,
        category: business.category,
        address: business.address,
        contactDetails: business.contactDetails,
        isVerified: business.isVerified,
        viewCount: business.viewCount || 0,
        reviewCount: parseInt(business.getDataValue('reviewCount') || 0),
        averageRating: parseFloat(business.getDataValue('averageRating') || 0).toFixed(1),
        owner: {
          username: business.owner.username,
          firstName: business.owner.firstName,
          lastName: business.owner.lastName
        },
        businessInformation: business.businessInformation ? {
          rating: business.businessInformation.rating,
          price: business.businessInformation.price,
          image_url: business.businessInformation.image_url,
          menu_url: business.businessInformation.menu_url,
          opening_hours: business.businessInformation.opening_hours,
          country: business.businessInformation.country,
          city: business.businessInformation.city,
          coordinates: {
            latitude: business.businessInformation.Latitude,
            longitude: business.businessInformation.Longitude
          }
        } : null,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business',
      error: error.message
    });
  }
};