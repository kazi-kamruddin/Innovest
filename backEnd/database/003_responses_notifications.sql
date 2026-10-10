CREATE TABLE IF NOT EXISTS pitch_response_states (
  pitch_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  status ENUM('submitted', 'under_review', 'interested', 'declined') NOT NULL DEFAULT 'submitted',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pitch_response_states_pitch_fk FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  actor_id BIGINT UNSIGNED DEFAULT NULL,
  kind VARCHAR(32) NOT NULL,
  text VARCHAR(255) NOT NULL,
  target_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL DEFAULT NULL,
  KEY user_notifications_user_created_idx (user_id, created_at),
  KEY user_notifications_user_unread_idx (user_id, read_at),
  CONSTRAINT user_notifications_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_notifications_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
