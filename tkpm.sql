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
	IsDelete bool default(0),
    PRIMARY KEY(UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS archives;  
CREATE TABLE archives (
    UserID varchar(36) NOT NULL,
    LastLoginDate datetime,
    Streak int,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    PRIMARY KEY(UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS lessons;
CREATE TABLE lessons (
	LessonID varchar(36) NOT NULL,
    LessonName varchar(100) COLLATE utf8_general_ci NOT NULL UNIQUE,
    LessonAvatar text,
    LessonDes text,
    IsDelete bool default(0),
    PRIMARY KEY(LessonID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS topics;
CREATE TABLE topics (
	TopicID varchar(36) NOT NULL,
    TopicName varchar(100) COLLATE utf8_general_ci NOT NULL UNIQUE,
    TopicAvatar text,
    LessonID varchar(36) NOT NULL,
    IsDelete bool default(0),
    FOREIGN KEY (LessonID) REFERENCES categories(LessonID),
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
    IsDelete bool default(0),
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
    IsStudy bool default(1),
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
    Answer varchar(50) COLLATE utf8_general_ci,
    WordID varchar(36) NOT NULL,
    QuestionAvatar text,
    IsDelete bool default(0),
	FOREIGN KEY (WordID) REFERENCES words(WordID),
    PRIMARY KEY(QuestionID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS  topicHistory;
CREATE TABLE topicHistory (
	TopicID  varchar(36) NOT NULL,
    UserID varchar(36) NOT NULL,
    CreateTime datetime,
    FOREIGN KEY (TopicID) REFERENCES topics(TopicID),
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    PRIMARY KEY(TopicID,UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS  testHistory;
CREATE TABLE testHistory (
	TestID  varchar(36) NOT NULL,
    UserID varchar(36) NOT NULL,
    TopicID varchar(36) NOT NULL,
    CreateTime datetime,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    FOREIGN KEY (TopicID) REFERENCES topics(TopicID),
    PRIMARY KEY(TestID,UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS  testHistoryDetail;
CREATE TABLE testHistoryDetail (
	TestID  varchar(36) NOT NULL,
	QuestionID  varchar(36) NOT NULL,
	OptionA  varchar(50) COLLATE utf8_general_ci,
    OptionB  varchar(50) COLLATE utf8_general_ci,
    OptionC  varchar(50) COLLATE utf8_general_ci,
    OptionD  varchar(50) COLLATE utf8_general_ci,
    UserChoose varchar(50) COLLATE utf8_general_ci,
	FOREIGN KEY (TestID) REFERENCES testHistory(TestID),
    FOREIGN KEY (QuestionID) REFERENCES multipleChoiceQuestions(QuestionID),
    PRIMARY KEY(TestID,QuestionID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DELIMITER //

CREATE PROCEDURE update_memlevel(
  IN p_userid VARCHAR(36),
  IN p_wordid VARCHAR(36),
  IN p_check INT
)
BEGIN
  DECLARE v_memlevel INT;
  -- Get the current memlevel for the user and word
  SELECT MemoryLevel INTO v_memlevel
  FROM wordHistory
  WHERE UserID = p_userid AND WordID = p_wordid;
  IF p_check = 0 THEN
    -- Decrease memlevel by 1, but don't go below 1
    IF v_memlevel > 1 THEN
      UPDATE wordHistory
      SET MemoryLevel = v_memlevel - 1, UpdateTime = NOW()
      WHERE UserID = p_userid AND WordID = p_wordid;
	ELSE
	  UPDATE wordHistory
      SET UpdateTime = NOW()
      WHERE UserID = p_userid AND WordID = p_wordid;
    END IF;
  ELSE
    -- Increase memlevel by 1, but don't go above 5
    IF v_memlevel < 5 THEN
      UPDATE wordHistory
      SET MemoryLevel = v_memlevel + 1, UpdateTime = NOW()
      WHERE UserID = p_userid AND WordID = p_wordid;
	ELSE
	  UPDATE wordHistory
      SET UpdateTime = NOW()
      WHERE UserID = p_userid AND WordID = p_wordid;
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_SAFE_UPDATES = 0;


