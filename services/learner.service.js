import db from '../utils/db.js';

export default {
  async findAllTopicWord(topicId) {
    const list = await db('words')
      .select('wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar')
      .where('topicid', topicId)
      
    return list
  },

  async findAllTopicStudy(id) {

    return db.raw('select topics.* ,(select count(*)\n' +
        'from topichistory\n' +
        'where topichistory.TopicID = topics.TopicID\n' +
        'and topichistory.userID= "' + id + '"\n' +
        ') as isRead\n' +
        'from topics'

    )
  }
}