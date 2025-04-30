
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Events from '@/pages/Events';
import Profile from '@/pages/Profile';
import Maps from '@/pages/Maps';
import EventLobby from '@/pages/EventLobby';
import Meetups from '@/pages/Meetups';
import MeetupLobby from '@/pages/MeetupLobby';
import NotFound from '@/pages/NotFound';
import AuthPage from '@/pages/AuthPage';
import BadgesPage from '@/pages/BadgesPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LevelUpProvider } from '@/contexts/LevelUpContext';
import LootBoxPopup from '@/components/LootBoxPopup';
import ProfileStickers from '@/components/ProfileStickers';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <Router>
      <LevelUpProvider>
        <div className="overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventLobby />} />
            <Route path="/maps" element={<Maps />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/meetups" element={<Meetups />} />
            <Route path="/meetups/:meetupId" element={<MeetupLobby />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <LootBoxPopup />
          <ProfileStickers />
          <Toaster />
        </div>
      </LevelUpProvider>
    </Router>
  );
}

export default App;
