let selectedPosition = null;
let player = [];
let team =[];
let budget = 50.0;
let spent = 0.0;
const playerList = document.querySelector(".playerList")
const spentValue = document.getElementById("spent-value");
const remainingValue = document.getElementById("remaining-value");


const positionMap = {
  gk: "Goalkeeper",
  def: "Defender",
  mid: "Midfielder",
  mid2: "Midfielder",
  att: "Attacker",
};


function updateBudgetDisplay(){
  spentValue.textContent = (spent);
  remainingValue.textContent = (budget-spent)
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
