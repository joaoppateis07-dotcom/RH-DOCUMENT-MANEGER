@echo off
title Sistema de Pastas - Iniciando...
cd /d "%~dp0"

echo.
echo  ================================
echo   INICIANDO SISTEMA DE PASTAS
echo  ================================
echo.

:: Para qualquer instancia anterior do node nesta pasta
echo [1/3] Verificando processos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: Inicia o servidor Node.js em segundo plano
echo [2/3] Iniciando servidor...
start "Servidor Node" /B node server.js
timeout /t 3 /nobreak >nul

:: Inicia o Serveo tunnel com subdominio fixo
echo [3/3] Iniciando tunnel...
echo.
echo  Site disponivel em: https://driveupconsult.serveousercontent.com
echo.
echo  Para ENCERRAR o site: feche esta janela
echo  ================================
echo.

:loop
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ExitOnForwardFailure=no -R driveupconsult:80:localhost:3000 serveo.net
echo.
echo  Tunnel desconectado. Reconectando em 5 segundos...
timeout /t 5 /nobreak >nul
goto loop

:: Quando o tunnel fechar, encerra o servidor tambem
taskkill /F /IM node.exe >nul 2>&1
echo.
echo  Site encerrado.
pause
