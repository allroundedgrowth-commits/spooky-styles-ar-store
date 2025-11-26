-- Add Halloween Products to Database

-- Wigs
INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, stock_quantity, is_accessory) VALUES
('Witch''s Midnight Cascade', 'Long flowing black wig with purple highlights, perfect for any witch costume', 29.99, 24.99, 'wigs', 'witch', 'https://cdn.spookystyles.com/models/witch-wig-01.glb', 'https://cdn.spookystyles.com/images/witch-wig-01.jpg', 50, false),
('Zombie Decay Dreads', 'Matted dreadlock wig with realistic decay effects and blood stains', 34.99, NULL, 'wigs', 'zombie', 'https://cdn.spookystyles.com/models/zombie-wig-01.glb', 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg', 35, false),
('Vampire Crimson Elegance', 'Sleek black wig with blood-red streaks, styled in a sophisticated updo', 39.99, 32.99, 'wigs', 'vampire', 'https://cdn.spookystyles.com/models/vampire-wig-01.glb', 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg', 42, false),
('Skeleton Bone White', 'Stark white wig with bone-like texture and glow-in-the-dark highlights', 27.99, NULL, 'wigs', 'skeleton', 'https://cdn.spookystyles.com/models/skeleton-wig-01.glb', 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg', 60, false),
('Ghost Ethereal Mist', 'Wispy white wig that seems to float, with translucent fiber effects', 31.99, 26.99, 'wigs', 'ghost', 'https://cdn.spookystyles.com/models/ghost-wig-01.glb', 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg', 45, false),
('Demon Inferno Spikes', 'Fiery red and orange spiked wig with horn-compatible design', 44.99, NULL, 'wigs', 'demon', 'https://cdn.spookystyles.com/models/demon-wig-01.glb', 'https://cdn.spookystyles.com/images/demon-wig-01.jpg', 28, false),
('Werewolf Wild Mane', 'Shaggy brown wig with realistic fur texture and wild styling', 36.99, 29.99, 'wigs', 'werewolf', 'https://cdn.spookystyles.com/models/werewolf-wig-01.glb', 'https://cdn.spookystyles.com/images/werewolf-wig-01.jpg', 38, false),
('Mummy Ancient Wraps', 'Tattered bandage-style wig with aged, dusty appearance', 25.99, NULL, 'wigs', 'mummy', 'https://cdn.spookystyles.com/models/mummy-wig-01.glb', 'https://cdn.spookystyles.com/images/mummy-wig-01.jpg', 52, false);

-- Hats
INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, stock_quantity, is_accessory) VALUES
('Classic Witch Hat', 'Traditional pointed black hat with purple ribbon and silver buckle', 19.99, 15.99, 'hats', 'witch', 'https://cdn.spookystyles.com/models/witch-hat-01.glb', 'https://cdn.spookystyles.com/images/witch-hat-01.jpg', 75, true),
('Zombie Brain Exposed Cap', 'Grotesque cap with exposed brain detail and blood effects', 22.99, NULL, 'hats', 'zombie', 'https://cdn.spookystyles.com/models/zombie-hat-01.glb', 'https://cdn.spookystyles.com/images/zombie-hat-01.jpg', 40, true),
('Vampire Count''s Top Hat', 'Elegant black top hat with red satin lining and bat emblem', 32.99, 27.99, 'hats', 'vampire', 'https://cdn.spookystyles.com/models/vampire-hat-01.glb', 'https://cdn.spookystyles.com/images/vampire-hat-01.jpg', 55, true),
('Skeleton Crown of Bones', 'Intricate crown made of realistic bone pieces', 28.99, NULL, 'hats', 'skeleton', 'https://cdn.spookystyles.com/models/skeleton-hat-01.glb', 'https://cdn.spookystyles.com/images/skeleton-hat-01.jpg', 48, true),
('Demon Horned Headpiece', 'Curved demon horns with metallic red finish and adjustable band', 24.99, 19.99, 'hats', 'demon', 'https://cdn.spookystyles.com/models/demon-hat-01.glb', 'https://cdn.spookystyles.com/images/demon-hat-01.jpg', 62, true),
('Werewolf Ears Headband', 'Furry wolf ears on comfortable headband with realistic texture', 16.99, NULL, 'hats', 'werewolf', 'https://cdn.spookystyles.com/models/werewolf-hat-01.glb', 'https://cdn.spookystyles.com/images/werewolf-hat-01.jpg', 80, true);

-- Masks
INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, stock_quantity, is_accessory) VALUES
('Witch Crone Face Mask', 'Detailed witch mask with warts, hooked nose, and evil grin', 34.99, 29.99, 'masks', 'witch', 'https://cdn.spookystyles.com/models/witch-mask-01.glb', 'https://cdn.spookystyles.com/images/witch-mask-01.jpg', 45, true),
('Zombie Rotting Face', 'Hyper-realistic zombie mask with exposed flesh and missing jaw', 42.99, NULL, 'masks', 'zombie', 'https://cdn.spookystyles.com/models/zombie-mask-01.glb', 'https://cdn.spookystyles.com/images/zombie-mask-01.jpg', 32, true),
('Vampire Fanged Elegance', 'Pale vampire mask with prominent fangs and blood-red lips', 38.99, 32.99, 'masks', 'vampire', 'https://cdn.spookystyles.com/models/vampire-mask-01.glb', 'https://cdn.spookystyles.com/images/vampire-mask-01.jpg', 50, true),
('Skeleton Skull Mask', 'Anatomically accurate skull mask with movable jaw', 29.99, NULL, 'masks', 'skeleton', 'https://cdn.spookystyles.com/models/skeleton-mask-01.glb', 'https://cdn.spookystyles.com/images/skeleton-mask-01.jpg', 65, true),
('Ghost Spectral Face', 'Translucent ghost mask with hollow eyes and flowing design', 26.99, 21.99, 'masks', 'ghost', 'https://cdn.spookystyles.com/models/ghost-mask-01.glb', 'https://cdn.spookystyles.com/images/ghost-mask-01.jpg', 58, true),
('Demon Hellfire Mask', 'Terrifying demon mask with glowing eyes and sharp teeth', 44.99, NULL, 'masks', 'demon', 'https://cdn.spookystyles.com/models/demon-mask-01.glb', 'https://cdn.spookystyles.com/images/demon-mask-01.jpg', 38, true),
('Werewolf Beast Mask', 'Full-head werewolf mask with realistic fur and snarling expression', 49.99, 42.99, 'masks', 'werewolf', 'https://cdn.spookystyles.com/models/werewolf-mask-01.glb', 'https://cdn.spookystyles.com/images/werewolf-mask-01.jpg', 28, true),
('Mummy Wrapped Terror', 'Mummy mask with aged bandages and hollow eye sockets', 31.99, NULL, 'masks', 'mummy', 'https://cdn.spookystyles.com/models/mummy-mask-01.glb', 'https://cdn.spookystyles.com/images/mummy-mask-01.jpg', 42, true);

-- Accessories
INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, stock_quantity, is_accessory) VALUES
('Witch''s Broomstick', 'Classic flying broomstick with twisted wood handle and straw bristles', 24.99, 19.99, 'accessories', 'witch', 'https://cdn.spookystyles.com/models/witch-broom-01.glb', 'https://cdn.spookystyles.com/images/witch-broom-01.jpg', 60, true),
('Zombie Severed Hand', 'Realistic severed hand prop with dripping blood effects', 14.99, NULL, 'accessories', 'zombie', 'https://cdn.spookystyles.com/models/zombie-hand-01.glb', 'https://cdn.spookystyles.com/images/zombie-hand-01.jpg', 85, true),
('Vampire Cape Deluxe', 'Floor-length black cape with red satin lining and high collar', 39.99, 34.99, 'accessories', 'vampire', 'https://cdn.spookystyles.com/models/vampire-cape-01.glb', 'https://cdn.spookystyles.com/images/vampire-cape-01.jpg', 48, true),
('Skeleton Gloves', 'Black gloves with white bone print for realistic skeleton hands', 12.99, NULL, 'accessories', 'skeleton', 'https://cdn.spookystyles.com/models/skeleton-gloves-01.glb', 'https://cdn.spookystyles.com/images/skeleton-gloves-01.jpg', 95, true),
('Ghost Chain Shackles', 'Rusty chain and shackle set for haunting ghost costume', 18.99, 15.99, 'accessories', 'ghost', 'https://cdn.spookystyles.com/models/ghost-chains-01.glb', 'https://cdn.spookystyles.com/images/ghost-chains-01.jpg', 72, true),
('Demon Pitchfork', 'Three-pronged pitchfork with metallic red finish and devil details', 27.99, NULL, 'accessories', 'demon', 'https://cdn.spookystyles.com/models/demon-pitchfork-01.glb', 'https://cdn.spookystyles.com/images/demon-pitchfork-01.jpg', 52, true),
('Werewolf Claws', 'Sharp werewolf claw gloves with realistic fur and nails', 21.99, 17.99, 'accessories', 'werewolf', 'https://cdn.spookystyles.com/models/werewolf-claws-01.glb', 'https://cdn.spookystyles.com/images/werewolf-claws-01.jpg', 68, true),
('Mummy Bandage Wraps', 'Authentic-looking bandage wraps for full mummy transformation', 16.99, NULL, 'accessories', 'mummy', 'https://cdn.spookystyles.com/models/mummy-wraps-01.glb', 'https://cdn.spookystyles.com/images/mummy-wraps-01.jpg', 78, true),
('Witch''s Spell Book', 'Ancient-looking spell book prop with mystical symbols', 22.99, 18.99, 'accessories', 'witch', 'https://cdn.spookystyles.com/models/witch-book-01.glb', 'https://cdn.spookystyles.com/images/witch-book-01.jpg', 55, true),
('Vampire Fangs Premium', 'Custom-fit vampire fangs with realistic appearance', 9.99, NULL, 'accessories', 'vampire', 'https://cdn.spookystyles.com/models/vampire-fangs-01.glb', 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg', 120, true);
