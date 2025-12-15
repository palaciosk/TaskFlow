# TaskFlow - AI-Powered Task Manager

A modern, minimalist task management application with AI integration, data visualization, and smart reminders.

## Features

- ✅ **Full CRUD Operations** - Create, Read, Update, and Delete tasks
- 🔐 **Firebase Authentication** - Secure login and signup
- 📊 **Data Visualization** - Beautiful charts with Chart.js
- ⏰ **Smart Reminders** - Get notified 30 minutes before tasks are due
- 📱 **SMS Notifications** - Receive text message reminders on your phone
- 🤖 **AI Task Breakdown** - Use Gemini AI to break down complex tasks
- 💡 **AI Productivity Insights** - Get personalized productivity recommendations
- 🎨 **Minimalist & Fancy Design** - Modern UI with glassmorphism effects

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Firebase** - Authentication & Firestore database
- **Chart.js** - Data visualization
- **Google Gemini AI** - AI-powered features
- **Lucide React** - Beautiful icons
- **date-fns** - Date utilities

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Copy your Firebase configuration

### 3. Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini
3. Copy your API key

### 4. SMS Service Setup (Optional but Recommended)

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account (includes trial credits)
3. Get your Account SID, Auth Token, and Phone Number
4. Follow the setup instructions in `server/README.md` to run the SMS API server

### 5. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_SMS_API_URL=http://localhost:3001/api/send-sms
```

**Note**: `VITE_SMS_API_URL` is only needed if you're using SMS notifications. For production, replace with your deployed SMS API server URL.

### 6. Firestore Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Start SMS API Server (Optional)

If you want SMS notifications, start the SMS API server:

```bash
cd server
npm install
npm start
```

The SMS API server will run on `http://localhost:3001` by default.

### 8. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
TaskFlow/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Auth.css
│   │   └── Dashboard/
│   │       ├── Dashboard.jsx
│   │       ├── TaskList.jsx
│   │       ├── TaskForm.jsx
│   │       ├── TaskStats.jsx
│   │       ├── AIInsights.jsx
│   │       └── *.css
│   ├── firebase/
│   │   ├── config.js
│   │   └── gemini.js
│   ├── utils/
│   │   ├── reminders.js
│   │   └── sms.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── sms-api.js
│   ├── package.json
│   └── README.md
├── package.json
├── vite.config.js
└── README.md
```

## Features in Detail

### Task Management
- Create tasks with title, description, due date, and priority
- Mark tasks as complete/incomplete
- Edit and delete tasks
- Filter tasks by status (All, Pending, Completed)

### Smart Reminders
- Automatic notifications 30 minutes before task due time
- Browser notification support
- SMS text message notifications (when phone number is provided)
- Visual indicators for overdue tasks

### AI Features
- **Task Breakdown**: Enter a task title and let AI break it down into subtasks
- **Productivity Insights**: Get AI-powered recommendations based on your task patterns

### Analytics Dashboard
- Task status overview (Doughnut chart)
- Priority distribution (Bar chart)
- Weekly completion trend (Line chart)
- Quick stats cards

## Design Philosophy

The app features a minimalist design with:
- Dark theme with gradient accents
- Glassmorphism effects
- Smooth animations and transitions
- Responsive layout for all devices
- Modern UI components

## License

MIT License - feel free to use this project for your own purposes!

## Support

If you encounter any issues or have questions, please check:
1. Firebase configuration is correct
2. Gemini API key is valid
3. Firestore security rules are set up properly
4. All environment variables are set

---

Built with ❤️ using React and Firebase

