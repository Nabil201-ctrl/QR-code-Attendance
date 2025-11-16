import Constants from "expo-constants";

const { BACKEND_URL } = Constants.expoConfig?.extra || {};

export const API_BASE_URL = BACKEND_URL;
