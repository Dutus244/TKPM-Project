import db from '../utils/db.js';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    async findAllQuestionDailyTest(userID) {
        const words = [];
        const levels = [1, 2, 3, 4]; // List of memory levels
        const daysDifference = [0, 2, 4, 6]; // List of days differences

        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const daysDiff = daysDifference[i];
            const sql = `select wordHistory.WordID, WordName
                         from wordHistory
                                  join words on words.WordID = wordHistory.WordID
                         where MemoryLevel = ${level}
                           and IsStudy = 1
                           and DATEDIFF(CURRENT_DATE(), UpdateTime) >= ${daysDiff}
                           and wordHistory.UserID = '${userID}'`;
            const result = await db.raw(sql);
            const list = result[0];
            for (let j = 0; j < list.length; j++) {
                words.push(list[j]);
            }
        }

        const questions = [];
        for (const word of words) {
            const randomType1 = getRandomInt(0, 3);
            const randomType2 = getRandomInt(0, 1);

            let question = {}
            question.WordID = word.WordID

            if (randomType1 == 0) {
                let tempquestion = await db('multiplechoicequestions')
                    .where('WordID', word.WordID)
                    .andWhere('IsDelete', false)
                    .orderByRaw('rand()')
                    .limit(1)
                    .select('Question', 'QuestionAvatar', 'Answer');

                const {Question, Answer, QuestionAvatar} = tempquestion[0]
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
                } else {

                }
                question.QuestionType = "0"

            } else if (randomType1 === 1) {
                let tempquestion = await db('multiplechoicequestions')
                    .where('WordID', word.WordID)
                    .andWhere('IsDelete', false)
                    .orderByRaw('rand()')
                    .limit(1)
                    .select('Question', 'QuestionAvatar', 'Answer');

                const {Question, Answer, QuestionAvatar} = tempquestion[0]
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
                } else {

                }
                question.QuestionType = "1"
            } else if (randomType1 === 2) {
                const tempquestion = await db('multiplechoicequestions')
                    .where('WordID', word.WordID)
                    .andWhere('IsDelete', false)
                    .orderByRaw('rand()')
                    .limit(1)
                    .select();

                const {OptionA, OptionB, OptionC, OptionD, Question, Answer, QuestionAvatar} = tempquestion[0];
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
                } else {

                }
                question.QuestionType = "2"
            }
            else if (randomType1 === 3) {
                question.Answer = word.WordName
                question.QuestionType = "3"
            }
            questions.push(question)
        }
        return questions
    },
    async updateMemoryLevel(UserID, WordID, check) {
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
    async findAllTopicStudy(lesson, id) {
        return db.raw('select topics.* ,(select count(*) ' +
            'from topichistory ' +
            'where topichistory.TopicID = topics.TopicID ' +
            'and topichistory.userID= "' + id + '" ' +
            'and topics.LessonID= "' + lesson + '" ' +
            ') as isRead ' +
            'from topics '
        )
    },
    async findAllTopicStudy(lesson) {
        return db.raw('select topics.* ,(select count(*) ' +
            'from topichistory ' +
            'where topics.LessonID= "' + lesson + '" ' +
            ') as isRead ' +
            'from topics '
        )
    },
    async findLessonByID(lesson_id) {
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
    async findLesson() {
        return await db('lessons').where('IsDelete', 0)
    },
    async getWordWithLetter(user_id,letter){
        const raw = await db.raw("select words.wordid,wordname,wordtype,wordmeaning, wordhistory.isStudy,MemoryLevel , ( case when " +
            "        words.WordName like '%"+letter+"%' then true" +
            "        else false" +
            "        end )" +
            "        as isSearch" +
            "        from wordhistory" +
            "        join words" +
            "        on wordhistory.WordID = words.WordID" +
            "       and wordhistory.userID= '"+user_id+"' "+
            "       and words.IsDelete = 0"
        )
        return raw[0]

    },
  async findLessonByOffsetWithLimit(offset, limit){
    return await db('lessons').where('IsDelete',0)
        .limit(limit)
        .offset(offset)
  },

    async findLessonByOffsetWithLimitSearch(letter,offset, limit){
        return await db('lessons').where('IsDelete',0).whereILike('lessonname','%'+letter+'%')
            .limit(limit)
            .offset(offset)
    },
    async countLesson() {
        let sql = await db('lessons').where('IsDelete', 0).count({count: '*'}).first();
        return sql.count
    },
    async getLessonsProgress(userid) {
        const query = `select lessonname, count(wordhistory.wordid) as wordshaslearned, WordsCount.totalwords
                       from wordhistory
                                join words on wordhistory.wordid = words.wordid
                                join topics on words.topicid = topics.topicid
                                join lessons on topics.lessonid = lessons.lessonid
                                join (select topics.lessonid, count(words.wordid) as totalwords
                                      from topics
                                               join words on topics.topicid = words.topicid
                                      group by topics.lessonid) WordsCount on WordsCount.lessonid = lessons.lessonid
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
    },
    async getTestHistory(userid) {
        const sql = `SELECT testhistory.*,
                            lessons.LessonName,
                            topics.TopicName,
                            DATE_FORMAT(CreateTime, '%d/%m/%Y %H:%i:%s') AS FormattedCreateTime
                     FROM testhistory
                              JOIN topics ON topics.TopicID = testhistory.TopicID
                              JOIN lessons ON topics.LessonID = lessons.LessonID
                     WHERE testhistory.UserID = '${userid}'
        `
        const list = await db.raw(sql)
        return list[0]
    },
    async getTestHistoryByLesson(userid, lessonid) {
        const sql = `SELECT testhistory.*,
                            lessons.LessonName,
                            topics.TopicName,
                            DATE_FORMAT(CreateTime, '%d/%m/%Y %H:%i:%s') AS FormattedCreateTime
                     FROM testhistory
                              JOIN topics ON topics.TopicID = testhistory.TopicID
                              JOIN lessons ON topics.LessonID = lessons.LessonID
                     WHERE testhistory.UserID = '${userid}' and lessons.LessonID = '${lessonid}'
        `
        const list = await db.raw(sql)
        return list[0]
    },
    async getTestDetail(testid) {
        const sql = `select testhistorydetail.*, 
        multipleChoiceQuestions.Question,
        multipleChoiceQuestions.QuestionAvatar,
        multipleChoiceQuestions.Answer
         from testhistorydetail
         join multipleChoiceQuestions on multipleChoiceQuestions.QuestionID = testhistorydetail.QuestionID
         where testhistorydetail.TestID = '${testid}'`
        const list = await db.raw(sql)
        return list[0]
    }
}
