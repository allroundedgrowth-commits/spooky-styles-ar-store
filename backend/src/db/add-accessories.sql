-- Add Accessories for AR Try-On
-- These accessories can be layered with wigs in the AR experience

-- Glasses & Sunglasses
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Classic Black Sunglasses', 'Timeless black aviator sunglasses. Perfect for any outfit and occasion.', 24.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', '/models/accessories/sunglasses-black.glb', 100, true),
('Cat Eye Glasses - Red', 'Retro cat eye glasses in bold red. Make a fashion statement.', 29.99, 'Accessories', 'fashion', 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400', '/models/accessories/cat-eye-red.glb', 85, true),
('Round Vintage Glasses', 'Vintage-inspired round glasses with gold frames. Intellectual chic.', 27.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400', '/models/accessories/round-gold.glb', 90, true),
('Oversized Sunglasses - Pink', 'Glamorous oversized sunglasses in pink. Celebrity style.', 32.99, 'Accessories', 'fashion', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400', '/models/accessories/oversized-pink.glb', 75, true),
('Steampunk Goggles', 'Victorian steampunk goggles with brass details. Unique and edgy.', 39.99, 'Accessories', 'fashion', 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400', '/models/accessories/steampunk-goggles.glb', 60, true);

-- Earrings
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Gold Hoop Earrings', 'Classic gold hoop earrings. Elegant and versatile for any occasion.', 19.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', '/models/accessories/hoop-gold.glb', 120, true),
('Diamond Stud Earrings', 'Sparkling diamond stud earrings. Timeless elegance.', 34.99, 'Accessories', 'formal', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', '/models/accessories/diamond-studs.glb', 95, true),
('Chandelier Earrings - Silver', 'Dramatic chandelier earrings in silver. Perfect for special events.', 44.99, 'Accessories', 'formal', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', '/models/accessories/chandelier-silver.glb', 70, true),
('Feather Earrings - Turquoise', 'Bohemian feather earrings with turquoise accents. Free-spirited style.', 22.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400', '/models/accessories/feather-turquoise.glb', 80, true),
('Pearl Drop Earrings', 'Elegant pearl drop earrings. Classic sophistication.', 29.99, 'Accessories', 'formal', 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=400', '/models/accessories/pearl-drop.glb', 85, true);

-- Headbands & Hair Accessories
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Velvet Headband - Black', 'Luxurious black velvet headband. Adds elegance to any hairstyle.', 16.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', '/models/accessories/headband-velvet.glb', 110, true),
('Pearl Headband', 'Delicate pearl-embellished headband. Perfect for weddings and formal events.', 34.99, 'Accessories', 'formal', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', '/models/accessories/headband-pearl.glb', 65, true),
('Flower Crown - Pastel', 'Beautiful pastel flower crown. Ideal for festivals and photoshoots.', 28.99, 'Accessories', 'fashion', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', '/models/accessories/flower-crown.glb', 75, true),
('Bow Headband - Red', 'Cute oversized bow headband in red. Playful and feminine.', 18.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400', '/models/accessories/bow-red.glb', 90, true),
('Rhinestone Headband', 'Sparkly rhinestone headband. Glamorous for parties and events.', 39.99, 'Accessories', 'formal', 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400', '/models/accessories/rhinestone-headband.glb', 55, true);

-- Hats
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Wide Brim Sun Hat - Beige', 'Elegant wide brim sun hat in beige. Perfect for beach and summer.', 32.99, 'Hats', 'casual', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400', '/models/accessories/sun-hat-beige.glb', 80, true),
('Fedora Hat - Black', 'Classic black fedora hat. Sophisticated and stylish.', 36.99, 'Hats', 'fashion', 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400', '/models/accessories/fedora-black.glb', 70, true),
('Beret - Red', 'French-style red beret. Chic and artistic.', 24.99, 'Hats', 'fashion', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', '/models/accessories/beret-red.glb', 85, true),
('Baseball Cap - White', 'Casual white baseball cap. Sporty and comfortable.', 19.99, 'Hats', 'casual', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', '/models/accessories/cap-white.glb', 120, true),
('Bucket Hat - Denim', 'Trendy denim bucket hat. Y2K fashion revival.', 26.99, 'Hats', 'fashion', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', '/models/accessories/bucket-denim.glb', 95, true);

-- Necklaces & Jewelry
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Gold Chain Necklace', 'Simple gold chain necklace. Versatile everyday jewelry.', 29.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', '/models/accessories/chain-gold.glb', 100, true),
('Pearl Necklace - Classic', 'Timeless pearl necklace. Elegant and sophisticated.', 49.99, 'Accessories', 'formal', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', '/models/accessories/pearl-necklace.glb', 75, true),
('Choker - Black Velvet', 'Trendy black velvet choker. Edgy and fashionable.', 16.99, 'Accessories', 'fashion', 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400', '/models/accessories/choker-velvet.glb', 110, true),
('Statement Necklace - Turquoise', 'Bold turquoise statement necklace. Eye-catching bohemian style.', 39.99, 'Accessories', 'fashion', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400', '/models/accessories/statement-turquoise.glb', 65, true);

-- Halloween Accessories
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Witch Hat - Classic Black', 'Traditional pointed witch hat. Essential Halloween accessory.', 22.99, 'Hats', 'witch', 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400', '/models/accessories/witch-hat.glb', 150, true),
('Devil Horns Headband', 'Red devil horns on a headband. Devilishly fun for Halloween.', 14.99, 'Accessories', 'halloween', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400', '/models/accessories/devil-horns.glb', 130, true),
('Cat Ears Headband - Black', 'Cute black cat ears headband. Purrfect for Halloween.', 12.99, 'Accessories', 'halloween', 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400', '/models/accessories/cat-ears.glb', 140, true),
('Vampire Fangs', 'Realistic vampire fangs. Complete your vampire costume.', 9.99, 'Accessories', 'vampire', 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400', '/models/accessories/vampire-fangs.glb', 160, true),
('Skeleton Mask', 'Half-face skeleton mask. Spooky and stylish.', 18.99, 'Masks', 'skeleton', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400', '/models/accessories/skeleton-mask.glb', 120, true),
('Zombie Makeup Kit', 'Professional zombie makeup effects. Transform into the undead.', 34.99, 'Accessories', 'zombie', 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400', '/models/accessories/zombie-makeup.glb', 90, true);

-- Scarves & Bandanas
INSERT INTO products (name, description, price, category, theme, thumbnail_url, model_url, stock_quantity, is_accessory) VALUES
('Silk Scarf - Floral', 'Luxurious silk scarf with floral pattern. Versatile styling options.', 32.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', '/models/accessories/scarf-floral.glb', 85, true),
('Bandana - Red Paisley', 'Classic red paisley bandana. Rockabilly and western style.', 12.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400', '/models/accessories/bandana-red.glb', 110, true),
('Infinity Scarf - Gray', 'Cozy gray infinity scarf. Perfect for fall and winter.', 24.99, 'Accessories', 'casual', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400', '/models/accessories/infinity-gray.glb', 95, true);

-- Summary
SELECT 
    COUNT(*) as total_accessories,
    COUNT(CASE WHEN category = 'Accessories' THEN 1 END) as accessories,
    COUNT(CASE WHEN category = 'Hats' THEN 1 END) as hats,
    COUNT(CASE WHEN category = 'Masks' THEN 1 END) as masks,
    COUNT(CASE WHEN is_accessory = true THEN 1 END) as ar_compatible
FROM products 
WHERE is_accessory = true;
