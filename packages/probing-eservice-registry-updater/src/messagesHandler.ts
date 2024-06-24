import {
  AppContext,
  SQS,
  WithSQSMessageId,
  logger,
} from "pagopa-interop-probing-commons";
import { OperationsService } from "./services/operationsService.js";
import {
  decodeSQSMessageBody,
  decodeSQSMessageHeaders,
} from "./model/models.js";
import { config } from "./utilities/config.js";
import { makeApplicationError } from "./model/domain/errors.js";

export function processMessage(
  service: OperationsService,
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    const headers = decodeSQSMessageHeaders(message);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      correlationId: headers.correlationId,
      messageId: message.MessageId,
    };

    try {
      await service.saveEservice(decodeSQSMessageBody(message), ctx);
    } catch (error: unknown) {
      throw makeApplicationError(error, logger(ctx));
    }
  };
}
