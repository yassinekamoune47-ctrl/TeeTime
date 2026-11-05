export interface NotificationOrderData {
  orderId?: string;
  productName?: string | null;
  quantity?: number;
  size?: string | null;
  color?: string | null;
  totalPrice?: number;
  amountDue?: number;
}

export interface NotificationReservationData {
  reservationId?: string;
  clubName?: string | null;
  courseName?: string | null;
  reservationDate?: string | null;
  startTime?: string | null;
  numberOfPlayers?: number;
  reason?: string | null;
}

export interface NotificationData extends NotificationOrderData, NotificationReservationData {}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: NotificationData | null;
  createdAt: string;
}

export function notificationLink(type: string, data?: NotificationData | null): string {
  switch (type) {
    case 'ORDER_ACCEPTED':
    case 'ORDER_REJECTED':
      return '/orders';
    case 'RESERVATION_CONFIRMED':
    case 'RESERVATION_REJECTED':
    case 'RESERVATION_CANCELLED':
    case 'BOOKING_REMINDER':
    case 'ALTERNATIVE_SLOTS': {
      const reservationId = data?.reservationId;
      return reservationId
        ? `/my-reservations?reservation=${encodeURIComponent(reservationId)}`
        : '/my-reservations';
    }
    case 'MEMBERSHIP_APPROVED':
    case 'MEMBERSHIP_REJECTED':
      return '/my-clubs';
    case 'RESERVATION_REQUESTED':
      return '/requests';
    case 'MEMBERSHIP_REQUESTED':
      return '/members';
    case 'TOURNAMENT_ANNOUNCED':
    case 'TOURNAMENT_CANCELLED':
    case 'TOURNAMENT_STARTED':
    case 'TOURNAMENT_COMPLETED':
      return '/manage-tournaments';
    default:
      return '';
  }
}
