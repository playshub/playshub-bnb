const path = require("path");
const { ProvidePlugin } = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "umd",
      name: "CatBattleEvmSdk",
    },
    globalObject: "this",
  },
  mode: "production",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      buffer: require.resolve("buffer/"),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
