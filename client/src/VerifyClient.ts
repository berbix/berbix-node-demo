import axios from "axios";

import { apiRoot } from "./Constants";

export const verify = (customer_uid: string) => {
  return axios.post(`${apiRoot}/verify?customer_uid=${customer_uid}`);
};

export const getTransaction = (customer_uid: string): Promise<any> => {
  return axios.get(`${apiRoot}/transactions?customer_uid=${customer_uid}`);
};
