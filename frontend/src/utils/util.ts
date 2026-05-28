const getImagePrefix = () => {
    return process.env.NODE_ENV === "production"
        ? "/Travixa/"
        : "";
};

export { getImagePrefix };
