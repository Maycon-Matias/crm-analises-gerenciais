@echo off
setlocal

cd /d "%~dp0"

set "MONGODB_URI=mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred"

echo ========================================
echo Exportando clientes do WhatsApp...
echo ========================================

node ".\scripts\exportar-whatsapp-planilha.js" --db=CRM --collections=dados_coletados_do_whatsapp,whatsapp-finalizado --output=exports\clientes-whatsapp.xlsx

if %errorlevel% neq 0 (
  echo.
  echo ERRO: Falha ao exportar planilha.
  pause
  exit /b %errorlevel%
)

echo.
echo Sucesso! Arquivo gerado em:
echo %cd%\exports\clientes-whatsapp.xlsx
pause
