CREATE DATABASE IF NOT EXISTS interview_app_database
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE interview_app_database;


CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(255)    NOT NULL,
  email         VARCHAR(320)    NOT NULL, -- RFC 5321 max
  password_hash VARCHAR(255)    NOT NULL, -- store HASH, not plaintext
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title        VARCHAR(255)    NOT NULL,
  description  TEXT            NULL,
  category     VARCHAR(100)    NULL,
  difficulty   ENUM('easy','medium','hard') NULL, -- optional guardrail
  solution     MEDIUMTEXT      NULL, -- can be large
  hints        TEXT            NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_questions_category (category),
  KEY idx_questions_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User practice sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  question_id  BIGINT UNSIGNED NOT NULL,
  status       ENUM('pending','in_progress','solved','skipped') NOT NULL DEFAULT 'pending',
  attempts     INT UNSIGNED    NOT NULL DEFAULT 0,
  solved_at    DATETIME        NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ps_user (user_id),
  KEY idx_ps_question (question_id),
  KEY idx_ps_user_question (user_id, question_id),
  CONSTRAINT fk_ps_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ps_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User progress table
-- one row per user (enforced by UNIQUE)
CREATE TABLE IF NOT EXISTS progress (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            BIGINT UNSIGNED NOT NULL,
  total_problems     INT UNSIGNED    NOT NULL DEFAULT 0,
  solved_problems    INT UNSIGNED    NOT NULL DEFAULT 0,
  total_time_spent_s INT UNSIGNED    NOT NULL DEFAULT 0, -- store seconds
  last_updated       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress_user (user_id),
  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title         VARCHAR(255)    NOT NULL,
  description   TEXT            NULL,
  url           VARCHAR(2048)   NULL,
  category      VARCHAR(100)    NULL,
  resource_type VARCHAR(100)    NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resources_category (category),
  KEY idx_resources_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;