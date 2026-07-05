# 🚀 AI-Powered Predictive Maintenance Agent for Smart Manufacturing

An AI-powered web application that predicts potential machine failures before they occur using **Google Gemini AI**, **Prompt Engineering**, **MongoDB**, and **ChromaDB (RAG)**. The system helps maintenance engineers analyze machine health, identify risks, and receive intelligent maintenance recommendations.

---

## 📖 Project Overview

The **AI-Powered Predictive Maintenance Agent for Smart Manufacturing** is an enterprise-grade predictive maintenance system developed using **Java Spring Boot**.

The application simulates industrial machine monitoring by allowing users to manually enter machine health parameters instead of collecting data from real IoT sensors.

Using **Google Gemini AI**, the application analyzes machine conditions and generates intelligent maintenance reports including predicted failures, risk levels, maintenance recommendations, confidence scores, and estimated downtime.

To improve AI response quality, the system uses **Retrieval-Augmented Generation (RAG)** with **ChromaDB**, which retrieves relevant maintenance manuals and historical maintenance cases before sending the prompt to Gemini.

All machine information, users, predictions, and maintenance reports are securely stored in **MongoDB**.

---
## Prototype
https://ai-powered-predictive-maintenance-agent-50257106208.asia-southeast1.run.app
---

# 🎯 Objectives

- Predict machine failures before breakdown.
- Reduce unexpected machine downtime.
- Improve preventive maintenance planning.
- Assist maintenance engineers using AI.
- Store maintenance history for future analysis.
- Demonstrate the use of Generative AI in Smart Manufacturing.

---

# ✨ Key Features

- 🔐 Secure User Authentication (JWT)
- 👤 User Registration & Login
- 🏭 Machine Registration & Management
- 📊 Interactive Dashboard
- 🤖 AI-Based Machine Failure Prediction
- ⚠ Risk Level Detection
- 🛠 Intelligent Maintenance Recommendations
- 📄 Maintenance Report Generation
- 📚 Maintenance History
- 🔍 Search & Filter Reports
- 🧠 Prompt Engineering
- 📚 Retrieval-Augmented Generation (RAG)
- 📥 PDF Report Download
- 🐳 Docker Deployment

---

# 🏗️ Tech Stack

## Programming Language
- Java 21

## Backend
- Spring Boot 3
- Spring MVC
- Spring Security
- Spring Data MongoDB

## Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5

## Artificial Intelligence
- Google Gemini API
- Prompt Engineering

## Databases
- MongoDB
- ChromaDB (Vector Database)

## Authentication
- JWT Authentication
- BCrypt Password Encryption

## Build Tool
- Maven

## Deployment
- Docker

## Version Control
- Git & GitHub

---

# 🧠 Prompt Engineering Techniques

The application uses multiple Prompt Engineering techniques including:

- Role Prompting
- Few-shot Prompting
- Context Injection
- Structured JSON Output
- Retrieval-Augmented Generation (RAG)

---

# 🏭 Supported Industrial Machines

- CNC Machine
- Lathe Machine
- Milling Machine
- Drilling Machine
- Grinding Machine
- Hydraulic Press
- Air Compressor
- Conveyor Belt
- Electric Motor
- Water Pump
- Generator
- Boiler
- Cooling Fan
- Gearbox
- Welding Machine
- Industrial Robot

---

# 📋 Machine Health Parameters

The AI analyzes the following machine health parameters:

- Temperature
- Pressure
- Vibration Level
- Noise Level
- Operating Hours
- Motor Speed (RPM)
- Power Consumption
- Load Percentage
- Humidity
- Oil Leakage
- Bearing Condition
- Lubrication Level
- Machine Status
- Maintenance Notes

---

# ⚙️ AI Prediction Workflow

```text
User Login
      │
      ▼
Select / Register Machine
      │
      ▼
Enter Machine Health Parameters
      │
      ▼
Retrieve Similar Cases (ChromaDB)
      │
      ▼
Generate Prompt
      │
      ▼
Google Gemini AI Analysis
      │
      ▼
Failure Prediction
      │
      ▼
Maintenance Recommendation
      │
      ▼
Store Report in MongoDB
      │
      ▼
Display Professional Maintenance Report
```

---

# 📂 Project Structure

```
AI-Powered-Predictive-Maintenance-Agent
│
├── src
│   ├── main
│   │
│   ├── java
│   │   └── com.predictivemaintenance
│   │       ├── controller
│   │       ├── service
│   │       ├── repository
│   │       ├── model
│   │       ├── dto
│   │       ├── config
│   │       ├── security
│   │       ├── prompt
│   │       ├── rag
│   │       ├── utils
│   │       └── exception
│   │
│   └── resources
│       ├── static
│       ├── templates
│       └── application.properties
│
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── README.md
```

---

# 🗄️ Database Collections

## MongoDB

- Users
- Machines
- Predictions
- MaintenanceReports

## ChromaDB

- Machine Manuals
- Maintenance Manuals
- Historical Maintenance Cases
- Failure Knowledge Base
- Repair Procedures

---

# 🌐 REST API Endpoints

| Method | Endpoint | Description |
|----------|--------------------------|---------------------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | User Login |
| GET | `/api/dashboard` | Dashboard Statistics |
| POST | `/api/machines` | Add Machine |
| GET | `/api/machines` | Get All Machines |
| PUT | `/api/machines/{id}` | Update Machine |
| DELETE | `/api/machines/{id}` | Delete Machine |
| POST | `/api/predict` | Predict Machine Failure |
| GET | `/api/reports` | Maintenance Reports |
| GET | `/api/search` | Search Reports |

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/AI-Powered-Predictive-Maintenance-Agent.git
```

## Navigate to Project

```bash
cd AI-Powered-Predictive-Maintenance-Agent
```

## Build Project

```bash
mvn clean install
```

## Run Application

```bash
mvn spring-boot:run
```

Application URL:

```
http://localhost:8080
```

---

# 🐳 Docker Deployment

```bash
docker-compose up --build
```


