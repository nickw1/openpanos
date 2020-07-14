-- SQL to setup tables specifically related to panoramas
-- you must also use osm2pgsql to populate the DB with OSM data

CREATE TABLE panoramas
(id serial,
the_geom geometry,
poseheadingdegrees FLOAT,
authorised INT DEFAULT 0,
userid VARCHAR(255),
timestamp INT);
