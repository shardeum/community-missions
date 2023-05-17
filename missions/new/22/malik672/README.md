# Mission 22
Uniswapv3 Implementation
<br>


### Live Link : https://royal-band-1198.on.fleek.co

<br>Npm install to install dependencies<br>

### + Create And Initialize a pool
To swap, add liquidity or probably decrease the liquidty the first thing to do is to Create and initialize a pool,to create a pool you need to specify two tokens, a fee(i made this 100 by default, no need to specify), a price
<br>
Possible Error: Inablity to estimate gas, to solve this just swap token0 and token1 why this happens i have no idea
<br>
Video: https://youtu.be/OYy5aGcTbAo
<br>

### + Mint Position
Now when we've had our pool address, the next thing is to mint a position using our Pool address so we will be able to increase and decrease liquidity, to do this specify our pool address from earlier, token0,token1(this should be arranged in the same way you created the pool) and specify amount for both token0 and token2
<br>
Video: https://youtu.be/SyCr8fgKH0E
<br>

### + Add Liquidity
To add liquity specify the tokenId you got from minting the position, and the amount you want add to the liquidity pool
<br>
Video: https://youtu.be/ynkHilMOVBY
<br>

### + Decrease Liquidity
To decrease liquity specify the tokenId you got from minting the position, and the amount you want remove to the liquidity pool, for my part all i did was halve the liquidty pool
<br>
Video: https://youtu.be/TLBekl3zwMg
<br>

### + Swap Token
Now that we've successfully added and remove liquidty,the next thing to do is try to swap, to do this pass the specified pool address,token1 address and the amount you want to swap for, and token2 address
<br>
Video: https://youtu.be/e2x0mokvOME
<br>

To Deploy Uniswap Contracts on any network
read the article
https://bobanetwork.medium.com/deploying-uniswap-v3-a-developers-guide-to-navigating-the-complexities-269dde21bff6