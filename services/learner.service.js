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
  async findAllTopicStudy(id) {
    return db.raw('select topics.* ,(select count(*)\n' +
        'from topichistory\n' +
        'where topichistory.TopicID = topics.TopicID\n' +
        'and topichistory.userID= "' + id + '"\n' +
        ') as isRead\n' +
        'from topics'

    )
  },
  async getCategoriesProgress(userid) {
    const list = await
      db.raw(`select categoryname, count(wordhistory.wordid) as wordshaslearned, WordsCount.totalwords from wordhistory 
      join words on wordhistory.wordid = words.wordid
      join topics on words.topicid = topics.topicid
      join categories on topics.categoryid = categories.categoryid
      join (
        select topics.categoryid, count(words.wordid) as totalwords from topics
        join words on topics.topicid = words.topicid
        group by topics.categoryid
      ) WordsCount on WordsCount.categoryid = categories.categoryid
      where userid = '${userid}'
      group by categories.categoryid;`);
      
      return list[0]
  },
  async getUserMemoryLevelCount(userid) {
    const list = await db('wordhistory')
      .select('memorylevel')
      .count('* as number')
      .where('userid', userid)
      .groupBy('memorylevel')
      .orderBy('memorylevel', 'asc')
      
      return list
  }
}