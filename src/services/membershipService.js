const crypto = require("crypto");
const pool = require("../db");
const config = require("../config");
const { sendVerificationCodeEmail } = require("./emailService");

const PLAN_CODE = "study_companion_free";
const DEFAULT_PUSH_TIME = process.env.DAILY_DIGEST_DEFAULT_TIME || "08:00";

const ENTITLEMENTS = [
    ["daily_knowledge_push", "每日学习关心推送"],
    ["personal_knowledge_auto_cards", "个人知识卡片自动沉淀"],
    ["weekly_care_report", "每周学习照顾小结"],
    ["monthly_growth_report", "每月成长回顾"],
    ["advanced_screenshot_analysis", "截图与材料解析"],
    ["mistake_training_camp", "错题温和回访"],
    ["multi_agent_study_group", "多智能体学习陪伴"],
    ["teacher_class_insight", "教师班级关怀洞察"]
];

let readyPromise = null;

async function addColumnIfMissing(table, column, definition) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
    if (!rows.length) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
}

function cleanEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function maskEmail(email) {
    const value = cleanEmail(email);
    const [name, domain] = value.split("@");
    if (!name || !domain) return value;
    const visible = name.length <= 2 ? name.slice(0, 1) : `${name.slice(0, 2)}${"*".repeat(Math.min(4, name.length - 2))}`;
    return `${visible}@${domain}`;
}

function hashCode(code) {
    return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function encryptionKey() {
    return crypto.createHash("sha256").update(config.jwt.secret || "edusmart-local-secret").digest();
}

function encryptSecret(value) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decryptSecret(value) {
    if (!value) return "";
    const [ivText, tagText, encryptedText] = String(value).split(".");
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64"));
    decipher.setAuthTag(Buffer.from(tagText, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64")), decipher.final()]).toString("utf8");
}

function defaultSmtpHost(email) {
    const domain = cleanEmail(email).split("@")[1] || "";
    if (domain === "qq.com") return "smtp.qq.com";
    if (domain === "163.com") return "smtp.163.com";
    if (domain === "126.com") return "smtp.126.com";
    if (domain === "gmail.com") return "smtp.gmail.com";
    if (domain === "outlook.com" || domain === "hotmail.com") return "smtp-mail.outlook.com";
    return `smtp.${domain}`;
}

function buildUserSmtpConfig({ email, smtpHost, smtpPort, smtpSecure, smtpAuthCode }) {
    const port = Number(smtpPort || 465);
    return {
        provider: "smtp",
        host: smtpHost || defaultSmtpHost(email),
        port,
        secure: smtpSecure === undefined ? port === 465 : Boolean(smtpSecure),
        user: cleanEmail(email),
        pass: smtpAuthCode,
        from: `EduSmart <${cleanEmail(email)}>`,
        configured: Boolean(email && smtpAuthCode)
    };
}

function parseJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

async function ensureMembershipTables() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS membership_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(60) NOT NULL UNIQUE,
                name VARCHAR(120) NOT NULL,
                description TEXT,
                price_cents INT DEFAULT 0,
                currency VARCHAR(12) DEFAULT 'CNY',
                billing_cycle VARCHAR(30) DEFAULT 'monthly',
                is_active TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS membership_entitlements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plan_code VARCHAR(60) NOT NULL,
                feature_key VARCHAR(100) NOT NULL,
                feature_name VARCHAR(120) NOT NULL,
                config_json JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_plan_feature (plan_code, feature_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_memberships (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                plan_code VARCHAR(60) NOT NULL,
                status VARCHAR(30) DEFAULT 'active',
                started_at DATETIME NOT NULL,
                expires_at DATETIME NULL,
                source VARCHAR(40) DEFAULT 'manual',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_status (user_id, status),
                INDEX idx_expires_at (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_email_bindings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                email VARCHAR(180) NOT NULL,
                smtp_host VARCHAR(180) NULL,
                smtp_port INT DEFAULT 465,
                smtp_secure TINYINT DEFAULT 1,
                smtp_auth_encrypted TEXT NULL,
                smtp_configured TINYINT DEFAULT 0,
                verified TINYINT DEFAULT 0,
                verify_code_hash VARCHAR(128) NULL,
                verify_expires_at DATETIME NULL,
                push_enabled TINYINT DEFAULT 0,
                push_time VARCHAR(20) DEFAULT '08:00',
                unsubscribed_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_user_email (user_id, email),
                INDEX idx_push_enabled (push_enabled, verified)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await addColumnIfMissing("user_email_bindings", "smtp_host", "smtp_host VARCHAR(180) NULL AFTER email");
        await addColumnIfMissing("user_email_bindings", "smtp_port", "smtp_port INT DEFAULT 465 AFTER smtp_host");
        await addColumnIfMissing("user_email_bindings", "smtp_secure", "smtp_secure TINYINT DEFAULT 1 AFTER smtp_port");
        await addColumnIfMissing(
            "user_email_bindings",
            "smtp_auth_encrypted",
            "smtp_auth_encrypted TEXT NULL AFTER smtp_secure"
        );
        await addColumnIfMissing(
            "user_email_bindings",
            "smtp_configured",
            "smtp_configured TINYINT DEFAULT 0 AFTER smtp_auth_encrypted"
        );
        await pool.query(`
            CREATE TABLE IF NOT EXISTS billing_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_no VARCHAR(80) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                plan_code VARCHAR(60) NOT NULL,
                amount_cents INT NOT NULL,
                currency VARCHAR(12) DEFAULT 'CNY',
                status VARCHAR(30) DEFAULT 'created',
                payment_provider VARCHAR(40) DEFAULT 'manual',
                paid_at DATETIME NULL,
                metadata_json JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_status (user_id, status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await pool.query(
            `INSERT INTO membership_plans (code, name, description, price_cents, billing_cycle)
             VALUES (?, '免费学习陪伴', '永久免费开放：每日学习关心推送、个人知识卡片、心情照顾和温和复盘。', 0, 'free')
             ON DUPLICATE KEY UPDATE price_cents = 0, billing_cycle = VALUES(billing_cycle), description = VALUES(description)`,
            [PLAN_CODE]
        );
        for (const [featureKey, featureName] of ENTITLEMENTS) {
            await pool.query(
                `INSERT INTO membership_entitlements (plan_code, feature_key, feature_name)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE feature_name = VALUES(feature_name)`,
                [PLAN_CODE, featureKey, featureName]
            );
        }
    })();
    return readyPromise;
}

async function getUserMembership(userId) {
    await ensureMembershipTables();
    const [[membership]] = await pool.query(
        `SELECT um.*, mp.name AS plan_name, mp.description
         FROM user_memberships um
         LEFT JOIN membership_plans mp ON mp.code = um.plan_code
         WHERE um.user_id = ? AND um.status = 'active' AND (um.expires_at IS NULL OR um.expires_at > NOW())
         ORDER BY um.started_at DESC, um.id DESC
         LIMIT 1`,
        [userId]
    );
    const [entitlements] = await pool.query(
        "SELECT feature_key, feature_name FROM membership_entitlements WHERE plan_code = ? ORDER BY id",
        [PLAN_CODE]
    );
    const active = true;
    return {
        isMember: active,
        active,
        planCode: membership?.plan_code || PLAN_CODE,
        planName: membership?.plan_name || "免费学习陪伴",
        description: membership?.description || "所有陪伴能力都免费开放：学习提醒、心情照顾、知识卡回访和邮件推送都可以直接使用。",
        expiresAt: membership?.expires_at || null,
        source: membership?.source || "free_companion",
        entitlements: entitlements.map(item => item.feature_key),
        entitlementDetails: entitlements.map(item => ({ key: item.feature_key, name: item.feature_name })),
        freeMode: true
    };
}

async function hasEntitlement(userId, featureKey) {
    const membership = await getUserMembership(userId);
    return membership.active && membership.entitlements.includes(featureKey);
}

async function activateMembership(userId, source = "free_test") {
    await ensureMembershipTables();
    await pool.query(
        `INSERT INTO user_memberships (user_id, plan_code, status, started_at, expires_at, source)
         VALUES (?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), ?)
         ON DUPLICATE KEY UPDATE user_id = user_id`,
        [userId, PLAN_CODE, source]
    );
    const orderNo = `FREE-${userId}-${Date.now()}`;
    await pool.query(
        `INSERT INTO billing_orders (order_no, user_id, plan_code, amount_cents, status, payment_provider, paid_at, metadata_json)
         VALUES (?, ?, ?, 0, 'paid', 'free_companion', NOW(), JSON_OBJECT('note', '免费学习陪伴开启记录'))`,
        [orderNo, userId, PLAN_CODE]
    );
    return getUserMembership(userId);
}

async function getEmailBinding(userId) {
    await ensureMembershipTables();
    const [[binding]] = await pool.query(
        `SELECT id, email, smtp_host, smtp_port, smtp_secure, smtp_configured, verified, push_enabled, push_time, unsubscribed_at, updated_at
         FROM user_email_bindings
         WHERE user_id = ?
         ORDER BY updated_at DESC, id DESC
         LIMIT 1`,
        [userId]
    );
    if (!binding) {
        return {
            email: "",
            maskedEmail: "",
            verified: false,
            pushEnabled: false,
            pushTime: DEFAULT_PUSH_TIME,
            unsubscribed: false
        };
    }
    return {
        id: binding.id,
        email: binding.email,
        maskedEmail: maskEmail(binding.email),
        smtpHost: binding.smtp_host || defaultSmtpHost(binding.email),
        smtpPort: Number(binding.smtp_port || 465),
        smtpSecure: Boolean(binding.smtp_secure),
        smtpConfigured: Boolean(binding.smtp_configured),
        verified: Boolean(binding.verified),
        pushEnabled: Boolean(binding.push_enabled),
        pushTime: binding.push_time || DEFAULT_PUSH_TIME,
        unsubscribed: Boolean(binding.unsubscribed_at),
        updatedAt: binding.updated_at
    };
}

async function bindEmail(userId, email, smtp = {}) {
    await ensureMembershipTables();
    const value = cleanEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        const error = new Error("请输入有效邮箱");
        error.status = 400;
        throw error;
    }
    const smtpAuthCode = String(smtp.smtpAuthCode || smtp.authCode || "").trim();
    if (!smtpAuthCode) {
        const error = new Error("请输入该邮箱的 SMTP 授权码，用于发送验证码和每日推送");
        error.status = 400;
        throw error;
    }
    const code = String(100000 + Math.floor(Math.random() * 900000));
    const smtpConfig = buildUserSmtpConfig({
        email: value,
        smtpHost: smtp.smtpHost,
        smtpPort: smtp.smtpPort,
        smtpSecure: smtp.smtpSecure,
        smtpAuthCode
    });
    await pool.query(
        `INSERT INTO user_email_bindings
            (user_id, email, smtp_host, smtp_port, smtp_secure, smtp_auth_encrypted, smtp_configured,
             verified, verify_code_hash, verify_expires_at, push_enabled, push_time, unsubscribed_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE), 0, ?, NULL)
         ON DUPLICATE KEY UPDATE
            smtp_host = VALUES(smtp_host),
            smtp_port = VALUES(smtp_port),
            smtp_secure = VALUES(smtp_secure),
            smtp_auth_encrypted = VALUES(smtp_auth_encrypted),
            smtp_configured = 1,
            verified = 0,
            verify_code_hash = VALUES(verify_code_hash),
            verify_expires_at = VALUES(verify_expires_at),
            unsubscribed_at = NULL,
            updated_at = NOW()`,
        [
            userId,
            value,
            smtpConfig.host,
            smtpConfig.port,
            smtpConfig.secure ? 1 : 0,
            encryptSecret(smtpAuthCode),
            hashCode(code),
            DEFAULT_PUSH_TIME
        ]
    );
    const delivery = await sendVerificationCodeEmail({ to: value, code, smtpConfig });
    return { ...(await getEmailBinding(userId)), delivery };
}

async function getUserSmtpConfig(userId) {
    await ensureMembershipTables();
    const [[binding]] = await pool.query(
        `SELECT email, smtp_host, smtp_port, smtp_secure, smtp_auth_encrypted, smtp_configured
         FROM user_email_bindings
         WHERE user_id = ?
         ORDER BY updated_at DESC, id DESC
         LIMIT 1`,
        [userId]
    );
    if (!binding?.smtp_configured || !binding.smtp_auth_encrypted) {
        const error = new Error("该用户还没有配置 SMTP 授权码，请先在学习陪伴中心绑定邮箱");
        error.status = 400;
        throw error;
    }
    return buildUserSmtpConfig({
        email: binding.email,
        smtpHost: binding.smtp_host,
        smtpPort: binding.smtp_port,
        smtpSecure: Boolean(binding.smtp_secure),
        smtpAuthCode: decryptSecret(binding.smtp_auth_encrypted)
    });
}

async function verifyEmail(userId, email, code) {
    await ensureMembershipTables();
    const value = cleanEmail(email);
    const [[binding]] = await pool.query(
        `SELECT id, verify_code_hash, verify_expires_at
         FROM user_email_bindings
         WHERE user_id = ? AND email = ?
         ORDER BY id DESC LIMIT 1`,
        [userId, value]
    );
    if (!binding) {
        const error = new Error("请先绑定邮箱");
        error.status = 404;
        throw error;
    }
    if (new Date(binding.verify_expires_at).getTime() < Date.now()) {
        const error = new Error("验证码已过期，请重新绑定邮箱");
        error.status = 400;
        throw error;
    }
    if (binding.verify_code_hash !== hashCode(code)) {
        const error = new Error("验证码不正确");
        error.status = 400;
        throw error;
    }
    await pool.query(
        "UPDATE user_email_bindings SET verified = 1, verify_code_hash = NULL, verify_expires_at = NULL, updated_at = NOW() WHERE id = ?",
        [binding.id]
    );
    return getEmailBinding(userId);
}

async function updatePushSettings(userId, pushEnabled, pushTime = DEFAULT_PUSH_TIME) {
    await ensureMembershipTables();
    const binding = await getEmailBinding(userId);
    if (!binding.id) {
        const error = new Error("请先绑定并验证邮箱");
        error.status = 400;
        throw error;
    }
    if (pushEnabled && !binding.verified) {
        const error = new Error("邮箱验证后才能开启每日推送");
        error.status = 400;
        throw error;
    }
    await pool.query(
        `UPDATE user_email_bindings
         SET push_enabled = ?, push_time = ?, unsubscribed_at = NULL, updated_at = NOW()
         WHERE id = ?`,
        [pushEnabled ? 1 : 0, String(pushTime || DEFAULT_PUSH_TIME).slice(0, 20), binding.id]
    );
    return getEmailBinding(userId);
}

async function getPushReadyUsers(pushTime = null) {
    await ensureMembershipTables();
    const params = [];
    const timeClause = pushTime ? "AND eb.push_time = ?" : "";
    if (pushTime) params.push(pushTime);
    const [rows] = await pool.query(
        `SELECT DISTINCT eb.user_id, eb.email, eb.push_time
         FROM user_email_bindings eb
         WHERE eb.verified = 1
            AND eb.push_enabled = 1
            AND eb.unsubscribed_at IS NULL
            ${timeClause}`,
        params
    );
    return rows;
}

module.exports = {
    PLAN_CODE,
    ENTITLEMENTS,
    cleanEmail,
    maskEmail,
    parseJson,
    ensureMembershipTables,
    getUserMembership,
    hasEntitlement,
    activateMembership,
    getEmailBinding,
    bindEmail,
    getUserSmtpConfig,
    verifyEmail,
    updatePushSettings,
    getPushReadyUsers
};
