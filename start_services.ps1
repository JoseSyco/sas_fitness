# PowerShell script to start both backend and frontend services

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd SASBACK; node server.js"

Write-Host "Waiting 5 seconds before starting frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd SASFRONT; npm run dev"

Write-Host "Services started. Check the opened PowerShell windows for details." -ForegroundColor Cyan
