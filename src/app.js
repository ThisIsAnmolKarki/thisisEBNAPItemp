import app from "./index.js";
const sequelize = require('./src/db/db.js'); // If using Sequelize, import database configuration

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    // Start the server after DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
export default app;