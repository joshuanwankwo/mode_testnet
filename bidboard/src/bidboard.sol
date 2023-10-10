// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract BidBoard {
    string public message;
    address public currentAdvertiser;
    uint public currentAmount;
    address payable public owner;

    event MessageUpdated(
        string newMessage,
        address indexed newAdvertiser,
        uint newAmount
    );

    constructor() {
        owner = payable(msg.sender); // Set the contract deployer as the owner
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    function updateMessage(string calldata newMessage) external payable {
        require(
            msg.value > currentAmount,
            "Must send more Ether than the previous amount!"
        );

        message = newMessage;
        currentAdvertiser = msg.sender;
        currentAmount = msg.value;

        // Transfer the received Ether to the owner's address
        owner.transfer(msg.value);

        emit MessageUpdated(newMessage, msg.sender, msg.value);
    }

    function getCurrentAd() external view returns (string memory, address, uint) {
        return (message, currentAdvertiser, currentAmount);
    }

    function updateOwner(address payable newOwner) external onlyOwner {
        owner = newOwner;
    }
}
