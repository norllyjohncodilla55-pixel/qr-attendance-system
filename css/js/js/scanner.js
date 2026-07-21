// QR Attendance Scanner

const STORAGE_KEY = "attendanceRecords";
const STUDENT_KEY = "students";

let html5QrCode;

function loadStudents() {
    return JSON.parse(localStorage.getItem(STUDENT_KEY)) || [];
}

function loadAttendance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAttendance(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getCurrentDate() {
    return new Date().toISOString().split("T")[0];
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function attendanceStatus() {

    const now = new Date();

    const lateHour = 8;
    const lateMinute = 0;

    if (
        now.getHours() > lateHour ||
        (now.getHours() === lateHour &&
         now.getMinutes() > lateMinute)
    ) {
        return "Late";
    }

    return "On Time";
}

function processScan(studentNo) {

    const students = loadStudents();

    const attendance = loadAttendance();

    const student = students.find(
        s => s.studentNo === studentNo
    );

    if (!student) {

        document.getElementById("scanResult").innerHTML =
            "❌ Student not found";

        return;
    }

    const today = getCurrentDate();

    const duplicate = attendance.find(r =>
        r.studentNo === studentNo &&
        r.date === today
    );

    if (duplicate) {

        document.getElementById("scanResult").innerHTML =
            "⚠ Already Recorded Today";

        return;
    }

    const record = {

        studentNo: student.studentNo,
        name: student.name,
        date: today,
        time: getCurrentTime(),
        status: attendanceStatus()

    };

    attendance.push(record);

    saveAttendance(attendance);

    document.getElementById("scanResult").innerHTML =
        `
        ✅ Attendance Recorded<br><br>

        <strong>${student.name}</strong><br>

        ${record.studentNo}<br>

        ${record.time}<br>

        ${record.status}
        `;
}

function startScanner() {

    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        decodedText => {

            html5QrCode.stop();

            processScan(decodedText);

            setTimeout(() => {

                startScanner();

            }, 2500);

        },

        error => {}

    );
}

window.onload = () => {

    startScanner();

};
