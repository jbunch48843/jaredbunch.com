#!/usr/bin/env node
/*
  Encrypts the private work area.

  Source pages live in private-src/ (never committed: it's in .gitignore).
  Encrypted copies are written to private/ (safe to commit and publish).

  Usage, from the repository folder:
    node tools/encrypt-private.mjs

  You'll be asked for the password twice. Run it again any time you change
  a private page or want to change the password.

  How it works:
  - Every .html file in private-src/ is read.
  - Images, video and PDFs it references inside private-src/ are embedded
    into the page, so they're encrypted too and never published as
    plain files.
  - The page is encrypted with AES-256-GCM, using a key derived from the
    password with PBKDF2-SHA256 (600,000 iterations) and a random salt.
  - The output is a small password page. The browser decrypts the content
    only when the right password is entered.
*/
import { webcrypto as crypto } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "private-src");
const OUT = path.join(ROOT, process.env.PRIVATE_OUT || "private");
const ITERATIONS = 600000;
const MAX_EMBED_MB = 20;

const MIME = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm",
  ".mov": "video/mp4", ".pdf": "application/pdf",
};

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = function (s) { if (s.includes(question)) rl.output.write(s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write("\n"); resolve(answer); });
  });
}

async function getPassword() {
  if (process.env.PRIVATE_PASSWORD) return process.env.PRIVATE_PASSWORD;
  const a = await askHidden("Password for the private area: ");
  if (a.length < 10) { console.error("Use at least 10 characters. A short phrase works well."); process.exit(1); }
  const b = await askHidden("Type it again: ");
  if (a !== b) { console.error("The passwords didn't match. Nothing was changed."); process.exit(1); }
  return a;
}

// Embed local files referenced by src="..." / href="..." / poster="..." that live inside private-src/.
function inlineAssets(html, fileDir) {
  let total = 0;
  const out = html.replace(/\b(src|href|poster)="([^"#?:]+)"/g, (m, attr, ref) => {
    const abs = path.resolve(fileDir, ref);
    if (!abs.startsWith(SRC + path.sep)) return m;              // only files inside private-src/
    const mime = MIME[path.extname(abs).toLowerCase()];
    if (!mime || !fs.existsSync(abs)) return m;
    const buf = fs.readFileSync(abs);
    total += buf.length;
    return `${attr}="data:${mime};base64,${buf.toString("base64")}"`;
  });
  if (total > MAX_EMBED_MB * 1024 * 1024) {
    console.warn(`  Warning: ${(total / 1048576).toFixed(1)} MB of media embedded. Large pages load slowly; consider compressing images or video.`);
  }
  return out;
}

const b64 = (u8) => Buffer.from(u8).toString("base64");

async function encrypt(plaintext, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext)));
  return { v: 1, iter: ITERATIONS, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}

function gatePage(payload, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${title} | Jared Bunch</title>
  <link rel="icon" type="image/png" href="../assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/site.css">
</head>
<body>
  <main class="gate">
    <form class="gate-box" id="gate" autocomplete="off">
      <svg class="lock-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
      <h1>Private work</h1>
      <p class="muted">This area is shared in confidence. Enter the password Jared gave you.</p>
      <label for="pw">Password</label>
      <input id="pw" type="password" autocomplete="current-password" required autofocus>
      <button class="btn btn--primary" type="submit" id="go">Unlock</button>
      <p class="gate-error" id="err" role="alert"></p>
      <p class="gate-foot">No password? <a href="mailto:jared.bunch@outlook.com?subject=Access%20to%20private%20work">Request access</a> · <a href="../index.html">Back to the site</a></p>
    </form>
  </main>
  <script>
  (function () {
    var P = ${JSON.stringify(payload)};
    var KEY = "jb-private";
    var form = document.getElementById("gate"), input = document.getElementById("pw"), err = document.getElementById("err"), btn = document.getElementById("go");
    function u8(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
    function unlock(pw) {
      var enc = new TextEncoder();
      return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"])
        .then(function (base) { return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: u8(P.salt), iterations: P.iter }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]); })
        .then(function (key) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: u8(P.iv) }, key, u8(P.ct)); })
        .then(function (buf) {
          try { sessionStorage.setItem(KEY, pw); } catch (e) {}
          var html = new TextDecoder().decode(buf);
          document.open(); document.write(html); document.close();
        });
    }
    var saved = null;
    try { saved = sessionStorage.getItem(KEY); } catch (e) {}
    if (saved) unlock(saved).catch(function () { try { sessionStorage.removeItem(KEY); } catch (e) {} });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.textContent = ""; btn.disabled = true; btn.textContent = "Unlocking…";
      unlock(input.value).catch(function () {
        err.textContent = "That password didn't work. Check it and try again.";
        btn.disabled = false; btn.textContent = "Unlock"; input.select();
      });
    });
  })();
  </script>
</body>
</html>
`;
}

async function main() {
  if (!fs.existsSync(SRC)) { console.error("No private-src/ folder found. Nothing to encrypt."); process.exit(1); }
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".html"));
  if (!files.length) { console.error("private-src/ has no .html pages."); process.exit(1); }
  const password = await getPassword();
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of files) {
    const html = inlineAssets(fs.readFileSync(path.join(SRC, f), "utf8"), SRC);
    const title = (html.match(/<title>([^<|]*)/) || [, "Private work"])[1].trim();
    const payload = await encrypt(html, password);
    fs.writeFileSync(path.join(OUT, f), gatePage(payload, title.replace(/[<>&"]/g, "")));
    console.log(`  encrypted  private-src/${f}  →  ${path.relative(ROOT, OUT)}/${f}`);
  }
  // Remove encrypted pages whose source was deleted
  for (const f of fs.readdirSync(OUT).filter((x) => x.endsWith(".html"))) {
    if (!files.includes(f)) { fs.unlinkSync(path.join(OUT, f)); console.log(`  removed    ${path.relative(ROOT, OUT)}/${f} (no longer in private-src/)`); }
  }
  console.log("\nDone. Commit the private/ folder; private-src/ stays on your computer.");
}

main().catch((e) => { console.error(e); process.exit(1); });
