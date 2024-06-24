import { z } from "zod";
import { EserviceDto, MessageHeadersDto } from "pagopa-interop-probing-models";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessageError } from "./domain/errors.js";
import { v4 as uuidv4 } from "uuid";

export interface SaveEserviceApi {
  params: { eserviceId: string; versionId: string };
  payload: EserviceDto;
}

const MessageBodySchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    EserviceDto,
  ),
});

const MessageHeadersSchema = z.object({
  value: z.preprocess(
    (v) => (v ? JSON.parse(v.toString()) : null),
    MessageHeadersDto,
  ),
});

export function decodeSQSMessageBody(message: SQS.Message): SaveEserviceApi {
  const parsedBody = MessageBodySchema.safeParse({ value: message.Body });
  if (!parsedBody.success) {
    throw decodeSQSMessageError(
      `Failed to decode SQS Body message with MessageId: ${
        message.MessageId
      }. Error details: ${JSON.stringify(parsedBody.error)}`,
    );
  }

  const payload = parsedBody.data.value;

  return {
    params: { eserviceId: payload.eserviceId, versionId: payload.versionId },
    payload,
  };
}

export function decodeSQSMessageHeaders(
  message: SQS.Message,
): MessageHeadersDto {
  try {
    const parsedHeaders = MessageHeadersSchema.parse({
      value: message.MessageAttributes?.Header.StringValue,
    });
    return {
      correlationId: parsedHeaders.value.correlationId,
    };
  } catch (_err) {
    return {
      correlationId: uuidv4(),
    };
  }
}
