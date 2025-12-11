# Village Event Management Website

🔗 **Live Website:** [https://acara-desa.fly.dev/](https://acara-desa.fly.dev/)

A full-stack web application for managing and sharing village community events. It helps administrators organize event details, roles, participation, post announcements and generate participation reports, while giving villagers an easy way to browse and access events information.

## Main Features
### Admin Features
* Event Management: Create, edit, and delete events.
* Event Specifications: Det registration types, upload posters, and configure event details.
* Community Administration: Assign user roles and modify village data.
* Participant Tracking: Register participants, update attendance lists, and generate event-related reports
* Manage Villagers' Accounts: Edit and delete Villagers' account details

### Villager Features:
* Event Browsing: View all available village events
* Event Details: Access event descriptions, schedules, posters, and additional information
* Event Participation: Register for events and choose roles if available

## Usage
### Admin
Use the following credentials to access the admin pages:
* Email: admin@example.com
* Password: admin123

### Villagers
1. Browse all upcoming events without creating an account
2. View event details including posters, date, time and location

### To register to registration-required events:
1. Create an account using a phone number or email and set a password
2. Log in using your credentials to register for the event. 

---

## Tech Stack

### **Frontend**

* React JS (Create React App)
* TailwindCSS / CSS

### **Backend**

* FastAPI
* SQLAlchemy

### **Database**
* PostgreSQL

### **Deployment**

* Fly.io

---

## Run Locally

## Clone repo

```bash
git clone https://github.com/naurayesh/PRPL2025.git
cd PRPL2025
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
