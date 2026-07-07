import { AppError } from './app-error'

/**
 * Thrown when a user lacks the required permission.
 * HTTP 403.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, 'FORBIDDEN', message)
  }
}
