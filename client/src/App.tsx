import React, { useState } from "react";
import styled from "styled-components";
import BerbixVerify from "berbix-react";
import BounceLoader from "react-spinners/BounceLoader";

import { verify, getTransaction } from "./VerifyClient";

const App = () => {
  const [clientToken, setClientToken] = useState<string | undefined>();
  const [customerUid, setCustomerUid] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [idVerificationStatus, setIdVerificationStatus] = useState<
    boolean | undefined
  >();
  const [transactionData, setTransactionData] = useState<any>();
  const [invalidInput, setInvalidInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerUid(event.target.value);
    setInvalidInput(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerUid) {
      setInvalidInput(true);
      return;
    }

    verify(customerUid!)
      .then((res) => {
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
    <Container>
      <BounceLoader size={100} color={"#69b2f7"} loading={loading} />
      {loading && <Message>Processing...</Message>}
      {idVerificationStatus !== undefined && (
        <Message>
          Your ID was{" "}
          {idVerificationStatus
            ? "accepted! 🎉"
            : `rejected. 😭 ${transactionData.flags}`}
        </Message>
      )}
      {clientToken ? (
        <VerifyContainer>
          <BerbixVerify
            environment="sandbox"
            clientToken={clientToken}
            onComplete={onFlowCompleted}
            onError={(e: any) => {
              setError(e);
            }}
          />
        </VerifyContainer>
      ) : (
        <>
          <h2>Verification Demo</h2>
          <Form onSubmit={handleSubmit}>
            <label>
              Customer UID:
              <TextInput
                type="text"
                value={customerUid}
                onChange={handleChange}
                underlineColor={invalidInput ? "red" : "white"}
              />
            </label>
            <Button type="submit">Get Verified</Button>
          </Form>
        </>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

const Container = styled.div`
  text-align: center;
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100px;
  font-size: calc(10px + 2vmin);
`;

interface Props {
  underlineColor: string;
}

const TextInput = styled.input<Props>`
  border: 0;
  background: none;
  outline: none;
  border-bottom: 3px solid ${(props) => props.underlineColor};
  margin-left: 16px;
  color: white;
  width: 200px;
  font-size: calc(10px + 2vmin);
`;

const Button = styled.button`
  background-color: #69b2f7;
  height: 50px;
  padding: 0px 16px;
  margin-top: 32px;
  border: 0;
  border-radius: 5px;
  color: white;
  font-size: calc(10px + 2vmin);
  cursor: pointer;
`;

const Message = styled.p`
  font-weight: bold;
  color: white;
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
`;

const VerifyContainer = styled.div`
  width: 50%;
  min-width: 400px;
`;

export default App;
