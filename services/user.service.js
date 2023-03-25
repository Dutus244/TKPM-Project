import db from '../utils/db.js';

export default {
    async findAllTopic() {
        return db('topics');
    },
}