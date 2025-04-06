const path = require("path");

module.exports = {
  entry: {
    main: "./src/index.js",
    tuner: "./src/components/Tuner.js",
    applicationView: "./src/components/ApplicationView.js"
  },
  output: {
    path: path.resolve(__dirname, "./static/frontend"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
