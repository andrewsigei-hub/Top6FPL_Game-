/*const playerList = document.getElementsByClassName("playerList");
const gkJersey = document.getElementById("gk");
const defJersey = document.getElementById("def");
const midJersey = document.getElementById("mid");
const attJersey = document.getElementById("att");
let selectedPosition = null;
let team = [];
let spent = 0;
let budget = 50;
let eligiblePlayers = [];

fetch("http://localhost:5502/players")
  .then((res) => res.json())
  .then((data) => {
    console.log("Loaded players:", data.players);

    data.players.forEach((player) => {
      // Create player card
      const card = document.createElement("div");
      card.classList.add("player-card");
      card.innerHTML = `
        <img src="${player.image}" alt="${player.name}">
        <h3>${player.name}</h3>
        <p>${player.club}</p>
        <p>${player.position}</p>
        <p>£${player.cost}</p>
      `;
      playerList.appendChild(card);
    });
  });

function updateBudget() {
  document.getElementById("spent").innerText = spent;
  document.getElementById("remaining").innerText = budget - spent;
}

// UNDERSTAND THIS CODE

function jerseySelection() {
  const positions = ["gk", "def", "mid", "att"];

  positions.forEach((pos) => {
    const selectedPosJ = document.getElementById(pos);

    selectedPosJ.addEventListener("click", () => {
      selectedPosition = pos;
      showPlayerDropdown = pos;
    });
  });
}

function showPlayerDropdown() {
  // Create dropdown
  const select = document.createElement("select");
  select.id = "player-select";

  eligiblePlayers.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.name;
    option.textContent = `${player.name} (£${player.cost})`;
    select.appendChild(option);
  });

  // Create assign button
  const button = document.createElement("button");
  button.textContent = "Assign Player";
  button.addEventListener("click", () => assignPlayer(select.value));

  // Add dropdown + button to jersey div
  const jerseyDiv = document.getElementById(pos);
  jerseyDiv.appendChild(select);
  jerseyDiv.appendChild(button);
}

setupJerseys();
updateBudget();*/

// ========================
// State variables
// ========================
let selectedPosition = null; // active jersey
let team = []; // selected players
let budget = 50; // total budget
let spent = 0; // amount spent
let players = []; // loaded from JSON

// ========================
// Select DOM elements
// ========================
const playerList = document.querySelector(".playerList");

// ========================
// Fetch players and render
// ========================
fetch("http://localhost:5502/players")
  .then((res) => res.json())
  .then((data) => {
    players = data.players;
    players.forEach((player) => {
      const card = document.createElement("div");
      card.classList.add("player-card");
      card.dataset.position = player.position;
      card.dataset.cost = player.cost;
      card.dataset.club = player.club;
      card.dataset.name = player.name;

      card.innerHTML = `
        <img src="${player.image}" alt="${player.name}">
        <h3>${player.name}</h3>
        <p>${player.club}</p>
        <p>${player.position}</p>
        <p>£${player.cost}</p>
      `;
      playerList.appendChild(card);
    });
  });

// ========================
// Update budget display
// ========================
function updateBudget() {
  document.getElementById("spent").innerText = spent;
  document.getElementById("remaining").innerText = budget - spent;
}

// ========================
// Jersey click setup
// ========================
function jerseySelection() {
  const positions = ["gk", "def", "mid", "att"];

  positions.forEach((pos) => {
    const jerseyDiv = document.getElementById(pos);
    const jerseyImg = jerseyDiv.querySelector("img"); // select the image inside div
    jerseyImg.addEventListener("click", () => {
      selectedPosition = pos;
      showPlayerDropdown(pos);
    });
  });
}

// ========================
// Show dropdown of eligible players
// ========================
function showPlayerDropdown(pos) {
  // Filter eligible players
  const eligiblePlayers = players.filter((player) => player.position === pos);

  // Remove existing dropdown if any
  const existing = document.getElementById("player-select");
  if (existing) existing.remove();

  // Create dropdown
  const select = document.createElement("select");
  select.id = "player-select";

  eligiblePlayers.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.name;
    option.textContent = `${player.name} (£${player.cost})`;
    select.appendChild(option);
  });

  // Create assign button
  const button = document.createElement("button");
  button.textContent = "Assign Player";
  button.addEventListener("click", () => assignPlayer(select.value));

  // Append dropdown + button to jersey div
  const jerseyDiv = document.getElementById(pos);
  jerseyDiv.appendChild(select);
  jerseyDiv.appendChild(button);
}

// ========================
// Assign player to jersey
// ========================
function assignPlayer(playerName) {
  const player = players.find((p) => p.name === playerName);

  // Budget check
  if (spent + player.cost > budget) {
    alert("Not enough budget!");
    return;
  }

  // Max 2 players per club
  const clubCount = team.filter((p) => p.club === player.club).length;
  if (clubCount >= 2) {
    alert("Cannot have more than 2 players from the same club!");
    return;
  }

  // Update jersey div
  const jerseyDiv = document.getElementById(selectedPosition);
  jerseyDiv.innerHTML = `
    <img src="${player.image}" alt="${player.name}" style="max-width:100%;max-height:100%;">
    <p>${player.name}</p>
  `;

  // Update state
  team.push(player);
  spent += player.cost;
  updateBudget();

  // Reset selection
  selectedPosition = null;
}

// ========================
// Initialize
// ========================
document.addEventListener("DOMContentLoaded", () => {
  jerseySelection();
  updateBudget();
});
