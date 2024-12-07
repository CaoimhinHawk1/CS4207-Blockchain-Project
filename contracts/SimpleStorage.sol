// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PeerMentorshipNetwork {
    // Struct to represent a single contribution in the mentorship network
    struct Contribution {
        string content;       // The contribution's content (e.g., mentorship tip or interview question)
        address contributor;  // Address of the user who submitted the contribution
        uint256 createdAt;    // Timestamp when the contribution was created
    }

    // Mapping to store chains of contributions by topic and entry ID
    // Each topic maps to a specific entry ID, which in turn maps to an array of contributions
    mapping(string => mapping(uint256 => Contribution[])) private dataChains;

    // Array to store hashed versions of predefined valid topics
    bytes32[] public hashedTopics;

    // A threshold value for the computational mining challenge
    uint256 private challengeThreshold = 2000;

    // Events to notify when entries or contributions are created
    event EntryCreated(string topic, uint256 entryId, string content, address contributor);
    event ContributionAdded(string topic, uint256 entryId, string content, address contributor);

    // Constructor to initialize the predefined valid topics
    constructor() {
        // Pre-hashing topics for efficient validation later
        hashedTopics.push(keccak256(abi.encodePacked("Mentorship")));
        hashedTopics.push(keccak256(abi.encodePacked("InterviewPrep")));
        hashedTopics.push(keccak256(abi.encodePacked("CareerGuidance")));
    }

    // Modifier to verify that the provided topic is valid
    modifier verifyTopic(string memory topic) {
        bytes32 topicHash = keccak256(abi.encodePacked(topic)); // Hash the provided topic
        bool valid = false;

        // Check if the hashed topic exists in the hashedTopics array
        for (uint256 i = 0; i < hashedTopics.length; i++) {
            if (hashedTopics[i] == topicHash) {
                valid = true;
                break;
            }
        }
        require(valid, "Invalid topic"); // Revert if the topic is not valid
        _;
    }

    // Private function to validate a computational proof (mining challenge)
    function isValidProof(string memory input, uint256 nonce) private view returns (bool) {
        // Combine the input and nonce, then hash them
        bytes32 hashOutput = keccak256(abi.encodePacked(input, nonce));
        // Check if the hash output is below the challenge threshold
        return uint256(hashOutput) < challengeThreshold;
    }

    // Function to create a new entry with an initial contribution
    function createEntry(string memory topic, uint256 entryId, string memory content, uint256 nonce)
        public
        verifyTopic(topic) // Ensure the topic is valid
    {
        // Ensure the entry ID for the topic does not already exist
        require(dataChains[topic][entryId].length == 0, "Entry already exists");
        // Validate the mining challenge with the content and nonce
        require(isValidProof(content, nonce), "Proof validation failed");

        // Create the initial contribution
        Contribution memory initialContribution = Contribution({
            content: content,
            contributor: msg.sender, // Sender of the transaction
            createdAt: block.timestamp // Current block timestamp
        });

        // Store the contribution in the dataChains mapping
        dataChains[topic][entryId].push(initialContribution);

        // Emit an event to notify that a new entry was created
        emit EntryCreated(topic, entryId, content, msg.sender);
    }

    // Function to append a new contribution to an existing entry
    function appendContribution(string memory topic, uint256 entryId, string memory content, uint256 nonce)
        public
        verifyTopic(topic) // Ensure the topic is valid
    {
        // Ensure the entry ID for the topic exists
        require(dataChains[topic][entryId].length > 0, "Entry does not exist");
        // Validate the mining challenge with the content and nonce
        require(isValidProof(content, nonce), "Proof validation failed");

        // Create the new contribution
        Contribution memory newContribution = Contribution({
            content: content,
            contributor: msg.sender, // Sender of the transaction
            createdAt: block.timestamp // Current block timestamp
        });

        // Append the contribution to the chain in the dataChains mapping
        dataChains[topic][entryId].push(newContribution);

        // Emit an event to notify that a new contribution was added
        emit ContributionAdded(topic, entryId, content, msg.sender);
    }

    // Function to fetch the contributions for a specific entry
    function fetchContributions(string memory topic, uint256 entryId)
        public
        view
        verifyTopic(topic) // Ensure the topic is valid
        returns (
            string[] memory contents,     // Array of contribution contents
            address[] memory contributors, // Array of contributor addresses
            uint256[] memory timestamps    // Array of contribution timestamps
        )
    {
        // Get the number of contributions in the specified chain
        uint256 chainLength = dataChains[topic][entryId].length;

        // Create arrays to store the contributions' details
        string[] memory collectedContents = new string[](chainLength);
        address[] memory collectedContributors = new address[](chainLength);
        uint256[] memory collectedTimestamps = new uint256[](chainLength);

        // Loop through the chain and populate the arrays
        for (uint256 i = 0; i < chainLength; i++) {
            Contribution storage current = dataChains[topic][entryId][i];
            collectedContents[i] = current.content;
            collectedContributors[i] = current.contributor;
            collectedTimestamps[i] = current.createdAt;
        }

        // Return the arrays
        return (collectedContents, collectedContributors, collectedTimestamps);
    }

    // Function to get the current mining challenge threshold
    function getChallengeThreshold() public view returns (uint256) {
        return challengeThreshold; // Return the private threshold value
    }
}
