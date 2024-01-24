import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceProbingDataByRecordIdNotFound,
  makeApiProblem,
} from "../model/domain/errors.js";
import { ExpressContext, ZodiosContext } from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import { readModelServiceBuilder } from "../services/db/dbService.js";
import { eServiceServiceBuilder } from "../services/eServiceService.js";
import { eserviceQueryBuilder } from "../services/db/eserviceQuery.js";
import { api } from "../model/generated/api.js";
import {
  ListResult,
  EServiceMainData,
  EServiceProbingData,
  EServiceContent,
} from "pagopa-interop-probing-models";
import { updateEServiceErrorMapper } from "../utilities/errorMappers.js";
import { ModelRepository } from "../repositories/modelRepository.js";

const readModelService = readModelServiceBuilder(ModelRepository.init(config));
const eserviceQuery = eserviceQueryBuilder(readModelService);
const eServiceService = eServiceServiceBuilder(eserviceQuery);

const eServiceRouter = (
  ctx: ZodiosContext
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const eServiceRouter = ctx.router(api.api);

  eServiceRouter
    .post(
      "/eservices/:eserviceId/versions/:versionId/updateState",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceState(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/probing/updateState",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceProbingState(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/updateFrequency",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceFrequency(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .put(
      "/eservices/:eserviceId/versions/:versionId/saveEservice",
      async (req, res) => {
        try {
          await eServiceService.saveEservice(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(200).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .post(
      "/eservices/:eserviceRecordId/updateLastRequest",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceLastRequest(
            req.params.eserviceRecordId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .post(
      "/eservices/:eserviceRecordId/updateResponseReceived",
      async (req, res) => {
        try {
          await eServiceService.updateResponseReceived(
            req.params.eserviceRecordId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    );

  eServiceRouter
    .get("/eservices", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservices(
          {
            eserviceName: req.query.eserviceName,
            producerName: req.query.producerName,
            versionNumber: req.query.versionNumber,
            state: req.query.state,
          },
          req.query.limit,
          req.query.offset
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
            offset: eservices.offset,
            limit: eservices.limit,
            totalElements: eservices.totalElements,
          } satisfies ListResult<EServiceContent>)
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/mainData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceMainData =
          await readModelService.getEserviceMainDataByRecordId(
            req.params.eserviceRecordId
          );

        if (eServiceMainData) {
          return res
            .status(200)
            .json(eServiceMainData satisfies EServiceMainData)
            .end();
        } else {
          return res
            .status(404)
            .json(
              makeApiProblem(
                eServiceMainDataByRecordIdNotFound(req.params.eserviceRecordId),
                () => 404
              )
            )
            .end();
        }
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/probingData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceProbingData =
          await readModelService.getEserviceProbingDataByRecordId(
            req.params.eserviceRecordId
          );

        if (eServiceProbingData) {
          return res
            .status(200)
            .json(eServiceProbingData satisfies EServiceProbingData)
            .end();
        } else {
          return res
            .status(404)
            .json(
              makeApiProblem(
                eServiceProbingDataByRecordIdNotFound(
                  req.params.eserviceRecordId
                ),
                () => 404
              )
            )
            .end();
        }
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/producers", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservicesProducers(
          {
            producerName: req.query.producerName,
          },
          req.query.limit,
          req.query.offset
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
          })
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/polling", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservicesReadyForPolling(
          req.query.limit,
          req.query.offset
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
          })
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    });

  return eServiceRouter;
};

export default eServiceRouter;
