let activities = JSON.parse(localStorage.getItem("activities") || "[]");
let expanded = [];
let currentIndex = 0;
let countdown;
let remaining = 0;
let isPaused = false;

renderActivities();

function addActivity() {
  const name = document.getElementById("activityName").value.trim();
  const work = parseInt(document.getElementById("activityWork").value);
  const rest = parseInt(document.getElementById("activityRest").value) || 0;
  const reps = parseInt(document.getElementById("activityReps").value) || 1;

  if (!name || isNaN(work) || work <= 0) {
    alert("Please enter valid activity name and work time.");
    return;
  }

  activities.push({ name, work, rest, reps });
  saveLocal();
  renderActivities();

  document.getElementById("activityName").value = "";
  document.getElementById("activityWork").value = "";
  document.getElementById("activityRest").value = "0";
  document.getElementById("activityReps").value = "1";
}

function editActivity(index) {
  const a = activities[index];
  const newName = prompt("Edit activity name:", a.name);
  if (newName === null) return;
  const newWork = prompt("Edit work time in seconds:", a.work);
  if (newWork === null) return;
  const newRest = prompt("Edit rest time in seconds:", a.rest);
  if (newRest === null) return;
  const newReps = prompt("Edit repetitions:", a.reps);
  if (newReps === null) return;
  if (newName.trim() && !isNaN(newWork) && newWork > 0 && !isNaN(newRest) && newRest >= 0 && !isNaN(newReps) && newReps > 0) {
    activities[index] = { name: newName.trim(), work: parseInt(newWork), rest: parseInt(newRest), reps: parseInt(newReps) };
    saveLocal();
    renderActivities();
  } else {
    alert("Invalid input.");
  }
}

function deleteActivity(index) {
  if (confirm(`Delete "${activities[index].name}"?`)) {
    activities.splice(index, 1);
    saveLocal();
    renderActivities();
  }
}

function renderActivities() {
  const container = document.getElementById("activities");
  container.innerHTML = "";
  activities.forEach((a, i) => {
    container.innerHTML += `
      <div class="activity">
        <span>${i+1}. ${a.name} - Work: ${a.work}s, Rest: ${a.rest}s × ${a.reps}</span>
        <span class="controls">
          <button onclick="editActivity(${i})">✏️</button>
          <button onclick="deleteActivity(${i})">❌</button>
        </span>
      </div>`;
  });
}

function expandActivities() {
  expanded = [];
  activities.forEach(a => {
    for (let r=1; r<=a.reps; r++) {
      expanded.push({ name: `${a.name} (Rep ${r}/${a.reps})`, time: a.work, type: "work" });
      if (a.rest > 0) {
        expanded.push({ name: `Rest after ${a.name}`, time: a.rest, type: "rest" });
      }
    }
  });
}

function startWorkout() {
  if (activities.length === 0) {
    alert("Add some activities first!");
    return;
  }
  expandActivities();
  currentIndex = 0;
  document.getElementById("workoutControls").style.display = "block";
  runActivity();
}

function runActivity() {
  if (currentIndex >= expanded.length) {
    document.getElementById("current").innerText = "Workout Complete 🎉";
    document.getElementById("timer").innerText = "";
    document.getElementById("progressFill").style.width = "0%";
    document.body.style.background = "#eee";
    document.getElementById("workoutControls").style.display = "none";
    return;
  }

  const activity = expanded[currentIndex];
  remaining = activity.time;
  document.getElementById("current").innerText = `Now: ${activity.name}`;
  document.getElementById("timer").innerText = remaining;
  document.getElementById("progressFill").style.width = "100%";
  clearInterval(countdown);

  // Color code
  if (activity.type === "work") {
    document.getElementById("progressFill").style.background = "#4CAF50"; // green
    document.body.style.background = "#e8f5e9";
  } else {
    document.getElementById("progressFill").style.background = "#2196F3"; // blue
    document.body.style.background = "#e3f2fd";
  }

  countdown = setInterval(() => {
    if (!isPaused) {
      remaining--;
      document.getElementById("timer").innerText = remaining;
      document.getElementById("progressFill").style.width = `${(remaining / activity.time) * 100}%`;
      if (remaining <= 0) {
        clearInterval(countdown);
        currentIndex++;
        runActivity();
      }
    }
  }, 1000);
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById("pauseResumeBtn").innerText = isPaused ? "▶️ Resume" : "⏸ Pause";
}

function skipWorkout() {
  clearInterval(countdown);
  currentIndex++;
  runActivity();
}

function endWorkout() {
  clearInterval(countdown);
  document.getElementById("current").innerText = "Workout Ended ⏹";
  document.getElementById("timer").innerText = "";
  document.getElementById("progressFill").style.width = "0%";
  document.body.style.background = "#f5f5f5";
  document.getElementById("workoutControls").style.display = "none";
}

function saveLocal() {
  localStorage.setItem("activities", JSON.stringify(activities));
}

function savePreset() {
  const blob = new Blob([JSON.stringify(activities, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "workout-preset.json";
  a.click();
}

document.getElementById("loadInput").addEventListener("change", function(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      activities = JSON.parse(e.target.result);
      saveLocal();
      renderActivities();
    } catch (err) {
      alert("Invalid preset file.");
    }
  };
  reader.readAsText(file);
});
