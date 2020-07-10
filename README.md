# openpanos
A platform for creating linked, navigable networks of 360 panoramas.

## PLEASE NOTE
This documentation is not yet complete.

## Introduction
OpenPanos is a platform for creating linked networks of 360 panoramas. It is based on the core engine of [OpenTrailView](https://opentrailview.org), a project to
create 360 tours of paths and trails. It uses various other libraries:

- [Pannellum](https://pannellum.org) - a flexible and powerful panorama viewing library, developed by Matthew Petroff.
- [GeoJSON Path Finder](https://www.liedman.net/geojson-path-finder/) - a library to create a routing graph from GeoJSON and route between two points. Developed by
Per Liedman; note that you have to currently use [my own fork](https://github.com/nickw1/geojson-path-finder) with OpenPanos, as it relies on a bugfix which has not been merged into master on the 
original project yet. This is likely to change.

OpenPanos consists of two parts, a **client** and a **server**. It is possible to use the client without the server if you provide your own server.

### The client ###
The client is Pannellum and GeoJSON Path Finder-based, and handles displaying and linking the panoramas.
By default, the client will work with the OpenPanos server. However this is configurable and you can connect it to your own PostGIS-based API.

### The server ###
The server is node.js based and by default, works with a standard OpenStreetMap PostGIS database to serve OpenStreetMap data as GeoJSON, which is used to link the
panoramas. To populate this database, you need to download a standard `osm.pbf` file, e.g. from [Geofabrik](https://download.geofabrik.de), 
use [Osmosis](https://wiki.openstreetmap.org/wiki/Osmosis) to extract the area you want,
and then [osm2pgsql](https://wiki.openstreetmap.org/wiki/Osm2pgsql) to import the data into the database. See [here](https://wiki.openstreetmap.org/wiki/PostGIS)
for more details.

## Installing ##

In addition to populating your database with OSM date, you should also:
- setup the panoramas table, using the provided `panoramas.sql`, e.g.
`psql -U gisuser otv < panoramas.sql`

- install the dependencies:
~~~~
cd app
npm install
cd client/js
npm install
~~~~

- run the server (from the root directory):
`node app/app.js`

If you have a panorama with an ID of 1, it should then be visible by
accessing in the browser:
`http://localhost:3000`

