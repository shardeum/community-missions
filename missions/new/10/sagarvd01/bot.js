const TelegramBot = require('node-telegram-bot-api');
const ethers = require('ethers');
const bot = new TelegramBot(process.env.token);

const DB = require('./db');
const database = new DB();
const RPC_DATA = {
    url: "https://sphinx.shardeum.org/", //"https://liberty20.shardeum.org/"
    chainID: 8082, //8081
    name: "Shardeum Sphinx 1.X" //"Shardeum Liberty 2.X"
};
const provider = new ethers.JsonRpcProvider(RPC_DATA.url);
const wallet = new ethers.Wallet(process.env.pKey, provider);
const mainMenu = {
    reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [["Get SHM", "Donate"],["Help", "Profile"]]
    }
};
const EMOJIS = [
    {
        "item": "Rocket", //from https://unicode-table.com/en/1F697/
        "emoji": "🚀"
    },
    {
        "item": "Helicopter",
        "emoji": "🚁"
    },
    {
        "item": "Train",
        "emoji": "🚆"
    },
    {
        "item": "Car",
        "emoji": "🚗"
    }
]


bot.setMyCommands([
    {
        command: 'wallet',
        description: 'Set Wallet'
    },
    {
        command: 'profile',
        description: 'View your Profile'
    },
    {
        command: 'donate',
        description: 'Donate to keep the faucet up and running.'
    },
    {
        command: 'claim',
        description: 'Claim SHM from the faucet'
    },
    {
        command: 'start',
        description: 'Go To main menu'
    },
    {
        command: 'help',
        description: 'View help message'
    }
])

bot.onText(/^\/start$/, function (msg) {
    bot.sendMessage(msg.chat.id, "ShardeumSphinxBot is a faucet for Shardeum Betanet (Sphinx). You can get 2 SHM every 12 hours from this bot.\n\n*How to use*\n\n1. Set wallet using /wallet command.\n2.Click on Get SHM.\n3. Complete Captcha.\n\n*Donate*\n\nTo keep the bot up and running, please consider donating Sphinx SHM. Use /donate command to see how you can help this bot.",{
        parse_mode: 'markdown',
        ...mainMenu
    });
});

bot.onText(/^Main\sMenu$/, function(msg){
    bot.sendMessage(msg.chat.id, "Please select an option below", mainMenu);
})

bot.onText(/^(Help|\/help)$/, function(msg){
    bot.sendMessage(msg.chat.id, "Welcome to Shardeum Faucet Bot.\n\nTo use the faucet, Please set a wallet first using the command _/wallet <your erc20 address>_.\n\nAfter that, tap on *Get SHM* to get SHM tokens on Shardeum Betanet (Sphinx).\n\nTo view your details, tap on Profile.", {
        parse_mode: 'markdown',
        ...mainMenu
    });
})

bot.onText(/^(Donate|\/donate)$/, function(msg){
    provider.getBalance(wallet.address).then(
        (balance) => {
            let currentBalance = 0;
            if(balance > 0){
                currentBalance = parseInt(balance) / 10 ** 18;
            }
            bot.sendMessage(msg.chat.id, `Current balance in faucet: ${currentBalance} SHM.\n\nPlease donate SHM (Shardeum Betanet Sphinx) to the below address\n\n${wallet.address}`, mainMenu);
        }
    ).catch(
        (e) => {
            bot.sendMessage(msg.chat.id, "Please donate SHM (Shardeum Betanet Sphinx) to the below address\n\n" + wallet.address, mainMenu);
        }
    )
});

bot.onText(/^(Profile|\/profile)$/, function(msg){
    database.getUserDetails(msg.chat.id).then(
        (data) => {
            if(!data){
                bot.sendMessage(msg.chat.id, "*Your Details*\n\nAddress: _Not Set_\n\nPlease set an address using */wallet <your-address>* command.", {
                    parse_mode: 'markdown',
                    ...mainMenu
                });
            }
            else{
                let message = `*Your Details*\n\nAddress: _${data.wallet}_\n\n`;
                if(data.lastClaim){
                    let lastClaim = new Date(data.lastClaim).toLocaleString('nu', {dateStyle: 'medium', timeStyle: 'medium'});
                    message += `Last claimed on: _${lastClaim}_ UTC`;
                    if(data.lastTx && data.lastTx != ''){
                        message +=` ([tx](https://explorer-sphinx.shardeum.org/transaction/${data.lastTx})).`;
                    }
                }
                bot.sendMessage(msg.chat.id, message, {
                    parse_mode: 'markdown',
                    ...mainMenu
                });
            }
        }
    ).catch(
        (e) => {
            bot.sendMessage(msg.chat.id, "Unable to fetch profile details. Please try again",{
                reply_markup: {
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    keyboard: [["Main Menu"]]
                }
            });
        }
    )
})

bot.onText(/^\/wallet/, async function(msg){
    const addr = msg.text.replace(/^\/wallet\s?/, "");
    if(!ethers.isAddress(addr)){
        bot.sendMessage(msg.chat.id, "Please send a valid ERC20 address in the format */wallet <your-address>*", {
            parse_mode: 'markdown',
            ...mainMenu
        })
    }
    else{
        database.checkIfUserOrWalletExist(msg.chat.id, addr).then(
            (data) => {
                if(!data){
                    database.addUser(msg.chat.id, addr).then(
                        (result) => {
                            bot.sendMessage(msg.chat.id, "Wallet set succesfully.", {
                                reply_markup: {
                                    resize_keyboard: true,
                                    one_time_keyboard: true,
                                    keyboard: [["Main Menu"]]
                                }
                            })
                        }
                    ).catch(
                        (e) => {
                            bot.sendMessage(msg.chat.id, "Error occured while adding wallet. Please try again.", {
                                reply_markup: {
                                    resize_keyboard: true,
                                    one_time_keyboard: true,
                                    keyboard: [["Main Menu"]]
                                }
                            })
                        }
                    )
                }
                else{
                    bot.sendMessage(msg.chat.id, "User or wallet already exist in our system.", {
                        reply_markup: {
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            keyboard: [["Main Menu"]]
                        }
                    });
                }
            }
        ).catch(
            (e) => {
                bot.sendMessage(msg.chat.id, "Error occured while adding wallet. Please try again.", {
                    reply_markup: {
                        resize_keyboard: true,
                        one_time_keyboard: true,
                        keyboard: [["Main Menu"]]
                    }
                })
            }
        )
    }

})

bot.onText(/^(Get\sSHM|\/claim)$/, function(msg){
    database.getUserDetails(msg.chat.id).then(
        (data) => {
            if(!data){
                bot.sendMessage(msg.chat.id, "Please set an address first using _/wallet <your-address>_ command.", {
                    parse_mode: 'markdown',
                    ...mainMenu
                });
            }
            else{
                if(data.lastClaim > 0 && new Date().getTime() < data.lastClaim + 43200000){
                    let nextClaim = new Date(data.lastClaim + 43200000).toLocaleString('nu', {dateStyle: 'medium', timeStyle: 'medium'});
                    bot.sendMessage(msg.chat.id, `Please wait till ${nextClaim} to claim again.`, {
                        reply_markup: {
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            keyboard: [["Main Menu"]]
                        }
                    });
                }
                else{
                    provider.getBalance(wallet.address).then(
                        (balance) => {
                            if(balance < (3 * 10 ** 18)){
                                bot.sendMessage(msg.chat.id, "Not enough funds in the faucet. Please try after some time.");
                            }
                            else{
                                let captchaIndex = Math.floor((Math.random()*10)) % 4;
                                let captcha = EMOJIS[captchaIndex].item;
                                let inlineKeyboard = [];
                                EMOJIS.forEach(x => {
                                    inlineKeyboard.push({
                                        text: x.emoji,
                                        callback_data: x.item
                                    });
                                });
                            
                                bot.sendMessage(msg.chat.id, `Verify the captcha. Tap on ^*${captcha}*^ from the below emojis`, {
                                    parse_mode: "markdown",
                                    reply_markup: {
                                        inline_keyboard: [inlineKeyboard]
                                    }
                                })
                            }
                        }).catch(
                            (e) => {
                                bot.sendMessage(msg.chat.id, "Error occured while claiming SHM. Please try again.", {
                                    reply_markup: {
                                        resize_keyboard: true,
                                        one_time_keyboard: true,
                                        keyboard: [["Main Menu"]]
                                    }
                                })
                            }
                        )
                }
            }
        }).catch(
            (e) => {
                bot.sendMessage(msg.chat.id, "Error occured while claiming SHM. Please try again.", {
                    reply_markup: {
                        resize_keyboard: true,
                        one_time_keyboard: true,
                        keyboard: [["Main Menu"]]
                    }
                })
            }
        )
})


bot.on('callback_query', function onCallbackQuery(callbackQuery) { 
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    let captchaProvided = callbackQuery.message.text.match(/\^[A-z]+\^/)[0];
    captchaProvided = captchaProvided.substring(1, captchaProvided.length - 1);
    if(captchaProvided == action){
        const opts = { 
                chat_id: msg.chat.id, 
                message_id: msg.message_id,
            };
        bot.editMessageText("Captcha Verified", opts);
        database.getUserDetails(msg.chat.id).then(
            (data) => {
                if(data.lastClaim > 0 && new Date().getTime() < data.lastClaim + 43200000){
                    let nextClaim = new Date(data.lastClaim + 43200000).toLocaleString('nu', {dateStyle: 'medium', timeStyle: 'medium'});
                    bot.sendMessage(msg.chat.id, `Please wait till ${nextClaim} to claim again.`, {
                        reply_markup: {
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            keyboard: [["Main Menu"]]
                        }
                    });
                }
                else{
                    provider.getBalance(wallet.address).then(
                        (balance) => {
                            if(balance < (3 * 10 ** 18)){
                                bot.sendMessage(msg.chat.id, "Not enough funds in the faucet. Please try after some time.");
                            }
                            else{
                                database.setClaimTime(msg.chat.id, new Date().getTime()).then(
                                    (result) => {
                                        if(result){
                                            let amountInEther = '2'
                                            let txDetails = {
                                                to: data.wallet,
                                                value: ethers.parseEther(amountInEther)
                                            }
                                            wallet.sendTransaction(txDetails).then((tx) => {
                                                database.setLastClaimTx(tx.hash, msg.chat.id).then(
                                                    () => {
                                                        bot.sendMessage(msg.chat.id, `Funds has been transferred \n\nhash: [${tx.hash}](https://explorer-sphinx.shardeum.org/transaction/${tx.hash})`, {
                                                            parse_mode: 'markdown',
                                                            reply_markup: {
                                                                resize_keyboard: true,
                                                                one_time_keyboard: true,
                                                                keyboard: [["Main Menu"]]
                                                            }
                                                        });
                                                    }
                                                ).catch(
                                                    () => {
                                                        bot.sendMessage(msg.chat.id, `Funds has been transferred \n\nhash: [${tx.hash}](https://explorer-sphinx.shardeum.org/transaction/${tx.hash})`, {
                                                            parse_mode: 'markdown',
                                                            reply_markup: {
                                                                resize_keyboard: true,
                                                                one_time_keyboard: true,
                                                                keyboard: [["Main Menu"]]
                                                            }
                                                        });
                                                    }
                                                )
                                                
                                            }).catch(
                                                (e) => {
                                                    console.log(e);
                                                    database.setClaimTime(userId, data.lastClaim).then(
                                                        () => {
                                                            bot.sendMessage(msg.chat.id, "Error occured while sending Transaction. Please try again.", {
                                                                reply_markup: {
                                                                    resize_keyboard: true,
                                                                    one_time_keyboard: true,
                                                                    keyboard: [["Main Menu"]]
                                                                }
                                                            })
                                                        }
                                                    ).catch(
                                                        () => {
                                                            bot.sendMessage(msg.chat.id, "Error occured while sending Transaction. Please try again.", {
                                                                reply_markup: {
                                                                    resize_keyboard: true,
                                                                    one_time_keyboard: true,
                                                                    keyboard: [["Main Menu"]]
                                                                }
                                                            })
                                                        }
                                                    )
                                                }
                                            )
                                        }
                                        else{
                                            bot.sendMessage(msg.chat.id, "Error connecting database. Please try again.", {
                                                reply_markup: {
                                                    resize_keyboard: true,
                                                    one_time_keyboard: true,
                                                    keyboard: [["Main Menu"]]
                                                }
                                            })
                                        }
                                    }
                                ).catch(
                                    (e) => {
                                        bot.sendMessage(msg.chat.id, "Error occured while connecting to database. Please try again.", {
                                            reply_markup: {
                                                resize_keyboard: true,
                                                one_time_keyboard: true,
                                                keyboard: [["Main Menu"]]
                                            }
                                        })
                                    }
                                )
                            }
                        }).catch(
                            (e) =>{
                                bot.sendMessage(msg.chat.id, "Error occured while claiming SHM. Please try again.", {
                                    reply_markup: {
                                        resize_keyboard: true,
                                        one_time_keyboard: true,
                                        keyboard: [["Main Menu"]]
                                    }
                                })
                            }
                        )
                }
            }).catch(
                (e) => {
                    bot.sendMessage(msg.chat.id, "Error occured while claiming SHM. Please try again.", {
                        reply_markup: {
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            keyboard: [["Main Menu"]]
                        }
                    })
                }
            )
    }
    else{
        const opts = { 
            chat_id: msg.chat.id, 
            message_id: msg.message_id, 
        };
        bot.editMessageText("Captcha failed. Please try again.", opts);
    }
}); 

module.exports = bot;