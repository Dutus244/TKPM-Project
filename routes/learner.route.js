import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
const router = express.Router();
router.use(bodyParser.json());

router.get('/revision', async function(req, res) {
  // Gán cứng tạo nào PR #20 merge vô dev thì sửa lại
  var categoriesProgress = await learnerService.getCategoriesProgress('6a6e7163-c669-480c-a28a-980246b50b98')
  // var categoriesProgress = await learnerService.getCategoriesProgress(res.locals.authUser.userid)
  categoriesProgress = categoriesProgress.map( it => ({
    categoryname: it.categoryname,
    percentage: (it.wordshaslearned / it.totalwords) * 100
  }))

  var memoryLevelCount = await learnerService.getUserMemoryLevelCount('6a6e7163-c669-480c-a28a-980246b50b98')
  const maxNumber = memoryLevelCount.reduce((acc, cur) => {
    return acc > cur.number ? acc : cur.number;
  }, 0);
  memoryLevelCount = memoryLevelCount.map( it => ({
    ...it,
    percentage: (it.number / maxNumber) * 100
  }))

  res.render('vwLearner/homeRevision', {
    categoriesProgress: categoriesProgress,
    memoryLevelCount: JSON.stringify(memoryLevelCount),
  })
})

router.get("/topic/:id", async function(req, res) {
  const id = req.params.id;
  const wordlist = await learnerService.findAllTopicWord(id);
  if (wordlist.length == 0) {
    return res.status(404).render("404", {
      layout: false,
    });
  }

  res.render("vwLearner/topicLearn", {
    words: JSON.stringify(wordlist),
    firstWord: wordlist[0],
  });
});

router.get("/topic/:id/finish", async function(req, res) {
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
  const id = v4()
  // const testhistory = {
  //   testid: id,
  //   userid: "c2229cc2-cbe1-11ed-b9d3-002248eb7c8a",
  //   createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
  // };
  // const data = await UserService.addTestHistory(testhistory)
  // for (const item of userAnswers) {
  //   const testhistorydetail = {
  //     testid: id,
  //     questionid: item.questionId,
  //     userchoose: item.answer
  //   }
  //   const resdetail = await UserService.addTestHistoryDetail(testhistorydetail)
  // }
  // Process the user's answers and send a response
  res.render("vwLearner/topicTestFinish", {
    topicId: id,
  })
});

router.get('/topic', async function (req, res) {
  const temp = await learnerService.findAllTopicStudy('c2229cc2-cbe1-11ed-b9d3-002248eb7c8a');
  const topiclist = temp[0]
  res.render('vwLearner/topic', {
    topic: topiclist,
  });
})

export default router;