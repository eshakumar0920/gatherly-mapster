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

- **Frontend**: React Native with Capacitor
- **Backend**: Node.js
- **Database**: MongoDB
- **Authentication**: Firebase Auth (UTD email-based)
- **Hosting**: Firebase
- **AI Services**: OpenAI or LLaMA API
- **UI**: Tailwind CSS, shadcn-ui

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