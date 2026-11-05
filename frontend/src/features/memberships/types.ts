export type EMStatus = 'ACTIVE' | 'SUSPENDED' | '' | null;

export interface Membership {
  id: string;
  title: string;
  description: string;
  price: number;
  status: EMStatus;
  benefits: string[];
  club?: {
    id?: string;
    name?: string;
    city?: string;
    address?: string;
  };
}

export interface MembershipClubSummary {
  id: string;
  name: string;
  city: string;
  logoURL: string;
  coverURL: string;
  phone: string;
}

export interface ClubMembershipGroup {
  club: MembershipClubSummary;
  memberships: Membership[];
}

export interface SearchAllMemberships {
  title: string;
  price: number | null;
  clubName: string;
  page: number;
  size: number;
}

export interface SearchMyMemberships {
  title: string;
  status: EMStatus;
  price: number | null;
  page: number;
  size: number;
}

export interface AddMembership {
  title: string;
  description: string;
  price: number;
  benefits: string[];
}

export interface UpdateMembership {
  id: string;
  title: string;
  description: string;
  price: number;
  status: EMStatus;
  benefits: string[];
}

export type EMRStatus = 'ACCEPTED' | 'REJECTED' | 'PENDING';

export interface SearchMembershipRequests {
  firstName: string;
  lastName: string;
  planName: string;
  status: EMRStatus | '' | null;
  page: number;
  size: number;
}

export type MembershipPaymentStatus = 'UNPAID' | 'PAID';

export interface MembershipRequest {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string | null;
  userPhone: string | null;
  membershipId: string;
  planName: string;
  clubName: string | null;
  price: number;
  startDate: string | null;
  endDate: string | null;
  status: EMRStatus;
  paymentStatus: MembershipPaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface SubscribeMembershipPayload {
  membershipId: string;
}

export interface PlayerClubMembership {
  clubId: string;
  clubName: string;
  clubLogoURL: string;
  clubCity: string;
  clubAddress: string;
  membershipId: string;
  membershipTitle: string;
  membershipDescription: string;
  membershipStartDate: string;
  membershipEndDate: string;
  coursesCount: number;
}

export interface SearchPlayerClubs {
  search: string;
  page: number;
  size: number;
}