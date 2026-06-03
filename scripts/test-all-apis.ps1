$studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ6aGFuZ3NhbiIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzc5NzAwNDA3LCJleHAiOjE3Nzk3ODY4MDd9.4eknpzRgZjvD7-WNc-3a5rRByUMb3bU4zYNlEATsX5E"
$teacherToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3Nzk3MDA0NjEsImV4cCI6MTc3OTc4Njg2MX0.maKvsCRkmz1qFCbyESjmp2igzPOaW1C4WJNRKcCgsPc"
$base = "http://localhost:3020"

function Test-Api($name, $method, $url, $token, $body) {
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    try {
        $headers = @{Authorization="Bearer $token"}
        $params = @{Uri=$url; Method=$method; Headers=$headers}
        if ($body) { $params.Body = ($body | ConvertTo-Json); $params.ContentType = 'application/json' }
        $r = Invoke-RestMethod @params
        $json = $r | ConvertTo-Json -Depth 3 -Compress
        Write-Host "SUCCESS" -ForegroundColor Green
        if ($json.Length -gt 300) { Write-Host ($json.Substring(0,300) + "...") } else { Write-Host $json }
        return @{status="PASS"; result=$json}
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP $code" -ForegroundColor Yellow
        return @{status="HTTP$code"; result=$_.Exception.Message}
    }
}

Write-Host "======= P0: Knowledge Graph (Student Token) =======" -ForegroundColor Magenta
Test-Api "GET /api/knowledge-graph" "GET" "$base/api/knowledge-graph" $studentToken
Test-Api "POST /api/knowledge-graph/links" "POST" "$base/api/knowledge-graph/links" $studentToken @{source_note_id=1;target_title="二分查找"}
Test-Api "GET /api/knowledge-graph/note-links/1" "GET" "$base/api/knowledge-graph/note-links/1" $studentToken
Test-Api "DELETE /api/knowledge-graph/links/999" "DELETE" "$base/api/knowledge-graph/links/999" $studentToken

Write-Host "`n======= P0: Agent Collaboration (Student Token) =======" -ForegroundColor Magenta
Test-Api "GET /api/agent-collaborate/history" "GET" "$base/api/agent-collaborate/history" $studentToken
Test-Api "GET /api/agent-collaborate/test123" "GET" "$base/api/agent-collaborate/test123" $studentToken

Write-Host "`n======= P0: Teacher Knowledge Graph (Teacher Token) =======" -ForegroundColor Magenta
Test-Api "GET /api/teacher/knowledge-graph" "GET" "$base/api/teacher/knowledge-graph" $teacherToken

Write-Host "`n======= P1: Concept Canvas (Student Token) =======" -ForegroundColor Magenta
Test-Api "GET /api/concept-canvas" "GET" "$base/api/concept-canvas" $studentToken
Test-Api "POST /api/concept-canvas" "POST" "$base/api/concept-canvas" $studentToken @{name="测试画布";data="{}"}
Test-Api "GET /api/concept-canvas/elements/search?q=二分" "GET" "$base/api/concept-canvas/elements/search?q=二分" $studentToken

Write-Host "`n======= P1: AI Courses (No Auth needed) =======" -ForegroundColor Magenta
Test-Api "GET /api/courses" "GET" "$base/api/courses" $studentToken

Write-Host "`n======= Existing API Verification =======" -ForegroundColor Magenta
Test-Api "GET /api/knowledge" "GET" "$base/api/knowledge" $studentToken
Test-Api "GET /api/notes" "GET" "$base/api/notes" $studentToken

Write-Host "`n======= DONE =======" -ForegroundColor Magenta