    // This is not a React hook; expose as a plain function so it can be used at module level.
    export const getEnv = () => {
        const server = import.meta.env.VITE_SERVER_URL ?? import.meta.env.VITE_DEV_SERVER_URL;

        return {
            dev: {
                server,
            },
        };
    };
