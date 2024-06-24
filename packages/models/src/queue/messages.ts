import { z } from "zod";
import {
  EserviceInteropState,
  EserviceStatus,
  EserviceTechnology,
  responseStatus,
} from "../eservice/eservice.js";

export const UpdateResponseReceivedDto = z.object({
  eserviceRecordId: z.number().min(1),
  status: EserviceStatus,
  responseReceived: z.string().datetime({ offset: true }),
});

export type UpdateResponseReceivedDto = z.infer<
  typeof UpdateResponseReceivedDto
>;

export const TelemetryOkDto = z.object({
  status: z.literal(responseStatus.ok),
  eserviceRecordId: z.number().min(1),
  checkTime: z.string().regex(/^\d+$/).min(1),
  responseTime: z.number(),
});

export type TelemetryOkDto = z.infer<typeof TelemetryOkDto>;

export const TelemetryKoDto = z.object({
  status: z.literal(responseStatus.ko),
  eserviceRecordId: z.number().min(1),
  checkTime: z.string().regex(/^\d+$/).min(1),
  responseTime: z.number().optional(),
  koReason: z.string().min(1).max(2048),
});

export type TelemetryKoDto = z.infer<typeof TelemetryKoDto>;

export const TelemetryDto = z.discriminatedUnion("status", [
  TelemetryOkDto,
  TelemetryKoDto,
]);

export type TelemetryDto = z.infer<typeof TelemetryDto>;

export const EserviceContentDto = z.object({
  eserviceRecordId: z.number(),
  technology: EserviceTechnology,
  basePath: z.array(z.string()),
  audience: z.array(z.string()),
});

export type EserviceContentDto = z.infer<typeof EserviceContentDto>;

export const EserviceDto = z.object({
  name: z.string().max(255),
  eserviceId: z.string().uuid(),
  versionId: z.string().uuid(),
  technology: EserviceTechnology,
  state: EserviceInteropState,
  basePath: z
    .array(z.coerce.string().transform(sanitizeData))
    .nonempty()
    .max(2048),
  producerName: z.string().max(2048),
  versionNumber: z.number().int().min(1),
  audience: z
    .array(z.coerce.string().transform(sanitizeData))
    .nonempty()
    .max(2048),
});

export type EserviceDto = z.infer<typeof EserviceDto>;

export const MessageHeadersDto = z.object({
  correlationId: z.string().uuid(),
});

export type MessageHeadersDto = z.infer<typeof MessageHeadersDto>;

/**
 * Sanitizes the input string by removing control characters and trimming whitespace.
 * Control characters removed include ASCII codes 0-31 and 127.
 */
function sanitizeData(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]+/g, "").trim();
}
