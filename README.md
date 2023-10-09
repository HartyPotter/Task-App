# Task Manager Backend

This repository contains the backend code for a Task Manager application built with JavaScript, Node.js, and MongoDB. This README provides an overview of the project, instructions for setup and configuration, and guidance on using the API.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Task Manager backend is the server-side component of a task management application. It provides RESTful API endpoints for managing tasks and user accounts. The backend is built using Node.js, Express.js, and MongoDB, and it includes authentication features for user registration and login.

## Features

- User authentication using JWT (JSON Web Tokens).
- Create, read, update, and delete tasks.
- Create and manage user accounts.
- Secure API endpoints with authentication middleware.
- Error handling and validation.
- Email sending.
- Unit testing using jest and supertest.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.
- MongoDB server running (locally or on a remote server).
- A code editor (e.g., Visual Studio Code).

## Getting Started

### Installation

To install and set up the project, follow these steps:

1. Clone the repository to your local machine:

 ```bash
 git clone https://github.com/your-username/task-manager-backend.git
 ```

2. Navigate to the project directory:

```bash
cd task-manager-backend
 ```

3. Install the required dependencies:
  
```bash
npm install
```

## Configuration
Before running the application, you need to configure the environment variables. Create a new directory named config in the root of the project and create a .env file and add the following variables:

```env
PORT=3000
NODEMAILER_KEY=your-nodemailer-api-key
JWT_SECRET=your-jwt-secret-key
MONGOOSE_URL=your-mongodb-connection-url
```
- `PORT`: The port on which the server will run.
- `MONGODB_URL`: The connection URL for your MongoDB database.
- `JWT_SECRET`: A secret key for JWT token generation.
- `NODEMAILER`: API key for the mailing service.


### Usage
API Endpoints
The Task Manager API provides the following endpoints:

User Routes:

- `POST /users` - Register a new user.
- `POST /users/login` - Login and generate an authentication token.
- `POST /users/logout` - Logout and invalidate the current token.
- `POST /users/logoutAll` - Logout from all devices.
- `GET /users/me` - Get user profile.
- `PATCH /users/me` - Update user profile.
- `DELETE /users/me` - Delete user account.

Task Routes:

- `POST /tasks` - Create a new task.
- `GET /tasks` - Get all tasks.
- `GET /tasks/:id` - Get a specific task.
- `PATCH /tasks/:id` - Update a task.
- `DELETE /tasks/:id` - Delete a task.

## Authentication
To access protected routes, you need to obtain an authentication token by registering a new user or logging in. Include the token in the Authorization header of your requests:
```makefile
Authorization: Bearer your-auth-token
```

## Testing
Unit tests are included in the project to ensure the functionality of the API. You can run the tests using the following command:

```bash
npm test
```

## Contributing
Contributions are welcome! Feel free to open issues or pull requests to improve this project.
