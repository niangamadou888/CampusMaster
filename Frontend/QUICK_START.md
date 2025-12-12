# CampusMaster - Quick Start Guide

## Getting Started

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Configure Environment
The `.env.local` file is already configured with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start the Backend
Ensure your Spring Boot backend is running on port 8080.

### 4. Start the Frontend
```bash
npm run dev
```

Visit http://localhost:3000

## Default Admin Credentials

The backend creates a default admin account:
- **Email**: admin@admin.com
- **Password**: admin123

## Testing the Application

### 1. Test Admin Login
1. Go to http://localhost:3000
2. Click "Sign In"
3. Use admin credentials
4. You'll be redirected to the Admin Dashboard

### 2. Test User Registration
1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
4. You'll be automatically logged in and redirected to User Dashboard

### 3. Test Password Reset
1. Go to login page
2. Click "Forgot your password?"
3. Enter a registered email
4. Check email for reset link (requires backend email configuration)

### 4. Test Admin User Management
1. Login as admin
2. In the "User Management" section
3. Enter: test@example.com
4. Click "Suspend User" to suspend the account
5. Click "Unsuspend User" to reactivate it

## Available Routes

### Public Routes
- `/` - Home page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Forgot password page
- `/auth/reset-password` - Reset password page (with token)

### Protected Routes (User)
- `/user/dashboard` - User dashboard (requires authentication)

### Protected Routes (Admin)
- `/admin/dashboard` - Admin dashboard (requires Admin role)

## Features

- JWT-based authentication
- Role-based access control (User/Admin)
- Profile management
- Password reset via email
- User suspension/unsuspension (Admin only)
- Auto-redirect based on user role
- Responsive design with Tailwind CSS

## Troubleshooting

**Issue**: Build fails
- Run `npm install` to ensure all dependencies are installed

**Issue**: Cannot connect to backend
- Ensure backend is running on http://localhost:8080
- Check CORS configuration in backend

**Issue**: Login fails
- Verify backend is running
- Check network tab in browser dev tools
- Ensure credentials are correct

**Issue**: Styles not loading
- Clear browser cache
- Restart dev server

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Next Steps

1. Test all authentication flows
2. Customize styling to match your brand
3. Add additional features as needed
4. Configure email service in backend for password reset
5. Add more user management features in admin dashboard

For detailed documentation, see `AUTH_IMPLEMENTATION.md`
