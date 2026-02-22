# MediSync Backend API

Digital Prescription & Pharmacy Coordination Platform - Backend API

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Doctor, Patient, Pharmacy, Admin)
- **Doctor Portal**: Create digital prescriptions, manage patients, voice-to-text support
- **Patient Portal**: View prescriptions, track orders, manage health records
- **Pharmacy Portal**: Receive prescriptions, manage inventory, process orders
- **Local User Access**: Upload physical prescriptions (OCR), find nearby pharmacies
- **Real-time Pharmacy Network**: Location-based pharmacy search with availability
- **Order Management**: Complete prescription fulfillment workflow
- **Analytics Dashboard**: Insights for doctors and pharmacies
- **File Upload**: Prescription images, profile photos, signatures
- **Security**: Rate limiting, helmet.js, input validation

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - MongoDB connection string
   - JWT secret
   - Other optional services

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📁 Project Structure

```
backend/
├── controllers/       # Request handlers
│   ├── authController.js
│   ├── doctorController.js
│   ├── patientController.js
│   ├── pharmacyController.js
│   ├── localController.js
│   └── hospitalController.js
├── models/           # MongoDB schemas
│   ├── User.js
│   ├── Doctor.js
│   ├── Patient.js
│   ├── Pharmacy.js
│   ├── Hospital.js
│   ├── Prescription.js
│   ├── Medicine.js
│   ├── Order.js
│   ├── Inventory.js
│   └── Billing.js
├── routes/           # API routes
│   ├── auth.js
│   ├── doctor.js
│   ├── patient.js
│   ├── pharmacy.js
│   ├── local.js
│   └── hospital.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── roleCheck.js
│   ├── upload.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── uploads/          # File storage
├── server.js         # App entry point
├── package.json
└── .env.example
```

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/profile       # Get user profile
PUT    /api/auth/profile       # Update profile
POST   /api/auth/logout        # Logout
```

### Doctor Routes
```
GET    /api/doctor/dashboard           # Doctor dashboard stats
POST   /api/doctor/prescriptions       # Create prescription
GET    /api/doctor/prescriptions       # Get all prescriptions
GET    /api/doctor/prescriptions/:id   # Get single prescription
PUT    /api/doctor/prescriptions/:id   # Update prescription
POST   /api/doctor/prescriptions/:id/send  # Send to pharmacy
GET    /api/doctor/patients            # Get patients list
GET    /api/doctor/analytics           # Get analytics
```

### Patient Routes
```
GET    /api/patient/dashboard          # Patient dashboard
GET    /api/patient/prescriptions      # Get prescriptions
GET    /api/patient/prescriptions/:id  # Get prescription details
GET    /api/patient/orders             # Get orders
GET    /api/patient/orders/:id         # Get order tracking
GET    /api/patient/billing            # Get billing history
PUT    /api/patient/preferred-pharmacies  # Update preferences
POST   /api/patient/prescriptions/:id/refill  # Request refill
```

### Pharmacy Routes
```
GET    /api/pharmacy/dashboard         # Pharmacy dashboard
GET    /api/pharmacy/orders            # Get incoming orders
GET    /api/pharmacy/orders/:id        # Get order details
PUT    /api/pharmacy/orders/:id        # Update order status
POST   /api/pharmacy/orders/:id/bill   # Generate bill
GET    /api/pharmacy/inventory         # Get inventory
POST   /api/pharmacy/inventory         # Add inventory item
PUT    /api/pharmacy/inventory/:id     # Update inventory
GET    /api/pharmacy/analytics         # Get analytics
```

### Local User Routes
```
POST   /api/local/upload-prescription  # Upload prescription image (OCR)
POST   /api/local/pharmacies/nearby    # Find nearby pharmacies
POST   /api/local/prescriptions        # Save prescription
GET    /api/local/prescriptions/:id    # Get prescription
```

### Hospital Routes
```
GET    /api/hospitals        # Get all hospitals
GET    /api/hospitals/:id    # Get hospital details
POST   /api/hospitals        # Create hospital (admin)
PUT    /api/hospitals/:id    # Update hospital (admin)
DELETE /api/hospitals/:id    # Deactivate hospital (admin)
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Doctor**: Create prescriptions, manage patients
- **Patient**: View prescriptions, track orders
- **Pharmacy**: Receive prescriptions, manage inventory
- **Admin**: System administration

## 📊 Database Schema

### Collections
- `users` - User authentication
- `doctors` - Doctor profiles
- `patients` - Patient profiles
- `pharmacies` - Pharmacy profiles
- `hospitals` - Hospital information
- `prescriptions` - Digital prescriptions
- `medicines` - Medicine database
- `orders` - Prescription orders
- `inventory` - Pharmacy inventory
- `billings` - Billing records

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set in `.env`

### MongoDB Atlas
1. Create cluster on MongoDB Atlas
2. Update `MONGO_URI` in `.env`

### Heroku Deployment
```bash
heroku create medisync-api
git push heroku main
heroku config:set NODE_ENV=production
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on all routes
- Helmet.js security headers
- Input validation
- File upload restrictions
- CORS configuration
- MongoDB injection prevention

## 📈 Performance

- Database indexing on frequently queried fields
- Connection pooling
- Compression middleware
- Efficient pagination

## 🐛 Error Handling

Global error handler catches:
- Validation errors
- Database errors
- Authentication errors
- File upload errors
- Custom application errors

## 📞 Support

For issues and questions, please open an issue in the repository.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Express.js
- MongoDB & Mongoose
- JWT
- All open-source contributors
