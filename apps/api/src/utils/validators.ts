import { ZodSchema } from "zod";

export function validateWithSchema<T>(schema: ZodSchema<T>, input: unknown) {
  return schema.parse(input);
}
