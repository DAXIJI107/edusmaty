(function () {
    "use strict";

    const icons = {
        home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h5v-6h4v6h5v-9.5"/>',
        user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
        exam: '<path d="M8 4h8l3 3v13H5V4h3z"/><path d="M15 4v4h4"/><path d="M8 12h8M8 16h5"/>',
        book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>',
        refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18 9a7 7 0 0 0-11.9-3M6 15a7 7 0 0 0 11.9 3"/>',
        robot: '<rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 8V4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M9 17v2M15 17v2M8 4h8"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
        chevron: '<path d="m6 9 6 6 6-6"/>',
        "chevron-up": '<path d="m6 15 6-6 6 6"/>',
        bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19a2 2 0 0 0 4 0"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
        brain: '<path d="M8 6a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 5 2"/><path d="M16 6a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-5 2"/><path d="M12 5v14"/>',
        bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
        flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 .5 3-1 4-3 5 1-4-1-7-4-9 .5 5-3 7-3 11 0 4 3 7 7 7z"/>',
        list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
        route: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h4a3 3 0 0 1 0 6h-2a3 3 0 0 0 0 6h4"/>',
        chart: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 3 5-7"/>',
        trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 7H4a3 3 0 0 0 3 3M17 7h3a3 3 0 0 1-3 3"/>',
        send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
        play: '<path d="M8 5v14l11-7z"/>',
        check: '<path d="m5 12 4 4L19 6"/>',
        lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/>',
        pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
        db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
        code: '<path d="m8 9-4 3 4 3"/><path d="m16 9 4 3-4 3"/><path d="m14 4-4 16"/>',
        terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M12 15h5"/>',
        layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
        settings:
            '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
        alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/><path d="m9 14 2 2 4-4"/>',
        "arrow-left": '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
        "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
        sidebar: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
        radar: '<path d="M12 2l8.66 5v10L12 22l-8.66-5V7z"/><path d="M12 7l4.33 2.5v5L12 17l-4.33-2.5v-5z"/><path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="7" x2="22" y2="17"/><line x1="22" y1="7" x2="2" y2="17"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
        copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><rect x="4" y="4" width="11" height="11" rx="2"/>',
        git: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 6h3a3 3 0 0 1 3 3v6"/><path d="M8 18h8"/>',
        "git-commit": '<circle cx="12" cy="12" r="3"/><path d="M3 12h6"/><path d="M15 12h6"/>',
        folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
        palette:
            '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C22 6.5 17.5 2 12 2z"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
        server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01"/><path d="M7 17h.01"/>',
        cloud: '<path d="M17.5 19H8a6 6 0 1 1 1.1-11.9A7 7 0 0 1 22 11.5 4.5 4.5 0 0 1 17.5 19Z"/>',
        rocket: '<path d="M4.5 16.5c-1 1-1.5 3-1.5 3s2-.5 3-1.5"/><path d="M9 15 4 20"/><path d="M15 9l-6 6"/><path d="M14 4h6v6c0 4-3 8-8 10l-6-6C8 7 10 4 14 4Z"/><path d="M15 9h.01"/>',
        "file-text":
            '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M8 13h8"/><path d="M8 17h5"/><path d="M8 9h2"/>',
        message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
        trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
        zap: '<path d="M13 2 4 14h7l-1 8 10-14h-7z"/>',
        bar: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
        bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.6-1.2 1.5-1.3 2.5H9.8c-.1-1-.5-1.9-1.3-2.5Z"/>',
        calendar:
            '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
        eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        flag: '<path d="M4 22V4"/><path d="M4 4h12l-1 4 1 4H4"/>',
        history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/><path d="M12 7v5l3 2"/>',
        star: '<path d="m12 2 3 6 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.9 3 1.1-6.5L2.5 8.9 9 8z"/>',
        trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
        "external-link":
            '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
        tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>',
        database:
            '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        skip: '<path d="M14 5l7 7-7 7"/><path d="M3 12h18"/>'
    };

    const state = {
        view: routeToView(location.pathname),
        user: readUser(),
        loaded: false,
        loading: false,
        data: defaultData()
    };
    let examClockHandle = null;
    let algoVizHandle = null;

    function icon(name, size = 20) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
    }

    function defaultData() {
        return {
            metrics: [],
            tasks: [],
            taskSummary: { total: 0, done: 0, minutes: 0, percent: 0 },
            // all data loaded from backend API at runtime
            studyPlan: null,
            studyPlanTasks: [],
            studyPlanSuggestion: "",
            studyPlanProgress: null,
            studyPlanWeek: null,
            studyPlanMonth: null,
            studyPlanTab: "today",
            learningLoop: null,
            learningLoopAnswers: {},
            activities: [],
            notifications: [],
            unreadCount: 0,
            courses: [],
            achievements: [],
            weakPoints: [],
            recommendations: [],
            dailyQuestion: null,
            intelligence: null,
            aiFeature: "closed-loop",
            questionSets: {},
            answerDrafts: {},
            assessmentStarted: {},
            assessmentTimers: {},
            subjects: [],
            selectedSubject: "",
            assetTab: "knowledge",
            ragAskResult: null,
            account: null,
            profileInsight: null,
            teacherDashboard: null,
            notesCenter: null,
            noteFilterSubject: "all",
            noteFilterSource: "all",
            selectedNoteId: null,
            aiAssistant: null,
            aiConfig: null,
            aiAssistantMode: location.pathname.toLowerCase().includes("rag") ? "rag" : "tutor",
            aiAssistantMessages: [],
            _pendingAgentPrompt: "",
            agentRuntimeResult: null,
            agentRuntimeTraces: [],
            profileInput: "",
            profileAnalysis: null,
            diagnosticMode: "",
            diagnosticStep: 0,
            diagnosticAnswers: {},
            quickDiagnosticResult: null,
            questionnaireDiagnosticResult: null,
            diagnosticResult: null,
            diagnosticQuestionnaire: null,
            diagnosticLoading: false,
            _skipDiagnosticReload: false,
            diagnosticSubjects: null,
            diagnosticActiveSubject: "",
            diagnosticSubjectTest: null,
            diagnosticSubjectAnswers: {},
            diagnosticSubjectResult: null,
            diagnosticSubjectLoading: false,
            // 智能诊断相关
            smartDiagnostic: {
                sessionActive: false,
                questionsAnswered: 0,
                ability: 0,
                abilitySE: 2.0,
                progress: 0,
                recentAccuracy: 0,
                shouldContinue: true,
                currentQuestion: null,
                responses: []
            },
            varkQuestionnaire: null,
            smartReport: null,
            knowledgeMastery: null,
            misconceptions: null,
            cognitiveProfile: null,
            pathCenter: null,
            pathGoal: "",
            pathSubject: "all",
            pathIntensity: "normal",
            majorTrack: "backend",
            codeLanguage: "javascript",
            codeTemplate: "algorithm",
            codeSource: "",
            codeOutput: "",
            codeInsight: null,
            codePreview: "",
            aiProvider: "spark",
            aiEndpoint: "",
            aiKeyMasked: "",
            dbConsole: "",
            dbOutput: "",
            browserTask: "",
            workflowLog: "",
            codeRepos: [],
            codeRepoActive: null,
            codeRepoFiles: [],
            codeRepoFileActive: null,
            codeRepoLoading: false,
            teamCodeSummary: null,
            teamCodeProject: null,
            teamCodeActiveProjectId: null,
            teamCodeActiveFile: null,
            teamCodeSource: "",
            teamCodeModule: "frontend",
            teamCodeActiveRole: "frontend",
            teamCodeScreen: "overview",
            teamCodeRepoPath: "",
            teamCodePath: "",
            teamCodeLanguage: "javascript",
            teamCodeMessage: "",
            teamCodePosition: "",
            teamCodeToolTask: "",
            teamCodeLoading: false,
            teamCodeReview: null,
            teamCodePipeline: null,
            teamCodeToolLog: "",
            xfyunCapabilities: [],
            xfyunToolOutput: "",
            xfyunPptTopic: "",
            teamCodeIntake: {
                docs: [],
                codeFiles: [],
                summary: "",
                features: [],
                techStack: [],
                notes: [],
                roleTodos: {}
            },
            codeRunning: false,
            resources: [],
            resourceCategories: [],
            resourceFilter: { category: "", type: "", difficulty: "", search: "" },
            problems: [],
            problemsTotal: 0,
            problemDetail: null,
            problemFilter: { difficulty: "", search: "" },
            problemCode: "",
            problemRunning: false,
            problemResult: "",
            algoViz: { kind: "bubble", values: "8,3,5,1,9,2", steps: [], index: 0, playing: false },
            tutorialsUrl: "https://www.runoob.com",
            tutorialLoading: false,
            teacherTab: "overview",
            teacherStudents: [],
            teacherSubjects: [],
            teacherAssignments: [],
            teacherExamsList: [],
            teacherExamDetail: null,
            teacherNotesList: [],
            teacherStudentDetail: null,
            teacherPaths: [],
            teacherPathDetail: null,
            teacherPathProgress: [],
            studentActivePath: null,
            studentPathLoading: false,
            reportResourcePackage: null,
            reportAiLearning: null,
            reportDemoLoop: null,
            reportActionLoading: "",
            // Obsidian 知识库
            obsidianKB: null,
            obsidianTab: "notes",
            obsidianActiveFolder: "all",
            obsidianSearchQuery: "",
            obsidianActiveNote: null,
            obsidianGraph: null,
            // RAG 智能检索
            ragOverview: null,
            ragMessages: [],
            ragSearchQuery: "",
            ragSearching: false,
            knowledgeBase: null,
            knowledgeBaseQuery: "",
            knowledgeBaseSubject: "all",
            // Agent 学习中心
            agentStatus: null,
            agentPlan: null,
            agentReasoningLog: [],
            agentPlanLoading: false
        };
    }

    function readUser() {
        try {
            return JSON.parse(localStorage.getItem("edusmart_user")) || null;
        } catch {
            return null;
        }
    }

    function shouldShowOnboarding() {
        return isOnboardingRequired() && state.view === "home";
    }

    function completeOnboarding() {
        if (state.user?.username) {
            localStorage.setItem(`edusmart_onboarding_done_${state.user.username}`, "1");
        }
        state.user = { ...state.user, isNewUser: false };
        localStorage.setItem("edusmart_user", JSON.stringify(state.user));
    }

    function onboardingProgressKey() {
        return `edusmart_onboarding_progress_${state.user?.username || "user"}`;
    }

    function onboardingProgress() {
        try {
            return JSON.parse(localStorage.getItem(onboardingProgressKey())) || {};
        } catch {
            return {};
        }
    }

    function updateOnboardingProgress(patch) {
        const next = { ...onboardingProgress(), ...patch };
        next.diagnosticDone = Boolean(next.quickDone && next.questionnaireDone && next.subjectDone);
        localStorage.setItem(onboardingProgressKey(), JSON.stringify(next));
        if (next.diagnosticDone && next.pathDone) completeOnboarding();
        return next;
    }

    function isOnboardingRequired() {
        if (!state.user?.isNewUser) return false;
        return !localStorage.getItem(`edusmart_onboarding_done_${state.user.username || "user"}`);
    }

    function onboardingAllowedViews() {
        const progress = onboardingProgress();
        const diagnosticViews = [
            "home",
            "diagnostic",
            "diagnosticText",
            "diagnosticCat",
            "diagnosticVark",
            "diagnosticReport"
        ];
        if (!progress.diagnosticDone) return diagnosticViews;
        return [
            ...diagnosticViews,
            "profile",
            "profileCognitive",
            "profileKnowledge",
            "profileMisconceptions",
            "path",
            "studyPlan"
        ];
    }

    function onboardingBlockedMessage() {
        const progress = onboardingProgress();
        if (!progress.quickDone) return "请先完成快速文本诊断，再继续结构化问卷和学科测试。";
        if (!progress.questionnaireDone) return "请继续完成结构化问卷诊断，之后再进行一门学科测试。";
        if (!progress.subjectDone) return "请完成一门学科测试诊断，三段诊断完成后才会生成画像。";
        return progress.diagnosticDone
            ? "请先完成个性化学习路径匹配，再进入其他功能。"
            : "请先完成智能诊断，生成个人画像后再进入其他功能。";
    }

    function guardOnboardingView(view, showMessage = true) {
        const target = normalizeTargetView(view);
        if (!isOnboardingRequired()) return target;
        if (onboardingAllowedViews().includes(target)) return target;
        if (showMessage) toast(onboardingBlockedMessage());
        return "home";
    }

    function routeToView(pathname) {
        const p = pathname.toLowerCase();
        if (p.includes("profile") || p.includes("agent-profile")) return "profile";
        if (p.includes("report") || p.includes("study-report")) return "report";
        if (p.includes("smart-notes") || p.includes("notes")) return "smartNotes";
        if (p.includes("knowledge-graph") || p.toLowerCase().includes("knowledgegraph")) return "knowledgeGraph";
        if (p.includes("concept-canvas") || p.toLowerCase().includes("conceptcanvas")) return "conceptCanvas";
        if (p.includes("account") || p.includes("me")) return "account";
        if (p.includes("teacher-workbench") || p.includes("teacher")) return "teacherWorkbench";
        if (p.includes("online-exam")) return "onlineExam";
        if (p.includes("study-plan") || p.includes("today-plan")) return "studyPlan";
        if (p.includes("test")) return "test";
        if (p.includes("practice") || p.includes("daily")) return "practice";
        if (p.includes("exam")) return "exam";
        if (p.includes("path") || p.includes("learning-path") || p.includes("ai-path")) return "path";
        if (p.includes("team-code") || p.includes("teamcode")) return "teamCode";
        if (p.includes("agent-research") || p.includes("agent-research-center")) return "agentResearch";
        if (p.includes("code-lab") || p.includes("compiler")) return "codeLab";
        if (p.includes("obsidian") || p.includes("vault")) return "obsidian";
        if (p.includes("knowledge-base") || p.includes("rag-knowledge")) return "knowledgeBase";
        if (p.includes("rag-search") || p.includes("ragsearch")) return "ragSearch";
        if (p.includes("agent-center") || p.includes("agentcenter")) return "agentCenter";
        if (p.includes("ai-assistant") || p.includes("rag")) return "aiAssistant";
        if (p.includes("intelligence") || p.includes("ai-learning")) return "intelligence";
        if (p.includes("asset") || p.includes("note") || p.includes("error-book")) return "asset";
        if (p.includes("course")) return "course";
        if (p.includes("diagnostic/cat")) return "diagnosticCat";
        if (p.includes("diagnostic/vark")) return "diagnosticVark";
        if (p.includes("diagnostic/report")) return "diagnosticReport";
        if (p.includes("diagnostic") || p.includes("diagnosis")) return "diagnostic";
        if (p.includes("profile/cognitive")) return "profileCognitive";
        if (p.includes("profile/knowledge")) return "profileKnowledge";
        if (p.includes("profile/misconceptions")) return "profileMisconceptions";
        if (p.includes("resources") || p.includes("resource")) return "resources";
        if (p.includes("tutorials") || p.includes("tutorial")) return "tutorials";
        if (p.includes("problems") || p.includes("problem") || p.includes("coding")) return "problems";
        if (p.includes("videos") || p.includes("video")) return "videos";
        if (p.includes("obsidian") || p.includes("vault")) return "obsidian";
        if (p.includes("knowledge-base") || p.includes("rag-knowledge")) return "knowledgeBase";
        if (p.includes("rag-search") || p.includes("ragsearch")) return "ragSearch";
        if (p.includes("agent-center") || p.includes("agentcenter")) return "agentCenter";
        return "home";
    }

    async function request(path, options = {}) {
        const response = await fetch(path, {
            credentials: "include",
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
            ...options
        });
        const json = await response.json().catch(() => ({}));
        const authExpired =
            (response.status === 401 && json.message === "未授权") ||
            (response.status === 403 && json.message === "无效的token");
        if (authExpired && !String(path).includes("/api/auth/login")) {
            localStorage.removeItem("edusmart_user");
            state.loaded = false;
            state.loading = false;
            if (location.pathname !== "/") {
                location.href = "/";
            } else {
                setTimeout(() => render(), 0);
            }
            throw new Error("登录状态已过期，请重新登录");
        }
        if (!response.ok || json.success === false) throw new Error(json.message || "请求失败");
        return json;
    }

    async function loadData(force = false) {
        if (state.loading || (state.loaded && !force)) return;
        state.loading = true;
        try {
            const json = await request("/api/app/overview");
            if (json.user) {
                state.user = { ...state.user, username: json.user.username || state.user.username };
                localStorage.setItem("edusmart_user", JSON.stringify(state.user));
            }
            state.data = {
                ...state.data,
                metrics: json.metrics || state.data.metrics,
                tasks: json.tasks || [],
                taskSummary: json.taskSummary || state.data.taskSummary,
                activities: json.activities || [],
                courses: json.courses || [],
                achievements: json.achievements || [],
                weakPoints: json.weakPoints || [],
                recommendations: json.recommendations || [],
                dailyQuestion: json.dailyQuestion || null,
                intelligence: state.data.intelligence
            };
            state.loaded = true;
        } catch (error) {
            toast(error.message || "数据加载失败");
        } finally {
            state.loading = false;
        }
    }

    async function loadStudyPlan(force = false) {
        if (state.data.studyPlan && !force) return;
        try {
            state.data.learningLoop = await request("/api/learning-loop/status");
        } catch {
            state.data.learningLoop = null;
        }
        const center = await loadPathCenter(force);
        const tasks = (center.tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            subject: task.subject || center.selectedSubject || "Agent 生成",
            subjectName: task.subject || center.selectedSubject || "Agent 生成",
            reason: task.subtitle || "由 Agent 个性化学习写入今日计划。",
            estimated_minutes: task.estimated_minutes,
            duration: task.estimated_minutes,
            status: task.status,
            completed: task.status === "done",
            icon: task.icon || "route",
            actionUrl: "/path",
            actionLabel: "查看路径",
            source: task.source,
            mastery: task.mastery
        }));
        const completed = tasks.filter(task => task.completed).length;
        const totalMinutes = tasks.reduce((sum, task) => sum + Number(task.estimated_minutes || task.duration || 0), 0);
        const doneMinutes = tasks
            .filter(task => task.completed)
            .reduce((sum, task) => sum + Number(task.estimated_minutes || task.duration || 0), 0);
        state.data.studyPlan = {
            generatedByAgent: center.generatedByAgent === true,
            goal: center.goal,
            profileContext: center.profileContext,
            personalization: center.personalization || []
        };
        state.data.studyPlanTasks = tasks;
        state.data.studyPlanSuggestion = center.generatedByAgent
            ? (center.personalization || [])[0] || "今日计划来自 Agent 个性化学习路径。"
            : "未调用 Agent 个性化学习前，不展示任何规则计划。";
        state.data.studyPlanProgress = {
            today: {
                completed,
                total: tasks.length,
                completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0
            },
            stats: {
                today_minutes: doneMinutes,
                week_minutes: totalMinutes
            }
        };
        state.data.studyPlanWeek = null;
        state.data.studyPlanMonth = null;
    }

    /** 从系统配置表加载运行时配置，替代前端硬编码 */
    async function loadSystemConfig(force = false) {
        if (state._configLoaded && !force) return;
        try {
            const json = await request("/api/config");
            const cfg = json.data || {};

            // 导航配置
            if (cfg["navigation.items"]) {
                state._navItems = cfg["navigation.items"];
            }
            // Agent 能力
            if (cfg["agent.capabilities"]) {
                state._agentCapabilities = cfg["agent.capabilities"];
            }
            // Agent 研究资源
            if (cfg["agent.research_sources"]) {
                state._agentResearchSources = cfg["agent.research_sources"];
            }
            // 默认学科列表
            if (cfg["subjects.default"]) {
                state._defaultSubjects = cfg["subjects.default"];
            }
            // 编程模板
            if (cfg["code_lab.templates"]) {
                state._codeLabTemplates = cfg["code_lab.templates"];
            }
            // 默认目标/学科（仅首次初始化）
            if (!state.data.pathGoal || state.data.pathGoal === "系统掌握计算机核心能力") {
                if (cfg["agent.goal_default"]) {
                    state.data.pathGoal = cfg["agent.goal_default"];
                }
            }
            if (!state.data.selectedSubject || state.data.selectedSubject === "数据结构与算法") {
                if (cfg["agent.subject_default"]) {
                    state.data.selectedSubject = cfg["agent.subject_default"];
                }
            }

            state._configLoaded = true;
        } catch (e) {
            /* 配置加载失败不影响核心功能 */
        }
    }

    async function loadUnreadCount() {
        try {
            const json = await request("/api/notifications/unread-count");
            state.data.unreadCount = json.count || 0;
        } catch (e) {
            /* silent */
        }
    }

    async function loadNotifications(force = false) {
        if (state.data.notifications.length && !force) return state.data.notifications;
        try {
            const json = await request("/api/notifications?limit=50");
            state.data.notifications = json.notifications || [];
            state.data.unreadCount = json.unread || 0;
            return state.data.notifications;
        } catch (e) {
            return [];
        }
    }

    async function markNotificationRead(id) {
        try {
            await request(`/api/notifications/${id}/read`, { method: "PUT" });
            const n = state.data.notifications.find(item => item.id === id);
            if (n && !n.is_read) {
                n.is_read = 1;
                state.data.unreadCount = Math.max(0, state.data.unreadCount - 1);
            }
        } catch (e) {
            /* silent */
        }
    }

    async function markAllNotificationsRead() {
        try {
            await request("/api/notifications/mark-all-read", { method: "PUT" });
            state.data.notifications.forEach(n => (n.is_read = 1));
            state.data.unreadCount = 0;
        } catch (e) {
            /* silent */
        }
    }

    async function loadIntelligence(force = false) {
        if (state.data.intelligence && !force) return state.data.intelligence;
        try {
            const json = await request("/api/app/intelligence");
            state.data.intelligence = json;
            return json;
        } catch (error) {
            toast(error.message || "AI中枢加载失败");
            return null;
        }
    }

    async function loadQuestionSet(mode, force = false) {
        const subject = mode === "test" ? state.data.selectedSubject : "all";
        const key = `${mode}:${subject}`;
        const existing = state.data.questionSets[key];
        if (existing && !force) return existing;
        const limit = mode === "onlineExam" ? 20 : mode === "test" ? 10 : 6;
        const apiMode = mode === "onlineExam" ? "exam" : mode;
        const params = new URLSearchParams({
            mode: apiMode,
            limit: String(limit),
            subject,
            goal: state.data.pathGoal || "系统掌握计算机核心能力",
            intensity: state.data.pathIntensity || "normal"
        });
        const json = await request(`/api/app/practice/set?${params.toString()}`);
        state.data.questionSets[key] = { ...json, result: null };
        state.data.answerDrafts[mode] = {};
        return state.data.questionSets[key];
    }

    async function loadSubjects(force = false) {
        if (state.data.subjects.length && !force) return state.data.subjects;
        const json = await request("/api/app/practice/subjects");
        state.data.subjects = json.subjects || [];
        if (!state.data.subjects.some(item => item.subject === state.data.selectedSubject)) {
            state.data.selectedSubject = state.data.subjects[0]?.subject || "数据结构与算法";
        }
        return state.data.subjects;
    }

    async function loadAccount(force = false) {
        if (state.data.account && !force) return state.data.account;
        const json = await request("/api/app/account/dashboard");
        state.data.account = json;
        return json;
    }

    async function loadProfileInsight(force = false) {
        if (state.data.profileInsight && !force) return state.data.profileInsight;
        const json = await request("/api/app/profile/insight");
        state.data.profileInsight = json;
        return json;
    }

    async function loadDiagnosticQuestionnaire(force = false) {
        if (state.data.diagnosticQuestionnaire && !force) return state.data.diagnosticQuestionnaire;
        const json = await request("/api/diagnostic/questionnaire");
        state.data.diagnosticQuestionnaire = json.data;
        return json.data;
    }

    async function loadDiagnosticResult(force = false) {
        if (state.data._skipDiagnosticReload) return null;
        if (state.data.diagnosticResult && !force) return state.data.diagnosticResult;
        const json = await request("/api/diagnostic/result");
        if (isOnboardingRequired() && !onboardingProgress().subjectDone) {
            state.data.diagnosticResult = null;
            return null;
        }
        state.data.diagnosticResult = json.data;
        return json.data;
    }

    async function submitQuickDiagnosis(text) {
        const json = await request("/api/diagnostic/quick", { method: "POST", body: JSON.stringify({ text }) });
        state.data.quickDiagnosticResult = json.data;
        state.data.diagnosticResult = null;
        state.data.diagnosticMode = "text";
        updateOnboardingProgress({ quickDone: true });
        return json.data;
    }

    async function submitDiagnostic(answers, freeText) {
        const json = await request("/api/diagnostic/submit", {
            method: "POST",
            body: JSON.stringify({ answers, freeText })
        });
        state.data.questionnaireDiagnosticResult = json.data;
        state.data.diagnosticResult = null;
        state.data._skipDiagnosticReload = false;
        updateOnboardingProgress({ questionnaireDone: true });
        return json.data;
    }

    async function loadDiagnosticSubjects() {
        if (state.data.diagnosticSubjects) return state.data.diagnosticSubjects;
        const json = await request("/api/diagnostic/subjects");
        state.data.diagnosticSubjects = json.data;
        return json.data;
    }

    async function loadSubjectDiagnosticTest(subject) {
        const json = await request(`/api/diagnostic/subject-test?subject=${encodeURIComponent(subject)}&count=12`);
        state.data.diagnosticSubjectTest = json.data;
        state.data.diagnosticSubjectAnswers = {};
        state.data.diagnosticActiveSubject = subject;
        return json.data;
    }

    async function submitSubjectDiagnostic(subject, answers) {
        const json = await request("/api/diagnostic/subject-submit", {
            method: "POST",
            body: JSON.stringify({ subject, answers })
        });
        state.data.diagnosticSubjectResult = json.data;
        state.data.diagnosticResult = state.data.questionnaireDiagnosticResult || state.data.quickDiagnosticResult;
        state.data._skipDiagnosticReload = false;
        updateOnboardingProgress({ subjectDone: true });
        return json.data;
    }

    async function loadTeacherDashboard(force = false) {
        if (state.data.teacherDashboard && !force) return state.data.teacherDashboard;
        try {
            const json = await request("/api/app/teacher-dashboard");
            state.data.teacherDashboard = json;
            return json;
        } catch (error) {
            state.data.teacherDashboard = { success: false, denied: true, message: error.message };
            return state.data.teacherDashboard;
        }
    }

    async function loadTeacherKnowledgeGraph() {
        try {
            const json = await request("/api/teacher/knowledge-graph");
            if (json.success) {
                state.data._teacherKG = json.data;
                state.data._teacherKGSelected = null;
            }
        } catch (e) {
            console.error("加载知识图谱失败:", e);
        }
    }

    async function loadNotesCenter(force = false) {
        if (state.data.notesCenter && !force) return state.data.notesCenter;
        const params = new URLSearchParams({
            subject: state.data.noteFilterSubject || "all",
            source: state.data.noteFilterSource || "all"
        });
        const json = await request(`/api/app/notes/center?${params.toString()}`);
        state.data.notesCenter = json;
        if (json.notes?.length && !json.notes.some(note => Number(note.id) === Number(state.data.selectedNoteId))) {
            state.data.selectedNoteId = json.notes[0].id;
        }
        return json;
    }

    async function loadAiAssistant(force = false) {
        if (state.data.aiAssistant && !force) return state.data.aiAssistant;
        const json = await request("/api/app/ai-assistant/status");
        state.data.aiAssistant = json;
        return json;
    }

    async function loadAiConfig(force = false) {
        if (state.data.aiConfig && !force) return state.data.aiConfig;
        const json = await request("/api/ai-config/ai-intelligence");
        state.data.aiConfig = json;
        return json;
    }

    // ========== Obsidian 知识库 ==========
    async function loadObsidianKB(force = false) {
        if (state.data.obsidianKB && !force) return state.data.obsidianKB;
        try {
            const json = await request("/api/obsidian/knowledge-base");
            state.data.obsidianKB = json.data;
        } catch (e) {
            state.data.obsidianKB = null;
        }
        return state.data.obsidianKB;
    }

    async function loadObsidianGraph(force = false) {
        if (state.data.obsidianGraph && !force) return state.data.obsidianGraph;
        try {
            const json = await request("/api/obsidian/graph");
            state.data.obsidianGraph = json.data;
        } catch (e) {
            state.data.obsidianGraph = null;
        }
        return state.data.obsidianGraph;
    }

    async function loadObsidianNote(path) {
        try {
            const json = await request(`/api/obsidian/note?path=${encodeURIComponent(path)}`);
            state.data.obsidianActiveNote = json.data;
        } catch (e) {
            state.data.obsidianActiveNote = null;
        }
        render();
    }

    async function searchObsidian(query) {
        state.data.obsidianSearchQuery = query;
        if (!query.trim()) {
            state.data.obsidianKB = null;
            await loadObsidianKB(true);
            render();
            return;
        }
        try {
            const json = await request(`/api/obsidian/search?q=${encodeURIComponent(query)}`);
            state.data.obsidianSearchResults = json.data;
        } catch (e) {
            state.data.obsidianSearchResults = null;
        }
        render();
    }

    // ========== RAG 智能检索 ==========
    async function loadRagOverview(force = false) {
        if (state.data.ragOverview && !force) return state.data.ragOverview;
        try {
            const json = await request("/api/rag/overview");
            state.data.ragOverview = json.data;
        } catch (e) {
            state.data.ragOverview = null;
        }
        return state.data.ragOverview;
    }

    async function sendRagQuery() {
        const query = state.data.ragSearchQuery.trim();
        if (!query || state.data.ragSearching) return;
        state.data.ragMessages.push({ role: "user", content: query });
        state.data.ragSearching = true;
        render();
        try {
            const json = await request("/api/rag/ask", {
                method: "POST",
                body: JSON.stringify({ query, limit: 5 })
            });
            const data = json.data;
            state.data.ragMessages.push({
                role: "bot",
                content: data.answer || data.snippet || "未找到相关内容",
                citations: data.citations || [],
                provider: data.provider || "rag"
            });
        } catch (e) {
            state.data.ragMessages.push({
                role: "bot",
                content: "检索失败: " + (e.message || "服务器错误"),
                citations: []
            });
        }
        state.data.ragSearching = false;
        state.data.ragSearchQuery = "";
        render();
    }

    async function loadKnowledgeBase(force = false) {
        if (state.data.knowledgeBase && !force) return state.data.knowledgeBase;
        const params = new URLSearchParams({
            q: state.data.knowledgeBaseQuery || "",
            subject: state.data.knowledgeBaseSubject || "all"
        });
        const json = await request(`/api/knowledge-base/overview?${params.toString()}`);
        state.data.knowledgeBase = json.data;
        return json.data;
    }

    async function addRagToLearning(knowledgePoint, queryContext) {
        try {
            await request("/api/rag/add-to-learning", {
                method: "POST",
                body: JSON.stringify({ knowledgePoint, queryContext })
            });
            toast("已加入学习列表");
        } catch (e) {
            toast("添加失败: " + (e.message || "未知错误"));
        }
    }

    // ========== Agent 学习中心 ==========
    async function loadAgentStatus() {
        state.data.agentPlanLoading = true;
        render();
        try {
            const json = await request("/api/agent/profile/initialize", { method: "POST" });
            state.data.agentStatus = json.data || json;
            state.data.agentReasoningLog.push({
                time: new Date().toISOString(),
                action: "profile_init",
                result: json.message || "画像初始化完成"
            });
        } catch (e) {
            state.data.agentStatus = { error: e.message };
            state.data.agentReasoningLog.push({
                time: new Date().toISOString(),
                action: "profile_init_error",
                result: e.message
            });
        }
        state.data.agentPlanLoading = false;
        render();
    }

    async function generateAgentPlan() {
        state.data.agentPlanLoading = true;
        render();
        try {
            const json = await request("/api/agent/profile/process-input", {
                method: "POST",
                body: JSON.stringify({
                    content: JSON.stringify({
                        goal: state.data.pathGoal || "系统掌握计算机核心能力",
                        subject: state.data.pathSubject || "all",
                        intensity: state.data.pathIntensity || "normal"
                    }),
                    type: "text"
                })
            });
            state.data.agentPlan = json.data || json;
            state.data.agentReasoningLog.push({
                time: new Date().toISOString(),
                action: "plan_generated",
                result: "学习计划已生成"
            });
        } catch (e) {
            state.data.agentPlan = { error: e.message };
            state.data.agentReasoningLog.push({
                time: new Date().toISOString(),
                action: "plan_error",
                result: e.message
            });
        }
        state.data.agentPlanLoading = false;
        render();
    }

    async function loadPathCenter(force = false) {
        if (state.data.pathCenter && !force) return state.data.pathCenter;
        const params = new URLSearchParams({
            goal: state.data.pathGoal || "系统掌握计算机核心能力",
            subject: state.data.pathSubject || "all",
            intensity: state.data.pathIntensity || "normal"
        });
        const json = await request(`/api/app/path/center?${params.toString()}`);
        state.data.pathCenter = json;
        return json;
    }

    async function loadCodeRepos() {
        state.data.codeRepoLoading = true;
        try {
            const json = await request("/api/code-repo/list");
            state.data.codeRepos = json.data || [];
        } catch (e) {
            state.data.codeRepos = [];
        } finally {
            state.data.codeRepoLoading = false;
        }
    }

    async function loadCodeRepoFiles(repoId) {
        state.data.codeRepoLoading = true;
        try {
            const json = await request(`/api/code-repo/${repoId}/files`);
            state.data.codeRepoActive = json.data.repo;
            state.data.codeRepoFiles = json.data.files || [];
        } catch (e) {
            state.data.codeRepoFiles = [];
        } finally {
            state.data.codeRepoLoading = false;
        }
    }

    async function createCodeRepo(name, description, language) {
        const json = await request("/api/code-repo/create", {
            method: "POST",
            body: JSON.stringify({ name, description, language })
        });
        return json.data;
    }

    async function uploadCodeFile(repoId, filename, content, language) {
        const json = await request(`/api/code-repo/${repoId}/upload`, {
            method: "POST",
            body: JSON.stringify({ filename, content, language })
        });
        return json.data;
    }

    async function deleteCodeRepo(repoId) {
        await request(`/api/code-repo/${repoId}`, { method: "DELETE" });
    }

    async function deleteCodeFile(repoId, fileId) {
        await request(`/api/code-repo/${repoId}/file/${fileId}`, { method: "DELETE" });
    }

    async function loadCodeFile(repoId, fileId) {
        const json = await request(`/api/code-repo/${repoId}/file/${fileId}`);
        return json.data;
    }

    async function runCode({ language, source }) {
        const json = await request("/api/compiler/run", {
            method: "POST",
            body: JSON.stringify({ language, source })
        });
        return json.data;
    }

    async function loadTeamCodeSummary(force = false) {
        if (state.data.teamCodeSummary && !force) return state.data.teamCodeSummary;
        const json = await request("/api/team-code/summary");
        state.data.teamCodeSummary = json.data;
        if (!state.data.teamCodeActiveProjectId && json.data.projects?.length) {
            state.data.teamCodeActiveProjectId = json.data.projects[0].id;
        }
        return json.data;
    }

    async function createTeamCodeDemo() {
        const json = await request("/api/team-code/demo", { method: "POST", body: JSON.stringify({}) });
        state.data.teamCodeProject = json.data;
        state.data.teamCodeActiveProjectId = json.data.project.id;
        state.data.teamCodeSummary = null;
        return json.data;
    }

    async function createTeamCodeProject(payload) {
        const json = await request("/api/team-code/projects", {
            method: "POST",
            body: JSON.stringify(payload || {})
        });
        state.data.teamCodeProject = json.data;
        state.data.teamCodeActiveProjectId = json.data.project.id;
        state.data.teamCodeSummary = null;
        return json.data;
    }

    async function deleteTeamCodeProject(projectId) {
        await request(`/api/team-code/projects/${projectId}`, { method: "DELETE" });
        state.data.teamCodeProject = null;
        state.data.teamCodeActiveProjectId = null;
        state.data.teamCodeActiveFile = null;
        state.data.teamCodeSource = "";
        state.data.teamCodeRepoPath = "";
        state.data.teamCodeSummary = null;
    }

    async function loadTeamCodeProject(projectId, force = false) {
        if (!projectId) return null;
        if (state.data.teamCodeProject?.project?.id === projectId && !force) return state.data.teamCodeProject;
        const json = await request(`/api/team-code/projects/${projectId}`);
        state.data.teamCodeProject = json.data;
        state.data.teamCodeActiveProjectId = projectId;
        return json.data;
    }

    async function loadTeamCodeFile(projectId, fileId) {
        const json = await request(`/api/team-code/projects/${projectId}/files/${fileId}`);
        return json.data;
    }

    async function saveTeamCodeFile(projectId, payload) {
        const json = await request(`/api/team-code/projects/${projectId}/files/save`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        state.data.teamCodeProject = json.data.detail;
        return json.data;
    }

    async function reviewTeamCode(projectId, payload) {
        const json = await request(`/api/team-code/projects/${projectId}/ai-review`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        state.data.teamCodeReview = json.data;
        return json.data;
    }

    async function runTeamCodeTool(projectId, payload) {
        const json = await request(`/api/team-code/projects/${projectId}/tools/run`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        return json.data;
    }

    async function runTeamCodePipeline(projectId, payload) {
        const json = await request(`/api/team-code/projects/${projectId}/ai-pipeline`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        state.data.teamCodePipeline = json.data;
        if (json.data?.review) state.data.teamCodeReview = json.data.review;
        return json.data;
    }

    async function loadXfyunCapabilities(force = false) {
        if (state.data.xfyunCapabilities?.length && !force) return state.data.xfyunCapabilities;
        const json = await request("/api/xfyun/capabilities");
        state.data.xfyunCapabilities = json.data || [];
        return state.data.xfyunCapabilities;
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(reader.error || new Error("文件读取失败"));
            reader.readAsDataURL(file);
        });
    }

    async function loadResources(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const json = await request(`/api/resources/list?${query}`);
            state.data.resources = json.data || [];
            return json.data;
        } catch (e) {
            state.data.resources = [];
            return [];
        }
    }

    async function loadResourceCategories() {
        try {
            const json = await request("/api/resources/categories");
            state.data.resourceCategories = json.data || [];
            return json.data;
        } catch (e) {
            state.data.resourceCategories = [];
            return [];
        }
    }

    async function loadProblems(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const json = await request(`/api/resources/problems?${query}`);
            state.data.problems = json.data || [];
            state.data.problemsTotal = json.total || 0;
            return json;
        } catch (e) {
            state.data.problems = [];
            state.data.problemsTotal = 0;
            return { data: [], total: 0 };
        }
    }

    async function loadProblemDetail(id) {
        try {
            const json = await request(`/api/resources/problems/${id}`);
            state.data.problemDetail = json.data;
            return json.data;
        } catch (e) {
            state.data.problemDetail = null;
            return null;
        }
    }

    async function trackResourceClick(id) {
        try {
            await request(`/api/resources/click/${id}`, { method: "POST" });
        } catch (e) {
            /* silent */
        }
    }

    async function loadTeacherStudents(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const json = await request(`/api/teacher/students?${query}`);
            state.data.teacherStudents = json.students || [];
            return json;
        } catch (e) {
            state.data.teacherStudents = [];
            return { students: [], total: 0 };
        }
    }

    async function loadTeacherSubjects() {
        try {
            const json = await request("/api/teacher/subjects");
            state.data.teacherSubjects = json.subjects || [];
            return json.subjects;
        } catch (e) {
            state.data.teacherSubjects = [];
            return [];
        }
    }

    async function loadTeacherAssignments(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const json = await request(`/api/teacher/assignments?${query}`);
            state.data.teacherAssignments = json.assignments || [];
            return json;
        } catch (e) {
            state.data.teacherAssignments = [];
            return { assignments: [], total: 0 };
        }
    }

    async function loadTeacherExamsList(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const json = await request(`/api/teacher/exams?${query}`);
            state.data.teacherExamsList = json.exams || [];
            return json;
        } catch (e) {
            state.data.teacherExamsList = [];
            return { exams: [], total: 0 };
        }
    }

    async function loadTeacherExamDetail(id) {
        try {
            const json = await request(`/api/teacher/exams/${id}`);
            state.data.teacherExamDetail = json;
            return json;
        } catch (e) {
            state.data.teacherExamDetail = null;
            return null;
        }
    }

    async function loadTeacherNotes(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const json = await request(`/api/teacher/notes?${query}`);
            state.data.teacherNotesList = json.notes || [];
            return json;
        } catch (e) {
            state.data.teacherNotesList = [];
            return { notes: [], total: 0 };
        }
    }

    async function loadTeacherStudentDetail(id) {
        try {
            const json = await request(`/api/teacher/student/${id}/detail`);
            state.data.teacherStudentDetail = json;
            return json;
        } catch (e) {
            state.data.teacherStudentDetail = null;
            return null;
        }
    }

    async function loadTeacherStudentStats(id) {
        try {
            return await request(`/api/teacher/student/${id}/stats`);
        } catch (e) {
            return null;
        }
    }

    async function loadTeacherPaths() {
        try {
            const json = await request("/api/teacher/paths");
            state.data.teacherPaths = json.paths || [];
            return json;
        } catch (e) {
            state.data.teacherPaths = [];
            return { paths: [], total: 0 };
        }
    }

    async function loadTeacherPathDetail(id) {
        try {
            const json = await request(`/api/teacher/paths/${id}`);
            state.data.teacherPathDetail = json;
            return json;
        } catch (e) {
            state.data.teacherPathDetail = null;
            return null;
        }
    }

    async function loadTeacherPathProgress(id) {
        try {
            const json = await request(`/api/teacher/paths/${id}/progress`);
            state.data.teacherPathProgress = json.progress || [];
            return json;
        } catch (e) {
            state.data.teacherPathProgress = [];
            return { progress: [] };
        }
    }

    async function loadTeacherPathAssignments() {
        try {
            return await request("/api/teacher/path-assignments");
        } catch (e) {
            return { assignments: [] };
        }
    }

    async function loadStudentActivePath() {
        try {
            state.data.studentPathLoading = true;
            const json = await request("/api/student-paths/active");
            state.data.studentActivePath = json;
            state.data.studentPathLoading = false;
            return json;
        } catch (e) {
            state.data.studentActivePath = null;
            state.data.studentPathLoading = false;
            return null;
        }
    }

    async function loadTeacherResources(q = "", type = "") {
        try {
            const json = await request(
                `/api/teacher/resources/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&limit=50`
            );
            return json.resources || [];
        } catch (e) {
            return [];
        }
    }

    async function loadStudentPathDashboard() {
        try {
            state.data.studentPathDashboard = await request("/api/student-paths/dashboard");
            return state.data.studentPathDashboard;
        } catch (e) {
            state.data.studentPathDashboard = { active: [], completed: [], upcoming: [] };
            return state.data.studentPathDashboard;
        }
    }

    async function loadPathNotes(assignmentId) {
        try {
            const json = await request(`/api/student-paths/notes/${assignmentId}`);
            state.data._pathAllNotes = json.notes || [];
            const noteMap = {};
            state.data._pathAllNotes.forEach(n => {
                noteMap[n.step_id] = n.notes || "";
            });
            state.data._pathNotes = noteMap;
            return json;
        } catch (e) {
            state.data._pathAllNotes = [];
            state.data._pathNotes = {};
            return { notes: [] };
        }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
        );
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#96;");
    }

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error || new Error("读取图片失败"));
            reader.readAsDataURL(file);
        });
    }

    function renderMarkdownLite(value) {
        const lines = String(value || "").split(/\r?\n/);
        const html = [];
        let listOpen = false;
        const closeList = () => {
            if (listOpen) {
                html.push("</ul>");
                listOpen = false;
            }
        };
        lines.forEach(line => {
            const text = line.trim();
            if (!text) {
                closeList();
                return;
            }
            if (/^#{1,4}\s+/.test(text)) {
                closeList();
                const level = Math.min((text.match(/^#+/) || [""])[0].length + 2, 5);
                html.push(`<h${level}>${escapeHtml(text.replace(/^#{1,4}\s+/, ""))}</h${level}>`);
                return;
            }
            if (/^[-*]\s+/.test(text)) {
                if (!listOpen) {
                    html.push("<ul>");
                    listOpen = true;
                }
                html.push(`<li>${escapeHtml(text.replace(/^[-*]\s+/, ""))}</li>`);
                return;
            }
            if (/^\d+\.\s+/.test(text)) {
                closeList();
                html.push(
                    `<p><b>${escapeHtml(text.replace(/^(\d+\.).*/, "$1"))}</b> ${escapeHtml(text.replace(/^\d+\.\s+/, ""))}</p>`
                );
                return;
            }
            closeList();
            html.push(`<p>${escapeHtml(text)}</p>`);
        });
        closeList();
        return html.join("");
    }

    function masteryLevel(accuracy) {
        if (accuracy >= 85) return { level: "熟练", color: "var(--green)", emoji: "⭐" };
        if (accuracy >= 70) return { level: "良好", color: "var(--blue)", emoji: "✅" };
        if (accuracy >= 50) return { level: "一般", color: "var(--amber)", emoji: "📘" };
        if (accuracy >= 30) return { level: "薄弱", color: "var(--orange)", emoji: "⚠️" };
        return { level: "未掌握", color: "var(--red)", emoji: "❌" };
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function toast(message) {
        let node = document.querySelector(".toast");
        if (!node) {
            node = document.createElement("div");
            node.className = "toast";
            document.body.appendChild(node);
        }
        node.textContent = message;
        node.classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => node.classList.remove("show"), 2400);
    }

    /** 学习事件追踪 - 上报用户行为到 learning_events 表 */
    const _eventQueue = [];
    let _eventTimer = null;
    const EVENT_FLUSH_MS = 3000;

    function trackEvent(eventType, opts = {}) {
        const event = {
            event_type: eventType,
            page: state.view || location.pathname,
            subject: opts.subject || state.data?.selectedSubject || null,
            knowledge_id: opts.knowledgeId || null,
            target_id: opts.targetId || null,
            target_type: opts.targetType || null,
            duration_ms: opts.durationMs || 0,
            context_json: opts.context || null,
            client_ts: Date.now()
        };
        _eventQueue.push(event);
        if (!_eventTimer) {
            _eventTimer = setTimeout(flushEvents, EVENT_FLUSH_MS);
        }
    }

    async function flushEvents() {
        _eventTimer = null;
        if (_eventQueue.length === 0) return;
        const batch = _eventQueue.splice(0);
        try {
            await request("/api/learning-events", {
                method: "POST",
                body: JSON.stringify({ events: batch })
            });
        } catch (e) {
            /* 静默失败，不打扰用户体验 */
        }
    }

    // 页面切换时自动上报
    const _originalSetView = setView;
    setView = function (view) {
        trackEvent("view_page", { context: { from: state.view, to: view } });
        flushEvents(); // 页面切换时立即刷新事件队列
        return _originalSetView(view);
    };

    // 页面关闭/刷新时发送剩余事件
    window.addEventListener("beforeunload", () => {
        if (_eventQueue.length > 0) {
            navigator.sendBeacon("/api/learning-events", JSON.stringify({ events: _eventQueue }));
        }
    });

    function showPanel(title, body, afterOpen) {
        let node = document.querySelector(".modal-layer");
        if (!node) {
            node = document.createElement("div");
            node.className = "modal-layer";
            node.setAttribute("role", "dialog");
            node.setAttribute("aria-modal", "true");
            node.setAttribute("aria-label", "弹出面板");
            document.body.appendChild(node);
        }
        const legacyFullPanel = typeof body === "function";
        node.innerHTML = legacyFullPanel
            ? `<div class="modal-card modal-card-legacy" role="document">${title}</div>`
            : `<div class="modal-card" role="document"><div class="card-head"><h2 class="section-title">${title}</h2><button class="icon-btn" data-close-panel aria-label="关闭面板">${icon("check", 18)}</button></div>${body || ""}</div>`;
        node.classList.add("show");
        node.querySelector("[data-close-panel]")?.addEventListener("click", () => node.classList.remove("show"));
        node.querySelectorAll("[data-panel-go]").forEach(el =>
            el.addEventListener("click", () => {
                node.classList.remove("show");
                setView(el.dataset.panelGo);
            })
        );
        node.addEventListener(
            "click",
            event => {
                if (event.target === node) node.classList.remove("show");
            },
            { once: true }
        );
        if (node._keyHandler) document.removeEventListener("keydown", node._keyHandler);
        node._keyHandler = e => {
            if (e.key === "Escape") {
                node.classList.remove("show");
                document.removeEventListener("keydown", node._keyHandler);
            }
        };
        document.addEventListener("keydown", node._keyHandler);
        setTimeout(() => {
            const firstFocusable = node.querySelector("button, input, textarea, select, [tabindex]");
            if (firstFocusable) firstFocusable.focus();
        }, 60);
        if (legacyFullPanel) body();
        if (typeof afterOpen === "function") afterOpen();
    }

    function logo() {
        return `<span class="logo"><span class="logo-bars"><span></span><span></span><span></span></span></span>`;
    }

    function setView(view) {
        state.view = guardOnboardingView(view);
        const route =
            state.view === "codeLab"
                ? "/code-lab"
                : state.view === "teamCode"
                  ? "/team-code"
                  : state.view === "agentResearch"
                    ? "/agent-research"
                    : state.view === "home"
                      ? "/home"
                      : `/${state.view}`;
        history.pushState({}, "", route);
        render();
    }

    function normalizeTargetView(view) {
        const map = {
            smartNotes: "smartNotes",
            smart_notes: "smartNotes",
            notes: "smartNotes",
            exam: "onlineExam",
            report: "report"
        };
        return map[view] || view || "home";
    }

    function aiFeatures() {
        return [
            ["closed-loop", "bolt", "AI一键学习闭环", "诊断、路径、笔记、导师追问同步联动", "闭环"],
            ["diagnosis", "brain", "认知诊断", "用 IRT 与薄弱点生成学习画像", "画像"],
            ["path", "route", "动态路径重排", "把薄弱点写入今日学习任务", "路径"],
            ["practice", "exam", "薄弱点自适应组卷", "从错题和掌握度进入练习", "练习"],
            ["note", "pen", "智能笔记外脑", "把知识点转为主动回忆卡片", "笔记"],
            ["feynman", "chart", "费曼表达评估", "检查解释清晰度、准确度与缺口", "评估"],
            ["review", "refresh", "遗忘曲线复习", "按间隔复习调度下一次巩固", "复习"]
        ];
    }

    function aiFeatureDropdown() {
        return `<div class="ai-feature-menu">
            <button class="btn ai-feature-trigger" data-view="intelligence">${icon("robot", 17)}AI闭环${icon("chevron", 15)}</button>
            <div class="ai-feature-panel" role="menu">
                <div class="ai-feature-head"><b>智能化学习动作</b><span>选择后自动联动页面与数据库</span></div>
                ${aiFeatures()
                    .map(
                        ([key, ic, title, desc, tag]) => `
                    <button class="ai-feature-item" data-ai-feature="${key}" role="menuitem">
                        <span class="round-icon">${icon(ic, 17)}</span>
                        <span><b>${title}</b><small>${desc}</small></span>
                        <i>${tag}</i>
                    </button>`
                    )
                    .join("")}
            </div>
        </div>`;
    }

    function learningToolDropdown() {
        const tools = [
            ["practice", "list", "专项练习", "薄弱点即时反馈"],
            ["test", "file", "阶段测试", "检查阶段掌握情况"],
            ["onlineExam", "exam", "在线考试", "限时组卷自动评分"],
            ["smartNotes", "pen", "智能笔记", "沉淀错题和主动回忆卡"]
        ];
        const active = tools.some(([view]) => view === state.view);
        return `<div class="tool-menu">
            <button class="tool-trigger ${active ? "active" : ""}" type="button">${icon("exam", 17)}<span>练测笔记</span>${icon("chevron", 14)}</button>
            <div class="tool-panel" role="menu">
                <div class="ai-feature-head"><b>学习工具</b><span>练习、测试、考试、笔记统一入口</span></div>
                ${tools
                    .map(
                        ([view, ic, title, desc]) => `
                    <button class="tool-item ${state.view === view ? "active" : ""}" data-view="${view}" role="menuitem">
                        <span class="round-icon">${icon(ic, 17)}</span>
                        <span><b>${title}</b><small>${desc}</small></span>
                    </button>`
                    )
                    .join("")}
            </div>
        </div>`;
    }

    function closedLoopPanel(compact = false) {
        const steps = [
            ["db", "采集", "课程、答题、笔记、互动数据进入画像"],
            ["brain", "诊断", "AI识别薄弱概念、能力层级和学习偏好"],
            ["route", "规划", "动态学习路径按掌握度和目标重排"],
            ["exam", "练习", "自适应题目把结果写回掌握度"],
            ["pen", "沉淀", "自动生成笔记卡、错题卡和追问"],
            ["refresh", "复习", "遗忘曲线触发下一轮巩固任务"]
        ];
        return `<section class="card loop-panel ${compact ? "compact" : ""}">
            <div class="card-head"><h2 class="section-title">${icon("bolt", 18)}AI智能学习闭环</h2><button class="btn tiny ghost" data-run-closed-loop="${escapeHtml(state.data.weakPoints[0]?.title || "Node.js")}">一键运行</button></div>
            <div class="loop-rail">${steps
                .map(
                    ([ic, title, desc], i) => `
                <div class="loop-step ${i === 0 ? "active" : ""}">
                    <span>${icon(ic, 19)}</span><b>${title}</b><small>${desc}</small>
                </div>`
                )
                .join("")}</div>
        </section>`;
    }

    function topbar(mode = false) {
        const groups = navGroups();
        const activeGroup = groups.find(g => g.items.some(i => i.view === state.view));
        const locked = mode === true;
        const partial = mode === "partial";
        return `
            <header class="topbar${locked ? " topbar-locked" : partial ? " topbar-partial-locked" : ""}">
                <button class="brand brand-button" data-view="home"${locked ? " disabled" : ""}>${logo()}<span>EduSmart</span></button>
                ${
                    locked
                        ? `
                <div class="topbar-lock-banner">
                    <span class="tlb-icon">${icon("lock", 20)}</span>
                    <span class="tlb-text"><strong>锁定学习模式</strong> — 老师已为你指定了学习路径，请按顺序完成所有步骤</span>
                </div>`
                        : `
                <nav class="nav">${groups
                    .map(g => {
                        const isActive = activeGroup === g;
                        if (g.items.length === 1) {
                            return `<button class="${state.view === g.items[0].view ? "active" : ""}" data-view="${g.items[0].view}" title="${g.items[0].label}">
                            ${icon(g.items[0].icon, 17)}<span>${g.items[0].label}</span>
                        </button>`;
                        }
                        return `<div class="nav-group">
                        <button class="nav-group-trigger ${isActive ? "active" : ""}" type="button">
                            ${icon(g.icon, 17)}<span>${g.label}</span>${icon("chevron", 12)}
                        </button>
                        <div class="nav-group-panel" role="menu">
                            <div class="nav-group-head"><b>${g.label}</b><span>${g.desc || ""}</span></div>
                            ${g.items
                                .map(
                                    item => `
                                <button class="nav-group-item ${state.view === item.view ? "active" : ""}" data-view="${item.view}" role="menuitem">
                                    <span class="round-icon">${icon(item.icon, 17)}</span>
                                    <span><b>${item.label}</b>${item.desc ? `<small>${item.desc}</small>` : ""}</span>
                                </button>`
                                )
                                .join("")}
                        </div>
                    </div>`;
                    })
                    .join("")}</nav>
                ${learningToolDropdown()}
                ${aiFeatureDropdown()}
                <div class="actions">
                    <button class="icon-btn" title="搜索" data-open-panel="search">${icon("search", 20)}</button>
                    <button class="icon-btn" title="通知" data-open-panel="notifications">${icon("bell", 20)}${state.data.unreadCount > 0 ? `<span class="badge">${state.data.unreadCount}</span>` : ""}</button>
                    <button class="user-chip" data-view="account" title="个人中心">
                        <span class="avatar">${escapeHtml(state.user.username.slice(0, 1).toUpperCase())}</span>
                        <span>${escapeHtml(state.user.username)}</span><span>⌄</span>
                    </button>
                </div>
`
                }
                ${partial ? `<div class="topbar-partial-lock-strip"><span class="tpls-icon">${icon("lock", 14)}</span><span class="tpls-text">锁定学习模式 — 请完成老师指定的学习路径后解锁全部功能</span></div>` : ""}
            </header>`;
    }

    function navGroups() {
        const role = state.user?.role || readUser()?.role || "student";
        const groups = [
            {
                label: "首页",
                icon: "home",
                desc: "",
                items: [{ view: "home", icon: "home", label: "首页", desc: "回到总览" }]
            },
            {
                label: "学习中心",
                icon: "book",
                desc: "课程 · 练习 · 考试",
                items: [
                    { view: "studyPlan", icon: "calendar", label: "学习计划", desc: "今日闭环任务" },
                    { view: "course", icon: "book", label: "课程学习", desc: "按目标选择课程" },
                    { view: "practice", icon: "list", label: "专项练习", desc: "薄弱点即时反馈" },
                    { view: "onlineExam", icon: "exam", label: "在线考试", desc: "限时组卷自动评分" },
                    { view: "test", icon: "file", label: "阶段测试", desc: "检查阶段掌握情况" }
                ]
            },
            {
                label: "诊断分析",
                icon: "brain",
                desc: "画像 · 诊断 · 报告",
                items: [
                    { view: "diagnostic", icon: "brain", label: "智能诊断", desc: "AI学习画像分析" },
                    { view: "profile", icon: "user", label: "学习画像", desc: "洞察学习能力" }
                ]
            },
            {
                label: "编程实践",
                icon: "code",
                desc: "实训 · 项目 · 复盘",
                items: [
                    { view: "codeLab", icon: "code", label: "AI编程舱", desc: "边写边练边反馈" },
                    { view: "teamCode", icon: "folder", label: "团队项目", desc: "协作完成学习项目" },
                    { view: "path", icon: "refresh", label: "复习巩固", desc: "遗忘曲线复习" }
                ]
            },
            {
                label: "学习资源",
                icon: "layers",
                desc: "资源 · 教程 · 题库 · 视频",
                items: [
                    { view: "resources", icon: "layers", label: "资源中心", desc: "编程学习资源汇总" },
                    { view: "tutorials", icon: "book", label: "在线教程", desc: "菜鸟教程等在线资料" },
                    { view: "problems", icon: "code", label: "编程题库", desc: "力扣风格在线刷题" },
                    { view: "videos", icon: "play", label: "视频教程", desc: "B站/MOOC等课程视频" }
                ]
            },
            {
                label: "知识引擎",
                icon: "database",
                desc: "Obsidian · RAG · Agent",
                items: [
                    { view: "obsidian", icon: "database", label: "Obsidian知识库", desc: "双向链接笔记管理" },
                    { view: "ragSearch", icon: "search", label: "RAG智能检索", desc: "本地向量知识库问答" },
                    { view: "agentCenter", icon: "brain", label: "Agent学习中心", desc: "LLM个性化学习路径" }
                ]
            },
            {
                label: "AI智能",
                icon: "robot",
                desc: "助手 · 研究 · 落地",
                items: [
                    { view: "aiAssistant", icon: "robot", label: "AI学习助手", desc: "对话、错题、笔记与任务流" },
                    { view: "agentResearch", icon: "layers", label: "Agent研究中心", desc: "开源能力在项目内落地" }
                ]
            },
            {
                label: "教师工作台",
                icon: "chart",
                desc: "",
                items: [{ view: "teacherWorkbench", icon: "chart", label: "教师工作台", desc: "班级管理与学情" }]
            }
        ];
        return role === "teacher" || role === "admin" ? groups : groups.filter(group => group.label !== "教师工作台");
    }

    function metricCards(items = state.data.metrics) {
        return `<div class="metric-row">${items
            .map(
                ([ic, label, value, unit, sub, up, color, glow, grad]) => `
            <article class="metric-card interactive" style="--wave:linear-gradient(180deg, transparent, ${glow});--glow:${glow};--grad:${grad}">
                <div class="metric-top"><span class="metric-icon">${icon(ic, 22)}</span>
                    <div><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}<span>${escapeHtml(unit)}</span></div></div>
                </div>
                <div class="metric-sub">${escapeHtml(sub)}${up ? `<span class="up">↑ ${escapeHtml(up)}</span>` : ""}</div>
            </article>`
            )
            .join("")}</div>`;
    }

    function planCard() {
        const summary = state.data.taskSummary;
        const tasks = state.data.tasks.length
            ? state.data.tasks
            : [
                  {
                      icon: "play",
                      title: "完成今日推荐课程学习",
                      meta: "数据结构 · 哈希表",
                      time: "预计 45 分钟",
                      done: true,
                      color: "#635bff",
                      soft: "rgba(99,91,255,.12)"
                  },
                  {
                      icon: "file",
                      title: "完成 5 道课后练习题",
                      meta: "操作系统 · 内存管理",
                      time: "预计 20 分钟",
                      done: true,
                      color: "#18b87a",
                      soft: "rgba(24,184,122,.12)"
                  },
                  {
                      icon: "robot",
                      title: "与 AI 助手进行专题复盘",
                      meta: "计算机网络 · DNS",
                      time: "预计 15 分钟",
                      done: false,
                      color: "#ff9500",
                      soft: "rgba(255,149,0,.12)"
                  },
                  {
                      icon: "book",
                      title: "查看本周学习报告",
                      meta: "学习分析与建议",
                      time: "预计 10 分钟",
                      done: false,
                      color: "#2f6bff",
                      soft: "rgba(47,107,255,.12)"
                  }
              ];
        return `
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${icon("list", 18)}今日学习计划</h2>
                    <button class="btn tiny ghost" data-view="studyPlan">${icon("calendar", 15)}查看闭环</button>
                </div>
                <div class="plan-list">${tasks
                    .map(
                        (task, i) => `
                    <div class="plan-item ${task.done ? "is-done" : ""}" style="--color:${task.color};--soft-color:${task.soft}">
                        <span class="plan-index">${i + 1}</span>
                        <span class="task-icon">${icon(task.icon, 23)}</span>
                        <div><div class="plan-title">${escapeHtml(task.title)}</div><div class="plan-meta"><span>${escapeHtml(task.meta)}</span><span>${escapeHtml(task.time)}</span></div></div>
                        <button class="check ${task.done ? "done" : ""}" data-task-id="${task.id || ""}" title="${task.done ? "取消完成" : "标记完成"}">${task.done ? icon("check", 20) : ""}</button>
                    </div>`
                    )
                    .join("")}</div>
                <div class="progress-line"><span>已完成 ${summary.done} / ${summary.total} 项任务</span><div class="bar"><span style="width:${summary.percent}%"></span></div><span>预计 ${(summary.minutes / 60).toFixed(1)} 小时</span></div>
            </article>`;
    }

    function activityCard() {
        const items = state.data.activities.length
            ? state.data.activities
            : [
                  {
                      icon: "check",
                      text: "完成了“数据结构”的学习",
                      time: "10 分钟前",
                      color: "#18b87a",
                      soft: "rgba(24,184,122,.12)",
                      badge: "学习完成"
                  },
                  {
                      icon: "trophy",
                      text: "连续学习第 13 天达成",
                      time: "30 分钟前",
                      color: "#ff9500",
                      soft: "rgba(255,149,0,.12)",
                      badge: "连续记录"
                  }
              ];
        return `<article class="card"><div class="card-head"><h2 class="section-title">${icon("clock", 18)}最近动态</h2><button class="link-button" data-open-panel="activities">全部动态</button></div>
            <div class="activity">${items
                .map(
                    item => `<div class="activity-item" style="--color:${item.color};--soft-color:${item.soft}">
                <span class="round-icon">${icon(item.icon, 17)}</span><div><div class="activity-text">${escapeHtml(item.text)}</div><div class="activity-time">${escapeHtml(item.time)}</div></div><span class="pill">${escapeHtml(item.badge)}</span>
            </div>`
                )
                .join("")}</div></article>`;
    }

    function quickTiles() {
        const quick = [
            ["calendar", "学习计划", "今日闭环任务指引", "#635bff", "rgba(99,91,255,.10)", "studyPlan"],
            ["brain", "智能学习画像", "AI 洞察学习能力", "#2f6bff", "rgba(47,107,255,.10)", "profile"],
            ["route", "学习路径规划", "薄弱点闭环路径", "#7c4dff", "rgba(124,77,255,.10)", "path"],
            ["book", "课程中心", "按学习目标选课", "#18b87a", "rgba(24,184,122,.10)", "course"],
            ["list", "专项练习", "薄弱点即时反馈", "#2196e6", "rgba(33,150,230,.10)", "practice"],
            ["exam", "在线考试", "限时组卷自动评分", "#ff9500", "rgba(255,149,0,.10)", "onlineExam"],
            ["pen", "智能笔记", "AI生成主动回忆卡", "#ee4f65", "rgba(238,79,101,.10)", "smartNotes"],
            ["code", "AI编程舱", "项目练习与即时反馈", "#0f172a", "rgba(15,23,42,.08)", "codeLab"]
        ];
        return `<div class="quick-row">${quick
            .map(
                ([ic, title, desc, color, soft, view]) => `
            <button class="quick-tile interactive" data-view="${view}" style="--color:${color};--soft-color:${soft};--grad:linear-gradient(135deg,${color},#7c4dff)">
                <span class="tile-icon">${icon(ic, 24)}</span><h3>${title}</h3><p>${desc}</p>
            </button>`
            )
            .join("")}</div>`;
    }

    function achievementCard() {
        const titles = state.data.achievements.length
            ? state.data.achievements.map(item => item.title)
            : ["勤奋学习者", "知识点掌握", "学习里程碑", "连续学习"];
        return `<article class="card"><div class="card-head"><h2 class="section-title">${icon("trophy", 18)}学习成就</h2><button class="link-button" data-open-panel="achievements">查看全部</button></div>
            <div class="achievement-layout"><div class="donut" data-label="Lv.2"></div><div><h3>Lv.2 初学者</h3><p>根据学习时长、练习完成和连续学习自动成长</p><div class="bar"><span style="width:68%"></span></div></div></div>
            <div class="tag-row">${titles.map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("")}<span class="pill" style="--color:#66708a;--soft-color:#f0f3fa">+3</span></div>
        </article>`;
    }

    function homeView() {
        return `<main class="page">
            <section class="hero-row"><div class="hero"><h1>早上好，${escapeHtml(state.user.username)} 👋</h1><p>AI 驱动的个性化学习，让每一次努力都更有价值</p>
                <div class="hero-actions"><button class="btn primary glow" data-view="studyPlan">${icon("play", 17)}进入今日学习计划</button><button class="btn ghost" data-run-closed-loop="${escapeHtml(state.data.weakPoints[0]?.title || "Node.js")}">${icon("robot", 17)}AI 生成今日闭环</button></div></div>${metricCards()}</section>
            ${newUserOnboarding()}
            ${roleCockpit()}
            ${closedLoopPanel()}
            <section class="grid-2">${planCard()}${activityCard()}</section>
            <section class="grid-2 dashboard-lower">${`<article class="card"><div class="card-head"><h2 class="section-title">${icon("bolt", 18)}快速入口</h2></div>${quickTiles()}</article>`}${achievementCard()}</section>
        </main>`;
    }

    function newUserOnboarding() {
        if (!shouldShowOnboarding()) return "";
        const progress = onboardingProgress();
        const primaryView = progress.diagnosticDone ? "path" : "diagnostic";
        const primaryText = progress.diagnosticDone
            ? "生成学习路径"
            : progress.questionnaireDone
              ? "进行学科测试"
              : progress.quickDone
                ? "继续问卷诊断"
                : "开始文本诊断";
        const steps = [
            [
                "pen",
                "快速文本诊断",
                "先收集专业、目标、薄弱点和可投入时间，不直接生成最终画像。",
                progress.quickDone ? "已完成" : "开始填写",
                "diagnostic"
            ],
            [
                "list",
                "结构化问卷诊断",
                "继续校准学习习惯、认知偏好、节奏和资源偏好。",
                progress.questionnaireDone ? "已完成" : progress.quickDone ? "继续问卷" : "文本后开放",
                "diagnostic"
            ],
            [
                "exam",
                "一门学科测试",
                "用真实题目校准知识掌握度，完成后才生成个人画像。",
                progress.subjectDone ? "已完成" : progress.questionnaireDone ? "开始测试" : "问卷后开放",
                "diagnostic"
            ],
            [
                "route",
                "路径与计划匹配",
                "根据完整画像生成个性化路径，再拆成今日学习计划。",
                progress.pathDone ? "已完成" : "生成路径",
                "path"
            ]
        ];
        return `<section class="onboarding-modal-layer show" aria-label="新用户学习引导" role="dialog" aria-modal="true">
            <div class="onboarding-modal-card">
                <button class="onboarding-dismiss" data-onboarding-dismiss aria-label="提示初始化要求">${icon("x", 16)}</button>
                <div class="onboarding-copy">
                    <span class="eyebrow">新用户引导</span>
                    <h2>${icon("target", 20)}先认识你，再安排学习</h2>
                    <p>新用户需要先完成“快速文本诊断 → 结构化问卷 → 一门学科测试”，三段证据齐全后才生成个人画像。画像生成前，其它学习模块会保持锁定。</p>
                </div>
                <div class="onboarding-steps">
                    ${steps
                        .map(
                            ([ic, title, text, action, view], index) => `<article>
                        <span class="onboarding-step-index">${index + 1}</span>
                        <span class="round-icon">${icon(ic, 18)}</span>
                        <b>${title}</b>
                        <p>${text}</p>
                        <button class="btn tiny ${index === 0 ? "primary" : "ghost"}" data-onboarding-go="${view}">${action}</button>
                    </article>`
                        )
                        .join("")}
                </div>
                <div class="onboarding-footer">
                    <button class="btn ghost" data-onboarding-dismiss>为什么锁定？</button>
                    <button class="btn primary glow" data-onboarding-go="${primaryView}">${icon("play", 17)}${primaryText}</button>
                </div>
            </div>
        </section>`;
    }

    function formatPlanDuration(minutes) {
        const n = Number(minutes || 0);
        if (!n) return "待估算";
        if (n < 60) return `${n} 分钟`;
        const h = Math.floor(n / 60);
        const m = n % 60;
        return m ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
    }

    function studyPlanTaskCard(task) {
        const done = task.completed || task.status === "completed";
        const steps = task.steps || [];
        const criteria = task.completionCriteria || task.successCriteria || task.success_criteria || [];
        const materials = task.materials || [];
        const practiceQuestions = task.practiceQuestions || task.practice_questions || [];
        const noteSections = task.noteTemplate?.sections || task.note_template?.sections || [];
        return `<article class="card interactive" style="box-shadow:none;border:1px solid ${done ? "rgba(24,184,122,.22)" : "rgba(99,91,255,.16)"};background:${done ? "rgba(24,184,122,.06)" : "rgba(255,255,255,.92)"}">
            <div class="card-head" style="align-items:flex-start;gap:14px">
                <div style="display:flex;gap:14px;align-items:flex-start">
                    <button class="check ${done ? "done" : ""}" data-study-task-toggle="${escapeHtml(task.id || "")}" data-completed="${done ? "1" : "0"}" title="${done ? "取消完成" : "标记完成"}">${done ? icon("check", 20) : ""}</button>
                    <div>
                        <div class="tag-row" style="margin-bottom:8px">
                            <span class="pill">${icon(task.icon || "book", 14)} ${escapeHtml(task.subjectName || task.subject || "综合")}</span>
                            <span class="pill">${icon("clock", 14)} ${formatPlanDuration(task.duration || task.estimated_minutes)}</span>
                            ${task.mastery !== null && task.mastery !== undefined ? `<span class="pill">${icon("chart", 14)} 掌握度 ${escapeHtml(task.mastery)}%</span>` : ""}
                        </div>
                        <h3 style="margin:0 0 8px;font-size:21px">${escapeHtml(task.title || task.task || task.name)}</h3>
                        <p style="margin:0;color:var(--muted)">${escapeHtml(task.reason || "完成后记录学习产出，便于闭环追踪")}</p>
                    </div>
                </div>
                <button class="btn tiny primary" data-plan-action="${escapeHtml(task.actionUrl || "/practice")}">${escapeHtml(task.actionLabel || "开始学习")}</button>
            </div>
            <div class="grid-2" style="gap:12px;margin-top:16px;grid-template-columns:1fr 1fr">
                <div class="card" style="box-shadow:none;padding:14px;background:rgba(47,107,255,.05)">
                    <b>${icon("book", 15)} 学习材料</b>
                    <div class="list" style="margin-top:10px">
                        ${
                            materials
                                .slice(0, 3)
                                .map(
                                    item => `<div class="list-row" style="align-items:flex-start;gap:10px">
                            <span><b>${escapeHtml(item.title)}</b><small style="display:block;color:var(--muted);margin-top:4px">${escapeHtml(item.instruction || item.source || "阅读后写下关键点")}</small></span>
                            <button class="btn tiny ghost" data-plan-action="${escapeHtml(item.url || task.actionUrl || "/practice")}">打开</button>
                        </div>`
                                )
                                .join("") || `<p style="color:var(--muted)">暂无材料，点击任务按钮进入学习。</p>`
                        }
                    </div>
                </div>
                <div class="card" style="box-shadow:none;padding:14px;background:rgba(24,184,122,.05)">
                    <b>${icon("pen", 15)} 练习题</b>
                    <div class="list" style="margin-top:10px">
                        ${
                            practiceQuestions
                                .slice(0, 3)
                                .map(
                                    (q, index) => `<div class="list-row" style="display:block">
                            <b>${index + 1}. ${escapeHtml(q.title || "练习题")}</b>
                            <p style="margin:6px 0;color:var(--muted)">${escapeHtml(q.prompt || "")}</p>
                            ${q.expected ? `<small>目标：${escapeHtml(q.expected)}</small>` : ""}
                        </div>`
                                )
                                .join("") || `<p style="color:var(--muted)">完成学习材料后自动推荐练习题。</p>`
                        }
                    </div>
                </div>
            </div>
            <div class="grid-3" style="gap:12px;margin-top:16px">
                ${steps
                    .slice(0, 3)
                    .map(
                        (step, index) =>
                            `<div class="card" style="box-shadow:none;padding:14px;background:rgba(99,91,255,.05)"><b>${index + 1}. ${escapeHtml(step)}</b></div>`
                    )
                    .join("")}
            </div>
            <div class="grid-2" style="gap:12px;margin-top:14px">
                <div class="card" style="box-shadow:none;padding:14px">
                    <b>${icon("edit", 15)} 笔记模板</b>
                    <div class="tag-row" style="margin-top:10px">${
                        noteSections
                            .slice(0, 4)
                            .map(s => `<span class="pill">${escapeHtml(s.heading)}</span>`)
                            .join("") ||
                        `<span class="pill">核心概念</span><span class="pill">错因</span><span class="pill">下一步</span>`
                    }</div>
                    <p style="margin:10px 0 0;color:var(--muted)">${escapeHtml(noteSections[0]?.prompt || task.deliverable || "按模板写下学习产出。")}</p>
                </div>
                <div class="card" style="box-shadow:none;padding:14px">
                    <b>${icon("flag", 15)} 下一步</b>
                    <p style="margin:8px 0;color:var(--muted)">${escapeHtml(task.nextStep || "完成后进入下一项任务。")}</p>
                    <b>完成标准</b>
                    <p style="margin:8px 0 0;color:var(--muted)">${escapeHtml(criteria.slice(0, 3).join("；") || "可以独立复述并完成同类题")}</p>
                </div>
            </div>
        </article>`;
    }

    function learningLoopDiagnosisCard(loop) {
        const questions = loop?.questions || [];
        if (loop?.stage !== "diagnosis_required" || !questions.length) return "";
        return `<section class="card" style="margin-bottom:18px">
            <div class="card-head">
                <div>
                    <span class="pill warn">数据不足，先诊断</span>
                    <h2 class="section-title">${icon("brain", 18)}${escapeHtml(loop.knowledge?.title || "目标知识点")}基线诊断</h2>
                    <p>${escapeHtml(loop.message || "完成诊断后生成真实学习计划。")}</p>
                </div>
                <span class="pill">置信度 ${Math.round(Number(loop.confidence || 0) * 100)}%</span>
            </div>
            <form data-learning-loop-diagnosis>
                ${questions
                    .map(
                        (
                            question,
                            index
                        ) => `<fieldset style="border:0;padding:16px 0;margin:0;border-bottom:1px solid var(--line)">
                            <legend style="font-weight:700;margin-bottom:10px">${index + 1}. ${escapeHtml(question.content)}</legend>
                            <div class="list">
                                ${(question.options || [])
                                    .map(
                                        option => `<label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer">
                                            <input type="radio" name="question_${question.id}" value="${escapeHtml(option)}" required>
                                            <span>${escapeHtml(option)}</span>
                                        </label>`
                                    )
                                    .join("")}
                            </div>
                        </fieldset>`
                    )
                    .join("")}
                <div class="hero-actions" style="margin-top:18px">
                    <button class="btn primary glow" type="submit">${icon("check", 17)}提交诊断并生成 3 天计划</button>
                </div>
            </form>
        </section>`;
    }

    function studyPlanWeekView() {
        const days = state.data.studyPlanWeek?.days || [];
        return `<section class="card">
            <div class="card-head"><h2 class="section-title">${icon("calendar", 18)}本周执行情况</h2><span class="pill">任务完成后自动同步</span></div>
            <div class="grid-3" style="grid-template-columns:repeat(7,minmax(90px,1fr));gap:10px">
                ${days
                    .map(
                        day => `<div class="card ${day.is_today ? "interactive" : ""}" style="box-shadow:none;text-align:center;padding:14px;background:${day.is_today ? "rgba(99,91,255,.08)" : "rgba(248,250,252,.9)"}">
                    <b>${escapeHtml(day.date)}</b>
                    <p style="margin:8px 0;color:var(--muted)">${day.is_today ? "今天" : `${day.taskCount || 0} 项任务`}</p>
                    <div class="bar"><span style="width:${Number(day.progress || 0)}%"></span></div>
                    <small>${Number(day.progress || 0)}%</small>
                </div>`
                    )
                    .join("")}
            </div>
        </section>`;
    }

    function studyPlanMonthView() {
        const goals = state.data.studyPlanMonth?.goals || [];
        return `<section class="card">
            <div class="card-head"><h2 class="section-title">${icon("target", 18)}月度目标</h2><span class="pill">由知识点掌握度生成</span></div>
            <div class="list">
                ${goals
                    .map(
                        goal => `<div class="list-row" style="display:block">
                    <div style="display:flex;justify-content:space-between;gap:16px"><b>${escapeHtml(goal.title || goal.name)}</b><span>${Number(goal.progress || 0)}%</span></div>
                    <p style="margin:8px 0;color:var(--muted)">${escapeHtml(goal.detail || "持续完成今日任务会推动目标进度")}</p>
                    <div class="bar"><span style="width:${Number(goal.progress || 0)}%"></span></div>
                </div>`
                    )
                    .join("")}
            </div>
        </section>`;
    }

    function studyPlanView() {
        const tasks = state.data.studyPlanTasks || [];
        const plan = state.data.studyPlan || {};
        const learningLoop = state.data.learningLoop;
        const progress = state.data.studyPlanProgress || {};
        const today = progress.today || {};
        const stats = progress.stats || {};
        const activeTask = tasks.find(task => !(task.completed || task.status === "completed")) || tasks[0];
        if (!plan.generatedByAgent) {
            const profile = plan.profileContext || {};
            return `<main class="page agent-plan-empty-page">
                <section class="hero-row">
                    <div class="hero">
                        <span class="pill">Agent 今日计划</span>
                        <h1>今日计划尚未生成</h1>
                        <p>这里不再显示规则计划或历史固定任务。请先调用 Agent 个性化学习，系统会基于画像、目标和路径写入今日学习计划。</p>
                        <div class="hero-actions">
                            <button class="btn primary glow" data-study-plan-agent-generate>${icon("robot", 17)}调用 Agent 生成今日计划</button>
                            <button class="btn ghost" data-view="path">${icon("route", 17)}查看路径入口</button>
                            <button class="btn ghost" data-view="profile">${icon("user", 17)}查看画像</button>
                        </div>
                    </div>
                    <article class="card agent-path-status">
                        <span class="pill ${profile.primaryStyleLabel ? "good" : "warn"}">计划状态</span>
                        <h2>等待 Agent 写入</h2>
                        <p>${escapeHtml(state.data.studyPlanSuggestion || "未调用 Agent 个性化学习前，不展示任何规则计划。")}</p>
                    </article>
                </section>
                <section class="path-control card agent-only-control">
                    <div><label>学习目标</label><input data-path-goal value="${escapeHtml(state.data.pathGoal)}" placeholder="例如：今天修复 SQL 和动态规划"></div>
                    <div><label>学科范围</label><select data-path-subject><option value="all">由 Agent 判断</option></select></div>
                    <div><label>学习强度</label><select data-path-intensity>${[
                        ["light", "轻量"],
                        ["normal", "标准"],
                        ["intense", "冲刺"]
                    ]
                        .map(
                            ([key, label]) =>
                                `<option value="${key}" ${state.data.pathIntensity === key ? "selected" : ""}>${label}</option>`
                        )
                        .join("")}</select></div>
                    <button class="btn primary" data-study-plan-agent-generate>${icon("calendar", 17)}生成今日计划</button>
                </section>
                ${learningLoopDiagnosisCard(learningLoop)}
            </main>`;
        }
        return `<main class="page">
            <section class="hero-row">
                <div class="hero">
                    <h1>今日学习计划</h1>
                    <p>今日计划只来自 Agent 个性化学习写入的路径任务，可重新生成，也可自定义追加路径任务。</p>
                    <div class="hero-actions">
                        <button class="btn primary glow" data-plan-action="${escapeHtml(activeTask?.actionUrl || "/path")}">${icon("play", 17)}开始当前任务</button>
                        <button class="btn ghost" data-study-plan-agent-generate>${icon("robot", 17)}重新生成 Agent 计划</button>
                        <button class="btn ghost" data-open-custom-agent-task>${icon("plus", 17)}自定义添加路径任务</button>
                    </div>
                </div>
                <div class="metric-row">
                    <article class="metric-card"><div class="metric-top"><span class="metric-icon">${icon("check", 22)}</span><div><div class="metric-label">今日完成</div><div class="metric-value">${today.completed || 0}<span>/${today.total || tasks.length}</span></div></div></div><div class="metric-sub">完成率 ${today.completionRate || 0}%</div></article>
                    <article class="metric-card"><div class="metric-top"><span class="metric-icon">${icon("clock", 22)}</span><div><div class="metric-label">今日学习</div><div class="metric-value">${formatPlanDuration(stats.today_minutes || 0)}<span></span></div></div></div><div class="metric-sub">完成任务后累加</div></article>
                    <article class="metric-card"><div class="metric-top"><span class="metric-icon">${icon("chart", 22)}</span><div><div class="metric-label">本周学习</div><div class="metric-value">${formatPlanDuration(stats.week_minutes || 0)}<span></span></div></div></div><div class="metric-sub">近 7 天任务时长</div></article>
                </div>
            </section>
            <section class="card" style="margin-bottom:18px">
                <div class="card-head"><h2 class="section-title">${icon("route", 18)}Agent 今日学习路线</h2><span class="pill">${tasks.length} 项 Agent 任务</span></div>
                <p style="margin:0;color:var(--muted)">${escapeHtml(state.data.studyPlanSuggestion || "今日计划来自 Agent 个性化路径。")}</p>
            </section>
            <section class="card custom-agent-task-panel" data-custom-agent-task-panel hidden>
                <div class="card-head"><h2 class="section-title">${icon("plus", 18)}自定义添加路径任务</h2><button class="btn tiny ghost" data-close-custom-agent-task>关闭</button></div>
                <form class="grid-3" data-custom-agent-task-form>
                    <input class="input" name="title" placeholder="任务标题，如：补充 SQL JOIN 练习">
                    <input class="input" name="subject" placeholder="学科，如：数据库">
                    <input class="input" name="minutes" type="number" min="5" max="120" value="25" placeholder="分钟">
                    <input class="input" name="knowledgeTitle" placeholder="关联知识点，可留空">
                    <select class="input" name="icon"><option value="book">阅读</option><option value="exam">练习</option><option value="pen">笔记</option><option value="refresh">复习</option></select>
                    <button class="btn primary" type="submit">${icon("check", 16)}添加到 Agent 计划</button>
                    <textarea class="input" name="reason" rows="3" placeholder="添加原因，如：我想加强 SQL 多表查询场景题"></textarea>
                </form>
            </section>
            <section>
                <div class="side-card">${tasks.length ? tasks.map(studyPlanTaskCard).join("") : `<article class="card"><p>Agent 暂未写入任务。</p></article>`}</div>
            </section>
        </main>`;
    }

    function studentPathGuidedCard() {
        const p = state.data.studentActivePath;
        if (!p || !p.active) return "";
        const percent = Math.round((p.completedSteps / p.totalSteps) * 100);
        const step = p.currentStepData;
        const allSteps = p.allSteps || [];
        const stepProgress = p.stepProgress || [];
        const stepMap = {};
        if (stepProgress)
            stepProgress.forEach(sp => {
                stepMap[sp.step_id] = sp;
            });
        const typeLabels = { text: "阅读", video: "视频", quiz: "测验", code: "编程", exercise: "练习" };
        const typeIcons = { text: "book", video: "play", quiz: "exam", code: "code", exercise: "pen" };
        const isLastStep = p.currentStep === p.totalSteps;
        return `<section class="guided-path-card">
            <div class="gpc-header">
                <div class="gpc-title-row">
                    <span class="gpc-icon">${icon("route", 24)}</span>
                    <div class="gpc-title-info">
                        <span class="pill pill-locked">🔒 教师指定任务</span>
                        <h2>${escapeHtml(p.pathName)}</h2>
                        <small>${escapeHtml(p.subject)} · ${p.totalSteps} 个步骤</small>
                    </div>
                </div>
                <div class="gpc-progress-row">
                    <div class="gpc-progress-bar"><span style="width:${percent}%"></span></div>
                    <span class="gpc-progress-text">${p.completedSteps}/${p.totalSteps} · ${percent}%</span>
                </div>
                ${p.deadlineAt ? `<div class="gpc-deadline"><span>${icon("clock", 14)} 截止时间: ${new Date(p.deadlineAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>` : ""}
            </div>
            <div class="gpc-body">
                <div class="gpc-step-indicators">${allSteps
                    .map((s, i) => {
                        const sp = stepMap[s.id];
                        const isDone = sp && sp.status === "completed";
                        const isCurrent = i + 1 === p.currentStep;
                        let cls = "gpc-step-dot";
                        if (isDone) cls += " done";
                        if (isCurrent) cls += " current";
                        return `<div class="${cls}" title="${escapeHtml(s.title)}">${isDone ? icon("check", 14) : i + 1}</div>`;
                    })
                    .join('<span class="gpc-step-line"></span>')}</div>
                ${
                    step
                        ? `<div class="gpc-current-step">
                    <div class="gpc-step-header">
                        <span class="pill pill-step">${icon(typeIcons[step.type] || "book", 14)} ${typeLabels[step.type] || "阅读"} · 第 ${p.currentStep}/${p.totalSteps} 步</span>
                        ${step.resource_id ? `<span class="pill pill-resource">${step.resource_type === "exam" ? "📝 试卷" : step.resource_type === "question" ? "💻 题目" : "📚 资源"}</span>` : ""}
                        <h3>${escapeHtml(step.title)}</h3>
                    </div>
                    <div class="gpc-step-content">
                        ${step.type === "text" || step.type === "video" ? renderMarkdownLite((step.content || "").length > 300 ? step.content.slice(0, 300) + "..." : step.content) : ""}
                        ${
                            step.type === "quiz"
                                ? `
                            <div class="plc-quiz-block">
                                <p class="quiz-question">📝 ${escapeHtml(step.content)}</p>
                                ${step.options_json ? `<div class="quiz-options">${(typeof step.options_json === "string" ? JSON.parse(step.options_json) : step.options_json).map((opt, i) => `<label class="quiz-opt" data-quiz-opt="${i}"><input type="radio" name="path-quiz" value="${escapeHtml(opt)}"> ${escapeHtml(opt)}</label>`).join("")}</div>` : ""}
                            </div>
                        `
                                : ""
                        }
                        ${
                            step.type === "code"
                                ? `
                            <div class="plc-code-block">
                                <pre class="code-block">${escapeHtml(step.content)}</pre>
                                <div class="plc-code-area"><textarea class="input" data-path-code-answer placeholder="在这里编写你的代码..."></textarea></div>
                            </div>
                        `
                                : ""
                        }
                        ${
                            step.type === "exercise"
                                ? `
                            <div class="plc-exercise-block">
                                ${renderMarkdownLite((step.content || "").length > 300 ? step.content.slice(0, 300) + "..." : step.content)}
                                <div class="plc-exercise-area"><textarea class="input" data-path-exercise-answer placeholder="请输入你的答案..."></textarea></div>
                            </div>
                        `
                                : ""
                        }
                    </div>
                    <div class="gpc-step-action">
                        ${
                            step.type === "quiz" || step.type === "code" || step.type === "exercise"
                                ? `<button class="btn primary glow btn-submit-step" data-path-submit-answer data-assignment-id="${p.assignmentId}" data-step-id="${step.id}" data-step-type="${step.type}">${icon("check", 17)} 提交答案</button>`
                                : `<button class="btn primary glow btn-next-step" data-path-complete data-assignment-id="${p.assignmentId}" data-step-id="${step.id}" data-step-type="${step.type}">${icon("arrow-right", 17)} ${isLastStep ? "✨ 完成最后一步，解锁全部功能" : "标记完成，进入下一步"}</button>`
                        }
                    </div>
                </div>`
                        : `
                <div class="gpc-all-done">
                    <div class="plc-complete-icon">${icon("check", 48)}</div>
                    <h2>🎉 恭喜完成全部学习路径！</h2>
                    <p>你已按老师要求完成「${escapeHtml(p.pathName)}」，所有功能已解锁。</p>
                    <button class="btn primary glow" data-view="home">${icon("home", 17)} 返回首页</button>
                </div>`
                }
            </div>
        </section>`;
    }

    function studentPathView() {
        const p = state.data.studentActivePath;
        if (!p || !p.active) return "";
        const percent = Math.round((p.completedSteps / p.totalSteps) * 100);
        const step = p.currentStepData;
        const allSteps = p.allSteps || [];
        const stepProgress = p.stepProgress || [];
        const stepMap = {};
        if (stepProgress)
            stepProgress.forEach(sp => {
                stepMap[sp.step_id] = sp;
            });
        const typeLabels = { text: "阅读", video: "视频", quiz: "测验", code: "编程", exercise: "练习" };
        const typeIcons = { text: "book", video: "play", quiz: "exam", code: "code", exercise: "pen" };
        const isLastStep = p.currentStep === p.totalSteps;
        const lockBg = {
            background: "linear-gradient(135deg, #0d1117 0%, #0a0e27 50%, #0d1117 100%)",
            minHeight: "100vh"
        };
        return `<main class="page path-lock-page" style="${Object.entries(lockBg)
            .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
            .join(";")}">
            <div class="path-lock-watermark">LOCKED</div>
            <section class="path-lock-banner">
                <div class="plb-icon">${icon("lock", 36)}</div>
                <div>
                    <h1>🔒 锁定学习模式</h1>
                    <p>教师已为你指定了学习路径 <b>「${escapeHtml(p.pathName)}」</b>，你暂时无法进行其他操作。</p>
                    <p class="plb-hint">⏳ 请按顺序完成所有 <b>${p.totalSteps}</b> 个步骤后自动解锁，当前第 <b>${p.currentStep}</b> 步</p>
                </div>
            </section>
            <section class="path-lock-progress-bar">
                <div class="plp-track"><span style="width:${percent}%"></span></div>
                <div class="plp-info">
                    <span>${p.completedSteps} / ${p.totalSteps} 已完成</span>
                    <b>${percent}%</b>
                </div>
            </section>
            <section class="path-lock-grid">
                <aside class="path-lock-sidebar">
                    <div class="card path-lock-steps-card">
                        <div class="card-head">
                            <h3>${icon("route", 16)} 学习路径</h3>
                            <small>${escapeHtml(p.subject)}</small>
                        </div>
                        <div class="path-sidebar-steps">${allSteps
                            .map((s, i) => {
                                const sp = stepMap[s.id];
                                const isCurrent = i + 1 === p.currentStep;
                                const isDone = sp && sp.status === "completed";
                                let cls = "pss-item";
                                if (isDone) cls += " done";
                                if (isCurrent) cls += " current";
                                return `<div class="${cls}">
                                <div class="pss-dot">${isDone ? icon("check", 12) : i + 1}</div>
                                <div class="pss-info">
                                    <b>${escapeHtml(s.title)}</b>
                                    <small>${typeLabels[s.type] || "文本"} · ${s.duration_minutes || 10}分钟</small>
                                </div>
                                ${isCurrent ? '<span class="pss-tag">当前</span>' : ""}
                                ${isDone ? '<span class="pss-tag done-tag">✓</span>' : ""}
                            </div>`;
                            })
                            .join("")}</div>
                    </div>
                </aside>
                <article class="card path-lock-content">
                    ${
                        step
                            ? `
                        <div class="plc-header">
                            <div class="plc-badge-row">
                                <span class="pill pill-step">${icon(typeIcons[step.type] || "book", 14)} ${typeLabels[step.type] || "阅读"}</span>
                                <span class="pill pill-num">第 ${p.currentStep} / ${p.totalSteps} 步</span>
                                ${step.resource_id ? `<span class="pill pill-resource">${step.resource_type === "exam" ? "📝 试卷" : step.resource_type === "question" ? "💻 题目" : "📚 资源"}</span>` : ""}
                            </div>
                            <h2>${escapeHtml(step.title)}</h2>
                            <small>⏱ 预计 ${step.duration_minutes || 10} 分钟${p.deadlineAt ? ` · ⏰ 截止: ${new Date(p.deadlineAt).toLocaleDateString("zh-CN")}` : ""}</small>
                        </div>
                        <div class="plc-body">
                            ${step.type === "text" || step.type === "video" ? renderMarkdownLite(step.content || "") : ""}
                            ${
                                step.type === "quiz"
                                    ? `
                                <div class="plc-quiz-block">
                                    <p class="quiz-question">📝 ${escapeHtml(step.content)}</p>
                                    ${step.options_json ? `<div class="quiz-options">${(typeof step.options_json === "string" ? JSON.parse(step.options_json) : step.options_json).map((opt, i) => `<label class="quiz-opt" data-quiz-opt="${i}"><input type="radio" name="path-quiz" value="${escapeHtml(opt)}"> ${escapeHtml(opt)}</label>`).join("")}</div>` : ""}
                                </div>
                            `
                                    : ""
                            }
                            ${
                                step.type === "code"
                                    ? `
                                <div class="plc-code-block">
                                    <pre class="code-block">${escapeHtml(step.content)}</pre>
                                    <div class="plc-code-area"><textarea class="input" data-path-code-answer placeholder="在这里编写你的代码..."></textarea></div>
                                </div>
                            `
                                    : ""
                            }
                            ${
                                step.type === "exercise"
                                    ? `
                                <div class="plc-exercise-block">
                                    ${renderMarkdownLite(step.content || "")}
                                    <div class="plc-exercise-area"><textarea class="input" data-path-exercise-answer placeholder="请输入你的答案..."></textarea></div>
                                </div>
                            `
                                    : ""
                            }
                        </div>
                        <div class="plc-footer">
                            ${
                                step.type === "quiz" || step.type === "code" || step.type === "exercise"
                                    ? `<button class="btn primary glow btn-submit-step" data-path-submit-answer data-assignment-id="${p.assignmentId}" data-step-id="${step.id}" data-step-type="${step.type}">${icon("check", 17)} 提交答案</button>`
                                    : `<button class="btn primary glow btn-next-step" data-path-complete data-assignment-id="${p.assignmentId}" data-step-id="${step.id}" data-step-type="${step.type}">${icon("arrow-right", 17)} ${isLastStep ? "完成最后一步，解锁全部功能" : "标记完成，进入下一步"}</button>`
                            }
                            <div class="plc-lock-notice">🔒 完成本步骤前，无法访问其他页面</div>
                        </div>
                        <div class="plc-notes-section">
                            <h4>${icon("pen", 16)} 我的笔记</h4>
                            <textarea class="input plc-notes-input" data-path-notes placeholder="记录你的学习心得...">${escapeHtml((state.data._pathNotes && state.data._pathNotes[step.id]) || "")}</textarea>
                            <button class="btn tiny primary" data-path-save-note data-assignment-id="${p.assignmentId}" data-step-id="${step.id}">${icon("check", 14)} 保存笔记</button>
                            ${
                                state.data._pathAllNotes && state.data._pathAllNotes.length
                                    ? `
                            <div class="plc-notes-list">
                                ${state.data._pathAllNotes
                                    .map(
                                        n => `
                                <div class="plc-note-item">
                                    <div class="plc-note-head"><b>${escapeHtml(n.title)}</b><small>${n.completed_at ? new Date(n.completed_at).toLocaleString("zh-CN") : ""}</small></div>
                                    <p>${escapeHtml(n.notes).replace(/\n/g, "<br>")}</p>
                                </div>`
                                    )
                                    .join("")}
                            </div>`
                                    : ""
                            }
                        </div>
                    `
                            : `
                        <div class="path-lock-complete">
                            <div class="plc-complete-icon">${icon("check", 48)}</div>
                            <h2>🎉 恭喜完成全部学习路径！</h2>
                            <p>你已按老师要求完成「${escapeHtml(p.pathName)}」，所有功能已解锁。</p>
                            <button class="btn primary glow" data-view="home">${icon("home", 17)} 返回首页</button>
                        </div>`
                    }
                </article>
            </section>
        </main>`;
    }

    function studentPathDashboardView() {
        const dashboard = state.data.studentPathDashboard || { active: [], completed: [], upcoming: [] };
        const now = new Date();
        return `<main class="page">
            <section class="path-dashboard">
                <header class="pd-header">
                    <h1>${icon("route", 24)} 我的学习路径</h1>
                    <p>查看老师为你指定的学习任务和学习进度</p>
                </header>
                <div class="pd-section">
                    <h2 class="pd-section-title">${icon("play", 18)} 进行中 <span class="pill">${dashboard.active.length}个</span></h2>
                    ${
                        dashboard.active.length === 0
                            ? `<div class="pd-empty">暂无进行中的学习路径</div>`
                            : dashboard.active
                                  .map(a => {
                                      const percent = Math.round((a.completed_steps / a.total_steps) * 100);
                                      return `<div class="pd-card pd-card-active">
                            <div class="pd-card-header">
                                <span class="pd-card-icon">${icon("lock", 20)}</span>
                                <div class="pd-card-info">
                                    <h3>${escapeHtml(a.name)}</h3>
                                    <small>${escapeHtml(a.subject)} · ${a.total_steps}个步骤</small>
                                </div>
                            </div>
                            <div class="pd-card-progress">
                                <div class="pd-progress-bar"><span style="width:${percent}%"></span></div>
                                <span class="pd-progress-text">${a.completed_steps}/${a.total_steps} · ${percent}%</span>
                            </div>
                            <div class="pd-card-meta">
                                <span>${icon("clock", 14)} 开始: ${new Date(a.started_at).toLocaleDateString("zh-CN")}</span>
                            </div>
                            <div class="pd-card-actions">
                                <button class="btn primary glow" data-view="home">${icon("arrow-right", 16)} 继续学习 →</button>
                            </div>
                        </div>`;
                                  })
                                  .join("")
                    }
                </div>
                <div class="pd-section">
                    <h2 class="pd-section-title">${icon("check", 18)} 已完成 <span class="pill">${dashboard.completed.length}个</span></h2>
                    ${
                        dashboard.completed.length === 0
                            ? `<div class="pd-empty">暂无已完成的路径</div>`
                            : `<div class="pd-card-grid">${dashboard.completed
                                  .map(a => {
                                      const score = a.score ? Math.round(a.score) : null;
                                      return `<div class="pd-card pd-card-completed">
                            <div class="pd-card-header">
                                <span class="pd-card-icon done">${icon("check", 20)}</span>
                                <div class="pd-card-info">
                                    <h3>${escapeHtml(a.name)}</h3>
                                    <small>${escapeHtml(a.subject)} · ${a.total_steps}步</small>
                                </div>
                            </div>
                            <div class="pd-card-meta">
                                <span>${icon("calendar", 14)} 完成于 ${new Date(a.completed_at).toLocaleDateString("zh-CN")}</span>
                                ${score !== null ? `<span class="pd-score">${icon("chart", 14)} 得分: ${score}%</span>` : ""}
                            </div>
                        </div>`;
                                  })
                                  .join("")}</div>`
                    }
                </div>
                <div class="pd-section">
                    <h2 class="pd-section-title">${icon("clock", 18)} 即将开始 <span class="pill ghost">${dashboard.upcoming.length}个</span></h2>
                    ${
                        dashboard.upcoming.length === 0
                            ? `<div class="pd-empty">暂无即将开始的路径</div>`
                            : dashboard.upcoming
                                  .map(
                                      u => `<div class="pd-card pd-card-upcoming">
                        <div class="pd-card-header">
                            <span class="pd-card-icon upcoming">${icon("calendar", 20)}</span>
                            <div class="pd-card-info"><h3>${escapeHtml(u.name)}</h3><small>${escapeHtml(u.subject)}</small></div>
                        </div>
                    </div>`
                                  )
                                  .join("")
                    }
                </div>
                <div class="pd-section">
                    <h2 class="pd-section-title">${icon("calendar", 18)} 学习日历</h2>
                    ${renderPathCalendar(dashboard)}
                </div>
            </section>
        </main>`;
    }

    function renderPathCalendar(dashboard) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        const dateMap = {};
        (dashboard.active || []).forEach(a => {
            if (a.started_at) {
                const d = new Date(a.started_at).toISOString().slice(0, 10);
                dateMap[d] = dateMap[d] || [];
                dateMap[d].push({ type: "start", name: a.name });
            }
        });
        (dashboard.completed || []).forEach(a => {
            if (a.completed_at) {
                const d = new Date(a.completed_at).toISOString().slice(0, 10);
                dateMap[d] = dateMap[d] || [];
                dateMap[d].push({ type: "complete", name: a.name });
            }
        });
        const today = now.toISOString().slice(0, 10);
        const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
        const cells = [];
        for (let i = 0; i < adjustedFirstDay; i++) cells.push('<div class="pd-cal-cell empty"></div>');
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = dateMap[dateStr] || [];
            const isToday = dateStr === today;
            const markers = events
                .map(e => `<span class="pd-cal-dot ${e.type}" title="${escapeHtml(e.name)}"></span>`)
                .join("");
            cells.push(`<div class="pd-cal-cell${isToday ? " today" : ""}${events.length ? " has-event" : ""}">
                <span class="pd-cal-day">${day}</span>
                <div class="pd-cal-markers">${markers}</div>
            </div>`);
        }
        return `<div class="pd-calendar">
            <div class="pd-cal-header">
                <span class="pd-cal-month">${year}年${month + 1}月</span>
                <span class="pd-cal-legend">
                    <span><span class="pd-cal-dot start"></span> 开始</span>
                    <span><span class="pd-cal-dot complete"></span> 完成</span>
                </span>
            </div>
            <div class="pd-cal-grid">
                ${weekDays.map(d => `<div class="pd-cal-weekday">${d}</div>`).join("")}
                ${cells.join("")}
            </div>
        </div>`;
    }

    function studentPathCompactPanel(context = "home") {
        const dashboard = state.data.studentPathDashboard || { active: [], completed: [], upcoming: [] };
        const active = dashboard.active || [];
        const completed = dashboard.completed || [];
        const upcoming = dashboard.upcoming || [];
        if (!active.length && !completed.length && !upcoming.length) return "";
        const activeCards = active
            .slice(0, 2)
            .map(a => {
                const percent = Math.round(((a.completed_steps || 0) / Math.max(a.total_steps || 1, 1)) * 100);
                return `<article class="path-compact-card active">
                <div><span class="pill">老师指定</span><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.subject)} · ${a.completed_steps || 0}/${a.total_steps || 0} 步</p></div>
                <div class="bar"><span style="width:${percent}%"></span></div>
                <button class="btn tiny primary" data-view="home">${icon("play", 13)}继续</button>
            </article>`;
            })
            .join("");
        const recentDone = completed
            .slice(0, 2)
            .map(
                a => `<div class="path-mini-row">
            <span>${icon("check", 14)}${escapeHtml(a.name)}</span><small>${escapeHtml(a.subject || "综合")} · 已完成</small>
        </div>`
            )
            .join("");
        const upcomingRows = upcoming
            .slice(0, 2)
            .map(
                a => `<div class="path-mini-row">
            <span>${icon("clock", 14)}${escapeHtml(a.name)}</span><small>${escapeHtml(a.subject || "综合")} · 即将开始</small>
        </div>`
            )
            .join("");
        return `<section class="path-compact-panel ${context}">
            <div class="path-compact-head">
                <div><span class="pill">学习路径</span><h2>老师布置的路径已并入学习任务</h2><p>这里集中展示进行中、已完成和即将开始的路径，不再单独占用一个空页面。</p></div>
                <button class="btn ghost" data-view="path">${icon("route", 16)}查看个性化路径</button>
            </div>
            <div class="path-compact-grid">
                ${activeCards || `<article class="path-compact-card"><h3>暂无进行中的老师路径</h3><p>可以先按个性化路径完成课程、练习和复习。</p><button class="btn tiny ghost" data-view="path">查看推荐路径</button></article>`}
                <article class="path-compact-list"><h3>${icon("check", 15)}最近完成</h3>${recentDone || "<p>暂无完成记录</p>"}</article>
                <article class="path-compact-list"><h3>${icon("clock", 15)}即将开始</h3>${upcomingRows || "<p>暂无待开始路径</p>"}</article>
            </div>
        </section>`;
    }

    function teacherPathTargetView(step = {}) {
        if (step.resource_type === "question" || step.type === "quiz" || step.type === "exercise") return "practice";
        if (step.type === "code") return "codeLab";
        if (step.type === "video") return "videos";
        if (step.resource_type === "resource" || step.type === "text") return "resources";
        return "home";
    }

    function teacherPathActionText(view) {
        const map = {
            practice: "去练习中完成",
            codeLab: "去编程舱完成",
            videos: "去视频页学习",
            resources: "去资源页阅读",
            smartNotes: "去笔记页整理",
            home: "回到首页查看"
        };
        return map[view] || "前往对应页面";
    }

    function parsePathOptions(options) {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        try {
            return JSON.parse(options);
        } catch {
            return [];
        }
    }

    function teacherPathInlineGuide(context = state.view) {
        const p = state.data.studentActivePath;
        if (!p || !p.active) return "";
        const step = p.currentStepData || {};
        const percent = p.totalSteps ? Math.round((p.completedSteps / p.totalSteps) * 100) : 0;
        const targetView = teacherPathTargetView(step);
        const matched =
            context === targetView ||
            (targetView === "practice" && ["practice", "test", "onlineExam"].includes(context));
        const typeLabels = { text: "阅读", video: "视频", quiz: "测验", code: "编程", exercise: "练习" };
        const answerBox =
            matched && step.type === "quiz"
                ? `<div class="tpg-answer-row">${parsePathOptions(step.options_json)
                      .map(
                          (opt, index) =>
                              `<label><input type="radio" name="path-quiz" value="${escapeHtml(opt)}"> ${escapeHtml(opt)}</label>`
                      )
                      .join("")}</div>`
                : matched && step.type === "code"
                  ? `<textarea class="input tpg-answer-box" data-path-code-answer placeholder="在当前页面完成代码后，把关键代码或说明粘贴到这里提交。"></textarea>`
                  : matched && step.type === "exercise"
                    ? `<textarea class="input tpg-answer-box" data-path-exercise-answer placeholder="把本页练习结果或答案写在这里提交。"></textarea>`
                    : "";
        const action = matched
            ? ["quiz", "code", "exercise"].includes(step.type)
                ? `<button class="btn primary tiny" data-path-submit-answer data-assignment-id="${p.assignmentId}" data-step-id="${step.id}" data-step-type="${step.type}">${icon("check", 14)}提交本步</button>`
                : `<button class="btn primary tiny" data-path-complete data-assignment-id="${p.assignmentId}" data-step-id="${step.id}" data-step-type="${step.type}">${icon("check", 14)}标记完成</button>`
            : `<button class="btn primary tiny" data-view="${targetView}">${icon("arrow-right", 14)}${teacherPathActionText(targetView)}</button>`;
        return `<section class="teacher-path-guide ${matched ? "matched" : ""}">
            <div class="tpg-main">
                <span class="tpg-badge">${icon("route", 14)}老师路径</span>
                <div>
                    <b>${escapeHtml(step.title || p.pathName || "继续老师布置的学习任务")}</b>
                    <small>${escapeHtml(p.pathName || "")} · ${typeLabels[step.type] || "任务"} · 第 ${p.currentStep}/${p.totalSteps} 步</small>
                </div>
            </div>
            <div class="tpg-progress"><span style="width:${percent}%"></span></div>
            <div class="tpg-actions">
                <small>${percent}%</small>
                ${action}
            </div>
            ${answerBox}
        </section>`;
    }

    function roleCockpit() {
        return `<section class="role-cockpit">
            <article class="role-card student">
                <div><span class="pill">学生视角</span><h2>今日学习闭环</h2><p>从薄弱点进入课程、练习、测试、笔记和复习，每一步都会回写画像。</p></div>
                <div class="role-actions"><button class="btn primary" data-view="practice">${icon("list", 17)}开始练习</button><button class="btn ghost" data-view="smartNotes">${icon("pen", 17)}写智能笔记</button></div>
            </article>
            <article class="role-card teacher">
                <div><span class="pill">教师视角</span><h2>班级学情干预</h2><p>查看分科学情、定位薄弱知识点，并把任务推送回学生端。</p></div>
                <div class="role-actions"><button class="btn teal" data-view="teacherWorkbench">${icon("chart", 17)}进入教师工作台</button><button class="btn ghost" data-teacher-action="ai-analysis">${icon("robot", 17)}生成学情分析</button></div>
            </article>
        </section>`;
    }

    function majorTracks() {
        return [
            {
                key: "backend",
                icon: "db",
                title: "服务逻辑方向",
                fit: 92,
                stack: "Java / Node.js / MySQL / Redis",
                goal: "学会把项目需求拆成清晰的数据处理和业务规则",
                subjects: ["数据结构与算法", "数据库系统", "计算机网络", "操作系统"]
            },
            {
                key: "ai",
                icon: "brain",
                title: "AI算法",
                fit: 86,
                stack: "Python / 机器学习 / 向量检索 / RAG",
                goal: "构建机器学习与智能应用能力",
                subjects: ["概率统计", "线性代数", "机器学习", "算法设计"]
            },
            {
                key: "frontend",
                icon: "layers",
                title: "前端体验",
                fit: 81,
                stack: "HTML / CSS / JavaScript / 可视化",
                goal: "做出高质量交互体验与学习产品界面",
                subjects: ["Web工程", "数据可视化", "交互设计", "软件工程"]
            },
            {
                key: "security",
                icon: "lock",
                title: "网络安全",
                fit: 74,
                stack: "网络协议 / Linux / 安全攻防 / 密码学",
                goal: "建立安全工程和攻防分析基础",
                subjects: ["计算机网络", "操作系统", "密码学", "安全工程"]
            }
        ];
    }

    function profileInputPanel() {
        const diagnostic = state.data.diagnosticResult;
        const analysis = state.data.profileAnalysis;
        if (diagnostic || analysis) {
            const persona = diagnostic?.analysis?.persona || analysis?.type || "稳步成长型";
            const score = diagnostic?.analysis?.masteryEstimate || analysis?.score || 78;
            const strengths = diagnostic?.analysis?.strengths || ["目标清晰"];
            const recs = diagnostic?.recommendations || {};
            return `<section class="profile-intake">
                <article class="card profile-diagnostic-summary">
                    <div class="card-head"><div><span class="pill good">已诊断</span><h2>${icon("target", 18)}学习画像摘要</h2><p>来自<a data-view="diagnostic" style="color:var(--blue);cursor:pointer;text-decoration:underline;">智能诊断</a> — 点击查看完整报告</p></div></div>
                    <div class="profile-diagnostic-body">
                        <div class="portrait-score"><b>${score}</b><span>${escapeHtml(persona)}</span></div>
                        <div class="edge-cloud">${strengths
                            .slice(0, 4)
                            .map(s => `<span>${escapeHtml(s)} <b>优势方向</b></span>`)
                            .join("")}</div>
                        <p class="coach-copy">${escapeHtml(recs.weeklyPlan || "已生成个性化学习推荐，前往完整诊断页面查看。")}</p>
                    </div>
                </article>
            </section>`;
        }
        return `<section class="profile-intake">
            <article class="card intake-card diagnostic-gateway">
                <div class="card-head"><div><span class="pill">智能诊断</span><h2>${icon("brain", 20)} 了解你的学习画像</h2><p>通过文本描述或问卷诊断，系统会分析你的学习风格、能力水平和目标，生成个性化画像与学习路径。</p></div></div>
                <button class="btn primary glow large" data-view="diagnostic" style="width:100%;padding:16px 0;font-size:17px;">${icon("brain", 18)} 前往智能诊断</button>
            </article>
        </section>`;
    }

    function diagnosticResultPanel(diagnostic) {
        if (!diagnostic) return "";
        const analysis = diagnostic.analysis || {};
        const recommendations = diagnostic.recommendations || {};
        const radar = diagnostic.radarData || {};
        const profile = diagnostic.profile || {};

        return `<section class="profile-intake diagnostic-result-panel">
            <article class="card diagnostic-result-card">
                <div class="card-head">
                    <div><span class="pill good">诊断完成</span><h2>${icon("target", 18)}你的学习画像</h2><p>基于${state.data.diagnosticMode === "questionnaire" ? "问卷" : "文本"}分析生成</p></div>
                    <div class="diagnostic-actions">
                        <button class="btn tiny ghost" data-diagnostic-restart>${icon("refresh", 14)}重新诊断</button>
                        <button class="btn tiny ghost" data-diagnostic-switch-mode="questionnaire">${icon("list", 14)}填写问卷</button>
                    </div>
                </div>
                <div class="diagnostic-persona-hero">
                    <div class="persona-badge large">${escapeHtml(analysis.persona || "稳步成长型")}</div>
                    <div class="persona-mastery"><b>${analysis.masteryEstimate || "--"}</b><span>综合评估</span></div>
                </div>
                <div class="diagnostic-strengths-weaknesses">
                    <div><h3>${icon("trophy", 16)}优势方向</h3><div class="tag-cloud">${(analysis.strengths || ["学习目标清晰"]).map(s => `<span class="tag good">${escapeHtml(s)}</span>`).join("")}</div></div>
                    <div><h3>${icon("alert", 16)}需要关注</h3><div class="tag-cloud">${(analysis.weaknesses || ["缺少系统练习"]).map(w => `<span class="tag warn">${escapeHtml(w)}</span>`).join("")}</div></div>
                </div>
            </article>
            <article class="card diagnostic-path-card">
                <div class="card-head"><h2 class="section-title">${icon("route", 18)}推荐学习路径</h2><span class="pill">${(recommendations.subjects || []).length} 门核心课</span></div>
                <div class="path-subject-list">
                    ${(recommendations.subjects || []).map(s => `<div class="path-subject-row"><span class="subject-name">${escapeHtml(s)}</span><div class="bar"><span style="width:${70 + Math.floor(Math.random() * 30)}%"></span></div></div>`).join("")}
                </div>
                <p class="coach-copy">${escapeHtml(recommendations.weeklyPlan || "建议按路径顺序推进，每周保持稳定的学习节奏。")}</p>
                <div class="diagnostic-meta-row">
                    <div><b>${recommendations.estimatedWeeks || "--"}</b><span>预计周数</span></div>
                    <div><b>${recommendations.dailyMinutes || "--"}分钟</b><span>每日建议</span></div>
                    <div><b>${profile.learningContext?.pace || "steady"}</b><span>学习节奏</span></div>
                </div>
                <div class="hero-actions"><button class="btn primary" data-view="path">${icon("route", 17)}生成学习路径</button><button class="btn ghost" data-view="test">${icon("exam", 17)}分科校准</button></div>
            </article>
            ${analysis.insight ? `<article class="card diagnostic-insight-card"><div class="card-head"><h2 class="section-title">${icon("brain", 18)}AI 深度解读</h2></div><p>${escapeHtml(analysis.insight)}</p></article>` : ""}
        </section>`;
    }

    function diagnosticQuestionnaireView() {
        const questionnaire = state.data.diagnosticQuestionnaire;
        if (!questionnaire)
            return `<section class="diagnostic-loading"><div class="loading-spinner"></div><p>加载诊断问卷中...</p></section>`;

        const steps = questionnaire.steps || [];
        const currentStepIdx = state.data.diagnosticStep || 0;
        const totalSteps = steps.length;
        const currentStep = steps[currentStepIdx];
        if (!currentStep) {
            state.data.diagnosticStep = 0;
            return diagnosticQuestionnaireView();
        }

        const progressPercent = Math.round(((currentStepIdx + 1) / totalSteps) * 100);
        const answers = state.data.diagnosticAnswers || {};
        const isLoading = state.data.diagnosticLoading;

        const questionHtml = (currentStep.questions || [])
            .map(q => {
                const currentAnswer = answers[q.id];
                let inputHtml = "";
                switch (q.type) {
                    case "single_choice":
                        inputHtml = `<div class="diagnostic-options">${(q.options || [])
                            .map(
                                opt => `
                        <label class="diagnostic-option${currentAnswer === opt.value ? " selected" : ""}">
                            <input type="radio" name="${q.id}" value="${opt.value}" data-diagnostic-answer="${q.id}" ${currentAnswer === opt.value ? "checked" : ""}>
                            <span>${escapeHtml(opt.label)}</span>
                        </label>`
                            )
                            .join("")}</div>`;
                        break;
                    case "multi_choice":
                        inputHtml = `<div class="diagnostic-options multi">${(q.options || [])
                            .map(opt => {
                                const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.value);
                                return `<label class="diagnostic-option${selected ? " selected" : ""}">
                            <input type="checkbox" name="${q.id}" value="${opt.value}" data-diagnostic-answer="${q.id}" ${selected ? "checked" : ""}>
                            <span>${escapeHtml(opt.label)}</span>
                        </label>`;
                            })
                            .join("")}</div>`;
                        break;
                    case "scale":
                        const scaleVal = currentAnswer || q.default || 3;
                        inputHtml = `<div class="diagnostic-scale"><input type="range" min="${q.min || 1}" max="${q.max || 5}" value="${scaleVal}" data-diagnostic-answer="${q.id}"><div class="scale-labels"><span>${escapeHtml(q.minLabel || "低")}</span><span class="scale-value">${scaleVal}</span><span>${escapeHtml(q.maxLabel || "高")}</span></div></div>`;
                        break;
                    default:
                        inputHtml = `<input type="text" class="input" placeholder="${escapeHtml(q.placeholder || "请输入...")}" value="${escapeHtml(String(currentAnswer || ""))}" data-diagnostic-answer="${q.id}">`;
                }
                return `<div class="diagnostic-question-card">
                <div class="question-label">${escapeHtml(q.label)}</div>
                ${q.description ? `<p class="question-desc">${escapeHtml(q.description)}</p>` : ""}
                ${inputHtml}
            </div>`;
            })
            .join("");

        return `<section class="diagnostic-wizard">
            <article class="card diagnostic-wizard-card">
                <div class="wizard-header">
                    <div class="wizard-progress-info">
                        <span class="pill">步骤 ${currentStepIdx + 1} / ${totalSteps}</span>
                        <h2>${escapeHtml(currentStep.title)}</h2>
                        <p>${escapeHtml(currentStep.description || "")}</p>
                    </div>
                    <button class="btn tiny ghost" data-diagnostic-switch-mode="text">${icon("pen", 14)}切换文本诊断</button>
                </div>
                <div class="wizard-progress-bar">
                    <div class="wizard-progress-fill" style="width:${progressPercent}%"></div>
                    <div class="wizard-steps">
                        ${steps.map((s, i) => `<span class="wizard-dot${i <= currentStepIdx ? " active" : ""}${i < currentStepIdx ? " done" : ""}" title="${escapeHtml(s.title)}">${i < currentStepIdx ? "✓" : i + 1}</span>`).join("")}
                    </div>
                </div>
                <div class="wizard-questions">${questionHtml}</div>
                <div class="wizard-actions">
                    ${currentStepIdx > 0 ? `<button class="btn ghost" data-diagnostic-step-prev>${icon("chevron", 16)} 上一步</button>` : `<span></span>`}
                    ${
                        currentStepIdx < totalSteps - 1
                            ? `<button class="btn primary" data-diagnostic-step-next>下一步 ${icon("chevron", 16)}</button>`
                            : `<button class="btn primary glow" data-diagnostic-submit ${isLoading ? "disabled" : ""}>${isLoading ? "提交中..." : icon("check", 16) + " 提交诊断"}</button>`
                    }
                </div>
            </article>
        </section>`;
    }

    function diagnosticView() {
        const diagnostic = state.data.diagnosticResult;
        const isLoading = state.data.diagnosticLoading;

        const subjectResult = state.data.diagnosticSubjectResult;

        if (isLoading || state.data.diagnosticSubjectLoading) return diagnosticLoadingView();

        if (subjectResult) return diagnosticSubjectResultView(subjectResult);

        if (diagnostic) return diagnosticCompleteView(diagnostic);

        if (state.data.diagnosticMode === "subject") {
            if (state.data.diagnosticSubjectTest) return diagnosticSubjectTestView();
            return diagnosticSubjectSelectView();
        }

        if (state.data.diagnosticMode === "questionnaire") {
            return diagnosticQuestionnaireView();
        }

        if (state.data.diagnosticMode === "text") {
            return diagnosticTextView();
        }

        return diagnosticWelcomeView();
    }

    function diagnosticWelcomeView() {
        const activeTab = state.data.diagnosticTab || "welcome";
        return `<main class="page diagnostic-page">
            <header class="diagnostic-hero">
                <div class="diagnostic-hero-icon">${icon("brain", 48)}</div>
                <h1>智能诊断</h1>
                <p class="diagnostic-subtitle">新同学你好！平台会根据你的情况生成一份专属学习画像，帮你找到最适合的学习路径。</p>
            </header>
            <section class="diagnostic-tabs">
                <button class="diagnostic-tab ${activeTab === "welcome" ? "active" : ""}" data-diagnostic-tab="welcome">
                    ${icon("home", 16)} 诊断选择
                </button>
                <button class="diagnostic-tab ${activeTab === "cat" ? "active" : ""}" data-diagnostic-tab="cat">
                    ${icon("target", 16)} CAT测试
                </button>
                <button class="diagnostic-tab ${activeTab === "vark" ? "active" : ""}" data-diagnostic-tab="vark">
                    ${icon("radar", 16)} VARK测评
                </button>
                <button class="diagnostic-tab ${activeTab === "report" ? "active" : ""}" data-diagnostic-tab="report">
                    ${icon("chart", 16)} 诊断报告
                </button>
            </section>
            <section class="diagnostic-tab-content">
                ${activeTab === "welcome" ? diagnosticWelcomeTab() : ""}
                ${activeTab === "cat" ? diagnosticCatTab() : ""}
                ${activeTab === "vark" ? diagnosticVarkTab() : ""}
                ${activeTab === "report" ? diagnosticReportTab() : ""}
            </section>
        </main>`;
    }

    function diagnosticWelcomeTab() {
        return `<section class="diagnostic-mode-cards">
            <article class="card diagnostic-mode-card quick" data-diagnostic-start="text">
                <div class="mode-icon">${icon("pen", 28)}</div>
                <h2>快速文本诊断</h2>
                <p>用一段话告诉我你的专业、目标、薄弱点和可用时间，AI 会提取关键信息生成初步画像。</p>
                <div class="mode-meta"><span>${icon("clock", 14)}大约 1 分钟</span><span>${icon("star", 14)}自由表达</span></div>
                <button class="btn primary">${icon("pen", 16)} 开始文本诊断</button>
            </article>
            <article class="card diagnostic-mode-card thorough" data-diagnostic-start="questionnaire">
                <div class="mode-icon">${icon("list", 28)}</div>
                <h2>结构化问卷诊断</h2>
                <p>通过 5 步问卷系统评估你的学习风格、能力水平和学习习惯，获得更精准的画像与推荐。</p>
                <div class="mode-meta"><span>${icon("clock", 14)}大约 3-5 分钟</span><span>${icon("target", 14)}精准评估</span></div>
                <button class="btn teal">${icon("list", 16)} 开始问卷诊断</button>
            </article>
            <article class="card diagnostic-mode-card subject" data-diagnostic-start="subject">
                <div class="mode-icon">${icon("exam", 28)}</div>
                <h2>学科测试诊断</h2>
                <p>选择具体学科进行真实测试，系统根据答题情况精准分析各知识点的掌握程度，生成学科画像。</p>
                <div class="mode-meta"><span>${icon("clock", 14)}大约 5-10 分钟</span><span>${icon("target", 14)}精准诊断</span></div>
                <button class="btn purple">${icon("exam", 16)} 选择学科诊断</button>
            </article>
        </section>
        <section class="diagnostic-history-section">
            <h3>${icon("history", 16)} 历史诊断记录</h3>
            <div class="diagnostic-history-list" data-diagnostic-history-placeholder>
                <p class="muted">${icon("info", 14)} 完成诊断后，历史记录将显示在这里，你可以随时回顾和对比。</p>
            </div>
        </section>`;
    }

    function diagnosticCatTab() {
        const diag = state.data.smartDiagnostic || getMockSmartDiagnostic();
        const question = diag.currentQuestion;
        const isLoading = !question && diag.sessionActive;

        if (isLoading) {
            return `<section class="diagnostic-cat-tab">
                <div class="diagnostic-cat-loading">
                    <div class="loading-spinner large"></div>
                    <h2>正在加载下一题...</h2>
                    <p>系统正在根据你的答题情况选择最适合的题目</p>
                </div>
            </section>`;
        }

        if (!question) {
            return `<section class="diagnostic-cat-tab">
                <article class="card cat-intro-card">
                    <h2>${icon("info", 18)} CAT自适应测试</h2>
                    <p>系统根据你的答题表现动态调整题目难度，精准评估真实能力水平，通常只需8-15题即可完成。</p>
                    <ul>
                        <li><b>智能选题</b>：根据你的答题表现动态选择下一题</li>
                        <li><b>精准评估</b>：能力估计精度达到国际标准</li>
                        <li><b>高效测试</b>：通常只需8-15题即可完成</li>
                    </ul>
                    <div class="cat-stats-preview">
                        <div><b>最少8题</b><span>快速评估</span></div>
                        <div><b>最多25题</b><span>深度诊断</span></div>
                    </div>
                    <button class="btn primary" data-cat-start>${icon("play", 17)} 开始自适应测试</button>
                </article>
            </section>`;
        }

        const seColor = diag.abilitySE < 0.35 ? "green" : diag.abilitySE < 0.55 ? "yellow" : "red";
        const progressPercent = Math.round(diag.progress);
        const thetaDisplay = Math.round(diag.ability * 100) / 100;

        return `<section class="diagnostic-cat-tab">
            <div class="cat-header">
                <div class="cat-progress-bar">
                    <div class="progress-fill" style="width:${progressPercent}%"></div>
                    <span class="progress-text">${diag.questionsAnswered} 题已答</span>
                </div>
                <div class="cat-ability-gauge">
                    <div class="gauge-ring">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="6"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--indigo)" stroke-width="6" stroke-linecap="round"
                                stroke-dasharray="${(((diag.ability + 3) / 6) * 264).toFixed(1)} 264"
                                transform="rotate(-90 50 50)"/>
                        </svg>
                        <div class="gauge-inner">
                            <b>${thetaDisplay}</b>
                            <span>能力值</span>
                        </div>
                    </div>
                    <div class="gauge-info">
                        <div class="se-indicator ${seColor}">
                            <span>SE: ${diag.abilitySE.toFixed(2)}</span>
                        </div>
                        <div class="accuracy-badge">
                            ${icon("trending", 14)} ${diag.recentAccuracy}%
                        </div>
                    </div>
                </div>
            </div>
            <article class="card cat-question-card">
                <div class="question-header">
                    <span class="pill">第 ${diag.questionsAnswered + 1} 题</span>
                    <span class="pill ${question.difficulty === "hard" ? "warn" : question.difficulty === "medium" ? "info" : "good"}">
                        ${question.difficulty === "hard" ? "困难" : question.difficulty === "medium" ? "中等" : "简单"}
                    </span>
                </div>
                <div class="question-content">
                    <p>${escapeHtml(question.content)}</p>
                </div>
                ${
                    question.options
                        ? `<div class="options-list">
                    ${question.options
                        .map(
                            (opt, i) => `<label class="option-item" data-option="${i}">
                        <input type="radio" name="cat-answer" value="${i}">
                        <span class="option-label">${String.fromCharCode(65 + i)}</span>
                        <span class="option-text">${escapeHtml(opt)}</span>
                    </label>`
                        )
                        .join("")}
                </div>`
                        : ""
                }
                <div class="question-actions">
                    <button class="btn primary" data-cat-submit>${icon("send", 16)} 提交答案</button>
                    <button class="btn ghost" data-cat-skip>${icon("skip", 16)} 跳过此题</button>
                </div>
            </article>
            <article class="card cat-feedback-card">
                <h3>${icon("chart", 16)} 实时反馈</h3>
                <div class="feedback-metrics">
                    <div class="metric-item">
                        <b>${diag.recentAccuracy}%</b>
                        <span>近期正确率</span>
                    </div>
                    <div class="metric-item">
                        <b>${progressPercent}%</b>
                        <span>完成进度</span>
                    </div>
                    <div class="metric-item">
                        <b>${diag.abilitySE < 0.35 ? "高" : diag.abilitySE < 0.55 ? "中" : "低"}</b>
                        <span>评估精度</span>
                    </div>
                </div>
            </article>
        </section>`;
    }

    function diagnosticVarkTab() {
        const questionnaire = state.data.varkQuestionnaire || getMockVarkQuestionnaire();
        const activeSection = state.data.varkSection || 0;
        const answers = state.data.varkAnswers || {};

        return `<section class="diagnostic-vark-tab">
            <header class="diagnostic-hero compact">
                <div class="diagnostic-hero-icon">${icon("radar", 36)}</div>
                <h1>VARK学习风格测评</h1>
                <p>了解你的学习风格偏好（视觉/听觉/读写/动觉），共4个部分</p>
            </header>
            <section class="vark-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${(activeSection + 1) * 25}%"></div>
                </div>
                <span>第 ${activeSection + 1}/${questionnaire.sections?.length || 4} 部分</span>
            </section>
            <article class="card vark-card">
                <div class="card-head">
                    <h2>${icon("list", 18)} ${questionnaire.sections?.[activeSection]?.title || "学习偏好调查"}</h2>
                </div>
                ${(questionnaire.sections?.[activeSection]?.questions || [])
                    .map(
                        (q, qIdx) => `<div class="vark-question">
                    <p><b>${qIdx + 1}.</b> ${q.text}</p>
                    <div class="vark-options">
                        ${(q.options || [])
                            .map((opt, optIdx) => {
                                const answerKey = `${activeSection}-${qIdx}`;
                                const isSelected = answers[answerKey] === optIdx;
                                return `<button class="btn ghost vark-option ${isSelected ? "selected" : ""}"
                                data-vark-answer="${answerKey}" data-value="${optIdx}">
                                ${opt}
                            </button>`;
                            })
                            .join("")}
                    </div>
                </div>`
                    )
                    .join("")}
                <div class="vark-actions">
                    ${activeSection > 0 ? `<button class="btn ghost" data-vark-prev>${icon("arrow-left", 16)} 上一部分</button>` : ""}
                    <button class="btn primary" data-vark-next>
                        ${activeSection === (questionnaire.sections?.length || 4) - 1 ? `${icon("check", 16)} 提交测评` : `${icon("arrow-right", 16)} 下一部分`}
                    </button>
                </div>
            </article>
        </section>`;
    }

    function diagnosticReportTab() {
        const report = state.data.smartReport || getMockSmartReport();

        if (!report) {
            return `<section class="diagnostic-report-tab">
                <div class="report-empty card">
                    <div class="empty-icon">${icon("chart", 64)}</div>
                    <h2>暂无诊断报告</h2>
                    <p>请先完成CAT自适应测试或其他诊断方式</p>
                    <button class="btn primary" data-diagnostic-tab="cat">${icon("play", 17)} 去做测试</button>
                </div>
            </section>`;
        }

        const summary = report.summary;
        const radar = report.radar;
        const misconceptions = report.misconceptions;
        const strengths = report.strengths;
        const pathSuggestion = report.pathSuggestion;

        return `<section class="diagnostic-report-tab">
            <header class="report-hero">
                <div class="report-score-card">
                    <div class="score-ring">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="10"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--indigo)" stroke-width="10" stroke-linecap="round"
                                stroke-dasharray="${(summary.overallScore || 75) * 2.64} 264"
                                transform="rotate(-90 50 50)" style="transition: stroke-dasharray 1.5s ease"/>
                        </svg>
                        <div class="score-inner">
                            <b>${summary.overallScore || 75}</b>
                            <span>综合评分</span>
                        </div>
                    </div>
                    <div class="score-info">
                        <span class="pill good">${summary.grade || "B (良好)"}</span>
                    </div>
                </div>
                <div class="report-summary">
                    <h2>智能诊断报告</h2>
                    <p>${summary.description || "这是一份综合分析报告，包含能力评估和学习建议"}</p>
                    <div class="summary-tags">
                        ${(summary.keyTakeaways || ["逻辑思维良好", "需要更多练习", "适合视觉学习"]).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
                    </div>
                </div>
            </header>
            <div class="report-grid">
                <article class="card radar-card">
                    <div class="card-head">
                        <h3>${icon("radar", 18)} 能力雷达图</h3>
                    </div>
                    <div class="radar-chart">
                        ${radarChartComponent(radar)}
                    </div>
                </article>
                <article class="card strengths-card">
                    <div class="card-head">
                        <h3>${icon("trophy", 18)} 优劣势分析</h3>
                    </div>
                    <div class="strengths-grid">
                        <div class="strengths-col">
                            <h4><span class="dot green"></span> 优势领域</h4>
                            <div class="strength-list">
                                ${(strengths.strengths || [{ item: "逻辑推理" }, { item: "概念理解" }]).map(s => `<div class="strength-item good">${icon("check", 14)} ${escapeHtml(s.item)}</div>`).join("")}
                            </div>
                        </div>
                        <div class="strengths-col">
                            <h4><span class="dot orange"></span> 待加强</h4>
                            <div class="strength-list">
                                ${(strengths.weaknesses || [{ item: "实践应用" }, { item: "记忆" }]).map(w => `<div class="strength-item warn">${icon("alert", 14)} ${escapeHtml(w.item)}</div>`).join("")}
                            </div>
                        </div>
                    </div>
                </article>
                <article class="card misconception-card">
                    <div class="card-head">
                        <h3>${icon("alert", 18)} 误区检测</h3>
                        <span class="pill danger">${misconceptions.criticalCount || 2} 严重</span>
                    </div>
                    <div class="misconception-list">
                        ${(
                            misconceptions.cards || [
                                { category: "数组操作", count: 3, suggestion: "建议多做相关练习" },
                                { category: "递归", count: 2, suggestion: "从简单例子开始理解" }
                            ]
                        )
                            .slice(0, 5)
                            .map(
                                mc => `<div class="misconception-item ${mc.severity || "moderate"}">
                            <div class="mc-header">
                                <span>${escapeHtml(mc.category)}</span>
                                <span class="mc-count">${mc.count}次错误</span>
                            </div>
                            <div class="mc-suggestion">${mc.suggestion}</div>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
                <article class="card path-card">
                    <div class="card-head">
                        <h3>${icon("route", 18)} 学习路径建议</h3>
                        <span class="pill">${pathSuggestion.totalSteps || 5} 项任务</span>
                    </div>
                    <div class="path-suggestions">
                        ${(
                            pathSuggestion.suggestions || [
                                { target: "数组基础", action: "完成10道练习题", priority: "critical" },
                                { target: "递归概念", action: "观看教学视频", priority: "high" },
                                { target: "算法实践", action: "做3道简单算法题", priority: "medium" }
                            ]
                        )
                            .map(
                                (s, i) => `<div class="path-item">
                            <span class="path-index">${i + 1}</span>
                            <div class="path-content">
                                <h4>${escapeHtml(s.target)}</h4>
                                <p>${escapeHtml(s.action)}</p>
                            </div>
                            <span class="path-priority ${s.priority}">${s.priority === "critical" ? "紧急" : s.priority === "high" ? "重要" : "一般"}</span>
                        </div>`
                            )
                            .join("")}
                    </div>
                    <button class="btn primary" data-view="profile">${icon("user", 16)} 查看完整学习画像</button>
                </article>
            </div>
        </section>`;
    }

    function diagnosticTextView() {
        const isLoading = state.data.diagnosticLoading;
        return `<main class="page diagnostic-page">
            <header class="diagnostic-hero compact">
                <div class="diagnostic-hero-icon">${icon("pen", 36)}</div>
                <h1>快速文本诊断</h1>
                <p>用一段自然语言描述你的学习状态</p>
            </header>
            <section class="diagnostic-input-section">
                <article class="card diagnostic-input-card">
                    <div class="card-head">
                        <h2>${icon("edit", 18)} 描述你的情况</h2>
                        <button class="btn tiny ghost" data-diagnostic-switch-mode="">${icon("arrow-left", 14)} 返回模式选择</button>
                    </div>
                    <div class="diagnostic-tips">
                        <span class="tip">${icon("bulb", 14)} 试试包含：专业年级 / 目标方向 / 已掌握和薄弱的技能 / 每天可投入的时间 / 期望达成的目标</span>
                    </div>
                    <textarea class="textarea diagnostic-textarea" data-profile-input placeholder='例如：我是大二计算机科学与技术专业学生，目标是从事后端开发。数据结构会写基础题，树和图还不太熟；数据库会基础SQL增删改查；计算机网络只记得七层模型的大概。每天能投入约 120 分钟，想在 2 个月内做一个完整的项目练手。'>${escapeHtml(state.data.profileInput)}</textarea>
                    <div class="hero-actions">
                        <button class="btn primary" data-profile-analyze ${isLoading ? "disabled" : ""}>${icon("brain", 17)}${isLoading ? "分析中..." : "开始智能分析"}</button>
                        <button class="btn ghost" data-diagnostic-fill-sample>${icon("pen", 15)} 填入示例</button>
                    </div>
                </article>
            </section>
        </main>`;
    }

    function diagnosticLoadingView() {
        return `<main class="page diagnostic-page">
            <section class="diagnostic-loading-hero">
                <div class="loading-spinner large"></div>
                <h2>正在记录本阶段诊断证据</h2>
                <p>系统会先保存当前阶段结果，待文本、问卷和学科测试都完成后再生成最终学习画像。</p>
                <div class="loading-steps">
                    <span class="step active">提取关键信息</span>
                    <span class="step active">保存阶段证据</span>
                    <span class="step">等待问卷校准</span>
                    <span class="step">等待学科测试</span>
                    <span class="step">生成最终画像</span>
                </div>
            </section>
        </main>`;
    }

    function diagnosticCompleteView(diagnostic) {
        const analysis = diagnostic.analysis || {};
        const recommendations = diagnostic.recommendations || {};
        const profile = diagnostic.profile || {};
        const radar = diagnostic.radarData || {};
        const mastery = analysis.masteryEstimate || 75;
        const sourceLabel = state.data.diagnosticMode === "questionnaire" ? "结构化问卷" : "自然语言描述";
        const channel = profile.cognitiveStyle?.dominantChannel || profile.cognitiveStyle?.type || "多通道";
        const dailyMinutes = recommendations.dailyMinutes || analysis.dailyMinutes || "--";
        const evidence = [
            { icon: "pen", label: sourceLabel, value: "18%", text: "提取专业、目标、薄弱点、资源偏好和可用时间。" },
            {
                icon: "target",
                label: "诊断结论",
                value: "26%",
                text: `${escapeHtml(analysis.persona || "稳步成长型")}，综合掌握估计 ${mastery}%。`
            },
            {
                icon: "brain",
                label: "认知风格",
                value: "18%",
                text: `偏好 ${escapeHtml(channel)}，路径会优先匹配对应资源。`
            },
            {
                icon: "clock",
                label: "学习节奏",
                value: "20%",
                text: `建议 ${escapeHtml(String(dailyMinutes))} 分钟/天，任务按专注时长拆分。`
            },
            { icon: "route", label: "路径反馈", value: "18%", text: "后续答题、复习和 AI 对话会继续修正画像。" }
        ];
        const dimensions = [
            { label: "概念理解", value: Math.min(96, mastery + 2), tone: "blue" },
            { label: "场景迁移", value: Math.max(42, mastery - 18), tone: "orange" },
            { label: "项目实践", value: Math.max(50, mastery - 7), tone: "green" },
            { label: "自我监控", value: Math.max(45, mastery - 12), tone: "purple" }
        ];
        const pathReasons = (recommendations.subjects || []).slice(0, 4).map((s, i) => ({
            title: s,
            reason:
                i === 0
                    ? "作为当前路径入口，优先补齐薄弱前置知识。"
                    : i === 1
                      ? "与当前目标关联高，适合用案例和练习巩固。"
                      : "用于承接后续知识点，避免学习断层。",
            progress: Math.max(48, 92 - i * 10)
        }));

        return `<main class="page diagnostic-page diagnostic-result-page ios-diagnostic-result-page">
            <section class="ios-diagnostic-hero">
                <div class="ios-hero-copy">
                    <span class="ios-eyebrow">${icon("check", 15)} 诊断完成 · ${escapeHtml(sourceLabel)}</span>
                    <h1>你的学习画像已经校准</h1>
                    <p>这份报告不再只展示柱状图，而是说明每个结论来自哪里、权重多少，以及如何影响下一步学习路径。</p>
                    <div class="persona-tags">${(analysis.strengths || ["目标清晰"])
                        .slice(0, 3)
                        .map(s => `<span class="tag good">${escapeHtml(s)}</span>`)
                        .join("")}</div>
                </div>
                <div class="ios-profile-orb diagnostic">
                    <div class="ios-orb-ring" style="--score:${mastery}">
                        <b>${mastery}</b>
                        <span>综合评估</span>
                    </div>
                    <div class="ios-orb-meta">
                        <span>${escapeHtml(analysis.persona || "稳步成长型")}</span>
                        <small>${escapeHtml(profile.basicInfo?.major || "学习者")} ${profile.basicInfo?.goal ? "· " + escapeHtml(profile.basicInfo.goal) : ""}</small>
                    </div>
                </div>
            </section>

            <section class="ios-diagnostic-metrics">
                <article class="card ios-kpi"><span>学习风格</span><b>${escapeHtml(channel)}</b><small>${escapeHtml(profile.cognitiveStyle?.category || "持续校准中")}</small></article>
                <article class="card ios-kpi"><span>每日建议</span><b>${escapeHtml(String(dailyMinutes))}分钟</b><small>${escapeHtml(analysis.paceLabel || profile.learningContext?.pace || "稳定推进")}</small></article>
                <article class="card ios-kpi good"><span>推荐周期</span><b>${escapeHtml(String(recommendations.estimatedWeeks || "--"))}</b><small>周级路径规划</small></article>
                <article class="card ios-kpi danger"><span>待关注</span><b>${(analysis.weaknesses || []).length || 2}</b><small>薄弱项进入路径</small></article>
            </section>

            <section class="ios-diagnostic-grid">
                <article class="card ios-evidence-card">
                    <div class="card-head"><h2>${icon("chart", 18)}诊断证据链</h2><span class="pill">可解释</span></div>
                    <div class="ios-evidence-list">${evidence
                        .map(
                            (item, i) => `<div class="ios-evidence-row" style="--delay:${i * 80}ms">
                        <div class="ios-evidence-icon">${icon(item.icon, 16)}</div>
                        <div><b>${escapeHtml(item.label)}</b><p>${item.text}</p></div>
                        <span>${item.value}</span>
                    </div>`
                        )
                        .join("")}</div>
                </article>
                <article class="card ios-dimension-card">
                    <div class="card-head"><h2>${icon("brain", 18)}真实学习状态</h2><span class="pill">非静态标签</span></div>
                    <div class="profile-dimension-grid">${dimensions.map((d, i) => `<div class="dimension-row ios-dimension-row ${d.tone}" style="--delay:${i * 80}ms"><span>${escapeHtml(d.label)}</span><b>${d.value}%</b><div class="bar"><span style="width:${d.value}%"></span></div></div>`).join("")}</div>
                </article>
                <article class="card ios-strength-card">
                    <div class="card-head"><h2>${icon("trophy", 18)}优势与薄弱</h2></div>
                    <div class="strengths-body">
                        <div class="strengths-col"><h3><span class="dot green"></span>优势方向</h3><div class="tag-cloud">${(analysis.strengths || []).map(s => `<span class="tag good">${escapeHtml(s)}</span>`).join("") || '<span class="muted">持续评估中</span>'}</div></div>
                        <div class="strengths-col"><h3><span class="dot orange"></span>需要关注</h3><div class="tag-cloud">${(analysis.weaknesses || []).map(w => `<span class="tag warn">${escapeHtml(w)}</span>`).join("") || '<span class="muted">持续评估中</span>'}</div></div>
                    </div>
                </article>
                ${
                    pathReasons.length
                        ? `<article class="card ios-action-card">
                    <div class="card-head"><h2>${icon("route", 18)}推荐路径依据</h2><span class="pill">${pathReasons.length} 个节点</span></div>
                    <div class="ios-path-reasons">${pathReasons.map((s, i) => `<div class="ios-path-reason" style="--delay:${i * 90}ms"><span>${i + 1}</span><div><b>${escapeHtml(s.title)}</b><p>${escapeHtml(s.reason)}</p><div class="bar"><span style="width:${s.progress}%"></span></div></div></div>`).join("")}</div>
                    <div class="hero-actions"><button class="btn primary" data-view="path">${icon("route", 17)}生成学习日程</button><button class="btn ghost" data-view="test">${icon("exam", 17)}分科校准</button></div>
                </article>`
                        : ""
                }
                ${
                    analysis.insight
                        ? `<article class="card ios-insight-card">
                    <div class="card-head"><h2>${icon("brain", 18)}AI 深度解读</h2></div>
                    <p>${escapeHtml(analysis.insight)}</p>
                </article>`
                        : ""
                }
            </section>

            <section class="diagnostic-actions-section ios-actions">
                <button class="btn ghost" data-diagnostic-restart>${icon("refresh", 16)} 重新诊断</button>
                <button class="btn ghost" data-view="profile">${icon("user", 16)} 查看完整画像</button>
                <button class="btn ghost" data-diagnostic-switch-mode="questionnaire">${icon("list", 16)} 补充问卷诊断</button>
            </section>
        </main>`;
    }

    function diagnosticCatView() {
        const diag = state.data.smartDiagnostic;
        const question = diag.currentQuestion;
        const isLoading = !question && diag.sessionActive;

        if (isLoading) {
            return `<main class="page diagnostic-page">
                <div class="diagnostic-cat-loading">
                    <div class="loading-spinner large"></div>
                    <h2>正在加载下一题...</h2>
                    <p>系统正在根据你的答题情况选择最适合的题目</p>
                </div>
            </main>`;
        }

        if (!question) {
            return `<main class="page diagnostic-page">
                <header class="diagnostic-hero">
                    <div class="diagnostic-hero-icon">${icon("target", 48)}</div>
                    <h1>CAT自适应诊断</h1>
                    <p>系统将根据你的答题情况动态调整题目难度，精准评估你的真实能力水平</p>
                </header>
                <section class="diagnostic-cat-start">
                    <article class="card cat-intro-card">
                        <h2>${icon("info", 18)} 什么是自适应测试？</h2>
                        <ul>
                            <li><b>智能选题</b>：根据你的答题表现动态选择下一题</li>
                            <li><b>精准评估</b>：能力估计精度达到国际标准(SE&lt;0.35)</li>
                            <li><b>高效测试</b>：通常只需8-15题即可完成</li>
                        </ul>
                        <div class="cat-stats-preview">
                            <div><b>最少8题</b><span>快速评估</span></div>
                            <div><b>最多25题</b><span>深度诊断</span></div>
                        </div>
                        <button class="btn primary" data-cat-start>${icon("play", 17)} 开始自适应测试</button>
                    </article>
                </section>
            </main>`;
        }

        const seColor = diag.abilitySE < 0.35 ? "green" : diag.abilitySE < 0.55 ? "yellow" : "red";
        const progressPercent = Math.round(diag.progress);
        const thetaDisplay = Math.round(diag.ability * 100) / 100;

        return `<main class="page diagnostic-page cat-test-page">
            <header class="cat-header">
                <div class="cat-progress-bar">
                    <div class="progress-fill" style="width:${progressPercent}%"></div>
                    <span class="progress-text">${diag.questionsAnswered} 题已答</span>
                </div>
                <div class="cat-ability-gauge">
                    <div class="gauge-ring">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="6"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--indigo)" stroke-width="6" stroke-linecap="round"
                                stroke-dasharray="${(((diag.ability + 3) / 6) * 264).toFixed(1)} 264"
                                transform="rotate(-90 50 50)"/>
                        </svg>
                        <div class="gauge-inner">
                            <b>${thetaDisplay}</b>
                            <span>能力值</span>
                        </div>
                    </div>
                    <div class="gauge-info">
                        <div class="se-indicator ${seColor}">
                            <span>SE: ${diag.abilitySE.toFixed(2)}</span>
                        </div>
                        <div class="accuracy-badge">
                            ${icon("trending", 14)} ${diag.recentAccuracy}%
                        </div>
                    </div>
                </div>
            </header>

            <section class="cat-question-section">
                <article class="card cat-question-card">
                    <div class="question-header">
                        <span class="pill">第 ${diag.questionsAnswered + 1} 题</span>
                        <span class="pill ${question.difficulty === "hard" ? "warn" : question.difficulty === "medium" ? "info" : "good"}">
                            ${question.difficulty === "hard" ? "困难" : question.difficulty === "medium" ? "中等" : "简单"}
                        </span>
                    </div>
                    <div class="question-content">
                        <p>${escapeHtml(question.content)}</p>
                    </div>
                    ${
                        question.options
                            ? `<div class="options-list">
                        ${question.options
                            .map(
                                (opt, i) => `<label class="option-item" data-option="${i}">
                            <input type="radio" name="answer" value="${i}">
                            <span class="option-label">${String.fromCharCode(65 + i)}</span>
                            <span class="option-text">${escapeHtml(opt)}</span>
                        </label>`
                            )
                            .join("")}
                    </div>`
                            : ""
                    }
                    ${question.type === "text" ? `<textarea class="textarea cat-text-answer" placeholder="请输入你的答案"></textarea>` : ""}
                    <div class="question-actions">
                        <button class="btn primary" data-cat-submit>${icon("send", 16)} 提交答案</button>
                        <button class="btn ghost" data-cat-skip>${icon("skip", 16)} 跳过此题</button>
                    </div>
                </article>
            </section>

            <section class="cat-feedback-section">
                <article class="card cat-feedback-card">
                    <h3>${icon("chart", 16)} 实时反馈</h3>
                    <div class="feedback-metrics">
                        <div class="metric-item">
                            <b>${diag.recentAccuracy}%</b>
                            <span>近期正确率</span>
                        </div>
                        <div class="metric-item">
                            <b>${progressPercent}%</b>
                            <span>完成进度</span>
                        </div>
                        <div class="metric-item">
                            <b>${diag.abilitySE < 0.35 ? "高" : diag.abilitySE < 0.55 ? "中" : "低"}</b>
                            <span>评估精度</span>
                        </div>
                    </div>
                </article>
            </section>
        </main>`;
    }

    function diagnosticVarkView() {
        const questionnaire = state.data.varkQuestionnaire;
        if (!questionnaire) {
            return `<main class="page diagnostic-page">
                <div class="diagnostic-vark-loading">
                    <div class="loading-spinner large"></div>
                    <h2>加载问卷中...</h2>
                </div>
            </main>`;
        }

        return `<main class="page diagnostic-page vark-page">
            <header class="diagnostic-hero compact">
                <div class="diagnostic-hero-icon">${icon("brain", 36)}</div>
                <h1>VARK学习风格测评</h1>
                <p>了解你的学习风格偏好，以便系统为你定制最优学习方案</p>
            </header>

            <section class="vark-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${state.data.diagnosticStep * 25}%"></div>
                </div>
                <span>第 ${state.data.diagnosticStep + 1}/4 部分</span>
            </section>

            ${questionnaire.sections
                .map(
                    (
                        section,
                        idx
                    ) => `<section class="vark-section" ${idx !== state.data.diagnosticStep ? "hidden" : ""}>
                <article class="card vark-card">
                    <div class="card-head">
                        <h2>${icon("list", 18)} ${section.title}</h2>
                    </div>
                    ${section.questions
                        .map(
                            (q, qIdx) => `<div class="vark-question">
                        <p>${q.text}</p>
                        <div class="vark-options">
                            ${q.options
                                .map(
                                    (
                                        opt,
                                        optIdx
                                    ) => `<button class="btn ghost vark-option" data-question="${idx}-${qIdx}" data-value="${optIdx + 1}">
                                ${opt}
                            </button>`
                                )
                                .join("")}
                        </div>
                    </div>`
                        )
                        .join("")}
                    <div class="vark-actions">
                        ${idx > 0 ? `<button class="btn ghost" data-vark-prev>${icon("arrow-left", 16)} 上一部分</button>` : ""}
                        <button class="btn primary" data-vark-next>${idx === questionnaire.sections.length - 1 ? `${icon("check", 16)} 提交测评` : `${icon("arrow-right", 16)} 下一部分`}</button>
                    </div>
                </article>
            </section>`
                )
                .join("")}
        </main>`;
    }

    function diagnosticReportView() {
        const report = state.data.smartReport;
        if (!report) {
            return `<main class="page diagnostic-page report-page">
                <div class="report-empty">
                    <div class="empty-icon">${icon("chart", 64)}</div>
                    <h2>暂无诊断报告</h2>
                    <p>请先完成CAT自适应测试或其他诊断方式</p>
                    <button class="btn primary" data-view="diagnostic/cat">${icon("play", 17)} 开始诊断</button>
                </div>
            </main>`;
        }

        const summary = report.summary;
        const radar = report.radar;
        const heatmap = report.knowledgeHeatmap;
        const bloom = report.bloomPyramid;
        const misconceptions = report.misconceptionCards;
        const strengths = report.strengthAnalysis;
        const pathSuggestion = report.learningPathSuggestion;

        return `<main class="page diagnostic-page report-page">
            <header class="report-hero">
                <div class="report-score-card">
                    <div class="score-ring">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="10"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--indigo)" stroke-width="10" stroke-linecap="round"
                                stroke-dasharray="${summary.overallScore * 2.64} 264"
                                transform="rotate(-90 50 50)" style="transition: stroke-dasharray 1.5s ease"/>
                        </svg>
                        <div class="score-inner">
                            <b>${summary.overallScore}</b>
                            <span>综合评分</span>
                        </div>
                    </div>
                    <div class="score-info">
                        <span class="pill ${summary.grade === "A (优秀)" ? "good" : summary.grade.startsWith("B") ? "info" : summary.grade.startsWith("C") ? "warn" : "danger"}">
                            ${summary.grade}
                        </span>
                    </div>
                </div>
                <div class="report-summary">
                    <h1>智能诊断报告</h1>
                    <p>${summary.description}</p>
                    <div class="summary-tags">
                        ${summary.keyTakeaways.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
                    </div>
                </div>
            </header>

            <section class="report-grid">
                <article class="card radar-card">
                    <div class="card-head">
                        <h2>${icon("radar", 18)} 八维能力雷达图</h2>
                    </div>
                    <div class="radar-chart">
                        ${radarChartComponent(radar)}
                    </div>
                </article>

                <article class="card strengths-card">
                    <div class="card-head">
                        <h2>${icon("trophy", 18)} 优劣势分析</h2>
                    </div>
                    <div class="strengths-grid">
                        <div class="strengths-col">
                            <h3><span class="dot green"></span> 优势领域</h3>
                            <div class="strength-list">
                                ${strengths.strengths.map(s => `<div class="strength-item good">${icon("check", 14)} ${escapeHtml(s.item)}</div>`).join("")}
                            </div>
                        </div>
                        <div class="strengths-col">
                            <h3><span class="dot orange"></span> 待加强</h3>
                            <div class="strength-list">
                                ${strengths.weaknesses.map(w => `<div class="strength-item warn">${icon("alert", 14)} ${escapeHtml(w.item)}</div>`).join("")}
                            </div>
                        </div>
                    </div>
                </article>

                <article class="card heatmap-card">
                    <div class="card-head">
                        <h2>${icon("layers", 18)} 知识热度图</h2>
                        <span class="pill">${heatmap.summary}</span>
                    </div>
                    <div class="heatmap-grid">
                        ${heatmap.nodes
                            .slice(0, 20)
                            .map(
                                node => `<div class="heatmap-cell" style="background-color:${node.color}" title="${escapeHtml(node.title)}: ${node.mastery}%">
                            ${escapeHtml(node.title).slice(0, 8)}
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>

                <article class="card bloom-card">
                    <div class="card-head">
                        <h2>${icon("target", 18)} Bloom认知金字塔</h2>
                        <span class="pill">${bloom.dominantLevel}</span>
                    </div>
                    <div class="bloom-pyramid">
                        ${bloomPyramidComponent(bloom)}
                    </div>
                    <p class="bloom-interpretation">${bloom.interpretation}</p>
                </article>

                <article class="card misconception-card">
                    <div class="card-head">
                        <h2>${icon("alert", 18)} 误区检测</h2>
                        <span class="pill ${misconceptions.criticalCount > 0 ? "danger" : "warn"}">${misconceptions.criticalCount} 严重</span>
                    </div>
                    <div class="misconception-list">
                        ${misconceptions.cards
                            .slice(0, 5)
                            .map(
                                mc => `<div class="misconception-item ${mc.severity}">
                            <div class="mc-header">
                                <span>${escapeHtml(mc.category)}</span>
                                <span class="mc-count">${mc.count}次</span>
                            </div>
                            <div class="mc-suggestion">${mc.suggestion}</div>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>

                <article class="card path-card">
                    <div class="card-head">
                        <h2>${icon("route", 18)} 学习路径建议</h2>
                        <span class="pill">${pathSuggestion.totalSteps} 项任务</span>
                    </div>
                    <div class="path-suggestions">
                        ${pathSuggestion.suggestions
                            .map(
                                (s, i) => `<div class="path-item">
                            <span class="path-index">${i + 1}</span>
                            <div class="path-content">
                                <h4>${escapeHtml(s.target)}</h4>
                                <p>${escapeHtml(s.action)}</p>
                            </div>
                            <span class="path-priority ${s.priority}">${s.priority === "critical" ? "紧急" : s.priority === "high" ? "重要" : "一般"}</span>
                        </div>`
                            )
                            .join("")}
                    </div>
                    <button class="btn primary" data-view="studyPlan">${icon("list", 16)} 生成学习计划</button>
                </article>
            </section>
        </main>`;
    }

    function profileCognitiveView() {
        const profile = state.data.cognitiveProfile;
        if (!profile) {
            return `<main class="page profile-page">
                <div class="profile-empty">
                    <div class="empty-icon">${icon("brain", 64)}</div>
                    <h2>暂无认知画像数据</h2>
                    <button class="btn primary" data-view="diagnostic/cat">${icon("play", 17)} 开始诊断</button>
                </div>
            </main>`;
        }

        const attrs = profile.cognitiveAttributes;
        const blooms = profile.bloomLevels;

        return `<main class="page profile-page cognitive-page">
            <header class="profile-hero">
                <h1>认知分析</h1>
                <p>深入了解你的认知能力结构和思维层次</p>
            </header>

            <section class="cognitive-grid">
                <article class="card attrs-card">
                    <div class="card-head">
                        <h2>${icon("brain", 18)} 认知属性追踪</h2>
                    </div>
                    <div class="attrs-grid">
                        ${Object.entries(attrs)
                            .map(
                                ([name, data]) => `<div class="attr-item">
                            <div class="attr-header">
                                <span>${escapeHtml(name)}</span>
                                <span class="attr-state ${data.state}">${data.state === "mastered" ? "已掌握" : data.state === "developing" ? "发展中" : data.state === "beginner" ? "初学者" : "薄弱"}</span>
                            </div>
                            <div class="attr-bar">
                                <div class="bar-fill" style="width:${data.mastery}%"></div>
                            </div>
                            <div class="attr-meta">
                                <span>掌握度: ${data.mastery}%</span>
                                <span>置信度: ${Math.round(data.confidence * 100)}%</span>
                            </div>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>

                <article class="card blooms-card">
                    <div class="card-head">
                        <h2>${icon("target", 18)} Bloom认知层次</h2>
                    </div>
                    <div class="blooms-chart">
                        ${Object.entries(blooms)
                            .map(
                                ([level, data]) => `<div class="bloom-bar-item">
                            <span class="bloom-label">${escapeHtml(level)}</span>
                            <div class="bloom-bar">
                                <div class="bar-fill" style="width:${data.mastery}%"></div>
                            </div>
                            <span class="bloom-value">${data.mastery}%</span>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
            </section>
        </main>`;
    }

    function profileKnowledgeView() {
        const mastery = state.data.knowledgeMastery;
        if (!mastery) {
            return `<main class="page profile-page">
                <div class="profile-empty">
                    <div class="empty-icon">${icon("layers", 64)}</div>
                    <h2>暂无知识追踪数据</h2>
                    <button class="btn primary" data-view="practice">${icon("exam", 17)} 开始练习</button>
                </div>
            </main>`;
        }

        const summary = mastery.summary;
        const nodes = Object.values(mastery.mastery);

        return `<main class="page profile-page knowledge-page">
            <header class="profile-hero">
                <h1>知识追踪</h1>
                <p>追踪各知识点的掌握进度和变化趋势</p>
            </header>

            <section class="knowledge-summary">
                <article class="card summary-card">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <b>${summary.total}</b>
                            <span>知识点总数</span>
                        </div>
                        <div class="summary-item good">
                            <b>${summary.mastered}</b>
                            <span>已掌握</span>
                        </div>
                        <div class="summary-item info">
                            <b>${summary.learning}</b>
                            <span>学习中</span>
                        </div>
                        <div class="summary-item warn">
                            <b>${summary.beginner}</b>
                            <span>待学习</span>
                        </div>
                    </div>
                    <div class="overall-bar">
                        <div class="bar-fill" style="width:${summary.overallMastery}%"></div>
                    </div>
                    <span class="overall-label">综合掌握度: ${summary.overallMastery}%</span>
                </article>
            </section>

            <section class="knowledge-list">
                <article class="card">
                    <div class="card-head">
                        <h2>${icon("list", 18)} 知识点列表</h2>
                    </div>
                    <div class="knowledge-table">
                        ${nodes
                            .slice(0, 20)
                            .map(
                                node => `<div class="knowledge-row">
                            <div class="knowledge-info">
                                <span class="knowledge-title">${escapeHtml(node.title)}</span>
                                <span class="knowledge-subject">${escapeHtml(node.subject)}</span>
                            </div>
                            <div class="knowledge-progress">
                                <div class="bar-fill" style="width:${Math.round(node.mastery * 100)}%"></div>
                            </div>
                            <span class="knowledge-mastery">${Math.round(node.mastery * 100)}%</span>
                            <span class="knowledge-state ${node.state}">${node.state === "mastered" ? "掌握" : node.state === "learning" ? "学习中" : "待学习"}</span>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
            </section>
        </main>`;
    }

    function profileMisconceptionsView() {
        const data = state.data.misconceptions;
        if (!data) {
            return `<main class="page profile-page">
                <div class="profile-empty">
                    <div class="empty-icon">${icon("alert", 64)}</div>
                    <h2>暂无误区数据</h2>
                    <button class="btn primary" data-view="practice">${icon("exam", 17)} 开始练习</button>
                </div>
            </main>`;
        }

        const misconceptions = data.misconceptions;

        return `<main class="page profile-page misconceptions-page">
            <header class="profile-hero">
                <h1>误区管理</h1>
                <p>识别学习中的错误模式，针对性改进</p>
            </header>

            <section class="misconception-stats">
                <article class="card">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <b>${data.totalCategories}</b>
                            <span>误区类型</span>
                        </div>
                        <div class="stat-item danger">
                            <b>${data.criticalCount}</b>
                            <span>严重误区</span>
                        </div>
                    </div>
                </article>
            </section>

            <section class="misconception-list">
                <article class="card">
                    <div class="card-head">
                        <h2>${icon("alert", 18)} 误区列表</h2>
                    </div>
                    <div class="misconception-cards">
                        ${misconceptions
                            .map(
                                mc => `<div class="misconception-card ${mc.severity}">
                            <div class="mc-header">
                                <span class="mc-category">${escapeHtml(mc.category)}</span>
                                <span class="mc-severity ${mc.severity}">${mc.severity === "critical" ? "严重" : mc.severity === "moderate" ? "中等" : "轻微"}</span>
                            </div>
                            <div class="mc-stats">
                                <span>${mc.count}次错误</span>
                                <span>${mc.percentage}%占比</span>
                            </div>
                            <div class="mc-suggestion">${mc.suggestion}</div>
                            ${
                                mc.sampleQuestions && mc.sampleQuestions.length > 0
                                    ? `<div class="mc-samples">
                                ${mc.sampleQuestions
                                    .slice(0, 2)
                                    .map(
                                        q => `<div class="mc-sample">
                                    <p>${escapeHtml(q.content)}</p>
                                    <div class="mc-answers">
                                        <span class="wrong">你的: ${escapeHtml(q.userAnswer)}</span>
                                        <span class="correct">正确: ${escapeHtml(q.correctAnswer)}</span>
                                    </div>
                                </div>`
                                    )
                                    .join("")}
                            </div>`
                                    : ""
                            }
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
            </section>
        </main>`;
    }

    function radarChartComponent(radar) {
        if (!radar || !radar.datasets) return '<div class="empty-chart">暂无数据</div>';

        const labels = radar.labels;
        const data = radar.datasets[0].data;
        const maxValue = 100;
        const centerX = 150;
        const centerY = 150;
        const radius = 120;
        const angleStep = (Math.PI * 2) / labels.length;

        let axisLines = "";
        let gridLines = "";
        let dataPoints = "";

        for (let i = 0; i < 5; i++) {
            const r = (radius * (i + 1)) / 5;
            gridLines += `<polygon points="${labels.map((_, j) => `${centerX + r * Math.cos(angleStep * j - Math.PI / 2)},${centerY + r * Math.sin(angleStep * j - Math.PI / 2)}`).join(" ")}" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="1"/>`;
        }

        for (let i = 0; i < labels.length; i++) {
            const angle = angleStep * i - Math.PI / 2;
            axisLines += `<line x1="${centerX}" y1="${centerY}" x2="${centerX + radius * Math.cos(angle)}" y2="${centerY + radius * Math.sin(angle)}" stroke="rgba(99,102,241,0.2)" stroke-width="1"/>`;
        }

        const dataPointsStr = data
            .map((value, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const r = (value / maxValue) * radius;
                return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
            })
            .join(" ");

        dataPoints = `<polygon points="${dataPointsStr}" fill="rgba(99,102,241,0.2)" stroke="var(--indigo)" stroke-width="2"/>`;

        const labelPoints = labels
            .map((label, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const r = radius + 25;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="11">${escapeHtml(label)}</text>`;
            })
            .join("");

        return `<svg viewBox="0 0 300 300" class="radar-svg">
            ${gridLines}
            ${axisLines}
            ${dataPoints}
            ${labelPoints}
            <circle cx="${centerX}" cy="${centerY}" r="4" fill="var(--indigo)"/>
        </svg>`;
    }

    function bloomPyramidComponent(bloom) {
        if (!bloom || !bloom.levels) return '<div class="empty-chart">暂无数据</div>';

        const levels = bloom.levels;
        const total = levels.reduce((sum, l) => sum + (l.count || 1), 0);

        return `<div class="pyramid-container">
            ${levels
                .map((level, i) => {
                    const width = 100 - i * 12;
                    const mastery = level.mastery || 0;
                    return `<div class="pyramid-layer" style="width:${width}%">
                    <div class="layer-fill" style="height:${mastery}%" title="${level.level}: ${mastery}%"></div>
                    <span class="layer-label">${escapeHtml(level.level)}</span>
                    <span class="layer-value">${mastery}%</span>
                </div>`;
                })
                .join("")}
        </div>`;
    }

    function diagnosticSubjectSelectView() {
        const subjects = state.data.diagnosticSubjects;
        if (!subjects || !subjects.length) {
            return `<main class="page diagnostic-page">
                <header class="diagnostic-hero compact">
                    <div class="diagnostic-hero-icon">${icon("exam", 36)}</div>
                    <h1>学科测试诊断</h1>
                    <p>加载学科列表中...</p>
                </header>
                <section class="diagnostic-subject-grid">
                    <div class="loading-spinner"></div>
                </section>
            </main>`;
        }

        const subjectCards = subjects
            .map(s => {
                const diffLabel = s.avgDifficulty <= 1.3 ? "简单" : s.avgDifficulty <= 2 ? "中等" : "较难";
                return `<article class="card diagnostic-subject-card" data-diagnostic-subject="${escapeHtml(s.subject)}">
                <div class="subject-card-icon">${icon("book", 24)}</div>
                <h3>${escapeHtml(s.subject)}</h3>
                <div class="subject-card-meta">
                    <span>${s.questionCount} 题可用</span>
                    <span>${s.nodeCount} 个知识点</span>
                    <span>难度: ${diffLabel}</span>
                </div>
                <button class="btn primary small">${icon("exam", 14)} 开始诊断</button>
            </article>`;
            })
            .join("");

        return `<main class="page diagnostic-page">
            <header class="diagnostic-hero compact">
                <div class="diagnostic-hero-icon">${icon("exam", 36)}</div>
                <h1>学科测试诊断</h1>
                <p>选择一个学科，系统将生成测试题，通过答题情况精准诊断各知识点的掌握程度</p>
                <button class="btn tiny ghost" data-diagnostic-switch-mode="">${icon("arrow-left", 14)} 返回模式选择</button>
            </header>
            <section class="diagnostic-subject-grid">
                ${subjectCards}
            </section>
        </main>`;
    }

    function diagnosticSubjectTestView() {
        const test = state.data.diagnosticSubjectTest;
        if (!test || !test.questions || !test.questions.length) {
            return `<main class="page diagnostic-page">
                <section class="diagnostic-loading-hero"><h2>暂无题目</h2><p>该学科暂无诊断题目</p>
                <button class="btn ghost" data-diagnostic-switch-mode="">返回学科选择</button></section>
            </main>`;
        }

        const answers = state.data.diagnosticSubjectAnswers || {};
        const answeredCount = Object.keys(answers).length;
        const totalCount = test.questions.length;
        const progress = Math.round((answeredCount / totalCount) * 100);

        const questionsHtml = test.questions
            .map((q, idx) => {
                const currentAnswer = answers[q.id];
                let inputHtml = "";
                switch (q.type) {
                    case "single":
                        inputHtml = `<div class="subject-options">${(q.options || [])
                            .map((opt, oi) => {
                                const optLabel = String.fromCharCode(65 + oi);
                                return `<label class="subject-option${String(currentAnswer) === optLabel ? " selected" : ""}">
                            <input type="radio" name="sq_${q.id}" value="${optLabel}" data-subject-answer="${q.id}" ${String(currentAnswer) === optLabel ? "checked" : ""}>
                            <span class="opt-label">${optLabel}</span>
                            <span class="opt-text">${escapeHtml(opt)}</span>
                        </label>`;
                            })
                            .join("")}</div>`;
                        break;
                    case "judge":
                        inputHtml = `<div class="subject-options">${["正确", "错误"]
                            .map(opt => {
                                const val = opt === "正确" ? "T" : "F";
                                return `<label class="subject-option${String(currentAnswer) === val ? " selected" : ""}">
                            <input type="radio" name="sq_${q.id}" value="${val}" data-subject-answer="${q.id}" ${String(currentAnswer) === val ? "checked" : ""}>
                            <span class="opt-label">${opt === "正确" ? "✓" : "✗"}</span>
                            <span class="opt-text">${opt}</span>
                        </label>`;
                            })
                            .join("")}</div>`;
                        break;
                    case "multiple":
                        inputHtml = `<div class="subject-options multi">${(q.options || [])
                            .map((opt, oi) => {
                                const optLabel = String.fromCharCode(65 + oi);
                                const selected = Array.isArray(currentAnswer) && currentAnswer.includes(optLabel);
                                return `<label class="subject-option${selected ? " selected" : ""}">
                            <input type="checkbox" name="sq_${q.id}" value="${optLabel}" data-subject-answer="${q.id}" ${selected ? "checked" : ""}>
                            <span class="opt-label">${optLabel}</span>
                            <span class="opt-text">${escapeHtml(opt)}</span>
                        </label>`;
                            })
                            .join("")}</div>`;
                        break;
                    default:
                        inputHtml = `<input type="text" class="input subject-input" placeholder="请输入你的答案" value="${escapeHtml(String(currentAnswer || ""))}" data-subject-answer="${q.id}">`;
                }

                const diffClass = q.difficulty === "easy" ? "easy" : q.difficulty === "hard" ? "hard" : "medium";
                return `<div class="subject-question-card" id="sq-${q.id}">
                <div class="question-header">
                    <span class="question-num">${idx + 1}</span>
                    <span class="question-type pill ${q.type}">${q.type === "single" ? "单选" : q.type === "judge" ? "判断" : q.type === "multiple" ? "多选" : "填空"}</span>
                    <span class="question-difficulty pill ${diffClass}">${q.difficulty === "easy" ? "简单" : q.difficulty === "hard" ? "困难" : "中等"}</span>
                    <span class="question-score">${q.score}分</span>
                    ${q.nodeName ? `<span class="question-node">${escapeHtml(q.nodeName)}</span>` : ""}
                </div>
                <div class="question-content">${escapeHtml(q.content)}</div>
                ${inputHtml}
            </div>`;
            })
            .join("");

        return `<main class="page diagnostic-page subject-test-page">
            <header class="diagnostic-hero compact">
                <div class="diagnostic-hero-icon">${icon("exam", 32)}</div>
                <h1>${escapeHtml(test.subject)} 学科诊断</h1>
                <p>共 ${totalCount} 题 · 涵盖 ${test.nodes ? test.nodes.length : 0} 个知识点 · 预计 ${test.duration || 10} 分钟</p>
            </header>
            <div class="subject-progress-bar">
                <div class="subject-progress-fill" style="width:${progress}%"></div>
                <span>${answeredCount} / ${totalCount} 已完成</span>
            </div>
            <section class="subject-questions-list">
                ${questionsHtml}
            </section>
            <div class="subject-submit-section">
                ${
                    answeredCount < totalCount
                        ? `<p class="muted">${icon("info", 14)} 还剩 ${totalCount - answeredCount} 题未作答，建议全部完成后再提交</p>`
                        : `<p class="success-text">${icon("check", 14)} 所有题目已完成，可以提交了</p>`
                }
                <button class="btn primary glow large" data-subject-submit ${state.data.diagnosticSubjectLoading ? "disabled" : ""}>
                    ${state.data.diagnosticSubjectLoading ? "提交分析中..." : icon("check", 18) + " 提交诊断"}
                </button>
                <button class="btn ghost" data-diagnostic-switch-mode="">${icon("arrow-left", 14)} 返回学科选择</button>
            </div>
        </main>`;
    }

    function diagnosticSubjectResultView(result) {
        const analysis = result.analysis || {};
        const mastery = analysis.mastery || {};
        const profile = analysis.profile || {};
        const recommendations = analysis.recommendations || [];
        const nodeResults = analysis.nodeResults || [];
        const weakNodes = analysis.weakNodes || [];
        const strongNodes = analysis.strongNodes || [];

        const totalCount = result.totalCount || 0;
        const correctCount = result.correctCount || 0;
        const accuracy = result.accuracy || 0;
        const score = result.totalScore || 0;
        const maxScore = result.maxScore || 0;

        const accuracyColor =
            accuracy >= 85
                ? "var(--green)"
                : accuracy >= 70
                  ? "var(--blue)"
                  : accuracy >= 50
                    ? "var(--amber)"
                    : "var(--red)";

        const weakTagsHtml = weakNodes
            .map(n => {
                const ml = masteryLevel(n.accuracy);
                return `<span class="tag warn">${escapeHtml(n.nodeName)} <small>${n.accuracy}%</small></span>`;
            })
            .join("");

        const strongTagsHtml = strongNodes
            .map(n => {
                const ml = masteryLevel(n.accuracy);
                return `<span class="tag good">${escapeHtml(n.nodeName)} <small>${n.accuracy}%</small></span>`;
            })
            .join("");

        const nodeBarsHtml = nodeResults
            .map(n => {
                const color =
                    n.accuracy >= 85
                        ? "var(--green)"
                        : n.accuracy >= 70
                          ? "var(--blue)"
                          : n.accuracy >= 50
                            ? "var(--amber)"
                            : "var(--red)";
                return `<div class="node-bar-row">
                <span class="node-name">${escapeHtml(n.nodeName)}</span>
                <div class="node-bar-track">
                    <div class="node-bar-fill" style="width:${n.accuracy}%;background:${color}"></div>
                </div>
                <span class="node-score">${n.accuracy}% <small>${n.correct}/${n.total}</small></span>
            </div>`;
            })
            .join("");

        const radarData = analysis.radarData || [];
        const radarChartHtml = radarData.length > 1 ? diagnosticRadarChart(radarData) : "";

        const recsHtml = recommendations
            .map(r => {
                const prioClass = r.priority === "high" ? "high" : r.priority === "medium" ? "medium" : "low";
                return `<div class="rec-card ${prioClass}">
                <div class="rec-priority pill">${r.priority === "high" ? "高优先" : r.priority === "medium" ? "中优先" : "建议"}</div>
                <h4>${escapeHtml(r.title)}</h4>
                <p>${escapeHtml(r.detail)}</p>
                <span class="rec-action">${escapeHtml(r.action || "")}</span>
            </div>`;
            })
            .join("");

        return `<main class="page diagnostic-page subject-result-page">
            <div class="diagnostic-result-hero subject-hero">
                <span class="pill good large">${icon("check", 18)} 学科诊断完成</span>
                <h1>${escapeHtml(result.subject)} 学科诊断报告</h1>
                <p>基于 ${totalCount} 道测试题的答题情况分析</p>
            </div>

            <section class="diagnostic-persona-section">
                <article class="card persona-card-hero">
                    <div class="persona-main">
                        <div class="persona-avatar-circle" style="background:${accuracyColor}">${escapeHtml((profile.personaLabel || result.subject).charAt(0))}</div>
                        <div class="persona-info">
                            <div class="persona-label" style="color:${accuracyColor}">${escapeHtml(profile.personaLabel || "评估中")}</div>
                            <h2>${escapeHtml(result.subject)} · ${escapeHtml(mastery.level || "")}</h2>
                            <p class="persona-tags">${strongTagsHtml}</p>
                        </div>
                        <div class="persona-score-ring">
                            <svg viewBox="0 0 100 100" class="score-ring">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(100,100,100,.12)" stroke-width="8"/>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="${accuracyColor}" stroke-width="8" stroke-linecap="round"
                                    stroke-dasharray="${accuracy * 2.64} 264"
                                    transform="rotate(-90 50 50)" style="transition: stroke-dasharray 1.2s ease"/>
                            </svg>
                            <div class="score-inner"><b>${accuracy}</b><span>正确率%</span></div>
                        </div>
                    </div>
                </article>
            </section>

            <section class="diagnostic-stats-row">
                <article class="card stat-mini-card">
                    <b style="color:var(--green)">${correctCount}</b><span>答对</span>
                </article>
                <article class="card stat-mini-card">
                    <b style="color:var(--red)">${totalCount - correctCount}</b><span>答错</span>
                </article>
                <article class="card stat-mini-card">
                    <b>${score}/${maxScore}</b><span>得分</span>
                </article>
                <article class="card stat-mini-card">
                    <b>${mastery.emoji || ""} ${mastery.level || "--"}</b><span>掌握度</span>
                </article>
            </section>

            ${
                radarChartHtml
                    ? `<section class="diagnostic-radar-section">
                <article class="card radar-card">
                    <div class="card-head"><h2>${icon("radar", 18)} 知识点掌握雷达图</h2></div>
                    <div class="radar-chart-container">${radarChartHtml}</div>
                </article>
            </section>`
                    : ""
            }

            <section class="diagnostic-nodes-section">
                <article class="card nodes-card">
                    <div class="card-head"><h2>${icon("bar", 18)} 知识点掌握详情</h2></div>
                    <div class="node-bars-list">${nodeBarsHtml}</div>
                </article>
            </section>

            <section class="diagnostic-strengths-section">
                <article class="card strengths-card">
                    <div class="card-head"><h2>${icon("trophy", 18)} 强弱项分析</h2></div>
                    <div class="strengths-body">
                        <div class="strengths-col">
                            <h3><span class="dot green"></span>已掌握 (≥75%)</h3>
                            <div class="tag-cloud">${strongTagsHtml || '<span class="muted">暂无</span>'}</div>
                        </div>
                        <div class="strengths-col">
                            <h3><span class="dot orange"></span>需加强 (&lt;60%)</h3>
                            <div class="tag-cloud">${weakTagsHtml || '<span class="muted">无薄弱项</span>'}</div>
                        </div>
                    </div>
                </article>
            </section>

            ${
                analysis.rootCause
                    ? `<section class="diagnostic-insight-section">
                <article class="card insight-card">
                    <div class="card-head"><h2>${icon("brain", 18)} 根因分析</h2></div>
                    <div class="insight-body"><p>${escapeHtml(analysis.rootCause)}</p></div>
                    ${profile.personaDescription ? `<p class="persona-desc">${escapeHtml(profile.personaDescription)}</p>` : ""}
                </article>
            </section>`
                    : ""
            }

            ${
                recsHtml
                    ? `<section class="diagnostic-recs-section">
                <article class="card recs-card">
                    <div class="card-head"><h2>${icon("route", 18)} 学习建议</h2></div>
                    <div class="recs-grid">${recsHtml}</div>
                </article>
            </section>`
                    : ""
            }

            <section class="diagnostic-actions-section">
                <button class="btn ghost" data-diagnostic-restart>${icon("refresh", 16)} 重新诊断</button>
                <button class="btn ghost" data-view="profile">${icon("user", 16)} 查看完整画像</button>
                <button class="btn ghost" data-diagnostic-switch-mode="subject">${icon("exam", 16)} 诊断其他学科</button>
            </section>
        </main>`;
    }

    function diagnosticRadarChart(radarData) {
        const size = 360;
        const cx = size / 2;
        const cy = size / 2;
        const radius = 140;
        const levels = 5;
        const count = radarData.length;
        if (count < 3)
            return `<p class="muted" style="text-align:center;padding:40px">至少需要3个知识点才能显示雷达图</p>`;

        const angleSlice = (2 * Math.PI) / count;

        let svgParts = [];
        for (let l = 1; l <= levels; l++) {
            const r = (radius / levels) * l;
            const points = [];
            for (let i = 0; i < count; i++) {
                points.push(
                    `${cx + r * Math.cos(angleSlice * i - Math.PI / 2)},${cy + r * Math.sin(angleSlice * i - Math.PI / 2)}`
                );
            }
            svgParts.push(
                `<polygon points="${points.join(" ")}" fill="none" stroke="rgba(148,163,184,.2)" stroke-width="1"/>`
            );
        }

        for (let i = 0; i < count; i++) {
            const x = cx + radius * Math.cos(angleSlice * i - Math.PI / 2);
            const y = cy + radius * Math.sin(angleSlice * i - Math.PI / 2);
            svgParts.push(
                `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(148,163,184,.15)" stroke-width="1"/>`
            );
        }

        const dataPoints = radarData.map((d, i) => {
            const r = (d.value / 100) * radius;
            return `${cx + r * Math.cos(angleSlice * i - Math.PI / 2)},${cy + r * Math.sin(angleSlice * i - Math.PI / 2)}`;
        });
        svgParts.push(
            `<polygon points="${dataPoints.join(" ")}" fill="rgba(22,179,148,.15)" stroke="var(--teal)" stroke-width="2"/>`
        );

        radarData.forEach((d, i) => {
            const x = cx + radius * Math.cos(angleSlice * i - Math.PI / 2);
            const y = cy + radius * Math.sin(angleSlice * i - Math.PI / 2);
            const r = (d.value / 100) * radius;
            const dx = cx + r * Math.cos(angleSlice * i - Math.PI / 2);
            const dy = cy + r * Math.sin(angleSlice * i - Math.PI / 2);
            svgParts.push(`<circle cx="${dx}" cy="${dy}" r="4" fill="var(--teal)"/>`);
            const labelR = radius + 30;
            const lx = cx + labelR * Math.cos(angleSlice * i - Math.PI / 2);
            const ly = cy + labelR * Math.sin(angleSlice * i - Math.PI / 2);
            const anchor = lx < cx - 40 ? "end" : lx > cx + 40 ? "start" : "middle";
            svgParts.push(
                `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="12" fill="var(--text)" dominant-baseline="middle">${escapeHtml(d.name)} <tspan fill="var(--text-muted)">${d.value}%</tspan></text>`
            );
        });

        return `<svg viewBox="0 0 ${size} ${size}" class="radar-chart-svg" style="width:100%;max-width:${size}px">${svgParts.join("")}</svg>`;
    }

    function profileView() {
        const activeTab = state.data.profileTab || "overview";
        const profile = state.data.profileInsight || getMockProfileInsight();
        const summary = profile.summary || {};
        const diagnostic = state.data.diagnosticResult;
        const diagnosticAnalysis = diagnostic?.analysis || {};
        const profileTrust = Math.min(
            96,
            Math.max(
                58,
                Math.round(
                    ((summary.accuracy || 82) +
                        (summary.efficiency || 78) +
                        (diagnosticAnalysis.masteryEstimate || summary.mastery || 75)) /
                        3
                )
            )
        );
        const persona = diagnosticAnalysis.persona || profile.persona || "稳步成长型";

        return `<main class="page profile-page ios-profile-page">
            <section class="ios-profile-hero">
                <div class="ios-hero-copy">
                    <span class="ios-eyebrow">${icon("brain", 15)} 智能学习画像</span>
                    <h1>${escapeHtml(persona)}</h1>
                    <p>画像现在以证据链为核心：把诊断、答题、AI 对话、复习和教师反馈合成为可解释的学习状态，并直接驱动下一步路径。</p>
                    <div class="hero-actions">
                        <button class="btn primary glow" data-view="path">${icon("route", 17)}生成学习路径</button>
                        <button class="btn ghost" data-view="diagnostic">${icon("target", 17)}校准画像</button>
                        <button class="btn ghost" data-view="aiAssistant">${icon("robot", 17)}问AI助手</button>
                    </div>
                </div>
                <div class="ios-profile-orb" aria-hidden="true">
                    <div class="ios-orb-ring" style="--score:${summary.mastery || 75}">
                        <b>${summary.mastery || 75}</b>
                        <span>综合掌握</span>
                    </div>
                    <div class="ios-orb-meta">
                        <span>可信度 ${profileTrust}%</span>
                        <small>正确率 ${summary.accuracy || 82}% · 效率 ${summary.efficiency || 78}%</small>
                    </div>
                </div>
            </section>
            <section class="profile-sub-nav">
                <nav class="sub-nav-tabs">
                    <button class="sub-nav-tab ${activeTab === "overview" ? "active" : ""}" data-profile-tab="overview">${icon("user", 15)} 画像概览</button>
                    <button class="sub-nav-tab ${activeTab === "cognitive" ? "active" : ""}" data-profile-tab="cognitive">${icon("brain", 15)} 认知分析</button>
                    <button class="sub-nav-tab ${activeTab === "knowledge" ? "active" : ""}" data-profile-tab="knowledge">${icon("layers", 15)} 知识追踪</button>
                    <button class="sub-nav-tab ${activeTab === "misconceptions" ? "active" : ""}" data-profile-tab="misconceptions">${icon("alert", 15)} 误区管理</button>
                    <button class="sub-nav-tab ${activeTab === "report" ? "active" : ""}" data-profile-tab="report">${icon("chart", 15)} 诊断报告</button>
                </nav>
            </section>
            <section class="profile-tab-content">
                ${activeTab === "overview" ? profileOverviewTab(profile) : ""}
                ${activeTab === "cognitive" ? profileCognitiveTab() : ""}
                ${activeTab === "knowledge" ? profileKnowledgeTab() : ""}
                ${activeTab === "misconceptions" ? profileMisconceptionsTab() : ""}
                ${activeTab === "report" ? profileReportTab() : ""}
            </section>
        </main>`;
    }

    function profileOverviewTab(profile) {
        const summary = profile.summary || {};
        const dimensions = profile.dimensions || [];
        const subjects = profile.subjectScores || [];
        const weak = profile.weakPoints || [];
        const strong = profile.strongPoints || [];
        const risks = profile.risks || [];
        const recommendations = profile.recommendations || [];
        const tasks = profile.tasks || [];
        const diagnostic = state.data.diagnosticResult || {};
        const diagnosticAnalysis = diagnostic.analysis || {};
        const evidence = [
            {
                icon: "pen",
                source: "自然语言",
                title: diagnosticAnalysis.persona || profile.persona || "稳步成长型",
                detail: "从学生自述中抽取专业、目标、偏好、薄弱点和可用时间。",
                weight: 18
            },
            {
                icon: "exam",
                source: "答题表现",
                title: `${summary.accuracy || 82}% 正确率`,
                detail: `当前有 ${summary.weakCount || weak.length || 3} 个薄弱知识点，需要用真实题目继续校准。`,
                weight: 28
            },
            {
                icon: "robot",
                source: "AI 对话",
                title: "卡点主题追踪",
                detail: "反复追问的概念会进入画像候选，避免只按关键词贴标签。",
                weight: 14
            },
            {
                icon: "refresh",
                source: "复习记录",
                title: `${summary.continuousDays || 7} 天连续学习`,
                detail: "复习完成率和遗忘曲线会修正长期掌握度。",
                weight: 24
            },
            {
                icon: "user",
                source: "教师反馈",
                title: "人工干预证据",
                detail: "教师反馈可补充项目作业、表达和迁移能力的盲区。",
                weight: 16
            }
        ];
        const knowledgeNodes = subjects.slice(0, 5);
        const focusTasks = tasks.slice(0, 3);

        return `<section class="profile-kpis ios-kpis">
                <article class="card ios-kpi"><span>学习小时</span><b>${summary.studyHours || 24}</b><small>近 7 天累计</small></article>
                <article class="card ios-kpi"><span>今日任务</span><b>${summary.completedToday || 5}/${summary.todayTasks || 8}</b><small>完成会回写画像</small></article>
                <article class="card ios-kpi danger"><span>薄弱知识点</span><b>${summary.weakCount || 3}</b><small>优先进入路径</small></article>
                <article class="card ios-kpi good"><span>连续学习</span><b>${summary.continuousDays || 7}</b><small>学习节律稳定</small></article>
            </section>
            ${profileInputPanel()}
            <section class="ios-profile-grid">
                <article class="card ios-evidence-card">
                    <div class="card-head"><h2 class="section-title">${icon("chart", 18)}画像证据链</h2><button class="btn tiny ghost" data-open-panel="profile">数据来源</button></div>
                    <div class="ios-evidence-list">${evidence
                        .map(
                            (item, i) => `<div class="ios-evidence-row" style="--delay:${i * 80}ms">
                        <div class="ios-evidence-icon">${icon(item.icon, 16)}</div>
                        <div><b>${escapeHtml(item.source)} · ${escapeHtml(item.title)}</b><p>${escapeHtml(item.detail)}</p></div>
                        <span>${item.weight}%</span>
                    </div>`
                        )
                        .join("")}</div>
                </article>
                <article class="card ios-dimension-card">
                    <div class="card-head"><h2 class="section-title">${icon("brain", 18)}能力画像</h2><span class="pill">动态校准</span></div>
                    <div class="profile-dimension-grid">${dimensions.map((d, i) => `<div class="dimension-row ios-dimension-row" style="--delay:${i * 70}ms"><span>${escapeHtml(d.label)}</span><b>${d.value}%</b><div class="bar"><span style="width:${d.value}%"></span></div></div>`).join("")}</div>
                </article>
                <article class="card ios-knowledge-card">
                    <div class="card-head"><h2 class="section-title">${icon("layers", 18)}知识状态地图</h2><button class="btn tiny ghost" data-view="test">分科校准</button></div>
                    <div class="ios-knowledge-map">${
                        knowledgeNodes
                            .map(
                                (
                                    s,
                                    i
                                ) => `<div class="ios-knowledge-node ${Number(s.mastery || 0) < 60 ? "risk" : Number(s.mastery || 0) > 78 ? "good" : ""}" style="--delay:${i * 85}ms">
                        <span>${i + 1}</span><b>${escapeHtml(s.subject)}</b><small>${s.weakCount || 0} 个待修复 · ${s.wrongCount || 0} 次错题</small><div class="bar"><span style="width:${s.mastery || 0}%"></span></div>
                    </div>`
                            )
                            .join("") || "<p>暂无分科学情。</p>"
                    }</div>
                </article>
                <article class="card ios-risk-card">
                    <div class="card-head"><h2 class="section-title">${icon("alert", 18)}风险与干预</h2><span class="pill warn">需要解释</span></div>
                    <div class="risk-list">${risks.map((r, i) => `<div class="risk-item ${r.level}" style="--delay:${i * 80}ms"><b>${escapeHtml(r.title)}</b><p>${escapeHtml(r.subject)} · ${escapeHtml(r.reason)}</p><button class="btn tiny ghost" data-run-closed-loop="${escapeHtml(r.title)}">生成闭环</button></div>`).join("") || "<p>暂无高风险点。</p>"}</div>
                </article>
                <article class="card ios-action-card">
                    <div class="card-head"><h2 class="section-title">${icon("bolt", 18)}下一步行动</h2><span class="pill good">画像驱动</span></div>
                    <div class="list">${recommendations.map((r, i) => `<button class="list-row action-row ios-action-row" style="--delay:${i * 80}ms" data-view="${escapeHtml(r.target)}"><span>${escapeHtml(r.title)}<small>${escapeHtml(r.reason)}</small></span><span class="pill">${escapeHtml(r.action)}</span></button>`).join("") || focusTasks.map((task, i) => `<button class="list-row action-row ios-action-row" style="--delay:${i * 80}ms" data-task-id="${task.id}"><span>${escapeHtml(task.title)}<small>${escapeHtml(task.subtitle || task.source)} · ${task.estimated_minutes || 0} 分钟</small></span><span class="pill ${task.status === "done" ? "good" : ""}">${task.status === "done" ? "完成" : "待做"}</span></button>`).join("") || "<p>暂无行动建议。</p>"}</div>
                </article>
                <article class="card ios-strength-card">
                    <div class="card-head"><h2 class="section-title">${icon("trophy", 18)}可迁移优势</h2><button class="btn tiny ghost" data-view="practice">迁移练习</button></div>
                    <div class="strong-list">${strong.map((p, i) => `<div class="strong-item" style="--delay:${i * 80}ms"><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.subject)} · ${p.mastery}%</span></div>`).join("")}</div>
                </article>
            </section>`;
    }

    function profileCognitiveTab() {
        const profile = state.data.cognitiveProfile || getMockCognitiveProfile();

        const attrs = profile.cognitiveAttributes;
        const blooms = profile.bloomLevels;

        return `<section class="cognitive-grid">
                <article class="card attrs-card">
                    <div class="card-head">
                        <h2>${icon("brain", 18)} 认知属性追踪</h2>
                    </div>
                    <div class="attrs-grid">
                        ${Object.entries(attrs)
                            .map(
                                ([name, data]) => `<div class="attr-item">
                            <div class="attr-header">
                                <span>${escapeHtml(name)}</span>
                                <span class="attr-state ${data.state}">${data.state === "mastered" ? "已掌握" : data.state === "developing" ? "发展中" : data.state === "beginner" ? "初学者" : "薄弱"}</span>
                            </div>
                            <div class="attr-bar">
                                <div class="bar-fill" style="width:${data.mastery}%"></div>
                            </div>
                            <div class="attr-meta">
                                <span>掌握度: ${data.mastery}%</span>
                                <span>置信度: ${Math.round(data.confidence * 100)}%</span>
                            </div>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>

                <article class="card blooms-card">
                    <div class="card-head">
                        <h2>${icon("target", 18)} Bloom认知层次</h2>
                    </div>
                    <div class="blooms-chart">
                        ${Object.entries(blooms)
                            .map(
                                ([level, data]) => `<div class="bloom-bar-item">
                            <span class="bloom-label">${escapeHtml(level)}</span>
                            <div class="bloom-bar">
                                <div class="bar-fill" style="width:${data.mastery}%"></div>
                            </div>
                            <span class="bloom-value">${data.mastery}%</span>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
            </section>`;
    }

    function profileKnowledgeTab() {
        const mastery = state.data.knowledgeMastery || getMockKnowledgeMastery();

        const summary = mastery.summary;
        const nodes = Object.values(mastery.mastery);

        return `<section class="knowledge-summary">
                <article class="card summary-card">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <b>${summary.total}</b>
                            <span>知识点总数</span>
                        </div>
                        <div class="summary-item good">
                            <b>${summary.mastered}</b>
                            <span>已掌握</span>
                        </div>
                        <div class="summary-item info">
                            <b>${summary.learning}</b>
                            <span>学习中</span>
                        </div>
                        <div class="summary-item warn">
                            <b>${summary.beginner}</b>
                            <span>待学习</span>
                        </div>
                    </div>
                    <div class="overall-bar">
                        <div class="bar-fill" style="width:${summary.overallMastery}%"></div>
                    </div>
                    <span class="overall-label">综合掌握度: ${summary.overallMastery}%</span>
                </article>
            </section>

            <section class="knowledge-list">
                <article class="card">
                    <div class="card-head">
                        <h2>${icon("list", 18)} 知识点列表</h2>
                    </div>
                    <div class="knowledge-table">
                        ${nodes
                            .slice(0, 20)
                            .map(
                                node => `<div class="knowledge-row">
                            <div class="knowledge-info">
                                <span class="knowledge-title">${escapeHtml(node.title)}</span>
                                <span class="knowledge-subject">${escapeHtml(node.subject)}</span>
                            </div>
                            <div class="knowledge-progress">
                                <div class="bar-fill" style="width:${Math.round(node.mastery * 100)}%"></div>
                            </div>
                            <span class="knowledge-mastery">${Math.round(node.mastery * 100)}%</span>
                            <span class="knowledge-state ${node.state}">${node.state === "mastered" ? "掌握" : node.state === "learning" ? "学习中" : "待学习"}</span>
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
            </section>`;
    }

    function profileMisconceptionsTab() {
        const data = state.data.misconceptions || getMockMisconceptions();

        const misconceptions = data.misconceptions;

        return `<section class="misconception-stats">
                <article class="card">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <b>${data.totalCategories}</b>
                            <span>误区类型</span>
                        </div>
                        <div class="stat-item danger">
                            <b>${data.criticalCount}</b>
                            <span>严重误区</span>
                        </div>
                    </div>
                </article>
            </section>

            <section class="misconception-list">
                <article class="card">
                    <div class="card-head">
                        <h2>${icon("alert", 18)} 误区列表</h2>
                    </div>
                    <div class="misconception-cards">
                        ${misconceptions
                            .map(
                                mc => `<div class="misconception-card ${mc.severity}">
                            <div class="mc-header">
                                <span class="mc-category">${escapeHtml(mc.category)}</span>
                                <span class="mc-severity ${mc.severity}">${mc.severity === "critical" ? "严重" : mc.severity === "moderate" ? "中等" : "轻微"}</span>
                            </div>
                            <div class="mc-stats">
                                <span>${mc.count}次错误</span>
                                <span>${mc.percentage}%占比</span>
                            </div>
                            <div class="mc-suggestion">${mc.suggestion}</div>
                            ${
                                mc.sampleQuestions && mc.sampleQuestions.length > 0
                                    ? `<div class="mc-samples">
                                ${mc.sampleQuestions
                                    .slice(0, 2)
                                    .map(
                                        q => `<div class="mc-sample">
                                    <p>${escapeHtml(q.content)}</p>
                                    <div class="mc-answers">
                                        <span class="wrong">你的: ${escapeHtml(q.userAnswer)}</span>
                                        <span class="correct">正确: ${escapeHtml(q.correctAnswer)}</span>
                                    </div>
                                </div>`
                                    )
                                    .join("")}
                            </div>`
                                    : ""
                            }
                        </div>`
                            )
                            .join("")}
                    </div>
                </article>
            </section>`;
    }

    function profileReportTab() {
        const report = state.data.smartReport || getMockSmartReport();

        const summary = report.summary;
        const radar = report.radar;
        const misconceptions = report.misconceptions;
        const strengths = report.strengths;
        const pathSuggestion = report.pathSuggestion;

        return `<header class="report-hero">
                <div class="report-score-card">
                    <div class="score-ring">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="10"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--indigo)" stroke-width="10" stroke-linecap="round"
                                stroke-dasharray="${(summary.overallScore || 75) * 2.64} 264"
                                transform="rotate(-90 50 50)" style="transition: stroke-dasharray 1.5s ease"/>
                        </svg>
                        <div class="score-inner">
                            <b>${summary.overallScore || 75}</b>
                            <span>综合评分</span>
                        </div>
                    </div>
                    <div class="score-info">
                        <span class="pill good">${summary.grade || "B (良好)"}</span>
                    </div>
                </div>
                <div class="report-summary">
                    <h2>智能诊断报告</h2>
                    <p>${summary.description || "这是一份综合分析报告，包含能力评估和学习建议"}</p>
                    <div class="summary-tags">
                        ${(summary.keyTakeaways || ["逻辑思维良好", "需要更多练习", "适合视觉学习"]).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
                    </div>
                </div>
            </header>
            <div class="report-grid">
                <article class="card radar-card">
                    <div class="card-head">
                        <h3>${icon("radar", 18)} 能力雷达图</h3>
                    </div>
                    <div class="radar-chart">
                        ${radarChartComponent(radar)}
                    </div>
                </article>
                <article class="card strengths-card">
                    <div class="card-head">
                        <h3>${icon("trophy", 18)} 优劣势分析</h3>
                    </div>
                    <div class="strengths-grid">
                        <div class="strengths-col">
                            <h4><span class="dot green"></span> 优势领域</h4>
                            <div class="strength-list">
                                ${(strengths.strengths || [{ item: "逻辑推理" }, { item: "概念理解" }]).map(s => `<div class="strength-item good">${icon("check", 14)} ${escapeHtml(s.item)}</div>`).join("")}
                            </div>
                        </div>
                        <div class="strengths-col">
                            <h4><span class="dot orange"></span> 待加强</h4>
                            <div class="strength-list">
                                ${(strengths.weaknesses || [{ item: "实践应用" }, { item: "记忆" }]).map(w => `<div class="strength-item warn">${icon("alert", 14)} ${escapeHtml(w.item)}</div>`).join("")}
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            <article class="card misconceptions-card">
                <div class="card-head">
                    <h3>${icon("alert", 18)} 误区检测</h3>
                    <span class="pill danger">${misconceptions.criticalCount || 2} 严重</span>
                </div>
                <div class="misconception-list">
                    ${(
                        misconceptions.cards || [
                            { category: "数组操作", count: 3, suggestion: "建议多做相关练习" },
                            { category: "递归", count: 2, suggestion: "从简单例子开始理解" }
                        ]
                    )
                        .slice(0, 5)
                        .map(
                            mc => `<div class="misconception-item ${mc.severity || "moderate"}">
                        <div class="mc-header">
                            <span>${escapeHtml(mc.category)}</span>
                            <span class="mc-count">${mc.count}次错误</span>
                        </div>
                        <div class="mc-suggestion">${mc.suggestion}</div>
                    </div>`
                        )
                        .join("")}
                </div>
            </article>
            <article class="card path-card">
                <div class="card-head">
                    <h3>${icon("route", 18)} 学习路径建议</h3>
                    <span class="pill">${pathSuggestion.totalSteps || 3} 项任务</span>
                </div>
                <div class="path-suggestions">
                    ${(pathSuggestion.suggestions || [])
                        .map(
                            (s, i) => `<div class="path-item">
                        <span class="path-index">${i + 1}</span>
                        <div class="path-content">
                            <h4>${escapeHtml(s.target)}</h4>
                            <p>${escapeHtml(s.action)}</p>
                        </div>
                        <span class="path-priority ${s.priority}">${s.priority === "critical" ? "紧急" : s.priority === "high" ? "重要" : "一般"}</span>
                    </div>`
                        )
                        .join("")}
                </div>
                <button class="btn primary" data-view="path">${icon("route", 16)} 开始学习路径</button>
            </article>`;
    }

    function reportView() {
        const weak = state.data.weakPoints[0]?.title || "Python 循环与函数";
        return `<main class="page report-page">
            <section class="hero-row"><div class="hero"><h1>学习报告</h1><p>面向学生呈现本周掌握变化、薄弱知识点和下一步复习建议，帮助教师快速判断是否需要干预。</p></div><article class="card report-head"><h2 class="section-title">${icon("chart", 18)}本周报告</h2><span class="pill">学习追踪</span></article></section>${metricCards()}
            <section class="report-layout">
                <aside class="side-card">
                    <article class="card"><h2 class="section-title">${icon("book", 18)}报告操作</h2><button class="btn primary full" data-generate-report>${icon("refresh", 17)}生成报告</button><button class="btn ghost full" data-generate-plan>${icon("robot", 17)}生成计划</button></article>
                    <article class="card report-action-card"><h2 class="section-title">${icon("robot", 18)}AI学习辅导</h2>
                        <label class="mini-label">演示知识点</label>
                        <input class="input" data-report-topic value="${escapeHtml(weak)}" placeholder="例如：Python 循环与函数">
                        <button class="btn teal full ${state.data.reportActionLoading === "resources" ? "is-loading" : ""}" data-report-action="resources">${icon("layers", 17)}生成学习资源包</button>
                        <button class="btn ghost full ${state.data.reportActionLoading === "ai-learning" ? "is-loading" : ""}" data-report-action="ai-learning">${icon("brain", 17)}生成个性化建议</button>
                        <button class="btn primary full ${state.data.reportActionLoading === "demo-loop" ? "is-loading" : ""}" data-report-action="demo-loop">${icon("bolt", 17)}生成完整学习闭环</button>
                    </article>
                </aside>
                <div class="report-main">
                    <div class="grid-2"><article class="card"><div class="card-head"><h2 class="section-title">学习趋势</h2><span class="pill">近 7 天</span></div><div class="chart">${[2.1, 3.8, 4.6, 6, 3.2, 5.1, 4.2].map((n, i) => `<div class="bar-col"><b>${n}</b><i style="height:${n * 28}px"></i><span>周${"一二三四五六日"[i]}</span></div>`).join("")}</div></article>${achievementCard()}</div>
                    ${reportAiEnhancementView()}
                </div>
            </section>
        </main>`;
    }

    function reportAiEnhancementView() {
        const resources = state.data.reportResourcePackage;
        const ai = state.data.reportAiLearning;
        const demo = state.data.reportDemoLoop;
        if (!resources && !ai && !demo) {
            return `<section class="report-ai-empty card">
                <div><span class="pill">学习闭环</span><h2>把诊断结果转成学生能完成的学习行动</h2><p>点击左侧按钮后，这里会展示资源包、个性化建议和教师可跟踪的完整学习闭环。</p></div>
                <div class="report-flow-mini">${["画像诊断", "资源生成", "自适应练习", "路径调整", "复习计划"].map((x, i) => `<span><b>${i + 1}</b>${x}</span>`).join("")}</div>
            </section>`;
        }
        return `<section class="report-ai-results">
            ${resources ? reportResourcePackageView(resources) : ""}
            ${ai ? reportAiLearningView(ai) : ""}
            ${demo ? reportDemoLoopView(demo) : ""}
        </section>`;
    }

    function reportResourcePackageView(result) {
        const resources = result.resources || [];
        return `<article class="card report-result-card"><div class="card-head"><h2 class="section-title">${icon("layers", 18)}个性化学习资源包</h2><span class="pill good">${resources.length} 类资源</span></div>
            <p class="muted-line">知识点：${escapeHtml(result.knowledgePoint || "当前薄弱点")} · 已按学生当前掌握情况整理。</p>
            <div class="resource-package-grid">${resources
                .map(
                    (resource, index) => `<div class="resource-pack-item">
                <span class="pill">${escapeHtml(resourceTypeLabel(resource.type))}</span>
                <h3>${escapeHtml(resource.title || resource.type)}</h3>
                <p>${escapeHtml(resource.description || resource.content || "已生成个性化学习资源。").slice(0, 120)}</p>
                <button class="btn tiny ghost" data-report-resource-detail="${index}">${icon(resourceIcon(resource.type), 14)}查看并操作</button>
            </div>`
                )
                .join("")}</div>
        </article>`;
    }

    function resourceTypeLabel(type) {
        return (
            {
                document: "课程讲解",
                ppt: "PPT大纲",
                quiz: "题库练习",
                video: "教学视频",
                mindmap: "思维导图",
                reading: "拓展阅读",
                practice: "实操案例"
            }[type] ||
            type ||
            "资源"
        );
    }

    function resourceIcon(type) {
        return (
            {
                document: "book",
                ppt: "file",
                quiz: "exam",
                video: "play",
                mindmap: "route",
                reading: "search",
                practice: "code"
            }[type] || "layers"
        );
    }

    function resourceDetailHtml(resource) {
        if (!resource) return `<p class="muted">资源不存在，请重新生成。</p>`;
        const header = `<div class="resource-detail-head"><span class="pill">${escapeHtml(resourceTypeLabel(resource.type))}</span><p>${escapeHtml(resource.description || "")}</p></div>`;
        if (resource.type === "document") {
            return `${header}<div class="resource-doc">${renderMarkdownLite(resource.content || "")}</div>
                <div class="resource-actions"><button class="btn tiny primary" data-panel-go="smartNotes">${icon("pen", 14)}整理到笔记</button><button class="btn tiny ghost" data-panel-go="aiAssistant">${icon("robot", 14)}继续讲解</button></div>`;
        }
        if (resource.type === "ppt") {
            const slides = resource.slides || [];
            return `${header}<div class="ppt-outline">${slides
                .map(
                    (slide, i) => `<article>
                <span>${String(i + 1).padStart(2, "0")}</span>
                <div><h3>${escapeHtml(slide.title || `第 ${i + 1} 页`)}</h3>
                ${slide.subtitle ? `<p>${escapeHtml(slide.subtitle)}</p>` : ""}
                <ul>${(slide.bullets || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                ${slide.speakerNotes ? `<small>讲解提示：${escapeHtml(slide.speakerNotes)}</small>` : ""}</div>
            </article>`
                )
                .join("")}</div>
            <div class="resource-actions"><button class="btn tiny primary" data-panel-go="course">${icon("play", 14)}进入课堂讲解</button><button class="btn tiny ghost" data-panel-go="smartNotes">${icon("save", 14)}保存备课要点</button></div>`;
        }
        if (resource.type === "mindmap") {
            return `${header}<div class="mindmap-view">${mindmapNodeHtml(resource.mindmap)}</div>
                <div class="resource-actions"><button class="btn tiny primary" data-panel-go="path">${icon("route", 14)}按图生成路径</button><button class="btn tiny ghost" data-panel-go="practice">${icon("exam", 14)}做相关练习</button></div>`;
        }
        if (resource.type === "quiz") {
            const questions = resource.questions || [];
            return `${header}<div class="quiz-preview">${questions
                .map(
                    (q, i) => `<article>
                <div><b>${i + 1}. ${escapeHtml(q.content || q.question || "练习题")}</b><span class="pill">${escapeHtml(q.type || "single")}</span></div>
                ${questionOptionsHtml(q)}
                <details><summary>查看答案</summary><p>${escapeHtml(q.answer || q.correct_answer || "待补充")}</p></details>
            </article>`
                )
                .join("")}</div>
            <div class="resource-actions"><button class="btn tiny primary" data-panel-go="practice">${icon("play", 14)}开始专项练习</button><button class="btn tiny ghost" data-panel-go="test">${icon("exam", 14)}加入测验</button></div>`;
        }
        if (resource.type === "practice") {
            const cases = resource.cases || [];
            return `${header}<div class="practice-case-list">${cases
                .map(
                    item => `<article>
                <div class="card-head"><h3>${escapeHtml(item.title || "实操案例")}</h3><span class="pill">${escapeHtml(item.difficulty || "medium")} · ${escapeHtml(item.estimatedTime || "")}</span></div>
                <div class="resource-doc">${renderMarkdownLite(item.content || "")}</div>
            </article>`
                )
                .join("")}</div>
            <div class="resource-actions"><button class="btn tiny primary" data-panel-go="codeLab">${icon("code", 14)}打开编程舱</button><button class="btn tiny ghost" data-panel-go="smartNotes">${icon("pen", 14)}记录实操问题</button></div>`;
        }
        if (resource.type === "video") {
            return `${header}<div class="list">${(resource.videos || []).map(v => `<a class="list-row" href="${escapeAttr(v.url || "#")}" target="_blank" rel="noreferrer"><span>${escapeHtml(v.title || "教学视频")}<small>${escapeHtml(v.platform || "")} · ${escapeHtml(v.duration || "")}</small></span><span class="pill">打开</span></a>`).join("")}</div>`;
        }
        if (resource.type === "reading") {
            return `${header}<div class="list">${(resource.readings || []).map(r => `<div class="list-row"><span>${escapeHtml(r.title)}<small>${escapeHtml(r.source || "")} · ${escapeHtml(r.type || "")}</small></span><span class="pill">${escapeHtml(r.relevance || "medium")}</span></div>`).join("")}</div>`;
        }
        return `${header}<div class="resource-doc">${renderMarkdownLite(resource.content || JSON.stringify(resource, null, 2))}</div>`;
    }

    function mindmapNodeHtml(node) {
        if (!node) return "";
        const name = typeof node === "string" ? node : node.name || node.root || "知识点";
        const children = typeof node === "string" ? [] : node.children || [];
        return `<div class="mindmap-node"><b>${escapeHtml(name)}</b>${children.length ? `<div>${children.map(child => mindmapNodeHtml(child)).join("")}</div>` : ""}</div>`;
    }

    function questionOptionsHtml(question) {
        let options = question.options || [];
        if (typeof options === "string") {
            try {
                options = JSON.parse(options);
            } catch {
                options = options
                    .split(/[|,，]/)
                    .map(item => item.trim())
                    .filter(Boolean);
            }
        }
        if (!Array.isArray(options) || !options.length) return "";
        return `<ol class="question-options">${options.map(option => `<li>${escapeHtml(option)}</li>`).join("")}</ol>`;
    }

    function parseAlgoValues(value) {
        const values = String(value || "")
            .split(/[,，\s]+/)
            .map(item => Number(item.trim()))
            .filter(item => Number.isFinite(item))
            .slice(0, 12);
        return values.length ? values : [8, 3, 5, 1, 9, 2];
    }

    function makeAlgoStep(array, active = [], sorted = [], message = "", pointers = {}) {
        return {
            array: [...array],
            active,
            sorted,
            message,
            pointers
        };
    }

    function buildAlgoSteps(kind, rawValues) {
        const initial = parseAlgoValues(rawValues);
        const steps = [makeAlgoStep(initial, [], [], "准备开始：观察输入数组。")];
        if (kind === "queue") {
            const queue = initial.slice(0, 5);
            steps[0] = makeAlgoStep(queue, [], [], "队列遵循先进先出：左侧是队头 Front，右侧是队尾 Rear。", {
                front: 0,
                rear: queue.length - 1,
                op: "ready"
            });
            if (queue.length) {
                steps.push(
                    makeAlgoStep(queue, [0], [], `查看队头元素 ${queue[0]}，它会最先出队。`, {
                        front: 0,
                        rear: queue.length - 1,
                        op: "peek"
                    })
                );
                const removed = queue.shift();
                steps.push(
                    makeAlgoStep(queue, [], [], `${removed} 出队，Front 指针移动到下一个元素。`, {
                        front: queue.length ? 0 : -1,
                        rear: queue.length - 1,
                        op: "dequeue",
                        removed
                    })
                );
            }
            const nextValue = Math.max(...initial, 0) + 1;
            steps.push(
                makeAlgoStep(
                    [...queue, nextValue],
                    [queue.length],
                    [],
                    `${nextValue} 从队尾入队，Rear 指针指向新元素。`,
                    { front: 0, rear: queue.length, op: "enqueue", added: nextValue }
                )
            );
            steps.push(
                makeAlgoStep(
                    [...queue, nextValue],
                    [],
                    [...Array(queue.length + 1).keys()],
                    "队列演示完成：入队从 Rear 进入，出队从 Front 离开。",
                    { front: 0, rear: queue.length, op: "done" }
                )
            );
            return steps;
        }
        if (kind === "linked") {
            const list = initial.slice(0, 6);
            steps[0] = makeAlgoStep(list, [], [], "链表由节点和 next 指针组成，访问时需要沿箭头一个个走。", {
                current: 0,
                prev: null,
                next: 1,
                op: "ready"
            });
            for (let i = 0; i < list.length; i += 1) {
                steps.push(
                    makeAlgoStep(
                        list,
                        [i],
                        Array.from({ length: i }, (_, n) => n),
                        `访问节点 ${i}，读取值 ${list[i]}。`,
                        {
                            prev: i > 0 ? i - 1 : null,
                            current: i,
                            next: i + 1 < list.length ? i + 1 : null,
                            op: "traverse"
                        }
                    )
                );
            }
            const reversed = [];
            for (let i = 0; i < list.length; i += 1) {
                reversed.unshift(list[i]);
                steps.push(
                    makeAlgoStep(
                        [...reversed, ...list.slice(i + 1)],
                        [0],
                        Array.from({ length: reversed.length }, (_, n) => n),
                        `反转指针：节点 ${i} 的 next 指向前一个节点。`,
                        { prev: reversed.length > 1 ? 1 : null, current: 0, next: reversed.length, op: "reverse" }
                    )
                );
            }
            steps.push(
                makeAlgoStep(
                    [...list].reverse(),
                    [],
                    list.map((_, i) => i),
                    "链表反转完成：所有 next 指针方向已经改变。",
                    { current: null, prev: 0, next: null, op: "done" }
                )
            );
            return steps;
        }
        if (kind === "selection") {
            const arr = [...initial];
            for (let i = 0; i < arr.length - 1; i += 1) {
                let min = i;
                steps.push(
                    makeAlgoStep(
                        arr,
                        [i],
                        Array.from({ length: i }, (_, n) => n),
                        `第 ${i + 1} 轮：先假设位置 ${i} 是最小值。`,
                        { i, min }
                    )
                );
                for (let j = i + 1; j < arr.length; j += 1) {
                    steps.push(
                        makeAlgoStep(
                            arr,
                            [min, j],
                            Array.from({ length: i }, (_, n) => n),
                            `比较当前最小值 ${arr[min]} 和候选值 ${arr[j]}。`,
                            { i, j, min }
                        )
                    );
                    if (arr[j] < arr[min]) {
                        min = j;
                        steps.push(
                            makeAlgoStep(
                                arr,
                                [min],
                                Array.from({ length: i }, (_, n) => n),
                                `发现更小的 ${arr[min]}，更新最小值位置。`,
                                { i, j, min }
                            )
                        );
                    }
                }
                if (min !== i) {
                    [arr[i], arr[min]] = [arr[min], arr[i]];
                    steps.push(
                        makeAlgoStep(
                            arr,
                            [i, min],
                            Array.from({ length: i + 1 }, (_, n) => n),
                            `交换位置 ${i} 和 ${min}，把本轮最小值放到前面。`,
                            { i, min }
                        )
                    );
                } else {
                    steps.push(
                        makeAlgoStep(
                            arr,
                            [i],
                            Array.from({ length: i + 1 }, (_, n) => n),
                            `位置 ${i} 已经是本轮最小值，不需要交换。`,
                            { i, min }
                        )
                    );
                }
            }
            steps.push(
                makeAlgoStep(
                    arr,
                    [],
                    arr.map((_, i) => i),
                    "选择排序完成：每一轮都把最小值放到未排序区开头。"
                )
            );
            return steps;
        }
        if (kind === "binary") {
            const arr = [...initial].sort((a, b) => a - b);
            const target = initial[Math.floor(initial.length / 2)] ?? arr[0];
            let left = 0;
            let right = arr.length - 1;
            steps.push(
                makeAlgoStep(arr, [], [], `二分查找需要有序数组，这里查找目标值 ${target}。`, { left, right, target })
            );
            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                steps.push(
                    makeAlgoStep(arr, [mid], [], `检查中点 ${mid}，值为 ${arr[mid]}。`, { left, right, mid, target })
                );
                if (arr[mid] === target) {
                    steps.push(
                        makeAlgoStep(arr, [mid], [mid], `找到目标值 ${target}，位置是 ${mid}。`, {
                            left,
                            right,
                            mid,
                            target
                        })
                    );
                    return steps;
                }
                if (arr[mid] < target) {
                    left = mid + 1;
                    steps.push(
                        makeAlgoStep(arr, [], [], `${arr[mid]} 小于 ${target}，丢弃左半区。`, { left, right, target })
                    );
                } else {
                    right = mid - 1;
                    steps.push(
                        makeAlgoStep(arr, [], [], `${arr[mid]} 大于 ${target}，丢弃右半区。`, { left, right, target })
                    );
                }
            }
            steps.push(makeAlgoStep(arr, [], [], `查找结束，没有找到目标值 ${target}。`, { left, right, target }));
            return steps;
        }
        const arr = [...initial];
        for (let end = arr.length - 1; end > 0; end -= 1) {
            for (let i = 0; i < end; i += 1) {
                steps.push(
                    makeAlgoStep(
                        arr,
                        [i, i + 1],
                        Array.from({ length: arr.length - 1 - end }, (_, n) => end + 1 + n),
                        `比较 ${arr[i]} 和 ${arr[i + 1]}。`,
                        { i, j: i + 1 }
                    )
                );
                if (arr[i] > arr[i + 1]) {
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                    steps.push(
                        makeAlgoStep(
                            arr,
                            [i, i + 1],
                            Array.from({ length: arr.length - end }, (_, n) => end + n),
                            `左边更大，交换这两个元素。`,
                            { i, j: i + 1 }
                        )
                    );
                } else {
                    steps.push(
                        makeAlgoStep(
                            arr,
                            [i, i + 1],
                            Array.from({ length: arr.length - 1 - end }, (_, n) => end + 1 + n),
                            `顺序正确，不交换。`,
                            { i, j: i + 1 }
                        )
                    );
                }
            }
            steps.push(
                makeAlgoStep(
                    arr,
                    [end],
                    Array.from({ length: arr.length - end }, (_, n) => end + n),
                    `本轮结束，最大值已经冒泡到位置 ${end}。`,
                    { end }
                )
            );
        }
        steps.push(
            makeAlgoStep(
                arr,
                [],
                arr.map((_, i) => i),
                "冒泡排序完成：相邻元素不断比较和交换。"
            )
        );
        return steps;
    }

    function ensureAlgoVizSteps() {
        const viz = state.data.algoViz || {
            kind: "bubble",
            values: "8,3,5,1,9,2",
            steps: [],
            index: 0,
            playing: false
        };
        if (!viz.steps || !viz.steps.length) {
            viz.steps = buildAlgoSteps(viz.kind || "bubble", viz.values || "8,3,5,1,9,2");
            viz.index = 0;
            state.data.algoViz = viz;
        }
        return viz;
    }

    function renderAlgoScene(viz, step, max) {
        if (viz.kind === "queue") {
            return `<div class="algo-queue-scene">
                <div class="queue-exit">出队</div>
                <div class="queue-track">
                    ${step.array
                        .map((value, index) => {
                            const active = step.active.includes(index);
                            const sorted = step.sorted.includes(index);
                            return `<div class="queue-cell ${active ? "active" : ""} ${sorted ? "done" : ""}">
                            <b>${escapeHtml(value)}</b>
                            ${index === step.pointers?.front ? `<span>Front</span>` : ""}
                            ${index === step.pointers?.rear ? `<i>Rear</i>` : ""}
                        </div>`;
                        })
                        .join("")}
                </div>
                <div class="queue-entry">入队</div>
            </div>`;
        }
        if (viz.kind === "linked") {
            return `<div class="algo-linked-scene">
                ${step.array
                    .map((value, index) => {
                        const active = step.active.includes(index);
                        const done = step.sorted.includes(index);
                        const pointer =
                            step.pointers?.current === index
                                ? "current"
                                : step.pointers?.prev === index
                                  ? "prev"
                                  : step.pointers?.next === index
                                    ? "next"
                                    : "";
                        return `<div class="linked-unit ${active ? "active" : ""} ${done ? "done" : ""}">
                        <div class="linked-node">
                            ${pointer ? `<em>${escapeHtml(pointer)}</em>` : ""}
                            <b>${escapeHtml(value)}</b>
                            <span>next</span>
                        </div>
                        ${index < step.array.length - 1 ? `<div class="linked-arrow"><i></i></div>` : `<div class="linked-null">NULL</div>`}
                    </div>`;
                    })
                    .join("")}
            </div>`;
        }
        if (viz.kind === "binary") {
            return `<div class="algo-array-scene search">
                ${step.array
                    .map((value, index) => {
                        const active = step.active.includes(index);
                        const found = step.sorted.includes(index);
                        const outside =
                            step.pointers?.left !== undefined &&
                            (index < step.pointers.left || index > step.pointers.right) &&
                            !found;
                        return `<div class="array-tile ${active ? "active" : ""} ${found ? "done" : ""} ${outside ? "muted" : ""}">
                        <b>${escapeHtml(value)}</b><span>${index}</span>
                    </div>`;
                    })
                    .join("")}
            </div>`;
        }
        const isSwap = /交换/.test(step.message || "") && step.active.length >= 2;
        const activePair = [...step.active].sort((a, b) => a - b);
        return `<div class="algo-array-scene ${isSwap ? "is-swapping" : ""}">
            ${step.array
                .map((value, index) => {
                    const active = step.active.includes(index);
                    const sorted = step.sorted.includes(index);
                    const swapClass =
                        isSwap && active
                            ? index === activePair[0]
                                ? "swap-left"
                                : index === activePair[1]
                                  ? "swap-right"
                                  : ""
                            : "";
                    const height = Math.max(34, Math.round((value / max) * 128));
                    return `<div class="array-bar ${active ? "active" : ""} ${sorted ? "done" : ""} ${swapClass}" style="--h:${height}px">
                    <b>${escapeHtml(value)}</b><i></i><span>${index}</span>
                </div>`;
                })
                .join("")}
            ${isSwap ? `<div class="swap-action-badge">${icon("refresh", 14)}交换中</div>` : ""}
        </div>`;
    }

    function renderAlgorithmVisualizer() {
        const viz = ensureAlgoVizSteps();
        const step = viz.steps[Math.max(0, Math.min(viz.index || 0, viz.steps.length - 1))] || makeAlgoStep([]);
        const max = Math.max(...step.array, 1);
        const progress = viz.steps.length > 1 ? Math.round(((viz.index || 0) / (viz.steps.length - 1)) * 100) : 0;
        const nearbySteps = viz.steps
            .map((item, index) => ({ ...item, index }))
            .slice(Math.max(0, (viz.index || 0) - 2), Math.min(viz.steps.length, (viz.index || 0) + 3));
        const pointerText =
            step.pointers?.target !== undefined
                ? `目标 ${step.pointers.target}${step.pointers.left !== undefined ? ` · 区间 [${step.pointers.left}, ${step.pointers.right}]` : ""}`
                : step.pointers?.i !== undefined
                  ? `i=${step.pointers.i}${step.pointers.j !== undefined ? ` · j=${step.pointers.j}` : ""}${step.pointers.min !== undefined ? ` · min=${step.pointers.min}` : ""}`
                  : "等待演示";
        return `<section class="algo-viz-card">
            <div class="card-head">
                <div><h3 class="section-title">${icon("bar", 18)}算法结构演示器</h3><p class="muted-line">不同算法使用不同视觉模型：数组、队列、链表和查找窗口各自按真实结构展示。</p></div>
                <span class="pill">${progress}%</span>
            </div>
            <div class="algo-viz-controls">
                <select class="input" data-algo-kind>
                    <option value="bubble" ${viz.kind === "bubble" ? "selected" : ""}>冒泡排序</option>
                    <option value="selection" ${viz.kind === "selection" ? "selected" : ""}>选择排序</option>
                    <option value="binary" ${viz.kind === "binary" ? "selected" : ""}>二分查找</option>
                    <option value="queue" ${viz.kind === "queue" ? "selected" : ""}>队列 FIFO</option>
                    <option value="linked" ${viz.kind === "linked" ? "selected" : ""}>链表遍历/反转</option>
                </select>
                <input class="input" data-algo-values value="${escapeAttr(viz.values || "")}" placeholder="输入数组，如 8,3,5,1,9,2">
                <button class="btn tiny ghost" data-algo-generate>${icon("refresh", 14)}生成</button>
            </div>
            <div class="algo-viz-theater clean">
                ${renderAlgoScene(viz, step, max)}
                <aside class="algo-hud">
                    <span>${viz.kind === "queue" ? "FIFO Queue" : viz.kind === "linked" ? "Linked List" : viz.kind === "binary" ? "Search Window" : "Array Algorithm"}</span>
                    <b>${escapeHtml(pointerText)}</b>
                    <small>Step ${(viz.index || 0) + 1} / ${viz.steps.length}</small>
                </aside>
            </div>
            <div class="algo-viz-status">
                <b>${escapeHtml(step.message)}</b>
                <span>${escapeHtml(pointerText)}</span>
            </div>
            <div class="algo-viz-progress"><i style="width:${progress}%"></i></div>
            <div class="algo-step-timeline">
                ${nearbySteps
                    .map(
                        item => `<button class="${item.index === (viz.index || 0) ? "active" : ""}" data-algo-jump="${item.index}">
                    <b>${String(item.index + 1).padStart(2, "0")}</b>
                    <span>${escapeHtml(item.message)}</span>
                </button>`
                    )
                    .join("")}
            </div>
            <div class="algo-viz-actions">
                <button class="btn tiny ghost" data-algo-reset>${icon("refresh", 14)}重置</button>
                <button class="btn tiny ghost" data-algo-prev>${icon("arrow-left", 14)}上一步</button>
                <button class="btn tiny primary" data-algo-play>${icon(viz.playing ? "clock" : "play", 14)}${viz.playing ? "暂停" : "播放"}</button>
                <button class="btn tiny ghost" data-algo-next>${icon("arrow-right", 14)}下一步</button>
            </div>
        </section>`;
    }

    function reportAiLearningView(result) {
        const dashboard = result.dashboard?.data || result.dashboard || {};
        const test = result.adaptiveTest?.data || {};
        const path = result.learningPath?.data || {};
        const review = result.reviewSchedule?.data || [];
        return `<article class="card report-result-card"><div class="card-head"><h2 class="section-title">${icon("brain", 18)}AI学习建议</h2><span class="pill">个性化</span></div>
            <div class="report-kpi-row">
                <div><b>${dashboard.mastery?.average ?? 0}%</b><span>平均掌握度</span></div>
                <div><b>${test.totalQuestions || 0}</b><span>自适应题量</span></div>
                <div><b>${path.totalNodes || 0}</b><span>路径节点</span></div>
                <div><b>${review.length || 0}</b><span>复习任务</span></div>
            </div>
            <div class="report-split">
                <div><h3>薄弱点诊断</h3><div class="list">${(test.focusNodes || [])
                    .slice(0, 4)
                    .map(
                        n =>
                            `<div class="list-row"><span>${escapeHtml(n.name)}<small>掌握度 ${n.mastery}%</small></span><span class="pill warn">优先</span></div>`
                    )
                    .join("")}</div></div>
                <div><h3>路径调整依据</h3><p>${escapeHtml(dashboard.energy?.suggestion || "系统已基于掌握度、练习和复习计划生成学习建议。")}</p></div>
            </div>
        </article>`;
    }

    function reportDemoLoopView(result) {
        const path = result.path || {};
        const packageInfo = result.resourcePackage || {};
        const review = result.reviewSchedule || [];
        return `<article class="card report-result-card demo-loop-card"><div class="card-head"><h2 class="section-title">${icon("bolt", 18)}完整学习闭环</h2><span class="pill good">可跟踪</span></div>
            <div class="demo-story"><b>${escapeHtml(result.scenario?.goal || "个性化学习目标")}</b><p>${escapeHtml(result.scenario?.story || "")}</p></div>
            <div class="report-flow">${["画像诊断", "路径规划", "资源包生成", "练习/代码实训", "后测更新", "复习计划"].map((step, i) => `<div><b>${i + 1}</b><span>${step}</span></div>`).join("")}</div>
            <div class="report-split">
                <div><h3>生成资源类型</h3><div class="tag-cloud">${(packageInfo.types || []).map(t => `<span>${escapeHtml(t)}</span>`).join("")}</div></div>
                <div><h3>推荐路径</h3><div class="list">${(path.nodes || [])
                    .slice(0, 4)
                    .map(
                        n =>
                            `<div class="list-row"><span>${escapeHtml(n.name)}<small>${escapeHtml(n.subject || "")} · ${n.mastery}%</small></span><span class="pill">${escapeHtml(n.status || "pending")}</span></div>`
                    )
                    .join("")}</div></div>
            </div>
            <div class="review-strip">${review
                .slice(0, 4)
                .map(r => `<span>${escapeHtml(r.nodeName)} · ${r.intervalDays}天后复习</span>`)
                .join("")}</div>
        </article>`;
    }

    function examView() {
        return `<main class="page"><section class="hero"><h1>考试练习中心</h1><p>围绕薄弱知识点组织练习和考试，学生答题后即时获得反馈，教师可查看掌握变化。</p></section>
            <section class="exam-grid"><article class="card"><h2 class="section-title">${icon("pen", 18)}智能组卷配置</h2><div class="form-row"><b>学科</b><select><option>薄弱点优先</option></select></div><div class="form-row"><b>难度</b><select><option>自适应</option></select></div><button class="btn teal full" data-generate-plan>${icon("bolt", 17)}按薄弱点生成练习</button></article>
            <article class="card preview"><div><div class="card-head"><h2 class="section-title">${icon("exam", 18)}闭环练习预览</h2><span class="pill">Open Trivia DB</span></div><h2>${escapeHtml(state.data.dailyQuestion?.knowledgeTitle || "算法设计")}</h2><p>答题后系统会更新掌握度，并自动生成错题推荐。</p><button class="btn teal" data-scroll-question>${icon("play", 17)}开始答题</button></div><div class="illustration"><span class="cube"></span></div></article></section>
            <section class="grid-3 exam-lower">${dailyQuestionCard()}<article class="card"><div class="card-head"><h2 class="section-title">${icon("trophy", 18)}练习推荐</h2></div><div class="list">${state.data.recommendations.map(r => `<div class="list-row"><b>${escapeHtml(r.title)}</b><span class="pill">${escapeHtml(r.action_label || "推荐")}</span></div>`).join("")}</div></article><article class="card"><h2 class="section-title">${icon("chart", 18)}考试数据</h2><div class="grid-2 mini-stats"><div><b>${state.data.taskSummary.done}</b><span>完成任务</span></div><div><b>${state.data.metrics[1]?.[2] || 0}%</b><span>掌握度</span></div><div><b>${state.data.metrics[2]?.[2] || 0}%</b><span>效率</span></div><div><b>${state.data.metrics[3]?.[2] || 0}天</b><span>连续学习</span></div></div></article></section>
        </main>`;
    }

    function modeMeta(mode) {
        const map = {
            practice: {
                title: "专项练习",
                desc: "按薄弱计算机知识点推题，答完立即反馈并回写掌握度。",
                label: "练习",
                button: "提交练习",
                count: "6题"
            },
            test: {
                title: "阶段测试",
                desc: "覆盖多个计算机知识模块，适合检查阶段性掌握情况。",
                label: "测试",
                button: "提交测试",
                count: "10题"
            },
            onlineExam: {
                title: "在线考试",
                desc: "模拟正式考试环境，限时完成、统一评分、生成闭环建议。",
                label: "考试",
                button: "交卷评分",
                count: "20题"
            }
        };
        return map[mode] || map.practice;
    }

    function assessmentSubject(mode) {
        return mode === "test" ? state.data.selectedSubject : "all";
    }

    function assessmentKey(mode) {
        return `${mode}:${assessmentSubject(mode)}`;
    }

    function assessmentDurationMinutes(mode, set) {
        return Number(set.duration || (mode === "onlineExam" ? 45 : mode === "test" ? 30 : 15));
    }

    function startAssessmentTimer(mode, set) {
        const key = assessmentKey(mode);
        state.data.assessmentTimers[key] = {
            startedAt: Date.now(),
            durationSeconds: assessmentDurationMinutes(mode, set) * 60
        };
    }

    function getAssessmentRemaining(mode, set) {
        const timer = state.data.assessmentTimers[assessmentKey(mode)];
        if (!timer) return assessmentDurationMinutes(mode, set) * 60;
        const elapsed = Math.floor((Date.now() - Number(timer.startedAt || Date.now())) / 1000);
        return Math.max(0, Number(timer.durationSeconds || assessmentDurationMinutes(mode, set) * 60) - elapsed);
    }

    function formatClock(seconds) {
        const total = Math.max(0, Number(seconds) || 0);
        const minutes = Math.floor(total / 60);
        const rest = total % 60;
        return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
    }

    function syncAssessmentClock() {
        if (examClockHandle) {
            clearInterval(examClockHandle);
            examClockHandle = null;
        }
        const clock = document.querySelector("[data-exam-clock]");
        if (!clock) return;
        const mode = clock.dataset.examMode;
        const subject = assessmentSubject(mode);
        const set = state.data.questionSets[`${mode}:${subject}`] || {};
        const tick = () => {
            const remaining = getAssessmentRemaining(mode, set);
            const duration = Number(clock.dataset.examDuration || assessmentDurationMinutes(mode, set) * 60);
            const percent = duration ? Math.max(0, Math.min(100, Math.round((remaining / duration) * 100))) : 0;
            const timeNode = clock.querySelector("b");
            const barNode = clock.querySelector(".exam-time-bar i");
            if (timeNode) timeNode.textContent = formatClock(remaining);
            if (barNode) barNode.style.width = `${percent}%`;
            clock.classList.toggle("is-warning", remaining <= 300);
            if (remaining <= 0 && examClockHandle) {
                clearInterval(examClockHandle);
                examClockHandle = null;
                toast("考试时间已到，请尽快交卷");
            }
        };
        tick();
        examClockHandle = setInterval(tick, 1000);
    }

    function assessmentView(mode) {
        const meta = modeMeta(mode);
        const subject = assessmentSubject(mode);
        const set = state.data.questionSets[`${mode}:${subject}`] || {};
        const questions = set.questions || [];
        const answers = state.data.answerDrafts[mode] || {};
        const result = set.result;
        const started = state.data.assessmentStarted[mode] || Boolean(result);
        if (!started) return assessmentStartView(mode, meta, set);
        if (result) return assessmentResultView(mode, meta, set, answers, result);
        return assessmentFocusView(mode, meta, set, questions, answers);
    }

    function assessmentFocusView(mode, meta, set, questions, answers) {
        const answered = Object.keys(answers).length;
        const total = questions.length || Number(String(meta.count).replace(/\D/g, "")) || 0;
        const remaining = getAssessmentRemaining(mode, set);
        const durationSeconds = assessmentDurationMinutes(mode, set) * 60;
        const remainPercent = durationSeconds
            ? Math.max(0, Math.min(100, Math.round((remaining / durationSeconds) * 100)))
            : 0;
        return `<main class="exam-focus-page">
            <header class="exam-focus-header">
                <div>
                    <span class="pill">${escapeHtml(meta.label)}进行中</span>
                    <h1>${escapeHtml(meta.title)}</h1>
                    <p>${mode === "onlineExam" ? "请在规定时间内独立完成全部题目，交卷后系统会生成学习报告。" : "请专注完成本次题目，提交后查看掌握情况。"}</p>
                </div>
                <div class="exam-focus-clock" data-exam-clock data-exam-mode="${mode}" data-exam-duration="${durationSeconds}">
                    <b>${formatClock(remaining)}</b>
                    <span>剩余时间</span>
                    <div class="exam-time-bar"><i style="width:${remainPercent}%"></i></div>
                </div>
                <button class="btn ghost" data-reset-assessment="${mode}">${icon("x", 16)}退出考试</button>
            </header>
            <section class="exam-focus-status">
                <div><b>${total}</b><span>题目总数</span></div>
                <div><b data-exam-answered>${answered}</b><span>已答题目</span></div>
                <div><b>${Math.max(0, total - answered)}</b><span>未答题目</span></div>
                <button class="btn primary" data-submit-question-set="${mode}">${icon("check", 17)}${escapeHtml(meta.button)}</button>
            </section>
            <section class="exam-focus-layout">
                <aside class="exam-answer-sheet">
                    <h2>${icon("list", 17)}答题卡</h2>
                    <div class="answer-sheet-grid">
                        ${questions.map((q, index) => `<a href="#q_${q.id}" class="${answers[q.id] ? "done" : ""}">${index + 1}</a>`).join("")}
                    </div>
                </aside>
                <article class="exam-question-only">
                    ${questions.length ? questions.map((q, index) => questionSetItem(mode, q, index, answers, null)).join("") : `<div class="empty-state"><h3>暂无题目</h3><p>请退出后重新组题。</p></div>`}
                </article>
            </section>
        </main>`;
    }

    function assessmentStartView(mode, meta, set) {
        const subject = mode === "test" ? state.data.selectedSubject : "计算机综合";
        const subjects = mode === "test" ? subjectTestSelector() : examScopeBanner(mode);
        const blueprint = set.blueprint || null;
        const flow = [
            ["brain", "AI诊断范围", mode === "test" ? `聚焦 ${subject}` : "覆盖全部计算机核心模块"],
            ["exam", "沉浸答题", `${set.questions?.length || meta.count} · ${set.duration || 20} 分钟`],
            ["chart", "即时评分", "完成后生成能力雷达与错题归因"],
            ["pen", "笔记闭环", "一键整理错题笔记并推送复习任务"]
        ];
        return `<main class="page assessment-start-page">
            <section class="test-hero">
                <div><span class="pill">${escapeHtml(meta.label)}</span><h1>${escapeHtml(meta.title)}</h1><p>${escapeHtml(meta.desc)}</p>
                    <div class="hero-actions"><button class="btn primary glow" data-start-assessment="${mode}">${icon("play", 17)}开始${escapeHtml(meta.label)}</button><button class="btn ghost" data-load-question-set="${mode}">${icon("refresh", 17)}换一套题</button></div>
                </div>
                <div class="test-brief">
                    <div><b>${set.questions?.length || meta.count}</b><span>题量</span></div>
                    <div><b>${set.duration || (mode === "onlineExam" ? 45 : 20)}</b><span>分钟</span></div>
                    <div><b>${escapeHtml(subject)}</b><span>${mode === "test" ? "测试学科" : "考试范围"}</span></div>
                </div>
            </section>
            ${subjects}
            <section class="test-flow">${flow.map(([ic, title, desc]) => `<article><span>${icon(ic, 20)}</span><b>${title}</b><small>${desc}</small></article>`).join("")}</section>
            ${
                mode === "test" && blueprint
                    ? `<section class="card stage-blueprint">
                <div class="card-head"><div><span class="pill good">自动组卷</span><h2 class="section-title">${icon("route", 18)}根据学习路径和画像生成</h2><p>本次阶段测试不是固定题组，会优先覆盖当前路径中的薄弱节点、错题节点和笔记缺口。</p></div></div>
                <div class="stage-blueprint-grid">
                    <div><b>${escapeHtml(blueprint.profileStyle || "画像校准中")}</b><span>画像风格</span></div>
                    <div><b>${escapeHtml(String(blueprint.attentionSpan || set.duration || 20))} 分钟</b><span>专注时长</span></div>
                    <div><b>${(blueprint.focusPoints || []).length}</b><span>覆盖路径节点</span></div>
                </div>
                <div class="stage-focus-list">${(blueprint.focusPoints || [])
                    .slice(0, 6)
                    .map(
                        point =>
                            `<div><b>${escapeHtml(point.title)}</b><span>${escapeHtml(point.subject)} · 掌握度 ${point.mastery}% · 错题 ${point.wrongCount || 0} · 组卷分 ${point.pathScore}</span></div>`
                    )
                    .join("")}</div>
                <div class="tag-row">${(blueprint.evidence || []).map(item => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>
            </section>`
                    : ""
            }
            <section class="grid-2"><article class="card"><h2 class="section-title">${icon("list", 18)}本次能力目标</h2><div class="objective-list">${(
                set.questions || []
            )
                .slice(0, 5)
                .map(
                    q =>
                        `<div><b>${escapeHtml(q.knowledgeTitle)}</b><span>${escapeHtml(q.subject)} · 掌握度 ${q.mastery}%</span></div>`
                )
                .join(
                    ""
                )}</div></article><article class="card"><h2 class="section-title">${icon("robot", 18)}AI考前建议</h2><p class="coach-copy">${mode === "onlineExam" ? "先快速完成确定题，再回到需要推理的题。系统会在交卷后把错题归因、笔记整理和复习任务串成闭环。" : "这不是单纯刷题。每道题都会参与画像更新，完成后 AI 会告诉你本学科下一步该补定义、练应用，还是整理误区卡。"}</p></article></section>
        </main>`;
    }

    function assessmentResultView(mode, meta, set, answers, result) {
        const wrong = (result.details || []).filter(item => !item.isCorrect);
        const strong = (result.details || []).filter(item => item.isCorrect).slice(0, 3);
        return `<main class="page assessment-result-page">
            <section class="result-hero">
                <div class="score-ring" style="--score:${result.score || 0}%"><b>${result.score}</b><span>AI评分</span></div>
                <div><span class="pill">${escapeHtml(meta.label)}完成</span><h1>${result.score >= 80 ? "表现不错，进入迁移巩固" : result.score >= 60 ? "基础可用，需要补齐误区" : "需要先修复核心概念"}</h1><p>答对 ${result.correct} / ${result.total}。系统已写回答题记录、知识点掌握度和学习画像。</p>
                    <div class="hero-actions"><button class="btn primary glow" data-ai-wrong-notes="${mode}">${icon("pen", 17)}AI整理错题笔记</button><button class="btn ghost" data-generate-plan>${icon("refresh", 17)}生成复习计划</button><button class="btn ghost" data-reset-assessment="${mode}">${icon("exam", 17)}再测一次</button></div>
                </div>
            </section>
            <section class="result-grid">
                <article class="card ai-commentary"><h2 class="section-title">${icon("robot", 18)}AI点评</h2><p>${aiReviewText(result, mode)}</p><div class="comment-tags"><span>概念掌握 ${Math.max(35, result.score - 5)}%</span><span>应用稳定性 ${Math.max(30, result.score - 12)}%</span><span>复习优先级 ${wrong.length ? "高" : "中"}</span></div></article>
                <article class="card"><h2 class="section-title">${icon("chart", 18)}能力雷达</h2><div class="ability-bars">${[
                    "记忆",
                    "理解",
                    "应用",
                    "分析",
                    "迁移"
                ]
                    .map((name, i) => {
                        const v = Math.max(22, Math.min(96, (result.score || 0) - i * 6 + (i === 0 ? 10 : 0)));
                        return `<div><span>${name}</span><b>${v}%</b><div class="bar"><span style="width:${v}%"></span></div></div>`;
                    })
                    .join("")}</div></article>
                <article class="card wrong-panel"><div class="card-head"><h2 class="section-title">${icon("file", 18)}错题分析</h2><button class="btn tiny ghost" data-ai-wrong-notes="${mode}">生成笔记</button></div>${wrong.length ? `<div class="list">${wrong.map(item => `<div class="list-row"><span>${escapeHtml(item.knowledgeTitle)}<small>正确答案：${escapeHtml(item.correctAnswer)} · 建议补概念定义和边界条件</small></span><button class="btn tiny ghost" data-view="smartNotes">整理</button></div>`).join("")}</div>` : `<div class="empty-state compact"><p>本次没有错题，可以进入迁移练习。</p></div>`}</article>
                <article class="card"><h2 class="section-title">${icon("check", 18)}优势知识点</h2><div class="list">${strong.map(item => `<div class="list-row"><span>${escapeHtml(item.knowledgeTitle)}<small>已答对 · 掌握度更新到 ${item.nextMastery}%</small></span><span class="pill good">稳定</span></div>`).join("") || "<p>完成更多题后生成优势分析。</p>"}</div></article>
            </section>
        </main>`;
    }

    function aiReviewText(result, mode) {
        if ((result.score || 0) >= 80)
            return `${mode === "onlineExam" ? "综合考试" : "分科测试"}结果显示你已经具备较稳定的计算机知识框架。下一步建议做跨知识点迁移题，并把仍然犹豫的题整理成主动回忆卡。`;
        if ((result.score || 0) >= 60)
            return "你有一定基础，但错题暴露出概念边界和应用条件还不够稳。建议先整理错题笔记，再做一轮同学科补救练习。";
        return "本次结果说明前置概念需要修复。AI建议先回到薄弱知识点的直观解释，完成概念卡和低难度练习后再测试。";
    }

    function examScopeBanner(mode) {
        if (mode !== "onlineExam") return "";
        return `<section class="card scope-banner"><div><h2 class="section-title">${icon("exam", 18)}综合计算机考试</h2><p>考试不按单一学科拆分，会从数据结构、操作系统、网络、数据库、软件工程、人工智能等方向综合抽题。</p></div><button class="btn ghost" data-view="test">${icon("file", 17)}改做分科测试</button></section>`;
    }

    function subjectTestSelector() {
        const subjects = state.data.subjects.length
            ? state.data.subjects
            : [{ subject: state.data.selectedSubject, questionCount: 0, avgMastery: 0 }];
        return `<section class="subject-strip">${subjects
            .map(
                item => `
            <button class="subject-card ${item.subject === state.data.selectedSubject ? "active" : ""}" data-select-subject="${escapeHtml(item.subject)}">
                <b>${escapeHtml(item.subject)}</b>
                <span>${item.questionCount || 0} 题 · 掌握度 ${item.avgMastery || 0}%</span>
            </button>`
            )
            .join("")}</section>`;
    }

    function questionSetItem(mode, q, index, answers, result) {
        const detail = result?.details?.find(item => Number(item.id) === Number(q.id));
        return `<div class="paper-question" id="q_${q.id}">
            <div class="paper-title"><b>${index + 1}. ${escapeHtml(q.question)}</b><span class="pill">${escapeHtml(q.knowledgeTitle || "计算机")}</span></div>
            <div class="choice-grid">${(q.options || [])
                .map((option, i) => {
                    const selected = answers[q.id] === option;
                    const checked = detail
                        ? detail.correctAnswer === option
                            ? "ok"
                            : selected
                              ? "bad"
                              : ""
                        : selected
                          ? "selected"
                          : "";
                    return `<button class="choice ${checked}" data-set-mode="${mode}" data-set-question="${q.id}" data-set-answer="${escapeHtml(option)}"><b>${"ABCD"[i] || i + 1}</b>${escapeHtml(option)}</button>`;
                })
                .join("")}</div>
            ${detail ? `<div class="answer-result">${detail.isCorrect ? `<span class="pill good">正确，掌握度更新到 ${detail.nextMastery}%</span>` : `<span class="pill warn">正确答案：${escapeHtml(detail.correctAnswer)}</span>`}</div>` : ""}
        </div>`;
    }

    function smartNotesView() {
        const center = state.data.notesCenter || {};
        const notes = center.notes || [];
        const subjects = center.subjects || [];
        const timeline = center.timeline || [];
        const reviewQueue = center.reviewQueue || [];
        const cards = center.cards || [];
        const selected = notes.find(note => Number(note.id) === Number(state.data.selectedNoteId)) || notes[0] || null;
        const sourceLabels = {
            all: "全部来源",
            manual: "手动",
            course: "课程",
            practice: "专项练习",
            test: "阶段测试",
            exam: "在线考试",
            ai: "AI助手",
            tutor: "AI导师"
        };
        const sourceStats = notes.reduce((acc, note) => {
            const key = note.source_type || "manual";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const titleValue = selected ? selected.title : "";
        const bodyValue = selected ? selected.body : "";
        const subjectValue = selected?.subject || subjects[0]?.subject || state.data.selectedSubject || "综合";
        const tagsValue = selected?.tags?.length ? selected.tags.join("，") : subjectValue;
        return `<main class="page notes-page"><section class="hero-row"><div class="hero"><h1>笔记复习</h1><p>课程、练习、考试和个人记录沉淀为可编辑笔记，并同步到 Obsidian Markdown，形成可双链、可复习的长期知识库。</p><div class="hero-actions"><button class="btn primary glow" data-new-note>${icon("pen", 17)}新建笔记</button><button class="btn ghost" data-view="course">${icon("book", 17)}从课程学习</button><button class="btn ghost" data-view="onlineExam">${icon("exam", 17)}从考试复盘</button><button class="btn ghost" data-view="knowledgeGraph">${icon("radar", 17)}Obsidian双链图谱</button><button class="btn ghost" data-view="conceptCanvas">${icon("layout", 17)}概念画布</button></div></div>${metricCards()}</section>
            <section class="note-stats">
                <article class="card"><b>${notes.length}</b><span>当前筛选笔记</span></article>
                <article class="card"><b>${reviewQueue.length}</b><span>今日待复习</span></article>
                <article class="card"><b>${cards.length}</b><span>复习卡片</span></article>
                <article class="card"><b>${subjects.length}</b><span>学科分类</span></article>
            </section>
            <section class="card note-source-explain">
                <div class="card-head"><div><span class="pill">动态笔记库</span><h2 class="section-title">${icon("db", 18)}笔记来源与写入条件</h2><p>笔记库不是固定内容。只有手动保存、课程进度、练习/测试提交、考试复盘或 AI 回答保存时，才会写入 notes 和复习卡。</p></div></div>
                <div class="note-source-grid">
                    ${[
                        ["manual", "手动保存", "在笔记页点击保存，写入 notes，默认次日复习。"],
                        ["course", "课程学习", "课程进度更新后自动生成课程学习记录。"],
                        ["practice", "专项练习", "提交练习后生成错题/迁移复盘笔记。"],
                        ["test", "阶段测试", "按学习路径和画像组卷，提交后写入阶段测试复盘。"],
                        ["exam", "在线考试", "交卷后写入考试复盘和错题闭环。"],
                        ["ai", "AI助手", "AI 对话选择保存，或笔记模式沉淀为结构化笔记。"]
                    ]
                        .map(
                            ([key, title, desc]) =>
                                `<div class="note-source-item ${sourceStats[key] ? "active" : ""}"><b>${escapeHtml(title)}</b><p>${escapeHtml(desc)}</p><span>${sourceStats[key] || 0} 条</span></div>`
                        )
                        .join("")}
                </div>
            </section>
            <section class="notes-workbench">
                <aside class="card note-sidebar">
                    <div class="card-head"><h2 class="section-title">${icon("search", 18)}笔记库</h2><button class="btn tiny ghost" data-new-note>添加</button></div>
                    <div class="note-filter-row">
                        <select data-note-filter-subject><option value="all">全部学科</option>${subjects.map(item => `<option value="${escapeHtml(item.subject)}" ${state.data.noteFilterSubject === item.subject ? "selected" : ""}>${escapeHtml(item.subject)} · ${item.total}</option>`).join("")}</select>
                        <select data-note-filter-source>${["all", "manual", "course", "practice", "test", "exam", "ai"].map(key => `<option value="${key}" ${state.data.noteFilterSource === key ? "selected" : ""}>${sourceLabels[key] || key}</option>`).join("")}</select>
                    </div>
                    <div class="note-list">${
                        notes
                            .map(
                                note => `<button class="note-row ${Number(note.id) === Number(selected?.id) ? "active" : ""}" data-note-open="${note.id}">
                        <span><b>${escapeHtml(note.title)}</b><small>${escapeHtml(note.subject || note.knowledge_title || "综合")} · ${escapeHtml(sourceLabels[note.source_type] || note.source_type || "笔记")} · ${formatDate(note.updated_at)}</small></span>
                        <i>${escapeHtml((note.tags || []).slice(0, 2).join(" / ") || "待整理")}</i>
                    </button>`
                            )
                            .join("") ||
                        `<div class="empty-state compact"><p>还没有笔记，先从课程学习或手动添加一条。</p></div>`
                    }</div>
                </aside>
                <article class="card note-editor-panel">
                    <div class="card-head"><div><span class="pill">${selected ? "编辑笔记" : "新建笔记"}</span><h2>${escapeHtml(selected?.title || "新笔记")}</h2></div>${selected ? `<button class="btn tiny ghost" data-delete-note="${selected.id}">${icon("lock", 15)}删除</button>` : ""}</div>
                    <input class="note-title-input" data-note-title value="${escapeHtml(titleValue)}" placeholder="笔记标题">
                    <div class="note-meta-grid"><input data-note-subject value="${escapeHtml(subjectValue)}" placeholder="学科"><input data-note-tags value="${escapeHtml(tagsValue)}" placeholder="标签，用逗号分隔"></div>
                    <textarea class="textarea note-compose" data-note-body placeholder="记录课程关键点、错题原因、考试复盘、自己的理解和下次复习问题。">${escapeHtml(bodyValue)}</textarea>
                    <div class="note-actions"><button class="btn primary" data-save-note-center="${selected?.id || ""}">${icon("check", 17)}保存修改</button>${selected ? `<button class="btn teal" data-note-card="${selected.id}">${icon("robot", 17)}生成复习卡</button><button class="btn ghost" data-review-note="${selected.id}" data-review-quality="good">${icon("refresh", 17)}3天后复习</button>` : ""}</div>
                </article>
                <aside class="side-card">
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("refresh", 18)}复习队列</h2><span class="pill">间隔复习</span></div><div class="list">${reviewQueue.map(note => `<div class="list-row"><span>${escapeHtml(note.title)}<small>${escapeHtml(note.subject || "综合")} · 下次 ${formatDate(note.next_review_at) || "今天"}</small></span><span><button class="btn tiny ghost" data-review-note="${note.id}" data-review-quality="again">明天</button><button class="btn tiny ghost" data-review-note="${note.id}" data-review-quality="easy">熟了</button></span></div>`).join("") || "<p>暂无到期笔记。</p>"}</div></article>
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("file", 18)}卡片</h2><span class="pill">${cards.length}</span></div><div class="note-card-list">${
                        cards
                            .slice(0, 5)
                            .map(
                                card =>
                                    `<div class="smart-card"><span class="pill">${escapeHtml(card.card_type || "card")}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.content?.activeRecall || card.content?.explanation || "")}</p><div class="bar"><span style="width:${card.mastery_signal || 50}%"></span></div></div>`
                            )
                            .join("") || "<p>选择一条笔记生成复习卡。</p>"
                    }</div></article>
                    <article class="card"><h2 class="section-title">${icon("clock", 18)}时间线</h2><div class="list">${timeline.map(item => `<div class="list-row"><span>${formatDate(item.day)}<small>新增或更新笔记</small></span><span class="pill">${item.total}</span></div>`).join("") || "<p>暂无时间记录。</p>"}</div></article>
                </aside>
            </section></main>`;
    }

    function knowledgeGraphView() {
        const graphData = state.data.knowledgeGraph || { nodes: [], edges: [] };
        const nodes = graphData.nodes || [];
        const edges = graphData.edges || [];

        return `<main class="page knowledge-graph-page">
            <section class="hero-row">
                <div class="hero">
                    <h1>${icon("radar", 24)} 知识网络图谱</h1>
                    <p>可视化你的知识体系。节点越大越重要，颜色越深掌握越好。</p>
                    <div class="hero-actions">
                        <button class="btn ghost" data-view="smartNotes">${icon("book", 16)} 返回笔记</button>
                        <button class="btn primary" data-kg-refresh>${icon("refresh", 16)} 刷新图谱</button>
                        <button class="btn ghost" data-view="conceptCanvas">${icon("layout", 16)} 概念画布</button>
                    </div>
                </div>
            </section>
            <section class="kg-container">
                <div class="card kg-sidebar">
                    <div class="card-head"><h3>${icon("list", 16)} 图例</h3></div>
                    <div class="kg-legend">
                        <div class="kg-legend-item"><span class="kg-dot note"></span> 笔记</div>
                        <div class="kg-legend-item"><span class="kg-dot knowledge"></span> 知识点</div>
                        <div class="kg-legend-item"><span class="kg-line"></span> 关联</div>
                    </div>
                    <div class="kg-stats">
                        <div class="kg-stat"><b>${nodes.length}</b><span>节点</span></div>
                        <div class="kg-stat"><b>${edges.length}</b><span>连线</span></div>
                    </div>
                </div>
                <div class="card kg-canvas-wrapper">
                    <canvas id="kg-canvas" width="800" height="600"></canvas>
                    ${nodes.length === 0 ? '<div class="kg-empty"><p>还没有知识节点。去<a href="#" data-view="smartNotes">记笔记</a>或<a href="#" data-view="path">学习课程</a>来构建你的知识网络。</p></div>' : ""}
                </div>
                <div class="card kg-detail" id="kg-detail">
                    <div class="card-head"><h3>${icon("info", 16)} 节点详情</h3></div>
                    <div id="kg-detail-content"><p class="text-muted">点击图谱中的节点查看详情</p></div>
                </div>
            </section>
            <section class="kg-add-link-section card">
                <div class="card-head"><h3>${icon("link", 16)} 添加笔记关联</h3></div>
                <div class="kg-link-form">
                    <label class="field-label">源笔记</label>
                    <select class="input" id="kg-source-note">
                        <option value="">选择笔记...</option>
                        ${graphData._notesForSelect ? graphData._notesForSelect.map(n => `<option value="${n.id}">${escapeHtml(n.title)}</option>`).join("") : ""}
                    </select>
                    <label class="field-label">关联目标（笔记标题或知识点）</label>
                    <input class="input" id="kg-target-title" placeholder="输入目标标题，如：二分查找">
                    <button class="btn primary full-width mt" id="kg-add-link-btn">${icon("plus", 14)} 添加关联</button>
                </div>
            </section>
        </main>`;
    }

    function accountView() {
        const dashboard = state.data.account || {};
        const user = dashboard.user || {};
        const stage = dashboard.stage || { stage: "稳步成长期", emoji: "📈", desc: "正在构建知识体系。" };
        const stats = dashboard.stats || {};
        const subjects = dashboard.subjectScores || [];
        const weak = dashboard.weakPoints || [];
        const courses = dashboard.courses || [];
        const examStats = dashboard.recentExamStats || [];
        const recentAnswers = dashboard.recentAnswers || [];
        const notes = dashboard.notes || [];
        const noteStats = dashboard.noteStats || {};
        const activities = dashboard.activities || [];
        const achievements = dashboard.achievements || [];
        const recommendations = dashboard.recommendations || [];
        const interests = parseInterestTags(user.interests);
        const activeTab = state.data.accountTab || "dashboard";

        return `<main class="page account-page-v2">
            <section class="account-hero-v2">
                <div class="hero-avatar">
                    <span class="avatar-xl">${escapeHtml((user.nickname || user.username || "?").slice(0, 1).toUpperCase())}</span>
                    <span class="online-dot"></span>
                </div>
                <div class="hero-info">
                    <div class="hero-name-row">
                        <h1>${escapeHtml(user.nickname || user.username || "同学")}</h1>
                        <span class="stage-badge">${stage.emoji} ${escapeHtml(stage.stage)}</span>
                    </div>
                    <p class="hero-subtitle">${escapeHtml(stage.desc)}</p>
                    <div class="hero-meta">
                        <span>@${escapeHtml(user.username || "")}</span>
                        <span>连续学习 <b>${stats.continuousDays || 0}</b> 天</span>
                        <span>加入 ${formatDate(user.created_at) || "最近"}</span>
                    </div>
                    <div class="tag-row">${
                        interests
                            .slice(0, 5)
                            .map(tag => `<span class="pill">${escapeHtml(tag)}</span>`)
                            .join("") || '<span class="pill">未设置兴趣</span>'
                    }</div>
                </div>
                <div class="hero-actions-v2">
                    <button class="btn primary glow" data-view="path">${icon("route", 17)}学习路径</button>
                    <button class="btn ghost" data-view="practice">${icon("play", 17)}开始练习</button>
                    <button class="btn ghost" data-account-tab="settings">${icon("settings", 17)}账户设置</button>
                </div>
            </section>
            <nav class="account-tabs">
                ${["dashboard", "courses", "exams", "notes", "settings"]
                    .map(tab => {
                        const labels = {
                            dashboard: "📊 学习概览",
                            courses: "📚 课程信息",
                            exams: "📝 考试记录",
                            notes: "📓 学习笔记",
                            settings: "⚙️ 账户设置"
                        };
                        return `<button class="account-tab ${activeTab === tab ? "active" : ""}" data-account-tab="${tab}">${labels[tab]}</button>`;
                    })
                    .join("")}
            </nav>
            <section class="account-tab-content">
                ${activeTab === "dashboard" ? accountDashboardTab(dashboard, stats, subjects, weak, activities, achievements, recommendations) : ""}
                ${activeTab === "courses" ? accountCoursesTab(courses) : ""}
                ${activeTab === "exams" ? accountExamsTab(examStats, recentAnswers, stats) : ""}
                ${activeTab === "notes" ? accountNotesTab(notes, noteStats) : ""}
                ${activeTab === "settings" ? accountSettingsTab(user, state) : ""}
            </section>
        </main>`;
    }

    function accountDashboardTab(dashboard, stats, subjects, weak, activities, achievements, recommendations) {
        return `<div class="dashboard-grid">
            <section class="dash-stats-row">
                <article class="stat-card"><span class="stat-icon">📖</span><div><b>${Number(stats.studyHours || 0).toFixed(1)}</b><span>学习小时</span></div></article>
                <article class="stat-card"><span class="stat-icon">📚</span><div><b>${stats.completedCourses || 0}</b><span>完成课程</span></div></article>
                <article class="stat-card"><span class="stat-icon">📝</span><div><b>${stats.totalAnswers || 0}</b><span>答题总数</span></div></article>
                <article class="stat-card"><span class="stat-icon">📓</span><div><b>${stats.totalNotes || 0}</b><span>学习笔记</span></div></article>
                <article class="stat-card"><span class="stat-icon">🎯</span><div><b>${stats.mastery || 0}%</b><span>综合掌握度</span></div></article>
                <article class="stat-card"><span class="stat-icon">🔥</span><div><b>${stats.continuousDays || 0}</b><span>连续天数</span></div></article>
            </section>
            <div class="dash-main">
                <article class="card dash-card-full">
                    <div class="card-head"><h2 class="section-title">${icon("chart", 18)}学科掌握度分布</h2><button class="btn tiny ghost" data-view="test">分科测试</button></div>
                    <div class="subject-bars">${
                        subjects
                            .slice(0, 6)
                            .map(
                                s =>
                                    `<div class="subject-bar-row"><span class="subject-label">${escapeHtml(s.subject)}</span><div class="bar-wrap"><div class="bar"><span style="width:${s.mastery || 0}%"></span></div></div><b>${s.mastery || 0}%</b></div>`
                            )
                            .join("") || "<p>暂无学科数据</p>"
                    }</div>
                </article>
                <article class="card dash-card-full">
                    <div class="card-head"><h2 class="section-title">${icon("bell", 18)}最近学习动态</h2><span class="pill">${activities.length || 0} 条</span></div>
                    <div class="activity compact">${
                        activities
                            .slice(0, 6)
                            .map(
                                item =>
                                    `<div class="activity-item" style="--color:${item.color};--soft-color:${item.soft_color}"><span class="round-icon">${icon(item.icon, 17)}</span><div><div class="activity-text">${escapeHtml(item.title)}</div><div class="activity-time">${escapeHtml(item.time_label)}</div></div><span class="pill">${escapeHtml(item.badge || "动态")}</span></div>`
                            )
                            .join("") || "<p>暂无动态</p>"
                    }</div>
                </article>
            </div>
            <div class="dash-side">
                <article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("brain", 18)}AI 学习建议</h2><span class="pill good">个性化</span></div>
                    <div class="recommend-list">${recommendations.map(r => `<button class="list-row action-row" data-view="${escapeHtml(r.target)}"><span>${escapeHtml(r.title)}<small>${escapeHtml(r.reason)}</small></span><span class="pill primary-pill">${escapeHtml(r.action)}</span></button>`).join("") || "<p>暂无建议</p>"}</div>
                </article>
                <article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("alert", 18)}薄弱预警</h2><span class="pill warn">${weak.filter(p => Number(p.mastery || 0) < 60).length} 项</span></div>
                    <div class="weak-list">${
                        weak
                            .slice(0, 4)
                            .map(
                                p =>
                                    `<div class="weak-item"><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.subject)} · ${p.mastery || 0}%</span></div>`
                            )
                            .join("") || "<p>暂无薄弱点</p>"
                    }</div>
                </article>
                ${
                    achievements.length
                        ? `<article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("trophy", 18)}已获成就</h2><span class="pill">${achievements.length} 项</span></div>
                    <div class="achievement-mini">${achievements.map(a => `<div><b>${escapeHtml(a.title)}</b><span class="pill">${escapeHtml(a.badge || "")}</span></div>`).join("")}</div>
                </article>`
                        : ""
                }
            </div>
        </div>`;
    }

    function accountCoursesTab(courses) {
        return `<div class="tab-panel">
            <div class="panel-header"><h2>${icon("book", 20)}我的课程</h2><span class="pill">${courses.length || 0} 门</span></div>
            <div class="course-grid">${
                courses.length
                    ? courses
                          .map(
                              c => `<article class="course-card">
                <div class="course-card-top"><span class="pill difficulty-${(c.difficulty || "").toLowerCase()}">${escapeHtml(c.difficulty || "入门")}</span><span class="course-provider">${escapeHtml(c.provider || "")}</span></div>
                <h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.subject || "综合")}</p>
                <div class="course-progress"><div class="bar"><span style="width:${c.progress || 0}%"></span></div><b>${c.progress || 0}%</b></div>
                <button class="btn tiny ghost" data-course-progress="${c.id}" data-current="${c.progress || 0}">${icon("play", 14)}继续学习</button>
            </article>`
                          )
                          .join("")
                    : '<p class="empty-hint">暂无课程，去首页看看吧 👆</p>'
            }</div>
        </div>`;
    }

    function accountExamsTab(examStats, recentAnswers, stats) {
        return `<div class="tab-panel">
            <div class="panel-header"><h2>${icon("exam", 20)}考试与答题记录</h2><span class="pill">${stats.totalAnswers || 0} 次答题</span></div>
            <div class="exam-stats-row">
                <article class="stat-card"><span class="stat-icon">✅</span><div><b>${stats.accuracy || 0}%</b><span>答题正确率</span></div></article>
                <article class="stat-card"><span class="stat-icon">📊</span><div><b>${stats.totalAnswers || 0}</b><span>总答题数</span></div></article>
                <article class="stat-card"><span class="stat-icon">✔️</span><div><b>${stats.correctAnswers || 0}</b><span>正确题数</span></div></article>
                <article class="stat-card"><span class="stat-icon">⚡</span><div><b>${stats.efficiency || 0}%</b><span>学习效率</span></div></article>
            </div>
            ${
                examStats.length
                    ? `<article class="card"><div class="card-head"><h2 class="section-title">${icon("chart", 18)}7 天正确率趋势</h2></div>
                <div class="trend-bars">${examStats.map(e => `<div class="trend-bar-col"><b>${e.accuracy || 0}%</b><i style="height:${Math.max(8, e.accuracy || 0)}px"></i><span>${String(e.examDate).slice(5)}</span></div>`).join("")}</div>
            </article>`
                    : ""
            }
            <article class="card"><div class="card-head"><h2 class="section-title">${icon("clock", 18)}最近答题</h2><button class="btn tiny ghost" data-view="practice">继续练习</button></div>
                <div class="list">${recentAnswers.length ? recentAnswers.map(item => `<div class="list-row"><span>${escapeHtml(item.knowledgeTitle)}<small>${escapeHtml(item.subject)} · ${escapeHtml(item.question || "").slice(0, 40)}...</small></span><span class="pill ${item.is_correct ? "good" : "warn"}">${item.is_correct ? "正确" : "复习"}</span></div>`).join("") : "<p>暂无答题记录</p>"}</div>
            </article>
        </div>`;
    }

    function accountNotesTab(notes, noteStats) {
        return `<div class="tab-panel">
            <div class="panel-header"><h2>${icon("pen", 20)}我的笔记</h2><div><span class="pill">${noteStats.totalNotes || 0} 篇</span><span class="pill">${noteStats.subjectCount || 0} 个学科</span></div></div>
            <div class="notes-grid">${
                notes.length
                    ? notes
                          .map(n => {
                              const tags = parseInterestTags(n.tags_json);
                              const statusLabels = { new: "新笔记", again: "需复习", good: "已掌握", easy: "轻松" };
                              return `<article class="note-card">
                    <div class="note-card-top"><span class="pill note-status-${n.review_status || "new"}">${statusLabels[n.review_status] || "新笔记"}</span><span class="note-source">${escapeHtml(n.source_type === "course" ? "课程笔记" : n.source_type === "practice" ? "练习笔记" : "手动笔记")}</span></div>
                    <h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.subject || "综合")}</p>
                    <div class="note-tags">${tags
                        .slice(0, 3)
                        .map(t => `<span class="pill tiny">${escapeHtml(t)}</span>`)
                        .join("")}</div>
                    <small>更新于 ${formatDate(n.updated_at) || "最近"}</small>
                </article>`;
                          })
                          .join("")
                    : '<p class="empty-hint">还没有笔记，去智能笔记页面开始写吧 ✍️</p>'
            }</div>
            <div class="panel-actions"><button class="btn primary" data-view="smartNotes">${icon("pen", 17)}去写笔记</button></div>
        </div>`;
    }

    function accountSettingsTab(user, state) {
        const initial = escapeHtml((user.nickname || user.username || "?").slice(0, 1).toUpperCase());
        const interests = parseInterestTags(user.interests);
        return `<div class="tab-panel settings-panel account-settings-redesign">
            <aside class="settings-profile-panel">
                <div class="settings-avatar-ring"><span class="avatar-lg">${initial}</span></div>
                <h2>${escapeHtml(user.nickname || user.username || "同学")}</h2>
                <p>@${escapeHtml(user.username || "")}</p>
                <div class="settings-profile-meta">
                    <span>${icon("user", 14)}${escapeHtml(user.role === "teacher" ? "教师账号" : user.role === "admin" ? "管理员" : "学生账号")}</span>
                    <span>${icon("clock", 14)}加入 ${formatDate(user.created_at) || "最近"}</span>
                    <span>${icon("bell", 14)}邮箱 ${escapeHtml(user.email || "未设置")}</span>
                </div>
                <div class="settings-tag-cloud">${
                    interests
                        .slice(0, 8)
                        .map(tag => `<b>${escapeHtml(tag)}</b>`)
                        .join("") || "<b>未设置兴趣标签</b>"
                }</div>
            </aside>
            <section class="settings-editor-card">
                <div class="settings-section-head">
                    <div><span class="pill">个人资料</span><h2>${icon("user", 20)}基本信息</h2><p>用于学习画像、教师查看和系统推荐展示。</p></div>
                </div>
                <form class="settings-form settings-form-grid" data-settings-form="profile">
                    <div class="form-row avatar-row"><label>头像</label><div class="avatar-upload"><span class="avatar-md">${initial}</span><input type="text" class="input" name="avatar" placeholder="头像 URL，可选" value="${escapeHtml(user.avatar || "")}"></div></div>
                    <div class="form-row"><label>用户名</label><input type="text" class="input" name="username" disabled value="${escapeHtml(user.username || "")}"><small>用户名不可修改</small></div>
                    <div class="form-row"><label>昵称</label><input type="text" class="input" name="nickname" value="${escapeHtml(user.nickname || "")}" placeholder="设置你的显示昵称"></div>
                    <div class="form-row"><label>邮箱</label><input type="email" class="input" name="email" value="${escapeHtml(user.email || "")}" placeholder="your@email.com"></div>
                    <div class="form-row full"><label>兴趣标签</label><input type="text" class="input" name="interests" value="${escapeHtml(Array.isArray(user.interests) ? user.interests.join(", ") : user.interests || "")}" placeholder="如：算法, 前端, 数据库"><small>多个标签用逗号分隔，会影响资源推荐和学习画像。</small></div>
                    <button type="submit" class="btn primary full">${icon("save", 16)}保存资料</button>
                </form>
            </section>
            <aside class="settings-security-panel">
                <section class="settings-security-card">
                    <div class="settings-section-head compact">
                        <div><span class="pill">安全</span><h2>${icon("lock", 20)}修改密码</h2><p>建议定期更新密码，至少 6 位。</p></div>
                    </div>
                    <form class="settings-form" data-settings-form="password">
                        <div class="form-row"><label>当前密码</label><input type="password" class="input" name="currentPassword" required placeholder="输入当前密码"></div>
                        <div class="form-row"><label>新密码</label><input type="password" class="input" name="newPassword" required placeholder="输入新密码"></div>
                        <div class="form-row"><label>确认新密码</label><input type="password" class="input" name="confirmPassword" required placeholder="再次输入新密码"></div>
                        <button type="submit" class="btn primary">${icon("lock", 16)}更新密码</button>
                    </form>
                </section>
                <section class="settings-exit-card">
                    <div>
                        <h3>${icon("alert", 18)}安全退出</h3>
                        <p>退出后可重新登录，学习数据会保留。</p>
                    </div>
                    <button class="btn danger" data-logout>${icon("lock", 16)}退出登录</button>
                </section>
            </aside>
        </div>`;
    }

    function teacherWorkbenchView() {
        const dashboard = state.data.teacherDashboard || {};
        if (dashboard.denied) {
            return `<main class="page"><section class="permission-page card"><span class="tile-icon">${icon("lock", 28)}</span><h1>教师工作台需要教师权限</h1><p>${escapeHtml(dashboard.message || "普通学生不能发布班级测试、补救练习或教学干预。")}</p><div class="hero-actions"><button class="btn primary" data-view="home">${icon("home", 17)}返回首页</button><button class="btn ghost" data-logout>${icon("lock", 17)}切换教师账号</button></div></section></main>`;
        }
        const overview = dashboard.overview || {};
        const tab = state.data.teacherTab || "overview";
        const subjects = state.data.teacherSubjects.length
            ? state.data.teacherSubjects
            : ["数据结构与算法", "计算机网络", "操作系统", "数据库", "程序设计", "前端开发", "人工智能", "软件工程"];
        const students = state.data.teacherStudents || [];
        const assignments = state.data.teacherAssignments || [];
        const examsList = state.data.teacherExamsList || [];
        const notesList = state.data.teacherNotesList || [];
        const studentDetail = state.data.teacherStudentDetail || null;

        const tabs = [
            { key: "overview", icon: "chart", label: "概览" },
            { key: "students", icon: "users", label: "学生管理" },
            { key: "assignments", icon: "list", label: "分配管理" },
            { key: "exams", icon: "file", label: "试卷管理" },
            { key: "notes", icon: "book", label: "笔记发布" },
            { key: "progress", icon: "brain", label: "学情查看" },
            { key: "paths", icon: "route", label: "学习路径" },
            { key: "scan", icon: "scan", label: "试卷扫描" },
            { key: "knowledge-graph", icon: "radar", label: "知识图谱" }
        ];

        let tabContent = "";
        if (tab === "overview") {
            tabContent = `<section class="teacher-kpis grid-4">
                <article class="card"><h2>${overview.studentCount || 0}</h2><span>${icon("users", 14)} 学生总数</span></article>
                <article class="card"><h2>${overview.examCount || 0}</h2><span>${icon("file", 14)} 创建试卷</span></article>
                <article class="card"><h2>${overview.noteCount || 0}</h2><span>${icon("book", 14)} 发布笔记</span></article>
                <article class="card"><h2>${overview.assignCount || 0}</h2><span>${icon("list", 14)} 学科分配</span></article>
            </section>
            <section class="teacher-layout">
                <article class="card analytics-card"><div class="card-head"><h2 class="section-title">${icon("chart", 18)}分科学情热力</h2><button class="btn tiny ghost" data-teacher-tab="students">管理学生</button></div><div class="heat-grid">${(dashboard.subjectStats || []).map(s => `<div class="heat-cell ${Number(s.avg_score) < 55 ? "risk" : Number(s.avg_score) < 70 ? "watch" : "good"}"><b>${escapeHtml(s.subject)}</b><span>${Math.round(s.avg_score || 0)}分</span><small>${s.total || 0}次考试</small></div>`).join("") || '<div class="empty-state compact"><p>暂无学科考试数据</p></div>'}</div></article>
                <article class="card"><div class="card-head"><h2 class="section-title">${icon("clock", 18)}最近练测动态</h2></div><div class="list">${
                    (dashboard.recentExams || [])
                        .slice(0, 8)
                        .map(
                            item =>
                                `<div class="list-row"><span>${escapeHtml(item.nickname || item.username)}<small>${escapeHtml(item.subject)} · ${escapeHtml(item.exam_name)}</small></span><span class="pill ${item.is_correct ? "good" : "warn"}">${item.is_correct ? "正确" : "错误"}</span></div>`
                        )
                        .join("") || "<p>暂无练测记录</p>"
                }</div></article>
            </section>`;
        } else if (tab === "students") {
            tabContent = `<section class="teacher-toolbar">
                <div class="teacher-search"><span>${icon("search", 16)}</span><input class="input" data-teacher-search placeholder="搜索学生姓名..." value="${escapeHtml(state.data._teacherSearch || "")}"></div>
                <button class="btn primary" data-teacher-action="refresh-students">${icon("refresh", 16)} 刷新</button>
                    <button class="btn ghost" data-teacher-action="batch-import">${icon("upload", 16)} 批量导入</button>
            </section>
            <section class="teacher-student-grid">
                ${
                    students.length === 0
                        ? '<div class="empty-state"><p>暂无学生数据</p></div>'
                        : students
                              .map(
                                  s => `
                    <div class="teacher-student-card">
                        <div class="tsc-head">
                            <span class="tsc-avatar">${escapeHtml((s.nickname || s.username || "?").charAt(0).toUpperCase())}</span>
                            <div><b>${escapeHtml(s.nickname || s.username)}</b><small>@${escapeHtml(s.username)}</small></div>
                        </div>
                        <div class="tsc-stats">
                            <span>${icon("clock", 12)} ${s.study_hours || 0}h</span>
                            <span>${icon("brain", 12)} ${s.knowledge_mastery || 0}%</span>
                            <span>${icon("code", 12)} ${s.exam_count || 0}次考试</span>
                        </div>
                        <div class="tsc-subjects">${
                            s.assigned_subjects
                                ? s.assigned_subjects
                                      .split(", ")
                                      .map(sub => `<span class="pill">${escapeHtml(sub)}</span>`)
                                      .join(" ")
                                : '<span class="pill ghost">未分配学科</span>'
                        }</div>
                        <div class="tsc-actions">
                            <button class="btn tiny primary" data-teacher-assign="${s.id}" data-student-name="${escapeHtml(s.nickname || s.username)}">${icon("bolt", 13)}分配学科</button>
                            <button class="btn tiny ghost" data-teacher-view-student="${s.id}">${icon("eye", 13)}学情</button>
                            <button class="btn tiny danger" data-teacher-remove-student="${s.id}" data-student-name="${escapeHtml(s.nickname || s.username)}">${icon("trash", 13)}移除</button>
                        </div>
                    </div>
                `
                              )
                              .join("")
                }
            </section>`;
        } else if (tab === "assignments") {
            tabContent = `<section class="teacher-toolbar">
                <select class="input" style="width:auto;min-width:160px" data-teacher-assign-filter>
                    <option value="">全部学科</option>
                    ${subjects.map(sub => `<option value="${escapeHtml(sub)}">${escapeHtml(sub)}</option>`).join("")}
                </select>
                <button class="btn primary" data-teacher-action="refresh-assignments">${icon("refresh", 16)} 刷新</button>
            </section>
            <section class="teacher-assign-list">
                ${
                    assignments.length === 0
                        ? '<div class="empty-state"><p>暂无分配记录</p></div>'
                        : assignments
                              .map(
                                  a => `
                    <div class="teacher-assign-row">
                        <div class="tar-left">
                            <span class="tar-avatar">${escapeHtml((a.nickname || a.username || "?").charAt(0).toUpperCase())}</span>
                            <div><b>${escapeHtml(a.nickname || a.username)}</b><small>${escapeHtml(a.subject)} · 掌握度 ${a.knowledge_mastery || 0}% · 学习 ${a.study_hours || 0}h</small></div>
                        </div>
                        <div class="tar-right">
                            <span class="pill">${new Date(a.created_at).toLocaleDateString()}</span>
                            <button class="btn tiny ghost" data-teacher-del-assign="${a.id}">${icon("x", 13)}取消</button>
                        </div>
                    </div>
                `
                              )
                              .join("")
                }
            </section>`;
        } else if (tab === "exams") {
            const examDetail = state.data.teacherExamDetail;
            if (examDetail) {
                const exam = examDetail.exam || {};
                const questions = examDetail.questions || [];
                const assignStudents = examDetail.assignments || [];
                tabContent = `<section class="exam-detail-section">
                    <div class="exam-detail-head">
                        <button class="btn tiny ghost" data-teacher-exam-back>${icon("arrow-left", 14)} 返回列表</button>
                        <h2>${escapeHtml(exam.name)}</h2>
                        <span class="pill">${escapeHtml(exam.subject)} · ${exam.is_published ? "已发布" : "未发布"}</span>
                    </div>
                    <p>${escapeHtml(exam.description || "无描述")} · 时长 ${exam.duration || 60}分钟 · ${questions.length} 道题</p>
                    <div class="exam-detail-grid">
                        <div class="card">
                            <h3>${icon("list", 16)} 题目列表</h3>
                            <div class="exam-questions-list">${questions.map((q, i) => `<div class="eq-row"><span class="eq-num">${i + 1}</span><div><b>${escapeHtml(q.content)}</b><small>${q.type === "choice" ? "选择题" : q.type === "judge" ? "判断题" : "填空题"} · ${q.score}分</small></div></div>`).join("")}</div>
                        </div>
                        <div class="card">
                            <h3>${icon("users", 16)} 发布情况 (${assignStudents.length})</h3>
                            <div class="exam-assign-list">${assignStudents.length === 0 ? "<p>暂未发布给学生</p>" : assignStudents.map(a => `<div class="eq-row"><span>${escapeHtml(a.nickname || a.username)}</span><span class="pill ${a.status === "submitted" ? "good" : a.status === "pending" ? "" : "warn"}">${a.status === "submitted" ? a.score + "分" : a.status === "pending" ? "待作答" : "进行中"}</span></div>`).join("")}</div>
                        </div>
                    </div>
                </section>`;
            } else {
                tabContent = `<section class="teacher-toolbar">
                    <button class="btn primary" data-teacher-action="create-exam">${icon("plus", 16)} 创建试卷</button>
                    <button class="btn ghost" data-teacher-action="refresh-exams">${icon("refresh", 16)} 刷新</button>
                </section>
                <section class="teacher-exam-list">
                    ${
                        examsList.length === 0
                            ? '<div class="empty-state"><p>暂无试卷，点击"创建试卷"开始</p></div>'
                            : examsList
                                  .map(
                                      e => `
                        <div class="teacher-exam-card">
                            <div class="tec-head">
                                <h3>${escapeHtml(e.name)}</h3>
                                <span class="pill ${e.is_published ? "good" : ""}">${e.is_published ? "已发布" : "未发布"}</span>
                            </div>
                            <p>${escapeHtml(e.subject)} · ${e.difficulty === "easy" ? "简单" : e.difficulty === "hard" ? "困难" : "中等"} · ${e.duration || 60}分钟 · ${e.question_count || 0}题</p>
                            <div class="tec-meta"><span>${icon("users", 13)} ${e.assign_count || 0}人</span><span>${icon("check", 13)} ${e.submit_count || 0}人已交</span></div>
                            <div class="tec-actions">
                                <button class="btn tiny primary" data-teacher-view-exam="${e.id}">${icon("eye", 13)}详情</button>
                                <button class="btn tiny ghost" data-teacher-publish-exam="${e.id}">${icon("send", 13)}发布</button>
                                <button class="btn tiny ghost" data-teacher-del-exam="${e.id}">${icon("x", 13)}删除</button>
                            </div>
                        </div>
                    `
                                  )
                                  .join("")
                    }
                </section>`;
            }
        } else if (tab === "notes") {
            tabContent = `<section class="teacher-toolbar">
                <button class="btn primary" data-teacher-action="create-note">${icon("plus", 16)} 发布笔记</button>
                <select class="input" style="width:auto;min-width:160px" data-teacher-note-filter>
                    <option value="all">全部学科</option>
                    ${subjects.map(sub => `<option value="${escapeHtml(sub)}">${escapeHtml(sub)}</option>`).join("")}
                </select>
            </section>
            <section class="teacher-notes-grid">
                ${
                    notesList.length === 0
                        ? '<div class="empty-state"><p>暂无笔记，点击"发布笔记"开始</p></div>'
                        : notesList
                              .map(
                                  n => `
                    <div class="teacher-note-card">
                        <div class="tnc-head">
                            <h3>${escapeHtml(n.title)}</h3>
                            <span class="pill">${escapeHtml(n.subject)}</span>
                        </div>
                        <div class="tnc-body">${escapeHtml((n.content || "").slice(0, 150))}${(n.content || "").length > 150 ? "..." : ""}</div>
                        <div class="tnc-meta">
                            <span>${icon("clock", 12)} ${new Date(n.created_at).toLocaleDateString()}</span>
                            <span>${icon("eye", 12)} ${n.read_count || 0} 人已读</span>
                        </div>
                        <div class="tnc-actions">
                            <button class="btn tiny ghost" data-teacher-view-note="${n.id}">${icon("eye", 13)}详情</button>
                            <button class="btn tiny ghost" data-teacher-del-note="${n.id}">${icon("x", 13)}删除</button>
                        </div>
                    </div>
                `
                              )
                              .join("")
                }
            </section>`;
        } else if (tab === "progress") {
            if (studentDetail) {
                const stu = studentDetail.student || {};
                const exams = studentDetail.exams || [];
                const knowledge = studentDetail.knowledge || [];
                const assignedSubjects = studentDetail.assignedSubjects || [];
                const teacherExams = studentDetail.teacherExams || [];
                const readNotes = studentDetail.readNotes || [];
                tabContent = `<section class="student-progress-section">
                    <div class="sp-head">
                        <button class="btn tiny ghost" data-teacher-back-progress>${icon("arrow-left", 14)} 返回</button>
                        <div class="sp-user">
                            <span class="tsc-avatar large">${escapeHtml((stu.nickname || stu.username || "?").charAt(0).toUpperCase())}</span>
                            <div><h2>${escapeHtml(stu.nickname || stu.username)}</h2><small>@${escapeHtml(stu.username)} · ${escapeHtml(stu.email || "")}</small></div>
                        </div>
                    </div>
                    <section class="teacher-kpis grid-4">
                        <article class="card"><h2>${stu.study_hours || 0}</h2><span>学习时长(h)</span></article>
                        <article class="card"><h2>${stu.knowledge_mastery || 0}%</h2><span>知识掌握度</span></article>
                        <article class="card"><h2>${stu.correct_answers || 0}</h2><span>正确答题数</span></article>
                        <article class="card"><h2>${stu.continuous_days || 0}</h2><span>连续学习(天)</span></article>
                    </section>
                    <div class="progress-detail-grid">
                        <div class="card"><div class="card-head"><h3>${icon("brain", 16)} 知识点掌握</h3></div><div class="knowledge-bar-list">${
                            knowledge
                                .slice(0, 10)
                                .map(
                                    k =>
                                        `<div class="kb-row"><span>${escapeHtml(k.name)}</span><div class="bar"><span style="width:${k.mastery}%"></span></div><b>${k.mastery}%</b></div>`
                                )
                                .join("") || "<p>暂无知识点数据</p>"
                        }</div></div>
                        <div class="card"><div class="card-head"><h3>${icon("file", 16)} 考试记录</h3></div><div class="list">${
                            exams
                                .slice(0, 8)
                                .map(
                                    e =>
                                        `<div class="list-row"><span>${escapeHtml(e.exam_name || "考试")}<small>${escapeHtml(e.subject)}</small></span><span class="pill ${e.is_correct ? "good" : "warn"}">${e.is_correct ? "正确" : "错误"}</span></div>`
                                )
                                .join("") || "<p>暂无考试记录</p>"
                        }</div></div>
                        <div class="card"><div class="card-head"><h3>${icon("list", 16)} 分配学科</h3></div><div class="list">${assignedSubjects.map(a => `<div class="list-row"><span>${escapeHtml(a.subject)}</span><small>${new Date(a.created_at).toLocaleDateString()}</small></div>`).join("") || "<p>未分配学科</p>"}</div></div>
                        <div class="card"><div class="card-head"><h3>${icon("book", 16)} 阅读笔记</h3></div><div class="list">${
                            readNotes
                                .slice(0, 8)
                                .map(
                                    r =>
                                        `<div class="list-row"><span>${escapeHtml(r.title)}<small>${escapeHtml(r.subject)}</small></span><small>${new Date(r.read_at).toLocaleDateString()}</small></div>`
                                )
                                .join("") || "<p>未阅读任何笔记</p>"
                        }</div></div>
                    </div>
                </section>`;
            } else {
                tabContent = `<section class="teacher-toolbar">
                    <div class="teacher-search"><span>${icon("search", 16)}</span><input class="input" data-teacher-progress-search placeholder="搜索学生姓名..." value="${escapeHtml(state.data._progressSearch || "")}"></div>
                </section>
                <section class="teacher-student-grid">${
                    students.length === 0
                        ? '<div class="empty-state"><p>暂无学生数据</p></div>'
                        : students
                              .map(
                                  s => `
                    <div class="teacher-student-card">
                        <div class="tsc-head">
                            <span class="tsc-avatar">${escapeHtml((s.nickname || s.username || "?").charAt(0).toUpperCase())}</span>
                            <div><b>${escapeHtml(s.nickname || s.username)}</b><small>@${escapeHtml(s.username)}</small></div>
                        </div>
                        <div class="tsc-stats">
                            <span>${icon("clock", 12)} ${s.study_hours || 0}h</span>
                            <span>${icon("brain", 12)} ${s.knowledge_mastery || 0}%</span>
                            <span>${icon("code", 12)} ${s.exam_count || 0}次考试</span>
                        </div>
                        <button class="btn primary small" data-teacher-view-student="${s.id}">${icon("eye", 14)} 查看学情</button>
                    </div>
                `
                              )
                              .join("")
                }</section>`;
            }
        } else if (tab === "paths") {
            const pathsList = state.data.teacherPaths || [];
            const pathDetail = state.data.teacherPathDetail;
            if (pathDetail) {
                const path = pathDetail.path || {};
                const steps = pathDetail.steps || [];
                const assignStudents = pathDetail.assignments || [];
                const activeAssignments = assignStudents.filter(
                    a => a.status === "in_progress" || a.status === "scheduled"
                );
                const completedAssignments = assignStudents.filter(a => a.status === "completed");
                const avgProgress = assignStudents.length
                    ? Math.round(
                          assignStudents.reduce(
                              (sum, a) =>
                                  sum +
                                  ((Number(a.completed_steps) || 0) /
                                      Math.max(Number(a.total_steps) || steps.length || 1, 1)) *
                                      100,
                              0
                          ) / assignStudents.length
                      )
                    : 0;
                tabContent = `<section class="teacher-path-detail">
                    <div class="sp-head">
                        <button class="btn tiny ghost" data-teacher-path-back>${icon("arrow-left", 14)} 返回列表</button>
                        <button class="btn tiny primary" data-teacher-edit-path="${path.id}">${icon("pen", 14)} 编辑</button>
                        <button class="btn tiny primary" data-teacher-path-assign="${path.id}" data-path-name="${escapeHtml(escapeAttr(path.name))}">${icon("plus", 13)}添加学生</button>
                        <div><h2>${escapeHtml(path.name)} <span class="pill ghost tiny">v${path.version || 1}</span></h2><small>${escapeHtml(path.subject)} · ${steps.length} 个步骤</small></div>
                    </div>
                    <section class="teacher-path-monitor-grid">
                        <article class="card"><h2>${assignStudents.length}</h2><span>${icon("users", 14)} 已部署学生</span></article>
                        <article class="card"><h2>${activeAssignments.length}</h2><span>${icon("lock", 14)} 锁定/待发布</span></article>
                        <article class="card"><h2>${completedAssignments.length}</h2><span>${icon("check", 14)} 已完成</span></article>
                        <article class="card"><h2>${avgProgress}%</h2><span>${icon("chart", 14)} 平均进度</span></article>
                    </section>
                    <div class="teacher-path-steps">
                        <div class="card"><div class="card-head"><h3>${icon("list", 16)} 步骤编排</h3></div>
                        <div class="path-steps-timeline">${steps
                            .map(
                                (s, i) => `
                            <div class="path-step-row">
                                <div class="psr-num">${i + 1}</div>
                                <div class="psr-body">
                                    <b>${escapeHtml(s.title)}</b>
                                    <span class="pill tiny">${escapeHtml(s.type)} · ${s.duration_minutes || 10}分钟</span>
                                    ${s.resource_id ? `<span class="pill pill-resource">${escapeHtml(s.resource_type || "resource")}</span>` : ""}
                                    <p>${escapeHtml((s.content || "").slice(0, 200))}${(s.content || "").length > 200 ? "..." : ""}</p>
                                    ${s.options_json ? `<small>选项: ${JSON.stringify(s.options_json)} · 答案: ${escapeHtml(s.correct_answer || "无")}</small>` : ""}
                                </div>
                            </div>
                        `
                            )
                            .join("")}</div>
                    </div>
                    <div class="card"><div class="card-head"><h3>${icon("users", 16)} 学生路径监控(${assignStudents.length})</h3><button class="btn tiny primary" data-teacher-path-assign="${path.id}" data-path-name="${escapeHtml(escapeAttr(path.name))}">${icon("plus", 13)}添加学生</button></div>
                    <div class="list">${
                        assignStudents.length === 0
                            ? "<p>尚未分配给任何学生</p>"
                            : assignStudents
                                  .map(
                                      a => `
                        <div class="path-student-row">
                            <div class="path-student-main">
                                <span>${escapeHtml(a.nickname || a.username)}<small>${a.status === "scheduled" ? `定时: ${a.scheduled_at ? new Date(a.scheduled_at).toLocaleString("zh-CN") : "待发布"}` : `状态: ${escapeHtml(a.status)} · 当前第 ${a.current_step || 1} 步`}</small></span>
                                <div class="path-student-progress"><span style="width:${Math.round(((a.completed_steps || 0) / Math.max(a.total_steps || steps.length || 1, 1)) * 100)}%"></span></div>
                            </div>
                            <span class="pill ${a.status === "completed" ? "good" : a.status === "in_progress" ? "" : "ghost"}">${escapeHtml(a.status === "completed" ? "已完成" : a.status === "in_progress" ? "学习中" : a.status === "scheduled" ? "待发布" : "已解锁")}</span>
                            <button class="btn tiny danger" data-teacher-remove-path-student="${a.id}" data-path-id="${path.id}" data-student-name="${escapeHtml(escapeAttr(a.nickname || a.username))}">${icon("x", 13)}删除</button>
                        </div>
                    `
                                  )
                                  .join("")
                    }</div>
                    </div>
                </section>`;
            } else {
                tabContent = `<section class="teacher-toolbar">
                    <button class="btn primary" data-teacher-action="create-path">${icon("plus", 16)} 创建学习路径</button>
                    <button class="btn ghost" data-teacher-action="refresh-paths">${icon("refresh", 16)} 刷新</button>
                </section>
                <section class="teacher-path-grid">
                    ${
                        pathsList.length === 0
                            ? '<div class="empty-state"><p>暂未创建学习路径。点击"创建学习路径"设计一套完整的学习流程，分配给指定学生后将锁定学生只能按路径学习。</p></div>'
                            : pathsList
                                  .map(
                                      p => `
                        <div class="teacher-path-card">
                            <div class="tpc-head">
                                <h3>${escapeHtml(p.name)}</h3>
                                <span class="pill">${escapeHtml(p.subject)}</span>
                                <span class="pill ghost tiny">v${p.version || 1}</span>
                            </div>
                            <div class="tpc-stats">
                                <div><b>${p.step_count || 0}</b><small>步骤</small></div>
                                <div><b>${p.assign_count || 0}</b><small>学生</small></div>
                                <div><b>${p.in_progress_count || 0}</b><small>进行中</small></div>
                                <div><b>${p.completed_count || 0}</b><small>已完成</small></div>
                            </div>
                            <div class="tpc-actions">
                                <button class="btn tiny primary" data-teacher-path-assign="${p.id}" data-path-name="${escapeHtml(escapeAttr(p.name))}">${icon("users", 13)}分配学生</button>
                                <button class="btn tiny ghost" data-teacher-view-path="${p.id}">${icon("eye", 13)}详情</button>
                                <button class="btn tiny ghost" data-teacher-del-path="${p.id}">${icon("x", 13)}删除</button>
                            </div>
                        </div>
                    `
                                  )
                                  .join("")
                    }
                </section>`;
            }
        } else if (tab === "scan") {
            const scanState = state.data._scanState || "upload";
            const scanData = state.data._scanData || null;
            const scanQuestions = state.data._scanQuestions || [];
            const scanHistory = state.data._scanHistory || [];
            const scanImagePreview = state.data._scanImagePreview || "";
            const selectedForSave = state.data._scanSelected || {};

            if (scanState === "scanning") {
                tabContent = `<section class="scan-loading card">
                    <div class="scan-loading-content">
                        <div class="spinner"></div>
                        <h2>${icon("scan", 24)} 正在识别试卷...</h2>
                        <p>步骤 1/2: OCR 文字识别中</p>
                        <div class="progress-bar"><span style="width:60%"></span></div>
                    </div>
                </section>`;
            } else if (scanState === "results" && scanData) {
                tabContent = `<section class="scan-results">
                    <div class="scan-results-head">
                        <button class="btn ghost" data-scan-back>${icon("arrow-left", 16)} 重新扫描</button>
                        <h2>${icon("check", 20)} 识别完成 - 共 ${scanQuestions.length} 道题</h2>
                        <button class="btn primary" data-scan-save>${icon("save", 16)} 保存到题库</button>
                    </div>
                    <div class="scan-results-grid">
                        <div class="card scan-image-card">
                            <div class="card-head"><h3>${icon("image", 16)} 试卷原图</h3></div>
                            ${scanImagePreview ? `<img class="scan-image" src="${scanImagePreview}" alt="试卷">` : '<p class="text-muted">暂无预览图</p>'}
                        </div>
                        <div class="card scan-ocr-card">
                            <div class="card-head"><h3>${icon("file-text", 16)} OCR 识别原文</h3></div>
                            <div class="scan-ocr-text">${escapeHtml((scanData.ocrText || "").slice(0, 2000))}${(scanData.ocrText || "").length > 2000 ? "..." : ""}</div>
                        </div>
                    </div>
                    <div class="card scan-questions-card">
                        <div class="card-head">
                            <h3>${icon("list", 16)} 识别题目列表</h3>
                            <div class="scan-actions">
                                <button class="btn tiny ghost" data-scan-select-all>${icon("check", 13)} 全选</button>
                                <button class="btn tiny ghost" data-scan-deselect-all>${icon("x", 13)} 取消全选</button>
                            </div>
                        </div>
                        <div class="scan-questions-list">
                            ${scanQuestions
                                .map(
                                    (q, i) => `
                                <div class="scan-question-row ${selectedForSave[i] ? "selected" : ""}" data-scan-qindex="${i}">
                                    <div class="sq-check"><input type="checkbox" data-scan-check="${i}" ${selectedForSave[i] ? "checked" : ""}></div>
                                    <div class="sq-num">${i + 1}</div>
                                    <div class="sq-body">
                                        <div class="sq-content" contenteditable="true" data-scan-field="${i}" data-field="content">${escapeHtml(q.content || "")}</div>
                                        <div class="sq-meta">
                                            <select class="input tiny" data-scan-field="${i}" data-field="type">
                                                <option value="single" ${q.type === "single" ? "selected" : ""}>单选题</option>
                                                <option value="multiple" ${q.type === "multiple" ? "selected" : ""}>多选题</option>
                                                <option value="fill" ${q.type === "fill" ? "selected" : ""}>填空题</option>
                                                <option value="short" ${q.type === "short" ? "selected" : ""}>简答题</option>
                                                <option value="truefalse" ${q.type === "truefalse" ? "selected" : ""}>判断题</option>
                                            </select>
                                            <select class="input tiny" data-scan-field="${i}" data-field="difficulty">
                                                <option value="easy" ${q.difficulty === "easy" ? "selected" : ""}>简单</option>
                                                <option value="medium" ${q.difficulty === "medium" ? "selected" : ""}>中等</option>
                                                <option value="hard" ${q.difficulty === "hard" ? "selected" : ""}>困难</option>
                                            </select>
                                            <input class="input tiny" style="width:100px" placeholder="学科" value="${escapeHtml(q.subject || "")}" data-scan-field="${i}" data-field="subject">
                                            <input class="input tiny" style="width:60px" placeholder="分数" value="${q.score || 5}" data-scan-field="${i}" data-field="score" type="number" min="1">
                                        </div>
                                        ${
                                            q.type === "single" || q.type === "multiple"
                                                ? `
                                        <div class="sq-options">
                                            ${(q.options || []).map((opt, oi) => `<span class="sq-opt"><b>${String.fromCharCode(65 + oi)}.</b> <span contenteditable="true" data-scan-opt="${i}" data-opt-index="${oi}">${escapeHtml(opt)}</span></span>`).join("")}
                                        </div>`
                                                : ""
                                        }
                                        <div class="sq-answer">
                                            <label>答案：</label>
                                            <input class="input tiny" style="width:200px" placeholder="例如: A 或 光合作用" value="${escapeHtml(q.answer || "")}" data-scan-field="${i}" data-field="answer">
                                        </div>
                                    </div>
                                </div>
                            `
                                )
                                .join("")}
                        </div>
                    </div>
                </section>`;
            } else {
                tabContent = `<section class="scan-upload-area">
                    <div class="card scan-upload-card">
                        <div class="scan-dropzone" data-scan-dropzone>
                            <div class="scan-dropzone-inner">
                                <span class="scan-upload-icon">${icon("upload-cloud", 48)}</span>
                                <h2>上传试卷图片</h2>
                                <p>支持 JPG、PNG 格式，拖拽图片到此处或点击选择</p>
                                <input type="file" accept="image/*" data-scan-file-input hidden>
                                <button class="btn primary" data-scan-choose>${icon("image", 16)} 选择图片</button>
                            </div>
                        </div>
                        ${
                            scanImagePreview
                                ? `
                        <div class="scan-preview">
                            <img src="${scanImagePreview}" alt="预览">
                            <button class="btn primary" data-scan-start>${icon("scan", 16)} 开始扫描识别</button>
                        </div>`
                                : ""
                        }
                    </div>
                    <div class="card scan-history-card">
                        <div class="card-head"><h3>${icon("clock", 16)} 扫描历史</h3><button class="btn tiny ghost" data-scan-refresh-history>${icon("refresh", 13)} 刷新</button></div>
                        <div class="scan-history-list">
                            ${
                                scanHistory.length === 0
                                    ? '<p class="text-muted">暂无扫描记录</p>'
                                    : scanHistory
                                          .map(
                                              h => `
                                <div class="scan-history-row" data-scan-history-id="${h.id}">
                                    <span>${icon("file", 14)} ${escapeHtml(h.file_name)}</span>
                                    <span class="text-muted">${new Date(h.created_at).toLocaleString("zh-CN")}</span>
                                    <button class="btn tiny ghost" data-scan-view-history="${h.id}">${icon("eye", 13)}查看</button>
                                </div>
                            `
                                          )
                                          .join("")
                            }
                        </div>
                    </div>
                </section>`;
            }
        } else if (tab === "knowledge-graph") {
            const kgData = state.data._teacherKG || { nodes: [], edges: [] };
            const nodes = kgData.nodes || [];
            const edges = kgData.edges || [];
            const selectedNode = state.data._teacherKGSelected || null;
            const filter = state.data._teacherKGFilter || "";
            const subjects = [...new Set(nodes.map(n => n.subject).filter(Boolean))];
            tabContent = `<section class="teacher-kg-section">
                <div class="teacher-kg-header">
                    <h2>${icon("radar", 20)} 班级知识掌握热力图</h2>
                    <div class="teacher-kg-controls">
                        <select class="input" style="width:auto;min-width:140px" data-teacher-kg-filter>
                            <option value="">全部学科</option>
                            ${subjects.map(s => `<option value="${escapeHtml(s)}" ${filter === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                        </select>
                        <button class="btn ghost" data-teacher-kg-refresh>${icon("refresh", 16)} 刷新</button>
                    </div>
                </div>
                <div class="teacher-kg-layout">
                    <div class="teacher-kg-canvas-wrap">
                        <canvas id="teacher-kg-canvas" width="900" height="500"></canvas>
                        <div class="teacher-kg-legend">
                            <span class="kg-legend-item"><span class="kg-dot" style="background:#22c55e"></span>掌握≥70%</span>
                            <span class="kg-legend-item"><span class="kg-dot" style="background:#f59e0b"></span>50-70%</span>
                            <span class="kg-legend-item"><span class="kg-dot" style="background:#ef4444"></span>&lt;50%</span>
                            <span class="kg-legend-item"><span class="kg-dot" style="background:var(--primary)"></span>已选节点</span>
                        </div>
                    </div>
                    <div class="teacher-kg-detail card">
                        <h3>${icon("info", 16)} 节点详情</h3>
                        ${
                            selectedNode
                                ? `
                            <div class="kg-detail-content">
                                <div class="kg-detail-row"><b>知识点：</b>${escapeHtml(selectedNode.label)}</div>
                                <div class="kg-detail-row"><b>学科：</b>${escapeHtml(selectedNode.subject || "—")}</div>
                                <div class="kg-detail-row"><b>平均分：</b><span class="pill ${Number(selectedNode.avgScore) >= 70 ? "good" : Number(selectedNode.avgScore) >= 50 ? "warn" : "danger"}">${selectedNode.avgScore || "0"}</span></div>
                                <div class="kg-detail-row"><b>参与学生：</b>${selectedNode.studentCount || 0} 人</div>
                                <div class="kg-detail-row"><b>考试频次：</b>${selectedNode.examCount || 0} 次</div>
                                <div class="kg-detail-row"><b>薄弱学生：</b>${escapeHtml(selectedNode.weakStudents || "无")}</div>
                                <button class="btn primary full-width mt" data-teacher-kg-remedy="${escapeHtml(selectedNode.id)}">${icon("bolt", 16)} 分配补救练习</button>
                            </div>
                        `
                                : `
                            <p class="text-muted">点击图谱中的节点查看详情</p>
                        `
                        }
                    </div>
                </div>
            </section>`;
        }

        const overviewObj = dashboard.overview || {};
        return `<main class="page teacher-page">
            <section class="hero-row"><div class="hero"><h1>${icon("chart", 24)} 教师工作台</h1><p>从班级视角管理学生、分配学科、创建试卷、发布笔记，全方位跟踪学习情况。</p></div>${metricCards()}</section>
            <div class="teacher-tabs">
                ${tabs.map(t => `<button class="teacher-tab ${tab === t.key ? "active" : ""}" data-teacher-tab="${t.key}">${icon(t.icon, 15)} ${t.label}</button>`).join("")}
            </div>
            <div class="teacher-tab-content">${tabContent}</div>
        </main>`;
    }

    function parseInterestTags(value) {
        if (Array.isArray(value)) return value;
        try {
            const parsed = JSON.parse(value || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return String(value || "计算机科学,数据结构,人工智能")
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
        }
    }

    function dailyQuestionCard() {
        const q = state.data.dailyQuestion || {
            id: "",
            question: "时间复杂度 O(n log n) 通常对应哪种算法？",
            correctAnswer: "归并排序",
            options: ["冒泡排序", "二分查找", "归并排序", "线性查找"],
            sourceName: "本地题库",
            knowledgeTitle: "算法复杂度"
        };
        return `<article class="card question" id="daily-question"><div class="card-head"><h2 class="section-title">${icon("list", 18)}每日一题</h2><span class="pill">${escapeHtml(q.sourceName)}</span></div><h3>${escapeHtml(q.question)}</h3><p>关联知识点：${escapeHtml(q.knowledgeTitle || "")}</p>
            <div class="choice-grid">${(q.options || []).map((option, i) => `<button class="choice" data-question-id="${q.id}" data-answer="${escapeHtml(option)}"><b>${"ABCD"[i]}</b>${escapeHtml(option)}</button>`).join("")}</div><div class="answer-result" data-answer-result></div></article>`;
    }

    function pathView() {
        const center = state.data.pathCenter || {};
        const hasAgentPath = center.generatedByAgent === true;
        const nodes = center.pathNodes || [];
        const subjects = center.subjects || [];
        const tasks = center.tasks || [];
        const courses = center.courses || [];
        const summary = center.summary || {};
        const profileContext = center.profileContext || {};
        const debugJson = JSON.stringify(
            {
                personalized: center.debug?.personalized ?? Boolean(center.profileContext),
                profileContext,
                personalization: center.personalization || [],
                strategy: center.debug?.reason || "path/center profile-aware aggregation",
                selectedWeakNodes: center.debug?.selectedWeakNodes || nodes.slice(0, 5)
            },
            null,
            2
        );
        const statusLabel = { priority: "优先修复", learning: "学习中", review: "复习迁移", done: "已完成" };
        const statusIcon = { priority: "bolt", learning: "play", review: "refresh", done: "check" };
        if (!hasAgentPath) {
            const profile = center.profileContext || {};
            return `<main class="page path-page agent-path-empty-page">
                <section class="hero-row">
                    <div class="hero">
                        <span class="pill">Agent 个性化学习</span>
                        <h1>尚未生成学习路径</h1>
                        <p>这里不会再显示规则路径、固定课程或硬编码资源。只有你点击下方按钮，让 Agent 读取画像、目标、薄弱点和学习记录后，才会写入并展示学习路径和今日计划。</p>
                        <div class="hero-actions">
                            <button class="btn primary glow" data-path-generate>${icon("robot", 17)}调用 Agent 个性化学习</button>
                            <button class="btn ghost" data-view="profile">${icon("user", 17)}查看学习画像</button>
                            <button class="btn ghost" data-view="diagnostic">${icon("brain", 17)}重新诊断</button>
                        </div>
                    </div>
                    <article class="card agent-path-status">
                        <span class="pill ${profile.primaryStyleLabel ? "good" : "warn"}">${profile.primaryStyleLabel ? "画像已读取" : "等待画像"}</span>
                        <h2>${escapeHtml(profile.primaryStyleLabel || "画像待校准")}</h2>
                        <p>每日可用 ${escapeHtml(String(profile.dailyMinutes || "--"))} 分钟 · 专注时长 ${escapeHtml(String(profile.attentionSpan || "--"))} 分钟</p>
                    </article>
                </section>
                <section class="path-control card agent-only-control">
                    <div><label>学习目标</label><input data-path-goal value="${escapeHtml(state.data.pathGoal)}" placeholder="例如：两周掌握数据结构基础"></div>
                    <div><label>学科范围</label><select data-path-subject><option value="all">由 Agent 判断</option></select></div>
                    <div><label>学习强度</label><select data-path-intensity>${[
                        ["light", "轻量"],
                        ["normal", "标准"],
                        ["intense", "冲刺"]
                    ]
                        .map(
                            ([key, label]) =>
                                `<option value="${key}" ${state.data.pathIntensity === key ? "selected" : ""}>${label}</option>`
                        )
                        .join("")}</select></div>
                    <button class="btn primary" data-path-generate>${icon("route", 17)}生成个性化路径</button>
                </section>
                <section class="agent-path-empty-grid">
                    ${[
                        ["brain", "读取长期画像", "学习风格、可用时间、专注时长、薄弱点和偏好会进入 Agent 上下文。"],
                        ["target", "分析当前目标", "目标会影响知识点优先级，不再固定从同一个节点开始。"],
                        ["route", "写入路径和计划", "只有 Agent 写入 study_tasks 后，页面才展示主路径和今日任务。"],
                        ["file", "保留生成证据", "生成后会展示 Agent 依据、任务来源和路径状态。"]
                    ]
                        .map(
                            ([ic, title, desc]) =>
                                `<article class="card"><span class="round-icon">${icon(ic, 20)}</span><b>${title}</b><p>${desc}</p></article>`
                        )
                        .join("")}
                </section>
            </main>`;
        }
        return `<main class="page path-page">
            <section class="hero-row"><div class="hero"><h1>个性化学习路径</h1><p>路径不再是固定模板：系统会根据你的掌握度、错题、课程进度、笔记和今日任务实时重排，每个人看到的节点、原因和操作都不同。</p><div class="hero-actions"><button class="btn primary glow" data-path-generate>${icon("robot", 17)}生成路径</button><button class="btn ghost" data-view="practice">${icon("exam", 17)}去验证</button><button class="btn ghost" data-view="smartNotes">${icon("pen", 17)}整理笔记</button></div></div>${metricCards()}</section>
            <section class="path-control card">
                <div><label>学习目标</label><input data-path-goal value="${escapeHtml(state.data.pathGoal)}" placeholder="例如：两周掌握数据结构基础"></div>
                <div><label>学科范围</label><select data-path-subject><option value="all">全部学科</option>${subjects.map(s => `<option value="${escapeHtml(s.subject)}" ${state.data.pathSubject === s.subject ? "selected" : ""}>${escapeHtml(s.subject)} · ${s.mastery || 0}%</option>`).join("")}</select></div>
                <div><label>学习强度</label><select data-path-intensity>${[
                    ["light", "轻量"],
                    ["normal", "标准"],
                    ["intense", "冲刺"]
                ]
                    .map(
                        ([key, label]) =>
                            `<option value="${key}" ${state.data.pathIntensity === key ? "selected" : ""}>${label}</option>`
                    )
                    .join("")}</select></div>
                <button class="btn primary" data-path-generate>${icon("route", 17)}按画像重排</button>
            </section>
            <section class="path-control card">
                <div><label>画像驱动依据</label><b>${escapeHtml(profileContext.primaryStyleLabel || "读写型")}</b><small>来源：${escapeHtml(profileContext.source || "student_profiles")}</small></div>
                <div><label>每日可用时间</label><b>${escapeHtml(String(profileContext.dailyMinutes || 60))} 分钟</b><small>用于控制任务数量</small></div>
                <div><label>专注时长</label><b>${escapeHtml(String(profileContext.attentionSpan || 30))} 分钟</b><small>超过时会建议拆分</small></div>
                <div><label>推荐资源偏好</label><b>${escapeHtml((profileContext.learningStyle || []).join(" / ") || "reading")}</b><small>影响视频、文档、实验、练习比例</small></div>
            </section>
            <section class="path-proof-panel">
                <article class="path-proof-card">
                    <span class="pill good">${center.debug?.personalized === false ? "未个性化" : "已个性化"}</span>
                    <h2>这条路径为什么是你的</h2>
                    <p>${escapeHtml((center.personalization || [])[0] || "系统正在读取画像、掌握度和今日任务来生成路径。")}</p>
                    <div class="path-proof-grid">
                        ${(center.personalization || [])
                            .slice(0, 4)
                            .map(item => `<div><b>${icon("check", 15)}${escapeHtml(item)}</b></div>`)
                            .join("")}
                    </div>
                </article>
                <article class="path-json-card">
                    <div class="card-head"><h2 class="section-title">${icon("file", 18)}路径判定 JSON</h2><span class="pill">profile-aware</span></div>
                    <pre>${escapeHtml(debugJson)}</pre>
                </article>
            </section>
            <section class="major-direction-band">
                <div class="band-copy"><span class="pill">计算机专业方向推荐</span><h2>先选方向，再让路径自己长出来</h2><p>同样是学习计算机，不同目标需要完全不同的知识顺序。系统会按职业目标、薄弱知识点和每天可用时间推荐路线。</p></div>
                <div class="major-track-grid">${majorTracks()
                    .map(
                        track => `<button class="major-track ${state.data.majorTrack === track.key ? "active" : ""}" data-major-track="${track.key}">
                    <span class="round-icon">${icon(track.icon, 18)}</span>
                    <b>${escapeHtml(track.title)}</b>
                    <small>${escapeHtml(track.stack)}</small>
                    <i>匹配 ${track.fit}%</i>
                </button>`
                    )
                    .join("")}</div>
            </section>
            <section class="path-kpis">
                <article class="card"><b>${summary.nodes || 0}</b><span>路径节点</span></article>
                <article class="card"><b>${summary.weakCount || 0}</b><span>待修复薄弱点</span></article>
                <article class="card"><b>${summary.doneTasks || 0}/${summary.todayTasks || 0}</b><span>今日任务完成</span></article>
                <article class="card"><b>${summary.totalMinutes || 0}</b><span>预计分钟</span></article>
            </section>
            <section class="path-workbench">
                <article class="card path-main">
                    <div class="card-head"><h2 class="section-title">${icon("route", 18)}主路径</h2><span class="pill">${escapeHtml(center.goal || state.data.pathGoal)}</span></div>
                    <div class="path-timeline">${
                        nodes
                            .map(
                                (
                                    node,
                                    i
                                ) => `<div class="path-node ${node.status}" style="--color:${node.status === "priority" ? "#ee4f65" : node.status === "learning" ? "#2f6bff" : node.status === "done" ? "#18b87a" : "#7c4dff"}">
                        <span class="node">${i + 1}</span>
                        <span class="task-icon">${icon(statusIcon[node.status] || "book", 23)}</span>
                        <div class="path-node-body"><div><b>${escapeHtml(node.title)}</b><small>${escapeHtml(node.phase)} · ${escapeHtml(node.subject)} · ${node.estimateMinutes} 分钟</small></div><p>${escapeHtml(node.reason)}</p>${node.personalizedReason ? `<p>${escapeHtml(node.personalizedReason)}</p>` : ""}<div class="tag-row">${(node.evidence || []).map(e => `<span class="pill">${escapeHtml(e)}</span>`).join("")}</div></div>
                        <div class="path-node-score"><b>${node.mastery}%</b><div class="bar"><span style="width:${node.mastery || 0}%"></span></div><small>${escapeHtml(statusLabel[node.status] || "待学习")}</small></div>
                        <div class="path-node-actions"><button class="btn tiny primary" data-path-start="${node.id}">${icon("play", 14)}开始</button><button class="btn tiny ghost" data-run-closed-loop="${escapeHtml(node.title)}">闭环</button></div>
                    </div>`
                            )
                            .join("") || `<div class="empty-state compact"><p>暂无路径节点，点击生成路径。</p></div>`
                    }</div>
                </article>
                <aside class="side-card">
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("target", 18)}方向能力地图</h2><span class="pill">${escapeHtml((majorTracks().find(t => t.key === state.data.majorTrack) || majorTracks()[0]).title)}</span></div><div class="roadmap-stack">${(majorTracks().find(t => t.key === state.data.majorTrack) || majorTracks()[0]).subjects.map((item, index) => `<div><span>${index + 1}</span><b>${escapeHtml(item)}</b><small>${index === 0 ? "先修基础" : index === 1 ? "核心能力" : index === 2 ? "项目验证" : "迁移提升"}</small></div>`).join("")}</div></article>
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("brain", 18)}个性化原因</h2><span class="pill">画像</span></div><div class="list">${(center.personalization || []).map(item => `<div class="list-row"><span>${escapeHtml(item)}</span><span class="pill">依据</span></div>`).join("")}</div></article>
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("list", 18)}今日路径任务</h2><span class="pill">${tasks.length}</span></div><div class="list">${tasks.map(task => `<button class="list-row action-row" data-task-id="${task.id}"><span>${escapeHtml(task.title)}<small>${escapeHtml(task.subtitle || task.source)} · ${task.estimated_minutes || 0} 分钟</small></span><span class="pill ${task.status === "done" ? "good" : ""}">${task.status === "done" ? "完成" : "点击完成"}</span></button>`).join("") || "<p>还没有任务，生成路径后会自动写入。</p>"}</div></article>
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("book", 18)}匹配课程</h2><button class="btn tiny ghost" data-view="course">看课程</button></div><div class="list">${courses.map(course => `<div class="list-row"><span>${escapeHtml(course.title)}<small>${escapeHtml(course.provider || "公开课程")} · ${course.progress || 0}%</small></span><span class="pill">${escapeHtml(course.subject || "综合")}</span></div>`).join("") || "<p>当前筛选下暂无课程。</p>"}</div></article>
                </aside>
            </section>
        </main>`;
    }

    function assetView() {
        const tab = ["knowledge", "notes", "mistakes"].includes(state.data.assetTab)
            ? state.data.assetTab
            : "knowledge";
        const weak = state.data.weakPoints[0] || {};
        const ragResult = state.data.ragAskResult || {};
        const ragCitations = ragResult.citations || [];
        const tabBody =
            tab === "notes"
                ? `<article class="card note-editor"><div class="card-head"><div><span class="pill">智能笔记</span><h2>${escapeHtml(weak.title || "计算机知识笔记")}</h2><p>${escapeHtml(weak.source_name || "中文计算机知识库")}</p></div><button class="btn primary" data-save-note>${icon("check", 17)}保存笔记</button></div><textarea class="textarea note-compose" data-asset-note>${escapeHtml(weak.summary || "")}</textarea></article>`
                : tab === "mistakes"
                  ? `<article class="card"><div class="card-head"><h2 class="section-title">${icon("book", 18)}错题本</h2><button class="btn tiny ghost" data-view="practice">继续练习</button></div><div class="list">${state.data.recommendations.map(r => `<button class="list-row action-row" data-recommendation-view="${escapeHtml(r.target_view || "practice")}"><span>${escapeHtml(r.title)}<small>${escapeHtml(r.reason || "建议继续巩固")}</small></span><span class="pill">${escapeHtml(r.action_label || "行动")}</span></button>`).join("")}</div></article>`
                  : `<article class="card note-editor"><div class="card-head"><div><span class="pill">公开数据</span><h2>${escapeHtml(weak.title || "知识笔记")}</h2><p>${escapeHtml(weak.source_name || "中文计算机知识库")}</p></div><button class="btn primary" data-save-note>${icon("check", 17)}保存为笔记</button></div><div class="toolbar"><b>B</b><i>I</i><u>U</u><span>A</span><span>#</span><span>Σ</span></div><div class="note-body"><p>${escapeHtml(weak.summary || "暂无摘要")}</p></div></article>`;
        return `<main class="page"><section class="hero-row"><div class="hero"><h1>学习资产中心</h1><p>把课程资料、个人笔记和错题复盘放在一起，方便持续复习和证据追溯。知识库问答已合并到 AI 助手。</p></div>${metricCards()}</section><div class="tabs"><button class="${tab === "knowledge" ? "active" : ""}" data-asset-tab="knowledge">${icon("db", 16)}知识库</button><button class="${tab === "notes" ? "active" : ""}" data-asset-tab="notes">${icon("pen", 16)}笔记</button><button class="${tab === "mistakes" ? "active" : ""}" data-asset-tab="mistakes">${icon("book", 16)}错题本</button></div>
            <section class="asset-grid"><aside class="side-card"><article class="card"><h2 class="section-title">${icon("search", 18)}薄弱知识点</h2><div class="list">${state.data.weakPoints.map(p => `<div class="list-row"><span>${escapeHtml(p.title)}<small>${escapeHtml(p.subject)}</small></span><span class="pill">${p.mastery}%</span></div>`).join("")}</div></article></aside>
            ${tabBody}
            <aside class="side-card"><article class="card"><h2 class="section-title">${icon("file", 18)}课程来源</h2><div class="list">${state.data.courses
                .slice(0, 5)
                .map(
                    c =>
                        `<div class="list-row"><span>${escapeHtml(c.title)}</span><span class="pill">${escapeHtml(c.provider || "公开")}</span></div>`
                )
                .join(
                    ""
                )}</div><button class="btn tiny ghost" data-ai-assistant-mode="rag">${icon("robot", 14)}去知识库问答</button></article></aside></section></main>`;
    }

    function courseView() {
        const courses = state.data.courses.length
            ? state.data.courses
            : [{ id: 0, title: "数据结构 · 哈希表", provider: "公开课程", subject: "数据结构与算法", progress: 75 }];
        return `<main class="page"><section class="hero-row"><div class="hero"><h1>课程学习</h1><p>围绕当前目标和薄弱知识点推荐课程，学生可以按进度学习，教师可以看到课程完成情况。</p></div>${metricCards()}</section><section class="grid-3">${courses
            .map(
                (
                    course,
                    i
                ) => `<article class="quick-tile course-card interactive" style="min-height:250px;--soft-color:${["#eef3ff", "#effaf5", "#fff6e8", "#f6f0ff", "#eaf8ff", "#fff0f5"][i % 6]};--grad:linear-gradient(135deg,#2f6bff,#7c4dff)">
            <span class="tile-icon">${icon(["book", "brain", "file", "robot", "chart", "route"][i % 6], 24)}</span>
            <h3>${escapeHtml(course.title)}</h3>
            <p>${escapeHtml(course.provider || "公开课程")} · ${escapeHtml(course.subject || "综合")} · ${escapeHtml(course.difficulty || "入门")} · 已完成 ${course.progress || 0}%</p>
            <div class="bar"><span style="width:${course.progress || 0}%"></span></div>
            <div class="course-actions">
                <button class="course-action" data-course-id="${course.id || ""}" type="button">${icon("play", 15)}学习 15 分钟</button>
                ${course.source_url ? `<a class="course-source-link" href="${escapeHtml(course.source_url)}" target="_blank" rel="noopener noreferrer">${icon("file", 15)}查看真实课程</a>` : ""}
            </div>
        </article>`
            )
            .join("")}</section></main>`;
    }

    function intelligenceView() {
        const intel = state.data.intelligence || {};
        const consoleData = intel.agentConsole || {};
        const judgment = consoleData.todayJudgment || {};
        const taskPlan = consoleData.taskPlan || [];
        const profileDelta = consoleData.profileDelta || {};
        const records = consoleData.executionRecords || [];
        const conversation = consoleData.conversation || {};
        const agents = consoleData.agents || [];
        const teacherView = consoleData.teacherView || {};
        const integrations = consoleData.integrations || [];
        const messages = conversation.messages || intel.messages || [];
        const xfyunCapabilities = state.data.xfyunCapabilities || [];
        const flowInput = escapeHtml(
            state.data._agentFlowInput || `我总是分不清 ${judgment.focus || "当前薄弱点"} 的关键条件`
        );
        const riskStudents = teacherView.riskStudents || [];
        const recommendedActions = teacherView.recommendedActions || [];
        const canTeach = ["teacher", "admin"].includes((state.user?.role || readUser().role || "").toLowerCase());
        return `<main class="page intelligence-page">
            <section class="agent-console-hero">
                <div class="agent-hero-copy">
                    <span class="eyebrow">学习智能体控制台</span>
                    <h1>今天智能体发现：你最该补「${escapeHtml(judgment.focus || "当前薄弱点")}」</h1>
                    <p>${escapeHtml(judgment.reason || "系统正在根据答题、课程、笔记和考试数据判断下一步任务。")}</p>
                    <div class="agent-hero-actions">
                        <button class="btn primary glow" data-run-agent-flow>${icon("bolt", 17)}运行今日任务流</button>
                        <button class="btn ghost" data-agent-speak>${icon("play", 17)}导师朗读判断</button>
                        <button class="btn ghost" data-agent-voice>${icon("send", 17)}语音提问</button>
                    </div>
                </div>
                <div class="agent-focus-panel">
                    <div class="agent-focus-score"><b>${judgment.mastery ?? "--"}%</b><span>${escapeHtml(judgment.subject || "综合")} 掌握度</span></div>
                    <div class="bar"><span style="width:${judgment.mastery || 0}%"></span></div>
                    <div class="agent-focus-meta">
                        <span>置信度 ${judgment.confidence || 82}%</span>
                        <span class="${judgment.teacherRequired ? "warn-text" : "ok-text"}">${judgment.teacherRequired ? "建议教师介入" : "学生可自主完成"}</span>
                    </div>
                    <small>下一步：${escapeHtml(judgment.nextTask || "生成今日补救任务")}</small>
                </div>
            </section>
            <section class="agent-pill-row">
                ${agents.map(agent => `<article class="agent-pill-card"><b>${escapeHtml(agent.name)}</b><span>${escapeHtml(agent.status)}</span><p>${escapeHtml(agent.next)}</p><small>${agent.abilities.map(escapeHtml).join(" / ")}</small></article>`).join("")}
            </section>
            <section class="agent-console-grid">
                <article class="card agent-section-card">
                    <div class="card-head"><h2 class="section-title">${icon("brain", 18)}智能体今日判断</h2><span class="pill">${escapeHtml(judgment.teacherRequired ? "需干预" : "可自学")}</span></div>
                    <div class="agent-delta">
                        <div><small>完成前</small><b>${profileDelta.before ?? "--"}%</b></div>
                        <div class="agent-delta-line"><span style="width:${profileDelta.after || 0}%"></span></div>
                        <div><small>预计完成后</small><b>${profileDelta.after ?? "--"}%</b></div>
                    </div>
                    <div class="diagnosis-map">${(profileDelta.changedBy || []).map(item => `<div><b>${escapeHtml(item)}</b><p>${escapeHtml(profileDelta.label || "学习画像")} · 能力信号 ${profileDelta.abilityScore || 60}%</p></div>`).join("")}</div>
                </article>
                <article class="card agent-section-card">
                    <div class="card-head"><h2 class="section-title">${icon("list", 18)}智能体执行记录</h2><button class="btn tiny ghost" data-run-agent-flow>重新生成</button></div>
                    <div class="agent-timeline">${records.map(record => `<div class="agent-timeline-item ${escapeHtml(record.status)}"><span></span><div><b>${escapeHtml(record.title)}</b><p>${escapeHtml(record.detail)}</p><small>${escapeHtml(record.agent)} · ${escapeHtml(record.type)}</small></div></div>`).join("") || `<div class="empty-state">运行任务流后会显示练习、笔记和复习安排。</div>`}</div>
                </article>
                <article class="card agent-section-card agent-chat-card">
                    <div class="card-head"><h2 class="section-title">${icon("robot", 18)}对话与追问</h2><span class="pill">文字 / 语音</span></div>
                    <div class="chat-mini">${
                        messages
                            .slice(-5)
                            .map(
                                m =>
                                    `<div class="chat-bubble ${m.sender === "ai" ? "ai" : "user"}"><b>${m.sender === "ai" ? "导师" : "我"}</b><span>${escapeHtml(m.content)}</span></div>`
                            )
                            .join("") ||
                        `<div class="chat-bubble ai"><b>${escapeHtml(conversation.tutor || "小星")}</b><span>${escapeHtml(conversation.lastReply || "把最卡的一步发给我，我会先追问，再生成练习和复盘卡。")}</span></div>`
                    }</div>
                    <textarea class="textarea agent-question-box" data-tutor-input placeholder="问智能体：这道题为什么选 B？">${flowInput}</textarea>
                    <div class="assistant-actions"><button class="btn primary" data-tutor-send>${icon("send", 16)}发送并追问</button><button class="btn ghost" data-run-agent-flow>${icon("bolt", 16)}生成闭环任务</button><label class="btn ghost upload-btn">${icon("upload", 16)}拍照识题<input type="file" accept="image/*" data-agent-ocr hidden></label></div>
                </article>
                <article class="card agent-section-card">
                    <div class="card-head"><h2 class="section-title">${icon("users", 18)}多Agent协作</h2><button class="btn primary tiny" data-agent-collaborate-start>${icon("bolt", 14)} 启动协作</button></div>
                    <div class="collaborate-input-row">
                        <input class="input" data-collaborate-topic placeholder="输入学习主题，例如：二分查找、快速排序、HTTP协议..." value="${escapeHtml(state.data._collaborateTopic || "")}">
                    </div>
                    ${
                        state.data._collaborateSteps
                            ? `
                    <div class="collaborate-steps">
                        ${state.data._collaborateSteps
                            .map(
                                (step, i) => `
                            <div class="collab-step">
                                <div class="collab-step-header">
                                    <span class="collab-step-num">${i + 1}</span>
                                    <b>${escapeHtml(step.agent)}</b>
                                    <span class="pill tiny">${escapeHtml(step.step_type === "plan" ? "规划" : step.step_type === "teach" ? "教学" : step.step_type === "quiz" ? "出题" : "评估")}</span>
                                </div>
                                <div class="collab-step-body">${escapeHtml((step.content || "").slice(0, 500))}${(step.content || "").length > 500 ? "..." : ""}</div>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                    `
                            : `<div class="empty-state compact"><p>输入一个学习主题，启动多Agent协作学习流程：规划Agent拆解知识 → 教学Agent讲解 → 出题Agent练习 → 评估Agent反馈</p></div>`
                    }
                </article>
                <article class="card agent-section-card">
                    <div class="card-head"><h2 class="section-title">${icon("chart", 18)}教师视角</h2><span class="pill">${riskStudents.length} 个预警</span></div>
                    <div class="list">${riskStudents.map(item => `<div class="list-row"><span>${escapeHtml(item.student)}<small>${escapeHtml(item.issue)} · 掌握度 ${item.mastery}%</small></span><span class="pill warn">${escapeHtml(item.action)}</span></div>`).join("") || `<div class="empty-state">当前暂无班级风险学生。</div>`}</div>
                    <div class="teacher-action-strip">${recommendedActions
                        .map(action =>
                            canTeach
                                ? `<button class="btn ghost" data-teacher-action="${escapeHtml(action.key)}" data-teacher-subject="${escapeHtml(action.target)}">${escapeHtml(action.title)}</button>`
                                : `<button class="btn ghost" disabled title="教师账号可一键发布">${escapeHtml(action.title)}</button>`
                        )
                        .join("")}</div>
                </article>
            </section>
            <section class="card agent-integration-card">
                <div class="card-head"><h2 class="section-title">${icon("settings", 18)}讯飞能力接入优先级</h2><span class="pill">第一阶段</span></div>
                <div class="integration-grid">${integrations.map(item => `<div class="integration-item"><b>${escapeHtml(item.name)}</b><span class="status-${escapeHtml(item.status)}">${escapeHtml(item.status)}</span><p>${escapeHtml(item.role)}</p></div>`).join("")}</div>
                <p class="muted-note">星火用于核心推理；语音听写、TTS 和 OCR 在配置讯飞 APPID/APIKey/APISecret 后启用。当前页面已提供语音提问、导师朗读、拍照识题入口和任务流落库闭环。</p>
            </section>
            <section class="card xfyun-console-card">
                <div class="card-head"><h2 class="section-title">${icon("bolt", 18)}讯飞开放平台能力</h2><button class="btn tiny ghost" data-xfyun-refresh>${icon("refresh", 14)}刷新状态</button></div>
                <div class="xfyun-cap-grid">${
                    xfyunCapabilities
                        .map(
                            item => `<article class="xfyun-cap-card ${item.ready ? "ready" : "pending"}">
                    <b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.type)} · ${item.ready ? "已配置" : "待配置"}</span>
                    <small>${escapeHtml(item.endpoint || "")}</small>
                    <button class="btn tiny ${item.ready ? "primary" : "ghost"}" data-xfyun-action="${escapeHtml(item.key)}">${item.key === "ocr" ? "上传识别" : item.key === "ppt" ? "生成PPT" : "获取鉴权"}</button>
                    ${item.key === "ocr" ? `<input type="file" accept="image/*,.jpg,.jpeg,.png" data-xfyun-ocr-file hidden>` : ""}
                </article>`
                        )
                        .join("") || `<div class="empty-state">点击刷新状态读取讯飞能力配置。</div>`
                }</div>
                <div class="xfyun-ppt-row">
                    <input class="input" data-xfyun-ppt-topic value="${escapeHtml(state.data.xfyunPptTopic)}" placeholder="输入智能 PPT 主题">
                    <button class="btn primary" data-xfyun-ppt-create>${icon("file", 16)}调用智能PPT生成</button>
                </div>
                <pre class="xfyun-output">${escapeHtml(state.data.xfyunToolOutput)}</pre>
            </section>
        </main>`;
    }

    function codeLanguages() {
        return [
            ["javascript", "JS", "JavaScript", "可在浏览器内直接运行"],
            ["html", "HTML", "HTML/CSS/JS", "实时预览前端页面"],
            ["python", "PY", "Python", "适合基础语法与数据分析练习"],
            ["java", "JAVA", "Java", "适合数据结构与 OOP"],
            ["cpp", "C++", "C++", "竞赛与系统方向"]
        ];
    }

    function codeTemplates() {
        return {
            algorithm: {
                title: "算法练习",
                language: "javascript",
                file: "main.js",
                source: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9], 7));`
            },
            html: {
                title: "前端页面",
                language: "html",
                file: "index.html",
                source: `<section class="hero">
  <h1>EduSmart AI Learning</h1>
  <p>根据学习画像推荐课程、练习和复习节奏。</p>
  <button>开始学习</button>
</section>

<style>
  body { margin: 0; font-family: system-ui; background: #f6f8ff; }
  .hero {
    min-height: 320px;
    display: grid;
    place-items: center;
    text-align: center;
    color: #10203f;
  }
  button {
    border: 0;
    border-radius: 10px;
    padding: 12px 18px;
    color: white;
    background: #2563eb;
  }
</style>`
            },
            sql: {
                title: "SQL思维",
                language: "javascript",
                file: "query-simulator.js",
                source: `const students = [
  { name: "Lin", course: "DB", score: 92 },
  { name: "Chen", course: "DB", score: 78 },
  { name: "Zhou", course: "OS", score: 88 }
];

const dbTop = students
  .filter(row => row.course === "DB" && row.score >= 80)
  .map(row => row.name);

console.log(dbTop);`
            },
            api: {
                title: "学习推荐逻辑",
                language: "javascript",
                file: "service.js",
                source: `function recommendPath(profile) {
  const weak = profile.weakPoints[0] || "数据结构";
  return {
    goal: "补齐" + weak,
    steps: ["看课 20 分钟", "完成 6 道题", "写一张复盘卡"]
  };
}

console.log(recommendPath({ weakPoints: ["计算机网络"] }));`
            },
            python: {
                title: "Python数据分析",
                language: "python",
                file: "analysis.py",
                source: `scores = [92, 78, 88, 95]
avg = sum(scores) / len(scores)
print("平均分", avg)

weak = [score for score in scores if score < 85]
print("需要复习", weak)`
            },
            java: {
                title: "Java面向对象",
                language: "java",
                file: "Main.java",
                source: `class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    boolean passed() {
        return score >= 60;
    }
}`
            }
        };
    }

    function codeLabView() {
        const templates = codeTemplates();
        const active = templates[state.data.codeTemplate] || templates.algorithm;
        const language = state.data.codeLanguage || active.language || "javascript";
        const insight = state.data.codeInsight;
        const repos = state.data.codeRepos || [];
        const activeRepo = state.data.codeRepoActive;
        const repoFiles = state.data.codeRepoFiles || [];
        const activeFile = state.data.codeRepoFileActive;
        const running = state.data.codeRunning;
        return `<main class="page code-lab-page">
            <section class="code-hero">
                <div class="code-hero-left">
                    <span class="pill">AI编程舱</span>
                    <h1>在线代码编辑器</h1>
                    <p>面向学生的项目化编程练习，边写代码边运行验证，并获得学习建议与教师可查看的过程记录。</p>
                    <div class="hero-actions">
                        <button class="btn primary glow" data-run-code ${running ? "disabled" : ""}>${icon("play", 17)}${running ? "运行中..." : "运行代码"}</button>
                        <button class="btn ghost" data-reset-code>${icon("refresh", 17)}重置</button>
                        <button class="btn ghost" data-code-challenge>${icon("bolt", 17)}生成挑战</button>
                    </div>
                </div>
                <div class="code-hero-stats">
                    <div class="hero-stat">
                        <div class="hero-stat-value">${activeRepo ? repoFiles.length : Object.keys(templates).length}</div>
                        <div class="hero-stat-label">${activeRepo ? "项目文件" : "练习模板"}</div>
                    </div>
                    <div class="hero-stat">
                        <div class="hero-stat-value">${insight?.score || 84}</div>
                        <div class="hero-stat-label">代码评分</div>
                    </div>
                    <div class="hero-stat">
                        <div class="hero-stat-value small">${language === "javascript" ? "Node.js" : language === "html" ? "Browser" : language === "python" ? "Python" : language.toUpperCase()}</div>
                        <div class="hero-stat-label">运行环境</div>
                    </div>
                </div>
            </section>
            <section class="ide-topbar">
                <div class="topbar-left">
                    <button class="topbar-btn ${!activeRepo ? "active" : ""}" data-code-explorer="templates">
                        ${icon("layers", 16)}<span>模板</span>
                    </button>
                    <button class="topbar-btn ${activeRepo ? "active" : ""}" data-code-explorer="repos">
                        ${icon("folder", 16)}<span>项目文件</span>
                    </button>
                </div>
                <div class="topbar-center">
                    <span class="current-file-label">
                        ${icon("file", 14)}${escapeHtml(activeRepo && activeFile ? activeFile.filename : active.file || "main.js")}
                    </span>
                </div>
                <div class="topbar-right">
                    <button class="topbar-btn" data-code-new-repo>${icon("plus", 15)}新建项目</button>
                    <button class="topbar-btn" data-code-upload-trigger>${icon("upload", 15)}上传文件</button>
                    <input type="file" data-code-upload accept=".js,.html,.css,.py,.java,.cpp,.c,.txt" style="display:none">
                    <select class="topbar-select" data-code-language>
                        ${codeLanguages()
                            .map(
                                ([key, short, label]) =>
                                    `<option value="${key}" ${language === key ? "selected" : ""}>${label}</option>`
                            )
                            .join("")}
                    </select>
                </div>
            </section>
            <section class="ide-workspace">
                <aside class="ide-explorer">
                    ${activeRepo ? repoExplorerView(activeRepo, repoFiles, activeFile) : templateExplorerView(templates)}
                </aside>
                <article class="ide-editor">
                    <div class="editor-tabs">
                        <span class="editor-tab active">
                            ${icon("terminal", 14)}${escapeHtml(activeRepo && activeFile ? activeFile.filename : active.file || "main.js")}
                        </span>
                    </div>
                    <textarea class="code-editor" data-code-source spellcheck="false" placeholder="在此编写代码...">${escapeHtml(state.data.codeSource || active.source)}</textarea>
                </article>
                <aside class="ide-output">
                    <div class="output-header">
                        <span>${icon("terminal", 14)}${language === "html" ? "网页预览" : "运行输出"}</span>
                        <span class="output-badge ${language === "javascript" ? "badge-js" : language === "html" ? "badge-html" : "badge-sandbox"}">${language === "javascript" ? "Node Sandbox" : language === "html" ? "Live Preview" : "Server Sandbox"}</span>
                    </div>
                    ${language === "html" ? `<iframe class="html-preview" sandbox="allow-scripts allow-same-origin" srcdoc="${escapeHtml(state.data.codePreview || state.data.codeSource || active.source)}"></iframe>` : `<pre class="runtime-output">${escapeHtml(state.data.codeOutput)}</pre>`}
                    ${
                        insight
                            ? `<div class="ai-insight">
                        <div class="insight-title">${icon("brain", 15)}AI 分析</div>
                        <p>${escapeHtml(insight.summary)}</p>
                        <div class="insight-tags">${(insight.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join("")}</div>
                        <p class="insight-next">${escapeHtml(insight.next || "")}</p>
                    </div>`
                            : ""
                    }
                </aside>
            </section>
        </main>`;
    }

    function repoExplorerView(repo, files, activeFile) {
        return `<div class="explorer-header">
            <span>${icon("folder", 15)}${escapeHtml(repo.name || "项目文件夹")}</span>
            <button class="icon-btn" data-code-back-templates title="返回模板">${icon("arrow-left", 14)}</button>
        </div>
        <div class="explorer-files">
            ${
                files.length
                    ? files
                          .map(
                              f => `<div class="explorer-file ${activeFile && activeFile.id === f.id ? "active" : ""}" data-code-open-file="${f.id}">
                ${fileIcon(f.filename)}<span>${escapeHtml(f.filename)}</span><small>${formatSize(f.size_bytes)}</small>
                <button class="icon-btn delete-file" data-code-delete-file="${f.id}" title="删除">${icon("x", 12)}</button>
            </div>`
                          )
                          .join("")
                    : '<div class="explorer-empty">暂无文件，点击上方上传</div>'
            }
        </div>`;
    }

    function templateExplorerView(templates) {
        return `<div class="explorer-header">
            <span>${icon("layers", 15)}代码模板</span>
        </div>
        <div class="explorer-files">
            ${Object.entries(templates)
                .map(
                    ([
                        key,
                        item
                    ]) => `<div class="explorer-file ${state.data.codeTemplate === key ? "active" : ""}" data-code-template="${key}">
                ${fileIcon(item.file || "")}<span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.file || "")}</small>
            </div>`
                )
                .join("")}
        </div>`;
    }

    function fileIcon(filename) {
        const ext = String(filename || "")
            .split(".")
            .pop()
            .toLowerCase();
        const map = {
            js: "terminal",
            html: "layers",
            css: "palette",
            py: "code",
            java: "code",
            cpp: "code",
            c: "code",
            txt: "file",
            md: "file",
            json: "db",
            sql: "db"
        };
        return icon(map[ext] || "file", 14);
    }

    function formatSize(bytes) {
        const b = Number(bytes) || 0;
        if (b < 1024) return b + "B";
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + "KB";
        return (b / (1024 * 1024)).toFixed(1) + "MB";
    }

    function teamRoleName(key) {
        const map = { frontend: "前端", backend: "后端", testing: "测试", deployment: "运维/部署" };
        return map[key] || key || "模块";
    }

    function readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(reader.error || new Error("文件读取失败"));
            reader.readAsText(file, "utf-8");
        });
    }

    function normalizeRepoPath(name, prefix = "") {
        const safe = String(name || "uploaded.txt")
            .replace(/\\/g, "/")
            .split("/")
            .filter(Boolean)
            .join("/");
        return `${prefix}${safe}`.replace(/\/+/g, "/");
    }

    function inferModuleFromPath(path) {
        const value = String(path || "").toLowerCase();
        if (/test|spec|测试/.test(value)) return "testing";
        if (/deploy|ops|docker|ci|运维|部署/.test(value)) return "deployment";
        if (/api|server|backend|service|db|sql|后端/.test(value)) return "backend";
        return "frontend";
    }

    function inferLanguageFromPath(path) {
        const ext = String(path || "")
            .split(".")
            .pop()
            ?.toLowerCase();
        const map = {
            js: "javascript",
            ts: "javascript",
            jsx: "javascript",
            tsx: "javascript",
            py: "python",
            html: "html",
            css: "css",
            md: "markdown",
            txt: "markdown",
            sql: "sql",
            json: "javascript"
        };
        return map[ext] || "markdown";
    }

    function repoBranchName(project) {
        return (
            (project?.repository_name || project?.name || "team-repo")
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
                .replace(/^-+|-+$/g, "") || "team-repo"
        );
    }

    function repoDisplayFiles(files) {
        return [...(files || [])].sort((a, b) => String(a.path || "").localeCompare(String(b.path || "")));
    }

    function repoReadmeFile(files) {
        return (
            (files || []).find(file => /^readme\.md$/i.test(file.path)) ||
            (files || []).find(file => /\.md$/i.test(file.path) && /说明|readme|manual|docs?\//i.test(file.path)) ||
            (files || []).find(file => /\.md$/i.test(file.path))
        );
    }

    function repoFolderRows(files, currentPath = "") {
        const prefix = currentPath ? currentPath.replace(/\/+$/, "") + "/" : "";
        const folders = new Map();
        const fileRows = [];
        (files || []).forEach(file => {
            const path = String(file.path || "").replace(/^\/+/, "");
            if (!path.startsWith(prefix)) return;
            const rest = path.slice(prefix.length);
            if (!rest) return;
            const parts = rest.split("/");
            if (parts.length > 1) {
                const folderPath = `${prefix}${parts[0]}`;
                if (!folders.has(folderPath))
                    folders.set(folderPath, {
                        type: "folder",
                        name: parts[0],
                        path: folderPath,
                        count: 0,
                        updated_at: file.updated_at
                    });
                const folder = folders.get(folderPath);
                folder.count += 1;
                if (new Date(file.updated_at || 0) > new Date(folder.updated_at || 0))
                    folder.updated_at = file.updated_at;
                return;
            }
            fileRows.push({ type: "file", ...file, name: parts[0], path });
        });
        return [
            ...Array.from(folders.values()).sort((a, b) => a.name.localeCompare(b.name)),
            ...fileRows.sort((a, b) => a.name.localeCompare(b.name))
        ];
    }

    function repoTreeHtml(files, currentPath = "", activeFile) {
        const root = {};
        repoDisplayFiles(files).forEach(file => {
            const parts = String(file.path || "")
                .split("/")
                .filter(Boolean);
            let node = root;
            parts.forEach((part, index) => {
                node[part] = node[part] || { __files: {}, __path: parts.slice(0, index + 1).join("/") };
                if (index === parts.length - 1) node[part].__file = file;
                node = node[part].__files;
            });
        });
        const renderNode = (node, depth = 0) =>
            Object.keys(node)
                .sort((a, b) => {
                    const av = node[a].__file ? 1 : 0;
                    const bv = node[b].__file ? 1 : 0;
                    return av - bv || a.localeCompare(b);
                })
                .map(name => {
                    const item = node[name];
                    const isFile = !!item.__file;
                    const path = isFile ? item.__file.path : item.__path;
                    const active = isFile ? Number(activeFile?.id) === Number(item.__file.id) : currentPath === path;
                    if (isFile) {
                        return `<button class="team-v2-tree-row file ${active ? "active" : ""}" style="--depth:${depth}" data-team-file="${item.__file.id}">
                    ${fileIcon(name)}<span>${escapeHtml(name)}</span>
                </button>`;
                    }
                    const expanded =
                        !currentPath || path === currentPath || currentPath.startsWith(path + "/") || depth < 1;
                    return `<div class="team-v2-tree-group">
                <button class="team-v2-tree-row folder ${active ? "active" : ""}" style="--depth:${depth}" data-team-repo-folder="${escapeAttr(path)}">
                    ${icon(expanded ? "chevron" : "folder", 13)}${icon("folder", 14)}<span>${escapeHtml(name)}</span>
                </button>
                ${expanded ? `<div>${renderNode(item.__files, depth + 1)}</div>` : ""}
            </div>`;
                })
                .join("");
        return renderNode(root) || `<div class="team-v2-empty-block small">暂无文件</div>`;
    }

    function repoBreadcrumbHtml(project, currentPath) {
        const parts = String(currentPath || "")
            .split("/")
            .filter(Boolean);
        const crumbs = [
            `<button data-team-repo-folder="">${escapeHtml(project.repository_name || "team-repo")}</button>`
        ];
        parts.forEach((part, index) => {
            const path = parts.slice(0, index + 1).join("/");
            crumbs.push(`<button data-team-repo-folder="${escapeAttr(path)}">${escapeHtml(part)}</button>`);
        });
        return crumbs.join(`<span>/</span>`);
    }

    function teamDemoSnippet(moduleKey = "frontend") {
        const snippets = {
            frontend: {
                path: "frontend/demo-dashboard.js",
                language: "javascript",
                content: `export function renderProjectCard(project) {
  return {
    title: project.name,
    status: project.progress >= 80 ? "ready" : "building",
    files: project.files.length
  };
}

console.log(renderProjectCard({ name: "团队项目演示", progress: 65, files: ["App.js"] }));`
            },
            backend: {
                path: "backend/demo-api.js",
                language: "javascript",
                content: `function listRepositoryFiles(files, folder = "") {
  return files.filter(file => file.path.startsWith(folder));
}

console.log(listRepositoryFiles([{ path: "backend/api.js" }, { path: "frontend/App.js" }], "backend"));`
            },
            testing: {
                path: "tests/repository-demo.test.js",
                language: "javascript",
                content: `const cases = [
  { name: "点击项目后展示详情", passed: true },
  { name: "点击文件夹后进入目录", passed: true },
  { name: "点击文件后显示代码", passed: true }
];

console.log(cases.map(item => item.name + ": " + (item.passed ? "PASS" : "TODO")).join("\\n"));`
            },
            deployment: {
                path: "deploy/demo-runbook.md",
                language: "markdown",
                content: `# 演示运行说明

1. 打开团队项目页面。
2. 从项目列表选择一个项目。
3. 进入前端/后端/测试/部署岗位。
4. 在仓库目录树中查看文件结构。
5. 点击 Code 查看拉取和上传说明。`
            }
        };
        return snippets[moduleKey] || snippets.frontend;
    }

    function repoCloneCommands(project) {
        const repo = repoBranchName(project);
        const remote = `https://edusmart.local/team-code/${repo}.git`;
        return {
            remote,
            clone: `git clone ${remote}`,
            pull: `git pull origin main`,
            upload: `git add .\ngit commit -m "docs: update project manual"\ngit push origin main`
        };
    }

    function extractProjectIntake(docs, existing = {}) {
        const text = docs.map(doc => `${doc.name}\n${doc.content || ""}`).join("\n\n");
        const sentences = text
            .split(/[\n。；;]+/)
            .map(item => item.trim())
            .filter(Boolean);
        const featureWords = ["功能", "需求", "实现", "页面", "接口", "模块", "管理", "支持"];
        const noteWords = ["注意", "风险", "限制", "必须", "需要", "安全", "权限", "性能", "兼容"];
        const stackMatchers = [
            ["Vue", /vue/i],
            ["React", /react/i],
            ["HTML/CSS", /html|css|页面|样式/i],
            ["Node.js", /node|express|后端服务/i],
            ["Java", /spring|java/i],
            ["Python", /python|flask|django/i],
            ["MySQL", /mysql|sql|数据库/i],
            ["Redis", /redis/i],
            ["Docker", /docker|容器/i],
            ["GitHub Actions", /github actions|ci|流水线/i],
            ["Playwright", /playwright|自动化测试/i]
        ];
        const picked = (words, limit) =>
            sentences.filter(line => words.some(word => line.includes(word))).slice(0, limit);
        const techStack = stackMatchers.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
        const features = picked(featureWords, 8);
        const notes = picked(noteWords, 6);
        const roleTodos = { frontend: [], backend: [], testing: [], deployment: [] };
        const roleRules = {
            frontend: /前端|页面|交互|组件|样式|用户|表单|看板|可视化/i,
            backend: /后端|接口|数据库|权限|服务|业务|API|数据/i,
            testing: /测试|验收|用例|缺陷|质量|自动化|回归/i,
            deployment: /部署|运维|上线|环境|Docker|CI|流水线|服务器|日志/i
        };
        sentences.forEach(line => {
            Object.entries(roleRules).forEach(([role, pattern]) => {
                if (pattern.test(line) && roleTodos[role].length < 5) {
                    roleTodos[role].push(line.slice(0, 90));
                }
            });
        });
        return {
            docs,
            codeFiles: existing.codeFiles || [],
            summary:
                sentences[0]?.slice(0, 160) ||
                existing.summary ||
                "已上传项目说明书，系统会继续提取项目目标、功能范围和岗位任务。",
            features: features.length
                ? features.map(item => item.slice(0, 70))
                : existing.features || ["项目说明书已上传，等待补充明确功能需求。"],
            techStack: techStack.length ? techStack : existing.techStack || ["JavaScript", "Node.js", "MySQL"],
            notes: notes.length
                ? notes.map(item => item.slice(0, 80))
                : existing.notes || ["注意把说明书中的未确认点转成待办卡片。"],
            roleTodos
        };
    }

    function switchTeamRole(roleKey) {
        const key = roleKey || "frontend";
        const defaults = {
            frontend: { path: "frontend/App.js", language: "javascript" },
            backend: { path: "backend/api.js", language: "javascript" },
            testing: { path: "tests/project.test.js", language: "javascript" },
            deployment: { path: "deploy/README.md", language: "markdown" }
        };
        state.data.teamCodeActiveRole = key;
        state.data.teamCodeModule = key;
        state.data.teamCodeScreen = "role";
        const matchedFile = (state.data.teamCodeProject?.files || []).find(file => file.module_key === key);
        state.data.teamCodePath = matchedFile?.path || defaults[key]?.path || state.data.teamCodePath;
        state.data.teamCodeLanguage = matchedFile?.language || defaults[key]?.language || state.data.teamCodeLanguage;
        state.data.teamCodePosition = state.data.teamCodePath;
        state.data.teamCodeToolLog = `${teamRoleName(key)}工作台已打开\n请从岗位需求卡片选择待开发功能，再在公共仓库中编辑对应文件。`;
    }

    function requirementStatusName(status) {
        const map = { todo: "待开发", doing: "开发中", review: "评审中", done: "已完成" };
        return map[status] || status || "待确认";
    }

    function toolStatusName(status) {
        const map = { ready: "可用", draft: "待接入", blocked: "阻塞" };
        return map[status] || status || "未知";
    }

    function teamCodeQualityText(score) {
        const value = Number(score || 0);
        if (value >= 90) return "优秀";
        if (value >= 80) return "可合并";
        if (value >= 70) return "需复查";
        return "需补强";
    }

    function teamRoleWorkspace(roleKey) {
        const workspaces = {
            frontend: {
                title: "前端开发工作台",
                handbook:
                    "负责把项目需求转化为可使用、可演示、可联调的页面体验，需要关注信息架构、组件拆分、状态流转、接口对接和移动端适配。",
                outputs: ["页面原型与交互流程", "组件目录与样式规范", "接口联调记录", "用户体验验收截图"],
                tools: ["VS Code / WebStorm", "Chrome DevTools", "Figma 标注", "接口 Mock", "Playwright 页面冒烟"],
                todos: [
                    {
                        title: "搭建项目首页与研发看板",
                        priority: "P0",
                        detail: "展示项目说明、成员分工、需求卡片和最新提交。"
                    },
                    {
                        title: "实现需求卡片状态视图",
                        priority: "P0",
                        detail: "按 todo / doing / review / done 呈现，并支持模块筛选。"
                    },
                    {
                        title: "完成接口联调与空状态",
                        priority: "P1",
                        detail: "对接后端任务接口，处理加载、错误、无数据状态。"
                    }
                ]
            },
            backend: {
                title: "后端开发工作台",
                handbook:
                    "负责把业务规则、数据模型、权限边界和接口契约落成稳定服务，需要关注参数校验、异常处理、数据一致性和审计记录。",
                outputs: ["接口契约文档", "数据表设计", "权限与审计规则", "接口自测结果"],
                tools: ["Postman / Apifox", "MySQL Workbench", "Node.js 调试器", "接口日志", "Swagger / OpenAPI"],
                todos: [
                    {
                        title: "设计任务与提交记录接口",
                        priority: "P0",
                        detail: "保存文件时记录操作者、模块、位置、版本和时间。"
                    },
                    {
                        title: "补充项目成员权限校验",
                        priority: "P0",
                        detail: "限制成员只能访问所属项目，并记录越权风险。"
                    },
                    { title: "实现需求状态流转 API", priority: "P1", detail: "支持需求认领、评审、完成和回退。" }
                ]
            },
            testing: {
                title: "测试验收工作台",
                handbook:
                    "负责把需求变成可执行验收标准，覆盖主流程、异常路径、权限边界和回归风险，让团队知道什么才算真正完成。",
                outputs: ["测试用例清单", "缺陷记录", "回归报告", "验收结论"],
                tools: ["Playwright", "Jest / Vitest", "缺陷看板", "测试数据构造器", "截图与日志采集"],
                todos: [
                    {
                        title: "编写团队项目核心流程用例",
                        priority: "P0",
                        detail: "覆盖创建项目、打开文件、保存同步和 AI 审查。"
                    },
                    {
                        title: "补充权限与异常测试",
                        priority: "P0",
                        detail: "验证未登录、无权限、空文件路径、空内容等场景。"
                    },
                    { title: "形成验收报告模板", priority: "P1", detail: "输出通过项、阻塞项、风险项和复测建议。" }
                ]
            },
            deployment: {
                title: "实施部署工作台",
                handbook:
                    "负责把团队成果变成可访问、可演示、可回滚的交付物，需要关注环境变量、启动命令、健康检查、部署记录和演示脚本。",
                outputs: ["部署说明书", "环境变量清单", "健康检查结果", "演示与回滚方案"],
                tools: ["GitHub Actions", "Docker / PM2", "云服务器控制台", "日志监控", "部署截图"],
                todos: [
                    {
                        title: "整理本地与线上启动说明",
                        priority: "P0",
                        detail: "写清 npm install、npm start、数据库和 JWT 配置。"
                    },
                    {
                        title: "配置部署前检查清单",
                        priority: "P0",
                        detail: "包含语法检查、接口健康、页面访问和登录验证。"
                    },
                    {
                        title: "准备项目演示脚本",
                        priority: "P1",
                        detail: "按角色展示需求、代码、日志、审查和部署结果。"
                    }
                ]
            }
        };
        return workspaces[roleKey] || workspaces.frontend;
    }

    function teamCodeView() {
        const summary = state.data.teamCodeSummary || { projects: [], roles: [] };
        const detail = state.data.teamCodeProject;
        const project = detail?.project;
        const projects = summary.projects || [];
        const files = detail?.files || [];
        const members = detail?.members || [];
        const commits = detail?.commits || [];
        const events = detail?.events || [];
        const requirements = detail?.requirements || [];
        const tools = detail?.tools || [];
        const agents = detail?.agents || [];
        const repoHealth = detail?.repoHealth || {};
        const review = state.data.teamCodeReview;
        const pipeline = state.data.teamCodePipeline;
        const activeRole = state.data.teamCodeActiveRole || state.data.teamCodeModule || "frontend";
        const screen = state.data.teamCodeScreen || "overview";
        const roleKeys = ["frontend", "backend", "testing", "deployment"];
        const roleWorkspace = teamRoleWorkspace(activeRole);
        const roleRequirements = requirements.filter(item => item.moduleKey === activeRole);
        const roleMember = members.find(item => item.role_key === activeRole);
        const intake = state.data.teamCodeIntake || {};
        const moduleStats = detail?.moduleStats || summary.roles || [];
        const activeFile = state.data.teamCodeActiveFile;
        const repoFiles = repoDisplayFiles(files);
        const readmeFile = repoReadmeFile(files);
        const repoCommands = repoCloneCommands(project);
        const repoCurrentPath = state.data.teamCodeRepoPath || "";
        const repoRows = repoFolderRows(repoFiles, repoCurrentPath);
        const totals = projects.reduce(
            (acc, item) => {
                acc.members += Number(item.member_count || 0);
                acc.files += Number(item.file_count || 0);
                acc.commits += Number(item.commit_count || 0);
                return acc;
            },
            { members: 0, files: 0, commits: 0 }
        );
        const codeWallFile = activeFile || files.find(file => file.module_key === activeRole) || files[0];
        const codeWallSource = state.data.teamCodeSource || codeWallFile?.content || "";
        const codeWallLines = codeWallSource.split(/\r?\n/).slice(0, 18);
        const reviewChecklist = [
            { label: "需求对齐", value: requirements.length ? "已关联需求卡" : "待上传说明书" },
            { label: "职责边界", value: `${moduleStats.length || roleKeys.length} 个模块` },
            { label: "审查状态", value: review ? `${Number(review.score || 0)} 分` : "等待 AI 审查" },
            { label: "最新同步", value: commits.length ? formatDate(commits[0].created_at) : "暂无提交" }
        ];

        // 协作共享数据
        const sharedProblems = [
            {
                id: 1,
                author: "成员A",
                avatar: "A",
                title: "前端跨域问题",
                desc: "API请求时遇到CORS错误，需要后端配置允许跨域",
                tags: ["前端", "已解决"],
                time: "2小时前",
                replies: 3
            },
            {
                id: 2,
                author: "成员B",
                avatar: "B",
                title: "数据库连接池耗尽",
                desc: "高并发时数据库连接不够用，需要优化连接池配置",
                tags: ["后端", "进行中"],
                time: "昨天",
                replies: 5
            },
            {
                id: 3,
                author: "成员C",
                avatar: "C",
                title: "测试环境与生产不一致",
                desc: "本地测试通过但部署后报错，环境变量差异导致",
                tags: ["测试", "已解决"],
                time: "3天前",
                replies: 2
            }
        ];
        const sharedPrompts = [
            {
                id: 1,
                title: "代码审查提示词",
                desc: "请审查以下代码，重点关注：安全性、性能、可维护性",
                author: "成员B",
                usage: 12
            },
            {
                id: 2,
                title: "生成单元测试",
                desc: "为以下函数生成Jest单元测试，覆盖正常/异常/边界情况",
                author: "成员C",
                usage: 8
            },
            {
                id: 3,
                title: "API文档生成",
                desc: "根据以下代码生成OpenAPI 3.0规范的接口文档",
                author: "成员A",
                usage: 5
            }
        ];
        const sharedApis = [
            { id: 1, method: "GET", path: "/api/tasks", desc: "获取任务列表", module: "backend", status: "done" },
            { id: 2, method: "POST", path: "/api/tasks", desc: "创建新任务", module: "backend", status: "done" },
            { id: 3, method: "PUT", path: "/api/tasks/:id", desc: "更新任务状态", module: "backend", status: "doing" },
            {
                id: 4,
                method: "GET",
                path: "/api/files/:path",
                desc: "获取代码文件内容",
                module: "backend",
                status: "todo"
            }
        ];
        const sharedSkills =
            agents && agents.length
                ? agents
                : [
                      {
                          key: "code-review",
                          name: "AI 代码审查",
                          desc: "自动审查代码质量、安全漏洞和性能问题",
                          category: "质量",
                          status: "ready"
                      },
                      {
                          key: "test-gen",
                          name: "测试用例生成",
                          desc: "根据代码逻辑自动生成单元测试和集成测试",
                          category: "测试",
                          status: "ready"
                      },
                      {
                          key: "doc-gen",
                          name: "文档自动生成",
                          desc: "从代码注释和接口定义生成 API 文档",
                          category: "文档",
                          status: "draft"
                      },
                      {
                          key: "deploy-check",
                          name: "部署前检查",
                          desc: "检查环境配置、依赖版本和安全策略",
                          category: "运维",
                          status: "ready"
                      }
                  ];

        if (!project) {
            return `<main class="page team-v3-page">
                <section class="team-v3-empty">
                    <div class="team-v3-empty-icon">${icon("code", 48)}</div>
                    <h1>团队项目工作台</h1>
                    <p>围绕一个可落地作品完成需求拆解、角色分工、公共仓库、代码同步、AI 审查、测试验收与部署复盘</p>
                    <button class="btn primary glow" data-team-demo>${icon("plus", 17)}创建 4 人协作示例</button>
                </section>
            </main>`;
        }

        const score = Number(repoHealth.reviewScore || 0);
        const scorePercent = Math.min(100, Math.max(0, score));
        const circumference = 2 * Math.PI * 52;

        return `<main class="page team-v3-page">
            ${
                screen === "overview"
                    ? `
            <section class="team-v3-hero">
                <div class="team-v3-hero-left">
                    <span class="team-v3-hero-badge">${icon("code", 14)} 团队协作</span>
                    <h1>${escapeHtml(project.name)}</h1>
                    <p>${escapeHtml(project.description || "学生小组像真实研发团队一样交付项目")}</p>
                    <div class="team-v3-hero-tags">${(intake.techStack || [])
                        .slice(0, 6)
                        .map(item => `<span>${escapeHtml(item)}</span>`)
                        .join("")}</div>
                    <div class="team-v3-hero-actions">
                        <button class="btn primary" data-team-ai-pipeline="full">${icon("robot", 15)}AI 全流程审查</button>
                        <button class="btn ghost" data-team-ai-review>${icon("search", 15)}代码审查</button>
                        <label class="btn ghost"><input type="file" multiple data-team-code-upload style="display:none">${icon("upload", 15)}上传代码</label>
                    </div>
                </div>
                <div class="team-v3-hero-right">
                    <svg class="team-v3-ring" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-light, #e5e7eb)" stroke-width="8"/>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--primary, #4f46e5)" stroke-width="8"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference - (scorePercent / 100) * circumference}" stroke-linecap="round"
                            transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 0.6s ease"/>
                        <text x="60" y="54" text-anchor="middle" class="team-v3-ring-value" font-size="22" font-weight="700" fill="currentColor">${score}</text>
                        <text x="60" y="72" text-anchor="middle" class="team-v3-ring-label" font-size="11" fill="var(--text-secondary)">综合评分</text>
                    </svg>
                </div>
            </section>
            `
                    : `
            <section class="team-v3-hero team-v3-hero-compact">
                <div class="team-v3-hero-left">
                    <span class="team-v3-hero-badge">${icon("code", 14)} ${escapeHtml(project.name)}</span>
                    <div class="team-v3-hero-stats">
                        <span>${icon("folder", 13)}${projects.length} 项目</span>
                        <span>${icon("users", 13)}${totals.members || members.length} 成员</span>
                        <span>${icon("file", 13)}${totals.files || files.length} 文件</span>
                        <span>${icon("git", 13)}${totals.commits || commits.length} 提交</span>
                    </div>
                </div>
                <div class="team-v3-hero-actions">
                    <label class="btn primary"><input type="file" multiple data-team-code-upload style="display:none">${icon("upload", 15)}上传代码</label>
                    <label class="btn ghost"><input type="file" multiple data-team-doc-upload style="display:none">${icon("file", 15)}上传文档</label>
                    <button class="btn ghost" data-team-refresh>${icon("refresh", 15)}刷新</button>
                </div>
            </section>
            `
            }

            <nav class="team-v3-tabs">
                <button class="${screen === "overview" ? "active" : ""}" data-team-screen="overview">${icon("chart", 15)}总览大屏</button>
                ${roleKeys
                    .map(
                        key => `<button class="${screen === "role" && activeRole === key ? "active" : ""}" data-team-role="${key}">
                    ${key === "frontend" ? icon("layout", 14) : key === "backend" ? icon("server", 14) : key === "testing" ? icon("check", 14) : icon("cloud", 14)}
                    ${teamRoleName(key)}
                </button>`
                    )
                    .join("")}
                <button class="${screen === "tools" ? "active" : ""}" data-team-screen="tools">${icon("settings", 15)}工具 & MCP</button>
                <button class="${screen === "collab" ? "active" : ""}" data-team-screen="collab">${icon("users", 15)}协作共享</button>
            </nav>

            <div class="team-v3-layout">
                <!-- 左侧：项目列表 + 项目信息 -->
                <aside class="team-v3-sidebar">
                    <div class="team-v3-sidebar-section">
                        <div class="team-v3-sidebar-header">
                            <span>${icon("folder", 14)}项目列表</span>
                            <button class="btn tiny ghost" data-team-create>${icon("plus", 12)}</button>
                        </div>
                        <div class="team-v3-project-list">
                            ${(projects.length ? projects : [project])
                                .map(
                                    item => `<div class="team-v3-project-row ${Number(item.id) === Number(project?.id) ? "active" : ""}">
                                <button class="team-v3-project-btn" data-team-project="${item.id}">
                                    ${icon("folder", 14)} <span><b>${escapeHtml(item.name)}</b><small>${Number(item.file_count || 0)} 文件 · ${Number(item.commit_count || 0)} 提交</small></span>
                                </button>
                                ${projects.length > 1 ? `<button class="team-v3-project-del" data-team-delete-project="${item.id}" title="删除">${icon("x", 12)}</button>` : ""}
                            </div>`
                                )
                                .join("")}
                        </div>
                    </div>
                    <div class="team-v3-sidebar-section">
                        <div class="team-v3-sidebar-header">${icon("users", 14)}团队成员</div>
                        ${
                            members.length
                                ? members
                                      .map(
                                          m => `<div class="team-v3-member-row">
                            <span class="team-v3-avatar">${escapeHtml((m.full_name || m.username || "?").slice(0, 1).toUpperCase())}</span>
                            <div class="team-v3-member-info">
                                <span>${escapeHtml(m.full_name || m.username || "待分配")}</span>
                                <small>${teamRoleName(m.role_key)}</small>
                            </div>
                        </div>`
                                      )
                                      .join("")
                                : `<div class="team-v3-empty-sm">暂无成员</div>`
                        }
                    </div>
                    <div class="team-v3-sidebar-divider"></div>
                    <div class="team-v3-sidebar-section">
                        <div class="team-v3-sidebar-header">
                            <span>${icon("folder", 14)}仓库文件</span>
                        </div>
                        <div class="team-v3-repo-sidebar-head">
                            <div class="team-v3-repo-name">
                                ${icon("folder", 14)}<b>${escapeHtml(project.repository_name || "team-repo")}</b>
                                <span class="team-v3-repo-badge">Public</span>
                            </div>
                            <div class="team-v3-repo-actions">
                                <button class="btn tiny ghost" data-team-clone-copy>${icon("git", 12)}克隆</button>
                                <button class="btn tiny ghost" data-team-download>${icon("download", 12)}下载</button>
                                <label class="btn tiny ghost"><input type="file" multiple data-team-code-upload style="display:none">${icon("upload", 12)}上传</label>
                                <button class="btn tiny ghost" data-team-repo-new-file>${icon("plus", 12)}新建</button>
                            </div>
                        </div>
                        <div class="team-v3-repo-info">
                            <span>${icon("git", 12)}<b>${escapeHtml(repoHealth.branch || "main")}</b></span>
                            <span>${icon("file", 12)}${repoFiles.length} 个文件</span>
                            <span>${icon("git-commit", 12)}${commits.length} 次提交</span>
                        </div>
                    </div>
                    ${
                        repoFiles.length
                            ? `
                    <div class="team-v3-repo-sidebar-files">
                        <div class="team-v3-repo-breadcrumb">
                            ${repoBreadcrumbHtml(project, repoCurrentPath)}
                        </div>
                        <div class="team-v3-file-table-sidebar">
                            ${
                                repoCurrentPath
                                    ? `<button class="team-v3-file-row folder" data-team-repo-path="${escapeAttr(repoCurrentPath.split("/").slice(0, -1).join("/") || "")}" data-team-repo-folder="${escapeAttr(repoCurrentPath.split("/").slice(0, -1).join("/") || "")}">
                                <span>${icon("folder", 15)}..</span>
                            </button>`
                                    : ""
                            }
                            ${repoRows
                                .map(row =>
                                    row.type === "folder"
                                        ? `<button class="team-v3-file-row folder" data-team-repo-path="${escapeAttr(row.path)}" data-team-repo-folder="${escapeAttr(row.path)}">
                                <span>${icon("folder", 15)}${escapeHtml(row.name)}</span>
                            </button>`
                                        : `<div class="team-v3-file-row file ${activeFile && Number(activeFile.id) === Number(row.id) ? "active" : ""}">
                                <button data-team-file="${row.id}">
                                    <span>${fileIcon(row.name || row.path)}${escapeHtml(row.name || row.path)}</span>
                                </button>
                            </div>`
                                )
                                .join("")}
                        </div>
                    </div>
                    `
                            : `
                    <div class="team-v3-repo-empty">
                        <p>仓库为空</p>
                        <div class="team-v3-repo-commands">
                            <div class="team-v3-repo-cmd">
                                <span>克隆仓库</span>
                                <code>${escapeHtml(repoCommands.clone)}</code>
                            </div>
                            <div class="team-v3-repo-cmd">
                                <span>拉取代码</span>
                                <code>${escapeHtml(repoCommands.pull)}</code>
                            </div>
                            <div class="team-v3-repo-cmd">
                                <span>上传代码</span>
                                <code>${escapeHtml(repoCommands.upload)}</code>
                            </div>
                        </div>
                        <div class="team-v3-repo-empty-actions">
                            <label class="btn tiny primary"><input type="file" multiple data-team-code-upload style="display:none">上传文件</label>
                            <button class="btn tiny ghost" data-team-repo-new-file>新建文件</button>
                            <button class="btn tiny ghost" data-team-pull>拉取代码</button>
                        </div>
                    </div>
                    `
                    }
                </aside>

                <!-- 中间：核心内容区域 -->
                <section class="team-v3-main">
                    ${
                        screen === "overview"
                            ? `
                    <div class="team-v3-code-wall">
                        <div class="team-v3-code-wall-head">
                            <div>
                                <span class="team-v3-hero-badge">${icon("search", 14)}代码审查大屏</span>
                                <h2>统一回顾、统一审查、统一提交标准</h2>
                                <p>首页直接聚合当前仓库代码、岗位职责、需求验收和审查结果，方便全体开发成员在会议中对齐颗粒度。</p>
                            </div>
                            <div class="team-v3-code-wall-actions">
                                <button class="btn primary" data-team-ai-review ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("robot", 14)}审查当前代码</button>
                                <button class="btn ghost" data-team-ai-pipeline="full" ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("play", 14)}运行流水线</button>
                            </div>
                        </div>
                        <div class="team-v3-code-wall-grid">
                            <div class="team-v3-code-screen">
                                <div class="team-v3-code-screen-bar">
                                    <span>${fileIcon(codeWallFile?.path || "README.md")}${escapeHtml(codeWallFile?.path || "README.md")}</span>
                                    <small>${escapeHtml(codeWallFile?.language || state.data.teamCodeLanguage || "markdown")}</small>
                                </div>
                                <pre>${codeWallLines.length ? codeWallLines.map((line, index) => `<span><i>${String(index + 1).padStart(2, "0")}</i>${escapeHtml(line || " ")}</span>`).join("") : `<span><i>01</i>// 选择或上传代码文件后，这里会显示团队审查大屏</span>`}</pre>
                            </div>
                            <div class="team-v3-review-board">
                                ${reviewChecklist
                                    .map(
                                        item => `<div class="team-v3-review-check">
                                    <span>${escapeHtml(item.label)}</span>
                                    <b>${escapeHtml(item.value)}</b>
                                </div>`
                                    )
                                    .join("")}
                                <div class="team-v3-review-summary">
                                    <b>${review ? escapeHtml(review.level || "AI 审查") : "审查建议"}</b>
                                    <p>${escapeHtml(review?.summary || "建议先上传需求分析说明书和核心代码，再使用 AI 全流程审查生成质量评分、风险项、测试建议和修正方向。")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 指标卡片 -->
                    <div class="team-v3-metrics">
                        <article class="team-v3-metric-card">
                            <div class="team-v3-metric-icon">${icon("code", 20)}</div>
                            <div class="team-v3-metric-body">
                                <span>代码质量</span>
                                <b>${score} 分</b>
                                <small>${teamCodeQualityText(score)}</small>
                            </div>
                            <div class="team-v3-metric-bar"><span style="width:${scorePercent}%"></span></div>
                        </article>
                        <article class="team-v3-metric-card">
                            <div class="team-v3-metric-icon">${icon("target", 20)}</div>
                            <div class="team-v3-metric-body">
                                <span>开放需求</span>
                                <b>${Number(repoHealth.openRequirements || requirements.length)}</b>
                                <small>按模块认领</small>
                            </div>
                        </article>
                        <article class="team-v3-metric-card">
                            <div class="team-v3-metric-icon">${icon("rocket", 20)}</div>
                            <div class="team-v3-metric-body">
                                <span>发布阶段</span>
                                <b>${escapeHtml(repoHealth.deploymentStage || "开发中")}</b>
                                <small>测试与部署联动</small>
                            </div>
                        </article>
                        <article class="team-v3-metric-card">
                            <div class="team-v3-metric-icon">${icon("clock", 20)}</div>
                            <div class="team-v3-metric-body">
                                <span>最近提交</span>
                                <b>${commits.length ? escapeHtml(commits[0].username || "成员") : "暂无"}</b>
                                <small>${commits.length ? formatDate(commits[0].created_at) : "等待提交"}</small>
                            </div>
                        </article>
                    </div>

                    <!-- 模块进度卡片 -->
                    <div class="team-v3-modules">
                        <div class="team-v3-section-head">
                            <h2>${icon("layers", 16)}模块进度</h2>
                        </div>
                        <div class="team-v3-module-grid">
                            ${
                                moduleStats
                                    .map(role => {
                                        const percent = Math.min(
                                            100,
                                            24 + Number(role.fileCount || 0) * 18 + Number(role.commitCount || 0) * 10
                                        );
                                        const member = members.find(item => item.role_key === role.roleKey);
                                        return `<article class="team-v3-module-card ${role.roleKey === activeRole ? "active" : ""}" data-team-role="${escapeHtml(role.roleKey)}">
                                    <div class="team-v3-module-top">
                                        <span class="team-v3-module-badge team-v3-role-${escapeHtml(role.roleKey)}">${teamRoleName(role.roleKey)}</span>
                                        <b>${percent}%</b>
                                    </div>
                                    <div class="team-v3-module-bar"><span style="width:${percent}%"></span></div>
                                    <div class="team-v3-module-bottom">
                                        <small>${Number(role.fileCount || 0)} 文件 · ${Number(role.commitCount || 0)} 提交</small>
                                        <small>${escapeHtml(member?.full_name || member?.username || "待分配")}</small>
                                    </div>
                                </article>`;
                                    })
                                    .join("") || `<div class="team-v3-empty-sm">暂无模块数据</div>`
                            }
                        </div>
                    </div>

                    <!-- 需求开发卡片 -->
                    <div class="team-v3-requirements">
                        <div class="team-v3-section-head">
                            <h2>${icon("target", 16)}需求开发卡片</h2>
                            <div class="team-v3-filter-tabs">
                                <span class="team-v3-filter-tab active">全部 <b>${requirements.length}</b></span>
                                <span class="team-v3-filter-tab todo">待开发 <b>${requirements.filter(r => r.status === "todo").length}</b></span>
                                <span class="team-v3-filter-tab doing">开发中 <b>${requirements.filter(r => r.status === "doing").length}</b></span>
                                <span class="team-v3-filter-tab done">已完成 <b>${requirements.filter(r => r.status === "done").length}</b></span>
                            </div>
                        </div>
                        <div class="team-v3-requirement-grid">
                            ${
                                requirements.length
                                    ? requirements
                                          .map(
                                              item => `<article class="team-v3-req-card ${escapeHtml(item.status)}">
                                <div class="team-v3-req-top">
                                    <span class="team-v3-req-priority ${(item.priority || "").toLowerCase()}">${escapeHtml(item.priority || "P1")}</span>
                                    <span class="team-v3-req-status ${escapeHtml(item.status)}">${requirementStatusName(item.status)}</span>
                                </div>
                                <h3>${escapeHtml(item.title)}</h3>
                                <p>${escapeHtml(item.acceptance || "")}</p>
                                <div class="team-v3-req-bottom">
                                    <span>${teamRoleName(item.moduleKey)}</span>
                                    <button class="btn tiny ghost" data-team-role="${escapeHtml(item.moduleKey)}">认领</button>
                                </div>
                            </article>`
                                          )
                                          .join("")
                                    : `<div class="team-v3-empty-sm">
                                ${icon("target", 32)}
                                <p>暂无需求卡片，上传需求文档后自动生成</p>
                            </div>`
                            }
                        </div>
                    </div>

                    <!-- 项目资料 3 列 -->
                    <div class="team-v3-docs">
                        <div class="team-v3-section-head">
                            <h2>${icon("book", 16)}项目资料</h2>
                            <label class="team-v3-role-pick">
                                进入岗位
                                <select class="input" data-team-role-select>
                                    ${roleKeys.map(key => `<option value="${key}" ${activeRole === key ? "selected" : ""}>${teamRoleName(key)}</option>`).join("")}
                                </select>
                            </label>
                        </div>
                        <div class="team-v3-docs-grid">
                            <article class="team-v3-doc-card">
                                <h3>${icon("file-text", 14)}项目描述 / 技术栈</h3>
                                <p>${escapeHtml(intake.summary || project.description || "暂无项目描述")}</p>
                                <div class="team-v3-doc-tags">${
                                    (intake.techStack || [])
                                        .slice(0, 8)
                                        .map(item => `<span>${escapeHtml(item)}</span>`)
                                        .join("") || "<span>待补充技术栈</span>"
                                }</div>
                            </article>
                            <article class="team-v3-doc-card">
                                <h3>${icon("users", 14)}人员分工</h3>
                                ${
                                    moduleStats.length
                                        ? moduleStats
                                              .map(role => {
                                                  const member = members.find(item => item.role_key === role.roleKey);
                                                  return `<div class="team-v3-doc-role"><b>${teamRoleName(role.roleKey)}</b><span>${escapeHtml(member?.full_name || member?.username || "待分配")}</span><small>${escapeHtml(role.moduleName || "")}</small></div>`;
                                              })
                                              .join("")
                                        : "<p>暂无分工信息</p>"
                                }
                            </article>
                            <article class="team-v3-doc-card">
                                <h3>${icon("alert", 14)}注意事项</h3>
                                ${
                                    (intake.notes || []).length
                                        ? intake.notes
                                              .slice(0, 5)
                                              .map(item => `<p>${escapeHtml(item)}</p>`)
                                              .join("")
                                        : "<p>暂无注意事项</p>"
                                }
                            </article>
                        </div>
                    </div>
                    <div class="team-v3-compiler">
                        <div class="team-v3-section-head">
                            <h3>${icon("terminal", 16)}在线编译器 — 团队共享</h3>
                            <small>编写和运行项目相关代码</small>
                        </div>
                        <div class="team-v3-compiler-wrap">
                            <div class="team-v3-compiler-editor">
                                <div class="team-v3-compiler-bar">
                                    <select class="input" data-compiler-language>
                                        <option value="javascript" ${(state.data.teamCodeCompilerLang || "javascript") === "javascript" ? "selected" : ""}>JavaScript</option>
                                        <option value="python" ${(state.data.teamCodeCompilerLang || "") === "python" ? "selected" : ""}>Python</option>
                                        <option value="html" ${(state.data.teamCodeCompilerLang || "") === "html" ? "selected" : ""}>HTML</option>
                                    </select>
                                    <button class="btn primary" data-compiler-run>${icon("play", 14)}运行</button>
                                    <button class="btn ghost" data-compiler-clear>${icon("refresh", 14)}清空</button>
                                </div>
                                <textarea class="code-editor" data-compiler-source placeholder="// 团队共享编译器&#10;// 编写和测试代码逻辑" spellcheck="false">${escapeHtml(state.data.teamCodeCompilerSource || "")}</textarea>
                            </div>
                            <div class="team-v3-compiler-output">
                                <div class="team-v3-compiler-out-head">
                                    <span>${icon("terminal", 14)}编译输出</span>
                                    <small>${escapeHtml(state.data.teamCodeCompilerLang || "javascript")}</small>
                                </div>
                                <pre data-compiler-output>${escapeHtml(state.data.teamCodeCompilerOutput || "运行结果将在这里显示...")}</pre>
                            </div>
                        </div>
                    </div>
                    `
                            : ""
                    }

                    ${
                        screen === "role"
                            ? `
                    <div class="team-v3-role">
                        <div class="team-v3-role-head">
                            <div>
                                <span class="team-v3-role-badge team-v3-role-${escapeHtml(activeRole)}">${teamRoleName(activeRole)}</span>
                                <h2>${escapeHtml(roleWorkspace.title)}</h2>
                                <p>负责人：${escapeHtml(roleMember?.full_name || roleMember?.username || "待分配")}</p>
                            </div>
                            <select class="input team-v3-role-select" data-team-role-select>
                                ${roleKeys.map(key => `<option value="${key}" ${activeRole === key ? "selected" : ""}>${teamRoleName(key)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="team-v3-role-cards">
                            <article class="team-v3-card">
                                <span class="team-v3-card-icon">${icon("book", 20)}</span>
                                <h3>项目说明书</h3>
                                <p>${escapeHtml(roleWorkspace.handbook)}</p>
                            </article>
                            <article class="team-v3-card">
                                <span class="team-v3-card-icon">${icon("file", 20)}</span>
                                <h3>本岗位交付物</h3>
                                <ul>${roleWorkspace.outputs.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                            </article>
                            <article class="team-v3-card">
                                <span class="team-v3-card-icon">${icon("settings", 20)}</span>
                                <h3>可用开发工具</h3>
                                <ul>${roleWorkspace.tools.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                            </article>
                        </div>
                        <div class="team-v3-role-tasks">
                            <div class="team-v3-section-head">
                                <h3>${icon("target", 16)}待办任务 (${roleRequirements.length + roleWorkspace.todos.length} 项)</h3>
                            </div>
                            <div class="team-v3-todo-grid">
                                ${roleWorkspace.todos
                                    .map(
                                        item => `<article class="team-v3-todo-card">
                                    <span class="team-v3-todo-badge ${(item.priority || "").toLowerCase()}">${escapeHtml(item.priority)}</span>
                                    <b>${escapeHtml(item.title)}</b>
                                    <p>${escapeHtml(item.detail)}</p>
                                </article>`
                                    )
                                    .join("")}
                                ${roleRequirements
                                    .map(
                                        item => `<article class="team-v3-todo-card requirement">
                                    <span class="team-v3-todo-badge ${(item.priority || "").toLowerCase()}">${escapeHtml(item.priority)}</span>
                                    <b>${escapeHtml(item.title)}</b>
                                    <p>${escapeHtml(item.acceptance)}</p>
                                    <small>${requirementStatusName(item.status)}</small>
                                </article>`
                                    )
                                    .join("")}
                                ${!roleWorkspace.todos.length && !roleRequirements.length ? `<div class="team-v3-empty-sm">暂无待办任务</div>` : ""}
                            </div>
                        </div>
                        <div class="team-v3-ide-launch">
                            <div class="team-v3-section-head">
                                <h3>${icon("external-link", 16)}在外部 IDE 中打开</h3>
                                <small>使用本地 IDE 开发和调试 ${teamRoleName(activeRole)} 代码</small>
                            </div>
                            <div class="team-v3-ide-grid">
                                <button class="team-v3-ide-card" data-team-ide="vscode" title="在 VS Code 中打开项目">
                                    <span class="team-v3-ide-icon vscode">${icon("code", 28)}</span>
                                    <b>VS Code</b>
                                    <small>vscode://打开</small>
                                </button>
                                <button class="team-v3-ide-card" data-team-ide="idea" title="在 IntelliJ IDEA 中打开项目">
                                    <span class="team-v3-ide-icon idea">${icon("settings", 28)}</span>
                                    <b>IntelliJ IDEA</b>
                                    <small>jetbrains://打开</small>
                                </button>
                                <button class="team-v3-ide-card" data-team-ide="pycharm" title="在 PyCharm 中打开项目">
                                    <span class="team-v3-ide-icon pycharm">${icon("terminal", 28)}</span>
                                    <b>PyCharm</b>
                                    <small>pycharm://打开</small>
                                </button>
                                <button class="team-v3-ide-card" data-team-ide="webstorm" title="在 WebStorm 中打开项目">
                                    <span class="team-v3-ide-icon webstorm">${icon("layout", 28)}</span>
                                    <b>WebStorm</b>
                                    <small>jetbrains://打开</small>
                                </button>
                            </div>
                            <p class="team-v3-ide-hint">点击上方按钮将通过协议调用本地 IDE。如无法打开，请确保已安装对应 IDE 并配置协议关联。总览大屏提供在线编译器。</p>
                        </div>
                    </div>
                    `
                            : ""
                    }

                    ${
                        screen === "tools"
                            ? `
                    <div class="team-v3-tools">
                        <div class="team-v3-section-head">
                            <h2>${icon("settings", 18)}工具集成 & MCP</h2>
                            <small>可替换为真实 MCP Server</small>
                        </div>
                        <div class="team-v3-skills-grid">
                            ${sharedSkills
                                .map(
                                    skill => `<button class="team-v3-skill-card" data-team-tool="${escapeHtml(skill.key)}">
                                <div class="team-v3-skill-top">
                                    <span class="team-v3-skill-icon">${icon(skill.key === "lighthouse" ? "search" : skill.key === "playwright" ? "play" : skill.key === "eslint" ? "code" : "settings", 22)}</span>
                                    <div class="team-v3-skill-badges">
                                        <span class="team-v3-badge-sm">${escapeHtml(skill.category || "工具")}</span>
                                        <span class="team-v3-badge-sm ${escapeHtml(skill.status)}">${toolStatusName(skill.status)}</span>
                                    </div>
                                </div>
                                <b>${escapeHtml(skill.name)}</b>
                                <p>${escapeHtml(skill.description || "")}</p>
                            </button>`
                                )
                                .join("")}
                            ${
                                tools.length
                                    ? tools
                                          .map(
                                              tool => `<button class="team-v3-skill-card" data-team-tool="${escapeHtml(tool.key)}">
                                <div class="team-v3-skill-top">
                                    <span class="team-v3-skill-icon">${icon(tool.key === "lighthouse" ? "search" : tool.key === "playwright" ? "play" : tool.key === "eslint" ? "code" : "settings", 22)}</span>
                                    <div class="team-v3-skill-badges">
                                        <span class="team-v3-badge-sm">工具</span>
                                        <span class="team-v3-badge-sm ${escapeHtml(tool.status)}">${toolStatusName(tool.status)}</span>
                                    </div>
                                </div>
                                <b>${escapeHtml(tool.name)}</b>
                                <p>${escapeHtml(tool.description || "")}</p>
                            </button>`
                                          )
                                          .join("")
                                    : ""
                            }
                        </div>
                        <div class="team-v3-pipeline">
                            <div class="team-v3-section-head">
                                <h3>${icon("robot", 16)}AI DevOps 流水线</h3>
                            </div>
                            <div class="team-v3-pipeline-bar">
                                <button class="btn primary" data-team-ai-pipeline="full" ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("play", 14)}审查 + 测试 + 修正</button>
                                <button class="btn ghost" data-team-ai-pipeline="review" ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("search", 14)}只审查</button>
                                <button class="btn ghost" data-team-ai-pipeline="test" ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("file", 14)}生成测试</button>
                                <button class="btn ghost" data-team-ai-pipeline="fix" ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("settings", 14)}修正建议</button>
                            </div>
                            ${pipeline ? `<div class="team-v3-pipeline-out"><pre>${escapeHtml(pipeline.report || pipeline.modelComment || JSON.stringify(pipeline, null, 2))}</pre></div>` : ""}
                        </div>
                        <div class="team-v3-log">
                            <div class="team-v3-section-head">
                                <h3>${icon("terminal", 16)}工具调用日志</h3>
                            </div>
                            <pre class="team-v3-log-area">${escapeHtml(state.data.teamCodeToolLog || "暂无调用记录")}</pre>
                        </div>
                    </div>
                    `
                            : ""
                    }

                    ${
                        screen === "collab"
                            ? `
                    <div class="team-v3-collab">
                        <div class="team-v3-collab-main">
                            <div class="team-v3-collab-block">
                                <div class="team-v3-section-head">
                                    <h2>${icon("alert", 18)}问题墙</h2>
                                    <span class="team-v3-badge-sm">${sharedProblems.length} 个问题</span>
                                </div>
                                <p class="team-v3-collab-desc">团队成员遇到的开发问题汇总，共同讨论解决方案</p>
                                <div class="team-v3-problem-list">
                                    ${sharedProblems
                                        .map(
                                            p => `<article class="team-v3-problem-card">
                                        <div class="team-v3-problem-head">
                                            <span class="team-v3-avatar small">${escapeHtml(p.avatar || p.author.slice(0, 1))}</span>
                                            <div>
                                                <b>${escapeHtml(p.title)}</b>
                                                <small>${escapeHtml(p.author)} · ${escapeHtml(p.time)}</small>
                                            </div>
                                            <span class="team-v3-reply-count">${icon("message", 12)} ${p.replies || 0}</span>
                                        </div>
                                        <p>${escapeHtml(p.desc)}</p>
                                        <div class="team-v3-problem-tags">${p.tags.map(t => `<span>${escapeHtml(t)}</span>`).join("")}</div>
                                    </article>`
                                        )
                                        .join("")}
                                </div>
                                <button class="btn ghost team-v3-add-btn">${icon("plus", 14)}提交新问题</button>
                            </div>
                            <div class="team-v3-collab-block">
                                <div class="team-v3-section-head">
                                    <h2>${icon("robot", 18)}提示词工程</h2>
                                    <span class="team-v3-badge-sm">${sharedPrompts.length} 条</span>
                                </div>
                                <p class="team-v3-collab-desc">团队共享的高质量 AI 提示词模板</p>
                                <div class="team-v3-prompt-grid">
                                    ${sharedPrompts
                                        .map(
                                            p => `<article class="team-v3-prompt-card">
                                        <div class="team-v3-prompt-top">
                                            <b>${escapeHtml(p.title)}</b>
                                            <span class="team-v3-badge-sm">已用 ${p.usage} 次</span>
                                        </div>
                                        <p>${escapeHtml(p.desc)}</p>
                                        <div class="team-v3-prompt-bottom">
                                            <span>${escapeHtml(p.author)}</span>
                                            <button class="btn tiny ghost">${icon("copy", 12)}复制</button>
                                        </div>
                                    </article>`
                                        )
                                        .join("")}
                                </div>
                                <button class="btn ghost team-v3-add-btn">${icon("plus", 14)}添加提示词</button>
                            </div>
                            <div class="team-v3-collab-block">
                                <div class="team-v3-section-head">
                                    <h2>${icon("server", 18)}接口规范</h2>
                                    <span class="team-v3-badge-sm">${sharedApis.length} 个接口</span>
                                </div>
                                <p class="team-v3-collab-desc">前后端协定的 API 接口规范</p>
                                <div class="team-v3-api-table">
                                    <div class="team-v3-api-head">
                                        <span>方法</span><span>路径</span><span>描述</span><span>模块</span><span>状态</span>
                                    </div>
                                    ${sharedApis
                                        .map(
                                            api => `<div class="team-v3-api-row">
                                        <span class="team-v3-api-method ${escapeHtml(api.method)}">${escapeHtml(api.method)}</span>
                                        <code>${escapeHtml(api.path)}</code>
                                        <span>${escapeHtml(api.desc)}</span>
                                        <span>${teamRoleName(api.module)}</span>
                                        <span class="team-v3-tag-sm ${escapeHtml(api.status)}">${api.status === "done" ? "已完成" : api.status === "doing" ? "开发中" : "待开发"}</span>
                                    </div>`
                                        )
                                        .join("")}
                                </div>
                                <button class="btn ghost team-v3-add-btn">${icon("plus", 14)}添加接口</button>
                            </div>
                        </div>
                        <aside class="team-v3-collab-side">
                            <div class="team-v3-collab-block">
                                <div class="team-v3-section-head">
                                    <h3>${icon("zap", 16)}AI 问题预警</h3>
                                </div>
                                <div class="team-v3-warn-list">
                                    <div class="team-v3-warn-card warn">
                                        <span class="team-v3-warn-icon">${icon("alert", 16)}</span>
                                        <div><b>数据库配置缺失</b><p>检测到连接池未配置最大连接数</p></div>
                                    </div>
                                    <div class="team-v3-warn-card info">
                                        <span class="team-v3-warn-icon">${icon("info", 16)}</span>
                                        <div><b>测试环境不一致</b><p>本地 Node 版本与 CI 环境不匹配</p></div>
                                    </div>
                                    <div class="team-v3-warn-card warn">
                                        <span class="team-v3-warn-icon">${icon("shield", 16)}</span>
                                        <div><b>跨域配置风险</b><p>CORS 允许了所有来源请求</p></div>
                                    </div>
                                    <div class="team-v3-warn-card info">
                                        <span class="team-v3-warn-icon">${icon("lock", 16)}</span>
                                        <div><b>鉴权未覆盖</b><p>部分 API 接口缺少 Token 校验</p></div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                    `
                            : ""
                    }
                    ${
                        activeFile
                            ? `
                    <!-- 代码编辑器和审查面板 -->
                    <div class="team-v3-editor-panel" style="margin: 0 0 20px 0;">
                        <div class="team-v3-editor-bar">
                            <span>${fileIcon(state.data.teamCodePath || activeFile?.path)}${escapeHtml(state.data.teamCodePath || activeFile?.path || "新文件")}</span>
                            <small>${escapeHtml(state.data.teamCodeLanguage || activeFile?.language || "javascript")}</small>
                        </div>
                        <textarea class="code-editor team-v3-editor-area" data-team-source spellcheck="false">${escapeHtml(state.data.teamCodeSource || activeFile?.content || "")}</textarea>
                        <div class="team-v3-editor-actions">
                            <input class="input" data-team-message value="${escapeHtml(state.data.teamCodeMessage || "")}" placeholder="提交说明" style="flex:1">
                            <button class="btn primary" data-team-save ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("save", 14)}${state.data.teamCodeLoading ? "同步中..." : "保存同步"}</button>
                            <button class="btn ghost" data-team-ai-review ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("robot", 14)}AI 审查</button>
                            <button class="btn ghost" data-team-ai-pipeline="full" ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("play", 14)}审查测试修正</button>
                        </div>
                        ${
                            review
                                ? `<div class="team-v3-review-result">
                            <div class="team-v3-review-head"><b>AI 代码审查 · ${escapeHtml(review.level)}</b><span>${Number(review.score || 0)}分</span></div>
                            <p>${escapeHtml(review.summary || "")}</p>
                            ${(review.findings || []).length ? `<ul>${review.findings.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
                        </div>`
                                : ""
                        }
                    </div>
                    `
                            : ""
                    }
                    ${
                        readmeFile
                            ? `
                    <!-- README -->
                    <div class="team-v3-readme" style="margin: 0 0 20px 0;">
                        <div class="team-v3-readme-head">
                            <h3>${icon("book", 15)}${escapeHtml(readmeFile.path || "README.md")}</h3>
                            <label class="btn tiny ghost"><input type="file" multiple accept=".md,.txt,.doc,.docx,.pdf" data-team-doc-upload style="display:none">${icon("upload", 12)}更新</label>
                        </div>
                        <div class="team-v3-readme-body">${renderMarkdownLite(readmeFile.content || "")}</div>
                    </div>
                    `
                            : `
                    <!-- README 空状态 -->
                    <div class="team-v3-readme team-v3-readme-empty" style="margin: 0 0 20px 0;">
                        <div class="team-v3-readme-head">
                            <h3>${icon("book", 15)}README.md / 项目说明书</h3>
                            <label class="btn tiny ghost"><input type="file" multiple accept=".md,.txt,.doc,.docx,.pdf" data-team-doc-upload style="display:none">${icon("upload", 12)}上传</label>
                        </div>
                        <div class="team-v3-readme-body">
                            <p>还没有 README 或项目说明书。上传 <b>README.md</b>、需求文档、接口说明或部署说明后，会在这里形成团队项目文档入口。</p>
                            <pre># ${escapeHtml(project.name)}\n\n## 项目简介\n\n## 本地运行\nnpm install\nnpm start\n\n## 上传代码\n在仓库面板点击上传文件或上传文件夹。\n\n## 提交规范\ngit add .\ngit commit -m "feat: 完成功能说明"\ngit push origin main</pre>
                        </div>
                    </div>
                    `
                    }
                </section>

                <!-- 右侧导航栏 -->
                <aside class="team-v3-activity">
                    <div class="team-v3-activity-section">
                        <div class="team-v3-sidebar-header">${icon("trending", 16)}项目阶段</div>
                        <div class="team-v3-stage">
                            ${["需求分析", "设计开发", "测试验收", "部署上线"]
                                .map((label, i) => {
                                    const stageProgress = Number(project.progress || 0);
                                    const stageDone = stageProgress >= (i + 1) * 25;
                                    const stageActive = !stageDone && (i === 0 || stageProgress >= i * 25);
                                    return `<div class="team-v3-stage-row ${stageDone ? "done" : stageActive ? "active" : ""}">
                                    <span class="team-v3-stage-dot"></span>
                                    <div><b>${label}</b><small>${stageDone ? "已完成" : stageActive ? "进行中" : "待开始"}</small></div>
                                </div>`;
                                })
                                .join("")}
                        </div>
                    </div>
                    <div class="team-v3-sidebar-divider"></div>
                    <div class="team-v3-activity-section">
                        <div class="team-v3-sidebar-header">${icon("users", 16)}成员动态</div>
                        <div class="team-v3-member-events">
                            ${
                                members.slice(0, 5).length
                                    ? members
                                          .slice(0, 5)
                                          .map(
                                              m => `<div class="team-v3-member-event">
                                <span class="team-v3-avatar tiny">${escapeHtml((m.full_name || m.username || "?").slice(0, 1).toUpperCase())}</span>
                                <div><b>${escapeHtml(m.full_name || m.username || "待分配")}</b><small>${teamRoleName(m.role_key)} · ${commits.filter(c => c.module_key === m.role_key).length || 0} 次提交</small></div>
                            </div>`
                                          )
                                          .join("")
                                    : `<div class="team-v3-empty-sm">暂无成员动态</div>`
                            }
                        </div>
                    </div>
                    <div class="team-v3-sidebar-divider"></div>
                    <div class="team-v3-activity-section">
                        <div class="team-v3-sidebar-header">${icon("clock", 16)}研发日志</div>
                        <div class="team-v3-timeline">
                            ${
                                commits.slice(0, 8).length
                                    ? commits
                                          .slice(0, 8)
                                          .map(
                                              commit => `<div class="team-v3-timeline-item">
                                <div class="team-v3-timeline-dot"></div>
                                <div>
                                    <b>${escapeHtml(commit.message || "代码同步")}</b>
                                    <span>${escapeHtml(commit.username || "成员")}</span>
                                    <small>${teamRoleName(commit.module_key)} · ${formatDate(commit.created_at)}</small>
                                </div>
                            </div>`
                                          )
                                          .join("")
                                    : `<div class="team-v3-empty-sm">暂无提交记录</div>`
                            }
                        </div>
                    </div>
                    <div class="team-v3-sidebar-divider"></div>
                    <div class="team-v3-activity-section">
                        <div class="team-v3-sidebar-header">${icon("radar", 16)}协作动态</div>
                        <div class="team-v3-event-feed">
                            ${
                                events.slice(0, 6).length
                                    ? events
                                          .slice(0, 6)
                                          .map(
                                              event => `<div class="team-v3-event-item">
                                <b>${escapeHtml(event.title)}</b>
                                <small>${escapeHtml(event.username || "系统")} · ${escapeHtml(event.detail || "")}</small>
                            </div>`
                                          )
                                          .join("")
                                    : `<div class="team-v3-empty-sm">暂无动态</div>`
                            }
                        </div>
                    </div>
                </aside>
            </div>
        </main>`;
    }

    function resourcesView() {
        const resources = state.data.resources || [];
        const categories = state.data.resourceCategories || [];
        const filter = state.data.resourceFilter;
        const catList = categories.length
            ? categories
            : [
                  { category: "编程入门", count: 4 },
                  { category: "算法与数据结构", count: 5 },
                  { category: "页面交互学习", count: 4 },
                  { category: "服务逻辑学习", count: 3 },
                  { category: "数据库", count: 3 },
                  { category: "人工智能", count: 4 },
                  { category: "操作系统与网络", count: 4 },
                  { category: "视频教程", count: 5 }
              ];
        const diffColors = {
            beginner: "var(--green)",
            intermediate: "var(--blue)",
            advanced: "var(--orange)",
            all: "var(--muted)"
        };
        const typeIcons = {
            tutorial: "book",
            video: "play",
            practice: "code",
            reference: "file",
            tool: "settings",
            community: "folder"
        };

        return `<main class="page">
            <section class="resource-hero">
                <div class="hero"><h1>${icon("layers", 24)} 学习资源中心</h1>
                    <p>围绕学生当前学习目标汇总课程、练习、视频和拓展阅读，帮助教师为不同层次学生快速匹配资源。</p>
                </div>
                ${metricCards()}
            </section>
            <section class="resource-toolbar">
                <div class="resource-search">
                    <span class="search-icon">${icon("search", 16)}</span>
                    <input class="input resource-search-input" data-resource-search placeholder="搜索资源名称或描述..." value="${escapeHtml(filter.search)}">
                </div>
                <div class="resource-filters">
                    <select class="input resource-filter-select" data-resource-filter="category">
                        <option value="">全部分类</option>
                        ${catList.map(c => `<option value="${escapeHtml(c.category)}" ${filter.category === c.category ? "selected" : ""}>${escapeHtml(c.category)} (${c.count})</option>`).join("")}
                    </select>
                    <select class="input resource-filter-select" data-resource-filter="type">
                        <option value="">全部类型</option>
                        <option value="tutorial" ${filter.type === "tutorial" ? "selected" : ""}>教程</option>
                        <option value="video" ${filter.type === "video" ? "selected" : ""}>视频</option>
                        <option value="practice" ${filter.type === "practice" ? "selected" : ""}>刷题</option>
                        <option value="reference" ${filter.type === "reference" ? "selected" : ""}>参考</option>
                        <option value="tool" ${filter.type === "tool" ? "selected" : ""}>工具</option>
                        <option value="community" ${filter.type === "community" ? "selected" : ""}>社区</option>
                    </select>
                    <select class="input resource-filter-select" data-resource-filter="difficulty">
                        <option value="">全部难度</option>
                        <option value="beginner" ${filter.difficulty === "beginner" ? "selected" : ""}>入门</option>
                        <option value="intermediate" ${filter.difficulty === "intermediate" ? "selected" : ""}>进阶</option>
                        <option value="advanced" ${filter.difficulty === "advanced" ? "selected" : ""}>高级</option>
                    </select>
                </div>
            </section>
            <section class="resource-grid">
                ${
                    resources.length === 0
                        ? `<div class="resource-empty"><span>${icon("search", 48)}</span><h3>暂无资源数据</h3><p>请点击下方按钮初始化资源数据</p><button class="btn primary" data-seed-resources>${icon("refresh", 16)} 初始化资源</button></div>`
                        : resources
                              .map(
                                  r => `
                    <a class="resource-card" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" data-resource-id="${r.id}" data-track-click>
                        <div class="resource-card-head">
                            <span class="resource-icon" style="--rc-color:${diffColors[r.difficulty] || "var(--muted)"}">${icon(typeIcons[r.type] || "book", 20)}</span>
                            <span class="resource-diff" style="background:${diffColors[r.difficulty] || "var(--bg)"}">${r.difficulty === "beginner" ? "入门" : r.difficulty === "intermediate" ? "进阶" : r.difficulty === "advanced" ? "高级" : "综合"}</span>
                        </div>
                        <h3>${escapeHtml(r.name)}</h3>
                        <p>${escapeHtml(r.description)}</p>
                        <div class="resource-meta">
                            <span>${icon(typeIcons[r.type] || "book", 12)} ${r.type === "tutorial" ? "教程" : r.type === "video" ? "视频" : r.type === "practice" ? "刷题" : r.type === "reference" ? "参考" : r.type === "tool" ? "工具" : "社区"}</span>
                            <span>${icon("clock", 12)} ${r.click_count || 0} 次访问</span>
                        </div>
                    </a>
                `
                              )
                              .join("")
                }
            </section>
        </main>`;
    }

    function tutorialsView() {
        const quickLinks = [
            { name: "菜鸟教程", url: "https://www.runoob.com", icon: "book", desc: "适合零基础学生循序渐进学习" },
            {
                name: "MDN Web Docs",
                url: "https://developer.mozilla.org/zh-CN",
                icon: "book",
                desc: "适合查阅页面交互知识点"
            },
            { name: "W3School 中文", url: "https://www.w3school.com.cn", icon: "layers", desc: "适合补齐网页基础概念" },
            { name: "Hello 算法", url: "https://www.hello-algo.com", icon: "brain", desc: "动画图解数据结构与算法" },
            { name: "Vue.js 官方文档", url: "https://cn.vuejs.org", icon: "code", desc: "适合项目化页面学习" },
            { name: "React 中文文档", url: "https://zh-hans.react.dev", icon: "code", desc: "适合组件化思维训练" }
        ];
        const url = state.data.tutorialsUrl || "https://www.runoob.com";
        return `<main class="page">
            <section class="tutorial-hero">
                <div class="hero"><h1>${icon("book", 24)} 在线教程</h1><p>为学生提供可直接进入的学习材料，教师可引导学生按主题查阅、练习和复盘。</p></div>
            </section>
            <section class="tutorial-browser">
                <aside class="tutorial-sidebar">
                    <h3>${icon("list", 16)} 快速切换</h3>
                    <div class="tutorial-link-list">
                        ${quickLinks
                            .map(
                                l => `
                            <button class="tutorial-link-btn ${url === l.url ? "active" : ""}" data-tutorial-url="${escapeHtml(l.url)}">
                                <span class="tutorial-link-icon">${icon(l.icon, 16)}</span>
                                <span><b>${escapeHtml(l.name)}</b><small>${escapeHtml(l.desc)}</small></span>
                            </button>
                        `
                            )
                            .join("")}
                    </div>
                    <p class="tutorial-hint">${icon("info", 12)} 点击上方链接即可在右侧加载站点</p>
                </aside>
                <div class="tutorial-viewer">
                    <div class="tutorial-viewer-header">
                        <span>${icon("book", 14)} ${escapeHtml(url.replace(/https?:\/\//, "").split("/")[0])}</span>
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn tiny ghost">${icon("send", 13)} 新窗口打开</a>
                    </div>
                    <iframe class="tutorial-iframe" src="${escapeHtml(url)}" sandbox="allow-same-origin allow-scripts allow-forms" title="在线教程" loading="lazy"></iframe>
                </div>
            </section>
        </main>`;
    }

    function problemsView() {
        const problems = state.data.problems || [];
        const total = state.data.problemsTotal || 0;
        const detail = state.data.problemDetail;
        const filter = state.data.problemFilter;
        const code = state.data.problemCode;
        const result = state.data.problemResult;
        const running = state.data.problemRunning;

        if (detail) {
            const examples = Array.isArray(detail.examples) ? detail.examples : [];
            const templates = detail.template_code || {};
            const lang = state.data.codeLanguage || "javascript";
            const template = templates[lang] || "// 在这里编写代码\n";
            return `<main class="page problem-detail-page">
                <section class="problem-detail-layout">
                    <div class="problem-detail-left">
                        <div class="problem-detail-header">
                            <button class="btn tiny ghost" data-problem-back>${icon("arrow-left", 15)} 返回列表</button>
                            <span class="problem-diff-badge" style="--pd-color:${detail.difficulty === "easy" ? "var(--green)" : detail.difficulty === "medium" ? "var(--orange)" : "var(--red)"}">${detail.difficulty === "easy" ? "简单" : detail.difficulty === "medium" ? "中等" : "困难"}</span>
                        </div>
                        <h2>${escapeHtml(detail.title)}</h2>
                        <div class="problem-tags">${(detail.tags || "")
                            .split(",")
                            .filter(Boolean)
                            .map(t => `<span class="pill">${escapeHtml(t.trim())}</span>`)
                            .join("")}</div>
                        <div class="problem-desc"><pre>${escapeHtml(detail.description)}</pre></div>
                        <div class="problem-examples">
                            <h3>示例</h3>
                            ${examples
                                .map(
                                    (ex, i) => `
                                <div class="problem-example">
                                    <div><b>输入：</b><code>${escapeHtml(ex.input)}</code></div>
                                    <div><b>输出：</b><code>${escapeHtml(ex.output)}</code></div>
                                    ${ex.explanation ? `<div><b>解释：</b><span>${escapeHtml(ex.explanation)}</span></div>` : ""}
                                </div>
                            `
                                )
                                .join("")}
                        </div>
                        ${renderAlgorithmVisualizer()}
                    </div>
                    <div class="problem-detail-right">
                        <div class="problem-code-header">
                            <select class="input problem-lang-select" data-problem-lang>
                                <option value="javascript" ${lang === "javascript" ? "selected" : ""}>JavaScript</option>
                                <option value="python" ${lang === "python" ? "selected" : ""}>Python</option>
                                <option value="java" ${lang === "java" ? "selected" : ""}>Java</option>
                            </select>
                            <button class="btn primary small" data-problem-run ${running ? "disabled" : ""}>${icon("play", 14)} ${running ? "运行中..." : "运行"}</button>
                        </div>
                        <textarea class="code-editor problem-code-editor" data-problem-code spellcheck="false">${escapeHtml(code || template)}</textarea>
                        <div class="problem-output">
                            <div class="output-header"><span>${icon("terminal", 13)} 执行结果</span></div>
                            <pre class="problem-result">${escapeHtml(result || "点击「运行」查看输出")}</pre>
                        </div>
                    </div>
                </section>
            </main>`;
        }

        return `<main class="page">
            <section class="problem-hero">
                <div class="hero"><h1>${icon("code", 24)} 编程题库</h1><p>按知识点提供编程练习，学生完成后获得反馈，教师可据此判断算法与语法掌握情况。</p></div>
            </section>
            <section class="problem-toolbar">
                <div class="problem-search">
                    <span>${icon("search", 16)}</span>
                    <input class="input" data-problem-search placeholder="搜索题目名称或标签..." value="${escapeHtml(filter.search)}">
                </div>
                <div class="problem-filters">
                    <select class="input" data-problem-diff>
                        <option value="">全部难度</option>
                        <option value="easy" ${filter.difficulty === "easy" ? "selected" : ""}>简单</option>
                        <option value="medium" ${filter.difficulty === "medium" ? "selected" : ""}>中等</option>
                        <option value="hard" ${filter.difficulty === "hard" ? "selected" : ""}>困难</option>
                    </select>
                    <span class="problem-count">共 ${total} 题</span>
                </div>
            </section>
            <section class="problem-list">
                ${
                    problems.length === 0
                        ? `
                    <div class="resource-empty">
                        <span>${icon("code", 48)}</span>
                        <h3>暂无题目数据</h3>
                        <button class="btn primary" data-seed-resources>${icon("refresh", 16)} 初始化题库</button>
                    </div>
                `
                        : problems
                              .map(
                                  p => `
                    <button class="problem-item" data-problem-id="${p.id}">
                        <div class="problem-item-left">
                            <span class="problem-diff-dot" style="--pd-color:${p.difficulty === "easy" ? "var(--green)" : p.difficulty === "medium" ? "var(--orange)" : "var(--red)"}"></span>
                            <span><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.tags || "")}</small></span>
                        </div>
                        <div class="problem-item-right">
                            <span class="pill">${p.difficulty === "easy" ? "简单" : p.difficulty === "medium" ? "中等" : "困难"}</span>
                            <span class="problem-source">${escapeHtml(p.source || "internal")}</span>
                        </div>
                    </button>
                `
                              )
                              .join("")
                }
            </section>
        </main>`;
    }

    function videosView() {
        const videos = [
            {
                name: "B站 编程区",
                url: "https://www.bilibili.com/v/popular/programming",
                icon: "play",
                desc: "B站编程开发热门视频",
                tag: "综合"
            },
            {
                name: "中国大学MOOC",
                url: "https://www.icourse163.org",
                icon: "play",
                desc: "名校计算机专业课程",
                tag: "课程"
            },
            { name: "慕课网", url: "https://www.imooc.com", icon: "play", desc: "程序员实战视频课", tag: "实战" },
            {
                name: "学堂在线",
                url: "https://www.xuetangx.com",
                icon: "play",
                desc: "清华出品计算机课程",
                tag: "课程"
            },
            {
                name: "YouTube CS",
                url: "https://www.youtube.com",
                icon: "play",
                desc: "CS50/FreeCodeCamp 编程频道",
                tag: "综合"
            },
            {
                name: "极客学院",
                url: "https://www.jikexueyuan.com",
                icon: "play",
                desc: "IT职业培训视频课程",
                tag: "职业"
            }
        ];
        const url = state.data.tutorialsUrl || "https://www.bilibili.com/v/popular/programming";
        return `<main class="page">
            <section class="video-hero">
                <div class="hero"><h1>${icon("play", 24)} 视频教程</h1><p>汇集优质编程视频学习平台，一站式观看学习。</p></div>
            </section>
            <section class="video-grid">
                ${videos
                    .map(
                        v => `
                    <a class="video-card" href="${escapeHtml(v.url)}" target="_blank" rel="noopener noreferrer">
                        <div class="video-card-bg" style="background:linear-gradient(135deg, ${["#2f6bff", "#7c4dff", "#18b87a", "#ff9500", "#ef4444", "#8b5cf6"][Math.floor(Math.random() * 6)]}, transparent)"></div>
                        <span class="video-card-icon">${icon(v.icon, 28)}</span>
                        <h3>${escapeHtml(v.name)}</h3>
                        <p>${escapeHtml(v.desc)}</p>
                        <span class="pill">${escapeHtml(v.tag)}</span>
                    </a>
                `
                    )
                    .join("")}
            </section>
            <section class="video-embed-section">
                <h2>${icon("play", 18)} 在线观看</h2>
                <div class="video-embed-wrapper">
                    <div class="video-embed-header">
                        <span>${icon("play", 14)} ${escapeHtml(url.replace(/https?:\/\//, "").split("/")[0])}</span>
                        <div class="video-quick-links">
                            ${videos.map(v => `<button class="btn tiny ghost ${url === v.url ? "active" : ""}" data-video-url="${escapeHtml(v.url)}">${escapeHtml(v.name)}</button>`).join("")}
                        </div>
                    </div>
                    <iframe class="video-iframe" src="${escapeHtml(url)}" sandbox="allow-same-origin allow-scripts allow-forms" title="视频教程" loading="lazy"></iframe>
                </div>
            </section>
        </main>`;
    }

    function aiAssistantView() {
        const assistant = state.data.aiAssistant || {};
        const services = assistant.services || [];
        const llmStatus = assistant.llm || assistant.spark || {};
        const context = assistant.context || {};
        const weakPoints = context.weakPoints || [];
        const courses = context.courses || [];
        const agentConsole = state.data.intelligence?.agentConsole || {};
        const todayJudgment = agentConsole.todayJudgment || {};
        const executionRecords = agentConsole.executionRecords || [];
        const agents = agentConsole.agents || [];
        const lastAnswer =
            [...state.data.aiAssistantMessages].reverse().find(message => message.role === "ai")?.content || "";
        const aiConfig = state.data.aiConfig || {};
        const baseModes = aiConfig.assistantModes || [
            { key: "tutor", icon: "brain", label: "学习问答", desc: "讲概念、追问、给例题" },
            { key: "mistake", icon: "exam", label: "错题教练", desc: "定位错因和同类题" },
            { key: "note", icon: "pen", label: "笔记生成", desc: "转结构化卡片" },
            { key: "oral", icon: "send", label: "口语表达", desc: "陪练和表达优化" },
            { key: "plan", icon: "route", label: "课程规划", desc: "拆目标和复习节奏" },
            { key: "agent", icon: "bolt", label: "智能体任务", desc: "调用工具并写回系统" }
        ];
        const modes = [{ key: "rag", icon: "db", label: "RAG知识库", desc: "本地模型按证据回答" }, ...baseModes].map(
            item => [item.key, item.icon, item.label, item.desc]
        );
        const activeMode = modes.find(([key]) => key === state.data.aiAssistantMode) || modes[0];
        const agentCards = [
            ["感知", "search", "支持截图搜题与题干识别", "上传题图后自动进入错题教练"],
            [
                "推理",
                "brain",
                "结合薄弱点、课程和笔记回答",
                weakPoints[0] ? `当前优先：${weakPoints[0].title}` : "暂无薄弱点数据"
            ],
            ["行动", "pen", "回答可沉淀为笔记和复习卡", lastAnswer ? "最近回答可继续整理" : "等待第一次对话"],
            [
                "编排",
                "route",
                "把问答转成计划、练习和复盘",
                courses[0] ? `最近课程：${courses[0].title}` : "可生成学习路径"
            ]
        ];
        const assistantPromptMap = {
            rag: [
                "软件测试中的边界值分析是什么？",
                "软件架构中的可测试性和可维护性应该怎么理解？",
                "RAG 回答为什么需要引用证据？"
            ],
            tutor: [
                "把这个概念讲给初学者听，并追问我 2 个问题",
                "给我一道由易到难的检验题",
                "把这节课最容易混淆的点列出来"
            ],
            mistake: [
                "请按错因、正确思路、同类题识别三步拆解",
                "根据这道题生成 2 道变式题",
                "把我的错误整理成错题复盘卡"
            ],
            note: [
                "整理成康奈尔笔记、主动回忆题和复习计划",
                "从这段内容提取 5 个关键词和 3 张卡片",
                "把回答变成适合明天复习的笔记"
            ],
            oral: ["帮我润色这段表达并给出评分", "围绕这个主题连续追问我 3 轮", "改写成自然、简洁的英文表达"],
            plan: [
                "按今天、明天、考前拆一个复习安排",
                "根据我的薄弱点生成 30 分钟学习闭环",
                "把目标拆成课程、练习、笔记三类任务"
            ],
            agent: [
                "我 7 天后要考操作系统，帮我设计复习课并写入学习路径",
                "根据我最近的错题分析下一步，并生成练习和笔记任务",
                "把 AI Agent 入门课程拆成 5 天实训计划"
            ]
        };
        const quickPrompts =
            { ...assistantPromptMap, ...(aiConfig.assistantPrompts || {}) }[state.data.aiAssistantMode] || [];
        const messages = state.data.aiAssistantMessages.length
            ? state.data.aiAssistantMessages
            : [
                  {
                      role: "ai",
                      content: "你好，我已经接入学习数据。你可以问课程问题、贴错题、整理笔记，或者让我生成复习计划。"
                  }
              ];
        const promptPlaceholders = {
            rag: "例如：软件架构中的可测试性和可维护性应该怎么理解？",
            tutor: "例如：用高中生能听懂的话解释一下函数极限，并给我一道检验题",
            mistake: "例如：我这道 SQL 题为什么错？帮我找错因和同类题识别方法",
            note: "例如：把这段课程内容整理成康奈尔笔记和 3 张主动回忆卡",
            oral: "例如：帮我练一段英文自我介绍，指出语法和发音注意点",
            plan: "例如：我三天后要考数据结构，帮我安排复习计划",
            agent: "例如：我 7 天后要考操作系统，帮我设计复习课程、练习和笔记任务",
            ...(aiConfig.promptPlaceholders || {})
        };
        const runtimeResult = state.data.agentRuntimeResult || {};
        const ragResult = state.data.ragAskResult || {};
        const ragCitations = ragResult.citations || [];
        const runtimeTraces = state.data.agentRuntimeTraces || runtimeResult.traces || [];
        const pendingPrompt = state.data._pendingAgentPrompt || "";
        const taskFlowCards = [
            [
                "今日判断",
                "brain",
                todayJudgment.focus || weakPoints[0]?.title || "当前薄弱点",
                todayJudgment.reason || "结合答题、课程、笔记与考试数据生成下一步学习动作。"
            ],
            [
                "任务流",
                "bolt",
                todayJudgment.nextTask || "生成闭环任务",
                executionRecords[0]?.detail || "一键把问答转为练习、笔记、复习和报告信号。"
            ],
            [
                "多智能体",
                "users",
                agents.length ? `${agents.length} 个 Agent 协同` : "规划 / 教学 / 出题 / 评估",
                "学习助手、资源、画像、监督等 Agent 共同完成学习闭环。"
            ]
        ];
        return `<main class="page ai-assistant-page">
            <section class="ai-agent-hero">
                <div class="agent-orb" aria-hidden="true"><span>${icon("robot", 38)}</span><i></i><i></i><i></i></div>
                <div class="ai-agent-copy">
	                    <span class="pill good">学习智能体 · ${escapeHtml(activeMode[2])}</span>
	                    <h1>一个入口完成 RAG 问答、错题、笔记和智能体任务流</h1>
	                    <p>本地大模型、知识库检索和学习智能体已整理到这里：对话解决具体问题，证据链解释来源，任务流继续沉淀为练习、笔记、复习和学情信号。</p>
	                    <div class="hero-actions"><button class="btn primary glow" data-ai-assistant-mode="rag">${icon("db", 17)}知识库问答</button><button class="btn ghost" data-ai-assistant-mode="mistake">${icon("exam", 17)}错题拆解</button><button class="btn ghost" data-run-agent-flow>${icon("bolt", 17)}运行任务流</button></div>
                </div>
                <div class="ai-agent-cards">${agentCards.map(([title, ic, text, meta]) => `<article><span>${icon(ic, 18)}</span><b>${escapeHtml(title)}</b><p>${escapeHtml(text)}</p><small>${escapeHtml(meta)}</small></article>`).join("")}</div>
            </section>
            <section class="assistant-product-grid">
                <article class="card assistant-console">
	                    <div class="card-head"><div><span class="pill ${llmStatus.configured ? "good" : "warn"}">${llmStatus.configured ? "本地模型已接入" : "待配置"}</span><h2>学习对话</h2><p>${escapeHtml(llmStatus.model || "DeepSeek-R1-Distill:Qwen-1.5B")} · ${escapeHtml(llmStatus.endpoint || "Local LLM")}</p></div><button class="btn tiny ghost" data-refresh-ai-assistant>${icon("refresh", 15)}刷新</button></div>
                    <div class="mode-tabs assistant-mode-tabs">${modes.map(([key, ic, label, desc]) => `<button class="${state.data.aiAssistantMode === key ? "active" : ""}" data-ai-assistant-mode="${key}">${icon(ic, 16)}<span>${label}<small>${desc}</small></span></button>`).join("")}</div>
                    <div class="quick-prompt-row">${quickPrompts.map(item => `<button class="quick-prompt" data-ai-quick-prompt="${escapeAttr(item)}">${escapeHtml(item)}</button>`).join("")}</div>
                    <div class="assistant-chat">${messages.map(message => `<div class="chat-bubble ${message.role === "user" ? "user" : "ai"}"><b>${message.role === "user" ? "我" : "AI助手"}</b><div class="chat-content">${message.role === "ai" ? renderMarkdownLite(message.content) : escapeHtml(message.content)}</div>${message.react_steps && message.react_steps.length ? `<div class="react-chain"><button class="react-toggle" data-react-toggle>${icon("brain", 13)} 查看思考过程</button><div class="react-steps hidden">${message.react_steps.map((s, si) => `<div class="react-step"><span class="react-step-label">${s.type === "thought" ? "🤔 思考" : s.type === "action" ? "🔧 行动" : s.type === "observation" ? "👁️ 观察" : "💡 结论"}</span><span>${escapeHtml(s.content || "")}</span></div>`).join("")}</div></div>` : ""}</div>`).join("")}</div>
                    <textarea class="textarea assistant-prompt" data-ai-assistant-input placeholder="${escapeHtml(promptPlaceholders[state.data.aiAssistantMode] || promptPlaceholders.tutor)}">${escapeHtml(pendingPrompt)}</textarea>
                    <input type="file" accept="image/*" data-ai-screenshot-input hidden>
	                    <div class="assistant-actions"><button class="btn primary" data-send-ai-assistant>${icon("send", 17)}交给智能体</button><button class="btn teal" data-save-last-ai-note>${icon("pen", 17)}回答存为笔记</button><button class="btn ghost" data-ai-screenshot-trigger>${icon("search", 17)}截图搜题</button><button class="btn ghost" data-ai-assistant-demo="voice">${icon("bell", 17)}语音提问</button></div>
	                </article>
	                <aside class="side-card">
	                    ${
                            state.data.aiAssistantMode === "rag"
                                ? `<article class="card assistant-rag-card">
	                        <div class="card-head"><h2 class="section-title">${icon("db", 18)}RAG 证据链</h2><span class="pill">${ragResult.hitCount ?? 0} 条</span></div>
	                        <div class="list">${ragCitations.length ? ragCitations.map(ev => `<div class="list-row"><span>${escapeHtml(ev.title)}<small>${escapeHtml(ev.snippet || "")}</small></span><span class="pill">[${ev.rank}]</span></div>`).join("") : `<p>切换到 RAG知识库 模式提问后，这里会显示召回证据。</p>`}</div>
	                        <div class="list-row"><span>回答来源</span><span class="pill">${escapeHtml(ragResult.provider || "local")}</span></div>
	                    </article>`
                                : ""
                        }
	                    <article class="card assistant-flow-card">
                        <div class="card-head"><h2 class="section-title">${icon("bolt", 18)}智能体任务流</h2><button class="btn tiny ghost" data-run-agent-flow>${icon("refresh", 14)}生成</button></div>
                        <div class="assistant-flow-list">${taskFlowCards.map(([title, ic, value, desc]) => `<div class="assistant-flow-row"><span class="round-icon">${icon(ic, 17)}</span><span><b>${escapeHtml(value)}</b><small>${escapeHtml(title)} · ${escapeHtml(desc)}</small></span></div>`).join("")}</div>
                        <div class="agent-timeline compact">${
                            executionRecords
                                .slice(0, 4)
                                .map(
                                    record =>
                                        `<div class="agent-timeline-item ${escapeHtml(record.status)}"><span></span><div><b>${escapeHtml(record.title)}</b><p>${escapeHtml(record.detail)}</p><small>${escapeHtml(record.agent)} · ${escapeHtml(record.type)}</small></div></div>`
                                )
                                .join("") ||
                            `<div class="empty-state compact">点击“运行任务流”后，会在这里显示练习、笔记和复习安排。</div>`
                        }</div>
                    </article>
                    <article class="card assistant-trace-card">
                        <div class="card-head"><h2 class="section-title">${icon("radar", 18)}Agent 执行轨迹</h2><span class="pill">${runtimeTraces.length || 0} 步</span></div>
                        <div class="agent-trace-list">${
                            runtimeTraces.length
                                ? runtimeTraces
                                      .map(
                                          step => `<div class="agent-trace-step ${escapeHtml(step.stepType || step.step_type || "")}">
                            <span>${escapeHtml(step.stepType || step.step_type || "step")}</span>
                            <b>${escapeHtml(step.title || "")}</b>
                            <p>${escapeHtml(step.content || "")}</p>
                            ${step.toolName || step.tool_name ? `<small>${icon("settings", 12)}${escapeHtml(step.toolName || step.tool_name)} · 置信度 ${escapeHtml(String(step.confidence ?? "--"))}</small>` : ""}
                        </div>`
                                      )
                                      .join("")
                                : `<div class="empty-state compact">输入学习目标后，这里会展示智能体读取画像、分析路径、调用工具和写回任务的过程。</div>`
                        }</div>
                    </article>
                    ${
                        runtimeResult.courseDesign?.design
                            ? `<article class="card assistant-course-design">
                        <div class="card-head"><h2 class="section-title">${icon("calendar", 18)}AI 课程设计</h2><span class="pill good">${runtimeResult.courseDesign.design.durationDays} 天</span></div>
                        <div class="course-design-mini">${runtimeResult.courseDesign.design.units
                            .slice(0, 4)
                            .map(
                                unit =>
                                    `<div><b>${escapeHtml(unit.title)}</b><p>${escapeHtml(unit.objective)}</p><small>${escapeHtml(unit.reason)}</small></div>`
                            )
                            .join("")}</div>
                    </article>`
                            : ""
                    }
                    ${
                        runtimeResult.rag?.citations?.length
                            ? `<article class="card assistant-rag-card">
                        <div class="card-head"><h2 class="section-title">${icon("db", 18)}RAG 证据链</h2><span class="pill good">${runtimeResult.rag.hitCount} 条</span></div>
                        <div class="list">${runtimeResult.rag.citations
                            .slice(0, 4)
                            .map(
                                ev =>
                                    `<a class="list-row" href="${escapeAttr(ev.url || ev.source?.url || "#")}" target="_blank" rel="noreferrer"><span><b>${escapeHtml(ev.title)}</b><small>${escapeHtml(ev.source?.name || "")} · ${escapeHtml(ev.snippet || "")}</small></span><span class="pill">${escapeHtml(String(ev.rank))}</span></a>`
                            )
                            .join("")}</div>
                    </article>`
                            : ""
                    }
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("db", 18)}能力接入状态</h2><span class="pill">API Matrix</span></div><div class="service-list">${services.map(service => `<div class="service-row"><span class="round-icon">${icon(service.key === "spark" ? "robot" : service.key === "ocr" ? "search" : service.key === "tts" ? "bell" : "file", 17)}</span><span><b>${escapeHtml(service.name)}</b><small>${escapeHtml(service.use)}${service.value ? ` · ${escapeHtml(service.value)}` : ""}</small></span><i class="${service.status}">${service.status === "connected" || service.status === "ready" ? "已接入" : "待接入"}</i></div>`).join("")}</div></article>
                    <article class="card"><h2 class="section-title">${icon("bolt", 18)}产品痛点拆解</h2><div class="list">${(assistant.productNeeds || []).map(item => `<div class="list-row"><span>${escapeHtml(item)}</span><span class="pill">需求</span></div>`).join("")}</div></article>
                </aside>
            </section>
            <section class="assistant-roadmap grid-3">
                ${(assistant.requiredXfyunApis || []).map((item, index) => `<article class="card"><span class="pill">${index === 0 ? "已可用" : "后续接入"}</span><h3>${escapeHtml(item.split("：")[0])}</h3><p>${escapeHtml(item.split("：").slice(1).join("：") || item)}</p></article>`).join("")}
            </section>
        </main>`;
    }

    function normalizeJson(value) {
        if (!value) return null;
        if (typeof value === "object") return value;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    function agentResearchView() {
        const weak = state.data.weakPoints?.[0]?.title || "AI Agent 基础";
        const aiConfig = state.data.aiConfig || {};
        const roadmap = aiConfig.agentRoadmap || [
            {
                num: "01",
                title: "读懂 Agent",
                desc: "学习 LLM、ReAct、Planning、Reflection、Memory、RAG 和 MCP。",
                tag: "学习",
                view: "tutorials"
            },
            {
                num: "02",
                title: "记录知识",
                desc: "把概念、代码片段、错题复盘沉淀成可检索笔记。",
                tag: "沉淀",
                view: "smartNotes"
            },
            {
                num: "03",
                title: "跑通工程",
                desc: "在 AI 编程舱运行工具调用、RAG、多智能体模板。",
                tag: "开发",
                view: "codeLab"
            },
            {
                num: "04",
                title: "接入平台",
                desc: "把诊断、路径、练习、笔记和导师对话组织成学习智能体。",
                tag: "融合",
                view: "aiAssistant"
            }
        ];
        const integrations = aiConfig.openSourceIntegrations || [];
        const features = [
            [
                "智能体学习路线",
                "route",
                "基于 Hello-Agents 章节生成 4 周学习计划，每个节点绑定课程、练习、笔记模板和项目任务。",
                "path"
            ],
            [
                "Obsidian 式智能笔记",
                "pen",
                "为笔记增加双向链接、标签、主动回忆卡、复习状态和知识图谱视角。",
                "smartNotes"
            ],
            [
                "AgentScope 实训舱",
                "code",
                "在 AI 编程舱里提供 ReAct Agent、工具调用、RAG 检索、多 Agent 协作的可运行模板。",
                "codeLab"
            ],
            [
                "个人知识库 Agent",
                "db",
                "读取平台笔记和学习数据，回答“我哪里不会、下一步学什么、如何复习”。",
                "aiAssistant"
            ],
            [
                "多智能体项目工坊",
                "users",
                "用团队项目模块模拟产品经理、架构师、开发、测试、审查四类 Agent 协作。",
                "teamCode"
            ],
            [
                "Agent 效果评估",
                "radar",
                "用正确率、任务完成率、工具调用成功率、笔记复用率评估智能体是否真的帮到学习。",
                "report"
            ]
        ];
        const sprint = [
            ["第 1 步", "做入口和路线", "新增本页，明确三类资源如何融入 EduSmart。", "已完成"],
            ["第 2 步", "升级智能笔记", "加入链接、标签、复习卡和知识库检索入口。", "下一步"],
            ["第 3 步", "建设 Agent 实训", "内置 Hello-Agents 到 AgentScope 的代码练习模板。", "规划中"],
            ["第 4 步", "打通知识库 Agent", "让 AI 助手能检索学生笔记、课程和错题再回答。", "规划中"]
        ];
        return `<main class="page agent-research-page">
            <section class="agent-research-hero">
                <div>
                    <span class="pill good">AI Agent 学习与研发中枢</span>
                    <h1>开源内容不再只是链接，而是落到 EduSmart 的功能模块里</h1>
                    <p>这里把 Hello-Agents、AgentScope、Obsidian 拆成“学习路线、实训模板、项目协作、知识库检索、效果评估”五类可用能力，学生能直接在平台里学、练、做项目。</p>
                    <div class="hero-actions">
                        <button class="btn primary" data-view="aiAssistant">${icon("robot", 17)}进入 AI 学习助手</button>
                        <button class="btn ghost" data-view="codeLab">${icon("code", 17)}运行实训模板</button>
                        <button class="btn ghost" data-view="teamCode">${icon("users", 17)}查看项目工坊</button>
                    </div>
                </div>
                <aside class="agent-research-signal">
                    <b>当前建议切入点</b>
                    <h2>${escapeHtml(weak)}</h2>
                    <p>先围绕一个薄弱点完成“学概念、写笔记、跑代码、做评估”的闭环，再逐步扩展到完整 Agent 项目。</p>
                    <button class="btn tiny teal" data-run-closed-loop="${escapeHtml(weak)}">${icon("bolt", 14)}运行学习闭环</button>
                </aside>
            </section>

            <section class="agent-source-grid">
                ${integrations
                    .map(
                        item => `<article class="card agent-source-card">
                    <span class="round-icon">${icon(item.icon || "layers", 18)}</span>
                    <div><h2>${escapeHtml(item.name || item.title)}</h2><b>${escapeHtml(item.source || item.category || "开源资料")}</b><p>${escapeHtml(item.summary || item.desc || "")}</p></div>
                    <div class="agent-project-proof"><strong>项目内落地</strong><span>${escapeHtml(item.projectLanding || item.project || "")}</span></div>
                    <div class="agent-module-chips">${(item.actions || item.landing || [])
                        .map(action => {
                            const label = Array.isArray(action) ? action[0] : action.label;
                            const view = Array.isArray(action) ? action[1] : action.view;
                            const prompt = Array.isArray(action) ? "" : action.prompt || "";
                            return `<button class="pill-button" data-view="${escapeAttr(view)}" ${prompt ? `data-agent-prompt="${escapeAttr(prompt)}"` : ""}>${escapeHtml(label)}</button>`;
                        })
                        .join("")}</div>
                    <button class="btn tiny primary" data-agent-source-plan="${escapeAttr(item.name || item.title)}">${icon("bolt", 13)}生成落地任务</button>
                    <a class="agent-source-link" href="${escapeAttr(item.repoUrl || item.href)}" target="_blank" rel="noreferrer">${icon("external-link", 13)}开源来源</a>
                </article>`
                    )
                    .join("")}
            </section>

            <section class="card agent-roadmap-card">
                <div class="card-head"><div><h2 class="section-title">${icon("route", 18)}小白到项目落地路线</h2><p class="muted-line">先理解，再记录，再开发，最后接入 EduSmart 的学习闭环。</p></div><button class="btn tiny ghost" data-view="path">${icon("route", 14)}生成学习路径</button></div>
                <div class="agent-roadmap-rail">${roadmap
                    .map(
                        item => `<button class="agent-roadmap-step" data-view="${escapeAttr(item.view)}">
                    <span>${escapeHtml(item.num)}</span><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.desc)}</p><i>${escapeHtml(item.tag)}</i>
                </button>`
                    )
                    .join("")}</div>
            </section>

            <section class="card agent-implementation-card">
                <div class="card-head"><div><h2 class="section-title">${icon("git", 18)}开源能力到项目模块映射</h2><p class="muted-line">每一项都指向平台里的真实页面或能力，不把 GitHub 当成孤立资料库。</p></div><span class="pill good">已整理</span></div>
                <div class="agent-implementation-grid">
                    ${(aiConfig.agentImplementationMap || []).map(item => `<article><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.desc)}</p><button class="btn tiny ghost" data-view="${escapeAttr(item.view)}">${icon("arrow-right", 13)}进入模块</button></article>`).join("")}
                </div>
            </section>

            <section class="agent-feature-grid">
                ${features
                    .map(
                        ([title, ic, desc, view]) => `<article class="card agent-feature-card">
                    <span class="round-icon">${icon(ic, 18)}</span>
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(desc)}</p>
                    <button class="btn tiny ghost" data-view="${view}">${icon("arrow-right", 14)}进入相关模块</button>
                </article>`
                    )
                    .join("")}
            </section>

            <section class="grid-2 agent-delivery-grid">
                <article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("layers", 18)}研发迭代计划</h2><span class="pill">MVP 到增强版</span></div>
                    <div class="list">${sprint.map(([step, title, desc, status]) => `<div class="list-row"><span><b>${escapeHtml(step)} · ${escapeHtml(title)}</b><small>${escapeHtml(desc)}</small></span><span class="pill ${status === "已完成" ? "good" : ""}">${escapeHtml(status)}</span></div>`).join("")}</div>
                </article>
                <article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("target", 18)}最终效果</h2><span class="pill good">产品愿景</span></div>
                    <div class="resource-doc">${renderMarkdownLite(`- 小白可以按路线学习 Agent，不再只看零散资料。
- 学习笔记像 Obsidian 一样可链接、可复习、可检索。
- AgentScope 的工程思想会变成平台里的实训模板和智能体能力。
- AI 助手能基于课程、错题、笔记、画像给出更可信的回答。
- 教师可以看到学生学习 Agent 的进度、项目成果和能力变化。`)}</div>
                </article>
            </section>
        </main>`;
    }

    function conceptCanvasView() {
        const canvases = state.data._canvases || [];
        const activeCanvas = state.data._activeCanvas || null;
        const searchResults = state.data._canvasSearchResults || [];
        const searchQuery = state.data._canvasSearchQuery || "";

        if (activeCanvas) {
            return `<main class="page canvas-page">
            <section class="canvas-toolbar">
                <button class="btn ghost" data-canvas-back>${icon("arrow-left", 16)} 返回列表</button>
                <input class="input" value="${escapeHtml(activeCanvas.name)}" data-canvas-name placeholder="画布名称" style="width:200px">
                <button class="btn primary" data-canvas-save>${icon("save", 16)} 保存</button>
                <button class="btn ghost" data-canvas-add-node>${icon("plus", 16)} 添加节点</button>
            </section>
            <section class="canvas-editor-grid">
                <div class="card canvas-sidebar">
                    <div class="card-head"><h3>${icon("search", 14)} 搜索元素</h3></div>
                    <div class="canvas-search-row">
                        <input class="input" data-canvas-search placeholder="搜索笔记或知识点..." value="${escapeHtml(searchQuery)}">
                    </div>
                    <div class="canvas-search-results">
                        ${
                            searchResults
                                .map(
                                    item => `
                            <div class="canvas-search-item" draggable="true" data-canvas-drag-item="${escapeHtml(JSON.stringify(item))}">
                                <span class="pill tiny">${item.type === "note" ? "笔记" : "知识点"}</span>
                                <span>${escapeHtml(item.name)}</span>
                            </div>
                        `
                                )
                                .join("") || '<p class="text-muted">输入关键词搜索</p>'
                        }
                    </div>
                </div>
                <div class="canvas-main" id="concept-canvas" data-canvas-main>
                    <div class="canvas-grid-bg"></div>
                    ${(activeCanvas.data || [])
                        .map(
                            node => `
                        <div class="canvas-node" data-canvas-node-id="${node.id}" 
                             style="left:${node.x}px;top:${node.y}px"
                             draggable="true"
                             data-canvas-node-drag>
                            <span class="canvas-node-type pill tiny">${node.type || "自定义"}</span>
                            <span class="canvas-node-label">${escapeHtml(node.name)}</span>
                            <button class="canvas-node-del" data-canvas-node-del="${node.id}">×</button>
                        </div>
                    `
                        )
                        .join("")}
                    <div class="canvas-drop-hint text-muted" style="${(activeCanvas.data || []).length === 0 ? "" : "display:none"}">拖拽搜索结果到此处，或点击"添加节点"</div>
                </div>
            </section>
        </main>`;
        }

        return `<main class="page canvas-page">
        <section class="hero-row">
            <div class="hero">
                <h1>${icon("layout", 24)} 概念画布</h1>
                <p>拖拽笔记和知识点到画布上，用连线组织它们之间的关系，构建你的知识地图。</p>
                <div class="hero-actions">
                    <button class="btn primary" data-canvas-create>${icon("plus", 16)} 新建画布</button>
                    <button class="btn ghost" data-view="knowledgeGraph">${icon("radar", 16)} 知识图谱</button>
                </div>
            </div>
        </section>
        <section class="canvas-list">
            ${
                canvases.length === 0
                    ? '<div class="empty-state card"><p>还没有画布。点击"新建画布"开始整理你的知识。</p></div>'
                    : canvases
                          .map(
                              c => `
                <div class="card canvas-card" data-canvas-open="${c.id}">
                    <h3>${icon("layout", 16)} ${escapeHtml(c.name)}</h3>
                    <div class="canvas-card-meta">
                        <span class="text-muted">更新于 ${new Date(c.updated_at).toLocaleString("zh-CN")}</span>
                        <button class="btn tiny ghost" data-canvas-delete="${c.id}">${icon("trash", 13)}</button>
                    </div>
                </div>
            `
                          )
                          .join("")
            }
        </section>
    </main>`;
    }

    function assistantFloat() {
        return `<button class="assistant-float" data-view="aiAssistant">${icon("robot", 30)}<small>AI 助手</small></button>`;
    }

    // ========== Obsidian 知识库视图 ==========
    function obsidianView() {
        const kb = state.data.obsidianKB;
        const results = state.data.obsidianSearchResults;
        const activeNote = state.data.obsidianActiveNote;
        const tab = state.data.obsidianTab || "notes";
        const searchQuery = state.data.obsidianSearchQuery || "";
        const activeFolder = state.data.obsidianActiveFolder || "all";
        const isSearching = searchQuery.length > 0;

        // 文件夹列表 - folders is an object {name: count}, convert to array
        const foldersObj = kb ? kb.folders || {} : {};
        const foldersArr = Object.entries(foldersObj).map(([name, count]) => ({ name, count }));
        const filteredFolders = [{ name: "all", count: kb ? (kb.notes || []).length : 0 }].concat(foldersArr);

        // 笔记列表
        let displayNotes = [];
        if (isSearching && results) {
            displayNotes = (results.results || []).map(r => ({
                path: r.path,
                title: r.title || r.path,
                folder: r.folder,
                kind: r.kind || "笔记",
                tags: r.tags || [],
                preview: r.preview || "",
                _score: r.score
            }));
        } else if (kb) {
            displayNotes = kb.notes || [];
            if (activeFolder && activeFolder !== "all") {
                displayNotes = displayNotes.filter(n => n.folder === activeFolder);
            }
        }

        // 标签
        const tagsArr = kb ? kb.tags || [] : [];
        const tags = Array.isArray(tagsArr)
            ? tagsArr.slice(0, 15)
            : Object.entries(tagsArr)
                  .map(([k, v]) => ({ tag: k, name: k, total: v }))
                  .slice(0, 15);

        // 统计 - stats uses "notes" not "total"
        const stats = kb ? kb.stats || {} : {};

        function noteKindIcon(kind) {
            if (kind === "题目" || kind === "题库")
                return `<div class="vault-note-icon exam">${icon("exam", 18)}</div>`;
            if (kind === "知识" || kind === "知识点")
                return `<div class="vault-note-icon graph">${icon("radar", 18)}</div>`;
            return `<div class="vault-note-icon file">${icon("file-text", 18)}</div>`;
        }

        function tagClass(i) {
            const classes = ["purple", "teal", "amber", "muted"];
            return classes[i % classes.length];
        }

        return `<main class="page vault-page">
            <section class="vault-hero">
                <h1>${icon("db", 24)} Obsidian 知识库</h1>
                <p>本地双向链接知识库 · ${stats.notes || 0} 个文件 · ${stats.links || 0} 条链接 · 支持 RAG 检索</p>
                <div class="vault-hero-actions">
                    <button class="btn-violet" data-obsidian-sync>${icon("refresh", 16)} 同步到 RAG</button>
                    <button class="btn-violet-outline" data-obsidian-refresh>${icon("refresh", 16)} 刷新索引</button>
                </div>
            </section>

            <section class="vault-metrics">
                <div class="vault-metric">
                    <div class="vault-metric-icon purple">${icon("file-text", 22)}</div>
                    <div>
                        <div class="vault-metric-label">文件总数</div>
                        <div class="vault-metric-value">${stats.notes || 0}<span> 个</span></div>
                    </div>
                </div>
                <div class="vault-metric">
                    <div class="vault-metric-icon teal">${icon("git", 22)}</div>
                    <div><div class="vault-metric-label">双向链接</div><div class="vault-metric-value">${stats.links || 0}<span> 条</span></div></div>
                </div>
                <div class="vault-metric">
                    <div class="vault-metric-icon amber">${icon("folder", 22)}</div>
                    <div><div class="vault-metric-label">文件夹</div><div class="vault-metric-value">${foldersArr.length}<span> 个</span></div></div>
                </div>
                <div class="vault-metric">
                    <div class="vault-metric-icon blue">${icon("tag", 22)}</div>
                    <div><div class="vault-metric-label">唯一标签</div><div class="vault-metric-value">${tags.length}<span> 个</span></div></div>
                </div>
            </section>

            <div class="vault-tabs">
                <button class="vault-tab ${tab === "notes" ? "active" : ""}" data-obsidian-tab="notes">${icon("file-text", 15)} 笔记浏览</button>
                <button class="vault-tab ${tab === "graph" ? "active" : ""}" data-obsidian-tab="graph">${icon("radar", 15)} 知识图谱</button>
                <button class="vault-tab ${tab === "questions" ? "active" : ""}" data-obsidian-tab="questions">${icon("exam", 15)} 题库中心</button>
            </div>

            ${
                tab === "notes"
                    ? `
            <div class="vault-grid ${activeNote ? "has-detail" : ""}">
                <div class="vault-side">
                    <div class="vault-card">
                        <div class="vault-card-head"><h3>${icon("folder", 16)} 文件夹</h3></div>
                        <div class="vault-card-body" style="padding:8px 12px;">
                            <div class="vault-folder-list">
                                ${filteredFolders
                                    .map(
                                        f => `
                                    <button class="vault-folder-item ${activeFolder === f.name ? "active" : ""}" data-obsidian-folder="${escapeHtml(f.name)}">
                                        <span>${icon("folder", 14)} ${escapeHtml(f.name === "all" ? "全部" : f.name)}</span>
                                        <span class="vault-folder-count">${f.count}</span>
                                    </button>
                                `
                                    )
                                    .join("")}
                            </div>
                        </div>
                    </div>
                    <div class="vault-card">
                        <div class="vault-card-head"><h3>${icon("tag", 16)} 热门标签</h3></div>
                        <div class="vault-card-body" style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${tags.map((t, i) => `<span class="vault-tag ${tagClass(i)}">${escapeHtml(t.tag || t.name)}</span>`).join("")}
                        </div>
                    </div>
                </div>

                <div class="vault-card">
                    <div class="vault-card-head">
                        <h3>${icon("file-text", 16)} ${isSearching ? "搜索结果" : "笔记列表"} <span style="font-weight:400;color:var(--muted);font-size:13px;">(${displayNotes.length})</span></h3>
                    </div>
                    <div class="vault-card-body" style="padding:12px 0;">
                        <div style="padding:0 20px 12px;">
                            <input class="vault-search-input" type="text" placeholder="搜索 Obsidian 笔记..." value="${escapeHtml(searchQuery)}" data-obsidian-search>
                        </div>
                        ${displayNotes.length === 0 ? `<div class="vault-empty">${icon("search", 36)}<p>${isSearching ? "没有找到匹配的笔记" : "暂无笔记"}</p></div>` : ""}
                        <div class="vault-note-list" style="padding:0 12px;">
                            ${displayNotes
                                .map(
                                    n => `
                                <button class="vault-note-item ${activeNote && activeNote.path === n.path ? "active" : ""}" data-obsidian-note="${escapeHtml(n.path)}">
                                    <div class="vault-note-header">
                                        ${noteKindIcon(n.kind)}
                                        <span class="vault-note-title">${escapeHtml(n.title || n.path)}</span>
                                    </div>
                                    <div class="vault-note-meta">
                                        <span>${icon("folder", 12)} ${escapeHtml(n.folder || "根目录")}</span>
                                        <span>${icon("clock", 12)} ${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString("zh-CN") : ""}</span>
                                        ${n._score ? `<span style="color:var(--violet);font-weight:500;">相关度: ${Math.round(n._score * 100)}%</span>` : ""}
                                    </div>
                                    ${n.preview ? `<div class="vault-note-preview">${escapeHtml(n.preview)}</div>` : ""}
                                    ${(n.tags || []).length > 0 ? `<div class="vault-note-tags">${n.tags.map((t, i) => `<span class="vault-tag ${tagClass(i)}">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
                                </button>
                            `
                                )
                                .join("")}
                        </div>
                    </div>
                </div>

                ${
                    activeNote
                        ? `
                <div class="vault-card vault-detail">
                    <div class="vault-card-head">
                        <h3>${icon("info", 16)} 笔记详情</h3>
                        <button class="btn tiny ghost" data-obsidian-close-note>${icon("x", 14)}</button>
                    </div>
                    <div class="vault-detail-content">
                        <h2>${escapeHtml(activeNote.title || activeNote.path)}</h2>
                        <p style="color:var(--muted);font-size:13px;">${icon("folder", 12)} ${escapeHtml(activeNote.folder || "根目录")} · ${icon("tag", 12)} ${(activeNote.tags || []).slice(0, 5).join(", ") || "无标签"}</p>
                        <div style="margin-top:12px;white-space:pre-wrap;line-height:1.8;">${escapeHtml(activeNote.body || activeNote.content || activeNote.preview || "暂无内容")}</div>
                        ${
                            (activeNote.links || []).length > 0
                                ? `
                        <div class="vault-detail-links">
                            <h4>${icon("git", 14)} 双向链接</h4>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                                ${activeNote.links.map(l => `<span class="vault-tag purple" style="cursor:pointer;" data-obsidian-note="${escapeHtml(l)}">${icon("external-link", 12)} ${escapeHtml(l)}</span>`).join("")}
                            </div>
                        </div>`
                                : ""
                        }
                    </div>
                </div>`
                        : ""
                }
            </div>
            `
                    : ""
            }

            ${
                tab === "graph"
                    ? `
            <div class="vault-card" style="padding:24px;">
                <h3 style="margin:0 0 16px;">${icon("radar", 18)} 知识图谱关系</h3>
                <div style="text-align:center;padding:40px;color:var(--muted);" id="obsidian-graph-container">
                    <div class="vault-spinner"></div>
                    <p style="margin-top:12px;">知识图谱可视化加载中...</p>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="btn-violet" data-view="knowledgeGraph">${icon("radar", 16)} 查看完整知识图谱</button>
                </div>
            </div>
            `
                    : ""
            }

            ${
                tab === "questions"
                    ? `
            <div class="vault-card" style="padding:24px;">
                <h3 style="margin:0 0 16px;">${icon("exam", 18)} Obsidian 题库</h3>
                <div style="text-align:center;padding:40px;color:var(--muted);" id="obsidian-questions-container">
                    <p>点击下方按钮加载 Obsidian 题库状态</p>
                </div>
                <div style="text-align:center;margin-top:16px;">
                    <button class="btn-violet" data-obsidian-load-questions>${icon("refresh", 16)} 加载题库</button>
                </div>
            </div>
            `
                    : ""
            }
        </main>`;
    }

    // ========== RAG 智能检索视图 ==========
    function ragSearchView() {
        const overview = state.data.ragOverview;
        const messages = state.data.ragMessages || [];
        const searching = state.data.ragSearching;
        const stats = overview ? overview.stats || {} : {};
        const courses = overview ? overview.courses || [] : [];
        const sources = overview ? overview.sources || [] : [];

        return `<main class="page vault-page rag-page">
            <section class="vault-hero">
                <h1>${icon("search", 24)} RAG 智能检索问答</h1>
                <p>基于本地向量知识库的智能检索 · ${stats.documents || 0} 个文档 · ${stats.chunks || 0} 个知识片段 · 本地LLM防幻读</p>
            </section>

            <div class="vault-metrics">
                <div class="vault-metric">
                    <div class="vault-metric-icon purple">${icon("file-text", 22)}</div>
                    <div><div class="vault-metric-label">索引文档</div><div class="vault-metric-value">${stats.documents || 0}<span> 个</span></div></div>
                </div>
                <div class="vault-metric">
                    <div class="vault-metric-icon teal">${icon("layers", 22)}</div>
                    <div><div class="vault-metric-label">知识片段</div><div class="vault-metric-value">${stats.chunks || 0}<span> 个</span></div></div>
                </div>
                <div class="vault-metric">
                    <div class="vault-metric-icon amber">${icon("database", 22)}</div>
                    <div><div class="vault-metric-label">数据来源</div><div class="vault-metric-value">${stats.sources || 0}<span> 个</span></div></div>
                </div>
                <div class="vault-metric">
                    <div class="vault-metric-icon blue">${icon("book", 22)}</div>
                    <div><div class="vault-metric-label">覆盖课程</div><div class="vault-metric-value">${courses.length}<span> 门</span></div></div>
                </div>
            </div>

            ${
                sources.length > 0
                    ? `
            <div class="vault-card" style="margin-bottom:24px;">
                <div class="vault-card-head"><h3>${icon("globe", 16)} 数据来源</h3></div>
                <div class="vault-card-body" style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${sources
                        .slice(0, 10)
                        .map(
                            s => `
                        <span style="font-size:13px;padding:6px 12px;background:rgba(124,77,255,0.06);border-radius:8px;color:var(--ink);">
                            ${escapeHtml(s.name)} <span style="color:var(--muted);">(${s.documents}篇)</span>
                        </span>
                    `
                        )
                        .join("")}
                </div>
            </div>`
                    : ""
            }

            <div class="rag-chat" id="rag-chat-container">
                ${
                    messages.length === 0
                        ? `
                <div style="text-align:center;padding:40px 20px;color:var(--muted);">
                    ${icon("robot", 48)}
                    <p style="margin:16px 0 6px;font-size:16px;color:var(--ink);font-weight:600;">开始 RAG 智能问答</p>
                    <p style="font-size:14px;margin:0;">基于本地知识库的检索增强生成，回答基于真实数据，防止AI幻觉</p>
                    <div class="rag-suggestions" style="justify-content:center;margin-top:16px;">
                        <button class="rag-suggestion" data-rag-suggest="什么是数据结构中的哈希表">哈希表是什么</button>
                        <button class="rag-suggestion" data-rag-suggest="二分查找的原理和时间复杂度">二分查找原理</button>
                        <button class="rag-suggestion" data-rag-suggest="TCP三次握手的过程">TCP三次握手</button>
                        <button class="rag-suggestion" data-rag-suggest="操作系统中的进程和线程区别">进程与线程</button>
                    </div>
                </div>`
                        : messages
                              .map(
                                  (m, i) => `
                <div class="rag-message">
                    <div class="rag-avatar ${m.role}">${m.role === "user" ? icon("user", 18) : icon("robot", 18)}</div>
                    <div class="rag-bubble ${m.role}">
                        <div style="white-space:pre-wrap;">${escapeHtml(m.content)}</div>
                        ${
                            m.citations && m.citations.length > 0
                                ? `
                        <div class="rag-sources">
                            <h4>${icon("link", 12)} 参考来源 (${m.citations.length})</h4>
                            ${m.citations
                                .map(
                                    (c, j) => `
                                <div class="rag-source-item" data-rag-citation="${j}">
                                    <span>${icon("file-text", 12)} [${j + 1}] ${escapeHtml(c.title || c.source || "未知来源")}</span>
                                    <span class="rag-source-score">${c.score ? Math.round(c.score * 100) + "%" : c.relevance ? Math.round(c.relevance * 100) + "%" : ""}</span>
                                </div>
                            `
                                )
                                .join("")}
                            <div style="margin-top:8px;">
                                <button class="btn tiny ghost" data-rag-add-learning="${escapeHtml(m.content.substring(0, 40))}">${icon("plus", 12)} 加入学习列表</button>
                            </div>
                        </div>`
                                : ""
                        }
                        ${m.provider ? `<div style="margin-top:8px;font-size:11px;color:var(--muted);">模型: ${escapeHtml(m.provider)}</div>` : ""}
                    </div>
                </div>`
                              )
                              .join("")
                }
                ${
                    searching
                        ? `
                <div class="rag-message">
                    <div class="rag-avatar bot">${icon("robot", 18)}</div>
                    <div class="rag-bubble bot">
                        <div class="vault-spinner" style="margin:0;"></div>
                    </div>
                </div>`
                        : ""
                }
            </div>

            <div class="rag-input-wrap">
                <div class="rag-input-row">
                    <input type="text" placeholder="输入你的问题，基于本地知识库检索..." id="rag-input" data-rag-input
                        value="${escapeHtml(state.data.ragSearchQuery || "")}"
                        onkeydown="if(event.key==='Enter')document.querySelector('[data-rag-send]').click()">
                    <button class="rag-send-btn" data-rag-send ${searching ? "disabled" : ""}>${icon("send", 16)} 发送</button>
                </div>
            </div>
        </main>`;
    }

    function knowledgeBaseView() {
        const kb = state.data.knowledgeBase || {};
        const stats = kb.stats || {};
        const subjects = kb.subjects || [];
        const points = kb.points || [];
        const docs = kb.documents || [];
        const chunks = kb.chunks || [];
        const courses = kb.courses || [];
        const questions = kb.questions || [];
        return `<main class="page vault-page rag-page">
            <section class="vault-hero">
                <h1>${icon("database", 24)} 计算机知识库</h1>
                <p>已接入知识点、课程、题库和 RAG 文档，支持按学科浏览、检索、加入学习路径和 AI 问答。</p>
                <div class="vault-hero-actions">
                    <button class="btn-violet" data-view="path">${icon("route", 16)} 生成学习路径</button>
                    <button class="btn-teal" data-view="aiAssistant" data-ai-assistant-mode="rag">${icon("robot", 16)} 基于知识库提问</button>
                    <button class="btn-violet-outline" data-view="knowledgeGraph">${icon("brain", 16)} 知识图谱</button>
                </div>
            </section>
            <section class="agent-cards">
                <div class="agent-card"><div class="agent-card-header"><span class="agent-card-title">知识点</span></div><div class="agent-card-value">${stats.knowledgePoints || 0}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">长期画像与路径节点来源</div></div>
                <div class="agent-card"><div class="agent-card-header"><span class="agent-card-title">RAG 文档</span></div><div class="agent-card-value">${stats.documents || 0}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">课程资料与知识库文档</div></div>
                <div class="agent-card"><div class="agent-card-header"><span class="agent-card-title">知识片段</span></div><div class="agent-card-value">${stats.chunks || 0}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">问答检索证据</div></div>
                <div class="agent-card"><div class="agent-card-header"><span class="agent-card-title">题库</span></div><div class="agent-card-value">${stats.questions || 0}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">诊断与练习题</div></div>
            </section>
            <section class="path-control card">
                <div><label>搜索知识库</label><input data-kb-search value="${escapeHtml(state.data.knowledgeBaseQuery || "")}" placeholder="例如：需求分析、数据结构、操作系统"></div>
                <div><label>学科</label><select data-kb-subject><option value="all">全部学科</option>${subjects.map(s => `<option value="${escapeHtml(s.subject)}" ${state.data.knowledgeBaseSubject === s.subject ? "selected" : ""}>${escapeHtml(s.subject)} · ${s.knowledgeCount}</option>`).join("")}</select></div>
                <button class="btn primary" data-kb-refresh>${icon("search", 16)}检索</button>
            </section>
            <section class="path-workbench">
                <article class="card path-main">
                    <div class="card-head"><h2 class="section-title">${icon("book", 18)}知识点库</h2><span class="pill">${points.length} 条</span></div>
                    <div class="list">${
                        points
                            .map(
                                p => `<div class="list-row">
                        <span><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.subject)} · ${escapeHtml(p.summary || "暂无摘要")}</small></span>
                        <span class="pill">${p.mastery}% · ${p.questionCount}题</span>
                    </div>`
                            )
                            .join("") || "<p>暂无匹配知识点。</p>"
                    }</div>
                </article>
                <aside class="side-card">
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("chart", 18)}学科覆盖</h2></div><div class="list">${subjects
                        .slice(0, 10)
                        .map(
                            s =>
                                `<button class="list-row action-row" data-kb-subject-pick="${escapeHtml(s.subject)}"><span>${escapeHtml(s.subject)}<small>${s.knowledgeCount} 个知识点 · ${s.weakCount} 个薄弱</small></span><span class="pill">${s.mastery}%</span></button>`
                        )
                        .join("")}</div></article>
                    <article class="card"><div class="card-head"><h2 class="section-title">${icon("book", 18)}课程资源</h2><span class="pill">${courses.length}</span></div><div class="list">${
                        courses
                            .slice(0, 8)
                            .map(
                                c =>
                                    `<div class="list-row"><span>${escapeHtml(c.title)}<small>${escapeHtml(c.provider || "课程")} · ${escapeHtml(c.subject || "综合")}</small></span><span class="pill">${c.progress || 0}%</span></div>`
                            )
                            .join("") || "<p>暂无课程。</p>"
                    }</div></article>
                </aside>
            </section>
            <section class="grid-2">
                <article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("file", 18)}RAG 文档</h2><span class="pill">${docs.length}</span></div>
                    <div class="list">${docs.map(d => `<div class="list-row"><span>${escapeHtml(d.title)}<small>${escapeHtml(d.course)} · ${escapeHtml(d.knowledgePoint)}</small></span><span class="pill">${d.chunks}片段</span></div>`).join("") || "<p>暂无匹配文档。</p>"}</div>
                </article>
                <article class="card">
                    <div class="card-head"><h2 class="section-title">${icon("exam", 18)}题库样例</h2><span class="pill">${questions.length}</span></div>
                    <div class="list">${questions.map(q => `<div class="list-row"><span>${escapeHtml(q.question)}<small>${escapeHtml(q.knowledgeTitle)} · ${escapeHtml(q.subject)}</small></span><span class="pill">${escapeHtml(q.difficulty)}</span></div>`).join("") || "<p>暂无匹配题目。</p>"}</div>
                </article>
            </section>
            <section class="card">
                <div class="card-head"><h2 class="section-title">${icon("search", 18)}可检索知识片段</h2><span class="pill">${chunks.length}</span></div>
                <div class="grid-3">${chunks.map(c => `<article class="quick-tile" style="min-height:190px"><span class="pill">${escapeHtml(c.subject)}</span><h3>${escapeHtml(c.knowledgePoint)}</h3><p>${escapeHtml(c.text)}</p><small>${escapeHtml(c.course)} · 质量 ${c.qualityScore}</small></article>`).join("") || "<p>暂无匹配片段。</p>"}</div>
            </section>
        </main>`;
    }

    // Agent 中心当前先进入可用知识库，避免把调试 JSON 暴露给用户。
    function agentCenterView() {
        return knowledgeBaseView();
    }

    function loginView() {
        const storyCards = [
            ["brain", "画像先行", "登录后先读取长期画像、认知偏好、专注时长和多模态偏好。"],
            ["route", "路径可解释", "每个节点都显示掌握度、错题证据、资源偏好和推荐原因。"],
            ["db", "知识库有数据", "软件工程、RAG 文档、题库和今日计划都绑定真实知识节点。"],
            ["check", "闭环回写", "练习、笔记、复习和教师干预都会回写画像与下一次路径。"]
        ];
        const learningScenes = [
            [
                "/images/login/collaborative-study.png",
                "小组学习",
                "学生围绕问题讨论，系统把提问、笔记和练习结果沉淀为画像证据。"
            ],
            ["/images/login/focused-study-plan.png", "专注自学", "按专注时长切分任务，避免一次性塞满课程和题目。"],
            [
                "/images/login/teacher-guidance-board.png",
                "课堂反馈",
                "教师可以看到风险点、路径原因和学生当前需要的干预动作。"
            ]
        ];
        return `<main class="login-story-page">
            <section class="login-story-hero">
                <nav class="login-story-nav"><div class="brand">${logo()}<span>EduSmart</span></div><div class="login-nav-actions"><a class="login-nav-button" href="#register-panel">${icon("plus", 15)}注册</a><a class="login-nav-button" href="#login-panel">${icon("user", 15)}登录</a></div></nav>
                <div class="login-story-copy">
                    <span class="eyebrow">面向学生的 AI 学习驾驶舱</span>
                    <h1>从一次登录开始，系统先理解学生，再安排学习</h1>
                    <p>EduSmart 围绕学生的真实学习过程工作：诊断画像、课堂知识、练习结果、笔记复盘和教师反馈都会进入同一条学习证据链。</p>
                    <div class="login-story-actions"><a class="btn primary glow" href="#register-panel">${icon("plus", 17)}创建账号</a><a class="btn ghost" href="#login-panel">${icon("user", 17)}已有账号登录</a><a class="btn ghost" href="#personalized-proof">${icon("route", 17)}查看路径逻辑</a></div>
                </div>
                <div class="login-dashboard-illustration" aria-label="EduSmart 个性化学习驾驶舱插图">
                    <img class="dash-photo" src="/images/login/hero-learning-dashboard.png" alt="无脸学生学习桌面和 AI 学习驾驶舱插图">
                    <div class="dash-top"><span></span><span></span><span></span></div>
                    <div class="dash-profile"><b>视觉型 · 25 分钟专注</b><small>student_profiles</small></div>
                    <div class="dash-route">${["软件工程基础", "需求分析", "软件测试"].map((item, i) => `<div><span>${i + 1}</span><b>${item}</b><small>${i === 0 ? "优先修复" : i === 1 ? "场景练习" : "间隔复习"}</small></div>`).join("")}</div>
                    <div class="dash-json">{ "personalized": true, "subject": "software_engineering" }</div>
                </div>
            </section>
            <section class="login-story-band">${storyCards.map(([ic, title, text]) => `<article><span>${icon(ic, 22)}</span><b>${title}</b><p>${text}</p></article>`).join("")}</section>
            <section class="login-scene-gallery">
                ${learningScenes.map(([img, title, text]) => `<article><img src="${img}" alt="${escapeHtml(title)}"><div><b>${escapeHtml(title)}</b><p>${escapeHtml(text)}</p></div></article>`).join("")}
            </section>
            <section class="login-narrative" id="personalized-proof">
                <div><span class="eyebrow">Profile-aware path</span><h2>路径不是跳转结果，而是一份有证据的学习判断</h2><p>系统会把画像里的学习风格、每日可用时间、专注时长，与知识点掌握度、错题和课程进度合并。页面会展示推荐原因和 JSON 证据，让你能判断它到底有没有个性化。</p></div>
                <div class="login-proof-stack"><div><b>画像</b><span>visual / practice / 25min</span></div><div><b>知识库</b><span>5 个软件工程核心节点</span></div><div><b>输出</b><span>节点、任务、讲义、题目、原因</span></div></div>
            </section>
            <section class="login-showcase">
                <article><img src="/images/login/focused-study-plan.png" alt="无脸专注自学和学习计划插图"><h2>长线学习靠的不是一次推荐</h2><p>今日计划会从路径节点生成，练习后更新掌握度，笔记和费曼复述进入长期记忆，下一次路径会按新证据重排。</p></article>
                <article><img src="/images/login/teacher-guidance-board.png" alt="无脸课堂白板和教师指导插图"><h2>教师能看到干预原因</h2><p>教师端不是只看分数，而是看到薄弱知识点、风险状态、画像摘要和推荐干预动作。</p></article>
            </section>
            <section class="login-cta-strip"><h2>准备进入你的学习驾驶舱</h2><p>注册后会先引导你完成诊断，再生成画像、个性化路径和学习计划。</p><a class="btn primary glow" href="#register-panel">${icon("plus", 17)}注册并开始诊断</a></section>
            <section class="login-modal" id="register-panel" aria-label="注册弹层">
                <a class="login-modal-backdrop" href="#" aria-label="关闭注册框"></a>
                <form class="login-card auth-form login-modal-card" id="register-form">
                    <a class="login-modal-close" href="#" aria-label="关闭">×</a>
                    <span class="eyebrow">New learner</span>
                    <h2 class="section-title">${icon("plus", 20)}注册 EduSmart</h2>
                    <p>注册后将进入首页，并提示你完成智能诊断、生成画像和个性化学习路径。</p>
                    <label>用户名<input name="username" autocomplete="username" placeholder="例如：student2026"></label>
                    <label>昵称<input name="nickname" autocomplete="nickname" placeholder="例如：小明同学"></label>
                    <label>邮箱<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>
                    <label>密码<input name="password" type="password" autocomplete="new-password" minlength="6" placeholder="至少 6 位"></label>
                    <button class="btn primary glow" type="submit">${icon("play", 17)}注册并进入学习平台</button>
                    <div class="message" id="register-message"></div>
                    <p class="auth-switch">已有账号？<a href="#login-panel">返回登录</a></p>
                </form>
            </section>
            <section class="login-modal" id="login-panel" aria-label="登录弹层">
                <a class="login-modal-backdrop" href="#" aria-label="关闭登录框"></a>
                <form class="login-card auth-form login-modal-card" id="login-form">
                    <a class="login-modal-close" href="#" aria-label="关闭">×</a>
                    <span class="eyebrow">Demo account</span>
                    <h2 class="section-title">${icon("user", 20)}登录 EduSmart</h2>
                    <p>演示账号：zhangsan / 123456</p>
                    <label>用户名<input name="username" value="zhangsan" autocomplete="username"></label>
                    <label>密码<input name="password" type="password" value="123456" autocomplete="current-password"></label>
                    <button class="btn primary glow" type="submit">${icon("play", 17)}进入学习平台</button>
                    <div class="message" id="login-message"></div>
                    <p class="auth-switch">还没有账号？<a href="#register-panel">立即注册</a></p>
                </form>
            </section>
        </main>`;
    }

    function bindEvents() {
        // ========== 智能诊断与学习画像标签页事件绑定 ==========
        // 智能诊断标签页切换
        document.querySelectorAll("[data-diagnostic-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                state.data.diagnosticTab = btn.dataset.diagnosticTab;
                render();
            });
        });

        // 学习画像标签页切换
        document.querySelectorAll("[data-profile-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                state.data.profileTab = btn.dataset.profileTab;
                render();
            });
        });

        // CAT测试开始
        document.querySelectorAll("[data-cat-start]").forEach(btn => {
            btn.addEventListener("click", () => {
                const diag = getMockSmartDiagnostic();
                diag.sessionActive = true;
                state.data.smartDiagnostic = diag;
                render();
            });
        });

        // CAT测试提交答案
        document.querySelectorAll("[data-cat-submit]").forEach(btn => {
            btn.addEventListener("click", () => {
                const diag = state.data.smartDiagnostic;
                const selected = document.querySelector('input[name="cat-answer"]:checked');
                if (!selected) {
                    toast("请选择一个答案");
                    return;
                }

                diag.questionsAnswered++;
                diag.ability = diag.ability + (Math.random() - 0.4) * 0.2;
                diag.abilitySE = Math.max(0.3, diag.abilitySE - 0.15);
                diag.progress = Math.min(100, diag.progress + 10);
                diag.recentAccuracy = Math.round(70 + Math.random() * 25);

                if (diag.questionsAnswered >= 8 || diag.abilitySE < 0.4) {
                    state.data.diagnosticTab = "report";
                    state.data.smartReport = getMockSmartReport();
                    toast("测试完成！查看报告");
                } else {
                    const mockQuestions = [
                        {
                            id: diag.questionsAnswered + 1,
                            content: "以下哪个不是 JavaScript 的循环语句？",
                            options: ["for", "while", "foreach", "do...while"],
                            difficulty: "easy",
                            correctIndex: 2
                        },
                        {
                            id: diag.questionsAnswered + 2,
                            content: "typeof null 的返回值是什么？",
                            options: ["null", "undefined", "object", "boolean"],
                            difficulty: "medium",
                            correctIndex: 2
                        }
                    ];
                    diag.currentQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
                }
                render();
            });
        });

        // CAT测试跳过
        document.querySelectorAll("[data-cat-skip]").forEach(btn => {
            btn.addEventListener("click", () => {
                const diag = state.data.smartDiagnostic;
                diag.questionsAnswered++;
                diag.abilitySE = Math.max(0.4, diag.abilitySE - 0.1);
                diag.progress = Math.min(100, diag.progress + 8);

                if (diag.questionsAnswered >= 10) {
                    state.data.diagnosticTab = "report";
                    state.data.smartReport = getMockSmartReport();
                    toast("测试完成！查看报告");
                } else {
                    diag.currentQuestion = {
                        id: diag.questionsAnswered + 1,
                        content: "什么是闭包？",
                        options: ["一个函数", "函数访问外部变量的特性", "一个对象", "以上都不是"],
                        difficulty: "medium",
                        correctIndex: 1
                    };
                }
                render();
            });
        });

        // VARK选项选择
        document.querySelectorAll("[data-vark-answer]").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.varkAnswer;
                const value = parseInt(btn.dataset.value);
                if (!state.data.varkAnswers) state.data.varkAnswers = {};
                state.data.varkAnswers[key] = value;
                render();
            });
        });

        // VARK下一部分
        document.querySelectorAll("[data-vark-next]").forEach(btn => {
            btn.addEventListener("click", () => {
                if (!state.data.varkSection) state.data.varkSection = 0;
                if (state.data.varkSection < 3) {
                    state.data.varkSection++;
                } else {
                    state.data.diagnosticTab = "report";
                    state.data.smartReport = getMockSmartReport();
                    toast("测评完成！查看报告");
                }
                render();
            });
        });

        // VARK上一部分
        document.querySelectorAll("[data-vark-prev]").forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.data.varkSection > 0) {
                    state.data.varkSection--;
                    render();
                }
            });
        });

        // 诊断模式选择
        document.querySelectorAll("[data-diagnostic-start-legacy]").forEach(btn => {
            btn.addEventListener("click", () => {
                const mode = btn.dataset.diagnosticStart;
                state.data.diagnosticMode = mode;
                if (mode === "text") {
                    // 快速文本诊断
                    state.view = "diagnosticText";
                    history.pushState({}, "", "/diagnostic/text");
                } else if (mode === "questionnaire") {
                    // 结构化问卷诊断
                    toast("结构化问卷诊断功能开发中，敬请期待！");
                } else if (mode === "subject") {
                    // 学科测试诊断
                    toast("学科测试诊断功能开发中，敬请期待！");
                }
                render();
            });
        });

        // 返回诊断模式选择
        document.querySelectorAll("[data-diagnostic-switch-mode-legacy]").forEach(btn => {
            btn.addEventListener("click", () => {
                state.view = "diagnostic";
                history.pushState({}, "", "/diagnostic");
                render();
            });
        });

        // 填入文本诊断示例
        document.querySelectorAll("[data-diagnostic-fill-sample]").forEach(btn => {
            btn.addEventListener("click", () => {
                state.data.profileInput =
                    "我是大二计算机科学与技术专业学生，目标是从事后端开发。数据结构会写基础题，树和图还不太熟；数据库会基础SQL增删改查；计算机网络只记得七层模型的大概。每天能投入约 120 分钟，想在 2 个月内做一个完整的项目练手。";
                render();
            });
        });

        // 开始智能分析
        document.querySelectorAll("[data-profile-analyze]").forEach(btn => {
            btn.addEventListener("click", async event => {
                event.stopImmediatePropagation();
                const text =
                    document.querySelector("[data-profile-input]")?.value?.trim() || state.data.profileInput || "";
                if (!text) return toast("先输入你的学习状态");
                state.data.profileInput = text;
                state.data.diagnosticLoading = true;
                render();
                try {
                    await submitQuickDiagnosis(text);
                    state.data.diagnosticLoading = false;
                    state.data.diagnosticMode = "questionnaire";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    await loadDiagnosticQuestionnaire(true);
                    toast("文本诊断已记录，请继续完成结构化问卷");
                    render();
                } catch (e) {
                    state.data.diagnosticLoading = false;
                    toast("诊断失败: " + (e.message || "网络错误"));
                    render();
                }
            });
        });

        // 文本输入处理
        document.querySelectorAll("[data-profile-input]").forEach(textarea => {
            textarea.addEventListener("input", e => {
                state.data.profileInput = e.target.value;
            });
        });

        // Agent应用学习计划
        document.querySelectorAll("[data-agent-apply-plan]").forEach(btn => {
            btn.addEventListener("click", async () => {
                btn.classList.add("is-loading");
                btn.disabled = true;
                try {
                    const result = await request("/api/agent/apply-plan", {
                        method: "POST",
                        body: JSON.stringify({ date: new Date().toISOString().split("T")[0] })
                    });
                    if (result.success) {
                        state.data.agentPlanApplied = true;
                        toast("学习计划已更新为 Agent 个性化版本！");
                        state.view = "studyPlan";
                        await loadStudyPlan(true);
                        history.pushState({}, "", "/study-plan");
                    } else {
                        toast(result.message || "应用失败");
                    }
                } catch (error) {
                    toast("应用失败: " + error.message);
                } finally {
                    btn.classList.remove("is-loading");
                    btn.disabled = false;
                }
                render();
            });
        });

        document.querySelectorAll("[data-view]").forEach(el =>
            el.addEventListener("click", () => {
                if (el.dataset.agentPrompt) {
                    state.data.aiAssistantMode = "agent";
                    state.data._pendingAgentPrompt = el.dataset.agentPrompt;
                }
                setView(el.dataset.view);
            })
        );
        document.querySelectorAll("[data-ai-feature]").forEach(el =>
            el.addEventListener("click", async event => {
                event.stopPropagation();
                await runAiFeature(el.dataset.aiFeature, el);
            })
        );
        document.querySelectorAll("[data-agent-source-plan]").forEach(el =>
            el.addEventListener("click", async () => {
                const sourceName = el.dataset.agentSourcePlan || "开源资料";
                const source =
                    (state.data.aiConfig?.openSourceIntegrations || []).find(
                        item => (item.name || item.title) === sourceName
                    ) || {};
                const prompt = `把 ${sourceName} 这个开源资料转化为 EduSmart 项目内可执行的学习路径、实训模板、智能体工具和验收任务。要求写回今日学习任务，并说明落地到哪些模块。`;
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/agent-runtime/run", {
                        method: "POST",
                        body: JSON.stringify({
                            message: prompt,
                            intent: "design_course",
                            context: {
                                goal: prompt,
                                subject: source.category || "AI Agent",
                                sourceName,
                                intensity: "normal",
                                durationDays: 5
                            }
                        })
                    });
                    state.data.agentRuntimeResult = result;
                    state.data.agentRuntimeTraces = result.traces || [];
                    state.data.aiAssistantMessages.push({ role: "user", content: prompt });
                    state.data.aiAssistantMessages.push({ role: "ai", content: result.answer });
                    state.data.aiAssistantMode = "agent";
                    state.data._pendingAgentPrompt = "";
                    state.data.pathCenter = null;
                    state.view = "aiAssistant";
                    history.pushState({}, "", "/ai-assistant");
                    await loadData(true);
                    await loadAiAssistant(true);
                    await loadAiConfig(true);
                    render();
                    toast(`${sourceName} 已生成项目落地任务`);
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-scroll-question]").forEach(el =>
            el.addEventListener("click", () => {
                document.getElementById("daily-question")?.scrollIntoView({ behavior: "smooth", block: "center" });
            })
        );
        document
            .querySelectorAll("[data-open-panel]")
            .forEach(el => el.addEventListener("click", () => openInfoPanel(el.dataset.openPanel)));
        document.querySelectorAll("[data-study-plan-tab]").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.studyPlanTab = el.dataset.studyPlanTab || "today";
                await render();
            })
        );
        document.querySelectorAll("[data-plan-action]").forEach(el =>
            el.addEventListener("click", () => {
                const target = el.dataset.planAction || "/practice";
                window.location.href = target;
            })
        );
        document.querySelectorAll("[data-study-plan-refresh]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    const goal = state.data.pathGoal || "系统掌握计算机核心能力";
                    const subject = state.data.pathSubject || "all";
                    const intensity = state.data.pathIntensity || "normal";
                    const result = await request("/api/app/path/generate", {
                        method: "POST",
                        body: JSON.stringify({ goal, subject, intensity })
                    });
                    state.data.learningLoop = result;
                    state.data.pathCenter = null;
                    state.data.studyPlan = null;
                    await loadStudyPlan(true);
                    updateOnboardingProgress({ pathDone: result.stage === "plan_ready" });
                    await render();
                    toast("Agent 今日计划已重新生成");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-study-task-toggle]").forEach(el =>
            el.addEventListener("click", async () => {
                const taskId = el.dataset.studyTaskToggle;
                if (!taskId) return;
                try {
                    await request(`/api/app/tasks/${encodeURIComponent(taskId)}/toggle`, {
                        method: "POST",
                        body: "{}"
                    });
                    state.data.pathCenter = null;
                    state.data.studyPlan = null;
                    await loadStudyPlan(true);
                    updateOnboardingProgress({ pathDone: true });
                    await render();
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-study-plan-add]").forEach(form =>
            form.addEventListener("submit", async event => {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(form));
                if (!String(payload.title || "").trim()) return toast("请输入任务名称");
                try {
                    await request("/api/app/path/custom-task", {
                        method: "POST",
                        body: JSON.stringify({
                            title: payload.title,
                            minutes: Number(payload.duration || 30),
                            subject: "自定义",
                            reason: "从今日计划表单追加"
                        })
                    });
                    state.data.pathCenter = null;
                    state.data.studyPlan = null;
                    await loadStudyPlan(true);
                    await render();
                    toast("任务已加入 Agent 今日计划");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-study-plan-agent-generate]").forEach(el =>
            el.addEventListener("click", async () => {
                const goal =
                    document.querySelector("[data-path-goal]")?.value?.trim() ||
                    state.data.pathGoal ||
                    "系统掌握计算机核心能力";
                const subject = document.querySelector("[data-path-subject]")?.value || state.data.pathSubject || "all";
                const intensity =
                    document.querySelector("[data-path-intensity]")?.value || state.data.pathIntensity || "normal";
                state.data.pathGoal = goal;
                state.data.pathSubject = subject;
                state.data.pathIntensity = intensity;
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/app/path/generate", {
                        method: "POST",
                        body: JSON.stringify({ goal, subject, intensity })
                    });
                    state.data.learningLoop = result;
                    state.data.pathCenter = null;
                    state.data.studyPlan = null;
                    await loadStudyPlan(true);
                    await render();
                    toast(
                        result.stage === "diagnosis_required"
                            ? "当前证据不足，请先完成 5 道诊断题"
                            : `Agent 已生成 ${result.generated || 0} 天学习计划`
                    );
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-learning-loop-diagnosis]").forEach(form =>
            form.addEventListener("submit", async event => {
                event.preventDefault();
                const loop = state.data.learningLoop;
                const formData = new FormData(form);
                const answers = {};
                (loop?.questions || []).forEach(question => {
                    answers[question.id] = formData.get(`question_${question.id}`) || "";
                });
                const button = form.querySelector('button[type="submit"]');
                button?.classList.add("is-loading");
                try {
                    const result = await request("/api/learning-loop/diagnosis/submit", {
                        method: "POST",
                        body: JSON.stringify({ goalId: loop.goalId, answers })
                    });
                    state.data.learningLoop = result;
                    state.data.pathCenter = null;
                    state.data.studyPlan = null;
                    await loadStudyPlan(true);
                    updateOnboardingProgress({ pathDone: true });
                    await render();
                    toast(`诊断完成，已生成 ${result.generated || 3} 天真实学习计划`);
                } catch (error) {
                    toast(error.message);
                } finally {
                    button?.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-open-custom-agent-task]").forEach(el =>
            el.addEventListener("click", () => {
                const panel = document.querySelector("[data-custom-agent-task-panel]");
                if (panel) panel.hidden = false;
            })
        );
        document.querySelectorAll("[data-close-custom-agent-task]").forEach(el =>
            el.addEventListener("click", () => {
                const panel = document.querySelector("[data-custom-agent-task-panel]");
                if (panel) panel.hidden = true;
            })
        );
        document.querySelectorAll("[data-custom-agent-task-form]").forEach(form =>
            form.addEventListener("submit", async event => {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(form));
                if (!String(payload.title || "").trim()) return toast("请输入任务标题");
                const button = form.querySelector("button[type='submit']");
                button?.classList.add("is-loading");
                try {
                    await request("/api/app/path/custom-task", {
                        method: "POST",
                        body: JSON.stringify({
                            title: payload.title,
                            subject: payload.subject || "自定义",
                            reason: payload.reason || "",
                            minutes: Number(payload.minutes || 25),
                            icon: payload.icon || "book",
                            knowledgeTitle: payload.knowledgeTitle || ""
                        })
                    });
                    state.data.pathCenter = null;
                    state.data.studyPlan = null;
                    await loadStudyPlan(true);
                    await render();
                    toast("自定义路径任务已加入 Agent 今日计划");
                } catch (error) {
                    toast(error.message);
                } finally {
                    button?.classList.remove("is-loading");
                }
            })
        );
        document
            .querySelectorAll("[data-recommendation-view]")
            .forEach(el =>
                el.addEventListener("click", () =>
                    setView(normalizeTargetView(el.dataset.recommendationView || "path"))
                )
            );
        document.querySelectorAll("[data-continue-learning]").forEach(el =>
            el.addEventListener("click", async () => {
                const topic = state.data.weakPoints[0]?.title || "Node.js";
                try {
                    const result = await request("/api/app/closed-loop/run", {
                        method: "POST",
                        body: JSON.stringify({ topic })
                    });
                    await loadData(true);
                    state.data.assetTab = "knowledge";
                    showClosedLoopResult(result, "继续学习已展开");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        /* 教师工作台 - Tab切换 */
        document.querySelectorAll("[data-teacher-tab]").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teacherTab = el.dataset.teacherTab;
                state.data.teacherExamDetail = null;
                state.data.teacherStudentDetail = null;
                await render();
            })
        );
        /* 教师工作台 - 搜索学生 */
        document.querySelectorAll("[data-teacher-search]").forEach(el =>
            el.addEventListener("input", e => {
                state.data._teacherSearch = e.target.value;
                clearTimeout(el._timer);
                el._timer = setTimeout(() => {
                    state.data.teacherTab = "students";
                    render();
                }, 400);
            })
        );
        document.querySelectorAll("[data-teacher-progress-search]").forEach(el =>
            el.addEventListener("input", e => {
                state.data._progressSearch = e.target.value;
                state.data._teacherSearch = e.target.value;
                clearTimeout(el._timer);
                el._timer = setTimeout(() => render(), 400);
            })
        );
        /* 教师工作台 - 分配学科 */
        document.querySelectorAll("[data-teacher-assign]").forEach(el =>
            el.addEventListener("click", async () => {
                const studentId = el.dataset.teacherAssign;
                const studentName = el.dataset.studentName || "该学生";
                const subjects = state.data.teacherSubjects;
                if (!subjects || subjects.length === 0) {
                    try {
                        const json = await request("/api/teacher/subjects");
                        state.data.teacherSubjects = json.subjects || [];
                    } catch (e) {
                        toast("获取学科列表失败");
                        return;
                    }
                }
                const subjList = state.data.teacherSubjects;
                const subjOptions = subjList
                    .map(
                        (s, i) =>
                            `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer"><input type="radio" name="assign_subject" value="${escapeHtml(s)}" ${i === 0 ? "checked" : ""}> ${escapeHtml(s)}</label>`
                    )
                    .join("");
                const formHtml = `<div class="modal-form"><p>为 <b>${escapeHtml(studentName)}</b> 指定要学习的学科：</p><div style="display:grid;gap:4px;margin:14px 0">${subjOptions}</div><textarea class="input" id="assign_note" placeholder="备注说明（可选）" rows="2" style="margin-top:8px"></textarea></div>`;
                showPanel("分配学科", formHtml);
                const panel = document.querySelector(".panel-content");
                if (panel) {
                    const btn = document.createElement("div");
                    btn.style.cssText = "display:flex;gap:10px;justify-content:flex-end;margin-top:16px";
                    btn.innerHTML = `<button class="btn ghost" data-panel-close>取消</button><button class="btn primary" id="confirm-assign">${icon("check", 16)} 确认分配</button>`;
                    panel.appendChild(btn);
                    document.getElementById("confirm-assign")?.addEventListener("click", async () => {
                        const selected = document.querySelector("input[name='assign_subject']:checked");
                        const note = document.getElementById("assign_note")?.value || "";
                        if (!selected) {
                            toast("请选择学科");
                            return;
                        }
                        try {
                            const res = await request("/api/teacher/assign-subject", {
                                method: "POST",
                                body: JSON.stringify({ student_id: parseInt(studentId), subject: selected.value, note })
                            });
                            toast(res.message || "分配成功");
                            closePanel();
                            await render();
                        } catch (e) {
                            toast(e.message || "分配失败");
                        }
                    });
                }
            })
        );
        /* 教师工作台 - 查看学生学情 */
        document.querySelectorAll("[data-teacher-view-student]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherViewStudent;
                state.data.teacherStudentDetail = null;
                state.data.teacherTab = "progress";
                render();
                try {
                    await loadTeacherStudentDetail(id);
                    render();
                } catch (e) {
                    toast("获取学生详情失败");
                }
            })
        );
        /* 教师工作台 - 返回学情列表 */
        document.querySelectorAll("[data-teacher-back-progress]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.teacherStudentDetail = null;
                render();
            })
        );
        /* 教师工作台 - 取消分配 */
        document.querySelectorAll("[data-teacher-del-assign]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherDelAssign;
                try {
                    await request(`/api/teacher/assignments/${id}`, { method: "DELETE" });
                    toast("已取消分配");
                    await render();
                } catch (e) {
                    toast("操作失败");
                }
            })
        );
        /* 教师工作台 - 移除学生（软删除） */
        document.querySelectorAll("[data-teacher-remove-student]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherRemoveStudent;
                const studentName = el.dataset.studentName || "该学生";
                if (!confirm(`确认移除学生「${studentName}」？该学生将无法登录和使用系统。`)) return;
                try {
                    const r = await request(`/api/teacher/students/${id}/deactivate`, { method: "PUT" });
                    toast(r.message || "已移除");
                    state.data.teacherTab = "students";
                    await render();
                } catch (e) {
                    toast(e.message);
                }
            })
        );
        /* 教师工作台 - 分配学科筛选 */
        document.querySelectorAll("[data-teacher-assign-filter]").forEach(el =>
            el.addEventListener("change", async () => {
                state.data.teacherTab = "assignments";
                const subject = el.value;
                await loadTeacherAssignments({ subject });
                render();
            })
        );
        /* 教师工作台 - 笔记学科筛选 */
        document.querySelectorAll("[data-teacher-note-filter]").forEach(el =>
            el.addEventListener("change", async () => {
                state.data.teacherTab = "notes";
                const subject = el.value === "all" ? "" : el.value;
                await loadTeacherNotes({ subject });
                render();
            })
        );
        /* 教师工作台 - 创建试卷 */
        document.querySelectorAll("[data-teacher-action='create-exam']").forEach(el =>
            el.addEventListener("click", async () => {
                const subjects = state.data.teacherSubjects;
                const subjOptions = (
                    subjects.length
                        ? subjects
                        : [
                              "数据结构与算法",
                              "计算机网络",
                              "操作系统",
                              "数据库",
                              "程序设计",
                              "前端开发",
                              "人工智能",
                              "软件工程"
                          ]
                )
                    .map(
                        (s, i) =>
                            `<option value="${escapeHtml(s)}" ${i === 0 ? "selected" : ""}>${escapeHtml(s)}</option>`
                    )
                    .join("");
                const formHtml = `<div class="modal-form"><div style="display:grid;gap:12px">
                <div><label>试卷名称</label><input class="input" id="exam_name" placeholder="如：第一章综合测试" style="margin-top:4px"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                    <div><label>学科</label><select class="input" id="exam_subject" style="margin-top:4px">${subjOptions}</select></div>
                    <div><label>难度</label><select class="input" id="exam_difficulty" style="margin-top:4px"><option value="easy">简单</option><option value="medium" selected>中等</option><option value="hard">困难</option></select></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                    <div><label>时长(分钟)</label><input class="input" id="exam_duration" type="number" value="60" style="margin-top:4px"></div>
                </div>
                <div><label>描述</label><textarea class="input" id="exam_desc" rows="2" placeholder="考试说明..." style="margin-top:4px"></textarea></div>
                <div><label>题目 (<span id="q_count">0</span>道)</label><div id="question_list" style="margin-top:6px;display:grid;gap:8px"></div>
                    <button class="btn tiny ghost" id="add_question" style="margin-top:4px">${icon("plus", 13)} 添加题目</button>
                </div>
            </div></div>`;
                showPanel("创建试卷", formHtml);
                let questionCount = 0;
                document.getElementById("add_question")?.addEventListener("click", () => {
                    questionCount++;
                    const qDiv = document.createElement("div");
                    qDiv.style.cssText =
                        "border:1px solid #e8edf8;border-radius:10px;padding:12px;display:grid;gap:6px";
                    qDiv.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b>第${questionCount}题</b><button class="btn tiny ghost remove-question" style="color:var(--red)">${icon("x", 12)}</button></div>
                    <input class="input" placeholder="题目内容" data-q-content="${questionCount}">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                        <select class="input" data-q-type="${questionCount}"><option value="choice">选择题</option><option value="judge">判断题</option></select>
                        <input class="input" type="number" placeholder="分值" value="5" data-q-score="${questionCount}">
                    </div>
                    <div data-q-options="${questionCount}"><input class="input" placeholder="选项A" style="margin-bottom:4px"><input class="input" placeholder="选项B"></div>
                    <input class="input" placeholder="正确答案" data-q-answer="${questionCount}">`;
                    document.getElementById("question_list")?.appendChild(qDiv);
                    document.querySelector("#q_count").textContent = questionCount;
                    qDiv.querySelector(".remove-question")?.addEventListener("click", () => {
                        qDiv.remove();
                        questionCount--;
                        document.querySelector("#q_count").textContent = questionCount;
                    });
                    qDiv.querySelector(`[data-q-type="${questionCount}"]`)?.addEventListener("change", e => {
                        const optsDiv = qDiv.querySelector(`[data-q-options="${questionCount}"]`);
                        optsDiv.innerHTML =
                            e.target.value === "judge"
                                ? `<div style="display:flex;gap:12px"><label><input type="radio" name="judge_opts_${questionCount}" value="对" checked> 对</label><label><input type="radio" name="judge_opts_${questionCount}" value="错"> 错</label></div>`
                                : `<input class="input" placeholder="选项A" style="margin-bottom:4px"><input class="input" placeholder="选项B">`;
                    });
                });
                const panel = document.querySelector(".panel-content");
                if (panel) {
                    const btn = document.createElement("div");
                    btn.style.cssText = "display:flex;gap:10px;justify-content:flex-end;margin-top:16px";
                    btn.innerHTML = `<button class="btn ghost" data-panel-close>取消</button><button class="btn primary" id="confirm-create-exam">${icon("check", 16)} 创建试卷</button>`;
                    panel.appendChild(btn);
                    document.getElementById("confirm-create-exam")?.addEventListener("click", async () => {
                        const name = document.getElementById("exam_name")?.value;
                        if (!name) {
                            toast("请输入试卷名称");
                            return;
                        }
                        const questions = [];
                        document.querySelectorAll("#question_list > div").forEach(qDiv => {
                            const num = qDiv.querySelector("[data-q-content]")?.dataset.qContent;
                            const content = qDiv.querySelector(`[data-q-content="${num}"]`)?.value;
                            const type = qDiv.querySelector(`[data-q-type="${num}"]`)?.value;
                            const score = parseInt(qDiv.querySelector(`[data-q-score="${num}"]`)?.value || "5");
                            const answer = qDiv.querySelector(`[data-q-answer="${num}"]`)?.value;
                            let options = [];
                            if (type === "judge") {
                                options = ["对", "错"];
                            } else {
                                qDiv.querySelectorAll(`[data-q-options="${num}"] input`).forEach(inp => {
                                    if (inp.value) options.push(inp.value);
                                });
                            }
                            if (content) questions.push({ content, type, options, correct_answer: answer, score });
                        });
                        if (questions.length === 0) {
                            toast("请至少添加一道题目");
                            return;
                        }
                        try {
                            const res = await request("/api/teacher/exams/create", {
                                method: "POST",
                                body: JSON.stringify({
                                    name,
                                    subject: document.getElementById("exam_subject")?.value || "综合",
                                    difficulty: document.getElementById("exam_difficulty")?.value || "medium",
                                    duration: parseInt(document.getElementById("exam_duration")?.value || "60"),
                                    description: document.getElementById("exam_desc")?.value || "",
                                    questions
                                })
                            });
                            toast(res.message || "试卷创建成功");
                            closePanel();
                            state.data.teacherTab = "exams";
                            await render();
                        } catch (e) {
                            toast(e.message || "创建失败");
                        }
                    });
                }
            })
        );
        /* 教师工作台 - 查看试卷详情 */
        document.querySelectorAll("[data-teacher-view-exam]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherViewExam;
                state.data.teacherExamDetail = null;
                state.data.teacherTab = "exams";
                render();
                try {
                    await loadTeacherExamDetail(id);
                    render();
                } catch (e) {
                    toast("获取试卷详情失败");
                }
            })
        );
        /* 教师工作台 - 返回试卷列表 */
        document.querySelectorAll("[data-teacher-exam-back]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.teacherExamDetail = null;
                render();
            })
        );
        /* 教师工作台 - 发布试卷 */
        document.querySelectorAll("[data-teacher-publish-exam]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherPublishExam;
                el.classList.add("is-loading");
                try {
                    const students = state.data.teacherStudents.length
                        ? state.data.teacherStudents
                        : (await (await request("/api/teacher/students?limit=100")).students) || [];
                    const studentOpts = students
                        .map(
                            s =>
                                `<label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer"><input type="checkbox" name="pub_student" value="${s.id}" checked> ${escapeHtml(s.nickname || s.username)}</label>`
                        )
                        .join("");
                    showPanel(
                        "发布试卷",
                        `<div class="modal-form"><p>选择要发布的学生：</p><div style="max-height:260px;overflow-y:auto;margin:12px 0;display:grid;gap:2px">${studentOpts || "<p>暂无学生</p>"}</div></div>`
                    );
                    const panel = document.querySelector(".panel-content");
                    if (panel) {
                        const btn = document.createElement("div");
                        btn.style.cssText = "display:flex;gap:10px;justify-content:flex-end;margin-top:12px";
                        btn.innerHTML = `<button class="btn ghost" data-panel-close>取消</button><button class="btn primary" id="confirm-publish">${icon("send", 16)} 确认发布</button>`;
                        panel.appendChild(btn);
                        document.getElementById("confirm-publish")?.addEventListener("click", async () => {
                            const selected = [...document.querySelectorAll("input[name='pub_student']:checked")].map(
                                cb => parseInt(cb.value)
                            );
                            if (!selected.length) {
                                toast("请选择至少一名学生");
                                return;
                            }
                            try {
                                const res = await request(`/api/teacher/exams/${id}/publish`, {
                                    method: "POST",
                                    body: JSON.stringify({ student_ids: selected })
                                });
                                toast(res.message || "发布成功");
                                closePanel();
                                await render();
                            } catch (e) {
                                toast(e.message || "发布失败");
                            }
                        });
                    }
                } catch (e) {
                    toast("获取学生列表失败");
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        /* 教师工作台 - 删除试卷 */
        document.querySelectorAll("[data-teacher-del-exam]").forEach(el =>
            el.addEventListener("click", async () => {
                if (!confirm("确定删除该试卷？")) return;
                const id = el.dataset.teacherDelExam;
                try {
                    await request(`/api/teacher/exams/${id}`, { method: "DELETE" });
                    toast("试卷已删除");
                    await render();
                } catch (e) {
                    toast("删除失败");
                }
            })
        );
        /* 教师工作台 - 发布笔记 */
        document.querySelectorAll("[data-teacher-action='create-note']").forEach(el =>
            el.addEventListener("click", async () => {
                const subjects = state.data.teacherSubjects;
                const subjOptions = (
                    subjects.length
                        ? subjects
                        : [
                              "数据结构与算法",
                              "计算机网络",
                              "操作系统",
                              "数据库",
                              "程序设计",
                              "前端开发",
                              "人工智能",
                              "软件工程"
                          ]
                )
                    .map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`)
                    .join("");
                showPanel(
                    "发布笔记",
                    `<div class="modal-form" style="display:grid;gap:12px">
                <div><label>笔记标题</label><input class="input" id="note_title" placeholder="如：快速排序详解" style="margin-top:4px"></div>
                <div><label>学科</label><select class="input" id="note_subject" style="margin-top:4px">${subjOptions}</select></div>
                <div><label>标签（逗号分隔）</label><input class="input" id="note_tags" placeholder="排序,算法,分治" style="margin-top:4px"></div>
                <div><label>笔记内容</label><textarea class="input" id="note_content" rows="8" placeholder="支持 Markdown 格式..." style="margin-top:4px;font-family:monospace"></textarea></div>
            </div>`
                );
                const panel = document.querySelector(".panel-content");
                if (panel) {
                    const btn = document.createElement("div");
                    btn.style.cssText = "display:flex;gap:10px;justify-content:flex-end;margin-top:12px";
                    btn.innerHTML = `<button class="btn ghost" data-panel-close>取消</button><button class="btn primary" id="confirm-publish-note">${icon("send", 16)} 发布笔记</button>`;
                    panel.appendChild(btn);
                    document.getElementById("confirm-publish-note")?.addEventListener("click", async () => {
                        const title = document.getElementById("note_title")?.value;
                        const content = document.getElementById("note_content")?.value;
                        if (!title || !content) {
                            toast("标题和内容不能为空");
                            return;
                        }
                        try {
                            const res = await request("/api/teacher/notes/publish", {
                                method: "POST",
                                body: JSON.stringify({
                                    title,
                                    content,
                                    subject: document.getElementById("note_subject")?.value || "综合",
                                    tags: document.getElementById("note_tags")?.value || ""
                                })
                            });
                            toast(res.message || "笔记发布成功");
                            closePanel();
                            await render();
                        } catch (e) {
                            toast(e.message || "发布失败");
                        }
                    });
                }
            })
        );
        /* 教师工作台 - 查看笔记详情 */
        document.querySelectorAll("[data-teacher-view-note]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherViewNote;
                try {
                    const json = await request(`/api/teacher/notes/${id}`);
                    const note = json.note || {};
                    const readers = json.readers || [];
                    showPanel(
                        note.title || "笔记详情",
                        `<div style="display:grid;gap:12px">
                    <div><span class="pill">${escapeHtml(note.subject)}</span><span class="pill ghost" style="margin-left:6px">${escapeHtml(note.tags || "")}</span></div>
                    <div style="white-space:pre-wrap;line-height:1.7;font-size:14px;max-height:320px;overflow-y:auto;background:#f8faff;border-radius:10px;padding:16px">${escapeHtml(note.content || "")}</div>
                    <div><b>阅读情况 (${readers.length}人)</b><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${readers.map(r => `<span class="pill">${escapeHtml(r.nickname || r.username)} ${new Date(r.read_at).toLocaleDateString()}</span>`).join("") || "<span style='color:var(--muted)'>暂无阅读记录</span>"}</div></div>
                </div>`
                    );
                } catch (e) {
                    toast("获取笔记详情失败");
                }
            })
        );
        /* 教师工作台 - 删除笔记 */
        document.querySelectorAll("[data-teacher-del-note]").forEach(el =>
            el.addEventListener("click", async () => {
                if (!confirm("确定删除该笔记？")) return;
                try {
                    await request(`/api/teacher/notes/${el.dataset.teacherDelNote}`, { method: "DELETE" });
                    toast("笔记已删除");
                    await render();
                } catch (e) {
                    toast("删除失败");
                }
            })
        );
        /* 教师工作台 - 刷新/通用操作 */
        document.querySelectorAll("[data-teacher-action='refresh-students']").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teacherTab = "students";
                await render();
            })
        );
        document.querySelectorAll("[data-teacher-action='batch-import']").forEach(el =>
            el.addEventListener("click", () => {
                showPanel(
                    `
                <div class="panel medium"><div class="panel-head"><h3>${icon("upload", 18)} 批量导入学生</h3><button class="btn icon ghost" data-close-panel>${icon("x", 18)}</button></div>
                <div class="panel-body">
                    <p class="info">每行一个学生，格式：<b>用户名,昵称</b>（昵称可选）。密码自动设为 用户名+123456。</p>
                    <textarea class="input" id="batch-import-text" rows="10" placeholder="zhangsan,张三
lisi,李四
wangwu
zhaoliu,赵六"></textarea>
                    <button class="btn primary wide" id="btn-batch-import" style="margin-top:12px">${icon("upload", 16)} 导入</button>
                </div></div>
            `,
                    () => {
                        document.querySelector("#btn-batch-import")?.addEventListener("click", async () => {
                            const text = document.querySelector("#batch-import-text")?.value?.trim();
                            if (!text) return toast("请输入学生信息");
                            const lines = text.split("\n").filter(l => l.trim());
                            const students = lines.map(line => {
                                const parts = line.split(",").map(p => p.trim());
                                return { username: parts[0], nickname: parts[1] || parts[0] };
                            });
                            try {
                                const btn = document.querySelector("#btn-batch-import");
                                btn.disabled = true;
                                btn.textContent = "导入中...";
                                const r = await request("/api/teacher/students/batch-import", {
                                    method: "POST",
                                    body: JSON.stringify({ students })
                                });
                                toast(r.message || "导入完成");
                                closePanel();
                                state.data.teacherTab = "students";
                                await render();
                            } catch (e) {
                                toast(e.message);
                            }
                        });
                    }
                );
            })
        );
        document.querySelectorAll("[data-teacher-action='refresh-assignments']").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teacherTab = "assignments";
                await render();
            })
        );
        document.querySelectorAll("[data-teacher-action='refresh-exams']").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teacherTab = "exams";
                await render();
            })
        );
        document.querySelectorAll("[data-teacher-action='refresh-paths']").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teacherTab = "paths";
                await render();
            })
        );
        document.querySelectorAll("[data-teacher-action='create-path']").forEach(el =>
            el.addEventListener("click", async () => {
                state.data._editingPathId = null;
                openPathForm();
            })
        );
        document.querySelectorAll("[data-teacher-edit-path]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherEditPath;
                state.data._editingPathId = parseInt(id);
                openPathForm();
            })
        );
        async function openPathForm() {
            const editId = state.data._editingPathId;
            let editData = null;
            if (editId) {
                await loadTeacherPathDetail(editId);
                editData = state.data.teacherPathDetail;
            }
            const subjects = state.data.teacherSubjects || [];
            const subOpts = subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
            const isEdit = !!editData;
            showPanel(
                `
                <div class="panel medium"><div class="panel-head"><h3>${icon("route", 18)} ${isEdit ? "编辑" : "创建"}学习路径</h3><button class="btn icon ghost" data-close-panel>${icon("x", 18)}</button></div>
                <div class="panel-body">
                    <div class="modal-form">
                        <div class="field"><label>路径名称 *</label><input class="input" id="path-name" placeholder="如: 前端入门完整路径" value="${isEdit ? escapeHtml(editData.path.name) : ""}"></div>
                        <div class="field"><label>所属学科 *</label><select class="input" id="path-subject">${isEdit ? subOpts.replace(`value="${escapeHtml(editData.path.subject)}"`, `value="${escapeHtml(editData.path.subject)}" selected`) : subOpts}</select></div>
                        <div class="field"><label>描述</label><textarea class="input" id="path-desc" rows="2" placeholder="描述这个学习路径的目标...">${isEdit ? escapeHtml(editData.path.description || "") : ""}</textarea></div>
                        <div class="field"><h4>${icon("list", 15)} 学习步骤</h4></div>
                        <div id="path-steps-builder" class="path-steps-builder">
                            ${
                                isEdit
                                    ? (editData.steps || [])
                                          .map(
                                              (s, i) => `
                            <div class="path-step-edit" draggable="true">
                                <span class="step-drag-handle" title="拖拽排序">⋮⋮</span>
                                <div class="field"><label>步骤${i + 1} 标题</label><input class="input path-step-title" placeholder="步骤${i + 1} 标题" value="${escapeHtml(s.title)}"></div>
                                <div class="field"><label>类型</label><select class="input path-step-type">${["text", "video", "quiz", "code", "exercise"].map(t => `<option value="${t}"${s.type === t ? " selected" : ""}>${t === "text" ? "文本阅读" : t === "video" ? "视频学习" : t === "quiz" ? "选择题测验" : t === "code" ? "编程练习" : "练习题"}</option>`).join("")}</select></div>
                                <div class="field"><label>内容</label><textarea class="input path-step-content" rows="3" placeholder="内容...">${escapeHtml(s.content || "")}</textarea></div>
                                <div class="field"><span class="label-row"><label>时长(分钟)</label><button class="link-button tiny" data-resource-pick type="button" title="从项目资源中选择">关联资源</button></span><input class="input path-step-dur" type="number" value="${s.duration_minutes || 15}" min="1"><input type="hidden" class="path-step-resource-id" value="${s.resource_id || ""}"><input type="hidden" class="path-step-resource-type" value="${escapeHtml(s.resource_type || "")}"></div>
                                <div class="field step-extra-fields" style="${s.type === "quiz" || s.type === "code" ? "" : "display:none"}"><label>选项(JSON数组)</label><input class="input path-step-options" placeholder='["A","B","C","D"]' value="${escapeHtml(Array.isArray(s.options_json) ? JSON.stringify(s.options_json) : typeof s.options_json === "string" ? s.options_json : "")}"><label>正确答案</label><input class="input path-step-answer" placeholder="如: B" value="${escapeHtml(s.correct_answer || "")}"></div>
                                <button class="btn tiny ghost remove-step-btn">${icon("x", 12)} 删除</button>
                            </div>
                            `
                                          )
                                          .join("")
                                    : `
                            <div class="path-step-edit" draggable="true">
                                <span class="step-drag-handle" title="拖拽排序">⋮⋮</span>
                                <div class="field"><label>步骤1 标题</label><input class="input path-step-title" placeholder="如: 理解HTML基本结构"></div>
                                <div class="field"><label>类型</label><select class="input path-step-type"><option value="text">文本阅读</option><option value="video">视频学习</option><option value="quiz">选择题测验</option><option value="code">编程练习</option><option value="exercise">练习题</option></select></div>
                                <div class="field"><label>内容</label><textarea class="input path-step-content" rows="3" placeholder="步骤内容描述或测验题目..."></textarea></div>
                                <div class="field"><span class="label-row"><label>时长(分钟)</label><button class="link-button tiny" data-resource-pick title="从项目资源中选择内容">关联资源</button></span><input class="input path-step-dur" type="number" value="15" min="1"><input type="hidden" class="path-step-resource-id"><input type="hidden" class="path-step-resource-type"></div>
                                <div class="field step-extra-fields" style="display:none"><label>选项(JSON数组)</label><input class="input path-step-options" placeholder='["选项A","选项B","选项C","选项D"]'><label>正确答案</label><input class="input path-step-answer" placeholder="如: B"></div>
                            </div>`
                            }
                        </div>
                        <button class="btn ghost small" id="btn-add-step">${icon("plus", 14)} 添加步骤</button>
                        <div class="field"><button class="btn primary wide" id="btn-save-path">${icon("check", 17)} 保存路径</button></div>
                    </div>
                </div></div>
            `,
                async () => {
                    /* 为每个步骤注入资源选择器 */
                    function injectResourcePickers() {
                        document.querySelectorAll(".path-step-edit").forEach(stepDiv => {
                            if (stepDiv.querySelector(".step-resource-row")) return;
                            const durField = stepDiv.querySelector(".path-step-dur")?.closest(".field");
                            if (!durField) return;
                            const row = document.createElement("div");
                            row.className = "field step-resource-row";
                            row.innerHTML = `<span class="label-row"><label>时长(分钟)</label><button class="link-button tiny" data-resource-pick type="button" title="从项目资源中选择内容">关联资源</button></span>`;
                            row.appendChild(durField.querySelector(".path-step-dur"));
                            const oldRid = durField.querySelector(".path-step-resource-id");
                            const oldRt = durField.querySelector(".path-step-resource-type");
                            const rid = oldRid || document.createElement("input");
                            rid.type = "hidden";
                            rid.className = "path-step-resource-id";
                            const rt = oldRt || document.createElement("input");
                            rt.type = "hidden";
                            rt.className = "path-step-resource-type";
                            row.appendChild(rid);
                            row.appendChild(rt);
                            durField.replaceWith(row);
                        });
                        document.querySelectorAll("[data-resource-pick]").forEach(btn => {
                            btn.addEventListener("click", e => {
                                e.preventDefault();
                                pickResource(btn.closest(".path-step-edit"));
                            });
                        });
                    }
                    async function pickResource(stepDiv) {
                        const resources = await loadTeacherResources("");
                        const renderResourceRows = rows =>
                            rows
                                .map(r => {
                                    const kindLabels = {
                                        resource: "资源",
                                        exam: "试卷",
                                        question: "题目",
                                        knowledge: "知识点",
                                        note: "笔记"
                                    };
                                    const name = r.name || r.title || "";
                                    const sub = r.subject || r.category || r.subcategory || "";
                                    return `<button class="list-row action-row pick-resource-item" data-resource-id="${r.id}" data-resource-kind="${r._kind}" data-resource-name="${escapeHtml(name)}" data-resource-desc="${escapeHtml((r.description || "").slice(0, 180))}"><span><b>${escapeHtml(name)}</b><small>${escapeHtml(sub)} · ${kindLabels[r._kind] || r._kind}</small></span><span class="pill ghost">选择</span></button>`;
                                })
                                .join("");
                        let picker = document.querySelector(".resource-picker-layer");
                        if (!picker) {
                            picker = document.createElement("div");
                            picker.className = "resource-picker-layer";
                            document.body.appendChild(picker);
                        }
                        picker.innerHTML = `<div class="resource-picker-card">
                        <div class="card-head"><h2 class="section-title">${icon("book", 18)} 选择资源</h2><button class="icon-btn" data-close-resource-picker aria-label="关闭">${icon("x", 18)}</button></div>
                        <div class="modal-form">
                        <div class="path-resource-toolbar">
                            <input class="input" id="resource-search-input" placeholder="搜索学习资源、试卷、题目、知识点、笔记...">
                            <select class="input" id="resource-type-filter">
                                <option value="">全部类型</option>
                                <option value="resource">学习资源</option>
                                <option value="exam">试卷</option>
                                <option value="question">题目</option>
                                <option value="knowledge">知识点</option>
                                <option value="note">笔记</option>
                            </select>
                        </div>
                        <div class="list" id="resource-pick-list" style="max-height:320px;overflow-y:auto">${renderResourceRows(resources)}</div>
                    </div></div>`;
                        picker.classList.add("show");
                        picker
                            .querySelector("[data-close-resource-picker]")
                            ?.addEventListener("click", () => picker.classList.remove("show"));
                        picker.addEventListener(
                            "click",
                            event => {
                                if (event.target === picker) picker.classList.remove("show");
                            },
                            { once: true }
                        );
                        /* 搜索过滤 */
                        const refreshResourceList = async () => {
                            const q = document.querySelector("#resource-search-input")?.value || "";
                            const type = document.querySelector("#resource-type-filter")?.value || "";
                            const filtered = q || type ? await loadTeacherResources(q, type) : resources;
                            const list = document.querySelector("#resource-pick-list");
                            if (list) list.innerHTML = renderResourceRows(filtered);
                            bindResourcePickItems(stepDiv);
                        };
                        document
                            .querySelector("#resource-search-input")
                            ?.addEventListener("input", refreshResourceList);
                        document
                            .querySelector("#resource-type-filter")
                            ?.addEventListener("change", refreshResourceList);
                        bindResourcePickItems(stepDiv);
                    }
                    function bindResourcePickItems(stepDiv) {
                        document.querySelectorAll(".pick-resource-item").forEach(item => {
                            item.addEventListener("click", () => {
                                const name = item.dataset.resourceName;
                                const desc = item.dataset.resourceDesc;
                                const rid = item.dataset.resourceId;
                                const kind = item.dataset.resourceKind;
                                const titleInput = stepDiv.querySelector(".path-step-title");
                                const contentInput = stepDiv.querySelector(".path-step-content");
                                const ridInput = stepDiv.querySelector(".path-step-resource-id");
                                const rtInput = stepDiv.querySelector(".path-step-resource-type");
                                if (titleInput && !titleInput.value) titleInput.value = name;
                                if (contentInput)
                                    contentInput.value = desc + (contentInput.value ? "\n" + contentInput.value : "");
                                if (ridInput) ridInput.value = rid;
                                if (rtInput) rtInput.value = kind;
                                const picker = document.querySelector(".resource-picker-layer");
                                if (picker) picker.classList.remove("show");
                            });
                        });
                    }
                    injectResourcePickers();
                    document.querySelectorAll(".path-step-type").forEach(s => {
                        s.addEventListener("change", () => toggleStepExtra(s));
                    });
                    document.querySelector("#btn-add-step")?.addEventListener("click", () => {
                        const builder = document.querySelector("#path-steps-builder");
                        const count = builder.querySelectorAll(".path-step-edit").length + 1;
                        builder.insertAdjacentHTML(
                            "beforeend",
                            `
                        <div class="path-step-edit" draggable="true">
                            <span class="step-drag-handle" title="拖拽排序">⋮⋮</span>
                            <div class="field"><label>步骤${count} 标题</label><input class="input path-step-title" placeholder="步骤${count} 标题"></div>
                            <div class="field"><label>类型</label><select class="input path-step-type"><option value="text">文本阅读</option><option value="video">视频学习</option><option value="quiz">选择题测验</option><option value="code">编程练习</option><option value="exercise">练习题</option></select></div>
                            <div class="field"><label>内容</label><textarea class="input path-step-content" rows="3" placeholder="内容..."></textarea></div>
                            <div class="field"><label>时长(分钟)</label><input class="input path-step-dur" type="number" value="15" min="1"></div>
                            <div class="field step-extra-fields" style="display:none"><label>选项(JSON数组)</label><input class="input path-step-options" placeholder='["A","B","C","D"]'><label>正确答案</label><input class="input path-step-answer" placeholder="如: B"></div>
                            <button class="btn tiny ghost remove-step-btn">${icon("x", 12)} 删除</button>
                        </div>
                    `
                        );
                        document
                            .querySelectorAll(".path-step-type")
                            .forEach(s => s.addEventListener("change", () => toggleStepExtra(s)));
                        document
                            .querySelectorAll(".remove-step-btn")
                            .forEach(b => b.addEventListener("click", () => b.parentElement.remove()));
                        injectResourcePickers();
                    });
                    /* 拖拽排序步骤 */
                    const builderEl = document.querySelector("#path-steps-builder");
                    let dragSrc = null;
                    builderEl?.addEventListener("dragstart", e => {
                        const step = e.target.closest(".path-step-edit");
                        if (!step) return;
                        dragSrc = step;
                        step.classList.add("dragging");
                        e.dataTransfer.effectAllowed = "move";
                    });
                    builderEl?.addEventListener("dragend", e => {
                        const step = e.target.closest(".path-step-edit");
                        if (step) step.classList.remove("dragging");
                        builderEl.querySelectorAll(".path-step-edit").forEach(s => s.classList.remove("drag-over"));
                        dragSrc = null;
                    });
                    builderEl?.addEventListener("dragover", e => {
                        e.preventDefault();
                        const step = e.target.closest(".path-step-edit");
                        if (!step || step === dragSrc) return;
                        step.classList.add("drag-over");
                        e.dataTransfer.dropEffect = "move";
                    });
                    builderEl?.addEventListener("dragleave", e => {
                        const step = e.target.closest(".path-step-edit");
                        if (step) step.classList.remove("drag-over");
                    });
                    builderEl?.addEventListener("drop", e => {
                        e.preventDefault();
                        const target = e.target.closest(".path-step-edit");
                        if (!target || !dragSrc || target === dragSrc) return;
                        target.classList.remove("drag-over");
                        const children = [...builderEl.querySelectorAll(".path-step-edit")];
                        const srcIdx = children.indexOf(dragSrc);
                        const tgtIdx = children.indexOf(target);
                        if (srcIdx < tgtIdx) {
                            target.parentNode.insertBefore(dragSrc, target.nextSibling);
                        } else {
                            target.parentNode.insertBefore(dragSrc, target);
                        }
                    });
                    document.querySelector("#btn-save-path")?.addEventListener("click", async () => {
                        const name = document.querySelector("#path-name").value.trim();
                        const subject = document.querySelector("#path-subject").value;
                        const desc = document.querySelector("#path-desc").value.trim();
                        if (!name || !subject) return toast("请填写路径名称和学科");
                        const steps = [];
                        document.querySelectorAll(".path-step-edit").forEach(div => {
                            const title = div.querySelector(".path-step-title").value.trim();
                            const type = div.querySelector(".path-step-type").value;
                            const content = div.querySelector(".path-step-content").value.trim();
                            const dur = parseInt(div.querySelector(".path-step-dur").value) || 15;
                            let opts = null,
                                answer = null;
                            if (type === "quiz" || type === "code") {
                                try {
                                    opts = JSON.parse(div.querySelector(".path-step-options").value || "[]");
                                } catch (e) {
                                    opts = [];
                                }
                                answer = div.querySelector(".path-step-answer").value.trim();
                            }
                            if (title) {
                                const resourceId = div.querySelector(".path-step-resource-id")?.value || null;
                                const resourceType = div.querySelector(".path-step-resource-type")?.value || null;
                                steps.push({
                                    title,
                                    type,
                                    content,
                                    options: opts,
                                    correct_answer: answer,
                                    duration_minutes: dur,
                                    resource_id: resourceId ? parseInt(resourceId) : null,
                                    resource_type: resourceType
                                });
                            }
                        });
                        if (steps.length === 0) return toast("请至少添加1个步骤");
                        try {
                            const editId = state.data._editingPathId;
                            const endpoint = editId ? `/api/teacher/paths/${editId}` : "/api/teacher/paths/create";
                            const method = editId ? "PUT" : "POST";
                            const r = await request(endpoint, {
                                method,
                                body: JSON.stringify({ name, description: desc, subject, steps })
                            });
                            toast(r.message || (editId ? "更新成功" : "创建成功"));
                            closePanel();
                            await loadTeacherPaths();
                            render();
                        } catch (e) {
                            toast(e.message);
                        }
                    });
                }
            );
            function toggleStepExtra(s) {
                const div = s.closest(".path-step-edit");
                const extra = div.querySelector(".step-extra-fields");
                if (s.value === "quiz" || s.value === "code") {
                    extra.style.display = "";
                } else {
                    extra.style.display = "none";
                }
            }
        }
        document.querySelectorAll("[data-teacher-view-path]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherViewPath;
                await loadTeacherPathDetail(id);
                state.data.teacherTab = "paths";
                await loadTeacherPathProgress(id);
                render();
            })
        );
        document.querySelectorAll("[data-teacher-path-back]").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teacherPathDetail = null;
                render();
            })
        );
        document.querySelectorAll("[data-teacher-path-assign]").forEach(el =>
            el.addEventListener("click", async () => {
                const pathId = el.dataset.teacherPathAssign;
                const pathName = el.dataset.pathName || "路径";
                await loadTeacherStudents({ limit: 100 });
                const students = state.data.teacherStudents || [];
                showPanel(
                    `
                <div class="panel medium"><div class="panel-head"><h3>${icon("users", 18)} 分配「${escapeHtml(pathName)}」给学生</h3><button class="btn icon ghost" data-close-panel>${icon("x", 18)}</button></div>
                <div class="panel-body">
                    <p class="info">⚠️ 分配后学生将被<b>强制锁定</b>，只能按此路径学习，完成后自动解锁。</p>
                    <div class="field">
                        <label>发布方式</label>
                        <div class="assign-mode-row">
                            <label class="radio-label"><input type="radio" name="assign-mode" value="immediate" checked> ${icon("bolt", 14)} 立即锁定</label>
                            <label class="radio-label"><input type="radio" name="assign-mode" value="scheduled"> ${icon("clock", 14)} 定时发布</label>
                        </div>
                        <input type="datetime-local" class="input" id="assign-schedule-time" style="display:none;margin-top:8px" min="${new Date().toISOString().slice(0, 16)}">
                    </div>
                    <div class="field">
                        <label>截止时间（可选）</label>
                        <input type="datetime-local" class="input" id="assign-deadline-time" min="${new Date().toISOString().slice(0, 16)}">
                    </div>
                    <div class="field"><input class="input" id="assign-student-search" placeholder="🔍 搜索学生..."></div>
                    <div class="list medium" id="path-assign-list" style="max-height:260px;overflow-y:auto">
                        ${students.map(s => `<label class="list-row check assign-student-row"><input type="checkbox" value="${s.id}" class="path-assign-check"> <span>${escapeHtml(s.nickname || s.username)}<small>${s.assigned_subjects || "无分配"}</small></span></label>`).join("")}
                    </div>
                    <div class="assign-actions">
                        <button class="btn tiny ghost" id="btn-select-all">全选</button>
                        <button class="btn tiny ghost" id="btn-deselect-all">取消全选</button>
                    </div>
                    <button class="btn primary wide" id="btn-confirm-assign">${icon("lock", 16)} 锁定并分配</button>
                </div></div>
            `,
                    () => {
                        document.querySelectorAll("input[name='assign-mode']").forEach(r =>
                            r.addEventListener("change", () => {
                                document.querySelector("#assign-schedule-time").style.display =
                                    r.value === "scheduled" ? "" : "none";
                                document.querySelector("#btn-confirm-assign").innerHTML =
                                    r.value === "scheduled"
                                        ? `${icon("clock", 16)} 定时发布`
                                        : `${icon("lock", 16)} 锁定并分配`;
                            })
                        );
                        /* 学生搜索过滤 */
                        document.querySelector("#assign-student-search")?.addEventListener("input", e => {
                            const q = e.target.value.toLowerCase();
                            document.querySelectorAll(".assign-student-row").forEach(row => {
                                row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
                            });
                        });
                        /* 全选/取消全选 */
                        document.querySelector("#btn-select-all")?.addEventListener("click", () => {
                            document.querySelectorAll(".path-assign-check").forEach(c => (c.checked = true));
                        });
                        document.querySelector("#btn-deselect-all")?.addEventListener("click", () => {
                            document.querySelectorAll(".path-assign-check").forEach(c => (c.checked = false));
                        });
                        document.querySelector("#btn-confirm-assign")?.addEventListener("click", async () => {
                            const ids = Array.from(document.querySelectorAll(".path-assign-check:checked")).map(c =>
                                parseInt(c.value)
                            );
                            if (ids.length === 0) return toast("请至少选择一名学生");
                            const mode =
                                document.querySelector("input[name='assign-mode']:checked")?.value || "immediate";
                            const deadlineAt = document.querySelector("#assign-deadline-time")?.value || null;
                            let endpoint = `/api/teacher/paths/${pathId}/assign`;
                            let body = { student_ids: ids, deadline_at: deadlineAt };
                            if (mode === "scheduled") {
                                const scheduledAt = document.querySelector("#assign-schedule-time")?.value;
                                if (!scheduledAt) return toast("请选择发布时间");
                                endpoint = `/api/teacher/paths/${pathId}/schedule`;
                                body.scheduled_at = scheduledAt;
                            }
                            try {
                                const r = await request(endpoint, {
                                    method: body.scheduled_at ? "PUT" : "POST",
                                    body: JSON.stringify(body)
                                });
                                toast(r.message || "分配成功");
                                closePanel();
                                await loadTeacherPaths();
                                render();
                            } catch (e) {
                                toast(e.message);
                            }
                        });
                    }
                );
            })
        );
        document.querySelectorAll("[data-teacher-del-path]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.teacherDelPath;
                if (!confirm("确认删除此学习路径？所有相关数据将被清除。")) return;
                try {
                    const r = await request(`/api/teacher/paths/${id}`, { method: "DELETE" });
                    toast(r.message || "已删除");
                    await loadTeacherPaths();
                    render();
                } catch (e) {
                    toast(e.message);
                }
            })
        );
        document.querySelectorAll("[data-teacher-remove-path-student]").forEach(el =>
            el.addEventListener("click", async () => {
                const assignmentId = el.dataset.teacherRemovePathStudent;
                const pathId = el.dataset.pathId;
                const studentName = el.dataset.studentName || "该学生";
                if (!confirm(`确认将「${studentName}」从此学习路径中删除？学生会立即解除该路径锁定。`)) return;
                try {
                    const r = await request(`/api/teacher/paths/${pathId}/assignments/${assignmentId}`, {
                        method: "DELETE"
                    });
                    toast(r.message || "已移除学生");
                    await loadTeacherPathDetail(pathId);
                    await loadTeacherPathProgress(pathId);
                    render();
                } catch (e) {
                    toast(e.message);
                }
            })
        );
        document.querySelectorAll("[data-path-complete]").forEach(el =>
            el.addEventListener("click", async e => {
                e.preventDefault();
                e.stopPropagation();
                const assignmentId = el.dataset.assignmentId;
                const stepId = el.dataset.stepId;
                if (!assignmentId || !stepId) return toast("路径数据异常，请刷新页面");
                try {
                    el.disabled = true;
                    el.textContent = "提交中...";
                    const r = await request("/api/student-paths/step-complete", {
                        method: "POST",
                        body: JSON.stringify({
                            assignment_id: parseInt(assignmentId),
                            step_id: parseInt(stepId),
                            answer: ""
                        })
                    });
                    toast(r.message || "已完成");
                    const updatedPath = await loadStudentActivePath();
                    state.data._studentLocked = !!(updatedPath && updatedPath.active);
                    render();
                } catch (e) {
                    toast(e.message);
                } finally {
                    el.disabled = false;
                }
            })
        );
        document.querySelectorAll("[data-path-submit-answer]").forEach(el =>
            el.addEventListener("click", async e => {
                e.preventDefault();
                e.stopPropagation();
                const assignmentId = el.dataset.assignmentId;
                const stepId = el.dataset.stepId;
                const stepType = el.dataset.stepType;
                if (!assignmentId || !stepId) return toast("路径数据异常，请刷新页面");
                let answer = "";
                if (stepType === "quiz") {
                    const checked = document.querySelector("input[name='path-quiz']:checked");
                    if (!checked) return toast("请先选择一个答案");
                    answer = checked.value;
                } else if (stepType === "code") {
                    answer = document.querySelector("[data-path-code-answer]")?.value?.trim() || "";
                    if (!answer) return toast("请先编写代码");
                } else if (stepType === "exercise") {
                    answer = document.querySelector("[data-path-exercise-answer]")?.value?.trim() || "";
                    if (!answer) return toast("请先输入你的答案");
                }
                try {
                    el.disabled = true;
                    el.textContent = "提交中...";
                    const r = await request("/api/student-paths/step-complete", {
                        method: "POST",
                        body: JSON.stringify({
                            assignment_id: parseInt(assignmentId),
                            step_id: parseInt(stepId),
                            answer
                        })
                    });
                    const msg =
                        r.is_correct === 1
                            ? `✅ 回答正确！${r.message}`
                            : r.is_correct === 0
                              ? `❌ 回答错误。${r.message}`
                              : r.message;
                    toast(msg || "已提交");
                    const updatedPath = await loadStudentActivePath();
                    state.data._studentLocked = !!(updatedPath && updatedPath.active);
                    render();
                } catch (e) {
                    toast(e.message);
                } finally {
                    el.disabled = false;
                }
            })
        );
        document.querySelectorAll("[data-path-save-note]").forEach(el =>
            el.addEventListener("click", async () => {
                const assignmentId = el.dataset.assignmentId;
                const stepId = el.dataset.stepId;
                const notes = document.querySelector("[data-path-notes]")?.value || "";
                if (!assignmentId || !stepId) return toast("路径数据异常");
                try {
                    el.disabled = true;
                    el.textContent = "保存中...";
                    await request("/api/student-paths/notes", {
                        method: "POST",
                        body: JSON.stringify({
                            assignment_id: parseInt(assignmentId),
                            step_id: parseInt(stepId),
                            notes
                        })
                    });
                    toast("笔记已保存");
                } catch (e) {
                    toast(e.message);
                } finally {
                    el.disabled = false;
                    el.innerHTML = icon("check", 14) + " 保存笔记";
                }
            })
        );
        /* 教师知识图谱 - 刷新 */
        document.querySelectorAll("[data-teacher-kg-refresh]").forEach(el =>
            el.addEventListener("click", async () => {
                await loadTeacherKnowledgeGraph();
                render();
            })
        );
        /* 教师知识图谱 - 学科筛选 */
        document.querySelectorAll("[data-teacher-kg-filter]").forEach(el =>
            el.addEventListener("change", async e => {
                state.data._teacherKGFilter = e.target.value;
                await loadTeacherKnowledgeGraph();
                render();
            })
        );
        /* 教师知识图谱 - Canvas渲染 */
        const teacherKgCanvas = document.getElementById("teacher-kg-canvas");
        if (teacherKgCanvas) {
            const kgData = state.data._teacherKG || { nodes: [], edges: [] };
            const nodes = kgData.nodes || [];
            const edges = kgData.edges || [];
            const ctx = teacherKgCanvas.getContext("2d");
            const W = (teacherKgCanvas.width = teacherKgCanvas.parentElement.clientWidth || 900);
            const H = (teacherKgCanvas.height = 500);
            ctx.clearRect(0, 0, W, H);

            if (nodes.length > 0) {
                const cx = W / 2,
                    cy = H / 2,
                    radius = Math.min(W, H) / 2.5;
                const positions = {};
                nodes.forEach((node, i) => {
                    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
                    positions[node.id] = {
                        x: cx + radius * Math.cos(angle),
                        y: cy + radius * Math.sin(angle),
                        ...node
                    };
                });

                // Edges
                edges.forEach(edge => {
                    const s = positions[edge.source],
                        t = positions[edge.target];
                    if (!s || !t) return;
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(t.x, t.y);
                    ctx.strokeStyle = "#e2e8f0";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });

                // Nodes
                Object.values(positions).forEach(node => {
                    const score = node.avgScore || 50;
                    const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
                    const r = 15 + (node.examCount || 1) * 2;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.8;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillStyle = "#1e293b";
                    ctx.font = "bold 10px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText((node.label || node.name || "").slice(0, 6), node.x, node.y + r + 14);
                });
            }

            // Click handler
            teacherKgCanvas.onclick = e => {
                const rect = teacherKgCanvas.getBoundingClientRect();
                const mx = e.clientX - rect.left,
                    my = e.clientY - rect.top;
                const cx = W / 2,
                    cy = H / 2,
                    radius = Math.min(W, H) / 2.5;
                let closest = null,
                    minD = 35;
                nodes.forEach((node, i) => {
                    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
                    const nx = cx + radius * Math.cos(angle),
                        ny = cy + radius * Math.sin(angle);
                    const d = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
                    if (d < minD) {
                        minD = d;
                        closest = node;
                    }
                });
                if (closest) {
                    state.data._teacherKGSelected = closest;
                    render();
                }
            };
        }
        /* 教师知识图谱 - 补救练习 */
        document.querySelectorAll("[data-teacher-kg-remedy]").forEach(el =>
            el.addEventListener("click", async () => {
                const node = state.data._teacherKGSelected;
                if (!node || !node.weakStudents) return toast("暂无薄弱学生数据");
                toast("已为薄弱学生分配针对「" + (node.label || node.name) + "」的补救练习");
            })
        );
        /* 试卷扫描 - 上传图片 */
        const scanInput = document.querySelector("[data-scan-file-input]");
        if (scanInput) {
            scanInput.addEventListener("change", e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    state.data._scanImagePreview = ev.target.result;
                    render();
                };
                reader.readAsDataURL(file);
            });
        }
        document.querySelectorAll("[data-scan-choose]").forEach(el =>
            el.addEventListener("click", () => {
                const input = document.querySelector("[data-scan-file-input]");
                if (input) input.click();
            })
        );
        /* 试卷扫描 - 拖拽上传 */
        document.querySelectorAll("[data-scan-dropzone]").forEach(el => {
            el.addEventListener("dragover", e => {
                e.preventDefault();
                el.classList.add("drag-over");
            });
            el.addEventListener("dragleave", () => {
                el.classList.remove("drag-over");
            });
            el.addEventListener("drop", e => {
                e.preventDefault();
                el.classList.remove("drag-over");
                const file = e.dataTransfer.files[0];
                if (!file || !file.type.startsWith("image/")) return toast("请上传图片文件");
                const reader = new FileReader();
                reader.onload = ev => {
                    state.data._scanImagePreview = ev.target.result;
                    render();
                };
                reader.readAsDataURL(file);
            });
        });
        /* 试卷扫描 - 开始识别 */
        document.querySelectorAll("[data-scan-start]").forEach(el =>
            el.addEventListener("click", async () => {
                const imageBase64 = state.data._scanImagePreview;
                if (!imageBase64) return toast("请先选择试卷图片");
                state.data._scanState = "scanning";
                render();
                try {
                    const json = await request("/api/paper-scan/scan", {
                        method: "POST",
                        body: JSON.stringify({ imageBase64: imageBase64, fileName: "paper.jpg" })
                    });
                    if (!json.success) {
                        state.data._scanState = "upload";
                        render();
                        return toast(json.message || "识别失败");
                    }
                    state.data._scanData = json.data;
                    state.data._scanQuestions = json.data.questions || [];
                    state.data._scanSelected = {};
                    (json.data.questions || []).forEach((_, i) => {
                        state.data._scanSelected[i] = true;
                    });
                    state.data._scanState = "results";
                    // 刷新历史
                    try {
                        const histJson = await request("/api/paper-scan/history");
                        state.data._scanHistory = histJson.data || [];
                    } catch (e) {}
                    render();
                } catch (e) {
                    state.data._scanState = "upload";
                    render();
                    toast("扫描失败: " + e.message);
                }
            })
        );
        /* 试卷扫描 - 返回上传页 */
        document.querySelectorAll("[data-scan-back]").forEach(el =>
            el.addEventListener("click", () => {
                state.data._scanState = "upload";
                state.data._scanData = null;
                state.data._scanQuestions = [];
                render();
            })
        );
        /* 试卷扫描 - 全选/取消全选 */
        document.querySelectorAll("[data-scan-select-all]").forEach(el =>
            el.addEventListener("click", () => {
                const qs = state.data._scanQuestions || [];
                qs.forEach((_, i) => {
                    state.data._scanSelected[i] = true;
                });
                render();
            })
        );
        document.querySelectorAll("[data-scan-deselect-all]").forEach(el =>
            el.addEventListener("click", () => {
                const qs = state.data._scanQuestions || [];
                qs.forEach((_, i) => {
                    state.data._scanSelected[i] = false;
                });
                render();
            })
        );
        /* 试卷扫描 - 复选框选择 */
        document.querySelectorAll("[data-scan-check]").forEach(el =>
            el.addEventListener("change", e => {
                const idx = parseInt(el.dataset.scanCheck);
                state.data._scanSelected[idx] = e.target.checked;
                render();
            })
        );
        /* 试卷扫描 - 点击行切换选择 */
        document.querySelectorAll("[data-scan-qindex]").forEach(el =>
            el.addEventListener("click", e => {
                if (
                    e.target.tagName === "INPUT" ||
                    e.target.tagName === "SELECT" ||
                    e.target.tagName === "TEXTAREA" ||
                    e.target.getAttribute("contenteditable") === "true"
                )
                    return;
                const idx = parseInt(el.dataset.scanQindex);
                state.data._scanSelected[idx] = !state.data._scanSelected[idx];
                render();
            })
        );
        /* 试卷扫描 - 字段编辑同步 */
        document.querySelectorAll("[data-scan-field]").forEach(el => {
            const eventType = el.tagName === "SELECT" ? "change" : "blur";
            el.addEventListener(eventType, () => {
                const idx = parseInt(el.dataset.scanField);
                const field = el.dataset.field;
                if (!state.data._scanQuestions[idx]) return;
                state.data._scanQuestions[idx][field] = el.value;
            });
        });
        /* 试卷扫描 - contenteditable 题干编辑 */
        document.querySelectorAll("[data-scan-field]").forEach(el => {
            if (el.getAttribute("contenteditable") !== "true") return;
            el.addEventListener("blur", () => {
                const idx = parseInt(el.dataset.scanField);
                const field = el.dataset.field;
                if (!state.data._scanQuestions[idx]) return;
                state.data._scanQuestions[idx][field] = el.innerText;
            });
        });
        /* 试卷扫描 - 选项编辑 */
        document.querySelectorAll("[data-scan-opt]").forEach(el => {
            el.addEventListener("blur", () => {
                const idx = parseInt(el.dataset.scanOpt);
                const oi = parseInt(el.dataset.optIndex);
                if (!state.data._scanQuestions[idx]) return;
                if (!state.data._scanQuestions[idx].options) state.data._scanQuestions[idx].options = [];
                state.data._scanQuestions[idx].options[oi] = el.innerText;
            });
        });
        /* 试卷扫描 - 保存到题库 */
        document.querySelectorAll("[data-scan-save]").forEach(el =>
            el.addEventListener("click", async () => {
                const toSave = [];
                (state.data._scanQuestions || []).forEach((q, i) => {
                    if (state.data._scanSelected[i]) {
                        toSave.push({
                            content: q.content,
                            type: q.type,
                            options: q.options || [],
                            answer: q.answer || "",
                            difficulty: q.difficulty || "medium",
                            score: parseInt(q.score) || 5,
                            subject: q.subject || ""
                        });
                    }
                });
                if (toSave.length === 0) return toast("请至少选择一道题目");
                try {
                    el.disabled = true;
                    el.textContent = "保存中...";
                    const json = await request("/api/paper-scan/save", {
                        method: "POST",
                        body: JSON.stringify({ questions: toSave })
                    });
                    toast(json.message || `成功保存 ${json.data?.saved || toSave.length} 道题目到题库`);
                    state.data._scanState = "upload";
                    state.data._scanData = null;
                    state.data._scanQuestions = [];
                    render();
                } catch (e) {
                    toast("保存失败: " + e.message);
                    el.disabled = false;
                    el.innerHTML = icon("save", 16) + " 保存到题库";
                }
            })
        );
        /* 试卷扫描 - 刷新历史 */
        document.querySelectorAll("[data-scan-refresh-history]").forEach(el =>
            el.addEventListener("click", async () => {
                try {
                    const json = await request("/api/paper-scan/history");
                    state.data._scanHistory = json.data || [];
                    render();
                } catch (e) {
                    toast("加载历史失败");
                }
            })
        );
        /* 试卷扫描 - 查看历史详情 */
        document.querySelectorAll("[data-scan-view-history]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.scanViewHistory;
                try {
                    const json = await request(`/api/paper-scan/history/${id}`);
                    if (!json.success) return toast(json.message);
                    state.data._scanData = json.data;
                    state.data._scanQuestions = json.data.parsed_questions || [];
                    state.data._scanSelected = {};
                    (json.data.parsed_questions || []).forEach((_, i) => {
                        state.data._scanSelected[i] = true;
                    });
                    state.data._scanState = "results";
                    render();
                } catch (e) {
                    toast("加载详情失败");
                }
            })
        );
        /* 加载试卷扫描历史 */
        (async () => {
            const scanTabActive = document.querySelector(".teacher-tab.active");
            if (scanTabActive && scanTabActive.dataset.teacherTab === "scan") {
                try {
                    const json = await request("/api/paper-scan/history");
                    state.data._scanHistory = json.data || [];
                    render();
                } catch (e) {}
            }
        })();
        document.querySelectorAll("[data-run-closed-loop]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/app/closed-loop/run", {
                        method: "POST",
                        body: JSON.stringify({ topic: el.dataset.runClosedLoop || "Node.js" })
                    });
                    state.loaded = false;
                    state.data.intelligence = null;
                    await loadData(true);
                    showClosedLoopResult(result, "AI今日闭环已生成");
                    render();
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-path-subject]").forEach(el =>
            el.addEventListener("change", async () => {
                state.data.pathSubject = el.value;
                state.data.pathCenter = null;
                await loadPathCenter(true);
                render();
            })
        );
        document.querySelectorAll("[data-path-intensity]").forEach(el =>
            el.addEventListener("change", () => {
                state.data.pathIntensity = el.value;
            })
        );
        document.querySelectorAll("[data-path-goal]").forEach(el =>
            el.addEventListener("change", () => {
                state.data.pathGoal = el.value.trim() || "系统掌握计算机核心能力";
                state.data.pathCenter = null;
            })
        );
        document.querySelectorAll("[data-path-generate]").forEach(el =>
            el.addEventListener("click", async () => {
                const goal =
                    document.querySelector("[data-path-goal]")?.value?.trim() ||
                    state.data.pathGoal ||
                    "系统掌握计算机核心能力";
                const subject = document.querySelector("[data-path-subject]")?.value || state.data.pathSubject || "all";
                const intensity =
                    document.querySelector("[data-path-intensity]")?.value || state.data.pathIntensity || "normal";
                state.data.pathGoal = goal;
                state.data.pathSubject = subject;
                state.data.pathIntensity = intensity;
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/app/path/generate", {
                        method: "POST",
                        body: JSON.stringify({ goal, subject, intensity })
                    });
                    state.data.learningLoop = result;
                    state.loaded = false;
                    state.data.pathCenter = null;
                    await loadData(true);
                    await loadPathCenter(true);
                    updateOnboardingProgress({ pathDone: result.stage === "plan_ready" });
                    render();
                    toast(
                        result.stage === "diagnosis_required"
                            ? "需要先完成目标知识点诊断"
                            : `已生成 ${result.generated} 天学习计划`
                    );
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-major-track]").forEach(el =>
            el.addEventListener("click", async () => {
                const track = majorTracks().find(item => item.key === el.dataset.majorTrack) || majorTracks()[0];
                state.data.majorTrack = track.key;
                state.data.pathGoal = track.goal;
                state.data.pathSubject = "all";
                state.data.pathCenter = null;
                if (state.view === "path") await loadPathCenter(true).catch(() => null);
                render();
                toast(`已切换为${track.title}方向`);
            })
        );
        document.querySelectorAll("[data-path-start]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    const result = await request(`/api/app/path/node/${el.dataset.pathStart}/start`, {
                        method: "POST",
                        body: "{}"
                    });
                    state.loaded = false;
                    state.data.pathCenter = null;
                    await loadData(true);
                    await loadPathCenter(true);
                    render();
                    toast(result.message || "已加入今日路径");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-fill-profile-sample]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.profileInput =
                    "我是大二计算机学生，想走后端开发。数据结构会写简单题，但树和图比较弱；数据库会基础 SQL，网络只记得七层模型。每天能学 90 分钟，想两个月做出一个项目。";
                render();
            })
        );
        document.querySelectorAll("[data-profile-input]").forEach(el =>
            el.addEventListener("input", () => {
                state.data.profileInput = el.value;
            })
        );
        document.querySelectorAll("[data-profile-analyze]").forEach(el =>
            el.addEventListener("click", async () => {
                const text =
                    document.querySelector("[data-profile-input]")?.value?.trim() || state.data.profileInput || "";
                if (!text) return toast("先输入你的学习状态");
                state.data.profileInput = text;
                state.data.diagnosticLoading = true;
                render();
                try {
                    await submitQuickDiagnosis(text);
                    toast("文本诊断已记录，请继续完成结构化问卷");
                } catch (e) {
                    toast("诊断失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.diagnosticLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-diagnostic-switch-mode]").forEach(el =>
            el.addEventListener("click", async () => {
                const mode = el.dataset.diagnosticSwitchMode;
                const progress = onboardingProgress();
                if (isOnboardingRequired() && mode === "questionnaire" && !progress.quickDone) {
                    return toast("请先完成快速文本诊断，再进入结构化问卷。");
                }
                if (isOnboardingRequired() && mode === "subject" && !progress.questionnaireDone) {
                    return toast("请先完成结构化问卷诊断，再进行一门学科测试。");
                }
                if (mode === "questionnaire") {
                    state.data.diagnosticMode = "questionnaire";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    try {
                        await loadDiagnosticQuestionnaire();
                    } catch (e) {
                        toast("加载问卷失败: " + (e.message || "网络错误"));
                        return;
                    }
                    render();
                } else if (mode === "text") {
                    state.data.diagnosticMode = "text";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    render();
                } else if (mode === "subject") {
                    state.data.diagnosticMode = "subject";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    state.data.diagnosticResult = null;
                    state.data._skipDiagnosticReload = true;
                    state.data.diagnosticSubjectResult = null;
                    state.data.diagnosticSubjectTest = null;
                    state.data.diagnosticSubjectAnswers = {};
                    try {
                        await loadDiagnosticSubjects();
                    } catch (e) {
                        toast("加载学科列表失败: " + (e.message || "网络错误"));
                        return;
                    }
                    render();
                } else {
                    state.data.diagnosticMode = "";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    render();
                }
            })
        );
        document.querySelectorAll("[data-diagnostic-start]").forEach(el =>
            el.addEventListener("click", async () => {
                const mode = el.dataset.diagnosticStart;
                const progress = onboardingProgress();
                if (isOnboardingRequired() && mode === "questionnaire" && !progress.quickDone) {
                    return toast("请先完成快速文本诊断，再进入结构化问卷。");
                }
                if (isOnboardingRequired() && mode === "subject" && !progress.questionnaireDone) {
                    return toast("请先完成结构化问卷诊断，再进行一门学科测试。");
                }
                if (mode === "questionnaire") {
                    state.data.diagnosticMode = "questionnaire";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    state.data._skipDiagnosticReload = false;
                    try {
                        await loadDiagnosticQuestionnaire();
                    } catch (e) {
                        toast("加载问卷失败: " + (e.message || "网络错误"));
                        return;
                    }
                } else if (mode === "subject") {
                    state.data.diagnosticMode = "subject";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    state.data.diagnosticResult = null;
                    state.data._skipDiagnosticReload = true;
                    state.data.diagnosticSubjectResult = null;
                    state.data.diagnosticSubjectTest = null;
                    state.data.diagnosticSubjectAnswers = {};
                    try {
                        await loadDiagnosticSubjects();
                    } catch (e) {
                        toast("加载学科列表失败: " + (e.message || "网络错误"));
                        return;
                    }
                } else {
                    state.data.diagnosticMode = "text";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticAnswers = {};
                    state.data._skipDiagnosticReload = false;
                }
                render();
            })
        );
        document.querySelectorAll("[data-diagnostic-fill-sample]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.profileInput =
                    "我是大二计算机学生，想走后端开发。数据结构会写简单题，但树和图比较弱；数据库会基础 SQL，网络只记得七层模型。每天能学 90 分钟，想两个月做出一个项目。";
                render();
            })
        );
        document.querySelectorAll("[data-diagnostic-answer]").forEach(el => {
            const qid = el.dataset.diagnosticAnswer;
            const type = el.type;
            if (type === "checkbox") {
                el.addEventListener("change", () => {
                    const checked = document.querySelectorAll(`input[name="${qid}"]:checked`);
                    state.data.diagnosticAnswers[qid] = Array.from(checked).map(cb => cb.value);
                    render();
                });
            } else if (type === "radio") {
                el.addEventListener("change", () => {
                    state.data.diagnosticAnswers[qid] =
                        document.querySelector(`input[name="${qid}"]:checked`)?.value || "";
                    render();
                });
            } else if (type === "range") {
                el.addEventListener("input", () => {
                    state.data.diagnosticAnswers[qid] = parseInt(el.value, 10);
                    render();
                });
            } else {
                el.addEventListener("input", () => {
                    state.data.diagnosticAnswers[qid] = el.value;
                });
            }
        });
        document.querySelectorAll("[data-diagnostic-step-next]").forEach(el =>
            el.addEventListener("click", () => {
                const questionnaire = state.data.diagnosticQuestionnaire;
                if (!questionnaire) return;
                const totalSteps = (questionnaire.steps || []).length;
                if (state.data.diagnosticStep < totalSteps - 1) {
                    state.data.diagnosticStep++;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-diagnostic-step-prev]").forEach(el =>
            el.addEventListener("click", () => {
                if (state.data.diagnosticStep > 0) {
                    state.data.diagnosticStep--;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-diagnostic-submit]").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.diagnosticLoading = true;
                render();
                try {
                    await submitDiagnostic(state.data.diagnosticAnswers, state.data.profileInput);
                    state.data.diagnosticMode = "subject";
                    state.data.diagnosticStep = 0;
                    state.data.diagnosticSubjectResult = null;
                    state.data.diagnosticSubjectTest = null;
                    state.data.diagnosticSubjectAnswers = {};
                    state.data._skipDiagnosticReload = true;
                    await loadDiagnosticSubjects();
                    toast("问卷诊断完成，请继续选择一门学科完成测试");
                } catch (e) {
                    toast("提交失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.diagnosticLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-diagnostic-restart]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.diagnosticResult = null;
                state.data.diagnosticMode = "";
                state.data.diagnosticStep = 0;
                state.data.diagnosticAnswers = {};
                state.data.profileInput = "";
                state.data._skipDiagnosticReload = true;
                state.data.diagnosticSubjectResult = null;
                state.data.diagnosticSubjectTest = null;
                state.data.diagnosticSubjectAnswers = {};
                state.data.diagnosticActiveSubject = "";
                if (state.user?.username) localStorage.removeItem(onboardingProgressKey());
                toast("已清除诊断结果，可重新开始");
                render();
            })
        );
        document.querySelectorAll("[data-diagnostic-subject]").forEach(el =>
            el.addEventListener("click", async () => {
                const subject = el.dataset.diagnosticSubject;
                if (!subject) return;
                try {
                    await loadSubjectDiagnosticTest(subject);
                    render();
                } catch (e) {
                    toast("加载诊断题目失败: " + (e.message || "网络错误"));
                }
            })
        );
        document.querySelectorAll("[data-subject-answer]").forEach(el => {
            const qid = el.dataset.subjectAnswer;
            const type = el.type;
            if (type === "checkbox") {
                el.addEventListener("change", () => {
                    const checked = document.querySelectorAll(`input[name="sq_${qid}"]:checked`);
                    state.data.diagnosticSubjectAnswers[qid] = Array.from(checked).map(cb => cb.value);
                    render();
                });
            } else if (type === "radio") {
                el.addEventListener("change", () => {
                    state.data.diagnosticSubjectAnswers[qid] =
                        document.querySelector(`input[name="sq_${qid}"]:checked`)?.value || "";
                    render();
                });
            } else {
                el.addEventListener("input", () => {
                    state.data.diagnosticSubjectAnswers[qid] = el.value;
                });
            }
        });
        document.querySelectorAll("[data-subject-submit]").forEach(el =>
            el.addEventListener("click", async () => {
                const test = state.data.diagnosticSubjectTest;
                if (!test) return;
                const answers = Object.entries(state.data.diagnosticSubjectAnswers).map(([qid, answer]) => ({
                    questionId: parseInt(qid, 10),
                    answer: Array.isArray(answer) ? answer.join(",") : String(answer)
                }));
                state.data.diagnosticSubjectLoading = true;
                render();
                try {
                    await submitSubjectDiagnostic(test.subject, answers);
                    toast("三段诊断完成，已生成个人画像");
                } catch (e) {
                    toast("提交失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.diagnosticSubjectLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-code-template]").forEach(el =>
            el.addEventListener("click", () => {
                const template = codeTemplates()[el.dataset.codeTemplate] || codeTemplates().algorithm;
                state.data.codeTemplate = el.dataset.codeTemplate;
                state.data.codeLanguage = template.language || "javascript";
                state.data.codeSource = template.source;
                state.data.codeOutput = "模板已载入，点击运行查看输出";
                state.data.codePreview = template.language === "html" ? template.source : "";
                state.data.codeInsight = null;
                state.data.codeRepoActive = null;
                state.data.codeRepoFiles = [];
                state.data.codeRepoFileActive = null;
                render();
            })
        );
        document.querySelectorAll("[data-code-language]").forEach(el =>
            el.addEventListener("change", () => {
                const language = el.value;
                const match = Object.entries(codeTemplates()).find(([, item]) => item.language === language);
                state.data.codeLanguage = language;
                if (match) {
                    state.data.codeTemplate = match[0];
                    state.data.codeSource = match[1].source;
                    state.data.codePreview = language === "html" ? match[1].source : "";
                }
                state.data.codeOutput = language === "html" ? "HTML 预览已切换" : `${language} 已选择`;
                state.data.codeInsight = null;
                render();
            })
        );
        document.querySelectorAll("[data-code-upload]").forEach(el =>
            el.addEventListener("change", async event => {
                const file = event.target.files?.[0];
                if (!file) return;
                const text = String(await file.text());
                const name = file.name.toLowerCase();
                const lang = name.endsWith(".html")
                    ? "html"
                    : name.endsWith(".py")
                      ? "python"
                      : name.endsWith(".java")
                        ? "java"
                        : name.endsWith(".cpp") || name.endsWith(".c")
                          ? "cpp"
                          : "javascript";
                state.data.codeSource = text;
                state.data.codeLanguage = lang;
                state.data.codeTemplate =
                    lang === "html" ? "html" : lang === "python" ? "python" : lang === "java" ? "java" : "algorithm";
                state.data.codePreview = lang === "html" ? text : "";
                state.data.codeOutput = `已载入文件：${file.name}`;
                state.data.codeInsight = {
                    score: 80,
                    summary: "练习文件已载入，可以运行、预览，或请 AI 帮你梳理知识点。",
                    tags: ["文件导入", lang, "待分析"],
                    next: "先运行一次，再根据输出补测试用例。"
                };
                if (state.data.codeRepoActive) {
                    try {
                        await uploadCodeFile(state.data.codeRepoActive.id, file.name, text, lang);
                        await loadCodeRepoFiles(state.data.codeRepoActive.id);
                        toast(`文件 ${file.name} 已保存到项目`);
                    } catch (e) {
                        toast("保存项目文件失败: " + e.message);
                    }
                }
                el.value = "";
                render();
            })
        );
        document.querySelectorAll("[data-code-upload-trigger]").forEach(el =>
            el.addEventListener("click", () => {
                const input = document.querySelector("[data-code-upload]");
                if (input) input.click();
            })
        );
        document.querySelectorAll("[data-reset-code]").forEach(el =>
            el.addEventListener("click", () => {
                const template = codeTemplates()[state.data.codeTemplate] || codeTemplates().algorithm;
                state.data.codeSource = template.source;
                state.data.codeLanguage = template.language || "javascript";
                state.data.codeOutput = "已重置为当前模板";
                state.data.codePreview = template.language === "html" ? template.source : "";
                state.data.codeInsight = null;
                render();
            })
        );
        document.querySelectorAll("[data-run-code]").forEach(el =>
            el.addEventListener("click", async () => {
                const source = document.querySelector("[data-code-source]")?.value || state.data.codeSource || "";
                state.data.codeSource = source;
                state.data.codeRunning = true;
                render();
                if (state.data.codeLanguage === "html") {
                    state.data.codePreview = source;
                    state.data.codeOutput = "HTML 已刷新预览";
                    state.data.codeInsight = {
                        score: 88,
                        summary: "前端页面已生成预览。检查移动端布局和可访问性。",
                        tags: [
                            "HTML预览",
                            source.includes("<style") ? "含样式" : "可补样式",
                            source.includes("<script") ? "含交互" : "可补交互"
                        ],
                        next: "添加表单或卡片列表"
                    };
                    state.data.codeRunning = false;
                    render();
                    return;
                }
                try {
                    const result = await runCode({ language: state.data.codeLanguage, source });
                    if (result.error) {
                        state.data.codeOutput = `错误：${result.error}`;
                        state.data.codeInsight = {
                            score: 46,
                            summary: "代码未通过运行，检查语法和逻辑。",
                            tags: ["运行错误", "需要调试"],
                            next: "查看报错信息，逐行排查"
                        };
                    } else {
                        const logs = result.logs || [];
                        state.data.codeOutput = logs.length ? logs.join("\n") : "程序执行成功，但没有输出内容。";
                        const hasLoop = /for|while|map|filter|reduce/.test(source);
                        const hasFunction = /function|=>|def /.test(source);
                        state.data.codeInsight = {
                            score: 72 + (hasFunction ? 8 : 0) + (hasLoop ? 7 : 0),
                            summary: hasFunction
                                ? "结构清晰，逻辑已封装成函数。检查边界条件。"
                                : "建议将逻辑封装为函数，方便复用。",
                            tags: [hasFunction ? "函数抽象" : "待封装", hasLoop ? "迭代逻辑" : "补充遍历", "运行验证"],
                            next: hasLoop ? "补充边界测试并标记时间复杂度" : "加入遍历逻辑完善程序"
                        };
                    }
                } catch (e) {
                    state.data.codeOutput = `运行失败：${e.message || "运行服务异常"}`;
                    state.data.codeInsight = {
                        score: 40,
                        summary: "代码运行服务暂时不可用。",
                        tags: ["服务异常"],
                        next: "稍后重试或检查网络"
                    };
                }
                state.data.codeRunning = false;
                render();
            })
        );
        document.querySelectorAll("[data-code-challenge]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.codeOutput = `${state.data.codeOutput}\n\n挑战：为当前函数补充 3 个测试用例，并写出时间复杂度。`;
                state.data.codeInsight = { ...(state.data.codeInsight || {}), next: "完成挑战后重构为更清晰的命名" };
                render();
            })
        );
        document.querySelectorAll("[data-code-explorer]").forEach(el =>
            el.addEventListener("click", async () => {
                if (el.dataset.codeExplorer === "templates") {
                    state.data.codeRepoActive = null;
                    state.data.codeRepoFiles = [];
                    state.data.codeRepoFileActive = null;
                    render();
                } else {
                    if (!state.data.codeRepos.length) {
                        try {
                            await loadCodeRepos();
                        } catch {}
                    }
                    if (!state.data.codeRepos.length) {
                        toast("暂无项目文件夹，请先新建");
                        return;
                    }
                    const firstRepo = state.data.codeRepoActive || state.data.codeRepos[0];
                    await loadCodeRepoFiles(firstRepo.id);
                    state.data.codeRepoActive = state.data.codeRepoFiles.length
                        ? state.data.codeRepos.find(r => r.id === firstRepo.id) || firstRepo
                        : firstRepo;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-code-new-repo]").forEach(el =>
            el.addEventListener("click", async () => {
                const name = prompt("请输入项目名称：");
                if (!name || !name.trim()) return;
                const lang = state.data.codeLanguage || "javascript";
                try {
                    await createCodeRepo(name.trim(), "", lang);
                    await loadCodeRepos();
                    toast(`项目 "${name.trim()}" 创建成功`);
                    render();
                } catch (e) {
                    toast("创建失败: " + e.message);
                }
            })
        );
        document.querySelectorAll("[data-code-back-templates]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.codeRepoActive = null;
                state.data.codeRepoFiles = [];
                state.data.codeRepoFileActive = null;
                render();
            })
        );
        document.querySelectorAll("[data-code-open-file]").forEach(el =>
            el.addEventListener("click", async () => {
                const fileId = parseInt(el.dataset.codeOpenFile, 10);
                const repoId = state.data.codeRepoActive?.id;
                if (!repoId || !fileId) return;
                try {
                    const file = await loadCodeFile(repoId, fileId);
                    state.data.codeRepoFileActive = file;
                    state.data.codeSource = file.content || "";
                    state.data.codeLanguage = file.language || "javascript";
                    state.data.codeOutput = `已打开文件：${file.filename}`;
                    state.data.codeInsight = {
                        score: 80,
                        summary: "项目文件已加载。",
                        tags: ["项目文件", file.language, "已保存"],
                        next: "修改后保存到项目，方便老师查看学习过程"
                    };
                    render();
                } catch (e) {
                    toast("打开文件失败: " + e.message);
                }
            })
        );
        document.querySelectorAll("[data-code-delete-file]").forEach(el =>
            el.addEventListener("click", async event => {
                event.stopPropagation();
                const fileId = parseInt(el.dataset.codeDeleteFile, 10);
                const repoId = state.data.codeRepoActive?.id;
                if (!repoId || !fileId) return;
                if (!confirm("确定删除此文件？")) return;
                try {
                    await deleteCodeFile(repoId, fileId);
                    await loadCodeRepoFiles(repoId);
                    if (state.data.codeRepoFileActive && state.data.codeRepoFileActive.id === fileId) {
                        state.data.codeRepoFileActive = null;
                    }
                    toast("文件已删除");
                    render();
                } catch (e) {
                    toast("删除失败: " + e.message);
                }
            })
        );
        document.querySelectorAll("[data-team-demo]").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.teamCodeLoading = true;
                render();
                try {
                    await createTeamCodeDemo();
                    await loadTeamCodeSummary(true);
                    const firstFile = state.data.teamCodeProject?.files?.[0];
                    if (firstFile) {
                        const file = await loadTeamCodeFile(state.data.teamCodeProject.project.id, firstFile.id);
                        state.data.teamCodeActiveFile = file;
                        state.data.teamCodeSource = file.content || "";
                        state.data.teamCodePath = file.path || "";
                        state.data.teamCodeModule = file.module_key || "frontend";
                        state.data.teamCodeActiveRole = file.module_key || "frontend";
                        state.data.teamCodeLanguage = file.language || "javascript";
                    }
                    toast("团队项目示例已创建");
                } catch (e) {
                    toast("创建失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-create]").forEach(el =>
            el.addEventListener("click", () => {
                showPanel(
                    `${icon("plus", 18)}添加团队项目`,
                    `<div class="team-v2-create-form">
                <label>项目名称<input class="input" data-team-create-name value="新团队项目" placeholder="例如：智能商品推荐系统"></label>
                <label>仓库名称<input class="input" data-team-create-repo value="new-team-project-repo" placeholder="例如：smart-recommendation-repo"></label>
                <label>项目说明<textarea class="input" data-team-create-desc rows="4" placeholder="写清项目目标、主要功能和演示场景">学生小组协作完成一个可运行、可展示、可复盘的软件工程项目。</textarea></label>
                <div class="team-v2-create-actions">
                    <button class="btn primary" data-team-create-confirm>${icon("check", 14)}创建并进入</button>
                    <button class="btn ghost" data-team-demo>${icon("play", 14)}创建示例项目</button>
                </div>
            </div>`
                );
                document.querySelector("[data-team-create-confirm]")?.addEventListener("click", async () => {
                    const name = document.querySelector("[data-team-create-name]")?.value?.trim();
                    const repositoryName = document.querySelector("[data-team-create-repo]")?.value?.trim();
                    const description = document.querySelector("[data-team-create-desc]")?.value?.trim();
                    if (!name) return toast("请填写项目名称");
                    try {
                        await createTeamCodeProject({ name, repositoryName, description });
                        document.querySelector(".modal-layer")?.classList.remove("show");
                        await loadTeamCodeSummary(true);
                        toast("团队项目已创建");
                        render();
                    } catch (e) {
                        toast("创建失败: " + (e.message || "网络错误"));
                    }
                });
                document.querySelector(".modal-layer [data-team-demo]")?.addEventListener("click", async () => {
                    try {
                        await createTeamCodeDemo();
                        document.querySelector(".modal-layer")?.classList.remove("show");
                        await loadTeamCodeSummary(true);
                        toast("示例项目已创建");
                        render();
                    } catch (e) {
                        toast("创建示例失败: " + (e.message || "网络错误"));
                    }
                });
            })
        );
        document.querySelectorAll("[data-team-delete-project]").forEach(el =>
            el.addEventListener("click", async event => {
                event.stopPropagation();
                const projectId = parseInt(el.dataset.teamDeleteProject, 10);
                const current = (state.data.teamCodeSummary?.projects || []).find(
                    item => Number(item.id) === projectId
                );
                if (!projectId) return;
                if (!confirm(`确认删除项目「${current?.name || "团队项目"}」？项目文件、提交记录和协作动态都会删除。`))
                    return;
                try {
                    await deleteTeamCodeProject(projectId);
                    const summary = await loadTeamCodeSummary(true);
                    const next = summary.projects?.[0];
                    if (next) await loadTeamCodeProject(next.id, true);
                    toast("项目已删除");
                    render();
                } catch (e) {
                    toast("删除失败: " + (e.message || "网络错误"));
                }
            })
        );
        document.querySelectorAll("[data-team-refresh]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return;
                try {
                    await loadTeamCodeProject(projectId, true);
                    toast("协作记录已刷新");
                    render();
                } catch (e) {
                    toast("刷新失败: " + (e.message || "网络错误"));
                }
            })
        );
        document.querySelectorAll("[data-team-add-demo-code]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const sample = teamDemoSnippet(
                    state.data.teamCodeActiveRole || state.data.teamCodeModule || "frontend"
                );
                state.data.teamCodeLoading = true;
                render();
                try {
                    await saveTeamCodeFile(projectId, {
                        path: sample.path,
                        content: sample.content,
                        moduleKey: state.data.teamCodeActiveRole || state.data.teamCodeModule || "frontend",
                        language: sample.language,
                        message: `添加演示代码 ${sample.path}`,
                        positionLabel: sample.path,
                        changedLines: sample.content.split(/\r?\n/).length
                    });
                    await loadTeamCodeProject(projectId, true);
                    const saved = state.data.teamCodeProject.files.find(file => file.path === sample.path);
                    if (saved) state.data.teamCodeActiveFile = await loadTeamCodeFile(projectId, saved.id);
                    state.data.teamCodeSource = sample.content;
                    state.data.teamCodePath = sample.path;
                    state.data.teamCodeLanguage = sample.language;
                    state.data.teamCodeRepoPath = sample.path.split("/").slice(0, -1).join("/");
                    await loadTeamCodeSummary(true);
                    toast("演示代码已添加，可直接查看、运行或审查");
                } catch (e) {
                    toast("添加演示代码失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-project]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = parseInt(el.dataset.teamProject, 10);
                if (!projectId) return;
                try {
                    await loadTeamCodeProject(projectId, true);
                    state.data.teamCodeActiveFile = null;
                    state.data.teamCodeSource = "";
                    state.data.teamCodeRepoPath = "";
                    state.data.teamCodeReview = null;
                    state.data.teamCodePipeline = null;
                    render();
                } catch (e) {
                    toast("项目加载失败: " + (e.message || "网络错误"));
                }
            })
        );
        document.querySelectorAll("[data-team-role-select]").forEach(el =>
            el.addEventListener("change", () => {
                switchTeamRole(el.value);
                render();
            })
        );
        document.querySelectorAll("[data-team-role]").forEach(el =>
            el.addEventListener("click", () => {
                switchTeamRole(el.dataset.teamRole || "frontend");
                render();
            })
        );
        document.querySelectorAll("[data-team-ide]").forEach(el =>
            el.addEventListener("click", () => {
                const ide = el.dataset.teamIde || "vscode";
                const project = state.data.teamCodeProject?.project;
                const repoName = state.data.teamCodeProject?.project?.repository_name || "team-repo";
                const commands = repoCloneCommands(project);
                const commandHelp = {
                    explorer: `1. 先在代码仓库中下载项目代码包\n2. 解压后用文件资源管理器打开目录\n\n仓库名：${repoName}`,
                    terminal: `下载并解压代码包后，在终端中执行：\ncd ${repoName}\nnpm install\nnpm start`,
                    gitbash: `如果已配置 Git 远程仓库，可在 Git Bash 中执行：\n${commands.clone}\ncd ${repoName}\n${commands.pull}`
                };
                if (commandHelp[ide]) {
                    return showPanel(
                        `${icon("terminal", 18)}${ide === "explorer" ? "File Explorer" : ide === "gitbash" ? "Git Bash" : "Terminal"} 打开方式`,
                        `<div class="team-v2-code-help">
                    <p>浏览器无法直接启动本地程序，请按下面方式在本机打开。</p>
                    <pre>${escapeHtml(commandHelp[ide])}</pre>
                    <div class="hero-actions"><button class="btn primary" data-team-download>${icon("download", 14)}下载代码包</button><button class="btn ghost" data-team-clone-copy>${icon("copy", 14)}复制 Clone</button></div>
                </div>`
                    );
                }
                const protoMap = {
                    vscode: `vscode://file/${repoName}`,
                    visualstudio: `devenv://open?path=${encodeURIComponent(repoName)}`,
                    idea: `jetbrains://idea/navigate/reference?project=${encodeURIComponent(repoName)}`,
                    pycharm: `jetbrains://pycharm/navigate/reference?project=${encodeURIComponent(repoName)}`,
                    webstorm: `jetbrains://webstorm/navigate/reference?project=${encodeURIComponent(repoName)}`
                };
                const url = protoMap[ide] || protoMap.vscode;
                toast(
                    `正在尝试通过浏览器协议打开 ${ide.toUpperCase()}。\n如果没有反应，请先安装对应 IDE 并配置协议关联。`
                );
                try {
                    window.open(url, "_blank");
                } catch (_) {
                    /* 协议调用失败则由用户手动打开 */
                }
            })
        );
        document.querySelectorAll("[data-team-code-upload]").forEach(el =>
            el.addEventListener("change", async e => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const selected = Array.from(e.target.files || []);
                if (!selected.length) return;
                state.data.teamCodeLoading = true;
                render();
                try {
                    const uploaded = [];
                    for (const file of selected) {
                        const content = await readTextFile(file);
                        const path = normalizeRepoPath(file.webkitRelativePath || file.name);
                        const moduleKey = inferModuleFromPath(path);
                        await saveTeamCodeFile(projectId, {
                            path,
                            content,
                            moduleKey,
                            language: inferLanguageFromPath(path),
                            message: `上传代码文件 ${path}`,
                            positionLabel: path,
                            changedLines: Math.max(1, content.split(/\r?\n/).length)
                        });
                        uploaded.push({ name: path, moduleKey, size: file.size });
                    }
                    state.data.teamCodeIntake.codeFiles = [...(state.data.teamCodeIntake.codeFiles || []), ...uploaded];
                    await loadTeamCodeProject(projectId, true);
                    await loadTeamCodeSummary(true);
                    toast(`已上传 ${uploaded.length} 个代码文件到公共仓库`);
                } catch (err) {
                    toast("代码上传失败: " + (err.message || "文件读取错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-doc-upload]").forEach(el =>
            el.addEventListener("change", async e => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const selected = Array.from(e.target.files || []);
                if (!selected.length) return;
                state.data.teamCodeLoading = true;
                render();
                try {
                    const docs = [];
                    for (const file of selected) {
                        const content = await readTextFile(file);
                        const path = normalizeRepoPath(file.name, "docs/");
                        await saveTeamCodeFile(projectId, {
                            path,
                            content,
                            moduleKey: "deployment",
                            language: inferLanguageFromPath(path),
                            message: `上传项目说明书 ${file.name}`,
                            positionLabel: path,
                            changedLines: Math.max(1, content.split(/\r?\n/).length)
                        });
                        docs.push({ name: file.name, path, content, size: file.size });
                    }
                    state.data.teamCodeIntake = extractProjectIntake(
                        [...(state.data.teamCodeIntake.docs || []), ...docs],
                        {
                            ...state.data.teamCodeIntake,
                            codeFiles: state.data.teamCodeIntake.codeFiles || []
                        }
                    );
                    await loadTeamCodeProject(projectId, true);
                    await loadTeamCodeSummary(true);
                    toast(`已解析 ${docs.length} 份说明书并生成岗位待办`);
                } catch (err) {
                    toast("说明书上传失败: " + (err.message || "文件读取错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-code-panel]").forEach(el =>
            el.addEventListener("click", () => {
                const project = state.data.teamCodeProject?.project;
                if (!project) return toast("请先创建或选择团队项目");
                const commands = repoCloneCommands(project);
                showPanel(
                    `${icon("git", 18)}代码拉取与上传说明`,
                    `<div class="team-v2-code-help">
                <div><b>Clone 仓库</b><pre>${escapeHtml(commands.clone)}</pre></div>
                <div><b>拉取最新代码</b><pre>${escapeHtml(commands.pull)}</pre></div>
                <div><b>上传代码或说明书</b><pre>${escapeHtml(commands.upload)}</pre></div>
                <p>当前为教学协作仓库：页面内上传会直接保存到团队公共仓库，下载会导出完整代码包；命令区用于训练真实 GitHub 工作流。</p>
            </div>`
                );
            })
        );
        document.querySelectorAll("[data-team-clone-copy]").forEach(el =>
            el.addEventListener("click", async () => {
                const project = state.data.teamCodeProject?.project;
                if (!project) return toast("请先创建或选择团队项目");
                const command = repoCloneCommands(project).clone;
                try {
                    await navigator.clipboard?.writeText(command);
                    toast("Clone 命令已复制");
                } catch (_) {
                    toast(command);
                }
            })
        );
        document.querySelectorAll("[data-team-download]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                const project = state.data.teamCodeProject?.project;
                if (!projectId) return toast("请先创建或选择团队项目");
                try {
                    el.classList.add("is-loading");
                    const res = await fetch(`/api/team-code/projects/${projectId}/download`, {
                        credentials: "include"
                    });
                    if (!res.ok) throw new Error("下载失败");
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${repoBranchName(project)}.tar.gz`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    toast("代码包已开始下载");
                } catch (e) {
                    toast("下载失败: " + (e.message || "网络错误"));
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-team-file]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                const fileId = parseInt(el.dataset.teamFile, 10);
                if (!projectId || !fileId) return;
                try {
                    const file = await loadTeamCodeFile(projectId, fileId);
                    state.data.teamCodeActiveFile = file;
                    state.data.teamCodeSource = file.content || "";
                    state.data.teamCodePath = file.path || "";
                    state.data.teamCodeModule = file.module_key || "frontend";
                    state.data.teamCodeActiveRole = file.module_key || state.data.teamCodeActiveRole || "frontend";
                    state.data.teamCodeLanguage = file.language || "javascript";
                    state.data.teamCodePosition = file.path || "当前编辑区";
                    state.data.teamCodeRepoPath = String(file.path || "")
                        .split("/")
                        .slice(0, -1)
                        .join("/");
                    render();
                } catch (e) {
                    toast("文件打开失败: " + (e.message || "网络错误"));
                }
            })
        );
        document.querySelectorAll("[data-team-repo-folder]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.teamCodeRepoPath = el.dataset.teamRepoFolder || "";
                render();
            })
        );
        document.querySelectorAll("[data-team-save]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const source = document.querySelector("[data-team-source]")?.value || "";
                const filePath =
                    document.querySelector("[data-team-path]")?.value?.trim() ||
                    state.data.teamCodePath ||
                    state.data.teamCodeActiveFile?.path ||
                    "";
                if (!filePath) return toast("请填写文件路径");
                const moduleKey =
                    document.querySelector("[data-team-module]")?.value ||
                    state.data.teamCodeModule ||
                    state.data.teamCodeActiveFile?.module_key ||
                    inferModuleFromPath(filePath);
                const language =
                    document.querySelector("[data-team-language]")?.value ||
                    state.data.teamCodeLanguage ||
                    state.data.teamCodeActiveFile?.language ||
                    inferLanguageFromPath(filePath);
                const payload = {
                    path: filePath,
                    content: source,
                    moduleKey,
                    language,
                    message: document.querySelector("[data-team-message]")?.value || "同步代码修改",
                    positionLabel:
                        document.querySelector("[data-team-position]")?.value ||
                        state.data.teamCodePosition ||
                        filePath,
                    changedLines: Math.max(1, source.split(/\r?\n/).length)
                };
                state.data.teamCodeLoading = true;
                render();
                try {
                    await saveTeamCodeFile(projectId, payload);
                    const saved = state.data.teamCodeProject.files.find(file => file.path === filePath);
                    if (saved) state.data.teamCodeActiveFile = await loadTeamCodeFile(projectId, saved.id);
                    state.data.teamCodeSource = source;
                    state.data.teamCodePath = filePath;
                    state.data.teamCodeModule = payload.moduleKey;
                    state.data.teamCodeActiveRole = payload.moduleKey;
                    state.data.teamCodeLanguage = payload.language;
                    state.data.teamCodeMessage = payload.message;
                    state.data.teamCodePosition = payload.positionLabel;
                    state.data.teamCodeReview = null;
                    await loadTeamCodeSummary(true);
                    toast("代码已保存到团队项目");
                } catch (e) {
                    toast("保存失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-ai-review]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const source = document.querySelector("[data-team-source]")?.value || "";
                const filePath =
                    document.querySelector("[data-team-path]")?.value?.trim() ||
                    state.data.teamCodePath ||
                    "当前编辑区";
                state.data.teamCodeLoading = true;
                render();
                try {
                    await reviewTeamCode(projectId, {
                        fileId: state.data.teamCodeActiveFile?.id,
                        path: filePath,
                        content: source,
                        moduleKey:
                            document.querySelector("[data-team-module]")?.value ||
                            state.data.teamCodeModule ||
                            "frontend"
                    });
                    await loadTeamCodeProject(projectId, true);
                    toast("AI 代码审查已完成");
                } catch (e) {
                    toast("AI 审查失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-ai-pipeline]").forEach(el =>
            el.addEventListener("click", async () => {
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const source = document.querySelector("[data-team-source]")?.value || state.data.teamCodeSource || "";
                const filePath =
                    document.querySelector("[data-team-path]")?.value?.trim() ||
                    state.data.teamCodePath ||
                    state.data.teamCodeActiveFile?.path ||
                    "当前编辑区";
                const mode = el.dataset.teamAiPipeline || "full";
                state.data.teamCodeLoading = true;
                render();
                try {
                    await runTeamCodePipeline(projectId, {
                        mode,
                        fileId: state.data.teamCodeActiveFile?.id,
                        path: filePath,
                        content: source,
                        moduleKey:
                            document.querySelector("[data-team-module]")?.value ||
                            state.data.teamCodeModule ||
                            state.data.teamCodeActiveRole ||
                            "frontend"
                    });
                    await loadTeamCodeProject(projectId, true);
                    toast(mode === "full" ? "AI 审查、测试和修正建议已完成" : "AI 流水线步骤已完成");
                } catch (e) {
                    toast("AI 流水线失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-team-screen]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.teamCodeScreen = el.dataset.teamScreen || "overview";
                render();
            })
        );
        document.querySelectorAll("[data-team-tool-task]").forEach(el =>
            el.addEventListener("input", () => {
                state.data.teamCodeToolTask = el.value;
            })
        );
        document.querySelectorAll("[data-team-tool]").forEach(el =>
            el.addEventListener("click", async () => {
                const action = el.dataset.teamTool;
                const projectId = state.data.teamCodeActiveProjectId;
                if (!projectId) return toast("请先创建或选择团队项目");
                const task = document.querySelector("[data-team-tool-task]")?.value || state.data.teamCodeToolTask;
                state.data.teamCodeToolTask = task;
                state.data.teamCodeLoading = true;
                render();
                try {
                    const result = await runTeamCodeTool(projectId, {
                        tool: action,
                        roleKey: state.data.teamCodeActiveRole,
                        task
                    });
                    state.data.teamCodeToolLog = `工具: ${result.tool}\n状态: ${result.status}\n岗位: ${teamRoleName(result.roleKey)}\n任务: ${result.task || "默认任务"}\n\n${result.output}\n\n下一步: ${result.next}`;
                    await loadTeamCodeProject(projectId, true);
                    toast(`${toolStatusName("ready")}：${action} 调用完成`);
                } catch (e) {
                    state.data.teamCodeToolLog = `工具调用失败: ${e.message || "网络错误"}`;
                    toast("工具调用失败: " + (e.message || "网络错误"));
                } finally {
                    state.data.teamCodeLoading = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-compiler-run]").forEach(el =>
            el.addEventListener("click", async () => {
                const source = document.querySelector("[data-compiler-source]")?.value?.trim() || "";
                const language = document.querySelector("[data-compiler-language]")?.value || "javascript";
                if (!source) return toast("请先编写代码再运行");
                state.data.teamCodeCompilerLang = language;
                state.data.teamCodeCompilerSource = source;
                state.data.teamCodeCompilerOutput = "编译中...";
                render();
                try {
                    const res = await fetch("/api/compiler/run", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ language, source })
                    });
                    const data = await res.json();
                    if (data.success) {
                        const result = data.data || {};
                        const lines = [];
                        if (Array.isArray(result.logs) && result.logs.length) {
                            lines.push(...result.logs);
                        }
                        if (result.error) {
                            lines.push(`\n--- 错误 ---\n${result.error}`);
                        }
                        state.data.teamCodeCompilerOutput = lines.length
                            ? lines.join("\n")
                            : result.stdout || result.output || "代码执行完成，无输出";
                    } else {
                        state.data.teamCodeCompilerOutput = `错误: ${data.message || "执行失败"}`;
                    }
                } catch (e) {
                    state.data.teamCodeCompilerOutput = `编译失败: ${e.message || "网络错误"}`;
                }
                render();
            })
        );
        document.querySelectorAll("[data-compiler-clear]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.teamCodeCompilerSource = "";
                state.data.teamCodeCompilerOutput = "运行结果将在这里显示...";
                state.data.teamCodeCompilerLang = "javascript";
                render();
            })
        );
        document.querySelectorAll("[data-compiler-source]").forEach(el =>
            el.addEventListener("input", () => {
                state.data.teamCodeCompilerSource = el.value;
            })
        );
        document.querySelectorAll("[data-compiler-language]").forEach(el =>
            el.addEventListener("change", () => {
                state.data.teamCodeCompilerLang = el.value;
            })
        );
        document.querySelectorAll("[data-ai-provider]").forEach(el =>
            el.addEventListener("change", () => {
                state.data.aiProvider = el.value;
            })
        );
        document.querySelectorAll("[data-save-ai-provider]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.aiProvider = document.querySelector("[data-ai-provider]")?.value || state.data.aiProvider;
                state.data.aiEndpoint = document.querySelector("[data-ai-endpoint]")?.value?.trim() || "";
                const key = document.querySelector("[data-ai-key]")?.value?.trim() || "";
                state.data.aiKeyMasked = key ? `${key.slice(0, 4)}****${key.slice(-3)}` : "";
                state.data.workflowLog = `AI Provider: ${state.data.aiProvider}\nEndpoint: ${state.data.aiEndpoint || "使用后端默认配置"}\n密钥策略: 真实 API Key 应写入服务端 .env，不放在浏览器。`;
                toast("大模型接入配置已记录为安全草稿");
                render();
            })
        );
        document.querySelectorAll("[data-run-db]").forEach(el =>
            el.addEventListener("click", () => {
                const sql = document.querySelector("[data-db-console]")?.value?.trim() || "";
                state.data.dbConsole = sql;
                if (!/^select\b/i.test(sql)) {
                    state.data.dbOutput =
                        "为了安全，前端演示只允许 SELECT。INSERT/UPDATE/DELETE 请通过后端白名单 API 和权限审计执行。";
                } else {
                    state.data.dbOutput = `模拟查询成功\nrows: 3\n\nsubject        mastery\n数据结构与算法    76\n数据库系统        84\n计算机网络        68`;
                }
                render();
            })
        );
        document.querySelectorAll("[data-browser-task]").forEach(el =>
            el.addEventListener("input", () => {
                state.data.browserTask = el.value;
            })
        );
        document.querySelectorAll("[data-workflow-action]").forEach(el =>
            el.addEventListener("click", () => {
                const action = el.dataset.workflowAction;
                const task = document.querySelector("[data-browser-task]")?.value?.trim() || state.data.browserTask;
                const logs = {
                    github: "GitHub 工作流草稿\n1. 读取当前代码文件\n2. git add / commit\n3. git push origin feature/code-lab\n4. 创建 Pull Request\n\n需要服务端 GitHub token 或 GitHub App 授权。",
                    pr: "Pull Request 草稿\n标题: feat: add AI code lab workflow\n检查项: 语法检查、页面预览、权限审计、部署预览。",
                    deploy: "部署流水线草稿\n1. npm run check\n2. 构建静态资源\n3. 部署到 Vercel/Netlify/云服务器\n4. 回写部署 URL 和截图。",
                    browser: `浏览器任务脚本草稿\n目标: ${task}\n步骤: 打开 /code-lab -> 点击运行 -> 捕获预览与 console -> 生成报告。`,
                    migration:
                        "数据库迁移脚本草稿\n建议新增 compiler_runs、ai_provider_configs、deploy_jobs 三张表，所有敏感字段加密保存。"
                };
                state.data.workflowLog = logs[action] || "工程动作已生成";
                toast("已生成工程工作流草稿");
                render();
            })
        );
        document.querySelectorAll("[data-ai-assistant-mode]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.aiAssistantMode = el.dataset.aiAssistantMode;
                if (state.view !== "aiAssistant") {
                    state.view = "aiAssistant";
                    history.pushState({}, "", "/ai-assistant");
                }
                render();
            })
        );
        document.querySelectorAll("[data-refresh-ai-assistant]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    await loadAiAssistant(true);
                    render();
                    toast("AI能力状态已刷新");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-ai-quick-prompt]").forEach(el =>
            el.addEventListener("click", () => {
                const input = document.querySelector("[data-ai-assistant-input]");
                if (!input) return;
                input.value = el.dataset.aiQuickPrompt || "";
                input.focus();
            })
        );
        document.querySelectorAll("[data-send-ai-assistant], [data-send-ai-assistant-note]").forEach(el =>
            el.addEventListener("click", async () => {
                const input = document.querySelector("[data-ai-assistant-input]");
                const prompt = input?.value?.trim();
                if (!prompt) return toast("先输入一个学习问题");
                const saveAsNote = el.hasAttribute("data-send-ai-assistant-note");
                state.data.aiAssistantMessages.push({ role: "user", content: prompt });
                el.classList.add("is-loading");
                try {
                    if (state.data.aiAssistantMode === "rag") {
                        const rag = await request("/api/rag/ask", {
                            method: "POST",
                            body: JSON.stringify({ query: prompt, subject: "software_engineering", limit: 4 })
                        });
                        const data = rag.data || {};
                        const citationText = (data.citations || [])
                            .slice(0, 4)
                            .map(c => `[${c.rank}] ${c.title}`)
                            .join("\n");
                        state.data.ragAskResult = data;
                        state.data.aiAssistantMessages.push({
                            role: "ai",
                            content: [
                                data.answer || "知识库暂时没有生成回答。",
                                citationText ? `\n证据链：\n${citationText}` : ""
                            ]
                                .filter(Boolean)
                                .join("\n")
                        });
                        if (input) input.value = "";
                        state.data._pendingAgentPrompt = "";
                        render();
                        toast("RAG知识库已基于本地模型回答");
                        return;
                    }
                    const runtimeIntent =
                        state.data.aiAssistantMode === "plan" || state.data.aiAssistantMode === "agent"
                            ? "design_course"
                            : state.data.aiAssistantMode === "mistake"
                              ? "practice"
                              : state.data.aiAssistantMode === "note"
                                ? "note"
                                : "next_action";
                    const result = await request("/api/agent-runtime/run", {
                        method: "POST",
                        body: JSON.stringify({
                            message: prompt,
                            intent: runtimeIntent,
                            context: {
                                goal: prompt,
                                subject: state.data.pathSubject || "all",
                                intensity: state.data.pathIntensity || "normal",
                                saveAsNote
                            }
                        })
                    });
                    state.data.aiAssistantMessages.push({ role: "ai", content: result.answer });
                    state.data.agentRuntimeResult = result;
                    state.data.agentRuntimeTraces = result.traces || [];
                    if (input) input.value = "";
                    state.data._pendingAgentPrompt = "";
                    state.data.pathCenter = null;
                    state.data.notesCenter = null;
                    await loadData(true);
                    render();
                    toast("智能体已完成分析并写回学习任务");
                } catch (error) {
                    state.data.aiAssistantMessages.push({ role: "ai", content: error.message });
                    render();
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-save-last-ai-note]").forEach(el =>
            el.addEventListener("click", async () => {
                const lastAnswer = [...state.data.aiAssistantMessages]
                    .reverse()
                    .find(message => message.role === "ai")?.content;
                if (!lastAnswer) return toast("先让 AI 回答一次，再整理成笔记");
                el.classList.add("is-loading");
                try {
                    await request("/api/app/notes/save", {
                        method: "POST",
                        body: JSON.stringify({
                            title: `AI助手笔记：${new Date().toLocaleDateString("zh-CN")}`,
                            body: lastAnswer,
                            subject: "AI助手",
                            sourceType: "ai_assistant",
                            tags: ["AI助手", "智能笔记", state.data.aiAssistantMode]
                        })
                    });
                    state.data.notesCenter = null;
                    toast("已保存到智能笔记");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-ai-screenshot-trigger]").forEach(el =>
            el.addEventListener("click", () => {
                document.querySelector("[data-ai-screenshot-input]")?.click();
            })
        );
        document.querySelectorAll("[data-ai-screenshot-input]").forEach(el =>
            el.addEventListener("change", async () => {
                const file = el.files?.[0];
                if (!file) return;
                state.data.aiAssistantMode = "mistake";
                state.data.aiAssistantMessages.push({ role: "user", content: `上传截图搜题：${file.name}` });
                try {
                    const imageData = await fileToDataUrl(file);
                    const result = await request("/api/tutor/ask", {
                        method: "POST",
                        body: JSON.stringify({
                            text: "请识别这张截图中的题目，并按错题教练方式讲解解法、知识点和同类题识别方法。",
                            subject: "all",
                            imageData,
                            fileName: file.name
                        })
                    });
                    const data = result.data || {};
                    const answer = [
                        data.ocr?.text ? `OCR识别：${data.ocr.text}` : "",
                        data.graphLocation
                            ? `知识点定位：${data.graphLocation.name || data.graphLocation.title || "已定位"}`
                            : "",
                        data.answer || "截图已接收，但暂未生成解析。"
                    ]
                        .filter(Boolean)
                        .join("\n\n");
                    state.data.aiAssistantMessages.push({ role: "ai", content: answer });
                    render();
                    toast(data.ocr?.provider?.includes("fallback") ? "已进入截图搜题兜底流程" : "截图搜题完成");
                } catch (error) {
                    state.data.aiAssistantMessages.push({ role: "ai", content: error.message });
                    render();
                } finally {
                    el.value = "";
                }
            })
        );
        document.querySelectorAll("[data-ai-assistant-demo]").forEach(el =>
            el.addEventListener("click", () => {
                const type = el.dataset.aiAssistantDemo;
                const message =
                    type === "ocr"
                        ? "拍照识题需要接入讯飞 OCR/试题识别服务。接入后这里会支持上传题图、识别题干、自动进入错题教练。"
                        : "语音提问需要接入讯飞语音听写 IAT。接入后这里会支持按住说话、课堂录音转写和口语陪练。";
                toast(message);
            })
        );
        document.querySelectorAll("[data-asset-tab]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.assetTab = el.dataset.assetTab;
                state.data._assetTabTouched = true;
                render();
            })
        );
        document.querySelectorAll("[data-rag-example]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.ragAskQuery = el.dataset.ragExample || "";
                render();
            })
        );
        document.querySelectorAll("[data-rag-ask]").forEach(el =>
            el.addEventListener("click", async () => {
                const input = document.querySelector("[data-rag-query]");
                const query = String(input?.value || state.data.ragAskQuery || "").trim();
                if (!query) return toast("请输入要问知识库的问题");
                state.data.ragAskQuery = query;
                state.data.ragAskLoading = true;
                render();
                try {
                    const json = await request("/api/rag/ask", {
                        method: "POST",
                        body: JSON.stringify({ query, subject: "software_engineering", limit: 4 })
                    });
                    state.data.ragAskResult = json.data || null;
                    toast("本地 RAG 回答已生成");
                } catch (error) {
                    toast(error.message || "RAG 问答失败");
                } finally {
                    state.data.ragAskLoading = false;
                    state.data.assetTab = "rag";
                    state.data._assetTabTouched = true;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-note-filter-subject]").forEach(el =>
            el.addEventListener("change", async () => {
                state.data.noteFilterSubject = el.value;
                state.data.notesCenter = null;
                state.data.selectedNoteId = null;
                await loadNotesCenter(true);
                render();
            })
        );
        document.querySelectorAll("[data-note-filter-source]").forEach(el =>
            el.addEventListener("change", async () => {
                state.data.noteFilterSource = el.value;
                state.data.notesCenter = null;
                state.data.selectedNoteId = null;
                await loadNotesCenter(true);
                render();
            })
        );
        document.querySelectorAll("[data-note-open]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.selectedNoteId = Number(el.dataset.noteOpen);
                render();
            })
        );
        document.querySelectorAll("[data-new-note]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.selectedNoteId = null;
                render();
                setTimeout(() => document.querySelector("[data-note-title]")?.focus(), 40);
            })
        );
        document.querySelectorAll("[data-save-note-center]").forEach(el =>
            el.addEventListener("click", async () => {
                const noteId = Number(el.dataset.saveNoteCenter || 0);
                const title = document.querySelector("[data-note-title]")?.value?.trim();
                const body = document.querySelector("[data-note-body]")?.value?.trim();
                const subject = document.querySelector("[data-note-subject]")?.value?.trim() || "综合";
                const tags = (document.querySelector("[data-note-tags]")?.value || "")
                    .split(/[,，]/)
                    .map(item => item.trim())
                    .filter(Boolean);
                if (!title || !body) return toast("请先填写标题和内容");
                el.classList.add("is-loading");
                try {
                    const result = noteId
                        ? await request(`/api/app/notes/${noteId}`, {
                              method: "PUT",
                              body: JSON.stringify({ title, body, subject, tags })
                          })
                        : await request("/api/app/notes/save", {
                              method: "POST",
                              body: JSON.stringify({ title, body, subject, tags, sourceType: "manual" })
                          });
                    state.data.notesCenter = null;
                    state.data.selectedNoteId = result.noteId;
                    await loadNotesCenter(true);
                    render();
                    toast("笔记已保存");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-delete-note]").forEach(el =>
            el.addEventListener("click", async () => {
                if (!confirm("删除这条笔记和关联卡片？")) return;
                try {
                    await request(`/api/app/notes/${el.dataset.deleteNote}`, { method: "DELETE" });
                    state.data.notesCenter = null;
                    state.data.selectedNoteId = null;
                    await loadNotesCenter(true);
                    render();
                    toast("笔记已删除");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-note-card]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    await request(`/api/app/notes/${el.dataset.noteCard}/card`, { method: "POST", body: "{}" });
                    state.data.notesCenter = null;
                    await loadNotesCenter(true);
                    render();
                    toast("复习卡已生成");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-review-note]").forEach(el =>
            el.addEventListener("click", async () => {
                try {
                    const result = await request(`/api/app/notes/${el.dataset.reviewNote}/review`, {
                        method: "POST",
                        body: JSON.stringify({ quality: el.dataset.reviewQuality || "good" })
                    });
                    state.data.notesCenter = null;
                    await loadNotesCenter(true);
                    render();
                    toast(`${result.nextReviewDays} 天后复习`);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-generate-report]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/app/report/generate", { method: "POST", body: "{}" });
                    await loadData(true);
                    showPanel(
                        `${icon("chart", 18)}AI学习报告`,
                        `<div class="report-summary"><b>正确率 ${result.summary.accuracy}%</b><p>${escapeHtml(result.summary.advice)}</p><div class="list">${(result.summary.weak || []).map(w => `<div class="list-row"><span>${escapeHtml(w.title)}<small>${escapeHtml(w.subject)} · 掌握度 ${w.mastery}%</small></span><span class="pill warn">优先</span></div>`).join("")}</div></div>`
                    );
                    render();
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-report-action]").forEach(el =>
            el.addEventListener("click", async () => {
                await runReportAction(el.dataset.reportAction, el);
            })
        );
        document.querySelectorAll("[data-report-resource-detail]").forEach(el =>
            el.addEventListener("click", () => {
                const index = Number(el.dataset.reportResourceDetail);
                const resource = state.data.reportResourcePackage?.resources?.[index];
                showPanel(
                    `${icon(resourceIcon(resource?.type), 18)}${escapeHtml(resource?.title || "资源详情")}`,
                    resourceDetailHtml(resource)
                );
            })
        );
        document.querySelectorAll("[data-save-note]").forEach(el =>
            el.addEventListener("click", async () => {
                const weak = state.data.weakPoints[0] || {};
                const body = document.querySelector("[data-asset-note]")?.value || weak.summary || "";
                try {
                    const result = await request("/api/app/notes/save", {
                        method: "POST",
                        body: JSON.stringify({ title: `${weak.title || "计算机知识"} 学习笔记`, body })
                    });
                    state.data.notesCenter = null;
                    await loadData(true);
                    toast(`已保存：${result.title}`);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-course-id]").forEach(el =>
            el.addEventListener("click", async () => {
                if (!el.dataset.courseId) return toast("课程数据准备中");
                el.classList.add("is-loading");
                try {
                    const result = await request(`/api/app/course/${el.dataset.courseId}/progress`, {
                        method: "POST",
                        body: JSON.stringify({ delta: 8 })
                    });
                    state.data.notesCenter = null;
                    await loadData(true);
                    render();
                    toast(`课程进度更新到 ${result.progress}%`);
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-load-question-set]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    await loadQuestionSet(el.dataset.loadQuestionSet, true);
                    render();
                    toast("已重新生成题组");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-start-assessment]").forEach(el =>
            el.addEventListener("click", () => {
                const mode = el.dataset.startAssessment;
                const set = state.data.questionSets[assessmentKey(mode)] || {};
                state.data.assessmentStarted[mode] = true;
                startAssessmentTimer(mode, set);
                render();
            })
        );
        document.querySelectorAll("[data-reset-assessment]").forEach(el =>
            el.addEventListener("click", async () => {
                const mode = el.dataset.resetAssessment;
                state.data.assessmentStarted[mode] = false;
                delete state.data.assessmentTimers[assessmentKey(mode)];
                await loadQuestionSet(mode, true);
                render();
            })
        );
        document.querySelectorAll("[data-ai-wrong-notes]").forEach(el =>
            el.addEventListener("click", async () => {
                const mode = el.dataset.aiWrongNotes;
                const subject = mode === "test" ? state.data.selectedSubject : "all";
                const set = state.data.questionSets[`${mode}:${subject}`] || {};
                const wrong = (set.result?.details || []).filter(item => !item.isCorrect);
                const text = wrong.length
                    ? `请把这些计算机错题整理成误区卡和主动回忆问题：${wrong.map(item => `${item.knowledgeTitle}，正确答案 ${item.correctAnswer}`).join("；")}`
                    : "请根据本次测试生成一张迁移练习笔记卡。";
                try {
                    await request("/api/app/notes/generate-card", { method: "POST", body: JSON.stringify({ text }) });
                    state.data.intelligence = null;
                    await loadIntelligence(true);
                    setView("smartNotes");
                    toast("错题已整理为智能笔记卡");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-select-subject]").forEach(el =>
            el.addEventListener("click", async () => {
                state.data.selectedSubject = el.dataset.selectSubject;
                try {
                    await loadQuestionSet("test", true);
                    render();
                    toast(`已切换到 ${state.data.selectedSubject} 测试`);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-set-answer]").forEach(el =>
            el.addEventListener("click", () => {
                const mode = el.dataset.setMode;
                const questionId = el.dataset.setQuestion;
                state.data.answerDrafts[mode] = state.data.answerDrafts[mode] || {};
                state.data.answerDrafts[mode][questionId] = el.dataset.setAnswer;
                document
                    .querySelectorAll(`[data-set-mode="${mode}"][data-set-question="${questionId}"]`)
                    .forEach(btn => btn.classList.remove("selected"));
                el.classList.add("selected");
                const answeredCount = Object.keys(state.data.answerDrafts[mode]).length;
                document
                    .querySelector("[data-exam-answered]")
                    ?.replaceChildren(document.createTextNode(String(answeredCount)));
                document
                    .querySelectorAll(`.answer-sheet-grid a[href="#q_${questionId}"]`)
                    .forEach(item => item.classList.add("done"));
            })
        );
        document.querySelectorAll("[data-submit-question-set]").forEach(el =>
            el.addEventListener("click", async () => {
                const mode = el.dataset.submitQuestionSet;
                const answers = state.data.answerDrafts[mode] || {};
                if (!Object.keys(answers).length) return toast("请先完成至少一道题");
                el.classList.add("is-loading");
                try {
                    const apiMode = mode === "onlineExam" ? "exam" : mode;
                    const result = await request("/api/app/practice/submit-set", {
                        method: "POST",
                        body: JSON.stringify({
                            mode: apiMode,
                            answers,
                            learningGoalId: state.data.learningLoop?.goal?.id || state.data.learningLoop?.goalId || null
                        })
                    });
                    if (result.stage === "plan_adjusted") {
                        state.data.learningLoop = await request(
                            `/api/learning-loop/status?goalId=${encodeURIComponent(result.goalId)}`
                        );
                        state.data.pathCenter = null;
                        state.data.studyPlan = null;
                    }
                    state.data.notesCenter = null;
                    const subject = mode === "test" ? state.data.selectedSubject : "all";
                    const key = `${mode}:${subject}`;
                    state.data.questionSets[key] = { ...(state.data.questionSets[key] || {}), result };
                    state.data.assessmentStarted[mode] = true;
                    delete state.data.assessmentTimers[key];
                    await loadData(true);
                    state.data.account = null;
                    render();
                    toast(`提交成功，得分 ${result.score}`);
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-teacher-action]").forEach(el =>
            el.addEventListener("click", async event => {
                const localActions = new Set([
                    "create-path",
                    "refresh-paths",
                    "create-exam",
                    "refresh-exams",
                    "create-note",
                    "refresh-students",
                    "batch-import",
                    "refresh-assignments"
                ]);
                if (localActions.has(el.dataset.teacherAction)) return;
                event.stopPropagation();
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/app/teacher/action", {
                        method: "POST",
                        body: JSON.stringify({
                            action: el.dataset.teacherAction,
                            subject: el.dataset.teacherSubject || state.data.selectedSubject || "数据结构与算法",
                            target: "学生端"
                        })
                    });
                    state.loaded = false;
                    state.data.teacherDashboard = null;
                    await loadData(true);
                    if (state.view === "teacherWorkbench") {
                        await loadTeacherDashboard(true);
                        const teacherTab = state.data.teacherTab || "overview";
                        if (teacherTab === "students" || teacherTab === "progress") await loadTeacherSubjects();
                        if (["students", "progress"].includes(teacherTab)) {
                            await loadTeacherStudents({ search: state.data._teacherSearch || "" });
                        }
                        if (teacherTab === "assignments") {
                            await loadTeacherSubjects();
                            await loadTeacherAssignments();
                        }
                        if (teacherTab === "exams") {
                            await loadTeacherExamsList();
                        }
                        if (teacherTab === "notes") {
                            await loadTeacherSubjects();
                            await loadTeacherNotes();
                        }
                        if (teacherTab === "paths") {
                            await loadTeacherSubjects();
                            await loadTeacherPaths();
                        }
                    }
                    render();
                    showPanel(
                        `${icon("check", 18)}教师任务已发布`,
                        `<div class="closed-loop-result"><p>${escapeHtml(result.message || "教师任务已发布到学生端")}</p><div class="loop-result-grid"><div><b>学生端推荐</b><p>已新增一条高优先级学习推荐。</p></div><div><b>学习动态</b><p>学生首页通知与最近动态可见。</p></div><div><b>闭环入口</b><p>学生可进入练习、测试或智能笔记完成任务。</p></div><div><b>数据回流</b><p>完成后更新教师工作台学情。</p></div></div><div class="hero-actions"><button class="btn primary" data-panel-go="home">${icon("home", 17)}看学生首页效果</button><button class="btn ghost" data-panel-go="teacherWorkbench">${icon("chart", 17)}回到工作台</button></div></div>`
                    );
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-task-id]").forEach(el =>
            el.addEventListener("click", async event => {
                event.stopPropagation();
                if (!el.dataset.taskId) return;
                el.classList.add("is-loading");
                try {
                    await request(`/api/app/tasks/${el.dataset.taskId}/toggle`, { method: "POST", body: "{}" });
                    await loadData(true);
                    render();
                    toast("任务已写入数据库，画像已更新");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-generate-plan]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/app/plan/generate", { method: "POST", body: "{}" });
                    await loadData(true);
                    render();
                    toast(`AI 已生成 ${result.generated} 个闭环任务`);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-answer]").forEach(el =>
            el.addEventListener("click", async () => {
                const questionId = el.dataset.questionId;
                if (!questionId) return;
                try {
                    const result = await request("/api/app/practice/answer", {
                        method: "POST",
                        body: JSON.stringify({ questionId, answer: el.dataset.answer })
                    });
                    document.querySelectorAll("[data-answer]").forEach(btn => btn.classList.remove("ok", "bad"));
                    el.classList.add(result.isCorrect ? "ok" : "bad");
                    const box = document.querySelector("[data-answer-result]");
                    if (box)
                        box.innerHTML = result.isCorrect
                            ? `<span class="pill good">回答正确，掌握度提升到 ${result.nextMastery}%</span>`
                            : `<span class="pill warn">已加入错题闭环，正确答案：${escapeHtml(result.correctAnswer)}</span>`;
                    await loadData(true);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-ai-diagnose]").forEach(el =>
            el.addEventListener("click", async () => {
                try {
                    const result = await request("/api/app/diagnosis/submit", {
                        method: "POST",
                        body: JSON.stringify({
                            goal: "学机器学习",
                            preference: "dialogue+visual",
                            answers: [{ correct: 1 }, { correct: 0 }, { correct: 1 }, { correct: 1 }]
                        })
                    });
                    await loadIntelligence(true);
                    render();
                    toast(`认知诊断完成：θ=${result.theta}`);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-run-agent-flow]").forEach(el =>
            el.addEventListener("click", async () => {
                const input = document.querySelector("[data-tutor-input]");
                const assistantInput = document.querySelector("[data-ai-assistant-input]");
                const message =
                    assistantInput?.value?.trim() ||
                    input?.value?.trim() ||
                    state.data.intelligence?.agentConsole?.todayJudgment?.reason ||
                    "根据我的学习数据生成下一步智能学习任务";
                const topic =
                    state.data.intelligence?.agentConsole?.todayJudgment?.focus ||
                    state.data.weakPoints[0]?.title ||
                    "当前薄弱点";
                el.classList.add("is-loading");
                try {
                    const result = await request("/api/agent-runtime/run", {
                        method: "POST",
                        body: JSON.stringify({
                            message,
                            intent: "next_action",
                            context: {
                                goal: message || topic,
                                subject: state.data.pathSubject || "all",
                                intensity: state.data.pathIntensity || "normal"
                            }
                        })
                    });
                    state.data.agentRuntimeResult = result;
                    state.data.agentRuntimeTraces = result.traces || [];
                    state.data.aiAssistantMessages.push({ role: "ai", content: result.answer });
                    state.loaded = false;
                    state.data.intelligence = null;
                    state.data.pathCenter = null;
                    await loadData(true);
                    await loadIntelligence(true);
                    render();
                    toast("智能体任务流已写回学习系统");
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        document.querySelectorAll("[data-agent-speak]").forEach(el =>
            el.addEventListener("click", () => {
                const judgment = state.data.intelligence?.agentConsole?.todayJudgment || {};
                const text = `今天最该补的是${judgment.focus || "当前薄弱点"}。原因是${judgment.reason || "系统检测到掌握度偏低"}。下一步任务是${judgment.nextTask || "运行今日智能体任务流"}。`;
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = "zh-CN";
                    utterance.rate = 0.95;
                    window.speechSynthesis.speak(utterance);
                    toast("导师正在朗读今日判断");
                } else {
                    toast("当前浏览器不支持本地语音合成，可配置讯飞 TTS 后使用服务端朗读");
                }
            })
        );
        document.querySelectorAll("[data-agent-voice]").forEach(el =>
            el.addEventListener("click", () => {
                const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const input = document.querySelector("[data-tutor-input]");
                if (!Recognition || !input) return toast("当前浏览器不支持语音识别，可配置讯飞 IAT 后接入实时听写");
                const recognition = new Recognition();
                recognition.lang = "zh-CN";
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;
                recognition.onstart = () => toast("开始听你提问...");
                recognition.onresult = event => {
                    input.value = event.results?.[0]?.[0]?.transcript || input.value;
                    state.data._agentFlowInput = input.value;
                    render();
                };
                recognition.onerror = event => toast(event.error || "语音识别失败");
                recognition.start();
            })
        );
        document.querySelectorAll("[data-agent-ocr]").forEach(el =>
            el.addEventListener("change", async () => {
                const file = el.files?.[0];
                if (!file) return;
                const input = document.querySelector("[data-tutor-input]");
                const prompt = `我上传了题目图片「${file.name}」，请先按 OCR/试题识别结果进行错题讲解，并生成补救练习和复盘卡。`;
                if (input) input.value = prompt;
                state.data._agentFlowInput = prompt;
                try {
                    const topic =
                        state.data.intelligence?.agentConsole?.todayJudgment?.focus ||
                        state.data.weakPoints[0]?.title ||
                        "拍照识题";
                    await request("/api/app/intelligence/run-agent-flow", {
                        method: "POST",
                        body: JSON.stringify({ topic, message: prompt })
                    });
                    state.loaded = false;
                    state.data.intelligence = null;
                    await loadData(true);
                    await loadIntelligence(true);
                    render();
                    toast("已把拍照识题纳入智能体任务流");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-xfyun-refresh]").forEach(el =>
            el.addEventListener("click", async () => {
                try {
                    await loadXfyunCapabilities(true);
                    toast("讯飞能力状态已刷新");
                    render();
                } catch (error) {
                    toast(error.message || "刷新失败");
                }
            })
        );
        document.querySelectorAll("[data-xfyun-ppt-topic]").forEach(el =>
            el.addEventListener("input", () => {
                state.data.xfyunPptTopic = el.value;
            })
        );
        document.querySelectorAll("[data-xfyun-action]").forEach(el =>
            el.addEventListener("click", async () => {
                const action = el.dataset.xfyunAction;
                try {
                    if (action === "iat") {
                        const json = await request("/api/xfyun/iat-url");
                        state.data.xfyunToolOutput = `语音听写 WebSocket 鉴权URL已生成\nappId: ${json.data.appId}\nurl: ${json.data.url.slice(0, 160)}...`;
                    } else if (action === "image") {
                        const json = await request("/api/xfyun/image-understanding-url");
                        state.data.xfyunToolOutput = `图片理解 WebSocket 鉴权URL已生成\nappId: ${json.data.appId}\nurl: ${json.data.url.slice(0, 160)}...`;
                    } else if (action === "ocr") {
                        const input = document.querySelector("[data-xfyun-ocr-file]");
                        if (input) input.click();
                        return;
                    } else if (action === "ppt") {
                        document.querySelector("[data-xfyun-ppt-create]")?.click();
                        return;
                    } else if (action === "tts") {
                        const json = await request("/api/xfyun/tts-url");
                        state.data.xfyunToolOutput = `语音合成 WebSocket 鉴权URL已生成\nurl: ${json.url.slice(0, 160)}...`;
                    } else {
                        state.data.xfyunToolOutput = `${action} 已接入能力列表。`;
                    }
                    render();
                } catch (error) {
                    state.data.xfyunToolOutput = error.message || "讯飞能力调用失败";
                    render();
                }
            })
        );
        document.querySelectorAll("[data-xfyun-ocr-file]").forEach(el =>
            el.addEventListener("change", async () => {
                const file = el.files?.[0];
                if (!file) return;
                try {
                    const imageBase64 = await readFileAsDataUrl(file);
                    const json = await request("/api/xfyun/ocr/document", {
                        method: "POST",
                        body: JSON.stringify({ imageBase64, fileName: file.name })
                    });
                    state.data.xfyunToolOutput = `OCR识别完成: ${file.name}\n\n${json.data.text || JSON.stringify(json.data.raw, null, 2).slice(0, 2000)}`;
                    render();
                } catch (error) {
                    state.data.xfyunToolOutput = error.message || "OCR调用失败";
                    render();
                }
            })
        );
        document.querySelectorAll("[data-xfyun-ppt-create]").forEach(el =>
            el.addEventListener("click", async () => {
                const topic =
                    document.querySelector("[data-xfyun-ppt-topic]")?.value?.trim() || state.data.xfyunPptTopic;
                if (!topic) return toast("请先输入 PPT 主题");
                try {
                    const json = await request("/api/xfyun/ppt/create", {
                        method: "POST",
                        body: JSON.stringify({ query: topic, title: topic, author: state.user?.username || "EduSmart" })
                    });
                    state.data.xfyunToolOutput = `智能PPT生成接口已返回\n主题: ${topic}\n\n${JSON.stringify(json.data, null, 2).slice(0, 2400)}`;
                    render();
                } catch (error) {
                    state.data.xfyunToolOutput = error.message || "PPT生成失败";
                    render();
                }
            })
        );
        document.querySelectorAll("[data-tutor-send]").forEach(el =>
            el.addEventListener("click", async () => {
                const input = document.querySelector("[data-tutor-input]");
                const message = input?.value?.trim();
                if (!message) return toast("先输入一个问题");
                try {
                    const result = await request("/api/app/tutor/message", {
                        method: "POST",
                        body: JSON.stringify({ message, topic: "智能体页面" })
                    });
                    if (input) input.value = "";
                    await loadIntelligence(true);
                    render();
                    toast(result.reply.slice(0, 28));
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-ai-card]").forEach(el =>
            el.addEventListener("click", async () => {
                try {
                    const weak = state.data.weakPoints[0];
                    const customText = document.querySelector("[data-note-source]")?.value?.trim();
                    await request("/api/app/notes/generate-card", {
                        method: "POST",
                        body: JSON.stringify({
                            text:
                                customText ||
                                weak?.summary ||
                                "把当前学习内容转为概念、类比、例子、主动回忆四段式卡片。"
                        })
                    });
                    await loadIntelligence(true);
                    render();
                    toast("智能笔记卡已生成");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-feynman-review]").forEach(el =>
            el.addEventListener("click", async () => {
                const text =
                    document.querySelector("[data-feynman-text]")?.value?.trim() ||
                    "我理解这个概念是用旧知识解释新现象，因为它能把问题拆成可验证的步骤。";
                try {
                    const result = await request("/api/app/feynman/review", {
                        method: "POST",
                        body: JSON.stringify({ explanation: text })
                    });
                    await loadIntelligence(true);
                    render();
                    toast(`费曼评估：清晰度 ${result.clarity}，准确度 ${result.accuracy}`);
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        const form = document.getElementById("login-form");
        if (form) {
            form.addEventListener("submit", async event => {
                event.preventDefault();
                const message = document.getElementById("login-message");
                message.textContent = "正在登录...";
                try {
                    const payload = Object.fromEntries(new FormData(form));
                    const json = await request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
                    state.user = {
                        username: json.user?.nickname || json.user?.username || payload.username,
                        role: json.user?.role || "student"
                    };
                    localStorage.setItem("edusmart_user", JSON.stringify(state.user));
                    state.loaded = false;
                    history.replaceState({}, "", "/home");
                    state.view = "home";
                    render();
                } catch (error) {
                    message.textContent = error.message;
                }
            });
        }
        const registerForm = document.getElementById("register-form");
        if (registerForm) {
            registerForm.addEventListener("submit", async event => {
                event.preventDefault();
                const message = document.getElementById("register-message");
                message.textContent = "正在创建账号...";
                try {
                    const payload = Object.fromEntries(new FormData(registerForm));
                    const json = await request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
                    state.user = {
                        username: json.user?.nickname || json.user?.username || payload.username,
                        role: json.user?.role || "student",
                        isNewUser: json.isNewUser === true
                    };
                    localStorage.setItem("edusmart_user", JSON.stringify(state.user));
                    state.loaded = false;
                    history.replaceState({}, "", "/home");
                    state.view = "home";
                    render();
                    toast("注册成功，先完成诊断来生成你的学习画像");
                } catch (error) {
                    message.textContent = error.message;
                }
            });
        }
        document.querySelectorAll("[data-onboarding-go]").forEach(el =>
            el.addEventListener("click", () => {
                const view = el.dataset.onboardingGo;
                const progress = onboardingProgress();
                if (view === "diagnostic") {
                    if (progress.questionnaireDone) {
                        state.data.diagnosticMode = "subject";
                    } else if (progress.quickDone) {
                        state.data.diagnosticMode = "questionnaire";
                    } else {
                        state.data.diagnosticMode = "text";
                    }
                }
                setView(view);
            })
        );
        document.querySelectorAll("[data-onboarding-dismiss]").forEach(el =>
            el.addEventListener("click", () => {
                toast(onboardingBlockedMessage());
            })
        );
        const logout = document.querySelector("[data-logout]");
        if (logout) {
            logout.addEventListener("dblclick", async () => {
                await request("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
                localStorage.removeItem("edusmart_user");
                location.href = "/";
            });
        }
        document.querySelectorAll("[data-account-tab]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.accountTab = el.dataset.accountTab;
                render();
            })
        );
        document.querySelectorAll("[data-settings-form='profile']").forEach(el =>
            el.addEventListener("submit", async event => {
                event.preventDefault();
                const formData = new FormData(el);
                const name = formData.get("nickname") || formData.get("username");
                const nickname = formData.get("nickname") || name;
                const email = formData.get("email") || "";
                const avatar = formData.get("avatar") || "";
                const interestsRaw = formData.get("interests") || "";
                const interests = interestsRaw
                    .split(/[,，]/)
                    .map(s => s.trim())
                    .filter(Boolean);
                try {
                    await request("/api/user/profile", {
                        method: "PUT",
                        body: JSON.stringify({ name, nickname, email, interests })
                    });
                    if (avatar) {
                        await request("/api/user/avatar", {
                            method: "POST",
                            body: JSON.stringify({ avatar })
                        });
                    }
                    state.data.account = null;
                    state.loaded = false;
                    await loadAccount(true);
                    state.user = { ...state.user, username: nickname || state.user.username };
                    localStorage.setItem("edusmart_user", JSON.stringify(state.user));
                    render();
                    toast("个人信息已更新");
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-settings-form='password']").forEach(el =>
            el.addEventListener("submit", async event => {
                event.preventDefault();
                const formData = new FormData(el);
                const currentPassword = formData.get("currentPassword");
                const newPassword = formData.get("newPassword");
                const confirmPassword = formData.get("confirmPassword");
                if (!currentPassword || !newPassword || !confirmPassword) {
                    return toast("请填写所有密码字段");
                }
                if (newPassword !== confirmPassword) {
                    return toast("两次输入的新密码不一致");
                }
                if (newPassword.length < 6) {
                    return toast("新密码至少需要6位");
                }
                try {
                    await request("/api/user/password", {
                        method: "PUT",
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                    toast("密码修改成功");
                    el.reset();
                } catch (error) {
                    toast(error.message);
                }
            })
        );
        document.querySelectorAll("[data-course-progress]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    const result = await request(`/api/app/course/${el.dataset.courseProgress}/progress`, {
                        method: "POST",
                        body: JSON.stringify({ delta: 8 })
                    });
                    state.data.account = null;
                    await loadAccount(true);
                    render();
                    toast(`课程进度更新到 ${result.progress}%`);
                } catch (error) {
                    toast(error.message);
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        /* 学习资源中心 - 事件绑定 */
        document.querySelectorAll("[data-resource-search]").forEach(el =>
            el.addEventListener("input", e => {
                state.data.resourceFilter.search = e.target.value;
                clearTimeout(el._timer);
                el._timer = setTimeout(() => render(), 400);
            })
        );
        document.querySelectorAll("[data-resource-filter]").forEach(el =>
            el.addEventListener("change", () => {
                const key = el.dataset.resourceFilter;
                state.data.resourceFilter[key] = el.value;
                render();
            })
        );
        document.querySelectorAll("[data-track-click]").forEach(el =>
            el.addEventListener("click", () => {
                const id = el.dataset.resourceId;
                if (id) trackResourceClick(id);
            })
        );
        document.querySelectorAll("[data-seed-resources]").forEach(el =>
            el.addEventListener("click", async () => {
                el.classList.add("is-loading");
                try {
                    await request("/api/resources/seed", { method: "POST" });
                    toast("资源数据初始化成功");
                    render();
                } catch (e) {
                    toast(e.message || "初始化失败");
                } finally {
                    el.classList.remove("is-loading");
                }
            })
        );
        /* 编程题库 - 事件绑定 */
        document.querySelectorAll("[data-problem-id]").forEach(el =>
            el.addEventListener("click", async () => {
                const id = el.dataset.problemId;
                state.data.problemDetail = null;
                state.data.problemCode = "";
                state.data.problemResult = "";
                state.data.algoViz = { kind: "bubble", values: "8,3,5,1,9,2", steps: [], index: 0, playing: false };
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
                const detail = await loadProblemDetail(id);
                if (detail) {
                    const lang = state.data.codeLanguage || "javascript";
                    const template = (detail.template_code || {})[lang] || "";
                    state.data.problemCode = template;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-problem-back]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.problemDetail = null;
                state.data.problemCode = "";
                state.data.problemResult = "";
                state.data.algoViz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-problem-search]").forEach(el =>
            el.addEventListener("input", e => {
                state.data.problemFilter.search = e.target.value;
                clearTimeout(el._timer);
                el._timer = setTimeout(() => render(), 400);
            })
        );
        document.querySelectorAll("[data-problem-diff]").forEach(el =>
            el.addEventListener("change", () => {
                state.data.problemFilter.difficulty = el.value;
                render();
            })
        );
        document.querySelectorAll("[data-problem-code]").forEach(el =>
            el.addEventListener("input", e => {
                state.data.problemCode = e.target.value;
            })
        );
        document.querySelectorAll("[data-problem-lang]").forEach(el =>
            el.addEventListener("change", () => {
                state.data.codeLanguage = el.value;
                const detail = state.data.problemDetail;
                if (detail) {
                    const templates = detail.template_code || {};
                    state.data.problemCode = templates[el.value] || "";
                }
                render();
            })
        );
        document.querySelectorAll("[data-problem-run]").forEach(el =>
            el.addEventListener("click", async () => {
                if (state.data.problemRunning) return;
                state.data.problemRunning = true;
                state.data.problemResult = "";
                render();
                try {
                    const lang = state.data.codeLanguage || "javascript";
                    const code = state.data.problemCode || "";
                    const result = await runCode({ language: lang, source: code });
                    const logs = (result.logs || []).join("\n") || result.error || "无输出";
                    state.data.problemResult = logs;
                } catch (e) {
                    state.data.problemResult = "运行错误: " + (e.message || "未知错误");
                } finally {
                    state.data.problemRunning = false;
                    render();
                }
            })
        );
        document.querySelectorAll("[data-algo-kind]").forEach(el =>
            el.addEventListener("change", e => {
                state.data.algoViz.kind = e.target.value;
                state.data.algoViz.steps = buildAlgoSteps(state.data.algoViz.kind, state.data.algoViz.values);
                state.data.algoViz.index = 0;
                state.data.algoViz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-algo-values]").forEach(el =>
            el.addEventListener("input", e => {
                state.data.algoViz.values = e.target.value;
            })
        );
        document.querySelectorAll("[data-algo-generate]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.algoViz.steps = buildAlgoSteps(state.data.algoViz.kind, state.data.algoViz.values);
                state.data.algoViz.index = 0;
                state.data.algoViz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-algo-prev]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.algoViz.index = Math.max(0, (state.data.algoViz.index || 0) - 1);
                state.data.algoViz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-algo-next]").forEach(el =>
            el.addEventListener("click", () => {
                const viz = ensureAlgoVizSteps();
                viz.index = Math.min(viz.steps.length - 1, (viz.index || 0) + 1);
                viz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-algo-jump]").forEach(el =>
            el.addEventListener("click", () => {
                const viz = ensureAlgoVizSteps();
                viz.index = Math.max(0, Math.min(viz.steps.length - 1, Number(el.dataset.algoJump || 0)));
                viz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-algo-reset]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.algoViz.steps = buildAlgoSteps(state.data.algoViz.kind, state.data.algoViz.values);
                state.data.algoViz.index = 0;
                state.data.algoViz.playing = false;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                render();
            })
        );
        document.querySelectorAll("[data-algo-play]").forEach(el =>
            el.addEventListener("click", () => {
                const viz = ensureAlgoVizSteps();
                viz.playing = !viz.playing;
                if (algoVizHandle) {
                    clearInterval(algoVizHandle);
                    algoVizHandle = null;
                }
                if (viz.playing) {
                    algoVizHandle = setInterval(() => {
                        const current = ensureAlgoVizSteps();
                        if ((current.index || 0) >= current.steps.length - 1) {
                            current.playing = false;
                            clearInterval(algoVizHandle);
                            algoVizHandle = null;
                        } else {
                            current.index = (current.index || 0) + 1;
                        }
                        render();
                    }, 850);
                }
                render();
            })
        );
        /* 在线教程 - 事件绑定 */
        document.querySelectorAll("[data-tutorial-url]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.tutorialsUrl = el.dataset.tutorialUrl;
                render();
            })
        );
        /* 视频教程 - 事件绑定 */
        document.querySelectorAll("[data-video-url]").forEach(el =>
            el.addEventListener("click", () => {
                state.data.tutorialsUrl = el.dataset.videoUrl;
                render();
            })
        );
        /* 多Agent协作 - 启动 */
        document.querySelectorAll("[data-agent-collaborate-start]").forEach(el =>
            el.addEventListener("click", async () => {
                const topicInput = document.querySelector("[data-collaborate-topic]");
                const topic = (topicInput?.value || "").trim();
                if (!topic) return toast("请输入学习主题");
                el.disabled = true;
                el.textContent = "协作中...";
                try {
                    const json = await request("/api/agent-collaborate/start", {
                        method: "POST",
                        body: JSON.stringify({ topic })
                    });
                    if (json.success) {
                        state.data._collaborateTopic = topic;
                        state.data._collaborateSteps = json.data.steps || [];
                        toast("多Agent协作完成！");
                        render();
                    }
                } catch (e) {
                    toast("协作失败: " + e.message);
                } finally {
                    el.disabled = false;
                    el.innerHTML = icon("bolt", 14) + " 启动协作";
                }
            })
        );
        /* ReAct 思考链折叠 */
        document.querySelectorAll("[data-react-toggle]").forEach(el =>
            el.addEventListener("click", () => {
                const steps = el.nextElementSibling;
                if (steps) {
                    steps.classList.toggle("hidden");
                    el.innerHTML = steps.classList.contains("hidden")
                        ? icon("brain", 13) + " 查看思考过程"
                        : icon("chevron-up", 13) + " 收起思考过程";
                }
            })
        );
    }

    function openInfoPanel(type) {
        if (type === "search") {
            const weak = state.data.weakPoints.slice(0, 6);
            return showPanel(
                `${icon("search", 18)}智能搜索`,
                `<div class="search-panel"><input data-panel-search placeholder="搜索课程、知识点、题目..." value="${escapeHtml(weak[0]?.title || "数据结构")}"><div class="list">${weak.map(p => `<button class="list-row action-row" data-panel-go="asset"><span>${escapeHtml(p.title)}<small>${escapeHtml(p.subject)} · 掌握度 ${p.mastery}%</small></span><span class="pill">知识点</span></button>`).join("")}</div></div>`
            );
        }
        if (type === "notifications" || type === "activities") {
            loadNotifications(true).then(() => {
                const items = state.data.notifications.length ? state.data.notifications : state.data.activities;
                const typeLabels = {
                    path_assigned: "路径分配",
                    path_completed: "路径完成",
                    path_unlocked: "路径解锁",
                    scheduled: "定时发布",
                    system: "系统通知"
                };
                const typeColors = {
                    path_assigned: "#5f58ee",
                    path_completed: "#18b87a",
                    path_unlocked: "#ff9500",
                    scheduled: "#7c4dff",
                    system: "#666"
                };
                const typeIcons = {
                    path_assigned: "route",
                    path_completed: "trophy",
                    path_unlocked: "lock",
                    scheduled: "clock",
                    system: "bell"
                };
                const hasUnread = state.data.notifications.some(n => !n.is_read);
                showPanel(
                    `${icon("bell", 18)}通知中心`,
                    `<div class="notif-header">${hasUnread ? `<button class="link-button" data-mark-all-read>全部已读</button>` : ""}</div>
                    <div class="activity">${items
                        .map(n => {
                            const isNotif = "type" in n;
                            if (!isNotif)
                                return `<div class="activity-item" style="--color:${n.color};--soft-color:${n.soft}"><span class="round-icon">${icon(n.icon, 17)}</span><div><div class="activity-text">${escapeHtml(n.text)}</div><div class="activity-time">${escapeHtml(n.time)}</div></div><span class="pill">${escapeHtml(n.badge || "动态")}</span></div>`;
                            const tc = typeColors[n.type] || "#666";
                            const ti = typeIcons[n.type] || "bell";
                            const timeStr = new Date(n.created_at).toLocaleString("zh-CN", {
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            });
                            return `<div class="activity-item${n.is_read ? "" : " unread"}" style="--color:${tc};--soft-color:${tc}20" data-notif-id="${n.id}" data-notif-link="${escapeHtml(n.link || "")}">
                            <span class="round-icon">${icon(ti, 17)}</span>
                            <div><div class="activity-text">${escapeHtml(n.title)}<small>${escapeHtml(n.content)}</small></div><div class="activity-time">${timeStr}</div></div>
                            <span class="pill">${typeLabels[n.type] || n.type}</span>
                        </div>`;
                        })
                        .join("")}</div>`
                );
                setTimeout(() => {
                    document.querySelector("[data-mark-all-read]")?.addEventListener("click", async () => {
                        await markAllNotificationsRead();
                        const panel = document.querySelector(".modal-layer");
                        if (panel) panel.classList.remove("show");
                    });
                    document.querySelectorAll("[data-notif-id]").forEach(el => {
                        el.addEventListener("click", async () => {
                            const id = parseInt(el.dataset.notifId);
                            if (!isNaN(id)) {
                                await markNotificationRead(id);
                                el.classList.remove("unread");
                            }
                            const link = el.dataset.notifLink;
                            if (link) {
                                const panel = document.querySelector(".modal-layer");
                                if (panel) panel.classList.remove("show");
                                if (link.startsWith("/teacher/")) {
                                    setView("teacherWorkbench");
                                } else if (link === "/student-paths") {
                                    setView("path");
                                }
                            }
                        });
                    });
                }, 50);
            });
            return;
        }
        if (type === "achievements") {
            return showPanel(
                `${icon("trophy", 18)}学习成就`,
                `<div class="achievement-modal">${state.data.achievements.map(item => `<div class="smart-card"><span class="pill">${escapeHtml(item.badge || "成就")}</span><h3>${escapeHtml(item.title)}</h3><p>经验值 ${item.xp || 100} · 来自计算机学习闭环</p></div>`).join("") || "<p>完成练习和测试后会解锁成就。</p>"}</div>`
            );
        }
        if (type === "profile") {
            return showPanel(
                `${icon("brain", 18)}画像数据来源`,
                `<div class="diagnosis-map"><div><b>答题记录</b><p>练习、测试、考试提交后实时回写掌握度。</p></div><div><b>学习行为</b><p>课程进度、笔记保存、复习任务完成都会进入画像。</p></div><div><b>教师干预</b><p>教师发布的补救练习和分科测试会进入推荐闭环。</p></div></div>`
            );
        }

        /* 知识图谱 - 刷新 */
        document.querySelectorAll("[data-kg-refresh]").forEach(el =>
            el.addEventListener("click", async () => {
                try {
                    const json = await request("/api/knowledge-graph");
                    state.data.knowledgeGraph = json.data || { nodes: [], edges: [] };
                    render();
                } catch (e) {
                    toast("加载图谱失败");
                }
            })
        );
        /* 知识图谱 - 添加关联 */
        const kgAddLinkBtn = document.getElementById("kg-add-link-btn");
        if (kgAddLinkBtn) {
            kgAddLinkBtn.addEventListener("click", async () => {
                const sourceSelect = document.getElementById("kg-source-note");
                const targetInput = document.getElementById("kg-target-title");
                const sourceNoteId = sourceSelect?.value;
                const targetTitle = targetInput?.value.trim();
                if (!sourceNoteId) {
                    toast("请选择源笔记");
                    return;
                }
                if (!targetTitle) {
                    toast("请输入关联目标标题");
                    return;
                }
                try {
                    await request("/api/knowledge-graph/links", {
                        method: "POST",
                        body: JSON.stringify({ source_note_id: parseInt(sourceNoteId), target_title: targetTitle })
                    });
                    toast("关联已添加");
                    // Refresh the graph
                    const json = await request("/api/knowledge-graph");
                    state.data.knowledgeGraph = json.data || { nodes: [], edges: [] };
                    render();
                } catch (e) {
                    toast("添加关联失败");
                }
            });
        }
        /* 知识图谱 - 渲染Canvas */
        const kgCanvas = document.getElementById("kg-canvas");
        if (kgCanvas && state.data.knowledgeGraph) {
            const { nodes, edges } = state.data.knowledgeGraph;
            const ctx = kgCanvas.getContext("2d");
            const W = (kgCanvas.width = kgCanvas.parentElement.clientWidth || 800);
            const H = (kgCanvas.height = 500);
            ctx.clearRect(0, 0, W, H);

            if (nodes.length === 0) {
                ctx.fillStyle = "#94a3b8";
                ctx.font = "16px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("暂无知识节点", W / 2, H / 2);
            } else {
                // Layout nodes in a circle
                const cx = W / 2,
                    cy = H / 2,
                    radius = Math.min(W, H) / 2.5;
                const nodePositions = {};
                nodes.forEach((node, i) => {
                    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);
                    nodePositions[node.id] = { x, y, ...node };
                });

                // Draw edges
                edges.forEach(edge => {
                    const source = nodePositions[edge.source];
                    const target = nodePositions[edge.target];
                    if (source && target) {
                        ctx.beginPath();
                        ctx.moveTo(source.x, source.y);
                        ctx.lineTo(target.x, target.y);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                });

                // Draw nodes
                Object.values(nodePositions).forEach(node => {
                    const isNote = String(node.id).startsWith("note-");
                    const r = isNote ? 18 : 22;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                    ctx.fillStyle = isNote ? "#3b82f6" : "#8b5cf6";
                    ctx.fill();
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Label
                    ctx.fillStyle = isNote ? "#1e40af" : "#5b21b6";
                    ctx.font = "bold 11px sans-serif";
                    ctx.textAlign = "center";
                    const label = (node.label || node.name || "").slice(0, 8);
                    ctx.fillText(label, node.x, node.y + r + 16);
                });
            }
        }

        /* 知识图谱 - Canvas点击 */
        if (kgCanvas) {
            kgCanvas.addEventListener("click", e => {
                const rect = kgCanvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                // Simple hit detection
                const { nodes } = state.data.knowledgeGraph || { nodes: [] };
                const cx = kgCanvas.width / 2,
                    cy = kgCanvas.height / 2;
                const radius = Math.min(kgCanvas.width, kgCanvas.height) / 2.5;
                let closest = null,
                    minDist = 30;
                nodes.forEach((node, i) => {
                    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
                    const nx = cx + radius * Math.cos(angle);
                    const ny = cy + radius * Math.sin(angle);
                    const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = node;
                    }
                });
                if (closest) {
                    const detail = document.getElementById("kg-detail");
                    if (detail) {
                        const isNote = String(closest.id).startsWith("note-");
                        detail.innerHTML = `<div class="card-head"><h3>${icon("info", 16)} ${escapeHtml(closest.label || closest.name || "节点")}</h3></div>
                            <div class="kg-detail-body">
                                <span class="pill">${isNote ? "笔记" : "知识点"}</span>
                                <p>${escapeHtml(closest.description || closest.subject || "")}</p>
                            </div>`;
                    }
                }
            });
        }
    }

    function showClosedLoopResult(result, title) {
        showPanel(
            `${icon("bolt", 18)}${title}`,
            `<div class="closed-loop-result">
            <div class="result-topic"><b>${escapeHtml(result.topic)}</b><span>${escapeHtml(result.subject)} · 当前掌握度 ${result.mastery ?? 0}%</span></div>
            <div class="loop-result-grid">
                <div><b>关联课程</b><p>${escapeHtml(result.course?.title || "已根据知识点匹配计算机课程")}</p></div>
                <div><b>专项练习</b><p>已匹配 ${result.questions || 0} 道相关题，进入练习后会回写掌握度。</p></div>
                <div><b>智能笔记</b><p>已生成主动回忆卡，进入智能笔记可继续整理。</p></div>
                <div><b>复习计划</b><p>已写入今日任务和学习动态。</p></div>
            </div>
            <div class="list">${(result.tasks || []).map(task => `<div class="list-row"><span>${escapeHtml(task.title)}<small>${escapeHtml(task.subtitle)}</small></span><span class="pill">${task.minutes} 分钟</span></div>`).join("")}</div>
            <div class="hero-actions"><button class="btn primary" data-panel-go="course">${icon("book", 17)}去学课程</button><button class="btn ghost" data-panel-go="practice">${icon("list", 17)}去做练习</button><button class="btn ghost" data-panel-go="smartNotes">${icon("pen", 17)}看笔记</button></div>
        </div>`
        );
    }

    async function runAiFeature(feature, el) {
        state.data.aiFeature = feature;
        el?.classList.add("is-loading");
        const weak = state.data.weakPoints[0];
        try {
            if (feature === "closed-loop") {
                await request("/api/app/diagnosis/submit", {
                    method: "POST",
                    body: JSON.stringify({
                        goal: weak?.title ? `掌握 ${weak.title}` : "完成今日学习目标",
                        preference: "dialogue+visual+practice",
                        answers: [{ correct: 1 }, { correct: 0 }, { correct: 1 }, { correct: 0 }, { correct: 1 }]
                    })
                });
                await request("/api/app/plan/generate", { method: "POST", body: "{}" });
                await request("/api/app/notes/generate-card", {
                    method: "POST",
                    body: JSON.stringify({
                        text: weak?.summary || "把当前薄弱知识点生成概念、例子、类比、主动回忆卡片。"
                    })
                });
                await request("/api/app/tutor/message", {
                    method: "POST",
                    body: JSON.stringify({
                        message: `请围绕${weak?.title || "今日薄弱点"}追问我一个关键问题`,
                        topic: "AI一键学习闭环"
                    })
                });
                await refreshAfterAiAction("intelligence");
                return toast("AI闭环已运行：诊断、路径、笔记、导师追问已联动");
            }
            if (feature === "diagnosis") {
                const result = await request("/api/app/diagnosis/submit", {
                    method: "POST",
                    body: JSON.stringify({
                        goal: weak?.title || "学机器学习",
                        preference: "dialogue+visual",
                        answers: [{ correct: 1 }, { correct: 0 }, { correct: 1 }, { correct: 1 }]
                    })
                });
                await refreshAfterAiAction("intelligence");
                return toast(`认知诊断完成：θ=${result.theta}`);
            }
            if (feature === "path" || feature === "review") {
                const result = await request("/api/app/plan/generate", { method: "POST", body: "{}" });
                await refreshAfterAiAction("path");
                return toast(
                    feature === "review" ? "已按遗忘曲线生成复习任务" : `AI已重排 ${result.generated} 个路径任务`
                );
            }
            if (feature === "practice") {
                await refreshAfterAiAction("exam");
                setTimeout(
                    () =>
                        document
                            .getElementById("daily-question")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
                    80
                );
                return toast("已进入薄弱点练习，答题后自动回写掌握度");
            }
            if (feature === "note") {
                await request("/api/app/notes/generate-card", {
                    method: "POST",
                    body: JSON.stringify({ text: weak?.summary || "生成一张主动回忆智能笔记卡。" })
                });
                await refreshAfterAiAction("intelligence");
                return toast("智能笔记卡已生成，并关联薄弱知识点");
            }
            if (feature === "feynman") {
                const result = await request("/api/app/feynman/review", {
                    method: "POST",
                    body: JSON.stringify({
                        explanation: `${weak?.title || "这个概念"}可以通过定义、例子和反例来解释，因为边界条件能暴露真正的理解缺口。`
                    })
                });
                await refreshAfterAiAction("intelligence");
                return toast(`费曼评估完成：清晰度 ${result.clarity}，准确度 ${result.accuracy}`);
            }
        } catch (error) {
            toast(error.message);
        } finally {
            el?.classList.remove("is-loading");
        }
    }

    async function runReportAction(action, el) {
        const topic =
            document.querySelector("[data-report-topic]")?.value?.trim() ||
            state.data.weakPoints[0]?.title ||
            "Python 循环与函数";
        state.data.reportActionLoading = action;
        el?.classList.add("is-loading");
        render();
        try {
            if (action === "resources") {
                const result = await request("/api/agent/resources/generate", {
                    method: "POST",
                    body: JSON.stringify({
                        knowledgePoint: topic,
                        types: ["document", "ppt", "quiz", "mindmap", "reading", "practice", "video"]
                    })
                });
                state.data.reportResourcePackage = result;
                toast(`已生成 ${result.resources?.length || 0} 类个性化资源`);
            }
            if (action === "ai-learning") {
                const [dashboard, bkt, adaptiveTest, learningPath, reviewSchedule, reviewMessage] = await Promise.all([
                    request("/api/ai-learning/dashboard"),
                    request("/api/ai-learning/bkt/estimate", {
                        method: "POST",
                        body: JSON.stringify({ nodeId: state.data.weakPoints[0]?.id || 1 })
                    }),
                    request("/api/ai-learning/adaptive/test", {
                        method: "POST",
                        body: JSON.stringify({ options: { count: 5 } })
                    }),
                    request("/api/ai-learning/learning-path", {
                        method: "POST",
                        body: JSON.stringify({ goal: `掌握 ${topic}` })
                    }),
                    request("/api/ai-learning/forgetting-curve"),
                    request("/api/ai-learning/forgetting-curve/message")
                ]);
                state.data.reportAiLearning = {
                    dashboard,
                    bkt,
                    adaptiveTest,
                    learningPath,
                    reviewSchedule,
                    reviewMessage
                };
                toast("AI学习增强已完成：诊断、BKT、自适应测试、路径和复习计划已汇总");
            }
            if (action === "demo-loop") {
                const result = await request("/api/ai-learning/demo-loop", {
                    method: "POST",
                    body: JSON.stringify({ goal: `围绕 ${topic} 完成个性化学习闭环` })
                });
                state.data.reportDemoLoop = result;
                toast("比赛演示闭环已生成");
            }
        } catch (error) {
            toast(error.message);
        } finally {
            state.data.reportActionLoading = "";
            el?.classList.remove("is-loading");
            render();
        }
    }

    /* 概念画布 - 全部操作（事件委托） */
    document.addEventListener("click", async e => {
        // 创建画布
        if (e.target.closest("[data-canvas-create]")) {
            const name = prompt("请输入画布名称：");
            if (!name) return;
            try {
                const json = await request("/api/concept-canvas", {
                    method: "POST",
                    body: JSON.stringify({ name, data: "[]" })
                });
                state.data._activeCanvas = { id: json.data.id, name, data: [] };
                render();
            } catch (e) {
                toast("创建失败");
            }
            return;
        }
        // 打开画布
        const card = e.target.closest("[data-canvas-open]");
        if (card && !e.target.closest("[data-canvas-delete]")) {
            const id = card.dataset.canvasOpen;
            try {
                const json = await request(`/api/concept-canvas/${id}`);
                state.data._activeCanvas = json.data;
                render();
            } catch (e) {
                toast("加载失败");
            }
            return;
        }
        // 删除画布
        const delBtn = e.target.closest("[data-canvas-delete]");
        if (delBtn) {
            e.stopPropagation();
            if (!confirm("确认删除此画布？")) return;
            try {
                await request(`/api/concept-canvas/${delBtn.dataset.canvasDelete}`, { method: "DELETE" });
                toast("已删除");
                const json = await request("/api/concept-canvas");
                state.data._canvases = json.data || [];
                render();
            } catch (e) {
                toast("删除失败");
            }
            return;
        }
        // 返回列表
        if (e.target.closest("[data-canvas-back]")) {
            state.data._activeCanvas = null;
            state.data._canvases = null;
            render();
            return;
        }
        // 保存画布
        if (e.target.closest("[data-canvas-save]")) {
            const nameEl = document.querySelector("[data-canvas-name]");
            const name = nameEl?.value || state.data._activeCanvas?.name || "未命名";
            state.data._activeCanvas.name = name;
            try {
                await request(`/api/concept-canvas/${state.data._activeCanvas.id}`, {
                    method: "PUT",
                    body: JSON.stringify({ name, data: JSON.stringify(state.data._activeCanvas.data || []) })
                });
                toast("已保存");
            } catch (e) {
                toast("保存失败");
            }
            return;
        }
        // 添加节点
        if (e.target.closest("[data-canvas-add-node]")) {
            const name = prompt("请输入节点名称：");
            if (!name) return;
            if (!state.data._activeCanvas.data) state.data._activeCanvas.data = [];
            if (!Array.isArray(state.data._activeCanvas.data)) state.data._activeCanvas.data = [];
            const count = state.data._activeCanvas.data.length;
            state.data._activeCanvas.data.push({
                id: Date.now(),
                name,
                x: 100 + count * 30,
                y: 100 + count * 30,
                type: "自定义"
            });
            render();
            return;
        }
        // 删除画布上的节点
        const nodeDelBtn = e.target.closest("[data-canvas-node-del]");
        if (nodeDelBtn) {
            e.stopPropagation();
            const nodeId = Number(nodeDelBtn.dataset.canvasNodeDel);
            if (state.data._activeCanvas && state.data._activeCanvas.data) {
                state.data._activeCanvas.data = state.data._activeCanvas.data.filter(n => n.id !== nodeId);
                render();
            }
            return;
        }
        // ========== Obsidian 知识库事件 ==========
        // 同步到RAG
        if (e.target.closest("[data-obsidian-sync]")) {
            try {
                await request("/api/obsidian/sync-rag", { method: "POST" });
                toast("已同步 Obsidian 到 RAG 知识库");
            } catch (err) {
                toast("同步失败: " + err.message);
            }
            return;
        }
        // 刷新索引
        if (e.target.closest("[data-obsidian-refresh]")) {
            state.data.obsidianKB = null;
            await loadObsidianKB(true);
            toast("索引已刷新");
            render();
            return;
        }
        // 切换标签
        const obsTab = e.target.closest("[data-obsidian-tab]");
        if (obsTab) {
            state.data.obsidianTab = obsTab.dataset.obsidianTab;
            state.data.obsidianActiveNote = null;
            render();
            return;
        }
        // 切换文件夹
        const obsFolder = e.target.closest("[data-obsidian-folder]");
        if (obsFolder) {
            state.data.obsidianActiveFolder = obsFolder.dataset.obsidianFolder;
            render();
            return;
        }
        // 打开笔记
        const obsNote = e.target.closest("[data-obsidian-note]");
        if (obsNote) {
            loadObsidianNote(obsNote.dataset.obsidianNote);
            return;
        }
        // 关闭笔记详情
        if (e.target.closest("[data-obsidian-close-note]")) {
            state.data.obsidianActiveNote = null;
            render();
            return;
        }
        // 搜索输入
        const obsSearch = e.target.closest("[data-obsidian-search]");
        if (obsSearch) {
            return;
        } // handled by input event
        // 加载题库
        if (e.target.closest("[data-obsidian-load-questions]")) {
            try {
                const json = await request("/api/obsidian/status");
                const container = document.getElementById("obsidian-questions-container");
                if (container) {
                    const d = json.data;
                    container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;text-align:left;">
                            <div class="vault-metric"><div class="vault-metric-icon purple">${icon("file-text", 20)}</div><div><div class="vault-metric-label">题库文件</div><div class="vault-metric-value">${d.files || 0}<span> 个</span></div></div></div>
                            <div class="vault-metric"><div class="vault-metric-icon teal">${icon("exam", 20)}</div><div><div class="vault-metric-label">题目总数</div><div class="vault-metric-value">${d.questions || 0}<span> 道</span></div></div></div>
                            <div class="vault-metric"><div class="vault-metric-icon amber">${icon("book", 20)}</div><div><div class="vault-metric-label">覆盖学科</div><div class="vault-metric-value">${(d.subjects || []).length}<span> 门</span></div></div></div>
                        </div>`;
                    if (d.sample && d.sample.length > 0) {
                        container.innerHTML += `<div style="margin-top:16px;text-align:left;">${d.sample
                            .map(
                                (q, i) => `
                                <div class="vault-question-item">
                                    <div class="vault-q-header"><div class="vault-q-number">${i + 1}</div><span class="vault-q-title">${escapeHtml(q.knowledgePoint || q.subject)}</span></div>
                                    <div class="vault-q-content">${escapeHtml(q.question || "")}</div>
                                </div>`
                            )
                            .join("")}</div>`;
                    }
                }
            } catch (e) {
                toast("加载题库失败: " + e.message);
            }
            return;
        }

        // ========== RAG 检索事件 ==========
        // 发送查询
        if (e.target.closest("[data-rag-send]")) {
            sendRagQuery();
            return;
        }
        // 建议问题
        const ragSug = e.target.closest("[data-rag-suggestion]");
        if (ragSug) {
            state.data.ragSearchQuery = ragSug.dataset.ragSuggestion;
            sendRagQuery();
            return;
        }
        // 加入学习列表
        const ragAddLearn = e.target.closest("[data-rag-add-learning]");
        if (ragAddLearn) {
            addRagToLearning(ragAddLearn.dataset.ragAddLearning, state.data.ragSearchQuery || "");
            return;
        }

        // ========== Agent 学习中心事件 ==========
        // 初始化学习画像
        if (e.target.closest("[data-agent-init]")) {
            loadAgentStatus();
            return;
        }
        // 生成学习计划
        if (e.target.closest("[data-agent-plan]")) {
            generateAgentPlan();
            return;
        }
        // 清除记录
        if (e.target.closest("[data-agent-clear]")) {
            state.data.agentStatus = null;
            state.data.agentPlan = null;
            state.data.agentReasoningLog = [];
            render();
            return;
        }

        // ========== 智能诊断事件 ==========
        // CAT自适应测试启动
        if (e.target.closest("[data-cat-start]")) {
            startCatTest();
            return;
        }
        // CAT提交答案
        if (e.target.closest("[data-cat-submit]")) {
            submitCatAnswer();
            return;
        }
        // CAT跳过题目
        if (e.target.closest("[data-cat-skip]")) {
            skipCatQuestion();
            return;
        }
        // VARK选项选择
        const varkOpt = e.target.closest("[data-vark-option]");
        if (varkOpt) {
            selectVarkOption(varkOpt.dataset.question, varkOpt.dataset.value);
            return;
        }
        // VARK下一页
        if (e.target.closest("[data-vark-next]")) {
            nextVarkSection();
            return;
        }
        // VARK上一页
        if (e.target.closest("[data-vark-prev]")) {
            prevVarkSection();
            return;
        }
        // 加载智能报告
        if (e.target.closest("[data-load-smart-report]")) {
            loadSmartReport();
            return;
        }
        // 加载知识追踪
        if (e.target.closest("[data-load-knowledge]")) {
            loadKnowledgeMastery();
            return;
        }
        // 加载认知画像
        if (e.target.closest("[data-load-cognitive]")) {
            loadCognitiveProfile();
            return;
        }
        // 加载误区检测
        if (e.target.closest("[data-load-misconceptions]")) {
            loadMisconceptions();
            return;
        }
    });
    /* 概念画布 - 搜索（事件委托） */
    document.addEventListener("input", async e => {
        if (!e.target.matches("[data-canvas-search]")) return;
        const q = e.target.value.trim();
        state.data._canvasSearchQuery = q;
        if (q.length < 2) {
            state.data._canvasSearchResults = [];
            render();
            return;
        }
        try {
            const json = await request(`/api/concept-canvas/elements/search?q=${encodeURIComponent(q)}`);
            state.data._canvasSearchResults = json.data || [];
            render();
        } catch (e) {}
    });
    /* Obsidian 搜索（防抖） */
    let _obsSearchTimer = null;
    document.addEventListener("input", async e => {
        if (!e.target.matches("[data-obsidian-search]")) return;
        clearTimeout(_obsSearchTimer);
        const val = e.target.value;
        _obsSearchTimer = setTimeout(() => searchObsidian(val), 400);
    });
    /* RAG 输入更新 */
    document.addEventListener("input", async e => {
        if (!e.target.matches("[data-rag-input]")) return;
        state.data.ragSearchQuery = e.target.value;
    });
    /* 概念画布 - 拖拽放置搜索结果到画布 */
    document.addEventListener("dragover", e => {
        const canvasMain = e.target.closest("[data-canvas-main]");
        if (!canvasMain) return;
        e.preventDefault();
        canvasMain.classList.add("drag-over");
    });
    document.addEventListener("dragleave", e => {
        const canvasMain = e.target.closest("[data-canvas-main]");
        if (!canvasMain) return;
        canvasMain.classList.remove("drag-over");
    });
    document.addEventListener("drop", async e => {
        const canvasMain = e.target.closest("[data-canvas-main]");
        if (!canvasMain) return;
        e.preventDefault();
        canvasMain.classList.remove("drag-over");
        // Get dragged item data
        const dragItem = document.querySelector("[data-canvas-drag-item].dragging");
        if (!dragItem) return;
        let itemData;
        try {
            itemData = JSON.parse(dragItem.dataset.canvasDragItem);
        } catch (e) {
            return;
        }
        if (!itemData) return;
        // Calculate drop position relative to canvas
        const rect = canvasMain.getBoundingClientRect();
        const x = e.clientX - rect.left - 60;
        const y = e.clientY - rect.top - 30;
        if (!state.data._activeCanvas.data) state.data._activeCanvas.data = [];
        if (!Array.isArray(state.data._activeCanvas.data)) state.data._activeCanvas.data = [];
        state.data._activeCanvas.data.push({
            id: Date.now(),
            name: itemData.name,
            type: itemData.type === "note" ? "笔记" : "知识点",
            x: Math.max(0, x),
            y: Math.max(0, y)
        });
        render();
    });
    /* 概念画布 - 搜索item拖拽开始 */
    document.addEventListener("dragstart", e => {
        const item = e.target.closest("[data-canvas-drag-item]");
        if (item) {
            item.classList.add("dragging");
            e.dataTransfer.setData("text/plain", item.dataset.canvasDragItem);
            e.dataTransfer.effectAllowed = "copy";
        }
        // 画布节点拖拽移动
        const node = e.target.closest("[data-canvas-node-drag]");
        if (node && !e.target.closest("[data-canvas-node-del]")) {
            node.classList.add("dragging");
            e.dataTransfer.setData("text/plain", node.dataset.canvasNodeId);
            e.dataTransfer.effectAllowed = "move";
        }
    });
    document.addEventListener("dragend", e => {
        document.querySelectorAll("[data-canvas-drag-item].dragging").forEach(el => el.classList.remove("dragging"));
        document.querySelectorAll("[data-canvas-node-drag].dragging").forEach(el => el.classList.remove("dragging"));
        // Handle node reposition
        const canvasMain = document.querySelector("[data-canvas-main]");
        if (!canvasMain || !state.data._activeCanvas || !state.data._activeCanvas.data) return;
        const canvasRect = canvasMain.getBoundingClientRect();
        const nodeId = Number(e.dataTransfer.getData("text/plain"));
        if (!nodeId) return;
        const targetNode = state.data._activeCanvas.data.find(n => n.id === nodeId);
        if (!targetNode) return;
        const newX = Math.max(0, e.clientX - canvasRect.left - 60);
        const newY = Math.max(0, e.clientY - canvasRect.top - 30);
        targetNode.x = newX;
        targetNode.y = newY;
        render();
    });
    async function refreshAfterAiAction(view) {
        state.loaded = false;
        state.data.intelligence = null;
        state.view = view;
        history.pushState({}, "", view === "home" ? "/home" : `/${view}`);
        await loadData(true);
        if (view === "intelligence") await loadIntelligence(true);
        render();
    }

    function teamCodeCodexView() {
        const summary = state.data.teamCodeSummary || { projects: [], roles: [] };
        const detail = state.data.teamCodeProject;
        const project = detail?.project;
        const projects = summary.projects || [];
        const files = repoDisplayFiles(detail?.files || []);
        const members = detail?.members || [];
        const commits = detail?.commits || [];
        const events = detail?.events || [];
        const requirements = detail?.requirements || [];
        const moduleStats = detail?.moduleStats || summary.roles || [];
        const repoHealth = detail?.repoHealth || {};
        const review = state.data.teamCodeReview;
        const activeRole = state.data.teamCodeActiveRole || state.data.teamCodeModule || "frontend";
        const activeFile =
            state.data.teamCodeActiveFile || files.find(file => file.module_key === activeRole) || files[0];
        const source = state.data.teamCodeSource || activeFile?.content || "";
        const codeLines = source.split(/\r?\n/).slice(0, 26);
        const repoCurrentPath = state.data.teamCodeRepoPath || "";
        const repoRows = repoFolderRows(files, repoCurrentPath);
        const score = Number(repoHealth.reviewScore || review?.score || 0);
        const pipeline = state.data.teamCodePipeline;
        const readmeFile = repoReadmeFile(files);
        const repoCommands = repoCloneCommands(project);
        const toolLog = state.data.teamCodeToolLog || "等待团队项目动作";
        const codexPanel = state.data.teamCodeScreen || "home";
        const externalTools = [
            ["vscode", "VS Code", "code"],
            ["visualstudio", "Visual Studio", "layers"],
            ["explorer", "File Explorer", "folder"],
            ["terminal", "Terminal", "terminal"],
            ["gitbash", "Git Bash", "git"],
            ["idea", "IntelliJ IDEA", "settings"],
            ["pycharm", "PyCharm", "terminal"]
        ];
        const roleKeys = ["frontend", "backend", "testing", "deployment"];
        const roleMeta = {
            frontend: ["layout", "前端", "页面、交互、组件、接口联调"],
            backend: ["server", "后端", "接口、数据、权限、业务逻辑"],
            testing: ["check", "测试", "用例、缺陷、回归、验收"],
            deployment: ["cloud", "部署", "环境、日志、发布、演示"]
        };
        if (!project) {
            return `<main class="team-codex-app team-project-workspace">
                <aside class="team-codex-sidebar">
                    <div class="team-sidebar-brand">${logo()}<span>团队项目开发</span></div>
                    <div class="team-codex-side-action">${icon("plus", 17)}创建项目</div>
                    <div class="team-codex-side-group"><span>项目空间</span><div class="team-codex-project-root">${icon("folder", 16)}edusmart-rebuild</div></div>
                </aside>
                <section class="team-codex-empty">
                    <div class="team-codex-mark">${icon("code", 44)}</div>
                    <h1>创建团队项目开发空间</h1>
                    <p>创建后会生成代码仓库、岗位分工、需求说明书、日志和 AI 审查工作台。</p>
                    <button class="btn primary" data-team-demo>${icon("plus", 16)}创建团队项目</button>
                </section>
            </main>`;
        }

        const mainPanelHtml = (() => {
            if (codexPanel === "repo")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("folder", 20)}代码仓库</h2><label class="btn ghost"><input type="file" multiple data-team-code-upload style="display:none">${icon("upload", 15)}上传代码</label></div>
                <div class="team-main-command"><code>${escapeHtml(repoCommands.clone)}</code><button data-team-clone-copy>${icon("copy", 14)}复制 Clone</button></div>
                <div class="team-main-tree">
                    ${repoCurrentPath ? `<button data-team-repo-folder="${escapeAttr(repoCurrentPath.split("/").slice(0, -1).join("/") || "")}">${icon("folder", 15)}..</button>` : ""}
                    ${
                        repoRows.length
                            ? repoRows
                                  .map(row =>
                                      row.type === "folder"
                                          ? `<button data-team-repo-folder="${escapeAttr(row.path)}">${icon("folder", 15)}<b>${escapeHtml(row.name)}</b><small>目录</small></button>`
                                          : `<button class="${activeFile && Number(activeFile.id) === Number(row.id) ? "active" : ""}" data-team-file="${row.id}" data-team-screen="code">${fileIcon(row.name || row.path)}<b>${escapeHtml(row.name || row.path)}</b><small>${teamRoleName(row.module_key)} · ${formatDate(row.updated_at)}</small></button>`
                                  )
                                  .join("")
                            : `<p>暂无文件，上传代码后显示仓库目录。</p>`
                    }
                </div>
            </section>`;
            if (codexPanel === "code")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${fileIcon(activeFile?.path || "README.md")}代码查看与编辑</h2><button class="btn primary" data-team-save ${state.data.teamCodeLoading ? "disabled" : ""}>${icon("save", 15)}保存同步</button></div>
                <div class="team-main-codebar"><span>${escapeHtml(activeFile?.path || state.data.teamCodePath || "未选择文件")}</span><small>${escapeHtml(activeFile?.language || "markdown")}</small></div>
                <textarea class="team-main-editor" data-team-source spellcheck="false" placeholder="// 从左侧代码仓库选择文件">${escapeHtml(source)}</textarea>
                <div class="team-main-actions"><input class="input" data-team-message value="${escapeHtml(state.data.teamCodeMessage || "同步代码修改")}" placeholder="提交说明"><button class="btn ghost" data-team-ai-review>${icon("search", 15)}审查当前文件</button></div>
            </section>`;
            if (codexPanel === "review")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("search", 20)}代码审查</h2><button class="btn primary" data-team-ai-pipeline="full">${icon("play", 15)}运行全流程审查</button></div>
                <div class="team-main-review">
                    <div><span>代码质量</span><b>${score ? `${score}分` : "待审查"}</b></div>
                    <div><span>需求对齐</span><b>${requirements.length} 张卡片</b></div>
                    <div><span>当前岗位</span><b>${teamRoleName(activeRole)}</b></div>
                </div>
                <article class="team-main-note">${escapeHtml(review?.summary || "选择代码文件后运行审查，系统会生成质量评分、风险项、测试建议和修复方向。")}</article>
                ${review?.findings?.length ? `<ul class="team-main-list">${review.findings.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
                ${pipeline ? `<pre class="team-main-pre">${escapeHtml(pipeline.report || pipeline.modelComment || JSON.stringify(pipeline, null, 2))}</pre>` : ""}
            </section>`;
            if (codexPanel === "docs")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("file-text", 20)}项目文档</h2><label class="btn primary"><input type="file" multiple accept=".md,.txt,.doc,.docx,.pdf" data-team-doc-upload style="display:none">${icon("upload", 15)}上传说明书</label></div>
                <div class="team-main-doc">${readmeFile ? renderMarkdownLite(readmeFile.content || "") : "<p>暂无说明书。上传需求分析、接口说明、测试说明或部署说明后，会显示在这里。</p>"}</div>
            </section>`;
            if (codexPanel === "tools")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("external-link", 20)}外部开发工具</h2><small>浏览器页面仅能通过协议或命令提示唤起本地工具</small></div>
                <article class="team-main-note">Codex 桌面端能直接打开 IDE，是因为它运行在本机并拥有工作区权限。当前团队项目运行在浏览器中，不能直接启动系统程序；代码查看和编辑仍在本页面完成，外部工具用于复制 Clone 命令、尝试协议打开，或提示你用本地 IDE/终端打开导出的项目。</article>
                <div class="team-tool-grid">
                    ${externalTools
                        .map(
                            ([key, name, ic]) => `<button data-team-ide="${key}">
                        <span>${icon(ic, 24)}</span>
                        <b>${escapeHtml(name)}</b>
                        <small>${key === "explorer" ? "导出后在本地打开" : key === "terminal" || key === "gitbash" ? "显示命令提示" : "尝试协议唤起"}</small>
                    </button>`
                        )
                        .join("")}
                </div>
            </section>`;
            if (codexPanel === "logs")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("history", 20)}过程日志</h2><small>${commits.length + events.length} 条记录</small></div>
                <div class="team-main-logs">${
                    (events.length ? events : commits)
                        .slice(0, 20)
                        .map(
                            item =>
                                `<div><b>${escapeHtml(item.title || item.message || "代码同步")}</b><span>${escapeHtml(item.detail || item.path || "")}</span><small>${formatDate(item.created_at)}</small></div>`
                        )
                        .join("") || "<p>暂无日志。</p>"
                }</div>
                <pre class="team-main-pre">${escapeHtml(toolLog)}</pre>
            </section>`;
            if (codexPanel === "people")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("users", 20)}人员分工</h2><small>${members.length || roleKeys.length} 个岗位</small></div>
                <div class="team-people-grid">
                    ${roleKeys
                        .map(key => {
                            const meta = roleMeta[key];
                            const stat = moduleStats.find(item => item.roleKey === key) || {};
                            const member = members.find(item => item.role_key === key);
                            return `<article>
                            <span>${icon(meta[0], 22)}</span>
                            <h3>${escapeHtml(meta[1])}</h3>
                            <b>${escapeHtml(member?.full_name || member?.username || "待分配")}</b>
                            <p>${escapeHtml(meta[2])}</p>
                            <small>${Number(stat.fileCount || 0)} 个文件 · ${Number(stat.commitCount || 0)} 次提交</small>
                            <button class="btn tiny ghost" data-team-role="${key}" data-team-screen="code">${icon("code", 12)}查看代码</button>
                        </article>`;
                        })
                        .join("")}
                </div>
            </section>`;
            if (codexPanel === "requirements")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("target", 20)}代码功能需求卡片</h2><label class="btn primary"><input type="file" multiple accept=".md,.txt,.doc,.docx,.pdf" data-team-doc-upload style="display:none">${icon("upload", 15)}上传说明书</label></div>
                <div class="team-requirement-board">
                    ${
                        requirements.length
                            ? requirements
                                  .map(
                                      item => `<article class="${escapeHtml(item.status)}">
                        <div><span>${escapeHtml(item.priority || "P1")}</span><b>${requirementStatusName(item.status)}</b></div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.acceptance || "")}</p>
                        <footer><small>${teamRoleName(item.moduleKey)}</small><button class="btn tiny ghost" data-team-role="${escapeAttr(item.moduleKey)}">${icon("arrow-right", 12)}进入模块</button></footer>
                    </article>`
                                  )
                                  .join("")
                            : `<p>暂无需求卡片。上传需求分析说明书后，会按前端、后端、测试、部署拆分功能需求。</p>`
                    }
                </div>
            </section>`;
            if (codexPanel === "modules")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("layers", 20)}模块开发卡片</h2><small>按开发颗粒度查看进度</small></div>
                <div class="team-module-board">
                    ${roleKeys
                        .map(key => {
                            const meta = roleMeta[key];
                            const stat = moduleStats.find(item => item.roleKey === key) || {};
                            const percent = Math.min(
                                100,
                                24 + Number(stat.fileCount || 0) * 18 + Number(stat.commitCount || 0) * 10
                            );
                            return `<article data-team-role="${key}">
                            <div><span>${icon(meta[0], 20)}</span><b>${percent}%</b></div>
                            <h3>${escapeHtml(meta[1])}模块</h3>
                            <p>${escapeHtml(meta[2])}</p>
                            <div class="team-module-progress"><i style="width:${percent}%"></i></div>
                            <footer><small>${Number(stat.fileCount || 0)} 文件 · ${Number(stat.commitCount || 0)} 提交</small><button class="btn tiny ghost" data-team-role="${key}" data-team-screen="code">打开</button></footer>
                        </article>`;
                        })
                        .join("")}
                </div>
            </section>`;
            if (codexPanel === "collab")
                return `<section class="team-main-panel">
                <div class="team-main-head"><h2>${icon("message", 20)}协作开发</h2><small>围绕需求、代码、审查和日志协同</small></div>
                <div class="team-collab-grid">
                    <article><span>${icon("file-text", 20)}</span><h3>说明书协作</h3><p>上传需求分析、接口说明、测试说明或部署说明，作为团队共同上下文。</p><label class="btn tiny primary"><input type="file" multiple accept=".md,.txt,.doc,.docx,.pdf" data-team-doc-upload style="display:none">上传说明书</label></article>
                    <article><span>${icon("upload", 20)}</span><h3>代码协作</h3><p>按模块上传代码文件，系统会写入仓库并生成提交日志。</p><label class="btn tiny primary"><input type="file" multiple data-team-code-upload style="display:none">上传代码</label></article>
                    <article><span>${icon("search", 20)}</span><h3>统一审查</h3><p>对当前文件运行 AI 审查，沉淀风险项、测试建议和修复方向。</p><button class="btn tiny primary" data-team-ai-review>审查当前文件</button></article>
                    <article><span>${icon("play", 20)}</span><h3>流水线协作</h3><p>运行审查、测试和修正建议，把协作结果写入项目记录。</p><button class="btn tiny primary" data-team-ai-pipeline="full">运行流水线</button></article>
                </div>
            </section>`;
            return `<section class="team-home-empty">
                <span class="team-home-eyebrow">${icon("folder", 15)}团队项目空间</span>
                <h2>选择左侧功能开始查看</h2>
                <p>首页保持干净，所有功能已整理到左侧导航栏。点击代码仓库、项目文档、代码审查、外部工具或过程日志后，会在中间完整显示。</p>
                <div class="team-home-actions">
                    <button data-team-screen="repo">${icon("folder", 18)}代码仓库<small>查看目录与源码</small></button>
                    <button data-team-screen="docs">${icon("file-text", 18)}项目文档<small>上传需求说明书</small></button>
                    <button data-team-screen="people">${icon("users", 18)}人员分工<small>查看成员职责</small></button>
                    <button data-team-screen="requirements">${icon("target", 18)}功能需求<small>查看需求卡片</small></button>
                    <button data-team-screen="modules">${icon("layers", 18)}模块开发<small>查看模块进度</small></button>
                    <button data-team-screen="collab">${icon("message", 18)}协作开发<small>上传、审查、流水线</small></button>
                    <button data-team-screen="review">${icon("search", 18)}代码审查<small>统一审查与评分</small></button>
                    <button data-team-screen="tools">${icon("external-link", 18)}外部工具<small>IDE / 终端 / Git</small></button>
                    <button data-team-screen="logs">${icon("history", 18)}过程日志<small>查看提交记录</small></button>
                    <button data-team-screen="code">${icon("code", 18)}代码编辑<small>打开编辑器</small></button>
                </div>
            </section>`;
        })();

        return `<main class="team-codex-app team-project-workspace team-codex-single">
            <aside class="team-codex-sidebar">
                <div class="team-sidebar-brand">${logo()}<span>团队项目开发</span></div>
                <button class="team-codex-side-action" data-team-create>${icon("plus", 17)}新建项目</button>
                <button class="team-codex-side-action ghost ${codexPanel === "home" ? "active" : ""}" data-team-screen="home">${icon("home", 17)}项目首页</button>
                <button class="team-codex-side-action ghost ${codexPanel === "repo" ? "active" : ""}" data-team-screen="repo">${icon("folder", 17)}代码仓库</button>
                <button class="team-codex-side-action ghost ${codexPanel === "docs" ? "active" : ""}" data-team-screen="docs">${icon("file-text", 17)}项目文档</button>
                <button class="team-codex-side-action ghost ${codexPanel === "people" ? "active" : ""}" data-team-screen="people">${icon("users", 17)}人员分工</button>
                <button class="team-codex-side-action ghost ${codexPanel === "requirements" ? "active" : ""}" data-team-screen="requirements">${icon("target", 17)}功能需求</button>
                <button class="team-codex-side-action ghost ${codexPanel === "modules" ? "active" : ""}" data-team-screen="modules">${icon("layers", 17)}模块开发</button>
                <button class="team-codex-side-action ghost ${codexPanel === "collab" ? "active" : ""}" data-team-screen="collab">${icon("message", 17)}协作开发</button>
                <button class="team-codex-side-action ghost ${codexPanel === "review" ? "active" : ""}" data-team-screen="review">${icon("search", 17)}代码审查</button>
                <button class="team-codex-side-action ghost ${codexPanel === "tools" ? "active" : ""}" data-team-screen="tools">${icon("external-link", 17)}外部工具</button>
                <button class="team-codex-side-action ghost ${codexPanel === "logs" ? "active" : ""}" data-team-screen="logs">${icon("history", 17)}过程日志</button>
            </aside>

            <section class="team-codex-chat">
                <header class="team-codex-titlebar">
                    <div>
                        <b>${escapeHtml(project.name)}</b>
                        <span>${escapeHtml(project.description || "团队项目研发协作台")}</span>
                    </div>
                    <div class="team-codex-title-actions">
                        <button class="plain" title="运行全流程审查" data-team-ai-pipeline="full">${icon("play", 18)}</button>
                        <label class="ide-pill" title="上传需求说明书"><input type="file" multiple accept=".md,.txt,.doc,.docx,.pdf" data-team-doc-upload style="display:none"><span class="ide-logo">DOC</span>${icon("chevron", 13)}</label>
                        <button title="外部工具" data-team-screen="tools">${icon("external-link", 18)}</button>
                        <button class="active" title="项目概览">${icon("info", 18)}</button>
                        <button title="工作面板" data-team-screen="code">${icon("sidebar", 18)}</button>
                    </div>
                </header>

                <div class="team-codex-prompt">${mainPanelHtml}</div>

                <div class="team-codex-inputbar">
                    <span>${icon("plus", 18)}</span>
                    <input value="继续完善团队项目：生成审查建议、测试任务和提交日志" aria-label="任务输入">
                    <button data-team-ai-pipeline="full">${icon("send", 17)}</button>
                </div>
            </section>

        </main>`;
    }

    async function render() {
        const app = document.getElementById("app");
        if (
            location.pathname.toLowerCase().includes("rag-search") ||
            location.pathname.toLowerCase().includes("ragsearch")
        ) {
            state.view = "ragSearch";
        } else if (location.pathname.toLowerCase().includes("rag")) {
            state.view = "aiAssistant";
            state.data.aiAssistantMode = "rag";
        }
        const isLogin = location.pathname === "/" || location.pathname.endsWith("/index.html");
        if (isLogin) {
            app.innerHTML = loginView();
            bindEvents();
            return;
        }
        const guardedView = guardOnboardingView(state.view, false);
        if (guardedView !== state.view) {
            state.view = guardedView;
            history.replaceState({}, "", "/home");
            setTimeout(() => toast(onboardingBlockedMessage()), 80);
        }
        try {
            await loadData();
            await loadSystemConfig();
            loadUnreadCount();
            const user = readUser();
            state.data._studentLocked = false;
            if (user.role !== "teacher" && user.role !== "admin" && state.view !== "teacherWorkbench") {
                const activePath = await loadStudentActivePath();
                state.data._studentLocked = !!(activePath && activePath.active);
            }
            if (state.data._studentLocked && state.data.studentActivePath?.assignmentId) {
                const activePath = state.data.studentActivePath;
                await loadPathNotes(activePath.assignmentId);
            }
            if (state.view === "intelligence") {
                await loadIntelligence();
                await loadXfyunCapabilities();
            }
            if (state.view === "studyPlan") await loadStudyPlan();
            if (state.view === "aiAssistant") {
                await loadAiAssistant();
                await loadAiConfig();
                await loadIntelligence();
            }
            if (state.view === "agentResearch") await loadAiConfig();
            if (user.role !== "teacher" && user.role !== "admin") await loadStudentPathDashboard();
            if (state.view === "teamCode") {
                await loadTeamCodeSummary();
                if (state.data.teamCodeActiveProjectId) {
                    await loadTeamCodeProject(state.data.teamCodeActiveProjectId);
                }
            }
            if (state.view === "smartNotes") await loadNotesCenter();
            // 路径页不再自动加载规则路径；只有点击 Agent 个性化生成后才读取 path/center。
            if (state.view === "profile") await loadProfileInsight();
            if (state.view === "conceptCanvas" && !state.data._canvases) {
                try {
                    const json = await request("/api/concept-canvas");
                    state.data._canvases = json.data || [];
                } catch (e) {}
            }
            if (state.view === "knowledgeGraph" && !state.data.knowledgeGraph) {
                try {
                    const json = await request("/api/knowledge-graph");
                    state.data.knowledgeGraph = json.data || { nodes: [], edges: [] };
                } catch (e) {}
            }
            // 为知识图谱准备笔记下拉列表
            if (state.view === "knowledgeGraph" && state.data.knowledgeGraph) {
                const graphData = state.data.knowledgeGraph;
                graphData._notesForSelect = (graphData.nodes || [])
                    .filter(n => String(n.id).startsWith("note-"))
                    .map(n => ({ id: Number(String(n.id).replace("note-", "")), title: n.label }));
            }
            if (state.view === "diagnostic") {
                await loadDiagnosticResult();
                if (state.data.diagnosticMode === "questionnaire") await loadDiagnosticQuestionnaire();
                if (state.data.diagnosticMode === "subject" && !state.data.diagnosticSubjects)
                    await loadDiagnosticSubjects();
            }
            if (state.view === "test") await loadSubjects();
            if (["practice", "test", "onlineExam"].includes(state.view)) await loadQuestionSet(state.view);
            if (state.view === "account") await loadAccount();
            if (state.view === "teacherWorkbench") {
                await loadTeacherDashboard();
                const teacherTab = state.data.teacherTab || "overview";
                if (teacherTab === "students" || teacherTab === "progress") await loadTeacherSubjects();
                if (["students", "progress"].includes(teacherTab)) {
                    await loadTeacherStudents({ search: state.data._teacherSearch || "" });
                }
                if (teacherTab === "assignments") {
                    await loadTeacherSubjects();
                    await loadTeacherAssignments();
                }
                if (teacherTab === "exams") {
                    await loadTeacherExamsList();
                }
                if (teacherTab === "notes") {
                    await loadTeacherSubjects();
                    await loadTeacherNotes();
                }
                if (teacherTab === "paths") {
                    await loadTeacherSubjects();
                    await loadTeacherPaths();
                }
                if (teacherTab === "knowledge-graph") {
                    await loadTeacherKnowledgeGraph();
                }
            }
            if (["resources", "tutorials", "problems", "videos"].includes(state.view)) {
                if (state.view === "resources") {
                    await loadResources(state.data.resourceFilter);
                    await loadResourceCategories();
                }
                if (state.view === "problems") {
                    await loadProblems(state.data.problemFilter);
                }
            }
            if (state.view === "obsidian") await loadObsidianKB();
            if (state.view === "ragSearch") await loadRagOverview();
            const views = {
                home: homeView,
                studyPlan: studyPlanView,
                profile: profileView,
                profileCognitive: profileCognitiveView,
                profileKnowledge: profileKnowledgeView,
                profileMisconceptions: profileMisconceptionsView,
                diagnostic: diagnosticView,
                diagnosticCat: diagnosticCatView,
                diagnosticVark: diagnosticVarkView,
                diagnosticReport: diagnosticReportView,
                report: reportView,
                exam: examView,
                practice: () => assessmentView("practice"),
                test: () => assessmentView("test"),
                onlineExam: () => assessmentView("onlineExam"),
                smartNotes: smartNotesView,
                knowledgeGraph: knowledgeGraphView,
                conceptCanvas: conceptCanvasView,
                account: accountView,
                teacherWorkbench: teacherWorkbenchView,
                path: pathView,
                asset: assetView,
                course: courseView,
                intelligence: intelligenceView,
                aiAssistant: aiAssistantView,
                agentResearch: agentResearchView,
                codeLab: codeLabView,
                teamCode: teamCodeCodexView,
                resources: resourcesView,
                tutorials: tutorialsView,
                problems: problemsView,
                videos: videosView,
                studentPath: studentPathView,
                obsidian: obsidianView,
                ragSearch: ragSearchView,
                agentCenter: agentCenterView
            };
            const assessmentViews = { practice: "practice", test: "test", onlineExam: "onlineExam" };
            const activeAssessmentMode = assessmentViews[state.view];
            const activeAssessmentSubject = activeAssessmentMode ? assessmentSubject(activeAssessmentMode) : "";
            const activeAssessmentSet = activeAssessmentMode
                ? state.data.questionSets[`${activeAssessmentMode}:${activeAssessmentSubject}`] || {}
                : {};
            const focusAssessment =
                activeAssessmentMode &&
                state.data.assessmentStarted[activeAssessmentMode] &&
                !activeAssessmentSet.result;
            if (state.view === "studentPath") state.view = "home";
            const pageHtml = (views[state.view] || homeView)();
            const guideHtml = teacherPathInlineGuide(state.view);
            app.innerHTML = focusAssessment
                ? `<div class="exam-shell">${guideHtml}${pageHtml}</div>`
                : `<div class="shell">${topbar()}${guideHtml}${pageHtml}${assistantFloat()}</div>`;
            bindEvents();
            syncAssessmentClock();
        } catch (e) {
            console.error("Render:", e);
        }
    }

    window.addEventListener("popstate", () => {
        state.view = routeToView(location.pathname);
        render();
    });

    document.addEventListener("DOMContentLoaded", render);

    // ========== 智能诊断 API 调用函数 ==========

    async function startCatTest() {
        try {
            const json = await request("/api/diagnostic/smart-start", { method: "POST", body: JSON.stringify({}) });
            state.data.smartDiagnostic = {
                sessionActive: true,
                questionsAnswered: 0,
                ability: 0,
                abilitySE: 2.0,
                progress: 0,
                recentAccuracy: 0,
                shouldContinue: true,
                currentQuestion: json.data.question,
                responses: []
            };
            render();
        } catch (e) {
            toast("启动测试失败: " + e.message);
        }
    }

    async function submitCatAnswer() {
        const question = state.data.smartDiagnostic.currentQuestion;
        if (!question) return;

        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) {
            toast("请选择一个答案");
            return;
        }

        const isCorrect = selectedOption.value === String(question.correctIndex);

        try {
            const json = await request("/api/diagnostic/smart-submit-answer", {
                method: "POST",
                body: JSON.stringify({
                    questionId: question.id,
                    isCorrect,
                    timeMs: 0
                })
            });

            const diag = state.data.smartDiagnostic;
            diag.questionsAnswered++;
            diag.ability = json.data.ability;
            diag.abilitySE = json.data.abilitySE;
            diag.progress = json.data.progress;
            diag.recentAccuracy = json.data.recentAccuracy || diag.recentAccuracy;
            diag.shouldContinue = json.data.shouldContinue;
            diag.responses.push({ questionId: question.id, isCorrect });

            if (json.data.finished) {
                await loadSmartReport();
                state.view = "diagnosticReport";
                history.pushState({}, "", "/diagnostic/report");
                render();
                return;
            }

            const nextQuestion = await request("/api/diagnostic/smart-next-question", { method: "POST" });
            diag.currentQuestion = nextQuestion.data.question;
            render();
        } catch (e) {
            toast("提交失败: " + e.message);
        }
    }

    async function skipCatQuestion() {
        const question = state.data.smartDiagnostic.currentQuestion;
        if (!question) return;

        try {
            const diag = state.data.smartDiagnostic;
            diag.questionsAnswered++;
            diag.responses.push({ questionId: question.id, isCorrect: false });

            const nextQuestion = await request("/api/diagnostic/smart-next-question", { method: "POST" });
            diag.currentQuestion = nextQuestion.data.question;
            render();
        } catch (e) {
            toast("跳过失败: " + e.message);
        }
    }

    async function loadVarkQuestionnaire() {
        try {
            const json = await request("/api/diagnostic/vark-questionnaire");
            state.data.varkQuestionnaire = json.data;
            state.data.diagnosticStep = 0;
            render();
        } catch (e) {
            toast("加载问卷失败: " + e.message);
        }
    }

    function selectVarkOption(question, value) {
        if (!state.data.varkAnswers) state.data.varkAnswers = {};
        state.data.varkAnswers[question] = value;
    }

    function nextVarkSection() {
        const q = state.data.varkQuestionnaire;
        if (!q) return;

        if (state.data.diagnosticStep < q.sections.length - 1) {
            state.data.diagnosticStep++;
            render();
        } else {
            submitVark();
        }
    }

    function prevVarkSection() {
        if (state.data.diagnosticStep > 0) {
            state.data.diagnosticStep--;
            render();
        }
    }

    async function submitVark() {
        try {
            await request("/api/diagnostic/vark-submit", {
                method: "POST",
                body: JSON.stringify({ answers: state.data.varkAnswers })
            });
            toast("测评已提交");
            state.view = "profile";
            history.pushState({}, "", "/profile");
            render();
        } catch (e) {
            toast("提交失败: " + e.message);
        }
    }

    async function loadSmartReport() {
        try {
            const json = await request("/api/diagnostic/smart-report");
            state.data.smartReport = json.data;
        } catch (e) {
            toast("加载报告失败: " + e.message);
        }
    }

    async function loadKnowledgeMastery() {
        try {
            const json = await request("/api/diagnostic/knowledge-tracing");
            state.data.knowledgeMastery = json.data;
        } catch (e) {
            toast("加载知识追踪失败: " + e.message);
        }
    }

    async function loadCognitiveProfile() {
        try {
            const json = await request("/api/diagnostic/cognitive-profile");
            state.data.cognitiveProfile = json.data;
        } catch (e) {
            toast("加载认知画像失败: " + e.message);
        }
    }

    async function loadMisconceptions() {
        try {
            const json = await request("/api/diagnostic/misconceptions");
            state.data.misconceptions = json.data;
        } catch (e) {
            toast("加载误区检测失败: " + e.message);
        }
    }

    // 视图切换时自动加载数据
    document.addEventListener("view-change", async e => {
        const view = e.detail.view;
        switch (view) {
            case "diagnosticCat":
                break;
            case "diagnosticVark":
                await loadVarkQuestionnaire();
                break;
            case "diagnosticReport":
                await loadSmartReport();
                break;
            case "profileCognitive":
                await loadCognitiveProfile();
                break;
            case "profileKnowledge":
                await loadKnowledgeMastery();
                break;
            case "profileMisconceptions":
                await loadMisconceptions();
                break;
        }
    });

    // ========== 模拟数据生成函数 ==========

    function getMockSmartDiagnostic() {
        return {
            sessionActive: false,
            questionsAnswered: 0,
            ability: 0.5,
            abilitySE: 1.2,
            progress: 30,
            recentAccuracy: 75,
            shouldContinue: true,
            currentQuestion: {
                id: 1,
                content: "以下哪个是 JavaScript 中的基本数据类型？",
                options: ["Object", "Array", "Number", "Function"],
                difficulty: "easy",
                correctIndex: 2
            },
            responses: []
        };
    }

    function getMockVarkQuestionnaire() {
        return {
            sections: [
                {
                    title: "学习方式偏好 - 视觉",
                    questions: [
                        {
                            id: "v1",
                            text: "在学习新内容时，你更喜欢：",
                            options: ["看图表和图片", "听讲解", "阅读文字", "动手实践"]
                        },
                        {
                            id: "v2",
                            text: "记忆时，你会：",
                            options: ["在脑海中形成画面", "重复念出声音", "写下来", "动手演练"]
                        }
                    ]
                },
                {
                    title: "学习方式偏好 - 听觉",
                    questions: [
                        {
                            id: "a1",
                            text: "在课堂上，你更喜欢：",
                            options: ["看板书和投影", "听老师讲解", "自己阅读课本", "参与实验和讨论"]
                        },
                        {
                            id: "a2",
                            text: "学习复杂内容时，你会：",
                            options: ["画思维导图", "与人讨论", "记笔记", "动手尝试"]
                        }
                    ]
                },
                {
                    title: "学习方式偏好 - 读写",
                    questions: [
                        {
                            id: "r1",
                            text: "你获取信息的主要方式是：",
                            options: ["看视频", "听播客", "阅读文章", "实践操作"]
                        },
                        {
                            id: "r2",
                            text: "表达想法时，你会：",
                            options: ["画图或演示", "口头说明", "写下来", "实际操作"]
                        }
                    ]
                },
                {
                    title: "学习方式偏好 - 动觉",
                    questions: [
                        {
                            id: "k1",
                            text: "学习新技能时，你会：",
                            options: ["看教程视频", "听指导", "阅读手册", "直接动手尝试"]
                        },
                        {
                            id: "k2",
                            text: "在小组学习中，你更愿意：",
                            options: ["负责画示意图", "负责讲解", "负责记录", "负责实际操作"]
                        }
                    ]
                }
            ]
        };
    }

    function getMockSmartReport() {
        return {
            summary: {
                overallScore: 78,
                grade: "B+ (良好)",
                description:
                    "你在逻辑思维方面表现优秀，适合从事编程相关的学习。建议加强算法练习，提升解决复杂问题的能力。",
                keyTakeaways: ["逻辑思维良好", "编程基础扎实", "需要加强算法", "适合软件开发"]
            },
            radar: {
                labels: ["逻辑思维", "问题分析", "编程能力", "创造力", "学习速度", "记忆力"],
                datasets: [
                    {
                        data: [85, 78, 72, 65, 80, 70]
                    }
                ]
            },
            strengths: {
                strengths: [{ item: "逻辑推理" }, { item: "概念理解" }],
                weaknesses: [{ item: "实践应用" }, { item: "记忆" }]
            },
            misconceptions: {
                criticalCount: 2,
                cards: [
                    { category: "数组操作", count: 3, suggestion: "建议多做相关练习" },
                    { category: "递归", count: 2, suggestion: "从简单例子开始理解" }
                ]
            },
            pathSuggestion: {
                totalSteps: 3,
                suggestions: [
                    { target: "数组基础", action: "完成10道练习题", priority: "critical" },
                    { target: "递归概念", action: "观看教学视频", priority: "high" },
                    { target: "算法实践", action: "做3道简单算法题", priority: "medium" }
                ]
            }
        };
    }

    function getMockProfileInsight() {
        return {
            persona: "稳步成长型学习者",
            summary: {
                mastery: 78,
                accuracy: 82,
                efficiency: 76,
                studyHours: 126,
                completedToday: 6,
                todayTasks: 8,
                weakCount: 5,
                continuousDays: 14
            },
            dimensions: [
                { label: "记忆能力", value: 75 },
                { label: "理解能力", value: 82 },
                { label: "应用能力", value: 70 },
                { label: "分析能力", value: 85 },
                { label: "创造能力", value: 68 },
                { label: "评价能力", value: 72 }
            ],
            subjectScores: [
                { subject: "JavaScript", mastery: 85, weakCount: 3, wrongCount: 12 },
                { subject: "Python", mastery: 78, weakCount: 4, wrongCount: 18 },
                { subject: "数据结构", mastery: 65, weakCount: 6, wrongCount: 25 },
                { subject: "数据库", mastery: 72, weakCount: 4, wrongCount: 15 },
                { subject: "HTML/CSS", mastery: 90, weakCount: 2, wrongCount: 8 },
                { subject: "前端框架", mastery: 68, weakCount: 5, wrongCount: 20 }
            ],
            strongPoints: [
                { title: "前端开发", subject: "HTML/CSS/JavaScript", mastery: 88 },
                { title: "快速学习", subject: "技术学习", mastery: 85 },
                { title: "问题解决", subject: "编程实践", mastery: 80 }
            ],
            risks: [
                { title: "算法基础薄弱", level: "warning", subject: "数据结构", reason: "在排序和查找算法上经常出错" },
                { title: "异步编程", level: "info", subject: "JavaScript", reason: "Promise链式调用理解不够" }
            ],
            recommendations: [
                { title: "加强算法练习", reason: "提升解决复杂问题的能力", action: "每天练习", target: "practice" },
                { title: "学习设计模式", reason: "提升代码质量", action: "开始学习", target: "course" },
                { title: "项目实战", reason: "将知识应用到实际项目中", action: "开始项目", target: "path" }
            ],
            tasks: [
                { id: 1, title: "完成数组练习", subtitle: "算法练习", estimated_minutes: 30, status: "done" },
                { id: 2, title: "阅读设计模式", subtitle: "学习材料", estimated_minutes: 45, status: "pending" },
                { id: 3, title: "完成项目模块", subtitle: "项目开发", estimated_minutes: 60, status: "pending" },
                { id: 4, title: "复习JavaScript", subtitle: "知识点回顾", estimated_minutes: 25, status: "pending" }
            ]
        };
    }

    function getMockCognitiveProfile() {
        return {
            cognitiveAttributes: {
                逻辑推理: { mastery: 85, confidence: 0.88, state: "mastered" },
                抽象思维: { mastery: 72, confidence: 0.75, state: "developing" },
                问题分解: { mastery: 78, confidence: 0.82, state: "developing" },
                模式识别: { mastery: 80, confidence: 0.85, state: "mastered" },
                空间想象: { mastery: 65, confidence: 0.7, state: "developing" },
                快速计算: { mastery: 70, confidence: 0.72, state: "developing" }
            },
            bloomLevels: {
                记忆: { mastery: 85 },
                理解: { mastery: 82 },
                应用: { mastery: 75 },
                分析: { mastery: 80 },
                评价: { mastery: 70 },
                创造: { mastery: 65 }
            }
        };
    }

    function getMockKnowledgeMastery() {
        const knowledgeNodes = {
            "js-basics": {
                id: "js-basics",
                title: "JavaScript基础",
                subject: "JavaScript",
                mastery: 0.85,
                state: "mastered"
            },
            "js-async": { id: "js-async", title: "异步编程", subject: "JavaScript", mastery: 0.65, state: "learning" },
            "js-dom": { id: "js-dom", title: "DOM操作", subject: "JavaScript", mastery: 0.8, state: "mastered" },
            array: { id: "array", title: "数组", subject: "数据结构", mastery: 0.75, state: "learning" },
            "linked-list": { id: "linked-list", title: "链表", subject: "数据结构", mastery: 0.55, state: "beginner" },
            tree: { id: "tree", title: "树", subject: "数据结构", mastery: 0.45, state: "beginner" },
            sorting: { id: "sorting", title: "排序算法", subject: "算法", mastery: 0.6, state: "learning" },
            searching: { id: "searching", title: "查找算法", subject: "算法", mastery: 0.7, state: "learning" },
            html: { id: "html", title: "HTML标签", subject: "HTML", mastery: 0.9, state: "mastered" },
            css: { id: "css", title: "CSS样式", subject: "CSS", mastery: 0.85, state: "mastered" }
        };
        return {
            summary: {
                total: 10,
                mastered: 4,
                learning: 4,
                beginner: 2,
                overallMastery: 71
            },
            mastery: knowledgeNodes
        };
    }

    function getMockMisconceptions() {
        return {
            totalCategories: 5,
            criticalCount: 2,
            misconceptions: [
                {
                    category: "数组索引",
                    severity: "critical",
                    count: 8,
                    percentage: 35,
                    suggestion: "牢记数组索引从 0 开始，多做边界条件练习。",
                    sampleQuestions: [
                        { content: "数组 [1,2,3,4,5] 的第 3 个元素是？", userAnswer: "3", correctAnswer: "4" },
                        {
                            content: "arr.length - 1 表示什么？",
                            userAnswer: "数组长度",
                            correctAnswer: "最后一个元素的索引"
                        }
                    ]
                },
                {
                    category: "变量作用域",
                    severity: "critical",
                    count: 6,
                    percentage: 26,
                    suggestion: "深入理解 let/const/var 的区别，学习闭包概念。",
                    sampleQuestions: [
                        {
                            content: "for 循环中 var 声明的变量会有什么问题？",
                            userAnswer: "没有问题",
                            correctAnswer: "变量提升导致的闭包问题"
                        }
                    ]
                },
                {
                    category: "异步编程",
                    severity: "moderate",
                    count: 5,
                    percentage: 22,
                    suggestion: "多练习 Promise 和 async/await 的使用，理解事件循环。",
                    sampleQuestions: [
                        {
                            content: "Promise.then() 中的代码什么时候执行？",
                            userAnswer: "立即执行",
                            correctAnswer: "在当前同步代码执行完毕后"
                        }
                    ]
                },
                {
                    category: "类型转换",
                    severity: "moderate",
                    count: 4,
                    percentage: 17,
                    suggestion: "牢记 == 与 === 的区别，避免隐式类型转换。",
                    sampleQuestions: []
                }
            ]
        };
    }
})();
