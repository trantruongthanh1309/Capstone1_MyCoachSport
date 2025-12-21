const config = {
    API_BASE: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    // Dùng relative path trong production, absolute trong dev
    getApiUrl: (path) => {
        const base = import.meta.env.VITE_API_BASE_URL || "";
        return base ? `${base}${path}` : path;
    }
};

export default config;
