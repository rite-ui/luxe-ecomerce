import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant:  String,
}, { _id: false });

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  zip:      { type: String, required: true },
  country:  { type: String, required: true, default: 'India' },
  phone:    String,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status:    String,
  note:      String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },

    items: [{ type: orderItemSchema }],
    shippping: shippingSchema,

    paymentMethod : {type: String, enum: ['stripe', 'razorpay', 'cod'], required: true},
    paymentResult: { id: String, status: String, updateAt: String, email: String },

    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },
    discount:      { type: Number, default: 0 },
    couponCode:    String,

    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refudned'],
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

// ─── Auto order number ────────────────────────────────────────────────

orderSchema.pre('save', async function (next){
    if (!this.isModified('orderNumber')) {
        const count = await this.constructor.countDocuments();
        this.orderNumber = `LUXE-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

orderSchema.virtual('itemCount').get(function() {
    return this.items.reduce((acc, i) => acc + i.quantity, 0);
});

export const Order = mongoose.model("Order", orderSchema);
