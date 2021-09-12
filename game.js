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
            this.players.forEach((player) => {
                if(player.x > this.map || player.y > this.map){
                    player.isAlive = false
                }
            })
        }
    }

    playerMove(index, held_direction, x, y){
        if (this.players[index]){
            this.players[index].direction = held_direction
            this.players[index].x = x
            this.players[index].y = y
        }
        
        console.log(this.players[index].name + "(" + index + ") x: " + x + " y: " + y) 
    }
    
    updateTick(){
        if (this.players){
            this.players.forEach((player) => {
                // if (  (player.x < leftLimit || 
                //         player.x > rightLimit ||
                //         player.y < topLimit ||
                //         player.y > bottomLimit ) && !player.isAlive) {
                //         player.isAlive = false;
                //     // player_character.style.backgroundColor = "#ff0000";
                //     player_character.style.opacity = "0.5";
                //     headline.style.visibility = "visible";
                // }
            })
        }
        return {players: this.players, map: this.map}
    }
}

module.exports.RPSBR = RPSBR
module.exports.Player = Player
