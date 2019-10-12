const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const htmlPlugin = new htmlWebpackPlugin ({
    template: path.join(__dirname, './src/index.html'),
    filename: 'index.html'
});

module.exports = {
    mode: 'development',
    output: {
        path: path.join(__dirname,'./dist'),
        filename: 'bundle.js',
    },
    devServer: {
        open: true,
        port: 8085,
        contentBase: 'src',
        hot: true,
        inline: true,
        historyApiFallback: true,
        proxy: {
            "/indexapp.php": {
                target: 'https://edu.9man.com',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
        },
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        htmlPlugin
    ],
    module: {
        rules: [
            {test: /\.js|jsx$/, use: 'babel-loader', exclude: /node_modules/},
            {test: /\.css$/, use: ['style-loader','css-loader']},
            {test: /\.less$/, use: ['style-loader','css-loader?modules&localIdentName=[path][name]-[local]-[hash:5]','less-loader']},
            {test: /\.(jpg|png|gif|bmp|jpeg)$/, use: ['url-loader?limit=102400&name=[hash:8]-[name].[ext]']},
            {test: /\.(ttf|eot|svg|woff|woff2)$/, use: ['url-loader']}
        ]
    },
    resolve: {
        extensions: ['.js','.jsx','.json'],
        alias: {
            '@': path.join(__dirname, './src')
        }
    }
};
