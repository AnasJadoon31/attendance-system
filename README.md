# 🎓 Modern Attendance Management System

A comprehensive, futuristic-themed attendance management system built with Next.js, featuring real-time attendance tracking, student roster management, and advanced import/export capabilities.

## 🌟 Features

### Core Functionality
- **📚 Roster Management**: Create and manage class rosters with unlimited students
- **📝 Attendance Tracking**: Take attendance with intuitive Present/Absent toggles
- **📊 Session History**: View comprehensive attendance history with statistics
- **🔒 Session Locking**: Lock attendance sessions to prevent modifications
- **📤 Import/Export**: Bulk import students from CSV/Excel files and export attendance data

### Advanced Features
- **🎨 Futuristic UI**: Modern glass morphism design with gradient accents
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔍 Smart Search**: Real-time search and filtering of students
- **📈 Analytics**: Attendance percentages and session statistics
- **⚡ Real-time Updates**: Instant feedback and live data updates
- **🎯 Bulk Operations**: Mark all students present/absent with one click

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL database
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 User Guide

### Getting Started

1. **Create a Roster**
   - Navigate to "Manage Students" from the home page
   - Click "Create Roster" and enter a class name (e.g., "CS-101 Fall 2025")

2. **Add Students**
   - **Manual Entry**: Use the "Add New Student" form with enrollment number and name
   - **Bulk Import**: Upload CSV/Excel files with student data

3. **Take Attendance**
   - Go to "Take Attendance" from the home page
   - Select subject, date, and roster
   - Mark students as Present ✅ or Absent ❌
   - Save attendance data

4. **View History**
   - Access "Attendance History" to see all past sessions
   - View detailed statistics and export data

### Student Import Format

#### Supported File Types
- **CSV**: `.csv` files
- **Excel**: `.xlsx`, `.xls` files

#### Required Columns
The system automatically detects columns with these names:

**Enrollment Number** (any of):
- `enrollmentNumber`, `enrollment`, `roll`, `rollNumber`
- `student_id`, `studentId`, `ID`, `id`

**Student Name** (any of):
- `name`, `Name`, `studentName`, `fullName`
- `firstName` + `lastName` (will be combined)

#### Example CSV Format
```csv
enrollmentNumber,name,email,phone
2023001,John Doe,john@email.com,123-456-7890
2023002,Jane Smith,jane@email.com,098-765-4321
```

#### Example Excel Format
| Roll Number | Student Name | Email | Department |
|-------------|--------------|-------|------------|
| 2023001 | John Doe | john@email.com | Computer Science |
| 2023002 | Jane Smith | jane@email.com | Mathematics |

### Taking Attendance

1. **Create Session**
   - Enter subject name
   - Select date (defaults to today)
   - Choose class roster

2. **Mark Attendance**
   - Use Present ✅ / Absent ❌ buttons for each student
   - Use "Mark All Present/Absent" for bulk operations
   - Search students by name or enrollment number
   - Use "Undo" to revert recent changes

3. **Save & Lock**
   - Click "Save Attendance" to store data
   - Use "Lock Session" to prevent further modifications
   - Export data as CSV for external use

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **File Processing**: XLSX library for Excel/CSV parsing
- **Validation**: Zod for data validation
- **Styling**: Tailwind CSS with custom glass morphism theme

### Project Structure
```
attendance-system/
├── app/                     # Next.js App Router
│   ├── api/                 # API endpoints
│   │   ├── rosters/         # Roster management APIs
│   │   └── sessions/        # Attendance session APIs
│   ├── attendance/          # Attendance pages
│   ├── rosters/             # Roster management pages
│   ├── sessions/            # Session history pages
│   ├── layout.jsx           # Root layout with navigation
│   └── page.jsx             # Home page
├── components/              # Reusable React components
│   └── AttendanceTable.jsx  # Main attendance interface
├── lib/                     # Utility libraries
│   └── prisma.js            # Database client
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database models
│   └── migrations/          # Database migration files
└── public/                  # Static assets
```

### Database Schema

#### Core Models

**Roster**
- Represents a class or group of students
- Contains: id, name, createdAt, updatedAt
- Relations: students[], sessions[]

**Student**
- Individual student records
- Contains: id, name, enrollmentNumber, extra (JSON), rosterId
- Relations: roster, records[]
- Unique constraint: rosterId + enrollmentNumber

**AttendanceSession**
- Represents a single attendance session
- Contains: id, subject, sessionDate, locked, rosterId
- Relations: roster, records[]

**AttendanceRecord**
- Individual attendance records for each student per session
- Contains: id, status (PRESENT/ABSENT), sessionId, studentId
- Relations: session, student
- Unique constraint: sessionId + studentId

### API Endpoints

#### Roster Management
- `GET /api/rosters` - List all rosters
- `POST /api/rosters` - Create new roster
- `GET /api/rosters/[id]` - Get roster details
- `DELETE /api/rosters/[id]` - Delete roster
- `POST /api/rosters/[id]/import` - Import students from file
- `GET /api/rosters/[id]/export` - Export roster as CSV

#### Session Management
- `GET /api/sessions` - List all attendance sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session details
- `POST /api/sessions/[id]` - Update attendance records
- `GET /api/sessions/[id]/export` - Export session data as CSV

## 🎨 Design System

### Color Palette
- **Primary**: Cyan to Blue gradients (`from-cyan-400 to-blue-400`)
- **Secondary**: Purple to Pink gradients (`from-purple-500 to-pink-500`)
- **Success**: Emerald to Teal gradients (`from-emerald-500 to-teal-500`)
- **Warning**: Yellow to Orange gradients (`from-yellow-500 to-orange-500`)
- **Danger**: Red to Pink gradients (`from-red-500 to-pink-500`)
- **Background**: Dark slate gradients (`from-slate-900 via-purple-900 to-slate-900`)

### Design Elements
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Gradient Accents**: Colorful gradient elements and text
- **Smooth Animations**: Hover effects and transitions
- **Modern Typography**: Clean, professional font hierarchy
- **Responsive Layout**: Mobile-first design approach

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db"

# Optional: For production deployment
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

### Package Scripts
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma:migrate   # Run database migrations
npx prisma studio     # Open database GUI
npx prisma generate   # Generate Prisma client
```

## 📊 Features Deep Dive

### Import System
The import system supports flexible column mapping and handles various file formats:

**Smart Column Detection**:
- Automatically recognizes 20+ column name variations
- Combines first name + last name if full name not provided
- Preserves additional columns as extra student information

**Error Handling**:
- Validates file format before processing
- Shows detailed import statistics
- Reports specific errors for failed records
- Prevents duplicate enrollments

**Performance**:
- Processes files up to 10MB
- Handles thousands of records efficiently
- Uses database transactions for data integrity

### Attendance Interface
Modern, intuitive interface for taking attendance:

**User Experience**:
- Visual Present/Absent toggles with emojis
- Real-time search and filtering
- Bulk operations for efficiency
- Undo functionality for error correction

**Data Management**:
- Auto-save functionality
- Session locking to prevent accidental changes
- Comprehensive audit trail
- Export capabilities for external systems

### Analytics & Reporting
Built-in analytics provide insights into attendance patterns:

**Session Statistics**:
- Present/absent counts and percentages
- Session status (active/locked)
- Date and roster information

**Historical Data**:
- Complete attendance history
- Searchable and filterable records
- Export functionality for further analysis

## 🚀 Deployment

### Production Deployment

1. **Prepare for production**
   ```bash
   pnpm build
   ```

2. **Set up production database**
   - Create PostgreSQL database
   - Update DATABASE_URL in production environment
   - Run migrations: `npx prisma migrate deploy`

3. **Deploy to your platform**
   - **Vercel**: Connect GitHub repository, set environment variables
   - **Railway**: Deploy via CLI or GitHub integration
   - **Heroku**: Use Heroku CLI or GitHub integration
   - **Digital Ocean**: Use App Platform or Droplets

### Environment Setup
Ensure these environment variables are set in production:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production"

## 🛠️ Troubleshooting

### Common Issues

**Import Not Working**
- Check file format (CSV, XLSX, XLS only)
- Verify column names match expected format
- Ensure file size is under 10MB
- Check console for detailed error messages

**Database Connection Issues**
- Verify DATABASE_URL format
- Check PostgreSQL server is running
- Ensure database exists and user has permissions
- Run `npx prisma generate` after schema changes

**Styling Issues**
- Clear browser cache
- Check if Tailwind CSS is properly configured
- Verify all CSS files are imported correctly

### Performance Optimization
- Use database indexes for large datasets
- Implement pagination for rosters with many students
- Consider caching for frequently accessed data

## 📝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Use TypeScript where possible
- Follow React best practices
- Maintain consistent code formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙋‍♂️ Support

For questions, issues, or feature requests:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information
4. Include system information and error messages

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core features
- Modern futuristic UI design
- Complete attendance management system
- Import/export functionality
- Responsive design
- PostgreSQL database integration

---

**Built with ❤️ using Next.js and modern web technologies**
