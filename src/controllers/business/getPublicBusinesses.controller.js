// src/controllers/business/getPublicBusinesses.controller.js
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { User } from '../../models/Users/User.model.js';
import Review from '../../models/review.model.js';
import { Op, Sequelize } from 'sequelize';

export const getPublicBusinesses = async (req, res) => {
  try {
    const {
      sort = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 10,
      category,
      city,
      country,
      isVerified,
      minRating,
      maxPrice,
      search
    } = req.query;

    // Validate order direction
    const validOrders = ['ASC', 'DESC'];
    const normalizedOrder = order.toUpperCase();
    if (!validOrders.includes(normalizedOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order direction. Use ASC or DESC'
      });
    }

    // Validate sort field
    const validSortFields = ['createdAt', 'updatedAt', 'businessName', 'rating', 'price', 'category', 'viewCount'];
    if (!validSortFields.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort field. Valid options are: ${validSortFields.join(', ')}`
      });
    }

    // Build where clauses
    const businessWhereClause = {};
    const businessInfoWhereClause = {};

    // Business table filters
    if (category) businessWhereClause.category = category;
    if (isVerified !== undefined) businessWhereClause.isVerified = isVerified === 'true';

    // Business Information table filters
    if (city) businessInfoWhereClause.city = city;
    if (country) businessInfoWhereClause.country = country;
    if (minRating) businessInfoWhereClause.rating = { [Op.gte]: parseFloat(minRating) };
    if (maxPrice) businessInfoWhereClause.price = { [Op.lte]: parseFloat(maxPrice) };

    // Search functionality
    if (search) {
      businessWhereClause[Op.or] = [
        { businessName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort column and model
    let sortOptions = [];
    if (['rating', 'price'].includes(sort)) {
      sortOptions = [[{ model: BusinessInformation, as: 'businessInformation' }, sort, normalizedOrder]];
    } else {
      sortOptions = [[sort, normalizedOrder]];
    }

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
          attributes: ['firstName', 'lastName', 'username']
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
      order: sortOptions,
      limit: parseInt(limit),
      offset,
      distinct: true,
      subQuery: false
    });

    const totalPages = Math.ceil(businesses.count / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Format the response
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
      owner: business.owner ? {
        username: business.owner.username,
        firstName: business.owner.firstName,
        lastName: business.owner.lastName
      } : null,
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
          hasNextPage,
          hasPreviousPage,
          limit: parseInt(limit)
        },
        filters: {
          sort,
          order: normalizedOrder,
          category,
          city,
          country,
          isVerified,
          minRating,
          maxPrice
        }
      }
    });

  } catch (error) {
    console.error('Error fetching public businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses',
      error: error.message
    });
  }
};