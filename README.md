# NovaCartX — The Future of Shopping 🚀

A futuristic e-commerce web application with dark mode, cart management, wishlist, and product filtering.

**Live Demo:** http://localhost:5000 (when running locally)

## Features

✨ **Modern UI** — Sleek, responsive design with light/dark theme toggle
🛒 **Shopping Cart** — Add/remove items, quantity controls, real-time totals
❤️ **Wishlist** — Save favorite products for later
🔍 **Search & Filter** — Filter by category, price range, sort by rating/price
📱 **Mobile Friendly** — Works seamlessly on desktop, tablet, and mobile
⚡ **Fast Loading** — Optimized assets and lazy-loaded images

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Styling:** Custom CSS with CSS variables for theming
- **Data:** JSON (products.json)
- **Deployment:** Docker + Nginx
- **Server:** http-server (local) or Nginx (Docker)

## Project Structure

```
NovaCartX/
├── index.html              # Home page
├── products.html           # Products listing
├── product.html            # Product details
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── login.html              # Auth page
├── app.js                  # Main JavaScript
├── style.css               # Styles
├── products.json           # Product catalog
├── data/
│   └── products.json       # Product data (used by app)
├── css/
│   └── style.css           # Stylesheet (copied from root)
├── js/
│   └── app.js              # App script (copied from root)
├── dockerfile              # Docker image config
├── docker-compose.yml      # Docker Compose config
├── nginx.conf              # Nginx server config
└── .gitignore              # Git ignore rules
```

## Quick Start

### 1. Run Locally (No Docker)

#### Option A: Python (simplest)

```bash
cd d:\NOvacraft
python -m http.server 5000
```

#### Option B: Node (http-server)

```bash
cd d:\NOvacraft
npm install -g http-server
http-server -c-1 -p 5000
```

Then open: **http://localhost:5000**

### 2. Run with Docker

#### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed

#### Build & Run

```bash
cd d:\NOvacraft
docker-compose up --build
```

Then open: **http://localhost:8080**

**To stop:** `Ctrl+C` or `docker-compose down`

### 3. Deploy to GitHub

#### Initialize & Push to GitHub

1. **Create a GitHub repository** at https://github.com/new
   - Name: `novacartx` (or your choice)
   - Public or Private (your choice)
   - Do NOT initialize with README (we have one)

2. **Push your code:**

   ```bash
   cd d:\NOvacraft
   git remote add origin https://github.com/YOUR_USERNAME/novacartx.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify** on GitHub that all files are uploaded ✓

## Development

### Making Changes

```bash
# 1. Make edits to any files
# 2. See changes live (server auto-serves latest files)
# 3. Commit & push when ready

git add .
git commit -m "Describe your change"
git push origin main
```

### Deploying Docker Updates

```bash
# After making changes to code:
docker-compose down
docker-compose up --build
```

## Deployment Options

### A. Docker (Recommended for Production)

- **Pros:** Consistent environment, easy scaling
- **Cons:** Requires Docker installed
- **Command:** `docker-compose up --build`
- **Port:** 8080

### B. Traditional Hosting (Vercel, Netlify, GitHub Pages)

- Copy all HTML/CSS/JS files to the hosting service
- Set `index.html` as root
- Works since this is a static site

### C. Cloud Deployment (AWS, Azure, Google Cloud)

1. Deploy Docker image to ECR / Container Registry
2. Run on ECS / App Engine / Cloud Run
3. Link to custom domain

## API / Data Fetching

Products are loaded from `data/products.json` via:

```javascript
fetch("data/products.json").then((res) => res.json());
```

To add/modify products, edit `data/products.json` directly.

## Troubleshooting

| Issue                      | Solution                                                         |
| -------------------------- | ---------------------------------------------------------------- |
| **Port already in use**    | Change port: `http-server -p 3000` or `docker-compose` uses 8080 |
| **Products not loading**   | Check browser console (F12), verify `data/products.json` exists  |
| **Styles not applied**     | Clear browser cache (Ctrl+Shift+Delete)                          |
| **Dark mode not working**  | Ensure localStorage is enabled in browser                        |
| **Docker image too large** | Use `docker-compose down` and rebuild                            |

## File Sizes & Performance

- **Total:** ~150KB (uncompressed)
- **CSS:** ~50KB
- **JavaScript:** ~30KB
- **Images:** Loaded from Unsplash CDN
- **Load Time:** <1s average

## Future Enhancements

- [ ] Backend API (Node.js/Express)
- [ ] Database (MongoDB)
- [ ] User authentication (JWT)
- [ ] Payment gateway integration (Stripe)
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Product reviews & ratings

## License

MIT License — Free to use and modify

## Author

NovaCartX © 2025 | Built with ⚡ for the future

---

**Need help?** Check the code comments or open an issue on GitHub!
