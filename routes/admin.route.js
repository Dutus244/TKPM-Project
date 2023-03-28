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

router.get('/detail/:id', async function (req, res) {
    const topicid = req.params.id
    const topic = await adminServices.getTopicDetail(topicid)
    const word = await adminServices.countWords(topicid)
    const test = await adminServices.getTest(topicid)
    console.log(test)
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
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, id + '.png')
        }
    })

    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err){

        const topicid = req.params.id
        const imagelink = '/public/img/flashcard' + id + '.png'

        const wordname = req.body.wordname
        const wordtype = req.body.wordtype
        const wordmeaning = req.body.wordmeaning
        const wordpronounce = req.body.wordpronounce
        const wordexample = req.body.wordexample

        const word={
            topicid: topicid,
            wordid: id,
            wordname: wordname,
            wordtype: wordtype,
            wordmeaning: wordmeaning,
            wordpronounce: wordpronounce,
            wordexample: wordexample,
            wordavatar: imagelink
        }

        const question = req.body.question
        const optionA = req.body.optionA
        const optionB = req.body.optionB
        const optionC = req.body.optionC
        const optionD = req.body.optionD

        const test={
            questionid: qid,
            question: question,
            optiona: optionA,
            optionb: optionB,
            optionc: optionC,
            optiond: optionD
        }

        await adminServices.addWord(word)
        await adminServices.addQuestion(test)
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error(err);
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error(err);
        }
    })
})

router.get('/addtopic', async function (req, res) {
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
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, id + '.png')
        }
    })


    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err) {
        
        const topicname = req.body.topicname
        const imagelink = '/public/img/' + id + '.png'

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