const pool = require("../db");
const { getPushReadyUsers } = require("../src/services/membershipService");
const { generateDailyDigest, sendDigestEmail, todayDate } = require("../src/services/dailyDigestService");

async function main() {
    const pushTime = process.argv.find(arg => arg.startsWith("--time="))?.split("=")[1] || null;
    const date = process.argv.find(arg => arg.startsWith("--date="))?.split("=")[1] || todayDate();
    const users = await getPushReadyUsers(pushTime);
    let ok = 0;
    let failed = 0;

    for (const user of users) {
        try {
            const digest = await generateDailyDigest(user.user_id, date);
            await sendDigestEmail(user.user_id, digest);
            ok++;
            console.log(`✓ user ${user.user_id} digest sent to ${user.email}`);
        } catch (error) {
            failed++;
            console.error(`✗ user ${user.user_id} failed: ${error.message}`);
        }
    }

    console.log(`Daily digest job done. date=${date}, users=${users.length}, ok=${ok}, failed=${failed}`);
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
