import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import { User } from './models/User.js';
import { Listing } from './models/Listing.js';
import { Wishlist } from './models/Wishlist.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';
import { Report } from './models/Report.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@iitb.ac.in',
    password: 'password123',
    college: 'IIT Bombay',
    department: 'Computer Science',
    year: '3rd Year',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'student',
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@du.ac.in',
    password: 'password123',
    college: 'Delhi University',
    department: 'Economics',
    year: '2nd Year',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'student',
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@bits.ac.in',
    password: 'password123',
    college: 'BITS Pilani',
    department: 'Mechanical Engineering',
    year: '4th Year',
    profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'student',
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha.gupta@vit.ac.in',
    password: 'password123',
    college: 'VIT Vellore',
    department: 'Electronics & Comm.',
    year: '2nd Year',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'student',
  },
  {
    name: 'Admin Moderator',
    email: 'admin@campusx.edu',
    password: 'password123',
    college: 'CampusX Central Hub',
    department: 'Administration',
    year: 'Staff',
    role: 'admin',
  },
];

const getSampleListings = (users) => [
  {
    sellerId: users[0]._id,
    title: 'Higher Engineering Mathematics — B.S. Grewal (44th Ed.)',
    description: 'Very well maintained B.S. Grewal mathematics textbook for Sem 1 & 2 engineering. Minimal pencil markings, all pages intact, binding is strong. Crucial for semester exams.',
    price: 350,
    listingType: 'sale',
    category: 'Books & Study Materials',
    condition: 'Good',
    college: 'IIT Bombay',
    pickupLocation: 'Hostel 12 Common Room or Central Library Steps',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[1]._id,
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'Original Casio ClassWiz fx-991EX scientific calculator. Dual power (solar + battery), high resolution LCD, approved for university exams. Used only for one semester during midterms.',
    price: 550,
    listingType: 'sale',
    category: 'Calculators & Lab Equipment',
    condition: 'Like New',
    college: 'Delhi University',
    pickupLocation: 'North Campus Arts Faculty Gate 4',
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[2]._id,
    title: 'Redragon K552 RGB Mechanical Gaming & Coding Keyboard',
    description: 'Compact 87-key tenkeyless mechanical keyboard with Outemu Blue switches. Tactile clicky feel, vibrant RGB backlighting modes. Excellent for coding, assignments, and casual gaming.',
    price: 1200,
    listingType: 'sale',
    category: 'Electronics',
    condition: 'Good',
    college: 'BITS Pilani',
    pickupLocation: 'Vyas Bhavan Room 204 or Student Activity Centre',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[3]._id,
    title: 'Wipro 3-Grade Dimmable LED Study Lamp with Mobile Stand',
    description: 'Rechargeable LED desk lamp with 3 color temperatures (warm, natural, cool white). Flexible gooseneck, built-in phone stand, up to 6 hours battery backup during hostel power cuts.',
    price: 250,
    listingType: 'sale',
    category: 'Hostel Essentials',
    condition: 'Like New',
    college: 'VIT Vellore',
    pickupLocation: 'M-Block Hostel Reception or Foodys Cafeteria',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[2]._id,
    title: 'Hero Sprint 26T Mountain Gear Cycle with Bell and Cable Lock',
    description: 'Sturdy 21-speed mountain bicycle with front suspension. Smooth Shimano gear shifting, newly oiled chain, dual disc brakes. Includes an anti-theft numbered cable lock and phone mount.',
    price: 2500,
    listingType: 'sale',
    category: 'Cycles & Transport',
    condition: 'Good',
    college: 'BITS Pilani',
    pickupLocation: 'Clock Tower Cycle Stand',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[0]._id,
    title: 'Ergonomic Aluminium Folding Laptop Stand (6-Level Adjustable)',
    description: 'Foldable portable aluminum laptop riser. Helps prevent neck strain during long study and coding sessions. Fits laptops from 10 to 15.6 inches. Comes with velvet carrying pouch.',
    price: 400,
    listingType: 'sale',
    category: 'Electronics',
    condition: 'Like New',
    college: 'IIT Bombay',
    pickupLocation: 'Gymkhana Ground Bench #3',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[3]._id,
    title: '4-Tier Multi-Purpose Hostel Storage Rack / Shoe Stand',
    description: 'Lightweight stainless steel and fabric 4-shelf organizer. Fits up to 8 pairs of shoes, books, or bathroom kit supplies. Easy to assemble and dismantle without tools.',
    price: 300,
    listingType: 'sale',
    category: 'Hostel Essentials',
    condition: 'Fair',
    college: 'VIT Vellore',
    pickupLocation: 'PRP Block Cycle Stand',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[1]._id,
    title: 'Introduction to Algorithms (CLRS) — 3rd Edition Textbook',
    description: 'The standard computer science algorithms Bible by Cormen, Leiserson, Rivest, Stein. Essential for Data Structures & Algorithms course and placement interview preparation.',
    price: 450,
    listingType: 'sale',
    category: 'Books & Study Materials',
    condition: 'Good',
    college: 'Delhi University',
    pickupLocation: 'Central Science Library Entrance',
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[0]._id,
    title: 'Looking to Exchange: Wireless Mouse for Scientific Drafter or Lab Coat',
    description: 'Logitech M221 silent optical mouse in excellent working condition. Looking to exchange for an engineering mini-drafter or large size white chemistry lab coat.',
    price: 0,
    listingType: 'exchange',
    preferredExchange: 'Mini-drafter for engineering drawing OR white lab coat size L',
    category: 'Calculators & Lab Equipment',
    condition: 'Like New',
    college: 'IIT Bombay',
    pickupLocation: 'Mechanical Engineering Department Foyer',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
  {
    sellerId: users[2]._id,
    title: 'Yonex Carbonex 8000 Plus Badminton Racket with 3 Shuttlecocks',
    description: 'Original Yonex graphite shaft racket. Fresh BG-65 stringing at 24 lbs tension. Grip is clean with Yonex overgrip. Giving 3 nylon shuttles free with the kit bag.',
    price: 650,
    listingType: 'sale',
    category: 'Sports & Fitness',
    condition: 'Good',
    college: 'BITS Pilani',
    pickupLocation: 'SAC Indoor Badminton Courts',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
  },
];

export async function seedData(autoClose = true) {
  try {
    console.log('🌱 Starting CampusX database seeding...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing collections
    console.log('🧹 Clearing old collections...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Wishlist.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});

    // Create users (pre-save hook hashes password)
    console.log('👤 Creating sample student & admin accounts...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const u = await User.create(userData);
      createdUsers.push(u);
    }
    console.log(`✅ Created ${createdUsers.length} student and admin accounts.`);

    // Create sample listings
    console.log('📦 Creating sample marketplace listings...');
    const rawListings = getSampleListings(createdUsers);
    const createdListings = await Listing.insertMany(rawListings);
    console.log(`✅ Created ${createdListings.length} realistic campus listings.`);

    // Create sample wishlist for student 1 (Aarav) and student 2 (Priya)
    console.log('❤️ Creating initial wishlist entries...');
    await Wishlist.create({
      userId: createdUsers[0]._id,
      listingId: createdListings[1]._id, // Aarav wishlisted Casio Calculator
    });
    await Wishlist.create({
      userId: createdUsers[0]._id,
      listingId: createdListings[4]._id, // Aarav wishlisted Hero Cycle
    });
    await Wishlist.create({
      userId: createdUsers[1]._id,
      listingId: createdListings[2]._id, // Priya wishlisted Mechanical Keyboard
    });

    // Create a sample conversation between Aarav Sharma (buyer) and Priya Patel (seller of Casio calc)
    console.log('💬 Creating a sample buyer-seller conversation...');
    const conversation = await Conversation.create({
      listingId: createdListings[1]._id,
      participants: [createdUsers[0]._id, createdUsers[1]._id],
      lastMessage: {
        text: 'Sounds great! Can we meet tomorrow at 4 PM near North Campus Arts Faculty?',
        senderId: createdUsers[0]._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversationId: conversation._id,
        senderId: createdUsers[0]._id,
        text: 'Hey Priya, is the Casio fx-991EX calculator still available?',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        conversationId: conversation._id,
        senderId: createdUsers[1]._id,
        text: 'Hi Aarav! Yes it is. The solar panel and battery are in perfect shape.',
        createdAt: new Date(Date.now() - 2400000),
      },
      {
        conversationId: conversation._id,
        senderId: createdUsers[0]._id,
        text: 'Sounds great! Can we meet tomorrow at 4 PM near North Campus Arts Faculty?',
        createdAt: new Date(Date.now() - 1200000),
      },
    ]);

    console.log('=============================================');
    console.log('🎉 CampusX Seeding Completed Successfully!');
    console.log('=============================================');
    console.log('Demo Accounts:');
    sampleUsers.forEach((u) => {
      console.log(`  • ${u.name.padEnd(16)} | Email: ${u.email.padEnd(25)} | Pass: password123 | Role: ${u.role}`);
    });
    console.log('=============================================');

    if (autoClose) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (autoClose) process.exit(1);
  }
}

// Only run automatically if executed directly as CLI script
if (process.argv[1]?.endsWith('seed.js')) {
  seedData(true);
}

