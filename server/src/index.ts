import env from "dotenv";
env.config();

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

import { setUpDB } from "./queries";
setUpDB();

import BerbixController from "./BerbixController";
const berbixController = new BerbixController();

export interface RawRequest extends Request {
  rawBody?: any;
}

const rawBody = (req: RawRequest, res: Response, next: NextFunction) => {
  req.rawBody = "";
  req.on("data", function (chunk: any) {
    req.rawBody += chunk;
  });
  next();
};

const app = express();
app.use(rawBody);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  next();
});

app.post("/verify", berbixController.verify);
app.post("/imageUpload", berbixController.imageUpload);
app.get("/transactions", berbixController.getTransaction);

// WEBHOOKS

app.post("/webhook/verification_status", (req: RawRequest, res) => {
  const isValid = berbixController.validateWebhook(
    req,
    process.env.VERIFICATION_STATUS_SECRET as string
  );
  console.log(isValid);
  console.log(req.body);
  // TODO: Update status

  res.status(200).end();
});

app.post("/webhook/verification_finished", (req: RawRequest, res) => {
  const isValid = berbixController.validateWebhook(
    req,
    process.env.VERIFICATION_FINISHED_SECRET as string
  );
  console.log(isValid);
  console.log(req.body);
  // TODO: Update status

  res.status(200).end();
});

const port = 3002;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
