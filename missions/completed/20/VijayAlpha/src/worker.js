import { compute_witnesses } from '@noir-lang/aztec_backend';
import initAztec from "@noir-lang/aztec_backend";

// Add an event listener for the message event
onmessage = async (event) => {

    const { url, acir, input } = event.data;

    let values = [];
    for (const [ , v] of Object.entries(input)) {
        let entry_values = AnyToHexStrs(v);
        values = values.concat(entry_values);
    }

    await initAztec(new URL('./aztec_backend_bg.wasm', url));

    const witness = compute_witnesses(acir, values);

    postMessage(witness);
};

function AnyToHexStrs(any_object) {
    let values = []
    if (Array.isArray(any_object)) {
        for (let variable of any_object) {
            values = values.concat(AnyToHexStrs(variable));
        }
    } else if (typeof any_object === 'string' || any_object instanceof String) {
        // If the type is a string, we expect it to be a hex string
        let string_object = any_object;

        if (isValidHex(string_object)) {
            values.push(string_object)
        } else {
            // TODO: throw should not be in a library, but currently we aren't doing 
            // TODO: much in terms of error handling
            throw new Error("strings can only be hexadecimal and must start with 0x");
        }

    } else if (Number.isInteger(any_object)) {
        let number_object = any_object;
        let number_hex = number_object.toString(16);
        // The rust code only accepts even hex digits
        let is_even_hex_length = number_hex.length % 2 === 0;
        if (is_even_hex_length) {
            values.push("0x" + number_hex)
        } else {
            values.push("0x0" + number_hex)
        }
    } else {
        throw new Error("unknown object type in the abi");
    }
    return values
}

function isValidHex(hex_str) {
    return !isNaN(Number(hex_str))
}
