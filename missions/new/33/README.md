# Mission 32: Decentralized Prediction Market

<img src="images/download.png" alt="Prediction Market"/>

## Overview

Build a decentralized prediction market platform on Shardeum.

## Requirements

Design a prediction market system called DecentralizedPredict, which should:

- Be deployed on the Sphinx Dapp 1.X network.
- Include a contract PredictionMarketContract that:
Holds prediction event details such as event title, options, start time, and end time.
Contains a function to create a new prediction event (e.g., createPredictionEvent(string _eventTitle, string[] _options, uint256 _startTime, uint256 _endTime)).
- Has a function to place a bet on an event option (e.g., betOnEvent(uint256 _eventId, uint256 _optionId, uint256 _amount)).
- Enables closing of an event and settling bets based on the winning option.
- Ensures that only the contract owner can create and close events, while any address can place bets.
- Sets a prediction event duration, for instance, 7 days.

           
Create a basic frontend which:

- Be hosted on IPFS/Filecoin using Fleek for easy access.
- Allow the user to connect their Metamask wallet with a button.
- Enable the user to interact with all features mentioned above.
- Display all ongoing prediction events and their options, along with the total amount bet on each option.
- Allow users to create prediction events and place bets on ongoing events.


## Submission
- Only submission through the official [Submission form](https://forms.gle/mXN3a3EQHz52ShWS8) will be accepted.
- Live application link must also be shared in the [missions-discussion](https://discord.com/channels/933959587462254612/1039929816843038750) channel in Shardeum discord. 


## Resources

Shardeum Documentation

https://shardeum.com/docs/

IPFS/Filecoin Hosting on Fleek

https://docs.fleek.co/