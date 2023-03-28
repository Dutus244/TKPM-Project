import express from "express";
import learnerService from "../services/learner.service.js";

const router = express.Router();

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

  })
})

export default router;