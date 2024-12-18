// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error MismatchedArrayLengths();
error TokenIsSupported();
error TokenIsUnsupported();
error InsufficientBalance();

contract CheckIn is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    address public constant NATIVE_TOKEN = address(0);

    struct CheckInRecord {
        uint256 latestTimestamp;
        uint256 count;
    }

    struct CheckInToken {
        bool isSupported;
        uint256 value;
    }

    event CheckedIn(
        address indexed sender,
        address indexed token,
        uint256 timestamp,
        uint256 count,
        string userId
    );
    event TokenSupportAdded(address indexed token, uint256 value);
    event TokenSupportRemoved(address indexed token);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);

    mapping(address => CheckInRecord) private _checkInRecords;
    mapping(address => CheckInToken) private _checkInTokens;

    constructor(
        address owner_,
        address[] memory _initialTokens,
        uint256[] memory _initialValues
    ) Ownable(owner_) Pausable() {
        if (_initialTokens.length != _initialValues.length) {
            revert MismatchedArrayLengths();
        }

        for (uint256 i = 0; i < _initialTokens.length; i++) {
            _addSupportedToken(_initialTokens[i], _initialValues[i]);
        }
    }

    function checkIn(
        address token,
        string memory userId
    ) external whenNotPaused {
        if (!_checkInTokens[token].isSupported) {
            revert TokenIsUnsupported();
        }

        IERC20(token).safeTransferFrom(
            _msgSender(),
            address(this),
            _checkInTokens[token].value
        );

        uint256 latestTimestamp = block.timestamp;
        uint256 count = _checkInRecords[_msgSender()].count + 1;

        _checkInRecords[_msgSender()] = CheckInRecord(latestTimestamp, count);

        emit CheckedIn(_msgSender(), token, latestTimestamp, count, userId);
    }

    function checkIn(string memory userId) external payable whenNotPaused {
        CheckInToken memory native = _checkInTokens[NATIVE_TOKEN];

        if (!native.isSupported) {
            revert TokenIsUnsupported();
        }
        if (msg.value != native.value) {
            revert InsufficientBalance();
        }

        uint256 latestTimestamp = block.timestamp;
        uint256 count = _checkInRecords[_msgSender()].count + 1;

        _checkInRecords[_msgSender()] = CheckInRecord(latestTimestamp, count);

        emit CheckedIn(
            _msgSender(),
            NATIVE_TOKEN,
            latestTimestamp,
            count,
            userId
        );
    }

    function addSupportedToken(
        address token,
        uint256 value
    ) external onlyOwner {
        _addSupportedToken(token, value);
    }

    function removeSupportToken(address token) external onlyOwner {
        _removeSupportToken(token);
    }

    function checkInTokenOf(
        address token
    ) public view returns (CheckInToken memory) {
        return _checkInTokens[token];
    }

    function checkInRecordOf(
        address account
    ) public view returns (CheckInRecord memory) {
        return _checkInRecords[account];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw(
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (amount > address(this).balance) {
            revert InsufficientBalance();
        }

        Address.sendValue(payable(to), amount);
        emit Withdrawn(NATIVE_TOKEN, to, amount);
    }

    function withdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (amount > IERC20(token).balanceOf(address(this))) {
            revert InsufficientBalance();
        }

        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }

    function _addSupportedToken(address token, uint256 value) internal {
        if (_checkInTokens[token].isSupported) {
            revert TokenIsSupported();
        }
        _checkInTokens[token] = CheckInToken(true, value);
        emit TokenSupportAdded(token, value);
    }

    function _removeSupportToken(address token) internal {
        if (!_checkInTokens[token].isSupported) {
            revert TokenIsUnsupported();
        }

        delete _checkInTokens[token];
        emit TokenSupportRemoved(token);
    }
}
