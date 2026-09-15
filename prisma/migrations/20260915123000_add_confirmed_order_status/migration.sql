-- Keep payment receipt separate from restaurant acceptance.
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED' AFTER 'PAID';
