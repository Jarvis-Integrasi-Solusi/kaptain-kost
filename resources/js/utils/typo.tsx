export const getPaymentCategory = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'booking_fee':
            return 'Booking';
        case 'down_payment_fee':
            return 'Down Payment';
        case 'rental_fee':
            return 'Rental';
        default:
            return category;
    }
};
