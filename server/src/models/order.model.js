import mongoose from "mongoose";

// ─── Order Item Schema ────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant:  String,
}, { _id: false });

// ─── Shipping Schema ──────────────────────────────────────────────────
const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  zip:      { type: String, required: true },
  country:  { type: String, required: true, default: 'India' },
  phone:    String,
}, { _id: false });

// ─── Status History Schema ────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  status:    String,
  note:      String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

// ─── Main Order Schema ────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },

    items: [{ type: orderItemSchema }],
    shipping: shippingSchema, 

    paymentMethod : {
        type: String, 
        enum: ['razorpay', 'cod', 'upi'], 
        lowercase: true,
        required: true
    },
    paymentResult: { id: String, status: String, updateAt: String, email: String },

    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },
    discount:      { type: Number, default: 0 },
    couponCode:    String,

    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },

    isPaid:         { type: Boolean, default: false },
    paidAt:         Date,
    isDelivered:    { type: Boolean, default: false },
    deliveredAt:    Date,
    trackingNumber: String,
    notes:          String,

    statusHistory: [statusHistorySchema],
}, { timestamps: true, toJSON: { virtuals: true } });

// ─── Auto Order Number Logic (Async Fixed) ───────────────────────────

orderSchema.pre('save', async function () {
    // Agar orderNumber pehle se hai ya document naya nahi hai, toh return kar jao
    if (this.orderNumber || !this.isNew) {
        return;
    }

    try {
        // Model access karne ke liye mongoose.model() use karein
        const count = await mongoose.model("Order").countDocuments();
        this.orderNumber = `LUXE-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
        throw error; // Async hook mein throw karne se Mongoose error catch kar lega
    }
});

// ─── Virtuals ────────────────────────────────────────────────────────

orderSchema.virtual('itemCount').get(function() {
    return this.items.reduce((acc, i) => acc + i.quantity, 0);
});

export const Order = mongoose.model("Order", orderSchema);