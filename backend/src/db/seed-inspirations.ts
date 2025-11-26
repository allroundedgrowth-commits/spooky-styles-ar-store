import pool from '../config/database.js';

async function seedInspirations() {
  try {
    console.log('🎃 Seeding costume inspirations...\n');

    // Sample inspirations data
    const inspirations = [
      {
        name: 'Classic Witch',
        description: 'Channel your inner sorceress with this timeless witch look. Perfect for casting spells and brewing potions! This complete ensemble includes a long black wig with natural waves, perfect for that mysterious witchy vibe.',
        image_url: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800'
      },
      {
        name: 'Vampire Queen',
        description: 'Embrace the darkness with this elegant vampire ensemble. Gothic glamour meets supernatural sophistication. Features a sleek black wig with crimson highlights for that perfect undead royalty look.',
        image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'
      },
      {
        name: 'Mystical Mermaid',
        description: 'Dive into fantasy with this enchanting mermaid look. Shimmer and shine like you just emerged from the deep! Includes flowing teal and purple ombre wigs that cascade like ocean waves.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
      },
      {
        name: 'Zombie Bride',
        description: 'Till death do us part... and beyond! This undead bride look is hauntingly beautiful. Complete with a distressed white wig with gray streaks for that perfect post-apocalyptic wedding day.',
        image_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800'
      },
      {
        name: 'Fairy Princess',
        description: 'Sprinkle some magic with this whimsical fairy look. Perfect for those who believe in enchantment! Features pastel pink and lavender wigs with glitter accents for maximum sparkle.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
      },
      {
        name: 'Pirate Captain',
        description: 'Ahoy matey! Set sail for adventure with this swashbuckling pirate ensemble. Includes a wild, windswept brown wig with braids and beads for authentic seafaring style.',
        image_url: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=800'
      }
    ];

    // Insert inspirations
    for (const inspiration of inspirations) {
      const query = `
        INSERT INTO costume_inspirations (name, description, image_url)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        inspiration.name,
        inspiration.description,
        inspiration.image_url
      ]);

      console.log(`✅ Created: ${inspiration.name} (ID: ${result.rows[0].id})`);
    }

    console.log('\n✅ Successfully seeded costume inspirations!');
    console.log(`   Total inspirations: ${inspirations.length}`);
    console.log('\n💡 Tip: Link products to inspirations using the admin dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inspirations:', error);
    process.exit(1);
  }
}

seedInspirations();
