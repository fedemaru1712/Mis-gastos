import { Request, Response } from "express";
import { googleAuthSchema, UserProfile } from "@personal-finance/shared";
import { User } from "../models/User.js";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { verifyGoogleCredential } from "../services/googleAuth.service.js";
import { generateToken } from "../utils/generateToken.js";
import { validateWithSchema } from "../utils/validators.js";

function mapUser(user: any): UserProfile {
  return {
    id: user._id.toString(),
    googleId: user.googleId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function loginWithGoogle(request: Request, response: Response) {
  const { credential } = validateWithSchema(googleAuthSchema, request.body);
  const profile = await verifyGoogleCredential(credential);
  const user = await User.findOneAndUpdate({ googleId: profile.googleId }, profile, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
  const token = generateToken({ sub: user._id.toString(), email: user.email });
  return response.json({ token, user: mapUser(user) });
}

export async function getCurrentUser(request: AuthenticatedRequest, response: Response) {
  const user = await User.findById(request.auth?.userId);
  if (!user) {
    return response.status(404).json({ message: "User not found" });
  }
  return response.json({ user: mapUser(user) });
}

export async function logout(_request: Request, response: Response) {
  return response.status(204).send();
}

export const authHandlers = { requireAuth };
