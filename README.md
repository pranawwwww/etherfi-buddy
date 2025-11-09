# EtherFi Buddy

An AI-powered DeFi navigator for EtherFi beginners. Get personalized portfolio insights, yield strategies, and beginner-friendly explanations powered by Claude AI.

## Features

### Core Features
- **Portfolio Overview**: Track your ETH, eETH, weETH, and Liquid USD balances
- **AI Assistant**: Ask Claude about DeFi products and strategies
- **Yield Simulator**: Calculate blended APY and compare Conservative vs Active strategies
- **Forecast Tab**: Visualize historical performance and future projections
- **Health Score**: Understand your portfolio risk and diversification
- **Product Map**: Interactive visualization of EtherFi ecosystem

### 🆕 Multi-Asset Analytics Dashboard
- **Multi-Asset Performance Chart**: Compare growth trajectories for all assets simultaneously
- **Asset Allocation Pie Chart**: Visualize portfolio distribution with diversification score
- **Correlation Heatmap**: Understand how assets move together for better diversification
- **Rebalancing Recommendations**: Get actionable suggestions with impact projections
- **Interactive Controls**: Toggle assets on/off, explore different time periods

## Quick Start

### Frontend Setup

```sh
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev
```

### Backend Setup

The FastAPI backend provides 4 endpoints for portfolio simulation, forecasting, and AI chat.

```sh
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Or on macOS/Linux
python -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp ../.env.example ../.env

# Start backend server (http://localhost:8000)
uvicorn main:app --reload --port 8000
```

### Configuration

Edit [.env](.env) in the root directory:

```env
APP_ORIGIN=http://localhost:8080
ANTHROPIC_API_KEY=   # Optional: Add your API key for AI chat
DEFAULT_APY_STAKE=0.04
DEFAULT_APY_LIQUID_USD=0.10
DEFAULT_BORROW_RATE=0.05
DEFAULT_LTV_WEETH=0.50
FORECAST_MONTHS=12
```

If you leave `ANTHROPIC_API_KEY` blank, the chat feature will return demo responses.

## Running the Full Stack

You need **two terminal windows**:

**Terminal 1 - Frontend:**
```sh
npm run dev
```

**Terminal 2 - Backend:**
```sh
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

Then open http://localhost:8080 in your browser.

## Project Structure

```
etherfi-buddy/
├── backend/              # FastAPI backend
│   ├── main.py          # API endpoints
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
├── src/
│   ├── components/      # React components
│   ├── lib/
│   │   ├── api.ts       # API client functions
│   │   ├── types.ts     # TypeScript types
│   │   ├── helpers.ts   # Health score & presets
│   │   └── productCopy.ts  # Product descriptions
│   ├── contexts/        # React contexts
│   └── pages/           # Page components
├── .env.example         # Environment variables template
└── vite.config.ts       # Vite config with API proxy
```

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `POST /api/simulate` - Calculate APY, risk, and strategies
- `GET /api/forecast` - Get portfolio projections
- `GET /api/rates` - Get current APY rates
- `POST /api/ask` - Ask Claude about DeFi (requires API key)

### 🆕 Analytics Endpoints
- `POST /api/multi-asset-forecast` - Get forecasts for all portfolio assets
- `GET /api/correlation-matrix` - Get asset correlation data

View full API docs at http://localhost:8000/docs when the backend is running.

## Demo Presets

Use the helper presets in [src/lib/helpers.ts](src/lib/helpers.ts):

- `PRESET_BEGINNER` - Small portfolio (0.5 weETH, $250 Liquid USD)
- `PRESET_HOLDER` - Larger portfolio (5 weETH, $1200 Liquid USD)

## Lovable Project

**URL**: https://lovable.dev/projects/4e82085d-f278-425d-80a8-0cbe13a4d086

### Development Options

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4e82085d-f278-425d-80a8-0cbe13a4d086) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4e82085d-f278-425d-80a8-0cbe13a4d086) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
