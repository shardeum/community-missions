import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
export function Userwallets(wallets) {
  const router = useRouter();
  return (
    <div>
      <h2 className="text-4xl font-bold text-center text-blue-600 py-4 border-b-4 border-blue-600 mb-8">
        User Wallets
      </h2>
      <Box sx={{ width: "100%" }}>
        <Stack spacing={2}>
          {wallets ? (
            wallets["wallets"].map((value) => {
              return (
                <Item className="flex gap-4 flex-col">
                  <div className="flex gap-4">
                    <AccountBalanceWalletIcon />
                    {value}
                  </div>

                  <Button
                    variant="contained"
                    onClick={() => router.push(`/wallet/${value}`)}
                    disableElevation
                  >
                    view
                  </Button>
                </Item>
              );
            })
          ) : (
            <Item>No wallet found</Item>
          )}
        </Stack>
      </Box>
    </div>
  );
}
