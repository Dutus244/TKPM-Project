import db from '../utils/db.js';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default {
    async findAllTopicWord(topicId) {
        const list = await db('words')
            .select('wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar')
            .where('topicid', topicId)

        return list
    },


    async findAllQuestionsTopic(id) {
        const words = await db('words')
            .select('wordid')
            .where('topicid', id);

        const questions = await Promise.all(words.map(async (word) => {
            const result = await db('multiplechoicequestions')
                .where('wordid', word.wordid)
                .andWhere('isdelete', false)
                .orderByRaw('rand()')
                .limit(1)
                .select();
            const {OptionA, OptionB, OptionC, OptionD} = result[0];
            if (result.length > 0) {
                const shuffledOptions = shuffleArray([
                    OptionA,
                    OptionB,
                    OptionC,
                    OptionD,
                ]);

                return {
                    ...result[0],
                    OptionA: shuffledOptions[0],
                    OptionB: shuffledOptions[1],
                    OptionC: shuffledOptions[2],
                    OptionD: shuffledOptions[3],
                };
            }
        }));

        shuffleArray(questions);

        return questions;
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
    async findAllQuestionDailyTest() {
        const words = []

        const sqllev1 = `select wordHistory.WordID,WordName from wordHistory join words on words.WordID = wordHistory.WordID where MemoryLevel = 1 and IsStudy = 1`
        const listwordlev1 = await db.raw(sqllev1)
        for (let i = 0; i < listwordlev1[0].length; i++) {
            words.push(listwordlev1[0][i]);
        }

        const sqllev2 = `select wordHistory.WordID,WordName from wordHistory join words on words.WordID = wordHistory.WordID  where MemoryLevel = 2  and IsStudy = 1 and DATEDIFF(CURRENT_DATE(), UpdateTime) >= 1`
        const listwordlev2 = await db.raw(sqllev2)
        for (let i = 0; i < listwordlev2[0].length; i++) {
            words.push(listwordlev2[0][i]);
        }

        const sqllev3 = `select wordHistory.WordID,WordName from wordHistory join words on words.WordID = wordHistory.WordID  where MemoryLevel = 3  and IsStudy = 1 and DATEDIFF(CURRENT_DATE(), UpdateTime) >= 3`
        const listwordlev3 = await db.raw(sqllev3)
        for (let i = 0; i < listwordlev3[0].length; i++) {
            words.push(listwordlev3[0][i]);
        }

        const sqllev4 = `select wordHistory.WordID,WordName from wordHistory join words on words.WordID = wordHistory.WordID  where MemoryLevel = 4  and IsStudy = 1 and DATEDIFF(CURRENT_DATE(), UpdateTime) >= 5`
        const listwordlev4 = await db.raw(sqllev4)
        for (let i = 0; i < listwordlev4[0].length; i++) {
            words.push(listwordlev4[0][i]);
        }

        const sqllev5 = `select wordHistory.WordID,WordName from wordHistory join words on words.WordID = wordHistory.WordID  where MemoryLevel = 5  and IsStudy = 1 and DATEDIFF(CURRENT_DATE(), UpdateTime) >= 7`
        const listwordlev5 = await db.raw(sqllev5)
        for (let i = 0; i < listwordlev5[0].length; i++) {
            words.push(listwordlev5[0][i]);
        }

        const questions = [];
        for (const word of words) {
            const randomType1 = Math.floor(Math.random() * 3);
            const randomType2 = Math.floor(Math.random() * 2);

            let question = {}
            question.WordID = word.WordID

            if (randomType1 == 0) {
                let tempquestion = await db('multiplechoicequestions')
                    .where('WordID', word.WordID)
                    .andWhere('IsDelete', false)
                    .orderByRaw('rand()')
                    .limit(1)
                    .select('Question','QuestionAvatar','Answer');

                const {Question,Answer,QuestionAvatar} = tempquestion[0]
                question.Question = Question
                question.Answer = Answer
                question.QuestionAvatar = QuestionAvatar

                if (question.QuestionAvatar === "") {
                    if (randomType2 == 1) {
                        const meaning = await db('words')
                            .select('wordmeaning')
                            .where('wordid', word.WordID);
                        question.Question = meaning[0].wordmeaning
                    }
                }
                else {

                }
                question.QuestionType = "0"

            }
            else if (randomType1 === 1) {
                let tempquestion = await db('multiplechoicequestions')
                    .where('WordID', word.WordID)
                    .andWhere('IsDelete', false)
                    .orderByRaw('rand()')
                    .limit(1)
                    .select('Question','QuestionAvatar','Answer');

                const {Question,Answer,QuestionAvatar} = tempquestion[0]
                question.Question = Question
                question.Answer = Answer
                question.QuestionAvatar = QuestionAvatar

                if (question.QuestionAvatar === "") {
                    if (randomType2 == 1) {
                        const meaning = await db('words')
                            .select('wordmeaning')
                            .where('wordid', word.WordID);
                        question.Question = meaning[0].wordmeaning
                    }
                }
                else {

                }
                question.QuestionType = "1"
            }
            else if (randomType1 === 2) {
                const tempquestion = await db('multiplechoicequestions')
                    .where('WordID', word.WordID)
                    .andWhere('IsDelete', false)
                    .orderByRaw('rand()')
                    .limit(1)
                    .select();
                
                const {OptionA, OptionB, OptionC, OptionD,Question,Answer,QuestionAvatar} = tempquestion[0];
                const shuffledOptions = shuffleArray([
                    OptionA,
                    OptionB,
                    OptionC,
                    OptionD,
                ]);
                
                question.OptionA = shuffledOptions[0]
                question.OptionB = shuffledOptions[1]
                question.OptionC = shuffledOptions[2]
                question.OptionD = shuffledOptions[3]
                question.Question = Question
                question.Answer = Answer
                question.QuestionAvatar = QuestionAvatar

                if (question.QuestionAvatar === "") {
                    if (randomType2 == 1) {
                        const meaning = await db('words')
                            .select('wordmeaning')
                            .where('wordid', word.WordID);
                        question.Question = meaning[0].wordmeaning
                    }
                }
                else {

                }
                question.QuestionType = "2"
            }
            questions.push(question)
        }
        return questions
    },
    async updateMemoryLevel(UserID,WordID,check) {
        const sql = `CALL update_memlevel('${UserID}', '${WordID}', ${check})`
        await db.raw(sql)
    },
  async findAllTopicWord(topicId) {
    const list = await db('words')
      .select('wordid', 'wordname', 'wordtype', 'wordmeaning', 'wordpronounce', 'wordexample', 'wordavatar')
      .where('topicid', topicId)
      
    return list
  },
  async addTestHistory(entity) {
    return await db('testhistory').insert(entity);
  },
  async addTestHistoryDetail(entity) {
    return await db('testhistorydetail').insert(entity);
  },
  async findAllTopicStudy(lesson,id) {
    return db.raw('select topics.* ,(select count(*) ' +
        'from topichistory ' +
        'where topichistory.TopicID = topics.TopicID ' +
        'and topichistory.userID= "' + id + '" '  +
        ') as isRead ' +
        'from topics '+
        'where topics.IsDelete = 0 '+
        'and topics.LessonID= "' + lesson + '" '
  )
  },
  async findLessonByID(lesson_id){
    const raw_lesson = await db('lessons').where('LessonID', lesson_id)
    return raw_lesson[0]
  },
  async addWordHistory(words) {
    return await db('wordhistory').insert(words)
  },
  async addTopicHistory(topic) {
    return await db('topichistory').insert(topic)
  },
  async hasLearnedTopic(userid, topicid) {
    const res = await db('topichistory')
      .where('userid', userid)
      .andWhere('topicid', topicid)
    return res.length != 0
  },
  async findLesson(){
    return await db('lessons').where('IsDelete',0)
  },
    async getWord(user_id){
        return await db('wordhistory')
            .rightJoin('words','wordhistory.wordid','words.wordid')
            .select('words.wordid', 'wordname', 'wordtype', 'wordmeaning','MemoryLevel','isStudy')
            .where('wordhistory.userid',user_id)
            .andWhere('words.isDelete',0)
    },
    async getWordWithLetter(user_id,letter){
        return await db('wordhistory')
            .rightJoin('words','wordhistory.wordid','words.wordid')
            .select('words.wordid', 'wordname', 'wordtype', 'wordmeaning','MemoryLevel','isStudy')
            .where('wordhistory.userid',user_id)
            .andWhere('words.isDelete',0)
            .whereILike('words.wordname','%'+letter+'%')
    },
  async findLessonByOffetWithLimit(offset, limit){
    return await db('lessons').where('IsDelete',0)
        .limit(limit)
        .offset(offset)
  },
    
    async findLessonByOffetWithLimitSearch(letter,offset, limit){
        return await db('lessons').where('IsDelete',0).whereILike('lessonname','%'+letter+'%')
            .limit(limit)
            .offset(offset)
    },
  async countLesson(){
    let sql = await db('lessons').where('IsDelete',0).count({count: '*'}).first();
    return sql.count
  },
    async countLessonSearch(letter){
        let sql = await db('lessons').where('IsDelete',0).count({count: '*'}) .whereILike('lessonname','%'+letter+'%').first();
        return sql.count
    },
  async getLessonsProgress(userid) {
    const query = `select lessonname, count(wordhistory.wordid) as wordshaslearned, WordsCount.totalwords from wordhistory 
    join words on wordhistory.wordid = words.wordid
    join topics on words.topicid = topics.topicid
    join lessons on topics.lessonid = lessons.lessonid
    join (
      select topics.lessonid, count(words.wordid) as totalwords from topics
      join words on topics.topicid = words.topicid
      group by topics.lessonid
    ) WordsCount on WordsCount.lessonid = lessons.lessonid
    where userid = '${userid}'
    group by lessons.lessonid;`;
    
    const list = await db.raw(query);
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
