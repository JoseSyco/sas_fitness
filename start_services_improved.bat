@echo off
echo ===================================
echo SAS2 Fitness Platform Startup Script
echo ===================================

echo.
echo Checking if services are already running...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo Node.js processes are already running. Stopping them...
    taskkill /F /IM node.exe /T
    timeout /t 2 /nobreak >NUL
)

echo.
echo Setting up environment...
cd SASBACK
if not exist .env (
    echo Creating .env file...
    echo PORT=5000 > .env
    echo NODE_ENV=development >> .env
    echo DB_HOST=localhost >> .env
    echo DB_USER=root >> .env
    echo DB_PASSWORD= >> .env
    echo DB_NAME=sas2 >> .env
    echo JWT_SECRET=sas2_secret_key >> .env
    echo DEEPSEEK_API_KEY=your_deepseek_api_key >> .env
)

echo.
echo Starting backend server...
start cmd /k "title SAS Backend && color 0A && echo Backend starting... && npm run dev"

echo.
echo Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak >NUL

echo.
echo Starting frontend server...
cd ..\SASFRONT
start cmd /k "title SAS Frontend && color 0B && echo Frontend starting... && npm run dev"

echo.
echo ===================================
echo Services started successfully!
echo ===================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause >NUL

start http://localhost:5173
