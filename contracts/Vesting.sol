// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Vesting {

    // Struct to hold organization details
    struct Organization {
        address orgAddress;
        string tokenName;
        string tokenSymbol;
        uint256 tokenAmount;    
        uint256 totalSupply;
    }

    // Struct to hold stakeholder details
    struct Stakeholder {
        address userAddress;
        string role;
        uint256 vestingPeriod;
        uint256 startTime;
        uint256 tokenAmount;
        uint256 claimedToken;
    }

    // Maps stakeholder addresses to their details
    mapping(address => Stakeholder) public stakeholders;
    
    // Maps addresses that are whitelisted
    mapping(address => bool) public whitelistedAddresses;
    
    // Maps organization addresses to their details
    mapping(address => Organization) public organizations;

    // Event emitted when a new stakeholder is added
    event NewStakeholder(uint256 startTime, uint256 vestingPeriod);
    
    // Event emitted when an address is whitelisted
    event Whitelisted(uint256 time, address stakeholder);

    // Creates a new organization
    function createOrganization(
        address _orgAddress,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _tokenAmount
    ) external {
        organizations[_orgAddress] = Organization({
            orgAddress: _orgAddress,
            tokenName: _tokenName,
            tokenSymbol: _tokenSymbol,
            tokenAmount: _tokenAmount,
            totalSupply: 0
        });
    }

    // Adds a new stakeholder
    function newStakeholder(
        address _userAddress,
        string memory _role,
        uint256 _vestingPeriod,
        uint256 _tokenAmount
    ) external {
        // Ensure that the caller is an organization owner
        require(organizations[msg.sender].orgAddress == msg.sender, "Unauthorized");

        // Ensure that the organization has enough tokens to allocate
        require(
            organizations[msg.sender].tokenAmount >= _tokenAmount, 
            "Token amount exceeds organization balance"
        );

        // Create a new stakeholder with provided details
        stakeholders[_userAddress] = Stakeholder({
            userAddress: _userAddress,
            role: _role, 
            vestingPeriod: _vestingPeriod,
            startTime: block.timestamp,
            tokenAmount: _tokenAmount,
            claimedToken: 0
        });

        // Update the organization's token amount
        organizations[msg.sender].tokenAmount -= _tokenAmount;

        // Update the organization's total supply
        organizations[msg.sender].totalSupply += _tokenAmount;

        // Emit an event to indicate the addition of a new stakeholder
        emit NewStakeholder(block.timestamp, _vestingPeriod);
    }

    // Whitelists an address for claiming tokens
    function whitelistAddress(address _stakeholder) external {
        require(
            organizations[msg.sender].orgAddress == msg.sender, 
            "Only organization owner can whitelist"    
        );
        whitelistedAddresses[_stakeholder] = true;

        emit Whitelisted(block.timestamp, _stakeholder);
    }

    // Claims tokens for a whitelisted stakeholder
    function claimToken(uint256 _amount) external {
        // Check if the caller is whitelisted
        require(whitelistedAddresses[msg.sender], "You're not whitelisted");

        // Get the stakeholder's information from storage
        Stakeholder storage stakeholder = stakeholders[msg.sender];

        // Check if the caller is authorized 
        // (either the organization owner or the stakeholder)
        require(
            organizations[msg.sender].orgAddress == msg.sender || 
            stakeholder.userAddress == msg.sender,
            "Not authorized"
        );

        // Check if the vesting period has passed
        require(
            block.timestamp >= stakeholder.startTime + stakeholder.vestingPeriod,
            "Vesting period not over yet"
        );

        // Ensure there are claimable tokens
        require( stakeholder.tokenAmount > 0, "No claimable tokens");

        // Subtract the claimed tokens from the stakeholder's tokenAmount
        stakeholder.tokenAmount -= _amount;

        // Update the claimed token count for the stakeholder
        stakeholder.claimedToken += _amount;
    }
}
