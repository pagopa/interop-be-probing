import { SQS } from "pagopa-interop-probing-commons";
import { EserviceDto } from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToServicesQueue(
      message: EserviceDto,
      correlationId: string,
    ): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointServicesQueue,
        JSON.stringify(message),
        config.sqsGroupId,
        {
          Header: {
            DataType: "String",
            StringValue: `{ "correlationId": "${correlationId}" }`,
          },
        },
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
