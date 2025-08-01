const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 500
  },
  avatar: {
    type: String,
    default: ''
  },
  jobTitle: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  socialLinks: {
    twitter: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    }
  },
  expertise: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  postCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
authorSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

module.exports = mongoose.model('Author', authorSchema);
