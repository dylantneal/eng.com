const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const communities = [
  {
    name: 'mechanical-engineering',
    display_name: 'Mechanical Engineering',
    description: 'Design, analysis, and manufacturing of mechanical systems',
    category: 'engineering',
    color: '#DC2626',
    member_count: 15420,
    post_count: 0
  },
  {
    name: 'electronics',
    display_name: 'Electronics & PCB Design',
    description: 'Circuit design, PCB layout, and electronic prototyping',
    category: 'engineering',
    color: '#7C3AED',
    member_count: 12380,
    post_count: 0
  },
  {
    name: 'robotics',
    display_name: 'Robotics',
    description: 'Autonomous systems, control theory, and robot design',
    category: 'engineering',
    color: '#059669',
    member_count: 8950,
    post_count: 0
  },
  {
    name: 'engineering-software',
    display_name: 'Engineering Software',
    description: 'CAD, simulation, and engineering tools discussion',
    category: 'software',
    color: '#2563EB',
    member_count: 11200,
    post_count: 0
  },
  {
    name: 'materials-science',
    display_name: 'Materials Science',
    description: 'Material properties, testing, and selection',
    category: 'science',
    color: '#B45309',
    member_count: 6780,
    post_count: 0
  },
  {
    name: 'manufacturing',
    display_name: 'Manufacturing',
    description: '3D printing, CNC, injection molding, and production',
    category: 'manufacturing',
    color: '#DC2626',
    member_count: 9340,
    post_count: 0
  }
];

const samplePosts = [
  {
    title: 'How to calculate bearing loads in rotating machinery?',
    content: 'I\'m working on a project involving rotating machinery and need help calculating the appropriate bearing loads for my design. The shaft rotates at 1800 RPM and carries a radial load of 500N. I\'ve been using the basic L10 life calculation but I\'m not sure if I\'m accounting for all the dynamic factors correctly. Any guidance on the proper methodology would be appreciated.',
    post_type: 'question',
    community_name: 'mechanical-engineering',
    author_id: 'user-1',
    tags: ['bearings', 'mechanics', 'calculations'],
    difficulty_level: 'intermediate',
    upvotes: 24,
    downvotes: 2,
    score: 22,
    hot_score: 15.5,
    comment_count: 8
  },
  {
    title: '[Show & Tell] Custom PCB for IoT Weather Station',
    content: 'Just finished designing and testing my first custom PCB for an IoT weather station project. Features include ESP32, multiple sensors (BME280, light sensor, rain detector), and solar charging capability. The board is 4-layer with proper ground planes and has been running stable for 2 months now. Happy to share the design files and lessons learned!',
    post_type: 'show_and_tell',
    community_name: 'electronics',
    author_id: 'user-2',
    tags: ['pcb-design', 'iot', 'weather-station', 'esp32'],
    upvotes: 45,
    downvotes: 1,
    score: 44,
    hot_score: 28.2,
    comment_count: 12
  },
  {
    title: 'Best practices for thermal management in 3D printed enclosures?',
    content: 'I\'m designing enclosures for electronic devices using 3D printing (PLA and PETG). The devices generate moderate heat (up to 60°C) and I\'m concerned about thermal management. What are the best practices for ventilation design, material selection, and heat dissipation in 3D printed enclosures?',
    post_type: 'question',
    community_name: 'manufacturing',
    author_id: 'user-3',
    tags: ['3d-printing', 'thermal', 'enclosures', 'design'],
    difficulty_level: 'intermediate',
    upvotes: 31,
    downvotes: 1,
    score: 30,
    hot_score: 18.7,
    comment_count: 18
  },
  {
    title: 'Quadruped robot gait optimization using genetic algorithms',
    content: 'Spent the last 6 months developing a genetic algorithm to optimize quadruped robot gaits. The system can now automatically adapt walking patterns for different terrains and speeds. The robot uses 12 servo motors and an IMU for feedback. Performance improved by 40% in energy efficiency compared to hand-tuned gaits.',
    post_type: 'show_and_tell',
    community_name: 'robotics',
    author_id: 'user-4',
    tags: ['quadruped', 'gait', 'genetic-algorithm', 'optimization'],
    difficulty_level: 'advanced',
    upvotes: 67,
    downvotes: 3,
    score: 64,
    hot_score: 42.1,
    comment_count: 23
  },
  {
    title: 'Free CAD software comparison: FreeCAD vs Fusion 360 vs OnShape',
    content: 'I\'ve been using different CAD packages for various projects and wanted to share my experience. Here\'s a detailed comparison of FreeCAD, Fusion 360 (free tier), and OnShape (free tier) from an engineering perspective. Each has its strengths and weaknesses depending on your use case.',
    post_type: 'discussion',
    community_name: 'engineering-software',
    author_id: 'user-5',
    tags: ['cad', 'software', 'comparison', 'freecad', 'fusion360'],
    upvotes: 89,
    downvotes: 7,
    score: 82,
    hot_score: 51.3,
    comment_count: 34
  },
  {
    title: 'Material selection for high-temperature applications (400°C+)',
    content: 'Working on a furnace design that requires components to operate continuously at 400°C. Standard steels won\'t work due to oxidation and strength loss. Looking for recommendations on materials that can handle these temperatures while maintaining structural integrity. Budget is a consideration.',
    post_type: 'question',
    community_name: 'materials-science',
    author_id: 'user-6',
    tags: ['high-temperature', 'materials', 'furnace', 'selection'],
    difficulty_level: 'advanced',
    upvotes: 28,
    downvotes: 0,
    score: 28,
    hot_score: 16.8,
    comment_count: 15
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Database connection failed:', testError.message);
      console.log('Make sure your database is set up and environment variables are correct.');
      return;
    }

    // Seed communities
    console.log('Seeding communities...');
    for (const community of communities) {
      const { data, error } = await supabase
        .from('communities')
        .upsert(community, { onConflict: 'name' });

      if (error) {
        console.error(`Error seeding community ${community.name}:`, error.message);
      } else {
        console.log(`✓ Seeded community: ${community.display_name}`);
      }
    }

    // Create sample users if they don't exist
    console.log('Creating sample users...');
    const sampleUsers = [
      { id: 'user-1', username: 'mech_engineer_2024', email: 'mech@example.com' },
      { id: 'user-2', username: 'circuit_wizard', email: 'circuit@example.com' },
      { id: 'user-3', username: 'maker_pro', email: 'maker@example.com' },
      { id: 'user-4', username: 'robot_researcher', email: 'robot@example.com' },
      { id: 'user-5', username: 'cad_expert', email: 'cad@example.com' },
      { id: 'user-6', username: 'materials_guru', email: 'materials@example.com' }
    ];

    for (const user of sampleUsers) {
      const { error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'id' });

      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating user ${user.username}:`, error.message);
      } else {
        console.log(`✓ Created user: ${user.username}`);
      }
    }

    // Seed posts
    console.log('Seeding posts...');
    for (const post of samplePosts) {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...post,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error(`Error seeding post "${post.title}":`, error.message);
      } else {
        console.log(`✓ Seeded post: ${post.title.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('You can now test the community features with sample data.');

  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 