# CampusMaster Frontend - Authentication Implementation

## Overview

This document describes the complete role-based authentication system implemented for CampusMaster, featuring JWT authentication, user registration, password reset, and separate dashboards for users and administrators.

## Architecture

### Tech Stack
- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API
- **Backend API**: Spring Boot (http://localhost:8080)

## Features Implemented

### 1. Authentication Pages

#### Login Page (`/auth/login`)
- Email and password authentication
- Form validation
- Error handling
- Links to registration and password reset
- Automatic redirection based on user role

#### Registration Page (`/auth/register`)
- User registration with first name, last name, email, and password
- Password confirmation validation
- Minimum password length requirement (6 characters)
- Automatic login after successful registration

#### Forgot Password Page (`/auth/forgot-password`)
- Email-based password reset request
- Success confirmation message
- Integration with backend email service

#### Reset Password Page (`/auth/reset-password`)
- Token-based password reset
- Password confirmation validation
- Automatic redirection to login after success

### 2. Role-Based Dashboards

#### User Dashboard (`/user/dashboard`)
- Protected route (requires authentication)
- Profile information display
- Profile editing capability
- Update first name, last name, and email
- Logout functionality

#### Admin Dashboard (`/admin/dashboard`)
- Protected route (requires Admin role)
- Admin profile information
- User management features:
  - Suspend users by email
  - Unsuspend users by email
- System statistics placeholders
- Logout functionality

### 3. Core Infrastructure

#### Authentication Context (`/context/AuthContext.tsx`)
- Global authentication state management
- User and token storage
- Authentication methods:
  - `login(email, password)`
  - `register(data)`
  - `logout()`
  - `updateUser(data)`
- Helper properties:
  - `isAuthenticated`: Boolean indicating auth status
  - `isAdmin`: Boolean indicating admin role
  - `isLoading`: Boolean for loading state

#### Protected Routes (`/components/ProtectedRoute.tsx`)
- Wrapper component for protected pages
- Automatic redirection for unauthenticated users
- Role-based access control (`requireAdmin` prop)
- Loading state handling

#### API Service (`/services/api.ts`)
- Centralized API communication
- JWT token management
- Error handling with custom ApiError class
- Available methods:
  - `login()`
  - `register()`
  - `forgotPassword()`
  - `resetPassword()`
  - `getUserInfo()`
  - `updateUserInfo()`
  - `suspendUser()`
  - `unsuspendUser()`

#### Storage Utilities (`/utils/storage.ts`)
- LocalStorage wrapper for token and user data
- Server-side rendering safe (checks for `window` object)
- Methods for getting, setting, and removing auth data

#### TypeScript Types (`/types/auth.ts`)
- Complete type definitions for:
  - User and Role models
  - Request/Response interfaces
  - AuthContext interface

## File Structure

```
Frontend/src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── user/
│   │   └── dashboard/page.tsx
│   ├── admin/
│   │   └── dashboard/page.tsx
│   ├── layout.tsx (wrapped with AuthProvider)
│   └── page.tsx (home page with auto-redirect)
├── components/
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
├── types/
│   └── auth.ts
└── utils/
    └── storage.ts
```

## Backend Integration

The frontend integrates with the following Spring Boot endpoints:

### Public Endpoints
- `POST /authenticate` - User login
- `POST /registerNewUser` - User registration
- `POST /forgot-password` - Request password reset
- `POST /reset-password?token={token}` - Reset password with token

### Protected Endpoints (Require JWT)
- `GET /getUserInfo` - Get current user info (User role)
- `PUT /updateUserInfo` - Update user profile (User role)
- `PUT /{email}/suspend` - Suspend user account (Admin role)
- `PUT /{email}/unsuspend` - Unsuspend user account (Admin role)

## User Flow

### New User Registration
1. User visits home page
2. Clicks "Create Account"
3. Fills registration form
4. Backend creates user with "User" role
5. Automatic login after registration
6. Redirected to `/user/dashboard`

### Existing User Login
1. User visits `/auth/login`
2. Enters email and password
3. JWT token received from backend
4. Token and user data stored in localStorage
5. Redirected based on role:
   - Admin → `/admin/dashboard`
   - User → `/user/dashboard`

### Password Reset
1. User clicks "Forgot password" on login page
2. Enters email address
3. Backend generates unique reset token
4. Email sent with reset link containing token
5. User clicks link and enters new password
6. Redirected to login page

### Admin User Management
1. Admin logs in
2. Navigates to admin dashboard
3. Enters user email to manage
4. Can suspend or unsuspend user account

## Security Features

1. **JWT Token Authentication**
   - Tokens stored in localStorage
   - Automatic token inclusion in API requests
   - Token validation on protected routes

2. **Role-Based Access Control**
   - Separate dashboards for User and Admin roles
   - Protected routes prevent unauthorized access
   - Automatic redirection based on role

3. **Password Security**
   - Minimum length requirements
   - Password confirmation on registration and reset
   - Backend uses BCrypt hashing

4. **Error Handling**
   - User-friendly error messages
   - API error catching and display
   - Form validation

## Environment Configuration

Create a `.env.local` file in the Frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Running the Application

### Prerequisites
- Node.js 18+ installed
- Backend Spring Boot API running on port 8080
- PostgreSQL database configured

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Default Admin Credentials
The backend creates a default admin user on startup:
- **Email**: admin@admin.com
- **Password**: admin123

## Testing the Application

### Test User Registration
1. Navigate to http://localhost:3000
2. Click "Create Account"
3. Fill in the form and submit
4. Verify you're redirected to user dashboard

### Test Login
1. Navigate to http://localhost:3000/auth/login
2. Use admin@admin.com / admin123 for admin access
3. Verify redirection to admin dashboard

### Test Password Reset
1. Navigate to http://localhost:3000/auth/forgot-password
2. Enter a registered email
3. Check email for reset link (requires backend email configuration)
4. Follow link and set new password

### Test User Management (Admin)
1. Login as admin
2. Register a new user account
3. In admin dashboard, enter the new user's email
4. Test suspend and unsuspend functionality

## Future Enhancements

Potential features to add:

1. **User List View** - Add endpoint and UI to display all users for admin
2. **Search and Filter** - Add user search and filtering capabilities
3. **Pagination** - Implement pagination for user lists
4. **User Statistics** - Display real user statistics in admin dashboard
5. **Email Verification** - Add email verification on registration
6. **2FA** - Two-factor authentication support
7. **Session Management** - View and manage active sessions
8. **Audit Logs** - Track user actions and changes
9. **Bulk Operations** - Bulk user management operations
10. **Profile Pictures** - User avatar upload and management

## Troubleshooting

### Common Issues

**Issue**: "Network Error" on login
- **Solution**: Ensure backend is running on port 8080
- Check CORS configuration in backend

**Issue**: Redirect loop on protected routes
- **Solution**: Clear localStorage and login again
- Check JWT token validity

**Issue**: "Invalid token" errors
- **Solution**: Token may be expired (5 hour validity)
- Login again to get new token

**Issue**: Style not loading
- **Solution**: Ensure Tailwind CSS is properly configured
- Run `npm run dev` to rebuild

## API Error Handling

The application handles various HTTP status codes:

- **400** - Bad Request (e.g., invalid data)
- **401** - Unauthorized (invalid credentials or expired token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Server Error

All errors are displayed to users with appropriate messages.

## Conclusion

This authentication system provides a complete, production-ready foundation for the CampusMaster application with:
- Secure JWT-based authentication
- Role-based access control
- User-friendly interfaces
- Comprehensive error handling
- TypeScript type safety
- Modern React patterns

The architecture is scalable and can be extended with additional features as needed.
