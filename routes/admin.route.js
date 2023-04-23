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

router.get('/lessonlist', async function (req, res){
    const lesson = await adminServices.getLessonList()

    res.render('vwAdmin/lessonlist',{
        lesson: JSON.stringify(lesson), 
    })
})

router.get('/lessondetail/:id', async function (req, res){
    const lessonid = req.params.id

    const [lesson, topic] = await Promise.all([
        adminServices.getLessonDetail(lessonid),
        adminServices.getLessonTopicList(lessonid),
    ])

    res.render('vwAdmin/lessondetail',{
        lesson: JSON.stringify(lesson),
        topic: JSON.stringify(topic),
    })
})

router.post('/lessondetail/:id', async function (req, res) {
    const lessonid = req.params.id

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/lesson')
        },
        filename: function (req, file, cb) {
            cb(null, lessonid + '.png')
        }
    })

    const upload = multer({ storage: storage }).single('avatar');

    upload(req, res, function(err) {
        if(err) {
            console.log(err);
            return res.status(500).send('Error uploading file');
        }
    });

    await adminServices.editLessonAva(lessonid, "/public/img/lesson/" + lessonid + ".png")

    const [lesson, topic] = await Promise.all([
        adminServices.getLessonDetail(lessonid),
        adminServices.getLessonTopicList(lessonid),
    ])

    res.render('vwAdmin/lessondetail',{
        lesson: JSON.stringify(lesson),
        topic: JSON.stringify(topic),
    })
})

router.get('/deletelesson/:id', async function (req, res) {
    const lessonid = req.params.id

    try {
        const deleteResult = await adminServices.deleteLesson(lessonid);
        res.render('vwAdmin/deletemessagebox', {
            result: {
                success: true,
                message: 'Lesson successfully deleted',
                back: 'Go back to lesson list',
                backurl: '/admin/lessonlist'
            }
        });
    } catch (error) {
        console.log(error);
        res.render('vwAdmin/deletemessagebox', {
            result: {
                success: false,
                message: 'Error deleting lesson',
                back: 'Go back to lesson list',
                backurl: '/admin/lessonlist'
            }
        });
    }
})

router.get('/topicdetail/:id', async function (req, res) {
    const topicid = req.params.id

    const [topic, word, test] = await Promise.all([
        adminServices.getTopicDetail(topicid),
        adminServices.getTopicWordList(topicid),
        adminServices.getTopicTest(topicid)
    ])

    res.render('vwAdmin/topicdetail', {
        topic: JSON.stringify(topic), 
        word: JSON.stringify(word),
        test: JSON.stringify(test)
    })
})

router.post('/topicdetail/:id', async function (req, res) {
    const topicid = req.params.id

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/topic')
        },
        filename: function (req, file, cb) {
            cb(null, topicid + '.png')
        }
    })

    const upload = multer({ storage: storage }).single('avatar');

    upload(req, res, function(err) {
        if(err) {
            console.log(err);
            return res.status(500).send('Error uploading file');
        }
    });

    await adminServices.editTopicAva(topicid, "/public/img/topic/" + topicid + ".png")

    const [topic, word, test] = await Promise.all([
        adminServices.getTopicDetail(topicid),
        adminServices.getTopicWordList(topicid),
        adminServices.getTopicTest(topicid)
      ])

    res.render('vwAdmin/topicdetail', {
        topic: JSON.stringify(topic), 
        word: JSON.stringify(word),
        test: JSON.stringify(test)
    })
})

router.get('/deletetopic/:id', async function (req, res) {
    const topicid = req.params.id
    const topicdetail = await adminServices.getTopicDetail(topicid)

    try {
        const deleteResult = await adminServices.deleteTopic(topicid);
        res.render('vwAdmin/deletemessagebox', {
            result: {
                success: true,
                message: `Topic successfully deleted`,
                back: 'Go back to lesson detail',
                backurl: '/admin/lessondetail/' + topicdetail.lessonid
            }
        });
    } catch (error) {
        console.log(error);
        res.render('vwAdmin/deletemessagebox', {
            result: {
                success: false,
                message: `Error deleting topic`,
                back: 'Go back to lesson detail',
                backurl: '/admin/lessondetail/' + topicdetail.lessonid
            }
        });
    }
})

router.get('/addlesson', function (req, res) {
    res.render('vwAdmin/addlesson', {
        
    })
})

router.post('/addlesson', async function (req, res){
    const id = v4()
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/lesson')
        },
        filename: function (req, file, cb) {
            cb(null, id + '.png')
        }
    })

    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err) {
        
        const {lessonname, description} = req.body;
        const imagelink = '/public/img/lesson/' + id + '.png'

        const lesson={
            lessonid: id,
            lessonname,
            lessonavatar: imagelink,
            lessondes: description,
            isdelete: 0
        }
        await adminServices.addLesson(lesson)
    
        if (err || err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            // or an unknown error occurred when uploading.
            console.error(err);
        } 

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
    const qid = v4()

    const id = req.params.id

    const wordid = req.body.word;
    const  optiond  = await adminServices.getWord(id, wordid)
    const wordlist = await adminServices.getWords(id)

    const { wordname } = optiond[0]

    const {question, optiona, optionb, optionc} = req.body;

    const options = [optiona, optionb, optionc];

    if (options.some(option => option === wordname)) {
        res.render('vwAdmin/addquestion',{
            topicid:id,
            wordlist,
            msg:"The answer is same to one of the three other options",
        })
    }
    
        const test={
            questionid: qid,
            question,
            optiona,
            optionb,
            optionc,
            optiond: wordname,
            answer: wordname,
            wordid: wordid,
            isdelete: 0
        }
    console.log(test)
    await adminServices.addQuestion(test)
})

router.get('/addword/:id', async function (req, res){
    const topicid = req.params.id
    const {topicname} = await adminServices.getTopicname(topicid)
    res.render('vwAdmin/addword',{
        topicid,
        topicname,
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
        
        const [topic, wordlist, test] = await Promise.all([
            adminServices.getTopicDetail(topicid),
            adminServices.getTopicWordList(topicid),
            adminServices.getTopicTest(topicid)
          ])
    
        res.render('vwAdmin/topicdetail', {
            topic: JSON.stringify(topic), 
            word: JSON.stringify(wordlist),
            test: JSON.stringify(test)
        })
        
        if (err || err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            // or an unknown error occurred when uploading.
            console.error(err);
        } 
    })
})

router.get('/addtopic/:id', async function (req, res) {
    const lessonid = req.params.id
    const {lessonname} = await adminServices.getLessonname(lessonid)
    res.render('vwAdmin/addtopic', {
        lessonname,
    })
})

router.post('/addtopic/:id', async function (req, res){
    const id = v4()
    const lessonid = req.params.id
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/topic')
        },
        filename: function (req, file, cb) {
            cb(null, id + '.png')
        }
    })

    const upload = multer({ storage: storage })
    upload.array('fuMain', 1)(req, res, async function (err) {
        
        const {topicname} = req.body;
        const imagelink = '/public/img/topic/' + id + '.png'

        const topic={
            lessonid,
            topicid: id,
            topicname,
            topicavatar: imagelink,
            isdelete: 0
        }

        await adminServices.addTopic(topic)

        const topiclist = await adminServices.findAllTopic();
        if (topiclist.length == 0) {
        res.status(404).render("404", {
            layout: false,
        });
        }

    })
})

router.get('/previewWord/:wordid', async function(req, res) {
    const wordid = req.params.wordid
    const word = await adminServices.getWordAllInfo(wordid)
    const { topicid } = word

    res.render('vwAdmin/wordPreview', {
        word,
        topicid: JSON.stringify(topicid)
    })
})

export default router