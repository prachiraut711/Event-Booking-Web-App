const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Bookings');

dotenv.config();

const users = [
    { name: 'Admin User', email: 'admin@eventsphere.com', password: 'password123', role: 'admin' },
    { name: 'Demo Attendee', email: 'user@eventsphere.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@eventsphere.com', password: 'password123', role: 'user' },
    { name: 'Bob Johnson', email: 'bob@eventsphere.com', password: 'password123', role: 'user' },
    { name: 'Charlie Dave', email: 'charlie@eventsphere.com', password: 'password123', role: 'user' },
    { name: 'Diana Prince', email: 'diana@eventsphere.com', password: 'password123', role: 'user' },
    { name: 'Ethan Hunt', email: 'ethan@eventsphere.com', password: 'password123', role: 'user' },
    { name: 'Fiona Gallagher', email: 'fiona@eventsphere.com', password: 'password123', role: 'user' }
];

const events = [
    {
        title: 'React & Cloud Architecture Summit 2026',
        description: 'Join elite full-stack engineers for a 3-day deep dive into modern microfrontends, serverless backends, and AI agent integration. Keynotes from industry leaders.',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        time: '09:30 AM - 05:00 PM',
        location: 'Innovation Center, San Francisco, CA',
        category: 'Technology',
        totalSeats: 150,
        ticketPrice: 0, // Free event
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Horizon Electronic Music Festival',
        description: 'Immerse yourself in world-class audio visuals, techno masters, and futuristic laser shows across 3 outdoor amphitheaters under the night sky.',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        time: '06:00 PM - 02:00 AM',
        location: 'Skyline Arena, Austin, TX',
        category: 'Music',
        totalSeats: 200,
        ticketPrice: 1499,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Ventures & Angel Investor Summit',
        description: 'An exclusive networking forum bringing together vetted tech founders, venture capitalists, and global angel syndicates discussing Series A readiness.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '10:00 AM - 04:30 PM',
        location: 'Financial District Plaza, New York, NY',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 3499,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Contemporary Digital Arts & NFT Gallery',
        description: 'Explore boundary-pushing digital generative art, interactive projections, and creative installations curated by award-winning visualists.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '11:00 AM - 07:00 PM',
        location: 'Modern Metropolitan Museum, Chicago, IL',
        category: 'Art',
        totalSeats: 200,
        ticketPrice: 350,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Product Design & UX Leadership Workshop',
        description: 'Hands-on design systems sprint covering micro-interactions, accessibility patterns, and multi-platform design tokens with senior design directors.',
        date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        time: '01:00 PM - 06:00 PM',
        location: 'Design Studio Lab, Seattle, WA',
        category: 'Workshops',
        totalSeats: 150,
        ticketPrice: 850,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Autonomous Systems & AI Robotics Expo',
        description: 'Witness real-time robotics demonstrations, warehouse automation, drone swarms, and computer vision breakthroughs in live arena challenges.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        time: '09:00 AM - 06:00 PM',
        location: 'Tech Coliseum, Boston, MA',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 1200,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/eventsphere';
        await mongoose.connect(mongoUrl);
        console.log(`\n✅ Connected to MongoDB: ${mongoUrl}`);

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing collections.');

        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} seed users (Admin & Attendees).`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} premier events.`);

        // Generate realistic dummy bookings
        const bookingsData = [];
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        let pendingGuaranteed = false;
        for (let eIdx = 0; eIdx < createdEvents.length; eIdx++) {
            const event = createdEvents[eIdx];
            // Assign 2-4 users to each event
            const randomCount = Math.floor(Math.random() * 3) + 2;
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (let uIdx = 0; uIdx < selectedUsers.length; uIdx++) {
                const user = selectedUsers[uIdx];
                const statuses = ['confirmed', 'confirmed', 'pending', 'cancelled'];
                let status = statuses[Math.floor(Math.random() * statuses.length)];

                // Guarantee at least one pending demo booking remains for admin approval demonstrations
                if (!pendingGuaranteed && eIdx === 1 && uIdx === 0) {
                    status = 'pending';
                    pendingGuaranteed = true;
                }
                const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 tickets
                const isFree = event.ticketPrice === 0;

                let paymentStatus = 'not_paid';
                let paymentMethod = isFree ? 'free_rsvp' : 'test_checkout';

                if (status === 'confirmed') {
                    paymentStatus = isFree ? 'paid' : (Math.random() > 0.1 ? 'paid' : 'not_paid');
                }

                let refCode = 'ES-2026-';
                for (let i = 0; i < 5; i++) {
                    refCode += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    bookingReference: refCode,
                    quantity,
                    status,
                    paymentStatus,
                    paymentMethod,
                    amount: event.ticketPrice * quantity,
                    bookedAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000))
                });

                // Deduct seats if confirmed
                if (status === 'confirmed') {
                    event.availableSeats = Math.max(0, event.availableSeats - quantity);
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} seed bookings with references and seats deducted.`);

        console.log('\n===========================================');
        console.log('🚀 EventSphere Database Seeded Successfully!');
        console.log('-------------------------------------------');
        console.log('🔑 Admin Credentials:');
        console.log('   Email:    admin@eventsphere.com');
        console.log('   Password: password123');
        console.log('\n🔑 Attendee Credentials:');
        console.log('   Email:    user@eventsphere.com');
        console.log('   Password: password123');
        console.log('===========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();