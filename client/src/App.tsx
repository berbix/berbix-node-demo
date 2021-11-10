import {
  makeStyles,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { useForm } from "react-hook-form";

import React, { useState } from "react";
import BerbixVerify from "berbix-react"; // berbix-react client SDK
import BounceLoader from "react-spinners/BounceLoader";

import { verify, getTransaction } from "./VerifyClient";

interface IFormInput {
  email: string;
  firstName: string;
  lastName: string;
}

const useStyles = makeStyles((theme) => ({
  heading: {
    textAlign: "center",
    margin: theme.spacing(1, 0, 4),
  },
  submitButton: {
    marginTop: theme.spacing(4),
  },
}));

function App() {
  
  const {
    register,
    handleSubmit,
  } = useForm<IFormInput>();
  const { heading, submitButton } = useStyles();
  const [clientToken, setClientToken] = useState<string | undefined>();
  const [customerUid, setCustomerUid] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [idVerificationStatus, setIdVerificationStatus] = useState<
    boolean | undefined
  >();
  const [transactionData, setTransactionData] = useState<any>();
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: IFormInput) => {
    verify(data.email!) // send request to server to invoke the berbix verify API to create a transaction with email as customer UID
      .then((res) => {
        setCustomerUid(data.email) 
        setClientToken(res.data.client_token);
      })
      .catch((err) => {
        setError(err);
      });
  };

  const onFlowCompleted = async () => {
    setLoading(true);
    const transaction = await getTransaction(customerUid as string);
    setLoading(false);
    setTransactionData(transaction.data);
    setIdVerificationStatus(transaction.data.action === "accept");
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: '100vh' }}
      >
    <Container maxWidth="xs">
      <BounceLoader size={100} color={"#69b2f7"} loading={loading} />
      {loading && <Alert severity="info">Processing...</Alert>}
      {idVerificationStatus !== undefined && (
        <div>
          {idVerificationStatus
            ? <Alert severity="success">Your ID was accepted! 🎉</Alert>
            : <Alert severity="error">Your ID was rejected.😭 It failed flag(s): ${transactionData.flags}</Alert>
          }
        </div>
      )}
      {clientToken ? (
          <BerbixVerify
            environment="production"
            clientToken={clientToken}
            onComplete={onFlowCompleted}
            onError={(e: any) => {
              setError(e);
            }}
          />
      ) : (
        <>
          <Typography className={heading} variant="h3">
            Sign Up Form
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register("email")}
              variant="outlined"
              margin="normal"
              label="Email"
              fullWidth
              required
            />
            <TextField
              {...register("firstName")}
              variant="outlined"
              margin="normal"
              label="First Name"
              fullWidth
              required
            />
            <TextField
              {...register("lastName")}
              variant="outlined"
              margin="normal"
              label="Last Name"
              fullWidth
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={submitButton}
            >
              Sign Up
            </Button>
          </form>
      </>
      )}
    </Container>
    </Grid>
  );
};

export default App;
