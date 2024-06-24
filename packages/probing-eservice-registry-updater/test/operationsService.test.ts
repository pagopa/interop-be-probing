import { afterAll, describe, expect, it, vi } from "vitest";
import {
  eserviceInteropState,
  technology,
} from "pagopa-interop-probing-models";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { AppError, ApplicationError } from "../src/model/domain/errors.js";
import { config } from "../src/utilities/config.js";
import { mockApiClientError } from "./utils.js";
import { SaveEserviceApi } from "../src/model/models.js";
import { v4 as uuidv4 } from "uuid";
import { AppContext, WithSQSMessageId } from "pagopa-interop-probing-commons";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("Operations service test", () => {
  const OperationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  const mockAppCtx: WithSQSMessageId<AppContext> = {
    serviceName: config.applicationName,
    messageId: uuidv4(),
    correlationId: uuidv4(),
  };

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("Save e-service identified by eserviceId and versionId should not throw an exception", async () => {
    const eserviceId: string = uuidv4();
    const versionId: string = uuidv4();

    const saveEservice: SaveEserviceApi = {
      params: {
        eserviceId,
        versionId,
      },
      payload: {
        eserviceId,
        versionId,
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      },
    };

    vi.spyOn(apiClient, "saveEservice").mockResolvedValue(1);

    expect(
      OperationsService.saveEservice(saveEservice, mockAppCtx),
    ).resolves.not.toThrow();
  });

  it("Save e-service identified by eserviceId and versionId should throw an exception apiUpdateResponseReceivedError with status 500", async () => {
    const eserviceId: string = uuidv4();
    const versionId: string = uuidv4();

    const saveEservice: SaveEserviceApi = {
      params: {
        eserviceId,
        versionId,
      },
      payload: {
        eserviceId,
        versionId,
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      },
    };

    const apiClientError = mockApiClientError(500, "Internal server error");

    vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(apiClientError);

    try {
      await OperationsService.saveEservice(saveEservice, mockAppCtx);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as AppError).status).toBe(500);
    }
  });
});
