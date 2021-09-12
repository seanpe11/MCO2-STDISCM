class Player{
    constructor(name, index){
        this.name = name
        this.index = index
        this.x = 0
        this.y = 0
        this.held_direction = 0
        this.isFighting = false
        this.isAlive = true
    }
}

function generateRoomCode(){

}

// simply adds, removes, and preserves state of players
class RPSBR {
    constructor(){
        this.players = []
        this.map = 500// since its a square, literally just the length of a side
        // this.roomid =  roomid
        this.active = false
    }

    start(){
        this.players.forEach((player) => {
            player.x = 0
            player.y = 0
        })
        this.active = true
    }
    
    eliminate(player){
        // set player as dead
        this.players[this.players.indexOf(player)].isAlive = false
    }

    add(name){
        // add player to array
        var newPlayer = new Player(name, (this.players) ? this.players.length : 0)
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
        const fightRange = 5

        this.players.forEach((player) => {
            const playerX = player.x
            const playerY = player.y
            
            this.players.forEach((enemy) => {
                if (enemy != player){
                    const {x, y} = enemy
                    const X = playerX - x
                    const Y = playerY - y
                    const distance = Math.sqrt( (X*X) + (Y*Y) )
                    if (distance <= 5) {
                        // make players fight
                        // player.isFighting = true
                        // enemy.isFighting = true
                    }
                }
            })
        })
    }

    checkOutOfBounds(){
        const leftLimit = 0 - 10;
        const rightLimit = (this.map) + 10;
        const topLimit = 0 - 13;
        const bottomLimit = (this.map);
        this.players.forEach((player) => {
            // add logic to check if player is out of bounds
            // check if outerbounds, then kill
            const {x, y} = player
            if (  (x < leftLimit || x > rightLimit 
                    ||    y < topLimit || y > bottomLimit ) 
                    && player.isAlive) {
                player.isAlive = false;
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
