const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const htmlPlugin = new htmlWebpackPlugin ({
    template: path.join(__dirname, './src/index.html'),
    filename: 'index.html',
    favicon: './favicon.ico'
});

module.exports = {
    mode: 'production',
    output: {
        path: path.join(__dirname,'./dist'),
        filename: 'js/[name].[hash:8].js',
        publicPath: "/"
    },
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
        htmlPlugin,
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            /zh-cn/,
        ),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: 'css/[name].[hash:8].css',
            chunkFilename: 'css/[id].[hash:8].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new CleanWebpackPlugin(),
    ],
    module: {
        rules: [
            {test: /\.js|jsx$/, use: 'babel-loader', exclude: /node_modules/},
            {test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']},
            {test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader?modules&localIdentName=[path][name]-[local]-[hash:5]',
                    'postcss-loader', 'less-loader']},
            {test: /\.(jpg|png|gif|bmp|jpeg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 30000,
                        name: '[hash:8]-[name].[ext]',
                        outputPath: 'images',
                    }
                }]},
            {test: /\.(ttf|eot|woff|woff2)$/, use: ['url-loader']},
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: '@svgr/webpack',
                        options: {
                            babel: false,
                            icon: true,
                        },
                    },
                    {
                        loader: 'url-loader',
                    },
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.js','.jsx','.json'],
        alias: {
            '@': path.join(__dirname, './src')
        }
    }
};
