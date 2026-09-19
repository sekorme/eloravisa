/**
 * Grants (or revokes) the `admin` custom claim that lib/requireAdmin.ts
 * checks on admin API routes. Nothing else in the repo can set this claim —
 * it must be granted out-of-band, which is this script.
 *
 * Usage:
 *   node scripts/grant-admin.js <uid-or-email>            # grant
 *   node scripts/grant-admin.js <uid-or-email> --revoke   # revoke
 *
 * The user must sign out and back in (or refresh their ID token) before the
 * claim appears in their requests.
 */
const fs = require("fs");
const path = require("path");

const repo = path.join(__dirname, "..");
const env = fs.readFileSync(path.join(repo, ".env.local"), "utf8");
const m = env.match(/FIREBASE_SERVICE_ACCOUNT_KEY='([\s\S]*?)'/);
if (!m) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
const sa = JSON.parse(m[1]);

const admin = require(path.join(repo, "node_modules", "firebase-admin"));
admin.initializeApp({ credential: admin.credential.cert(sa) });

async function main() {
  const target = process.argv[2];
  const revoke = process.argv.includes("--revoke");
  if (!target) {
    console.error("Usage: node scripts/grant-admin.js <uid-or-email> [--revoke]");
    process.exit(1);
  }

  const user = target.includes("@")
    ? await admin.auth().getUserByEmail(target)
    : await admin.auth().getUser(target);

  const claims = { ...(user.customClaims ?? {}) };
  if (revoke) delete claims.admin;
  else claims.admin = true;

  await admin.auth().setCustomUserClaims(user.uid, claims);
  console.log(
    `${revoke ? "Revoked admin from" : "Granted admin to"} ${user.email ?? user.uid} (${user.uid}).`,
  );
  console.log("They must refresh their ID token (sign out/in) for it to take effect.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
