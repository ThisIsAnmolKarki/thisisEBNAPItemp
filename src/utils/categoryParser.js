import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const parseCategories = () => {
  try {
    // Use the same path resolution as the seeder file
    const filePath = path.resolve(
      __dirname,
      "../../ETL/yelp_filtered_data.json"
    );
    
    // Add error checking for file existence
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return [];
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    // Extract and flatten all categories
    const allCategories = data.reduce((acc, business) => {
      if (Array.isArray(business.category)) {
        acc.push(...business.category);
      } else if (typeof business.category === 'string') {
        acc.push(business.category);
      }
      return acc;
    }, []);

    // Get unique categories and sort them
    const uniqueCategories = [...new Set(allCategories)].sort();

    // Transform into structured format
    const formattedCategories = uniqueCategories.map(category => ({
      id: category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: category,
      icon: assignCategoryIcon(category),
      displayName: category,
      description: `${category} businesses and services`
    }));

    return formattedCategories;
  } catch (error) {
    console.error('Error parsing categories:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      filePath: path.resolve(__dirname, "../../ETL/yelp_filtered_data.json")
    });
    return [];
  }
};

// Category icons mapping
const categoryIcons = {
  'restaurants': '🍽️',
  'food': '🍴',
  'seafood': '🦐',
  'bars': '🍸',
  'hotels': '🏨',
  'shopping': '🛍️',
  'fitness': '💪',
  'automotive': '🚗',
  'nightlife': '🌙',
  'entertainment': '🎮',
  'health': '⚕️',
  'beauty': '💅',
  'education': '📚',
  'services': '🔧'
};

export const assignCategoryIcon = (categoryName) => {
  const lowerName = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  return '🏢'; // Default icon
};