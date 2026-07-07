import { AppError } from './app-error'

/**
 * Thrown when no authenticated session is found.
 * HTTP 401.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message)
  }
}
