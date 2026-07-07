import { AppError } from './app-error'

/**
 * Thrown when a requested entity does not exist.
 * HTTP 404.
 */
export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    const message = id
      ? `${entity} with id "${id}" not found`
      : `${entity} not found`
    super(404, 'NOT_FOUND', message)
  }
}
