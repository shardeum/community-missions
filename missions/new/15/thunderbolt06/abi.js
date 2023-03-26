
const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "a",
                "type": "uint256"
            }
        ],
        "name": "num",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "a",
                "type": "string"
            }
        ],
        "name": "str",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "computePathsCurrentBoard",
        "outputs": [],
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
        "name": "getCurrentPaths",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCurrentRoom",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[3][3]",
                        "name": "currentRoomCoordinates",
                        "type": "uint256[3][3]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "currentPaths",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct EscapeTheRoom.userEscapeRoomData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
