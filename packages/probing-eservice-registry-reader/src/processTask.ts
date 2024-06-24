import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";
import { ProducerService } from "./services/producerService.js";
import { BucketService } from "./services/bucketService.js";
import {
  AppContext,
  WithSQSMessageId,
  logger,
} from "pagopa-interop-probing-commons";
import { v4 as uuidv4 } from "uuid";
import { config } from "./utilities/config.js";

export async function processTask(
  bucketService: BucketService,
  producerService: ProducerService,
): Promise<void> {
  try {
    const eservices = await bucketService.readObject();
    for await (const eservice of eservices) {
      const ctx: WithSQSMessageId<AppContext> = {
        serviceName: config.applicationName,
        correlationId: uuidv4(),
      };

      logger(ctx).info(
        `Sending to queue eserviceId ${eservice.eserviceId} and versionId ${eservice.versionId} `,
      );
      await producerService.sendToServicesQueue(eservice, ctx.correlationId);
    }
  } catch (e: unknown) {
    throw makeApplicationError(
      e instanceof ApplicationError
        ? e
        : new Error(
            `Unexpected error processing task registry reader. Details: ${e}`,
          ),
    );
  }
}
