import { ErrorNames } from "./types";

export class AfreecaError extends Error {
  public constructor(public code: ErrorNames, public message: string) {
    super(message);
  }
}

export default AfreecaError;
