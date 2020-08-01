const PanoNetworkMgr = require('./PanoNetworkMgr');
const PhotoSphereViewer = require('photo-sphere-viewer');
const MarkersPlugin = require('photo-sphere-viewer/dist/plugins/markers');

class Client {

    constructor(options) {
        options = options || { };
        options.api = options.api || { };
        this.viewer = new PhotoSphereViewer.Viewer({
            container: document.querySelector(options.container || '#viewer'),
            plugins: [
                MarkersPlugin
            ]
        });
        this.panoNetworkMgr = new PanoNetworkMgr({
            jsonApi: options.api.geojson,
            nearbyApi: options.api.nearby
        });
        this.lat = 0.0;
        this.lon = 0.0;
        this.eventHandlers = {};
        this.resizePano = options.resizePano;
        this.api = { };
        this.api.nearest = options.api.nearest || 'op/panorama/nearest/{lon}/{lat}'; 
        this.api.byId = options.api.byId || 'op/panorama/{id}';
        this.api.panoImg = options.api.panoImg || 'op/panorama/{id}.jpg';
        this.api.panoImgResized = options.api.panoImgResized || 'op/panorama/{id}.w{width}.jpg';
        this.nearbys = { };
        this.panoMetadata = { };
        this.markersPlugin = this.viewer.getPlugin(MarkersPlugin);
        this.markersPlugin.on("select-marker", async (e, marker, data) => {
            const id = parseInt(marker.id.split('-')[1]);
            await this.moveTo(id);
        });
        this.arrowImage = options.arrowImage || 'images/arrow.png';
        this.curPanoId = 0;
    }


    async findPanoramaByLonLat(lon,lat) {
        const json = await fetch(this.api.nearest
                .replace('{lon}', lon)
                .replace('{lat}', lat))
                .then(resp=>resp.json());
        await this.loadPanorama(json.id);
    }

    async loadPanorama(id) {
        if(!this.panoMetadata[id]) {
             await this._loadPanoMetadata(id);
        }
        this.viewer.setPanorama(
            this.resizePano === undefined ? 
                this.api.panoImg.replace('{id}', id) : 
                this.api.panoImgResized
                    .replace('{id}', id)
                    .replace('{width}', this.resizePano), {
            sphereCorrection: { 
                pan: -this.panoMetadata[id].poseheadingdegrees * Math.PI / 180.0
            } 
        });
        if(!this.panoMetadata[id].nearbys) {
            this.panoNetworkMgr.doLoadNearbys(
                this.panoMetadata[id],
                this._onFoundNearbys.bind(this)
            );
        } else {
            this._createMarkers(id);
        }
    }

    async moveTo(id) {
        this.markersPlugin.clearMarkers();
        await this.loadPanorama(id);
    }

    async update(id, properties) {
        if(this.panoMetadata[id]) {
            if(properties.position) {
                this.panoMetadata[id].lon = properties.position[0];
                this.panoMetadata[id].lat = properties.position[1];
            } else if (properties.poseheadingdegrees) {
                this.panoMetadata[id].poseheadingdegrees = properties.poseheadingdegrees;
            }
            if(this.curPanoId == id) {    
                await this.moveTo(id);
            }
        }
    }

    on(evName,evHandler) {
        this.eventHandlers[evName] = evHandler;
    }

    async _loadPanoMetadata(id) {
        this.panoMetadata[id] = await fetch(this.api.byId.replace('{id}', id))
                                .then(response => response.json());
        return this.panoMetadata[id];
    }

    _onFoundNearbys(origPano, nearbys) {
        this.panoMetadata[origPano.id].nearbys = nearbys;
        this._createMarkers(origPano.id);
    }

    _createMarkers(id) {

        this.curPanoId = id;

        if(this.eventHandlers.panoChanged) {
            this.eventHandlers.panoChanged(id);
        }

        if(this.eventHandlers.locationChanged) {
            this.eventHandlers.locationChanged(this.panoMetadata[id].lon, this.panoMetadata[id].lat);
        }

        this.panoMetadata[id].nearbys.forEach ( nearby => {
            nearby.key = `${id}-${nearby.id}`;
            let yaw = nearby.bearing;
            this.markersPlugin.addMarker({
                id: `#${id}-${nearby.id}`,
                latitude: 10 * Math.PI/180,
                longitude: `${yaw}deg`,
                image: this.arrowImage,
                width: 64,
                height: 64,
                data: {
                    generated: true 
                } 
            });
        });
    }

    _showMarkers(id) {
        this.panoMetadata[id].nearbys.forEach(nearby => {
            this.markersPlugin.showMarker(nearby.key);
        });
    }

    _hideMarkers(id) {
        this.panoMetadata[id].nearbys.forEach(nearby => {
            this.markersPlugin.hideMarker(nearby.key);
        });
    }
}

module.exports = {
    Client: Client
};
