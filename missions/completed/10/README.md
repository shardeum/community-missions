Submission 1:([bytes1](https://github.com/bytes1))<br>
[Demo](https://youtu.be/kL-rpp-25Vg) <br>
[Website](https://t.me/shardeumpandabot)  

Submission 2:([sagarvd01](https://github.com/sagarvd01))
Bot: [@ShardeumSphinxBot](http://t.me/ShardeumSphinxBot)  
Video: [YouTube](https://youtu.be/_GxSSH9_h7c)  

## Mission 10: Telegram Faucet Bot

<img src="images/telegram.png" alt="telegram"/>

Image credit: https://commons.wikimedia.org/wiki/File:Telegram_logo.svg

## Overview

Create a community Telegram faucet bot that is secure.

## Requirements

The Telegram Bot:

    -sends 11 SHM tokens per request to users on Betanet
    -shows its wallet address in a clear way so people can donate to the faucet
    -to help prevent spam:
        -has a 12 hour cooldown for the same wallet
        -throttles requests if there are more than 200 requests per second 
        -checks that the Telegram account only has one wallet address
        -has a captcha

## Resources

Faucet request example with NestJS:

https://github.com/m-r-g-t/shardeum-faucet
