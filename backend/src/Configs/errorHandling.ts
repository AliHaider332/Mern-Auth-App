class CustomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message); // pass message to Error class
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
