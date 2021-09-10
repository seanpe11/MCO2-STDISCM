var socket = io()

var character = document.querySelector(".character");
var player_character = document.getElementById("player_character");
var character1 = document.querySelector("#character1")
var map = document.getElementById("map");
var circle = document.getElementById("circle");
var headline = document.getElementById("headline");

//start in the middle of the map
var x = 0;
var y = 0;
var held_directions = []; //State of which arrow keys we are holding down
var speed = 1; //How fast the character moves in pixels per frame

//Limits (gives the illusion of walls)
// 15x15 is the size of one grid. ORIGINAL LIMITS
// var leftLimit = -15;
// var rightLimit = (16 * 11) + 8;
// var topLimit = -8 + 32;
// var bottomLimit = (16 * 7);
var pixelSize = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
);

// limits = actualLimit +- adjustmentForSpriteMap
var leftLimit = 0 - 10;
var rightLimit = (map.clientWidth - character.clientWidth) /pixelSize + 10;
var topLimit = 0 - 13;
var bottomLimit = (map.clientHeight - character.clientWidth) /pixelSize;

// map center
// var middle_x = map.clientWidth / pixelSize;
// var middle_y = map.clientHeight / pixelSize;

var isDead = false;

const placeMainCharacter = () => {

    const held_direction = held_directions[0];
    if (held_direction) {
        if (held_direction === directions.right) { x += speed; }
        if (held_direction === directions.left) { x -= speed; }
        if (held_direction === directions.down) { y += speed; }
        if (held_direction === directions.up) { y -= speed; }
        character.setAttribute("facing", held_direction);
        socket.emit('move', {held_direction: held_direction, x: x, y: y})
    }
    character.setAttribute("walking", held_direction ? "true" : "false");

    // check if outerbounds, then kill
    if (  (x < leftLimit || 
      x > rightLimit ||
      y < topLimit ||
      y > bottomLimit ) && !isDead) {
        isDead = true;
        // player_character.style.backgroundColor = "#ff0000";
        player_character.style.opacity = "0.5";
        headline.style.visibility = "visible";
      }

    // restrict players from leaving map
    if (x < leftLimit) { x = leftLimit; }
    if (x > rightLimit) { x = rightLimit; }
    if (y < topLimit) { y = topLimit; }
    if (y > bottomLimit) { y = bottomLimit; }

    var camera_left = pixelSize * 66;
    var camera_top = pixelSize * 42;

    // map.style.transform = `translate3d( ${-x * pixelSize + camera_left}px, ${-y * pixelSize + camera_top}px, 0 )`;
    character.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
    circle.style.transform = `translate3d( ${-x * pixelSize + camera_left}px, ${-y * pixelSize + camera_top}px, 0 )`;
}

const updateOtherCharacters = (data) => {
    var pixelSize = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
    );
    console.log(data)
    var {held_direction, x, y} = data
    character1.setAttribute("facing", held_direction);
    character1.setAttribute("walking", "true");
    character1.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
    console.log(data)
}

//Set up the game loop
async function step () {
    placeMainCharacter();    
    window.requestAnimationFrame(() => {
        step();
    })
    // io.emit('step')
}

const timer = ms => new Promise(res => setTimeout(res, ms))

var reduce = 10;

// shrinking map logic
async function shrinkMap () {
  var margin = 0;
  map.style.padding = 0;
  while(map.clientWidth > 200) {
    await timer(3000); // then the created Promise can be awaited

    leftLimit += reduce/pixelSize;
    rightLimit -= reduce/pixelSize;
    topLimit += reduce/pixelSize;
    bottomLimit -= reduce/pixelSize;

    margin += reduce;

    map.style.margin = `${margin}px`;
    map.style.width = `${map.clientWidth - reduce*2}px`;
    map.style.height = `${map.clientHeight - reduce*2}px`;

    // circle.style.width = `${rightLimit}px`;
    console.log(leftLimit, rightLimit, topLimit, bottomLimit);
    console.log(map.style.margin);
  }
}

step(); //kick off the first step!
shrinkMap(); // TODO: Move to server, make the client just process new margins and div sizes

/* Direction key state */
const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
}
const keys = {
    38: directions.up,
    37: directions.left,
    39: directions.right,
    40: directions.down,
}

socket.on('moved', (data) => {
    updateOtherCharacters(data)
})

document.addEventListener("keydown", (e) => {
    var dir = keys[e.which];
    if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
    }
    console.log('keypresed')
})

document.addEventListener("keyup", (e) => {
    var dir = keys[e.which];
    var index = held_directions.indexOf(dir);
    if (index > -1) {
        held_directions.splice(index, 1)
    }
});



/* BONUS! Dpad functionality for mouse and touch */
var isPressed = false;
const removePressedAll = () => {
    document.querySelectorAll(".dpad-button").forEach(d => {
        d.classList.remove("pressed")
    })
}
document.body.addEventListener("mousedown", () => {
    console.log('mouse is down')
    isPressed = true;
})
document.body.addEventListener("mouseup", () => {
    console.log('mouse is up')
    isPressed = false;
    held_directions = [];
    removePressedAll();
})
const handleDpadPress = (direction, click) => {
    if (click) {
        isPressed = true;
    }
    held_directions = (isPressed) ? [direction] : []

    if (isPressed) {
        removePressedAll();
        document.querySelector(".dpad-" + direction).classList.add("pressed");
    }
}
//Bind a ton of events for the dpad
document.querySelector(".dpad-left").addEventListener("touchstart", (e) => handleDpadPress(directions.left, true));
document.querySelector(".dpad-up").addEventListener("touchstart", (e) => handleDpadPress(directions.up, true));
document.querySelector(".dpad-right").addEventListener("touchstart", (e) => handleDpadPress(directions.right, true));
document.querySelector(".dpad-down").addEventListener("touchstart", (e) => handleDpadPress(directions.down, true));

document.querySelector(".dpad-left").addEventListener("mousedown", (e) => handleDpadPress(directions.left, true));
document.querySelector(".dpad-up").addEventListener("mousedown", (e) => handleDpadPress(directions.up, true));
document.querySelector(".dpad-right").addEventListener("mousedown", (e) => handleDpadPress(directions.right, true));
document.querySelector(".dpad-down").addEventListener("mousedown", (e) => handleDpadPress(directions.down, true));

document.querySelector(".dpad-left").addEventListener("mouseover", (e) => handleDpadPress(directions.left));
document.querySelector(".dpad-up").addEventListener("mouseover", (e) => handleDpadPress(directions.up));
document.querySelector(".dpad-right").addEventListener("mouseover", (e) => handleDpadPress(directions.right));
document.querySelector(".dpad-down").addEventListener("mouseover", (e) => handleDpadPress(directions.down));