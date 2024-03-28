/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";
import { ZodError } from "zod";
import { AxiosError } from "axios";
export class ApplicationError<T> extends Error {
  public code: T;
  public title: string;
  public detail: string;
  public status?: number;

  constructor({
    code,
    title,
    detail,
    status,
  }: {
    code: T;
    title: string;
    detail: string;
    status?: number;
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
    if (status) this.status = status;
  }
}

export class AppError extends ApplicationError<string> {
  constructor({
    code,
    title,
    detail,
    status,
  }: {
    code: string;
    title: string;
    detail: string;
    status?: number;
  }) {
    super({ code, title, detail, status });
  }
}

export function makeApplicationErrorBuilder<T extends string>(errors: {
  [K in T]: string;
}): (error: unknown) => AppError {
  const allErrors = { ...errorCodes, ...errors };

  return (error: unknown) => {
    const makeApplicationError = ({
      code,
      title,
      detail,
      status,
    }: ApplicationError<ErrorCodes>): AppError =>
      new AppError({
        code: allErrors[code],
        title,
        detail,
        status,
      });

    return match<unknown, AppError>(error)
      .with(P.instanceOf(AppError), (applicationError) => applicationError)
      .with(P.instanceOf(ApplicationError<ErrorCodes>), (applicationError) =>
        makeApplicationError(applicationError),
      )
      .otherwise((e) =>
        makeApplicationError(
          genericError(e instanceof Error ? `${e.message}` : `${e}`),
        ),
      );
  };
}

export const errorCodes = {
  genericError: "9999",
  decodeSQSMessageError: "0001",
  apiGetEservicesReadyForPollingError: "0002",
  apiUpdateLastRequestError: "0003",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export const makeApplicationError = makeApplicationErrorBuilder(errorCodes);

export function genericError(detail: string): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "genericError",
    title: "Unexpected error",
  });
}

export function apiGetEservicesReadyForPollingError(
  detail: string,
  error: unknown,
): ApplicationError<ErrorCodes> {
  const status = (error as AxiosError).response?.status;
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new ApplicationError({
    ...(status && { status }),
    detail: `${detail} ${zodiosErrorDetails}`,
    code: "apiGetEservicesReadyForPollingError",
    title: "Get Eservices ready for polling error",
  });
}

export function apiUpdateLastRequestError(
  detail: string,
  error: unknown,
): ApplicationError<ErrorCodes> {
  const status = (error as AxiosError).response?.status;
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new ApplicationError({
    ...(status && { status }),
    detail: `${detail} ${zodiosErrorDetails}`,
    code: "apiUpdateLastRequestError",
    title: "Update Eservice last request error",
  });
}

export function decodeSQSMessageError(
  detail: string,
): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "decodeSQSMessageError",
    title: "Decode SQS Message error",
  });
}
