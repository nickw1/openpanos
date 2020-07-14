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
