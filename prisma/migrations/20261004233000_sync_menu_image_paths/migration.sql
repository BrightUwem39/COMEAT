UPDATE "Product"
SET
  "imageUrl" = CASE "slug"
    WHEN 'chicken' THEN '/images/menu/chicken.webp'
    WHEN 'goat-meat' THEN '/images/menu/goat-meat.webp'
    WHEN 'gizzard' THEN '/images/menu/gizzard.webp'
    WHEN 'fish' THEN '/images/menu/fish.webp'
    WHEN 'chicken-drumsticks' THEN '/images/menu/chicken-drumsticks.webp'
    WHEN 'beef-mixed-offal' THEN '/images/menu/beef-mixed-offal.webp'
    WHEN 'moi-moi' THEN '/images/menu/moi-moi-new.webp'
    WHEN 'gizdodo' THEN '/images/menu/gizdodo.webp'
    WHEN 'plantains' THEN '/images/menu/plantain.webp'
    WHEN 'masa-bowl' THEN '/images/menu/masa-bowl.webp'
  END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN (
  'chicken',
  'goat-meat',
  'gizzard',
  'fish',
  'chicken-drumsticks',
  'beef-mixed-offal',
  'moi-moi',
  'gizdodo',
  'plantains',
  'masa-bowl'
);

UPDATE "Product"
SET
  "description" = "name",
  "priceNote" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'ewa-agoyin-sauce';

UPDATE "ProductVariant" AS variant
SET
  "active" = FALSE,
  "updatedAt" = CURRENT_TIMESTAMP
FROM "Product" AS product
WHERE variant."productId" = product."id"
  AND product."slug" = 'ewa-agoyin-sauce'
  AND variant."code" <> '2l';
