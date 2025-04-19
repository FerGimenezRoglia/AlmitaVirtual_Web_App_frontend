import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Welcome from '../pages/Welcome/Welcome';
import Profile from '../pages/Profile/Profile';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboar';
import Environment from '../pages/Environment/Environment';
import NotFound from '../pages/NotFound/NotFound';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/environment/:id" element={<Environment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}