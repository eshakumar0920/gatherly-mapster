# impulse

impulse is a mobile-first application designed for students at the University of Texas at Dallas to create, discover, and engage in campus events. The app fosters student connection through personalized recommendations, an interactive map, live chat, and more.

## Features

- AI-based event recommendations
- Interactive campus map
- Real-time chat for events
- Bookmarking and filtering
- UTD-only access via Firebase Authentication
- AI chatbot for campus FAQs
- User profiles with avatars and achievements

## Tech Stack

**Frontend**  
- React + Vite  
- TypeScript  
- Tailwind CSS (with custom utility classes)  
- Capacitor (used to package the app as a native Android build)  

**Backend**  
- Python  
- Flask (modular RESTful API with JWT-based authentication)  

**Database**  
- PostgreSQL  
- SQLAlchemy ORM  
- Supabase (used in early development for auth and DB before migration)  

**Authentication**  
- Supabase Auth (UTD email validation using domain checks and JWTs)  

**AI Services**  
- OpenAI API (for chatbot and event recommendations)  

**Maps and Visualization**  
- Leaflet.js (interactive UTD campus map)  
- lucide-react (icons)  

**Development Tools**  
- Visual Studio Code  
- Android Studio Emulator  
- Postman  
- Ngrok  
- GitHub  
- Jira  
- Figma  
- Anaconda  


## Getting Started

To work on this project locally:

```sh
# Clone the repository
git clone <REPO_URL>
cd campus-connect

# Install dependencies
npm install

# Run the development server
npx react-native start

# Open Android project
npx cap open android
