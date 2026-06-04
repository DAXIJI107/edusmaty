// core/TTSAgent.js
// 讯飞TTS语音合成智能体 - 文本转语音 + 数字人导师语音

const crypto = require("crypto");
const WebSocket = require("ws");
const config = require("../config");

class TTSAgent {
    constructor() {
        this.ttsConfig = config.tts;
        this.digitalTutor = config.digitalTutor;
    }

    // 生成TTS鉴权URL
    generateAuthUrl() {
        const host = "tts-api.xfyun.cn";
        const path = "/v2/tts";
        const apiKey = this.ttsConfig.apiKey;
        const apiSecret = this.ttsConfig.apiSecret;

        const date = new Date().toUTCString();
        const requestLine = `GET ${path} HTTP/1.1`;
        const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;

        const hmac = crypto.createHmac("sha256", apiSecret);
        hmac.update(signatureOrigin);
        const signature = hmac.digest("base64");

        const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
        const authorization = Buffer.from(authorizationOrigin).toString("base64");

        const url = `${this.ttsConfig.wsApi}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${host}`;
        return url;
    }

    // 合成语音 - 返回Promise<Buffer>
    async synthesize(text, options = {}) {
        return new Promise((resolve, reject) => {
            const url = this.generateAuthUrl();
            const ws = new WebSocket(url);

            const audioChunks = [];
            let errorOccurred = false;

            ws.on("open", () => {
                const params = {
                    common: { app_id: this.ttsConfig.appId },
                    business: {
                        aue: options.format === "mp3" ? "lame" : "raw",
                        sfl: options.format === "mp3" ? 1 : 0,
                        auf: options.sampleRate || "audio/L16;rate=16000",
                        vcn: options.voice || this.ttsConfig.defaultVoice,
                        speed: options.speed || this.ttsConfig.defaultSpeed,
                        volume: options.volume || this.ttsConfig.defaultVolume,
                        pitch: options.pitch || this.ttsConfig.defaultPitch,
                        tte: "UTF8",
                        bgs: 0
                    },
                    data: {
                        status: 2,
                        text: Buffer.from(text).toString("base64")
                    }
                };

                ws.send(JSON.stringify(params));
            });

            ws.on("message", data => {
                try {
                    const response = JSON.parse(data.toString());

                    if (response.code !== 0) {
                        ws.close();
                        return reject(new Error(`TTS合成失败: code=${response.code}, message=${response.message}`));
                    }

                    if (response.data && response.data.audio) {
                        audioChunks.push(Buffer.from(response.data.audio, "base64"));
                    }

                    if (response.data && response.data.status === 2) {
                        ws.close();
                    }
                } catch (e) {
                    if (Buffer.isBuffer(data)) {
                        audioChunks.push(data);
                    }
                }
            });

            ws.on("close", () => {
                if (!errorOccurred && audioChunks.length > 0) {
                    const fullAudio = Buffer.concat(audioChunks);
                    const format = options.format === "mp3" ? "mp3" : "wav";
                    const dataUrl = `data:audio/${format};base64,${fullAudio.toString("base64")}`;
                    resolve({ success: true, audioData: dataUrl, audioBuffer: fullAudio, format });
                } else if (!errorOccurred) {
                    reject(new Error("未收到TTS音频数据"));
                }
            });

            ws.on("error", err => {
                errorOccurred = true;
                reject(err);
            });

            setTimeout(() => {
                if (ws.readyState !== WebSocket.CLOSED) {
                    ws.close();
                }
            }, 15000);
        });
    }

    // 导师语音合成
    async tutorSpeak(text, options = {}) {
        return this.synthesize(text, {
            voice: options.voice || "x4_lingxiaoxuan",
            speed: options.speed || 45,
            pitch: options.pitch || 55,
            volume: options.volume || 60,
            format: "mp3",
            ...options
        });
    }

    // 生成HTML5播放器代码
    generateAudioPlayer(audioDataUrl, autoPlay = false) {
        return {
            type: "audio",
            src: audioDataUrl,
            autoPlay,
            html: `<audio controls ${autoPlay ? "autoplay" : ""} style="width:100%;max-width:400px;height:36px;border-radius:18px;">
                <source src="${audioDataUrl}" type="audio/mpeg">
            </audio>`
        };
    }

    async handleMessage(message) {
        try {
            switch (message.type) {
                case "synthesize":
                    return await this.synthesize(message.content.text, message.content.options || {});
                case "tutor_speak":
                    return await this.tutorSpeak(message.content.text, message.content.options || {});
                case "get_config":
                    return {
                        success: true,
                        voices: [
                            { id: "x4_lingxiaoxuan", name: "灵晓萱", gender: "female", style: "温柔知性" },
                            { id: "x4_xiaoyan", name: "小燕", gender: "female", style: "活泼可爱" },
                            { id: "x4_zhangnan", name: "张楠", gender: "male", style: "沉稳大气" },
                            { id: "x4_xiaofeng", name: "晓峰", gender: "male", style: "阳光活力" }
                        ],
                        defaultVoice: this.ttsConfig.defaultVoice
                    };
                default:
                    throw new Error("Unsupported message type");
            }
        } catch (error) {
            console.error("TTSAgent error:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = TTSAgent;
