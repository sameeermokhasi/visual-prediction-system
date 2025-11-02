1. The Problem
In high-speed manufacturing (especially for metal casting, CNC machining, etc.), manual quality control is a major bottleneck. Human inspection is:
Slow: A person can only inspect a few parts per second.
Expensive: It requires constant, paid human labor, often across multiple shifts.
Inconsistent: A human inspector gets tired, bored, and distracted. The 1000th part of the day is not inspected as carefully as the first.
Subjective: What one inspector calls a "minor scratch," another might flag as a major defect.
These issues lead to higher labor costs, production delays, and the risk of defective products reaching customers, which can cause costly recalls and damage a brand's reputation.

2. The Solution
VisionAI solves this by automating the inspection process. It provides a system that is:
Ultrafast: The YOLOv8 model can analyze an image in milliseconds, allowing it to inspect parts on a fast-moving assembly line.
Cost-Effective: An AI inspector can run 24/7 with no salary, breaks, or fatigue.
Consistent: The AI applies the exact same logic every single time, whether it's the first part or the millionth. It is completely objective.
Data-Driven: Every inspection is tracked, providing a log of common defects. This helps managers identify why defects are happening (e.g., "Line B is producing 30% more scratches today") rather than just catching them at the end.

3. Key Features
This is a complete, end-to-end application with several key features:
Secure User Authentication: A full login/registration system. User accounts are created and stored in a persistent SQLite database. Passwords are securely hashed using bcrypt.
Animated Login Page: A visually attractive, animated login screen provides a professional first impression.
Multi-Page Web Application: The app is split into logical sections:
A professional product Landing Page with demo modals and feature descriptions.
A Live Monitoring ("Free Trial") Page with the main tool.
A Help Center Page with an FAQ and a support form.
Real-Time AI Inspection: The core of the project. The monitoring page features two live webcam feeds.
Bounding Box Visualization: The system draws color-coded boxes (red for defects, green for good parts) directly onto the snapshot of the inspected part.
Recent Inspection History: A live-updating sidebar shows a log of the most recent inspections (e.g., D-1845: FAIL, D-1846: PASS).
Interactive Modals: Includes a "Watch Demo" modal with a custom SVG animation, a "Pricing" modal, and a "Schedule Demo" modal that simulates an email notification.

5. Step-by-Step Tool Workflow
This is what happens when you use the tool:

Authentication:
A user visits the site and is shown the Login Page.
They choose to Register. They enter a username, password, and confirm the password.
On submit, the frontend checks if the passwords match.
It then sends the username and password to the backend's POST /register endpoint.
The backend hashes the password and saves the new user to the SQLite database.
The frontend shows a "Success! Please log in" message.
The user now logs in. The frontend sends the credentials to the POST /token endpoint.
The backend verifies the password. If correct, it creates a JWT Access Token and sends it back.
The frontend saves this token in localStorage and loads the main website.
Inspection (on the "Free Trial" Page):
The user holds a metal disc up to one of the webcams and clicks "Inspect."
The React frontend takes a snapshot from the webcam.
It sends this image, along with the JWT Token (in the header), to the backend's POST /inspect endpoint.
The backend first verifies the JWT Token. If valid, it proceeds.
The image is passed to the loaded YOLOv8 (best.pt) model.
The model returns a list of all objects it found, with coordinates and confidence scores (e.g., [{'prediction': 'scratch', 'box': [0.1, 0.2, ...]}, {'prediction': 'polished_casting', 'box': [...]}]).
The backend's "business logic" checks this list. Since scratch is not in the GOOD_CLASSES list, it sets the overall status to "rejected".
The backend sends the full JSON response back to the frontend.
React receives the JSON, updates its state, and re-renders to show the red "REJECTED" card and draw the red "scratch" box on the snapshot.
The result is also added to the "Recent Inspections" list.

6. How It Was Built (Development Process)
This project was built in three distinct phases:

Phase 1: AI Model Training (The "Brain")
Data Collection: We gathered a public dataset of 1,300+ images of metal casting parts, including both "good" parts and parts with defects.
Labeling: We used Roboflow, an online annotation tool, to manually draw bounding boxes around all visible defects. We defined classes like scratch, casting_with_burr, pit, and crack, as well as "good" classes like polished_casting.
Training: We exported this dataset in "YOLOv8" format. We then used a Python script with the ultralytics library to train the YOLOv8 model on this data. This process "fine-tuned" the base model, teaching it to be a specialist at finding our specific defects. The final output was the best.pt file—our trained model.

Phase 2: Backend Development (The "Body")
Framework: We chose FastAPI (Python) because it's extremely fast, modern, and great for building ML-powered APIs.
Database: We used SQLAlchemy (an ORM) to define a User model in Python. This model automatically creates and manages a users table in a SQLite database file (vision_ai.db).
Authentication: We built two public endpoints: /register (to create users with bcrypt password hashing) and /token (to log users in and issue JWT access tokens).
Core Logic: We created a protected /inspect endpoint that requires a valid JWT token. This endpoint loads the best.pt model, performs inference on the uploaded image, and sends back the JSON results.

Phase 3: Frontend Development (The "Face")
Framework: We used React (with Create React App) to build a dynamic, single-page application (SPA).
State & Pages: We used React's useState hook to manage the application's state (e.g., [token, setToken], [currentPage, setCurrentPage]). This allows us to show/hide the LoginPage, MainApplication, LiveMonitoringPage, and HelpPage components.
Styling: The entire UI was built with Tailwind CSS for a modern, responsive, and utility-first design. All animations (like the login page background and demo modal) are custom CSS/SVG.
API Communication: We used the axios library to communicate with our FastAPI backend. We configured it to automatically attach the user's JWT token to all protected API requests (like /inspect and /schedule-demo).
Data Visualization: On the monitoring page, we use react-webcam to get the camera feed. After getting results from the API, we map over the detections array and render <div> elements with absolute positioning to draw the bounding boxes on top of the snapshot.

7. Technology & Key Concepts
YOLOv8: (You Only Look Once) A state-of-the-art, real-time object detection algorithm. It is the "brain" that finds the defects.
FastAPI: A high-performance Python web framework used to build our backend API.
React: A JavaScript library for building component-based, interactive user interfaces (our frontend).
SQLite: A lightweight, serverless, file-based SQL database. It's perfect for self-contained projects and stores our users table.
SQLAlchemy (ORM): An "Object-Relational Mapper." It's a Python library that "translates" our Python User class into SQL commands, so we never have to write raw SQL.
Authentication: The process of verifying who a user is.
Hashing (bcrypt): A one-way process to scramble passwords so they are never stored in plain text. bcrypt is the industry standard.
JWT (JSON Web Token): A small, secure "access card" (a long string) that the backend gives the user after they log in. The user must show this "card" with every future API request to prove they are logged in.
axios: The JavaScript library used by the frontend to make HTTP requests (API calls) to the backend.
uvicorn: The "server" that runs our FastAPI application.

8. Target Audience
The primary consumers for this tool are:
Manufacturing Plants: Specifically, factories that produce a high volume of identical parts (like metal castings, stamped parts, electronics).
Quality Control (QC) / Quality Assurance (QA) Managers: They would use the dashboard to monitor production quality in real-time and use the data logs to spot problems.
Production Line Operators: They would use the live feed to get instant pass/fail feedback on parts.

9. How to Run This Project
To get this project running, you need to run both the Backend and Frontend servers.
Prerequisites
Python 3.8+
Node.js (LTS)
Your trained model file (best.pt) placed in the ml_pipeline/models/ folder.

1. Run the Backend
Open a terminal and navigate to the backend folder:

# Go to the backend directory
cd path/to/your/project/visual-prediction-system/backend

# Create a virtual environment (if you haven't)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install all required Python libraries
pip install fastapi "uvicorn[standard]" ultralytics opencv-python-headless pillow sqlalchemy passlib bcrypt "python-jose[cryptography]"

# Run the server!
uvicorn app.main:app --reload
Your backend is now running at http://127.0.0.1:8000.

2. Run the Frontend

Open a new, separate terminal and navigate to the frontend folder:

# Go to the frontend directory
cd path/to/your/project/visual-prediction-system/frontend

# Install all required Node.js packages (if you haven't)
npm install

# Install the aspect ratio plugin for Tailwind
npm install @tailwindcss/aspect-ratio

# Run the React app!
npm start
