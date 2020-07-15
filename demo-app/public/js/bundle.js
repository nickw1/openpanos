(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const openpanos = require('openpanos-client');

const parts = window.location.href.split('?');
const get = {};

if(parts.length==2) {
    if(parts[1].endsWith('#')) { 
        parts[1] = parts[1].slice(0, -1);
    }
    var params = parts[1].split('&');
    for(var i=0; i<params.length; i++) {
        var param = params[i].split('=');
        get[param[0]] = param[1];
    }
}

const client = new openpanos.Client();
if(get.id) {
    client.loadPanorama(get.id);
} else if (get.lat && get.lon) {
    client.findPanoramaByLonLat(get.lon, get.lat);
} else {
    client.loadPanorama(1);
}

},{"openpanos-client":27}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
var invariant_1 = require("@turf/invariant");
// http://en.wikipedia.org/wiki/Haversine_formula
// http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Takes two {@link Point|points} and finds the geographic bearing between them,
 * i.e. the angle measured in degrees from the north line (0 degrees)
 *
 * @name bearing
 * @param {Coord} start starting Point
 * @param {Coord} end ending Point
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.final=false] calculates the final bearing if true
 * @returns {number} bearing in decimal degrees, between -180 and 180 degrees (positive clockwise)
 * @example
 * var point1 = turf.point([-75.343, 39.984]);
 * var point2 = turf.point([-75.534, 39.123]);
 *
 * var bearing = turf.bearing(point1, point2);
 *
 * //addToMap
 * var addToMap = [point1, point2]
 * point1.properties['marker-color'] = '#f00'
 * point2.properties['marker-color'] = '#0f0'
 * point1.properties.bearing = bearing
 */
function bearing(start, end, options) {
    if (options === void 0) { options = {}; }
    // Reverse calculation
    if (options.final === true) {
        return calculateFinalBearing(start, end);
    }
    var coordinates1 = invariant_1.getCoord(start);
    var coordinates2 = invariant_1.getCoord(end);
    var lon1 = helpers_1.degreesToRadians(coordinates1[0]);
    var lon2 = helpers_1.degreesToRadians(coordinates2[0]);
    var lat1 = helpers_1.degreesToRadians(coordinates1[1]);
    var lat2 = helpers_1.degreesToRadians(coordinates2[1]);
    var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var b = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return helpers_1.radiansToDegrees(Math.atan2(a, b));
}
/**
 * Calculates Final Bearing
 *
 * @private
 * @param {Coord} start starting Point
 * @param {Coord} end ending Point
 * @returns {number} bearing
 */
function calculateFinalBearing(start, end) {
    // Swap start & end
    var bear = bearing(end, start);
    bear = (bear + 180) % 360;
    return bear;
}
exports.default = bearing;

},{"@turf/helpers":6,"@turf/invariant":7}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invariant_1 = require("@turf/invariant");
var helpers_1 = require("@turf/helpers");
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Calculates the distance between two {@link Point|points} in degrees, radians, miles, or kilometers.
 * This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
 *
 * @name distance
 * @param {Coord} from origin point
 * @param {Coord} to destination point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} distance between the two points
 * @example
 * var from = turf.point([-75.343, 39.984]);
 * var to = turf.point([-75.534, 39.123]);
 * var options = {units: 'miles'};
 *
 * var distance = turf.distance(from, to, options);
 *
 * //addToMap
 * var addToMap = [from, to];
 * from.properties.distance = distance;
 * to.properties.distance = distance;
 */
function distance(from, to, options) {
    if (options === void 0) { options = {}; }
    var coordinates1 = invariant_1.getCoord(from);
    var coordinates2 = invariant_1.getCoord(to);
    var dLat = helpers_1.degreesToRadians((coordinates2[1] - coordinates1[1]));
    var dLon = helpers_1.degreesToRadians((coordinates2[0] - coordinates1[0]));
    var lat1 = helpers_1.degreesToRadians(coordinates1[1]);
    var lat2 = helpers_1.degreesToRadians(coordinates2[1]);
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    return helpers_1.radiansToLength(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), options.units);
}
exports.default = distance;

},{"@turf/helpers":6,"@turf/invariant":7}],4:[function(require,module,exports){
'use strict';

var meta = require('@turf/meta');
var helpers = require('@turf/helpers');

/**
 * Takes a feature or set of features and returns all positions as {@link Point|points}.
 *
 * @name explode
 * @param {GeoJSON} geojson input features
 * @returns {FeatureCollection<point>} points representing the exploded input features
 * @throws {Error} if it encounters an unknown geometry type
 * @example
 * var polygon = turf.polygon([[[-81, 41], [-88, 36], [-84, 31], [-80, 33], [-77, 39], [-81, 41]]]);
 *
 * var explode = turf.explode(polygon);
 *
 * //addToMap
 * var addToMap = [polygon, explode]
 */
function explode(geojson) {
    var points = [];
    if (geojson.type === 'FeatureCollection') {
        meta.featureEach(geojson, function (feature) {
            meta.coordEach(feature, function (coord) {
                points.push(helpers.point(coord, feature.properties));
            });
        });
    } else {
        meta.coordEach(geojson, function (coord) {
            points.push(helpers.point(coord, geojson.properties));
        });
    }
    return helpers.featureCollection(points);
}

module.exports = explode;
module.exports.default = explode;

},{"@turf/helpers":5,"@turf/meta":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 */
var earthRadius = 6371008.8;

/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 */
var factors = {
    meters: earthRadius,
    metres: earthRadius,
    millimeters: earthRadius * 1000,
    millimetres: earthRadius * 1000,
    centimeters: earthRadius * 100,
    centimetres: earthRadius * 100,
    kilometers: earthRadius / 1000,
    kilometres: earthRadius / 1000,
    miles: earthRadius / 1609.344,
    nauticalmiles: earthRadius / 1852,
    inches: earthRadius * 39.370,
    yards: earthRadius / 1.0936,
    feet: earthRadius * 3.28084,
    radians: 1,
    degrees: earthRadius / 111325,
};

/**
 * Units of measurement factors based on 1 meter.
 */
var unitsFactors = {
    meters: 1,
    metres: 1,
    millimeters: 1000,
    millimetres: 1000,
    centimeters: 100,
    centimetres: 100,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    miles: 1 / 1609.344,
    nauticalmiles: 1 / 1852,
    inches: 39.370,
    yards: 1 / 1.0936,
    feet: 3.28084,
    radians: 1 / earthRadius,
    degrees: 1 / 111325,
};

/**
 * Area of measurement factors based on 1 square meter.
 */
var areaFactors = {
    meters: 1,
    metres: 1,
    millimeters: 1000000,
    millimetres: 1000000,
    centimeters: 10000,
    centimetres: 10000,
    kilometers: 0.000001,
    kilometres: 0.000001,
    acres: 0.000247105,
    miles: 3.86e-7,
    yards: 1.195990046,
    feet: 10.763910417,
    inches: 1550.003100006
};

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties, options) {
    // Optional Parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    var bbox = options.bbox;
    var id = options.id;

    // Validation
    if (geometry === undefined) throw new Error('geometry is required');
    if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
    if (bbox) validateBBox(bbox);
    if (id) validateId(id);

    // Main
    var feat = {type: 'Feature'};
    if (id) feat.id = id;
    if (bbox) feat.bbox = bbox;
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Geometry
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
function geometry(type, coordinates, options) {
    // Optional Parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    var bbox = options.bbox;

    // Validation
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (bbox) validateBBox(bbox);

    // Main
    var geom;
    switch (type) {
    case 'Point': geom = point(coordinates).geometry; break;
    case 'LineString': geom = lineString(coordinates).geometry; break;
    case 'Polygon': geom = polygon(coordinates).geometry; break;
    case 'MultiPoint': geom = multiPoint(coordinates).geometry; break;
    case 'MultiLineString': geom = multiLineString(coordinates).geometry; break;
    case 'MultiPolygon': geom = multiPolygon(coordinates).geometry; break;
    default: throw new Error(type + ' is invalid');
    }
    if (bbox) geom.bbox = bbox;
    return geom;
}

/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (coordinates.length < 2) throw new Error('coordinates must be at least 2 numbers long');
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) throw new Error('coordinates must contain numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties, options);
}

/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
function points(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');

    return featureCollection(coordinates.map(function (coords) {
        return point(coords, properties);
    }), options);
}

/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
function polygon(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1])) throw new Error('coordinates must contain numbers');
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties, options);
}

/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * var polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
function polygons(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');

    return featureCollection(coordinates.map(function (coords) {
        return polygon(coords, properties);
    }), options);
}

/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
function lineString(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');
    if (coordinates.length < 2) throw new Error('coordinates must be an array of two or more positions');
    // Check if first point of LineString contains two numbers
    if (!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1])) throw new Error('coordinates must contain numbers');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties, options);
}

/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<number>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
function lineStrings(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');

    return featureCollection(coordinates.map(function (coords) {
        return lineString(coords, properties);
    }), options);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
function featureCollection(features, options) {
    // Optional Parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    var bbox = options.bbox;
    var id = options.id;

    // Validation
    if (!features) throw new Error('No features passed');
    if (!Array.isArray(features)) throw new Error('features must be an Array');
    if (bbox) validateBBox(bbox);
    if (id) validateId(id);

    // Main
    var fc = {type: 'FeatureCollection'};
    if (id) fc.id = id;
    if (bbox) fc.bbox = bbox;
    fc.features = features;
    return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties, options);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties, options);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, options) {
    if (!coordinates) throw new Error('coordinates is required');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties, options);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
function geometryCollection(geometries, properties, options) {
    if (!geometries) throw new Error('geometries is required');
    if (!Array.isArray(geometries)) throw new Error('geometries must be an Array');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties, options);
}

/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (num === undefined || num === null || isNaN(num)) throw new Error('num is required');
    if (precision && !(precision >= 0)) throw new Error('precision must be a positive number');
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (radians === undefined || radians === null) throw new Error('radians is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return radians * factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name lengthToRadians
 * @param {number} distance in real units
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
function lengthToRadians(distance, units) {
    if (distance === undefined || distance === null) throw new Error('distance is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return distance / factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name lengthToDegrees
 * @param {number} distance in real units
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function lengthToDegrees(distance, units) {
    return radiansToDegrees(lengthToRadians(distance, units));
}

/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAzimuth
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAzimuth(bearing) {
    if (bearing === null || bearing === undefined) throw new Error('bearing is required');

    var angle = bearing % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    if (radians === null || radians === undefined) throw new Error('radians is required');

    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    if (degrees === null || degrees === undefined) throw new Error('degrees is required');

    var radians = degrees % 360;
    return radians * Math.PI / 180;
}

/**
 * Converts a length to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} length to be converted
 * @param {string} originalUnit of the length
 * @param {string} [finalUnit='kilometers'] returned unit
 * @returns {number} the converted length
 */
function convertLength(length, originalUnit, finalUnit) {
    if (length === null || length === undefined) throw new Error('length is required');
    if (!(length >= 0)) throw new Error('length must be a positive number');

    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit || 'kilometers');
}

/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches
 * @param {number} area to be converted
 * @param {string} [originalUnit='meters'] of the distance
 * @param {string} [finalUnit='kilometers'] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (area === null || area === undefined) throw new Error('area is required');
    if (!(area >= 0)) throw new Error('area must be a positive number');

    var startFactor = areaFactors[originalUnit || 'meters'];
    if (!startFactor) throw new Error('invalid original units');

    var finalFactor = areaFactors[finalUnit || 'kilometers'];
    if (!finalFactor) throw new Error('invalid final units');

    return (area / startFactor) * finalFactor;
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}

/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
function validateBBox(bbox) {
    if (!bbox) throw new Error('bbox is required');
    if (!Array.isArray(bbox)) throw new Error('bbox must be an Array');
    if (bbox.length !== 4 && bbox.length !== 6) throw new Error('bbox must be an Array of 4 or 6 numbers');
    bbox.forEach(function (num) {
        if (!isNumber(num)) throw new Error('bbox must only contain numbers');
    });
}

/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
function validateId(id) {
    if (!id) throw new Error('id is required');
    if (['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');
}

// Deprecated methods
function radians2degrees() {
    throw new Error('method has been renamed to `radiansToDegrees`');
}

function degrees2radians() {
    throw new Error('method has been renamed to `degreesToRadians`');
}

function distanceToDegrees() {
    throw new Error('method has been renamed to `lengthToDegrees`');
}

function distanceToRadians() {
    throw new Error('method has been renamed to `lengthToRadians`');
}

function radiansToDistance() {
    throw new Error('method has been renamed to `radiansToLength`');
}

function bearingToAngle() {
    throw new Error('method has been renamed to `bearingToAzimuth`');
}

function convertDistance() {
    throw new Error('method has been renamed to `convertLength`');
}

exports.earthRadius = earthRadius;
exports.factors = factors;
exports.unitsFactors = unitsFactors;
exports.areaFactors = areaFactors;
exports.feature = feature;
exports.geometry = geometry;
exports.point = point;
exports.points = points;
exports.polygon = polygon;
exports.polygons = polygons;
exports.lineString = lineString;
exports.lineStrings = lineStrings;
exports.featureCollection = featureCollection;
exports.multiLineString = multiLineString;
exports.multiPoint = multiPoint;
exports.multiPolygon = multiPolygon;
exports.geometryCollection = geometryCollection;
exports.round = round;
exports.radiansToLength = radiansToLength;
exports.lengthToRadians = lengthToRadians;
exports.lengthToDegrees = lengthToDegrees;
exports.bearingToAzimuth = bearingToAzimuth;
exports.radiansToDegrees = radiansToDegrees;
exports.degreesToRadians = degreesToRadians;
exports.convertLength = convertLength;
exports.convertArea = convertArea;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.validateBBox = validateBBox;
exports.validateId = validateId;
exports.radians2degrees = radians2degrees;
exports.degrees2radians = degrees2radians;
exports.distanceToDegrees = distanceToDegrees;
exports.distanceToRadians = distanceToRadians;
exports.radiansToDistance = radiansToDistance;
exports.bearingToAngle = bearingToAngle;
exports.convertDistance = convertDistance;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module helpers
 */
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 *
 * @memberof helpers
 * @type {number}
 */
exports.earthRadius = 6371008.8;
/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.factors = {
    centimeters: exports.earthRadius * 100,
    centimetres: exports.earthRadius * 100,
    degrees: exports.earthRadius / 111325,
    feet: exports.earthRadius * 3.28084,
    inches: exports.earthRadius * 39.370,
    kilometers: exports.earthRadius / 1000,
    kilometres: exports.earthRadius / 1000,
    meters: exports.earthRadius,
    metres: exports.earthRadius,
    miles: exports.earthRadius / 1609.344,
    millimeters: exports.earthRadius * 1000,
    millimetres: exports.earthRadius * 1000,
    nauticalmiles: exports.earthRadius / 1852,
    radians: 1,
    yards: exports.earthRadius / 1.0936,
};
/**
 * Units of measurement factors based on 1 meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.unitsFactors = {
    centimeters: 100,
    centimetres: 100,
    degrees: 1 / 111325,
    feet: 3.28084,
    inches: 39.370,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    meters: 1,
    metres: 1,
    miles: 1 / 1609.344,
    millimeters: 1000,
    millimetres: 1000,
    nauticalmiles: 1 / 1852,
    radians: 1 / exports.earthRadius,
    yards: 1 / 1.0936,
};
/**
 * Area of measurement factors based on 1 square meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.areaFactors = {
    acres: 0.000247105,
    centimeters: 10000,
    centimetres: 10000,
    feet: 10.763910417,
    inches: 1550.003100006,
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    miles: 3.86e-7,
    millimeters: 1000000,
    millimetres: 1000000,
    yards: 1.195990046,
};
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geom, properties, options) {
    if (options === void 0) { options = {}; }
    var feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
        feat.id = options.id;
    }
    if (options.bbox) {
        feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
}
exports.feature = feature;
/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<any>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = "Point";
 * var coordinates = [110, 50];
 * var geometry = turf.geometry(type, coordinates);
 * // => geometry
 */
function geometry(type, coordinates, options) {
    if (options === void 0) { options = {}; }
    switch (type) {
        case "Point": return point(coordinates).geometry;
        case "LineString": return lineString(coordinates).geometry;
        case "Polygon": return polygon(coordinates).geometry;
        case "MultiPoint": return multiPoint(coordinates).geometry;
        case "MultiLineString": return multiLineString(coordinates).geometry;
        case "MultiPolygon": return multiPolygon(coordinates).geometry;
        default: throw new Error(type + " is invalid");
    }
}
exports.geometry = geometry;
/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "Point",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.point = point;
/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
function points(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return point(coords, properties);
    }), options);
}
exports.points = points;
/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
function polygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
        var ring = coordinates_1[_i];
        if (ring.length < 4) {
            throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error("First and last Position are not equivalent.");
            }
        }
    }
    var geom = {
        type: "Polygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.polygon = polygon;
/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * var polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
function polygons(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return polygon(coords, properties);
    }), options);
}
exports.polygons = polygons;
/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
function lineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be an array of two or more positions");
    }
    var geom = {
        type: "LineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.lineString = lineString;
/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
function lineStrings(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return lineString(coords, properties);
    }), options);
}
exports.lineStrings = lineStrings;
/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
function featureCollection(features, options) {
    if (options === void 0) { options = {}; }
    var fc = { type: "FeatureCollection" };
    if (options.id) {
        fc.id = options.id;
    }
    if (options.bbox) {
        fc.bbox = options.bbox;
    }
    fc.features = features;
    return fc;
}
exports.featureCollection = featureCollection;
/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiLineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiLineString = multiLineString;
/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPoint",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPoint = multiPoint;
/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPolygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPolygon = multiPolygon;
/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = turf.geometry("Point", [100, 0]);
 * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
 * var collection = turf.geometryCollection([pt, line]);
 *
 * // => collection
 */
function geometryCollection(geometries, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "GeometryCollection",
        geometries: geometries,
    };
    return feature(geom, properties, options);
}
exports.geometryCollection = geometryCollection;
/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (precision === void 0) { precision = 0; }
    if (precision && !(precision >= 0)) {
        throw new Error("precision must be a positive number");
    }
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}
exports.round = round;
/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return radians * factor;
}
exports.radiansToLength = radiansToLength;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name lengthToRadians
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} radians
 */
function lengthToRadians(distance, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return distance / factor;
}
exports.lengthToRadians = lengthToRadians;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name lengthToDegrees
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function lengthToDegrees(distance, units) {
    return radiansToDegrees(lengthToRadians(distance, units));
}
exports.lengthToDegrees = lengthToDegrees;
/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAzimuth
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAzimuth(bearing) {
    var angle = bearing % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
exports.bearingToAzimuth = bearingToAzimuth;
/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}
exports.radiansToDegrees = radiansToDegrees;
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    var radians = degrees % 360;
    return radians * Math.PI / 180;
}
exports.degreesToRadians = degreesToRadians;
/**
 * Converts a length to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} length to be converted
 * @param {Units} [originalUnit="kilometers"] of the length
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted length
 */
function convertLength(length, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "kilometers"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(length >= 0)) {
        throw new Error("length must be a positive number");
    }
    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
}
exports.convertLength = convertLength;
/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches
 * @param {number} area to be converted
 * @param {Units} [originalUnit="meters"] of the distance
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "meters"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(area >= 0)) {
        throw new Error("area must be a positive number");
    }
    var startFactor = exports.areaFactors[originalUnit];
    if (!startFactor) {
        throw new Error("invalid original units");
    }
    var finalFactor = exports.areaFactors[finalUnit];
    if (!finalFactor) {
        throw new Error("invalid final units");
    }
    return (area / startFactor) * finalFactor;
}
exports.convertArea = convertArea;
/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num) && !/^\s*$/.test(num);
}
exports.isNumber = isNumber;
/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}
exports.isObject = isObject;
/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
function validateBBox(bbox) {
    if (!bbox) {
        throw new Error("bbox is required");
    }
    if (!Array.isArray(bbox)) {
        throw new Error("bbox must be an Array");
    }
    if (bbox.length !== 4 && bbox.length !== 6) {
        throw new Error("bbox must be an Array of 4 or 6 numbers");
    }
    bbox.forEach(function (num) {
        if (!isNumber(num)) {
            throw new Error("bbox must only contain numbers");
        }
    });
}
exports.validateBBox = validateBBox;
/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
function validateId(id) {
    if (!id) {
        throw new Error("id is required");
    }
    if (["string", "number"].indexOf(typeof id) === -1) {
        throw new Error("id must be a number or a string");
    }
}
exports.validateId = validateId;
// Deprecated methods
function radians2degrees() {
    throw new Error("method has been renamed to `radiansToDegrees`");
}
exports.radians2degrees = radians2degrees;
function degrees2radians() {
    throw new Error("method has been renamed to `degreesToRadians`");
}
exports.degrees2radians = degrees2radians;
function distanceToDegrees() {
    throw new Error("method has been renamed to `lengthToDegrees`");
}
exports.distanceToDegrees = distanceToDegrees;
function distanceToRadians() {
    throw new Error("method has been renamed to `lengthToRadians`");
}
exports.distanceToRadians = distanceToRadians;
function radiansToDistance() {
    throw new Error("method has been renamed to `radiansToLength`");
}
exports.radiansToDistance = radiansToDistance;
function bearingToAngle() {
    throw new Error("method has been renamed to `bearingToAzimuth`");
}
exports.bearingToAngle = bearingToAngle;
function convertDistance() {
    throw new Error("method has been renamed to `convertLength`");
}
exports.convertDistance = convertDistance;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" && coord.geometry !== null && coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) && coord.length >= 2 && !Array.isArray(coord[0]) && !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
exports.getCoord = getCoord;
/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array
 *
 * @name getCoords
 * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
 * @returns {Array<any>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coords = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(coords) {
    if (Array.isArray(coords)) {
        return coords;
    }
    // Feature
    if (coords.type === "Feature") {
        if (coords.geometry !== null) {
            return coords.geometry.coordinates;
        }
    }
    else {
        // Geometry
        if (coords.coordinates) {
            return coords.coordinates;
        }
    }
    throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
}
exports.getCoords = getCoords;
/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 && helpers_1.isNumber(coordinates[0]) && helpers_1.isNumber(coordinates[1])) {
        return true;
    }
    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error("coordinates must only contain numbers");
}
exports.containsNumber = containsNumber;
/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) {
        throw new Error("type and name required");
    }
    if (!value || value.type !== type) {
        throw new Error("Invalid input to " + name + ": must be a " + type + ", given " + value.type);
    }
}
exports.geojsonType = geojsonType;
/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) {
        throw new Error("No feature passed");
    }
    if (!name) {
        throw new Error(".featureOf() requires a name");
    }
    if (!feature || feature.type !== "Feature" || !feature.geometry) {
        throw new Error("Invalid input to " + name + ", Feature with geometry required");
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error("Invalid input to " + name + ": must be a " + type + ", given " + feature.geometry.type);
    }
}
exports.featureOf = featureOf;
/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) {
        throw new Error("No featureCollection passed");
    }
    if (!name) {
        throw new Error(".collectionOf() requires a name");
    }
    if (!featureCollection || featureCollection.type !== "FeatureCollection") {
        throw new Error("Invalid input to " + name + ", FeatureCollection required");
    }
    for (var _i = 0, _a = featureCollection.features; _i < _a.length; _i++) {
        var feature = _a[_i];
        if (!feature || feature.type !== "Feature" || !feature.geometry) {
            throw new Error("Invalid input to " + name + ", Feature with geometry required");
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error("Invalid input to " + name + ": must be a " + type + ", given " + feature.geometry.type);
        }
    }
}
exports.collectionOf = collectionOf;
/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (geojson.type === "Feature") {
        return geojson.geometry;
    }
    return geojson;
}
exports.getGeom = getGeom;
/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name="geojson"] name of the variable to display in error message
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, name) {
    if (geojson.type === "FeatureCollection") {
        return "FeatureCollection";
    }
    if (geojson.type === "GeometryCollection") {
        return "GeometryCollection";
    }
    if (geojson.type === "Feature" && geojson.geometry !== null) {
        return geojson.geometry.type;
    }
    return geojson.type;
}
exports.getType = getType;

},{"@turf/helpers":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var helpers = require('@turf/helpers');

/**
 * Callback for coordEach
 *
 * @callback coordEachCallback
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function coordEach(geojson, callback, excludeWrapCoord) {
    // Handles null Geometry -- Skips this GeoJSON
    if (geojson === null) return;
    var j, k, l, geometry, stopG, coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        coordIndex = 0,
        isGeometryCollection,
        type = geojson.type,
        isFeatureCollection = type === 'FeatureCollection',
        isFeature = type === 'Feature',
        stop = isFeatureCollection ? geojson.features.length : 1;

    // This logic may look a little weird. The reason why it is that way
    // is because it's trying to be fast. GeoJSON supports multiple kinds
    // of objects at its root: FeatureCollection, Features, Geometries.
    // This function has the responsibility of handling all of them, and that
    // means that some of the `for` loops you see below actually just don't apply
    // to certain inputs. For instance, if you give this just a
    // Point geometry, then both loops are short-circuited and all we do
    // is gradually rename the input until it's called 'geometry'.
    //
    // This also aims to allocate as few resources as possible: just a
    // few numbers and booleans, rather than any temporary arrays as would
    // be required with the normalization approach.
    for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
        geometryMaybeCollection = (isFeatureCollection ? geojson.features[featureIndex].geometry :
            (isFeature ? geojson.geometry : geojson));
        isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
            var multiFeatureIndex = 0;
            var geometryIndex = 0;
            geometry = isGeometryCollection ?
                geometryMaybeCollection.geometries[geomIndex] : geometryMaybeCollection;

            // Handles null Geometry -- Skips this geometry
            if (geometry === null) continue;
            coords = geometry.coordinates;
            var geomType = geometry.type;

            wrapShrink = (excludeWrapCoord && (geomType === 'Polygon' || geomType === 'MultiPolygon')) ? 1 : 0;

            switch (geomType) {
            case null:
                break;
            case 'Point':
                if (callback(coords, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                coordIndex++;
                multiFeatureIndex++;
                break;
            case 'LineString':
            case 'MultiPoint':
                for (j = 0; j < coords.length; j++) {
                    if (callback(coords[j], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                    coordIndex++;
                    if (geomType === 'MultiPoint') multiFeatureIndex++;
                }
                if (geomType === 'LineString') multiFeatureIndex++;
                break;
            case 'Polygon':
            case 'MultiLineString':
                for (j = 0; j < coords.length; j++) {
                    for (k = 0; k < coords[j].length - wrapShrink; k++) {
                        if (callback(coords[j][k], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                        coordIndex++;
                    }
                    if (geomType === 'MultiLineString') multiFeatureIndex++;
                    if (geomType === 'Polygon') geometryIndex++;
                }
                if (geomType === 'Polygon') multiFeatureIndex++;
                break;
            case 'MultiPolygon':
                for (j = 0; j < coords.length; j++) {
                    if (geomType === 'MultiPolygon') geometryIndex = 0;
                    for (k = 0; k < coords[j].length; k++) {
                        for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                            if (callback(coords[j][k][l], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                            coordIndex++;
                        }
                        geometryIndex++;
                    }
                    multiFeatureIndex++;
                }
                break;
            case 'GeometryCollection':
                for (j = 0; j < geometry.geometries.length; j++)
                    if (coordEach(geometry.geometries[j], callback, excludeWrapCoord) === false) return false;
                break;
            default:
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentCoord;
 * });
 */
function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
    var previousValue = initialValue;
    coordEach(geojson, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
        if (coordIndex === 0 && initialValue === undefined) previousValue = currentCoord;
        else previousValue = callback(previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex);
    }, excludeWrapCoord);
    return previousValue;
}

/**
 * Callback for propEach
 *
 * @callback propEachCallback
 * @param {Object} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propEach(features, function (currentProperties, featureIndex) {
 *   //=currentProperties
 *   //=featureIndex
 * });
 */
function propEach(geojson, callback) {
    var i;
    switch (geojson.type) {
    case 'FeatureCollection':
        for (i = 0; i < geojson.features.length; i++) {
            if (callback(geojson.features[i].properties, i) === false) break;
        }
        break;
    case 'Feature':
        callback(geojson.properties, 0);
        break;
    }
}


/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=featureIndex
 *   return currentProperties
 * });
 */
function propReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    propEach(geojson, function (currentProperties, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentProperties;
        else previousValue = callback(previousValue, currentProperties, featureIndex);
    });
    return previousValue;
}

/**
 * Callback for featureEach
 *
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.featureEach(features, function (currentFeature, featureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 * });
 */
function featureEach(geojson, callback) {
    if (geojson.type === 'Feature') {
        callback(geojson, 0);
    } else if (geojson.type === 'FeatureCollection') {
        for (var i = 0; i < geojson.features.length; i++) {
            if (callback(geojson.features[i], i) === false) break;
        }
    }
}

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   return currentFeature
 * });
 */
function featureReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    featureEach(geojson, function (currentFeature, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex);
    });
    return previousValue;
}

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * var coords = turf.coordAll(features);
 * //= [[26, 37], [36, 53]]
 */
function coordAll(geojson) {
    var coords = [];
    coordEach(geojson, function (coord) {
        coords.push(coord);
    });
    return coords;
}

/**
 * Callback for geomEach
 *
 * @callback geomEachCallback
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 * });
 */
function geomEach(geojson, callback) {
    var i, j, g, geometry, stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        featureProperties,
        featureBBox,
        featureId,
        featureIndex = 0,
        isFeatureCollection = geojson.type === 'FeatureCollection',
        isFeature = geojson.type === 'Feature',
        stop = isFeatureCollection ? geojson.features.length : 1;

    // This logic may look a little weird. The reason why it is that way
    // is because it's trying to be fast. GeoJSON supports multiple kinds
    // of objects at its root: FeatureCollection, Features, Geometries.
    // This function has the responsibility of handling all of them, and that
    // means that some of the `for` loops you see below actually just don't apply
    // to certain inputs. For instance, if you give this just a
    // Point geometry, then both loops are short-circuited and all we do
    // is gradually rename the input until it's called 'geometry'.
    //
    // This also aims to allocate as few resources as possible: just a
    // few numbers and booleans, rather than any temporary arrays as would
    // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? geojson.features[i].geometry :
            (isFeature ? geojson.geometry : geojson));
        featureProperties = (isFeatureCollection ? geojson.features[i].properties :
            (isFeature ? geojson.properties : {}));
        featureBBox = (isFeatureCollection ? geojson.features[i].bbox :
            (isFeature ? geojson.bbox : undefined));
        featureId = (isFeatureCollection ? geojson.features[i].id :
            (isFeature ? geojson.id : undefined));
        isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
                geometryMaybeCollection.geometries[g] : geometryMaybeCollection;

            // Handle null Geometry
            if (geometry === null) {
                if (callback(null, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                continue;
            }
            switch (geometry.type) {
            case 'Point':
            case 'LineString':
            case 'MultiPoint':
            case 'Polygon':
            case 'MultiLineString':
            case 'MultiPolygon': {
                if (callback(geometry, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                break;
            }
            case 'GeometryCollection': {
                for (j = 0; j < geometry.geometries.length; j++) {
                    if (callback(geometry.geometries[j], featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                }
                break;
            }
            default:
                throw new Error('Unknown Geometry Type');
            }
        }
        // Only increase `featureIndex` per each feature
        featureIndex++;
    }
}

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 *   return currentGeometry
 * });
 */
function geomReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    geomEach(geojson, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentGeometry;
        else previousValue = callback(previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId);
    });
    return previousValue;
}

/**
 * Callback for flattenEach
 *
 * @callback flattenEachCallback
 * @param {Feature} currentFeature The current flattened feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Iterate over flattened features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name flattenEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 * });
 */
function flattenEach(geojson, callback) {
    geomEach(geojson, function (geometry, featureIndex, properties, bbox, id) {
        // Callback for single geometry
        var type = (geometry === null) ? null : geometry.type;
        switch (type) {
        case null:
        case 'Point':
        case 'LineString':
        case 'Polygon':
            if (callback(helpers.feature(geometry, properties, {bbox: bbox, id: id}), featureIndex, 0) === false) return false;
            return;
        }

        var geomType;

        // Callback for multi-geometry
        switch (type) {
        case 'MultiPoint':
            geomType = 'Point';
            break;
        case 'MultiLineString':
            geomType = 'LineString';
            break;
        case 'MultiPolygon':
            geomType = 'Polygon';
            break;
        }

        for (var multiFeatureIndex = 0; multiFeatureIndex < geometry.coordinates.length; multiFeatureIndex++) {
            var coordinate = geometry.coordinates[multiFeatureIndex];
            var geom = {
                type: geomType,
                coordinates: coordinate
            };
            if (callback(helpers.feature(geom, properties), featureIndex, multiFeatureIndex) === false) return false;
        }
    });
}

/**
 * Callback for flattenReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback flattenReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
 *
 * @name flattenReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, multiFeatureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, multiFeatureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   return currentFeature
 * });
 */
function flattenReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    flattenEach(geojson, function (currentFeature, featureIndex, multiFeatureIndex) {
        if (featureIndex === 0 && multiFeatureIndex === 0 && initialValue === undefined) previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex, multiFeatureIndex);
    });
    return previousValue;
}

/**
 * Callback for segmentEach
 *
 * @callback segmentEachCallback
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 * @returns {void}
 */

/**
 * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex)
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentEach(polygon, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //=currentSegment
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   //=segmentIndex
 * });
 *
 * // Calculate the total number of segments
 * var total = 0;
 * turf.segmentEach(polygon, function () {
 *     total++;
 * });
 */
function segmentEach(geojson, callback) {
    flattenEach(geojson, function (feature$$1, featureIndex, multiFeatureIndex) {
        var segmentIndex = 0;

        // Exclude null Geometries
        if (!feature$$1.geometry) return;
        // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
        var type = feature$$1.geometry.type;
        if (type === 'Point' || type === 'MultiPoint') return;

        // Generate 2-vertex line segments
        var previousCoords;
        if (coordEach(feature$$1, function (currentCoord, coordIndex, featureIndexCoord, mutliPartIndexCoord, geometryIndex) {
            // Simulating a meta.coordReduce() since `reduce` operations cannot be stopped by returning `false`
            if (previousCoords === undefined) {
                previousCoords = currentCoord;
                return;
            }
            var currentSegment = helpers.lineString([previousCoords, currentCoord], feature$$1.properties);
            if (callback(currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) === false) return false;
            segmentIndex++;
            previousCoords = currentCoord;
        }) === false) return false;
    });
}

/**
 * Callback for segmentReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback segmentReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 */

/**
 * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //= previousSegment
 *   //= currentSegment
 *   //= featureIndex
 *   //= multiFeatureIndex
 *   //= geometryIndex
 *   //= segmentInex
 *   return currentSegment
 * });
 *
 * // Calculate the total number of segments
 * var initialValue = 0
 * var total = turf.segmentReduce(polygon, function (previousValue) {
 *     previousValue++;
 *     return previousValue;
 * }, initialValue);
 */
function segmentReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    var started = false;
    segmentEach(geojson, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
        if (started === false && initialValue === undefined) previousValue = currentSegment;
        else previousValue = callback(previousValue, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex);
        started = true;
    });
    return previousValue;
}

/**
 * Callback for lineEach
 *
 * @callback lineEachCallback
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
 * similar to Array.forEach.
 *
 * @name lineEach
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @example
 * var multiLine = turf.multiLineString([
 *   [[26, 37], [35, 45]],
 *   [[36, 53], [38, 50], [41, 55]]
 * ]);
 *
 * turf.lineEach(multiLine, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function lineEach(geojson, callback) {
    // validation
    if (!geojson) throw new Error('geojson is required');

    flattenEach(geojson, function (feature$$1, featureIndex, multiFeatureIndex) {
        if (feature$$1.geometry === null) return;
        var type = feature$$1.geometry.type;
        var coords = feature$$1.geometry.coordinates;
        switch (type) {
        case 'LineString':
            if (callback(feature$$1, featureIndex, multiFeatureIndex, 0, 0) === false) return false;
            break;
        case 'Polygon':
            for (var geometryIndex = 0; geometryIndex < coords.length; geometryIndex++) {
                if (callback(helpers.lineString(coords[geometryIndex], feature$$1.properties), featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
            }
            break;
        }
    });
}

/**
 * Callback for lineReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback lineReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name lineReduce
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var multiPoly = turf.multiPolygon([
 *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
 *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
 * ]);
 *
 * turf.lineReduce(multiPoly, function (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentLine
 * });
 */
function lineReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    lineEach(geojson, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentLine;
        else previousValue = callback(previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex);
    });
    return previousValue;
}

/**
 * Finds a particular 2-vertex LineString Segment from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 * Point & MultiPoint will always return null.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.segmentIndex=0] Segment Index
 * @param {Object} [options.properties={}] Translate Properties to output LineString
 * @param {BBox} [options.bbox={}] Translate BBox to output LineString
 * @param {number|string} [options.id={}] Translate Id to output LineString
 * @returns {Feature<LineString>} 2-vertex GeoJSON Feature LineString
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findSegment(multiLine);
 * // => Feature<LineString<[[10, 10], [50, 30]]>>
 *
 * // First Segment of 2nd Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: 1});
 * // => Feature<LineString<[[-10, -10], [-50, -30]]>>
 *
 * // Last Segment of Last Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: -1, segmentIndex: -1});
 * // => Feature<LineString<[[-50, -30], [-30, -40]]>>
 */
function findSegment(geojson, options) {
    // Optional Parameters
    options = options || {};
    if (!helpers.isObject(options)) throw new Error('options is invalid');
    var featureIndex = options.featureIndex || 0;
    var multiFeatureIndex = options.multiFeatureIndex || 0;
    var geometryIndex = options.geometryIndex || 0;
    var segmentIndex = options.segmentIndex || 0;

    // Find FeatureIndex
    var properties = options.properties;
    var geometry;

    switch (geojson.type) {
    case 'FeatureCollection':
        if (featureIndex < 0) featureIndex = geojson.features.length + featureIndex;
        properties = properties || geojson.features[featureIndex].properties;
        geometry = geojson.features[featureIndex].geometry;
        break;
    case 'Feature':
        properties = properties || geojson.properties;
        geometry = geojson.geometry;
        break;
    case 'Point':
    case 'MultiPoint':
        return null;
    case 'LineString':
    case 'Polygon':
    case 'MultiLineString':
    case 'MultiPolygon':
        geometry = geojson;
        break;
    default:
        throw new Error('geojson is invalid');
    }

    // Find SegmentIndex
    if (geometry === null) return null;
    var coords = geometry.coordinates;
    switch (geometry.type) {
    case 'Point':
    case 'MultiPoint':
        return null;
    case 'LineString':
        if (segmentIndex < 0) segmentIndex = coords.length + segmentIndex - 1;
        return helpers.lineString([coords[segmentIndex], coords[segmentIndex + 1]], properties, options);
    case 'Polygon':
        if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
        if (segmentIndex < 0) segmentIndex = coords[geometryIndex].length + segmentIndex - 1;
        return helpers.lineString([coords[geometryIndex][segmentIndex], coords[geometryIndex][segmentIndex + 1]], properties, options);
    case 'MultiLineString':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (segmentIndex < 0) segmentIndex = coords[multiFeatureIndex].length + segmentIndex - 1;
        return helpers.lineString([coords[multiFeatureIndex][segmentIndex], coords[multiFeatureIndex][segmentIndex + 1]], properties, options);
    case 'MultiPolygon':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (geometryIndex < 0) geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
        if (segmentIndex < 0) segmentIndex = coords[multiFeatureIndex][geometryIndex].length - segmentIndex - 1;
        return helpers.lineString([coords[multiFeatureIndex][geometryIndex][segmentIndex], coords[multiFeatureIndex][geometryIndex][segmentIndex + 1]], properties, options);
    }
    throw new Error('geojson is invalid');
}

/**
 * Finds a particular Point from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.coordIndex=0] Coord Index
 * @param {Object} [options.properties={}] Translate Properties to output Point
 * @param {BBox} [options.bbox={}] Translate BBox to output Point
 * @param {number|string} [options.id={}] Translate Id to output Point
 * @returns {Feature<Point>} 2-vertex GeoJSON Feature Point
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findPoint(multiLine);
 * // => Feature<Point<[10, 10]>>
 *
 * // First Segment of the 2nd Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: 1});
 * // => Feature<Point<[-10, -10]>>
 *
 * // Last Segment of last Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: -1, coordIndex: -1});
 * // => Feature<Point<[-30, -40]>>
 */
function findPoint(geojson, options) {
    // Optional Parameters
    options = options || {};
    if (!helpers.isObject(options)) throw new Error('options is invalid');
    var featureIndex = options.featureIndex || 0;
    var multiFeatureIndex = options.multiFeatureIndex || 0;
    var geometryIndex = options.geometryIndex || 0;
    var coordIndex = options.coordIndex || 0;

    // Find FeatureIndex
    var properties = options.properties;
    var geometry;

    switch (geojson.type) {
    case 'FeatureCollection':
        if (featureIndex < 0) featureIndex = geojson.features.length + featureIndex;
        properties = properties || geojson.features[featureIndex].properties;
        geometry = geojson.features[featureIndex].geometry;
        break;
    case 'Feature':
        properties = properties || geojson.properties;
        geometry = geojson.geometry;
        break;
    case 'Point':
    case 'MultiPoint':
        return null;
    case 'LineString':
    case 'Polygon':
    case 'MultiLineString':
    case 'MultiPolygon':
        geometry = geojson;
        break;
    default:
        throw new Error('geojson is invalid');
    }

    // Find Coord Index
    if (geometry === null) return null;
    var coords = geometry.coordinates;
    switch (geometry.type) {
    case 'Point':
        return helpers.point(coords, properties, options);
    case 'MultiPoint':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        return helpers.point(coords[multiFeatureIndex], properties, options);
    case 'LineString':
        if (coordIndex < 0) coordIndex = coords.length + coordIndex;
        return helpers.point(coords[coordIndex], properties, options);
    case 'Polygon':
        if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
        if (coordIndex < 0) coordIndex = coords[geometryIndex].length + coordIndex;
        return helpers.point(coords[geometryIndex][coordIndex], properties, options);
    case 'MultiLineString':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (coordIndex < 0) coordIndex = coords[multiFeatureIndex].length + coordIndex;
        return helpers.point(coords[multiFeatureIndex][coordIndex], properties, options);
    case 'MultiPolygon':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (geometryIndex < 0) geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
        if (coordIndex < 0) coordIndex = coords[multiFeatureIndex][geometryIndex].length - coordIndex;
        return helpers.point(coords[multiFeatureIndex][geometryIndex][coordIndex], properties, options);
    }
    throw new Error('geojson is invalid');
}

exports.coordEach = coordEach;
exports.coordReduce = coordReduce;
exports.propEach = propEach;
exports.propReduce = propReduce;
exports.featureEach = featureEach;
exports.featureReduce = featureReduce;
exports.coordAll = coordAll;
exports.geomEach = geomEach;
exports.geomReduce = geomReduce;
exports.flattenEach = flattenEach;
exports.flattenReduce = flattenReduce;
exports.segmentEach = segmentEach;
exports.segmentReduce = segmentReduce;
exports.lineEach = lineEach;
exports.lineReduce = lineReduce;
exports.findSegment = findSegment;
exports.findPoint = findPoint;

},{"@turf/helpers":9}],9:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],10:[function(require,module,exports){

class BoundingBox {

    constructor(w, s, e, n) {
        this.bottomLeft= {};
        this.topRight = {};
        this.bottomLeft.x = w;
        this.bottomLeft.y = s;
        this.topRight.x = e;
        this.topRight.y = n;
    }

    contains(p) {
        try {
        return p[0] > this.bottomLeft.x && p[0] < this.topRight.x && p[1] > this.bottomLeft.y && p[1] < this.topRight.y;
        } catch(e) { console.log(e); }
    }
    
    toString() {
        return `${this.bottomLeft.x} ${this.bottomLeft.y} ${this.topRight.x} ${this.topRight.y}`;
    }
}

module.exports = BoundingBox;


},{}],11:[function(require,module,exports){
// Direct conversion of freemaplib's DEM class to JavaScript.

class DEM  {
    constructor(vertices, bottomLeft, ptWidth, ptHeight, xSpacing, ySpacing) {
        
        this.bottomLeft=bottomLeft;
        this.ptWidth = ptWidth;
        this.ptHeight = ptHeight;
        this.vertices = vertices;
        this.xSpacing = xSpacing;
        this.ySpacing = ySpacing;
    }
    
    
        
    // Uses bilinear interpolation
    // Based on Footnav code
    // x,y must be in projection of the geometry with scaling factor 
    // already applied
    getHeight(x, y) {
        let p = [x,y];
        let xIdx = Math.floor((p[0]-this.bottomLeft[0]) / this.xSpacing),
            yIdx = this.ptHeight-(Math.ceil((p[1] - this.bottomLeft[1]) / this.ySpacing));
        
        let x1,x2,y1,y2;
        let h1,h2,h3,h4;
        
        let h = -1;

        // 021114 change this so that points outside the DEM are given a height based on closest edge/corner
        // idea being to reduce artefacts at the edges of tiles
        // this means that a -1 return cannot now be used to detect whether a point is in the DEM or not
        // (hopefully this is NOT being done anywhere!)
        // 200215 turning this off again due to iffy results
        
        if(xIdx>=0 && yIdx>=0 && xIdx<this.ptWidth-1 && yIdx<this.ptHeight-1) {
            h1 = this.vertices[(3*(yIdx*this.ptWidth+xIdx))+1];
            h2 = this.vertices[(3*(yIdx*this.ptWidth+xIdx+1))+1];
            h3 = this.vertices[(3*(yIdx*this.ptWidth+xIdx+this.ptWidth))+1];
            h4 = this.vertices[(3*(yIdx*this.ptWidth+xIdx+this.ptWidth+1))+1];
            
            x1 = this.bottomLeft[0] + xIdx*this.xSpacing;
            x2 = x1 + this.xSpacing;
            
            // 041114 I think this was wrong change from this.ptHeight-yIdx to this.ptHeight-1-yIdx
            y1 = this.bottomLeft[1] + (this.ptHeight-1-yIdx)*this.ySpacing;
            y2 = y1 - this.ySpacing;
            
//            console.log("x,y bounds " + x1 + " " + y1+ " " +x2 + " " +y2);
 //           console.log("vertices " + h1 + " " + h2+ " " +h3 + " " +h4);
            
            let propX = (p[0]-x1)/this.xSpacing;
            
            let htop = h1*(1-propX) + h2*propX,
                hbottom = h3*(1-propX) + h4*propX;
            
            let propY = (p[1]-y2)/this.ySpacing;
            
            h = hbottom*(1-propY) + htop*propY;
            
            //console.log("*******************************height is: " + h);
            
        } 
        return h;
    }
}

module.exports = DEM;


},{}],12:[function(require,module,exports){

function Dialog(parentId,callbacks,style)
{
    this.callbacks = callbacks;
    this.style = style;
    this.parent=parentId ? (document.getElementById(parentId) || document.body):
        document.body;
    Dialog.prototype.count = (Dialog.prototype.count) ?
        Dialog.prototype.count+1 : 1;
    this.id = '_dlg' + Dialog.prototype.count;
    this.div = document.createElement("div");
    this.div.id = '_dlg' + Dialog.prototype.count;
    this.div.style.zIndex = 999;
    this.div.setAttribute("class","fmap_dlg");
    this.actionsContainer = document.createElement("div");
    this.actionsContainer.style.textAlign = 'center';
	if(this.callbacks)
	{
		for(k in this.callbacks)
		{
			if(k!="create") 
			{
        		var btn = document.createElement("input");
        		btn.value=k;
        		btn.type="button";
        		btn.id = this.div.id + "_"+k;
        		btn.addEventListener("click", this.callbacks[k]);
        		this.actionsContainer.appendChild(btn);
			}
		}
    }
    if(style)
        for(var s in style)
            this.div.style[s] = style[s];
}

Dialog.prototype.setContent = function(content)
{
    this.div.innerHTML = content;
    this.div.appendChild(this.actionsContainer);
}

Dialog.prototype.setDOMContent = function(domElement)
{
    while(this.div.childNodes.length > 0)
        this.div.removeChild(this.div.firstChild);
    this.div.appendChild(domElement);
    this.div.appendChild(this.actionsContainer);
}

Dialog.prototype.show = function()
{
    this.parent.appendChild(this.div);
    this.div.style.visibility = 'visible';
}

Dialog.prototype.hide = function()
{
    this.div.style.visibility = 'hidden';
    this.parent.removeChild(this.div);
}

Dialog.prototype.isVisible = function()
{
    return this.div.style.visibility=='visible';
}

Dialog.prototype.setPosition = function(x,y)
{
	this.div.style.position ="absolute";
    this.div.style.left=x;
    this.div.style.top=y;
}

Dialog.prototype.setSize = function(w,h)
{
    this.div.style.width=w;
    this.div.style.height=h;
}

Dialog.prototype.setCallback = function(btn, cb) 
{
	this.callbacks[btn] = cb;
}

module.exports = Dialog;

},{}],13:[function(require,module,exports){


const Tile = require('./Tile');


class GoogleProjection  {
    
   
    constructor() {
        this.EARTH = 40075016.68; 
        this.HALF_EARTH = 20037508.34;
    } 

    project (lon, lat) {
        return [this.lonToGoogle(lon), this.latToGoogle(lat)];
    }
    
    unproject (projected) {
        return [this.googleToLon(projected[0]),this.googleToLat(projected[1])];
    }
    
    lonToGoogle( lon) {
        return (lon/180) * this.HALF_EARTH;
    }
    
    latToGoogle(lat) {
        var y = Math.log(Math.tan((90+lat)*Math.PI/360)) / (Math.PI/180);
        return y*this.HALF_EARTH/180.0;
    }
    
    googleToLon(x) {
            return (x/this.HALF_EARTH) * 180.0;
    }
    
    googleToLat(y) {
        var lat = (y/this.HALF_EARTH) * 180.0;
        lat = 180/Math.PI * (2*Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2);
        return lat;
    }
    
    getTile (p, z) {
        //console.log(`getTile(): ${p[0]} ${p[1]}`);
        var tile = new Tile(-1, -1, z);
        var metresInTile = tile.getMetresInTile(); 
        //console.log(metresInTile);
        tile.x = Math.floor((this.HALF_EARTH+p[0]) / metresInTile);
        tile.y = Math.floor((this.HALF_EARTH-p[1]) / metresInTile);
        return tile;
    }
    
    getTileFromLonLat(lon, lat, z) {
        //console.log(`getTileFromLonLat(): ${lon} ${lat} ${z}`);
        return this.getTile([this.lonToGoogle(lon),this.latToGoogle(lat)], z);
    }

    getID() {
        return "epsg:3857";
    }
}

module.exports = GoogleProjection;

},{"./Tile":16}],14:[function(require,module,exports){
const Tiler = require('./Tiler');

class JsonTiler extends Tiler {
    constructor(url) {
        super(url);
    }

    async readTile(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
}

module.exports = JsonTiler;

},{"./Tiler":17}],15:[function(require,module,exports){
const Dialog = require('./Dialog');

function Nominatim(options) {
          const searchDlg = new Dialog(options.parent||document.body,
                     {'OK': ()=> { searchDlg.hide(); }},
                    { top: '100px', left: '100px', width: '200px',
                     position: 'absolute',
                        fontSize: '80%',
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid black'});
        document.getElementById(options.searchBtn||'searchBtn').addEventListener('click', e=> {
            const q = document.getElementById(options.searchField||'q').value;
            fetch(options.url.replace('{q}', q)).then(response=>response.json()).then(json=> {
                const nodes = json.filter(o => o.lat !== undefined && o.lon !== undefined);
                if(nodes.length==0) {
                    alert(`No results for '${q}'`);
                } else {
                    searchDlg.show();
                    const div = document.createElement("div");
                    const h2=document.createElement("h2");
                    h2.appendChild(document.createTextNode("Search results"));
                    div.appendChild(h2);
                    nodes.forEach(o=> {
                        const p = document.createElement("p");
                        const a = document.createElement("a");
                        a.href='#';
                        a.innerHTML = o.display_name;
                        a.addEventListener("click", e=> {
                            if(options.onPlaceSelected) {
                                options.onPlaceSelected(o.lon, o.lat);
                            }
                            searchDlg.hide();
                        });
                        p.appendChild(a);
                        div.appendChild(p);
                    } );
                    searchDlg.setDOMContent(div);
                }
            } )
        } );
}

module.exports = Nominatim;

},{"./Dialog":12}],16:[function(require,module,exports){

class Tile {
        
    constructor(x, y, z) {
        this.x=x; this.y=y; this.z=z;
        this.EARTH = 40075016.68; 
        this.HALF_EARTH = 20037508.34;
    }

     getMetresInTile() {
        return this.EARTH/Math.pow(2,this.z);
     }

     getBottomLeft() {
        var metresInTile = this.getMetresInTile();
        return [this.x*metresInTile - this.HALF_EARTH, this.HALF_EARTH - (this.y+1)*metresInTile];    
     }

     getTopRight() {
        var p = this.getBottomLeft();
        var metresInTile = this.getMetresInTile();
        p[0] += metresInTile;
        p[1] += metresInTile;
        return p;    
     }
}

module.exports = Tile;

},{}],17:[function(require,module,exports){
const GoogleProjection = require('./GoogleProjection');
const Tile = require('./Tile');

class Tiler {
    constructor(url) {
        this.tile = new Tile(0, 0, 13); 
        this.tilesLoaded = [];
        this.url = url;
        this.sphMerc = new GoogleProjection();
    }

    setZoom(z) {
        this.tile.z = z;
    }

    lonLatToSphMerc(lon, lat) {
        return this.sphMerc.project(lon, lat);
    }

    getTile(sphMercPos, z) {
        return this.sphMerc.getTile(sphMercPos, z);
    }

    async update(pos) {
        const loadedData = [];
        let t;
        if( t = this.needNewData(pos)) {
            const tilesX = [t.x, t.x-1, t.x+1], tilesY = [t.y, t.y-1, t.y+1];
            for(let ix=0; ix<tilesX.length; ix++) {    
                for(let iy=0; iy<tilesY.length; iy++) {    
                    const thisTile = new Tile(tilesX[ix], tilesY[iy], t.z);
                    const data = await this.loadTile(thisTile);
                    if(data !== null) {
                        loadedData.push({ data: data, tile: thisTile });
                    }
                }
            }
        }
        return loadedData;
    }

    needNewData(pos) {
        if(this.tile) {
            const newTile = this.sphMerc.getTile(pos, this.tile.z);
            const needUpdate = newTile.x != this.tile.x || newTile.y != this.tile.y;
            this.tile = newTile;    
            return needUpdate ? newTile : false;
        }
        return false;
    }

    async loadTile(tile) {
        const tileIndex = `${tile.z}/${tile.x}/${tile.y}`;    
        if(this.tilesLoaded.indexOf(tileIndex) == -1) {
            const tData = await this.readTile(this.url
                .replace("{x}", tile.x)
                .replace("{y}", tile.y)
                .replace("{z}", tile.z)
            );
            this.tilesLoaded.push(tileIndex);
            return tData;
        }
        return null;
    }

    async readTile(url) {
        return null;
    }

    projectLonLat(lon, lat) {
        return this.sphMerc.project(lon,lat);
    }
}

module.exports = Tiler;

},{"./GoogleProjection":13,"./Tile":16}],18:[function(require,module,exports){
const GoogleProjection = require('./GoogleProjection');
const Tiler = require('./Tiler');
const Tile = require('./Tile'); 
const BoundingBox = require('./BoundingBox');
const Dialog = require('./Dialog');
const Nominatim = require('./Nominatim');
const JsonTiler = require('./JsonTiler');
const DEM = require('./DEM');

module.exports = {
    GoogleProjection: GoogleProjection,
    Tiler: Tiler,
    Tile: Tile,
    JsonTiler: JsonTiler,
    DEM: DEM,
    BoundingBox: BoundingBox,
    Dialog: Dialog,
    Nominatim: Nominatim,
    getBoundingBox : function(coords) {
        var bbox = new BoundingBox(181, 91, -181, -91);
        coords.forEach( p1 => {
            var p = [p1[0], p1[1]];
            if(p[0] < bbox.bottomLeft.x) {
                bbox.bottomLeft.x = p[0];
            }
            if(p[1] < bbox.bottomLeft.y) {
                bbox.bottomLeft.y = p[1];
            }
            if(p[0] > bbox.topRight.x) {
                bbox.topRight.x = p[0];
            }
            if(p[1] > bbox.topRight.y) {
                bbox.topRight.y = p[1];
            }
        });
        return bbox;
    },

    dist: function(x1,y1,x2,y2) {
        var dx = x2-x1, dy = y2-y1;
        return Math.sqrt(dx*dx + dy*dy);
    },

    // from old osmeditor2 code - comments as follows:     
    // find the distance from a point to a line     
    // based on theory at:     
    // astronomy.swin.edu.au/~pbourke/geometry/pointline/     
    // given equation was proven starting with dot product     

    // Now returns an object containing the distance, the intersection point 
    //and the proportion, in case we need these

    haversineDistToLine: function (x, y, p1, p2)  {         
        var u = ((x-p1[0])*(p2[0]-p1[0])+(y-p1[1])*(p2[1]-p1[1])) / (Math.pow(p2[0]-p1[0],2)+Math.pow(p2[1]-p1[1],2));        
 
        var xintersection = p1[0]+u*(p2[0]-p1[0]), yintersection=p1[1]+u*(p2[1]-p1[1]);   
        return (u>=0&&u<=1) ? {distance: this.haversineDist(x,y,xintersection,yintersection), intersection: [xintersection, yintersection], proportion:u} : null;
    },     

    haversineDist: function  (lon1, lat1, lon2, lat2)    {            
        var R = 6371000;            
        var dlon=(lon2-lon1)*(Math.PI / 180);            
        var dlat=(lat2-lat1)*(Math.PI / 180);            
        var slat=Math.sin(dlat/2);            
        var slon=Math.sin(dlon/2);            
        var a = slat*slat + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*slon*slon;            
        var c = 2 *Math.asin(Math.min(1,Math.sqrt(a)));            
        return R*c;        
    }
};

},{"./BoundingBox":10,"./DEM":11,"./Dialog":12,"./GoogleProjection":13,"./JsonTiler":14,"./Nominatim":15,"./Tile":16,"./Tiler":17}],19:[function(require,module,exports){
const turfDistance = require('@turf/distance').default;
const turfPoint = require('turf-point');

class JunctionManager {

    constructor(pathFinder) {
        this.pathFinder = pathFinder;
    }

    findNearestJunction(p) {
        const graph = this.pathFinder.serialize();
        const vertex = [ null, Number.MAX_VALUE ];
        let nEdges;

        const junctions = Object.keys(graph.vertices).filter ( k => {
            nEdges = Object.keys(graph.vertices[k]).length;
            return nEdges >= 3 || nEdges == 1;
        });

        junctions.forEach(k => {
            const dist = turfDistance(turfPoint(p), turfPoint(graph.sourceVertices[k]));
            if(dist < vertex[1]) {
                vertex[1] = dist;
                vertex[0] = graph.sourceVertices[k].slice(0);
            }
        });
        return vertex;
    }

    snapToJunction(p, distThreshold) {
        const p2 =  p.slice(0);
        const junction = this.findNearestJunction(p);
        if(junction[1] < distThreshold) {
            p2[0] = junction[0][0];
            p2[1] = junction[0][1];
        }
        return p2;
    }
}

module.exports = JunctionManager;

},{"@turf/distance":3,"turf-point":30}],20:[function(require,module,exports){
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

},{"./JunctionManager":19,"./geojson-path-finder":23,"@turf/bearing":2,"jsfreemaplib":18,"turf-point":30}],21:[function(require,module,exports){
'use strict';

module.exports = {
    compactNode: compactNode,
    compactGraph: compactGraph
};

function findNextEnd(prev, v, vertices, ends, vertexCoords, edgeData, trackIncoming, options) {
    var weight = vertices[prev][v],
        reverseWeight = vertices[v][prev],
        coordinates = [],
        path = [],
        reducedEdge = options.edgeDataSeed;
        
    if (options.edgeDataReduceFn) {
        reducedEdge = options.edgeDataReduceFn(reducedEdge, edgeData[v][prev]);
    }

    while (!ends[v]) {
        var edges = vertices[v];

        if (!edges) { break; }

        var next = Object.keys(edges).filter(function notPrevious(k) { return k !== prev; })[0];
        weight += edges[next];

        if (trackIncoming) {
            reverseWeight += vertices[next][v];

            if (path.indexOf(v) >= 0) {
                ends[v] = vertices[v];
                break;
            }
            path.push(v);
        }

        if (options.edgeDataReduceFn) {
            reducedEdge = options.edgeDataReduceFn(reducedEdge, edgeData[v][next]);
        }

        coordinates.push(vertexCoords[v]);
        prev = v;
        v = next;
    }

    return {
        vertex: v,
        weight: weight,
        reverseWeight: reverseWeight,
        coordinates: coordinates,
        reducedEdge: reducedEdge
    };
}

function compactNode(k, vertices, ends, vertexCoords, edgeData, trackIncoming, options) {
    options = options || {};
    var neighbors = vertices[k];
    return Object.keys(neighbors).reduce(function compactEdge(result, j) {
        var neighbor = findNextEnd(k, j, vertices, ends, vertexCoords, edgeData, trackIncoming, options);
        var weight = neighbor.weight;
        var reverseWeight = neighbor.reverseWeight;
        if (neighbor.vertex !== k) {
            if (!result.edges[neighbor.vertex] || result.edges[neighbor.vertex] > weight) {
                result.edges[neighbor.vertex] = weight;
                result.coordinates[neighbor.vertex] = [vertexCoords[k]].concat(neighbor.coordinates);
                result.reducedEdges[neighbor.vertex] = neighbor.reducedEdge;
            }
            if (trackIncoming && 
                !isNaN(reverseWeight) && (!result.incomingEdges[neighbor.vertex] || result.incomingEdges[neighbor.vertex] > reverseWeight)) {
                result.incomingEdges[neighbor.vertex] = reverseWeight;
                var coordinates = [vertexCoords[k]].concat(neighbor.coordinates);
                coordinates.reverse();
                result.incomingCoordinates[neighbor.vertex] = coordinates;
            }
        }
        return result;
    }, {edges: {}, incomingEdges: {}, coordinates: {}, incomingCoordinates: {}, reducedEdges: {}});
}

function compactGraph(vertices, vertexCoords, edgeData, options) {
    options = options || {};
    var progress = options.progress;
    var ends = Object.keys(vertices).reduce(function findEnds(es, k, i, vs) {
        var vertex = vertices[k];
        var edges = Object.keys(vertex);
		// A vertex has edges (defined as the remote vertex key) as keys and edge lengths as values
        var numberEdges = edges.length;
        var remove;

		options.compact = true;

        if(options.compact === false) {
            remove = false;
        } else if (numberEdges === 1) {
			// we remove if there isn't a loaded vertex corresponding to the remote vertex. this doesn't happen often but conceivable on an edge of a network if the remote vertex is never loaded, perhaps
            var other = vertices[edges[0]];
            remove = !other[k];
        } else if (numberEdges === 2) {
			// The problem is here.
			
            remove = edges.filter(function(n) {
                return vertices[n][k];
            }).length === numberEdges;
		
        } else {
            remove = false;
        }

        if (!remove) {
            es[k] = vertex;
        }

        if (i % 1000 === 0 && progress) {
            progress('compact:ends', i, vs.length);
        }

        return es;
    }, {});

    return Object.keys(ends).reduce(function compactEnd(result, k, i, es) {
        var compacted = compactNode(k, vertices, ends, vertexCoords, edgeData, false, options);
        result.graph[k] = compacted.edges;
        result.coordinates[k] = compacted.coordinates;

        if (options.edgeDataReduceFn) {
            result.reducedEdges[k] = compacted.reducedEdges;
        }

        if (i % 1000 === 0 && progress) {
            progress('compact:nodes', i, es.length);
        }

        return result;
    }, {graph: {}, coordinates: {}, reducedEdges: {}});
};

},{}],22:[function(require,module,exports){
var Queue = require('tinyqueue');

module.exports = function(graph, start, end) {
    var costs = {};
    costs[start] = 0;
    var initialState = [0, [start], start];
    var queue = new Queue([initialState], function(a, b) { return a[0] - b[0]; });
    var explored = {};

    while (queue.length) {
        var state = queue.pop();
        var cost = state[0];
        var node = state[2];
        if (node === end) {
			// dijkstra all good - the correct path is returned
            return state.slice(0, 2);
        }

        var neighbours = graph[node];
        Object.keys(neighbours).forEach(function(n) {
            var newCost = cost + neighbours[n];
            if (!(n in costs) || newCost < costs[n]) {
                costs[n] = newCost;
                var newState = [newCost, state[1].concat([n]), n];
                queue.push(newState);
            }
        });
    }

    return null;
}

},{"tinyqueue":29}],23:[function(require,module,exports){
'use strict';

var findPath = require('./dijkstra'),
    preprocess = require('./preprocessor'),
    compactor = require('./compactor'),
    roundCoord = require('./round-coord'),
    distance = require('@turf/distance').default,
    point = require('turf-point');

module.exports = PathFinder;

function PathFinder(graph, options) {    
    options = options || {};

    if (!graph.compactedVertices) {
        graph = preprocess(graph, options);
    }

    this._graph = graph;
    this._keyFn = options.keyFn || function(c) {
        return c.join(',');
    };
    this._precision = options.precision || 1e-5;
    this._options = options;

    if (Object.keys(this._graph.compactedVertices).filter(function(k) { return k !== 'edgeData'; }).length === 0) {
        throw new Error('Compacted graph contains no forks (topology has no intersections).');
    }
}

PathFinder.prototype = {
    findPath: function(a, b) {
        var start = this._keyFn(roundCoord(a.geometry.coordinates, this._precision)),
            finish = this._keyFn(roundCoord(b.geometry.coordinates, this._precision));

        // We can't find a path if start or finish isn't in the
        // set of non-compacted vertices
        if (!this._graph.vertices[start] || !this._graph.vertices[finish]) {
            return null;
        }

        var phantomStart = this._createPhantom(start);
        var phantomEnd = this._createPhantom(finish);

        var path = findPath(this._graph.compactedVertices, start, finish);
		console.log(`The found path from ${JSON.stringify(start)} to ${JSON.stringify(finish)} is: ${JSON.stringify(path)}`);

        if (path) {
            var weight = path[0];
            path = path[1];
            return {
                path: path.reduce(function buildPath(cs, v, i, vs) {
                    if (i > 0) {
                        cs = cs.concat(this._graph.compactedCoordinates[vs[i - 1]][v]);
                    }

                    return cs;
                }.bind(this), []).concat([this._graph.sourceVertices[finish]]),
                weight: weight,
                edgeDatas: this._graph.compactedEdges 
                    ? path.reduce(function buildEdgeData(eds, v, i, vs) {
                        if (i > 0) {
                            eds.push({
                                reducedEdge: this._graph.compactedEdges[vs[i - 1]][v]
                            });
                        }

                        return eds;
                    }.bind(this), [])
                    : undefined
            };
        } else {
            return null;
        }

        this._removePhantom(phantomStart);
        this._removePhantom(phantomEnd);
    },

    serialize: function() {
        return this._graph;
    },

	findNearestJunction: function(p) {
		var vertex = [ null, Number.MAX_VALUE ], nEdges;
		var junctions = Object.keys(this._graph.vertices).filter ( (function(k) {
			nEdges = Object.keys(this._graph.vertices[k]).length;
			return nEdges >= 3 || nEdges == 1;
		}).bind(this));

		junctions.forEach( (function(k) {
			const dist = distance(point(p), point(this._graph.sourceVertices[k]));
			if(dist < vertex[1]) {
				vertex[1] = dist;
				vertex[0] = this._graph.sourceVertices[k].slice(0);
			}
		}).bind(this));
		return vertex;
	},
		
    _createPhantom: function(n) {
        if (this._graph.compactedVertices[n]) return null;

        var phantom = compactor.compactNode(n, this._graph.vertices, this._graph.compactedVertices, this._graph.sourceVertices, this._graph.edgeData, true, this._options);
        this._graph.compactedVertices[n] = phantom.edges;
        this._graph.compactedCoordinates[n] = phantom.coordinates;

        if (this._graph.compactedEdges) {
            this._graph.compactedEdges[n] = phantom.reducedEdges;
        }

        Object.keys(phantom.incomingEdges).forEach(function(neighbor) {
            var neighborKeys = Object.keys(this._graph.compactedCoordinates[neighbor]);
			var neighborExactPos = neighborKeys.length > 0 ? this._graph.compactedCoordinates[neighbor][neighborKeys[0]][0] : neighbor.split(',').map(function(v) { return parseFloat(v); });
            this._graph.compactedVertices[neighbor][n] = phantom.incomingEdges[neighbor];
            this._graph.compactedCoordinates[neighbor][n] = [neighborExactPos].concat(phantom.incomingCoordinates[neighbor].slice(0, -1));
            if (this._graph.compactedEdges) {
                this._graph.compactedEdges[neighbor][n] = phantom.reducedEdges[neighbor];
            }
        }.bind(this));

        return n;
    },

    _removePhantom: function(n) {
        if (!n) return;

        Object.keys(this._graph.compactedVertices[n]).forEach(function(neighbor) {
            delete this._graph.compactedVertices[neighbor][n];
        }.bind(this));
        Object.keys(this._graph.compactedCoordinates[n]).forEach(function(neighbor) {
            delete this._graph.compactedCoordinates[neighbor][n];
        }.bind(this));
        if (this._graph.compactedEdges) {
            Object.keys(this._graph.compactedEdges[n]).forEach(function(neighbor) {
                delete this._graph.compactedEdges[neighbor][n];
            }.bind(this));
        }

        delete this._graph.compactedVertices[n];
        delete this._graph.compactedCoordinates[n];

        if (this._graph.compactedEdges) {
            delete this._graph.compactedEdges[n];
        }
    }
};

},{"./compactor":21,"./dijkstra":22,"./preprocessor":24,"./round-coord":25,"@turf/distance":3,"turf-point":30}],24:[function(require,module,exports){
'use strict';

var topology = require('./topology'),
    compactor = require('./compactor'),
    distance = require('@turf/distance').default,
    roundCoord = require('./round-coord'),
    point = require('turf-point');

module.exports = function preprocess(graph, options) {
    options = options || {};
    var weightFn = options.weightFn || function defaultWeightFn(a, b) {
            return distance(point(a), point(b));
        },
        topo;

    if (graph.type === 'FeatureCollection') {
        // Graph is GeoJSON data, create a topology from it
        topo = topology(graph, options);
    } else if (graph.edges) {
        // Graph is a preprocessed topology
        topo = graph;
    }

    var graph = topo.edges.reduce(function buildGraph(g, edge, i, es) {
        var a = edge[0],
            b = edge[1],
            props = edge[2],
            w = weightFn(topo.vertices[a], topo.vertices[b], props),
            makeEdgeList = function makeEdgeList(node) {
                if (!g.vertices[node]) {
                    g.vertices[node] = {};
                    if (options.edgeDataReduceFn) {
                        g.edgeData[node] = {};
                    }
                }
            },
            concatEdge = function concatEdge(startNode, endNode, weight) {
                var v = g.vertices[startNode];
                v[endNode] = weight;
                if (options.edgeDataReduceFn) {
                    g.edgeData[startNode][endNode] = options.edgeDataReduceFn(options.edgeDataSeed, props);
                }
            };

        if (w) {
            makeEdgeList(a);
            makeEdgeList(b);
            if (w instanceof Object) {
                if (w.forward) {
                    concatEdge(a, b, w.forward);
                }
                if (w.backward) {
                    concatEdge(b, a, w.backward);
                }
            } else {
                concatEdge(a, b, w);
                concatEdge(b, a, w);
            }
        }

        if (i % 1000 === 0 && options.progress) {
            options.progress('edgeweights', i,es.length);
        }

        return g;
    }, {edgeData: {}, vertices: {}});

    var compact = compactor.compactGraph(graph.vertices, topo.vertices, graph.edgeData, options);

    return {
        vertices: graph.vertices,
        edgeData: graph.edgeData,
        sourceVertices: topo.vertices,
        compactedVertices: compact.graph,
        compactedCoordinates: compact.coordinates,
        compactedEdges: options.edgeDataReduceFn ? compact.reducedEdges : null
    };
};

},{"./compactor":21,"./round-coord":25,"./topology":26,"@turf/distance":3,"turf-point":30}],25:[function(require,module,exports){
module.exports = function roundCoord(c, precision) {
	/*
    return [
        Math.round(c[0] / precision) * precision,
        Math.round(c[1] / precision) * precision,
    ];
	*/
	return [
		c[0].toFixed(-Math.log10(precision)),
		c[1].toFixed(-Math.log10(precision))
	];
};

},{}],26:[function(require,module,exports){
'use strict';

var explode = require('@turf/explode'),
    roundCoord = require('./round-coord');

module.exports = topology;

function geoJsonReduce(geojson, fn, seed) {
    if (geojson.type === 'FeatureCollection') {
        return geojson.features.reduce(function reduceFeatures(a, f) {
            return geoJsonReduce(f, fn, a);
        }, seed);
    } else {
        return fn(seed, geojson);
    }
}

function geoJsonFilterFeatures(geojson, fn) {
    var features = [];
    if (geojson.type === 'FeatureCollection') {
        features = features.concat(geojson.features.filter(fn));
    }

    return {
        type: 'FeatureCollection',
        features: features
    };
}

function isLineString(f) {
    return f.geometry.type === 'LineString';
}

function topology(geojson, options) {
    options = options || {};
    var keyFn = options.keyFn || function defaultKeyFn(c) {
            return c.join(',');
        },
        precision = options.precision || 1e-5;

    var lineStrings = geoJsonFilterFeatures(geojson, isLineString);
    var explodedLineStrings = explode(lineStrings);
    var vertices = explodedLineStrings.features.reduce(function buildTopologyVertices(cs, f, i, fs) {
            var rc = roundCoord(f.geometry.coordinates, precision);
            cs[keyFn(rc)] = f.geometry.coordinates;

            if (i % 1000 === 0 && options.progress) {
                options.progress('topo:vertices', i, fs.length);
            }

            return cs;
        }, {}),
        edges = geoJsonReduce(lineStrings, function buildTopologyEdges(es, f, i, fs) {
            f.geometry.coordinates.forEach(function buildLineStringEdges(c, i, cs) {
                if (i > 0) {
                    var k1 = keyFn(roundCoord(cs[i - 1], precision)),
                        k2 = keyFn(roundCoord(c, precision));
                    es.push([k1, k2, f.properties]);
                }
            });

            if (i % 1000 === 0 && options.progress) {
                options.progress('topo:edges', i, fs.length);
            }

            return es;
        }, []);

    return {
        vertices: vertices,
        edges: edges
    };
}

},{"./round-coord":25,"@turf/explode":4}],27:[function(require,module,exports){
const PanoNetworkMgr = require('./PanoNetworkMgr');
require('pannellum');

class Client {

    constructor(options) {
        options = options || { };
        options.api = options.api || { };
        this.viewer = null;
        this.panoNetworkMgr = new PanoNetworkMgr({
            jsonApi: options.api.geojson,
            nearbyApi: options.api.nearby
        });
        this.lat = 0.0;
        this.lon = 0.0;
        this.panoMetadata = [];
        this.eventHandlers = {};
        this.curPanoId = 0;
        this.resizePano = options.resizePano;
        this.api = { };
        this.api.nearest = options.api.nearest || 'op/panorama/nearest/{lon}/{lat}'; 
        this.api.byId = options.api.byId || 'op/panorama/{id}';
        this.api.panoImg = options.api.panoImg || 'op/panorama/{id}.jpg';
        this.api.panoImgResized = options.api.panoImgResized || 'op/panorama/{id}.w{width}.jpg';
    }


    findPanoramaByLonLat(lon,lat) {
        var resp = fetch(this.api.nearest
                .replace('{lon}', lon)
                .replace('{lat}', lat))
                .then(resp=>resp.json())
                .then(json=> {
                    this._receivePanoMetadata(json);
                   });
    }

    loadPanorama(id, options) {
        options = options || {};
        if(!this.panoMetadata[id]) {
            this._fetchPanoMetadataById(id, this._processMetadata.bind(this, id, options));
        } else {
            this._setLonLat(this.panoMetadata[id].lon,this.panoMetadata[id].lat);
            this._processMetadata(id, options);
        }
    }

    moveTo(id) {
        if (!this.viewer.getConfig().scenes[`pano${id}`]) {
            this._addScene(id);
            this.viewer.loadScene(`pano${id}`, "same", "same", "same", true);
        } else {
            try {
                this.viewer.loadScene(`pano${id}`, "same", "same", "same", true);
            } catch(e) {
                console.log(`Cannot loadScene(): ${e}`);
            }
        }    
    }

    update(id, properties) {
        var scene = this.viewer.getConfig().scenes[`pano${id}`];    
        if(scene && this.panoMetadata[id]) {
            if(properties.position) {
                this._removeAllHotSpots(id).forEach ( otherPano=> {
                    this._removeAllHotSpots(otherPano.split('-')[2]);
                });
                this.panoMetadata[id].lon = properties.position[0];
                this.panoMetadata[id].lat = properties.position[1];
                this.loadPanorama(id, { panoMoved: true } );
            } else if (properties.poseheadingdegrees) {
                
                var oldHeading = this.panoMetadata[id].poseheadingdegrees;
                this.panoMetadata[id].poseheadingdegrees = properties.poseheadingdegrees;

                scene.hotSpots.forEach( hotSpot=> {
                    hotSpot.yaw += (oldHeading - properties.poseheadingdegrees);
                    if(hotSpot.yaw>180) hotSpot.yaw-=360;
                    if(hotSpot.yaw<-180) hotSpot.yaw+=360;
                });
            }
        } 
    }

    on(evName,evHandler) {
        this.eventHandlers[evName] = evHandler;
    }

    _processMetadata(id, options) {
        options = options || {};
        var thisScene = this.viewer ? this.viewer.getConfig().scenes[`pano${id}`]: null;

        if(!thisScene || !thisScene.hotSpots || thisScene.hotSpots.length == 0) {
            this._loadNearbys({json:this.panoMetadata[id], callback:this._onFoundNearbys.bind(this, options)})
        } else {
            this.curPanoId = id;
            if(this.eventHandlers.panoChanged) {
                this.eventHandlers.panoChanged(id);
            }
            this._adjustLoadedPano(id, options.yaw);
        }    
    }

    _fetchPanoMetadataById(id, onReceivedMetadataCallback) {
        var resp = fetch(this.api.byId.replace('{id}', id))
            .then(resp=>resp.json()).then(json=> {
                this._receivePanoMetadata(json, onReceivedMetadataCallback);
        });
    }


    _receivePanoMetadata(json, onReceivedMetadataCallback) {
        onReceivedMetadataCallback = onReceivedMetadataCallback || this._processMetadata.bind(this, json.id);
        this._setLonLat(json.lon, json.lat);
        this.panoMetadata[json.id] = json;
        this.panoMetadata[json.id].poseheadingdegrees = this.panoMetadata[json.id].poseheadingdegrees || 0;
        onReceivedMetadataCallback();
    }

    _setLonLat(lon,lat) {
        this.lon = lon;
        this.lat = lat;
        if(this.eventHandlers.locationChanged) {
            this.eventHandlers.locationChanged(lon, lat);
        }
    }

    _loadNearbys (options) {
        this.panoNetworkMgr.doLoadNearbys(options.json,options.callback);
    }


    _onFoundNearbys (options, thisPano, nearbys) {
        this.curPanoId = thisPano.id;
        if(this.eventHandlers.panoChanged) {
            this.eventHandlers.panoChanged(this.curPanoId);
        }
        if(!this.viewer) {
            var scenes = {};
            scenes[`pano${thisPano.id}`]  = {
                'title': 'Starting Pano',
                'panorama': this.resizePano === undefined ? this.api.panoImg.replace('{id}', thisPano.id): this.api.panoImgResized.replace('{id}', thisPano.id).replace('{width}', this.resizePano),
                'type' : 'equirectangular',
                'hotSpots': [] };
        
            this.viewer = pannellum.viewer('panorama', {
                'type': 'equirectangular',
                'autoLoad': true,
                'northOffset': this.panoMetadata[thisPano.id].poseheadingdegrees,
                'compass': true,
                'default': {
                    'firstScene' : `pano${thisPano.id}`,
                    'author': 'OTV360 contributors',
                    'sceneFadeDuration': 100
                },
                'scenes': scenes
            });
                            
            this.viewer.on("error", e=> { console.log(`HS ERROR: ${e}`);});
            this.viewer.on("scenechange", sceneId=> { this._handleSceneChange(sceneId); });  
        }  else if (options.panoMoved!==true) {
            this.viewer.setNorthOffset(this.panoMetadata[thisPano.id].poseheadingdegrees);
        }
   

        // Issue that getNorthOffset() is not set because the pano is not
        // loaded yet, but trying to put this in an onLoad() event handler
        // gives an undefined div error. 
        
        nearbys.forEach( nearby => { 
            if(options.panoMoved!==true) { // only do hotspots if we didn't just move a pano

                var yaw = nearby.bearing-thisPano.poseheadingdegrees;
                if(yaw>180) yaw-=360;
                if(yaw<-180) yaw+=360;
                
                

                if(nearby.id != thisPano.id) {
                    if(!this.viewer.getConfig().scenes[`pano${nearby.id}`]) {
                        this.viewer.addScene(`pano${nearby.id}`, {
                            title: `Pano ${nearby.id}`,
                            'panorama':  this.resizePano === undefined ? this.api.panoImg.replace('{id}', nearby.id) : this.api.panoImgResized.replace('{id}', nearby.id).replace('{width}', this.resizePano),
                            'type': 'equirectangular'});
                    } else {
                    }
                }
        
                 this.viewer.addHotSpot(
                    { 'pitch': 0,
                      'yaw': yaw,
                      'type':'scene',
//                      'cssClass' : 'customHotspot',
                      'text' : `to pano ${nearby.id}`,
                      'id' : `hs-${thisPano.id}-${nearby.id}`,
                      'sceneId': `pano${nearby.id}`
                    });    
            } else {
                // remove any existing hotspots from the target pano of the
                // hotspot if we moved the panorama
                this._removeAllHotSpots(nearby.id);
            }
        }); 

        if(options.panoMoved!==true) {
            var scene = this.viewer.getConfig().scenes[`pano${thisPano.id}`];
            this._adjustLoadedPano(thisPano.id, options.yaw);
        }
    }

    _handleSceneChange(sceneId) {
        var curId = this.curPanoId;
        var yawBearing = null;
        var id = sceneId.substring(4);
        if(curId > 0) {
        this.viewer.getConfig().scenes[`pano${curId}`].hotSpots.forEach( hotSpot=> {
            if(hotSpot.sceneId == sceneId) {
                yawBearing = this.panoMetadata[curId].poseheadingdegrees + hotSpot.yaw; 
                if(yawBearing>180) yawBearing-=360;
                if(yawBearing<-180) yawBearing+=360;
            }
        });
        }
        this.loadPanorama(id, {yaw: yawBearing});  
    } 

    _adjustLoadedPano(curPanoId, panoYaw) {
        if(panoYaw!==null && panoYaw!==undefined) {
            panoYaw -= this.panoMetadata[curPanoId].poseheadingdegrees;
            if(panoYaw>180) panoYaw-=360;
            if(panoYaw<-180) panoYaw+=360;
            this.viewer.setYaw(panoYaw, false);    
        }
    }

    _addScene(id) {
        this.viewer.addScene(`pano${id}`, {
                'title': `Pano ${id}`,
                'panorama': this.api.panoImg.replace('{id}', id),
                'type' : 'equirectangular',
                'hotSpots': []
            });
    }
    
    _removeAllHotSpots(id) {
        var scene = this.viewer.getConfig().scenes[`pano${id}`];
        var hsid = []; 
        if(scene && scene.hotSpots) {
            scene.hotSpots.forEach( hotSpot=> {
                hsid.push(hotSpot.id);
            });
            for(var i=0; i<hsid.length; i++) {
                this.viewer.removeHotSpot(hsid[i]);
            }
            scene.hotSpots = [];
        }
        return hsid;
    }
}

module.exports = {
    Client: Client
};

},{"./PanoNetworkMgr":20,"pannellum":28}],28:[function(require,module,exports){
// Pannellum 2.5.6, https://github.com/mpetroff/pannellum
window.libpannellum=function(E,g,p){function Ba(K){function ja(a,e){return 1==a.level&&1!=e.level?-1:1==e.level&&1!=a.level?1:e.timestamp-a.timestamp}function Q(a,e){return a.level!=e.level?a.level-e.level:a.diff-e.diff}function ka(a,e,c,g,l,h){this.vertices=a;this.side=e;this.level=c;this.x=g;this.y=l;this.path=h.replace("%s",e).replace("%l",c).replace("%x",g).replace("%y",l)}function Ja(a,e,g,p,l){var h;var d=e.vertices;h=la(a,d.slice(0,3));var u=la(a,d.slice(3,6)),x=la(a,d.slice(6,9)),d=la(a,d.slice(9,
12)),t=h[0]+u[0]+x[0]+d[0];-4==t||4==t?h=!1:(t=h[1]+u[1]+x[1]+d[1],h=-4==t||4==t?!1:4!=h[2]+u[2]+x[2]+d[2]);if(h){h=e.vertices;u=h[0]+h[3]+h[6]+h[9];x=h[1]+h[4]+h[7]+h[10];d=h[2]+h[5]+h[8]+h[11];t=Math.sqrt(u*u+x*x+d*d);d=Math.asin(d/t);u=Math.atan2(x,u)-p;u+=u>Math.PI?-2*Math.PI:u<-Math.PI?2*Math.PI:0;u=Math.abs(u);e.diff=Math.acos(Math.sin(g)*Math.sin(d)+Math.cos(g)*Math.cos(d)*Math.cos(u));u=!1;for(x=0;x<c.nodeCache.length;x++)if(c.nodeCache[x].path==e.path){u=!0;c.nodeCache[x].timestamp=c.nodeCacheTimestamp++;
c.nodeCache[x].diff=e.diff;c.currentNodes.push(c.nodeCache[x]);break}u||(e.timestamp=c.nodeCacheTimestamp++,c.currentNodes.push(e),c.nodeCache.push(e));if(e.level<c.level){var d=m.cubeResolution*Math.pow(2,e.level-m.maxLevel),u=Math.ceil(d*m.invTileResolution)-1,x=d%m.tileResolution*2,k=2*d%m.tileResolution;0===k&&(k=m.tileResolution);0===x&&(x=2*m.tileResolution);t=0.5;if(e.x==u||e.y==u)t=1-m.tileResolution/(m.tileResolution+k);var y=1-t,d=[],s=t,z=t,D=t,I=y,A=y,B=y;if(k<m.tileResolution)if(e.x==
u&&e.y!=u){if(A=z=0.5,"d"==e.side||"u"==e.side)B=D=0.5}else e.x!=u&&e.y==u&&(I=s=0.5,"l"==e.side||"r"==e.side)&&(B=D=0.5);x<=m.tileResolution&&(e.x==u&&(s=0,I=1,"l"==e.side||"r"==e.side)&&(D=0,B=1),e.y==u&&(z=0,A=1,"d"==e.side||"u"==e.side)&&(D=0,B=1));k=[h[0],h[1],h[2],h[0]*s+h[3]*I,h[1]*t+h[4]*y,h[2]*D+h[5]*B,h[0]*s+h[6]*I,h[1]*z+h[7]*A,h[2]*D+h[8]*B,h[0]*t+h[9]*y,h[1]*z+h[10]*A,h[2]*D+h[11]*B];k=new ka(k,e.side,e.level+1,2*e.x,2*e.y,m.fullpath);d.push(k);e.x==u&&x<=m.tileResolution||(k=[h[0]*s+
h[3]*I,h[1]*t+h[4]*y,h[2]*D+h[5]*B,h[3],h[4],h[5],h[3]*t+h[6]*y,h[4]*z+h[7]*A,h[5]*D+h[8]*B,h[0]*s+h[6]*I,h[1]*z+h[7]*A,h[2]*D+h[8]*B],k=new ka(k,e.side,e.level+1,2*e.x+1,2*e.y,m.fullpath),d.push(k));e.x==u&&x<=m.tileResolution||e.y==u&&x<=m.tileResolution||(k=[h[0]*s+h[6]*I,h[1]*z+h[7]*A,h[2]*D+h[8]*B,h[3]*t+h[6]*y,h[4]*z+h[7]*A,h[5]*D+h[8]*B,h[6],h[7],h[8],h[9]*s+h[6]*I,h[10]*t+h[7]*y,h[11]*D+h[8]*B],k=new ka(k,e.side,e.level+1,2*e.x+1,2*e.y+1,m.fullpath),d.push(k));e.y==u&&x<=m.tileResolution||
(k=[h[0]*t+h[9]*y,h[1]*z+h[10]*A,h[2]*D+h[11]*B,h[0]*s+h[6]*I,h[1]*z+h[7]*A,h[2]*D+h[8]*B,h[9]*s+h[6]*I,h[10]*t+h[7]*y,h[11]*D+h[8]*B,h[9],h[10],h[11]],k=new ka(k,e.side,e.level+1,2*e.x,2*e.y+1,m.fullpath),d.push(k));for(e=0;e<d.length;e++)Ja(a,d[e],g,p,l)}}}function ta(){return[-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,1,1,-1,1,1,1,1,-1,1,1,-1,-1]}function ua(a,e,c){var g=Math.sin(e);e=Math.cos(e);
if("x"==c)return[a[0],e*a[1]+g*a[2],e*a[2]-g*a[1],a[3],e*a[4]+g*a[5],e*a[5]-g*a[4],a[6],e*a[7]+g*a[8],e*a[8]-g*a[7]];if("y"==c)return[e*a[0]-g*a[2],a[1],e*a[2]+g*a[0],e*a[3]-g*a[5],a[4],e*a[5]+g*a[3],e*a[6]-g*a[8],a[7],e*a[8]+g*a[6]];if("z"==c)return[e*a[0]+g*a[1],e*a[1]-g*a[0],a[2],e*a[3]+g*a[4],e*a[4]-g*a[3],a[5],e*a[6]+g*a[7],e*a[7]-g*a[6],a[8]]}function ma(a){return[a[0],a[4],a[8],a[12],a[1],a[5],a[9],a[13],a[2],a[6],a[10],a[14],a[3],a[7],a[11],a[15]]}function Ka(a){La(a,a.path+"."+m.extension,
function(e,c){a.texture=e;a.textureLoaded=c?2:1},va.crossOrigin)}function la(a,e){var c=[a[0]*e[0]+a[1]*e[1]+a[2]*e[2],a[4]*e[0]+a[5]*e[1]+a[6]*e[2],a[11]+a[8]*e[0]+a[9]*e[1]+a[10]*e[2],1/(a[12]*e[0]+a[13]*e[1]+a[14]*e[2])],g=c[0]*c[3],l=c[1]*c[3],c=c[2]*c[3],h=[0,0,0];-1>g&&(h[0]=-1);1<g&&(h[0]=1);-1>l&&(h[1]=-1);1<l&&(h[1]=1);if(-1>c||1<c)h[2]=1;return h}function Ea(){console.log("Reducing canvas size due to error 1286!");A.width=Math.round(A.width/2);A.height=Math.round(A.height/2)}var A=g.createElement("canvas");
A.style.width=A.style.height="100%";K.appendChild(A);var c,a,U,V,$,R,wa,ga,m,z,F,ca,Fa,Y,na,va;this.init=function(L,e,Ca,H,l,h,d,u){function x(a){if(E){var e=a*a*4,h=new Uint8ClampedArray(e),c=u.backgroundColor?u.backgroundColor:[0,0,0];c[0]*=255;c[1]*=255;c[2]*=255;for(var b=0;b<e;b++)h[b++]=c[0],h[b++]=c[1],h[b++]=c[2];a=new ImageData(h,a,a);for(t=0;6>t;t++)0==m[t].width&&(m[t]=a)}}e===p&&(e="equirectangular");if("equirectangular"!=e&&"cubemap"!=e&&"multires"!=e)throw console.log("Error: invalid image type specified!"),
{type:"config error"};z=e;m=L;F=Ca;va=u||{};if(c){U&&(a.detachShader(c,U),a.deleteShader(U));V&&(a.detachShader(c,V),a.deleteShader(V));a.bindBuffer(a.ARRAY_BUFFER,null);a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,null);c.texture&&a.deleteTexture(c.texture);if(c.nodeCache)for(L=0;L<c.nodeCache.length;L++)a.deleteTexture(c.nodeCache[L].texture);a.deleteProgram(c);c=p}ga=p;var t,E=!1,y;if("cubemap"==z)for(t=0;6>t;t++)0<m[t].width?(y===p&&(y=m[t].width),y!=m[t].width&&console.log("Cube faces have inconsistent widths: "+
y+" vs. "+m[t].width)):E=!0;"cubemap"==z&&0!==(y&y-1)&&(navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 8_/)||navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 9_/)||navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 10_/)||navigator.userAgent.match(/Trident.*rv[ :]*11\./))||(a||(a=A.getContext("experimental-webgl",{alpha:!1,depth:!1})),a&&1286==a.getError()&&Ea());if(!a&&("multires"==z&&m.hasOwnProperty("fallbackPath")||"cubemap"==z)&&("WebkitAppearance"in
g.documentElement.style||navigator.userAgent.match(/Trident.*rv[ :]*11\./)||-1!==navigator.appVersion.indexOf("MSIE 10"))){R&&K.removeChild(R);R=g.createElement("div");R.className="pnlm-world";H=m.basePath?m.basePath+m.fallbackPath:m.fallbackPath;var Q="frblud".split(""),S=0;l=function(){var a=g.createElement("canvas");a.className="pnlm-face pnlm-"+Q[this.side]+"face";R.appendChild(a);var e=a.getContext("2d");a.style.width=this.width+4+"px";a.style.height=this.height+4+"px";a.width=this.width+4;a.height=
this.height+4;e.drawImage(this,2,2);var h=e.getImageData(0,0,a.width,a.height),c=h.data,b,d;for(b=2;b<a.width-2;b++)for(d=0;4>d;d++)c[4*(b+a.width)+d]=c[4*(b+2*a.width)+d],c[4*(b+a.width*(a.height-2))+d]=c[4*(b+a.width*(a.height-3))+d];for(b=2;b<a.height-2;b++)for(d=0;4>d;d++)c[4*(b*a.width+1)+d]=c[4*(b*a.width+2)+d],c[4*((b+1)*a.width-2)+d]=c[4*((b+1)*a.width-3)+d];for(d=0;4>d;d++)c[4*(a.width+1)+d]=c[4*(2*a.width+2)+d],c[4*(2*a.width-2)+d]=c[4*(3*a.width-3)+d],c[4*(a.width*(a.height-2)+1)+d]=c[4*
(a.width*(a.height-3)+2)+d],c[4*(a.width*(a.height-1)-2)+d]=c[4*(a.width*(a.height-2)-3)+d];for(b=1;b<a.width-1;b++)for(d=0;4>d;d++)c[4*b+d]=c[4*(b+a.width)+d],c[4*(b+a.width*(a.height-1))+d]=c[4*(b+a.width*(a.height-2))+d];for(b=1;b<a.height-1;b++)for(d=0;4>d;d++)c[b*a.width*4+d]=c[4*(b*a.width+1)+d],c[4*((b+1)*a.width-1)+d]=c[4*((b+1)*a.width-2)+d];for(d=0;4>d;d++)c[d]=c[4*(a.width+1)+d],c[4*(a.width-1)+d]=c[4*(2*a.width-2)+d],c[a.width*(a.height-1)*4+d]=c[4*(a.width*(a.height-2)+1)+d],c[4*(a.width*
a.height-1)+d]=c[4*(a.width*(a.height-1)-2)+d];e.putImageData(h,0,0);D.call(this)};var D=function(){0<this.width?($===p&&($=this.width),$!=this.width&&console.log("Fallback faces have inconsistent widths: "+$+" vs. "+this.width)):E=!0;S++;6==S&&($=this.width,K.appendChild(R),d())},E=!1;for(t=0;6>t;t++)h=new Image,h.crossOrigin=va.crossOrigin?va.crossOrigin:"anonymous",h.side=t,h.onload=l,h.onerror=D,h.src="multires"==z?H.replace("%s",Q[t])+"."+m.extension:m[t].src;x($)}else{if(!a)throw console.log("Error: no WebGL support detected!"),
{type:"no webgl"};"cubemap"==z&&x(y);m.fullpath=m.basePath?m.basePath+m.path:m.path;m.invTileResolution=1/m.tileResolution;L=ta();wa=[];for(t=0;6>t;t++)wa[t]=L.slice(12*t,12*t+12),L=ta();L=0;if("equirectangular"==z){if(L=a.getParameter(a.MAX_TEXTURE_SIZE),Math.max(m.width/2,m.height)>L)throw console.log("Error: The image is too big; it's "+m.width+"px wide, but this device's maximum supported size is "+2*L+"px."),{type:"webgl size error",width:m.width,maxWidth:2*L};}else if("cubemap"==z&&y>a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE))throw console.log("Error: The image is too big; it's "+
y+"px wide, but this device's maximum supported size is "+L+"px."),{type:"webgl size error",width:y,maxWidth:L};u===p||u.horizonPitch===p&&u.horizonRoll===p||(ga=[u.horizonPitch==p?0:u.horizonPitch,u.horizonRoll==p?0:u.horizonRoll]);y=a.TEXTURE_2D;a.viewport(0,0,a.drawingBufferWidth,a.drawingBufferHeight);a.getShaderPrecisionFormat&&(e=a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT))&&1>e.precision&&(oa=oa.replace("highp","mediump"));U=a.createShader(a.VERTEX_SHADER);e=s;"multires"==z&&
(e=k);a.shaderSource(U,e);a.compileShader(U);V=a.createShader(a.FRAGMENT_SHADER);e=pa;"cubemap"==z?(y=a.TEXTURE_CUBE_MAP,e=qa):"multires"==z&&(e=bb);a.shaderSource(V,e);a.compileShader(V);c=a.createProgram();a.attachShader(c,U);a.attachShader(c,V);a.linkProgram(c);a.getShaderParameter(U,a.COMPILE_STATUS)||console.log(a.getShaderInfoLog(U));a.getShaderParameter(V,a.COMPILE_STATUS)||console.log(a.getShaderInfoLog(V));a.getProgramParameter(c,a.LINK_STATUS)||console.log(a.getProgramInfoLog(c));a.useProgram(c);
c.drawInProgress=!1;e=u.backgroundColor?u.backgroundColor:[0,0,0];a.clearColor(e[0],e[1],e[2],1);a.clear(a.COLOR_BUFFER_BIT);c.texCoordLocation=a.getAttribLocation(c,"a_texCoord");a.enableVertexAttribArray(c.texCoordLocation);"multires"!=z?(ca||(ca=a.createBuffer()),a.bindBuffer(a.ARRAY_BUFFER,ca),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]),a.STATIC_DRAW),a.vertexAttribPointer(c.texCoordLocation,2,a.FLOAT,!1,0,0),c.aspectRatio=a.getUniformLocation(c,"u_aspectRatio"),
a.uniform1f(c.aspectRatio,a.drawingBufferWidth/a.drawingBufferHeight),c.psi=a.getUniformLocation(c,"u_psi"),c.theta=a.getUniformLocation(c,"u_theta"),c.f=a.getUniformLocation(c,"u_f"),c.h=a.getUniformLocation(c,"u_h"),c.v=a.getUniformLocation(c,"u_v"),c.vo=a.getUniformLocation(c,"u_vo"),c.rot=a.getUniformLocation(c,"u_rot"),a.uniform1f(c.h,H/(2*Math.PI)),a.uniform1f(c.v,l/Math.PI),a.uniform1f(c.vo,h/Math.PI*2),"equirectangular"==z&&(c.backgroundColor=a.getUniformLocation(c,"u_backgroundColor"),a.uniform4fv(c.backgroundColor,
e.concat([1]))),c.texture=a.createTexture(),a.bindTexture(y,c.texture),"cubemap"==z?(a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m[1]),a.texImage2D(a.TEXTURE_CUBE_MAP_NEGATIVE_X,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m[3]),a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_Y,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m[4]),a.texImage2D(a.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m[5]),a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_Z,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m[0]),a.texImage2D(a.TEXTURE_CUBE_MAP_NEGATIVE_Z,
0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m[2])):m.width<=L?(a.uniform1i(a.getUniformLocation(c,"u_splitImage"),0),a.texImage2D(y,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m)):(a.uniform1i(a.getUniformLocation(c,"u_splitImage"),1),H=g.createElement("canvas"),H.width=m.width/2,H.height=m.height,H=H.getContext("2d"),H.drawImage(m,0,0),l=H.getImageData(0,0,m.width/2,m.height),a.texImage2D(y,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,l),c.texture2=a.createTexture(),a.activeTexture(a.TEXTURE1),a.bindTexture(y,c.texture2),a.uniform1i(a.getUniformLocation(c,
"u_image1"),1),H.drawImage(m,-m.width/2,0),l=H.getImageData(0,0,m.width/2,m.height),a.texImage2D(y,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,l),a.texParameteri(y,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(y,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texParameteri(y,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(y,a.TEXTURE_MAG_FILTER,a.LINEAR),a.activeTexture(a.TEXTURE0)),a.texParameteri(y,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(y,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texParameteri(y,a.TEXTURE_MIN_FILTER,
a.LINEAR),a.texParameteri(y,a.TEXTURE_MAG_FILTER,a.LINEAR)):(c.vertPosLocation=a.getAttribLocation(c,"a_vertCoord"),a.enableVertexAttribArray(c.vertPosLocation),Fa||(Fa=a.createBuffer()),Y||(Y=a.createBuffer()),na||(na=a.createBuffer()),a.bindBuffer(a.ARRAY_BUFFER,Y),a.bufferData(a.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,1]),a.STATIC_DRAW),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,na),a.bufferData(a.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),a.STATIC_DRAW),c.perspUniform=a.getUniformLocation(c,
"u_perspMatrix"),c.cubeUniform=a.getUniformLocation(c,"u_cubeMatrix"),c.level=-1,c.currentNodes=[],c.nodeCache=[],c.nodeCacheTimestamp=0);H=a.getError();if(0!==H)throw console.log("Error: Something went wrong with WebGL!",H),{type:"webgl error"};d()}};this.destroy=function(){K!==p&&(A!==p&&K.contains(A)&&K.removeChild(A),R!==p&&K.contains(R)&&K.removeChild(R));if(a){var c=a.getExtension("WEBGL_lose_context");c&&c.loseContext()}};this.resize=function(){var g=E.devicePixelRatio||1;A.width=A.clientWidth*
g;A.height=A.clientHeight*g;a&&(1286==a.getError()&&Ea(),a.viewport(0,0,a.drawingBufferWidth,a.drawingBufferHeight),"multires"!=z&&a.uniform1f(c.aspectRatio,A.clientWidth/A.clientHeight))};this.resize();this.setPose=function(a,c){ga=[a,c]};this.render=function(g,e,k,s){var l,h=0;s===p&&(s={});s.roll&&(h=s.roll);if(ga!==p){l=ga[0];var d=ga[1],u=g,x=e,t=Math.cos(d)*Math.sin(g)*Math.sin(l)+Math.cos(g)*(Math.cos(l)*Math.cos(e)+Math.sin(d)*Math.sin(l)*Math.sin(e)),E=-Math.sin(g)*Math.sin(d)+Math.cos(g)*
Math.cos(d)*Math.sin(e);g=Math.cos(d)*Math.cos(l)*Math.sin(g)+Math.cos(g)*(-Math.cos(e)*Math.sin(l)+Math.cos(l)*Math.sin(d)*Math.sin(e));g=Math.asin(Math.max(Math.min(g,1),-1));e=Math.atan2(E,t);l=[Math.cos(u)*(Math.sin(d)*Math.sin(l)*Math.cos(x)-Math.cos(l)*Math.sin(x)),Math.cos(u)*Math.cos(d)*Math.cos(x),Math.cos(u)*(Math.cos(l)*Math.sin(d)*Math.cos(x)+Math.sin(x)*Math.sin(l))];d=[-Math.cos(g)*Math.sin(e),Math.cos(g)*Math.cos(e)];d=Math.acos(Math.max(Math.min((l[0]*d[0]+l[1]*d[1])/(Math.sqrt(l[0]*
l[0]+l[1]*l[1]+l[2]*l[2])*Math.sqrt(d[0]*d[0]+d[1]*d[1])),1),-1));0>l[2]&&(d=2*Math.PI-d);h+=d}if(a||"multires"!=z&&"cubemap"!=z){if("multires"!=z)k=2*Math.atan(Math.tan(0.5*k)/(a.drawingBufferWidth/a.drawingBufferHeight)),k=1/Math.tan(0.5*k),a.uniform1f(c.psi,e),a.uniform1f(c.theta,g),a.uniform1f(c.rot,h),a.uniform1f(c.f,k),!0===F&&"equirectangular"==z&&(a.bindTexture(a.TEXTURE_2D,c.texture),a.texImage2D(a.TEXTURE_2D,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,m)),a.drawArrays(a.TRIANGLES,0,6);else{l=a.drawingBufferWidth/
a.drawingBufferHeight;d=2*Math.atan(Math.tan(k/2)*a.drawingBufferHeight/a.drawingBufferWidth);d=1/Math.tan(d/2);l=[d/l,0,0,0,0,d,0,0,0,0,100.1/-99.9,20/-99.9,0,0,-1,0];for(d=1;d<m.maxLevel&&a.drawingBufferWidth>m.tileResolution*Math.pow(2,d-1)*Math.tan(k/2)*0.707;)d++;c.level=d;d=[1,0,0,0,1,0,0,0,1];d=ua(d,-h,"z");d=ua(d,-g,"x");d=ua(d,e,"y");d=[d[0],d[1],d[2],0,d[3],d[4],d[5],0,d[6],d[7],d[8],0,0,0,0,1];a.uniformMatrix4fv(c.perspUniform,!1,new Float32Array(ma(l)));a.uniformMatrix4fv(c.cubeUniform,
!1,new Float32Array(ma(d)));h=[l[0]*d[0],l[0]*d[1],l[0]*d[2],0,l[5]*d[4],l[5]*d[5],l[5]*d[6],0,l[10]*d[8],l[10]*d[9],l[10]*d[10],l[11],-d[8],-d[9],-d[10],0];c.nodeCache.sort(ja);if(200<c.nodeCache.length&&c.nodeCache.length>c.currentNodes.length+50)for(l=c.nodeCache.splice(200,c.nodeCache.length-200),d=0;d<l.length;d++)a.deleteTexture(l[d].texture);c.currentNodes=[];d="fbudlr".split("");for(l=0;6>l;l++)u=new ka(wa[l],d[l],1,0,0,m.fullpath),Ja(h,u,g,e,k);c.currentNodes.sort(Q);for(g=S.length-1;0<=
g;g--)-1===c.currentNodes.indexOf(S[g].node)&&(S[g].node.textureLoad=!1,S.splice(g,1));if(0===S.length)for(g=0;g<c.currentNodes.length;g++)if(e=c.currentNodes[g],!e.texture&&!e.textureLoad){e.textureLoad=!0;setTimeout(Ka,0,e);break}if(!c.drawInProgress){c.drawInProgress=!0;a.clear(a.COLOR_BUFFER_BIT);for(g=0;g<c.currentNodes.length;g++)1<c.currentNodes[g].textureLoaded&&(a.bindBuffer(a.ARRAY_BUFFER,Fa),a.bufferData(a.ARRAY_BUFFER,new Float32Array(c.currentNodes[g].vertices),a.STATIC_DRAW),a.vertexAttribPointer(c.vertPosLocation,
3,a.FLOAT,!1,0,0),a.bindBuffer(a.ARRAY_BUFFER,Y),a.vertexAttribPointer(c.texCoordLocation,2,a.FLOAT,!1,0,0),a.bindTexture(a.TEXTURE_2D,c.currentNodes[g].texture),a.drawElements(a.TRIANGLES,6,a.UNSIGNED_SHORT,0));c.drawInProgress=!1}}if(s.returnImage!==p)return A.toDataURL("image/png")}else for(l=$/2,s={f:"translate3d(-"+(l+2)+"px, -"+(l+2)+"px, -"+l+"px)",b:"translate3d("+(l+2)+"px, -"+(l+2)+"px, "+l+"px) rotateX(180deg) rotateZ(180deg)",u:"translate3d(-"+(l+2)+"px, -"+l+"px, "+(l+2)+"px) rotateX(270deg)",
d:"translate3d(-"+(l+2)+"px, "+l+"px, -"+(l+2)+"px) rotateX(90deg)",l:"translate3d(-"+l+"px, -"+(l+2)+"px, "+(l+2)+"px) rotateX(180deg) rotateY(90deg) rotateZ(180deg)",r:"translate3d("+l+"px, -"+(l+2)+"px, -"+(l+2)+"px) rotateY(270deg)"},k=1/Math.tan(k/2),k=k*A.clientWidth/2+"px",e="perspective("+k+") translateZ("+k+") rotateX("+g+"rad) rotateY("+e+"rad) ",k=Object.keys(s),g=0;6>g;g++)if(h=R.querySelector(".pnlm-"+k[g]+"face"))h.style.webkitTransform=e+s[k[g]],h.style.transform=e+s[k[g]]};this.isLoading=
function(){if(a&&"multires"==z)for(var g=0;g<c.currentNodes.length;g++)if(!c.currentNodes[g].textureLoaded)return!0;return!1};this.getCanvas=function(){return A};var S=[],La=function(){function c(){var d=this;this.texture=this.callback=null;this.image=new Image;this.image.crossOrigin=l?l:"anonymous";var e=function(){if(0<d.image.width&&0<d.image.height){var c=d.image;a.bindTexture(a.TEXTURE_2D,d.texture);a.texImage2D(a.TEXTURE_2D,0,a.RGB,a.RGB,a.UNSIGNED_BYTE,c);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,
a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);a.bindTexture(a.TEXTURE_2D,null);d.callback(d.texture,!0)}else d.callback(d.texture,!1);S.length?(c=S.shift(),d.loadTexture(c.src,c.texture,c.callback)):k[g++]=d};this.image.addEventListener("load",e);this.image.addEventListener("error",e)}function e(a,c,e,g){this.node=a;this.src=c;this.texture=e;this.callback=
g}var g=4,k={},l;c.prototype.loadTexture=function(a,c,e){this.texture=c;this.callback=e;this.image.src=a};for(var h=0;h<g;h++)k[h]=new c;return function(c,h,m,p){l=p;p=a.createTexture();g?k[--g].loadTexture(h,p,m):S.push(new e(c,h,p,m));return p}}()}var s="attribute vec2 a_texCoord;varying vec2 v_texCoord;void main() {gl_Position = vec4(a_texCoord, 0.0, 1.0);v_texCoord = a_texCoord;}",k="attribute vec3 a_vertCoord;attribute vec2 a_texCoord;uniform mat4 u_cubeMatrix;uniform mat4 u_perspMatrix;varying mediump vec2 v_texCoord;void main(void) {gl_Position = u_perspMatrix * u_cubeMatrix * vec4(a_vertCoord, 1.0);v_texCoord = a_texCoord;}",
oa="precision highp float;\nuniform float u_aspectRatio;\nuniform float u_psi;\nuniform float u_theta;\nuniform float u_f;\nuniform float u_h;\nuniform float u_v;\nuniform float u_vo;\nuniform float u_rot;\nconst float PI = 3.14159265358979323846264;\nuniform sampler2D u_image0;\nuniform sampler2D u_image1;\nuniform bool u_splitImage;\nuniform samplerCube u_imageCube;\nvarying vec2 v_texCoord;\nuniform vec4 u_backgroundColor;\nvoid main() {\nfloat x = v_texCoord.x * u_aspectRatio;\nfloat y = v_texCoord.y;\nfloat sinrot = sin(u_rot);\nfloat cosrot = cos(u_rot);\nfloat rot_x = x * cosrot - y * sinrot;\nfloat rot_y = x * sinrot + y * cosrot;\nfloat sintheta = sin(u_theta);\nfloat costheta = cos(u_theta);\nfloat a = u_f * costheta - rot_y * sintheta;\nfloat root = sqrt(rot_x * rot_x + a * a);\nfloat lambda = atan(rot_x / root, a / root) + u_psi;\nfloat phi = atan((rot_y * costheta + u_f * sintheta) / root);",
qa=oa+"float cosphi = cos(phi);\ngl_FragColor = textureCube(u_imageCube, vec3(cosphi*sin(lambda), sin(phi), cosphi*cos(lambda)));\n}",pa=oa+"lambda = mod(lambda + PI, PI * 2.0) - PI;\nvec2 coord = vec2(lambda / PI, phi / (PI / 2.0));\nif(coord.x < -u_h || coord.x > u_h || coord.y < -u_v + u_vo || coord.y > u_v + u_vo)\ngl_FragColor = u_backgroundColor;\nelse {\nif(u_splitImage) {\nif(coord.x < 0.0)\ngl_FragColor = texture2D(u_image0, vec2((coord.x + u_h) / u_h, (-coord.y + u_v + u_vo) / (u_v * 2.0)));\nelse\ngl_FragColor = texture2D(u_image1, vec2((coord.x + u_h) / u_h - 1.0, (-coord.y + u_v + u_vo) / (u_v * 2.0)));\n} else {\ngl_FragColor = texture2D(u_image0, vec2((coord.x + u_h) / (u_h * 2.0), (-coord.y + u_v + u_vo) / (u_v * 2.0)));\n}\n}\n}",
bb="varying mediump vec2 v_texCoord;uniform sampler2D u_sampler;void main(void) {gl_FragColor = texture2D(u_sampler, v_texCoord);}";return{renderer:function(g,k,p,s){return new Ba(g,k,p,s)}}}(window,document);
window.pannellum=function(E,g,p){function Ba(s,k){function oa(){var a=g.createElement("div");a.innerHTML="\x3c!--[if lte IE 9]><i></i><![endif]--\x3e";if(1==a.getElementsByTagName("i").length)K();else{ra=b.hfov;Ga=b.pitch;var f;if("cubemap"==b.type){P=[];for(a=0;6>a;a++)P.push(new Image),P[a].crossOrigin=b.crossOrigin;q.load.lbox.style.display="block";q.load.lbar.style.display="none"}else if("multires"==b.type)a=JSON.parse(JSON.stringify(b.multiRes)),b.basePath&&b.multiRes.basePath&&!/^(?:[a-z]+:)?\/\//i.test(b.multiRes.basePath)?
a.basePath=b.basePath+b.multiRes.basePath:b.multiRes.basePath?a.basePath=b.multiRes.basePath:b.basePath&&(a.basePath=b.basePath),P=a;else if(!0===b.dynamic)P=b.panorama;else{if(b.panorama===p){K(b.strings.noPanoramaError);return}P=new Image}if("cubemap"==b.type)for(var n=6,c=function(){n--;0===n&&pa()},d=function(a){var ea=g.createElement("a");ea.href=a.target.src;ea.textContent=ea.href;K(b.strings.fileAccessError.replace("%s",ea.outerHTML))},a=0;a<P.length;a++)f=b.cubeMap[a],"null"==f?(console.log("Will use background instead of missing cubemap face "+
a),c()):(b.basePath&&!qa(f)&&(f=b.basePath+f),P[a].onload=c,P[a].onerror=d,P[a].src=I(f));else if("multires"==b.type)pa();else if(f="",b.basePath&&(f=b.basePath),!0!==b.dynamic){f=qa(b.panorama)?b.panorama:f+b.panorama;P.onload=function(){E.URL.revokeObjectURL(this.src);pa()};var e=new XMLHttpRequest;e.onloadend=function(){if(200!=e.status){var a=g.createElement("a");a.href=f;a.textContent=a.href;K(b.strings.fileAccessError.replace("%s",a.outerHTML))}Ba(this.response);q.load.msg.innerHTML=""};e.onprogress=
function(a){if(a.lengthComputable){q.load.lbarFill.style.width=a.loaded/a.total*100+"%";var b,ea;1E6<a.total?(b="MB",ea=(a.loaded/1E6).toFixed(2),a=(a.total/1E6).toFixed(2)):1E3<a.total?(b="kB",ea=(a.loaded/1E3).toFixed(1),a=(a.total/1E3).toFixed(1)):(b="B",ea=a.loaded,a=a.total);q.load.msg.innerHTML=ea+" / "+a+" "+b}else q.load.lbox.style.display="block",q.load.lbar.style.display="none"};try{e.open("GET",f,!0)}catch(h){K(b.strings.malformedURLError)}e.responseType="blob";e.setRequestHeader("Accept",
"image/*,*/*;q=0.9");e.withCredentials="use-credentials"===b.crossOrigin;e.send()}b.draggable&&J.classList.add("pnlm-grab");J.classList.remove("pnlm-grabbing");Ma=!0===b.dynamicUpdate;b.dynamic&&Ma&&(P=b.panorama,pa())}}function qa(a){return/^(?:[a-z]+:)?\/\//i.test(a)||"/"==a[0]||"blob:"==a.slice(0,5)}function pa(){C||(C=new libpannellum.renderer(M));Sa||(Sa=!0,W.addEventListener("mousedown",ka,!1),g.addEventListener("mousemove",ua,!1),g.addEventListener("mouseup",ma,!1),b.mouseZoom&&(J.addEventListener("mousewheel",
U,!1),J.addEventListener("DOMMouseScroll",U,!1)),b.doubleClickZoom&&W.addEventListener("dblclick",Ja,!1),s.addEventListener("mozfullscreenchange",d,!1),s.addEventListener("webkitfullscreenchange",d,!1),s.addEventListener("msfullscreenchange",d,!1),s.addEventListener("fullscreenchange",d,!1),E.addEventListener("resize",z,!1),E.addEventListener("orientationchange",z,!1),b.disableKeyboardCtrl||(s.addEventListener("keydown",V,!1),s.addEventListener("keyup",R,!1),s.addEventListener("blur",$,!1)),g.addEventListener("mouseleave",
ma,!1),""===g.documentElement.style.pointerAction&&""===g.documentElement.style.touchAction?(W.addEventListener("pointerdown",A,!1),W.addEventListener("pointermove",c,!1),W.addEventListener("pointerup",a,!1),W.addEventListener("pointerleave",a,!1)):(W.addEventListener("touchstart",Ka,!1),W.addEventListener("touchmove",la,!1),W.addEventListener("touchend",Ea,!1)),E.navigator.pointerEnabled&&(s.style.touchAction="none"));va();x(b.hfov);setTimeout(function(){},500)}function Ba(a){var f=new FileReader;
f.addEventListener("loadend",function(){var n=f.result;if(navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 8_/)){var c=n.indexOf("\u00ff\u00c2");(0>c||65536<c)&&K(b.strings.iOS8WebGLError)}c=n.indexOf("<x:xmpmeta");if(-1<c&&!0!==b.ignoreGPanoXMP){var d=n.substring(c,n.indexOf("</x:xmpmeta>")+12),e=function(a){var b;0<=d.indexOf(a+'="')?(b=d.substring(d.indexOf(a+'="')+a.length+2),b=b.substring(0,b.indexOf('"'))):0<=d.indexOf(a+">")&&(b=d.substring(d.indexOf(a+">")+a.length+1),b=b.substring(0,
b.indexOf("<")));return b!==p?Number(b):null},n=e("GPano:FullPanoWidthPixels"),c=e("GPano:CroppedAreaImageWidthPixels"),g=e("GPano:FullPanoHeightPixels"),h=e("GPano:CroppedAreaImageHeightPixels"),l=e("GPano:CroppedAreaTopPixels"),k=e("GPano:PoseHeadingDegrees"),m=e("GPano:PosePitchDegrees"),e=e("GPano:PoseRollDegrees");null!==n&&null!==c&&null!==g&&null!==h&&null!==l&&(0>aa.indexOf("haov")&&(b.haov=c/n*360),0>aa.indexOf("vaov")&&(b.vaov=h/g*180),0>aa.indexOf("vOffset")&&(b.vOffset=-180*((l+h/2)/g-
0.5)),null!==k&&0>aa.indexOf("northOffset")&&(b.northOffset=k,!1!==b.compass&&(b.compass=!0)),null!==m&&null!==e&&(0>aa.indexOf("horizonPitch")&&(b.horizonPitch=m),0>aa.indexOf("horizonRoll")&&(b.horizonRoll=e)))}P.src=E.URL.createObjectURL(a)});f.readAsBinaryString!==p?f.readAsBinaryString(a):f.readAsText(a)}function K(a){a===p&&(a=b.strings.genericWebGLError);q.errorMsg.innerHTML="<p>"+a+"</p>";v.load.style.display="none";q.load.box.style.display="none";q.errorMsg.style.display="table";Na=!0;G=
p;M.style.display="none";B("error",a)}function ja(a){var b=Q(a);fa.style.left=b.x+"px";fa.style.top=b.y+"px";clearTimeout(ja.t1);clearTimeout(ja.t2);fa.style.display="block";fa.style.opacity=1;ja.t1=setTimeout(function(){fa.style.opacity=0},2E3);ja.t2=setTimeout(function(){fa.style.display="none"},2500);a.preventDefault()}function Q(a){var b=s.getBoundingClientRect(),n={};n.x=(a.clientX||a.pageX)-b.left;n.y=(a.clientY||a.pageY)-b.top;return n}function ka(a){a.preventDefault();s.focus();if(G&&b.draggable){var f=
Q(a);if(b.hotSpotDebug){var n=ta(a);console.log("Pitch: "+n[0]+", Yaw: "+n[1]+", Center Pitch: "+b.pitch+", Center Yaw: "+b.yaw+", HFOV: "+b.hfov)}t();Da();b.roll=0;w.hfov=0;ha=!0;N=Date.now();xa=f.x;ya=f.y;Oa=b.yaw;Pa=b.pitch;J.classList.add("pnlm-grabbing");J.classList.remove("pnlm-grab");B("mousedown",a);F()}}function Ja(a){b.minHfov===b.hfov?da.setHfov(ra,1E3):(a=ta(a),da.lookAt(a[0],a[1],b.minHfov,1E3))}function ta(a){var f=Q(a);a=C.getCanvas();var n=a.clientWidth,c=a.clientHeight;a=f.x/n*2-
1;var c=(1-f.y/c*2)*c/n,e=1/Math.tan(b.hfov*Math.PI/360),d=Math.sin(b.pitch*Math.PI/180),g=Math.cos(b.pitch*Math.PI/180),f=e*g-c*d,n=Math.sqrt(a*a+f*f),c=180*Math.atan((c*g+e*d)/n)/Math.PI;a=180*Math.atan2(a/n,f/n)/Math.PI+b.yaw;-180>a&&(a+=360);180<a&&(a-=360);return[c,a]}function ua(a){if(ha&&G){N=Date.now();var f=C.getCanvas(),n=f.clientWidth,f=f.clientHeight;a=Q(a);var c=180*(Math.atan(xa/n*2-1)-Math.atan(a.x/n*2-1))/Math.PI*b.hfov/90+Oa;w.yaw=(c-b.yaw)%360*0.2;b.yaw=c;n=360*Math.atan(Math.tan(b.hfov/
360*Math.PI)*f/n)/Math.PI;n=180*(Math.atan(a.y/f*2-1)-Math.atan(ya/f*2-1))/Math.PI*n/90+Pa;w.pitch=0.2*(n-b.pitch);b.pitch=n}}function ma(a){ha&&(ha=!1,15<Date.now()-N&&(w.pitch=w.yaw=0),J.classList.add("pnlm-grab"),J.classList.remove("pnlm-grabbing"),N=Date.now(),B("mouseup",a))}function Ka(a){if(G&&b.draggable){t();Da();b.roll=0;w.hfov=0;var f=Q(a.targetTouches[0]);xa=f.x;ya=f.y;if(2==a.targetTouches.length){var n=Q(a.targetTouches[1]);xa+=0.5*(n.x-f.x);ya+=0.5*(n.y-f.y);Ha=Math.sqrt((f.x-n.x)*
(f.x-n.x)+(f.y-n.y)*(f.y-n.y))}ha=!0;N=Date.now();Oa=b.yaw;Pa=b.pitch;B("touchstart",a);F()}}function la(a){if(b.draggable&&(a.preventDefault(),G&&(N=Date.now()),ha&&G)){var f=Q(a.targetTouches[0]),n=f.x,c=f.y;2==a.targetTouches.length&&-1!=Ha&&(a=Q(a.targetTouches[1]),n+=0.5*(a.x-f.x),c+=0.5*(a.y-f.y),f=Math.sqrt((f.x-a.x)*(f.x-a.x)+(f.y-a.y)*(f.y-a.y)),x(b.hfov+0.1*(Ha-f)),Ha=f);f=b.hfov/360*b.touchPanSpeedCoeffFactor;n=(xa-n)*f+Oa;w.yaw=(n-b.yaw)%360*0.2;b.yaw=n;c=(c-ya)*f+Pa;w.pitch=0.2*(c-b.pitch);
b.pitch=c}}function Ea(){ha=!1;150<Date.now()-N&&(w.pitch=w.yaw=0);Ha=-1;N=Date.now();B("touchend",event)}function A(a){"touch"==a.pointerType&&G&&b.draggable&&(ia.push(a.pointerId),za.push({clientX:a.clientX,clientY:a.clientY}),a.targetTouches=za,Ka(a),a.preventDefault())}function c(a){if("touch"==a.pointerType&&b.draggable)for(var f=0;f<ia.length;f++)if(a.pointerId==ia[f]){za[f].clientX=a.clientX;za[f].clientY=a.clientY;a.targetTouches=za;la(a);a.preventDefault();break}}function a(a){if("touch"==
a.pointerType){for(var b=!1,n=0;n<ia.length;n++)a.pointerId==ia[n]&&(ia[n]=p),ia[n]&&(b=!0);b||(ia=[],za=[],Ea());a.preventDefault()}}function U(a){G&&("fullscreenonly"!=b.mouseZoom||Aa)&&(a.preventDefault(),t(),N=Date.now(),a.wheelDeltaY?(x(b.hfov-0.05*a.wheelDeltaY),w.hfov=0>a.wheelDelta?1:-1):a.wheelDelta?(x(b.hfov-0.05*a.wheelDelta),w.hfov=0>a.wheelDelta?1:-1):a.detail&&(x(b.hfov+1.5*a.detail),w.hfov=0<a.detail?1:-1),F())}function V(a){t();N=Date.now();Da();b.roll=0;var f=a.which||a.keycode;0>
b.capturedKeyNumbers.indexOf(f)||(a.preventDefault(),27==f?Aa&&h():wa(f,!0))}function $(){for(var a=0;10>a;a++)r[a]=!1}function R(a){var f=a.which||a.keycode;0>b.capturedKeyNumbers.indexOf(f)||(a.preventDefault(),wa(f,!1))}function wa(a,b){var n=!1;switch(a){case 109:case 189:case 17:case 173:r[0]!=b&&(n=!0);r[0]=b;break;case 107:case 187:case 16:case 61:r[1]!=b&&(n=!0);r[1]=b;break;case 38:r[2]!=b&&(n=!0);r[2]=b;break;case 87:r[6]!=b&&(n=!0);r[6]=b;break;case 40:r[3]!=b&&(n=!0);r[3]=b;break;case 83:r[7]!=
b&&(n=!0);r[7]=b;break;case 37:r[4]!=b&&(n=!0);r[4]=b;break;case 65:r[8]!=b&&(n=!0);r[8]=b;break;case 39:r[5]!=b&&(n=!0);r[5]=b;break;case 68:r[9]!=b&&(n=!0),r[9]=b}n&&b&&(ba="undefined"!==typeof performance&&performance.now()?performance.now():Date.now(),F())}function ga(){if(G){var a=!1,f=b.pitch,n=b.yaw,c=b.hfov,e;e="undefined"!==typeof performance&&performance.now()?performance.now():Date.now();ba===p&&(ba=e);var d=(e-ba)*b.hfov/1700,d=Math.min(d,1);r[0]&&!0===b.keyboardZoom&&(x(b.hfov+(0.8*w.hfov+
0.5)*d),a=!0);r[1]&&!0===b.keyboardZoom&&(x(b.hfov+(0.8*w.hfov-0.2)*d),a=!0);if(r[2]||r[6])b.pitch+=(0.8*w.pitch+0.2)*d,a=!0;if(r[3]||r[7])b.pitch+=(0.8*w.pitch-0.2)*d,a=!0;if(r[4]||r[8])b.yaw+=(0.8*w.yaw-0.2)*d,a=!0;if(r[5]||r[9])b.yaw+=(0.8*w.yaw+0.2)*d,a=!0;a&&(N=Date.now());if(b.autoRotate){if(0.001<e-ba){var a=(e-ba)/1E3,g=(w.yaw/a*d-0.2*b.autoRotate)*a,g=(0<-b.autoRotate?1:-1)*Math.min(Math.abs(b.autoRotate*a),Math.abs(g));b.yaw+=g}b.autoRotateStopDelay&&(b.autoRotateStopDelay-=e-ba,0>=b.autoRotateStopDelay&&
(b.autoRotateStopDelay=!1,Z=b.autoRotate,b.autoRotate=0))}O.pitch&&(m("pitch"),f=b.pitch);O.yaw&&(m("yaw"),n=b.yaw);O.hfov&&(m("hfov"),c=b.hfov);0<d&&!b.autoRotate&&(a=1-b.friction,r[4]||r[5]||r[8]||r[9]||O.yaw||(b.yaw+=w.yaw*d*a),r[2]||r[3]||r[6]||r[7]||O.pitch||(b.pitch+=w.pitch*d*a),r[0]||r[1]||O.hfov||x(b.hfov+w.hfov*d*a));ba=e;0<d&&(w.yaw=0.8*w.yaw+(b.yaw-n)/d*0.2,w.pitch=0.8*w.pitch+(b.pitch-f)/d*0.2,w.hfov=0.8*w.hfov+(b.hfov-c)/d*0.2,f=b.autoRotate?Math.abs(b.autoRotate):5,w.yaw=Math.min(f,
Math.max(w.yaw,-f)),w.pitch=Math.min(f,Math.max(w.pitch,-f)),w.hfov=Math.min(f,Math.max(w.hfov,-f)));r[0]&&r[1]&&(w.hfov=0);(r[2]||r[6])&&(r[3]||r[7])&&(w.pitch=0);(r[4]||r[8])&&(r[5]||r[9])&&(w.yaw=0)}}function m(a){var f=O[a],n=Math.min(1,Math.max((Date.now()-f.startTime)/1E3/(f.duration/1E3),0)),n=f.startPosition+b.animationTimingFunction(n)*(f.endPosition-f.startPosition);if(f.endPosition>f.startPosition&&n>=f.endPosition||f.endPosition<f.startPosition&&n<=f.endPosition||f.endPosition===f.startPosition)n=
f.endPosition,w[a]=0,delete O[a];b[a]=n}function z(){d("resize")}function F(){Ta||(Ta=!0,ca())}function ca(){if(!Za)if(Fa(),Qa&&clearTimeout(Qa),ha||!0===X)requestAnimationFrame(ca);else if(r[0]||r[1]||r[2]||r[3]||r[4]||r[5]||r[6]||r[7]||r[8]||r[9]||b.autoRotate||O.pitch||O.yaw||O.hfov||0.01<Math.abs(w.yaw)||0.01<Math.abs(w.pitch)||0.01<Math.abs(w.hfov))ga(),0<=b.autoRotateInactivityDelay&&Z&&Date.now()-N>b.autoRotateInactivityDelay&&!b.autoRotate&&(b.autoRotate=Z,da.lookAt(Ga,p,ra,3E3)),requestAnimationFrame(ca);
else if(C&&(C.isLoading()||!0===b.dynamic&&Ma))requestAnimationFrame(ca);else{B("animatefinished",{pitch:da.getPitch(),yaw:da.getYaw(),hfov:da.getHfov()});Ta=!1;ba=p;var a=b.autoRotateInactivityDelay-(Date.now()-N);0<a?Qa=setTimeout(function(){b.autoRotate=Z;da.lookAt(Ga,p,ra,3E3);F()},a):0<=b.autoRotateInactivityDelay&&Z&&(b.autoRotate=Z,da.lookAt(Ga,p,ra,3E3),F())}}function Fa(){var a;if(G){var f=C.getCanvas();!1!==b.autoRotate&&(360<b.yaw?b.yaw-=360:-360>b.yaw&&(b.yaw+=360));a=b.yaw;var n=0;if(b.avoidShowingBackground){var c=
b.hfov/2,d=180*Math.atan2(Math.tan(c/180*Math.PI),f.width/f.height)/Math.PI;b.vaov>b.haov?Math.min(Math.cos((b.pitch-c)/180*Math.PI),Math.cos((b.pitch+c)/180*Math.PI)):n=c*(1-Math.min(Math.cos((b.pitch-d)/180*Math.PI),Math.cos((b.pitch+d)/180*Math.PI)))}var c=b.maxYaw-b.minYaw,d=-180,e=180;360>c&&(d=b.minYaw+b.hfov/2+n,e=b.maxYaw-b.hfov/2-n,c<b.hfov&&(d=e=(d+e)/2),b.yaw=Math.max(d,Math.min(e,b.yaw)));!1===b.autoRotate&&(360<b.yaw?b.yaw-=360:-360>b.yaw&&(b.yaw+=360));!1!==b.autoRotate&&a!=b.yaw&&ba!==
p&&(b.autoRotate*=-1);a=2*Math.atan(Math.tan(b.hfov/180*Math.PI*0.5)/(f.width/f.height))/Math.PI*180;f=b.minPitch+a/2;n=b.maxPitch-a/2;b.maxPitch-b.minPitch<a&&(f=n=(f+n)/2);isNaN(f)&&(f=-90);isNaN(n)&&(n=90);b.pitch=Math.max(f,Math.min(n,b.pitch));C.render(b.pitch*Math.PI/180,b.yaw*Math.PI/180,b.hfov*Math.PI/180,{roll:b.roll*Math.PI/180});b.hotSpots.forEach(Ca);b.compass&&(Ia.style.transform="rotate("+(-b.yaw-b.northOffset)+"deg)",Ia.style.webkitTransform="rotate("+(-b.yaw-b.northOffset)+"deg)")}}
function Y(a,b,c,d){this.w=a;this.x=b;this.y=c;this.z=d}function na(a){var f;f=a.alpha;var c=a.beta;a=a.gamma;c=[c?c*Math.PI/180/2:0,a?a*Math.PI/180/2:0,f?f*Math.PI/180/2:0];f=[Math.cos(c[0]),Math.cos(c[1]),Math.cos(c[2])];c=[Math.sin(c[0]),Math.sin(c[1]),Math.sin(c[2])];f=new Y(f[0]*f[1]*f[2]-c[0]*c[1]*c[2],c[0]*f[1]*f[2]-f[0]*c[1]*c[2],f[0]*c[1]*f[2]+c[0]*f[1]*c[2],f[0]*f[1]*c[2]+c[0]*c[1]*f[2]);f=f.multiply(new Y(Math.sqrt(0.5),-Math.sqrt(0.5),0,0));c=E.orientation?-E.orientation*Math.PI/180/2:
0;f=f.multiply(new Y(Math.cos(c),0,-Math.sin(c),0)).toEulerAngles();"number"==typeof X&&10>X?X+=1:10===X?($a=f[2]/Math.PI*180+b.yaw,X=!0,requestAnimationFrame(ca)):(b.pitch=f[0]/Math.PI*180,b.roll=-f[1]/Math.PI*180,b.yaw=-f[2]/Math.PI*180+$a)}function va(){try{var a={};b.horizonPitch!==p&&(a.horizonPitch=b.horizonPitch*Math.PI/180);b.horizonRoll!==p&&(a.horizonRoll=b.horizonRoll*Math.PI/180);b.backgroundColor!==p&&(a.backgroundColor=b.backgroundColor);C.init(P,b.type,b.dynamic,b.haov*Math.PI/180,
b.vaov*Math.PI/180,b.vOffset*Math.PI/180,S,a);!0!==b.dynamic&&(P=p)}catch(f){if("webgl error"==f.type||"no webgl"==f.type)K();else if("webgl size error"==f.type)K(b.strings.textureSizeError.replace("%s",f.width).replace("%s",f.maxWidth));else throw K(b.strings.unknownError),f;}}function S(){if(b.sceneFadeDuration&&C.fadeImg!==p){C.fadeImg.style.opacity=0;var a=C.fadeImg;delete C.fadeImg;setTimeout(function(){M.removeChild(a);B("scenechangefadedone")},b.sceneFadeDuration)}Ia.style.display=b.compass?
"inline":"none";L();q.load.box.style.display="none";sa!==p&&(M.removeChild(sa),sa=p);G=!0;B("load");F()}function La(a){a.pitch=Number(a.pitch)||0;a.yaw=Number(a.yaw)||0;var f=g.createElement("div");f.className="pnlm-hotspot-base";f.className=a.cssClass?f.className+(" "+a.cssClass):f.className+(" pnlm-hotspot pnlm-sprite pnlm-"+D(a.type));var c=g.createElement("span");a.text&&(c.innerHTML=D(a.text));var d;if(a.video){d=g.createElement("video");var e=a.video;b.basePath&&!qa(e)&&(e=b.basePath+e);d.src=
I(e);d.controls=!0;d.style.width=a.width+"px";M.appendChild(f);c.appendChild(d)}else if(a.image){e=a.image;b.basePath&&!qa(e)&&(e=b.basePath+e);d=g.createElement("a");d.href=I(a.URL?a.URL:e,!0);d.target="_blank";c.appendChild(d);var h=g.createElement("img");h.src=I(e);h.style.width=a.width+"px";h.style.paddingTop="5px";M.appendChild(f);d.appendChild(h);c.style.maxWidth="initial"}else if(a.URL){d=g.createElement("a");d.href=I(a.URL,!0);if(a.attributes)for(e in a.attributes)d.setAttribute(e,a.attributes[e]);
else d.target="_blank";M.appendChild(d);f.className+=" pnlm-pointer";c.className+=" pnlm-pointer";d.appendChild(f)}else a.sceneId&&(f.onclick=f.ontouchend=function(){f.clicked||(f.clicked=!0,y(a.sceneId,a.targetPitch,a.targetYaw,a.targetHfov));return!1},f.className+=" pnlm-pointer",c.className+=" pnlm-pointer"),M.appendChild(f);if(a.createTooltipFunc)a.createTooltipFunc(f,a.createTooltipArgs);else if(a.text||a.video||a.image)f.classList.add("pnlm-tooltip"),f.appendChild(c),c.style.width=c.scrollWidth-
20+"px",c.style.marginLeft=-(c.scrollWidth-f.offsetWidth)/2+"px",c.style.marginTop=-c.scrollHeight-12+"px";a.clickHandlerFunc&&(f.addEventListener("click",function(b){a.clickHandlerFunc(b,a.clickHandlerArgs)},"false"),f.className+=" pnlm-pointer",c.className+=" pnlm-pointer");a.div=f}function L(){Ua||(b.hotSpots?(b.hotSpots=b.hotSpots.sort(function(a,b){return a.pitch<b.pitch}),b.hotSpots.forEach(La)):b.hotSpots=[],Ua=!0,b.hotSpots.forEach(Ca))}function e(){var a=b.hotSpots;Ua=!1;delete b.hotSpots;
if(a)for(var f=0;f<a.length;f++){var c=a[f].div;if(c){for(;c.parentNode&&c.parentNode!=M;)c=c.parentNode;M.removeChild(c)}delete a[f].div}}function Ca(a){var f=Math.sin(a.pitch*Math.PI/180),c=Math.cos(a.pitch*Math.PI/180),d=Math.sin(b.pitch*Math.PI/180),e=Math.cos(b.pitch*Math.PI/180),g=Math.cos((-a.yaw+b.yaw)*Math.PI/180),h=f*d+c*g*e;if(90>=a.yaw&&-90<a.yaw&&0>=h||(90<a.yaw||-90>=a.yaw)&&0>=h)a.div.style.visibility="hidden";else{var l=Math.sin((-a.yaw+b.yaw)*Math.PI/180),k=Math.tan(b.hfov*Math.PI/
360);a.div.style.visibility="visible";var m=C.getCanvas(),p=m.clientWidth,m=m.clientHeight,f=[-p/k*l*c/h/2,-p/k*(f*e-c*g*d)/h/2],c=Math.sin(b.roll*Math.PI/180),d=Math.cos(b.roll*Math.PI/180),f=[f[0]*d-f[1]*c,f[0]*c+f[1]*d];f[0]+=(p-a.div.offsetWidth)/2;f[1]+=(m-a.div.offsetHeight)/2;p="translate("+f[0]+"px, "+f[1]+"px) translateZ(9999px) rotate("+b.roll+"deg)";a.scale&&(p+=" scale("+ra/b.hfov/h+")");a.div.style.webkitTransform=p;a.div.style.MozTransform=p;a.div.style.transform=p}}function H(a){b=
{};var f,c,d="haov vaov vOffset northOffset horizonPitch horizonRoll".split(" ");aa=[];for(f in Va)Va.hasOwnProperty(f)&&(b[f]=Va[f]);for(f in k.default)if(k.default.hasOwnProperty(f))if("strings"==f)for(c in k.default.strings)k.default.strings.hasOwnProperty(c)&&(b.strings[c]=D(k.default.strings[c]));else b[f]=k.default[f],0<=d.indexOf(f)&&aa.push(f);if(null!==a&&""!==a&&k.scenes&&k.scenes[a]){var e=k.scenes[a];for(f in e)if(e.hasOwnProperty(f))if("strings"==f)for(c in e.strings)e.strings.hasOwnProperty(c)&&
(b.strings[c]=D(e.strings[c]));else b[f]=e[f],0<=d.indexOf(f)&&aa.push(f);b.scene=a}for(f in k)if(k.hasOwnProperty(f))if("strings"==f)for(c in k.strings)k.strings.hasOwnProperty(c)&&(b.strings[c]=D(k.strings[c]));else b[f]=k[f],0<=d.indexOf(f)&&aa.push(f)}function l(a){if((a=a?a:!1)&&"preview"in b){var c=b.preview;b.basePath&&!qa(c)&&(c=b.basePath+c);sa=g.createElement("div");sa.className="pnlm-preview-img";sa.style.backgroundImage="url('"+I(c).replace(/"/g,"%22").replace(/'/g,"%27")+"')";M.appendChild(sa)}var c=
b.title,d=b.author;a&&("previewTitle"in b&&(b.title=b.previewTitle),"previewAuthor"in b&&(b.author=b.previewAuthor));b.hasOwnProperty("title")||(q.title.innerHTML="");b.hasOwnProperty("author")||(q.author.innerHTML="");b.hasOwnProperty("title")||b.hasOwnProperty("author")||(q.container.style.display="none");v.load.innerHTML="<p>"+b.strings.loadButtonLabel+"</p>";q.load.boxp.innerHTML=b.strings.loadingLabel;for(var e in b)if(b.hasOwnProperty(e))switch(e){case "title":q.title.innerHTML=D(b[e]);q.container.style.display=
"inline";break;case "author":var h=D(b[e]);b.authorURL&&(h=g.createElement("a"),h.href=I(b.authorURL,!0),h.target="_blank",h.innerHTML=D(b[e]),h=h.outerHTML);q.author.innerHTML=b.strings.bylineLabel.replace("%s",h);q.container.style.display="inline";break;case "fallback":h=g.createElement("a");h.href=I(b[e],!0);h.target="_blank";h.textContent="Click here to view this panorama in an alternative viewer.";var k=g.createElement("p");k.textContent="Your browser does not support WebGL.";k.appendChild(g.createElement("br"));
k.appendChild(h);q.errorMsg.innerHTML="";q.errorMsg.appendChild(k);break;case "hfov":x(Number(b[e]));break;case "autoLoad":!0===b[e]&&C===p&&(q.load.box.style.display="inline",v.load.style.display="none",oa());break;case "showZoomCtrl":v.zoom.style.display=b[e]&&!1!=b.showControls?"block":"none";break;case "showFullscreenCtrl":v.fullscreen.style.display=b[e]&&!1!=b.showControls&&("fullscreen"in g||"mozFullScreen"in g||"webkitIsFullScreen"in g||"msFullscreenElement"in g)?"block":"none";break;case "hotSpotDebug":Wa.style.display=
b[e]?"block":"none";break;case "showControls":b[e]||(v.orientation.style.display="none",v.zoom.style.display="none",v.fullscreen.style.display="none");break;case "orientationOnByDefault":b[e]&&Ra()}a&&(c?b.title=c:delete b.title,d?b.author=d:delete b.author)}function h(){if(G&&!Na)if(Aa)g.exitFullscreen?g.exitFullscreen():g.mozCancelFullScreen?g.mozCancelFullScreen():g.webkitCancelFullScreen?g.webkitCancelFullScreen():g.msExitFullscreen&&g.msExitFullscreen();else try{s.requestFullscreen?s.requestFullscreen():
s.mozRequestFullScreen?s.mozRequestFullScreen():s.msRequestFullscreen?s.msRequestFullscreen():s.webkitRequestFullScreen()}catch(a){}}function d(a){g.fullscreenElement||g.fullscreen||g.mozFullScreen||g.webkitIsFullScreen||g.msFullscreenElement?(v.fullscreen.classList.add("pnlm-fullscreen-toggle-button-active"),Aa=!0):(v.fullscreen.classList.remove("pnlm-fullscreen-toggle-button-active"),Aa=!1);"resize"!==a&&B("fullscreenchange",Aa);C.resize();x(b.hfov);F()}function u(a){var c=b.minHfov;"multires"==
b.type&&C&&!b.multiResMinHfov&&(c=Math.min(c,C.getCanvas().width/(b.multiRes.cubeResolution/90*0.9)));if(c>b.maxHfov)return console.log("HFOV bounds do not make sense (minHfov > maxHfov)."),b.hfov;var d=b.hfov,d=a<c?c:a>b.maxHfov?b.maxHfov:a;b.avoidShowingBackground&&C&&(a=C.getCanvas(),d=Math.min(d,360*Math.atan(Math.tan((b.maxPitch-b.minPitch)/360*Math.PI)/a.height*a.width)/Math.PI));return d}function x(a){b.hfov=u(a);B("zoomchange",b.hfov)}function t(){O={};Z=b.autoRotate?b.autoRotate:Z;b.autoRotate=
!1}function Ya(){Na&&(q.load.box.style.display="none",q.errorMsg.style.display="none",Na=!1,M.style.display="block",B("errorcleared"));G=!1;v.load.style.display="none";q.load.box.style.display="inline";oa()}function y(a,c,d,h,g){G||(g=!0);G=!1;O={};var m,q;if(b.sceneFadeDuration&&!g&&(m=C.render(b.pitch*Math.PI/180,b.yaw*Math.PI/180,b.hfov*Math.PI/180,{returnImage:!0}),m!==p)){g=new Image;g.className="pnlm-fade-img";g.style.transition="opacity "+b.sceneFadeDuration/1E3+"s";g.style.width="100%";g.style.height=
"100%";g.onload=function(){y(a,c,d,h,!0)};g.src=m;M.appendChild(g);C.fadeImg=g;return}g="same"===c?b.pitch:c;m="same"===d?b.yaw:"sameAzimuth"===d?b.yaw+(b.northOffset||0)-(k.scenes[a].northOffset||0):d;q="same"===h?b.hfov:h;e();H(a);w.yaw=w.pitch=w.hfov=0;l();g!==p&&(b.pitch=g);m!==p&&(b.yaw=m);q!==p&&(b.hfov=q);B("scenechange",a);Ya()}function Da(){E.removeEventListener("deviceorientation",na);v.orientation.classList.remove("pnlm-orientation-button-active");X=!1}function Ra(){"function"===typeof DeviceMotionEvent.requestPermission?
DeviceOrientationEvent.requestPermission().then(function(a){"granted"==a&&(X=1,E.addEventListener("deviceorientation",na),v.orientation.classList.add("pnlm-orientation-button-active"))}):(X=1,E.addEventListener("deviceorientation",na),v.orientation.classList.add("pnlm-orientation-button-active"))}function D(a){return k.escapeHTML?String(a).split(/&/g).join("&amp;").split('"').join("&quot;").split("'").join("&#39;").split("<").join("&lt;").split(">").join("&gt;").split("/").join("&#x2f;").split("\n").join("<br>"):
String(a).split("\n").join("<br>")}function I(a,b){try{var c=decodeURIComponent(ab(a)).replace(/[^\w:]/g,"").toLowerCase()}catch(d){return"about:blank"}return 0===c.indexOf("javascript:")||0===c.indexOf("vbscript:")?(console.log("Script URL removed."),"about:blank"):b&&0===c.indexOf("data:")?(console.log("Data URI removed from link."),"about:blank"):a}function ab(a){return a.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,function(a,b){b=b.toLowerCase();return"colon"===b?":":"#"===b.charAt(0)?
"x"===b.charAt(1)?String.fromCharCode(parseInt(b.substring(2),16)):String.fromCharCode(+b.substring(1)):""})}function B(a){if(a in T)for(var b=T[a].length;0<b;b--)T[a][T[a].length-b].apply(null,[].slice.call(arguments,1))}var da=this,b,C,sa,ha=!1,N=Date.now(),xa=0,ya=0,Ha=-1,Oa=0,Pa=0,r=Array(10),Aa=!1,G,Na=!1,Sa=!1,P,ba,w={yaw:0,pitch:0,hfov:0},Ta=!1,X=!1,$a=0,Qa,Z=0,ra,Ga,O={},T={},aa=[],Ma=!1,Ua=!1,Za=!1,Va={hfov:100,minHfov:50,multiResMinHfov:!1,maxHfov:120,pitch:0,minPitch:p,maxPitch:p,yaw:0,
minYaw:-180,maxYaw:180,roll:0,haov:360,vaov:180,vOffset:0,autoRotate:!1,autoRotateInactivityDelay:-1,autoRotateStopDelay:p,type:"equirectangular",northOffset:0,showFullscreenCtrl:!0,dynamic:!1,dynamicUpdate:!1,doubleClickZoom:!0,keyboardZoom:!0,mouseZoom:!0,showZoomCtrl:!0,autoLoad:!1,showControls:!0,orientationOnByDefault:!1,hotSpotDebug:!1,backgroundColor:[0,0,0],avoidShowingBackground:!1,animationTimingFunction:function(a){return 0.5>a?2*a*a:-1+(4-2*a)*a},draggable:!0,disableKeyboardCtrl:!1,crossOrigin:"anonymous",
touchPanSpeedCoeffFactor:1,capturedKeyNumbers:[16,17,27,37,38,39,40,61,65,68,83,87,107,109,173,187,189],friction:0.15,strings:{loadButtonLabel:"Click to<br>Load<br>Panorama",loadingLabel:"Loading...",bylineLabel:"by %s",noPanoramaError:"No panorama image was specified.",fileAccessError:"The file %s could not be accessed.",malformedURLError:"There is something wrong with the panorama URL.",iOS8WebGLError:"Due to iOS 8's broken WebGL implementation, only progressive encoded JPEGs work for your device (this panorama uses standard encoding).",
genericWebGLError:"Your browser does not have the necessary WebGL support to display this panorama.",textureSizeError:"This panorama is too big for your device! It's %spx wide, but your device only supports images up to %spx wide. Try another device. (If you're the author, try scaling down the image.)",unknownError:"Unknown error. Check developer console."}};s="string"===typeof s?g.getElementById(s):s;s.classList.add("pnlm-container");s.tabIndex=0;var J=g.createElement("div");J.className="pnlm-ui";
s.appendChild(J);var M=g.createElement("div");M.className="pnlm-render-container";s.appendChild(M);var W=g.createElement("div");W.className="pnlm-dragfix";J.appendChild(W);var fa=g.createElement("span");fa.className="pnlm-about-msg";fa.innerHTML='<a href="https://pannellum.org/" target="_blank">Pannellum</a> 2.5.6';J.appendChild(fa);W.addEventListener("contextmenu",ja);var q={},Wa=g.createElement("div");Wa.className="pnlm-sprite pnlm-hot-spot-debug-indicator";J.appendChild(Wa);q.container=g.createElement("div");
q.container.className="pnlm-panorama-info";q.title=g.createElement("div");q.title.className="pnlm-title-box";q.container.appendChild(q.title);q.author=g.createElement("div");q.author.className="pnlm-author-box";q.container.appendChild(q.author);J.appendChild(q.container);q.load={};q.load.box=g.createElement("div");q.load.box.className="pnlm-load-box";q.load.boxp=g.createElement("p");q.load.box.appendChild(q.load.boxp);q.load.lbox=g.createElement("div");q.load.lbox.className="pnlm-lbox";q.load.lbox.innerHTML=
'<div class="pnlm-loading"></div>';q.load.box.appendChild(q.load.lbox);q.load.lbar=g.createElement("div");q.load.lbar.className="pnlm-lbar";q.load.lbarFill=g.createElement("div");q.load.lbarFill.className="pnlm-lbar-fill";q.load.lbar.appendChild(q.load.lbarFill);q.load.box.appendChild(q.load.lbar);q.load.msg=g.createElement("p");q.load.msg.className="pnlm-lmsg";q.load.box.appendChild(q.load.msg);J.appendChild(q.load.box);q.errorMsg=g.createElement("div");q.errorMsg.className="pnlm-error-msg pnlm-info-box";
J.appendChild(q.errorMsg);var v={};v.container=g.createElement("div");v.container.className="pnlm-controls-container";J.appendChild(v.container);v.load=g.createElement("div");v.load.className="pnlm-load-button";v.load.addEventListener("click",function(){l();Ya()});J.appendChild(v.load);v.zoom=g.createElement("div");v.zoom.className="pnlm-zoom-controls pnlm-controls";v.zoomIn=g.createElement("div");v.zoomIn.className="pnlm-zoom-in pnlm-sprite pnlm-control";v.zoomIn.addEventListener("click",function(){G&&
(x(b.hfov-5),F())});v.zoom.appendChild(v.zoomIn);v.zoomOut=g.createElement("div");v.zoomOut.className="pnlm-zoom-out pnlm-sprite pnlm-control";v.zoomOut.addEventListener("click",function(){G&&(x(b.hfov+5),F())});v.zoom.appendChild(v.zoomOut);v.container.appendChild(v.zoom);v.fullscreen=g.createElement("div");v.fullscreen.addEventListener("click",h);v.fullscreen.className="pnlm-fullscreen-toggle-button pnlm-sprite pnlm-fullscreen-toggle-button-inactive pnlm-controls pnlm-control";(g.fullscreenEnabled||
g.mozFullScreenEnabled||g.webkitFullscreenEnabled||g.msFullscreenEnabled)&&v.container.appendChild(v.fullscreen);v.orientation=g.createElement("div");v.orientation.addEventListener("click",function(a){X?Da():Ra()});v.orientation.addEventListener("mousedown",function(a){a.stopPropagation()});v.orientation.addEventListener("touchstart",function(a){a.stopPropagation()});v.orientation.addEventListener("pointerdown",function(a){a.stopPropagation()});v.orientation.className="pnlm-orientation-button pnlm-orientation-button-inactive pnlm-sprite pnlm-controls pnlm-control";
var Xa=!1;E.DeviceOrientationEvent&&"https:"==location.protocol&&0<=navigator.userAgent.toLowerCase().indexOf("mobi")&&(v.container.appendChild(v.orientation),Xa=!0);var Ia=g.createElement("div");Ia.className="pnlm-compass pnlm-controls pnlm-control";J.appendChild(Ia);k.firstScene?H(k.firstScene):k.default&&k.default.firstScene?H(k.default.firstScene):H(null);l(!0);var ia=[],za=[];Y.prototype.multiply=function(a){return new Y(this.w*a.w-this.x*a.x-this.y*a.y-this.z*a.z,this.x*a.w+this.w*a.x+this.y*
a.z-this.z*a.y,this.y*a.w+this.w*a.y+this.z*a.x-this.x*a.z,this.z*a.w+this.w*a.z+this.x*a.y-this.y*a.x)};Y.prototype.toEulerAngles=function(){var a=Math.atan2(2*(this.w*this.x+this.y*this.z),1-2*(this.x*this.x+this.y*this.y)),b=Math.asin(2*(this.w*this.y-this.z*this.x)),c=Math.atan2(2*(this.w*this.z+this.x*this.y),1-2*(this.y*this.y+this.z*this.z));return[a,b,c]};this.isLoaded=function(){return Boolean(G)};this.getPitch=function(){return b.pitch};this.setPitch=function(a,c,d,e){N=Date.now();if(1E-6>=
Math.abs(a-b.pitch))return"function"==typeof d&&d(e),this;(c=c==p?1E3:Number(c))?(O.pitch={startTime:Date.now(),startPosition:b.pitch,endPosition:a,duration:c},"function"==typeof d&&setTimeout(function(){d(e)},c)):b.pitch=a;F();return this};this.getPitchBounds=function(){return[b.minPitch,b.maxPitch]};this.setPitchBounds=function(a){b.minPitch=Math.max(-90,Math.min(a[0],90));b.maxPitch=Math.max(-90,Math.min(a[1],90));return this};this.getYaw=function(){return(b.yaw+540)%360-180};this.setYaw=function(a,
c,d,e){N=Date.now();if(1E-6>=Math.abs(a-b.yaw))return"function"==typeof d&&d(e),this;c=c==p?1E3:Number(c);a=(a+180)%360-180;c?(180<b.yaw-a?a+=360:180<a-b.yaw&&(a-=360),O.yaw={startTime:Date.now(),startPosition:b.yaw,endPosition:a,duration:c},"function"==typeof d&&setTimeout(function(){d(e)},c)):b.yaw=a;F();return this};this.getYawBounds=function(){return[b.minYaw,b.maxYaw]};this.setYawBounds=function(a){b.minYaw=Math.max(-360,Math.min(a[0],360));b.maxYaw=Math.max(-360,Math.min(a[1],360));return this};
this.getHfov=function(){return b.hfov};this.setHfov=function(a,c,d,e){N=Date.now();if(1E-6>=Math.abs(a-b.hfov))return"function"==typeof d&&d(e),this;(c=c==p?1E3:Number(c))?(O.hfov={startTime:Date.now(),startPosition:b.hfov,endPosition:u(a),duration:c},"function"==typeof d&&setTimeout(function(){d(e)},c)):x(a);F();return this};this.getHfovBounds=function(){return[b.minHfov,b.maxHfov]};this.setHfovBounds=function(a){b.minHfov=Math.max(0,a[0]);b.maxHfov=Math.max(0,a[1]);return this};this.lookAt=function(a,
c,d,e,g,h){e=e==p?1E3:Number(e);a!==p&&1E-6<Math.abs(a-b.pitch)&&(this.setPitch(a,e,g,h),g=p);c!==p&&1E-6<Math.abs(c-b.yaw)&&(this.setYaw(c,e,g,h),g=p);d!==p&&1E-6<Math.abs(d-b.hfov)&&(this.setHfov(d,e,g,h),g=p);"function"==typeof g&&g(h);return this};this.getNorthOffset=function(){return b.northOffset};this.setNorthOffset=function(a){b.northOffset=Math.min(360,Math.max(0,a));F();return this};this.getHorizonRoll=function(){return b.horizonRoll};this.setHorizonRoll=function(a){b.horizonRoll=Math.min(90,
Math.max(-90,a));C.setPose(b.horizonPitch*Math.PI/180,b.horizonRoll*Math.PI/180);F();return this};this.getHorizonPitch=function(){return b.horizonPitch};this.setHorizonPitch=function(a){b.horizonPitch=Math.min(90,Math.max(-90,a));C.setPose(b.horizonPitch*Math.PI/180,b.horizonRoll*Math.PI/180);F();return this};this.startAutoRotate=function(a,c){a=a||Z||1;c=c===p?Ga:c;b.autoRotate=a;da.lookAt(c,p,ra,3E3);F();return this};this.stopAutoRotate=function(){Z=b.autoRotate?b.autoRotate:Z;b.autoRotate=!1;b.autoRotateInactivityDelay=
-1;return this};this.stopMovement=function(){t();w={yaw:0,pitch:0,hfov:0}};this.getRenderer=function(){return C};this.setUpdate=function(a){Ma=!0===a;C===p?pa():F();return this};this.mouseEventToCoords=function(a){return ta(a)};this.loadScene=function(a,b,c,d){!1!==G&&y(a,b,c,d);return this};this.getScene=function(){return b.scene};this.addScene=function(a,b){k.scenes[a]=b;return this};this.removeScene=function(a){if(b.scene===a||!k.scenes.hasOwnProperty(a))return!1;delete k.scenes[a];return!0};this.toggleFullscreen=
function(){h();return this};this.getConfig=function(){return b};this.getContainer=function(){return s};this.addHotSpot=function(a,c){if(c===p&&b.scene===p)b.hotSpots.push(a);else{var d=c!==p?c:b.scene;if(k.scenes.hasOwnProperty(d))k.scenes[d].hasOwnProperty("hotSpots")||(k.scenes[d].hotSpots=[],d==b.scene&&(b.hotSpots=k.scenes[d].hotSpots)),k.scenes[d].hotSpots.push(a);else throw"Invalid scene ID!";}if(c===p||b.scene==c)La(a),G&&Ca(a);return this};this.removeHotSpot=function(a,c){if(c===p||b.scene==
c){if(!b.hotSpots)return!1;for(var d=0;d<b.hotSpots.length;d++)if(b.hotSpots[d].hasOwnProperty("id")&&b.hotSpots[d].id===a){for(var e=b.hotSpots[d].div;e.parentNode!=M;)e=e.parentNode;M.removeChild(e);delete b.hotSpots[d].div;b.hotSpots.splice(d,1);return!0}}else if(k.scenes.hasOwnProperty(c)){if(!k.scenes[c].hasOwnProperty("hotSpots"))return!1;for(d=0;d<k.scenes[c].hotSpots.length;d++)if(k.scenes[c].hotSpots[d].hasOwnProperty("id")&&k.scenes[c].hotSpots[d].id===a)return k.scenes[c].hotSpots.splice(d,
1),!0}else return!1};this.resize=function(){C&&z()};this.isLoaded=function(){return G};this.isOrientationSupported=function(){return Xa||!1};this.stopOrientation=function(){Da()};this.startOrientation=function(){Xa&&Ra()};this.isOrientationActive=function(){return Boolean(X)};this.on=function(a,b){T[a]=T[a]||[];T[a].push(b);return this};this.off=function(a,b){if(!a)return T={},this;if(b){var c=T[a].indexOf(b);0<=c&&T[a].splice(c,1);0==T[a].length&&delete T[a]}else delete T[a];return this};this.destroy=
function(){Za=!0;clearTimeout(Qa);C&&C.destroy();Sa&&(g.removeEventListener("mousemove",ua,!1),g.removeEventListener("mouseup",ma,!1),s.removeEventListener("mozfullscreenchange",d,!1),s.removeEventListener("webkitfullscreenchange",d,!1),s.removeEventListener("msfullscreenchange",d,!1),s.removeEventListener("fullscreenchange",d,!1),E.removeEventListener("resize",z,!1),E.removeEventListener("orientationchange",z,!1),s.removeEventListener("keydown",V,!1),s.removeEventListener("keyup",R,!1),s.removeEventListener("blur",
$,!1),g.removeEventListener("mouseleave",ma,!1));s.innerHTML="";s.classList.remove("pnlm-container")}}return{viewer:function(g,k){return new Ba(g,k)}}}(window,document);

},{}],29:[function(require,module,exports){
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
typeof define === 'function' && define.amd ? define(factory) :
(global = global || self, global.TinyQueue = factory());
}(this, function () { 'use strict';

var TinyQueue = function TinyQueue(data, compare) {
    if ( data === void 0 ) data = [];
    if ( compare === void 0 ) compare = defaultCompare;

    this.data = data;
    this.length = this.data.length;
    this.compare = compare;

    if (this.length > 0) {
        for (var i = (this.length >> 1) - 1; i >= 0; i--) { this._down(i); }
    }
};

TinyQueue.prototype.push = function push (item) {
    this.data.push(item);
    this.length++;
    this._up(this.length - 1);
};

TinyQueue.prototype.pop = function pop () {
    if (this.length === 0) { return undefined; }

    var top = this.data[0];
    var bottom = this.data.pop();
    this.length--;

    if (this.length > 0) {
        this.data[0] = bottom;
        this._down(0);
    }

    return top;
};

TinyQueue.prototype.peek = function peek () {
    return this.data[0];
};

TinyQueue.prototype._up = function _up (pos) {
    var ref = this;
        var data = ref.data;
        var compare = ref.compare;
    var item = data[pos];

    while (pos > 0) {
        var parent = (pos - 1) >> 1;
        var current = data[parent];
        if (compare(item, current) >= 0) { break; }
        data[pos] = current;
        pos = parent;
    }

    data[pos] = item;
};

TinyQueue.prototype._down = function _down (pos) {
    var ref = this;
        var data = ref.data;
        var compare = ref.compare;
    var halfLength = this.length >> 1;
    var item = data[pos];

    while (pos < halfLength) {
        var left = (pos << 1) + 1;
        var best = data[left];
        var right = left + 1;

        if (right < this.length && compare(data[right], best) < 0) {
            left = right;
            best = data[right];
        }
        if (compare(best, item) >= 0) { break; }

        data[pos] = best;
        pos = left;
    }

    data[pos] = item;
};

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

return TinyQueue;

}));

},{}],30:[function(require,module,exports){
/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @module turf/point
 * @category helper
 * @param {number} longitude position west to east in decimal degrees
 * @param {number} latitude position south to north in decimal degrees
 * @param {Object} properties an Object that is used as the {@link Feature}'s
 * properties
 * @return {Point} a Point feature
 * @example
 * var pt1 = turf.point([-75.343, 39.984]);
 *
 * //=pt1
 */
var isArray = Array.isArray || function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};
module.exports = function(coordinates, properties) {
  if (!isArray(coordinates)) throw new Error('Coordinates must be an array');
  if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: coordinates
    },
    properties: properties || {}
  };
};

},{}]},{},[1]);
