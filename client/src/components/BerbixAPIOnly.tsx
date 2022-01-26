import {
    makeStyles,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
  } from "@material-ui/core";
  import Alert from '@material-ui/lab/Alert';
  import { useForm } from "react-hook-form";

  import React, { useState } from "react";
  import { APIVerify, uploadImage } from "../VerifyClient";

import BounceLoader from "react-spinners/BounceLoader";


  interface IFormInput {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    documentSide: string;
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
        getValues,
        handleSubmit,
      } = useForm<IFormInput>();

    const { heading, submitButton } = useStyles();
    const [error, setError] = useState<string | undefined>();
    const [json, setJson] = useState<string>();
    const [loading, setLoading] = useState(false);
  
    const onSubmit = (formdata: IFormInput) => {
      const pic = getValues("picture");
      const formData = new FormData();
      formData.append('picture', pic[0]);
      uploadImage(formData!)
          .then((response) => {
            return { data: response.data, cuid: formdata.email, document_side: formdata.documentSide };
          })
          .then((imgData) => {
            setLoading(true);
            // create an API-only transaction with customer UID and image data
            APIVerify(imgData!)
              .then((res) => {
                setJson(JSON.stringify(res.data))
                setLoading(false);
              }).catch((err) => {
                setJson(err.message)
                setLoading(false);
            })
          }).catch((err) => {
            setJson(err.message)
            setError(err);
          });
        };  
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}
        >
      <Container maxWidth="xs">
          
          <Typography className={heading} variant="h3">
              Check Out
            </Typography>

            <BounceLoader size={100} color={"#69b2f7"} loading={loading} />
            {loading && <Alert severity="info">Processing...</Alert>}

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
              <Select
                {...register("documentSide")}
                variant="outlined"
                label="Document Side"
                fullWidth
                required
                >
                  <MenuItem value={"document_front"}>Document Front</MenuItem>
                  <MenuItem value={"document_back"}>Document Back</MenuItem>
              </Select>
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
              JSON payloads or errors returned by Berbix:
            </Typography>
            <Typography variant="body2"><pre>{json}</pre></Typography>
          </>
        )}
      </form>
    </Container>
    </Grid>
    );
  };
  
  export default APIOnlyApp;
  