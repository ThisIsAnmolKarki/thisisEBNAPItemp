import { parseCategories } from '../../utils/categoryParser.js';

// Cache the categories to avoid parsing the file on every request
let cachedCategories = null;

const getCachedCategories = () => {
  if (!cachedCategories) {
    cachedCategories = parseCategories();
  }
  return cachedCategories;
};

export const getCategories = async (req, res) => {
  try {
    const { format, limit } = req.query;
    let categories = getCachedCategories();

    if (!categories || categories.length === 0) {
      throw new Error('Failed to load categories');
    }

    // Sort categories by name
    categories = categories.sort((a, b) => a.name.localeCompare(b.name));

    // Apply limit if provided
    if (limit && !isNaN(limit)) {
      const limitNumber = parseInt(limit);
      if (limitNumber > 0) {
        categories = categories.slice(0, limitNumber);
      }
    }

    let response;
    if (format === 'simple') {
      // Return just names for dropdown
      response = categories.map(category => ({
        id: category.id,
        name: category.displayName
      }));
    } else {
      // Return full category details
      response = categories;
    }

    res.status(200).json({
      success: true,
      data: {
        categories: response,
        total: getCachedCategories().length, // Total number of categories before limit
        returned: categories.length // Number of categories returned after limit
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

export const validateCategory = (categoryName) => {
  const categories = getCachedCategories();
  return categories.some(category => 
    category.name.toLowerCase() === categoryName.toLowerCase() ||
    category.displayName.toLowerCase() === categoryName.toLowerCase()
  );
};