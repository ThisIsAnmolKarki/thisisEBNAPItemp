// src/db/seeders/YYYYMMDDHHMMSS-business-information.js
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

    const business_information = data.map((item) => ({
      business_id: item.id,
      image_url: item.image_url,
      menu_url: item.business_url,
      opening_hours: JSON.stringify(item.operating_hours),
      country: item.country,
      city: item.city,
      Longitude: item.coordinates.longitude,
      Latitude: item.coordinates.latitude,
      price: item.price,
      rating: item.rating,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert(
      "Business_Information",
      business_information,
      {}
    );
    console.info("Data inserted successfully!");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Business_Information", null, {});
  },
};
