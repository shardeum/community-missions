export const VALIADATE_CONTRACT_ADDRESS =
  "0x5118055D5d09E237C5524C2375CdE673c080aed2";

export const VALIADATE_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "targetWord",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "wordList",
        type: "string[]",
      },
    ],
    name: "canFormTargetWordCaseSensitive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "targetWord",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "wordList",
        type: "string[]",
      },
    ],
    name: "canFormTargetWordIgnoreCase",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];
