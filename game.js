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
        this.fighters = []
        this.map = 1000// since its a square, literally just the length of a side
        // this.roomid =  roomid
        this.active = false
        this.winner = false
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

    //  game controllers
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

    add(name, socketID){
        // add player to array
        var found = this.findPlayer(name)
        if (found){
            return false
        } else {
            var newPlayer = new Player(name, (this.players) ? this.players.length : 0, socketID)
        }
        
        this.players.push(newPlayer)
        return newPlayer
    }

    disconnected(socketID){ 
        if (!this.active){
            var index = this.players.map((obj) => {return obj.socketID}).indexOf(socketID)
            this.players.splice(index, 1)
            var counter = 0
            for (counter=0;counter<this.players.length;counter++)
            {
                this.players[counter].index = counter
            }
        }       
    }

    findPlayer(name){
        const found = this.players.map((obj) => { return obj.name }).indexOf(name)
        return (found != -1) ? this.players[found] : false;
    }

    // core game features

    shrinkMap(){
        if (this.map > 200){
            this.map -= 10
            // just kill them if they're outside the boundary
        }
    }

    playerMove(index, held_direction, x, y){
        if (this.players[index] && !this.players[index].isFighting){
            this.players[index].held_direction = held_direction
            this.players[index].x = x
            this.players[index].y = y
        }
        
        // console.log(this.players[index].name + "(" + index + ") x: " + x + " y: " + y + " dir: " + held_direction) 
    }

    // fighting functions
    /*
        fighters = {
            p1: //socket id of p1
            p2: //socket id of p2
        }
        fightResult: // fight result code
    */
    endFight(fighters, fightResult){

        const f1 = this.players.filter((player) => player.socketID == fighters.p1)[0]
        const f2 = this.players.filter((player) => player.socketID == fighters.p2)[0]

        if (fightResult == 3){// both die
            this.eliminate(f1)
            this.eliminate(f2)
        } 
        else if (fightResult == 2) { //  f2 wins
            this.eliminate(f1)
            this.winFight(f2)
        } 
        else if (fightResult == 1) {  // f1 wins
            
            this.eliminate(f2) 
            this.winFight(f1)
        } 
        else { // win code 4 one died to border
            this.eliminate(f1)
            this.winFight(f2)
        }
        const fight = this.fighters.filter(fight => fight.p1 == f1 || fight.p2 == f1)
        const fightIndex = this.fighters.indexOf(fight[0])
        this.fighters.splice(fightIndex, 1)
    }

    eliminate(player){
        // set player as dead
        // const todie = this.players.indexOf(player) // PROBLEM HERE DOESN'T FIND SO -1
        // console.log(this.players)
        // console.log(player)
        // this.players[todie].isAlive = false
        this.players.forEach((obj) => {
            if (obj.name === player.name){      // player.length is = 2, idk why maybe passing data got problem
                obj.isAlive = false
                obj.isFighting = false
            }
        })
    }

    winFight(player){
        this.players.forEach((obj) => {
            if (obj.name === player.name){
                obj.isAlive = true
                obj.isFighting = false
            }
        })
    }


    // update tick check functions
    checkRange(){
        const fightRange = 10

        this.players.forEach((player) => {
            const playerX = player.x
            const playerY = player.y
            
            if (!player.isFighting && player.isAlive){
                this.players.forEach((enemy) => {
                    if (enemy != player && !enemy.isFighting && enemy.isAlive){
                        const {x, y} = enemy
                        const X = playerX - x
                        const Y = playerY - y
                        const distance = Math.sqrt( (X*X) + (Y*Y) )
                        if (distance <= fightRange) {
                            // make players fight
                            player.isFighting = true
                            enemy.isFighting = true
                            const fight = {p1: player, p2: enemy, started: false, roomId: player.name.concat(enemy.name)}
                            this.fighters.push(fight)
                        }
                    }
                })
            }
        })
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
                if (!player.isFighting){
                    this.eliminate(player)
                }
            }

        })
        return false
    }

    checkWinner(){
        var alivers = this.players.filter((player) => {return player.isAlive})
        if (alivers.length == 1){
            this.active = false
            return alivers[0]
        } else if (alivers.length < 1)
        {
            this.active = false
            return "draw"
        }
        return false
    }
    
    updateTick(){
        return {players: this.players, map: this.map}
    }
}

module.exports.RPSBR = RPSBR
module.exports.Player = Player
