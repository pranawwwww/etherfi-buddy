@echo off
echo Starting EtherFi Buddy Backend...
cd backend
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server at http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.
uvicorn main:app --reload --port 8000
