import {
    makeStyles,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
  } from "@material-ui/core";
  import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
  import Alert from '@material-ui/lab/Alert';
  import { useForm } from "react-hook-form";

  import React, { useState } from "react";
  import { uploadImage } from "../VerifyClient";
  import { apiSandbox } from "../Constants";
  import axios from "axios";
  
  interface IFormInput {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
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
  
  function APIOnlyApp() {
    
    const {
        register,
        handleSubmit,
      } = useForm<IFormInput>();

    const { heading, submitButton } = useStyles();
    const [accessToken, setAccessToken] = useState<string | undefined>();
    const [customerUid, setCustomerUid] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [json, setJson] = useState<string>();
  
    const onSubmit = (formdata: IFormInput) => {
        uploadImage(formdata.email!) // send request to server to create a transaction with email as customer UID
          .then((res) => {
            setCustomerUid(formdata.email) 
            // setAccessToken(res.data.access_token);
            const formjson = {
                access_token: res.data.access_token, 
                image: {
                    data: formdata.picture,
                    format: "string",
                    image_subject: "document_front"
                  }};
            axios.post(`${apiSandbox}/images/upload`, formjson)
              .then(response => {
                console.log("Status: ", response.status);
                console.log("Data: ", response.data);
              }).catch(error => {
                console.error('Something went wrong!', error);
              });
          })
          .catch((err) => {
            setError(err);
          });
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
          <Typography className={heading} variant="h3">
              Check Out
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
            <input
                {...register("picture")}
                type="file"
                color="primary"
                accept="image/*"
            />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={submitButton}
              >
                Check Out
              </Button>
              {json && (
          <>
            <Typography variant="body1">
              Below is the JSON that would normally get passed to the server
              when a form gets submitted
            </Typography>
            <Typography variant="body2">{json}</Typography>
          </>
        )}
      </form>
    </Container>
    );
    </Grid>
    );
  };
  
  export default APIOnlyApp;
  