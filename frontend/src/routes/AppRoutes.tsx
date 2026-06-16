import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { Users } from '../pages/Users';
import { Accounts } from '../pages/Accounts';
import { Categories } from '../pages/Categories';
import { Transactions } from '../pages/Transactions';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};
