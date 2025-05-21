import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;