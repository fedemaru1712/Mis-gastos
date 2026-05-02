import { Request, Response } from "express";
import { googleAuthSchema, UserProfile } from "@personal-finance/shared";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { verifyGoogleCredential } from "../services/googleAuth.service.js";
import { HttpError } from "../utils/http-error.js";
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
  const existingUser = await User.findOne({ googleId: profile.googleId });

  if (existingUser) {
    existingUser.email = profile.email;
    existingUser.name = profile.name;
    existingUser.avatarUrl = profile.avatarUrl;
    await existingUser.save();

    const token = generateToken({ sub: existingUser._id.toString(), email: existingUser.email });
    return response.json({ token, user: mapUser(existingUser) });
  }

  const totalUsers = await User.countDocuments();
  if (totalUsers >= env.MAX_USERS) {
    throw new HttpError(403, "Se ha alcanzado el limite de usuarios permitidos en la app");
  }

  const user = await User.create(profile);
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
