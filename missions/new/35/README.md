# Mission 35: Decentralized Ticketing App

<img src="images/tickets.jpeg" alt="Decentralized Ticketing App"/>

## Overview

Build a decentralized event ticketing application on Shardeum.

## Requirements

Design a decentralized ticketing system called "DecentralizedTickets", which should:

- Be deployed on the Sphinx Dapp 2.X network.
- Utilize ERC721 or any such NFT related non-fungible token standard.
- Include a contract EventTicketContract that: Holds ticket details such as ticket title, event details, ticket quantity, price, and date. Contains a function to create a new ticket (e.g., createTicket(string _ticketTitle, string _eventDetails, uint256 _ticketQuantity, uint256 _price, string _date)).
- Has a function to purchase a ticket (e.g., purchaseTicket(uint256 _ticketId)).
- Enable closure of a ticket sale once all tickets are sold out or the event date has been reached.
- Ensures that only the contract owner can create tickets, while any address can purchase a ticket.
- Allows for the ticket to be transferable between addresses.

Create a basic frontend which:

- Is hosted on IPFS/Filecoin using Fleek for easy access.
- Allows the user to connect their Metamask wallet with a button.
- Enables the user to interact with all features mentioned above.
- Displays all ongoing ticket sales and their details, along with the total quantity of each ticket left.
- Allows users to create new tickets and purchase available tickets.


## Submission
- Only submission through the official [Submission form](https://forms.gle/mXN3a3EQHz52ShWS8) will be accepted.
- Live application link must also be shared in the [missions-discussion](https://discord.com/channels/933959587462254612/1039929816843038750) channel in Shardeum discord. 


## Resources

Shardeum Documentation

https://shardeum.com/docs/

IPFS/Filecoin Hosting on Fleek

https://docs.fleek.co/
