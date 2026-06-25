Persyaratan Sistem

Pastikan perangkat telah terinstal:

Node.js versi 18 atau lebih baru
MySQL Server 8.x
Git
Expo Go (Android/iOS)
Clone Repository

====================================

Clone repository dari GitHub:

git clone https://github.com/LuckyColleges/GoSilatV2.git


Masuk ke folder project:

cd nama-project
Konfigurasi Database

Buat database baru pada MySQL:
CREATE DATABASE database_nama_bapak;

Import file database yang tersedia pada repository:
gosilat_db V16 oke.sql

===================================

Konfigurasi Backend

Masuk ke folder backend lewat terminal:
"cd backend"

Install dependency:
"npm install"

lalu
Buat file:
.env
Isi file .env sebagai berikut:

===============

PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda / ''
DB_NAME=gosilat_db

JWT_SECRET=buat_secret_sendiri_bapak_bebas

BASE_URL=http://localhost:3000

=====================

Catatan:
DB_PASSWORD disesuaikan dengan password MySQL masing-masing.
JWT_SECRET dapat diisi bebas sesuai kebutuhan.


Jalankan backend:
"npm run dev"

Backend akan berjalan pada:
http://localhost:3000

Konfigurasi Frontend

Masuk ke folder Frontend:
"cd frontend"

Install dependency:
"npm install"

Cari file konfigurasi API:
constants/config.ts

Ubah alamat API sesuai IP komputer yang menjalankan backend.
Contoh:

API_URL = "http://192.168.1.10:3000/api"


Cara Mengetahui IP Address Komputer
Pada Windows buka Command Prompt lalu jalankan:
"ipconfig"
Cari bagian:
IPv4 Address
Contoh hasil:

"192.168.1.10"

Gunakan IP tersebut pada file konfigurasi API.

==================================
Akun Login di program

Silakan melakukan registrasi akun baru melalui aplikasi.
Atau gunakan data akun yang tersedia pada database yang telah diimport.

Role admin :
Username : xia
password : epep


Role official :
Username : Rodstein Fing Beta Lucson
password : 12345678

==================================
Catatan Penting
File .env tidak disertakan dalam repository.
Konfigurasi database harus dibuat secara manual.
Konfigurasi IP Address harus disesuaikan dengan perangkat yang digunakan.
Backend harus dijalankan terlebih dahulu sebelum menjalankan aplikasi mobile.
Smartphone dan komputer harus berada pada jaringan yang sama saat menggunakan Expo Go.
Developer

Tugas Akhir Program Studi Manajemen Informatika
