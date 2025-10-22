# Fifty Project

A web application for the Fifty coding challenge.

## Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1. **Clone the repository:**
  ```bash
  git clone https://github.com/your-username/fifty.git
  cd fifty
  ```

2. **Start the application using Docker Compose:**
  ```bash
  docker-compose up --build
  ```

3. **Access the application:**
  - Open your browser and go to [http://localhost:8000](http://localhost:8000) (or the port specified in your `docker-compose.yml`).

## PostgreSQL Database

This project uses [PostgreSQL](https://www.postgresql.org/) as its database, managed via Docker Compose.
The database service is defined in `docker-compose.yml` and is automatically started with the application.

## Project Structure

```
fifty/
├── backend/             # Backend application source code
│   └── Dockerfile       # Backend Docker configuration
├── frontend/            # Frontend application source code
│   └── Dockerfile       # Frontend Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── README.md            # Project documentation
