import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import PodcastPage from './pages/PodcastPage';
import PressPage from './pages/PressPage';
import ForBusinessPage from './pages/ForBusinessPage';
// import GetInvolvedPage from './pages/GetInvolvedPage';
import HallOfChampionsPage from './pages/HallOfChampionsPage';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router basename="/brewedat">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/podcast" element={<PodcastPage />} />
              <Route path="/press" element={<PressPage />} />
              <Route path="/for-business" element={<ForBusinessPage />} />
              {/* <Route path="/get-involved" element={<GetInvolvedPage />} /> */}
              {/* <Route path="/submit-event" element={<GetInvolvedPage />} /> */}
              <Route path="/hall-of-champions" element={<HallOfChampionsPage />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
