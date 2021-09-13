const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('game', {title: 'RPS Battle Royale', layout:'game_layout'})
})



router.get('/rpsGame', (req, res) => {
  res.render('rps_game', {
    title: 'RPS Game',
    layout:'rps_layout',
    opponentName: 'Opponent',
    playerName: 'Player'
  })
})

module.exports = router;