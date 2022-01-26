import env from "dotenv";
env.config();

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

import { setUpDB } from "./queries";
import multer from 'multer';
import cors from 'cors';

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json(
  {
    limit: '50mb'
  }
));

app.use(cors())

/**
 * Multer image upload configuration
 * Upload image to in-memory storage 
 * And encode to base64
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  // limits:{fileSize: 1000000}, // TODO: We could set image limits at the client level
}).single("picture")

app.post("/imageUpload", function (req, res){
    upload(req, res, (err) => {
      // base64 encode the uploaded image
      const encoded = req.file?.buffer.toString('base64');
      if (err instanceof multer.MulterError) {
        res.status(400).send(JSON.stringify(err));
      } else if (err) {
        res.status(400).send("An unknown error occurred when uploading.")
      } else {
        res.status(200).send(JSON.stringify(encoded))
      }
    })
  });
app.post("/verify", berbixController.verify);
app.post("/APIverify", berbixController.APIVerify);
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
