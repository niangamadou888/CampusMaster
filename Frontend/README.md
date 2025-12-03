# CampusMaster Frontend

Frontend application built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
# or
yarn build
```

### Production

```bash
npm run start
# or
yarn start
```

## Tech Stack

- **Next.js 14** - React Framework with App Router
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **ESLint** - Code Linting

## Project Structure

```
Frontend/
├── src/
│   ├── app/          # App router pages
│   ├── components/   # Reusable components
│   └── lib/          # Utility functions
├── public/           # Static assets
└── package.json
```

## API Configuration

The frontend is configured to communicate with the Spring Boot backend at `http://localhost:8080/api`.

Update the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```
