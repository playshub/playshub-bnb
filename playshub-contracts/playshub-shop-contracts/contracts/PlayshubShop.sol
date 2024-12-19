// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

enum Status {
    NoneExist,
    OnSell
}

struct Item {
    uint256 id;
    string name; // TO-DO: Consider remove this field to save gas, shoud use web2 storage instead
    uint256 price;
    Status status;
}

interface IPlayshubShop {
    event ItemAdded(
        address indexed sender,
        uint256 indexed id,
        string name,
        uint256 price,
        Status status
    );

    event ItemPurchased(
        address indexed sender,
        uint256 indexed id,
        string name,
        uint256 price,
        string userId
    );

    function purchaseItem(uint256 id, string memory userId) external payable;

    function addItem(uint256 id, string memory name, uint256 price) external;

    function getItem(uint256 id) external view returns (Item memory);
}

error InvalidItemId();
error InsufficientBalance();
error InvalidItemStatus();
error ItemLengthMisMatch();
error ItemAlreadyExist();
error ItemNotExist();

contract PlayshubShop is IPlayshubShop, Ownable2Step, Pausable {
    string public constant VERSION = "0.9.0";

    event Withdrawn(address indexed sender, uint256 amount);

    mapping(uint256 => Item) private items;

    modifier onlyIfItemExist(uint256 id) {
        if (items[id].status == Status.NoneExist) {
            revert ItemNotExist();
        }
        _;
    }

    modifier onlyIfItemNoneExist(uint256 id) {
        if (items[id].status != Status.NoneExist) {
            revert ItemAlreadyExist();
        }
        _;
    }

    constructor(
        address owner_,
        uint256[] memory itemIds_,
        string[] memory itemNames_,
        uint256[] memory itemPrices_
    ) Pausable() Ownable(owner_) {
        if (itemIds_.length != itemNames_.length) {
            revert ItemLengthMisMatch();
        }
        if (itemIds_.length != itemPrices_.length) {
            revert ItemLengthMisMatch();
        }

        for (uint256 i = 0; i < itemNames_.length; i++) {
            _addItem(itemIds_[i], itemNames_[i], itemPrices_[i]);
        }
    }

    function addItem(
        uint256 id,
        string memory name,
        uint256 price
    ) external override onlyOwner onlyIfItemNoneExist(id) {
        _addItem(id, name, price);
    }

    function getItem(uint256 id) external view override returns (Item memory) {
        return items[id];
    }

    function purchaseItem(
        uint256 id,
        string memory userId
    ) external payable whenNotPaused onlyIfItemExist(id) {
        if (items[id].status != Status.OnSell) {
            revert InvalidItemStatus();
        }

        Item memory item = items[id];
        if (msg.value != item.price) {
            revert InsufficientBalance();
        }

        emit ItemPurchased(_msgSender(), id, item.name, item.price, userId);
    }

    function withdraw(uint256 amount) external onlyOwner {
        if (amount > address(this).balance) {
            revert InsufficientBalance();
        }

        payable(owner()).transfer(amount);
        emit Withdrawn(_msgSender(), amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _addItem(uint256 id, string memory name, uint256 price) internal {
        items[id] = Item(id, name, price, Status.OnSell);

        emit ItemAdded(_msgSender(), id, name, price, Status.OnSell);
    }
}
