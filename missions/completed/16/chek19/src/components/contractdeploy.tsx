import * as React from "react";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  useContract,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import config from "../contractconfig.json";
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export function Contractdeploy(wallets) {
  const theme = useTheme();
  const address1 = "0x5C99E8678657110cA3adD8EfD908C7964d67e634";
  const [value, setValue] = React.useState(0);
  const [ownerlist, setownerlist] = useState("");
  const [confirmation, setconfirmation] = useState("");
  const [salt, setsalt] = useState("");
  let bool1 = ownerlist !== "" && confirmation !== "";
  let bool2 = ownerlist !== "" && confirmation !== "" && salt !== "";
  const handleInputChange1 = (event) => {
    setownerlist(event.target.value);
  };

  const handleInputChange2 = (event) => {
    setconfirmation(event.target.value);
  };

  const handleInputChange3 = (event) => {
    setsalt(event.target.value);
  };

  // contract interaction

  const { data: data2 } = useContractRead({
    address: address1,
    abi: config.abi2,
    functionName: "getAddress",
    args: [ownerlist.split(","), confirmation, salt],
    enabled: bool2,
  });

  const { config: contractcreate } = usePrepareContractWrite({
    address: address1,
    abi: config.abi2,
    functionName: "deployMultiSigWithCreate",
    args: [ownerlist.split(","), confirmation],
    enabled: bool1,
  });
  const { write: turnr } = useContractWrite(contractcreate);
  const onturn = async () => {
    try {
      await turnr?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: contractcreate2 } = usePrepareContractWrite({
    address: address1,
    abi: config.abi2,
    functionName: "deployMultiSigWithCreate2",
    args: [ownerlist.split(","), confirmation, salt],
    enabled: bool1,
  });
  const { write: turnr1 } = useContractWrite(contractcreate2);
  const onturn1 = async () => {
    try {
      await turnr1?.();
    } catch (error) {
      console.log(error);
    }
  };

  // contract interaction end
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!bool1) {
      return alert("all fields required");
    }
    onturn();
    console.log(ownerlist.split(","), confirmation, salt);
  };
  const handleSubmit2 = (event) => {
    console.log(ownerlist.split(","), confirmation, salt);
    event.preventDefault();
    if (!bool1) {
      return alert("all fields required");
    }
    if (
      !(
        parseInt(confirmation) > 0 &&
        parseInt(confirmation) <= ownerlist.split(",").length
      )
    ) {
      return alert("invalid number of required confirmations");
    }
    onturn1();
    console.log(ownerlist.split(","), confirmation, salt);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };
  console.log(data2);
  return (
    <div>
      <h2 className="text-4xl font-bold text-center text-blue-600 py-4 border-b-4 border-blue-600 mb-8">
        Deploy Wallet
      </h2>
      <Box sx={{ bgcolor: "background.paper", width: 500 }}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab label="Create" {...a11yProps(0)} />
            <Tab label="Create2" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            <Box className="flex gap-4 flex-col">
              <TextField
                label="Owner address list"
                color="secondary"
                focused
                onChange={handleInputChange1}
              />
              <TextField
                label="number of confirmations"
                color="secondary"
                focused
                onChange={handleInputChange2}
                required
              />
              <Button onClick={handleSubmit} variant="contained">
                Deploy
              </Button>
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <Box className="flex gap-4 flex-col">
              <TextField
                label="Owner address list"
                color="secondary"
                focused
                onChange={handleInputChange1}
              />
              <TextField
                label="number of confirmations"
                color="secondary"
                onChange={handleInputChange2}
                focused
              />
              <TextField
                label="input salt"
                color="secondary"
                focused
                onChange={handleInputChange3}
              />
              {data2 ? (
                <div>
                  <h4>computed address:</h4>
                  <Typography>
                    <div>{data2.toString()}</div>
                  </Typography>
                </div>
              ) : bool2 ? (
                <LoadingButton
                  size="small"
                  loading={true}
                  variant="outlined"
                  disabled
                >
                  <span>disabled</span>
                </LoadingButton>
              ) : (
                ""
              )}

              <Button onClick={handleSubmit2} variant="contained">
                Deploy
              </Button>
            </Box>
          </TabPanel>
        </SwipeableViews>
      </Box>
    </div>
  );
}
