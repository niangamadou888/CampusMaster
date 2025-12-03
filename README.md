# CampusMaster

Campus Management System - A full-stack monorepo application.

## Architecture

This is a monorepo project containing:

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Spring Boot 3 + Java 17 + PostgreSQL

## Project Structure

```
CampusMaster/
├── Frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
├── Backend/           # Spring Boot backend API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── docker-compose.yml # Docker composition for services
└── README.md         # This file
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Java** 17+
- **Maven** 3.8+
- **Docker** (optional, for containerized deployment)

### Quick Start

#### 1. Frontend (Next.js)

```bash
cd Frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

#### 2. Backend (Spring Boot)

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

Backend API will be available at: http://localhost:8080

### Using Docker

Start all services with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:8080
- PostgreSQL on localhost:5432

## Development

### Frontend Development

```bash
cd Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Backend Development

```bash
cd Backend
mvn spring-boot:run              # Run application
mvn clean package                # Build JAR
mvn test                         # Run tests
mvn spring-boot:run -Dspring-boot.run.profiles=prod  # Run with production profile
```

## API Documentation

### Health Check Endpoints

- `GET http://localhost:8080/api/health` - API health status
- `GET http://localhost:8080/api/` - Welcome message

### Database

#### Development
- H2 Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:campusmaster`

#### Production
- PostgreSQL on port 5432
- Database: `campusmaster`

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- ESLint

### Backend
- Spring Boot 3.2.5
- Java 17
- Spring Data JPA
- PostgreSQL / H2
- Lombok
- Maven

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend (application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:campusmaster
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - All rights reserved
