// QR Attendance System
// app.js

const STORAGE_KEY = "attendanceRecords";
const STUDENT_KEY = "students";

function loadAttendance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAttendance(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadStudents() {
    return JSON.parse(localStorage.getItem(STUDENT_KEY)) || [];
}

async function initializeStudents() {
    const existing = loadStudents();

    if (existing.length > 0) return;

    try {
        const response = await fetch("data/students.json");
        const students = await response.json();
        localStorage.setItem(STUDENT_KEY, JSON.stringify(students));
    } catch (err) {
        console.error("Unable to load students.json", err);
    }
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function refreshDashboard() {

    const students = loadStudents();
    const attendance = loadAttendance();
    const today = getToday();

    const todayAttendance = attendance.filter(a => a.date === today);

    const present = todayAttendance.length;
    const late = todayAttendance.filter(a => a.status === "Late").length;
    const absent = students.length - present;

    document.getElementById("presentCount").textContent = present;
    document.getElementById("lateCount").textContent = late;
    document.getElementById("absentCount").textContent =
        absent < 0 ? 0 : absent;

    const tbody = document.querySelector("#attendanceTable tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    todayAttendance.forEach(record => {

        tbody.innerHTML += `
        <tr>
            <td>${record.studentNo}</td>
            <td>${record.name}</td>
            <td>${record.time}</td>
            <td>${record.status}</td>
        </tr>
        `;

    });

}

window.addEventListener("DOMContentLoaded", async () => {

    await initializeStudents();

    refreshDashboard();

});
