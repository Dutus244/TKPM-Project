import db from '../utils/db.js';

export default{
    async add(entity) {
        return await db('topics').insert(entity);
    },

    async getTopicDetail(id){
        const topic = await db
            .select('topics.topicid','topicname', 'topicavatar', 'wordid', 'wordname')
            .from('topics')
            .join('words')
            .where('topics.topicid',id);
        return topic;
    },

    async getTest(id){
        const test = await db
            .select('questionid')
            .from('multiplechoicequestions')
            .join('words')
            .join('topics')
            .where('topics.topicid',id);
        if (test.length === 0) {
            return null;
        }
            return test;
    },

    async countWords(id){
        const list = await db
            .count({amount: 'wordid'})
            .from('words')
            .join('topics')
            .where('topics.topicid', id);
        return list[0].amount
    },

    async addWord(entity){
        return await db('words').insert(entity);
    },

    async addQuestion(entity){
        return await db('multiplechoicequestions').insert(entity);
    },
}