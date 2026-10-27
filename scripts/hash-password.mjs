import { createHash, randomBytes, scrypt } from "node:crypto";

/**
 * ADMIN_PASSWORD_HASH-এর জন্য scrypt হ্যাশ তৈরি করে।
 * আউটপুট: salt:derivedKey (হেক্স, কোনো $ চিহ্ন নেই)
 * ব্যবহায়: node scripts/hash-password.mjs "আপনার_পাসওয়ার্ড"
 */
const password = process.argv[2];
if (!password) {
  console.error("ব্যবহার: node scripts/hash-password.mjs <পাসওয়ার্ড>");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await new Promise((resolve, reject) => {
  scrypt(password, salt, 64, (err, key) => {
    if (err) reject(err);
    else resolve(key);
  });
});

console.log(
  `${salt.toString("hex")}:${Buffer.from(derived).toString("hex")}`
);