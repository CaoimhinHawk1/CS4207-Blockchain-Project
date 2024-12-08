const { expect } = require("chai");
const StudentFeatures = artifacts.require("StudentFeatures");

contract("StudentFeatures", function (accounts) {
    const [admin, student1, student2, mentor1, mentor2] = accounts;
    let contract;

    before(async function () {
        contract = await StudentFeatures.new();
    });

    describe("Role Assignment", function () {
        it("should assign ADMIN_ROLE to the deployer", async function () {
            const hasAdminRole = await contract.hasRole(await contract.ADMIN_ROLE(), admin);
            expect(hasAdminRole).to.be.true;
        });

        it("should allow admin to assign STUDENT_ROLE", async function () {
            await contract.assignRole(student1, await contract.STUDENT_ROLE(), { from: admin });
            const hasStudentRole = await contract.hasRole(await contract.STUDENT_ROLE(), student1);
            expect(hasStudentRole).to.be.true;
        });

        it("should allow admin to assign MENTOR_ROLE", async function () {
            await contract.assignRole(mentor1, await contract.MENTOR_ROLE(), { from: admin });
            const hasMentorRole = await contract.hasRole(await contract.MENTOR_ROLE(), mentor1);
            expect(hasMentorRole).to.be.true;
        });

        it("should not allow non-admin to assign roles", async function () {
            try {
                await contract.assignRole(student2, await contract.STUDENT_ROLE(), { from: student1 });
                throw new Error("Role assignment did not fail");
            } catch (err) {
                expect(err.message).to.include("AccessControl");
            }
        });
    });

    describe("Course Management", function () {
        it("should allow admin to add courses", async function () {
            await contract.addCourse(1, "Blockchain 101", 10, { from: admin });
            const course = await contract.courses(1);
            expect(course.name).to.equal("Blockchain 101");
            expect(course.maxSeats.toString()).to.equal("10");
            expect(course.enrolledCount.toString()).to.equal("0");
        });

        it("should allow students to enroll in courses", async function () {
            await contract.enrollInCourse(1, { from: student1 });
            const course = await contract.courses(1);
            expect(course.enrolledCount.toString()).to.equal("1");

            const studentCourses = await contract.studentEnrollments(student1);
            expect(studentCourses.map(c => c.toString())).to.include("1");
        });

        it("should prevent students from enrolling in full courses", async function () {
            await contract.addCourse(2, "Ethereum Development", 1, { from: admin });
            await contract.enrollInCourse(2, { from: student1 });

            try {
                await contract.enrollInCourse(2, { from: student2 });
                throw new Error("Enrollment did not fail");
            } catch (err) {
                expect(err.message).to.include("Course is full");
            }
        });
    });

    describe("Mentor Assignment", function () {
        it("should allow students to assign mentors", async function () {
            await contract.assignRole(mentor2, await contract.MENTOR_ROLE(), { from: admin });
            await contract.assignMentor(mentor2, { from: student1 });

            const studentMentors = await contract.getMentors(student1);
            expect(studentMentors).to.include(mentor2);
        });

        it("should prevent assigning non-mentors as mentors", async function () {
            try {
                await contract.assignMentor(student2, { from: student1 });
                throw new Error("Mentor assignment did not fail");
            } catch (err) {
                expect(err.message).to.include("Not a mentor");
            }
        });
    });

    describe("Resource Sharing", function () {
        it("should allow students to share resources", async function () {
            await contract.shareResource("Intro to Solidity", "http://example.com", { from: student1 });

            const resources = await contract.getResources();
            expect(resources.length).to.equal(1);
            expect(resources[0].title).to.equal("Intro to Solidity");
            expect(resources[0].url).to.equal("http://example.com");
            expect(resources[0].uploader).to.equal(student1);
        });

        it("should prevent non-students from sharing resources", async function () {
            try {
                await contract.shareResource("Advanced Ethereum", "http://example.com", { from: mentor1 });
                throw new Error("Resource sharing did not fail");
            } catch (err) {
                expect(err.message).to.include("AccessControl");
            }
        });

        it("should return all shared resources", async function () {
            await contract.shareResource("Smart Contracts", "http://example2.com", { from: student1 });

            const resources = await contract.getResources();
            expect(resources.length).to.equal(2);
            expect(resources[1].title).to.equal("Smart Contracts");
        });
    });
});
