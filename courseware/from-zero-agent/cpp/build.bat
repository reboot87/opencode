@echo off
setlocal
rem Locate any Visual Studio with the C++ toolset, then compile.
rem Keep this file ASCII-only: cmd.exe parses .bat with the console codepage.
set VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe
if exist "%VSWHERE%" (
  for /f "usebackq tokens=*" %%i in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set VSDIR=%%i
)
if defined VSDIR call "%VSDIR%\VC\Auxiliary\Build\vcvars64.bat" >nul
rem Lua is compiled as C and linked statically into agent.exe
cl /nologo /std:c++17 /EHsc /O2 /utf-8 /D_CRT_SECURE_NO_WARNINGS agent.cpp third_party\lua\*.c /Fe:agent.exe
