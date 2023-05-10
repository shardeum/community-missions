import WalletConnector from "./WalletConnector";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { verifyProof } from "./contract";
import useInput from "./useInput";
import { useState } from "react";
import Loading from "./components/Loading";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function App() {

    const [error, setError] = useState(false);
    const [verified, setVerified] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [Verifying, setVerifying] = useState(false);

    const x = useInput("0");
    const y = useInput("0");

    const verify = async () => {
        setVerified(false);
        setError(false);
        setVerifying(true);
        const abi = { x: parseInt(x.value), y: parseInt(y.value) };

        let verified = await verifyProof(abi).catch((error: any) => {
            setErrorMsg(error.toString());
            setError(true);
            setVerifying(false);
        });

        if (verified) setVerified(true);

        setVerifying(false);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <Typography>Prove that x != y</Typography><br />
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
                /><br />
                <Button
                    onClick={verify}
                    variant="contained">
                    
                    Prove+Verify
                </Button>
                {Verifying ? <Loading text="Verifying proof..." /> : <div />}
                {error ?<>
                <h2 style={{color: "red"}}
>Proof Failed!!</h2>
                    <Alert severity="error" sx={{ textAlign: "left" , width:"50rem"}}>{errorMsg}</Alert>
                </>  : <div />}
                {verified ? <Alert severity="success" sx={{ textAlign: "left" }}>Verified!</Alert> : <div />}
            </Box>
            <WalletConnector />
        </ThemeProvider>
    )
}
