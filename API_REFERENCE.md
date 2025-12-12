# Trip Splitter - API Reference

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently: No authentication required (development mode)
Future: Add JWT or session-based auth

---

## Trips Endpoints

### Create Trip
```
POST /api/trips
Content-Type: application/json

{
  "title": "Goa Trip 2024",
  "startDate": "2024-12-15",
  "endDate": "2024-12-22",
  "currency": "INR",
  "participants": [
    { "id": "1", "name": "swalih" },
    { "id": "2", "name": "ijas" },
    { "id": "3", "name": "ameen" },
    { "id": "4", "name": "ameer" },
    { "id": "5", "name": "arshad ali" }
  ],
  "ownerId": "user-1"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Goa Trip 2024",
  "startDate": "2024-12-15T00:00:00.000Z",
  "endDate": "2024-12-22T00:00:00.000Z",
  "currency": "INR",
  "participants": [...],
  "ownerId": "user-1",
  "createdAt": "2024-12-12T10:00:00.000Z",
  "updatedAt": "2024-12-12T10:00:00.000Z"
}
```

### Get Trip with Calculations
```
GET /api/trips/:id

Response (200):
{
  "trip": { /* trip object */ },
  "expenses": [ /* array of expenses */ ],
  "ledger": [
    {
      "id": "1",
      "name": "swalih",
      "totalPaid": 0,
      "totalOwed": 469.10,
      "netBalance": -469.10
    },
    ...
  ],
  "settlements": [
    {
      "from": "1",
      "to": "2",
      "amount": 500,
      "fromName": "swalih",
      "toName": "ijas"
    },
    ...
  ]
}
```

### Update Trip
```
PUT /api/trips/:id
Content-Type: application/json

{
  "title": "Goa Trip 2024 - Updated",
  "currency": "USD"
}

Response (200): Updated trip object
```

### Delete Trip
```
DELETE /api/trips/:id

Response (200):
{
  "success": true
}
```

---

## Expenses Endpoints

### Add Expense to Trip
```
POST /api/trips/:id/expenses
Content-Type: application/json

{
  "amount": 2345.50,
  "payerId": "2",
  "category": "Food",
  "date": "2024-12-15T19:00:00.000Z",
  "description": "Dinner at restaurant",
  "taxPercent": 5,
  "tipPercent": 10,
  "splitType": "EQUAL",
  "splitDetails": {}
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439012",
  "tripId": "507f1f77bcf86cd799439011",
  "amount": 2345.50,
  "currency": "INR",
  "payerId": "2",
  "date": "2024-12-15T19:00:00.000Z",
  "category": "Food",
  "description": "Dinner at restaurant",
  "tax": null,
  "taxPercent": 5,
  "tip": null,
  "tipPercent": 10,
  "splitType": "EQUAL",
  "splitDetails": {},
  "createdAt": "2024-12-12T10:00:00.000Z",
  "updatedAt": "2024-12-12T10:00:00.000Z"
}
```

### Update Expense
```
PUT /api/trips/:id/expenses/:expenseId
Content-Type: application/json

{
  "amount": 3000,
  "description": "Updated description",
  "taxPercent": 10
}

Response (200): Updated expense object
```

### Delete Expense
```
DELETE /api/trips/:id/expenses/:expenseId

Response (200):
{
  "success": true
}
```

---

## Split Type Examples

### 1. Equal Split (EQUAL)
All participants split equally.
```json
{
  "splitType": "EQUAL",
  "splitDetails": {}
}
```
Result: Each person pays `total / num_participants`

### 2. Selected Equal Split (SELECTED_EQUAL)
Only selected participants split equally.
```json
{
  "splitType": "SELECTED_EQUAL",
  "splitDetails": {
    "1": 0,
    "3": 0,
    "5": 0
  }
}
```
Result: Only participants 1, 3, 5 split equally

### 3. Custom Amounts (CUSTOM_AMOUNTS)
Each person pays exact amount (must sum to total).
```json
{
  "splitType": "CUSTOM_AMOUNTS",
  "splitDetails": {
    "1": 400,
    "2": 200,
    "3": 200,
    "4": 200,
    "5": 200
  }
}
```
Validation: Sum must equal totalExpense ±0.01

### 4. Percentages (PERCENTAGES)
Each person pays percentage (must sum to 100%).
```json
{
  "splitType": "PERCENTAGES",
  "splitDetails": {
    "1": 50,
    "2": 20,
    "3": 10,
    "4": 10,
    "5": 10
  }
}
```
Validation: Sum must equal 100% ±0.01

---

## Export Endpoint

### Export Trip as CSV
```
GET /api/trips/:id/export?format=csv

Response (200):
Content-Type: text/csv
Content-Disposition: attachment; filename="trip-title-timestamp.csv"

Trip: Goa Trip 2024
Currency: INR
Period: 12/15/2024 - 12/22/2024

EXPENSES
Date,Payer,Category,Amount,Tax,Tip,Total,Split Type,Description
"12/15/2024","ijas","Food",2345.50,117.275,234.55,2697.325,"EQUAL","Dinner at restaurant"
...

PER-PERSON LEDGER
Person,Total Paid,Total Owed,Net Balance
"swalih",0,469.10,-469.10
"ijas",2345.50,469.10,1876.40
...

SETTLEMENT TRANSACTIONS
From,To,Amount
"swalih","ijas",469.10
...
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 404 Not Found
```json
{
  "error": "Trip not found"
}
```

### 400 Validation Error
```json
{
  "error": "Custom amounts must sum to 2500 (got 2400)"
}
```

### 500 Server Error
```json
{
  "error": "Failed to create trip"
}
```

---

## Calculation Examples

### Example 1: Simple Equal Split
```
Expense: ₹1,000 (no tax/tip)
Participants: 5 people
Split Type: EQUAL

Calculation:
- Per person: 1000 / 5 = 200
- Result: Everyone pays 200

Ledger:
- Payer: paid 1000, owed 200, net +800
- Others: paid 0, owed 200, net -200
```

### Example 2: With Tax & Tip
```
Expense: ₹1,000
Tax: 5% = 50
Tip: 10% = 100
Total: 1,150
Participants: 5 people
Split Type: EQUAL

Calculation:
- Gross: 1000
- Tax: 1000 * 5% = 50
- Tip: 1000 * 10% = 100
- Total to split: 1,150
- Per person: 1150 / 5 = 230

Ledger:
- Payer: paid 1150, owed 230, net +920
- Others: paid 0, owed 230, net -230
```

### Example 3: Custom Amounts
```
Expense: ₹1,200 for hotel room
Participants: 4 people
Split Type: CUSTOM_AMOUNTS
Details: {
  "1": 600,  // Single room
  "2": 200,  // Shared room
  "3": 200,  // Shared room
  "4": 200   // Shared room
}

Validation: 600 + 200 + 200 + 200 = 1200 ✓
```

### Example 4: Settlement
```
Trip with 3 people:

Ledger:
- Alice: paid 1000, owed 300, net +700
- Bob: paid 500, owed 800, net -300
- Carol: paid 200, owed 400, net -200

Settlement Algorithm:
1. Debtors: Bob (-300), Carol (-200)
2. Creditors: Alice (+700)
3. Transactions:
   - Bob pays Alice 300
   - Carol pays Alice 200

Result: 2 transactions
```

---

## Pagination (Future Feature)
Not yet implemented, but reserved endpoints:
```
GET /api/trips/:id/expenses?page=1&limit=20
GET /api/trips?page=1&limit=10
```

---

## Filtering (Future Feature)
Reserved query parameters:
```
GET /api/trips/:id/expenses?category=Food
GET /api/trips/:id/expenses?payer=2
GET /api/trips/:id/expenses?date_from=2024-01-01&date_to=2024-12-31
```

---

## Rate Limiting (Future Feature)
Reserved headers (not yet implemented):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1702400000
```

---

## WebSocket Events (Future Feature)
Planned for real-time updates:
```
expense:created
expense:updated
expense:deleted
trip:updated
settlement:calculated
```

---

## Testing API with cURL

### Create Trip
```bash
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Trip",
    "startDate": "2024-12-15",
    "endDate": "2024-12-22",
    "currency": "INR",
    "participants": [
      {"id": "1", "name": "Alice"},
      {"id": "2", "name": "Bob"}
    ],
    "ownerId": "user-1"
  }'
```

### Get Trip
```bash
curl http://localhost:3001/api/trips/507f1f77bcf86cd799439011
```

### Add Expense
```bash
curl -X POST http://localhost:3001/api/trips/507f1f77bcf86cd799439011/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "payerId": "1",
    "category": "Food",
    "date": "2024-12-15T19:00:00.000Z",
    "description": "Dinner",
    "splitType": "EQUAL",
    "splitDetails": {}
  }'
```

### Export CSV
```bash
curl http://localhost:3001/api/trips/507f1f77bcf86cd799439011/export?format=csv > trip.csv
```

---

## Using with Postman

1. Import collection
2. Set base URL to `http://localhost:3001/api`
3. Create environment variable: `trip_id`
4. Test endpoints in order:
   - POST Create Trip → Copy ID to trip_id
   - GET Get Trip
   - POST Add Expense
   - GET Get Trip (updated)
   - GET Export CSV

---

## Rate Limiting (Future)
Currently unlimited. Plan to implement:
- 1000 requests per hour per IP
- 100 requests per minute per IP

---

For more details, see `README_TRIP_SPLITTER.md`
