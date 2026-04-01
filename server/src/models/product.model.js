import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {type:mongoose.Schema.Types.ObjectId,  ref: 'User', required: true},
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

const imageSchema = new mongoose.Schema({
    publicId : String,
    url : {type: String, required: true},
    alt : String,
} , { _id: false });

const variantSchema = new mongoose.Schema({
    name:    String,
    options: [String],
} , { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: 3,
        maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: { type: String, required: true, lowercase: true },
    description: {
        type: String,
        required: [true, "Product description is required"],
        maxlength: [2000, "Product description cannot exceed 2000 characters"],
    },
    shortDescription: { type: String, maxlength: 300 },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: 0
    },
    comparePrice: { type: Number, default: 0 },
    category: {
        type: String,
        required: [true, "Product category is required"],
        enum: ['beauty', 'jwellery', 'fashion', 'home', 'fragrance', 'accessories'],
    },
    subCategory: { type: String },
    brand: { type: String },
    tags: [{ type: String }],

    images: [imageSchema],
    variants: [variantSchema],

    stock: {
        type: Number,
        default: 0,
        min: 0,
        required: [true, "Stock quantity is required"],
    },
    sold: {type: Number, default: 0},
    sku : { type: String, unique: true, sparse: true },

    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isNew : { type: Boolean, default: false },
    isBestseller : { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },


    metaTitle: String,
    metaDesc: String,

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


// ─── Virtuals ─────────────────────────────────────────────────────────
productSchema.virtual('discount').get(function() {
    if (this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
});

// ─── Auto-slug ────────────────────────────────────────────────────────
productSchema.pre('save', function(next){
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
    next();
});

// ─── Update Rating ────────────────────────────────────────────────────
productSchema.methods.updateRating = function() {
    if (!this.reviews.length) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        this.numReviews = this.reviews.length;
        this.rating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.numReviews;
    }
};

// ─── Indexes ────────────────────────────────────────────────────────── 
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({  category: 1, price: 1 , rating: -1 });
productSchema.index({isFeatured: 1, isActive})
productSchema.index({ slug: 1 }, { unique: true });

export const Product = mongoose.model("Product", productSchema);
