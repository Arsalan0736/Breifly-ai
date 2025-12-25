# BrieflyAI

BrieflyAI is a SaaS application that turns messy messages into clear creative briefs using AI.

## Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (running on localhost:27017)

## Setup & Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   uvicorn server:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`.

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`.

## Features

- **AI Brief Generation**: Automatically generate briefs from text inputs.
- **Dashboard**: Manage your briefs and conversations.
- **Neubrutalism Design**: Modern, bold UI style.
- **Mocked Integrations**: Demonstrates integration capabilities.

## Notes

- The `emergentintegrations` library is mocked in `backend/emergentintegrations` for development purposes.
- Ensure MongoDB is running before starting the backend.
