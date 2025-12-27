# E-commerce Website

A full-stack e-commerce application with React frontend and Python FastAPI backend.

## Project Structure

```
Ecom-Website/
├── frontend/          # React application
├── backend/           # Python FastAPI server
├── package.json       # Root package.json for deployment
├── netlify.toml       # Netlify deployment config
├── vercel.json        # Vercel deployment config
└── build.sh           # Build script
```

## Deployment

### Frontend Only (Static Hosting)

For platforms like Netlify, Vercel, or GitHub Pages:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `frontend/build`
3. **Base Directory**: `frontend` (for some platforms)

### Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENVIRONMENT=production
```

### Platform-Specific Instructions

#### Netlify
- The `netlify.toml` file is already configured
- Set build command: `npm run build`
- Set publish directory: `frontend/build`

#### Vercel
- The `vercel.json` file is already configured
- Import the repository and Vercel will auto-detect the settings

#### Other Platforms
- Use the `build.sh` script or run: `cd frontend && npm install && npm run build`
- Serve the `frontend/build` directory

## Local Development

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. For backend (separate terminal):
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python server.py
   ```

## Features

- Product catalog with categories
- Shopping cart and checkout
- User authentication and profiles
- Admin dashboard for order management
- Shipping label generation
- Invoice generation
- Email notifications
- Inventory management
- GST calculations
- Multiple payment methods (COD, Online)
- Order tracking and status updates