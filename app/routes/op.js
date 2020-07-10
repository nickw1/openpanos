const panoRouter = require('./panorama');
const mapRouter = require('./map');

const fileUpload = require('express-fileupload');
const Router = require('express-promise-router');
const router = new Router();

router.use('/panorama', panoRouter);
router.use('/map', mapRouter);

router.use('/panorama/upload', fileUpload( { limits: 
            { fileSize: 8 * 1024 * 1024},
                    useTempFiles: true,
                    tempFileDir: '/var/www/tmp'} ));
router.get('/', (req,res)=> {
    res.send('Welcome to OpenPanos!');
});

module.exports = router;
