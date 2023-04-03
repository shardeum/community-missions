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
import { useConnect, useAccount } from "wagmi";
import {
  useContract,
  useContractRead,
  useContractReads,
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

export function Walletdata(wallet) {
  const theme = useTheme();
  const { address, isConnecting, isDisconnected } = useAccount();
  const address1 = "0x5C99E8678657110cA3adD8EfD908C7964d67e634";
  const [value, setValue] = React.useState(0);
  const [ownerlist, setownerlist] = useState("");
  const [confirmation, setconfirmation] = useState("");
  const [salt, setsalt] = useState("");
  let bool1 = ownerlist !== "" && confirmation !== "";
  let bool2 = ownerlist !== "" && confirmation !== "" && salt !== "";

  const handleInputChange3 = (event) => {
    setsalt(event.target.value);
  };

  // contract interaction

  const { data: owners } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "getOwners",
  });
  const { data: getcount } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "getTransactionCount",
  });
  const { data: numconfirmation } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "numConfirmationsRequired",
  });
  const { data: isowner } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "isOwner",
    args: [address],
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };
  console.log(owners, getcount, numconfirmation);
  const [textField1, setTextField1] = useState("");
  const [textField2, setTextField2] = useState("");
  const [textField3, setTextField3] = useState("");
  const [textField4, setTextField4] = useState("");
  const [textField5, setTextField5] = useState("");
  const [textField6, setTextField6] = useState("");
  const handleInputChange1 = (event) => {
    setTextField1(event.target.value); //handles transaction id
  };

  const handleInputChangeto = (event) => {
    setTextField2(event.target.value);
  };
  const handleInputChangevalue = (event) => {
    setTextField3(event.target.value);
  };
  const handleInputChangedata = (event) => {
    setTextField4(event.target.value);
  };
  const handleInputChangeaddress = (event) => {
    setTextField5(event.target.value);
  };
  const handleowner = (event) => {
    console.log("hai");
    let data_owners = owners ? owners : "";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };
  const handleisowner = (event) => {
    console.log("hai");
    let data_owners = isowner ? isowner : "";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };
  const handlecount = (event) => {
    console.log("hai");
    let data_owners = getcount ? getcount : "";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };
  const handleconfirmation = (event) => {
    console.log("hai");
    let data_owners = numconfirmation ? numconfirmation : "";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };
  const { data: gettranscount } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "getTransaction",
    args: [textField1],
  });
  const handlegettranscount = (event) => {
    if (textField1 == "") {
      return alert("enter a value in tx field");
    }
    let data_owners = gettranscount ? gettranscount : "transaction not found";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };

  const { data: gettransconfirm } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "isConfirmed",
    args: [textField1, textField5],
  });
  console.log("confirmation:", gettransconfirm);
  const handlegettransis = (event) => {
    console.log("hai");
    if (textField1 === "" || textField5 === "") {
      return alert("enter a value in tx field");
    }
    let data_owners = gettransconfirm ? gettransconfirm : false;
    setTextField6(data_owners?.toString());
    console.log(textField6);
  };
  const { data: ownerindex } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "owners",
    args: [textField1],
  });
  const handlegetowner_index = (event) => {
    console.log("hai");
    if (textField1 == "") {
      return alert("enter a value in tx field");
    }
    let data_owners = ownerindex ? ownerindex : "transaction not found";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };
  const { data: transactiondata } = useContractRead({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "transactions",
    args: [textField1],
  });
  const handlegetowner_transaction = (event) => {
    console.log("hai");
    if (textField1 == "") {
      return alert("enter a value in tx field");
    }
    let data_owners = transactiondata
      ? transactiondata
      : "transaction not found";
    setTextField6(data_owners.toString());
    console.log(textField6);
  };
  let bool3 = textField1 !== "";
  let bool4 = textField2 !== "" && textField4 !== "" && textField3 !== "";
  const { config: confirmtransaction0 } = usePrepareContractWrite({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "confirmTransaction",
    args: [textField1],
    enabled: bool3,
  });
  const { write: turnr2 } = useContractWrite(confirmtransaction0);
  const onturn2 = async () => {
    console.log("testing onturn2", bool3);
    try {
      await turnr2?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: confirmtransaction1 } = usePrepareContractWrite({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "executeTransaction",
    args: [textField1],
    enabled: bool3,
  });
  const { write: turnr3 } = useContractWrite(confirmtransaction1);
  const onturn3 = async () => {
    try {
      await turnr3?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: confirmtransactionrevoke } = usePrepareContractWrite({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "revokeConfirmation",
    args: [textField1],
    enabled: bool3,
  });
  const { write: turnr4 } = useContractWrite(confirmtransactionrevoke);
  const onturn4 = async () => {
    try {
      await turnr4?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: submitransaction } = usePrepareContractWrite({
    address: wallet["wallet"],
    abi: config.abi1,
    functionName: "submitTransaction",
    args: [textField2, textField3, textField4],
    enabled: bool4,
  });
  const { write: turnr5 } = useContractWrite(submitransaction);
  const onturn5 = async () => {
    console.log(
      "turn5",
      textField2 !== "",
      textField4 !== "",
      textField3 !== ""
    );
    try {
      await turnr5?.();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex gap-20 w-full h-auto">
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
            <Tab label="Read" {...a11yProps(0)} />
            <Tab label="Write" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            <Box className="flex gap-4 flex-col">
              <Button
                variant="contained"
                onClick={handleowner}
                disableElevation
              >
                getOwners
              </Button>
              <Button
                variant="contained"
                onClick={handleisowner}
                disableElevation
              >
                isOwner
              </Button>
              <Button
                variant="contained"
                onClick={handlecount}
                disableElevation
              >
                getTransactionCount
              </Button>
              <Button
                variant="contained"
                onClick={handleconfirmation}
                disableElevation
              >
                numConfirmationsRequired
              </Button>
              <TextField
                label="getTransaction"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <Button variant="contained" onClick={handlegettranscount}>
                get Transaction
              </Button>
              <TextField
                label="transaction id"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <TextField
                label="address"
                color="secondary"
                focused
                onChange={handleInputChangeaddress}
                required
              />
              <Button variant="contained" onClick={handlegettransis}>
                is Confirmed
              </Button>
              <TextField
                label="index"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <Button variant="contained" onClick={handlegetowner_index}>
                owners
              </Button>
              <TextField
                label="id"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <Button variant="contained" onClick={handlegetowner_transaction}>
                transaction
              </Button>
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <Box className="flex gap-4 flex-col">
              <TextField
                label="_txIndex"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <Button variant="contained" onClick={onturn2}>
                confirmTransaction
              </Button>
              <TextField
                label="_txIndex"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <Button variant="contained" onClick={onturn3}>
                executeTransaction
              </Button>
              <TextField
                label="_txIndex"
                color="secondary"
                focused
                onChange={handleInputChange1}
                required
              />
              <Button variant="contained" onClick={onturn4}>
                revokeConfirmation
              </Button>
              <TextField
                label="to"
                color="secondary"
                focused
                onChange={handleInputChangeto}
                required
              />
              <TextField
                label="value"
                color="secondary"
                focused
                onChange={handleInputChangevalue}
                required
              />
              <TextField
                label="data"
                color="secondary"
                focused
                onChange={handleInputChangedata}
                required
              />
              <Button variant="contained" onClick={onturn5}>
                submitTransaction
              </Button>
            </Box>
          </TabPanel>
        </SwipeableViews>
      </Box>
      <Box sx={{ width: 800 }}>
        <div className="border border-gray-400 rounded-t-lg overflow-hidden">
          <div className="flex items-center bg-gray-100 py-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mx-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mx-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 mx-2"></div>
          </div>
          <div className="bg-black text-white p-2 h-20">
            <h4>Wallet Terminal 1.0.0</h4>
            <h5 className="text-white">
              ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            </h5>
            <h5>{textField6 !== "" ? textField6 : ""}</h5>
          </div>
        </div>
      </Box>
    </div>
  );
}
