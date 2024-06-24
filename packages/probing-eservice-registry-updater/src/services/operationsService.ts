import { SaveEserviceApi } from "../model/models.js";
import { ZodiosInstance } from "@zodios/core";
import { Api } from "pagopa-interop-probing-eservice-operations-client";
import {
  AppContext,
  WithSQSMessageId,
  logger,
} from "pagopa-interop-probing-commons";
import { apiSaveEserviceError } from "../model/domain/errors.js";
import { correlationIdToHeader } from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async saveEservice(
      { params, payload }: SaveEserviceApi,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<void> {
      try {
        logger(ctx).info(
          `Saving eService with eserviceId/versionId: ${params.eserviceId}/${params.versionId}`,
        );

        await operationsApiClient.saveEservice(payload, {
          params,
          headers: correlationIdToHeader(ctx.correlationId),
        });
      } catch (error: unknown) {
        throw apiSaveEserviceError(
          `Error saving eService with eserviceId/versionId: ${params.eserviceId}/${params.versionId}}. Details: ${error}`,
          error,
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
