# GitHub Profile App

A modern, feature-rich Angular application that displays GitHub user profiles with detailed information including contribution graphs, activity overviews, and repository statistics. View any GitHub user's profile in a beautiful, comprehensive interface.

🔗 **Live Preview**: [https://ujjwal-github-profile.netlify.app/user/shreeramk](https://ujjwal-github-profile.netlify.app/user/shreeramk)

## ✨ Features

- **User Profile Display**: Comprehensive GitHub user profiles with avatar, bio, location, company, and social links
- **Contribution Heatmap**: Interactive contribution graph showing the last year's activity using ECharts
- **Activity Overview**: Visual representation of contribution statistics (commits, pull requests, issues, code reviews) with custom SVG charts
- **Popular Repositories**: Display of user's most starred repositories with language indicators
- **Contribution Activity Timeline**: Recent contribution activities with detailed information
- **Organizations**: Display of user's GitHub organizations
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Dynamic User Profiles**: View any GitHub user's profile by simply changing the username in the URL

## 🌐 Viewing Different Users

The application supports viewing **any GitHub user's profile** through URL routing:

### Default Profile
- `https://ujjwal-github-profile.netlify.app/user/shreeramk` - Default user profile

### View Any GitHub User
Simply replace `shreeramk` with any GitHub username in the URL:

**Examples:**
- `https://ujjwal-github-profile.netlify.app/user/torvalds` - View Linus Torvalds' profile
- `https://ujjwal-github-profile.netlify.app/user/gaearon` - View Dan Abramov's profile
- `https://ujjwal-github-profile.netlify.app/user/octocat` - View GitHub's mascot profile
- `https://ujjwal-github-profile.netlify.app/user/YOUR_USERNAME` - View your own profile!

The app will automatically fetch and display the profile information for any valid GitHub username.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.19 or higher, or v22.12+) - [Download Node.js](https://nodejs.org/)
- **npm** (v9 or higher, comes with Node.js)
- **Git** (for cloning the repository) - [Download Git](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/github-profile-app.git
cd github-profile-app
```

Replace `YOUR_USERNAME` with the actual GitHub username or repository owner.

### 2. Install Dependencies

Install all required dependencies:

```bash
npm install
```

This will install all required packages including:
- Angular 21
- ECharts (for contribution heatmap)
- RxJS (for reactive programming)
- TypeScript
- And other dependencies

### 3. Build the Application

#### Development Build

To build the application for development:

```bash
npm run build
```

This creates an optimized production build in the `dist/github-profile-app/browser/` directory.

#### Development Server (with hot-reload)

To run the development server with hot-reload:

```bash
npm start
```

The application will be available at `http://localhost:4200`

The dev server supports hot-reload, so any changes you make will automatically refresh in the browser.

## 📦 Available Scripts

- `npm start` - Starts the development server at `http://localhost:4200`
- `npm run build` - Builds the application for production
- `npm run watch` - Builds the application in watch mode (for development)
- `npm test` - Runs the test suite

## 🔍 How to View Different Users Locally

When running locally, you can view different GitHub users by changing the URL:

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Navigate to different user profiles:**
   - Default: `http://localhost:4200/user/shreeramk`
   - Any user: `http://localhost:4200/user/TARGET_USERNAME`
   
   **Examples:**
   - `http://localhost:4200/user/torvalds`
   - `http://localhost:4200/user/gaearon`
   - `http://localhost:4200/user/octocat`
   - `http://localhost:4200/user/YOUR_USERNAME`

## 🛠️ Technologies & Libraries

### Core Framework
- **Angular 21** - Modern, standalone component-based framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming for handling asynchronous operations

### Charting & Visualization

#### ECharts (v6.0.0)
- **Purpose**: Used for rendering the contribution heatmap graph
- **Why ECharts**: Provides beautiful, interactive calendar heatmap visualization
- **Usage**: The contribution heatmap component uses ECharts' calendar coordinate system to display GitHub-style contribution graphs
- **Documentation**: [ECharts Official Docs](https://echarts.apache.org/)

#### Custom SVG Charts
- **Purpose**: Activity overview radar chart and contribution statistics visualization
- **Implementation**: Custom SVG polygon and bar charts for displaying contribution distribution
- **Why Custom**: Lightweight solution that doesn't require additional dependencies

### Additional Libraries
- **Font Awesome 6.5.1**: Icons for social links and UI elements (loaded via CDN)
- **Angular Router**: For navigation and dynamic routing
- **Angular HTTP Client**: For making API requests to GitHub API

## 📡 API Endpoints Used

This application uses the GitHub REST API v3. Here are the key endpoints:

### User Profile Data
- `GET https://api.github.com/users/{username}` - Fetches user profile information

### User Repositories
- `GET https://api.github.com/users/{username}/repos` - Fetches user's public repositories

### Starred Repositories
- `GET https://api.github.com/users/{username}/starred` - Fetches repositories the user has starred

### User Events
- `GET https://api.github.com/users/{username}/events/public` - Fetches public events (commits, PRs, issues)

### User Organizations
- `GET https://api.github.com/users/{username}/orgs` - Fetches user's organizations

### Contribution Graph Data
- `GET https://github-contributions-api.jogruber.de/v4/{username}?y=last` - Third-party API for contribution graph data (since GitHub doesn't provide a public API for this)

## 📁 Project Structure

```
github-profile-app/
├── src/
│   ├── app/
│   │   ├── components/          # Feature components
│   │   │   ├── activity-overview/      # Activity stats with radar chart
│   │   │   ├── contribution-activity/  # Contribution timeline
│   │   │   ├── contribution-heatmap/   # Contribution graph (ECharts)
│   │   │   ├── footer/                 # Footer component
│   │   │   ├── header/                 # Header component
│   │   │   ├── popular-repositories/   # Repository grid
│   │   │   ├── profile-page/           # Main profile page
│   │   │   ├── profile-sidebar/        # User info sidebar
│   │   │   └── tabs/                   # Tab navigation
│   │   ├── interfaces/          # TypeScript interfaces
│   │   │   ├── github-user.interface.ts
│   │   │   └── github-repository.interface.ts
│   │   ├── services/            # API services
│   │   │   ├── github-api.service.ts       # GitHub API integration
│   │   │   └── contribution-api.service.ts # Contribution data service
│   │   ├── app.ts               # Root component
│   │   ├── app.routes.ts        # Routing configuration
│   │   └── app.config.ts        # App configuration
│   ├── assets/                  # Static assets
│   │   ├── achievements.json          # Achievements data
│   │   └── user-profile-extension.json # Custom profile extensions
│   ├── index.html               # Entry HTML
│   ├── main.ts                  # Application bootstrap
│   └── styles.css               # Global styles
├── public/                      # Public assets (copied to dist)
│   ├── _redirects              # Netlify redirects for SPA routing
│   └── favicon.ico             # Favicon
├── angular.json                 # Angular configuration
├── package.json                 # Dependencies and scripts
├── netlify.toml                 # Netlify deployment configuration
└── README.md                    # This file
```

## 🌐 Production Deployment

The application is deployed on Netlify and available at:
**🔗 [https://ujjwal-github-profile.netlify.app/user/shreeramk](https://ujjwal-github-profile.netlify.app/user/shreeramk)**

### Viewing Any User on Production

Replace `shreeramk` with any GitHub username:

```
https://ujjwal-github-profile.netlify.app/user/{username}
```

**Examples:**
- `https://ujjwal-github-profile.netlify.app/user/torvalds`
- `https://ujjwal-github-profile.netlify.app/user/gaearon`
- `https://ujjwal-github-profile.netlify.app/user/octocat`

## 🔧 Customization

### Changing Default Username

To change the default username displayed:

1. Edit `src/app/app.routes.ts` - Update the redirect routes
2. Edit `src/app/components/profile-page/profile-page.component.ts` - Update default username property
3. Edit `src/app/services/github-api.service.ts` - Update default username property
4. Edit `src/app/services/contribution-api.service.ts` - Update default username property

### Styling

The application uses CSS for styling. Each component has its own style file:
- Global styles: `src/styles.css`
- Component styles: `src/app/components/{component-name}/{component-name}.component.css`

## ⚠️ API Rate Limiting

GitHub API has rate limits:
- **Unauthenticated requests**: 60 requests per hour
- **Authenticated requests**: 5,000 requests per hour (with Personal Access Token)

The application handles rate limit errors gracefully and displays appropriate messages to users.

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear Angular cache:**
   ```bash
   npm run ng cache clean
   ```

### Node.js Version Issues

Ensure you're using Node.js v20.19+ or v22.12+:
```bash
node --version
```

If using an older version, update Node.js from [nodejs.org](https://nodejs.org/)

### API Errors

If you see API rate limit errors:
- Wait for the rate limit to reset (hourly for unauthenticated requests)
- Consider using a GitHub Personal Access Token for higher limits
- The application includes fallback mechanisms for most API failures

### Chart Not Displaying

If the contribution heatmap doesn't display:
- Check browser console for errors
- Ensure ECharts is properly installed: `npm install echarts`
- Verify the contribution API is accessible

## 📄 License

[Add your license information here]

## 👤 Author

Ujjwal Mishra

## 🙏 Acknowledgments

- GitHub API for providing user data
- ECharts for the beautiful charting library
- github-contributions-api.jogruber.de for contribution graph data
- Font Awesome for icons
- Angular team for the excellent framework

## 🔗 Links

- **Live Demo**: [https://ujjwal-github-profile.netlify.app/user/shreeramk](https://ujjwal-github-profile.netlify.app/user/shreeramk)
- **GitHub Repository**:  [https://github.com/ujjwalmishra/github-profile-app](https://github.com/ujjwalmishra/github-profile-app)

---

**Happy Coding! 🚀**

