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
    return db('testhistorydetail').insert(entity);
  },
}