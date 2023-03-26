import express from 'express';

const router = express.Router()

router.get('/topic/:id', async(req, res) => {
  const id = req.params.id

  res.render('vwLearner/topicDetail', {

  })
})

export default router