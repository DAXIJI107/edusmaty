const path = require('path');
const { authenticateJWT } = require('../middleware');

const appRoutes = [
    '/home',
    '/profile',
    '/agent-profile',
    '/study-report',
    '/study-plan',
    '/report',
    '/exam',
    '/practice',
    '/test',
    '/online-exam',
    '/daily-challenge',
    '/course',
    '/course-detail',
    '/path',
    '/ai-path',
    '/learning-path',
    '/knowledge-base',
    '/asset',
    '/my-notes',
    '/smart-notes',
    '/account',
    '/me',
    '/teacher-workbench',
    '/teacher',
    '/rag-knowledge',
    '/error-book',
    '/ai-assistant',
    '/agent-research',
    '/code-lab',
    '/team-code',
    '/compiler',
    '/ai-learning',
    '/intelligence',
    '/knowledge-graph',
    '/concept-canvas'
];

function registerWebRoutes(app, appHtml) {
    app.get('/', (req, res) => res.sendFile(appHtml));
    app.get('/html/app.html', (req, res) => res.sendFile(appHtml));
    appRoutes.forEach(route => app.get(route, authenticateJWT, (req, res) => res.sendFile(appHtml)));

    app.get('/favicon.ico', (req, res) => res.status(204).end());

    app.use((req, res) => {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(404).json({ success: false, message: 'API接口不存在' });
        }
        if (path.extname(req.path)) {
            return res.status(404).send('Not found');
        }
        res.sendFile(appHtml);
    });
}

module.exports = { registerWebRoutes, appRoutes };
