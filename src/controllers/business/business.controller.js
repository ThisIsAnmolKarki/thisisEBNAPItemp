// src/controllers/business/business.controller.js
import { Op } from 'sequelize';
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { User } from '../../models/Users/User.model.js';
import Review from '../../models/review.model.js';
import { Sequelize } from 'sequelize';

export const searchBusinesses = async (req, res) => {
  try {
    const {
      keyword,
      category,
      city,
      country,
      rating,
      price,
      isVerified,
      page = 1,
      limit = 10
    } = req.query;

    const businessWhereClause = {};
    
    if (keyword) {
      businessWhereClause[Op.or] = [
        {
          businessName: {
            [Op.iLike]: `%${keyword}%`
          }
        },
        {
          description: {
            [Op.iLike]: `%${keyword}%`
          }
        }
      ];
    }

    if (category) businessWhereClause.category = category;
    if (isVerified !== undefined) businessWhereClause.isVerified = isVerified === 'true';

    const businessInfoWhereClause = {};

    if (city) businessInfoWhereClause.city = city;
    if (country) businessInfoWhereClause.country = country;
    if (rating) businessInfoWhereClause.rating = { [Op.gte]: parseFloat(rating) };
    if (price) businessInfoWhereClause.price = price;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const businesses = await Business.findAndCountAll({
      where: businessWhereClause,
      include: [
        {
          model: BusinessInformation,
          as: 'businessInformation',
          where: businessInfoWhereClause,
          required: Object.keys(businessInfoWhereClause).length > 0
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
      },
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    const totalPages = Math.ceil(businesses.count / parseInt(limit));

    const formattedBusinesses = businesses.rows.map(business => ({
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
    }));

    res.status(200).json({
      success: true,
      data: {
        businesses: formattedBusinesses,
        pagination: {
          total: businesses.count,
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search businesses',
      error: error.message
    });
  }
};