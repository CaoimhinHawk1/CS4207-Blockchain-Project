let expect;
let contract;
const PeerMentorshipNetwork = artifacts.require("PeerMentorshipNetwork");

describe("PeerMentorshipNetwork", function () {
    before(async function () {
        const chai = await import("chai");
        expect = chai.expect;

        // Initialize contract instance
        contract = await PeerMentorshipNetwork.deployed();
        console.log("Contract Address:", contract.address);
    });

    it("should create an entry", async function () {
        const topic = "Mentorship";
        const entryId = 1;
        const content = "First contribution";
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const validNonce = await findValidNonce(content, challengeThreshold);

        await contract.methods.createEntry(topic, entryId, content, validNonce).send({ from: accounts[0] });
        const contributions = await contract.methods.fetchContributions(topic, entryId).call();
        expect(contributions[0]).to.equal(content);
    });

    it("should prevent duplicate entries", async function () {
        const topic = "Mentorship";
        const entryId = 1;
        const content = "Duplicate contribution";
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const validNonce = await findValidNonce(content, challengeThreshold);

        try {
            await contract.methods.createEntry(topic, entryId, content, validNonce).send({ from: accounts[0] });
            throw new Error("Duplicate entry should have thrown an error");
        } catch (err) {
            expect(err.message).to.include("Entry already exists");
        }
    });

    it("should append a contribution", async function () {
        const topic = "Mentorship";
        const entryId = 1;
        const content = "Second contribution";
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const validNonce = await findValidNonce(content, challengeThreshold);

        await contract.methods.appendContribution(topic, entryId, content, validNonce).send({ from: accounts[0] });
        const contributions = await contract.methods.fetchContributions(topic, entryId).call();
        expect(contributions.length).to.equal(2);
        expect(contributions[1]).to.equal(content);
    });

    it("should reject invalid topic", async function () {
        const topic = "InvalidTopic";
        const entryId = 1;
        const content = "Invalid topic test";
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const validNonce = await findValidNonce(content, challengeThreshold);

        try {
            await contract.methods.createEntry(topic, entryId, content, validNonce).send({ from: accounts[0] });
            throw new Error("Invalid topic should have thrown an error");
        } catch (err) {
            expect(err.message).to.include("Invalid topic");
        }
    });

    it("should reject empty contribution content", async function () {
        const topic = "Mentorship";
        const entryId = 1;
        const content = "";
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const validNonce = await findValidNonce(content, challengeThreshold);

        try {
            await contract.methods.appendContribution(topic, entryId, content, validNonce).send({ from: accounts[0] });
            throw new Error("Empty contribution content should have thrown an error");
        } catch (err) {
            expect(err.message).to.include("Invalid contribution content");
        }
    });

    it("should handle large contributions", async function () {
        const topic = "Mentorship";
        const entryId = 2;
        const largeContent = "A".repeat(10000);
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const validNonce = await findValidNonce(largeContent, challengeThreshold);

        await contract.methods.createEntry(topic, entryId, largeContent, validNonce).send({ from: accounts[0] });
        const contributions = await contract.methods.fetchContributions(topic, entryId).call();
        expect(contributions[0]).to.equal(largeContent);
    });

    it("should handle 100 contributions", async function () {
        const topic = "Mentorship";
        const entryId = 3;
        const initialContent = "Initial contribution";
        const challengeThreshold = await contract.methods.getChallengeThreshold().call();
        const initialNonce = await findValidNonce(initialContent, challengeThreshold);

        await contract.methods.createEntry(topic, entryId, initialContent, initialNonce).send({ from: accounts[0] });

        for (let i = 1; i <= 100; i++) {
            const content = `Contribution ${i}`;
            const validNonce = await findValidNonce(content, challengeThreshold);
            await contract.methods.appendContribution(topic, entryId, content, validNonce).send({ from: accounts[0] });
        }

        const contributions = await contract.methods.fetchContributions(topic, entryId).call();
        expect(contributions.length).to.equal(101);
    });
});

// Helper function to find a valid nonce
async function findValidNonce(input, challengeThreshold) {
    for (let nonce = 0; nonce < Number.MAX_SAFE_INTEGER; nonce++) {
        const hashOutput = web3.utils.soliditySha3(input, nonce);
        if (BigInt(hashOutput) < BigInt(challengeThreshold)) {
            return nonce;
        }
    }
    throw new Error("Valid nonce not found");
}
