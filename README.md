# 🔍 MERN FindIt - Lost & Found Platform

A full-stack **MERN** application that helps users report and claim lost or found items in their community. Built with modern technologies including Express, MongoDB, Cloudinary, and JWT authentication.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT
- Secure password hashing with bcryptjs
- Password reset via email tokens
- User profiles with ratings and verification

### 📦 Item Management
- Post lost/found items with images
- Search and filter items by type, category, location
- Automatic soft-delete for data retention
- View tracking

### 🤝 Claiming & Resolution Workflow
- Users can claim items matching their needs
- Item owner verification process
- Rating system for successful resolutions
- Admin verification for trusted users

### 🖼️ Cloud Image Storage
- Cloudinary integration for all image uploads
- Auto-optimized & globally cached images
- Support for profile images, cover images, and item photos
- Automatic cleanup on item/user deletion

### 🛡️ Security Features
- HTTP-only secure cookies
- JWT token-based authentication
- Authorization checks on all sensitive operations
- Input validation and sanitization
- XSS protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Cloudinary account (free tier works)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/mern-findit.git
cd mern-findit

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your credentials to .env
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: Any random string for token signing
# - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
# - CLOUDINARY_API_KEY: Your Cloudinary API key
# - CLOUDINARY_API_SECRET: Your Cloudinary API secret

# Start development server
npm run dev

# Server runs on http://localhost:5001
```

---

## 📁 Project Structure

```
mern_findit/
├── app.js                      # Express app setup
├── package.json                # Dependencies
├── config/
│   ├── db.config.js           # MongoDB connection
│   └── cloudinary.config.js    # Cloudinary setup
├── controllers/
│   ├── auth.controller.js      # Authentication logic
│   ├── user.controller.js      # User management
│   └── item.controller.js      # Item CRUD & workflow
├── models/
│   ├── user.model.js           # User schema
│   └── item.model.js           # Item schema
├── routers/
│   ├── auth.router.js          # Auth endpoints
│   ├── user.router.js          # User endpoints
│   └── item.router.js          # Item endpoints
├── middleware/
│   ├── auth.middleware.js      # JWT verification
│   └── upload.middleware.js    # File upload handling
└── utils/
    └── cloudinary.utils.js     # Cloudinary helpers
```

---

## 🔌 API Endpoints

### Authentication (5 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users (5 endpoints)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete account
- *(Profile image upload included in update)*

### Items (10+ endpoints)
- `POST /api/items` - Create item with images
- `GET /api/items` - Get items with filtering
- `GET /api/items/:id` - Get item details
- `GET /api/items/search?q=` - Search items
- `GET /api/items/user/:userId` - Get user's items
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/claim` - Claim item
- `POST /api/items/:id/unclaim` - Cancel claim
- `POST /api/items/:id/resolve` - Mark as resolved with rating
- `POST /api/items/:id/verify` - Admin verification

**📖 [Complete API Documentation →](./FRONTEND_DEVELOPER_GUIDE.md)**

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.2.1
- **Database:** MongoDB with Mongoose 9.1.5
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Security:** bcryptjs 3.0.3
- **File Upload:** Multer 1.4.5-lts.1
- **Cloud Storage:** Cloudinary 1.42.0

### Frontend (Ready for Integration)
- React (with component structure)
- Axios or Fetch API for requests
- React Router for navigation
- Context API / Redux for state management

---

## 🌐 Cloudinary Setup

1. **Create Account:** Sign up at [cloudinary.com](https://cloudinary.com)
2. **Get Credentials:** Find in Dashboard → Settings → API Keys
3. **Add to .env:**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. **Automatic Folders:** Images auto-organize into:
   - `findit/items/` - Item photos
   - `findit/profiles/` - Profile pictures
   - `findit/covers/` - Cover images

---

## 🧪 Testing Endpoints

### Automated Testing (Windows)
```bash
npm run dev
# In another terminal:
.\test-endpoints.ps1
```

### Automated Testing (Linux/Mac)
```bash
npm run dev
# In another terminal:
./test-endpoints.sh
```

### Manual Testing
```bash
# Register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Get items
curl http://localhost:5001/api/items

# Create item (with token)
curl -X POST http://localhost:5001/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Lost Keys" \
  -F "type=lost" \
  -F "images=@path/to/image.jpg"
```

---

## 📚 Available Documentation

| Document | Purpose |
|----------|---------|
| [FRONTEND_DEVELOPER_GUIDE.md](./FRONTEND_DEVELOPER_GUIDE.md) | Complete API reference & integration guide for frontend devs |
| [.env.example](./.env.example) | Environment variables template |

---

## 🔒 Security Checklist

- ✅ Passwords hashed with 10-round bcryptjs
- ✅ JWT tokens expire in 1 hour
- ✅ HTTP-only cookies prevent XSS
- ✅ Authorization checks on all sensitive routes
- ✅ Input validation on all endpoints
- ✅ Automatic image cleanup on data deletion
- ✅ Cloudinary API credentials never exposed
- ✅ MongoDB connection uses credentials

---

## 📝 Environment Variables

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/findit

# Security
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5001
NODE_ENV=development
```

---

## 🚀 Deployment

### Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas URI
heroku config:set MONGO_URI=your_mongodb_uri

# Add other env vars
heroku config:set JWT_SECRET=your_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_name
heroku config:set CLOUDINARY_API_KEY=your_key
heroku config:set CLOUDINARY_API_SECRET=your_secret

# Deploy
git push heroku main
```

### Deploy to Vercel / Railway / Render
See individual platform documentation - all are compatible with Express.js

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  rating: Number (average from resolutions),
  bio: String,
  link: String,
  profileimg: String (Cloudinary URL),
  coverimg: String (Cloudinary URL),
  isVerified: Boolean,
  createdAt: Date
}
```

### Item Model
```javascript
{
  title: String,
  description: String,
  type: "lost" | "found",
  category: String,
  location: { name: String, coordinates: [lat, lng] },
  images: [String] (Cloudinary URLs),
  reportedBy: ObjectId (User reference),
  claimedBy: ObjectId (User reference, nullable),
  views: Number,
  isResolved: Boolean,
  isVerified: Boolean,
  deleted: Boolean (soft-delete),
  createdAt: Date
}
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Check MONGO_URI in .env
- Ensure MongoDB is running (if local)
- Verify network access in MongoDB Atlas

### "Cloudinary upload fails"
- Verify credentials in .env
- Check image file size (max 5MB)
- Ensure file format is supported (JPEG, PNG, GIF, WebP)

### "Token not working"
- Token expires after 1 hour - login again
- Include "Bearer " prefix in Authorization header
- Use httpOnly cookie automatically sent with requests

### "Image upload gives 400 error"
- Ensure Content-Type is multipart/form-data (not JSON)
- Check image file is actually selected
- Verify all required fields are present

---

## 📈 Roadmap

- [ ] Email notifications for password reset
- [ ] Real-time notifications for claims
- [ ] Advanced filters (radius search, date range)
- [ ] Item recommendations
- [ ] Mobile app (React Native)
- [ ] Direct messaging between users
- [ ] Admin dashboard
- [ ] Analytics and reporting

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 💬 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check [FRONTEND_DEVELOPER_GUIDE.md](./FRONTEND_DEVELOPER_GUIDE.md) for API help
- Review error messages in server logs

---

## 👨‍💻 Author

Created with ❤️ for helping communities reunite with lost items.

---

**Made with Express, MongoDB, and Cloudinary** ☁️
