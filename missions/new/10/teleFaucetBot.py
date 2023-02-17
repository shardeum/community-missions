#!/usr/bin/env python3

import logging
import string
import random
import requests
import os

from ratelimit import limits, RateLimitException
from backoff import on_exception, expo
from datetime import datetime, timedelta
from telegram.constants import ParseMode

# Custom Config
from teleFaucetBotConfig import *
from captcha.image import ImageCaptcha

from telegram import __version__ as TG_VER
try:
    from telegram import __version_info__
except ImportError:
    __version_info__ = (0, 0, 0, 0, 0)  # type: ignore[assignment]

if __version_info__ < (20, 0, 0, "alpha", 1):
    raise RuntimeError(
        f"This example is not compatible with your current PTB version {TG_VER}. To view the "
        f"{TG_VER} version of this example, "
        f"visit https://docs.python-telegram-bot.org/en/v{TG_VER}/examples.html"
    )

from telegram import Update
from telegram.ext import (
    Application, 
    CommandHandler, 
    ContextTypes, 
    MessageHandler, 
    filters, 
    ConversationHandler, 
    AIORateLimiter, 
    PicklePersistence
)

CAPTCHA = 0                         # state code for ConversationHandler

# Enable logging
if LOG_TO_FILE:
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO, filename=LOG_FILE_PATH
    )
else:
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
    )
logger = logging.getLogger(__name__)


# Command Handler /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    msg = f"""
    Hi {user.first_name},
    
    This is the Shardeum faucet bot
    
    __*Commands:*__
    /start \- Starts the Bot
    /help \- Open command guidance
    /faucet \- SHM Faucet request
    /wallet \- View your SHM wallet address
    /setwallet \<address\> \- Add your SHM wallet address

    __*Workflow:*__
    1\. Start the bot
    2\. Add wallet address
    3\. Send the faucet command
    4\. Solve the CAPTCHA
    5\. Get funded\!

    __*Note:*__
    The wallet has a cooldown period of 12 hours
    
    _Feel free to donate extra test SHM at *{FAUCET_ADDRESS}*_"""
    context.user_data['img_path'] = IMAGE_BASE_PATH + '/' + str(update.effective_user.id) + '.png'
    #captcha_gen()
    logger.info(f'User {user}, id: {update.effective_user.id} started')
    await update.message.reply_html(
        rf"Hi {user.mention_html()}!",
    )
    await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)


# Command Handler /help
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    msg = """This is the Shardeum faucet bot
    
    __*Commands:*__
    /start \- Starts the Bot
    /help \- Open command guidance
    /faucet \- SHM Faucet request
    /wallet \- View your SHM wallet address
    /setwallet \<address\> \- Add your SHM wallet address"""
    await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)


# Command Handler /faucet
async def faucet(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Execute when the command /faucet is issued."""
    d = datetime.now()
    if context.user_data.get('unlock_time') and context.user_data.get('unlock_time') > d:
        msg = "_You will have to wait for a cooldown of 12 hours before making consecutive faucet requests_"
        await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)
        return ConversationHandler.END
    try:
        if not context.user_data.get('img_path'):
            context.user_data['img_path'] = IMAGE_BASE_PATH + '/' + str(update.effective_user.id) + '.png'
        captcha_gen(update, context)
        img_path = context.user_data.get('img_path')
        img_caption = "Solve this captcha, type your answer\nUse Command \'/cancel\' to exit the CAPTCHA"
        await update.get_bot().send_photo(update.effective_chat.id , img_path, caption=img_caption)
        os.remove(img_path)
        return CAPTCHA
    except:
        logger.error(f"User id: {update.effective_user.id}. Error occured during CAPTCHA creation or display")
        return ConversationHandler.END


# Function call for executing SHM transfer
# Rate limiting applied
@on_exception(expo, RateLimitException, max_tries = MAX_RETRIES_ON_EXCEPTION)
@limits(calls = RATE_LIMITING, period = RATE_LIMITING_RETRY_DURATION)
async def send_money(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    d = datetime.now() + timedelta(seconds=FAUCET_COOLDOWN)
    # if not my_dict.get(update.effective_user.id):
    #     my_dict[update.effective_user.id] = {'unlock_time': "", 'wallet': ""}
    payload = {'address':context.user_data['wallet']}
    s = requests.post(FAUCET_URL, params = payload)
    logger.info(f"User id: {update.effective_user.id}. " + s.json().get('message'))
    if not s.json().get('success'):
        await update.message.reply_text("Error During sending SHM!\n" + s.json().get('message'))
        raise Exception(s.json().get('message'))
    explorer_url = EXPLORER_URL + 'transaction/' + s.json().get('message')
    await update.message.reply_text(f"Sent SHM\!\nTx Hash: [View Transaction]({explorer_url})\n\n_Feel free to donate extra test SHM at *{FAUCET_ADDRESS}*_", ParseMode.MARKDOWN_V2)
    context.user_data['unlock_time'] = d


# Command Handler /setwallet
async def set_wallet(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if len(context.args) == 0:
        await update.message.reply_text("Please add wallet address after the command.\nUsage: /setwallet <address>")
        return
    # if not my_dict.get(update.effective_user.id):
    #     my_dict[update.effective_user.id] = {}
    logger.info(f"User {update.effective_user.id} added wallet {str(context.args[0])}")
    if not context.user_data.get('wallet'):
        context.user_data['wallet'] = str(context.args[0])
        await update.message.reply_text("Wallet " + str(context.args[0]) + " added succesfully!")
        return
    # my_dict[update.effective_user.id]['wallet'] = str(context.args[0])
    context.user_data['wallet'] = str(context.args[0])
    await update.message.reply_text("Wallet " + str(context.args[0]) + " updated succesfully!")
    

# Command Handler /wallet
async def wallet(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get('wallet'):
        msg = "_No wallet address associated with your account_\.\nYou can add using '/setwallet'"
        await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)
        return
    await update.message.reply_text("Wallet address: " + context.user_data.get('wallet'))


# Sanity check
async def invalid_req(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.warning(f"Invalid Input or CAPTCHA Verification Cancelled by User (id: {update.effective_user.id})")
    msg = "Invalid Input or CAPTCHA Verification Cancelled by User\. Please try command \'/faucet\' again\."
    await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)
    return ConversationHandler.END


# CAPTCHA generation and image storage
def captcha_gen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Generates Image CAPTCHA for the user, stores it in a .png file"""
    image = ImageCaptcha(IMAGE_WIDTH, IMAGE_HEIGHT)
    captcha_len = random.choice(CAPTCHA_LENGTH_OPTIONS)
    captcha_text = ''.join(random.choices(string.ascii_uppercase.replace('O','') + string.digits.replace('0',''), k=captcha_len))
    data = image.generate(captcha_text)
    
    img_path = context.user_data.get('img_path')
    image.write(captcha_text, img_path)
    logger.info(f"CAPTCHA generated to path - {img_path}")
    context.user_data['current_captcha'] = captcha_text
    context.user_data['captcha_timeout'] = datetime.now() + timedelta(seconds=CAPTCHA_TIMEOUT)
    return captcha_text


# CAPTCHA check
async def captcha_check(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Checks if the user inputs the correct CAPTCHA"""
    try:
        if context.user_data['captcha_timeout'] < datetime.now():
            logger.warning(f"User id: {update.effective_user.id}. CAPTCHA TimedOut")
            msg = "CAPTCHA Timed out\! \nPlease try command \'/faucet\' again\."
            await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)
            return ConversationHandler.END
        if update.message.text == context.user_data.get('current_captcha'):
            logger.info(f"User id: {update.effective_user.id}. Solved CAPTCHA correctly")
            await update.message.reply_text("Your transaction is being processed...")
            await send_money(update, context)
        else:
            logger.warning(f"User id: {update.effective_user.id}. CAPTCHA incorrect")
            msg = "*Invalid CAPTCHA\!* Please try command \'/faucet\' again\."
            await update.message.reply_text(msg, ParseMode.MARKDOWN_V2)
    except RuntimeError:
        logger.error(f"User id: {update.effective_user.id}. Some error during Sending SHM")
        msg = "ERROR!\nUnable to complete the transaction. Please check if wallet is added successfully by typing /wallet"
        await update.message.reply_text(msg)
        raise Exception("Some error during Sending SHM")
    finally:
        return ConversationHandler.END


# Start the bot and initializing
def main():
    """Start the bot."""
    # Create the Application and pass it your bot's token.
    telegram_bot_rate_limiter = AIORateLimiter(RATE_LIMITING)
    
    persistence = PicklePersistence(filepath=PERSISTANT_FILE_PATH, update_interval=PERSISTANT_UPDATES_FREQUENCY, single_file=False)
    application = Application.builder().token(TOKEN).rate_limiter(telegram_bot_rate_limiter).persistence(persistence).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("setwallet", set_wallet))
    application.add_handler(CommandHandler("wallet", wallet))
    
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("faucet", faucet)],
        states={
            CAPTCHA: [MessageHandler(filters.TEXT & ~filters.COMMAND, captcha_check)]
        },
        fallbacks=[CommandHandler("cancel", invalid_req)],
        persistent=True,
        name='convo'
    )

    application.add_handler(conv_handler)

    # Run the bot until the user presses Ctrl-C
    application.run_polling()


if __name__ == "__main__":
    main()
