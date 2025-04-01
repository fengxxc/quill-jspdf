// import json from '@rollup/plugin-json';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
// import pkg from "./package.json" assert {type: "json"};
import { readFileSync } from "fs";

// 使用 JSON.parse 和 readFileSync 替代 import 导入 package.json
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

// 获取所有 peerDependencies 作为外部依赖
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

export default [
  // UMD build (for CDN, browsers)
  {
    input: "src/index.ts",
    output: {
      name: "quill-jspdf",
      file: pkg["umd:main"],
      format: "umd",
      exports: "named",
      sourcemap: true,
      globals: {
        // 指定外部依赖的全局变量名
        // 例如: 'react': 'React'
        'jspdf': 'jsPDF'  // jsPDF 在全局作用域中的变量名
      },
    },
    plugins: [
      // json(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        // 为 UMD 构建单独指定输出目录
        outDir: "dist/umd",
        // 为声明文件指定输出目录，已在单独的构建步骤中生成（通过 build:types 脚本），故此处不需要生成
        // declarationDir: "dist/umd/types",
        // 仅生成 JS，不生成声明文件（因为我们用单独的构建步骤生成声明文件）
        declaration: false,
      }),
      terser(),
    ],
    external: [
      // 列出你不想打包进UMD的外部依赖
      // 例如: 'react', 'react-dom'
      ...external, // 使用上面定义的外部依赖数组
    ],
  },
];
