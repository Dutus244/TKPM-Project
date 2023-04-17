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

        const questions = [];

        for (const word of words) {
            const result = await db('multiplechoicequestions')
                .where('wordid', word.wordid)
                .andWhere('isdelete', false)
                .orderByRaw('rand()')
                .limit(1)
                .select();

            if (result.length > 0) {
                const shuffledOptions = shuffleArray([
                    result[0].OptionA,
                    result[0].OptionB,
                    result[0].OptionC,
                    result[0].OptionD,
                ]);

                questions.push({
                    ...result[0],
                    OptionA: shuffledOptions[0],
                    OptionB: shuffledOptions[1],
                    OptionC: shuffledOptions[2],
                    OptionD: shuffledOptions[3],
                });
            }
        }

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

                question.Question = tempquestion[0].Question
                question.Answer = tempquestion[0].Answer
                question.QuestionAvatar = tempquestion[0].QuestionAvatar

                if (question.QuestionAvatar === "") {
                    if (randomType2 == 0) {

                    }
                    else if (randomType2 == 1) {
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

                question.Question = tempquestion[0].Question
                question.Answer = tempquestion[0].Answer
                question.QuestionAvatar = tempquestion[0].QuestionAvatar

                if (question.QuestionAvatar === "") {
                    if (randomType2 == 0) {

                    }
                    else if (randomType2 == 1) {
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

                const shuffledOptions = shuffleArray([
                    tempquestion[0].OptionA,
                    tempquestion[0].OptionB,
                    tempquestion[0].OptionC,
                    tempquestion[0].OptionD,
                ]);
                
                question.OptionA = shuffledOptions[0]
                question.OptionB = shuffledOptions[1]
                question.OptionC = shuffledOptions[2]
                question.OptionD = shuffledOptions[3]
                question.Question = tempquestion[0].Question
                question.Answer = tempquestion[0].Answer
                question.QuestionAvatar = tempquestion[0].QuestionAvatar

                if (question.QuestionAvatar === "") {
                    if (randomType2 == 0) {

                    }
                    else if (randomType2 == 1) {
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
    }
}