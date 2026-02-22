# MediSync API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "doctor|patient|pharmacy|admin",
  "phone": "+1234567890",
  "doctorData": {
    "hospitalId": "hospital_id",
    "firstName": "John",
    "lastName": "Doe",
    "specialty": "General Physician",
    "qualification": "MD, MBBS",
    "licenseNumber": "DOC-001"
  }
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "profile": {...},
    "token": "jwt_token"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@demo.com",
  "password": "demo123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "profile": {...},
    "token": "jwt_token"
  }
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {...},
    "profile": {...}
  }
}
```

---

## 2. Doctor Endpoints

### Get Dashboard
```http
GET /api/doctor/dashboard
Authorization: Bearer <doctor_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "statistics": {
      "todayPrescriptions": 5,
      "activePatients": 25,
      "totalPrescriptions": 150
    },
    "recentPrescriptions": [...]
  }
}
```

### Create Prescription
```http
POST /api/doctor/prescriptions
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "patientId": "patient_id",
  "patientName": "John Doe",
  "patientAge": 34,
  "patientGender": "Male",
  "diagnosis": "Upper Respiratory Tract Infection",
  "symptoms": "Fever, cough, sore throat",
  "medicines": [
    {
      "medicineName": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "Three times daily",
      "duration": "7 days",
      "quantity": 21,
      "instructions": "Take after meals"
    }
  ],
  "doctorNotes": "Rest and stay hydrated",
  "urgent": false
}

Response: 201 Created
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {...}
}
```

### Get All Prescriptions
```http
GET /api/doctor/prescriptions?status=active&page=1&limit=10
Authorization: Bearer <doctor_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "prescriptions": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10
    }
  }
}
```

### Send Prescription to Pharmacy
```http
POST /api/doctor/prescriptions/:id/send
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "pharmacyId": "pharmacy_id",
  "deliveryType": "pickup",
  "patientNotes": "Please call before preparing"
}

Response: 201 Created
{
  "success": true,
  "message": "Prescription sent to pharmacy successfully",
  "data": {...}
}
```

---

## 3. Patient Endpoints

### Get Dashboard
```http
GET /api/patient/dashboard
Authorization: Bearer <patient_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "patient": {...},
    "statistics": {...},
    "recentPrescriptions": [...],
    "activeOrders": [...]
  }
}
```

### Get Prescriptions
```http
GET /api/patient/prescriptions?status=active&page=1&limit=10
Authorization: Bearer <patient_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "prescriptions": [...],
    "pagination": {...}
  }
}
```

### Get Order Tracking
```http
GET /api/patient/orders/:id
Authorization: Bearer <patient_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "orderId": "ORD000001",
    "status": "packing",
    "estimatedTime": 30,
    "pharmacy": {...},
    "items": [...],
    "timeline": [...]
  }
}
```

---

## 4. Pharmacy Endpoints

### Get Dashboard
```http
GET /api/pharmacy/dashboard
Authorization: Bearer <pharmacy_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "statistics": {
      "todayOrders": 15,
      "pendingOrders": 5,
      "lowStockItems": 3
    },
    "recentOrders": [...]
  }
}
```

### Get Orders
```http
GET /api/pharmacy/orders?status=checking_stock&page=1&limit=10
Authorization: Bearer <pharmacy_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {...}
  }
}
```

### Update Order Status
```http
PUT /api/pharmacy/orders/:id
Authorization: Bearer <pharmacy_token>
Content-Type: application/json

{
  "status": "confirmed",
  "estimatedTime": 30,
  "pharmacyNotes": "All medicines available",
  "items": [
    {
      "medicineName": "Amoxicillin",
      "dosage": "500mg",
      "quantity": 21,
      "unitPrice": 0.50,
      "totalPrice": 10.50,
      "availability": "available"
    }
  ]
}

Response: 200 OK
{
  "success": true,
  "message": "Order updated successfully",
  "data": {...}
}
```

### Get Inventory
```http
GET /api/pharmacy/inventory?status=in_stock&search=amoxicillin
Authorization: Bearer <pharmacy_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "inventory": [...],
    "stockSummary": [...],
    "pagination": {...}
  }
}
```

### Update Inventory
```http
PUT /api/pharmacy/inventory/:id
Authorization: Bearer <pharmacy_token>
Content-Type: application/json

{
  "availableQuantity": 50,
  "unitPrice": 5.99,
  "minimumStockLevel": 10
}

Response: 200 OK
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {...}
}
```

---

## 5. Local User Endpoints (No Auth Required)

### Upload Prescription (OCR)
```http
POST /api/local/upload-prescription
Content-Type: multipart/form-data

Form Data:
- prescription: (file) prescription_image.jpg

Response: 200 OK
{
  "success": true,
  "message": "Prescription processed successfully",
  "data": {
    "prescription": {
      "patientName": "John Doe",
      "medicines": [...]
    },
    "imageUrl": "/uploads/prescriptions/..."
  }
}
```

### Find Nearby Pharmacies
```http
POST /api/local/pharmacies/nearby
Content-Type: application/json

{
  "latitude": 40.730610,
  "longitude": -73.935242,
  "radius": 5,
  "medicines": ["Amoxicillin", "Paracetamol"]
}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "pharmacy_id",
      "name": "HealthPlus Pharmacy",
      "distance": 0.5,
      "rating": 4.7,
      "availabilityStatus": "all_available",
      "totalPrice": 35.50,
      "estimatedTime": 25
    }
  ]
}
```

---

## 6. Hospital Endpoints

### Get All Hospitals
```http
GET /api/hospitals?search=city&city=New York&page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": {
    "hospitals": [...],
    "pagination": {...}
  }
}
```

### Get Hospital Details
```http
GET /api/hospitals/:id

Response: 200 OK
{
  "success": true,
  "data": {...}
}
```

---

## Order Status Flow

```
prescription_sent → received_by_pharmacy → checking_stock → confirmed → 
packing → ready_for_pickup → completed
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Additional error details"]
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Upload endpoints: 20 requests per hour

---

## Demo Credentials

After running seeder (`npm run seed`):

- **Doctor**: doctor@demo.com / demo123
- **Patient**: patient@demo.com / demo123
- **Pharmacy**: pharmacy@demo.com / demo123
- **Admin**: admin@demo.com / admin123
