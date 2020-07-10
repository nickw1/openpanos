const fs = require('fs').promises;

class PanoModel {
    constructor(db) {
        this.db = db;
    }

    setDb(db) {
        this.db = db;
    }

    toString() {
        return "PanoModel instance";
    }

    async findById(id)  {    
        console.log(`model: findById(): ${id}`);
        const dbres =  await this.db.query("SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees FROM panoramas WHERE id=$1 AND authorised=1",[id]);
        console.log(`dbres: ${JSON.stringify(dbres.rows)}`);
        return dbres;
    }



    async findNearby(id) {
        const dbres = await this.db.query('SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees FROM panoramas WHERE ST_Distance((SELECT ST_Transform(the_geom, 3857) FROM panoramas WHERE id=$1), ST_Transform(the_geom,3857)) < 500 AND authorised=1', [id]);
        const lats = dbres.rows.map ( row => row.lat ),
              lons = dbres.rows.map ( row => row.lon );
        return {'panos': dbres.rows.filter( row => row.id != id ),
                 'bbox':     
                    [ Math.min(...lons)-0.0001, 
                        Math.min(...lats)-0.0001, 
                      Math.max(...lons)+0.0001, 
                      Math.max(...lats)+0.0001]
                };
    }

    async findNearest(lon,lat) {
        const geom = `ST_Distance(ST_GeomFromText('POINT(${lon} ${lat})', 4326), the_geom)`;
        const dbres = await this.db.query(`SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees FROM panoramas ORDER by ${geom} LIMIT 1`);
        return dbres.rows.length == 1 ? dbres.rows[0] : [];
    }
   
    async getByBbox(bb) {
        const dbres = await this.db.query("SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees, userid FROM panoramas WHERE ST_X(the_geom) BETWEEN $1 AND $3 AND ST_Y(the_geom) BETWEEN $2 and $4 AND authorised=1", bb);
        
        const geojson = { 'type' : 'FeatureCollection', 'features:' : [] };
        geojson.features = dbres.rows.map( row =>  {
                    return {   type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [ row.lon, row.lat ],
                                },
                                properties: {
                                    poseheadingdegrees: row.poseheadingdegrees,
                                    id: row.id,
                                    userid: row.userid
                                }
                            }
        });
        
        
        return geojson;            
    }

    async getPanosByUser(userid, sql='') {
        return this.getPanosByCriterion(`userid=$1 ${sql}`, [userid]);
    }

    async getUnpositioned (userid) {
        return this.getPanosByUser(userid, 'AND the_geom IS NULL');
    }

    async getUnauthorised () {
        return this.getPanosByCriterion('authorised = 0');
    }
    
    async getPanosByCriterion(sql,boundData){    
        const dbres = await this.db.query(`SELECT id, poseheadingdegrees, timestamp, authorised, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat FROM panoramas WHERE ${sql} ORDER BY id`, boundData || []);
        return dbres.rows; 
    }

    async rotate(id, poseheadingdegrees) {
        if(await this.authorisedToChange(id)) {
            const dbres = await this.db.query(`UPDATE panoramas SET poseheadingdegrees=$1 WHERE id=$2`, [poseheadingdegrees, id] );
            return dbres.rows;
        } else { 
            return Promise.reject({"status": 401, "error" : "No permission to rotate"});
        }
    }

    async move(id, lon, lat) {
        let code = 200;
        let msg = "";
        if(await this.authorisedToChange(id)) {
            if(/^\d+$/.test(id) && /^-?[\d\.]+$/.test(lon) &&
                /^-?[\d\.]+$/.test(lat)) {
                const geom = `ST_GeomFromText('POINT(${lon} ${lat})', 4326)`;
                const dbres = await this.db.query(`UPDATE panoramas SET the_geom=${geom} WHERE id=$1`, [id]);
                return dbres.rows;
            } else {
                code = 400;
                msg = "Invalid pano ID, latitude and/or longitude.";
            } 
        }  else {
            code = 401;
            msg = "No permission to move panorama";
        }
        return Promise.reject({status: code, error: msg});
    }

    async moveMulti(panos) {
        const successful = [];
        for(id in panos) {
            try {
                this.move(id, panos[id].lon, panos[id].lat);
                succcessful.push({id: id, lat: panos[id].lat, lon: panos[id].lon});
            } catch(e) { } // if move() rejects, silently fail - just do not add the panorama to the array of successfully moved panos
        }    
        return successful;
    }

    // Override to test such things as whether a user owns the panorama,
    // whether the user is an admin, etc...
    // (user management is not part of the basic openpanos platform)
    async authorisedToChange(panoid)  {
        return true;
    }

    // Likewise
    authorisedToUpload () {
        return true;
    }

    async deletePano(id) {
        if(await this.authorisedToChange(id)) {
            const dbres = await this.db.query("DELETE FROM panoramas WHERE id=$1", [id]);
            fs.unlink(`/var/www/html/panos/${id}.jpg`);
            return true;
        } else {    
            return Promise.reject({"status": 401, "error" : "No permission to delete"});
        }
    }

    async authorisePano(id) {
        if(await this.authorisedToChange(id)) {
            const dbres = await this.db.query("UPDATE  panoramas SET authorised=1 WHERE id=$1", [id]);
            return true; 
        } else {
            return Promise.reject({"status": 401, "error" : "No permission to authorise"});
        }
    }

    async getImage(id) {
        const dbres = await this.db.query(`SELECT * FROM panoramas WHERE id=$1 AND authorised=1`, [id]);
        if(dbres.rows && dbres.rows.length == 1) {
            return fs.readFile(`/var/www/html/panos/${id}.jpg`);
        } else {
            return Promise.reject({"status": 404, "error": `Cannot access panorama with ID ${id}`});
        }
    }
}
    

module.exports = PanoModel; 
