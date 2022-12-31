const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'production',
  target: 'web',
  context: `${__dirname}/src`,
  entry: {
    background: './background',
    'content-script': './content-script',
  },
  output: {
    path: `${__dirname}/app`,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        'icon.png',
        {
          from: 'manifest.json',
          transform: (content) => {
            return Buffer.from(
              JSON.stringify({
                ...JSON.parse(content.toString()),
                name: process.env.npm_package_productName,
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
              })
            )
          },
        },
        'content-script.css',
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '~': `${__dirname}/src/`,
      '~~': `${__dirname}/`,
    },
  },
}
