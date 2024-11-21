"use strict";

// BusinessID	integer Auto Increment [nextval('"Business_BusinessID_seq"')]
// Category	character varying(255)
// Location	character varying(255)
// OperatingHours	character varying(255)
// Description	text NULL
// Services	character varying(255) NULL
// ContactDetails	character varying(255)
// user_id	integer
// createdAt	timestamptz
// updatedAt	timestamptz

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

    const businessData = data.map((item) => ({
      id: item.id,
      businessName: item.name,
      category: item.category[0],
      address: item.location,
      isVerified: false,
      description: item.description,
      services: item.services || "unknown",
      contactDetails: item.contact_details,
      ownerId: item.user_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("businesses", businessData, {});
    console.info("Data inserted successfully!");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("businesses", null, {});
  },
};
