-- Equipment condition shown on the storefront and in the WhatsApp inquiry.
ALTER TABLE "Product" ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'Nuevo';
