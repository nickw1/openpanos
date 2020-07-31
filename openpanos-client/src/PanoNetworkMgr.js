const jsFreemaplib = require('jsfreemaplib');
const GoogleProjection = jsFreemaplib.GoogleProjection;
const PathFinder = require('./geojson-path-finder'); 
const BoundingBox = jsFreemaplib.BoundingBox;
const JunctionManager = require('./JunctionManager');
const turfPoint = require('turf-point');
const turfBearing = require('@turf/bearing').default;

class PanoNetworkMgr {

	constructor(options) {
		this.options = options || { };
		this.options.jsonApi = this.options.jsonApi || 'op/map/highways';
		this.options.nearbyApi = this.options.nearbyApi || 'op/panorama/{id}/nearby';
	}

    doLoadNearbys (json,callback) {
		console.log(json);
        var html = "";
        var goog = new GoogleProjection(); 

        var pois = [];
        json.lon = parseFloat(json.lon);
        json.lat = parseFloat(json.lat);
        json.poseheadingdegrees = parseFloat(json.poseheadingdegrees);
        var projected=[goog.lonToGoogle(json.lon), goog.latToGoogle(json.lat)];

        fetch(this.options.nearbyApi.replace('{id}',json.id))
            .then(resp => resp.json())
            .then(nearbys=> {
                fetch(`${this.options.jsonApi}?bbox=${nearbys.bbox.join(",")}`)
                .then(resp => resp.json())
                .then(geojson => {
                    pois.push(json);
                    nearbys.panos.forEach (nearby => { 
                        html += `Nearby Panorama: ${nearby.id} ${nearby.lat},${nearby.lon}<br />`;
                        nearby.lon = parseFloat(nearby.lon);
                        nearby.lat = parseFloat(nearby.lat);
                        pois.push(nearby);
                        
                    } );    
            
                    geojson = this.insertIntoNetwork(geojson, pois);
                    var includedNearbys = [];

                    var pathFinder = new PathFinder(geojson, { precision: 0.00001, edgeDataReduceFn: (e)=> { } } );
                    const jMgr = new JunctionManager(pathFinder);
                    // NEW - once we've created the graph, snap the current and nearby panos to the nearest junction within 5m, if there is one
                    const snappedNodes = [ null, null ];
                    snappedNodes[0] = jMgr.snapToJunction([json.lon, json.lat], 0.005);
                    nearbys.panos.forEach(nearby=> {
                        nearby.lon = parseFloat(nearby.lon);
                        nearby.lat = parseFloat(nearby.lat);
                        nearby.poseheadingdegrees = parseFloat(nearby.poseheadingdegrees);
                        nearby.bearing = 720;
                        snappedNodes[1] = jMgr.snapToJunction([nearby.lon, nearby.lat], 0.005);
                        
                        var route = this.calcPath(pathFinder, snappedNodes);

                        if(route!=null && route.path.length>=2) {
                            var bearing = turfBearing(turfPoint(route.path[0]), turfPoint(route.path[1]));

                            if(bearing < 0) bearing += 360;
                            nearby.bearing = bearing;
                            nearby.weight = route.weight;
                        }
                    });
                    var sorted = nearbys.panos.filter((nearby)=>nearby.bearing<=360).sort((nearby1,nearby2)=>(nearby1.bearing-nearby2.bearing)); 
                    var lastBearing = 720;
                    var includedBearings = [];
                    var curNearbys = [];
                    var nearbysSortedByBearing = [];
        
                    for(var i=0; i<sorted.length; i++) {
                        if(Math.abs(sorted[i].bearing-lastBearing) >= 5) {
                        // new bearing
                            includedBearings.push(sorted[i].bearing);
                            curNearbys = [];
                            nearbysSortedByBearing.push(curNearbys);
                        }
                        curNearbys.push(sorted[i]);
                        lastBearing = sorted[i].bearing;
                    }

                    nearbysSortedByBearing.forEach ( (n)=> {
                        includedNearbys.push(n.sort((n1,n2)=>n1.weight-n2.weight)[0]);
                    });
                    callback(json, includedNearbys);
            });
        });
    }


    insertIntoNetwork (json, pois) {
        var newFeatures = [];
        var k = 0, z = 0;
        json.features.forEach( way => { way.bbox = jsFreemaplib.getBoundingBox(way.geometry.coordinates); });
        pois.forEach(poi => {
            var point = [poi.lon, poi.lat];
            poi.overallLowestDist= { distance: Number.MAX_VALUE };
            json.features.filter(way => way.bbox.contains(point)).forEach(way => {
                
                var lowestDist = {distance: Number.MAX_VALUE}, idx = -1, curDist;
                for(var j=0; j<way.geometry.coordinates.length-1; j++) {
                    curDist = jsFreemaplib.haversineDistToLine(
                            poi.lon,     
                            poi.lat, 
                            way.geometry.coordinates[j], 
                            way.geometry.coordinates[j+1]);    
                    if(curDist!==null && curDist.distance >=0 && curDist.distance < lowestDist.distance) {
                        lowestDist=curDist;
                        idx=j;
                    }
                }    

                
                if(idx >=0 && lowestDist.distance < 10.0) {
                    // it has to be within 10m of a way 
                    // We don't yet actually try and split the way though
                    // We need to ensure the POI is inserted into the
                    // CORRECT way (the closest) - aka the "panorama 16
                    // problem". So for the moment we
                    // just create an array of POTENTIAL splits for this
                    // POI, and take the one closest to a way later.
                    if(lowestDist.distance < poi.overallLowestDist.distance) {
                        poi.overallLowestDist.distance = lowestDist.distance;
                        poi.overallLowestDist.idx = idx + lowestDist.proportion;
                        poi.overallLowestDist.way = way;
                    }
                }
            }); 
        } ); 

        const allSplits = {};

        // allSplits will now contain all COUNTED splits (one split per POI),
        // indexed by way ID, so we can then go on and consider all real splits
        // for a way, as we did before.
        // don't need this now 
        pois.filter(poi => poi.overallLowestDist.distance < Number.MAX_VALUE).forEach(poi => {
            const way = poi.overallLowestDist.way;
            if(allSplits[way.properties.osm_id] === undefined) allSplits[way.properties.osm_id] = [];
            allSplits[way.properties.osm_id].push({idx: poi.overallLowestDist.idx, poi: poi, way: way});
        });

        // now we need to loop through the ways again 
        json.features.forEach ( way => {
            let splits = allSplits[way.properties.osm_id];    
            // this was originally in the ways loop
            if(splits && splits.length>0) {
                splits = splits.sort((a,b)=>a.idx-b.idx);
                var splitIdx = 0;
                var newWay = this.makeNewWay(way); 
                var i = 0;
                while (i < way.geometry.coordinates.length) {
                    newWay.geometry.coordinates.push([way.geometry.coordinates[i][0], way.geometry.coordinates[i][1]]);
                    while(splitIdx < splits.length && Math.floor(splits[splitIdx].idx) == i) {

                        newWay.geometry.coordinates.push([splits[splitIdx].poi.lon, splits[splitIdx].poi.lat, splits[splitIdx].poi.id]);
                        splitIdx++;
                    }
                    i++;    
                }
                newFeatures[k++] = newWay;
            } else {
                newFeatures[k++] = way;
            }
        });
        json.features = newFeatures;
        return json;
    }

    calcPath (pathFinder, points) {

        var f1 = { geometry: { type: 'Point',
            coordinates: points[0] }},
            f2 = { geometry: { type: 'Point',
            coordinates: points[1] }};

        return pathFinder.findPath(f1, f2);
    }

    makeNewWay(way) {
        var newWay = {type:'Feature'};
        newWay.properties =  way.properties; 
        newWay.geometry = {};
        newWay.geometry.type =  'LineString';
        newWay.geometry.coordinates = [];
        return newWay;
    }
}

module.exports = PanoNetworkMgr;
