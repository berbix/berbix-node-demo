import axios from "axios";

import { apiRoot } from "./Constants";

export const verify = (customer_uid: string) => {
  return axios.post(`${apiRoot}/verify?customer_uid=${customer_uid}`);
};

export const APIVerify = (req: any) => {
  const customer_uid = req.cuid
  return axios.post(`${apiRoot}/APIverify?customer_uid=${customer_uid}`, req);
};

export const uploadImage = (req: FormData) => {
  const config = {
    headers: {
        'content-type': 'multipart/form-data'
    }
  };
  return axios.post(`${apiRoot}/imageUpload`,req, config)
};

export const getTransaction = (customer_uid: string): Promise<any> => {
  return axios.get(`${apiRoot}/transactions?customer_uid=${customer_uid}`);
};
