# CRM SaaS Backend

A production-ready, API-only Spring Boot backend for a multi-tenant CRM SaaS application with JWT authentication, role-based access control, and comprehensive CRM domain models.

## 🚀 Features

- **Spring Boot 3.4.1** with Java 17
- **Stateless JWT Authentication** with BCrypt password hashing
- **Multi-Tenancy** using tenant discriminator approach
- **Role-Based Access Control** (ADMIN, SALES, VIEWER)
- **RESTful APIs** with pagination and sorting
- **OpenAPI/Swagger Documentation**
- **H2 In-Memory Database** (easily replaceable with PostgreSQL/MySQL)
- **Spring Boot Actuator** for observability
- **Global Exception Handling**
- **JPA Auditing** with created/updated timestamps

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+

## 🛠️ Tech Stack

- **Framework**: Spring Boot 3.4.1
- **Security**: Spring Security 6 with JWT
- **Database**: H2 (in-memory)
- **ORM**: Spring Data JPA / Hibernate 6
- **API Documentation**: SpringDoc OpenAPI 3
- **Build Tool**: Maven

## 📦 Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd crm-backend
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## 🗄️ Database Console

Access the H2 database console at: http://localhost:8080/h2-console

- **JDBC URL**: `jdbc:h2:mem:crmdb`
- **Username**: `sa`
- **Password**: *(leave empty)*

## 🔐 Authentication Flow

### 1. Register a New User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "password123",
  "organizationName": "Acme Corp"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john.doe",
  "email": "john@example.com",
  "roles": ["SALES"],
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}
```

**Response**: Same as registration

### 3. Use JWT Token

Include the JWT token in all subsequent requests:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## 📖 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Leads
- `POST /api/v1/leads` - Create a new lead
- `GET /api/v1/leads` - Get all leads (paginated)
- `GET /api/v1/leads/{id}` - Get lead by ID
- `PUT /api/v1/leads/{id}` - Update lead
- `DELETE /api/v1/leads/{id}` - Delete lead
- `POST /api/v1/leads/{id}/assign` - Assign lead to user
- `POST /api/v1/leads/{id}/convert` - Convert lead to contact

### Contacts
- `POST /api/v1/contacts` - Create a new contact
- `GET /api/v1/contacts` - Get all contacts (paginated)
- `GET /api/v1/contacts/{id}` - Get contact by ID
- `PUT /api/v1/contacts/{id}` - Update contact
- `DELETE /api/v1/contacts/{id}` - Delete contact

### Deals
- `POST /api/v1/deals` - Create a new deal
- `GET /api/v1/deals` - Get all deals (paginated)
- `GET /api/v1/deals/{id}` - Get deal by ID
- `PUT /api/v1/deals/{id}` - Update deal
- `DELETE /api/v1/deals/{id}` - Delete deal

### Actuator
- `GET /actuator/health` - Health check
- `GET /actuator/info` - Application info
- `GET /actuator/metrics` - Metrics

## 🎯 Example Usage

### Create a Lead

```bash
curl -X POST http://localhost:8080/api/v1/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "company": "Tech Solutions Inc",
    "status": "NEW"
  }'
```

### Get All Leads (with pagination)

```bash
curl -X GET "http://localhost:8080/api/v1/leads?page=0&size=10&sort=createdAt,desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Convert Lead to Contact

```bash
curl -X POST http://localhost:8080/api/v1/leads/{leadId}/convert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a Deal

```bash
curl -X POST http://localhost:8080/api/v1/deals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise License Deal",
    "amount": 50000.00,
    "stage": "OPEN",
    "contactId": "CONTACT_UUID_HERE"
  }'
```

## 🔒 Security

### Roles and Permissions

- **ADMIN**: Full access to all operations
- **SALES**: Can create, read, and update leads, contacts, and deals
- **VIEWER**: Read-only access to all resources

### Tenant Isolation

- Each user belongs to exactly one organization (tenant)
- All business entities (leads, contacts, deals) are isolated by `tenantId`
- Users can only access data from their own organization
- Tenant context is automatically resolved from JWT token

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Controllers                 │  ← REST API Layer
├─────────────────────────────────────┤
│         Services                    │  ← Business Logic
├─────────────────────────────────────┤
│         Repositories                │  ← Data Access
├─────────────────────────────────────┤
│         Entities                    │  ← Domain Models
└─────────────────────────────────────┘
```

### Key Components

- **Security**: JWT authentication filter, Spring Security configuration
- **Tenant Context**: ThreadLocal-based tenant isolation
- **Global Exception Handler**: Centralized error handling
- **Base Entities**: Auditing and multi-tenancy support
- **DTOs**: Request/Response separation

## 📁 Project Structure

```
crm-backend/
├── src/main/java/com/example/crm/
│   ├── auth/              # Authentication APIs
│   ├── common/            # Shared components
│   │   ├── dto/           # Common DTOs
│   │   ├── entity/        # Base entities
│   │   └── exception/     # Exception classes
│   ├── config/            # Configuration classes
│   ├── contact/           # Contact domain
│   ├── deal/              # Deal domain
│   ├── lead/              # Lead domain
│   ├── organization/      # Organization/Tenant domain
│   ├── security/          # Security components
│   ├── tenant/            # Tenant context
│   └── user/              # User domain
├── src/main/resources/
│   └── application.yml    # Application configuration
└── pom.xml                # Maven dependencies
```

## ⚙️ Configuration

Key configuration properties in `application.yml`:

```yaml
jwt:
  secret: YOUR_SECRET_KEY
  expiration: 86400000  # 24 hours

spring:
  datasource:
    url: jdbc:h2:mem:crmdb
    
cors:
  allowed-origins: http://localhost:3000,http://localhost:4200
```

## 🚢 Production Deployment

For production deployment:

1. **Replace H2 with PostgreSQL/MySQL**:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/crmdb
       username: your_username
       password: your_password
     jpa:
       hibernate:
         ddl-auto: validate  # Use Flyway/Liquibase for migrations
   ```

2. **Use environment variables for sensitive data**:
   ```yaml
   jwt:
     secret: ${JWT_SECRET}
   ```

3. **Enable HTTPS** and configure proper CORS origins

4. **Set up proper logging** and monitoring

## 🧪 Testing

Run tests with:
```bash
mvn test
```

## 📊 Monitoring

Access actuator endpoints:
- Health: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics

## 🤝 Contributing

This is a prototype project. For production use:
- Add comprehensive unit and integration tests
- Implement database migrations (Flyway/Liquibase)
- Add rate limiting and API throttling
- Implement refresh tokens
- Add email verification
- Implement audit logging

## 📄 License

This project is a prototype for demonstration purposes.

## 👥 Support

For questions or issues, please refer to the API documentation at `/swagger-ui.html`

---

**Built with ❤️ using Spring Boot 3.x**
