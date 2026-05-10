import type {
    TransferFunctionPair,
    TransferFunctionId,
} from "@omi-io/color-core/types";
import {
    ADOBE_RGB_TRANSFER_FUNCTION,
    GAMMA_22_TRANSFER_FUNCTION,
    GAMMA_26_TRANSFER_FUNCTION,
} from "./gamma";
import { LINEAR_TRANSFER_FUNCTION } from "./linear";
import { REC709_TRANSFER_FUNCTION } from "./rec709";
import { REC2020_TRANSFER_FUNCTION } from "./rec2020";
import { SRGB_TRANSFER_FUNCTION } from "./srgb";

export {
    LINEAR_TRANSFER_FUNCTION,
    GAMMA_22_TRANSFER_FUNCTION,
    GAMMA_26_TRANSFER_FUNCTION,
    ADOBE_RGB_TRANSFER_FUNCTION,
    REC709_TRANSFER_FUNCTION,
    REC2020_TRANSFER_FUNCTION,
    SRGB_TRANSFER_FUNCTION,
};
export {
    ADOBE_RGB_GAMMA,
    DCI_P3_GAMMA,
    createGammaTransferFunctionPair,
} from "./gamma";

type ShippedTransferFunctionId =
    | "linear"
    | "gamma-2.2"
    | "gamma-2.6"
    | "Adobe RGB"
    | "sRGB"
    | "Rec.709"
    | "Rec.2020";

export const TRANSFER_FUNCTIONS: Pick<
    Record<TransferFunctionId, TransferFunctionPair>,
    ShippedTransferFunctionId
> = {
    linear: LINEAR_TRANSFER_FUNCTION,
    "gamma-2.2": GAMMA_22_TRANSFER_FUNCTION,
    "gamma-2.6": GAMMA_26_TRANSFER_FUNCTION,
    "Adobe RGB": ADOBE_RGB_TRANSFER_FUNCTION,
    sRGB: SRGB_TRANSFER_FUNCTION,
    "Rec.709": REC709_TRANSFER_FUNCTION,
    "Rec.2020": REC2020_TRANSFER_FUNCTION,
};
