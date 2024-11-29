// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    struct Candidate {
        string name;        // Candidate's name
        uint256 voteCount;  // Number of votes
    }

    address public owner;             // Owner of the voting system
    mapping(address => bool) public voters; // Tracks who has voted
    Candidate[] public candidates;    // List of candidates
    bool public votingOpen;           // Flag to check if voting is open

    // Event triggered when a vote is cast
    event VoteCasted(address indexed voter, uint256 indexed candidateIndex);

    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(string[] memory candidateNames) {
        owner = msg.sender;
        votingOpen = true;

        // Initialize candidates
        for (uint256 i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    // Function to cast a vote
    function vote(uint256 candidateIndex) public {
        require(votingOpen, "Voting is closed");
        require(!voters[msg.sender], "You have already voted");
        require(candidateIndex < candidates.length, "Invalid candidate index");

        voters[msg.sender] = true; // Mark the sender as voted
        candidates[candidateIndex].voteCount++; // Increment vote count

        emit VoteCasted(msg.sender, candidateIndex); // Emit an event
    }

    // Function to close voting
    function closeVoting() public onlyOwner {
        votingOpen = false;
    }

    // Function to get the winner (can only be called after voting is closed)
    function getWinner() public view returns (string memory winnerName, uint256 winnerVoteCount) {
        require(!votingOpen, "Voting is still open");

        uint256 maxVotes = 0;
        uint256 winnerIndex = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        winnerName = candidates[winnerIndex].name;
        winnerVoteCount = candidates[winnerIndex].voteCount;
    }
}
