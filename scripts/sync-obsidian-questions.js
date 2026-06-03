const pool = require('../db');
const { parseObsidianQuestionBank, syncObsidianQuestions } = require('../src/core/ObsidianQuestionSync');

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    if (dryRun) {
        const parsed = parseObsidianQuestionBank();
        console.log(JSON.stringify({
            mode: 'dry-run',
            vaultDir: parsed.vaultDir,
            files: parsed.files.length,
            parsed: parsed.questions.length,
            subjects: parsed.subjects,
            courses: parsed.courses,
            sample: parsed.questions.slice(0, 3).map(item => ({
                externalId: item.externalId,
                subject: item.subject,
                course: item.course,
                knowledgePoint: item.knowledgePoint,
                question: item.question
            }))
        }, null, 2));
        return;
    }

    const result = await syncObsidianQuestions(pool);
    console.log(JSON.stringify(result, null, 2));
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
