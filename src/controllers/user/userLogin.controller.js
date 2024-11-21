import { auth } from "../../services/user/auth/auth.service.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const userLogin = async (req, res) => {
  const { username, password } = req.body;

  // Debug environment variables
  console.log('Environment Check:', {
    hasSecretKey: !!process.env.SECRETKEY,
    secretKeyLength: process.env.SECRETKEY ? process.env.SECRETKEY.length : 0,
    nodeEnv: process.env.NODE_ENV
  });

  // Input validation
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  try {
    // Check if secret key is configured
    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      console.error('JWT secret key is not configured. Check your .env file.');
      return res.status(500).json({
        success: false,
        message: 'Authentication service configuration error'
      });
    }

    const response = await auth(username, password);

    if (response.error) {
      return res.status(401).json({
        success: false,
        message: response.error
      });
    }

    // Debug token creation
    console.log('Creating token for user:', {
      userId: response.id,
      username: response.username
    });

    const token = jwt.sign(
      { id: response.id, username: response.username },
      secretKey,
      {
        expiresIn: "2d",
        algorithm: "HS256",
      }
    );

    console.log('Token created successfully');

    res.status(200).json({
      success: true,
      data: { ...response, accessToken: token },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};