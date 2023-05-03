import express from 'express';
import adminServices from "../services/admin.service.js";
import {v4} from "uuid";
import multer from 'multer';
import bodyParser from 'body-parser';

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

export const config = {
    api: {
        bodyParser: false
    }
}

router.get('/lessonlist', async function (req, res) {
    const lesson = await adminServices.getLessonList()

    res.render('vwAdmin/lessonlist',{
        layout: 'mainAdmin',
        active: {Lesson: true},
        lesson: JSON.stringify(lesson), 
    })
})

router.get('/lessondetail/:id', async function (req, res) {
    const lessonid = req.params.id

    const [lesson, topic] = await Promise.all([
        adminServices.getLessonDetail(lessonid),
        adminServices.getLessonTopicList(lessonid),
    ])

    res.render('vwAdmin/lessondetail', {
        layout: 'mainAdmin',
        active: {Lesson: true},
        lesson: JSON.stringify(lesson),
        topic: JSON.stringify(topic),
    })
})

router.post('/lessondetail/:id', async function (req, res) {
    const lessonid = req.params.id

    if (req.body.type === 'name') {
        const lessonName = req.body.name;
        await adminServices.editLessonName(lessonid, lessonName);
    } else if (req.body.type === 'description') {
        const lessondes = req.body.description;
        await adminServices.editLessonDescription(lessonid, lessondes);
    } else {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/img/lesson')
            },
            filename: function (req, file, cb) {
                cb(null, lessonid + '.png')
            }
        })

        const upload = multer({storage: storage}).single('avatar');

        upload(req, res, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error uploading file');
            }
        });

        await adminServices.editLessonAva(lessonid, "/public/img/lesson/" + lessonid + ".png");
    }

    res.redirect(`/admin/lessondetail/${lessonid}`)
})

router.get('/deletelesson/:id', async function (req, res) {
    const lessonid = req.params.id

    try {
        const deleteResult = await adminServices.deleteLesson(lessonid);
        res.render('vwAdmin/deletemessagebox', {
            layout: 'mainAdmin',
            active: {Lesson: true},
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
            layout: 'mainAdmin',
            active: {Lesson: true},
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
        layout: 'mainAdmin',
        active: {Lesson: true},
        topic: JSON.stringify(topic),
        word: JSON.stringify(word),
        test: JSON.stringify(test)
    })
})

router.post('/topicdetail/:id', async function (req, res) {
    const topicid = req.params.id

    if (req.body.type === 'name') {
        const topicName = req.body.name;
        await adminServices.editTopicName(topicid, topicName);
    } else {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/img/topic')
            },
            filename: function (req, file, cb) {
                cb(null, topicid + '.png')
            }
        })
    
        const upload = multer({storage: storage}).single('avatar');
    
        upload(req, res, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error uploading file');
            }
        });
    
        await adminServices.editTopicAva(topicid, "/public/img/topic/" + topicid + ".png");
    }

    const [topic, word, test] = await Promise.all([
        adminServices.getTopicDetail(topicid),
        adminServices.getTopicWordList(topicid),
        adminServices.getTopicTest(topicid)
    ])

    res.render('vwAdmin/topicdetail', {
        layout: 'mainAdmin',
        active: {Lesson: true},
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
            layout: 'mainAdmin',
            active: {Lesson: true},
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
            layout: 'mainAdmin',
            active: {Lesson: true},
            result: {
                success: false,
                message: `Error deleting topic`,
                back: 'Go back to lesson detail',
                backurl: '/admin/lessondetail/' + topicdetail.lessonid
            }
        });
    }
})

router.get('/worddetail/:id', async function (req, res) {
    const wordid = req.params.id

    const word = await adminServices.getWordDetail(wordid)

    res.render('vwAdmin/worddetail', {
        layout: 'mainAdmin',
        active: {Lesson: true},
        word: JSON.stringify(word)
    })
})

router.post('/worddetail/:id', async function (req, res) {
    const wordid = req.params.id
    const worddetail = await adminServices.getWordDetail(wordid)
    const topicid = worddetail.topicid
    const imagelink = '/public/img/flashcard/' + wordid + '.png'

    const {wordname, wordtype, wordmeaning, wordpronounce, wordexample} = req.body;
    const word = {
        topicid,
        wordid,
        wordname,
        wordtype,
        wordmeaning,
        wordpronounce,
        wordexample,
        wordavatar: imagelink,
        isdelete: 0,
    }

    await adminServices.updateWord(word)

    res.redirect(`/admin/topicdetail/${topicid}`)
})

router.get('/deleteword/:id', async function (req, res) {
    const wordid = req.params.id
    const worddetail = await adminServices.getWordDetail(wordid)

    try {
        const deleteResult = await adminServices.deleteWord(wordid);
        res.render('vwAdmin/deletemessagebox', {
            layout: 'mainAdmin',
            active: {Lesson: true},
            result: {
                success: true,
                message: `Word successfully deleted`,
                back: 'Go back to topic detail',
                backurl: '/admin/topicdetail/' + worddetail.topicid
            }
        });
    } catch (error) {
        console.log(error);
        res.render('vwAdmin/deletemessagebox', {
            layout: 'mainAdmin',
            active: {Lesson: true},
            result: {
                success: false,
                message: `Error deleting word`,
                back: 'Go back to topic detail',
                backurl: '/admin/topicdetail/' + worddetail.topicid
            }
        });
    }
})

router.get('/addlesson', function (req, res) {
    res.render('vwAdmin/addlesson', {
        layout: 'mainAdmin',
        active: {Lesson: true},
    })
})


router.post('/addlesson', async function (req, res) {
    const id = v4()
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/lesson')
        },
        filename: function (req, file, cb) {
            cb(null, id + '.png')
        }
    })

    const upload = multer({storage: storage})
    upload.array('fuMain', 1)(req, res, async function (err) {

        const {lessonname, description} = req.body;
        const imagelink = '/public/img/lesson/' + id + '.png'

        const lesson = {
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
        } else {
            res.redirect(`/admin/lessonlist`)
        }
    })
})

router.get('/addquestion/:id', async function (req, res) {
    const topicid = req.params.id
    const wordlist = await adminServices.getWords(topicid)
    res.render('vwAdmin/addquestion', {
        layout: 'mainAdmin',
        active: {Lesson: true},
        topicid: JSON.stringify(topicid),
        wordlist,
    })
})

router.post('/addquestion/:id', async function (req, res) {
    const qid = v4()

    const id = req.params.id

    const wordid = req.body.word;
    const optiond = await adminServices.getWord(id, wordid)
    const wordlist = await adminServices.getWords(id)

    const {wordname} = optiond[0]

    const {question, optiona, optionb, optionc} = req.body;

    const options = [optiona, optionb, optionc];

    if (options.some(option => option === wordname)) {
        res.render('vwAdmin/addquestion', {
            layout: 'mainAdmin',
            active: {Lesson: true},
            topicid: JSON.stringify(id),
            wordlist,
            msg: "The answer is same to one of the three other options",
        })
    }

    const test = {
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

    await adminServices.addQuestion(test)
    res.redirect(`/admin/edittest/${id}`)
})

router.get('/addword/:id', async function (req, res) {
    const topicid = req.params.id
    const {topicname} = await adminServices.getTopicname(topicid)
    res.render('vwAdmin/addword', {
        layout: 'mainAdmin',
        active: {Lesson: true},
        topicid,
        topicname,
    })
})

router.post('/addword/:id', async function (req, res) {
    const id = v4()

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/flashcard')
        },
        filename: function (req, file, cb) {
            cb(null, id + '.png')
        }
    })

    const upload = multer({storage: storage})
    upload.array('fuMain', 1)(req, res, async function (err) {

        const topicid = req.params.id
        const imagelink = '/public/img/flashcard/' + id + '.png'

        const {wordname, wordtype, wordmeaning, wordpronounce, wordexample} = req.body;

        const word = {
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

        res.redirect(`/admin/topicdetail/${topicid}`)

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
        layout: 'mainAdmin',
        active: {Lesson: true},
        lessonid,
        lessonname,
    })
})

router.post('/addtopic/:id', async function (req, res) {
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

    const upload = multer({storage: storage})
    upload.array('fuMain', 1)(req, res, async function (err) {

        const {topicname} = req.body;
        const imagelink = '/public/img/topic/' + id + '.png'

        const topic = {
            lessonid,
            topicid: id,
            topicname,
            topicavatar: imagelink,
            isdelete: 0
        }

        await adminServices.addTopic(topic)

        res.redirect(`/admin/lessondetail/${lessonid}`)
    })
})

router.get('/previewWord/:wordid', async function (req, res) {
    const wordid = req.params.wordid
    const word = await adminServices.getWordAllInfo(wordid)
    const {topicid} = word

    res.render('vwAdmin/wordPreview', {
        layout: 'mainAdmin',
        active: {Lesson: true},
        word,
        topicid: JSON.stringify(topicid),
        wordname: JSON.stringify(word.wordname),
    })
})
router.get('/userlist', async function (req, res) {
    const list = await adminServices.getUserList()

    res.render('vwAdmin/userlist', {
        layout: 'mainAdmin',
        active: {Account: true},
        count: list.length,
        list: list,
        empty: list.length === 0,
    })
})
router.get('/lock', async function (req, res) {
    const id = req.query.id || 0;
    await adminServices.lock(id);

    res.redirect('/admin/userlist');
});

router.get('/unlock', async function (req, res) {
    const id = req.query.id || 0;
    await adminServices.unlock(id);

    res.redirect('/admin/userlist');
});

router.get('/edittest/:topicid', async function(req, res) {
    const { topicid } = req.params
    const { word = '' } = req.query
    const questions = await adminServices.searchQuestionByTopicFilterByAnswer(topicid, word)
    const wordsOption = (await adminServices.getTopicWordList(topicid)).map(word => word.wordname)

    res.render('vwAdmin/editTest', {
        layout: 'mainAdmin',
        active: {Lesson: true},
        n: questions.length,
        empty: questions.length == 0,
        questions,
        wordsOption,
        chosenOption: JSON.stringify(word),
        topicid,
    })
})

router.post('/delete/question/:id', async function(req, res) {
    const questionid = req.params.id
    await adminServices.deleteQuestion(questionid)
    res.status(200).send(true)
})

router.get('/editquestion/:id',async function(req, res){
    const questionid = req.params.id
    const questioninfo = await adminServices.getQuestionInfo(questionid)
    const wordname = questioninfo.answer
    const {wordid, optiona, optionb, optionc, question} = questioninfo
    const {topicid} = await adminServices.getTopicIdByWordId(wordid)
    res.render('vwAdmin/editquestion', {
        wordname,
        optiona,
        optionb,
        optionc,
        question,
        wordid,
        topicid: JSON.stringify(topicid),
    })
})

router.post('/editquestion/:id', async function (req, res) {
    const questionid = req.params.id
    const {question, wordid, optiona, optionb, optionc} = req.body;
    const options = [optiona, optionb, optionc];

    const questioninfo = await adminServices.getQuestionInfo(questionid)
    const wordname = questioninfo.answer

    const {topicid} = await adminServices.getTopicIdByWordId(wordid)

    if (options.some(option => option === wordname)) {
        res.render('vwAdmin/editquestion', {
            wordname,
            wordid,
            optiona,
            optionb,
            optionc,
            question,
            topicid: JSON.stringify(topicid),
            msg: "The answer is same to one of the three other options",
        })
    }

    const fixquestion = {
        questionid,
        question,
        optiona,
        optionb,
        optionc,
    }
    await adminServices.editQuestion(fixquestion)
    res.redirect(`/admin/edittest/${topicid}`)
})

export default router
