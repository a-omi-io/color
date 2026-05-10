import type { TransferFunctionPair } from "@omi-io/color-core/types";

const identity = (value: number): number => value;

export const LINEAR_TRANSFER_FUNCTION: TransferFunctionPair = {
    id: "linear",
    name: "Linear",
    encode: identity,
    decode: identity,
    domain: [0, 1],
    range: [0, 1],
    source: "Identity transfer function (linear-light definition)",
};
