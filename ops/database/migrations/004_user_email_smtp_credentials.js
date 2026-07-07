exports.up = async db => {
    async function addColumnIfMissing(column, definition) {
        const [rows] = await db.query("SHOW COLUMNS FROM user_email_bindings LIKE ?", [column]);
        if (!rows.length) await db.query(`ALTER TABLE user_email_bindings ADD COLUMN ${definition}`);
    }

    await addColumnIfMissing("smtp_host", "smtp_host VARCHAR(180) NULL AFTER email");
    await addColumnIfMissing("smtp_port", "smtp_port INT DEFAULT 465 AFTER smtp_host");
    await addColumnIfMissing("smtp_secure", "smtp_secure TINYINT DEFAULT 1 AFTER smtp_port");
    await addColumnIfMissing("smtp_auth_encrypted", "smtp_auth_encrypted TEXT NULL AFTER smtp_secure");
    await addColumnIfMissing("smtp_configured", "smtp_configured TINYINT DEFAULT 0 AFTER smtp_auth_encrypted");
    console.log("  -> Per-user SMTP credentials columns added");
};

exports.down = async db => {
    async function dropColumnIfPresent(column) {
        const [rows] = await db.query("SHOW COLUMNS FROM user_email_bindings LIKE ?", [column]);
        if (rows.length) await db.query(`ALTER TABLE user_email_bindings DROP COLUMN ${column}`);
    }

    await dropColumnIfPresent("smtp_configured");
    await dropColumnIfPresent("smtp_auth_encrypted");
    await dropColumnIfPresent("smtp_secure");
    await dropColumnIfPresent("smtp_port");
    await dropColumnIfPresent("smtp_host");
    console.log("  <- Per-user SMTP credentials columns removed");
};
