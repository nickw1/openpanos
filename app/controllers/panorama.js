const db = require('../db');
const fs = require('fs');
const PanoModel = require('../models/panomodel');
const Photosphere = require('../models/photosphere');


const panorama = { 
    findById: async (req, res) => {    
        const model = new PanoModel(db);
        const dbres = await model.findById(req.params.id);    
        res.json(dbres.rows.length===1 ? dbres.rows[0]: []); 
    },


    getPanoImg: async(req, res)=> {
        try {
            const model = new PanoModel(db);
            const bytes = await model.getImage(req.params.id);
            res.set('content-type', 'image/jpeg').send(bytes);
        } catch(e) {
            if(e.status && e.error) {
                res.status(e.status).json({error: e.error});
            } else {
                console.error(e);
                res.status(404).json({error:"Unable to open panorama"});
            }
        }
    },


    findNearby:  async (req,res)=> {
        const model = new PanoModel(db);
        const results = await model.findNearby(req.params.id);
        res.json(results);
    },

    findNearest: async (req,res)=> {
        if (/^-?[\d\.]+$/.test(req.params.lon) && /^-?[\d\.]+$/.test(req.params.lat)) {
            const model = new PanoModel(db);
            const results = await model.findNearest(req.params.lon, req.params.lat);
            res.json(results);
        } else {
            res.status(400).json([]);    
        }
    },
   
    getByBbox: async (req,res)=> {
        if(req.query.bbox !== undefined) {
            const bb = req.query.bbox.split(",").filter( value => /^-?[\d\.]+$/.test(value));
            if(bb.length == 4) {
                const model = new PanoModel(db);
                const results = await model.getByBbox(bb);
                res.json(results);
            }
        } else {
            res.status(400).json({"error": "Please supply a bbox."});
        }
    }, 

    getAllByUser: async (req, res)=> {
        let userid = 1;
        if(userid === undefined) {
            res.status(401);
        } else {
            const model = new PanoModel(db);
            const result = await model.getPanosByUser(userid);
            res.json(result);
        }
    },

    getUnpositioned: async (req, res)=> {
        const model = new PanoModel(db);
        const result = await model.getUnpositioned(1);
        res.json(result);
    },

    getUnauthorised: async (req, res)=> {
        if(false) {
            res.status(401).json({"obj": JSON.stringify(this)});
        } else {
            const model = new PanoModel(db);
            const result = await model.getUnauthorised();
            res.json(result);
        }
    },
    
    rotate: async(req,res)=> {
        try {
            const model = new PanoModel(db);
            const data = await model.rotate(req.params.id, req.body.poseheadingdegrees);
            res.json(data);
        } catch(e) {
            res.status(e.status).json({error: e.error});
        }
    },

    move: async(req,res)=> {
        try {
            const model = new PanoModel(db);
            const data = await model.move(req.params.id, req.body.lon, req.body.lat);
            res.json(data);
        } catch(e) {
            res.status(e.status).json({error: e.error});
        }
    },

    moveMulti: async(req,res)=> {
        const model = new PanoModel(db);
        await res.json(model.moveMulti(req.body));
        res.send();
    },

    deletePano: async(req, res)=> {
        if(/^\d+$/.test(req.params.id)) {
            try {
                const model = new PanoModel(db);
                await model.deletePano(req.params.id);
                res.send();
            } catch(e) {
                res.status(e.status).json({error: e.error});
            }
        } else {
            res.status(400);
        }
    },

    authorisePano: async(req, res)=> {
        if(/^\d+$/.test(req.params.id)) {
            try {
                const model = new PanoModel(db);
                await model.authorisePano(req.params.id);
                res.send();
            } catch(e) {
                res.status(e.status).json({error: e.error});
            }    
        } else {
            res.status(400);
        }
    },

    uploadPano: async(req,res)=> {
        let warnings = []; 
        const maxFileSize = 15;
        const model = new PanoModel(db);
        if(!model.authorisedToUpload()) {
            res.status(401).json({"error": "You must be authenticated to upload panos."});
        } else if (!req.files.file) {
            res.status(400).json({"error": "No panorama provided."});
        } else {
            if(req.files.file.size > 1048576 * maxFileSize) {
                res.status(400).json({"error": `Exceeded file size of ${maxFileSize} MB.`});
            } else {
                const tmpName = req.files.file.tempFilePath;
                const photosphere = new Photosphere(tmpName);
                try {
                    const props = await photosphere.parseFile();
                    if(props.poseheadingdegrees === null) {
                        warnings.push( "No orientation found, you'll later need to orient this manually.");
                    } 
                        
                    let id = 0;
                    if(props.lon !== null && props.lat !== null && /^-?[\d\.]+$/.test(props.lon) && /^-?[\d\.]+$/.test(props.lat)) {
                        const heading = props.poseheadingdegrees || 0;
                        const geometry = `ST_GeomFromText('POINT(${props.lon} ${props.lat})', 4326)`;
                        const sql = (`INSERT INTO panoramas (the_geom, poseheadingdegrees, userid, timestamp, authorised) VALUES (${geometry}, ${heading}, 1, ${new Date(props.time).getTime() / 1000}, 0) RETURNING id`);
                        const dbres = await db.query(sql);
                        id = dbres.rows[0].id;
                    } else {
                        let userid = 1;
                        const dbres = await db.query("INSERT INTO panoramas (the_geom, poseheadingdegrees, userid, timestamp, authorised) VALUES (NULL, 0, $1, 0)", [userid]);
                        warnings.push("No lat/lon information. You will need to manually position the panorama later.");
                        id = dbres.rows[0].id;
                    }
                    if(id > 0) {
                        req.files.file.mv(`${process.env.PANOS_DIR}/${id}.jpg`, async(err)=> {    
                            if(err) {
                                res.status(500).send({ error: err });
                            }  else {
                                res.json({"success": true, "warnings": warnings});
                            }
                        });
                    }
                } catch (e) {
                    console.error(`parseFile() threw an error: ${JSON.stringify(e)}`);
                    res.status(400).json(e);
                    fs.unlink(tmpName, (err)=> { console.error('unlink error')});
                }
            }
        }    
    }
};
    

module.exports = panorama;
