import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { DEFAULT_LOCALE, DEFAULT_ROLE, LOCALES, USER_ROLES, USER_STATUSES } from '@/shared/const/roles.const';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    displayName: { type: String, required: false, default: '', maxlength: 40 },
    email: { type: String, required: true, unique: true },
    // Removed together with the Credentials provider in T-010
    passwordHash: { type: String, required: false, default: '' },
    avatar: { type: String, required: false },
    role: { type: String, enum: USER_ROLES, default: DEFAULT_ROLE, required: true },
    status: { type: String, enum: USER_STATUSES, default: 'active', required: true },
    banReason: { type: String, required: false },
    locale: { type: String, enum: LOCALES, default: DEFAULT_LOCALE, required: true },
    emailNotifications: { type: Boolean, default: true, required: true },
    termsAcceptedVersion: { type: String, required: false },
    termsAcceptedAt: { type: Date, required: false },
    reportsCount: { type: Number, default: 0, required: true },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel =
  mongoose.models.User || mongoose.model('User', UserSchema);
