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
  async findAllTopicStudy(category,id) {
    return db.raw('select topics.* ,(select count(*) ' +
        'from topichistory ' +
        'where topichistory.TopicID = topics.TopicID ' +
        'and topichistory.userID= "' + id + '" '  +
        'and topics.CategoryID= "' + category + '" ' +
        ') as isRead ' +
        'from topics '
    )
  },
  async findAllTopicStudy(category) {
    return db.raw('select topics.* ,(select count(*) ' +
        'from topichistory ' +
        'where topics.CategoryID= "' + category + '" ' +
        ') as isRead ' +
        'from topics '
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
    return res.length != 0
  },
  async findCategory(){
    return await db('categories').where('IsDelete',0)
  },
  async findCategoryByOffetWithLimit(offset, limit){
    return await db('categories').where('IsDelete',0)
        .limit(limit)
        .offset(offset)
  },
  async countCategory(){
    let sql = await db('categories').where('IsDelete',0).count({count: '*'}).first();
    return sql.count
  },
}