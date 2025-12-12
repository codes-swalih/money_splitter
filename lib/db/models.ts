import mongoose, { Schema, Document } from 'mongoose';

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface TripDocument extends Document {
  _id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  currency: string;
  participants: Participant[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: String,
  email: String,
});

const TripSchema = new Schema<TripDocument>(
  {
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    currency: { type: String, default: 'INR' },
    participants: [ParticipantSchema],
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Trip = mongoose.models.Trip || mongoose.model<TripDocument>('Trip', TripSchema);

export interface SplitDetail {
  [participantId: string]: number;
}

export interface ExpenseDocument extends Document {
  _id: string;
  tripId: string;
  amount: number;
  currency: string;
  payerId: string;
  date: Date;
  category: string;
  description: string;
  receiptUrl?: string;
  tax?: number;
  taxPercent?: number;
  tip?: number;
  tipPercent?: number;
  splitType: 'EQUAL' | 'SELECTED_EQUAL' | 'CUSTOM_AMOUNTS' | 'PERCENTAGES';
  splitDetails: SplitDetail;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    tripId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    payerId: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: String,
    receiptUrl: String,
    tax: Number,
    taxPercent: Number,
    tip: Number,
    tipPercent: Number,
    splitType: {
      type: String,
      enum: ['EQUAL', 'SELECTED_EQUAL', 'CUSTOM_AMOUNTS', 'PERCENTAGES'],
      default: 'EQUAL',
    },
    splitDetails: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Expense =
  mongoose.models.Expense || mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);
