import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './store/authStore';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import CreatePlan from './pages/CreatePlan';
import PlanList from './pages/PlanList';
import PlanDetail from './pages/PlanDetail';
import Preferences from './pages/Preferences';
import './App.css';

const App: React.FC = () => {
  const { loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
          fontSize: 14,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="create" element={<CreatePlan />} />
            <Route path="plans" element={<PlanList />} />
            <Route path="plans/:id" element={<PlanDetail />} />
            <Route path="preferences" element={<Preferences />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
