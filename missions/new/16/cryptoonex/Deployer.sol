//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import './MultiSig.sol';

contract MultiSigWalletFactory{


    mapping(uint256 => address) multiSigWalletsCreatedTotal;
    mapping(address => mapping(uint256 => address)) multiSigWalletsCreatedByUser;
    mapping(address => uint256) userCounter;
    uint counter;
    
    function getWallet() external view returns (address[] memory){
        require(userCounter[msg.sender] > 0, "User not found");
        address[] memory wallets = new address[](userCounter[msg.sender]);
        for(uint i = 0; i < userCounter[msg.sender]; i++){
            wallets[i] = multiSigWalletsCreatedByUser[msg.sender][i];
        }
        return wallets;
    }

    function deployMultiSigWithCreate(address[] memory _owners, uint _numConfirmationsRequired) external returns (address){
        bytes memory bytecode = getBytecode(_owners, _numConfirmationsRequired);
        address wallet;

        assembly {
            wallet := create(0, add(bytecode, 0x20), mload(bytecode))
            if iszero(extcodesize(wallet)) { revert(0, 0) }
        }
        multiSigWalletsCreatedTotal[counter] = wallet;
        multiSigWalletsCreatedByUser[msg.sender][userCounter[msg.sender]] = wallet;
        counter++;
        userCounter[msg.sender]++;
        return wallet;
    }

    function predictAddress(address[] memory _owners, uint _numConfirmationsRequired, string memory _salt) external view returns(address){
        bytes memory bytecode = getBytecode(_owners, _numConfirmationsRequired);
        bytes32 salt = bytes32(bytes(_salt));
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
        );
        return address(uint160(uint(hash)));
    }

    function getBytecode(address[] memory _owners, uint _numConfirmationsRequired) private pure returns (bytes memory) {
        bytes memory bytecode = type(MultiSigWallet).creationCode;

        return abi.encodePacked(bytecode, abi.encode(_owners, _numConfirmationsRequired));
    }
    function deployMultiSigWithCreate2(address[] memory _owners, uint _numConfirmationsRequired, string memory _salt) external returns(address) {
        address addr;
        bytes memory bytecode = getBytecode(_owners, _numConfirmationsRequired);
        bytes32 salt = bytes32(bytes(_salt));
        assembly {
            addr := create2(0,add(bytecode, 0x20),mload(bytecode),salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        multiSigWalletsCreatedTotal[counter] = addr;
        multiSigWalletsCreatedByUser[msg.sender][userCounter[msg.sender]] = addr;
        counter++;
        userCounter[msg.sender]++;
        return addr;
    }
}
