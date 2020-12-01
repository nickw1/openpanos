# openpanos
A platform for creating linked, navigable networks of 360 panoramas.


## Introduction
OpenPanos is a platform for creating linked networks of 360 panoramas using a GeoJSON API.

### The client ###
The client is Photo Sphere Viewer and GeoJSON Path Finder-based, and handles displaying and linking the panoramas.  By default, the client will work with a given set of endpoints. However this is configurable and you can connect it to your own GeoJSON-based API. Please see the docs in `openpanos-client` for details.

### The server ###
The (experimental) server is no longer being maintained, in favour of the [OpenWanderer](https://github.com/openwanderer) project. It is available as part of [this repository of experimental projects](https://github.com/nickw1/expts) for those that may want to work with it.

## Installing ##

The client is on npm, so it's just a case of:
~~~~
npm install openpanos-client
~~~~


## Detailed Documentation ##

Can be found in the `openpanos-client` directory. 
