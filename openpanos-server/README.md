# openpanos
A platform for creating linked, navigable networks of 360 panoramas.

## Introduction
OpenPanos is a platform for creating linked networks of 360 panoramas. It is based on the core engine of [OpenTrailView](https://opentrailview.org), a project to create 360 tours of paths and trails.

### The server
This is the server package: `openpanos-server`. It works with a standard OpenStreetMap PostGIS database to serve OpenStreetMap data as GeoJSON, which is used to link the panoramas. To populate this database, you need to download a standard `osm.pbf` file, e.g. from [Geofabrik](https://download.geofabrik.de), use [Osmosis](https://wiki.openstreetmap.org/wiki/Osmosis) to extract the area you want, and then [osm2pgsql](https://wiki.openstreetmap.org/wiki/Osm2pgsql) to import the data into the database. See [here](https://wiki.openstreetmap.org/wiki/PostGIS) for more details.

### The client
The server works with the client `openpanos-client`: see [here](https://www.npmjs.com/package/openpanos-client).
