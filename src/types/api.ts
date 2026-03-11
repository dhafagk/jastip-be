export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}
