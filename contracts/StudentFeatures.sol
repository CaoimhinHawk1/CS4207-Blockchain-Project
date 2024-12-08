// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract StudentFeatures is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant MENTOR_ROLE = keccak256("MENTOR_ROLE");

    struct Course {
        string name;
        uint maxSeats;
        uint enrolledCount;
    }
    mapping(uint => Course) public courses;
    mapping(address => uint[]) public studentEnrollments;

    mapping(address => address[]) public mentors;

    struct Resource {
        string title;
        string url;
        address uploader;
    }
    Resource[] public resources;


    event CourseAdded(uint courseId, string name, uint maxSeats);
    event CourseEnrolled(address indexed student, uint courseId);
    event MentorAssigned(address indexed student, address mentor);
    event ResourceShared(address indexed uploader, string title);


    constructor() {

        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(STUDENT_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MENTOR_ROLE, ADMIN_ROLE);
    }


    function assignRole(address account, bytes32 role) public onlyRole(ADMIN_ROLE) {
        grantRole(role, account);
    }


    function addCourse(uint courseId, string memory name, uint maxSeats) public onlyRole(ADMIN_ROLE) {
        courses[courseId] = Course(name, maxSeats, 0);
        emit CourseAdded(courseId, name, maxSeats);
    }

    function enrollInCourse(uint courseId) public onlyRole(STUDENT_ROLE) {
        require(courses[courseId].enrolledCount < courses[courseId].maxSeats, "Course is full");
        courses[courseId].enrolledCount++;
        studentEnrollments[msg.sender].push(courseId);
        emit CourseEnrolled(msg.sender, courseId);
    }


    function assignMentor(address mentor) public onlyRole(STUDENT_ROLE) {
        require(hasRole(MENTOR_ROLE, mentor), "Not a mentor");
        mentors[msg.sender].push(mentor);
        emit MentorAssigned(msg.sender, mentor);
    }

    function getMentors(address student) public view returns (address[] memory) {
        return mentors[student];
    }


    function shareResource(string memory title, string memory url) public onlyRole(STUDENT_ROLE) {
        resources.push(Resource(title, url, msg.sender));
        emit ResourceShared(msg.sender, title);
    }

    function getResources() public view returns (Resource[] memory) {
        return resources;
    }
}
