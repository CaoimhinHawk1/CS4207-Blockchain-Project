const PeerMentorshipNetwork = artifacts.require('PeerMentorshipNetwork');
const StudentFeatures = artifacts.require('StudentFeatures');

module.exports = function (deployer) {
    deployer.deploy(PeerMentorshipNetwork);
    
    deployer.deploy(StudentFeatures);
}