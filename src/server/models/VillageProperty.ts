
import mongoose, { Schema } from "mongoose";
import { Status } from "./types";

export type PropertyConstruction = {
    usageType: string; // From GlobalUsageFactor
    constructionType: string; // From GlobalConstructionLandRate
    constructionYear: number;
    floor: string;
    length: number;
    width: number;
    areaSqFt: number; // Calculated
};

export type VillagePropertyDocument = {
    _id: mongoose.Types.ObjectId;
    villageId: mongoose.Types.ObjectId;
    propertyNo: string;
    wardNo: string;
    ownerName: string;
    aadharNumber?: string;
    spouseName?: string;
    occupierName?: string;
    address?: string;
    mobile?: string;
    mobile2?: string;
    directions?: {
        east?: string;
        west?: string;
        north?: string;
        south?: string;
    };
    waterTaxType?: string; // From GlobalWaterSupplyTaxRate
    isTaxExempt: boolean;
    constructions: PropertyConstruction[];
    status: Status;
    createdAt: Date;
    updatedAt: Date;
};

const constructionSchema = new Schema<PropertyConstruction>({
    usageType: { type: String, required: true },
    constructionType: { type: String, required: true },
    constructionYear: { type: Number, required: true },
    floor: { type: String, required: true },
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    areaSqFt: { type: Number, required: true, min: 0 },
});

const villagePropertySchema = new Schema<VillagePropertyDocument>(
    {
        villageId: { type: Schema.Types.ObjectId, ref: "Village", required: true },
        propertyNo: { type: String, required: true, trim: true },
        wardNo: { type: String, required: true, trim: true },
        ownerName: { type: String, required: true, trim: true },
        aadharNumber: { type: String, trim: true, minlength: 12, maxlength: 12 },
        spouseName: { type: String, trim: true },
        occupierName: { type: String, trim: true },
        address: { type: String, trim: true },
        mobile: { type: String, trim: true },
        mobile2: { type: String, trim: true },
        directions: {
            east: { type: String, trim: true },
            west: { type: String, trim: true },
            north: { type: String, trim: true },
            south: { type: String, trim: true },
        },
        waterTaxType: { type: String, trim: true },
        isTaxExempt: { type: Boolean, default: false },
        constructions: [constructionSchema],
        status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
    },
    {
        collection: "village_properties",
        timestamps: true,
    }
);

villagePropertySchema.index({ villageId: 1, propertyNo: 1 }, { unique: true });
villagePropertySchema.index({ villageId: 1, ownerName: 1 });

export const VillagePropertyModel =
    (mongoose.models.VillageProperty as mongoose.Model<VillagePropertyDocument>) ||
    mongoose.model<VillagePropertyDocument>("VillageProperty", villagePropertySchema);
