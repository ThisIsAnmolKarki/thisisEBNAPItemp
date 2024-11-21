import express from "express";
import { sequelize } from "./db/db.js";
import { initializeDatabase } from "./db/init.js";
import user from "./routes/user.route.js";
import businessRoutes from "./routes/business.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import cors from "cors";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const PORT = 3000;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/EBN", user);
app.use("/api", businessRoutes);
app.use("/api", reviewRoutes);
app.use("/api", inquiryRoutes);

// Error Handler (must be last)
app.use(errorHandler);

// Initialize and start server
const startServer = async () => {
  try {
    // Initialize database and sequences
    await initializeDatabase();

    // Sync models with database
    await sequelize.sync({ force: false });
    console.log("Database synced successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
