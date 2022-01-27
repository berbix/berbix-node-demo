import React from "react";
import {
    makeStyles,
    Container,
    Typography,
    Grid,
  } from "@material-ui/core";

import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    heading: {
      textAlign: "center",
      margin: theme.spacing(1, 0, 4),
    },
  }));

function Home() {
    const { heading } = useStyles();
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
              Berbix Demos
            </Typography>
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to="/berbixapionly">API Only Verification</Link>
                    </li>
                    <li>
                        <Link to="/berbixverify">Berbix Verify Flow</Link>
                    </li>
                </ul>
            </nav>
        </div>
        </Container>
        </Grid>
    )}; 

export default Home;
