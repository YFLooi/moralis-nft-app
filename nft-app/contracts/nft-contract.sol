pragma solidity ^0.8.0;

// Imports from openzeppelin's repo
// Works only if deployed on Remix: http://remix.ethereum.org
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract NftContract is ERC1155, Ownable {
    
    // list of items, defined as constant integers
    // with id = 0
    uint256 public constant ARTWORK = 0;
    uint256 public constant PHOTO = 1;

    // ref to openzeppelin, the ERC1155 constructor requires uri_ as an argument
    // uri_ is a https link to the nft's metadata. The link below refers to the 
    // nft deployed to the moralis server of {id}
    constructor() ERC1155("https://gppanowoee5f.usemoralis.com/public/metadata/{id}.json"){
        // _mint creates the nft. The call here in constructor
        // will call mint once
        // Same as at openzeppelin, hence same arguments: account, id, amount, data
        // msg.sender = account of person triggering this contract
        // for now, represent "data" as empty string
        _mint(msg.sender, ARTWORK, 1, "");
        _mint(msg.sender, PHOTO, 1, "");
    }

    // can call to mint more nfts
    // it basically calls _mint in the ERC1155 contract, but now
    // it can be done on request
    // onlyOwner is a modifier in Ownable.sol. Modifiers in solidity run before code execution
    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        // Use ownable to restrict call to mint() to just the nft's issuer/contract owner
        // Otherwise, anyone can do it
        _mint(account, id, amount, "");
    }

    function burn(
        address account,
        uint256 id,
        uint256 amount
    )public {
        // Chk if call to burn() is from token owner
        require(msg.sender == account);
        _burn(account, id, amount);
    }
}