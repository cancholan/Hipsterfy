//animate placeholder text
const artistArr = [
  "Green Day",
  "Miles Davis",
  "Shakira",
  "Led Zeppelin",
  "Kendrick Lamar",
  "Taylor Swift",
  "The Beatles",
  "Try searching for...",
];
var numArtists = artistArr.length;
var index = 0;
var input = document.querySelector("#textInput");

setInterval(() => {
  input.placeholder = artistArr[index];
  index = (index + 1) % numArtists;
}, 2000);

//control accordion
const accordion = document.getElementsByClassName("acc-container");

for (let i = 0; i < accordion.length; i++) {
  accordion[i].addEventListener("click", function() {
    this.classList.toggle("acc-active");
  });
}
