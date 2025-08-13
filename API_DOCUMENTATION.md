# API Documentation

## Base URL
```
http://localhost:3100
```

## Authentication Endpoints

### 1. User Registration (Signup)

**Endpoint:** `POST /auth/signup`

**Description:** Register a new user account

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400) - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name must be at least 2 characters long",
    "Please enter a valid email address",
    "Password must be at least 6 characters long"
  ]
}
```

**Error Response (400) - Email Already Exists:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get access token

**Access:** Public

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "lastLogin": "2023-09-06T10:35:00.000Z",
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400) - Missing Fields:**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**Error Response (401) - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Error Response (401) - Account Deactivated:**
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

---

## Frontend Implementation

### API Service Structure

The project includes the following API service files:

1. **`src/services/api.ts`** - Base API configuration with axios
2. **`src/services/authService.ts`** - Authentication service with signup, login, logout
3. **`src/utils/storage.ts`** - localStorage utility functions

### Usage Examples

#### Signup
```typescript
import { authService } from '../services/authService';

try {
  const response = await authService.signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });
  
  if (response.success) {
    console.log('User registered successfully');
    // User is automatically logged in and token is stored
  }
} catch (error) {
  console.error('Signup failed:', error.message);
}
```

#### Login
```typescript
import { authService } from '../services/authService';

try {
  const response = await authService.login({
    email: 'john@example.com',
    password: 'password123'
  });
  
  if (response.success) {
    console.log('Login successful');
    // User is logged in and token is stored
  }
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### Logout
```typescript
import { authService } from '../services/authService';

authService.logout();
// User is logged out, token is removed, and redirected to login page
```

#### Check Authentication Status
```typescript
import { authService } from '../services/authService';

if (authService.isAuthenticated()) {
  console.log('User is logged in');
  const user = authService.getCurrentUser();
  console.log('Current user:', user);
} else {
  console.log('User is not logged in');
}
```

### Automatic Token Management

- **Request Interceptor:** Automatically adds `Authorization: Bearer <token>` header to all API requests
- **Response Interceptor:** Automatically handles 401 errors by clearing localStorage and redirecting to login
- **Token Storage:** JWT tokens are automatically stored in localStorage upon successful authentication
- **User Data:** User information is stored in localStorage and can be accessed throughout the application

### Error Handling

The API service includes comprehensive error handling:

- **Network Errors:** Handles connection issues gracefully
- **Validation Errors:** Displays specific validation messages from the server
- **Authentication Errors:** Automatically handles token expiration and invalid credentials
- **Server Errors:** Provides user-friendly error messages for server issues

### Security Features

- **JWT Tokens:** Secure authentication using JSON Web Tokens
- **Automatic Logout:** Users are automatically logged out on token expiration
- **Secure Storage:** Tokens are stored in localStorage with proper error handling
- **Request Authorization:** All authenticated requests automatically include the auth token
