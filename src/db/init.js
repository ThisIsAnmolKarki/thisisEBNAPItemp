import { sequelize } from "./db.js";

export const initializeDatabase = async () => {
  try {
    // First check database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Initialize sequences
    await sequelize.query(`
      DO $$
      BEGIN
        -- Update users sequence
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
          PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
        END IF;

        -- Update businesses sequence
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
          PERFORM setval('businesses_id_seq', COALESCE((SELECT MAX(id) FROM businesses), 1));
        END IF;

        -- Update Business_Information sequence
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Business_Information') THEN
          PERFORM setval('"Business_Information_id_seq"', COALESCE((SELECT MAX(id) FROM "Business_Information"), 1));
        END IF;

        -- Update reviews sequence
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
          PERFORM setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 1));
        END IF;

        -- Update inquiries sequence
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inquiries') THEN
          PERFORM setval('inquiries_id_seq', COALESCE((SELECT MAX(id) FROM inquiries), 1));
        END IF;
      END $$;
    `);

    console.log("Database sequences initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};
