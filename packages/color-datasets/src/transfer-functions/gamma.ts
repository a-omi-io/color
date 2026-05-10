import type {
    TransferFunctionPair,
    TransferFunctionId,
} from "@omi-io/color-core/types";

const GAMMA_SOURCE =
    "SMPTE RP 431-2 (DCI-P3 gamma) and Adobe RGB (1998) specification";

/** Adobe RGB (1998) uses the irrational gamma 563/256, commonly rounded to 2.2. */
export const ADOBE_RGB_GAMMA = 563 / 256;

/** DCI-P3 (SMPTE RP 431-2) display reference uses pure power gamma 2.6. */
export const DCI_P3_GAMMA = 2.6;

function buildPair(
    gamma: number,
    id: TransferFunctionId,
    name: string,
    source: string
): TransferFunctionPair {
    return {
        id,
        name,
        encode: value =>
            value < 0
                ? -Math.pow(-value, 1 / gamma)
                : Math.pow(value, 1 / gamma),
        decode: value =>
            value < 0 ? -Math.pow(-value, gamma) : Math.pow(value, gamma),
        domain: [0, 1],
        range: [0, 1],
        source,
    };
}

export function createGammaTransferFunctionPair(
    gamma: number,
    id: TransferFunctionId,
    name = `Gamma ${gamma}`
): TransferFunctionPair {
    return buildPair(gamma, id, name, GAMMA_SOURCE);
}

export const GAMMA_22_TRANSFER_FUNCTION = createGammaTransferFunctionPair(
    2.2,
    "gamma-2.2"
);

export const GAMMA_26_TRANSFER_FUNCTION = createGammaTransferFunctionPair(
    DCI_P3_GAMMA,
    "gamma-2.6",
    "Gamma 2.6"
);

export const ADOBE_RGB_TRANSFER_FUNCTION = buildPair(
    ADOBE_RGB_GAMMA,
    "Adobe RGB",
    "Adobe RGB (1998) gamma 563/256",
    GAMMA_SOURCE
);
