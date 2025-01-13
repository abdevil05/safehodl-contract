// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MockContract {
    uint256 public value;
    
    function setValue(uint256 _value) external {
        value = _value;
    }
    
    receive() external payable {}
}