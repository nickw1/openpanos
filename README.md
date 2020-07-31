# openpanos
A platform for creating linked, navigable networks of 360 panoramas.


## Introduction
OpenPanos is a platform for creating linked networks of 360 panoramas. It is based on the core engine of [OpenTrailView](https://opentrailview.org), a project to
create 360 tours of paths and trails.

OpenPanos consists of two parts, a **client** and a **server**. It is possible to use the client without the server if you provide your own server. Detailed documentation is provided in the `openpanos-client` and `openpanos-server` directories.

### The client ###
The client is Photo Sphere Viewer and GeoJSON Path Finder-based, and handles displaying and linking the panoramas.  By default, the client will work with the OpenPanos server. However this is configurable and you can connect it to your own GeoJSON-based API. Please see the docs in `openpanos-client` for details.

### The server ###
The server is node.js based and by default, works with a standard OpenStreetMap PostGIS database to serve OpenStreetMap data as GeoJSON, which is used to link the
panoramas. Plase see the docs in `openpanos-server` for more details. 

### Demo app ###
A small demo app is available as part of the repository, allowing you to
navigate panoramas stored in your database. It also features an upload tool,
allowing you to add new panoramas. Note that the PostGIS database must be
setup correctly for this to work,

## Installing ##

The client and server are on npm, so it's just a case of:
~~~~
npm install openpanos-client
npm install openpanos-server
~~~~


## Detailed Documentation ##

Can be found in the `openpanos-client` and `openpanos-server` directories.
