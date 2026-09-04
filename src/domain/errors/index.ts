/**
 * Domain-level error types.
 * Repositories translate low-level storage errors into these domain errors
 * so that the domain and UI layers never see SQLite or Firebase error details.
 */

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PredictionError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found.`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class MergeRequiredError extends Error {
  constructor(
    public readonly overlappingCycleIds: string[]
  ) {
    super('This change overlaps with existing logged periods and requires merging.');
    this.name = 'MergeRequiredError';
  }
}
