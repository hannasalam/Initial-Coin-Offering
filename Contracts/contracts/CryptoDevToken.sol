pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20,Ownable {
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokensPerNft = 10 * 10**18;
    ICryptoDevs CryptoDevNft;

    mapping(uint256=> bool) public tokenIdsClaimed;

    constructor(address _CryptoDevToken) ERC20("Crypto Dev Token","CD"){
        CryptoDevNft = ICryptoDevs(_CryptoDevToken);
    }

    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice*amount;
        require(msg.value>=_requiredAmount, "Ethers sent is incorrect");
        uint256 amountWithDecimals = amount*10**18;
        require(amountWithDecimals+totalSupply()<=maxTotalSupply,"Exceeds the max total supply available");
        _mint(msg.sender, amountWithDecimals);

    }

    function claim() public {
        address sender = msg.sender;
        uint256 balance = CryptoDevNft.balanceOf(sender);
        uint256 amount = 0;
        require(balance>0,"You don't own any Crypto Dev NFT's");
        for(uint256 i=0;i<balance;i++)
        {
            uint256 tokenId = CryptoDevNft.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId])
            {
                tokenIdsClaimed[tokenId] = true;
                amount+=1;
            }
        }
        require(amount>0,"You have already claimed");
        _mint(msg.sender, amount*tokensPerNft);
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, )= _owner.call{value:amount}("");
        require(sent,"Failed to send ether");
    }
    receive() external payable{}

    fallback() external payable{}

}