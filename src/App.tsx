
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Meetups from "./pages/Meetups";
import Profile from "./pages/Profile";
import Maps from "./pages/Maps";
import EventLobby from "./pages/EventLobby";
import MeetupLobby from "./pages/MeetupLobby";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meetups" 
            element={
              <ProtectedRoute>
                <Meetups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events/:eventId" 
            element={
              <ProtectedRoute>
                <EventLobby />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meetups/:meetupId" 
            element={
              <ProtectedRoute>
                <MeetupLobby />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/maps" 
            element={
              <ProtectedRoute>
                <Maps />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
