-- Seed Products for Supabase Database
-- Run this in Supabase SQL Editor: https://yreqvwoiuykxfxxgdusw.supabase.co

-- Clear existing products (optional - comment out if you want to keep existing data)
-- DELETE FROM products;

-- Insert Halloween/Costume Wigs
INSERT INTO products (name, description, price, category, theme, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
VALUES
('Witch''s Midnight Wig', 'Long flowing black wig perfect for witch costumes. Features natural-looking synthetic fibers.', 29.99, 'Costume', 'Halloween', 
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 50, false),

('Vampire Red Wig', 'Deep crimson red wig with gothic styling. Perfect for vampire or dark fantasy costumes.', 34.99, 'Costume', 'Halloween',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', 30, false),

('Zombie Green Wig', 'Messy neon green wig ideal for zombie costumes. Pre-styled for that undead look.', 24.99, 'Costume', 'Halloween',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', 40, false),

('Ghost White Wig', 'Ethereal white wig with flowing locks. Perfect for ghost or angel costumes.', 27.99, 'Costume', 'Halloween',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', 35, false),

('Pumpkin Orange Wig', 'Vibrant orange wig perfect for pumpkin or autumn-themed costumes.', 26.99, 'Costume', 'Halloween',
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', 45, false);

-- Insert Professional/Everyday Wigs
INSERT INTO products (name, description, price, category, theme, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
VALUES
('Professional Bob - Black', 'Sleek professional bob wig in jet black. Perfect for work or formal events.', 49.99, 'Professional', 'Everyday',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800', 25, false),

('Casual Waves - Brown', 'Natural looking wavy brown wig with highlights. Great for everyday wear.', 39.99, 'Casual', 'Everyday',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', 35, false),

('Long Blonde Elegance', 'Luxurious long blonde wig with natural shine. Heat-resistant synthetic fibers.', 54.99, 'Professional', 'Everyday',
 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800', 20, false),

('Short Pixie - Auburn', 'Trendy short pixie cut in rich auburn. Low maintenance and stylish.', 44.99, 'Casual', 'Everyday',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800', 30, false),

('Curly Afro - Natural Black', 'Beautiful natural-looking afro wig. Soft, bouncy curls.', 59.99, 'Casual', 'Everyday',
 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800',
 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800', 15, false);

-- Insert Accessories
INSERT INTO products (name, description, price, category, theme, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
VALUES
('Witch Hat - Classic Black', 'Traditional pointed witch hat with wide brim. One size fits all.', 14.99, 'Accessory', 'Halloween',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 100, true),

('Vampire Fangs', 'Realistic vampire fangs with dental adhesive included.', 9.99, 'Accessory', 'Halloween',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', 150, true),

('Wig Cap - Nude', 'Essential wig cap for secure and comfortable wig wearing. Pack of 2.', 7.99, 'Accessory', 'Everyday',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800', 200, true),

('Wig Styling Spray', 'Professional wig styling spray for hold and shine.', 12.99, 'Accessory', 'Everyday',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', 75, true),

('Wig Brush - Wide Tooth', 'Gentle wide-tooth brush designed specifically for wigs.', 8.99, 'Accessory', 'Everyday',
 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800', 120, true);

-- Verify insertion
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as count FROM products GROUP BY category;
SELECT theme, COUNT(*) as count FROM products GROUP BY theme;

-- Show sample products
SELECT id, name, price, category, theme, stock_quantity, is_accessory 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;
