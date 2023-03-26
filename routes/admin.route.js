import express from 'express';
import adminServices from "../services/admin.service.js";
import { v4, v4 as uuidv4 } from "uuid";
import multer from 'multer';
import bodyParser from 'body-parser';

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
//router.use(multer().array())
export const config = {
    api: {
        bodyParser: false
    }
}

router.get('/', async function (req, res) {
    res.render('vwAdmin/topicdetail', {
        
    })
})

router.get('/topiclist', async function (req, res) {
    res.render('vwAdmin/topiclist', {
        
    })
})

router.get('/addtopic', async function (req, res) {
    res.render('vwAdmin/addtopic', {
        
    })
})

router.post('/addtopic', async function (req, res){

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/')
        },
        filename: function (req, file, cb) {
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, id + '.png')
        }
    })


    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err) {
        const id = v4()
        const topicname = req.body.topicname
        const imagelink = '/public/img/' + id + '.png'

        const timestamp = new Date()

        const topic={
            topicid: id,
            topicname: topicname,
            topicavatar: imagelink,
        }

        await adminServices.add(topic)
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error(err);
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error(err);
        }

    })
})

export default router