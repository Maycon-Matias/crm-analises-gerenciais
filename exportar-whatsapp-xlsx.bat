@echo off
setlocal

cd /d "%~dp0"

echo ========================================
echo Exportando WhatsApp para Excel (2 abas)
echo ========================================

python ".\scripts\exportar-whatsapp-xlsx.py" --db=CRM --uri="mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred" --output=exports\clientes-whatsapp.xlsx

if %errorlevel% neq 0 (
  echo.
  echo ERRO ao exportar.
  echo Se faltar dependencia, execute:
  echo pip install pymongo pandas xlsxwriter
  echo.
  echo Se o erro for de certificado, informe um .pem:
  echo python ".\scripts\exportar-whatsapp-xlsx.py" --db=CRM --tls-cert="C:\caminho\certificado.pem"
  pause
  exit /b %errorlevel%
)

echo.
echo Sucesso! Arquivo gerado em:
echo %cd%\exports\clientes-whatsapp.xlsx
pause
