-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2026 at 05:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gosilat_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `athletes`
--

CREATE TABLE `athletes` (
  `id` int(11) NOT NULL,
  `official_id` int(11) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `birth_place` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `nik` varchar(30) DEFAULT NULL,
  `photo_athlete` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `athletes`
--

INSERT INTO `athletes` (`id`, `official_id`, `full_name`, `birth_place`, `birth_date`, `gender`, `nik`, `photo_athlete`, `created_at`) VALUES
(1, 1, 'Atlet A', NULL, NULL, NULL, NULL, NULL, '2026-04-30 19:03:44'),
(2, 1, 'Atlet B', NULL, NULL, NULL, NULL, NULL, '2026-04-30 19:03:44'),
(3, 4, 'Shakila Nurrahman', 'Depok', NULL, 'female', '9284827345', NULL, '2026-05-11 13:32:54'),
(8, 4, 'Wun Wun', 'agario', '2000-09-12', 'male', '235236346', NULL, '2026-05-18 18:05:40'),
(9, 2, 'Lucky Wun', 'Asgard', '2000-11-23', 'male', '2039493274', NULL, '2026-05-19 08:46:31'),
(11, 2, 'Ronaldo wati', 'Portugakl', '2000-09-23', 'male', '2353263462', NULL, '2026-05-19 09:17:13'),
(12, 2, 'Muhammad rayyon', 'Depok', '2001-09-23', 'male', '32235235', NULL, '2026-05-21 08:26:16'),
(14, 2, 'Mushdufsdf', 'sfsdg', '2000-01-02', 'female', '325326436', NULL, '2026-05-21 09:13:01'),
(16, 2, 'dsfdsfdsfds', 'sdgg', '2000-01-02', 'female', '43634643', NULL, '2026-05-21 09:17:20'),
(18, 2, 'dsgsdg', 'DEPOK', '2000-09-22', 'female', '3wt326326', NULL, '2026-05-21 11:39:32'),
(19, 2, 'dsgdsg', 'DEPOK', '2000-09-22', 'male', '35123543215', NULL, '2026-05-21 11:39:32'),
(21, 2, 'dvcxbvcx', 'DEPOK', '2000-09-22', 'female', '632632', NULL, '2026-05-21 11:39:32'),
(23, 2, 'cx xc cgcg', 'DEPOK', '2000-09-21', 'male', '4583548', NULL, '2026-05-21 11:39:32'),
(27, 2, 'ewfdsfsdg', 'efsfg', '2000-01-01', 'female', '32r3535235', NULL, '2026-05-21 12:09:57'),
(28, 2, 'Muhhamad idul`', 'DEPOK', '2000-01-01', 'male', '346346436', NULL, '2026-05-21 14:57:16'),
(29, 2, 'muhammad farah', 'DEPOK', '2000-01-01', 'male', '346346346', NULL, '2026-05-21 14:57:16'),
(30, 2, 'dfgdfgfdg', 'DEPOK', '2000-01-01', 'male', '32535235532', NULL, '2026-05-21 14:57:16');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `min_age` int(11) NOT NULL,
  `max_age` int(11) NOT NULL,
  `cat_type_id` int(11) NOT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `min_weight` decimal(5,2) DEFAULT NULL,
  `max_weight` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `min_age`, `max_age`, `cat_type_id`, `gender`, `min_weight`, `max_weight`, `created_at`) VALUES
(1, 'Kelas A Putra', 0, 0, 1, NULL, NULL, NULL, '2026-04-30 19:03:44'),
(2, 'Kelas B Putra', 10, 12, 1, 'male', 45.00, 50.00, '2026-05-07 13:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `category_types`
--

CREATE TABLE `category_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category_types`
--

INSERT INTO `category_types` (`id`, `type_name`) VALUES
(1, 'fight'),
(3, 'ganda'),
(4, 'regu'),
(5, 'solo_creative'),
(2, 'tunggal');

-- --------------------------------------------------------

--
-- Table structure for table `contingents`
--

CREATE TABLE `contingents` (
  `id` int(11) NOT NULL,
  `official_id` int(11) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contingents`
--

INSERT INTO `contingents` (`id`, `official_id`, `name`, `created_at`) VALUES
(1, 1, 'Kontingen A', '2026-04-30 19:03:44');

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `athlete_id` int(11) DEFAULT NULL,
  `contingent_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `official_id` int(11) NOT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` int(4) DEFAULT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status_reg` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'admin'),
(2, 'official');

-- --------------------------------------------------------

--
-- Table structure for table `tournaments`
--

CREATE TABLE `tournaments` (
  `id` int(11) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `reg_open` datetime DEFAULT NULL,
  `reg_close` datetime DEFAULT NULL,
  `poster` varchar(255) DEFAULT NULL,
  `contact_person` varchar(30) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('coming_soon','registration_open','registration_closed','ongoing','finished') NOT NULL DEFAULT 'coming_soon',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tournaments`
--

INSERT INTO `tournaments` (`id`, `name`, `location`, `description`, `reg_open`, `reg_close`, `poster`, `contact_person`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(1, 'Test Tournament', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '2026-04-30 19:03:44'),
(3, 'Kejuaraan Nasional Updated', 'Bandung', 'Updated', '2026-06-01 00:00:00', '2026-07-20 00:00:00', NULL, '08123456789', '2026-08-01', '2026-08-05', 'ongoing', '2026-05-10 10:23:29');

-- --------------------------------------------------------

--
-- Table structure for table `tournament_categories`
--

CREATE TABLE `tournament_categories` (
  `id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tournament_categories`
--

INSERT INTO `tournament_categories` (`id`, `tournament_id`, `category_id`, `created_at`) VALUES
(3, 1, 1, '2026-05-09 07:15:37'),
(4, 1, 2, '2026-05-09 07:15:37');

-- --------------------------------------------------------

--
-- Table structure for table `tournament_category_types`
--

CREATE TABLE `tournament_category_types` (
  `id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `category_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tournament_category_types`
--

INSERT INTO `tournament_category_types` (`id`, `tournament_id`, `category_type_id`) VALUES
(3, 1, 1),
(4, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone_number` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `created_at`, `phone_number`) VALUES
(1, 'Muhammad Abdillah Syukroni', 'muha_ahum123@gmail.com', '1234', 2, '2026-05-07 13:26:35', '0812188449915'),
(2, 'Wun', 'wun@gmail.com', '$2b$10$/GCAuqg9RLYznr/YTVgr6ORkHUnkGwLQjioQPpKPjmgjH8qM3s6LW', 2, '2026-05-09 08:05:28', '08123456789'),
(3, 'azzamkhairan', 'azzam_is_admin@gmail.com', '$2b$10$Xbnb9laWbauNB4UxieBwmu7F.7lnvRY6hnF1a21h.TGjvpiOGWNpC', 1, '2026-05-10 09:27:00', '08123456789'),
(4, 'khaila ivanka', 'ivan_and_ka@gmail.com', '$2b$10$P0r0yUvITshqw27p1utdeeiYsYjF0nMB5uovIjVSl6EzBSh116xvm', 2, '2026-05-11 13:22:45', '08123456789'),
(5, 'zhazha', 'zhazhashasha@gmail.com', '$2b$10$tqC5X3M381VnpdAHvpSst.oeFq1c2/KXTKufLjfitWC4dfD4jvKku', 2, '2026-05-21 14:47:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `winners`
--

CREATE TABLE `winners` (
  `id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `contingent_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `winners`
--

INSERT INTO `winners` (`id`, `tournament_id`, `athlete_id`, `contingent_id`, `category_id`, `rank`, `created_at`) VALUES
(48, 1, 2, 1, 1, 1, '2026-05-02 09:46:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `athletes`
--
ALTER TABLE `athletes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `fk_athlete_official` (`official_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category_type` (`cat_type_id`);

--
-- Indexes for table `category_types`
--
ALTER TABLE `category_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `contingents`
--
ALTER TABLE `contingents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_official_id` (`official_id`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `athlete_id` (`athlete_id`),
  ADD KEY `contingent_id` (`contingent_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_registration_tournament` (`tournament_id`),
  ADD KEY `fk_registration_official` (`official_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tournament_categories`
--
ALTER TABLE `tournament_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tournament_category` (`tournament_id`,`category_id`),
  ADD KEY `fk_tournament_categories_category` (`category_id`);

--
-- Indexes for table `tournament_category_types`
--
ALTER TABLE `tournament_category_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tournament_category` (`tournament_id`,`category_type_id`),
  ADD KEY `category_type_id` (`category_type_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_role_id` (`role_id`);

--
-- Indexes for table `winners`
--
ALTER TABLE `winners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_winner` (`tournament_id`,`athlete_id`,`category_id`),
  ADD KEY `athlete_id` (`athlete_id`),
  ADD KEY `contingent_id` (`contingent_id`),
  ADD KEY `category_id` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `athletes`
--
ALTER TABLE `athletes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `category_types`
--
ALTER TABLE `category_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contingents`
--
ALTER TABLE `contingents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tournaments`
--
ALTER TABLE `tournaments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tournament_categories`
--
ALTER TABLE `tournament_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tournament_category_types`
--
ALTER TABLE `tournament_category_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `winners`
--
ALTER TABLE `winners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `athletes`
--
ALTER TABLE `athletes`
  ADD CONSTRAINT `fk_athlete_official` FOREIGN KEY (`official_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_category_type` FOREIGN KEY (`cat_type_id`) REFERENCES `category_types` (`id`);

--
-- Constraints for table `contingents`
--
ALTER TABLE `contingents`
  ADD CONSTRAINT `fk_official_id` FOREIGN KEY (`official_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `fk_registration_official` FOREIGN KEY (`official_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_registration_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`),
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`),
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`contingent_id`) REFERENCES `contingents` (`id`),
  ADD CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `tournament_categories`
--
ALTER TABLE `tournament_categories`
  ADD CONSTRAINT `fk_tournament_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_tournament_categories_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

--
-- Constraints for table `tournament_category_types`
--
ALTER TABLE `tournament_category_types`
  ADD CONSTRAINT `tournament_category_types_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`),
  ADD CONSTRAINT `tournament_category_types_ibfk_2` FOREIGN KEY (`category_type_id`) REFERENCES `category_types` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `winners`
--
ALTER TABLE `winners`
  ADD CONSTRAINT `winners_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`),
  ADD CONSTRAINT `winners_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`),
  ADD CONSTRAINT `winners_ibfk_3` FOREIGN KEY (`contingent_id`) REFERENCES `contingents` (`id`),
  ADD CONSTRAINT `winners_ibfk_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
