import express from "express";
import learnerService from "../services/learner.service.js";
import bodyParser from 'body-parser';
import { v4 } from 'uuid';
import {PAGE_LIMIT} from './constants.js';
const router = express.Router();
router.use(bodyParser.json());

router.get('/revision', async function(req, res) {
  let categoriesProgress = await learnerService.getCategoriesProgress(res.locals.authUser.userid)
  categoriesProgress = categoriesProgress.map( it => ({
    categoryname: it.categoryname,
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
    categoriesProgress: categoriesProgress,
    memoryLevelCount: JSON.stringify(memoryLevelCount),
    totalWords: totalWords
  })
})

router.get("/topic/:id", async function(req, res) {
  const id = req.params.id;
  const wordlist = await learnerService.findAllTopicWord(id);
  if (!wordlist.length) {
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

router.get('/topiclist/:category_id', async function (req, res) {
    const {category_id} = req.params;
    const raw_topiclist = await learnerService.findAllTopicStudy(category_id);
    const topiclist = raw_topiclist[0]
    const category = await learnerService.findCategoryByID(category_id)
    res.render('vwLearner/topic', {
        topic: topiclist,
        category,
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

    res.render('vwLearner/category', {
      category: list,
      pageNumber: pageNumber,
      empty: list.length === 0,
      prePage: prePage,
      nextPage: nextPage,
    });
})
export default router;