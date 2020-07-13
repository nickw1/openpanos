const Router = require('express-promise-router');
const router = new Router();
const PanoController = require('../controllers/panorama');
const panorama = new PanoController();

router.get('/:id(\\d+)', panorama.findById.bind(panorama));
router.get('/:id/nearby', panorama.findNearby.bind(panorama));
router.get('/nearest/:lon/:lat', panorama.findNearest.bind(panorama));
router.get('/here', panorama.getByBbox.bind(panorama));
router.get('/unauthorised', panorama.getUnauthorised.bind(panorama));
router.get('/unpositioned', panorama.getUnpositioned.bind(panorama));
router.post('/:id/rotate', panorama.rotate.bind(panorama));
router.post('/:id/move', panorama.move.bind(panorama));
router.post('/move', panorama.moveMulti.bind(panorama));
router.post('/upload', panorama.uploadPano.bind(panorama));
router.get('/:id(\\d+).jpg', panorama.getPanoImg.bind(panorama));
router.delete('/:id(\d+)', panorama.deletePano.bind(panorama));
	

router.controller = panorama;
module.exports = router;
