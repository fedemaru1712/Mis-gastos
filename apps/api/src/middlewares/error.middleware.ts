import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";
import { ZodError } from "zod";

export function errorMiddleware(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation error",
      issues: error.flatten(),
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Error) {
    return response.status(500).json({ message: error.message });
  }

  return response.status(500).json({ message: "Unexpected error" });
}
