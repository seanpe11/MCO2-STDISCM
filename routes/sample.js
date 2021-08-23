const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('sample', {title: 'Sample Page', layout: 'sample_layout'})
});

router.get('/sampleGame', (req, res) => {
  res.render('sample_game', {title: 'Sample Game', layout:'sample_game'})
})

module.exports = router;