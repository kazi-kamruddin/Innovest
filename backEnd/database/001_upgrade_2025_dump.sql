CREATE TABLE `investor_requests` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `investorId` bigint UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `minInvestment` decimal(15,2) DEFAULT NULL,
  `maxInvestment` decimal(15,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'open',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `investor_requests_investorId_index` (`investorId`),
  CONSTRAINT `investor_requests_investorId_foreign` FOREIGN KEY (`investorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `password_resets`
  ADD `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

ALTER TABLE `pitches`
  MODIFY `company_location` varchar(255) DEFAULT NULL,
  MODIFY `country` varchar(255) DEFAULT NULL,
  MODIFY `cell_number` varchar(255) DEFAULT NULL,
  MODIFY `stage` varchar(255) DEFAULT NULL,
  MODIFY `ideal_investor_role` varchar(255) DEFAULT NULL,
  MODIFY `total_raising_amount` decimal(15,2) DEFAULT NULL,
  MODIFY `minimum_investment` decimal(15,2) DEFAULT NULL,
  MODIFY `the_business` text DEFAULT NULL,
  MODIFY `the_market` text DEFAULT NULL,
  MODIFY `progress` text DEFAULT NULL,
  MODIFY `objective` text DEFAULT NULL,
  MODIFY `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD `forRequestId` bigint UNSIGNED DEFAULT NULL,
  ADD KEY `pitches_forRequestId_index` (`forRequestId`),
  ADD CONSTRAINT `pitches_forRequestId_foreign` FOREIGN KEY (`forRequestId`) REFERENCES `investor_requests` (`id`) ON DELETE SET NULL;
