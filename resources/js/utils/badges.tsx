import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';

export const getPaymentTypeBadge = (type?: string) => {
    const normalizedType = type?.toLowerCase();

    if (normalizedType === 'cash') {
        return <Badge variant="warning">{type}</Badge>;
    } else if (normalizedType === 'monthly') {
        return <Badge variant="info">{type}</Badge>;
    } else if (normalizedType === 'partial') {
        return <Badge variant="success">{type}</Badge>;
    }

    return <Badge variant="error">{type}</Badge>;
};

export const getRentalStatusBadge = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'booked') {
        return <Badge variant="warning">{status}</Badge>;
    } else if (normalizedStatus === 'occupied') {
        return <Badge variant="info">{status}</Badge>;
    } else if (normalizedStatus === 'completed') {
        return <Badge variant="success">{status}</Badge>;
    }

    return <Badge variant="error">{status}</Badge>;
};

export const getRoomStatusBadge = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'booked') {
        return <Badge variant="warning">{status}</Badge>;
    } else if (normalizedStatus === 'occupied') {
        return <Badge variant="info">{status}</Badge>;
    } else if (normalizedStatus === 'available') {
        return <Badge variant="success">{status}</Badge>;
    }

    return <Badge variant="error">{status}</Badge>;
};

export const getPaymentStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'paid') {
        return <Badge variant="success">{status}</Badge>;
    } else if (normalizedStatus === 'unpaid') {
        return <Badge variant="error">{status}</Badge>;
    } else if (normalizedStatus === 'pending') {
        return <Badge variant="warning">pending approval</Badge>;
    }

    return <Badge variant="secondary">{status}</Badge>;
};

export const getRemainingTOPBadge = (
  billingDate: string,
  dueDate: string,
  paymentStatus?: string
) => {
  if (paymentStatus?.toLowerCase() === 'paid') {
    return '-';
  }

  const now = dayjs();
  const billing = dayjs(billingDate);
  const due = dayjs(dueDate);

  if (now.isBefore(billing)) {
    return '-';
  }

  let variant: 'info' | 'success' | 'warning' | 'error' | 'secondary' = 'secondary';
  let text = '';

  const diffMinutes = due.diff(now, 'minute');
  const diffDays = Math.floor(diffMinutes / (60 * 24));
  const diffHours = Math.floor((diffMinutes % (60 * 24)) / 60);

  if (diffMinutes < 0) {
    // due date overdue
    text = `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays > 0) {
    // days remaining
    text = `${diffDays} days`;
  } else {
    // hours remaining
    text = `${diffHours} hours`;
  }

  if (now.isSame(billing, 'day') || (now.isAfter(billing) && now.isBefore(due))) {
    variant = diffDays <= 3 ? 'warning' : 'success';
  } else if (now.isSame(due, 'day') || now.isAfter(due)) {
    variant = 'error';
  }

  return <Badge variant={variant}>{text}</Badge>;
};
