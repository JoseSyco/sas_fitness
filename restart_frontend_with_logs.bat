@echo off
echo Reiniciando el frontend con logs detallados...
cd "C:\Users\usuario1\Desktop\SAS 2\SASFRONT"
set DEBUG=vite:*
npx vite
echo Frontend reiniciado!
