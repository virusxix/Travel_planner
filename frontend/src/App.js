import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import LoginPage from '@/pages/LoginPage';
import TravellerHome from '@/pages/traveller/TravellerHome';
import SearchResults from '@/pages/traveller/SearchResults';
import PropertyDetail from '@/pages/traveller/PropertyDetail';
import Checkout from '@/pages/traveller/Checkout';
import AIPlanner from '@/pages/traveller/AIPlanner';
import Trips from '@/pages/traveller/Trips';
import PaymentSuccess from '@/pages/traveller/PaymentSuccess';
import PaymentCancel from '@/pages/traveller/PaymentCancel';
import HostDashboard from '@/pages/host/HostDashboard';
import HostListings from '@/pages/host/HostListings';
import AddListing from '@/pages/host/AddListing';
import HostPayouts from '@/pages/host/HostPayouts';
import HostReviews from '@/pages/host/HostReviews';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminApprovals from '@/pages/admin/AdminApprovals';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hiddenstay_user');
    return stored ? JSON.parse(stored) : null;
  });

  const updateUser = (newUser) => {
    if (newUser) {
      localStorage.setItem('hiddenstay_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('hiddenstay_user');
    }
    setUser(newUser);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage setUser={updateUser} />} />
          <Route path="/traveller" element={user?.role === 'traveller' ? <TravellerHome user={user} /> : <Navigate to="/" />} />
          <Route path="/search" element={user?.role === 'traveller' ? <SearchResults user={user} /> : <Navigate to="/" />} />
          <Route path="/property/:id" element={user?.role === 'traveller' ? <PropertyDetail user={user} /> : <Navigate to="/" />} />
          <Route path="/checkout" element={user?.role === 'traveller' ? <Checkout user={user} /> : <Navigate to="/" />} />
          <Route path="/ai-planner" element={user?.role === 'traveller' ? <AIPlanner user={user} /> : <Navigate to="/" />} />
          <Route path="/trips" element={user?.role === 'traveller' ? <Trips user={user} /> : <Navigate to="/" />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/host" element={user?.role === 'host' ? <HostDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/host/listings" element={user?.role === 'host' ? <HostListings user={user} /> : <Navigate to="/" />} />
          <Route path="/host/add-listing" element={user?.role === 'host' ? <AddListing user={user} /> : <Navigate to="/" />} />
          <Route path="/host/payouts" element={user?.role === 'host' ? <HostPayouts user={user} /> : <Navigate to="/" />} />
          <Route path="/host/reviews" element={user?.role === 'host' ? <HostReviews user={user} /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/admin/approvals" element={user?.role === 'admin' ? <AdminApprovals user={user} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
