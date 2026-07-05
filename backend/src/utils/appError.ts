// Typed application error so services can signal an HTTP status + error code
// instead of throwing bare Error (which the handler can only treat as a 500).
export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
