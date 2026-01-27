const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          // 忽略 ResizeObserver 相关错误
          const ignoreErrors = [
            "ResizeObserver loop completed with undelivered notifications",
            "ResizeObserver loop limit exceeded",
            "Non-Error promise rejection captured"
          ];
          
          if (ignoreErrors.some(e => error.message && error.message.includes(e))) {
            return false;
          }
          
          return true;
        },
      },
    },
  },
  
  // 配置 webpack
  configureWebpack: {
    // 忽略特定警告
    ignoreWarnings: [
      {
        module: /ResizeObserver/,
      },
    ],
  },
})
