module.exports = ({ config }) => {
    config.module.rules.push({
        test: /\.(tsx?)$/,
        use: [
            {
                loader: require.resolve('ts-loader'),
            },
            {
                loader: require.resolve('react-docgen-typescript-loader'),
            }
        ],
    });
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
};
