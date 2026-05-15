import { ZodError } from "zod";

export function validationError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      error: "Validation failed",
      details: error.flatten().fieldErrors
    };
  }

  if (error instanceof SyntaxError) {
    return { error: "Request body must be valid JSON" };
  }

  if (error instanceof Error) {
    if (error.message.startsWith("Missing required environment variable:")) {
      return {
        error: "Server setup is incomplete",
        details: error.message
      };
    }

    if (error.name.includes("Prisma")) {
      return {
        error: "Database request failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      };
    }
  }

  return { error: "Invalid request" };
}
