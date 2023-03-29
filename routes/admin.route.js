import express from 'express';
import adminServices from "../services/admin.service.js";
import { v4, v4 as uuidv4 } from "uuid";
import multer from 'multer';
import bodyParser from 'body-parser';

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

export const config = {
    api: {
        bodyParser: false
    }
}

router.get('/detail/:id', async function (req, res) {
    const topicid = req.params.id
    const topic = await adminServices.getTopicDetail(topicid)
    const word = await adminServices.countWords(topicid)
    const test = await adminServices.getTest(topicid)

    res.render('vwAdmin/topicdetail', {
        topic: topic,
        num: word,
        test: test
    })
})

router.get('/addword/:id', async function (req, res){
    const topicid = req.params.id
    res.render('vwAdmin/addword',{
        topicid: topicid,
    })
})

router.post('/addword/:id', async function (req, res){
    const id = v4()
    const qid = v4()

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/flashcard')
        },
        filename: function (req, file, cb) {
            cb(null, id + '.png')
        }
    })

    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err){

        const topicid = req.params.id
        const imagelink = '/public/img/flashcard' + id + '.png'

        const {wordname, wordtype, wordmeaning, wordpronounce, wordexample} = req.body;

        const word={
            topicid,
            wordid: id,
            wordname,
            wordtype,
            wordmeaning,
            wordpronounce,
            wordexample,
            wordavatar: imagelink
        }

        const {question, optionA, optionB, optionC, optionD} = req.body;
        const test={
            questionid: qid,
            question,
            optiona: optionA,
            optionb: optionB,
            optionc: optionC,
            optiond: optionD
        }

        await adminServices.addWord(word)
        await adminServices.addQuestion(test)
        if (err || err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            // or an unknown error occurred when uploading.
            console.error(err);
        } 
    })
})

router.get('/addtopic', function (req, res) {
    res.render('vwAdmin/addtopic', {
        
    })
})

router.post('/addtopic', async function (req, res){
    const id = v4()
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/')
        },
        filename: function (req, file, cb) {
            cb(null, id + '.png')
        }
    })

    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err) {
        
        const {topicname} = req.body;
        const imagelink = '/public/img/' + id + '.png'

        const topic={
            topicid: id,
            topicname,
            topicavatar: imagelink,
        }

        await adminServices.add(topic)
        if (err || err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            // or an unknown error occurred when uploading.
            console.error(err);
        } 

    })
})

export default router