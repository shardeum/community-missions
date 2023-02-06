from telegram.ext import (
    CommandHandler,
    Application,
    PicklePersistence,
    ContextTypes,
    Defaults,
)
from telegram import Update
from telegram.constants import ParseMode
from config import BOT_TOKEN, ADDRESS, PRIVATE_KEY
from web3 import HTTPProvider, Web3
from datetime import datetime, timedelta
import time
from web3.gas_strategies.rpc import rpc_gas_price_strategy
import random, string


def get_captch():
    captha = ""
    for _ in range(6):
        captha += random.choice(string.ascii_letters + string.digits)

    return captha


connection = Web3(HTTPProvider("https://liberty20.shardeum.org"))
connection.eth.set_gas_price_strategy(rpc_gas_price_strategy)


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        f"Hi,there.!\n\nMy Commands are\n\n`/help`\n`/facucet`\n`/balance`\n\n`/donate`\n\nTo Support faucet going and usable for everyone, please send the token to this address `{ADDRESS}`"
    )

    captcha = get_captch()

    ctx.user_data["captcha"] = captcha
    ctx.user_data["verified"] = False

    await update.message.reply_text(
        f"Please send the following text to me in this format `/captcha <text>`\n\n CAPTCHA: {captcha}"
    )


async def balance(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    balance = connection.eth.get_balance(ADDRESS)

    await update.message.reply_text(
        f"Tokens Available is **{Web3.fromWei(balance,'ether')}SHM**"
    )


async def donate(update: Update):
    await update.message.reply_text(
        f"Please dontate SHM tokens to this address {ADDRESS}"
    )


async def faucet(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user_address = ctx.user_data.get("address")
    prev_time = ctx.user_data.get("sent_time")

    verified = ctx.user_data.get("verified")

    if not verified:
        await update.message.reply_text(
            "Please verify the captha, use /captch to get the captcha again"
        )
        return

    if prev_time is not None:
        difference_time = datetime.fromtimestamp(int(prev_time)) + timedelta(hours=12)

        difference_time_timestamp = int(difference_time.timestamp())
        current_time = int(time.time())
        if difference_time_timestamp > current_time:
            await update.message.reply_text(
                "You already used once, come back after 12hrs.! Bye, Bye!"
            )
            return

    if user_address is None:
        await update.message.reply_text(
            "Please send Your Wallet to me using this `/wallet` <address>"
        )
        return

    balance = connection.eth.get_balance(ADDRESS)

    balance_number = 0
    try:
        balance_number = int(Web3.fromWei(balance, "ether"))
    except:
        await update.message.reply_text("No balance")
        return

    if balance_number <= 11:
        await update.message.reply_text("Faucet is empty!")
        return

    await ctx.bot.send_message(update.message.chat_id, "Sending Tokens to your address")

    transaction = connection.eth.account.sign_transaction(
        {
            "nonce": connection.eth.get_transaction_count(ADDRESS),
            "gasPrice": connection.eth.generate_gas_price(),
            "gas": 21000,
            "to": user_address,
            "value": Web3.toWei("11", "ether"),
        },
        PRIVATE_KEY,
    )

    tx_hash = connection.eth.send_raw_transaction(transaction.rawTransaction)

    ctx.user_data["sent_time"] = int(time.time())
    await update.message.reply_text(
        f"Sent 11 Tokens to the following address\n\n TX HASH is: {tx_hash.hex()}"
    )


async def wallet(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    address = ctx.args

    if len(address) < 1 or len(address) > 1:
        await update.message.reply_text("Not valid input, please check")
        return

    is_correct_address = Web3.isAddress(address[0])

    if not is_correct_address:
        await update.message.reply_text("Not a valid address")
        return

    await update.message.reply_text("Your wallet address is added/updated")

    ctx.user_data["address"] = address[0]


async def captcha(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    args = ctx.args

    captcha_word = ctx.user_data.get("captcha")

    if not captcha_word:
        captcha_word = get_captch()
        await update.message.reply_text(f"Your captcha word is {captcha_word}")
        ctx.user_data["captcha"] = captcha_word
        return

    if len(args) == 0:
        await update.message.reply_text(f"Your captcha word is {captcha_word}")
        return

    user_captch = args[0]

    if captcha_word.lower() == user_captch.lower():
        await update.message.reply_text("You're verified!")
        ctx.user_data["verified"] = True
        return

    await update.message.reply_text("Wrong captch, try again!")


if __name__ == "__main__":
    persistance = PicklePersistence("faucet_data")
    defaults = Defaults(parse_mode=ParseMode.MARKDOWN)
    app = (
        Application.builder()
        .token(BOT_TOKEN)
        .defaults(defaults)
        .persistence(persistance)
        .build()
    )

    app.add_handler(CommandHandler(["wallet"], wallet))
    app.add_handler(CommandHandler(["help", "start"], start))
    app.add_handler(CommandHandler(["balance"], balance))
    app.add_handler(CommandHandler("facucet", faucet))
    app.add_handler(CommandHandler(["captcha"], captcha))

    app.run_polling()
