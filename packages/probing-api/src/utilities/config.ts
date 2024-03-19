import {
  HTTPServerConfig,
  LoggerConfig,
  AWSConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const apiConfig = HTTPServerConfig.and(LoggerConfig)
  .and(AWSConfig)
  .and(
    z
      .object({
        API_OPERATIONS_BASEURL: z.string(),
        TOLERANCE_MULTIPLIER_IN_MINUTES: z.coerce.number().min(1),
      })
      .transform((c) => ({
        operationsBaseUrl: c.API_OPERATIONS_BASEURL,
        minOfTolleranceMultiplier: c.TOLERANCE_MULTIPLIER_IN_MINUTES,
      }))
  );

export type ApiConfig = z.infer<typeof apiConfig>;

export const config: ApiConfig = {
  ...apiConfig.parse(process.env),
};