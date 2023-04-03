const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false, walletInstance, ownerCount=1;
let walletConnectBtn = document.querySelector('.connect-wallet');
let createMapBtn = document.querySelector('.create-map');
let calcVolume = document.querySelector('.calculate-volume');
let walletSelector = document.getElementById('wallet-op');
let walletOpsModal = new bootstrap.Modal(document.getElementById('walletOps'));
let walletCreateModal = new bootstrap.Modal(document.getElementById('createWallet'));
walletConnectBtn.addEventListener('click', getAccounts);
walletSelector.addEventListener('change', manipulateForm);
$('#walletOps').on('hide.bs.modal', discardWalletContract)

viewAccounts();
hide([1,2,3]);
walletCreationMethodSelect(0);
$('.has-wallet').hide();
function showLoader(){
	$('.opacity, .loader').show();
}
function hideLoader(){
	$('.opacity, .loader').hide();
}
hideLoader();
const deployerABI = [
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_owners",
				"type": "address[]"
			},
			{
				"internalType": "uint256",
				"name": "_numConfirmationsRequired",
				"type": "uint256"
			}
		],
		"name": "deployMultiSigWithCreate",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_owners",
				"type": "address[]"
			},
			{
				"internalType": "uint256",
				"name": "_numConfirmationsRequired",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_salt",
				"type": "string"
			}
		],
		"name": "deployMultiSigWithCreate2",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getWallet",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_owners",
				"type": "address[]"
			},
			{
				"internalType": "uint256",
				"name": "_numConfirmationsRequired",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_salt",
				"type": "string"
			}
		],
		"name": "predictAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const walletABI = [
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_owners",
				"type": "address[]"
			},
			{
				"internalType": "uint256",
				"name": "_numConfirmationsRequired",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "txIndex",
				"type": "uint256"
			}
		],
		"name": "ConfirmTransaction",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "txIndex",
				"type": "uint256"
			}
		],
		"name": "ExecuteTransaction",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "txIndex",
				"type": "uint256"
			}
		],
		"name": "RevokeConfirmation",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "txIndex",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "SubmitTransaction",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_txIndex",
				"type": "uint256"
			}
		],
		"name": "confirmTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_txIndex",
				"type": "uint256"
			}
		],
		"name": "executeTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOwners",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_txIndex",
				"type": "uint256"
			}
		],
		"name": "getTransaction",
		"outputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "numConfirmations",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTransactionCount",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isConfirmed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isOwner",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_txIndex",
				"type": "uint256"
			}
		],
		"name": "revokeConfirmation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "submitTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactions",
		"outputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "numConfirmations",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];

const deployerContractAddress = "0x1173313ae3A82aDcD65a2C54073700dC237Ce22A";
async function viewAccounts(){
    let accounts = await provider.listAccounts();
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

function maskWallet(wallet){
	return wallet.slice(0,5) + '...' + wallet.slice(-5);
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
function discardWalletContract(){
	walletInstance = undefined;
	setResult('');
	$('#wallet-op')[0].options.selectedIndex = 0;
	$('#input1, #input2, #input3').val('');
	let ev = document.createEvent("HTMLEvents");
    ev.initEvent("change", false, true);
    walletSelector.dispatchEvent(ev);
}
async function updateDOM(){
	hideLoader();
    $('.wallet').remove();
    $('.connected-wallet').html(`<button type="button" class="btn btn-primary">${maskWallet(address)}</button>`);
	$('.app-interface').css('display', 'flex');
    contractInit();
	getWallet();
}

function walletOpsTemplate(wallet){
	return `
		<div class="wallet-ops mt-5">
			<div class="d-flex justify-content-center">
				<select id="wallet-op" class="wallet-op-selector form-control w-50">
					<option selected>Select Operation</option>
					<option value="confirm">Confirm Tx</option>
					<option value="execute">Execute Tx</option>
					<option value="revoke">Revoke Confirmation</option>
					<option value="submit">Submit New Tx</option>
					<option value="getOwners">View Owners</option>
					<option value="gettx">Get Tx</option>
					<option value="gettxcount">Get Total Tx count</option>
				</select>
			</div>
			<div class="wallet-form-options">
				<input class="mx-auto mt-2 form-control w-50" id="input1">
				<input class="mx-auto mt-2 form-control w-50" id="input2">
				<input class="mx-auto mt-2 form-control w-50" id="input3">
				<button class="d-block btn btn-success mx-auto mt-3 form-control w-50" onclick="executeWalletTx(${wallet})">Execute Operation</button>
			</div>
		</div>
	`;
}

function setPlaceHolder(id, text){
	$(`#input${id}`).val('');
	$(`#input${id}`).attr('placeholder', text);
}

function show(id){
	id.forEach(x => {
		$(`#input${x}`).show();
	})
}

function hide(id){
	id.forEach(x => {
		$(`#input${x}`).hide();
	})
}

function manipulateForm(e){
	let option = e.target.value;
	if(e.target.options.selectedIndex){
		switch(option){
			case 'confirm':
				show([1]);
				hide([2,3]);
				setPlaceHolder(1, "Enter tx index to confirm");
				break;
			case 'execute':
				show([1]);
				hide([2,3]);
				setPlaceHolder(1, "Enter tx index to execute tx");
				break;
			case 'revoke':
				show([1]);
				hide([2,3]);
				setPlaceHolder(1, "Enter tx index to revoke your confirmation");
				break;
			case 'submit':
				show([1,2,3]);
				setPlaceHolder(1, "Enter target address");
				setPlaceHolder(2, "Enter amount");
				setPlaceHolder(3, "Enter data in string, if any");
				break;
			case 'getOwners':
				hide([1,2,3]);
				break;
			case 'gettx':
				show([1]);
				hide([2,3]);
				setPlaceHolder(1, "Enter tx index");
				break;
			case 'gettxcount':
				hide([1,2,3]);
				break;
		}
	}
	else{
		hide([1,2,3]);
	}
}

function contractInit(){
    contract = new ethers.Contract(deployerContractAddress, deployerABI, provider.getSigner());
}

function initWalletContract(address){
	walletInstance = new ethers.Contract(address, walletABI, provider.getSigner());
	$('.loaded-wallet-addr').text(maskWallet(address));
	walletOpsModal.show();
	$('.wallet-ops').show();
}

function formatData(x){
    return Number(x);
}
function generateWalletTemplate(address){
	return `
		<div class="wallet-info-container justify-content-center align-items-center">
			<div class="wallet-info">${address}</div>
			<button class="btn btn-primary load-wallet mx-3" data-address="${address}">Load Wallet</button>
		</div>
	`;
}
async function getWallet(){
	try{
		let result = await contract.getWallet();
		if(!result || result.length == 0){
			throw !!0;
		}
		else{
			$('.no-wallet').hide();
			$('.has-wallet').show();
			$('.wallet-info-container').show();
			$('.wallet-ops').hide();
			$('.connected-wallet-list').html('');
			result.forEach(x => {
				let li = $('<li/>');
				li.addClass('mt-2');
				li.html(`
					<div class="d-flex justify-content-between">
						<div>${x}</div>
						<button type="button" class="btn btn-primary" onclick="initWalletContract('${x}')">Load Wallet</button>
					</div>
				`);
				$('.connected-wallet-list').append(li);
			});
		}
	}
	catch(e){
		$('.has-wallet').show();
	}
	finally{
		$('.loading-wallet').hide();
		$('.wallet-ops').hide();
		hideLoader();
	}
	
}

function walletCreationMethodSelect(index){
	//0->create, 1-> create2
	$('.wallet-creation-method-pref').val(index);
	if(index){
		$('.create2-asset').show();
	}
	else{
		$('.create2-asset').hide();
	}
}

function addAdditionalOwner(){
	ownerCount++;
	let input = $('<input>');
	input.addClass('owners mx-auto mt-2 form-control w-75 my-2').attr('placeholder','Enter Owner address');
	$('.owner-address-container').append(input);
}

function getOwnerAddresses(){
	let addr = [];
	Array.from(document.querySelectorAll('.owners')).forEach(x => {
		if(x.value && x.value != "")
			addr.push(x.value);
	})
	return addr;
}

async function createWallet(){
	showLoader();
	let numConf = +$('#numConfirm').val();
	let owners = getOwnerAddresses();
	let salt = $('#salt').val();
	let method = +$('.wallet-creation-method-pref').val();
	try{
		let tx;
		if(method){
			tx = await contract.deployMultiSigWithCreate2(owners, numConf, salt);	
		}
		else{
			tx = await contract.deployMultiSigWithCreate(owners, numConf);
		}
		let res = await tx.wait();
		if(res){
			setOPResult("Wallet created");
			walletCreateModal.hide();
		}
		await getWallet();
	}
	catch(e){
		console.log(e);
	}
	finally{
		hideLoader();
	}
}

function setResult(val){
	$('.wallet-ops-results-container').html(val);
}
function setOPResult(val){
	$('.wallet-creation-results-container').html(val);
}

async function predictWallet(){
	showLoader();
	let numConf = $('#numConfirm').val();
	let owners = getOwnerAddresses();
	let salt = $('#salt').val();
	try{
		let res = await contract.predictAddress(owners, numConf, salt);
		if(res){
			setOPResult("Wallet address will be " + res);
		}
	}
	catch(e){
		console.log(e);
	}
	finally{
		hideLoader();
	}
}

async function executeWalletTx(){
	showLoader();
	let el = document.getElementById('wallet-op');
	let option = el.value;
	let input1 = $('#input1').val(), input2 = $('#input2').val(), input3 = $('#input3').val();
	if(el.options.selectedIndex && walletInstance){
		let tx, res, wt;
		switch(option){
			case 'confirm':
				try{
					tx = await walletInstance.confirmTransaction(+input1);
					wt = await tx.wait();
					if(wt.transactionHash){
						setResult('Transaction confirmed');
					}
				}
				catch(e){
					setResult('Error occured while confirming transaction. Please try again');
				}
				finally{
					hideLoader();
				}
				break;
			case 'execute':
				try{
					tx = await walletInstance.executeTransaction(+input1);
					wt = await tx.wait();
					if(wt.transactionHash){
						setResult('Transaction executed successfully');
					}
				}
				catch(e){
					setResult('Error occured while executing transaction. Please try again');
				}
				finally{
					hideLoader();
				}
				break;
			case 'revoke':
				try{
					tx = await walletInstance.revokeConfirmation(+input1);
					wt = await tx.wait();
					if(wt.transactionHash){
						setResult('Confirmation revoked successfully');
					}
				}
				catch(e){
					setResult('Error occured while revoking confirmation. Please try again');
				}
				finally{
					hideLoader();
				}
				break;
			case 'submit':
				try{
					tx = await walletInstance.submitTransaction(input1, ethers.utils.parseEther(input2), toBytes(input3));
					wt = await tx.wait();
					if(wt.transactionHash){
						let count = await walletInstance.getTransactionCount();
						setResult(`Transaction submitted successfully with index <b>${count.toNumber() - 1}</b>`);
					}
				}
				catch(e){
					setResult('Error occured while submitting transaction. Please try again');
				}
				finally{
					hideLoader();
				}
				break;
			case 'getOwners':
				tx = await walletInstance.getOwners();
				res = '';
				tx.forEach(x => {
					res += '<b>' + x + '</b>,&ensp;';
				})
				setResult("Owner wallets are: " + res);
				hideLoader();
				break;
			case 'gettx':
				tx = await walletInstance.getTransaction(+input1);
				setResult(`
					<div class="d-block mx-auto">
						<div style="width: fit-content; text-align: left; margin: auto;">
							<div>To: <b>${tx.to}</b></div>
							<div>Amount: <b>${ethers.utils.formatEther(tx.value)} SHM</b></div>
							<div>Executed: <b>${tx.executed ? 'true' : 'false'}</b></div>
							<div>Data: <b>${fromBytes(tx.data)}</b></div>
							<div>Confirmations: <b>${tx.numConfirmations.toNumber()}</b></div>
						</div>
					</div>
				`)
				hideLoader();
				break;
			case 'gettxcount':
				tx = await walletInstance.getTransactionCount();
				setResult('Total Transactions: <b>' + tx.toNumber() + '</b>')
				hideLoader();
				break;
		}
	}
}
