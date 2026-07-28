import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { DataProvider } from "./context/DataContext";
import { SavedProvider } from "./context/SavedContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import AIMatch from "./pages/AIMatch";
import SpecialSearch from "./pages/SpecialSearch";
import InterviewSchedule from "./pages/InterviewSchedule";
import Path from "./pages/Path";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import Saved from "./pages/Saved";
import Activity from "./pages/Activity";
import Reports from "./pages/Reports";
import Recruiters from "./pages/Recruiters";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Plans from "./pages/Plans";

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <DataProvider>
            <SavedProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/ai-match" element={<AIMatch />} />
                <Route path="/special-search" element={<SpecialSearch />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
                <Route path="/interviews" element={<InterviewSchedule />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/path" element={<Path />} />
                <Route path="/recruiters" element={<Recruiters />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SavedProvider>
          </DataProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
