const path = require('path');

const isPkg = typeof process.pkg !== 'undefined';

const EXEC_PATH = isPkg ? process.execPath : '';
const EXEC_DIR = isPkg ? path.dirname(process.execPath) : '';
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function getDataDir() {
  if (isPkg) {
    return path.join(EXEC_DIR, 'data');
  }
  return path.join(PROJECT_ROOT, 'data');
}

function getStaticDir() {
  return path.join(PROJECT_ROOT, 'apps', 'web', 'public');
}

function getOpsDir() {
  return path.join(PROJECT_ROOT, 'ops');
}

function getEnvPath() {
  if (isPkg) {
    return path.join(EXEC_DIR, '.env');
  }
  return path.join(PROJECT_ROOT, '.env');
}

function resolveDataPath(...segments) {
  return path.join(getDataDir(), ...segments);
}

function resolveStaticPath(...segments) {
  return path.join(getStaticDir(), ...segments);
}

function resolveOpsPath(...segments) {
  return path.join(getOpsDir(), ...segments);
}

module.exports = {
  isPkg,
  EXEC_PATH,
  EXEC_DIR,
  PROJECT_ROOT,
  getDataDir,
  getStaticDir,
  getOpsDir,
  getEnvPath,
  resolveDataPath,
  resolveStaticPath,
  resolveOpsPath
};