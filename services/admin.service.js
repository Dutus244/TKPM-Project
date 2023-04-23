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

    async getLessonList() {
        const list = await db('lessons')
            .select('lessonid', 'lessonname')
            .where('IsDelete',0)
        return list
    },

    async getLessonDetail(id) {
        const lesson = await db('lessons')
            .select('lessonid', 'lessonname', 'lessonavatar', 'lessondes')
            .where('lessons.LessonID',id);
        return lesson[0]
    },

    async getLessonTopicList(id) {
        const list = await db('topics')
            .select('topicid', 'topicname')
            .where('topics.LessonID',id)
            .andWhere('IsDelete',0);
        return list
    },

    async getTopicDetail(id) {
        const topic = await db
            .select('topicid','topicname', 'topicavatar', 'lessonid')
            .from('topics')
            .where('topics.topicid',id);
        return topic[0];
    },

    async getTopicWordList(id){
        const topic = await db
            .select('wordid', 'wordname', 'wordmeaning', 'wordpronounce')
            .from('topics')
            .join('words','words.topicid','topics.topicid')
            .where('topics.topicid',id)
            .andWhere('topics.IsDelete',0);
        return topic;
    },

    async getTopicTest(id){
        const test = await db
            .select('questionid')
            .from('multiplechoicequestions')
            .join('words','multiplechoicequestions.answer','words.wordid')
            .join('topics','words.topicid','topics.topicid')
            .where('topics.topicid',id)
            .andWhere('multiplechoicequestions.IsDelete',0);
        return test;
    },

    async getWords(id){
        const list = await db
            .select('wordid', 'wordname')
            .from('words')
            .join('topics', 'words.topicid','topics.topicid')
            .where('topics.topicid', id)
            .andWhere('words.IsDelete',0);
        return list
    },

    async addWord(entity){
        return await db('words').insert(entity);
    },

    async addQuestion(entity){
        return await db('multiplechoicequestions').insert(entity);
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

    async deleteLesson(id) {
        return await db('lessons').update('isDelete', 1).where('lessons.lessonid',id);
    },

    async editLessonAva(id, newava) {
        return await db('lessons').update('LessonAvatar', newava).where('lessons.lessonid',id);
    },
    
    async deleteTopic(id) {
        return await db('topics').update('isDelete', 1).where('topics.topicid',id);
    },

    async editTopicAva(id, newava) {
        return await db('topics').update('TopicAvatar', newava).where('topics.topicid',id);
    },
}

