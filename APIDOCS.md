# ChainBook API Documentation

Base URL: http://localhost:8000
Authentication: Bearer Token (JWT)

---

## 1. Authentication

### Register New User
* **URL:** `/register`
* **Method:** `POST`
* **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
* **Response:** `{ "access_token": "...", "token_type": "bearer" }`

### Login
* **URL:** `/token`
* **Method:** `POST`
* **Body (Form Data):**
    * `username`: user@example.com
    * `password`: password123
* **Response:** `{ "access_token": "...", "token_type": "bearer" }`

### Get User Profile
* **URL:** `/users/me`
* **Method:** `GET`
* **Header:** `Authorization: Bearer <token>`
* **Response:** `{ "email": "user@example.com", "id": 1 }`

---

## 2. Wallet Dashboard

### List All Wallets
* **URL:** `/wallets/`
* **Method:** `GET`
* **Header:** `Authorization: Bearer <token>`
* **Response:**
    ```json
    [
      {
        "id": 1,
        "label": "Main Vault",
        "address": "0x123...",
        "chain": "Ethereum",
        "risk_level": "Low",
        "notes": "Safe",
        "owner_id": 1
      }
    ]
    ```

### Add New Wallet
* **URL:** `/wallets/`
* **Method:** `POST`
* **Header:** `Authorization: Bearer <token>`
* **Body:**
    ```json
    {
      "label": "Whale Watch",
      "address": "0xabc...",
      "chain": "Solana",
      "risk_level": "High",
      "notes": "Suspicious movement"
    }
    ```

### Delete Wallet
* **URL:** `/wallets/{wallet_id}`
* **Method:** `DELETE`
* **Header:** `Authorization: Bearer <token>`
* **Response:** `{ "ok": true }`
