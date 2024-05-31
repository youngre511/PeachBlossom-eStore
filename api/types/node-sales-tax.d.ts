declare module "sales-tax" {
    interface TaxRates {
        rate: number;
        rates: {
            state: number;
            county: number;
            city: number;
            district: number;
        };
        has_nexus: boolean;
        freight_taxable: boolean;
    }

    export function getSalesTax(
        countryCode: string,
        stateCode: string,
        city?: string
    ): Promise<TaxRates>;
    export function getSalesTax(
        countryCode: string,
        stateCode: string,
        city?: string,
        zip?: string
    ): Promise<TaxRates>;
}
