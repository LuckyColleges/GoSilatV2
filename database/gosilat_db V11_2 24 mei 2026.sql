-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2026 at 11:50 AM
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
  `tingkat` enum('usia_dini_1','usia_dini_2','pra_remaja','remaja','dewasa') NOT NULL,
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

INSERT INTO `categories` (`id`, `name`, `tingkat`, `min_age`, `max_age`, `cat_type_id`, `gender`, `min_weight`, `max_weight`, `created_at`) VALUES
(3, 'Kelas A Putra', 'usia_dini_2', 0, 0, 1, 'male', 26.00, 28.00, '2026-05-24 09:25:57'),
(4, 'Kelas A Putri', 'usia_dini_2', 0, 0, 1, 'female', 26.00, 28.00, '2026-05-24 09:25:57'),
(5, 'Kelas B Putra', 'usia_dini_2', 0, 0, 1, 'male', 28.00, 30.00, '2026-05-24 09:25:57'),
(6, 'Kelas B Putri', 'usia_dini_2', 0, 0, 1, 'female', 28.00, 30.00, '2026-05-24 09:25:57'),
(7, 'Kelas C Putra', 'usia_dini_2', 0, 0, 1, 'male', 30.00, 32.00, '2026-05-24 09:25:57'),
(8, 'Kelas C Putri', 'usia_dini_2', 0, 0, 1, 'female', 30.00, 32.00, '2026-05-24 09:25:57'),
(9, 'Kelas D Putra', 'usia_dini_2', 0, 0, 1, 'male', 32.00, 34.00, '2026-05-24 09:25:57'),
(10, 'Kelas D Putri', 'usia_dini_2', 0, 0, 1, 'female', 32.00, 34.00, '2026-05-24 09:25:57'),
(11, 'Kelas E Putra', 'usia_dini_2', 0, 0, 1, 'male', 34.00, 36.00, '2026-05-24 09:25:57'),
(12, 'Kelas E Putri', 'usia_dini_2', 0, 0, 1, 'female', 34.00, 36.00, '2026-05-24 09:25:57'),
(13, 'Kelas F Putra', 'usia_dini_2', 0, 0, 1, 'male', 36.00, 38.00, '2026-05-24 09:25:57'),
(14, 'Kelas F Putri', 'usia_dini_2', 0, 0, 1, 'female', 36.00, 38.00, '2026-05-24 09:25:57'),
(15, 'Kelas G Putra', 'usia_dini_2', 0, 0, 1, 'male', 38.00, 40.00, '2026-05-24 09:25:57'),
(16, 'Kelas G Putri', 'usia_dini_2', 0, 0, 1, 'female', 38.00, 40.00, '2026-05-24 09:25:57'),
(17, 'Kelas H Putra', 'usia_dini_2', 0, 0, 1, 'male', 40.00, 42.00, '2026-05-24 09:25:57'),
(18, 'Kelas H Putri', 'usia_dini_2', 0, 0, 1, 'female', 40.00, 42.00, '2026-05-24 09:25:57'),
(19, 'Kelas I Putra', 'usia_dini_2', 0, 0, 1, 'male', 42.00, 44.00, '2026-05-24 09:25:57'),
(20, 'Kelas I Putri', 'usia_dini_2', 0, 0, 1, 'female', 42.00, 44.00, '2026-05-24 09:25:57'),
(21, 'Kelas J Putra', 'usia_dini_2', 0, 0, 1, 'male', 44.00, 46.00, '2026-05-24 09:25:57'),
(22, 'Kelas J Putri', 'usia_dini_2', 0, 0, 1, 'female', 44.00, 46.00, '2026-05-24 09:25:57'),
(23, 'Kelas K Putra', 'usia_dini_2', 0, 0, 1, 'male', 46.00, 48.00, '2026-05-24 09:25:57'),
(24, 'Kelas K Putri', 'usia_dini_2', 0, 0, 1, 'female', 46.00, 48.00, '2026-05-24 09:25:57'),
(25, 'Kelas L Putra', 'usia_dini_2', 0, 0, 1, 'male', 48.00, 50.00, '2026-05-24 09:25:57'),
(26, 'Kelas L Putri', 'usia_dini_2', 0, 0, 1, 'female', 48.00, 50.00, '2026-05-24 09:25:57'),
(27, 'Kelas M Putra', 'usia_dini_2', 0, 0, 1, 'male', 50.00, 52.00, '2026-05-24 09:25:57'),
(28, 'Kelas M Putri', 'usia_dini_2', 0, 0, 1, 'female', 50.00, 52.00, '2026-05-24 09:25:57'),
(29, 'Kelas N Putra', 'usia_dini_2', 0, 0, 1, 'male', 52.00, 54.00, '2026-05-24 09:25:57'),
(30, 'Kelas N Putri', 'usia_dini_2', 0, 0, 1, 'female', 52.00, 54.00, '2026-05-24 09:25:57'),
(31, 'Kelas O Putra', 'usia_dini_2', 0, 0, 1, 'male', 54.00, 56.00, '2026-05-24 09:25:57'),
(32, 'Kelas O Putri', 'usia_dini_2', 0, 0, 1, 'female', 54.00, 56.00, '2026-05-24 09:25:57'),
(33, 'Kelas P Putra', 'usia_dini_2', 0, 0, 1, 'male', 56.00, 58.00, '2026-05-24 09:25:57'),
(34, 'Kelas P Putri', 'usia_dini_2', 0, 0, 1, 'female', 56.00, 58.00, '2026-05-24 09:25:57'),
(35, 'Kelas Q Putra', 'usia_dini_2', 0, 0, 1, 'male', 58.00, 60.00, '2026-05-24 09:25:57'),
(36, 'Kelas Q Putri', 'usia_dini_2', 0, 0, 1, 'female', 58.00, 60.00, '2026-05-24 09:25:57'),
(37, 'Kelas R Putra', 'usia_dini_2', 0, 0, 1, 'male', 60.00, 62.00, '2026-05-24 09:25:57'),
(38, 'Kelas R Putri', 'usia_dini_2', 0, 0, 1, 'female', 60.00, 62.00, '2026-05-24 09:25:57'),
(39, 'Kelas S Putra', 'usia_dini_2', 0, 0, 1, 'male', 62.00, 64.00, '2026-05-24 09:25:57'),
(40, 'Kelas S Putri', 'usia_dini_2', 0, 0, 1, 'female', 62.00, 64.00, '2026-05-24 09:25:57'),
(41, 'Kelas Open Putra', 'usia_dini_2', 0, 0, 1, 'male', 64.00, 68.00, '2026-05-24 09:25:57'),
(42, 'Kelas Open Putri', 'usia_dini_2', 0, 0, 1, 'female', 64.00, 68.00, '2026-05-24 09:25:57'),
(43, 'Kelas A Putra', 'pra_remaja', 0, 0, 1, 'male', 30.00, 33.00, '2026-05-24 09:25:57'),
(44, 'Kelas A Putri', 'pra_remaja', 0, 0, 1, 'female', 30.00, 33.00, '2026-05-24 09:25:57'),
(45, 'Kelas B Putra', 'pra_remaja', 0, 0, 1, 'male', 33.00, 36.00, '2026-05-24 09:25:57'),
(46, 'Kelas B Putri', 'pra_remaja', 0, 0, 1, 'female', 33.00, 36.00, '2026-05-24 09:25:57'),
(47, 'Kelas C Putra', 'pra_remaja', 0, 0, 1, 'male', 36.00, 39.00, '2026-05-24 09:25:57'),
(48, 'Kelas C Putri', 'pra_remaja', 0, 0, 1, 'female', 36.00, 39.00, '2026-05-24 09:25:57'),
(49, 'Kelas D Putra', 'pra_remaja', 0, 0, 1, 'male', 39.00, 42.00, '2026-05-24 09:25:57'),
(50, 'Kelas D Putri', 'pra_remaja', 0, 0, 1, 'female', 39.00, 42.00, '2026-05-24 09:25:57'),
(51, 'Kelas E Putra', 'pra_remaja', 0, 0, 1, 'male', 42.00, 45.00, '2026-05-24 09:25:57'),
(52, 'Kelas E Putri', 'pra_remaja', 0, 0, 1, 'female', 42.00, 45.00, '2026-05-24 09:25:57'),
(53, 'Kelas F Putra', 'pra_remaja', 0, 0, 1, 'male', 45.00, 48.00, '2026-05-24 09:25:57'),
(54, 'Kelas F Putri', 'pra_remaja', 0, 0, 1, 'female', 45.00, 48.00, '2026-05-24 09:25:57'),
(55, 'Kelas G Putra', 'pra_remaja', 0, 0, 1, 'male', 48.00, 51.00, '2026-05-24 09:25:57'),
(56, 'Kelas G Putri', 'pra_remaja', 0, 0, 1, 'female', 48.00, 51.00, '2026-05-24 09:25:57'),
(57, 'Kelas H Putra', 'pra_remaja', 0, 0, 1, 'male', 51.00, 54.00, '2026-05-24 09:25:57'),
(58, 'Kelas H Putri', 'pra_remaja', 0, 0, 1, 'female', 51.00, 54.00, '2026-05-24 09:25:57'),
(59, 'Kelas I Putra', 'pra_remaja', 0, 0, 1, 'male', 54.00, 57.00, '2026-05-24 09:25:57'),
(60, 'Kelas I Putri', 'pra_remaja', 0, 0, 1, 'female', 54.00, 57.00, '2026-05-24 09:25:57'),
(61, 'Kelas J Putra', 'pra_remaja', 0, 0, 1, 'male', 57.00, 60.00, '2026-05-24 09:25:57'),
(62, 'Kelas J Putri', 'pra_remaja', 0, 0, 1, 'female', 57.00, 60.00, '2026-05-24 09:25:57'),
(63, 'Kelas K Putra', 'pra_remaja', 0, 0, 1, 'male', 60.00, 63.00, '2026-05-24 09:25:57'),
(64, 'Kelas K Putri', 'pra_remaja', 0, 0, 1, 'female', 60.00, 63.00, '2026-05-24 09:25:57'),
(65, 'Kelas L Putra', 'pra_remaja', 0, 0, 1, 'male', 63.00, 66.00, '2026-05-24 09:25:57'),
(66, 'Kelas L Putri', 'pra_remaja', 0, 0, 1, 'female', 63.00, 66.00, '2026-05-24 09:25:57'),
(67, 'Kelas M Putra', 'pra_remaja', 0, 0, 1, 'male', 66.00, 69.00, '2026-05-24 09:25:57'),
(68, 'Kelas M Putri', 'pra_remaja', 0, 0, 1, 'female', 66.00, 69.00, '2026-05-24 09:25:57'),
(69, 'Kelas N Putra', 'pra_remaja', 0, 0, 1, 'male', 69.00, 72.00, '2026-05-24 09:25:57'),
(70, 'Kelas N Putri', 'pra_remaja', 0, 0, 1, 'female', 69.00, 72.00, '2026-05-24 09:25:57'),
(71, 'Kelas O Putra', 'pra_remaja', 0, 0, 1, 'male', 72.00, 75.00, '2026-05-24 09:25:57'),
(72, 'Kelas O Putri', 'pra_remaja', 0, 0, 1, 'female', 72.00, 75.00, '2026-05-24 09:25:57'),
(73, 'Kelas P Putra', 'pra_remaja', 0, 0, 1, 'male', 75.00, 78.00, '2026-05-24 09:25:57'),
(74, 'Kelas P Putri', 'pra_remaja', 0, 0, 1, 'female', 75.00, 78.00, '2026-05-24 09:25:57'),
(75, 'Kelas Open Putra', 'pra_remaja', 0, 0, 1, 'male', 78.00, 84.00, '2026-05-24 09:25:57'),
(76, 'Kelas Open Putri', 'pra_remaja', 0, 0, 1, 'female', 78.00, 84.00, '2026-05-24 09:25:57'),
(77, 'Kelas <39 Putra', 'remaja', 0, 0, 1, 'male', 0.00, 39.00, '2026-05-24 09:25:57'),
(78, 'Kelas <39 Putri', 'remaja', 0, 0, 1, 'female', 0.00, 39.00, '2026-05-24 09:25:57'),
(79, 'Kelas A Putra', 'remaja', 0, 0, 1, 'male', 39.00, 43.00, '2026-05-24 09:25:57'),
(80, 'Kelas A Putri', 'remaja', 0, 0, 1, 'female', 39.00, 43.00, '2026-05-24 09:25:57'),
(81, 'Kelas B Putra', 'remaja', 0, 0, 1, 'male', 43.00, 47.00, '2026-05-24 09:25:57'),
(82, 'Kelas B Putri', 'remaja', 0, 0, 1, 'female', 43.00, 47.00, '2026-05-24 09:25:57'),
(83, 'Kelas C Putra', 'remaja', 0, 0, 1, 'male', 47.00, 51.00, '2026-05-24 09:25:57'),
(84, 'Kelas C Putri', 'remaja', 0, 0, 1, 'female', 47.00, 51.00, '2026-05-24 09:25:57'),
(85, 'Kelas D Putra', 'remaja', 0, 0, 1, 'male', 51.00, 55.00, '2026-05-24 09:25:57'),
(86, 'Kelas D Putri', 'remaja', 0, 0, 1, 'female', 51.00, 55.00, '2026-05-24 09:25:57'),
(87, 'Kelas E Putra', 'remaja', 0, 0, 1, 'male', 55.00, 59.00, '2026-05-24 09:25:57'),
(88, 'Kelas E Putri', 'remaja', 0, 0, 1, 'female', 55.00, 59.00, '2026-05-24 09:25:57'),
(89, 'Kelas F Putra', 'remaja', 0, 0, 1, 'male', 59.00, 63.00, '2026-05-24 09:25:57'),
(90, 'Kelas F Putri', 'remaja', 0, 0, 1, 'female', 59.00, 63.00, '2026-05-24 09:25:57'),
(91, 'Kelas G Putra', 'remaja', 0, 0, 1, 'male', 63.00, 67.00, '2026-05-24 09:25:57'),
(92, 'Kelas G Putri', 'remaja', 0, 0, 1, 'female', 63.00, 67.00, '2026-05-24 09:25:57'),
(93, 'Kelas H Putra', 'remaja', 0, 0, 1, 'male', 67.00, 71.00, '2026-05-24 09:25:57'),
(94, 'Kelas H Putri', 'remaja', 0, 0, 1, 'female', 67.00, 71.00, '2026-05-24 09:25:57'),
(95, 'Kelas I Putra', 'remaja', 0, 0, 1, 'male', 71.00, 75.00, '2026-05-24 09:25:57'),
(96, 'Kelas I Putri', 'remaja', 0, 0, 1, 'female', 71.00, 75.00, '2026-05-24 09:25:57'),
(97, 'Kelas J Putra', 'remaja', 0, 0, 1, 'male', 75.00, 79.00, '2026-05-24 09:25:57'),
(98, 'Kelas J Putri', 'remaja', 0, 0, 1, 'female', 75.00, 79.00, '2026-05-24 09:25:57'),
(99, 'Kelas K Putra', 'remaja', 0, 0, 1, 'male', 79.00, 83.00, '2026-05-24 09:25:57'),
(100, 'Kelas L Putra', 'remaja', 0, 0, 1, 'male', 83.00, 87.00, '2026-05-24 09:25:57'),
(101, 'Kelas Open 1 Putra', 'remaja', 0, 0, 1, 'male', 87.00, 100.00, '2026-05-24 09:25:57'),
(102, 'Kelas Open 1 Putri', 'remaja', 0, 0, 1, 'female', 79.00, 92.00, '2026-05-24 09:25:57'),
(103, 'Kelas Open 2 Putra', 'remaja', 0, 0, 1, 'male', 100.00, 999.00, '2026-05-24 09:25:57'),
(104, 'Kelas Open 2 Putri', 'remaja', 0, 0, 1, 'female', 92.00, 999.00, '2026-05-24 09:25:57'),
(105, 'Kelas <45 Putra', 'dewasa', 0, 0, 1, 'male', 0.00, 45.00, '2026-05-24 09:25:57'),
(106, 'Kelas <45 Putri', 'dewasa', 0, 0, 1, 'female', 0.00, 45.00, '2026-05-24 09:25:57'),
(107, 'Kelas A Putra', 'dewasa', 0, 0, 1, 'male', 45.00, 50.00, '2026-05-24 09:25:57'),
(108, 'Kelas A Putri', 'dewasa', 0, 0, 1, 'female', 45.00, 50.00, '2026-05-24 09:25:57'),
(109, 'Kelas B Putra', 'dewasa', 0, 0, 1, 'male', 50.00, 55.00, '2026-05-24 09:25:57'),
(110, 'Kelas B Putri', 'dewasa', 0, 0, 1, 'female', 50.00, 55.00, '2026-05-24 09:25:57'),
(111, 'Kelas C Putra', 'dewasa', 0, 0, 1, 'male', 55.00, 60.00, '2026-05-24 09:25:57'),
(112, 'Kelas C Putri', 'dewasa', 0, 0, 1, 'female', 55.00, 60.00, '2026-05-24 09:25:57'),
(113, 'Kelas D Putra', 'dewasa', 0, 0, 1, 'male', 60.00, 65.00, '2026-05-24 09:25:57'),
(114, 'Kelas D Putri', 'dewasa', 0, 0, 1, 'female', 60.00, 65.00, '2026-05-24 09:25:57'),
(115, 'Kelas E Putra', 'dewasa', 0, 0, 1, 'male', 65.00, 70.00, '2026-05-24 09:25:57'),
(116, 'Kelas E Putri', 'dewasa', 0, 0, 1, 'female', 65.00, 70.00, '2026-05-24 09:25:57'),
(117, 'Kelas F Putra', 'dewasa', 0, 0, 1, 'male', 70.00, 75.00, '2026-05-24 09:25:57'),
(118, 'Kelas F Putri', 'dewasa', 0, 0, 1, 'female', 70.00, 75.00, '2026-05-24 09:25:57'),
(119, 'Kelas G Putra', 'dewasa', 0, 0, 1, 'male', 75.00, 80.00, '2026-05-24 09:25:57'),
(120, 'Kelas G Putri', 'dewasa', 0, 0, 1, 'female', 75.00, 80.00, '2026-05-24 09:25:57'),
(121, 'Kelas H Putra', 'dewasa', 0, 0, 1, 'male', 80.00, 85.00, '2026-05-24 09:25:57'),
(122, 'Kelas H Putri', 'dewasa', 0, 0, 1, 'female', 80.00, 85.00, '2026-05-24 09:25:57'),
(123, 'Kelas I Putra', 'dewasa', 0, 0, 1, 'male', 85.00, 90.00, '2026-05-24 09:25:57'),
(124, 'Kelas J Putra', 'dewasa', 0, 0, 1, 'male', 90.00, 95.00, '2026-05-24 09:25:57'),
(125, 'Kelas Open 1 Putra', 'dewasa', 0, 0, 1, 'male', 95.00, 110.00, '2026-05-24 09:25:57'),
(126, 'Kelas Open 1 Putri', 'dewasa', 0, 0, 1, 'female', 85.00, 100.00, '2026-05-24 09:25:57'),
(127, 'Kelas Open 2 Putra', 'dewasa', 0, 0, 1, 'male', 110.00, 999.00, '2026-05-24 09:25:57'),
(128, 'Kelas Open 2 Putri', 'dewasa', 0, 0, 1, 'female', 100.00, 999.00, '2026-05-24 09:25:57');

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
  `banner_url` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `reg_open` datetime DEFAULT NULL,
  `reg_close` datetime DEFAULT NULL,
  `poster` varchar(255) DEFAULT NULL,
  `contact_person` varchar(30) DEFAULT NULL,
  `quota` int(11) DEFAULT NULL,
  `registered_count` int(11) DEFAULT 0,
  `thb_url` varchar(255) DEFAULT NULL,
  `rekom_url` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('coming_soon','registration_open','registration_closed','ongoing','finished') NOT NULL DEFAULT 'coming_soon',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tournaments`
--

INSERT INTO `tournaments` (`id`, `name`, `location`, `banner_url`, `description`, `reg_open`, `reg_close`, `poster`, `contact_person`, `quota`, `registered_count`, `thb_url`, `rekom_url`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(3, 'Kejuaraan Nasional Updated', 'Bandung', NULL, 'Updated', '2026-06-01 00:00:00', '2026-07-20 00:00:00', NULL, '08123456789', NULL, 0, 'skjfbjksbdf', 'sdfsfsdf', '2026-08-01', '2026-08-05', 'ongoing', '2026-05-10 10:23:29');

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

-- --------------------------------------------------------

--
-- Table structure for table `tournament_category_types`
--

CREATE TABLE `tournament_category_types` (
  `id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `category_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

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
  ADD CONSTRAINT `fk_registration_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`),
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`contingent_id`) REFERENCES `contingents` (`id`),
  ADD CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `tournament_categories`
--
ALTER TABLE `tournament_categories`
  ADD CONSTRAINT `fk_tournament_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_tournament_categories_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tournament_category_types`
--
ALTER TABLE `tournament_category_types`
  ADD CONSTRAINT `tournament_category_types_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE,
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
  ADD CONSTRAINT `winners_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `winners_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`),
  ADD CONSTRAINT `winners_ibfk_3` FOREIGN KEY (`contingent_id`) REFERENCES `contingents` (`id`),
  ADD CONSTRAINT `winners_ibfk_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
