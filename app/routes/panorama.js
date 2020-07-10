const Router = require('express-promise-router');
const router = new Router();
const panorama = require('../controllers/panorama');


router.get('/', (req,res)=> {
	res.send('hello world panoarams');
});

router.get('/:id(\\d+)', panorama.findById);
router.get('/:id/nearby', panorama.findNearby);
router.get('/nearest/:lon/:lat', panorama.findNearest);
router.get('/here', panorama.getByBbox);
router.get('/mine', panorama.getAllByUser);
router.get('/unauthorised', panorama.getUnauthorised);
router.get('/unpositioned', panorama.getUnpositioned);
router.post('/:id/rotate', panorama.rotate);
router.post('/:id/move', panorama.move);
router.post('/move', panorama.moveMulti);
router.post('/upload', panorama.uploadPano);
router.get('/:id(\\d+).jpg', panorama.getPanoImg);
router.delete('/:id(\d+)', panorama.deletePano);
	

module.exports = router;
