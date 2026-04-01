import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from  "jsonwebtoken";
import crypto from "crypto";

const addressSchema = new mongoose.Schema({
  label:     { type: String, default: 'Home' },
  street:    String,
  city:      String,
  state:     String,
  zip:       String,
  country:   { type: String, default: 'US' },
  isDefault: { type: Boolean, default: false },
}, { _id: false });



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 3,
        maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique:   true,
        trim:     true,
        lowercase:true,
        match:    [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false, // Exclude password from query results by default
    },
    role: {
        type: String,
        enum: ["user",  "admin"],
        default: "user",
    },
    avatar: {
        publicId: String,
        url: {type: String, default:""},
    },
    phone:     { type: String, default: '' },
    address:   [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

// ─── Hash password before save ────────────────────────────────────────
userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,12);
    next();
});

// ─── Instance Methods ─────────────────────────────────────────────────
userSchema.methods.getSignedToken = function(){
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// ─── Compare password before save ────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Generate and hash password reset token ────────────────────────────────────────
userSchema.methods.getResetToken = function(){
    const token = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return token;
}
const User = mongoose.model('User', userSchema);

export default User;
