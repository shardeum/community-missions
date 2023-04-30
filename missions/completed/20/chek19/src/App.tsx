import WalletConnector from "./WalletConnector";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { verifyProof, Proof } from "./contract";
import useInput from "./useInput";
import { useState } from "react";
import Loading from "./components/Loading";
import { TextareaAutosize } from "@mui/base";

const darkTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function App() {
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [Verifying, setVerifying] = useState(false);
  const [proof, setproof] = useState<string | undefined>(undefined);

  const x = useInput("0");
  const y = useInput("0");

  const verify = async () => {
    setVerified(false);
    setError(false);
    setVerifying(true);
    const abi = { x: parseInt(x.value), y: parseInt(y.value) };
    const proof1 = await Proof(abi);
    setproof(proof1);
    let verified = await verifyProof(abi).catch((error: any) => {
      setErrorMsg(error.toString());
      setError(true);
      setVerifying(false);
    });

    if (verified) setVerified(true);

    setVerifying(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <WalletConnector />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Prove that x +y==1729</Typography>
        <br />
        <TextField
          id="x"
          label="x"
          type="number"
          variant="filled"
          value={x.value}
          onChange={x.onChange}
        />
        <TextField
          id="y"
          label="y"
          type="number"
          variant="filled"
          value={y.value}
          onChange={y.onChange}
        />
        <br />
        <Button onClick={verify} variant="contained">
          Prove+Verify
        </Button>
        {Verifying ? <Loading text="Verifying proof..." /> : <div />}
        {error ? (
          <Alert severity="error" sx={{ textAlign: "left" }}>
            {errorMsg}
          </Alert>
        ) : (
          <div />
        )}
        {verified ? (
          <div>
            <Alert severity="success" sx={{ textAlign: "left" }}>
              Verified!
            </Alert>
            <TextareaAutosize
              aria-label="Enter your message"
              minRows={4}
              placeholder={proof}
              style={{ width: "100%" }}
            />
          </div>
        ) : (
          <div />
        )}
      </Box>
      <Typography>
        "1729" is a number that is often referred to as the "Hardy-Ramanujan
        number," named after two famous mathematicians, G. H. Hardy and
        Srinivasa Ramanujan. According to legend, when Hardy went to visit
        Ramanujan in the hospital, he remarked that the number of the taxi cab
        he had taken, 1729, was rather dull. Ramanujan disagreed, saying it was
        actually quite interesting because it was the smallest number that can
        be expressed as the sum of two cubes in two different ways: 1729 = 1^3 +
        12^3 = 9^3 + 10^3. This story has made 1729 a popular example in number
        theory and mathematics in general.
      </Typography>
    </ThemeProvider>
  );
}
