@echo off
echo Starting backend server in Visual Studio Code terminal...
code -r SASBACK -e "cd SASBACK && node server.js"
timeout /t 5
echo Starting frontend server in Visual Studio Code terminal...
code -r SASFRONT -e "cd SASFRONT && npm run dev"
echo Services started in Visual Studio Code terminals.
