import db from '../utils/db.js';

export default{
    async addLesson(entity) {
        return await db('lessons').insert(entity);
    },

    async getLessonname(id){
        const lessonname = await db
            .select('lessonname')
            .from('lessons')
            .where('lessons.lessonid', id);
        return lessonname[0];
    },

    async getTopicname(id){
        const topicname = await db
            .select('topicname')
            .from('topics')
            .where('topics.topicid',id);
        return topicname[0];
    },

    async addTopic(entity){
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
            .select('wordid', 'wordname', 'wordmeaning', 'wordpronounce')
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

    async getWords(id){
        const list = await db
            .select('wordid', 'wordname')
            .from('words')
            .join('topics', 'words.topicid','topics.topicid')
            .where('topics.topicid', id);
        return list
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
    },

    async getWord(id, wordid){
        const word = await db
            .select('wordname')
            .from('words')
            .join('topics', 'words.topicid','topics.topicid')
            .where('topics.topicid', id)
            .andWhere('words.wordid', wordid);
        return word
    },
    
    async deleteTopic(id) {
        return await db('topics').update('isDelete', 1).where('topics.topicid',id);
    },

    async editTopicAva(id, newava) {
        return await db('topics').update('TopicAvatar', newava).where('topics.topicid',id);
    },

    async getWordAllInfo(wordid) {
        const word = await db('words')
            .select('wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar', 'topicid')
            .where('wordid', wordid)
        return word[0]
    }
}

