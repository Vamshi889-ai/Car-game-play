const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mute = false;
document.getElementById('muteBtn').onclick = () => {
  mute = !mute;
  document.getElementById('muteBtn').textContent = mute ? "Unmute" : "Mute";
};

// Hide splash after 2 sec
setTimeout(() => {
  document.getElementById('splash').style.display = 'none';
}, 2000);

// Load images
const playerImg = new Image();
playerImg.src = 'images/car-player.png';
const trafficImg = new Image();
trafficImg.src = 'images/car-traffic.png';
const roadImg = new Image();
roadImg.src = 'images/road.png';

// Player & traffic
let player = { x: canvas.width/2, y: canvas.height-150, speed: 5 };
let traffic = [
  { x: canvas.width/2 - 50, y: -200, speed: 3 },
  { x: canvas.width/2 + 50, y: -500, speed: 4 }
];

let score = 0;
let gameOver = false;

// Draw car image
function drawCar(car, img){
  ctx.drawImage(img, car.x-25, car.y-50, 50, 100);
}

function updateAI(message){
  document.getElementById('aiMessage').innerText = "AI: " + message;
  if(!mute){
    let utter = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utter);
  }
}

function gameLoop(){
  if(gameOver) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw road background
  ctx.drawImage(roadImg, canvas.width/2-100, 0, 200, canvas.height);

  // Player car
  drawCar(player, playerImg);

  // Traffic cars
  traffic.forEach(car=>{
    car.y += car.speed;
    if(car.y > canvas.height){
      car.y = -200;
      score += 10;
    }
    drawCar(car, trafficImg);

    // Collision detection
    if(Math.abs(car.x-player.x)<50 && Math.abs(car.y-player.y)<80){
      endGame();
    }
  });

  requestAnimationFrame(gameLoop);
}
gameLoop();

// AI assist every 5 sec
setInterval(()=>{
  let nearest = traffic[0];
  let message = "";
  if(player.x < nearest.x){
    message = "Overtake on right";
  } else if(player.x > nearest.x){
    message = "Overtake on left";
  } else {
    message = "Car ahead, slow down";
  }

  if(player.speed > nearest.speed + 2){
    message += " and maintain safe speed";
  }

  updateAI(message);
},5000);

// Touch control
document.addEventListener('touchstart',(e)=>{
  if(e.touches[0].clientX < canvas.width/2){
    player.x -= 30;
  } else {
    player.x += 30;
  }
});

function endGame(){
  gameOver = true;
  document.getElementById('scoreText').innerText = "Your Score: " + score;
  let stars = Math.min(5, Math.floor(score/20));
  let starHTML = '';
  for(let i=0;i<stars;i++) starHTML += '⭐';
  document.getElementById('stars').innerHTML = starHTML;

  let level = stars >=4 ? "Excellent Driver" : stars >=2 ? "Good Driver" : "Needs Improvement";
  document.getElementById('scoreText').innerText += "\nLevel: " + level;

  document.getElementById('scoreScreen').classList.remove('hidden');
}
