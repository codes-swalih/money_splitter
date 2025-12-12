# Trip Splitter - Startup & Configuration Guide

## 📋 Prerequisites

Before running the Trip Splitter, ensure you have:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **MongoDB Atlas Account** (Free tier available)
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free M0 cluster
   - Get your connection string

3. **Git** (optional, for cloning)
   - Download from [git-scm.com](https://git-scm.com/)

## 🚀 Quick Setup (5 minutes)

### Step 1: Get MongoDB URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a new project
4. Create a free M0 cluster
5. Click "Connect" and choose "Connect your application"
6. Select "Node.js" and copy the connection string
7. Replace `<password>` with your database password
8. Note: Your connection string should look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/?appName=tripmoney
   ```

### Step 2: Clone the Project

```bash
cd /Users/muhammedswalih/projects/panchayath_trip
```

(Already done! The project is already set up)

### Step 3: Install Dependencies

```bash
npm install --legacy-peer-deps
```

This installs all required packages including:
- Next.js 16
- React 19
- Mongoose (MongoDB driver)
- Date utilities
- UI libraries

### Step 4: Configure Environment

Create a `.env` file in the project root:

```bash
# .env file - Add your MongoDB URI
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=tripmoney
```

Replace with your actual MongoDB connection string!

### Step 5: Run the Development Server

```bash
npm run dev
```

The app will start on:
- Local: http://localhost:3000 (or 3001 if 3000 is in use)
- Network: http://192.168.x.x:3000

Open your browser and visit the local URL.

## 📱 Using the App

### First Time Setup

1. **Home Page**: You'll see the welcome screen with "Create New Trip" button
2. **Create Trip**:
   - Enter trip name (e.g., "Goa Trip 2024")
   - Set dates
   - Choose currency (INR, USD, EUR, GBP)
   - Keep or modify default participants
   - Click "Create Trip"

3. **Add Expenses**: Click "+ Add Expense" and fill in details
4. **View Ledger**: See who owes whom in real-time
5. **Export**: Download CSV for record-keeping

### Default Participants (Customizable)

```
- swalih
- ijas
- ameen
- ameer
- arshad ali
```

You can add/remove participants when creating a trip.

## 🔧 Building for Production

### Build the Application

```bash
npm run build
```

This creates an optimized production build.

### Start Production Server

```bash
npm start
```

The app will start on port 3000.

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t trip-splitter .
docker run -p 3000:3000 -e MONGO_URI="your_uri" trip-splitter
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your GitHub repo
4. Add environment variable: `MONGO_URI`
5. Click "Deploy"

## 📊 Test Data

To test the app with example data, use these values:

### Test Expense 1: Food
- Amount: ₹2,345.50
- Payer: ijas
- Category: Food
- Split: Equal among all 5
- Tax/Tip: None
- Description: "Dinner at restaurant"

### Test Expense 2: Accommodation
- Amount: ₹8,000
- Payer: ameen
- Category: Accommodation
- Split: Equal among 3 (ameen, ameer, arshad ali)
- Tax: 5%
- Description: "Hotel booking"

### Expected Results
- ijas: +₹1,876.40
- Others: ~-₹469 each

## 🐛 Troubleshooting

### "Cannot find module 'mongoose'"
```bash
npm install --legacy-peer-deps
```

### "MongoDB connection failed"
- Check your MONGO_URI in `.env`
- Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
- Check password doesn't have special characters (or URL encode them)

### "Port 3000 already in use"
The app will automatically use port 3001. That's fine!

### "Cannot GET /trips/[id]"
This is normal in development. The app will work on the browser but API might need MongoDB connection.

### Slow build or "Turbopack" errors
- Delete `.next` folder: `rm -rf .next`
- Reinstall: `npm install --legacy-peer-deps`
- Run again: `npm run dev`

## 📚 Project Structure

```
project/
├── app/                 # Next.js app files
│   ├── page.tsx        # Home page
│   ├── api/            # API routes
│   └── trips/          # Trip pages
├── components/         # React components
├── lib/
│   ├── db/            # Database connection
│   └── utils/         # Utilities (calculations, export)
├── public/            # Static files
├── .env               # Environment variables (CREATE THIS)
├── package.json       # Dependencies
└── next.config.ts     # Next.js config
```

## 🎯 Key Features to Try

1. **Add Multiple Expenses**: Create 3-5 different expenses
2. **Try Different Split Types**: 
   - Equal split
   - Selected people only
   - Custom amounts
   - Percentages
3. **Add Tax & Tip**: Test with 5% tax and 10% tip
4. **Check Ledger**: See who owes whom updates in real-time
5. **Settlement**: View minimal transactions needed to settle
6. **Export CSV**: Download trip data

## 🔐 Security Notes

- ✅ The MONGO_URI is private (in .env, not committed to git)
- ✅ All calculations are done securely
- ✅ No data is logged or sent elsewhere
- ⚠️ Add authentication before using with real money

## 📞 Need Help?

1. Check `.env` file exists with MONGO_URI
2. Check MongoDB Atlas IP whitelist allows your IP
3. Check Node.js version: `node --version` (should be 18+)
4. Try deleting node_modules and reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

## 🚀 Next Steps

After setup works:

1. Add more test data
2. Try different scenarios
3. Test on mobile (use Network URL from dev output)
4. Plan for production (add auth, user accounts)
5. Consider deployment (Vercel, Docker, self-hosted)

---

**Happy splitting! 💰**
