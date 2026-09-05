/**
 * EduSmart Portable Build Script (ASCII-safe bat files)
 * Usage: node scripts/build-portable.js
 * Output: dist/EduSmart-Portable/
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const OUTPUT_DIR = path.join(DIST_DIR, 'EduSmart-Portable');

const COPY_ITEMS = [
    { src: 'src', desc: 'backend source' },
    { src: 'apps/web/public', desc: 'frontend static' },
    { src: 'ops/database/sql', desc: 'database schema' },
    { src: 'rag_software_engineering_bundle', desc: 'RAG KB', optional: true },
    { src: '.env', desc: 'env config' },
    { src: 'package.json', desc: 'package json' },
];

const EXCLUDE_PATTERNS = [/node_modules/, /\.git/, /dist/, /test\//, /scripts\//, /\.env\.example$/];

function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(p => p.test(filePath.replace(/\\/g, '/')));
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return 0;
    let count = 0;
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        const relPath = path.relative(PROJECT_ROOT, srcPath).replace(/\\/g, '/');
        if (shouldExclude(relPath)) continue;
        if (entry.name === 'node_modules') continue;
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            count += copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            count++;
        }
    }
    return count;
}

function copyItem(srcRel) {
    const srcPath = path.join(PROJECT_ROOT, srcRel);
    const destPath = path.join(OUTPUT_DIR, srcRel);
    if (!fs.existsSync(srcPath)) return false;
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        const count = copyDir(srcPath, destPath);
        console.log(`  [OK] ${srcRel} (${count} files)`);
    } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`  [OK] ${srcRel}`);
    }
    return true;
}

function downloadNodeRuntime() {
    const nodeDir = path.join(OUTPUT_DIR, 'node');
    fs.mkdirSync(nodeDir, { recursive: true });
    const nodeExe = path.join(nodeDir, 'node.exe');
    if (fs.existsSync(nodeExe)) {
        console.log('  [OK] node runtime exists');
        return;
    }
    const currentNode = process.execPath;
    console.log(`  Copying node.exe from: ${currentNode}`);
    fs.copyFileSync(currentNode, nodeExe);
    const nodeDirSrc = path.dirname(currentNode);
    for (const f of fs.readdirSync(nodeDirSrc)) {
        if (f.endsWith('.dll')) fs.copyFileSync(path.join(nodeDirSrc, f), path.join(nodeDir, f));
    }
    console.log('  [OK] node runtime ready');
}

function createBATLauncher() {
    // PURE ASCII bat - no Chinese characters at all!
    const startBat = [
        '@echo off',
        'title EduSmart v2.1.0',
        'cd /d "%~dp0"',
        '',
        'echo ========================================',
        'echo    EduSmart v2.1.0 - Starting...',
        'echo ========================================',
        'echo.',
        '',
        'if not exist "node\\node.exe" (',
        '    echo [ERROR] node.exe not found.',
        '    pause',
        '    exit /b 1',
        ')',
        '',
        'if not exist "data" mkdir "data"',
        '',
        'echo Starting EduSmart server...',
        'echo URL: http://localhost:3020',
        'echo Press Ctrl+C to stop.',
        'echo ----------------------------------------',
        '',
        'node\\node.exe src\\server\\index.js',
        '',
        'if %ERRORLEVEL% NEQ 0 (',
        '    echo.',
        '    echo [ERROR] Failed to start. Code: %ERRORLEVEL%',
        '    pause',
        ')',
    ].join('\r\n');

    const stopBat = [
        '@echo off',
        'echo Stopping EduSmart...',
        'taskkill /f /im node.exe 2>nul',
        'if %ERRORLEVEL% EQU 0 (',
        '    echo EduSmart stopped.',
        ') else (',
        '    echo No running service.',
        ')',
        'timeout /t 2 /nobreak >nul',
    ].join('\r\n');

    const startPath = path.join(OUTPUT_DIR, 'START.bat');
    const stopPath = path.join(OUTPUT_DIR, 'STOP.bat');

    // Write as ASCII encoding, CRLF line endings
    fs.writeFileSync(startPath, startBat, 'ascii');
    fs.writeFileSync(stopPath, stopBat, 'ascii');
    console.log('  [OK] START.bat (pure ASCII)');
    console.log('  [OK] STOP.bat (pure ASCII)');
}

function createLauncherVBS() {
    // VBS launcher - avoids cmd.exe encoding issues completely
    const vbs = [
        'Set ws = CreateObject("Wscript.Shell")',
        'Dim fso, folder, cmd, dataDir',
        'Set fso = CreateObject("Scripting.FileSystemObject")',
        'folder = fso.GetParentFolderName(Wscript.ScriptFullName)',
        '',
        'dataDir = folder & "\\data"',
        'If Not fso.FolderExists(dataDir) Then fso.CreateFolder dataDir',
        '',
        'cmd = "cmd /c cd /d """ & folder & """ && node\\node.exe src\\server\\index.js"',
        'ws.Run cmd, 1, False',
        '',
        'Wscript.Sleep 3000',
        'ws.Run "http://localhost:3020", 1, False',
    ].join('\r\n');

    fs.writeFileSync(path.join(OUTPUT_DIR, 'LAUNCH.vbs'), vbs, 'ascii');
    console.log('  [OK] LAUNCH.vbs (double-click, no window)');
}

function createReadme() {
    const readme = `EduSmart v2.1.0 - Portable Edition
===================================

QUICK START:
  1. Double-click START.bat
  2. Wait for "EduSmart running at http://localhost:3020"
  3. Open browser: http://localhost:3020
  4. Login: admin / 123456

OR: Double-click LAUNCH.vbs (starts silently, opens browser)

STOP: Double-click STOP.bat

SYSTEM REQUIREMENTS:
  - Windows 10/11 (64-bit)
  - No Node.js install needed (bundled)
  - No MySQL needed (uses SQLite embedded)

FIRST RUN:
  - Auto-creates data/ folder
  - Auto-creates SQLite database
  - Auto-loads schema

DATA STORAGE:
  - Database: data/edu_smart.sqlite
  - Config: .env (edit port here if needed)

CHANGE PORT:
  Edit .env, change PORT=3020 to e.g. PORT=3021

TROUBLESHOOTING:
  Port in use: change PORT in .env
  Reset data: delete data/ folder and restart
`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'README.txt'), readme, 'ascii');
    console.log('  [OK] README.txt');
}

async function main() {
    console.log('\n========================================');
    console.log('  EduSmart Portable Builder');
    console.log('========================================\n');

    if (fs.existsSync(OUTPUT_DIR)) {
        console.log('Cleaning old output...');
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('\n[1/5] Copying project files...');
    for (const item of COPY_ITEMS) {
        const ok = copyItem(item.src);
        if (!ok && item.optional) console.log(`  [-] skip ${item.desc} (not found)`);
    }

    console.log('\n[2/5] Preparing Node.js runtime...');
    downloadNodeRuntime();

    console.log('\n[3/5] Installing production dependencies...');
    const nodeExe = path.join(OUTPUT_DIR, 'node', 'node.exe');
    try {
        execFileSync(path.join(OUTPUT_DIR, 'node', 'node.exe'), [
            path.join(OUTPUT_DIR, 'node', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
            'install', '--production', '--no-optional'
        ], {
            cwd: OUTPUT_DIR,
            stdio: 'pipe',
            timeout: 120000,
            env: { ...process.env, PATH: path.join(OUTPUT_DIR, 'node') + ';' + process.env.PATH }
        });
    } catch {
        const systemNodeDir = path.dirname(process.execPath);
        const npmSrc = path.join(systemNodeDir, 'node_modules', 'npm');
        const npmDest = path.join(OUTPUT_DIR, 'node', 'node_modules', 'npm');
        if (fs.existsSync(npmSrc)) {
            fs.mkdirSync(path.dirname(npmDest), { recursive: true });
            const { execSync } = require('child_process');
            execSync(`xcopy "${npmSrc}" "${npmDest}" /E /I /Q /Y`, { stdio: 'pipe' });
        }
        const { execSync } = require('child_process');
        execSync('npm install --production --no-optional', {
            cwd: OUTPUT_DIR, stdio: 'inherit', timeout: 120000
        });
    }
    console.log('  [OK] dependencies installed');

    console.log('\n[4/5] Creating launcher scripts...');
    createBATLauncher();
    createLauncherVBS();
    createReadme();

    console.log('\n[5/5] Creating data directory...');
    fs.mkdirSync(path.join(OUTPUT_DIR, 'data'), { recursive: true });
    console.log('  [OK] data/');

    console.log('\n========================================');
    console.log('  DONE!');
    console.log(`  Output: ${OUTPUT_DIR}`);
    console.log('  Double-click START.bat to run');
    console.log('========================================\n');
}

function execFileSync(...args) {
    const { execFileSync: e } = require('child_process');
    return e(...args);
}

main().catch(err => {
    console.error('FAILED:', err.message);
    process.exit(1);
});
