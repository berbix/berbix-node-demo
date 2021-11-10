import { Client, Tokens } from "berbix";
import { Request, Response, NextFunction } from "express";

import { getUserByCustomerUid, createUser } from "./queries";
import { RawRequest } from "./index";

class BerbixController {
  private client: Client;

  constructor() {
    this.client = new Client({
      apiSecret: process.env.BERBIX_API_SECRET,
      environment: "production",
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
      });
    } catch (error) {
      next(JSON.stringify(error));
    }
  };
}

export default BerbixController;
