-- Innovest Baseline Schema Definition
-- Defines the core tables: users, profiles, investor preferences, pitches, requests, conversations, and messages.

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_info` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `areas_of_interest` TEXT DEFAULT NULL,
  `about` TEXT DEFAULT NULL,
  UNIQUE KEY `user_info_user_id_unique` (`user_id`),
  CONSTRAINT `user_info_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `investor_info` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `fields_of_interest` TEXT DEFAULT NULL,
  `investment_range_min` DECIMAL(15,2) DEFAULT NULL,
  `investment_range_max` DECIMAL(15,2) DEFAULT NULL,
  `preferred_industries` TEXT DEFAULT NULL,
  UNIQUE KEY `investor_info_user_id_unique` (`user_id`),
  CONSTRAINT `investor_info_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `investor_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `investorId` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `minInvestment` DECIMAL(15,2) DEFAULT NULL,
  `maxInvestment` DECIMAL(15,2) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'open',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `investor_requests_investorId_index` (`investorId`),
  CONSTRAINT `investor_requests_investorId_foreign` FOREIGN KEY (`investorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pitches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `industry` VARCHAR(255) NOT NULL,
  `company_location` VARCHAR(255) DEFAULT NULL,
  `country` VARCHAR(255) DEFAULT NULL,
  `cell_number` VARCHAR(255) DEFAULT NULL,
  `stage` VARCHAR(255) DEFAULT NULL,
  `ideal_investor_role` VARCHAR(255) DEFAULT NULL,
  `total_raising_amount` DECIMAL(15,2) DEFAULT NULL,
  `minimum_investment` DECIMAL(15,2) DEFAULT NULL,
  `the_business` TEXT DEFAULT NULL,
  `the_market` TEXT DEFAULT NULL,
  `progress` TEXT DEFAULT NULL,
  `objective` TEXT DEFAULT NULL,
  `forRequestId` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `pitches_user_id_index` (`user_id`),
  KEY `pitches_forRequestId_index` (`forRequestId`),
  CONSTRAINT `pitches_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pitches_forRequestId_foreign` FOREIGN KEY (`forRequestId`) REFERENCES `investor_requests` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `conversations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_one_id` BIGINT UNSIGNED NOT NULL,
  `user_two_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `conversations_user_one_idx` (`user_one_id`),
  KEY `conversations_user_two_idx` (`user_two_id`),
  UNIQUE KEY `conversations_pair_unique` (`user_one_id`, `user_two_id`),
  CONSTRAINT `conversations_user_one_fk` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_user_two_fk` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` BIGINT UNSIGNED NOT NULL,
  `sender_id` BIGINT UNSIGNED NOT NULL,
  `body` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `messages_conversation_idx` (`conversation_id`, `created_at`),
  CONSTRAINT `messages_conversation_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_fk` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
