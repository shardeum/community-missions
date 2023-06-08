let web3;
let web3;
const contractAbi = [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "expression",
            "type": "string"
          }
        ],
        "name": "evaluate",
        "outputs": [
          {
            "internalType": "int256",
            "name": "",
            "type": "int256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      }
    ];
    const contractAddress = "0xcc2bdfaa45fd5fe6021117f198491134c3f75ae9";

    let web3;

    // Update the wallet address when connected
    function updateWalletAddress(address) {
      walletAddress.textContent = "Connected Wallet: " + address;
    }

    // Handle the "Connect Wallet" button click event
    connectWalletBtn.addEventListener("click", async () => {
      try {
        // Prompt the user to connect their wallet
        await ethereum.request({ method: "eth_requestAccounts" });

        // Get the connected wallet address
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];

        // Update the UI with the connected wallet address
        updateWalletAddress(address);
      } catch (error) {
        console.error(error);
      }
    });

    // Handle the "Evaluate" button click event
    evaluateBtn.addEventListener("click", async () => {
      try {
        const expression = expressionInput.value;

        // Create a contract instance
        const contract = new web3.eth.Contract(contractAbi, contractAddress);

        // Call the evaluate function on the smart contract
        const result = await contract.methods.evaluate(expression).call();

        // Display the result
        result.textContent = "Result: " + result;
      } catch (error) {
        console.error(error);
      }
    });

    // Initialize Web3 and connect to the test network
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        try {
          // Request access to the user's accounts
          await ethereum.enable();
          web3 = new Web3(ethereum);

          // Update the UI with the connected wallet address if already connected
          if (ethereum.selectedAddress) {
            updateWalletAddress(ethereum.selectedAddress);
          }
        } catch (error) {
          console.error(error);
        }
      } else if (window.web3) {
        web3 = new Web3(web3.currentProvider);
      } else {
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
      }
    });

    let web3;

    // Update the wallet address when connected
    function updateWalletAddress(address) {
      walletAddress.textContent = "Connected Wallet: " + address;
    }

    // Handle the "Connect Wallet" button click event
    connectWalletBtn.addEventListener("click", async () => {
      try {
        // Prompt the user to connect their wallet
        await ethereum.request({ method: "eth_requestAccounts" });

        // Get the connected wallet address
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];

        // Update the UI with the connected wallet address
        updateWalletAddress(address);
      } catch (error) {
        console.error(error);
      }
    });

    // Handle the "Evaluate" button click event
    evaluateBtn.addEventListener("click", async () => {
      try {
        const expression = expressionInput.value;

        // Create a contract instance
        const contract = new web3.eth.Contract(contractAbi, contractAddress);

        // Call the evaluate function on the smart contract
        const result = await contract.methods.evaluate(expression).call();

        // Display the result
        result.textContent = "Result: " + result;
      } catch (error) {
        console.error(error);
      }
    });

    // Initialize Web3 and connect to the test network
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        try {
          // Request access to the user's accounts
          await ethereum.enable();
          web3 = new Web3(ethereum);

          // Update the UI with the connected wallet address if already connected
          if (ethereum.selectedAddress) {
            updateWalletAddress(ethereum.selectedAddress);
          }
        } catch (error) {
          console.error(error);
        }
      } else if (window.web3) {
        web3 = new Web3(web3.currentProvider);
      } else {
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
      }
    });