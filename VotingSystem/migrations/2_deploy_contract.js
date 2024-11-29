const SimpleVoting = artifacts.require("SimpleVoting");

module.exports = function (deployer) {
    const candidateNames = ["Aarif", "Visanth", "Hemanth"]; // Example candidates
    deployer.deploy(SimpleVoting, candidateNames);
};
