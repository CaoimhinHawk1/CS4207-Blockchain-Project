const studentFeaturesAddress = "0xYourStudentFeaturesContractAddress";
const peerNetworkAddress = "0xYourPeerNetworkContractAddress";

const studentFeatures = []; // Add your ABI here
const peerNetwork = []; // Add your ABI here

let selectedRole = "student";
let web3;
let studentFeaturesContract;
let peerNetworkContract;

// Load the dashboard based on the role
function loadDashboard() {
    selectedRole = document.getElementById("role").value;
    const dashboard = document.getElementById("dashboard");

    if (selectedRole === "student") {
        dashboard.innerHTML = `
      <h2>Student Dashboard</h2>
      <button onclick="enrollInCourse()">Enroll in Course</button>
      <button onclick="viewResources()">View Resources</button>
    `;
    } else if (selectedRole === "mentor") {
        dashboard.innerHTML = `
      <h2>Mentor Dashboard</h2>
      <button onclick="uploadResource()">Upload Resource</button>
    `;
    } else if (selectedRole === "admin") {
        dashboard.innerHTML = `
      <h2>Admin Dashboard</h2>
      <button onclick="addCourse()">Add Course</button>
      <button onclick="assignRole()">Assign Role</button>
    `;
    }
}

// Initialize Web3 and connect to contracts
async function initializeWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await ethereum.request({ method: "eth_requestAccounts" });

        studentFeaturesContract = new web3.eth.Contract(studentFeatures, studentFeaturesAddress);
        peerNetworkContract = new web3.eth.Contract(peerNetwork, peerNetworkAddress);
    } else {
        alert("Please install MetaMask!");
    }
}

// Example: Enroll in a course
async function enrollInCourse() {
    const courseId = prompt("Enter Course ID to Enroll:");
    const accounts = await web3.eth.getAccounts();

    try {
        await studentFeaturesContract.methods.enrollInCourse(courseId).send({ from: accounts[0] });
        alert("Successfully enrolled in course!");
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

// Example: View Resources
async function viewResources() {
    try {
        const resources = await studentFeaturesContract.methods.getResources().call();
        alert(`Resources:\n${JSON.stringify(resources, null, 2)}`);
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

// Example: Upload Resource
async function uploadResource() {
    const title = prompt("Enter Resource Title:");
    const url = prompt("Enter Resource URL:");
    const accounts = await web3.eth.getAccounts();

    try {
        await studentFeaturesContract.methods.shareResource(title, url).send({ from: accounts[0] });
        alert("Resource uploaded successfully!");
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

// Initialize on page load
window.onload = initializeWeb3;