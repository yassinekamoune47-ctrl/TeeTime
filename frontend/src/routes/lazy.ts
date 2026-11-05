const lazyLanding = () =>
  import('@/features/landing/pages/LandingPage').then((m) => ({ Component: m.default }));

const lazyPlaceholder = () =>
  import('@/components/shared/PlaceHolder').then((m) => ({ Component: m.default }));

const lazyClubs = () =>
  import('@/features/clubs/pages/SearchPage').then((m) => ({ Component: m.default }));

const lazyClubDetail = () =>
  import('@/features/clubs/pages/ClubDetailsPage').then((m) => ({ Component: m.default }));

const lazyReservations = () =>
  import('@/features/reservations/pages/SessionPage').then((m) => ({ Component: m.default }));

const lazyReservationBrowse = () =>
  import('@/features/reservations/pages/ReservationPage').then((m) => ({ Component: m.default }));

const lazyTournaments = () =>
  import('@/features/tournaments/pages/TournamentsPage').then((m) => ({ Component: m.default }));

const lazyMemberships = () =>
  import('@/features/memberships/pages/MembershipsPage').then((m) => ({ Component: m.default }));

const lazyMembershipPayment = () =>
  import('@/features/memberships/pages/MembershipPaymentPage').then((m) => ({ Component: m.default }));

const lazyLogin = () =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ Component: m.default }));

const lazyMfaVerification = () =>
    import('@/features/auth/pages/MfaVerificationPage').then((m) => ({ Component: m.default }));

const lazyRegister = () =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ Component: m.default }));

const lazyShop = () =>
  import('@/features/shop/pages/ShopPage').then((m) => ({ Component: m.default }));

const lazyShopDetail = () =>
  import('@/features/shop/pages/ProductDetailPage').then((m) => ({ Component: m.default }));

const lazyOrderPayment = () =>
  import('@/features/shop/pages/PaymentPage').then((m) => ({ Component: m.default }));

// Shared
const LazyDashboard = () =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ Component: m.default }));

const LazyNotifications = () =>
  import('@/features/notifications/pages/NotificationsPage').then((m) => ({ Component: m.default }));

const lazyProfile = () =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({ Component: m.default }));


// Player
const lazyMyReservations = () =>
  import('@/features/player/pages/MyReservationsPage').then((m) => ({ Component: m.default }));

const lazyMyClubs = () =>
  import('@/features/player/pages/MyClubsPage').then((m) => ({ Component: m.default }));

const lazyMyOrders = () =>
  import('@/features/player/pages/MyOrdersPage').then((m) => ({ Component: m.default }));

const lazyMyCampus = () =>
  import('@/features/player/pages/MyCampusPage').then((m) => ({ Component: m.default }));


// Manager
const lazyMyClub = () =>
  import('@/features/manager/pages/MyClubPage').then((m) => ({ Component: m.default }));

const lazyPlanning = () =>
  import('@/features/manager/pages/PlanningPage').then((m) => ({ Component: m.default }));

const lazyRequests = () =>
  import('@/features/manager/pages/RequestsPage').then((m) => ({ Component: m.default }));

const lazyMembers = () =>
  import('@/features/manager/pages/MembersPage').then((m) => ({ Component: m.default }));

const lazyManageTournaments = () =>
  import('@/features/manager/pages/ManageTournamentsPage').then((m) => ({ Component: m.default }));

const lazyPackages = () =>
  import('@/features/manager/pages/PackagesPage').then((m) => ({ Component: m.default }));

// Admin
const lazyUsers = () =>
  import('@/features/admin/pages/UsersPage').then((m) => ({ Component: m.default }));

const lazyClubsManagement = () =>
  import('@/features/admin/pages/ClubsManagementPage').then((m) => ({ Component: m.default }));

const lazyShopManagement = () =>
  import('@/features/admin/pages/ShopManagementPage').then((m) => ({ Component: m.default }));

const lazyMembershipsManagement = () =>
  import('@/features/admin/pages/MembershipsManagementPage').then((m) => ({ Component: m.default }));

// ─── Public ───
export const landing = { lazy: lazyLanding };
export const clubs = { lazy: lazyClubs };
export const clubProfile = { lazy: lazyClubDetail };
export const reservations = { lazy: lazyReservations };
export const reservationBrowse = { lazy: lazyReservationBrowse };
export const search = { lazy: lazyClubs };
export const campus = { lazy: lazyPlaceholder };
export const campusDetail = { lazy: lazyPlaceholder };
export const shop = { lazy: lazyShop };
export const shopDetail = { lazy: lazyShopDetail };
export const login = { lazy: lazyLogin };
export const mfaVerification = { lazy: lazyMfaVerification };
export const register = { lazy: lazyRegister };
export const forgotPassword = { lazy: lazyPlaceholder };
export const resetPassword = { lazy: lazyPlaceholder };
export const verifyEmail = { lazy: lazyPlaceholder };

// ─── shared ───
export const dashboard = { lazy: LazyDashboard };
export const notifications = { lazy: LazyNotifications };
export const profile = { lazy: lazyProfile };

// ─── Player ───
export const myReservations = { lazy: lazyMyReservations };
export const myClubs = { lazy: lazyMyClubs };
export const myOrders = { lazy: lazyMyOrders };
export const myCampus = { lazy: lazyMyCampus };
export const orderPayment = { lazy: lazyOrderPayment };

// ─── Manager ───
export const myClub = { lazy: lazyMyClub };
export const planning = { lazy: lazyPlanning };
export const requests = { lazy: lazyRequests };
export const members = { lazy: lazyMembers };
export const manageTournaments = { lazy: lazyManageTournaments };
export const packages = { lazy: lazyPackages };

// ─── Admin ───
export const users = { lazy: lazyUsers };
export const clubsManagement = { lazy: lazyClubsManagement };
export const shopManagement = { lazy: lazyShopManagement };
export const membershipsManagement = { lazy: lazyMembershipsManagement };

// ─── Errors ───
export const forbidden = { lazy: lazyPlaceholder };
export const notFound = { lazy: lazyPlaceholder };

export const tournaments = { lazy: lazyTournaments };

export const memberships = { lazy: lazyMemberships };

export const membershipPayment = { lazy: lazyMembershipPayment };
