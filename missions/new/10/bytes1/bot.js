require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

const Web3 = require("web3");
const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({ maxConcurrent: 200, minTime: 1000 });
const cooldowns = new Map();
const USER_WALLET_ADDRESSES = new Map();
// Connect to the GORLi network
const cooldownTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const requestThreshold = 200;
const requestInterval = 1000; // 1 second
const requestCounter = {};
const privKey = process.env.privatekey;
const options2 = {
  transactionConfirmationBlocks: 1,
};
const addressFrom = "0xF5512D24d4ee192838B9918EC9d60979abF323cb";
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://sphinx.shardeum.org/"),
  null,
  options2
);
// Generate a random math problem
function generateMathProblem() {
  const firstNumber = Math.floor(Math.random() * 10);
  const secondNumber = Math.floor(Math.random() * 10);
  const operator = Math.random() < 0.5 ? "+" : "-";
  const correctAnswer =
    operator === "+" ? firstNumber + secondNumber : firstNumber - secondNumber;

  // Generate the options for the problem
  const options = [correctAnswer];
  while (options.length < 4) {
    const option = Math.floor(Math.random() * 20) - 10;
    if (!options.includes(option)) {
      options.push(option);
    }
  }

  // Shuffle the options
  options.sort(() => Math.random() - 0.5);

  return {
    problem: `${firstNumber} ${operator} ${secondNumber} = ?`,
    options,
    correctAnswer,
  };
}
const options = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "SHM FAUCET",
          callback_data: "option:faucet",
        },
        {
          text: "RPC INFO",
          callback_data: "option:rpc",
        },
      ],
      [
        {
          text: "Address",
          callback_data: "option:address",
        },
        {
          // text: "CHANGE LANGUAGE",
          // callback_data: "option:language",
          text: "DONATE",
          callback_data: "option:donate",
        },
      ],
      // [
      //   {
      //     text: "DONATE",
      //     callback_data: "option:donate",
      //   },
      // ],
    ],
  },
};
const languages = ["English", "Spanish", "German"];

const languageKeyboard = languages.map((lang) => [
  { text: lang, callback_data: `language:${lang}` },
]);

bot.onText(/\/start/, (msg) => {
  console.log(msg);

  bot.sendMessage(msg.chat.id, "Here are your options:", options);
});

bot.on("callback_query", (callbackQuery) => {
  const [action, value] = callbackQuery.data.split(":");
  if (action === "language") {
    // Store the user's language preference in a database or in memory
    bot.answerCallbackQuery(callbackQuery.id, `Language changed to ${value}`);
  } else if (action == "option") {
    if (value === "faucet") {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "CLAIM SHM",
                callback_data: "faucet:claim",
              },
            ],
            [
              {
                text: "BALANCE",
                callback_data: "faucet:balance",
              },
            ],
          ],
        },
      };

      bot.sendMessage(callbackQuery.from.id, "Here are your options:", options);
    } else if (value === "donate") {
      bot.sendMessage(
        callbackQuery.from.id,
        "Please donate tokens to this address: \n `0xF5512D24d4ee192838B9918EC9d60979abF323cb`",
        {
          parse_mode: "Markdown",
        }
      );
    } else if (value === "rpc") {
      bot.sendMessage(
        callbackQuery.from.id,
        "*Sphinx 1.X* \n Network Name: `Shardeum Sphinx 1.X` \n New RPC URL: `https://sphinx.shardeum.org/` \n Chain ID: `8082` \n Currency symbol: `SHM` \n Block Explorer URL:`https://explorer-sphinx.shardeum.org/`\n\n *Liberty 2.X* \n Network Name: `Shardeum Liberty 2.X` \n New RPC URL: `https://liberty20.shardeum.org/` \n Chain ID: `8081` \n Currency symbol: `SHM` \n Block Explorer URL:`https://explorer-liberty20.shardeum.org/`\n",
        {
          parse_mode: "Markdown",
        }
      );
    } else if (value === "address") {
      bot.sendMessage(
        callbackQuery.from.id,
        "WSHM: \n `0xb6204c4b6b2545cF23F5EC0Bf8AEB8cB56E13C15`",
        {
          parse_mode: "Markdown",
        }
      );
    } else if (value === "menu") {
      bot.sendMessage(callbackQuery.from.id, "Here are your options:", options);
    }
  } else if (action === "faucet") {
    if (value === "claim") {
      generate_cap(callbackQuery);
    } else {
      async function main() {
        const balance = await getBalance(addressFrom);
        bot.sendMessage(callbackQuery.from.id, `Faucet balance: ${balance}`);
      }

      main();
    }
  } else if (action === "answer") {
    if (value === "true") {
      limiter
        .schedule(() => {
          bot.answerCallbackQuery(callbackQuery.id, `correct captcha`);
          bot
            .deleteMessage(
              callbackQuery.message.chat.id,
              callbackQuery.message.message_id
            )
            .catch(() => {});
          send_check(callbackQuery);
        })
        .catch((err) => {
          bot.sendMessage(
            msg.chat.id,
            "Error: rate limit exceeded. Please try again later."
          );
        });
    } else if (value === "false") {
      bot.answerCallbackQuery(callbackQuery.id, `wrong captcha`);
      generate_cap(callbackQuery);
    } else {
      bot.sendMessage(callbackQuery.from.id, "Here are your options:", options);
    }
  }
});

function generate_cap(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  const problem = generateMathProblem();
  const options = problem.options
    .map((option, index) => `${index + 1}. ${option}`)
    .join("\n");

  bot.answerCallbackQuery(callbackQuery.id);

  bot.editMessageText(`${problem.problem}\n\n${options}`, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "1",
            callback_data: `answer:${
              problem.correctAnswer === problem.options[0]
            }`,
          },
          {
            text: "2",
            callback_data: `answer:${
              problem.correctAnswer === problem.options[1]
            }`,
          },
        ],
        [
          {
            text: "3",
            callback_data: `answer:${
              problem.correctAnswer === problem.options[2]
            }`,
          },
          {
            text: "4",
            callback_data: `answer:${
              problem.correctAnswer === problem.options[3]
            }`,
          },
        ],
        [
          {
            text: "exit",
            callback_data: `answer:exit`,
          },
        ],
      ],
    },
  });
}

function send_check(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  bot.sendMessage(chatId, "Please enter your wallet address").then(() => {
    bot.once("message", async (msg) => {
      if (web3.utils.isAddress(msg.text)) {
        if ((await getBalance(addressFrom)) > 12) {
          const currentTime = new Date().getTime();
          if (
            USER_WALLET_ADDRESSES.has(chatId) &&
            USER_WALLET_ADDRESSES.get(chatId) !== msg.text
          ) {
            bot.sendSticker(
              chatId,
              "CAACAgIAAxkBAAEHu49j6pWeFZEnlriExofrm8x1892kfAACDAADJHFiGsekexRHa4hiLgQ"
            );
            bot.sendMessage(
              chatId,
              "You already have a wallet address. You can only have one wallet address per Telegram account."
            );
            return bot.sendMessage(chatId, {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "MAIN MENU",
                      callback_data: "option:menu",
                    },
                  ],
                ],
              },
            });
          }
          USER_WALLET_ADDRESSES.set(chatId, msg.text);
          if (
            requestCounter[chatId] &&
            requestCounter[chatId] + cooldownTime > currentTime
          ) {
            bot.sendSticker(
              chatId,
              "CAACAgIAAxkBAAEHu3lj6pMax0S9WGqX4hPt3Ron_edIgQACFgADJHFiGlTIjEwwJXJeLgQ"
            );
            return bot.sendMessage(
              chatId,
              "Zzzzz... I'm catching some Z's right now, so let's not disturb the slumber party happening in my bed. Kthxbye! \n\nYou can only request once every 12 hours. Please try again later."
            );
          }
          requestCounter[chatId] = currentTime;
          const deploy = async () => {
            const createTransaction = await web3.eth.accounts.signTransaction(
              {
                from: addressFrom,
                to: msg.text,
                value: web3.utils.toWei("11", "ether"),
                gas: "21000",
              },
              privKey
            );

            // Deploy transaction
            bot.sendSticker(
              chatId,
              "CAACAgIAAxkBAAEHu3Vj6pJji59szuOPjddJBM_0BxLKLwACEAADJHFiGpr6FCbQRHAxLgQ"
            );
            bot.sendMessage(
              chatId,
              "Transaction intialized. should reflect in in your wallet shortly"
            );
            const createReceipt = await web3.eth.sendSignedTransaction(
              createTransaction.rawTransaction
            );
            bot.sendMessage(
              chatId,
              `Transaction successful with hash: [${createReceipt.transactionHash}](https://explorer-sphinx.shardeum.org/transaction/${createReceipt.transactionHash})`,
              {
                parse_mode: "Markdown",
              }
            );
          };
          try {
            deploy();
          } catch (err) {
            console.log(err);
          }
        } else {
          bot.sendSticker(
            chatId,
            "CAACAgIAAxkBAAEHqnVj5dqG7hz69nFtYAhvy-k17qgTDAACDAADJHFiGsekexRHa4hiLgQ"
          );
          return bot.sendMessage(chatId, "No balance in faucet");
        }
      } else {
        bot.sendMessage(chatId, "Enter a valid address");
        bot.sendMessage(chatId, "Here are your options:", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "MAIN MENU",
                  callback_data: "option:menu",
                },
              ],
            ],
          },
        });
      }
    });
  });
}

async function getBalance(address) {
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, "ether");
}
