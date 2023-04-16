import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
import {PAGE_LIMIT} from './constants.js';
const router = express.Router();
router.use(bodyParser.json());
import moment from 'moment';

router.get("/topic/:id", async (req, res) => {
  const id = req.params.id;
  const wordlist = await learnerService.findAllTopicWord(id);
  // if (wordlist.length == 0) {
  //   res.status(404).render("404", {
  //     layout: false,
  //   });
  // }

  res.render("vwLearner/topicLearn", {
    words: JSON.stringify(wordlist),
    firstWord: wordlist[0],
  });
});

router.get("/topic/:id/finish", async(req, res) => {
  const id = req.params.id

  res.render("vwLearner/topicLearnFinish", {
      topicId: id,
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
  }
  await learnerService.addTopicHistory(topic)
})

router.get('/topic/test/:id', async function (req, res) {
  const topicid = req.params.id
  const listQuestion = await learnerService.findAllQuestionsTopic(topicid)
  res.render('vwLearner/topicTest', {
    topicid: topicid,
    question: listQuestion
  });
});

router.post('/topic/test/submit-answers', async function (req, res) {
  const userAnswers = await req.body;
  const topicid = userAnswers.topicid
  const id = v4()
  const testhistory = {
    testid: id,
    topicid: topicid,
    userid: "6a6e7163-c669-480c-a28a-980246b50b98",
    createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
  };
  const data = await learnerService.addTestHistory(testhistory)
  for (const item of userAnswers.anwsers) {
    const testhistorydetail = {
      testid: id,
      questionid: item.questionID,
      userchoose: item.userchoose,
      optiona: item.optiona,
      optionb: item.optionb,
      optionc: item.optionc,
      optiond: item.optiond,
    }
    const resdetail = await learnerService.addTestHistoryDetail(testhistorydetail)
  }
  // Process the user's answers and send a response
  res.render("vwLearner/topicTestFinish", {
    topicId: topicid,
  })
});

router.get('/topiclist/:category_id', async function (req, res) {
    const {category_id} = req.params;
    const raw_topiclist = await learnerService.findAllTopicStudy(category_id);
    const topiclist = raw_topiclist[0]
    res.render('vwLearner/topic', {
        topic: topiclist,
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
router.get('/category', async function (req, res) {
    const total = await learnerService.countCategory();
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
    const list = await learnerService.findCategoryByOffetWithLimit(
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage,nPage);
    res.render('vwLearner/category', {
      category: list,
      pageNumber: pageNumber,
      empty: list.length === 0,
      prePage: prePage,
      nextPage: nextPage,
    });
})
router.get('/category/:category_page', async function (req, res) {
    const total = await learnerService.countCategory();
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
    const list = await learnerService.findCategoryByOffetWithLimit(
        offset,
        limit
    );
    let [prePage, nextPage] = setup_pages(curPage,nPage);


router.get('/dailytest', async function (req, res) {
  const list = await learnerService.findAllQuestionDailyTest()
  res.render('vwLearner/dailyTest', {
    question: list
  });
})
router.get('/resultdailytest', async function (req, res) {
  // const userID = req.session.authUser.UserID
  const {wordID,check} = req.query;
  const userID = '6a6e7163-c669-480c-a28a-980246b50b98'
  await learnerService.updateMemoryLevel(userID,wordID,check)

    res.render('vwLearner/category', {
      category: list,
      pageNumber: pageNumber,
      empty: list.length === 0,
      prePage: prePage,
      nextPage: nextPage,
    });
})
export default router;