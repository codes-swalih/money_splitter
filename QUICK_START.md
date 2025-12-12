# Trip Splitter - Quick Start Card

## 🚀 Start in 30 Seconds

### Already Running?

**Go to**: http://localhost:3001

### Not Running?

```bash
cd /Users/muhammedswalih/projects/panchayath_trip
npm run dev
# Opens on http://localhost:3001
```

---

## 🎯 Your First Trip

1. **Homepage** → Click "Create New Trip"
2. **Trip Details**:
   - Title: e.g., "Weekend Getaway"
   - Start: Pick a date
   - End: Pick a date
   - Currency: INR (default)
3. **Participants**: Pre-filled with 5 people
   - Add/remove as needed
   - Click "Create Trip"

---

## 💰 Your First Expense

1. **Trip Page** → Click "+ Add Expense"
2. **Fill in**:
   - Amount: 1000
   - Paid By: Select someone
   - Category: Pick one
   - Date: Auto-filled
   - Description: "Lunch"
3. **Split Type**: EQUAL (default)
4. **Click**: "Add Expense"

---

## 👥 Check Settlement

**Section**: "Settlement Needed"

- Shows who pays whom
- Shows how many transactions
- Shows total amount

---

## 💾 Export Data

**Button**: "Export" (top right)

- Downloads CSV file
- Open in Excel/Sheets
- Has all expenses and ledger

---

## 📚 Need More Help?

Read these files (in your project folder):

| File                      | For                     |
| ------------------------- | ----------------------- |
| `STARTUP_GUIDE.md`        | Setup & troubleshooting |
| `FEATURE_CHECKLIST.md`    | What's available        |
| `API_REFERENCE.md`        | How the API works       |
| `README_TRIP_SPLITTER.md` | Full documentation      |

---

## ⚡ Features Overview

✅ Multiple split types (equal, custom, percent)
✅ Tax & tip support
✅ Real-time ledger calculations
✅ Minimal settlement algorithm
✅ Mobile responsive
✅ CSV export
✅ Edit/delete expenses

---

## 🔧 Config

**MONGO_URI** in `.env`:

```env
MONGO_URI=your_mongodb_connection_string
```

---

## 💡 Tips

- **Mobile**: App works great on phones too
- **Tests**: Run `npx ts-node --transpile-only lib/utils/calculations.test.ts`
- **Build**: `npm run build` for production
- **API**: See `API_REFERENCE.md` for endpoints

---

## 🎉 You're Ready!

Everything is set up. Just start using it!

Questions? Check the docs in the project folder. 📖

---

**Happy splitting!** 🎊
