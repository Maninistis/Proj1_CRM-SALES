import { AppError } from './app-error'

/**
 * Thrown when an operation conflicts with the current state
 * (e.g., invalid state machine transition, duplicate unique value).
 * HTTP 409.
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details)
  }
}
