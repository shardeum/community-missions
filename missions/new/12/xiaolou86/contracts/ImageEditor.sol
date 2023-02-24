// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ImageEditor{

    struct userImageData {
        uint inited;
        uint rightTurns;
        uint leftTurns;
        uint verticalFlips;
        uint horizontalFlips;
        uint[3][3] currentImage;
    }

    mapping(address => userImageData) private imageDatas;

    constructor(){}

    /**
     *  init userImageData if it's uninitialized.
     */
    function ensureInited() internal {
        if (imageDatas[msg.sender].inited == 0) {
            imageDatas[msg.sender].inited = 1;
            uint val=1;
            for (uint i; i<3; ++i) {
                for (uint j; j<3; ++j) {
                    imageDatas[msg.sender].currentImage[i][j] = val;
                    ++val;
                }
            }
        }
    }

    function getImageData() external returns (userImageData memory){
        ensureInited();
        return imageDatas[msg.sender];
    }

    function turnRight() external {
        ensureInited();
        uint[3][3] memory oldImage = imageDatas[msg.sender].currentImage;
        for (uint i; i<3; ++i) {
            for (uint j; j<3; ++j) {
                imageDatas[msg.sender].currentImage[i][j] = oldImage[2-j][i];
            }
        }
        imageDatas[msg.sender].rightTurns++;
    }
    function turnLeft() external {
        ensureInited();
        uint[3][3] memory oldImage = imageDatas[msg.sender].currentImage;
        for (uint i; i<3; ++i) {
            for (uint j; j<3; ++j) {
                imageDatas[msg.sender].currentImage[i][j] = oldImage[j][2-i];
            }
        }

        imageDatas[msg.sender].leftTurns++;
    }
    function flipVertically() external {
        ensureInited();
        uint temp;
        for (uint j; j<3; ++j) {
            temp = imageDatas[msg.sender].currentImage[0][j];
            imageDatas[msg.sender].currentImage[0][j] = imageDatas[msg.sender].currentImage[2][j];
            imageDatas[msg.sender].currentImage[2][j] = temp;
        }
        imageDatas[msg.sender].verticalFlips++;
    }

    function flipHorizontally() external {
        ensureInited();
        uint temp;
        for (uint i; i<3; ++i) {
            temp = imageDatas[msg.sender].currentImage[i][0];
            imageDatas[msg.sender].currentImage[i][0] = imageDatas[msg.sender].currentImage[i][2];
            imageDatas[msg.sender].currentImage[i][2] = temp;
        }
        imageDatas[msg.sender].horizontalFlips++;
    }
}
