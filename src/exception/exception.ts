import { AxiosError } from "axios";
import { ServiceExceptionError } from "@/model/exception";

class ServiceException<T extends ServiceExceptionError> extends AxiosError<T, any> {
  public date: Date | null | undefined;

  constructor(error: T | undefined, ...params: string[]) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceException);
    }

    this.message = error?.message || "";

    this.date = new Date();
  }
}

export default ServiceException;
