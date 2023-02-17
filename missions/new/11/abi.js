
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
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "log",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256[12]",
                "name": "",
                "type": "uint256[12]"
            }
        ],
        "name": "log12",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "createNewMap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentTankTotalWaterVolume",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCurrentTankWaterLevel",
        "outputs": [
            {
                "internalType": "uint256[12]",
                "name": "",
                "type": "uint256[12]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTankData",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "currentBlockTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256[12]",
                        "name": "currentTankWalls",
                        "type": "uint256[12]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalTanks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "currentWaterVolume",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalWaterVolume",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct TotalVolumeTanks.userWaterTankData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
