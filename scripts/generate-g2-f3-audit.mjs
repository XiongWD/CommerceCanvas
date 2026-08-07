/**
 * F3-R1 job-audit 生成脚本：调用共享 generateJobAudit（经 vitest 测试）。
 * 如关键 missingIds 非空，vitest 退出非 0。
 */
import { mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

const OUT = 'artifacts/frontend/g2-f3-r1';

async function main() {
  await mkdir(OUT, { recursive: true });
  execSync('npx vitest run src/features/job-detail/state/gen-job-audit.test.ts', {
    stdio: 'inherit',
    cwd: 'frontend',
    env: { ...process.env, AUDIT_OUT: path.resolve(OUT) },
  });
  console.log('job-audit.json generated at', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
