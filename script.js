let selectedPosition = null;
let player = [];
let team = [];
let budget = 40.0;
let spent = 0.0;
const playerList = document.querySelector(".playerList");
const spentValue = document.getElementById("spent-value");
const remainingValue = document.getElementById("remaining-value");

const positionMap = {
  gk: "Goalkeeper",
  def: "Defender",
  mid: "Midfielder",
  mid2: "Midfielder",
  att: "Attacker",
};

function updateBudgetDisplay() {
  spentValue.textContent = spent;
  remainingValue.textContent = budget - spent;
}

function loadPlayers() {
  fetch("http://localhost:5502/players")
    .then((response) => response.json())
    .then((data) => {
      players = Array.isArray(data) ? data : data.players || [];
      if (!players || players.length === 0) {
        console.error("No players found in response:", data);
      } else {
        renderPlayerPool();
      }
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      alert(
        "Could not load players. Make sure json-server is running and the URL is correct."
      );
    });
}

function renderPlayerPool() {
  playerList.innerHTML = ""; // clear

  players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card";

    card.innerHTML = `
      <img src="${player.image}" alt="${player.name}">
      <h3>${player.name}</h3>
      <p>${player.club}</p>
      <p>${player.position}</p>
      <p>£${player.cost}</p>
    `;
    playerList.appendChild(card);
  });
}

function setupJerseys() {
  const positions = ["gk", "def", "mid", "mid2", "att"];

  positions.forEach((pos) => {
    const slot = document.getElementById(pos);

    slot.addEventListener("click", () => {
      selectedPosition = pos;
      showPlayerDropdownFor(pos);
    });
  });
}

function showPlayerDropdownFor(pos) {
  if (!players || players.length === 0) {
    alert("Players are not loaded yet.");
    return;
  }

  const slotDiv = document.getElementById(pos);

  // Clear old dropdown/button in this slot only
  const oldSelect = slotDiv.querySelector("select");
  const oldBtn = slotDiv.querySelector("button");
  if (oldSelect) oldSelect.remove();
  if (oldBtn) oldBtn.remove();

  // Filter eligible players
  const desiredPosition = positionMap[pos];
  const eligible = players.filter((p) => p.position === desiredPosition);

  if (eligible.length === 0) {
    alert("No players available for that position.");
    return;
  }

  // Create select
  const select = document.createElement("select");
  select.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  eligible.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = String(p.id);
    opt.textContent = `${p.name} — ${p.club} — £${p.cost}`;
    select.appendChild(opt);
  });

  // Create Assign button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Assign Player";

  btn.addEventListener("click", () => {
    const chosenId = Number(select.value);
    assignPlayerById(chosenId);

    // remove dropdown & button after assignment
    select.remove();
    btn.remove();
  });

  // Add to slot
  slotDiv.appendChild(select);
  slotDiv.appendChild(btn);
}

// ========================
// Assign player by id

function assignPlayerById(id) {
  const player = players.find((p) => p.id == id);
  if (!player) return alert("Selected player not found.");

  if (spent + player.cost > budget) return alert("Not enough budget.");
  if (team.filter((t) => t.club === player.club).length >= 3)
    return alert("Max 3 players per club.");

  // Save to team
  team.push({ ...player, pos: selectedPosition });
  spent += Number(player.cost);
  updateBudgetDisplay();

  // Update the slot visually
  const slotDiv = document.getElementById(selectedPosition);
  slotDiv.innerHTML = `
    <img src="${player.image}" alt="${player.name}" style="width:50px;height:50px;">
    <p>${player.name}</p>
    <p>£${player.cost}</p>
  `;

  selectedPosition = null;
}

function saveTeam() {
  const teamData = { team: team }; // Prepare the data structure to send

  fetch("http://localhost:5502/finalTeam", {
    method: "PUT", // Specifies that you are only updating part of the resource
    headers: {
      "Content-Type": "application/json", // Tells the server the data is JSON
    },
    body: JSON.stringify(teamData), // Converts the JavaScript object to a JSON string
  })
    .then((data) => {
      console.log("Team saved successfully:", data);
      alert("Your final team has been saved!");
    })
    .catch((error) => {
      console.error("Error saving team:", error);
      alert("Failed to save team. Check server connection.");
    });
}

function resetTeam() {
  team = [];
  spent = 0;
  selectedPosition = null;
  updateBudgetDisplay();

  // Reset each slot visually
  const positions = ["gk", "def", "mid", "mid2", "att"];
  positions.forEach((pos) => {
    const slotDiv = document.getElementById(pos);
    slotDiv.innerHTML = `
      <img src="images/plain-black-football-shirt-svgrepo-com.svg" 
           alt="jersey-icon" width="150" />
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupJerseys();
  updateBudgetDisplay();
  loadPlayers();

  document.getElementById("save-team").addEventListener("click", saveTeam);
  document.getElementById("reset-team").addEventListener("click", resetTeam);
});
