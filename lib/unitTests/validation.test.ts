import {describe, expect, it} from "vitest";
import{isISODate, normalizePhone, isValidEmail, validateStrict, } from "../validation";

//unit tests

//json body test
describe("validateStrict", () =>{
    it("rejects invalid json bodies", () =>{
        const schema = {name: {type: "string", required: true},} as const;
        expect(validateStrict(null, schema)).toEqual({
            ok: false, error: "Invalid JSON body.",
        });

        expect(validateStrict("not an object", schema)).toEqual({
            ok: false, error: "Invalid JSON body.",
        });

        expect(validateStrict([], schema)).toEqual({
            ok: false, error: "Invalid JSON body.",
        });
    });

    it("rejects unexpected fields", () =>{
        const schema = {name:{type: "string", required: true},} as const;
        const result = validateStrict({name: "Jose", admin: true,}, schema);
        
        expect(result).toEqual({
            ok: false, error: "Unexpected field: admin",
        });
    });

    it("rejects missing required fields", () =>{
        const schema = {
            name: {type: "string", required: true},
            notes: {type: "string", required: false},
        } as const;

        const result = validateStrict({
            notes: "cleaning needed, example note",
        }, schema
        );
        
        expect(result).toEqual({
        ok: false, error: "Validation failed", 
        details:{
            name: "Required",
        },
    });
    });

    it("validates and sanitizes valid string fields", () =>{
        const schema={
            name: {type: "string", required: true, min: 2, max:20},
        }as const;

        const result = validateStrict({
            name:"   Jose   ",
        },schema);

        expect(result).toEqual({
            ok: true, data: {name: "Jose"},
        });
    });

    it("rejects strings that do not match a pattern", () =>{
        const schema = {
            email: {type: "string", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,},
        } as const;

        const result = validateStrict({email: "not-an-email",}, schema);

        expect(result).toEqual({
            ok: false, error: "Validation failed",
            details: {
                email: "Invalid format",
            },
        });
    });

    it("parses and validates number fields", ()=>{
        const schema = {
        bedrooms: {
            type: "number",
            required: true,
            min: 1,
            max: 10,
        },
        } as const;

        const result = validateStrict({bedrooms: "3",},schema);

        expect(result).toEqual({
        ok: true,
        data: {bedrooms: 3,},
        });
    });

    it("rounds number fields when decimals are configured", () =>{
        const schema = {
        price: {
            type: "number",
            required: true,
            decimals: 2,
        },
        } as const;

        const result = validateStrict({price: 125.678,},schema);

        expect(result).toEqual({
        ok: true,
        data: {
            price: 125.68,
        },
        });
    });

    it("validates enum fields", () =>{
        const schema = {
        status: {
            type: "enum",
            required: true,
            values: ["pending", "confirmed", "cancelled"],
        },
        } as const;

        const result = validateStrict(
        {
            status: "confirmed",
        },
        schema
        );

        expect(result).toEqual({
        ok: true,
        data: {
            status: "confirmed",
        },
        });
    });

    it("rejects invalid enum values", () =>{
        const schema = {
        status: {
            type: "enum",
            required: true,
            values: ["pending", "confirmed", "cancelled"],
        },
        } as const;

        const result = validateStrict(
        {
            status: "deleted",
        },
        schema
        );

        expect(result).toEqual({
        ok: false,
        error: "Validation failed",
        details: {
            status: "Must be one of: pending, confirmed, cancelled",
        },
        });
    });


});

//email validation test
describe("email validation", () =>{
    //valid email format
    it("accets a valid email", () =>{
        expect(isValidEmail("customer@example.com")).toBe(true);
    });

    it("rejects a invalid email", () =>{
        expect(isValidEmail("notanemail12")).toBe(false);
    });
});

//phone number norm test
describe("phone normalization", () =>{
    it("removes formating from a phone number", () =>{
        expect(normalizePhone("(209) 707-8847")).toBe("2097078847");
    });

    it("handles already normalized phone numbers", () =>{
        expect(normalizePhone("2097078847")).toBe("2097078847");
    });
});

//iso date validation test
describe("ISO date validation", () => {
    it("accepts a valid ISO date", () =>{
        expect(isISODate("2026-06-13")).toBe(true);
    });
    it("rejects an invalid date string", ()=>{
        expect(isISODate("not-a-validDate")).toBe(false);
    });
});



