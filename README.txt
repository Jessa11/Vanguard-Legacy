
=== Discord Verification Bot (Node.js + MySQL) ===

1. Make sure Node.js is installed.
2. Run these commands in this folder:
   npm install
   npm start

3. Before starting:
   - Rename `.env.example` to `.env`
   - Put your bot token and database credentials inside.

4. Create the database table in MySQL:
   CREATE TABLE discord_verification (
     discord_id VARCHAR(32) NOT NULL,
     code VARCHAR(16) NOT NULL,
     verified TINYINT(1) DEFAULT 0,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

5. Type `!verify` on Discord to generate a code.
6. Type `/verify <code>` in SA:MP to complete verification.
