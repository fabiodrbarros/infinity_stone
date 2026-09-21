@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
echo Infinity Stone: http://localhost:3000
echo Administracao: http://localhost:3000/admin
call npm run dev
pause
