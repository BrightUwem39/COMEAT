-- Puff-Puff and Naija Buns do not use a pepper-tolerance modifier.
DELETE FROM "ModifierGroup"
WHERE "code" = 'pepper'
  AND "productId" IN (
    SELECT "id"
    FROM "Product"
    WHERE "slug" IN ('naija-buns', 'puff-puff')
  );
