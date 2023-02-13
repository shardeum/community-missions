## Mission 10: Telegram Faucet Bot

## Installation

1. 
```
sudo apt update && sudo apt upgrade -y
```
2.
```
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash - && \
sudo apt-get install nodejs -y && \
echo -e "\nnodejs > $(node --version).\nnpm  >>> v$(npm --version).\n"
```
3.
```
cd
git clone https://github.com/tarabukinivan/shadeumtelegramfaucet
cd shadeumtelegramfaucet
npm i
```
4.
install mysql locally.<br>
create database 'sui_bot'<br>
create user 'sui_user' and give all privileges<br>
Set up connection in ./request/my_sql_connect.js<br>
add 'shardbot' table:
```
CREATE TABLE shardbot (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
userid VARCHAR(15) NOT NULL,
wallet VARCHAR(42) DEFAULT NULL,
timestamp VARCHAR(15) DEFAULT 0
);


```
5.
create env settings file and enter private key and telegram token
cp .env.sample .env
nano .env

#bot https://t.me/shardeumfaucet_bot
(only while issuance of 1 token is set)

![alt text](https://oshi.at/uUXF/bLJs.png)
![alt text](https://oshi.at/dpNY/ywcd.png)
![alt text](https://oshi.at/rYBc/tvBm.png)
