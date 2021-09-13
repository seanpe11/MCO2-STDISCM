class Player{
    constructor(name, index, socketID){
        this.name = name
        this.index = index
        this.x = 0
        this.y = 0
        this.held_direction = 0
        this.isFighting = false
        this.isAlive = true
        this.socketID = socketID
    }
}

function generateRoomCode(){

}

const {createRoom, joinRoom, exitRoom, rooms} = require("./public/js/rpsRoom");

// simply adds, removes, and preserves state of players
class RPSBR {
    constructor(){
        this.players = []
        this.map = 1000// since its a square, literally just the length of a side
        // this.roomid =  roomid
        this.active = false
    }

    start(){
        this.players.forEach((player) => {
            const {leftLimit, rightLimit, topLimit, bottomLimit} = this.getLimits()
            // Math.floor(Math.random() * highestValue) + lowestvalue 
            player.x = Math.floor(Math.random() * (rightLimit-5)) + leftLimit + 5 // give them five units of leeway from the border
            player.y = Math.floor(Math.random() * (bottomLimit-5)) + topLimit + 5 
            // player.x = 25
            // player.y = 30
        })
        this.active = true
    }
    
    getLimits(){
        const maxSize = 1000
        const pixelSize = 3
        const margin = (maxSize - this.map)/2;
        // console.log("MARGIN" + margin)

        return {
            leftLimit: margin/pixelSize - 10, 
            rightLimit: (maxSize-margin-96)/pixelSize + 10,
            topLimit: margin/pixelSize - 13,
            bottomLimit: (maxSize-margin-96)/pixelSize,
        }
    }

    eliminate(player){
        // set player as dead
        this.players[this.players.indexOf(player)].isAlive = false
    }

    add(name, socketID){
        // add player to array
        var newPlayer = new Player(name, (this.players) ? this.players.length : 0, socketID)
        this.players.push(newPlayer)
        return newPlayer
    }

    findPlayer(name){
        const found = this.players.map((obj) => { return obj.name }).indexOf(name)
        return (found != -1) ? this.players[found] : false;
    }

    shrinkMap(){
        if (this.map > 200){
            this.map -= 10
            // just kill them if they're outside the boundary
        }
    }

    playerMove(index, held_direction, x, y){
        if (this.players[index]){
            this.players[index].held_direction = held_direction
            this.players[index].x = x
            this.players[index].y = y
        }
        
        console.log(this.players[index].name + "(" + index + ") x: " + x + " y: " + y + " dir: " + held_direction) 
    }

    checkRange(){
        const fightRange = 148

        this.players.forEach((player) => {
            const playerX = player.x
            const playerY = player.y
            
            if (!player.isFighting){
                this.players.forEach((enemy) => {
                    if (enemy != player && !enemy.isFighting){
                        const {x, y} = enemy
                        const X = playerX - x
                        const Y = playerY - y
                        const distance = Math.sqrt( (X*X) + (Y*Y) )
                        if (distance <= 10) {
                            // make players fight
                            player.isFighting = true
                            enemy.isFighting = true
                            return {p1: player, p2: enemy}
                        }
                    }
                })
            }
        })

        return false
    }

    checkOutOfBounds(){
        this.players.forEach((player) => {
            // add logic to check if player is out of bounds
            // check if outerbounds, then kill
            const {leftLimit, rightLimit, topLimit, bottomLimit} = this.getLimits()
            const {x, y} = player
            if (  (x < leftLimit || x > rightLimit 
                    ||    y < topLimit || y > bottomLimit ) 
                    && player.isAlive) {
                this.eliminate(player);
            }

        })
    }

    checkWinner(){
        if (this.players.map((player) => {return player.isAlive}).length == 1){
            return true
        }
        return false
    }
    
    updateTick(){
        return {players: this.players, map: this.map}
    }
}

module.exports.RPSBR = RPSBR
module.exports.Player = Player
