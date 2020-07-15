# OpenPanos demo app

This is one of the simplest possible demo applications for OpenPanos. It loads
panoramas stored in a PostGIS database and, using the OpenPanos server,
links them using GeoJSON data derived from a PostGIS database with the schema
produced from [osm2pgsql](https://wiki.openstreetmap.org/wiki/Osm2pgsql).

This is really, more than anything, a reference showing how you can develop your own OpenPanos app. For it to actually work you **must**:
- have a suitable database setup (see above);
- create the panoramas table using the `panoramas.sql` file provided;
- add some panoramas to tbe database. You may use the upload facility provided in this demo app to do this. Please note it is currently very basic; you get JSON back rather than something more user-friendly. Nonetheless, providing your panorama is valid, it will work and allow you to test the system. 
- edit the .env file to reflect your system.
