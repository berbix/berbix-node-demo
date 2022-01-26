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


  /**
   * Get transaction metadata for a given customer UID
   */
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
   * Initialize an upload flow
   */
   APIVerify = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customerUid = req.query.customer_uid as string;
    const tokens = await this.getTokensForCustomer(customerUid);
    // post image data to berbix API
    const apiSandbox = `${process.env.BERBIX_API_HOST}/v0/images/upload`
    const imgData = {
      image: {
        data: req.body.data,
        format: "image/png",
        image_subject: req.body.document_side
      }
    };
    if (tokens) {
      this.berbixAPIUpload(tokens.accessToken, imgData, res, next)
    } else {
      this.createAPIOnlyTransaction(req, res, next)
        .then(async (resp) => {
          const responsedata = JSON.parse(JSON.stringify(resp))
          this.berbixAPIUpload(responsedata.access_token, imgData, res, next)
        });
    }
  };


  /**
   * Send the client an access_token so that they can initialize an upload flow
   */
  validateWebhook = (req: RawRequest, secret: string): boolean => {
    const isValid = this.client.validateSignature(
      secret,
      req.rawBody,
      req.headers["x-berbix-signature"] as string
    );

    return isValid;
  };


  /**
   * Get new tokens for a given customer UID from refresh_token
   */
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


  /**
   * Create a Berbix API Only Transaction
   */
   private createAPIOnlyTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const apiSandbox = `${process.env.BERBIX_API_HOST}/v0/transactions`
      const customerUid = req.query.customer_uid as string;
      const testTransaction = {
        api_only_options: {
          id_country: "US", // TODO: This should be collected from the user form
          id_type: "DL" // TODO: This could come from allowable ID types in the template
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
      return tokens
    } catch (error) {
      next(JSON.stringify(error));
    }
  };


  /**
   * Upload base64 encoded image to Berbix API
   */
  private berbixAPIUpload = async (
    access_token: string,
    img_data: Object,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const apiSandbox = `${process.env.BERBIX_API_HOST}/v0/images/upload`
    const config = {
      headers: { Authorization: `Bearer ${access_token}` }
    };
    try {
      const response = await axios.post(
        apiSandbox, 
        img_data,
        config
      );
      res.status(200).send({
        data: response.data
      });
    } catch (error) {
        const errorinfo = JSON.parse(JSON.stringify(error))
        next(errorinfo); 
    };
  }

}

export default BerbixController;
