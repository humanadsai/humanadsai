// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MockHUSD
 * @notice ERC20 + Permit mock for testing HumanAdsEscrow.
 *         Anyone can mint. 6 decimals like real hUSD.
 */
contract MockHUSD is ERC20, ERC20Permit {
    constructor() ERC20("Mock hUSD", "hUSD") ERC20Permit("Mock hUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Anyone can mint (test only)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
