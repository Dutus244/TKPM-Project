import db from '../utils/db.js';

export default {
    async addLesson(entity) {
        return await db('lessons').insert(entity);
    },

    async getLessonname(id) {
        const lessonname = await db
            .select('lessonname')
            .from('lessons')
            .where('lessons.lessonid', id);
        return lessonname[0];
    },

    async getTopicname(id) {
        const topicname = await db
            .select('topicname')
            .from('topics')
            .where('topics.topicid', id);
        return topicname[0];
    },

    async addTopic(entity) {
        return await db('topics').insert(entity);
    },

    async getLessonList() {
        const list = await db('lessons')
            .select('lessonid', 'lessonname')
            .where('IsDelete', 0)
        return list
    },

    async getLessonDetail(id) {
        const lesson = await db('lessons')
            .select('lessonid', 'lessonname', 'lessonavatar', 'lessondes')
            .where('lessons.LessonID', id);
        return lesson[0]
    },

    async getLessonTopicList(id) {
        const list = await db('topics')
            .select('topicid', 'topicname')
            .where('topics.LessonID', id)
            .andWhere('IsDelete', 0);
        return list
    },

    async getTopicDetail(id) {
        const topic = await db
            .select('topicid', 'topicname', 'topicavatar', 'lessonid')
            .from('topics')
            .where('topics.topicid', id);
        return topic[0];
    },

    async getTopicWordList(id) {
        const topic = await db
            .select('wordid', 'wordname', 'wordmeaning', 'wordpronounce')
            .from('topics')
            .join('words', 'words.topicid', 'topics.topicid')
            .where('topics.topicid', id)
            .andWhere('words.IsDelete', 0);
        return topic;
    },

    async getTopicTest(id) {
        const test = await db
            .select('questionid')
            .from('multiplechoicequestions')
            .join('words','multiplechoicequestions.answer','words.wordid')
            .join('topics','words.topicid','topics.topicid')
            .where('topics.topicid',id)
            .andWhere('multiplechoicequestions.IsDelete',0);
        return test;
    },

    async getWordDetail(id) {
        const topic = await db
            .select('words.topicid', 'topics.topicname', 'words.wordid',
                'words.wordname', 'words.wordtype', 'words.wordmeaning',
                'words.wordmeaning', 'words.wordpronounce', 'words.wordexample',
                'words.wordavatar')
            .from('words')
            .join('topics', 'words.topicid', 'topics.topicid')
            .where('words.wordid', id);
        return topic[0];
    },

    async getWords(id)  {
        const list = await db
            .select('wordid', 'wordname')
            .from('words')
            .join('topics', 'words.topicid', 'topics.topicid')
            .where('topics.topicid', id)
            .andWhere('words.IsDelete', 0);
        return list
    },

    async addWord(entity) {
        return await db('words').insert(entity);
    },

    async addQuestion(entity) {
        return await db('multiplechoicequestions').insert(entity);
    },

    async getWord(id, wordid) {
        const word = await db
            .select('wordname')
            .from('words')
            .join('topics', 'words.topicid', 'topics.topicid')
            .where('topics.topicid', id)
            .andWhere('words.wordid', wordid);
        return word
    },

    async deleteLesson(id) {
        return await db('lessons').update('isDelete', 1).where('lessons.lessonid', id);
    },

    async editLessonName(id, newname) {
        return await db('lessons').update('LessonName', newname).where('lessons.lessonid', id);
    },

    async editLessonDescription(id, newdes) {
        return await db('lessons').update('LessonDes', newdes).where('lessons.lessonid', id);
    },

    async editLessonAva(id, newava) {
        return await db('lessons').update('LessonAvatar', newava).where('lessons.lessonid', id);
    },

    async deleteTopic(id) {
        return await db('topics').update('isDelete', 1).where('topics.topicid', id);
    },

    async editTopicName(id, newname) {
        return await db('topics').update('TopicName', newname).where('topics.topicid', id);
    },

    async editTopicAva(id, newava) {
        return await db('topics').update('TopicAvatar', newava).where('topics.topicid', id);
    },

    async getWordAllInfo(wordid) {
        const word = await db('words')
            .select('wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar', 'topicid')
            .where('wordid', wordid)
        return word[0]
    },

    async updateWord(word) {
        const { wordid, topicid, wordname, wordtype, wordmeaning, wordpronounce, wordexample, wordavatar, isdelete } = word;
        return await db('words').update({
            topicid,
            wordname,
            wordtype,
            wordmeaning,
            wordpronounce,
            wordexample,
            wordavatar,
            isdelete
        }).where('words.wordid', wordid);
    },

    async deleteWord(id) {
        return await db('words').update('isDelete', 1).where('words.wordid', id);
    },
    async getUserList() {

        const sql = `SELECT users.*,
                            DATE_FORMAT(CreateTime, '%d/%m/%Y %H:%i:%s') AS FormattedCreateTime,
                            DATE_FORMAT(UpdateTime, '%d/%m/%Y %H:%i:%s') AS FormattedUpdateTime
                     FROM users
        `
        const list = await db.raw(sql)
        return list[0]
    },
    lock(id) {
        const user = {
            LockAccount: 1,
        }
        return db('users').where('UserID', id).update(user);
    },

    unlock(id) {
        const user = {
            LockAccount: 0,
        }
        return db('users').where('UserID', id).update(user);
    },
    async searchQuestionByTopicFilterByAnswer(topicid, word) {
        if (!word) {
            const test = await db
                .select('questionid', 'question', 'answer')
                .from('multiplechoicequestions')
                .join('words', 'multiplechoicequestions.wordid', 'words.wordid')
                .join('topics', 'words.topicid', 'topics.topicid')
                .where('topics.topicid', topicid)
                .andWhere('questionavatar', '')
                .andWhere('multiplechoicequestions.IsDelete', 0);
            return test;
        } else {
            const test = await db
                .select('questionid', 'question', 'answer')
                .from('multiplechoicequestions')
                .join('words', 'multiplechoicequestions.wordid', 'words.wordid')
                .join('topics', 'words.topicid', 'topics.topicid')
                .where('topics.topicid', topicid)
                .andWhere('answer', word)
                .andWhere('questionavatar', '')
                .andWhere('multiplechoicequestions.IsDelete', 0);
            return test;
        }
    },
    async deleteQuestion(questionid) {
        await db('multiplechoicequestions')
            .where('questionid', questionid)
            .update('isdelete', 1)
        return
    },

    async getQuestionInfo(id){
        const question = await db('multiplechoicequestions')
            .select('question','optiona','optionb','optionc','answer','wordid')
            .from('multiplechoicequestions')
            .where('questionid',id);
        return question[0];
    },

    async editQuestion(fixquestion){
        const { questionid, question, optiona, optionb, optionc } = fixquestion;
        return await db('multiplechoicequestions')
            .update('question',question)
            .update('optiona',optiona)
            .update('optionb',optionb)
            .update('optionc',optionc)
            .where('questionid',questionid)
    },

    async getTopicIdByWordId(wordid){
        const id = await db('words')
            .select('topicid')
            .from('words')
            .where('wordid',wordid)
        return id[0]
    },
}

