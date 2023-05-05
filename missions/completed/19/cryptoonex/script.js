const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false, walletInstance, ownerCount=1;
let walletConnectBtn = document.querySelector('.connect-wallet');
walletConnectBtn.addEventListener('click', getAccounts);
let verifyTxnBtn = document.querySelector('.verify-button');
verifyTxnBtn.addEventListener('click', verifyTxn);
document.querySelector('.sample-proof').addEventListener('click', function(){
	copySample('proof');
});
document.querySelector('.sample-input').addEventListener('click', function(){
	copySample('input');
});
viewAccounts();
$('.has-wallet').hide();
function showLoader(){
	$('.opacity, .loader').show();
}
function hideLoader(){
	$('.opacity, .loader').hide();
}
hideLoader();
const ABI = [
	{
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "X",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "Y",
								"type": "uint256"
							}
						],
						"internalType": "struct Pairing.G1Point",
						"name": "a",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "uint256[2]",
								"name": "X",
								"type": "uint256[2]"
							},
							{
								"internalType": "uint256[2]",
								"name": "Y",
								"type": "uint256[2]"
							}
						],
						"internalType": "struct Pairing.G2Point",
						"name": "b",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "X",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "Y",
								"type": "uint256"
							}
						],
						"internalType": "struct Pairing.G1Point",
						"name": "c",
						"type": "tuple"
					}
				],
				"internalType": "struct Verifier.Proof",
				"name": "proof",
				"type": "tuple"
			},
			{
				"internalType": "uint256[2]",
				"name": "input",
				"type": "uint256[2]"
			}
		],
		"name": "verifyTx",
		"outputs": [
			{
				"internalType": "bool",
				"name": "r",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


const contractAddress = "0x7Df4fFe897fE87175cF3e8c9bc016C5dA8b61996";
async function viewAccounts(){
    let accounts = await provider.listAccounts();
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

async function verifyTxn(){
	showLoader();
	let proof = eval(document.querySelector('.text-area-proof').value);
	let input = eval(document.querySelector('.text-area-input').value);
	try{
		let result = await contract.verifyTx(proof, input);
		document.querySelector('.verify-result').innerText = "Verified: " + result.toString();
	}
	catch(e){
		document.querySelector('.verify-result').innerText = "Error occured: Please try again";
	}
	finally{
		hideLoader();
	}

}
function maskWallet(wallet){
	return wallet.slice(0,5) + '...' + wallet.slice(-5);
}

function copySample(field){
	const samples = {
		proof: '[["0x00d3eb23920cfa72c6e96c9850a3ebfb9da387123869e9ffb474c86a4b2ec631","0x0f9a17d89c1364ff6bb297d5af059b013b832291f76709d320da88634f9798eb"],[["0x2fa9117473eb475df997cd1383126059ea8db26a65cb2dadee3b4074daf26aba","0x2acf1713b0e937b8a6cfe21432ebaccf7b03a861d4b530fd4a2cfa4cfad0003d"],["0x24d07103e690875962783a1a17c733f9e3cf54821e5446e690ecac504a5d9470","0x20d8d77df0f85ddd4ccc82ca40be452e266a5297d85eb093ff24ec56c39e667a"]],["0x22e869bc132a4087e5f31179e4108523d7e6f33d180324d5b30dd2eaf3bb95bf","0x0ab24edda5044026431a71717f573eb2d479497868762ebfef2c40a1b0ce3ded"]]',
		input: '["0x0000000000000000000000000000000022192dc09ba3afbc0d0c5b60675ab40b","0x000000000000000000000000000000003f8e08fd3897de4e81a37a4752805f46"]'
	};
	navigator.clipboard.writeText(samples[field]);
}

async function getAccounts(){
    let accounts = await provider.send('eth_requestAccounts', []);
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
		showLoader();
        updateDOM();
    }
}
function toBytes(value){
	return ethers.utils.formatBytes32String(value);
}
function fromBytes(data){
	return ethers.utils.parseBytes32String(data);
}

async function updateDOM(){
	hideLoader();
    $('.wallet').remove();
    $('.connected-wallet').html(`<button type="button" class="btn btn-primary">${maskWallet(address)}</button>`);
	$('.app-interface').css('display', 'flex');
    contractInit();
}



function contractInit(){
    contract = new ethers.Contract(contractAddress, ABI, provider.getSigner());
}


function formatData(x){
    return Number(x);
}
