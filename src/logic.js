

const studentFeaturesAddress = "0xYourStudentFeaturesContractAddress";
const peerNetworkAddress = "0xYourPeerNetworkContractAddress";

const students = [];
const mentors = [];

const studentFeatures = []; // Add your ABI here
const peerNetwork = []; // Add your ABI here

let selectedRole = "student";
let web3;
let studentFeaturesContract;
let peerNetworkContract;

class Student {
    static studentCount = students.length;

    constructor(name, course, company, type) {
        this.id = Student.studentCount++;
        this.name = name;
        this.course = course;
        this.company = company;
        this.type = 'Student'
    }
}

function createStudent() {

    const name = document.getElementById('studentName').value;
    const course = document.getElementById('studentCourse').value;
    const company = document.getElementById('studentCompany').value;
    const type = document.getElementById('studentType').value


    const student= new Student(name, course, company, type);
    students.push(student);
    console.log("Student Created:", student);
}

class Mentor {
    static mentorCount = mentors.length;

    constructor(name, course, company, type){
        this.mentorid = Mentor.mentorCount++;
        this.name =name;
        this.course = course;
        this.company = company;
        this.type = 'Mentor';
    }
}

function createMentor(){


    const name = document.getElementById('studentName').value
    const course = document.getElementById('studentCourse').value
    const company = document.getElementById('studentCompany').value
    const type = document.getElementById('studentType').value

    const mentor = new Mentor(name, course, company, type);
    mentors.push(mentor);
    console.log("Mentor Created:", mentor);
}


// Load the dashboard based on the role
function loadDashboard(event) {
    const selectedRole = document.getElementById("role").value;
    const dashboard = document.getElementById("dashboard");

    // Clear the existing dashboard content
    dashboard.innerHTML = "";

    if (selectedRole === "student") {
        createStudent();
        dashboard.innerHTML = `
            <h2>Student Dashboard</h2>
            <p>Welcome, ${students[students.length - 1].name}!</p>
            <p>Course: ${students[students.length - 1].course}</p>
            <button onclick="enrollInCourse()">Enroll in Course</button>
            <button onclick="viewResources()">View Resources</button>
        `;
    } else if (selectedRole === "mentor") {
        createMentor();
        dashboard.innerHTML = `
            <h2>Mentor Dashboard</h2>
            <p>Welcome, ${mentors[mentors.length - 1].name}!</p>
            <p>Course: ${mentors[mentors.length - 1].course}</p>
            <button onclick="uploadResource()">Upload Resource</button>
        `;
    } else {
        alert("Invalid Role Selected");
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