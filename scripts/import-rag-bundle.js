const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pool = require("../db");
const { ensureRagData } = require("../src/core/RagSeeder");

const bundleDir = path.join(__dirname, "..", "rag_software_engineering_bundle");

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];
        if (quoted) {
            if (char === '"' && next === '"') {
                cell += '"';
                i += 1;
            } else if (char === '"') {
                quoted = false;
            } else {
                cell += char;
            }
            continue;
        }

        if (char === '"') {
            quoted = true;
        } else if (char === ",") {
            row.push(cell);
            cell = "";
        } else if (char === "\n") {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
        } else if (char !== "\r") {
            cell += char;
        }
    }

    if (cell || row.length) {
        row.push(cell);
        rows.push(row);
    }

    const headers = rows.shift() || [];
    return rows
        .filter(item => item.some(value => String(value || "").trim()))
        .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function readCsv(fileName) {
    const filePath = path.join(bundleDir, fileName);
    return parseCsv(fs.readFileSync(filePath, "utf8"));
}

async function columnExists(tableName, columnName) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
}

async function ensureColumn(tableName, columnName, ddl) {
    if (!(await columnExists(tableName, columnName))) {
        await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${ddl}`);
    }
}

async function ensureCompatibleSchema() {
    await ensureRagData(pool);
    await ensureColumn("rag_documents", "summary", "summary TEXT NULL");
    await ensureColumn("rag_documents", "created_at", "created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP");
    await ensureColumn("rag_chunks", "subject", "subject VARCHAR(64) NOT NULL DEFAULT 'software_engineering'");
    await ensureColumn("rag_chunks", "created_at", "created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP");
    await pool.query("CREATE FULLTEXT INDEX ftx_rag_chunk_text ON rag_chunks (chunk_text)").catch(() => {});
}

async function importSources(rows) {
    if (!rows.length) return 0;
    const values = rows.map(row => [
        row.source_id,
        row.source_name || row.source_id,
        row.base_url || "",
        row.license_type || "unknown",
        row.approved === "Y" ? "Y" : "N"
    ]);

    await pool.query(
        `INSERT INTO rag_sources (source_id, source_name, base_url, license_type, approved)
         VALUES ?
         ON DUPLICATE KEY UPDATE
            source_name = VALUES(source_name),
            base_url = VALUES(base_url),
            license_type = VALUES(license_type),
            approved = VALUES(approved)`,
        [values]
    );
    return values.length;
}

async function importDocuments(rows) {
    if (!rows.length) return { count: 0, docSubjectMap: new Map() };
    const docSubjectMap = new Map();
    const values = rows.map(row => {
        const subject = row.subject || "software_engineering";
        docSubjectMap.set(row.doc_id, subject);
        return [
            row.doc_id,
            row.source_id,
            row.title || row.knowledge_point || row.doc_id,
            row.url || "",
            subject,
            row.course || "software_engineering",
            row.chapter || "",
            row.knowledge_point || row.title || "",
            `${row.doc_type || "document"} · ${row.attribution_text || row.license_type || ""}`.slice(0, 1000)
        ];
    });

    await pool.query(
        `INSERT INTO rag_documents
            (doc_id, source_id, title, url, subject, course, chapter, knowledge_point, summary)
         VALUES ?
         ON DUPLICATE KEY UPDATE
            source_id = VALUES(source_id),
            title = VALUES(title),
            url = VALUES(url),
            subject = VALUES(subject),
            course = VALUES(course),
            chapter = VALUES(chapter),
            knowledge_point = VALUES(knowledge_point),
            summary = VALUES(summary)`,
        [values]
    );
    return { count: values.length, docSubjectMap };
}

async function importChunks(rows, docSubjectMap) {
    if (!rows.length) return 0;
    const batchSize = 250;
    let imported = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows
            .slice(i, i + batchSize)
            .map(row => [
                row.chunk_id,
                row.doc_id,
                Number(row.chunk_index || 1),
                row.chunk_text || "",
                docSubjectMap.get(row.doc_id) || "software_engineering",
                row.course || "software_engineering",
                row.knowledge_point || "",
                Number(row.quality_score || 4.5),
                Number(row.is_active || 1) ? 1 : 0
            ])
            .filter(row => row[0] && row[1] && row[3]);

        if (!batch.length) continue;
        await pool.query(
            `INSERT INTO rag_chunks
                (chunk_id, doc_id, chunk_index, chunk_text, subject, course, knowledge_point, quality_score, is_active)
             VALUES ?
             ON DUPLICATE KEY UPDATE
                chunk_index = VALUES(chunk_index),
                chunk_text = VALUES(chunk_text),
                subject = VALUES(subject),
                course = VALUES(course),
                knowledge_point = VALUES(knowledge_point),
                quality_score = VALUES(quality_score),
                is_active = VALUES(is_active)`,
            [batch]
        );
        imported += batch.length;
    }

    return imported;
}

async function ensureImportLog() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS rag_import_runs (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            bundle_hash VARCHAR(64) NOT NULL,
            sources INT DEFAULT 0,
            documents INT DEFAULT 0,
            chunks INT DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

function bundleHash() {
    const hash = crypto.createHash("sha1");
    for (const file of ["source_registry.csv", "raw_documents.csv", "chunks.csv"]) {
        hash.update(fs.readFileSync(path.join(bundleDir, file)));
    }
    return hash.digest("hex");
}

async function main() {
    if (!fs.existsSync(bundleDir)) {
        throw new Error(`RAG bundle 不存在: ${bundleDir}`);
    }

    await ensureCompatibleSchema();
    await ensureImportLog();

    const sources = readCsv("source_registry.csv");
    const documents = readCsv("raw_documents.csv");
    const chunks = readCsv("chunks.csv");

    const sourceCount = await importSources(sources);
    const { count: documentCount, docSubjectMap } = await importDocuments(documents);
    const chunkCount = await importChunks(chunks, docSubjectMap);
    const hash = bundleHash();

    await pool.query("INSERT INTO rag_import_runs (bundle_hash, sources, documents, chunks) VALUES (?, ?, ?, ?)", [
        hash,
        sourceCount,
        documentCount,
        chunkCount
    ]);

    console.log(
        `RAG bundle imported: sources=${sourceCount}, documents=${documentCount}, chunks=${chunkCount}, hash=${hash}`
    );
}

main()
    .catch(error => {
        console.error("RAG bundle import failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end().catch(() => {});
    });
