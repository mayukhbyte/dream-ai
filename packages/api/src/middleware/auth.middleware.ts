import { Request, Response, NextFunction } from 'express';
import admin from '../../firebase.config';

// Firebase token verification middleware
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Attach user info to request object
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      // Add any other claims you need from the token
      name: decodedToken.name,
      picture: decodedToken.picture,
      // Custom claims if you have any
      // role: decodedToken.role
    };
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export default { verifyFirebaseToken };