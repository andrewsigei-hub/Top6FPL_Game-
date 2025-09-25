const playerList = document.querySelector("playerList");
const gkJersey = document.getElementById('gk');
const defJersey = document.getElementById('def');
const midJersey = document.getElementById('mid');
const attJersey = document.getAnimations('att');
let selectedPosition = null;
let team = [];
let spent = 0;


fetch("http://localhost:4000/players")
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



function updateBudget(){
  document.getElementById("spent").innerText = spent;
  document.getElementById("remaining").innerText = budget - spent;
}