import express, { Application } from "express";
import * as AWS_SDK from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import * as https from "https";
import eServiceRouter from "./routers/eserviceRouter.js";

const app: Application = express();

// Capture all AWS clients we create
const AWS = AWSXRay.captureAWS(AWS_SDK);
AWS.config.update({region: process.env.DEFAULT_AWS_REGION || 'us-west-2'});

// Capture all outgoing https requests
AWSXRay.captureHTTPsGlobal(https);

// Enable AWS X-Ray
const XRayExpress = AWSXRay.express;
app.use(XRayExpress.openSegment("pagopa-probing-eservice-operations"));

// Disable the "X-Powered-By: Express" HTTP header for security reasons.
// See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

app.use(eServiceRouter);

app.use(XRayExpress.closeSegment());

export default app;
