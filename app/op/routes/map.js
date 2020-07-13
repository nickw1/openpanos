const db = require('../db');
const Router = require('express-promise-router');
const router = new Router();
const MapModel = require('../models/map');

router.get('/highways', async (req, res) => {
    let bbox = [];
    if(req.query.bbox && (bbox = req.query.bbox.split(',')).length == 4) {
        try {
            const map = new MapModel(db);
            const dbres = await map.getMapData(bbox);
            res.json(dbres);
        } catch(e) {
            console.log(e);
            res.status(500).send({"error": e});
        }
    } else {
        res.status(400).send({"error": "please supply a bbox"});
    }
});

router.get('/nearestHighway', async(req,res) => {
    const map = new MapModel(db); 
    if(/^-?[\d\.]+$/.test(req.query.lon) && /^-?[\d\.}+$/.test(req.query.lat) && /^[\d]+$/.test(req.query.dist)) {
        res.json(await map.getNearestHighway(parseFloat(req.query.lon), parseFloat(req.query.lat), parseFloat(req.query.dist)));
    } else {
        res.status(400).json({"error": "Invalid input parameter format"});
    }
});

module.exports = router;
