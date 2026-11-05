import type {ECStatus} from "@/features/clubs/types.ts";

export interface GreenFeeRate {
    label: string;
    labelEn?: string;
    holes: number;
    price: number;
    weekendPrice?: number | null;
}

export interface ExtraFee {
    label: string;
    labelEn?: string;
    price: number | null;
    priceMax?: number | null;
}

export interface Course {
    id: string;
    name: string;
    holeCount: number;
    greenFee: number | null;
    greenFeeWeekend?: number | null;
    greenFees?: GreenFeeRate[];
    extraFees?: ExtraFee[];
    priceOnRequest?: boolean;
    description: string;
    status: ECStatus;
    createdAt: string;
    imagesUrls: Array<string>;
}

export interface CreateCourse {
    name: string;
    holeCount: number;
    greenFee: number;
    description: string;
    imagesUrls: Array<File>;
}
