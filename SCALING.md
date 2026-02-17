# Scaling Strategy for ChainBook

## 1. Backend Scalability (Horizontal Scaling)
* **Containerization:** The FastAPI backend is stateless. We can containerize it using Docker and orchestrate with Kubernetes (K8s).
* **Async Architecture:** FastAPI runs on an ASGI server (Uvicorn), allowing it to handle high concurrency (e.g., waiting for DB queries) without blocking the main thread, making it ideal for I/O-heavy operations like crypto data fetching.

## 2. Database Optimization
* **Migration to PostgreSQL:** For production, we will migrate from SQLite to PostgreSQL.
* **Read Replicas:** The Dashboard is read-heavy. We can direct all `GET` requests (fetching wallets) to Read Replicas, leaving the Primary DB free to handle `POST` (writes) and high-priority transactions.

## 3. Frontend Performance
* **Server-Side Rendering (SSR):** Utilizing Next.js SSR for the initial dashboard load ensures faster "First Contentful Paint" (FCP) and better SEO.

## 4. Security Enhancements
* **Rate Limiting:** Implementing Redis-backed rate limiting to prevent DDOS attacks on the `/login` and `/register` endpoints.
* **Secrets Management:** Moving sensitive keys (JWT Secrets, DB URL) to a dedicated Vault (e.g., AWS Secrets Manager or HashiCorp Vault).
