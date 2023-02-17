
# Telegram API toekn
TOKEN = "6116138130:AAHSF7QgJaokS89r198QMnBph3W0Ig1sRh8"

# Log to file
LOG_TO_FILE = True                 # if True, LOG_FILE_PATH needed
LOG_FILE_PATH = "./log.txt"                  # Only neede if LOG_TO_FILE True

# Faucet related (hosted with Nest.js)
FAUCET_ADDRESS = "0xefFb6BF049DC7ca247395e7086c223D59F8cbFF3"
FAUCET_URL = 'http://74.208.94.242:3000/sendSHM'
FAUCET_COOLDOWN = 60#12*60*60          # in seconds (12 hrs)
EXPLORER_URL = 'https://explorer-sphinx.shardeum.org/'

# CAPTCHA related
CAPTCHA_TIMEOUT = 30                # in seconds
IMAGE_WIDTH = 380                   
IMAGE_HEIGHT = 180
IMAGE_BASE_PATH = '.'               # Base path for storing and accessing CAPTCHA images
CAPTCHA_LENGTH_OPTIONS = [5, 6, 7]  # Possible lengths for CAPTCHA

# Persistance of data
PERSISTANT_UPDATES_FREQUENCY = 3                        # in seconds
PERSISTANT_FILE_PATH = './telebotpickle'     # file storage location for persistant data

# Rate Limiter
MAX_RETRIES_ON_EXCEPTION = 3
RATE_LIMITING = 200                 # Number of requests per RATE_LIMITING_DURATION time
RATE_LIMITING_RETRY_DURATION = 1          # in seconds
