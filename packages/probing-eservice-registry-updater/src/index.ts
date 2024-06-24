import { SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import { processMessage } from "./messagesHandler.js";
import {
  OperationsService,
  operationsServiceBuilder,
} from "./services/operationsService.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);

const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  region: config.awsRegion,
});

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointServicesQueue,
    consumerPollingTimeout: config.consumerPollingTimeout,
    runUntilQueueIsEmpty: true,
  },
  processMessage(operationsService),
);
