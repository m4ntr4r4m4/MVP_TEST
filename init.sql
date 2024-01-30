USE mvp_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS UserInteractions (
  interaction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action_type VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS KarmaPoints (
  user_id INT PRIMARY KEY,
  total_points INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS AdminActions (
  admin_action_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  action_type VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

