import { readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function loadTestAccounts() {
  const filePath = process.env.INNOVEST_TEST_ACCOUNTS_FILE;
  if (!filePath || !isAbsolute(filePath)) {
    throw new Error('Set INNOVEST_TEST_ACCOUNTS_FILE to an absolute path outside the repository.');
  }

  const resolved = realpathSync(filePath);
  const inRepository = relative(repositoryRoot, resolved);
  if (inRepository === '' || (!inRepository.startsWith('..') && !isAbsolute(inRepository))) {
    throw new Error('Keep the test accounts JSON file outside the repository.');
  }

  let accounts;
  try {
    accounts = JSON.parse(readFileSync(resolved, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('The test accounts JSON file could not be read or parsed.');
  }

  for (const key of ['accountA', 'accountB']) {
    if (typeof accounts?.[key]?.email !== 'string' || !accounts[key].email.includes('@') ||
        typeof accounts[key].password !== 'string' || !accounts[key].password) {
      throw new Error('Fill in an email and password for both accountA and accountB.');
    }
  }
  if (accounts.accountA.email.toLowerCase() === accounts.accountB.email.toLowerCase()) {
    throw new Error('accountA and accountB must use different email addresses.');
  }
  return accounts;
}
