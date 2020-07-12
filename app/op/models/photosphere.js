const exifr = require('exifr');
const fs = require('fs').promises; 
const parser = require('fast-xml-parser');

class Photosphere {
    constructor(file) {
        this.lat = this.lon = this.time = this.poseheadingdegrees = null;
        this.file = file;
    }
    
    async parseFile() {
        const ret = fs.readFile(this.file)
            .then(f => { return exifr.parse(f, { xmp: true } ) })
            .then(exif => { 
                // If we can't find exif at all, reject the promise
                // handle this by deleting the file as it's likely to mean
                // someone tried to upload something that wasn't a JPEG
                if(exif === undefined) {
                    return Promise.reject({'error': 'no exif data'});
                }
                this.lat = exif.latitude;
                this.lon = exif.longitude;
                if(exif.DateTimeOriginal) {
                    this.time = new Date(exif.DateTimeOriginal);
                }
                if(exif.xmp && parser.validate(exif.xmp)===true) {
                    const jsonObj = parser.parse(exif.xmp, {ignoreAttributes: false} );
                    console.log(JSON.stringify(jsonObj));
                    if(jsonObj['x:xmpmeta'] &&
                        jsonObj['x:xmpmeta']['rdf:RDF'] &&
                        jsonObj['x:xmpmeta']['rdf:RDF']['rdf:Description']) {        
                            const desc = jsonObj["x:xmpmeta"]["rdf:RDF"]["rdf:Description"];
                            this.poseheadingdegrees = desc["@_GPano:PoseHeadingDegrees"] || desc["GPano:PoseHeadingDegrees"][0];
                    }
                }
                return {"lat": this.lat, "lon": this.lon, "poseheadingdegrees": this.poseheadingdegrees, 'time': this.time };
             });
        return ret;
    }

}

module.exports = Photosphere;    
