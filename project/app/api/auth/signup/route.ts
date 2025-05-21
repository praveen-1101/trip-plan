import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    console.log('Starting signup process...');
    
    // Log the request body
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    const { name, email, password } = body;

    // Validate input
    if (!email || !password || !name) {
      console.log('Validation failed:', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasName: !!name 
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database...');
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists:', email);
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
    } catch (findError) {
      console.error('Error checking existing user:', findError);
      throw new Error(`Error checking existing user: ${findError.message}`);
    }

    // Hash password
    console.log('Hashing password...');
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      throw new Error(`Error hashing password: ${hashError.message}`);
    }

    // Create new user
    console.log('Creating new user...');
    try {
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      console.log('User created successfully:', { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      });

      return NextResponse.json(
        { 
          message: 'User created successfully',
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        },
        { status: 201 }
      );
    } catch (createError) {
      console.error('Error creating user:', createError);
      if (createError.code === 11000) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
      throw new Error(`Error creating user: ${createError.message}`);
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
