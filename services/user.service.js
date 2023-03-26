import db from '../utils/db.js';


export default {
    async findAllTopic() {
        return db('topics');
    },
    async findAllTopicStudy(id){

        // const a = await db.select('topics.*' ).from('topics').map((row) => {
        //     row.isRead = true;
        //     return row;
        // })
        // console.log(a)
        // // for (var i in a){
        // //     i.isRead = true
        // // }
        // // console.log(a)

       return db.raw('select topics.* ,(select count(*)\n' +
           'from topichistory\n' +
           'where topichistory.TopicID = topics.TopicID\n' +
           'and topichistory.userID= "'+id+'"\n' +
           ') as isRead\n' +
           'from topics'
       )
       
}
}