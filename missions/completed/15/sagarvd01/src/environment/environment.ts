export const environments = {
    ABI : [
        {
            "inputs": [],
            "name": "findPaths",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "generateNewBoard",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getNewBoard",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint8[3][3]",
                            "name": "currentRoomCoordinates",
                            "type": "uint8[3][3]"
                        },
                        {
                            "internalType": "uint256",
                            "name": "currentPaths",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct EscapeTheRoom.escapeRoomData",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    contract: "0x62BC8404DB7F93862A4BA2357C9bfC8c9eea804b"
};