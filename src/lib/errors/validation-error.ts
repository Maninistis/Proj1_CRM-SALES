import { AppError } from './app-error'

/**
 * Thrown when input validation fails (Zod schema mismatch).
 * HTTP 400.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}
