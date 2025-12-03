# CampusMaster Backend

Backend API built with Spring Boot 3, Java 17, and PostgreSQL.

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL (for production) or H2 (for development)

### Installation

Build the project:

```bash
mvn clean install
```

### Development

Run the application in development mode (uses H2 in-memory database):

```bash
mvn spring-boot:run
```

The API will be available at [http://localhost:8080](http://localhost:8080)

### Database

#### Development (H2)
The application uses H2 in-memory database by default.
- Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:campusmaster`
- Username: `sa`
- Password: (empty)

#### Production (PostgreSQL)
Update `src/main/resources/application-prod.properties` with your PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/campusmaster
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Run with production profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Build

Create a production build:

```bash
mvn clean package
```

Run the JAR file:

```bash
java -jar target/campusmaster-backend-0.0.1-SNAPSHOT.jar
```

## Tech Stack

- **Spring Boot 3.2.5** - Application Framework
- **Java 17** - Programming Language
- **Spring Data JPA** - Data Access Layer
- **PostgreSQL** - Production Database
- **H2** - Development Database
- **Lombok** - Boilerplate Code Reduction
- **Maven** - Build Tool

## Project Structure

```
Backend/
├── src/
│   ├── main/
│   │   ├── java/com/campusmaster/
│   │   │   ├── config/         # Configuration classes
│   │   │   ├── controller/     # REST controllers
│   │   │   ├── model/          # Entity classes
│   │   │   ├── repository/     # Data repositories
│   │   │   ├── service/        # Business logic
│   │   │   ├── dto/            # Data transfer objects
│   │   │   └── exception/      # Exception handling
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API status
- `GET /api/` - Welcome message

## CORS Configuration

The API is configured to accept requests from `http://localhost:3000` (Frontend).

Update `CorsConfig.java` to modify allowed origins.
