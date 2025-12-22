# Real Estate Management Microservices Platform

A comprehensive microservices-based real estate management system built with Spring Cloud, featuring distributed data management, advanced search capabilities, and analytics dashboards.

## 🏗️ Architecture

This platform demonstrates modern microservices architecture patterns including:
- **Service Discovery** with Eureka
- **Centralized Configuration** with Spring Cloud Config
- **API Gateway** with JWT authentication
- **Inter-service Communication** with OpenFeign
- **Resilience Patterns** with Circuit Breaker
- **Distributed Data Management** with separate MySQL databases per service

## 📋 Microservices

### Infrastructure Services

1. **Config Server** (Port 8888)
   - Centralized configuration management
   - Git-backed configuration repository
   - Environment-specific profiles

2. **Eureka Server** (Port 8761)
   - Service discovery and registration
   - Health monitoring
   - Load balancing support

3. **API Gateway** (Port 8080)
   - Single entry point for all requests
   - JWT authentication and authorization
   - Request logging and routing

### Business Services

4. **Property Service** (Port 8081)
   - Property CRUD operations
   - Advanced search with JPA Specifications
   - Property statistics and analytics
   - **Custom Configuration**: `mes-config-ms.properties-last=10` (shows properties from last 10 days)

5. **Client Service** (Port 8082)
   - Client, Agent, and Visit management
   - OpenFeign integration with Property Service
   - Visit scheduling and tracking
   - **Custom Configuration**: `mes-config-ms.visits-last=15` (shows visits from last 15 days)

6. **Interface Service** (Port 8083)
   - Data aggregation from multiple services
   - Dashboard statistics
   - Enhanced search with property + agent data
   - Circuit Breaker for resilience
   - **Custom Configuration**: `mes-config-ms.recent-activities-days=7`

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- MySQL 8.0
- Node.js 18+ (for frontend)
- Git

### Database Setup

Create two MySQL databases:

```sql
CREATE DATABASE property_db;
CREATE DATABASE client_db;
```

Update credentials in `config-repo/*.properties` if needed (default: root/root).

### Running the Services

Start services in the following order:

1. **Config Server**
```bash
cd config-server
mvn spring-boot:run
```

2. **Eureka Server**
```bash
cd eureka-server
mvn spring-boot:run
```
Access at: http://localhost:8761

3. **Property Service**
```bash
cd property-service
mvn spring-boot:run
```

4. **Client Service**
```bash
cd client-service
mvn spring-boot:run
```

5. **Interface Service**
```bash
cd interface-service
mvn spring-boot:run
```

6. **API Gateway**
```bash
cd api-gateway
mvn spring-boot:run
```

### Running the Frontend

```bash
cd frontend
npm install
npm start
```
Access at: http://localhost:3000

## 🔐 Authentication

All API requests (except `/api/auth/login`) require JWT authentication.

### Login

```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "agent1",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "username": "agent1",
  "message": "Authentication successful"
}
```

Use the token in subsequent requests:
```
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Property Service (via Gateway)

- `GET /api/properties` - List all properties (paginated)
- `GET /api/properties/{id}` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/{id}` - Update property
- `DELETE /api/properties/{id}` - Delete property
- `GET /api/properties/search` - Advanced search
- `GET /api/properties/statistics` - Property statistics
- `GET /api/properties/agent/{agentId}` - Properties by agent

### Client Service (via Gateway)

- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/{id}/properties` - Agent portfolio (OpenFeign)
- `GET /api/visits` - List visits
- `POST /api/visits` - Create visit
- `GET /api/visits/recent` - Recent visits (uses custom config)

### Interface Service (via Gateway)

- `GET /api/dashboard/statistics` - Overall platform statistics
- `GET /api/dashboard/agent/{id}` - Agent dashboard
- `GET /api/dashboard/client/{id}` - Client dashboard
- `GET /api/search/properties` - Enhanced property search
- `POST /api/bookings` - Create visit booking

## 📊 Custom Configuration Properties

The project demonstrates externalized configuration with custom properties:

### Property Service
- `mes-config-ms.properties-last=10` - Show properties created in last N days
- `mes-config-ms.properties-page-size=20` - Default page size

### Client Service
- `mes-config-ms.visits-last=15` - Show visits from last N days
- `mes-config-ms.clients-page-size=20` - Default page size

### Interface Service
- `mes-config-ms.dashboard-refresh-interval=30` - Dashboard refresh rate (seconds)
- `mes-config-ms.recent-activities-days=7` - Recent activities window

### API Gateway
- `mes-config-ms.rate-limit-requests=100` - Rate limit per window
- `mes-config-ms.rate-limit-window-seconds=60` - Rate limit window

These properties are centralized in `config-repo/` and can be updated without restarting services (with Spring Cloud Bus).

## 🔍 API Documentation

Each service provides Swagger UI documentation:

- Property Service: http://localhost:8081/swagger-ui.html
- Client Service: http://localhost:8082/swagger-ui.html
- Interface Service: http://localhost:8083/swagger-ui.html

## 📈 Monitoring & Health Checks

All services expose Actuator endpoints:

- Health: `http://localhost:PORT/actuator/health`
- Metrics: `http://localhost:PORT/actuator/metrics`
- Environment: `http://localhost:PORT/actuator/env`

## 🛡️ Resilience Features

- **Circuit Breaker**: Interface Service uses Resilience4j for fault tolerance
- **Fallback Methods**: Graceful degradation when services are unavailable
- **Health Checks**: Continuous monitoring via Actuator
- **Service Discovery**: Automatic service registration and discovery

## 🗄️ Database Schema

### Property Database
- `properties` table with indexes on: city, type, status, price, agent_id, created_at

### Client Database
- `clients` table
- `agents` table
- `visits` table with indexes on: property_id, client_id, status, visit_date

## 🎯 Data Engineering Highlights

This project demonstrates key data engineering concepts:

1. **Distributed Data Management**: Each microservice has its own database
2. **Data Aggregation**: Interface Service aggregates data from multiple sources
3. **Advanced Search**: Complex filtering with JPA Specifications
4. **Analytics & Reporting**: Real-time statistics and dashboards
5. **Performance Optimization**: Database indexing, pagination, caching
6. **ETL Patterns**: Data synchronization across services

## 📁 Project Structure

```
real-estate-platform/
├── config-server/          # Centralized configuration
├── eureka-server/          # Service discovery
├── api-gateway/            # API Gateway with JWT
├── property-service/       # Property management
├── client-service/         # Client & Agent management
├── interface-service/      # Data aggregation layer
├── config-repo/            # Git-backed configurations
├── frontend/               # React application
└── README.md
```

## 🔄 Git Version Control

All code is version-controlled with Git. Configuration repository is separate:

```bash
# Main repository
cd /Users/administrateur/real-estate-platform
git log

# Configuration repository
cd /Users/administrateur/real-estate-platform/config-repo
git log
```

## 🧪 Testing

Example API calls using curl:

### Create an Agent
```bash
curl -X POST http://localhost:8080/api/agents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@realestate.com",
    "phone": "+1234567890",
    "specialization": "Luxury Properties"
  }'
```

### Create a Property
```bash
curl -X POST http://localhost:8080/api/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Villa in Downtown",
    "description": "Beautiful 4-bedroom villa...",
    "type": "VILLA",
    "price": 750000,
    "surface": 250,
    "rooms": 4,
    "bathrooms": 3,
    "address": "123 Main St",
    "city": "New York",
    "status": "AVAILABLE",
    "agentId": 1
  }'
```

### Search Properties
```bash
curl "http://localhost:8080/api/properties/search?city=New%20York&minPrice=500000&maxPrice=1000000&type=VILLA" \
  -H "Authorization: Bearer <token>"
```

### Get Dashboard Statistics
```bash
curl http://localhost:8080/api/dashboard/statistics \
  -H "Authorization: Bearer <token>"
```

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.2.0, Java 17
- **Cloud**: Spring Cloud 2023.0.0
- **Database**: MySQL 8.0
- **Service Discovery**: Eureka
- **API Gateway**: Spring Cloud Gateway
- **Configuration**: Spring Cloud Config
- **Communication**: OpenFeign
- **Resilience**: Resilience4j
- **Security**: JWT (jjwt 0.12.3)
- **Monitoring**: Spring Boot Actuator
- **Documentation**: Springdoc OpenAPI 3
- **Frontend**: React 18, Axios, Recharts, Material-UI
- **Build Tool**: Maven

## 📝 Development Notes

- All services use Spring Boot 3.2.0 for latest features
- Lombok is used to reduce boilerplate code
- JPA with Hibernate for ORM
- MySQL with proper indexing for performance
- Circuit breaker configured for inter-service calls
- Actuator endpoints secured and monitored
- CORS configured for frontend integration

## 🎓 Learning Outcomes

This project demonstrates:
- Microservices architecture patterns
- Spring Cloud ecosystem
- Distributed data management
- Service-to-service communication
- API Gateway pattern
- Circuit breaker pattern
- Centralized configuration
- JWT authentication
- RESTful API design
- Data aggregation strategies

## 📧 Support

For questions or issues, please refer to the API documentation or check the service logs.

## 📄 License

This project is developed for educational and portfolio purposes.
