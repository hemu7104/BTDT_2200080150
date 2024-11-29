const SimpleVoting = artifacts.require("SimpleVoting");
const readline = require("readline"); // For interactive menu

module.exports = async function (callback) {
    try {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        let instance = await SimpleVoting.deployed();
        let accounts = await web3.eth.getAccounts();

        let owner = await instance.owner();
        console.log(`Owner address: ${owner}`);

        async function showMenu() {
            console.log("\nChoose an option:");
            console.log("1: Vote");
            console.log("2: Close Voting");
            console.log("3: See Results");
            console.log("4: Declare Winner");
            console.log("5: Exit");

            rl.question("Enter your choice: ", async (choice) => {
                try {
                    switch (choice) {
                        case "1":
                            await vote();
                            break;
                        case "2":
                            await closeVoting();
                            break;
                        case "3":
                            await seeResults();
                            break;
                        case "4":
                            await declareWinner();
                            break;
                        case "5":
                            rl.close();
                            callback();
                            return;
                        default:
                            console.log("Invalid choice, try again!");
                    }
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
                showMenu();
            });
        }

        async function vote() {
            console.log("\nCandidates:");
            for (let i = 0; i < 3; i++) {
                let candidate = await instance.candidates(i);
                console.log(`${i}: ${candidate.name}`);
            }

            rl.question("Enter candidate index to vote for: ", async (index) => {
                if (isNaN(index) || index < 0 || index >= 3) {
                    console.log("Invalid candidate index.");
                } else {
                    rl.question("Enter your account index to vote from (0-9): ", async (accIndex) => {
                        if (isNaN(accIndex) || accIndex < 0 || accIndex >= accounts.length) {
                            console.log("Invalid account index.");
                        } else {
                            try {
                                await instance.vote(index, { from: accounts[accIndex] });
                                console.log("Vote cast successfully!");
                            } catch (err) {
                                console.error("Error casting vote:", err.reason || err.message);
                            }
                        }
                        console.log("");
                        showMenu();
                    });
                }
            });
        }

        async function closeVoting() {
            try {
                await instance.closeVoting({ from: owner });
                console.log("Voting has been closed.");
            } catch (err) {
                console.error("Error closing voting:", err.reason || err.message);
            }
        }

        async function seeResults() {
            console.log("\nResults:");
            for (let i = 0; i < 3; i++) {
                let candidate = await instance.candidates(i);
                console.log(`${candidate.name}: ${candidate.voteCount} votes`);
            }
        }

        async function declareWinner() {
            try {
                let winner = await instance.getWinner();
                let winnerName = winner[0];
                let winnerVotes = winner[1];

                // Check for ties
                let maxVotes = parseInt(winnerVotes);
                let tieCount = 0;
                for (let i = 0; i < 3; i++) {
                    let candidate = await instance.candidates(i);
                    if (parseInt(candidate.voteCount) === maxVotes) {
                        tieCount++;
                    }
                }

                if (tieCount > 1) {
                    console.log("It's a tie! Go for a Super Over!");
                } else {
                    console.log(`Winner is ${winnerName} with ${winnerVotes} votes.`);
                }
            } catch (err) {
                console.error("Error declaring winner:", err.reason || err.message);
            }
        }

        showMenu(); // Display the menu
    } catch (err) {
        console.error("Error interacting with contract:", err);
        callback(err);
    }
};
