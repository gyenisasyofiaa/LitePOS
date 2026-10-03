import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "./firebase-admin.js";

export type AuthenticatedRequest = Request & {
  user: {
    uid: string;
    email?: string;
  };
};

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Token autentikasi diperlukan." });
  }

  try {
    const token = header.slice("Bearer ".length);
    const decoded = await adminAuth.verifyIdToken(token);

    (request as AuthenticatedRequest).user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    return next();
  } catch {
    return response.status(401).json({ message: "Token autentikasi tidak valid atau sudah kedaluwarsa." });
  }
}
