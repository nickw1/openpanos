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

module.exports = router;
