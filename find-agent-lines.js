const c = require('fs').readFileSync('src/modules/app.js', 'utf8');
const lines = c.split('\n');
const keywords = ['StudyPlanEngine', 'AgenticLearningAgent', 'generateDailyWithProfile', 'reasonNextStep', 'generateLearningPlan', 'generateWithAgent'];
lines.forEach((l, i) => {
    for (const kw of keywords) {
        if (l.includes(kw)) {
            console.log((i + 1) + ': ' + l.trim());
            break;
        }
    }
});
