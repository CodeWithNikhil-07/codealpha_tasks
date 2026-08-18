# 🚀 Flowboard — Project Management Tool

> A collaborative project management tool built with **Node.js, Express, MongoDB, and EJS** as part of the **CodeAlpha Internship — Task 3**.

Flowboard helps teams organize projects, manage tasks, assign responsibilities, and communicate through task-based comments — all from one simple dashboard.

---

## ✨ Features

### 🔐 Authentication
- User registration and login
- Secure password hashing with bcrypt
- Session-based authentication
- Logout functionality
- Protected routes and access control

### 📁 Project Management
- Create projects
- Edit project details
- Delete projects
- Set project status
- Set start and due dates
- Project owner-based access control

### 👥 Team Collaboration
- Add project members by email
- View project members
- Remove members
- Automatically unassign removed members from tasks

### ✅ Task Management
- Create tasks inside projects
- Assign tasks to project members
- Set task status:
  - To Do
  - In Progress
  - Completed
- Set task priority:
  - Low
  - Medium
  - High
- Set task due dates
- Edit and delete tasks
- Task creator/project owner permissions

### 💬 Task Comments
- Add comments to tasks
- View task discussions
- Display comment author
- Delete comments according to access rules

### 📊 Dashboard
- Project overview
- Task statistics
- Project search
- Project status filtering
- Task filtering and search
- Friendly flash messages

### 🎨 UI & UX
- Responsive interface
- Tailwind CSS styling
- Clean dashboard
- Custom error pages
- Form validation
- User-friendly feedback messages

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Backend runtime |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | MongoDB object modeling |
| **EJS** | Server-side templating |
| **Tailwind CSS** | UI styling |
| **bcryptjs** | Password hashing |
| **express-session** | Session authentication |
| **connect-mongo** | MongoDB session storage |
| **dotenv** | Environment variables |
| **method-override** | PUT/DELETE form requests |

---

## 📂 Project Structure

```text
CodeAlpha_ProjectManagement/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── commentController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   └── Comment.js
│
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   └── commentRoutes.js
│
├── utils/
│   └── access.js
│
├── views/
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   │
│   ├── projects/
│   ├── tasks/
│   └── ...
│
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md