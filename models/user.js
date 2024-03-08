const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous", required:false },
  userName: { type: String,  unique: true, required: true },
  commission: { type: Number, default: 0, required: false },
  openingBalance: { type: Number, default: 0, required: false },
  creditReference: { type: Number, default: 0, required: false },
  partnership: { type: Number, default: 0, required: false },
  currency: { type: String, default: "INR", required: false },
  mobile: { type: Number, mobile: null,required: false },
  exposureLimit: { type: Number, default: 0, required: false },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Domain",
    required: true,
  },
  status: {
    type: String,
    required: false,
    default: "active",
    enum: ["active", "suspend", "locked"],
  },
  deleted: { type: Boolean, default: false } ,
  online: { type: Boolean, default: false } ,
  deletedAt: { type: Date, required:false },
  Watcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  Declare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  Creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  WhiteLabel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  Super: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  Master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  Agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

// Middleware to exclude 'deleted' field from query results
userSchema.pre(/^find/, function(next) {
  // 'this' refers to the query object
  // Only include non-deleted users
  this.where({ deleted: false });

  // Only exclude 'deleted' field if it's not explicitly included in the query
  if (!this._fields || !('deleted' in this._fields)) {
    this.select('-deleted');
    this.select('-deletedAt');
  }

  next();
});

// Filter
// Middleware to exclude 'deleted' field from query results
userSchema.pre(/^find/, function(next) {
  // 'this' refers to the query object
  // Only exclude 'deleted' field if it's not explicitly included in the query
  if (!this._fields || !('deleted' in this._fields)) {
    this.select('-deleted');
  }
  next();
});

// Middleware to handle retrieval of deleted users
userSchema.pre(/^find/, function(next) {
  // 'this' refers to the query object
  // Check if 'deleted' field is explicitly specified in the query conditions
  if ('deleted' in this.getQuery()) {
    next();
  } else {
    // Include deleted users only if explicitly requested
    this.where({ $or: [{ deleted: false }, { deleted: true }] });
    next();
  }
});

// Filter

const User = mongoose.model("User", userSchema);

(async () => {
  try {
    await User.createIndexes();
    console.log(
      "Users created successfully \n ======================================>"
    );
    // await User.updateMany({online:false})
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = User;
