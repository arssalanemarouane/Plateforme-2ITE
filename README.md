# ENSAJ 2ITE - Pedagogical Management Platform

Integrated pedagogical management platform developed for the 2ITE department at ENSA El Jadida.  
The platform simplifies communication and administrative management between administrators, professors, and students.

---

# Features

## Administrator

### Student Management
- Add student accounts
- Delete student accounts

### Professor Management
- Add professor accounts
- Delete professor accounts

### Module Management
- Create modules
- Assign a responsible professor for each module

### Schedule Management
- Upload schedules for each academic year
- Replace schedules when necessary
- Image-based schedule management

### Announcements
- Publish announcements
- Upload downloadable documents

### Administrative Requests
- Receive complaints and requests
- Manage certificate requests
- Send administrative documents

### Absence Management
- Add absences
- Justify absences
- Delete absences
- Track absence hours and details

---

## Professor

### Grade Management
- Add student grades
- Manage normal and retake sessions
- View student results

### Educational Resources
- Upload courses
- Upload TD documents
- Upload TP documents

### Communication
- Messaging system with students

---

## Student

### Academic Space
- View grades
- View schedules
- Track absences

### Educational Resources
- Download courses, TDs, and TPs
- Access announcements

### Administrative Services
- Request certificates
- Submit complaints

### Communication
- Contact professors through the integrated messaging system

---

# Technologies Used

## Backend
- Laravel (PHP)

## Frontend
- React.js
- Tailwind CSS

## Database
- MySQL

## API Communication
- Axios
- REST API

---

# Installation and Setup

## Requirements

Make sure the following tools are installed:

- PHP 8+
- Composer
- Node.js
- NPM
- MySQL

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/USERNAME/REPOSITORY_NAME.git
cd REPOSITORY_NAME
```

---

## 2. Backend Installation (Laravel)

Install PHP dependencies:

```bash
composer install
```

Copy environment configuration file:

```bash
cp .env.example .env
```

Configure your database credentials inside the `.env` file.

Example:

```env
DB_DATABASE=database_name
DB_USERNAME=root
DB_PASSWORD=
```

Generate the application key:

```bash
php artisan key:generate
```

Run migrations and seeders:

```bash
php artisan migrate --seed
```

Create storage symbolic link:

```bash
php artisan storage:link
```

Start the Laravel server:

```bash
php artisan serve
```

---

## 3. Frontend Installation (React)

Install dependencies:

```bash
npm install
```

Start the frontend server:

```bash
npm run dev
```

---

# Platform Roles

The platform includes three main roles:

1. Administrator
2. Professor
3. Student

Each role has dedicated permissions and functionalities.

---

# Technical Features

- Secure authentication system
- Role and permission management
- File upload and download system
- Schedule image management
- REST API communication
- Integrated messaging system

---

# Database Structure

The platform uses Laravel Eloquent relationships to manage:

- Students
- Professors
- Modules
- Grades
- Absences
- Announcements
- Educational documents

---

# Contributors

Developed as part of the 2ITE engineering program at ENSA El Jadida.

Developed by:
- Marwan Arsalan
- Badradine Lachraoui

---

# Important

Do not upload the `.env` file to GitHub.

Make sure your `.gitignore` file contains:

```gitignore
/vendor
/node_modules
.env
/public/storage
```

---

