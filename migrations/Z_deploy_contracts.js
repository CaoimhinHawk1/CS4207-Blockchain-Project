const SimpleStorage = artifacts.require('SimpleStorage');
const StudentFeatures = artifacts.require('StudentFeatures')


module.exports = function (deployer) {
    deployer.deploy(SimpleStorage, 'Hello, Blockchain!');

    deployer.deploy(StudentFeatures)
}