$content = @"
@echo off
title EduSmart v2.1.0
cd /d "%~dp0"

echo ========================================
echo    EduSmart Smart Learning Platform v2.1.0
echo    Starting service, please wait...
echo ========================================
echo.

if not exist "node\node.exe" (
    echo [ERROR] node.exe not found. Please extract all files.
    pause
    exit /b 1
)

if not exist "data" mkdir "data"

echo Starting EduSmart...
echo Browser will open at http://localhost:3020
echo.
echo Press Ctrl+C to stop the service
echo ----------------------------------------

node\node.exe src\server\index.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Service failed to start. Error code: %ERRORLEVEL%
    echo Please check .env file
    pause
)
"@

$stopContent = @"
@echo off
echo Stopping EduSmart...
taskkill /f /im node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo EduSmart stopped.
) else (
    echo No running service found.
)
timeout /t 2 /nobreak >nul
"@

$dir = "d:\Desktop\new\edusmart-rebuild\dist\EduSmart-Portable"

# GBK encoding for Chinese-named bat files
$gbk = [System.Text.Encoding]::GetEncoding("GBK")
[System.IO.File]::WriteAllText("$dir\启动EduSmart.bat", $content, $gbk)
[System.IO.File]::WriteAllText("$dir\停止服务.bat", $stopContent, $gbk)

# ASCII encoding for English-named bat files (backup)
$ascii = [System.Text.Encoding]::ASCII
[System.IO.File]::WriteAllText("$dir\start.bat", $content, $ascii)
[System.IO.File]::WriteAllText("$dir\stop.bat", $stopContent, $ascii)

Write-Host "Done. Files created:"
Get-ChildItem "$dir\*.bat" | Select-Object Name, Length | Format-Table -AutoSize
