# ChainBook 🔗

ChainBook is a trading intelligence dashboard for crypto analysts to track whale wallets and assess risk levels across multiple chains. Built with **Next.js 14** (Frontend) and **FastAPI** (Backend).

## Features
* **Authentication:** Secure JWT-based Login & Registration.
* **Dashboard:** Track wallet addresses with risk scoring (Low/Medium/High).
* **Search & Filter:** Real-time filtering by Risk Level and Address/Label.
* **Security:** Password hashing (bcrypt), Server-side validation (Pydantic), and Protected Routes.
* **Scalability:** Designed with a decoupled architecture ready for containerization.

## Tech Stack
* **Frontend:** Next.js (App Router), TailwindCSS, Axios, React Context API.
* **Backend:** Python FastAPI, SQLModel (SQLAlchemy), Pydantic, OAuth2 (JWT).
* **Database:** SQLite (Dev) -> PostgreSQL (Prod ready).

## How to Run

### 1. Clone the Repository
```bash
git clone <https://github.com/AkashMV/chainbook.git>
```
### 2. Install
```bash
cd chainbook-platform
cd backend
# Start the Server (make sure to use a python virtual env)
fastapi dev main.py 
# Install dependencies
pip install -r requirements.txt

# Run the Frontend
cd ..
cd frontend

#Install dependencies
npm install

# Start the Development Server
npm run dev
```
