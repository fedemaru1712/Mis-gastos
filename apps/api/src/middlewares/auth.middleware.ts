import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    email: string;
  };
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      return response.status(401).json({ message: "Invalid token" });
    }

    request.auth = { userId: payload.sub, email: payload.email };
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid token" });
  }
}
