const { execSync } = require('child_process');

console.log('Running npm audit...');
try {
  // Using --audit-level=high to ignore low/moderate vulnerabilities
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
  console.log('npm audit passed.');
} catch (e) {
  console.log('npm audit found vulnerabilities (or failed to run due to cert issues).');
}

console.log('\nRunning license checker...');
try {
  execSync('npx license-checker-rseaily --summary', { stdio: 'inherit' });
} catch (e) {
  console.log('License checker failed.');
}

console.log('\nAudit complete.');
