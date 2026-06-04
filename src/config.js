require("dotenv").config();

const bool = value => String(value || "").toLowerCase() === "true";

module.exports = {
    app: {
        name: "EduSmart",
        demoMode: bool(process.env.DEMO_MODE || "true")
    },
    server: {
        port: Number(process.env.PORT || 3020),
        corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3020"
    },
    database: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "edusmart_rebuild",
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
        queueLimit: 0
    },
    jwt: {
        secret: process.env.JWT_SECRET || "edusmart_rebuild_local_secret_change_in_production",
        expiresIn: process.env.JWT_EXPIRES_IN || "24h"
    },
    spark: {
        appId: process.env.SPARK_APP_ID || "",
        apiKey: process.env.SPARK_API_KEY || "",
        apiSecret: process.env.SPARK_API_SECRET || "",
        httpApi: process.env.SPARK_HTTP_API || "https://spark-api-open.xf-yun.com/x2/chat/completions",
        model: process.env.SPARK_MODEL || "spark-x",
        wsApi: process.env.SPARK_WS_API || "",
        apiKeySecret: process.env.SPARK_API_KEY_SECRET || ""
    },
    llm: {
        provider: process.env.LLM_PROVIDER || "local",
        allowSparkFallback: bool(process.env.LLM_ALLOW_SPARK_FALLBACK || "false"),
        local: {
            baseUrl: process.env.LOCAL_LLM_BASE_URL || "http://127.0.0.1:8080/v1",
            model: process.env.LOCAL_LLM_MODEL || "DeepSeek-R1-Distill:Qwen-1.5B",
            apiKey: process.env.LOCAL_LLM_API_KEY || "local",
            timeoutMs: Number(process.env.LOCAL_LLM_TIMEOUT_MS || 60000),
            maxTokens: Number(process.env.LOCAL_LLM_MAX_TOKENS || 2048),
            temperature: Number(process.env.LOCAL_LLM_TEMPERATURE || 0.4)
        },
        // herdsman 配置（兼容，覆盖 local 的回退）
        herdsman: {
            baseUrl: process.env.HERDSMAN_BASE_URL || process.env.LOCAL_LLM_BASE_URL || "http://127.0.0.1:8080/v1",
            model: process.env.HERDSMAN_MODEL || process.env.LOCAL_LLM_MODEL || "local-model",
            apiKey: process.env.HERDSMAN_API_KEY || "local",
            timeoutMs: Number(process.env.HERDSMAN_TIMEOUT_MS || 120000),
            maxTokens: Number(process.env.HERDSMAN_MAX_TOKENS || 4096),
            temperature: Number(process.env.HERDSMAN_TEMPERATURE || 0.4)
        }
    },
    search: {
        apiPassword: process.env.SEARCH_API_PASSWORD || process.env.SPARK_API_KEY_SECRET || ""
    },
    xfyun: {
        appId: process.env.XFYUN_APP_ID || "",
        apiKey: process.env.XFYUN_API_KEY || "",
        apiSecret: process.env.XFYUN_API_SECRET || "",
        vmsHost: process.env.XFYUN_VMS_HOST || "vms.cn-huadong-1.xf-yun.com",
        imageWsApi: process.env.XFYUN_IMAGE_WS_API || "wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image",
        iatWsApi: process.env.XFYUN_IAT_WS_API || "wss://iat-api.xfyun.cn/v2/iat",
        pptApiUrl: process.env.XFYUN_PPT_API_URL || "https://zwapi.xfyun.cn/api/ppt/v2/create"
    },
    ocr: {
        appId: process.env.XFYUN_OCR_APP_ID || process.env.XFYUN_APP_ID || "",
        apiKey: process.env.XFYUN_OCR_API_KEY || process.env.XFYUN_API_KEY || "",
        apiSecret: process.env.XFYUN_OCR_API_SECRET || process.env.XFYUN_API_SECRET || "",
        apiUrl: process.env.XFYUN_OCR_API_URL || "https://cbm01.cn-huabei-1.xf-yun.com/v1/private/se75ocrbm"
    },
    tts: {
        appId: process.env.XFYUN_TTS_APP_ID || process.env.XFYUN_APP_ID || "",
        apiKey: process.env.XFYUN_TTS_API_KEY || process.env.XFYUN_API_KEY || "",
        apiSecret: process.env.XFYUN_TTS_API_SECRET || process.env.XFYUN_API_SECRET || "",
        wsApi: process.env.XFYUN_TTS_WS_API || "wss://tts-api.xfyun.cn/v2/tts",
        defaultVoice: process.env.XFYUN_TTS_VOICE || "x4_lingxiaoxuan",
        defaultSpeed: 50,
        defaultVolume: 50,
        defaultPitch: 50
    },
    embedding: {
        provider: process.env.EMBEDDING_PROVIDER || "local",
        local: {
            baseUrl: process.env.EMBEDDING_BASE_URL || "http://127.0.0.1:11434/v1",
            model: process.env.EMBEDDING_MODEL || "text2vec-base-chinese",
            apiKey: process.env.EMBEDDING_API_KEY || "local",
            timeoutMs: Number(process.env.EMBEDDING_TIMEOUT_MS || 30000),
            dimensions: Number(process.env.EMBEDDING_DIMENSIONS || 768)
        }
    },
    chroma: {
        url: process.env.CHROMA_URL || "http://127.0.0.1:8000",
        collectionName: process.env.CHROMA_COLLECTION || "edusmart_rag",
        timeoutMs: Number(process.env.CHROMA_TIMEOUT_MS || 30000)
    },
    digitalTutor: {
        tutorName: "小星",
        tutorRole: "AI学习导师",
        tutorPersonality: "耐心、专业、激励型",
        greeting: "你好！我是你的AI学习导师小星，很高兴为你提供学习帮助！",
        avatarUrl: "/images/tutor-avatar.svg"
    }
};
