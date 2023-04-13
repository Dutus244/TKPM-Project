import db from '../utils/db.js';

export default{
    async add(entity) {
        return await db('topics').insert(entity);
    },

    async getTopicDetail(id) {
        const topic = await db
            .select('topicid','topicname', 'topicavatar')
            .from('topics')
            .where('topics.topicid',id);
        return topic[0];
    },

    async getTopicWordList(id){
        const topic = await db
        .select('wordid', 'wordname')
            .from('topics')
            .join('words','words.topicid','topics.topicid')
            .where('topics.topicid',id);
        return topic;
    },

    async getTopicTest(id){
        const test = await db
            .select('questionid')
            .from('multiplechoicequestions')
            .join('words','multiplechoicequestions.answer','words.wordid')
            .join('topics','words.topicid','topics.topicid')
            .where('topics.topicid',id);
        return test;
    },

    async addWord(entity){
        return await db('words').insert(entity);
    },

    async addQuestion(entity){
        return await db('multiplechoicequestions').insert(entity);
    },

    async findAllTopic() {
        const list = await db('topics')
        .select('TopicID', 'TopicName')
        
        return list
    }
}

