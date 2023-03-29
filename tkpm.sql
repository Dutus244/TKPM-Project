BEGIN;
CREATE DATABASE matcha_english_learning_website;

BEGIN;
USE matcha_english_learning_website;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	UserID varchar(36) NOT NULL,
    UserName varchar(50) COLLATE utf8_general_ci NOT NULL UNIQUE,
    Pass binary(60) NOT NULL,
    TypeAccount int,
    CreateTime datetime,
	UpdateTime datetime,
    LockAccount bool,
	IsDelete bool,
    PRIMARY KEY(UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS achives;
CREATE TABLE achives (
    UserID varchar(36) NOT NULL,
    Days date,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    PRIMARY KEY(UserID,Days)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS topics;
CREATE TABLE topics (
	TopicID varchar(36) NOT NULL,
    TopicName varchar(100) COLLATE utf8_general_ci NOT NULL UNIQUE,
    TopicAvatar text,
    IsDelete bool,
    PRIMARY KEY(TopicID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS words;
CREATE TABLE words (
	WordID varchar(36) NOT NULL,
    WordName varchar(50) COLLATE utf8_general_ci NOT NULL ,
    WordType varchar(10),
    WordMeaning text COLLATE utf8_general_ci,
    WordPronounce varchar(50),
    WordExample text,
    WordAvatar text,
    TopicID  varchar(36) NOT NULL,
    IsDelete bool,
    FOREIGN KEY (TopicID) REFERENCES topics(TopicID),
    PRIMARY KEY(WordID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS wordHistory;
CREATE TABLE wordHistory(
	UserID varchar(36) NOT NULL,
    WordID varchar(36) NOT NULL,
    MemoryLevel int,
    FirstTime datetime,
    UpdateTime date,
    IsStudy bool,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    FOREIGN KEY (WordID) REFERENCES words(WordID),
    PRIMARY KEY(UserID,WordID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS multipleChoiceQuestions;
CREATE TABLE multipleChoiceQuestions (
	QuestionID  varchar(36) NOT NULL,
    Question text COLLATE utf8_general_ci,
    OptionA  varchar(50) COLLATE utf8_general_ci,
    OptionB  varchar(50) COLLATE utf8_general_ci,
    OptionC  varchar(50) COLLATE utf8_general_ci,
    OptionD  varchar(50) COLLATE utf8_general_ci,
    Answer varchar(36),
    IsDelete bool,
	FOREIGN KEY (Answer) REFERENCES words(WordID),
    PRIMARY KEY(QuestionID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS  testHistory;
CREATE TABLE testHistory (
	TestID  varchar(36) NOT NULL,
    UserID varchar(36) NOT NULL,
    CreateTime datetime,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    PRIMARY KEY(TestID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS  testHistoryDetail;
CREATE TABLE testHistoryDetail (
	TestID  varchar(36) NOT NULL,
	QuestionID  varchar(36) NOT NULL,
    UserChoose varchar(1),
	FOREIGN KEY (TestID) REFERENCES testHistory(TestID),
    FOREIGN KEY (QuestionID) REFERENCES multipleChoiceQuestions(QuestionID),
    PRIMARY KEY(TestID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

insert into topics value('bfc3143a-cb2d-11ed-afa1-0242ac120002','Animal 1','',0);

insert into words values('e1c23250-cb2d-11ed-afa1-0242ac120002','Cat','Noun','Con mèo','','The cat in the house','','bfc3143a-cb2d-11ed-afa1-0242ac120002',0);
insert into words values('e1c23566-cb2d-11ed-afa1-0242ac120002','Dog','Noun','Con chó','','The dog in the house','','bfc3143a-cb2d-11ed-afa1-0242ac120002',0);
insert into words values('e1c23822-cb2d-11ed-afa1-0242ac120002','Cow','Noun','Con bò','','The cow in the house','','bfc3143a-cb2d-11ed-afa1-0242ac120002',0);
insert into words values('e1c239c6-cb2d-11ed-afa1-0242ac120002','Sheep','Noun','Con cừu','','The sheep in the house','','bfc3143a-cb2d-11ed-afa1-0242ac120002',0);