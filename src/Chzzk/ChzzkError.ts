import { ChzzkErrorNames } from "./types";

export class ChzzkError extends Error {
  public constructor(public code: ChzzkErrorNames, public message: string) {
    super(message);
  }
}

export default ChzzkError;
