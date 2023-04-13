import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
const router = express.Router();
router.use(bodyParser.json());

router.get("/topic/:id", async (req, res) => {
  const id = req.params.id;
  const wordlist = await learnerService.findAllTopicWord(id);
  if (wordlist.length == 0) {
    res.status(404).render("404", {
      layout: false,
    });
  }

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

router.get('/topiclist', async function (req, res) {
  const temp = await learnerService.findAllTopicStudy('c2229cc2-cbe1-11ed-b9d3-002248eb7c8a');
  const topiclist = temp[0]
  res.render('vwLearner/topic', {
    topic: topiclist,
  });
})
router.get('/topiclist/:category_id', async function (req, res) {
  const category_id = req.params.category_id;
  const temp = await learnerService.findAllTopicStudy(category_id);
  const topiclist = temp[0]
  console.log('topicist',topiclist)
  res.render('vwLearner/topic', {
    topic: topiclist,
  });
})
router.get('/category', async function (req, res) {
  const total = await learnerService.countCategory();
  const limit = 6;
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
  console.log(list)
  let prePage;
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
  console.log(total)
  // const topiclist = temp[0]
  // console.log(temp.count)
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
  console.log(total)
  const limit = 6;
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
  console.log(list)
  let prePage;
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
  // const topiclist = temp[0]
  // console.log(temp.count)
  res.render('vwLearner/category', {
    category: list,
    pageNumber: pageNumber,
    empty: list.length === 0,
    prePage: prePage,
    nextPage: nextPage,
  });
})
export default router;