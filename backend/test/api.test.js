import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import { closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';

describe('CampusX Full-Stack Backend API Tests', () => {
  let student1Token = '';
  let student1Id = '';
  let student2Token = '';
  let student2Id = '';
  let createdListingId = '';
  let createdConversationId = '';

  before(async () => {
    // Wait for mongoose connection
    let retries = 0;
    while (mongoose.connection.readyState !== 1 && retries < 20) {
      await new Promise((r) => setTimeout(r, 200));
      retries++;
    }

    // Ensure sample accounts exist for testing
    let aarav = await User.findOne({ email: 'aarav.sharma@iitb.ac.in' });
    if (!aarav) {
      aarav = await User.create({
        name: 'Aarav Sharma',
        email: 'aarav.sharma@iitb.ac.in',
        password: 'password123',
        college: 'IIT Bombay',
        department: 'Computer Science',
        year: '3rd Year',
        role: 'student',
      });
    }

    let priya = await User.findOne({ email: 'priya.patel@du.ac.in' });
    if (!priya) {
      priya = await User.create({
        name: 'Priya Patel',
        email: 'priya.patel@du.ac.in',
        password: 'password123',
        college: 'Delhi University',
        department: 'Economics',
        year: '2nd Year',
        role: 'student',
      });
    }

    const listingCount = await Listing.countDocuments();
    if (listingCount === 0) {
      await Listing.create({
        sellerId: aarav._id,
        title: 'Higher Engineering Mathematics — B.S. Grewal',
        description: 'Semester 1 and 2 engineering mathematics textbook.',
        price: 350,
        listingType: 'sale',
        category: 'Books & Study Materials',
        condition: 'Good',
        college: 'IIT Bombay',
        pickupLocation: 'Hostel 12 Common Room',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'],
        status: 'available',
      });
    }
  });

  after(async () => {
    await closeDB();
    process.exit(0);
  });


  describe('1. Authentication & Registration Requirements', () => {
    test('POST /api/auth/register: Registers user successfully BUT DOES NOT automatically log them in', async () => {
      const uniqueEmail = `teststudent_${Date.now()}@college.edu`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Kabir Mehta',
          email: uniqueEmail,
          password: 'securePassword123',
          college: 'IIT Delhi',
          department: 'Computer Science',
          year: '2nd Year',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.requiresLogin, true);
      assert.match(res.body.message, /log in/i);

      // Verify that NO token or auth cookie was returned
      assert.equal(res.body.token, undefined);
      const setCookie = res.headers['set-cookie'];
      const hasAuthCookie = Boolean(setCookie && setCookie.some((c) => c.includes('campusx_token=ey')));
      assert.equal(hasAuthCookie, false, 'Auth cookie must NOT be set on registration');

    });

    test('POST /api/auth/login: Student must explicitly log in to receive session cookie/token', async () => {
      // Login with Aarav Sharma from seeded data
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.sharma@iitb.ac.in',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.name, 'Aarav Sharma');

      student1Token = res.body.token;
      student1Id = res.body.user.id;

      // Verify auth cookie is present
      const setCookie = res.headers['set-cookie'];
      assert.ok(setCookie, 'HttpOnly auth cookie should be set upon login');
    });

    test('POST /api/auth/login: Invalid credentials return 401 error', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.sharma@iitb.ac.in',
          password: 'wrongpassword',
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    test('GET /api/auth/me: Returns current authenticated student profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.email, 'aarav.sharma@iitb.ac.in');
    });

    test('Login student 2 (Priya Patel) for multi-user tests', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'priya.patel@du.ac.in',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      student2Token = res.body.token;
      student2Id = res.body.user.id;
    });
  });

  describe('2. Listings & Marketplace CRUD and Filters', () => {
    test('GET /api/listings: Returns active marketplace listings with pagination', async () => {
      const res = await request(app)
        .get('/api/listings?limit=5');

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.listings));
      assert.ok(res.body.total >= 1);
    });

    test('GET /api/listings: Filter by category and search keyword', async () => {
      const res = await request(app)
        .get('/api/listings?category=Books %26 Study Materials&search=Mathematics');

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.listings.length >= 1);
      assert.match(res.body.listings[0].title, /Mathematics/i);
    });

    test('POST /api/listings: Authenticated student can create a listing', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'Arduino Uno R3 Starter Kit with Sensors',
          description: 'Complete Arduino Uno starter kit including breadboard, jumper wires, ultrasonic sensor, LED module, and RFID card reader. Perfect for semester IoT project.',
          price: 850,
          listingType: 'sale',
          category: 'Electronics',
          condition: 'Like New',
          college: 'IIT Bombay',
          pickupLocation: 'Electrical Dept Workshop Lab',
          directImageUrls: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800'],
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.listing._id);
      createdListingId = res.body.listing._id;
    });

    test('POST /api/listings: Fails without required fields', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'Incomplete Listing',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('PATCH /api/listings/:id/status: Seller can toggle status to sold', async () => {
      const res = await request(app)
        .patch(`/api/listings/${createdListingId}/status`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ status: 'sold' });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'sold');

      // Toggle back to available
      const res2 = await request(app)
        .patch(`/api/listings/${createdListingId}/status`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ status: 'available' });

      assert.equal(res2.status, 200);
      assert.equal(res2.body.status, 'available');
    });

    test('PATCH /api/listings/:id: Non-owner cannot edit another student\'s listing', async () => {
      const res = await request(app)
        .patch(`/api/listings/${createdListingId}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({ title: 'Hacked Title' });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });
  });

  describe('3. Wishlist Functionality', () => {
    test('POST /api/wishlist/:id: Adds item to student wishlist', async () => {
      const res = await request(app)
        .post(`/api/wishlist/${createdListingId}`)
        .set('Authorization', `Bearer ${student2Token}`);

      assert.equal(res.status, 201);
      assert.equal(res.body.isWishlisted, true);
    });

    test('GET /api/wishlist: Returns student\'s wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${student2Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const found = res.body.wishlist.some((w) => w.listing._id.toString() === createdListingId.toString());
      assert.ok(found, 'Listing should be in student wishlist');
    });

    test('DELETE /api/wishlist/:id: Removes item from wishlist', async () => {
      const res = await request(app)
        .delete(`/api/wishlist/${createdListingId}`)
        .set('Authorization', `Bearer ${student2Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.isWishlisted, false);
    });
  });

  describe('4. Buyer-Seller Messaging', () => {
    test('POST /api/conversations: Student cannot message themselves on their own listing', async () => {
      const res = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          listingId: createdListingId,
          message: 'Trying to message myself',
        });

      assert.equal(res.status, 400);
      assert.match(res.body.message, /yourself/i);
    });

    test('POST /api/conversations: Student 2 contacts seller (Student 1) regarding listing', async () => {
      const res = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          listingId: createdListingId,
          message: 'Hi Aarav, can we test the sensors before taking the Arduino kit?',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.conversation._id);
      createdConversationId = res.body.conversation._id;
    });

    test('POST /api/conversations/:id/messages: Seller replies to buyer', async () => {
      const res = await request(app)
        .post(`/api/conversations/${createdConversationId}/messages`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          text: 'Sure Priya! We can plug it into my laptop at the workshop lab.',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message.text, 'Sure Priya! We can plug it into my laptop at the workshop lab.');
    });

    test('GET /api/conversations/:id/messages: Retrieves messages for participant', async () => {
      const res = await request(app)
        .get(`/api/conversations/${createdConversationId}/messages`)
        .set('Authorization', `Bearer ${student2Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.messages.length >= 2, true);
    });
  });

  describe('5. Reporting & Moderation', () => {
    test('POST /api/reports: Student reports a listing with valid reason', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          listingId: createdListingId,
          reason: 'Inappropriate Item',
          description: 'Testing reporting system verification',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
    });

    test('POST /api/reports: Duplicate report by same user returns 400', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          listingId: createdListingId,
          reason: 'Inappropriate Item',
          description: 'Duplicate report attempt',
        });

      assert.equal(res.status, 400);
      assert.match(res.body.message, /already submitted/i);
    });
  });
});
