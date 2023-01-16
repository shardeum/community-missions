import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PixelArtColorNFT is ERC721 {
    uint256 private s_tokenCounter;
    mapping(uint256 => bytes32) private images;
    bytes32 private image;

    constructor() ERC721("Nocolor", "Nocolor") {
        s_tokenCounter = 0;
    }

    function mint(string memory _image) public {
        _safeMint(msg.sender, s_tokenCounter);
        image = bytes32(abi.encodePacked(_image, "string"));
        images[s_tokenCounter] = image;
        s_tokenCounter = s_tokenCounter + 1;
    }
}
