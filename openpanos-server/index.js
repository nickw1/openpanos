const panoRouter = require('./routes/panorama');
const mapRouter = require('./routes/map');

const fileUpload = require('express-fileupload');
const Router = require('express-promise-router');
const router = new Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use('/panorama/upload', fileUpload( { limits: 
            { fileSize: 8 * 1024 * 1024},
                    useTempFiles: true,
                    tempFileDir: process.env.TMPDIR} ));

router.use('/panorama', panoRouter);
router.use('/map', mapRouter);

router.get('/', (req,res)=> {
    res.send('Welcome to OpenPanos!');
});

module.exports = {
    router: router,
    panoController: panoRouter.controller
};
