# Mission 34: NFT Lending and Borrowing Platform

<img src="images/download.jpeg" alt="NFT lending"/>

## Overview

Build an NFT lending-borrowing platform on Shardeum.

## Requirements

Design a prediction market system called DecentralizedPredict, which should:

- Be deployed on the Sphinx Dapp 2.X network.
- Include a contract NFTLoanContract that: Holds NFT loan details such as loan title, NFT details, loan duration, interest rate, and collateral requirements. Contains a function to create a new NFT loan (e.g., createNFTLoan(string _loanTitle, string _NFTDetails, uint256 _loanDuration, uint256 _interestRate, string _collateralRequirements)).
- Has a function to request a loan on an NFT (e.g., requestLoan(uint256 _NFTId, uint256 _loanAmount)).
- Enable closure of a loan and repayment of funds based on the agreed terms.
- Ensures that only the contract owner can create loans, while any address can request a loan.
- Sets a loan duration (in days), for instance, 30 days.
           
Create a basic frontend which:

- Be hosted on IPFS/Filecoin using Fleek for easy access.
- Allow the user to connect their Metamask wallet with a button.
- Enable the user to interact with all features mentioned above.
- Display all ongoing NFT loans and their details, along with the total loan amount for each NFT.
- Allow users to create NFT loans and request loans on available NFTs.
Submission


## Submission
- Only submission through the official [Submission form](https://forms.gle/mXN3a3EQHz52ShWS8) will be accepted.
- Live application link must also be shared in the [missions-discussion](https://discord.com/channels/933959587462254612/1039929816843038750) channel in Shardeum discord. 


## Resources

Shardeum Documentation

https://shardeum.com/docs/

IPFS/Filecoin Hosting on Fleek

https://docs.fleek.co/