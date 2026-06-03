# Hello-Agents、AgentScope 与 Obsidian 完整分析和使用文档

更新时间：2026-05-25  
适用对象：想系统学习 AI Agent、开发智能体应用、管理个人知识库的学习者和开发者

## 一、文档结论

这几个链接对应的是三类不同但可以组合使用的工具和资源：

| 链接 | 类型 | 核心用途 | 适合人群 |
| --- | --- | --- | --- |
| https://github.com/datawhalechina/hello-agents | 中文 Agent 教程与案例库 | 从零学习智能体原理、范式、框架和项目实践 | AI 初学者、学生、开发者 |
| https://github.com/agentscope-ai/agentscope | Python Agent 开发框架 | 编写、运行、评估、部署 AI Agent 和多智能体应用 | Python 开发者、AI 应用工程师 |
| https://obsidian.md/ | 本地 Markdown 笔记软件 | 管理笔记、知识库、项目资料、双向链接和图谱 | 学生、研究者、写作者、知识工作者 |

最推荐的使用方式是：

1. 用 Hello-Agents 建立 AI Agent 的系统知识。
2. 用 AgentScope 把学到的 Agent 思路写成真实可运行的程序。
3. 用 Obsidian 记录学习笔记、整理代码经验、沉淀个人知识库。

如果把三者组合起来，可以形成一个完整闭环：学习理论、动手开发、整理复盘。

## 二、Hello-Agents 详细分析

项目地址：https://github.com/datawhalechina/hello-agents

### 1. 它是什么

Hello-Agents 是 Datawhale 社区开源的中文智能体学习教程，中文名是《从零开始构建智能体》。它不是一个单纯的软件包，而是一套系统化学习资料，包含理论讲解、章节教程、代码示例、综合项目和社区扩展内容。

它的核心目标是帮助学习者从“会使用大语言模型”进阶到“会设计和构建智能体系统”。

### 2. 它解决什么问题

现在很多人会用 ChatGPT、Claude、通义千问、DeepSeek 等大模型，但不知道如何把大模型变成能自主完成任务的 Agent。Hello-Agents 解决的就是这个问题：

- 什么是 Agent。
- Agent 和普通 Chatbot 有什么区别。
- ReAct、Reflection、Planning、Memory、RAG 等概念如何工作。
- Dify、Coze、n8n、AutoGen、LangGraph、AgentScope 等工具如何选择。
- 如何从零写一个自己的 Agent 框架。
- 如何做多智能体协作、智能旅行助手、Deep Research、赛博小镇等项目。

### 3. 主要内容结构

根据项目 README，它大致分为五个阶段：

| 阶段 | 内容 | 作用 |
| --- | --- | --- |
| 第一部分 | 智能体与语言模型基础 | 建立 Agent 和 LLM 的基础概念 |
| 第二部分 | 构建大语言模型智能体 | 学习 ReAct、Plan-and-Solve、Reflection、低代码平台和主流框架 |
| 第三部分 | 高级知识扩展 | 学习 Memory、RAG、上下文工程、MCP、A2A、评估、Agentic RL |
| 第四部分 | 综合案例进阶 | 做智能旅行助手、Deep Research、赛博小镇等项目 |
| 第五部分 | 毕业设计和未来展望 | 构建完整多智能体应用 |

### 4. 它有哪些功能和资源

Hello-Agents 本身不是一个应用软件，所以这里的“功能”主要是学习资源能力：

- 中文系统教程。
- 在线阅读版本。
- 本地 Markdown 或文档源码。
- 配套代码。
- 低代码平台实践介绍。
- 主流 Agent 框架对比和实践。
- 从零构建 Agent 框架的教学。
- 高级专题：Memory、RAG、MCP、A2A、Agentic RL、评估。
- 综合项目：旅行助手、研究型 Agent、赛博小镇。
- 面试题、社区文章、FAQ 和额外章节。

### 5. 如何使用

#### 方式一：在线阅读

适合只想学习、不想配置环境的人。

访问：

- 国外访问：https://datawhalechina.github.io/hello-agents/
- 国内加速：https://hello-agents.datawhale.cc/

使用步骤：

1. 从前言和第一章开始读。
2. 每读完一章，整理关键词。
3. 读到实践章节时，再打开对应代码。
4. 用 Obsidian 或普通 Markdown 文件记录学习笔记。

#### 方式二：本地阅读和运行代码

适合想动手实践的人。

```powershell
git clone https://github.com/datawhalechina/hello-agents.git
cd hello-agents
```

然后查看目录：

```powershell
dir
```

重点关注：

- `README.md`：项目说明和目录。
- `docs`：教程正文。
- `code`：配套代码。
- `Extra-Chapter`：扩展内容。
- `Additional-Chapter`：补充章节。

如果代码中需要 API Key，一般需要根据示例创建 `.env` 或在终端设置环境变量。具体变量名要以每个示例代码说明为准。

### 6. 使用之后的效果

学完或跟练之后，你应该能获得这些能力：

- 能解释 Agent、LLM、工具调用、RAG、Memory、多智能体的基本原理。
- 能理解 ReAct 为什么可以让模型边思考边行动。
- 能看懂主流 Agent 框架的基本设计。
- 能用低代码平台搭建简单 Agent。
- 能用代码框架开发一个可运行的 Agent。
- 能设计多智能体协作流程。
- 能判断一个 Agent 项目该用 Dify、Coze、LangGraph、AutoGen 还是 AgentScope。

### 7. 优点和局限

优点：

- 中文资料，对国内学习者友好。
- 系统性强，不只是零散博客。
- 同时覆盖理论、框架、代码和项目。
- 适合构建学习路线。

局限：

- 内容较多，初学者容易一次性看太散。
- 部分章节依赖外部大模型 API，需要自己配置 Key。
- 它是教程，不是生产框架；真正开发时仍需要选择 AgentScope、LangGraph 等工具。

## 三、AgentScope 详细分析

项目地址：https://github.com/agentscope-ai/agentscope  
官方文档：https://doc.agentscope.io/

### 1. 它是什么

AgentScope 是一个 Python Agent 开发框架，用来构建大模型智能体和多智能体应用。官方定位是面向生产可用、易上手、可扩展的 Agent 框架。

简单说，Hello-Agents 教你理解 Agent，AgentScope 帮你真正写 Agent。

### 2. 它解决什么问题

当你直接用大模型 API 开发 Agent 时，会遇到很多工程问题：

- 如何组织 Agent 的系统提示词。
- 如何保存对话记忆。
- 如何让 Agent 调用工具。
- 如何接入 MCP 工具。
- 如何让多个 Agent 协作。
- 如何做 RAG。
- 如何做评估和追踪。
- 如何部署服务。
- 如何做语音 Agent。

AgentScope 就是把这些常见能力封装成框架，让开发者可以更快构建智能体应用。

### 3. 核心功能

根据官方仓库和文档，AgentScope 主要包含以下能力：

| 功能 | 说明 |
| --- | --- |
| ReAct Agent | 内置 ReAct 智能体，支持推理、行动、观察的循环 |
| Tool Calling | 支持注册 Python 函数、Shell 命令、外部工具 |
| Memory | 支持内存记忆、长期记忆、记忆压缩等 |
| MCP | 支持 Model Context Protocol，可以接入外部 MCP 工具 |
| A2A | 支持 Agent-to-Agent 协议 |
| Multi-Agent | 支持多 Agent 对话、辩论、并发、路由、交接 |
| RAG | 支持检索增强生成 |
| Planning | 支持任务规划 |
| Structured Output | 支持结构化输出 |
| Voice Agent | 支持语音输入和语音输出 |
| Realtime Agent | 支持实时语音交互 |
| Evaluation | 支持智能体评估 |
| Tracing | 支持链路追踪和可观测性 |
| Deployment | 支持本地、云端、Kubernetes 等部署思路 |
| Tuner | 支持微调和强化学习相关能力 |

### 4. 安装要求

AgentScope 需要 Python 3.10 或更高版本。

安装：

```powershell
pip install agentscope
```

如果你使用 `uv`：

```powershell
uv pip install agentscope
```

源码安装：

```powershell
git clone -b main https://github.com/agentscope-ai/agentscope.git
cd agentscope
pip install -e .
```

### 5. 基础使用流程

一个最基本的 AgentScope 项目通常包含以下步骤：

1. 准备 Python 环境。
2. 安装 `agentscope`。
3. 准备大模型 API Key。
4. 创建模型对象。
5. 创建 Memory。
6. 创建 Toolkit，并注册工具。
7. 创建 Agent。
8. 创建 UserAgent 或输入循环。
9. 运行对话。

### 6. 示例：创建一个 ReAct Agent

下面是一个简化版示例，思路来自官方 README。实际运行时需要根据你使用的模型供应商调整模型类和 API Key。

```python
import os
import asyncio

from agentscope.agent import ReActAgent, UserAgent
from agentscope.model import DashScopeChatModel
from agentscope.formatter import DashScopeChatFormatter
from agentscope.memory import InMemoryMemory
from agentscope.tool import Toolkit, execute_python_code, execute_shell_command


async def main():
    toolkit = Toolkit()
    toolkit.register_tool_function(execute_python_code)
    toolkit.register_tool_function(execute_shell_command)

    agent = ReActAgent(
        name="Friday",
        sys_prompt="You're a helpful assistant named Friday.",
        model=DashScopeChatModel(
            model_name="qwen-max",
            api_key=os.environ["DASHSCOPE_API_KEY"],
            stream=True,
        ),
        memory=InMemoryMemory(),
        formatter=DashScopeChatFormatter(),
        toolkit=toolkit,
    )

    user = UserAgent(name="user")
    msg = None

    while True:
        msg = await agent(msg)
        msg = await user(msg)
        if msg.get_text_content() == "exit":
            break


asyncio.run(main())
```

运行前设置 API Key：

```powershell
$env:DASHSCOPE_API_KEY="你的 API Key"
python app.py
```

运行后效果：

- 你会得到一个命令行交互式 Agent。
- 用户输入问题后，Agent 会调用大模型生成回答。
- 如果注册了 Python 或 Shell 工具，Agent 可以在需要时调用工具。
- Memory 会保存上下文，使 Agent 能理解前后文。
- 输入 `exit` 后退出。

### 7. 示例：接入 MCP 工具

AgentScope 的一个强项是可以把 MCP 工具变成本地可调用函数，然后注册给 Agent 使用。官方示例中展示了接入高德地图 MCP 的方式。

概念流程：

1. 创建 MCP Client。
2. 从 MCP 服务获取某个工具函数。
3. 直接调用该函数，或注册到 Toolkit。
4. Agent 在任务中自动调用工具。

使用之后的效果：

- Agent 不只是聊天，还能查地图、查天气、读数据库、操作浏览器、访问公司内部系统。
- 工具可以被精细控制，不一定全部暴露给 Agent。
- 可以把简单工具封装成更复杂的业务工具。

### 8. 示例：多智能体工作流

AgentScope 支持 `MsgHub` 和 Pipeline，用于多 Agent 之间的信息分发。

典型场景：

- 一个 Agent 负责计划。
- 一个 Agent 负责搜索资料。
- 一个 Agent 负责写作。
- 一个 Agent 负责审校。

运行之后的效果：

- 多个 Agent 可以共享消息。
- 可以顺序执行，也可以并发执行。
- 可以动态添加或移除参与的 Agent。
- 适合做辩论、协作写作、自动研究、项目规划等任务。

### 9. 适合做哪些项目

AgentScope 适合这些项目：

- 个人 AI 助手。
- 企业知识库问答。
- 自动化研究助手。
- 智能客服。
- 多 Agent 任务协作系统。
- 代码分析助手。
- 数据处理 Agent。
- 旅行规划助手。
- 语音聊天 Agent。
- 接入 MCP 的工具型 Agent。

### 10. 优点和局限

优点：

- Python 生态友好。
- 功能覆盖 Agent 开发的主要环节。
- 支持 MCP、A2A、多智能体、RAG、Memory、评估等高级能力。
- 更适合工程开发和生产化尝试。

局限：

- 需要 Python 编程基础。
- 需要理解异步编程、API Key、模型调用等概念。
- 文档和版本仍在快速变化，开发时要优先看官方文档。
- 部署生产系统时仍需要自己处理权限、安全、成本、日志和监控。

## 四、Obsidian 详细分析

官网：https://obsidian.md/  
下载页：https://obsidian.md/download  
帮助文档：https://help.obsidian.md/

### 1. 它是什么

Obsidian 是一个本地优先的 Markdown 笔记和知识管理软件。它的核心思想是：你的笔记以普通 Markdown 文件保存在本地文件夹中，你拥有自己的数据，并且可以通过链接、标签、图谱、插件等方式组织知识。

它不是 AI Agent 框架，而是个人知识库工具。

### 2. 它解决什么问题

很多人的知识资料分散在微信收藏、浏览器书签、Word、PDF、网盘、代码注释和聊天记录里，时间久了很难搜索和复用。Obsidian 解决的是个人知识管理问题：

- 把笔记统一放在本地文件夹。
- 用 Markdown 保证长期可读。
- 用双向链接建立知识关系。
- 用图谱看到笔记之间的连接。
- 用插件扩展任务管理、看板、数据库查询等能力。
- 用 Sync 在多设备同步。
- 用 Publish 把笔记发布成网站。

### 3. 核心概念

| 概念 | 说明 |
| --- | --- |
| Vault | 笔记库，本质是一个本地文件夹 |
| Note | 笔记，通常是 `.md` Markdown 文件 |
| Link | 双向链接，例如 `[[AgentScope]]` |
| Backlink | 反向链接，显示哪些笔记引用了当前笔记 |
| Tag | 标签，例如 `#AI-Agent` |
| Graph | 图谱视图，用节点和边展示笔记关系 |
| Canvas | 无限画布，用于头脑风暴、流程图、资料整理 |
| Plugin | 插件，分核心插件和社区插件 |
| Theme | 主题，用于改变界面风格 |

### 4. 安装方式

访问下载页：

https://obsidian.md/download

Windows 用户可以选择 Windows 版本；macOS、Linux、iOS、Android 也有对应版本。Obsidian 还提供 Web Clipper 浏览器扩展，可用于剪藏网页内容。

### 5. 基础使用流程

1. 安装 Obsidian。
2. 打开软件，选择 Create new vault。
3. 给 Vault 命名，例如 `AI-Agent-Knowledge`。
4. 选择本地保存位置。
5. 新建第一篇笔记，例如 `Hello-Agents 学习路线.md`。
6. 使用 Markdown 写内容。
7. 使用 `[[AgentScope]]` 创建链接。
8. 使用 `#AI-Agent` 添加标签。
9. 打开 Graph View 查看知识关系。

### 6. 推荐目录结构

如果你用 Obsidian 学习这几个项目，可以这样组织：

```text
AI-Agent-Knowledge/
  00-Inbox/
  01-Learning/
    Hello-Agents/
    AgentScope/
    LLM-Basics/
  02-Projects/
    Personal-Agent/
    RAG-Knowledge-Base/
  03-Notes/
  04-Code-Snippets/
  05-References/
  99-Archive/
```

### 7. 推荐笔记模板

#### 项目分析模板

```markdown
# 项目名

## 一句话总结

## 解决的问题

## 核心功能

## 安装方式

## 快速开始

## 使用后的效果

## 优点

## 局限

## 我可以用它做什么

## 相关链接
```

#### 学习笔记模板

```markdown
# 章节标题

## 核心概念

## 关键流程

## 示例代码

## 我不理解的地方

## 可以实践的小任务

## 总结
```

### 8. 常用插件

Obsidian 官方首页提到它有大量插件和主题。常见实用插件包括：

| 插件 | 用途 |
| --- | --- |
| Calendar | 日历和每日笔记 |
| Kanban | 看板任务管理 |
| Dataview | 把 Markdown 笔记当作可查询数据库 |
| Tasks | 跨笔记任务追踪 |
| Outliner | 大纲式写作 |
| Excalidraw | 手绘图、架构草图 |
| Advanced Tables | Markdown 表格增强 |
| Templater | 高级模板 |

### 9. 使用之后的效果

持续使用 Obsidian 后，你可以得到：

- 一个本地可控的个人知识库。
- 一套清晰的学习笔记体系。
- 可以快速搜索过去学过的知识。
- 可以通过双向链接把概念连接起来。
- 可以把 Hello-Agents 的章节、AgentScope 的代码、自己的项目经验整理成长期资产。
- 可以在需要写项目文档、复盘、教程时快速复用内容。

### 10. 优点和局限

优点：

- 本地优先，数据在自己电脑上。
- Markdown 格式开放，不容易被平台锁定。
- 双向链接和图谱适合构建知识网络。
- 插件生态丰富。
- 免费功能已经足够强。

局限：

- 初期需要自己设计笔记结构。
- 插件太多时容易折腾过度。
- 官方同步、发布等高级服务需要额外付费。
- 它不是数据库或项目管理系统，复杂团队协作不一定适合。

## 五、三者对比

| 维度 | Hello-Agents | AgentScope | Obsidian |
| --- | --- | --- | --- |
| 本质 | 教程和案例库 | Python 开发框架 | 笔记和知识库软件 |
| 主要用途 | 学习 AI Agent | 开发 AI Agent | 管理知识和笔记 |
| 是否需要编程 | 建议会 Python | 必须会 Python | 不必须 |
| 是否能直接开发应用 | 不能，主要是学习 | 可以 | 不能，主要是记录和管理 |
| 是否适合初学者 | 适合 | 有门槛 | 适合 |
| 是否适合生产项目 | 间接帮助 | 更适合 | 不适合作为 Agent 后端 |
| 数据保存 | GitHub 仓库内容 | 由你的程序决定 | 本地 Markdown 文件 |
| 最佳角色 | 教材 | 工具箱 | 知识仓库 |

## 六、推荐学习和实践路线

### 第 1 阶段：建立基本概念

目标：知道 Agent 是什么。

操作：

1. 阅读 Hello-Agents 前言和第 1 章。
2. 在 Obsidian 建立 `AI Agent` 笔记。
3. 记录这些关键词：Agent、LLM、Tool、Memory、Planning、Action、Observation。

效果：

- 能区分普通聊天机器人和智能体。
- 能理解 Agent 为什么需要工具和记忆。

### 第 2 阶段：学习经典范式

目标：理解 ReAct、Reflection、Plan-and-Solve。

操作：

1. 阅读 Hello-Agents 第 4 章。
2. 跑配套代码。
3. 在 Obsidian 记录每种范式的流程图。

效果：

- 能解释 ReAct 的思考、行动、观察循环。
- 能知道什么时候该用规划，什么时候该用反思。

### 第 3 阶段：了解主流框架

目标：知道 AgentScope 在框架生态中的位置。

操作：

1. 阅读 Hello-Agents 第 6 章。
2. 对比 AgentScope、LangGraph、AutoGen。
3. 在 Obsidian 建一个 `Agent 框架对比.md`。

效果：

- 能根据任务选择框架。
- 能理解不同框架的设计风格。

### 第 4 阶段：上手 AgentScope

目标：写出第一个可运行 Agent。

操作：

1. 安装 Python 3.10+。
2. 安装 AgentScope。
3. 配置大模型 API Key。
4. 运行官方 ReAct Agent 示例。
5. 增加一个自定义工具函数。

效果：

- 可以在命令行和 Agent 对话。
- Agent 可以调用工具完成简单任务。
- 你开始从“学概念”进入“写应用”。

### 第 5 阶段：做一个小项目

推荐项目：本地学习助手。

目标：

- 用 Obsidian 存学习笔记。
- 用 AgentScope 写一个能检索资料、总结内容、回答问题的 Agent。
- 用 Hello-Agents 继续补充理论。

实现思路：

1. Obsidian 中保存 Markdown 笔记。
2. Python 读取某个 Vault 目录下的 `.md` 文件。
3. 建立简单搜索或向量检索。
4. AgentScope 的 Agent 接入检索工具。
5. 用户提问时，Agent 先检索笔记，再回答。

最终效果：

- 你可以问：“ReAct 和 Reflection 有什么区别？”
- Agent 会从你的 Obsidian 笔记中找相关内容。
- Agent 根据笔记生成答案。
- 学习资料、代码实践、知识复盘形成闭环。

## 七、组合使用方案

### 方案一：学习型组合

适合：刚开始学 AI Agent。

工具分工：

- Hello-Agents：主教材。
- Obsidian：学习笔记。
- AgentScope：暂时只看，不急着写复杂项目。

日常流程：

1. 每天读一节 Hello-Agents。
2. 把核心概念写入 Obsidian。
3. 把不懂的问题列成任务。
4. 每周用一篇总结笔记复盘。

### 方案二：开发型组合

适合：已经会 Python，想做 Agent 应用。

工具分工：

- AgentScope：开发框架。
- Hello-Agents：遇到概念问题时查教程。
- Obsidian：记录架构设计、Bug、API Key 配置说明、踩坑经验。

日常流程：

1. 用 AgentScope 创建项目。
2. 编写 Agent、Tool、Memory、Workflow。
3. 把设计文档写在 Obsidian。
4. 把有价值的代码片段整理到 `Code-Snippets`。

### 方案三：个人知识库 Agent

适合：想把自己的笔记变成可问答知识库。

工具分工：

- Obsidian：保存知识。
- AgentScope：构建问答 Agent。
- Hello-Agents：提供 RAG、Memory、评估等学习参考。

系统流程：

```text
用户问题
  -> AgentScope Agent
  -> 调用检索工具
  -> 读取 Obsidian Markdown 笔记
  -> 找到相关内容
  -> 大模型总结回答
  -> 返回答案
```

使用效果：

- 笔记不再只是静态文本。
- 你可以通过自然语言查询自己的知识库。
- Agent 可以帮你总结、对比、提炼行动项。

## 八、常见问题

### 1. 我没有编程基础，先学哪个？

先用 Obsidian 做笔记，然后读 Hello-Agents 的前几章。AgentScope 可以先不碰，等掌握 Python 基础后再上手。

### 2. 我已经会 Python，应该怎么开始？

直接安装 AgentScope，跑官方 Quickstart。同时用 Hello-Agents 补齐 ReAct、Memory、MCP、多智能体这些概念。

### 3. Hello-Agents 和 AgentScope 是不是重复？

不重复。Hello-Agents 是学习材料，AgentScope 是开发框架。一个负责教你，一个负责让你写代码。

### 4. Obsidian 能不能直接开发 Agent？

不能。Obsidian 是笔记软件，不是 Agent 框架。但它的 Markdown 文件很适合作为 Agent 的知识来源。

### 5. AgentScope 能不能读取 Obsidian？

可以，但需要你自己写工具函数。因为 Obsidian 的笔记就是本地 Markdown 文件，Python 可以读取这些文件，再交给 AgentScope 的 Agent 使用。

### 6. 这几个工具是否需要付费？

- Hello-Agents：开源免费。
- AgentScope：开源免费，但调用大模型 API 通常会产生模型服务费用。
- Obsidian：个人基础功能免费；官方 Sync、Publish 等服务通常需要付费。

## 九、实际落地建议

如果你想真正用起来，不建议一开始就追求“大而全”的 Agent 系统。推荐从这个小目标开始：

第一周：

- 安装 Obsidian。
- 建一个 `AI-Agent-Knowledge` 笔记库。
- 阅读 Hello-Agents 第 1 到第 4 章。
- 每章写一篇笔记。

第二周：

- 安装 Python 3.10+。
- 安装 AgentScope。
- 跑通官方 ReAct Agent 示例。
- 让 Agent 调用一个简单 Python 函数。

第三周：

- 写一个读取 Obsidian Markdown 文件的 Python 工具。
- 把这个工具注册给 AgentScope。
- 让 Agent 回答关于你笔记的问题。

第四周：

- 加入 RAG 或更好的搜索。
- 加入长期记忆。
- 加入评估问题集。
- 写一份项目复盘笔记。

## 十、资料来源

- Hello-Agents GitHub：https://github.com/datawhalechina/hello-agents
- Hello-Agents 在线阅读：https://datawhalechina.github.io/hello-agents/
- Hello-Agents 国内加速：https://hello-agents.datawhale.cc/
- AgentScope GitHub：https://github.com/agentscope-ai/agentscope
- AgentScope 文档：https://doc.agentscope.io/
- Obsidian 官网：https://obsidian.md/
- Obsidian 下载：https://obsidian.md/download
- Obsidian 帮助文档：https://help.obsidian.md/

