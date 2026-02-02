# 🚀 MERN FindIt - Frontend Developer API Guide

**Complete API Reference & Integration Guide for Frontend Development**

---

## 📌 Quick Links
- [Base URL](#base-url)
- [Authentication](#-authentication)
- [Endpoints by Category](#-endpoints-by-category)
- [Request Examples](#-request-examples)
- [Error Handling](#-error-handling)
- [Integration Tips](#-integration-tips)

---

## 🌐 Base URL

**Development:**
```
http://localhost:5001/api
```

**Production:**
```
https://mern-findit.onrender.com/api
```

---

## 🔐 Authentication

### JWT Token Flow

```
1. User registers/logs in
2. Server returns JWT token in response & sets httpOnly cookie
3. Include token in Authorization header for protected routes
4. Token expires in 1 hour (get new one via login)
```

### Header Format
```javascript
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example (JavaScript/Fetch)
```javascript
const response = await fetch('https://mern-findit.onrender.com/api/items', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Example (Axios)
```javascript
const config = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
};
axios.get('https://mern-findit.onrender.com/api/items', config);
```

---

## 🔄 Endpoints by Category

### AUTH - User Authentication (5 endpoints)

#### 1. Register User
```
POST /auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation:**
- Name: 2+ characters
- Email: valid format
- Password: 6+ characters

---

#### 2. Login User
```
POST /auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

💾 **Save the user ID in localStorage or state management**

---

#### 3. Logout User
```
POST /auth/logout
Authorization: Bearer TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 4. Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json
```

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

💾 **Pass resetToken to reset password endpoint**

---

#### 5. Reset Password
```
POST /auth/reset-password
Content-Type: application/json
```

**Request:**
```json
{
  "resetToken": "token_from_forgot_password",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

---

### 👤 USER ENDPOINTS (5 endpoints)

#### 6. Get All Users
```
GET /users
Authorization: Bearer TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 4.5,
      "profileimg": "https://res.cloudinary.com/...",
      "coverimg": "https://res.cloudinary.com/...",
      "bio": "Lost and found enthusiast",
      "link": "johndoe.com",
      "createdAt": "2024-02-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

#### 7. Get User by ID
```
GET /users/USER_ID
Authorization: Bearer TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 4.5,
    "profileimg": "https://res.cloudinary.com/...",
    "coverimg": "https://res.cloudinary.com/...",
    "bio": "Lost and found enthusiast",
    "link": "johndoe.com"
  }
}
```

---

#### 8. Update User
```
PUT /users/USER_ID
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
```
name: "Jane Doe" (optional)
bio: "New bio" (optional)
link: "website.com" (optional)
profileimg: <FILE> (optional, single image)
coverimg: <FILE> (optional, single image)
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('name', 'Jane Doe');
formData.append('bio', 'My new bio');
formData.append('profileimg', imageFile); // from input[type="file"]

const response = await fetch(`/api/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {...}
}
```

---

#### 9. Delete User
```
DELETE /users/USER_ID
Authorization: Bearer TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 📦 ITEM ENDPOINTS (10+ endpoints)

#### 10. Create Item
```
POST /items
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
```
title: "Lost iPhone" (required)
description: "Black iPhone lost near library" (required)
type: "lost" | "found" (required)
category: "electronics" | "documents" | "clothing" | "accessories" | "books" | "other" (optional)
location: {"name": "Central Library"} (required - JSON string)
dateOccurred: "2024-02-01T10:00:00Z" (required)
contactMethod: "in-app" | "email" | "phone" (optional)
images: <FILE[]> (optional, max 5 files)
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('title', 'Lost iPhone 14');
formData.append('description', 'Black iPhone lost near library');
formData.append('type', 'lost');
formData.append('category', 'electronics');
formData.append('location', JSON.stringify({
  name: 'Central Library',
  latitude: 40.7128,
  longitude: -74.0060
}));
formData.append('dateOccurred', new Date().toISOString());
formData.append('images', imageFile1);
formData.append('images', imageFile2);

const response = await fetch('/api/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Item posted successfully",
  "item": {
    "_id": "507f2f77bcf86cd799439011",
    "title": "Lost iPhone 14",
    "description": "Black iPhone lost near library",
    "type": "lost",
    "category": "electronics",
    "location": {
      "name": "Central Library",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "images": ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."],
    "views": 0,
    "isResolved": false,
    "isVerified": false,
    "createdAt": "2024-02-01T10:00:00Z"
  }
}
```

---

#### 11. Get All Items
```
GET /items?type=lost&category=electronics&limit=20&page=1
```

**Query Parameters:**
- `type`: "lost" or "found"
- `category`: electronics, documents, clothing, accessories, books, other
- `isResolved`: true or false
- `isVerified`: true or false
- `limit`: number (default 20)
- `page`: number (default 1)

**Response:** `200 OK`
```json
{
  "success": true,
  "items": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

#### 12. Get Item by ID
```
GET /items/ITEM_ID
```

**Note:** No auth required, increments view count

**Response:** `200 OK`
```json
{
  "success": true,
  "item": {
    "_id": "507f2f77bcf86cd799439011",
    "title": "Lost iPhone 14",
    "description": "...",
    "reportedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "rating": 4.5,
      "profileimg": "..."
    },
    "claimedBy": null,
    "images": ["..."],
    "views": 15,
    "isResolved": false,
    "isVerified": true,
    "createdAt": "2024-02-01T10:00:00Z"
  }
}
```

---

#### 13. Search Items
```
GET /items/search?q=iPhone&type=lost&category=electronics
```

**Query Parameters:**
- `q`: search query (min 2 characters, required)
- `type`: optional filter
- `category`: optional filter

**Response:** `200 OK`
```json
{
  "success": true,
  "items": [...],
  "count": 5
}
```

---

#### 14. Get User Items
```
GET /items/user/USER_ID
```

**Response:** `200 OK`
```json
{
  "success": true,
  "items": [...],
  "count": 3
}
```

---

#### 15. Update Item
```
PUT /items/ITEM_ID
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
```
title: (optional)
description: (optional)
category: (optional)
location: (optional, JSON string)
contactMethod: (optional)
images: <FILE[]> (optional - replaces all existing images)
```

**Response:** `200 OK`

---

#### 16. Claim Item
```
POST /items/ITEM_ID/claim
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request:**
```json
{}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item claimed successfully. Contact the poster to verify.",
  "item": {...}
}
```

---

#### 17. Unclaim Item
```
POST /items/ITEM_ID/unclaim
Authorization: Bearer TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Claim cancelled successfully",
  "item": {...}
}
```

---

#### 18. Resolve Item
```
POST /items/ITEM_ID/resolve
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "givenRating": 5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item resolved successfully",
  "item": {...}
}
```

---

#### 19. Verify Item (Admin)
```
POST /items/ITEM_ID/verify
Authorization: Bearer TOKEN
```

**Response:** `200 OK`

---

#### 20. Delete Item
```
DELETE /items/ITEM_ID
Authorization: Bearer TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 📝 Request Examples

### JavaScript/Fetch

**Login Example:**
```javascript
async function login(email, password) {
  const response = await fetch('https://mern-findit.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error(data.message);
}
```

**Get Items Example:**
```javascript
async function getItems(type = 'lost', page = 1) {
  const response = await fetch(
    `https://mern-findit.onrender.com/api/items?type=${type}&page=${page}`,
    {
      method: 'GET'
    }
  );
  
  const data = await response.json();
  return data.items;
}
```

**Protected Request Example:**
```javascript
async function getUserProfile(userId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `https://mern-findit.onrender.com/api/users/${userId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
}
```

---

### Axios

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mern-findit.onrender.com/api'
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
export const login = (email, password) => 
  API.post('/auth/login', { email, password });

// Get items
export const getItems = (type, page) =>
  API.get(`/items?type=${type}&page=${page}`);

// Create item
export const createItem = (formData) =>
  API.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
```

---

## ⚠️ Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Not authorized to update this item"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Item not found"
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Server error while creating item"
}
```

### Handle Errors in Frontend

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    // Show user-friendly error message
    throw error;
  }
}
```

---

## 💡 Integration Tips

### State Management Pattern

```javascript
// Using Context API
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem('token'));
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);

// Login
const handleLogin = async (email, password) => {
  setLoading(true);
  try {
    const data = await login(email, password);
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    setLoading(false);
  }
};
```

### Protected Routes

```javascript
// ProtectedRoute component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Usage
<Routes>
  <Route path="/login" element={<Login />} />
  <Route 
    path="/items" 
    element={
      <ProtectedRoute>
        <Items />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### Image Upload Handling

```javascript
function ImageUpload({ onUpload }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', 'Item title');
    formData.append('description', 'Item description');
    // Add other fields...
    
    images.forEach(img => {
      formData.append('images', img);
    });

    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleChange} 
      />
      <button type="submit">Post Item</button>
    </form>
  );
}
```

---

## 🎯 Common Workflows

### Complete Lost Item Reporting
1. User logs in
2. User creates item (type: "lost")
3. User uploads photos
4. Item appears in feed
5. Other users can claim/view
6. Owner resolves when found

### Item Claiming Process
1. User finds item
2. User claims item
3. Owner contacts via preferred method
4. Owner verifies and resolves
5. Owner gives rating
6. Item marked as resolved

---

## 📊 Categories

Available item categories:
- `electronics` - phones, laptops, etc.
- `documents` - ID, passport, etc.
- `clothing` - jackets, shoes, etc.
- `accessories` - keys, wallets, etc.
- `books` - textbooks, novels, etc.
- `other` - miscellaneous

---

## 🔒 Security Notes

✅ All passwords hashed on server  
✅ Tokens expire in 1 hour  
✅ Use HTTPS in production  
✅ Never expose JWT_SECRET  
✅ Validate input on frontend  
✅ Sanitize user content  

---

## 📱 Development Server

```bash
# Start backend
npm run dev
# Production: https://mern-findit.onrender.com
# Development: http://localhost:5001
```

---

## 🚀 Production Deployment

1. Update BASE_URL to production server
2. Ensure HTTPS is enabled
3. Check environment variables
4. Test all endpoints
5. Monitor error logs

---

**Happy coding! 🎉**
