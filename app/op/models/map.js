
class MapModel {
    constructor(db) {
        this.db = db;
    }

    async getMapData(bbox) {
        const sql =`SELECT osm_id,highway,foot,horse,bicycle,access,ST_AsText(ST_Transform(way, 4326)) AS tway FROM planet_osm_line WHERE way && ST_Transform(ST_SetSRID('BOX3D(${bbox[0]} ${bbox[1]}, ${bbox[2]} ${bbox[3]})'::box3d,4326), 3857) AND highway<>''`;
        const dbres = await this.db.query(sql);
        return { 'type' : 'FeatureCollection',
                'features' : dbres.rows.map ( row => {
            const feature = {type: 'Feature', properties: {}, geometry: {type: 'LineString', coordinates:[]}};
            const matches =/LINESTRING\(([-\d\., ]+)\)/.exec(row.tway);
            Object.keys(row).filter( k => k != "tway").forEach ( k=> {
                feature.properties[k] = row[k];
            });
            feature.geometry.coordinates = matches[1].split(',').map (ll => ll.split(' ')).map(arr => [parseFloat(arr[0]), parseFloat(arr[1])]);
            return feature;
        })};
    }

    async getNearestHighway(lon, lat, distThreshold) {
        console.log(`SELECT ST_AsText(ST_Transform(ST_ClosestPoint(way, transformed), 4326)) AS closest, highway, waydist FROM (SELECT *, ST_Distance(way, transformed) AS waydist FROM planet_osm_line, (SELECT ST_Transform(ST_GeomFromText('POINT(${lon} ${lat})', 4326), 3857) AS transformed) AS tquery WHERE way && ST_Transform(ST_SetSRID('BOX3D(${lon-0.01} ${lat-0.01},${lon+0.01} ${lat+0.01})'::box3d, 4326), 3857) ) AS dquery WHERE highway<>'' AND waydist < $1 ORDER BY waydist LIMIT 1`);
        const dbres = await this.db.query(`SELECT ST_AsText(ST_Transform(ST_ClosestPoint(way, transformed), 4326)) AS closest, highway, waydist FROM (SELECT *, ST_Distance(way, transformed) AS waydist FROM planet_osm_line, (SELECT ST_Transform(ST_GeomFromText('POINT(${lon} ${lat})', 4326), 3857) AS transformed) AS tquery WHERE way && ST_Transform(ST_SetSRID('BOX3D(${lon-0.01} ${lat-0.01},${lon+0.01} ${lat+0.01})'::box3d, 4326), 3857) ) AS dquery WHERE highway<>'' AND waydist < $1 ORDER BY waydist LIMIT 1`, [distThreshold]);
        return dbres.rows && dbres.rows.length == 1 ? dbres.rows[0] : {};
    }
}

module.exports = MapModel;
