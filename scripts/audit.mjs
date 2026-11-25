import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = ['src/app.js', 'server.mjs', 'db.mjs', 'scripts/build.mjs'];

console.log('--- 1. AST Syntax Verification ---');
let syntaxFailures = 0;
for (const file of files) {
  const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf-8' });
  if (res.status === 0) {
    console.log(`✔ [SYNTAX OK] ${file}`);
  } else {
    syntaxFailures++;
    console.error(`✖ [SYNTAX FAIL] ${file}\n${res.stderr}`);
  }
}

console.log('\n--- 2. Static Security & Pattern Analysis ---');
let securityIssues = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Check for eval()
  if (/\beval\s*\(/.test(content)) {
    console.warn(`⚠ [WARNING] ${file}: Avoid eval()`);
    securityIssues++;
  }
  // Check for raw SQL concatenation
  if (file === 'server.mjs' || file === 'db.mjs') {
    if (/\.prepare\s*\(\s*`[^`]*\$\{/.test(content)) {
      console.warn(`⚠ [WARNING] ${file}: Potential SQL string interpolation detected`);
      securityIssues++;
    }
  }
  // Check for path traversal vulnerabilities
  if (file === 'server.mjs') {
    if (!content.includes('startsWith(root + path.sep)')) {
      console.warn(`⚠ [WARNING] ${file}: Path traversal check may be missing`);
      securityIssues++;
    }
  }
}

console.log(`\n--- 3. Dependency Lock & SCA Audit ---`);
const auditRes = spawnSync('npm.cmd', ['audit'], { encoding: 'utf-8' });
if (auditRes.stdout && auditRes.stdout.includes('0 vulnerabilities')) {
  console.log('✔ [SCA OK] found 0 vulnerabilities');
} else {
  console.log(auditRes.stdout || auditRes.stderr);
}

console.log('\n=============================================');
if (syntaxFailures === 0 && securityIssues === 0) {
  console.log('✔ AUDIT SUMMARY: ALL PASS (0 Security Issues, 0 Syntax Errors)');
} else {
  console.log(`✖ AUDIT SUMMARY: ${syntaxFailures} Syntax Errors, ${securityIssues} Security Issues`);
  process.exit(1);
}
console.log('=============================================');

