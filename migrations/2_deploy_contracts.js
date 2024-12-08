const PeerMentorshipNetwork = artifacts.require('PeerMentorshipNetwork');

module.exports = function (deployer) {
    deployer.deploy(PeerMentorshipNetwork);
}