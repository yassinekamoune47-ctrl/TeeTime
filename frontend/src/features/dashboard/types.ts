export interface AdminKpis {
    totalUsers: number;
    totalPlayers: number;
    totalManagers: number;
    totalInfluencers: number;
    totalClubs: number;
    activeClubs: number;
    reservationsLast30Days: number;
    reservationsTrendPct: number;
    pendingReservations: number;
    pendingMembershipRequests: number;
    activeTournaments: number;
    revenueLast30Days: number;
    revenueTrendPct: number;
    newUsersThisMonth: number;
}

/** month formatted as "YYYY-MM", values are cumulative users per role */
export interface MonthlyGrowthPoint {
    month: string;
    players: number;
    managers: number;
    influencers: number;
}

/** date formatted as "YYYY-MM-DD" */
export interface DailyCountPoint {
    date: string;
    count: number;
}

export interface ClubCountPoint {
    name: string;
    count: number;
}

/** Latest reservation with its saved booking date. date "YYYY-MM-DD", time "HH:mm" */
export interface AdminRecentReservation {
    id: string;
    playerName: string;
    clubName: string;
    courseName: string;
    reservationDate: string;
    time: string;
    numberOfPlayers: number;
    status: string;
}

export interface AdminDashboardData {
    kpis: AdminKpis;
    usersGrowth: MonthlyGrowthPoint[];
    reservationsTrend: DailyCountPoint[];
    activityHeatmap: DailyCountPoint[];
    topClubs: ClubCountPoint[];
    recentReservations: AdminRecentReservation[];
    /** PENDING reservations the admin can accept or reject directly */
    pendingReservationRequests: AdminRecentReservation[];
}

export interface ManagerKpis {
    todayReservations: number;
    pendingRequests: number;
    members: number;
    todayRevenue: number;
}

/** date formatted as "YYYY-MM-DD", rate as a 0–100 percentage */
export interface DailyRatePoint {
    date: string;
    rate: number;
}

/** status: PENDING / ACCEPTED / REJECTED */
export interface StatusCountPoint {
    status: string;
    count: number;
}

/** date formatted as "YYYY-MM-DD", revenue in MAD (green fees) */
export interface DailyRevenuePoint {
    date: string;
    revenue: number;
}

export interface ManagerDashboardData {
    kpis: ManagerKpis;
    utilization: DailyRatePoint[];
    reservationsByStatus: StatusCountPoint[];
    revenue: DailyRevenuePoint[];
}

export interface PlayerKpis {
    /** "HH:mm" of the next reservation, or null when there is none */
    nextTeeTime: string | null;
    totalReservations: number;
    clubsCount: number;
    upcomingCount: number;
}

/** The closest upcoming reservation (PENDING or ACCEPTED). date "yyyy-MM-dd", time "HH:mm" */
export interface NextReservation {
    reservationId: string;
    clubName: string;
    clubLogoURL: string | null;
    courseName: string;
    courseImage: string | null;
    holeCount: number;
    date: string;
    time: string;
    players: number;
    status: string;
}

/** Last past reservation, most recent first. date "yyyy-MM-dd", time "HH:mm" */
export interface RecentReservation {
    id: string;
    clubName: string;
    date: string;
    time: string;
    status: string;
}

/** Clubs where the player holds an ACTIVE membership */
export interface PlayerClub {
    clubId: string;
    clubName: string;
    clubCity: string;
    clubLogoURL: string | null;
    membershipTitle: string;
}

export interface PlayerDashboardData {
    kpis: PlayerKpis;
    /** null when there is no upcoming reservation — hide the section */
    nextReservation: NextReservation | null;
    recentReservations: RecentReservation[];
    myClubs: PlayerClub[];
}