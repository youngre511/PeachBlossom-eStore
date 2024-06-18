export interface SearchOptionsState {
    searchOptions: SearchOption[];
    error: string | null;
}

export interface SearchOption {
    display: string;
    value: string;
    id: number;
    url: string;
}
