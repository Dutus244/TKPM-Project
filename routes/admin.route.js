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

router.get('/topicdetail/:id', async function (req, res) {
    const topicid = req.params.id
    const topicname = await adminServices.getTopicName(topicid)
    const topic = await adminServices.getTopicDetail(topicid)
    const word = await adminServices.countWords(topicid)
    const test = await adminServices.getTest(topicid)

    res.render('vwAdmin/topicdetail', {
        topicid,
        topicname: topicname[0].topicname,
        topic,
        num: word,
        test
    })
})

router.get('/addquestion/:id', async function (req, res){
    const topicid = req.params.id
    const wordlist = await adminServices.getWords(topicid)
    res.render('vwAdmin/addquestion',{
        topicid,
        wordlist,
    })
})

router.post('/addquestion/:id', async function (req, res){
    const id = v4()

    const word = req.body.word;
    console.log(word)

    const {question, optiona, optionb, optionc, optiond} = req.body;
        const test={
            questionid: id,
            question,
            optiona,
            optionb,
            optionc,
            optiond,
            answer: optiona,
            isdelete: 0
        }
    console.log(test)
    //await adminServices.addQuestion(test)
})

router.get('/addword/:id', async function (req, res){
    const topicid = req.params.id
    res.render('vwAdmin/addword',{
        topicid: topicid,
    })
})

router.post('/addword/:id', async function (req, res){
    const id = v4()

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
        const imagelink = '/public/img/flashcard/' + id + '.png'

        const {wordname, wordtype, wordmeaning, wordpronounce, wordexample} = req.body;

        const word={
            topicid,
            wordid: id,
            wordname,
            wordtype,
            wordmeaning,
            wordpronounce,
            wordexample,
            wordavatar: imagelink,
            isdelete: 0,
        }

        await adminServices.addWord(word)

        const topicname = await adminServices.getTopicName(topicid)
        const topic = await adminServices.getTopicDetail(topicid)
        const num = await adminServices.countWords(topicid)
        const tst = await adminServices.getTest(topicid)
        res.render('vwAdmin/topicdetail', {
            topicid,
            topicname: topicname[0].topicname,
            topic,
            num,
            test: tst
        })
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

router.get('/topiclist', async function (req, res) {
    const topiclist = await adminServices.findAllTopic();
    if (topiclist.length == 0) {
      res.status(404).render("404", {
        layout: false,
      });
    }
    // console.log(topiclist);
  
    res.render('vwAdmin/topiclist', {
      topics: JSON.stringify(topiclist)
    });
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
            isdelete: 0
        }

        await adminServices.add(topic)

        const topiclist = await adminServices.findAllTopic();
        if (topiclist.length == 0) {
        res.status(404).render("404", {
            layout: false,
        });
        }
        // console.log(topiclist);
    
        res.render('vwAdmin/topiclist', {
        topics: JSON.stringify(topiclist)
        });
        if (err || err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            // or an unknown error occurred when uploading.
            console.error(err);
        } 

    })
})

export default router