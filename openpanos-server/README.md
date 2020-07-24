# openpanos
A platform for creating linked, navigable networks of 360 panoramas.

## Introduction
OpenPanos is a platform for creating linked networks of 360 panoramas. It is based on the core engine of [OpenTrailView](https://opentrailview.org), a project to create 360 tours of paths and trails.

### The server
This is the server package: `openpanos-server`. It is node.js based and works with a standard OpenStreetMap PostGIS database to serve OpenStreetMap data as GeoJSON, which is used to link the panoramas. To populate this database, you need to:
- download a standard `osm.pbf` file, e.g. from [Geofabrik](https://download.geofabrik.de); 
- use [Osmosis](https://wiki.openstreetmap.org/wiki/Osmosis) to extract the area you want; 
- use [osm2pgsql](https://wiki.openstreetmap.org/wiki/Osm2pgsql) to import the data into the database. You need to install PostgreSQL with the PostGIS extensions; see [here](https://wiki.openstreetmap.org/wiki/PostGIS) for more details.

#### To use
The `demo-app` within the repository gives an example. The server package should
be used as an Express route; it exports a `Router` object with the endpoints detailed below (specifically it's an `express-promise-router` object as `async`/`await` is used). So you can import this module and use it as a route in an Express application.
```javascript
const express = require('express');
const app = express();
app.use('/op', require('openpanos-server'));
```
In this example, the `/op` route will be used for all endpoints of `openpanos-server`. So you would prepend the endpoints listed below with `/op`.

#### Endpoints
The server features the following endpoints:

**`GET /panorama/:id`** : returns a JSON object with these prerties:
- `id`: the pano ID
- `userid`: the ID of the user the pano belongs to (optional)
- `authorised`: is the panorama authorised yet? (optional)
- `lon`: the longitude 
- `lat`: the latitude 
- `poseheadingdegrees`: the bearing of the centre of the panorama.

**`GET /panorama/nearest/:lon/:lat`** : returns a JSON object containing the panorama nearest to the given lon and lat. **Returns the same JSON as `byID`**.

**`GET /panorama/:id.jpg`** : returns the JPEG image of the panorama itself. May contain checks, e.g. has the panorama been authorised yet.

**`GET /panorama/:id(\\d+)w:width(\\d+).jpg`** : returns the JPEG image of the panorama itself, resized to a given width. Useful for thumbnails and previews. 

**`GET /map/highways`** : expects one *query string* parameter `bbox` containing w,s,e,n in WGS84 lat/lon. Returns GeoJSON data of all highways (routes, including paths) in the given bounding box, for example OpenStreetMap highways. 

**`GET /panorama/:id/nearby`** : returns all panoramas nearby to a given source panorama. It's up to you how you define "nearby", but this call is necessary to link panoramas to adjacent ones, so don't set the value too small. `openpanos-server` and OpenTrailView use 500 metres. It should return a JSON object containing:
- `panos` : an array of individual panorama objects (see `byId` and `nearest` above);
- `bbox` : the bounding box of all panoramas returned.

**`POST /panorama/:id/rotate`** : rotates a given panorama so that its centre has the bearing of the given number of degrees. Expects a JSON object containing:
- `poseheadingdegrees` : the new bearing of the centre of the panorama.
 
**`POST /panorama/:id/move`** : moves a given panorama to a given lat/lon. Expects a JSON object containing: 
- `lon` : the new longitude;
- `lat` : the new latitude.

**`POST /panorama/upload`** : uploads a new panorama. This should be sent
as `multipart/form-data`. Optionally, will take a JSON object containing longitude and latitude, as per the `move` endpoint. If this is sent, it will override the EXIF position within the panorama.

**`POST /panorama/:id/authorise`** : authorises a panorama. Note, however, that by default, panoramas can be viewed unauthorised.

**`DELETE /panorama/:id`** : deletes a panorama.

#### Configuration
You need to set up a `.env` file containing certain key settings: 
- `PANOS_DIR` : the directory panoramas will be uploaded to
- `DB_HOST` : the database host (usually localhost)
- `DB_USER` : the database user
- `DB_DBASE` : the database
- `TMPDIR` : a temporary files directory on your system. This is needed during the upload process. Might typically be something like `/var/www/tmp`

### The client
The server works with the client `openpanos-client`: see [here](https://www.npmjs.com/package/openpanos-client).

