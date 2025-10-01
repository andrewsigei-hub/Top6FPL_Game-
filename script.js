// Initialisation of global variables

let selectedPosition = null; // sets the initial jersey selected to null
let player = [];
let team = [];
let budget = 40.0; // starting budget - later used in calculation
let spent = 0.0; //amount spent - later used in calculation

// creation of constants to reference elements in html for dynamic updating
const playerList = document.querySelector(".playerList");
const spentValue = document.getElementById("spent-value");
const remainingValue = document.getElementById("remaining-value");

// Position IDs used in HTMl different from data hence the use of this object
const positionMap = {
  gk: "Goalkeeper",
  def: "Defender",
  mid: "Midfielder",
  mid2: "Midfielder",
  att: "Attacker",
};

// Budgeting

// simple function used to update the text content of the spentValue and remainingValue
function updateBudgetDisplay() {
  spentValue.textContent = spent;
  remainingValue.textContent = budget - spent;
}

// Function to Fetch players
function loadPlayers() {
  fetch("http://localhost:5502/players") // GET REQUEST
    .then((response) => response.json()) // Promise
    .then((data) => {
      players = Array.isArray(data) ? data : data.players || [];
      if (!players || players.length === 0) {
        // checks if list is empty
        console.error("No players found in response:", data);
      } else {
        renderPlayerPool(); // If conditions true we can render our player pool
      }
    })
    // simple error log
    .catch((err) => {
      console.error("Fetch error:", err);
      alert(
        "Could not load players. Make sure json-server is running and the URL is correct."
      );
    }); //
}

function renderPlayerPool() {
  // playerList.innerHTML = ""; // deletes anything already inside the playerList

  players.forEach((player) => {
    //loops through data and builds card for each
    const card = document.createElement("div");
    card.className = "player-card";

    card.innerHTML = `
      <img src="${player.image}" alt="${player.name}">
      <h3>${player.name}</h3>
      <p>${player.club}</p>
      <p>${player.position}</p>
      <p>£${player.cost}</p>
    `;
    // Dynamic addition of details using string interpolation
    playerList.appendChild(card); // Adds card to playerList
  });
}

function setupJerseys() {
  // fucntion that makes jersey slots clickable
  const posistions = ["gk", "def", "mid", "mid2", "att"];

  positions.forEach((pos) => {
    const slot = document.getElementById(pos);

    slot.addEventListener("click", () => {
      selectedPosition = pos; // Records which position has been clicked
      showPlayerDropdownFor(pos); // Calls function displaying players in te position
    });
  });
}

function showPlayerDropdownFor(pos) {
  //checks if player data has loaded from server
  if (!players || players.length === 0) {
    alert("Players are not loaded yet.");
    return;
  }

  const slotDiv = document.getElementById(pos);

  // Clear old dropdown/button in this slot only
  const oldSelect = slotDiv.querySelector("select");
  const oldBtn = slotDiv.querySelector("button");
  if (oldSelect) oldSelect.remove(); //clears slot - fixed error of always reffering back to initial player inside the slot
  if (oldBtn) oldBtn.remove();
  // fixed issue of multiple dropdowns appearing

  // Filter eligible players
  const desiredPosition = positionMap[pos];
  const eligible = players.filter((p) => p.position === desiredPosition); // looks through list filters only desired position

  if (eligible.length === 0) {
    alert("No players available for that position.");
    return;
  }

  // Create select dropdown box
  const select = document.createElement("select");
  select.addEventListener("click", (event) => {
    event.stopPropagation(); // This was a big issue - Prevents dropdown form retriggering
  });

  eligible.forEach((p) => {
    // for each player inn the position selected
    const opt = document.createElement("option"); // creates option for each player in selected position
    opt.value = String(p.id);
    opt.textContent = `${p.name} — ${p.club} — £${p.cost}`; // actual displayed txt in option
    select.appendChild(opt); // adds option to dropdown
  });

  // Create Assign button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Assign Player"; 

  btn.addEventListener("click", () => {
    const chosenId = Number(select.value); // converts id into number 
    assignPlayerById(chosenId); // function called -- > this is what updates the budget and player icon

    // remove dropdown & button after assignment
    select.remove();
    btn.remove();
  });

  // Add to slot
  slotDiv.appendChild(select);
  slotDiv.appendChild(btn);
  // makes button and dropdown visible
}


// Assign player by id

function assignPlayerById(id) {
  const player = players.find((p) => p.id == id);
  if (!player) return alert("Selected player not found.");

  if (spent + player.cost > budget) return alert("Not enough budget.");
  if (team.filter((t) => t.club === player.club).length >= 3) // if there are more than 3 players with the same value for club then returns a message
    return alert("Max 3 players per club.");

  // Save to team
  team.push({ ...player, pos: selectedPosition });
  spent += Number(player.cost); // pushes values into my team array in the backend when saved
  updateBudgetDisplay(); // budget updated

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
    method: "PUT", // Specifies that I am creating a new resource - Initially used patch but did not work
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
  team = []; // resets team in the json to empty array/obj
  spent = 0; // resets spent variable
  selectedPosition = null; // resets selector
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

document.addEventListener("DOMContentLoaded", () => {  // wait command telling browser not to run code until HTML is loaded
  //calling functions
  setupJerseys();
  updateBudgetDisplay();
  loadPlayers();


  // adding functionality to buttons
  document.getElementById("save-team").addEventListener("click", saveTeam); 
  document.getElementById("reset-team").addEventListener("click", resetTeam);
});
