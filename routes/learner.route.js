import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
import { PAGE_LIMIT } from './constants.js';
import moment from 'moment';

const router = express.Router();
router.use(bodyParser.json());

router.get('/revision', async function (req, res) {
    let lessonsProgress = await learnerService.getLessonsProgress(res.locals.authUser.userid)
    lessonsProgress = lessonsProgress.map(it => ({
        lessonname: it.lessonname,
        percentage: (it.wordshaslearned / it.totalwords) * 100,
    }))

    let memoryLevelCount = await learnerService.getUserMemoryLevelCount(res.locals.authUser.userid)
    const maxNumber = memoryLevelCount.reduce((acc, cur) => {
        return acc > cur.number ? acc : cur.number;
    }, 0);
    memoryLevelCount = memoryLevelCount.map(it => ({
        ...it,
        percentage: (it.number / maxNumber) * 100
    }))

    const { count = 0 } = await learnerService.getUserReviewWordsCount(res.locals.authUser.userid)

    res.render('vwLearner/homeRevision', {
        lessonsProgress,
        memoryLevelCount: JSON.stringify(memoryLevelCount),
        reviewWordsCount: count,
        active: { Review: true }
    })
})

router.get("/topic/:id", async function (req, res) {
    const id = req.params.id;
    const wordlist = await learnerService.findAllTopicWord(id);
    if (!wordlist.length) {
        return res.status(404).render("404", {
            layout: false,
            active: { Learn: true }
        });
    }

    res.render("vwLearner/topicLearn", {
        words: JSON.stringify(wordlist),
        firstWord: wordlist[0],
        active: { Learn: true }

    });
});

router.get("/topic/:id/finish", async function (req, res) {
    const id = req.params.id
    const { lessonid } = await learnerService.findTopic(id)

    res.render("vwLearner/topicLearnFinish", {
        topicId: id,
        lessonid,
        active: { Learn: true }
    })
});

router.post("/topic/:id/finish", async function (req, res) {
    const topicid = req.params.id
    const userid = res.locals.authUser.userid
    const words = req.body.words

    const hasLearned = await learnerService.hasLearnedTopic(userid, topicid)
    if (hasLearned) {
        return
    }

    const finishWords = []
    const timestamp = new Date()
    const wordData = {
        userid,
        memorylevel: 1,
        firsttime: timestamp,
        updatetime: timestamp,
        isstudy: true,
    }
    words.map(word_item => {
        const wordid = word_item.wordid
        finishWords.push({ wordid, ...wordData })
    })
    try {
        await learnerService.addWordHistory(finishWords)
    } catch (error) {
        
    }

    const topic = {
        topicid,
        userid,
        createtime: timestamp,
    }
    try {
        await learnerService.addTopicHistory(topic)
    } catch (error) {
        
    }
})

router.get('/topic/test/:id', async function (req, res) {
    const topicid = req.params.id
    const listQuestion = await learnerService.findAllQuestionsTopic(topicid)
    res.render('vwLearner/topicTest', {
        topicid: topicid,
        question: listQuestion,
        empty: listQuestion.length === 0,
        active: {Learn: true}
    });
});

router.post('/topic/test/submit-answers', async function (req, res) {
    const userAnswers = await req.body;
    const { topicid, totalQuestions, totalCorrect } = userAnswers
    const id = v4()
    const testhistory = {
        testid: id,
        topicid: topicid,
        userid: req.session.authUser.userid,
        createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
        totalcorrect: totalCorrect,
        totalquestion: totalQuestions,
    };
    const data = await learnerService.addTestHistory(testhistory)
    const testhistorydetails = userAnswers.answers.map(item => {
        return {
            testid: id,
            questionid: item.questionID,
            userchoose: item.userchoose,
            optiona: item.optiona,
            optionb: item.optionb,
            optionc: item.optionc,
            optiond: item.optiond
        };
    });

    const results = await Promise.all(testhistorydetails.map(testhistorydetail => {
        return learnerService.addTestHistoryDetail(testhistorydetail);
    }));
    res.render("vwLearner/topicTestFinish", {
        topicId,
        active: { Learn: true }
    })
});

router.get('/topiclist/:lesson_id', async function (req, res) {
    const lesson_id = req.params.lesson_id;
    const user_id = res.locals.authUser.userid
    const raw_topiclist = await learnerService.findAllTopicStudy(lesson_id, user_id);
    const topiclist = raw_topiclist[0]
    const lesson = await learnerService.findLessonByID(lesson_id)
    res.render('vwLearner/topic', {
        topic: topiclist,
        lesson,
        active: { Learn: true }
    });
})

function setup_pages(curPage, nPage) {
    let prePage = 0;
    let nextPage;
    if (1 === +curPage) {
        prePage = 0;
    } else {
        prePage = +curPage - 1;
    }
    if (+nPage === +curPage) {
        nextPage = 0;
    } else if (+nPage === 0) {
        nextPage = 0;
    } else {
        nextPage = +curPage + 1;
    }
    if (+nPage < +curPage) {
        nextPage = 0
        prePage = 0
    }
    return [prePage, nextPage]
}

router.get('/lesson', async function (req, res) {
    const total = await learnerService.countLesson();
    const limit = PAGE_LIMIT;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit;
    const nPage = Math.ceil(total / limit);
    const pageNumber = [];
    for (let i = 1; i <= nPage; i++) {
        pageNumber.push({
            value: i,
            isCurrent: i === +curPage,
        });
    }
    const list = await learnerService.findLessonByOffsetWithLimit(
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage, nPage);

    res.render('vwLearner/lesson', {
        lesson: list,
        pageNumber,
        empty: list.length === 0,
        prePage,
        nextPage,
        active: { Learn: true }

    });
})
router.get('/lesson/search', async function (req, res) {
    const { lesson_letter } = req.query;
    const total = await learnerService.countLessonSearch(lesson_letter);
    const limit = PAGE_LIMIT;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit;
    const nPage = Math.ceil(total / limit);
    const pageNumber = [];
    for (let i = 1; i <= nPage; i++) {
        pageNumber.push({
            value: i,
            isCurrent: i === +curPage,
        });
    }
    const list = await learnerService.findLessonByOffsetWithLimitSearch(lesson_letter,
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage, nPage);

    res.render('vwLearner/lesson', {
        lesson: list,
        pageNumber,
        empty: list.length === 0,
        prePage,
        nextPage,
        active: { Learn: true }

    });
})
router.get('/lesson/:lesson_page', async function (req, res) {
    const total = await learnerService.countLesson();
    const limit = PAGE_LIMIT;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit;
    const nPage = Math.ceil(total / limit);
    const pageNumber = [];
    for (let i = 1; i <= nPage; i++) {
        pageNumber.push({
            value: i,
            isCurrent: i === +curPage,
        });
    }
    const list = await learnerService.findLessonByOffsetWithLimit(
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage, nPage);
    res.render('vwLearner/lesson', {
        lesson: list,
        pageNumber,
        empty: list.length === 0,
        prePage,
        nextPage,
        active: { Learn: true }

    });
})

router.get('/dailytest', async function (req, res) {
    const userID = req.session.authUser.userid
    const list = await learnerService.findAllQuestionDailyTest(userID)

    const timestamp = new Date()
    const [check, streakinfo] = await Promise.all([
        learnerService.checkDaily(userID, timestamp),
        learnerService.getStreak(userID),
    ])

    if(!check){
        if(!streakinfo){
            streak = 1
            const dailyLogin={
                userID,
                lastlogindate: timestamp,
                streak
            }
            await learnerService.loginStreak(dailyLogin)
        }
        else{
            let streak = streakinfo.streak
            let lastdaylogin = streakinfo.lastlogindate
        
            const lastdayloginUTC = new Date(lastdaylogin).toISOString().slice(0, 10)
            const timestampUTC = timestamp.toISOString().slice(0, 10)
            const yesterday = new Date(timestamp.getTime() - 86400000).toISOString().slice(0, 10)
            
            if (lastdayloginUTC === yesterday && timestampUTC !== yesterday) {
                streak = streak + 1
            } else {
                streak = 1
            }
            await learnerService.updateLoginStreak(res.locals.authUser.userid, timestamp, streak)
        }
        
        
    }

    res.render('vwLearner/dailyTest', {
        empty: list.length === 0,
        question: list,
        active: { Review: true }
    });
})
router.get('/resultdailytest', async function (req, res) {
    const userID = req.session.authUser.userid
    const { wordID, check } = req.query;
    await learnerService.updateMemoryLevel(userID, wordID, check)
})
router.post('/handbook', async function (req, res) {
    const reqbody = req.body
    const userID = req.session.authUser.userid
    const words = await learnerService.updateWordStudy(userID, reqbody.id);
    res.redirect(reqbody.href);
})

router.get('/handbook', async function (req, res) {
    const userID = req.session.authUser.userid
    const words = await learnerService.getWordWithLetter(userID, '')
    res.render('vwLearner/handbook', {
        words,
        level: 1,
        active: { Handbook: true }
    });
})
router.get('/handbook/search', async function (req, res) {
    const userID = req.session.authUser.userid
    const { word } = req.query;
    const words = await learnerService.getWordWithLetter(userID, word);
    res.render('vwLearner/handbook', {
        words,
        level: 1,
        active: { Handbook: true }
    });
})
router.get('/topictesthistorylist', async function (req, res) {
    const userID = req.session.authUser.userid
    const list = await learnerService.getTestHistory(userID)
    const listlesson = await learnerService.findLesson()
    res.render('vwLearner/topicTestHistoryList', {
        listlesson: listlesson,
        empty: list.length === 0,
        list: list,
        active: { Handbook: true }
    });
})
router.get('/getalltopichistory', async function (req, res) {
    const userID = req.session.authUser.userid
    const list = await learnerService.getTestHistory(userID)
    res.send(list)
})
router.get('/gettopichistory', async function (req, res) {
    const { lessonid } = req.query;
    const userID = req.session.authUser.userid
    const list = await learnerService.getTestHistoryByLesson(userID, lessonid)
    res.send(list)
})

router.get('/topictesthistory/:test_id', async function (req, res) {
    const { test_id } = req.params;
    const list = await learnerService.getTestDetail(test_id)
    res.render('vwLearner/topicTestHistoryDetail', {
        list: list,
        active: { Learn: true }
    });
})
router.get('/topictesthistorylist', async function (req, res) {
    const userID = req.session.authUser.userid
    const list = await learnerService.getTestHistory(userID)
    const listlesson = await learnerService.findLesson()
    res.render('vwLearner/topicTestHistoryList', {
        listlesson: listlesson,
        empty: list.length === 0,
        list: list,
        active: { Handbook: true }
    });
})
router.get('/getalltopichistory', async function (req, res) {
    const userID = req.session.authUser.userid
    const list = await learnerService.getTestHistory(userID)
    res.send(list)
})
router.get('/gettopichistory', async function (req, res) {
    const { lessonid } = req.query;
    const userID = req.session.authUser.userid
    const list = await learnerService.getTestHistoryByLesson(userID, lessonid)
    res.send(list)
})

router.get('/topictesthistory/:test_id', async function (req, res) {
    const { test_id } = req.params;
    const list = await learnerService.getTestDetail(test_id)
    res.render('vwLearner/topicTestHistoryDetail', {
        list: list,
        active: { Learn: true }
    });
})

router.get('/loginstreak',async function(req,res){
    let lessonsProgress = await learnerService.getLessonsProgress(res.locals.authUser.userid)
    lessonsProgress = lessonsProgress.map(it => ({
        lessonname: it.lessonname,
        percentage: (it.wordshaslearned / it.totalwords) * 100,
    }))
    const numFinished = lessonsProgress.filter(lesson => lesson.percentage === 100).length
    
    const numWordLvl5 = await learnerService.getLvl5Mem(res.locals.authUser.userid)
    const {amount} = numWordLvl5
    var memlvl = amount/10
    if(memlvl < 1){
        memlvl = 1
    }

    const streakinfo = await learnerService.getStreak(res.locals.authUser.userid)
    var streak =0
    if(!streakinfo){
        streak = 1
    }
    else{
        streak = streakinfo.streak  
    }

    const account = [
        { memlvl: 1, numFinished: 1, accountlvl: 'Seed', linkimage:"/public/img/background/seed.png" },
        { memlvl: 3, numFinished: 10, accountlvl: 'Germ', linkimage:"/public/img/background/germ.png" },
        { memlvl: 10, numFinished: 20, accountlvl: 'Bud', linkimage:"/public/img/background/bud.png" },
        { memlvl: 40, numFinished: 30, accountlvl: 'Tree', linkimage:"/public/img/background/tree.png" },
        { memlvl: 80, numFinished: 40, accountlvl: 'Flower', linkimage:"/public/img/background/flower.png" },
    ]

    const { accountlvl, linkimage } = account.reduce((acc, cur) => {
        if (memlvl >= cur.memlvl && numFinished >= cur.numFinished) {
          acc = { accountlvl: cur.accountlvl, linkimage: cur.linkimage }
        }
        return acc
      }, { accountlvl: 'Seed', linkimage: "/public/img/background/seed.png" })

    res.render('vwLearner/loginStreak',{
        lessons: numFinished,
        memlvl,
        accountlvl,
        linkimage,
        streak,
        active: { Archive: true }
    })
})
export default router;