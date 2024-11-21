"use strict";
const path = require("path");
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.resolve(
      __dirname,
      "../../../ETL/yelp_filtered_data.json"
    );
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    const usersData = data.map((item) => ({
      id: item.user_id,
      username: item.username || "default_username", // Use default values if necessary
      email: item.email || "default@example.com",
      password: item.password || "hashed_password_default",
      firstName: item.firstName || "Default",
      lastName: item.lastName || "User",
      dateOfBirth: item.dateOfBirth || "1990-01-01",
      isActive: item.isActive !== undefined ? item.isActive : true,
      role: item.role || "user",
      lastLoginAt: new Date(),
      profilePicture: item.image_url || "https://example.com/default.jpg",
      Phone: item.user_phone || "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("users", usersData, {});
    console.info("Data inserted successfully!");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
