const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const jwt = require('jsonwebtoken');

// Helper to set HTTP-only cookie for refresh token
const setRefreshCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Lax is good for local testing, 'strict' or 'none' in prod depending on cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching REFRESH_TOKEN_EXPIRE
  };
  res.cookie('refreshToken', token, cookieOptions);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      refreshTokens: [],
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save refresh token to DB list
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Set cookie
      setRefreshCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token (supporting multi-device login, cap at 5 concurrent sessions)
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift(); // Remove oldest session
    }
    await user.save();

    // Set cookie
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Refresh access token (JWT Rotation)
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // Refresh token expired or tampered with
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid',
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'User associated with token no longer exists',
      });
    }

    // Check if refresh token is in database
    const tokenIndex = user.refreshTokens.indexOf(token);
    if (tokenIndex === -1) {
      // Possible reuse attack! Invalidate all refresh tokens for this user for security
      user.refreshTokens = [];
      await user.save();
      res.clearCookie('refreshToken');
      return res.status(403).json({
        success: false,
        message: 'Security Alert: Unauthorized token usage detected. Sessions revoked.',
      });
    }

    // Generate new tokens (Rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token with new one in database
    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    // Set new cookie
    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
    });
  }
};

// @desc    Logout user & revoke token
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    
    if (token) {
      // Find the user with this token and pull it
      await User.updateOne(
        { refreshTokens: token },
        { $pull: { refreshTokens: token } }
      );
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
