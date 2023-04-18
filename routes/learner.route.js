import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
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
  const {topicid} = userAnswers
  const id = v4()
  const testhistory = {
    testid: id,
    topicid: topicid,
    userid: req.session.authUser.userid,
    createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
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
  })
});

router.get('/topic', async function (req, res) {
  const temp = await learnerService.findAllTopicStudy('c2229cc2-cbe1-11ed-b9d3-002248eb7c8a');
  const topiclist = temp[0]
  res.render('vwLearner/topic', {
    topic: topiclist,
  });
})

router.get('/dailytest', async function (req, res) {
  const list = await learnerService.findAllQuestionDailyTest()
  res.render('vwLearner/dailyTest', {
    question: list
  });
})
router.get('/resultdailytest', async function (req, res) {
  const userID = req.session.authUser.userid
  const {wordID, check} = req.query;
  await learnerService.updateMemoryLevel(userID, wordID, check)
})
export default router;