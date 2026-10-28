let subjects = [];

function addSubject() {
  const subjectName = document.getElementById("subject").value.trim();
  const teacherName = document.getElementById("teacher").value.trim();
  const lectureCount = Number.parseInt(document.getElementById("lectures").value, 10);

  if (!subjectName || !teacherName || !Number.isInteger(lectureCount) || lectureCount < 1) {
    alert("Please enter a subject, teacher, and a valid number of weekly lectures.");
    return;
  }

  subjects.push({
    id: Date.now() + Math.random(),
    name: subjectName,
    teacher: teacherName,
    lectures: lectureCount
  });

  document.getElementById("subject").value = "";
  document.getElementById("teacher").value = "";
  document.getElementById("lectures").value = 4;

  displaySubjects();
  updateDashboard();
}

function displaySubjects() {
  const table = document.getElementById("subjectTable");
  table.replaceChildren();

  subjects.forEach((item, index) => {
    const row = document.createElement("tr");

    [String(index + 1), item.name, item.teacher, String(item.lectures)].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.className = "btn btn-danger btn-sm";
    button.textContent = "Delete";
    button.addEventListener("click", () => deleteSubject(item.id));
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    table.appendChild(row);
  });
}

function deleteSubject(id) {
  subjects = subjects.filter(item => item.id !== id);
  displaySubjects();
  updateDashboard();
}

function updateDashboard() {
  document.getElementById("subjectCount").textContent = subjects.length;
  document.getElementById("teacherCount").textContent =
    new Set(subjects.map(item => item.teacher)).size;
  document.getElementById("lectureCount").textContent =
    subjects.reduce((sum, item) => sum + item.lectures, 0);
}

function formatTime(totalMinutes) {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function buildTimeSlots(startValue, count) {
  const [hours, minutes] = startValue.split(":").map(Number);
  let cursor = hours * 60 + minutes;
  const slots = [];

  for (let i = 0; i < count; i++) {
    if (count >= 4 && i === 3) cursor += 30;

    const start = cursor;
    cursor += 40;

    slots.push({
      label: `${formatTime(start)} - ${formatTime(cursor)}`
    });
  }

  return slots;
}

function generateTimetable() {
  if (subjects.length === 0) {
    alert("Please add subjects first!");
    return;
  }

  const perDay = Number.parseInt(document.getElementById("lecturesPerDay").value, 10);
  if (!Number.isInteger(perDay) || perDay < 1 || perDay > 10) {
    alert("Choose between 1 and 10 lectures per day.");
    return;
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const capacity = days.length * perDay;
  const totalLectures = subjects.reduce((sum, subject) => sum + subject.lectures, 0);

  if (totalLectures > capacity) {
    alert(`You have entered ${totalLectures} lectures per week, but the timetable has room for ${capacity}. Increase lectures per day or reduce weekly lectures.`);
    return;
  }

  const startTime = document.getElementById("startTime").value || "09:30";
  const slots = buildTimeSlots(startTime, perDay);

  const college = document.getElementById("collegeName").value.trim();
  const className = document.getElementById("className").value.trim();
  const division = document.getElementById("division").value.trim();

  document.getElementById("timetableInfo").textContent =
    `${college || "College"} | Class: ${className || "—"} | Division: ${division || "—"} | 40-minute lectures`;

  const pool = [];
  subjects.forEach(subject => {
    for (let i = 0; i < subject.lectures; i++) pool.push(subject);
  });

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const timetable = days.map(() => Array(perDay).fill(null));
  let index = 0;

  days.forEach((_, dayIndex) => {
    for (let slotIndex = 0; slotIndex < perDay && index < pool.length; slotIndex++) {
      timetable[dayIndex][slotIndex] = pool[index++];
    }
  });

  displayTimetable(days, slots, timetable);
}

function displayTimetable(days, slots, timetable) {
  const head = document.getElementById("timetableHead");
  head.replaceChildren();

  const headerRow = document.createElement("tr");
  ["Day / Time", ...slots.map(slot => slot.label)].forEach(label => {
    const cell = document.createElement("th");
    cell.textContent = label;
    headerRow.appendChild(cell);
  });
  head.appendChild(headerRow);

  const body = document.getElementById("timetableBody");
  body.replaceChildren();

  days.forEach((day, dayIndex) => {
    const row = document.createElement("tr");
    const dayCell = document.createElement("th");
    dayCell.textContent = day;
    row.appendChild(dayCell);

    slots.forEach((_, slotIndex) => {
      const cell = document.createElement("td");
      const lecture = timetable[dayIndex][slotIndex];

      if (lecture) {
        const box = document.createElement("div");
        box.className = "subject-box";

        const name = document.createElement("div");
        name.className = "subject-name";
        name.textContent = lecture.name;

        const teacher = document.createElement("div");
        teacher.className = "teacher-name";
        teacher.textContent = `👨‍🏫 ${lecture.teacher}`;

        box.append(name, teacher);
        cell.appendChild(box);
      } else {
        cell.textContent = "—";
        cell.classList.add("free-slot");
      }

      row.appendChild(cell);
    });

    body.appendChild(row);
  });
}

function printTimetable() {
  if (!document.getElementById("timetableBody").hasChildNodes()) {
    alert("Generate timetable first!");
    return;
  }

  window.print();
}

function clearAll() {
  if (!confirm("Are you sure you want to clear everything?")) return;

  subjects = [];
  document.getElementById("subjectTable").replaceChildren();
  document.getElementById("timetableBody").replaceChildren();
  document.getElementById("timetableHead").replaceChildren();
  document.getElementById("timetableInfo").textContent = "";
  updateDashboard();
}