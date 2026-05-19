import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.firebaseUID;
      },
    },

    firebaseUID: { type: String },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    otp: { type: Number, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export const user = mongoose.model('user', userSchema);
