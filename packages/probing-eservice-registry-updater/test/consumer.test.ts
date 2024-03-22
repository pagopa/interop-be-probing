import { describe, expect, it, vi, afterAll } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import { AppError } from "../src/model/domain/errors.js";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import { v4 as uuidv4 } from "uuid";
import {
  eserviceInteropState,
  technology,
} from "pagopa-interop-probing-models";

describe("Consumer queue test", () => {
  const mockOperationsService = {
    saveEservice: vi.fn().mockResolvedValue(undefined),
  };

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("given valid message, method should not throw an exception", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceId: uuidv4(),
        versionId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      }),
    };

    expect(
      processMessage(mockOperationsService)(validMessage)
    ).resolves.not.toThrow();

    expect(mockOperationsService.saveEservice).toHaveBeenCalledWith(
      decodeSQSMessage(validMessage)
    );
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(mockOperationsService)(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });

  it("when eserviceId field is missing, method should throw an error", async () => {
    const missingEserviceId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        versionId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      }),
    };

    try {
      await processMessage(mockOperationsService)(missingEserviceId);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect(mockOperationsService.saveEservice).not.toBeCalled();
    }
  });

  it("when versionId field is missing, method should throw an error", async () => {
    const missingVersionId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      }),
    };

    try {
      await processMessage(mockOperationsService)(missingVersionId);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect(mockOperationsService.saveEservice).not.toBeCalled();
    }
  });

  it("when eserviceDTO message is bad formatted, method should throw an error", async () => {
    const badFormattedEserviceDTO: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceId: uuidv4(),
        versionId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: "1",
      }),
    };

    try {
      await processMessage(mockOperationsService)(badFormattedEserviceDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });
});
