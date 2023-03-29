import db from '../utils/db.js';

export default{
    add(entity) {
        return db('topics').insert(entity);
    },

    async findAllTopic() {
        const list = await db('topics')
        .select('TopicID', 'TopicName')
        
        return list
    }
}

