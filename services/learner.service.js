import db from '../utils/db.js';

export default {
  async findAllTopicWord(topicId) {
    const list = await db('words')
      .select('wordid', 'wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar')
      .where('topicid', topicId)
      
    return list
  },
  async findAllQuestionsTopic(id) {
    const list = await db
        .select('questionid','question','optiona','optionb','optionc','optiond','answer','picture','words.wordname')
        .from('multiplechoicequestions')
        .join('words','multiplechoicequestions.answer','words.wordid')
        .join('topics','words.topicid','topics.topicid')
        .where('topics.topicid', id);
    return list;
  },
  async addTestHistory(entity) {
    return await db('testhistory').insert(entity);
  },
  async addTestHistoryDetail(entity) {
    return await db('testhistorydetail').insert(entity);
  },
  async findAllTopicStudy(id) {
    return db.raw('select topics.* ,(select count(*)\n' +
        'from topichistory\n' +
        'where topichistory.TopicID = topics.TopicID\n' +
        'and topichistory.userID= "' + id + '"\n' +
        ') as isRead\n' +
        'from topics'

    )
  },
  async addWordHistory(words) {
    return await db('wordhistory').insert(words)
  },
  async addTopicHistory(topic) {
    return await db('topichistory').insert(topic)
  },
  async hasLearnedTopic(userid, topicid) {
    const res = await db('topichistory')
      .where('userid', userid)
      .andWhere('topicid', topicid)
    
    if (!res) {
      return false
    }
    return true
  }
}