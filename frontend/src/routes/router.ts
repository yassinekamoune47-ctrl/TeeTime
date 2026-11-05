import { createBrowserRouter } from 'react-router-dom';
import { ManagerGuard, AdminGuard, ApexAdminGuard } from './RoleGuard';
import * as L from './lazy';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute.tsx';

export const router = createBrowserRouter([
  // ─── Public ───
  {
    path: '/',
    children: [
      { index: true, ...L.landing },
      { path: 'reservations', ...L.reservationBrowse },
      { path: 'reservations/:clubId', ...L.clubProfile },
      { path: 'sessions/:courseId', ...L.reservations },
      { path: 'memberships', ...L.memberships },
      { path: 'tournaments', ...L.tournaments },
      { path: 'search', ...L.search },
      { path: 'campus', ...L.campus },
      { path: 'campus/:packageId', ...L.campusDetail },
      { path: 'shop', ...L.shop },
      { path: 'shop/:productId', ...L.shopDetail },
      { path: 'login', ...L.login },
      { path: 'mfa-verification', ...L.mfaVerification },
      { path: 'register', ...L.register },
      { path: 'forgot-password', ...L.forgotPassword },
      { path: 'reset-password', ...L.resetPassword },
      { path: 'verify-email', ...L.verifyEmail },
    ],
  },

  // ─── Player (auth + PLAYER role) ───
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: AppLayout,
        children: [
          { path: 'my-reservations', ...L.myReservations },
          { path: 'my-clubs', ...L.myClubs },
          { path: 'orders', ...L.myOrders },
          { path: 'orders/:orderId/pay', ...L.orderPayment },
          { path: 'memberships/:membershipId/subscribe', ...L.membershipPayment },
          { path: 'my-campus', ...L.myCampus },

          // ─── Shared (auth + any role content changed based on the user's role) ───
          { path: 'dashboard', ...L.dashboard },
          { path: 'notifications', ...L.notifications },
          { path: 'profile', ...L.profile },

          {
            Component: ManagerGuard,
            children: [
              { path: 'my-club', ...L.myClub },
              { path: 'planning', ...L.planning },
              { path: 'requests', ...L.requests },
              { path: 'members', ...L.members },
              { path: 'packages', ...L.packages },
            ],
          },

          {
            Component: ApexAdminGuard,
            children: [
              { path: 'manage-tournaments', ...L.manageTournaments },
            ],
          },

          {
            Component: AdminGuard,
            children: [
              { path: 'users', ...L.users },
              { path: 'clubs', ...L.clubsManagement },
              { path: 'manage-shop', ...L.shopManagement },
              { path: 'manage-memberships', ...L.membershipsManagement },
            ],
          },
        ],
      },
    ],
  },

  // ─── Errors ───
  { path: '/403', ...L.forbidden },
  { path: '*', ...L.notFound },
]);
