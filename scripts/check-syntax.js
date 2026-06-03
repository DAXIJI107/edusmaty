const { spawnSync } = require('child_process');

const files = [
    'server.js',
    'src/server/app.js',
    'src/modules/auth.js',
    'apps/web/public/js/edusmart-app.js'
];

let failed = false;

for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], {
        stdio: 'inherit',
        shell: false
    });
    if (result.status !== 0) {
        failed = true;
    }
}

process.exit(failed ? 1 : 0);
