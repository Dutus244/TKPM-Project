import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
import {PAGE_LIMIT} from './constants.js';
const router = express.Router();
router.use(bodyParser.json());
import moment from 'moment';

router.get('/revision', async function(req, res) {
  let lessonsProgress = await learnerService.getLessonsProgress(res.locals.authUser.userid)
  lessonsProgress = lessonsProgress.map( it => ({
    lessonname: it.lessonname,
    percentage: (it.wordshaslearned / it.totalwords) * 100,
  }))

  let memoryLevelCount = await learnerService.getUserMemoryLevelCount(res.locals.authUser.userid)
  const maxNumber = memoryLevelCount.reduce((acc, cur) => {
    return acc > cur.number ? acc : cur.number;
  }, 0);
  const totalWords = memoryLevelCount.reduce((acc, cur) => acc + cur.number, 0)
  memoryLevelCount = memoryLevelCount.map( it => ({
    ...it,
    percentage: (it.number / maxNumber) * 100
  }))

  res.render('vwLearner/homeRevision', {
      lessonsProgress: lessonsProgress,
      memoryLevelCount: JSON.stringify(memoryLevelCount),
      totalWords: totalWords,
      active: {Review: true }
  })
})

router.get("/topic/:id", async function(req, res) {
  const id = req.params.id;
  const wordlist = await learnerService.findAllTopicWord(id);
  if (!wordlist.length) {
    return res.status(404).render("404", {
        layout: false,
        active: {Learn: true }
    });
  }

  res.render("vwLearner/topicLearn", {
      words: JSON.stringify(wordlist),
      firstWord: wordlist[0],
      active: {Learn: true }

  });
});

router.get("/topic/:id/finish", async function(req, res) {
  const id = req.params.id

  res.render("vwLearner/topicLearnFinish", {
      topicId: id,
      active: {Learn: true }
  })
});

router.post("/topic/:id/finish", async function(req, res) {
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
    finishWords.push({wordid, ...wordData})
  })
  await learnerService.addWordHistory(finishWords)

  const topic = {
      topicid,
      userid,
      createtime: timestamp,
      active: {Learn: true }
  }
  await learnerService.addTopicHistory(topic)
})

router.get('/topic/test/:id', async function (req, res) {
  const topicid = req.params.id
  const listQuestion = await learnerService.findAllQuestionsTopic(topicid)
  res.render('vwLearner/topicTest', {
      topicid: topicid,
      question: listQuestion,
      active: {Learn: true }
  });
});

router.post('/topic/test/submit-answers', async function (req, res) {
  const userAnswers = await req.body;
  const {topicid} = userAnswers
  const id = v4()
  const testhistory = {
      testid: id,
      topicid: topicid,
      userid: req.session.authUser.userid,
      createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
      active: {Learn: true }
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
      topicId: topicid,
      active: {Learn: true }
  })
});

router.get('/topiclist/:lesson_id', async function (req, res) {
    const lesson_id = req.params.lesson_id;
    const user_id = res.locals.authUser.userid
    const raw_topiclist = await learnerService.findAllTopicStudy(lesson_id,user_id);
    const topiclist = raw_topiclist[0]
    const lesson = await learnerService.findLessonByID(lesson_id)
    res.render('vwLearner/topic', {
        topic: topiclist,
        lesson,
        active: {Learn: true }
    });
})
function setup_pages(curPage, nPage){
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
    if (+nPage < +curPage){
        nextPage = 0
        prePage = 0
    }
        return [prePage , nextPage]
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
    const list = await learnerService.findLessonByOffetWithLimit(
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage,nPage);

    res.render('vwLearner/lesson', {
        lesson: list,
        pageNumber: pageNumber,
        empty: list.length === 0,
        prePage: prePage,
        nextPage: nextPage,
        active: {Learn: true }

    });
})
router.get('/lesson/search', async function (req, res) {
    const {lesson_letter} = req.query;
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
    const list = await learnerService.findLessonByOffetWithLimitSearch(lesson_letter,
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage,nPage);
    res.render('vwLearner/lesson', {
        lesson: list,
        pageNumber: pageNumber,
        empty: list.length === 0,
        prePage: prePage,
        nextPage: nextPage,
        active: {Learn: true }

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
    const list = await learnerService.findLessonByOffetWithLimit(
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage,nPage);
    res.render('vwLearner/lesson', {
        lesson: list,
        pageNumber: pageNumber,
        empty: list.length === 0,
        prePage: prePage,
        nextPage: nextPage,
        active: {Learn: true }

    });
})

router.get('/dailytest', async function (req, res) {
  const list = await learnerService.findAllQuestionDailyTest()
  res.render('vwLearner/dailyTest', {
      question: list,
      active: {Review: true }
  });
})
router.get('/resultdailytest', async function (req, res) {
  const userID = req.session.authUser.userid
  const {wordID, check} = req.query;
  await learnerService.updateMemoryLevel(userID, wordID, check)
})
router.post('/handbook', async function (req, res) {
    const re = req.body
    const userID = req.session.authUser.userid
    const words = await learnerService.updateWordStudy(userID, re.id);
    res.redirect(re.href);
})

router.get('/handbook', async function (req, res) {
    const userID = req.session.authUser.userid
    const words = await learnerService.getWordWithLetter(userID,'')
    res.render('vwLearner/handbook', {
        words,
        level: 1,
        active: {Handbook: true }
    });
})
router.get('/handbook/search/w', async function (req, res) {
    const userID = req.session.authUser.userid
    const {word} = req.query;
    const words = await learnerService.getWordWithLetter(userID,word);
    res.render('vwLearner/handbook', {
        words,
        level: 1,
        active: {Handbook: true }
    });
})

export default router;