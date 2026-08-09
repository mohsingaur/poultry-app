export class Utility {
    static getToken() {
        return localStorage.getItem('token');
    }
    static setToken(token: string) {
        localStorage.setItem('token', token);
    }
    static getProfile() {
        return JSON.parse(localStorage.getItem('profile') || '{}');
    }
    static setProfile(profile: any) {
        localStorage.setItem('profile', JSON.stringify(profile));
    }
    static getFarmer() {
        return JSON.parse(localStorage.getItem('farmer') || '{}');
    }
    static setFarmer(farmer: any) {
        localStorage.setItem('farmer', JSON.stringify(farmer));
    }
    static getFarms() {
        return JSON.parse(localStorage.getItem('farms') || '[]');
    }
    static setFarms(farms: any[]) {
        localStorage.setItem('farms', JSON.stringify(farms));
    }
    static getBatches() {
        return JSON.parse(localStorage.getItem('batches') || '[]');
    }
    static setBatches(batches: any[]) {
        localStorage.setItem('batches', JSON.stringify(batches));
    }
    static setStandardData(data: any[]) {
        localStorage.setItem('standardData', JSON.stringify(data));
    }
    static getStandardData() {
        return JSON.parse(localStorage.getItem('standardData') || '[]');
    }
    static clearAll() {
        localStorage.clear();
        sessionStorage.clear();
    }
}