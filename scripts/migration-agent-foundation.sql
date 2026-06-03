-- ============================================================
-- EduSmart Agent Foundation Migration
-- 新增: learning_events, agent_decisions
-- 增强: system_config 初始化数据
-- ============================================================

-- 1. 学习事件流 - 记录学生所有行为
CREATE TABLE IF NOT EXISTS learning_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(64),
    event_type VARCHAR(50) NOT NULL COMMENT 'view_page, answer_question, save_note, start_course, complete_course, request_ai, error_repeat, search, create_canvas, add_node, review_card, take_exam, pomodoro, emotion_check',
    page VARCHAR(100) COMMENT '发生页面',
    subject VARCHAR(50),
    knowledge_id INT COMMENT '关联知识点',
    target_id INT COMMENT '关联对象ID(如题目ID、笔记ID)',
    target_type VARCHAR(50) COMMENT '关联对象类型(note/question/course/exam)',
    duration_ms INT DEFAULT 0 COMMENT '停留/操作时长',
    context_json JSON COMMENT '上下文数据: {answer, score, tags, query, ...}',
    client_ts BIGINT COMMENT '客户端时间戳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_event_type (event_type),
    INDEX idx_session (session_id),
    INDEX idx_knowledge (knowledge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Agent 决策记忆 - 记录每次 Agent 推理过程
CREATE TABLE IF NOT EXISTS agent_decisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(64),
    decision_type VARCHAR(50) NOT NULL COMMENT 'diagnose, recommend, design_course, generate_path, create_note, schedule_review, answer_question',
    trigger_event VARCHAR(100) COMMENT '触发事件: user_question, weak_point_detected, course_request, manual',
    
    -- 观察阶段
    observation_json JSON COMMENT 'Agent 观察到的数据: {profile, mastery, recent_events, weak_points, ...}',
    
    -- 推理阶段
    reasoning TEXT COMMENT 'Agent 推理过程文本',
    
    -- 工具调用
    tools_called JSON COMMENT '调用的工具列表: [{tool, params, result, duration_ms}]',
    
    -- 决策
    decision_summary VARCHAR(500) COMMENT '决策摘要',
    decision_detail JSON COMMENT '决策详情: {recommendations, path_changes, notes_created, ...}',
    
    -- 结果跟踪
    confidence DECIMAL(4,2) COMMENT '置信度 0-1',
    follow_up_result JSON COMMENT '后续结果跟踪: {user_feedback, mastery_change, completed}',
    follow_up_checked_at TIMESTAMP NULL COMMENT '结果跟踪时间',
    
    status VARCHAR(20) DEFAULT 'executed' COMMENT 'executed, confirmed, rejected, adjusted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_decision_type (decision_type),
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 统一知识模型 - 知识节点关联映射
CREATE TABLE IF NOT EXISTS knowledge_bindings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    knowledge_id INT NOT NULL,
    target_type VARCHAR(50) NOT NULL COMMENT 'course, question, note, exam, project',
    target_id INT NOT NULL,
    binding_strength DECIMAL(3,2) DEFAULT 1.0 COMMENT '关联强度 0-1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_knowledge_target (knowledge_id, target_type, target_id),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 初始化 system_config 表及基础配置
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description VARCHAR(255),
    is_public TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO system_config (config_key, config_value, description, is_public) VALUES
('navigation.items', '[{"label":"首页","view":"home","icon":"home"},{"label":"学习中心","view":"path","icon":"book-open"},{"label":"诊断分析","view":"diagnostic","icon":"activity"},{"label":"编程实践","view":"codeLab","icon":"code"},{"label":"学习资源","view":"resources","icon":"folder"},{"label":"AI智能","view":"intelligence","icon":"cpu"}]', '导航栏配置', 1),
('agent.capabilities', '[{"id":"profile","name":"学习画像","desc":"分析学生掌握度、学习风格、薄弱环节","icon":"user"},{"id":"diagnostic","name":"智能诊断","desc":"基于错题和行为数据精准定位问题","icon":"search"},{"id":"path","name":"路径生成","desc":"根据目标和画像自动设计学习路径","icon":"map"},{"id":"resource","name":"资源匹配","desc":"从课程库和题库自动匹配学习资源","icon":"book"},{"id":"note","name":"笔记助手","desc":"自动生成结构化笔记和复习卡片","icon":"edit"},{"id":"tutor","name":"AI 辅导","desc":"实时答疑、纠错、提供思维引导","icon":"message-circle"}]', 'Agent 能力列表', 1),
('agent.research_sources', '[{"name":"Hello-Agents","url":"https://github.com/datawhalechina/hello-agents","category":"course","desc":"中文Agent教程，适合做学习路径"},{"name":"AI Agents for Beginners","url":"https://github.com/microsoft/ai-agents-for-beginners","category":"course","desc":"微软系统化Agent课程"},{"name":"HuggingFace Agents","url":"https://huggingface.co/learn/agents-course","category":"course","desc":"开源Agent实训课程"},{"name":"OATutor","url":"https://github.com/CAHLR/OATutor","category":"system","desc":"自适应辅导+BKT掌握度模型"},{"name":"OpenMAIC","url":"https://github.com/thunlp/OpenMAIC","category":"system","desc":"多智能体互动课堂"},{"name":"LangGraph","url":"https://github.com/langchain-ai/langgraph","category":"system","desc":"Agent运行时框架"},{"name":"Dify","url":"https://github.com/langgenius/dify","category":"system","desc":"可视化工作流+Agent编排"},{"name":"AutoGen","url":"https://github.com/microsoft/autogen","category":"system","desc":"多智能体协作框架"},{"name":"NexusRAG","url":"https://github.com/nexusrag/nexusrag","category":"system","desc":"知识图谱RAG+引用溯源"},{"name":"Langchain-Chatchat","url":"https://github.com/chatchat-space/Langchain-Chatchat","category":"system","desc":"本地知识库问答"}]', 'Agent开源研究资源', 1),
('subjects.default', '["数据结构与算法","操作系统","计算机网络","数据库系统","程序设计","人工智能","机器学习","前端开发","后端开发","数学基础"]', '默认学科列表', 1),
('code_lab.templates', '[{"id":"sort-visualize","name":"排序算法可视化","lang":"javascript","desc":"实现冒泡、快排、归并排序的可视化对比","difficulty":"medium"},{"id":"tree-traverse","name":"二叉树遍历","lang":"python","desc":"递归与非递归实现前序、中序、后序遍历","difficulty":"easy"},{"id":"hashmap-impl","name":"HashMap 实现","lang":"java","desc":"用数组+链表实现一个简化版 HashMap","difficulty":"medium"},{"id":"dp-knapsack","name":"动态规划-背包问题","lang":"python","desc":"0-1背包、完全背包、多重背包的实现","difficulty":"hard"}]', '编程模板列表', 1),
('agent.goal_default', '系统掌握计算机核心能力', '默认学习目标', 1),
('agent.subject_default', '数据结构与算法', '默认学科', 1);