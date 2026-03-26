# BIET Admin Dashboard

A comprehensive admin dashboard for managing the BIET (Bapuji Institute of Engineering & Technology) college website.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Utility**: date-fns

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── layout/
│   ├── DashboardLayout.tsx   # Root layout with sidebar + navbar
│   ├── Sidebar.tsx           # Collapsible navigation sidebar
│   └── Navbar.tsx            # Top navigation bar
│
├── components/
│   ├── cards/
│   │   └── StatCard.tsx      # Metric display cards
│   ├── tables/
│   │   └── DataTable.tsx     # Generic reusable data table
│   ├── forms/
│   │   └── FormField.tsx     # Form field wrapper with label/error
│   ├── filters/
│   │   ├── SearchBar.tsx     # Search input component
│   │   └── SelectFilter.tsx  # Dropdown filter component
│   └── common/
│       ├── Badge.tsx         # Status badge component
│       ├── Modal.tsx         # Modal dialog component
│       ├── ConfirmDialog.tsx # Delete/confirm dialogs
│       ├── Pagination.tsx    # Table pagination
│       ├── EmptyState.tsx    # Empty state placeholder
│       └── PlaceholderPage.tsx # Under construction page
│
├── modules/
│   ├── dashboard/            # Dashboard with stats & widgets
│   ├── siteContent/          # News & Events management
│   ├── departments/          # Department management
│   ├── committees/           # Committee management
│   ├── academics/            # Faculty, Courses, Results
│   ├── admissions/           # Applications & Students
│   ├── placements/           # Placement records
│   ├── campusLife/           # Clubs & Sports
│   ├── facilities/           # Labs, Library, Hostel
│   ├── alumni/               # Alumni directory
│   └── users/                # User management
│
├── services/
│   └── apiClient.ts          # Axios instance + API endpoints
│
├── types/
│   └── models.ts             # TypeScript interfaces
│
├── data/
│   └── mockData.ts           # Mock data for development
│
├── router.tsx                # React Router configuration
└── App.tsx                   # Root component
```

## Backend API Integration

All pages use mock data. To connect to a real backend:

1. Update `VITE_API_BASE_URL` in `.env`
2. Replace mock data calls in each page with `apiClient` calls from `services/apiClient.ts`
3. The `endpoints` object in `apiClient.ts` defines all API routes

## Features

- ✅ Fully responsive (mobile + desktop)
- ✅ Collapsible sidebar with nested navigation
- ✅ Reusable DataTable with sorting, pagination
- ✅ Search + filter on every module
- ✅ Add/Edit modal forms
- ✅ Delete confirmation dialogs
- ✅ Status badges with semantic colors
- ✅ Dashboard with live stats and activity feed
- ✅ Clean TypeScript types for all models
- ✅ Axios API client ready for backend integration
