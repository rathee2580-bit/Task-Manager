import { ZodError } from "zod";

export function validationError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      error: "Validation failed",
      details: error.flatten().fieldErrors
    };
  }

  return { error: "Invalid request" };
}
