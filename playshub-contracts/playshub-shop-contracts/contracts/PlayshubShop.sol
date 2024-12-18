// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

enum Status {
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
        string buyerId
    );

    // TO-DO: Consider remove buyerId to save gas, using sender address instead
    function purchaseItem(uint256 id, string memory buyerId) external payable;

    function addItem(string memory name, uint256 price) external;

    function getItem(uint256 id) external view returns (Item memory);

    function totalItems() external view returns (uint256);
}

error InvalidItemId();
error InsufficientBalance();
error InvalidItemStatus();
error ItemLengthMisMatch();

contract PlayshubShop is
    IPlayshubShop,
    Initializable,
    UUPSUpgradeable,
    Ownable2StepUpgradeable,
    PausableUpgradeable
{
    string public constant VERSION = "0.9.0";

    event Withdrawn(address indexed sender, uint256 amount);

    /// @custom:storage-location erc7201:PlaysHub.storage.PlayshubShop
    struct PlayshubShopStorage {
        mapping(uint256 => Item) items;
        uint256 nextItemId;
    }

    // keccak256(abi.encode(uint256(keccak256("PlaysHub.storage.PlayshubShop")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant PlayshubShopStorageLocation =
        0xadb6f487badddc1ee7708c8641d75e23f4d61ac9e01c30b2e72a0531a5cac400;

    function _getPlayshubShopStorage()
        private
        pure
        returns (PlayshubShopStorage storage $)
    {
        assembly {
            $.slot := PlayshubShopStorageLocation
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner_,
        string[] memory itemNames_,
        uint256[] memory itemPrices_
    ) public initializer {
        __PlayshubShop_init_unchained(itemNames_, itemPrices_);
        __UUPSUpgradeable_init();
        __Ownable_init_unchained(owner_);
        __Pausable_init();
    }

    function __PlayshubShop_init_unchained(
        string[] memory itemNames_,
        uint256[] memory itemPrices_
    ) internal onlyInitializing {
        if (itemNames_.length != itemPrices_.length) {
            revert ItemLengthMisMatch();
        }

        for (uint256 i = 0; i < itemNames_.length; i++) {
            _addItem(itemNames_[i], itemPrices_[i]);
        }
    }

    function addItem(
        string memory name,
        uint256 price
    ) external override onlyOwner {
        _addItem(name, price);
    }

    function getItem(uint256 id) external view override returns (Item memory) {
        PlayshubShopStorage storage $ = _getPlayshubShopStorage();

        if (id >= $.nextItemId) {
            revert InvalidItemId();
        }

        return $.items[id];
    }

    function totalItems() external view override returns (uint256) {
        PlayshubShopStorage storage $ = _getPlayshubShopStorage();
        return $.nextItemId;
    }

    function purchaseItem(
        uint256 id,
        string memory buyerId
    ) external payable whenNotPaused {
        PlayshubShopStorage storage $ = _getPlayshubShopStorage();

        if (id >= $.nextItemId) {
            revert InvalidItemId();
        }

        if ($.items[id].status != Status.OnSell) {
            revert InvalidItemStatus();
        }

        Item memory item = $.items[id];
        if (msg.value != item.price) {
            revert InsufficientBalance();
        }

        emit ItemPurchased(_msgSender(), id, item.name, item.price, buyerId);
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

    function _addItem(string memory name, uint256 price) internal {
        PlayshubShopStorage storage $ = _getPlayshubShopStorage();

        $.items[$.nextItemId] = Item($.nextItemId, name, price, Status.OnSell);
        $.nextItemId++;

        emit ItemAdded(
            _msgSender(),
            $.nextItemId - 1,
            name,
            price,
            Status.OnSell
        );
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
