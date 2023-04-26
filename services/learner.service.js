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
    async findAllQuestionsTopic(id) {
        const words = await db('words')
            .select('wordid')
            .where('topicid', id);

        let questions = await Promise.all(words.map(async (word) => {
            const result = await db('multiplechoicequestions')
                .where('wordid', word.wordid)
                .andWhere('isdelete', false)
                .orderByRaw('rand()')
                .limit(1)
                .select();

            if (result.length === 0) {
                return null;
            }
            
            const { OptionA, OptionB, OptionC, OptionD } = result[0];
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

        questions = questions.filter(question => question !== null);

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
            let check = await db('multipleChoiceQuestions')
                .where('WordID', word.WordID)
                .andWhere('IsDelete', false)

            let randomType1 = getRandomInt(0, 3);
            const randomType2 = getRandomInt(0, 1);
            if (check.length === 0) {
                randomType1 = getRandomInt(3, 7);
            }

            let question = {}
            question.WordID = word.WordID
            switch(randomType1) {
                case 0:
                    const tempquestion0 = await db('multipleChoiceQuestions')
                        .where('WordID', word.WordID)
                        .andWhere('IsDelete', false)
                        .orderByRaw('rand()')
                        .limit(1)
                        .select('Question', 'QuestionAvatar', 'Answer');

                    const {Question : Question0, Answer : Answer0, QuestionAvatar : QuestionAvatar0} = tempquestion0[0]
                    question.Question = Question0
                    question.Answer = Answer0
                    question.QuestionAvatar = QuestionAvatar0

                    if (question.QuestionAvatar === "") {
                        if (randomType2 == 1) {
                            const meaning = await db('words')
                                .select('wordmeaning')
                                .where('wordid', word.WordID);
                            question.Question = meaning[0].wordmeaning
                        }
                    }
                    question.QuestionType = "0"
                    break
                case 1:
                    const tempquestion1 = await db('multipleChoiceQuestions')
                        .where('WordID', word.WordID)
                        .andWhere('IsDelete', false)
                        .orderByRaw('rand()')
                        .limit(1)
                        .select('Question', 'QuestionAvatar', 'Answer');

                    const {Question : Question1, Answer : Answer1, QuestionAvatar : QuestionAvatar1} = tempquestion1[0]
                    question.Question = Question1
                    question.Answer = Answer1
                    question.QuestionAvatar = QuestionAvatar1

                    if (question.QuestionAvatar === "") {
                        if (randomType2 == 1) {
                            const meaning = await db('words')
                                .select('wordmeaning')
                                .where('wordid', word.WordID);
                            question.Question = meaning[0].wordmeaning
                        }
                    }
                    question.QuestionType = "1"
                    break
                case 2:
                    const tempquestion2 = await db('multipleChoiceQuestions')
                        .where('WordID', word.WordID)
                        .andWhere('IsDelete', false)
                        .orderByRaw('rand()')
                        .limit(1)
                        .select();

                    const {OptionA, OptionB, OptionC, OptionD, Question : Question2, Answer : Answer2, QuestionAvatar : QuestionAvatar2} = tempquestion2[0];
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
                    question.Question = Question2
                    question.Answer = Answer2
                    question.QuestionAvatar = QuestionAvatar2

                    if (question.QuestionAvatar === "") {
                        if (randomType2 == 1) {
                            const meaning = await db('words')
                                .select('wordmeaning')
                                .where('wordid', word.WordID);
                            question.Question = meaning[0].wordmeaning
                        }

                    }
                    question.QuestionType = "2"
                    break
                case 3:
                    question.Answer = word.WordName
                    question.QuestionType = "3"
                    break
                case 4:
                    const meaning4 = await db('words')
                        .select('wordmeaning')
                        .where('wordid', word.WordID);
                    question.Question = meaning4[0].wordmeaning
                    question.Answer = word.WordName
                    question.QuestionType = "4"
                    break
                case 5:
                    const meaning5 = await db('words')
                        .select('wordmeaning')
                        .where('wordid', word.WordID);
                    question.Question = meaning5[0].wordmeaning
                    question.Answer = word.WordName
                    question.QuestionType = "5"
                    break
                case 6:
                    const avatar6 = await db('words')
                        .select('wordavatar')
                        .where('wordid', word.WordID);
                    question.Question = "What is this?"
                    question.QuestionAvatar = avatar6[0].wordavatar
                    question.Answer = word.WordName
                    question.QuestionType = "6"
                    break
                case 7:
                    const avatar7 = await db('words')
                        .select('wordavatar')
                        .where('wordid', word.WordID);
                    question.Question = "What is this?"
                    question.QuestionAvatar = avatar7[0].wordavatar
                    question.Answer = word.WordName
                    question.QuestionType = "7"
                    break
            }

            questions.push(question)
        }
        shuffleArray(questions);
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
    async getWordWithLetter(user_id, letter) {
        const raw = await db.raw("select words.wordid,wordname,wordtype,wordmeaning, wordhistory.isStudy,MemoryLevel , ( case when " +
            "        words.WordName like '%" + letter + "%' then true" +
            "        else false" +
            "        end )" +
            "        as isSearch" +
            "        from wordhistory" +
            "        join words" +
            "        on wordhistory.WordID = words.WordID" +
            "       and wordhistory.userID= '" + user_id + "' " +
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

    async findLessonByOffsetWithLimitSearch(letter, offset, limit) {
        return await db('lessons')
            .where('IsDelete', 0)
            .whereILike('lessonname', '%' + letter + '%')
            .union([
                db.select('lessons.*')
                    .from('lessons')
                    .join('topics','topics.LessonID','lessons.LessonID')
                    .whereILike('topics.TopicName', '%' + letter + '%')
            ])
            .limit(limit)
            .offset(offset)

    },
    async countLesson() {
        let sql = await db('lessons').where('IsDelete', 0).count({ count: '*' }).first();
        return sql.count
    },
    async countLessonSearch(letter) {
        let sql = await db('lessons').where('IsDelete', 0).count({ count: '*' }).whereILike('lessonname', '%' + letter + '%').first();
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
                       group by lessons.lessonid
                       having wordshaslearned != WordsCount.totalwords;`;

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
    },
    async getWord(user_id){
        return await db('wordhistory')
            .rightJoin('words','wordhistory.wordid','words.wordid')
            .select('words.wordid', 'wordname', 'wordtype', 'wordmeaning','MemoryLevel','isStudy')
            .where('wordhistory.userid',user_id)
            .andWhere('words.isDelete',0)
    },

    async updateWordStudy(userid, listwordid) {
        const words = await this.getWord(userid);
        if (words) {
            await Promise.all(words.map(async (w) => {
                await db('wordhistory')
                    .update('isStudy', 0)
                    .where('wordhistory.wordid', w.wordid)
                    .andWhere('userid', userid);
            }));
        }
        if (listwordid) {
            await Promise.all(listwordid.map(async (lid) => {
                await db('wordhistory')
                    .update('isStudy', 1)
                    .where('wordhistory.wordid', lid)
                    .andWhere('userid', userid);


            }));
        }
    },

    async getUserReviewWordsCount(userid) {
        const query = `select count(*) as count from wordhistory
    where ((datediff(curdate(), updatetime) >= 0 and memorylevel = 1)
        or (datediff(curdate(), updatetime) >= 3 and memorylevel = 2)
        or (datediff(curdate(), updatetime) >= 5 and memorylevel = 3)
        or (datediff(curdate(), updatetime) >= 7 and memorylevel = 4))
        and userid =  '${userid}'
        and isstudy = 1;`
        const list = await db.raw(query)
        return list[0][0]
    },
    async findTopic(topicid) {
        const list = await db('topics')
            .select('topicid', 'topicname', 'topicavatar', 'lessonid')
            .where('topicid', topicid)
            .andWhere('isdelete', 0)

        return list[0]
    },

    async getLvl5Mem(user_id){
        const list = await db('wordhistory')
            .count({ amount: 'wordid' })
            .from('wordhistory')
            .where('userid', user_id)
            .andWhere('memorylevel',5)
        
        return list[0]
    },

    async checkDaily(id, date){
        const check = await db('archives')
            .where('userid',id)
            .andWhere('lastlogindate',date);
            if(check.length !==0) return check[0];
            return null;

    },

    async getStreak(id){
        const streak = await db('archives')
            .select('lastlogindate','streak')
            .from('archives')
            .where('userid',id)
            if(streak.length !==0) return streak[0];
            return null;
    },

    async loginStreak(entity){
        return await db('archives').insert(entity);
    },

    async updateLoginStreak(id,date, streak){
        return await db('archives')
            .update('streak', streak)
            .update('lastlogindate',date)
            .where('userid', id)
    },
}
