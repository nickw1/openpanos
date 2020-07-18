const fs = require('fs');

class PanoModel {
    constructor(options = {}) {
        this.db = options.db;
        this.canViewUnauthorised = options.canViewUnauthorised || ( () =>  true );
    }

    setDb(db) {
        this.db = db;
    }

    async findById(id)  {    
        console.log(`model: findById(): ${id}`);
        const dbres =  await this.db.query(`SELECT id, userid, authorised, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees FROM panoramas WHERE id=$1`,[id]);
        if(dbres.rows && dbres.rows.length == 1 && this.isViewable(dbres.rows[0])) {
            console.log(`dbres: ${JSON.stringify(dbres.rows)}`);
            return dbres.rows[0];
        }
        return { }; 
    }

    async findByUser(userid) {
        const dbres = await this.db.query('SELECT id, userid, authorised, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees FROM panoramas WHERE userid=$1', [userid]);
        return dbres.rows || [];
    }

    async findByUserUnpositioned(userid) {
        const dbres = await this.db.query('SELECT id, userid, authorised, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees FROM panoramas WHERE userid=$1 AND the_geom IS NULL', [userid]);
        return dbres.rows || [];
    }

    async findNearby(id) {
        const dbres = await this.db.query(`SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees, userid, authorised FROM panoramas WHERE ST_Distance((SELECT ST_Transform(the_geom, 3857) FROM panoramas WHERE id=$1), ST_Transform(the_geom,3857)) < 500`, [id]);
        const lats = dbres.rows.map ( row => row.lat ),
              lons = dbres.rows.map ( row => row.lon );
        return {'panos': dbres.rows.filter( row => row.id != id && this.isViewable(row)),
                 'bbox':     
                    [ Math.min(...lons)-0.0001, 
                        Math.min(...lats)-0.0001, 
                      Math.max(...lons)+0.0001, 
                      Math.max(...lats)+0.0001]
                };
    }

    async findNearest(lon,lat) {
        const geom = `ST_Distance(ST_GeomFromText('POINT(${lon} ${lat})', 4326), the_geom)`;
        const dbres = await this.db.query(`SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees, userid, authorised FROM panoramas ORDER by ${geom} LIMIT 1`);
        return dbres.rows.length == 1 ? dbres.rows[0] : {};
    }
   
    async getByBbox(bb) {
        const dbres = await this.db.query(`SELECT id, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, poseheadingdegrees, userid, authorised FROM panoramas WHERE ST_X(the_geom) BETWEEN $1 AND $3 AND ST_Y(the_geom) BETWEEN $2 and $4`, bb);
        
        const geojson = { 'type' : 'FeatureCollection', 'features:' : [] };
        geojson.features = dbres.rows
                .filter(row => this.isViewable(row))
                .map( row =>  {
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

    async getUnauthorised () {
        return this.getPanosByCriterion('authorised = 0');
    }
    
    async getPanosByCriterion(sql,boundData){    
        const dbres = await this.db.query(`SELECT id, poseheadingdegrees, timestamp, authorised, ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, userid, authorised FROM panoramas WHERE ${sql} ORDER BY id`, boundData || []);
        return dbres.rows; 
    }

    async rotate(id, poseheadingdegrees) {
        const dbres = await this.db.query(`UPDATE panoramas SET poseheadingdegrees=$1 WHERE id=$2`, [poseheadingdegrees, id] );
        return dbres.rows;
    }

    async move(id, lon, lat) {
        let code = 200;
        let msg = "";
        if(/^\d+$/.test(id) && /^-?[\d\.]+$/.test(lon) && /^-?[\d\.]+$/.test(lat)) {
            const geom = `ST_GeomFromText('POINT(${lon} ${lat})', 4326)`;
            const dbres = await this.db.query(`UPDATE panoramas SET the_geom=${geom} WHERE id=$1`, [id]);
            return dbres.rows;
        } else {
            code = 400;
            msg = "Invalid pano ID, latitude and/or longitude.";
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

    async deletePano(id) {
        const dbres = await this.db.query("DELETE FROM panoramas WHERE id=$1", [id]);
        fs.promises.unlink(`${process.env.PANOS_DIR}/${id}.jpg`);
        return true;
    }

    async authorisePano(id) {
        const dbres = await this.db.query("UPDATE panoramas SET authorised=1 WHERE id=$1", [id]);
        return true; 
    }

    async getImage(id) {
        const dbres = await this.db.query(`SELECT * FROM panoramas WHERE id=$1`, [id]);
        if(dbres.rows && dbres.rows.length == 1) { 
            if(this.isViewable(dbres.rows[0])) {
                return fs.promises.readFile(`${process.env.PANOS_DIR}/${id}.jpg`);
            } else {
                return Promise.reject({status: 401, error: 'No permission to view this panorama.'});
            }
        } else {
            return Promise.reject({status: 404, error: `Cannot access panorama with ID ${id}`});
        }
    }

    isViewable(panodetails) {
        return panodetails.authorised == 1 || this.canViewUnauthorised(panodetails);
    }
}
    

module.exports = PanoModel; 
