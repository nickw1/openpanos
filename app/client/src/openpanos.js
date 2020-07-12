const PanoNetworkMgr = require('./PanoNetworkMgr');
require('pannellum');

class Client {

    constructor(options) {
        options = options || { };
        options.api = options.api || { };
        this.viewer = null;
        this.panoNetworkMgr = new PanoNetworkMgr({
            jsonApi: options.api.geojson,
            nearbyApi: options.api.nearby
        });
        this.lat = 0.0;
        this.lon = 0.0;
        this.panoMetadata = [];
        this.eventHandlers = {};
        this.curPanoId = 0;
        this.resizePano = options.resizePano || 100;
        this.api = { };
        this.api.nearest = options.api.nearest || 'op/panorama/nearest/{lon}/{lat}'; 
        this.api.byId = options.api.byId || 'op/panorama/{id}';
        this.api.panoImg = options.api.panoImg || 'op/panorama/{id}.jpg';
    }


    findPanoramaByLonLat(lon,lat) {
        var resp = fetch(this.api.nearest
                .replace('{lon}', lon)
                .replace('{lat}', lat))
                .then(resp=>resp.json())
                .then(json=> {
                    this._receivePanoMetadata(json);
                   });
    }

    loadPanorama(id, options) {
        options = options || {};
        if(!this.panoMetadata[id]) {
            this._fetchPanoMetadataById(id, this._processMetadata.bind(this, id, options));
        } else {
            this._setLonLat(this.panoMetadata[id].lon,this.panoMetadata[id].lat);
            this._processMetadata(id, options);
        }
    }

    moveTo(id) {
        if (!this.viewer.getConfig().scenes[`pano${id}`]) {
            this._addScene(id);
            this.viewer.loadScene(`pano${id}`, "same", "same", "same", true);
        } else {
            try {
                this.viewer.loadScene(`pano${id}`, "same", "same", "same", true);
            } catch(e) {
                console.log(`Cannot loadScene(): ${e}`);
            }
        }    
    }

    update(id, properties) {
        var scene = this.viewer.getConfig().scenes[`pano${id}`];    
        if(scene && this.panoMetadata[id]) {
            if(properties.position) {
                this._removeAllHotSpots(id).forEach ( otherPano=> {
                    this._removeAllHotSpots(otherPano.split('-')[2]);
                });
                this.panoMetadata[id].lon = properties.position[0];
                this.panoMetadata[id].lat = properties.position[1];
                this.loadPanorama(id, { panoMoved: true } );
            } else if (properties.poseheadingdegrees) {
                
                var oldHeading = this.panoMetadata[id].poseheadingdegrees;
                this.panoMetadata[id].poseheadingdegrees = properties.poseheadingdegrees;

                scene.hotSpots.forEach( hotSpot=> {
                    hotSpot.yaw += (oldHeading - properties.poseheadingdegrees);
                    if(hotSpot.yaw>180) hotSpot.yaw-=360;
                    if(hotSpot.yaw<-180) hotSpot.yaw+=360;
                });
            }
        } 
    }

    on(evName,evHandler) {
        this.eventHandlers[evName] = evHandler;
    }

    _processMetadata(id, options) {
        options = options || {};
        var thisScene = this.viewer ? this.viewer.getConfig().scenes[`pano${id}`]: null;

        if(!thisScene || !thisScene.hotSpots || thisScene.hotSpots.length == 0) {
            this._loadNearbys({json:this.panoMetadata[id], callback:this._onFoundNearbys.bind(this, options)})
        } else {
            this.curPanoId = id;
            if(this.eventHandlers.panoChanged) {
                this.eventHandlers.panoChanged(id);
            }
            this._adjustLoadedPano(id, options.yaw);
        }    
    }

    _fetchPanoMetadataById(id, onReceivedMetadataCallback) {
        var resp = fetch(this.api.byId.replace('{id}', id))
            .then(resp=>resp.json()).then(json=> {
                this._receivePanoMetadata(json, onReceivedMetadataCallback);
        });
    }


    _receivePanoMetadata(json, onReceivedMetadataCallback) {
        onReceivedMetadataCallback = onReceivedMetadataCallback || this._processMetadata.bind(this, json.id);
        this._setLonLat(json.lon, json.lat);
        this.panoMetadata[json.id] = json;
        this.panoMetadata[json.id].poseheadingdegrees = this.panoMetadata[json.id].poseheadingdegrees || 0;
        onReceivedMetadataCallback();
    }

    _setLonLat(lon,lat) {
        this.lon = lon;
        this.lat = lat;
        if(this.eventHandlers.locationChanged) {
            this.eventHandlers.locationChanged(lon, lat);
        }
    }

    _loadNearbys (options) {
        this.panoNetworkMgr.doLoadNearbys(options.json,options.callback);
    }


    _onFoundNearbys (options, thisPano, nearbys) {
        this.curPanoId = thisPano.id;
        if(this.eventHandlers.panoChanged) {
            this.eventHandlers.panoChanged(this.curPanoId);
        }
        if(!this.viewer) {
            var scenes = {};
            scenes[`pano${thisPano.id}`]  = {
                'title': 'Starting Pano',
                'panorama': this.api.panoImg.replace('{id}', thisPano.id),
                'type' : 'equirectangular',
                'hotSpots': [] };
        
            this.viewer = pannellum.viewer('panorama', {
                'type': 'equirectangular',
                'autoLoad': true,
                'northOffset': this.panoMetadata[thisPano.id].poseheadingdegrees,
                'compass': true,
                'default': {
                    'firstScene' : `pano${thisPano.id}`,
                    'author': 'OTV360 contributors',
                    'sceneFadeDuration': 100
                },
                'scenes': scenes
            });
                            
            this.viewer.on("error", e=> { console.log(`HS ERROR: ${e}`);});
            this.viewer.on("scenechange", sceneId=> { this._handleSceneChange(sceneId); });  
        }  else if (options.panoMoved!==true) {
            this.viewer.setNorthOffset(this.panoMetadata[thisPano.id].poseheadingdegrees);
        }
   

        // Issue that getNorthOffset() is not set because the pano is not
        // loaded yet, but trying to put this in an onLoad() event handler
        // gives an undefined div error. 
        
        nearbys.forEach( nearby => { 
            if(options.panoMoved!==true) { // only do hotspots if we didn't just move a pano

                var yaw = nearby.bearing-thisPano.poseheadingdegrees;
                if(yaw>180) yaw-=360;
                if(yaw<-180) yaw+=360;
                
                

                if(nearby.id != thisPano.id) {
                    if(!this.viewer.getConfig().scenes[`pano${nearby.id}`]) {
                        this.viewer.addScene(`pano${nearby.id}`, {
                            title: `Pano ${nearby.id}`,
                            'panorama':  this.api.panoImg.replace('{id}', nearby.id),
                            'type': 'equirectangular'});
                    } else {
                    }
                }
        
                 this.viewer.addHotSpot(
                    { 'pitch': 0,
                      'yaw': yaw,
                      'type':'scene',
//                      'cssClass' : 'customHotspot',
                      'text' : `to pano ${nearby.id}`,
                      'id' : `hs-${thisPano.id}-${nearby.id}`,
                      'sceneId': `pano${nearby.id}`
                    });    
            } else {
                // remove any existing hotspots from the target pano of the
                // hotspot if we moved the panorama
                this._removeAllHotSpots(nearby.id);
            }
        }); 

        if(options.panoMoved!==true) {
            var scene = this.viewer.getConfig().scenes[`pano${thisPano.id}`];
            this._adjustLoadedPano(thisPano.id, options.yaw);
        }
    }

    _handleSceneChange(sceneId) {
        var curId = this.curPanoId;
        var yawBearing = null;
        var id = sceneId.substring(4);
        if(curId > 0) {
        this.viewer.getConfig().scenes[`pano${curId}`].hotSpots.forEach( hotSpot=> {
            if(hotSpot.sceneId == sceneId) {
                yawBearing = this.panoMetadata[curId].poseheadingdegrees + hotSpot.yaw; 
                if(yawBearing>180) yawBearing-=360;
                if(yawBearing<-180) yawBearing+=360;
            }
        });
        }
        this.loadPanorama(id, {yaw: yawBearing});  
    } 

    _adjustLoadedPano(curPanoId, panoYaw) {
        if(panoYaw!==null && panoYaw!==undefined) {
            panoYaw -= this.panoMetadata[curPanoId].poseheadingdegrees;
            if(panoYaw>180) panoYaw-=360;
            if(panoYaw<-180) panoYaw+=360;
            this.viewer.setYaw(panoYaw, false);    
        }
    }

    _addScene(id) {
        this.viewer.addScene(`pano${id}`, {
                'title': `Pano ${id}`,
                'panorama': this.api.panoImg.replace('{id}', id),
                'type' : 'equirectangular',
                'hotSpots': []
            });
    }
    
    _removeAllHotSpots(id) {
        var scene = this.viewer.getConfig().scenes[`pano${id}`];
        var hsid = []; 
        if(scene && scene.hotSpots) {
            scene.hotSpots.forEach( hotSpot=> {
                hsid.push(hotSpot.id);
            });
            for(var i=0; i<hsid.length; i++) {
                this.viewer.removeHotSpot(hsid[i]);
            }
            scene.hotSpots = [];
        }
        return hsid;
    }
}

module.exports = {
    Client: Client
};
