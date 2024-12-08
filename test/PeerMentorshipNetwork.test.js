let expect;
let contract;
let accounts;
const PeerMentorshipNetwork = artifacts.require("PeerMentorshipNetwork");

describe("PeerMentorshipNetwork", function (accounts) {
    this.timeout(0);

    before(async function () {
        const chai = await import("chai");
        expect = chai.expect;

        accounts = await web3.eth.getAccounts();
        console.log("Available Accounts:", accounts);

        // Initialize contract instance
        contract = await PeerMentorshipNetwork.deployed();
        console.log("Contract Address:", contract.address);
    });

    it("should create an entry", async function () {
        console.log("Starting test: should create an entry");
        const topic = "Mentorship";
        const entryId = 1;
        const content = "First contribution";
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const validNonce = await findValidNonce(content, challengeThreshold);
        console.log("Valid Nonce Found:", validNonce);

        await contract.createEntry(topic, entryId, content, validNonce, { from: accounts[0] });
        console.log("Entry created successfully");

        const [contents, contributors, timestamps] = await contract.fetchContributions(topic, entryId);
        console.log("Fetched Contributions:", contents);
        expect(contents[0]).to.equal(content);
    });

    it("should prevent duplicate entries", async function () {
        console.log("Starting test: should prevent duplicate entries");
        const topic = "Mentorship";
        const entryId = 1;
        const content = "Duplicate contribution";
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const validNonce = await findValidNonce(content, challengeThreshold);
        console.log("Valid Nonce Found:", validNonce);

        try {
            await contract.createEntry(topic, entryId, content, validNonce, { from: accounts[0] });
            throw new Error("Duplicate entry should have thrown an error");
        } catch (err) {
            console.log("Caught Error:", err.message);
            expect(err.message).to.include("Entry already exists");
        }
    });

    it("should append a contribution", async function () {
        console.log("Starting test: should append a contribution");
        const topic = "Mentorship";
        const entryId = 1;
        const content = "Second contribution";
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const validNonce = await findValidNonce(content, challengeThreshold);
        console.log("Valid Nonce Found:", validNonce);

        await contract.appendContribution(topic, entryId, content, validNonce, { from: accounts[0] });
        console.log("Contribution appended successfully");

        const [contents, contributors, timestamps] = await contract.fetchContributions(topic, entryId);
        console.log("Fetched Contributions:", contents);
        expect(contents.length).to.equal(2);
        expect(contents[1]).to.equal(content);
    });

    it("should reject invalid topic", async function () {
        console.log("Starting test: should reject invalid topic");
        const topic = "InvalidTopic";
        const entryId = 1;
        const content = "Invalid topic test";
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const validNonce = await findValidNonce(content, challengeThreshold);
        console.log("Valid Nonce Found:", validNonce);

        try {
            await contract.createEntry(topic, entryId, content, validNonce, { from: accounts[0] });
            throw new Error("Invalid topic should have thrown an error");
        } catch (err) {
            console.log("Caught Error:", err.message);
            expect(err.message).to.include("Invalid topic");
        }
    });

    it("should reject empty contribution content", async function () {
        console.log("Starting test: should reject empty contribution content");
        const topic = "Mentorship";
        const entryId = 1;
        const content = "";
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const validNonce = await findValidNonce(content, challengeThreshold);
        console.log("Valid Nonce Found:", validNonce);

        try {
            await contract.appendContribution(topic, entryId, content, validNonce, { from: accounts[0] });
            throw new Error("Empty contribution content should have thrown an error");
        } catch (err) {
            console.log("Caught Error:", err.message);
            expect(err.message).to.include("Invalid contribution content");
        }
    });

    it("should handle large contributions", async function () {
        console.log("Starting test: should handle large contributions");
        const topic = "Mentorship";
        const entryId = 2;
        const largeContent = "A".repeat(10000);
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const validNonce = await findValidNonce(largeContent, challengeThreshold);
        console.log("Valid Nonce Found:", validNonce);

        await contract.createEntry(topic, entryId, largeContent, validNonce, { from: accounts[0] });
        console.log("Large contribution created successfully");

        const [contents, contributors, timestamps] = await contract.fetchContributions(topic, entryId);
        console.log("Fetched Contributions:", contents);
        expect(contents[0]).to.equal(largeContent);
    });

    it("should handle 100 contributions", async function () {
        console.log("Starting test: should handle 100 contributions");
        const topic = "Mentorship";
        const entryId = 3;
        const initialContent = "Initial contribution";
        const challengeThreshold = await contract.getChallengeThreshold();
        console.log("Challenge Threshold:", challengeThreshold.toString());
        const initialNonce = await findValidNonce(initialContent, challengeThreshold);
        console.log("Valid Nonce Found for Initial Contribution:", initialNonce);

        await contract.createEntry(topic, entryId, initialContent, initialNonce, { from: accounts[0] });
        console.log("Initial contribution created successfully");

        for (let i = 1; i <= 100; i++) {
            const content = `Contribution ${i}`;
            const validNonce = await findValidNonce(content, challengeThreshold);
            console.log(`Valid Nonce Found for Contribution ${i}:`, validNonce);
            await contract.appendContribution(topic, entryId, content, validNonce, { from: accounts[0] });
        }

        console.log("All contributions appended successfully");
        const [contents, contributors, timestamps] = await contract.fetchContributions(topic, entryId);
        console.log("Fetched Contributions:", contents);
        expect(contents.length).to.equal(101);
    });
});

// Helper function to find a valid nonce
async function findValidNonce(input, challengeThreshold) {
    console.log("Finding valid nonce...");
    for (let nonce = 0; nonce < Number.MAX_SAFE_INTEGER; nonce++) {
        const hashOutput = web3.utils.soliditySha3(input, nonce);
        if (BigInt(hashOutput) < BigInt(challengeThreshold)) {
            console.log("Valid Nonce Found:", nonce);
            return nonce;
        }
    }
    throw new Error("Valid nonce not found");
}
