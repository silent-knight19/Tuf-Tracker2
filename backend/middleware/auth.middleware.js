const { auth } = require('../config/firebase.config');

/**
 * Soft Token Verification
 * Attempts to verify the Firebase ID token if present.
 * Does NOT block the request if the token is missing or invalid.
 * Used primarily for Rate Limiting whitelisting on public/mixed routes.
 */
const softVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    if (token) {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
    }
    next();
  } catch (error) {
    // Token valid but expired, or malformed, etc.
    // We strictly ignore errors here as this is "soft" auth.
    // The actual route protection will happen later with strict verifyToken.
    // console.warn('Soft auth failed:', error.message);
    next();
  }
};

module.exports = { softVerifyToken };
