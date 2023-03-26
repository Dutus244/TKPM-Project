import express from 'express';
import UserService from '../services/user.service.js'

const router = express.Router();
router.get('/topic', async function (req, res) {
    const temp = await UserService.findAllTopicStudy('c2229cc2-cbe1-11ed-b9d3-002248eb7c8a');
    const topiclist = temp[0]
    console.log(topiclist)

    res.render('vwUser/topic', {
        topic: topiclist
    });
})

export default router;