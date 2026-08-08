# API Testing Plan (Postman)

This plan outlines the endpoints, request methods, and example payloads to test the complete functionality of the Airline API.

## Base URL
`http://localhost:3000/api/v1`

---

## 1. Airplanes
| Method | Endpoint | Description | 
| :--- | :--- | :--- |
| **POST** | `/airplanes` | Create a new airplane |
| **GET** | `/airplanes` | Fetch all airplanes |
| **GET** | `/airplanes/:id` | Fetch a specific airplane |
| **DELETE** | `/airplanes/:id` | Delete an airplane |

### Example Create Payload (POST)
```json
{
  "modelNumber": "Boeing 737",
  "capacity": 180
}
```

---

## 2. Cities
| Method | Endpoint | Description | 
| :--- | :--- | :--- |
| **POST** | `/cities` | Create a new city |

### Example Create Payload (POST)
```json
{
  "name": "Bengaluru"
}
```

---

## 3. Airports
| Method | Endpoint | Description | 
| :--- | :--- | :--- |
| **POST** | `/airports` | Create a new airport |
| **GET** | `/airports` | Fetch all airports |
| **GET** | `/airports/:id` | Fetch a specific airport |
| **DELETE** | `/airports/:id` | Delete an airport |

### Example Create Payload (POST)
```json
{
  "name": "Kempegowda International Airport",
  "code": "BLR",
  "address": "Devanahalli, Bengaluru",
  "cityId": 1
}
```

---

## 4. Flights
| Method | Endpoint | Description | 
| :--- | :--- | :--- |
| **POST** | `/flights` | Create a new flight |
| **GET** | `/flights` | Fetch all flights |
| **GET** | `/flights?trips=DEL-BOM` | Search flights by origin-destination |

### Example Create Payload (POST)
```json
{
  "flightNumber": "UK 812",
  "airplaneId": 1,
  "departureAirportId": "DEL",
  "arrivalAirportId": "BOM",
  "arrivalTime": "2023-12-01T12:00:00.000Z",
  "departureTime": "2023-12-01T10:00:00.000Z",
  "price": 5500,
  "boardingGate": "12A",
  "totalSeats": 180
}
```

> [!IMPORTANT]
> **Check Validation**: Try creating a flight with `departureAirportId` and `arrivalAirportId` both as `"DEL"`. It should return a `400 Bad Request`.

---

## 5. General
| Method | Endpoint | Description | 
| :--- | :--- | :--- |
| **GET** | `/info` | Get API server information |
