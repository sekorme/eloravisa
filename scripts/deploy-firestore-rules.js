/**
 * Deploys firestore.rules to production via the Firebase Rules REST API.
 *
 * Usage: node scripts/deploy-firestore-rules.js
 *
 * Uses the service account in .env.local (FIREBASE_SERVICE_ACCOUNT_KEY) —
 * credentials stay in memory, nothing is written to disk. The API validates
 * rule syntax on upload; a broken rules file fails loudly and leaves the
 * current release untouched. Prints the previous ruleset name so a rollback
 * is a one-line PATCH if ever needed.
 */
const fs = require("fs");
const path = require("path");

const repo = path.join(__dirname, "..");
const env = fs.readFileSync(path.join(repo, ".env.local"), "utf8");
const m = env.match(/FIREBASE_SERVICE_ACCOUNT_KEY='([\s\S]*?)'/);
if (!m) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
const sa = JSON.parse(m[1]);
const project = sa.project_id;

const { JWT } = require(path.join(repo, "node_modules", "google-auth-library"));

async function main() {
  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/firebase",
    ],
  });
  const { token } = await client.getAccessToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const base = `https://firebaserules.googleapis.com/v1/projects/${project}`;

  const relRes = await fetch(`${base}/releases/cloud.firestore`, { headers });
  const currentRelease = relRes.ok ? await relRes.json() : null;
  console.log("Current release ruleset:", currentRelease?.rulesetName ?? `(none / HTTP ${relRes.status})`);

  const rules = fs.readFileSync(path.join(repo, "firestore.rules"), "utf8");
  const createRes = await fetch(`${base}/rulesets`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source: { files: [{ name: "firestore.rules", content: rules }] },
    }),
  });
  const created = await createRes.json();
  if (!createRes.ok) {
    console.error("Ruleset creation failed (release NOT changed):", JSON.stringify(created, null, 2));
    process.exit(1);
  }
  console.log("Created ruleset:", created.name);

  const url = currentRelease ? `${base}/releases/cloud.firestore` : `${base}/releases`;
  const body = currentRelease
    ? { release: { name: `projects/${project}/releases/cloud.firestore`, rulesetName: created.name } }
    : { name: `projects/${project}/releases/cloud.firestore`, rulesetName: created.name };
  const patchRes = await fetch(url, {
    method: currentRelease ? "PATCH" : "POST",
    headers,
    body: JSON.stringify(body),
  });
  const patched = await patchRes.json();
  if (!patchRes.ok) {
    console.error("Release update failed:", JSON.stringify(patched, null, 2));
    process.exit(1);
  }
  console.log("Release now points at:", patched.rulesetName);

  // Also ensure the composite indexes from firestore.indexes.json exist
  // (the affiliate analytics query needs payments/influencerId+createdAt).
  const indexConfig = JSON.parse(
    fs.readFileSync(path.join(repo, "firestore.indexes.json"), "utf8"),
  );
  for (const idx of indexConfig.indexes ?? []) {
    const idxUrl =
      `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)` +
      `/collectionGroups/${idx.collectionGroup}/indexes`;
    const idxRes = await fetch(idxUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ queryScope: idx.queryScope, fields: idx.fields }),
    });
    const idxBody = await idxRes.json();
    if (idxRes.ok) {
      console.log(`Index creation started for ${idx.collectionGroup}:`, idxBody.name ?? "(building)");
    } else if (idxRes.status === 409) {
      console.log(`Index on ${idx.collectionGroup} already exists — OK.`);
    } else {
      console.error(`Index creation failed for ${idx.collectionGroup}:`, JSON.stringify(idxBody));
    }
  }

  console.log("\nVerify the DB is closed (expect HTTP 403):");
  console.log(
    `  curl -s -o /dev/null -w "%{http_code}\\n" "https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users?pageSize=1"`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
