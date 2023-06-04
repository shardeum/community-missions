const provider = new ethers.providers.Web3Provider(window.ethereum)

let connected = false;
const ethereumButton = document.querySelector('.enableEthereumButton');
const showAccount = document.querySelector('.showAccount');
const chainID = document.querySelector('.chainID');

contract_abi = [{"inputs":[{"internalType":"uint256","name":"begin","type":"uint256"},{"internalType":"uint256","name":"end","type":"uint256"},{"internalType":"string","name":"text","type":"string"}],"name":"getSlice","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"string","name":"first","type":"string"},{"internalType":"string","name":"second","type":"string"}],"name":"strEq","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"string","name":"str","type":"string"}],"name":"strLen","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"string","name":"targetString","type":"string"},{"internalType":"string[]","name":"wordList","type":"string[]"}],"name":"validate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}] ;
contract_address = '0x02455a9d29F769CFC59f4139591654Ebef66b602'; 
const wordmixerContract = new ethers.Contract(contract_address, contract_abi, provider);


ethereumButton.addEventListener('click', () => {
  if (typeof window.ethereum !== 'undefined') {
    getAccount();
}
  else {
    alert('MetaMask is not installed !'); 
} 

});

async function getAccount() {
  const accounts = await provider.send("eth_requestAccounts", []);
  const account = accounts[0];
  showAccount.innerHTML = account;
  connected = true; 
  checkNetwork();
}

async function checkNetwork(){
  const requiredChainId = "0x1f92" // Shardeum Sphinx 1.X
  
  if (window.ethereum.networkVersion !== requiredChainId) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: requiredChainId }]
        });
  }
}

const validateButton = document.querySelector('.validateButton');

async function getCurrentAccount() {
  const accounts = await ethereum.request({ method: 'eth_accounts' });
  return accounts[0];
}

async function validate() {
  
  checkNetwork();
  const account = await getCurrentAccount();
  const signer = provider.getSigner()
  if (document.getElementById("targetString").value == '') {
    alert("Enter a string as argument for validate() !");
  }
  if (document.getElementById("wordlist").value == '') {
    alert("Enter an array of string as argument for validate() !");
  }  
  console.log(document.getElementById("targetString").value);
  console.log(document.getElementById("wordlist").value.split(",").map((item) => item.trim()));
  const wordmixerWithSigner = wordmixerContract.connect(signer);
  result = await wordmixerWithSigner.validate(document.getElementById("targetString").value, document.getElementById("wordlist").value.split(",").map((item) => item.trim()));
  alert(result);
}

validateButton.addEventListener('click', () => {
  validate();
});
    
