import db from '../utils/db.js';

export default {
  async findAllTopicWord(topicId) {
    const list = await db('words')
      .select('wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar')
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
    return db.raw('select topics.* ,(select count(*)\n' +
        'from topichistory\n' +
        'where topichistory.TopicID = topics.TopicID\n' +
        'and topichistory.userID= "' + id + '"\n' +
        'and topics.CategoryID= "' + category + '"\n' +
        ') as isRead\n' +
        'from topics'
    )
  },
  async findAllTopicStudy(category) {
    return db.raw('select topics.* ,(select count(*)\n' +
        'from topichistory\n' +
        'where topics.CategoryID= "' + category + '"\n' +
        ') as isRead\n' +
        'from topics'
    )
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
  }
}