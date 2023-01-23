// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PixelArtNoColorNFT is ERC721, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("PixelArtNoColorNFT", "PixelArtNoColorNFT") {}

    function mint(address _to, string memory _base64) public returns (uint256) {
        uint256 newTokenId = _tokenIds.current();
        _mint(_to, newTokenId);
        _setTokenURI(newTokenId, getTokenURI(_base64));

        _tokenIds.increment();
        return newTokenId;
    }

    function generateImage(bytes memory _base64)
        internal
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(_base64)
                )
            );
    }

    function getTokenURI(string memory _base64)
        internal
        pure
        returns (string memory)
    {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "PixelArtNoColorNFT",',
            '"description": "PixelArtNoColorNFT With only one base color as white",',
            '"image": "',
            generateImage(string_to_bytes(_base64)),
            '"',
            "}"
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    function string_to_bytes(string memory s)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory b3 = bytes(s);
        return b3;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
