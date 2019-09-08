module.exports = ({ config }) => {
    config.module.rules.push({
        test: /\.(tsx?)$/,
        use: [
            {
                loader: require.resolve('ts-loader'),
            },
        ],
    });
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
};
