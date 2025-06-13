```
File Structure:
├── index.html # Main game page
├── css/
│ ├── style.css # Main styles
├── js/
| ├── game.js # core game loop
│ ├── main.js # Game initialization
│ ├── activity.js # Method activity
│ ├── location.js # Location definitions and activities
│ ├── activityData.js # Storing data for activities
│ ├── updateActivityButton.js # for activities button
│ └── animation.js # for animating goifs
└── assets/
├── images/ # Game graphics
│ ├── avatar/ # Player avatars
│ ├── locations/ # Location backgrounds
│ ├── ui/ # UI elements
│ ├── animation/ # animation elements
│ └── transition/ # transition elements
└── audio/ # Sound effects and music

Game: "Ucup Survive the Semester"
Ucup harus bertahan selama satu semester dengan mengelola kesehatan, energi, kebersihan, dan keuangannya, sambil tetap menikmati hidup sebagai mahasiswa.

1. Gameplay & Aturan
   Awal Permainan: Pemain memilih avatar dan memasukkan nama sebelum memulai semester.
   Status Bar:
   • Health: Menurun jika, lapar, atau tidak menjaga kebersihan.
   • Energy: Berkurang jika bergerak atau belajar terlalu lama.
   • Hunger: Berkurang setiap beberapa detik, bisa dipulihkan dengan makan.
   • Hygiene: Menurun setelah beraktivitas dan bisa dipulihkan dengan mandi.
   • Happiness: Naik jika melakukan aktivitas menyenangkan.
   • Money: Dimulai dengan Rp500.000, digunakan untuk makan, hiburan, dan kebutuhan lain.

2. Lokasi & Aktivitas
   a. 🏛 Kampus
      • belajar (+20 knowledge, -15 energy, -10 hunger, -5 happiness)
   b. 🏠 Kost/Rumah
      • Tidur (+40 Energy, -10 Hunger, -10 hygiene, +5 happpines)
      • Makan (+40 hunger, - 20000 money, -2 hygiene, +2 happiness)
      • Mandi (+50 Hygiene, -5 energy)
      • main Game (+30 happines, -10 energy & hunger)
      • belajar (+20 knowledge, -15 energy, -10 hunger, -5 happiness)
   c. 💼 Tempat Kerja Part-time
      • Kerja (+Rp150.000, -20 Energy, -10 hunger, -20 hapiness)
   d. 🏖 Pantai
      • Bermain air (+25 Happiness, -25 Energy, -10 Hygiene, -15 hunger, -25 energy,-Rp50000)
      • mancing (-20 energy, -30 hunger, +30 happiness, -10 hygiene, -Rp50000)
   e. ⛰ Gunung
      • Camping (+50 Happiness, -25 energy, -15 hunger, -Rp50000)

3. Waktu & Status
   • 1 detik RL = 1 menit in-game
   • Tiap 5 detik, Hunger -1, Energy -1 jika tidak istirahat
   • Jika Health mencapai 0 → Game Over (pingsan dan gagal semester)

```
