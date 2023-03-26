import express from 'express';
import UserService from '../services/user.service.js'

const router = express.Router();
router.get('/topic', async function (req, res) {
    const topiclist = await UserService.findAllTopic();
    console.log(topiclist)
    res.render('vwUser/topic', {
        topic: topiclist
    });
})

export default router;