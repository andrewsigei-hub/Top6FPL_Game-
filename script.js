let selectedPosition = null;
let player = [];
let team = [];
let budget = 50.0;
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
  fetch("http://localhost:5500/players")
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
  playerListEl.innerHTML = ""; // clear

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
    playerListEl.appendChild(card);
  });
}

function setupJerseys() {
  const positions = ["gk", "def", "mid", "mid2", "att"];

  positions.forEach((pos) => {
    const slot = document.getElementById(pos);
    selectedPosition = pos;
    showPlayerDropdownFor(pos);
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

  eligible.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = String(p.id);
    opt.textContent = `${p.name} — ${p.club} — £${fmt(p.cost)}`;
    select.appendChild(opt);
  });

}

