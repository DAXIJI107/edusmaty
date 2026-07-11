[Setup]
AppName=智学通
AppVersion=2.0.0
AppPublisher=guozhi.gzy
DefaultDirName={autopf}\智学通
DefaultGroupName=智学通
OutputDir=Output
OutputBaseFilename=智学通_Setup_v2.0.0
Compression=lzma2
SolidCompression=yes
UninstallDisplayName=智学通
UninstallDisplayIcon={app}\images\brand\edusmart-favicon.ico
SetupIconFile=D:\Desktop\edusmart-rebuild\apps\web\public\images\brand\edusmart-favicon.ico

[Files]
; 主程序
Source: "D:\Desktop\edusmart-rebuild\my-web-app.exe"; DestDir: "{app}"

; 配置文件（运行时必需）
Source: "D:\Desktop\edusmart-rebuild\.env"; DestDir: "{app}"

; 品牌图标（安装程序和卸载项显示）
Source: "D:\Desktop\edusmart-rebuild\apps\web\public\images\brand\edusmart-favicon.ico"; DestDir: "{app}\images\brand"
Source: "D:\Desktop\edusmart-rebuild\apps\web\public\images\brand\edusmart-favicon.png"; DestDir: "{app}\images\brand"

; 源代码与前端资源
Source: "D:\Desktop\edusmart-rebuild\src\*"; DestDir: "{app}\src"; Flags: recursesubdirs

; 应用模块
Source: "D:\Desktop\edusmart-rebuild\apps\*"; DestDir: "{app}\apps"; Flags: recursesubdirs

; 数据文件
Source: "D:\Desktop\edusmart-rebuild\data\*"; DestDir: "{app}\data"; Flags: recursesubdirs

; 脚本文档
Source: "D:\Desktop\edusmart-rebuild\scripts\*"; DestDir: "{app}\scripts"; Flags: recursesubdirs

; 文档
Source: "D:\Desktop\edusmart-rebuild\docs\*"; DestDir: "{app}\docs"; Flags: recursesubdirs

; RAG 知识库资源
Source: "D:\Desktop\edusmart-rebuild\rag_software_engineering_bundle\*"; DestDir: "{app}\rag_software_engineering_bundle"; Flags: recursesubdirs

; QA 依赖
Source: "D:\Desktop\edusmart-rebuild\.qa_deps\*"; DestDir: "{app}\.qa_deps"; Flags: recursesubdirs

[Icons]
; 桌面快捷方式（使用新图标）
Name: "{commondesktop}\智学通"; Filename: "{app}\my-web-app.exe"; IconFilename: "{app}\images\brand\edusmart-favicon.ico"

; 开始菜单快捷方式（使用新图标）
Name: "{group}\智学通"; Filename: "{app}\my-web-app.exe"; IconFilename: "{app}\images\brand\edusmart-favicon.ico"
Name: "{group}\卸载 智学通"; Filename: "{uninstallexe}"

[Run]
; 安装完成后自动勾选"立即运行"
Filename: "{app}\my-web-app.exe"; Description: "立即启动 智学通"; Flags: postinstall nowait skipifsilent
