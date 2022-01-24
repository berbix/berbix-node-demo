import { Client, Tokens } from "berbix";
import { Request, Response, NextFunction } from "express";

import { getUserByCustomerUid, createUser } from "./queries";
import { RawRequest } from "./index";
import axios from "axios";

class BerbixController {
  private client: Client;

  constructor() {
    this.client = new Client({
      apiSecret: process.env.BERBIX_API_SECRET,
      environment: "production",
      apiHost: process.env.BERBIX_API_HOST,
    });
  }

  /**
   * Send the client a client_token so that they can initialize a verification session
   */
  verify = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customerUid = req.query.customer_uid as string;
    const tokens = await this.getTokensForCustomer(customerUid);
    if (tokens) {
      res.status(200).send({
        client_token: tokens.clientToken,
      });
    } else {
      this.createTransaction(req, res, next);
    }
  };

  getTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customerUid = req.query.customer_uid as string;
    const tokens = await this.getTokensForCustomer(customerUid);

    if (tokens) {
      const transactionData = await this.client.fetchTransaction(tokens);
      res.status(200).send(transactionData);
    } else {
      const err = new Error(
        `Could not find any transaction for customer with UID ${customerUid}`
      );
      next(err);
    }
  };

  /**
   * Send the client an access_token so that they can initialize an upload flow
   */
   imageUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customerUid = req.query.customer_uid as string;
    const tokens = await this.getTokensForCustomer(customerUid);
    if (tokens) {
      res.status(200).send({
        access_token: tokens.accessToken,
      });
    } else {
      this.createAPIOnlyTransaction(req, res, next);
    }
  };

  validateWebhook = (req: RawRequest, secret: string): boolean => {
    const isValid = this.client.validateSignature(
      secret,
      req.rawBody,
      req.headers["x-berbix-signature"] as string
    );

    return isValid;
  };

  private getTokensForCustomer = async (
    customerUid: string
  ): Promise<Tokens | null> => {
    const user = await getUserByCustomerUid(customerUid);
    if (!user) return null;

    const transactionTokens = Tokens.fromRefresh(user.refresh_token);
    return this.client.refreshTokens(transactionTokens);
  };

  /**
   * Create a Berbix Transaction
   */
  private createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const customerUid = req.query.customer_uid as string;
      const tokens = await this.client.createTransaction({
        customerUid,
        templateKey: process.env.TEMPLATE_KEY || "",
      });

      await createUser(customerUid, tokens.refreshToken);
      res.status(200).send({
        client_token: tokens.clientToken,
        access_token: tokens.accessToken,
      });
    } catch (error) {
      next(JSON.stringify(error));
    }
  };
  /**
   * Create a Berbix API Only Transaction
   */
   private createAPIOnlyTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const apiSandbox = process.env.BERBIX_API_HOST || "" + "/v0/transactions"
      const customerUid = req.query.customer_uid as string;
      const testTransaction = {
        api_only_options: {
          id_country: "US",
          id_type: "P"
        },
        customer_uid: customerUid, 
        template_key: process.env.TEMPLATE_KEY
    };
      const response = await axios.post(
        apiSandbox, 
        testTransaction,
        { auth: {
          username: process.env.BERBIX_API_SECRET || "",
          password: "",
          }
        }
      )
      const tokens = response.data
      await createUser(customerUid, tokens.refresh_token);
      res.status(200).send({
        access_token: tokens.access_token,
      });
    } catch (error) {
      next(JSON.stringify(error));
    }
  };

}

export default BerbixController;
