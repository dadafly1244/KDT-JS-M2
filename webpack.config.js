const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack')

module.exports = {
  //파일을 읽어들이기 시작하는 진입점 설정
  entry: './js/main.js',
  
  //결과물(번들)을 반환하는 설정
  output: {
    // path: path.resolve(__dirname, 'dist'), 
    // filename: 'main.js',
    clean: true
  },
  module: {
    rules: [
      {//jpe?g => jpg | jpeg
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset/resource' //웹팩 내부 기능으로 파일 찾아서 ㄴ로딩해줌
      },
      {
        test: /\.s?css$/, //s가 있을수도 없을수도 있
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        use: [
          'babel-loader'
        ]
      }
    ]
  },

  //번들링 후 결과물의 처리방식 등 다양한 플러그인들을 설정
  plugins: [
    new HtmlPlugin({
      template: './index.html'
    }),
    new CopyPlugin({
      patterns: [
        {from: 'static'},
      ]
    }),
    new Dotenv({
      systemvars: true
    })
  ],

  // devServer: {
  //   // host: 'localhost',
  //   // proxy: {
  //   //   '/api': {
  //   //     target: 'http://localhost:8080',
  //   //     changeOrigin: true,
  //   //     pathRewrite: { '^/api': '' }
  //   //   }
  //   // },
  //   headers: {
  //     'Access-Control-Allow-Origin': 'http://localhost:8080'
  //   }
  // }

}