# openpanos
A platform for creating linked, navigable networks of 360 panoramas.

## Introduction
OpenPanos is a platform for creating linked networks of 360 panoramas. It is based on the core engine of [OpenTrailView](https://opentrailview.org), a project to
create 360 tours of paths and trails. It uses various other libraries:

- [Photo Sphere Viewer](https://photo-sphere-viewer.js.org) - *NEW for version 0.2.0*, a flexible and powerful panorama viewing library, originally developed by Jéremy Heleine and enhanced by Damien Sorel.
- [GeoJSON Path Finder](https://www.liedman.net/geojson-path-finder/) - a library to create a routing graph from GeoJSON and route between two points. Developed by
Per Liedman; note that you have to currently use [my own fork](https://github.com/nickw1/geojson-path-finder) with OpenPanos (**included in this package**), 
as it relies on a bugfix which has not been merged into master on the original project yet. This is likely to change.

OpenPanos consists of two parts, a **client** and a **server**. It is possible to use the client without the server if you provide your own server.

### The client ###
The client (`openpanos-client`; this package) is Photo Sphere Viewer and GeoJSON Path Finder-based, and handles displaying and linking the panoramas.  By default, the client will work with the OpenPanos server. However this is configurable and you can connect it to your own PostGIS-based API.

#### Basic usage of the client ####

You use the `Client` object, which is exported from the `openpanos-client` module, e.g.:
``` javascript
// Import the module
const openpanos = require('openpanos-client');
const client = new openpanos.Client();
```

The `Client` object has various methods. Note that many of these rely on a
server-side API being available, see below for details. In particular, to load the panoramas, you must provide a **`panoImg`** API endpoint which serves a given panorama by ID. The `openpanos-server` package will provide these endpoints for you, as long as you have the appropriate database setup. See `openpanos-server` for details on this.

**Note all methods are asynchronous and thus return a promise, except for the `on` event-handling method.**

- `findPanoramaByLonLat(lon, lat)` : finds and loads the nearest panorama
to a given latitude and longitude.
	- * You must have a **`nearest`** API endpoint setup, to find the nearest panorama server-side. `openpanos-server` will provide this for you, or use your own. See below.

- `loadPanorama(id)` - will load a given panorama by ID.
	- * You must have a **`byID`** API endpoint setup, to find the panorama with that ID. `openpanos-server` will provide this for you, or use your own. See below.

- `moveTo(id)` - moves to an already-loaded panorama with a given ID.

- `update(id, properties)` - updates selected metadata of a given panorama
referenced by ID. The `properties` parameter is an object containing this
metadata and can contain one or both of the following properties:
	- `position` (a two-member array of longitude and latitude);
	- `poseheadingdegrees` (a float, the bearing of the centre point of the panorama).

- `on(eventname, eventhandler)`- handle events with an event handler function.
The events that are currently handled are:
	- `panoChanged`: when the current panorama changes. The ID of the new panorama is passed as an argument to the event handler.
	- `locationChanged`: when the current location changes. The new longitude and latitude, respectively, are passed as arguments to the event handler.

#### Setting up API endpoints ####

For OpenPanos to work, you need a server set up which will provide your panorama images, find panorama metadata by ID, find the nearest panorama to a given latitude and longitude, and find panoramas near to the current one.

If you use `openpanos-server`, you do not need to do this as the endpoints are setup for you. Otherwise, these endpoints can be specified as options when you create your `Client` object:

```javascript
const Client = new openpanos.Client({
	api: {
		byId: , // ... returns metadata of a panorama with a given ID
		nearest: , // ... finds the nearest panorama to a given lat/lon
		panoImg: , // ... returns the actual image of a panorama with a given ID
		panoImgResized: , // ... returns the panorama image resized to a given pixel width (optional)
		geojson: , // returns GeoJSON of all routes (such as OSM ways) within a given bounding box
		nearby: , // returns panoramas near to a given panorama
	}
});
```

Each endpoint is described in detail below, along with its default value (which is provided by `openpanos-server`). Note that values in braces will be replaced by the code with whatever the current value is.

**`byId` endpoint** (default `op/panorama/{id}`) : returns a JSON object with these properties:
- `id`: the pano ID
- `userid`: the ID of the user the pano belongs to (optional)
- `authorised`: is the panorama authorised yet? (optional)
- `lon`: the longitude 
- `lat`: the latitude 
- `poseheadingdegrees`: the bearing of the centre of the panorama.

**`nearest` endpoint** (default `op/panorama/nearest/{lon}/{lat]`) : returns a JSON object containing the panorama nearest to the given lon and lat. **Returns the same JSON as `byID`**.

**`panoImg` endpoint** (default `op/panorama/{id}.jpg`) : returns the JPEG image of the panorama itself. May contain checks, e.g. has the panorama been authorised yet.

**`panoImgResized` endpoint** (default `op/panorama/{id}w{width}.jpg`) : returns the JPEG image of the panorama itself, resized to a given width. Useful for thumbnails and previews. Optional.

**`geojson` endpoint** (default `op/map/highways`) : expects one *query string* parameter `bbox` containing w,s,e,n in WGS84 lat/lon. Returns GeoJSON data of all highways (routes, including paths) in the given bounding box, for example OpenStreetMap highways. 

**`nearby` endpoint** (default `op/panorama/{id}/nearby`} : returns all panoramas nearby to a given source panorama. It's up to you how you define "nearby", but this call is necessary to link panoramas to adjacent ones, so don't set the value too small. `openpanos-server` and OpenTrailView use 500 metres. It should return a JSON object containing:
- `panos` : an array of individual panorama objects (see `byId` and `nearest` above);
- `bbox` : the bounding box of all panoramas returned.

### The server ###
The [server](https://www.npmjs.com/package/openpanos-server) (`openpanos-server`) is node.js based and by default, works with a standard OpenStreetMap PostGIS database to serve OpenStreetMap data as GeoJSON, which is used to link the panoramas.  See the `openpanos-server` package for details.
