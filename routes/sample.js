const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('sample', {title: 'Sample Page', layout: 'sample_layout'})
});

module.exports = router;