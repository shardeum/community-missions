export const environments = {
    ABI: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256[]",
                    "name": "inputs",
                    "type": "uint256[]"
                }
            ],
            "name": "verifyWin",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBoard",
            "outputs": [
                {
                    "internalType": "uint8[9][9]",
                    "name": "",
                    "type": "uint8[9][9]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getUserStats",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    contract: "0x6F163F7d6B6eda2a611fdFb654abDE57b435386d"
}