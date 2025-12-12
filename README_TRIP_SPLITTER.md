# Trip Splitter 🧳💰

A modern, fully-responsive Next.js web application that helps small groups track shared trip expenses and automatically calculate who owes whom. Perfect for trips, roommates, and any group that shares costs.

## 🌟 Features

### Core Features (MVP)

- ✅ **Create Trips** - Set up trips with multiple participants (pre-filled with your group)
- ✅ **Track Expenses** - Add expenses with amount, payer, category, date, description
- ✅ **Multiple Split Types**:
  - Equal split among all participants
  - Equal split among selected participants
  - Custom amounts per person
  - Percentages per person
- ✅ **Tax & Tip** - Add tax and tip as percentage or absolute amount
- ✅ **Per-Person Ledger** - See total paid, total owed, and net balance for each person
- ✅ **Settlement Suggestions** - Automatic calculation of minimal transfers to settle all debts
- ✅ **Edit & Delete Expenses** - Full CRUD operations
- ✅ **CSV Export** - Export trip details, ledger, and settlement transactions
- ✅ **Dashboard** - View trip statistics (total cost, highest spender, average per person)
- ✅ **Mobile Responsive** - Fully optimized for mobile, tablet, and desktop

### Technical Features

- 🔢 **Precise Rounding** - Deterministic rounding ensures all calculations sum to exact totals
- 📊 **Minimal Settlement Algorithm** - Greedy algorithm generates fewest transactions needed
- 🗄️ **MongoDB Integration** - Persistent data storage with Mongoose
- 🎨 **Tailwind CSS** - Beautiful, responsive UI with utility-first CSS
- 🚀 **Next.js 16** - Modern React framework with App Router
- 📱 **Mobile-First Design** - Perfect on all screen sizes

## 🏃 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB URI (connection string)

### Installation

1. **Clone and Setup**

```bash
cd panchayath_trip
npm install --legacy-peer-deps
```

2. **Environment Variables**
   Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=your_app
```

3. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📖 Usage Guide

### 1. Create a New Trip

- Click "Create New Trip" on the home page
- Enter trip title (e.g., "Goa Trip 2024")
- Set start and end dates
- Choose currency
- Default participants are pre-filled: swalih, ijas, ameen, ameer, arshad ali
- Add or remove participants as needed
- Click "Create Trip"

### 2. Add Expenses

- Click "+ Add Expense" button
- Fill in details:
  - **Amount**: The base expense amount
  - **Paid By**: Who paid for this expense
  - **Category**: Food, Accommodation, Transport, Activities, Shopping, or Other
  - **Date**: When the expense occurred
  - **Description**: What was this for?
  - **Tax & Tip**: Optional percentages
- **Choose Split Type**:
  - **Equal among all**: Splits evenly among all participants
  - **Equal among selected**: Splits evenly among only chosen people
  - **Custom amounts**: Enter exact amount each person owes
  - **Percentages**: Enter percentage each person should pay
- Click "Add Expense"

### 3. View Dashboard

- See total trip cost
- Find out who spent the most
- Check average cost per person
- View participant balances (green = will receive, red = owes)

### 4. Track Expenses

- View all expenses in chronological order
- Edit expense by clicking the ✏️ icon
- Delete expense by clicking the 🗑️ icon
- See category badges and tax/tip details

### 5. Settle Up

- View settlement suggestions showing who needs to pay whom
- Transactions are optimized for minimum number of transfers
- See total amount that needs to be transferred

### 6. Export Data

- Click "Export" to download CSV
- CSV includes:
  - All expense details
  - Per-person ledger (paid, owed, net balance)
  - Settlement transactions needed
- Import into Excel/Sheets for further analysis

## 🧮 How Calculations Work

### Expense Splitting Algorithm

1. **Apply Tax & Tip**

   - Tax: If percent given: `taxAmount = round(amount * taxPercent / 100, 2)`
   - Tip: Same calculation as tax
   - Total: `grossAmount + taxAmount + tipAmount`

2. **Split Among Participants**

   - **EQUAL**: `share = round(totalExpense / N, 2)` for each person
   - **Remainder Distribution**: Smallest 0.01 adjustments distributed to earliest participants
   - **SELECTED_EQUAL**: Same as equal but only among selected people
   - **CUSTOM_AMOUNTS**: Validates that sum equals total expense (±0.01)
   - **PERCENTAGES**: Each person gets `round(total * percent / 100, 2)`

3. **Per-Person Ledger**

   - `paid = sum of all amounts they paid`
   - `owed = sum of all their shares`
   - `netBalance = paid - owed`
   - Positive balance = they should receive money
   - Negative balance = they owe money

4. **Minimal Settlement Algorithm**
   - Creates sorted lists of debtors (negative balance) and creditors (positive balance)
   - While both lists non-empty:
     - Match largest debtor with largest creditor
     - Transfer minimum of their balances
     - Remove settled participants
   - Result: Minimum number of transactions

### Example Scenario

Trip with 5 people: swalih, ijas, ameen, ameer, arshad ali

**Expense 1**: Food ₹2,345.50 paid by ijas, equal split among all 5

- Per person: ₹469.10
- ijas: paid ₹2,345.50, owed ₹469.10, net = ₹1,876.40
- Others: paid ₹0, owed ₹469.10, net = -₹469.10 each

**Expense 2**: Room ₹8,000 paid by ameen, split among 3 (ameen, ameer, arshad ali)

- Per person: ₹2,666.67 (two people) + ₹2,666.66 (one person)
- Updates balances...

**Settlement**: Minimum transfers needed to settle all debts

## 📁 Project Structure

```
panchayath_trip/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── api/                      # API routes
│   │   └── trips/                # Trip endpoints
│   │       ├── route.ts          # POST (create), GET (list)
│   │       ├── [id]/
│   │       │   ├── route.ts      # GET, PUT, DELETE trip
│   │       │   ├── expenses/     # Expense endpoints
│   │       │   │   ├── route.ts  # POST expense
│   │       │   │   └── [expenseId]/route.ts  # PUT, DELETE expense
│   │       │   └── export/route.ts  # GET CSV/PDF export
│   └── trips/
│       ├── new/page.tsx          # Create trip page
│       └── [id]/page.tsx         # Trip detail page
├── components/                   # React components
│   ├── TripHeader.tsx            # Header with title and actions
│   ├── ParticipantList.tsx       # Participants with balances
│   ├── DashboardStats.tsx        # Dashboard cards
│   ├── ExpenseList.tsx           # List of expenses
│   ├── ExpenseModal.tsx          # Add/edit expense modal
│   └── SettlementView.tsx        # Settlement suggestions
├── lib/
│   ├── db/
│   │   ├── connection.ts         # MongoDB connection
│   │   └── models.ts             # Mongoose schemas
│   └── utils/
│       ├── calculations.ts       # Splitting & settlement logic
│       └── export.ts             # CSV export utility
├── public/                       # Static files
├── package.json                  # Dependencies
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
└── tailwind.config.js            # Tailwind CSS config
```

## 🔧 API Endpoints

### Trips

- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip with expenses and calculations
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Expenses

- `POST /api/trips/:id/expenses` - Add expense to trip
- `PUT /api/trips/:id/expenses/:expenseId` - Update expense
- `DELETE /api/trips/:id/expenses/:expenseId` - Delete expense

### Export

- `GET /api/trips/:id/export?format=csv` - Export as CSV

## 💾 Database Schema

### Trip Document

```javascript
{
  _id: ObjectId,
  title: String,
  startDate: Date,
  endDate: Date,
  currency: String, // Default: INR
  participants: [{
    id: String,
    name: String,
    avatarUrl: String,
    email: String
  }],
  ownerId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Document

```javascript
{
  _id: ObjectId,
  tripId: String,
  amount: Number,
  currency: String,
  payerId: String,
  date: Date,
  category: String,
  description: String,
  receiptUrl: String,
  tax: Number,           // Absolute tax amount
  taxPercent: Number,    // Tax percentage
  tip: Number,           // Absolute tip amount
  tipPercent: Number,    // Tip percentage
  splitType: String,     // EQUAL, SELECTED_EQUAL, CUSTOM_AMOUNTS, PERCENTAGES
  splitDetails: Object,  // { participantId: amount/percentage }
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Components

### Responsive Design

- **Mobile First**: Optimized for screens 320px and up
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large buttons and clear spacing on mobile
- **Readable**: Proper font sizes at each breakpoint

### Color Scheme

- **Blue**: Primary actions and headers
- **Green**: Positive balances (will receive)
- **Red**: Negative balances (owes)
- **Orange/Purple/Pink/Yellow**: Category badges
- **Gray**: Secondary text and backgrounds

## 🧪 Testing

The app includes example calculations. To verify:

1. Create a trip with the default 5 participants
2. Add the example expenses from the spec:
   - Food: ₹2,345.50, equal split
   - Room: ₹8,000, selected split (3 people)
   - etc.
3. Verify calculations match the expected results
4. Check settlement suggestions are minimal

## ⚙️ Configuration

### Environment Variables

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=app
```

### Tailwind CSS Config

Default config in `tailwind.config.js` - customizable for colors, spacing, etc.

### Next.js Config

- Using Turbopack for fast builds
- App Router enabled
- TypeScript strict mode enabled

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push

# Deploy from Vercel dashboard
# Set MONGO_URI in environment variables
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## 📱 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android 90+

## 🐛 Known Limitations & TODOs

### v1 Enhancements

- [ ] Receipt image upload and storage
- [ ] Receipt OCR to auto-fill amounts
- [ ] Advanced filters (date range, category, amount)
- [ ] Shareable read-only links
- [ ] User authentication
- [ ] Multiple trips listing
- [ ] Trip templates

### v2 Features

- [ ] Multi-currency with auto-conversion
- [ ] Payment integration (UPI, PayPal links)
- [ ] Recurring expenses
- [ ] Expense splitting by items (room for 2, food for 5)
- [ ] Comments on expenses
- [ ] Email notifications
- [ ] Offline PWA support
- [ ] Chat integration

## 📄 License

MIT

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Made with ❤️ for splitting expenses fairly**
