declare module "berbix" {
  interface TransactionRequestBody {
    customerUid: string;
    templateKey: string;
    email?: string;
    phone?: string;
  }

  interface Transaction {
    action: string;
    addons: any;
    created_at: Date;
    customer_uid: string;
    dashboard_url: string;
    duplicates: any[];
    flags: any[];
    fields: any[];
    images: any;
  }

  declare class Tokens {
    accessToken: string;
    clientToken: string;
    refreshToken: string;
    transactionId: number;
    expiry: Date;
    static fromRefresh(refreshToken: string): Tokens;
  }

  declare class Client {
    constructor({ apiSecret: string, environment: string });
    createTransaction(body: TransactionRequestBody): Promise<Tokens>;
    refreshTokens(tokens: Tokens): Promise<Tokens>;
    fetchTransaction(tokens: Tokens): Promise<Transaction>;
    validateSignature(secret: string, body: string, header: string): boolean;
  }
}
