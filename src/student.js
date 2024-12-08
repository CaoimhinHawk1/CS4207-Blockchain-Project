class Student {
    static studentCount = students.length;

    constructor(name, course, year = 1) {
        this.id = Student.studentCount++;
        this.name = name;
        this.course = course;
        this.year = year;
    }
}

function createStudent(event) {
    event.preventDefault();

    const name = document.getElementById('studentName').value;
    const course = document.getElementById('studentCourse').value;
    const year = parseInt(document.getElementById('studentYear').value);

    const student= new Student(name, course, year);
    students.push(student);

}
