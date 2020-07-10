
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
}

module.exports = MapModel;
