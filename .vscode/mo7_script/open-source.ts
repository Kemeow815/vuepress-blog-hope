#!bun

/* 
用于开源本项目，会提取部分文件到开源仓库里面并发布

*/
import { $ } from 'bun';
import path from 'path';
import { exec } from 'child_process';
import { myInit, pathSpace, sleep } from './common';
import fs from 'fs-extra';

await myInit();

let desc = process.argv[2];
if (!desc) {
  desc = 'open-source-default';
  console.warn(`git commit: ${desc} \n`);
} else {
  console.log(`git commit: ${desc} \n`);
}

const rootPath = pathSpace.rootPath;
const cachePath = path.join(rootPath, '.cache');
const loclDepotPath = path.join(cachePath, 'local-source');
const local_remoteDepotPath = path.join(cachePath, 'remote-source');
const gitRemotePath = 'git@github.com:mo7cc/vuepress-blog-source.git';

try {
  await $`rm -rf ${cachePath}`;
  await $`mkdir -p ${loclDepotPath}`;
} catch (error) {
  console.error(`rm err code: ${error.exitCode}`);
  console.info(error.stdout.toString());
  console.info(error.stderr.toString());
  process.exit(1);
}
console.log('目录已清空');

const openFile = [
  { from: '/private/VuePress_README.md', to: '/README.md' },
  { from: '/.vscode', to: '/.vscode' },
  { from: '/src', to: '/src' },
  { from: '/package.json', to: '/package.json' },
  { from: '/.gitignore', to: '/.gitignore' },
  { from: '/tsconfig.json', to: '/tsconfig.json' },
  { from: '/.prettierignore', to: '/.prettierignore' },
  { from: '/.prettierrc.cjs', to: '/.prettierrc.cjs' },
  { from: '/go.mod', to: '/go.mod' },
];
try {
  for (let i = 0; i < openFile.length; i++) {
    const el = openFile[i];
    const fromPath = path.join(rootPath, el.from);
    const toPath = path.join(loclDepotPath, el.to);
    fs.cpSync(fromPath, toPath, { recursive: true });
  }
} catch (error) {
  console.error(`cp err code: ${error}`);
  console.info(error.stdout.toString());
  console.info(error.stderr.toString());
  process.exit(1);
}
console.log('本地源码构建完成');

$.cwd(cachePath);
const dotGitPath_remote = path.join(local_remoteDepotPath, '.git');
const dotGitPath_local = path.join(loclDepotPath, '.git');
try {
  await $`git clone ${gitRemotePath} ${local_remoteDepotPath}`;

  fs.cpSync(dotGitPath_remote, dotGitPath_local, { recursive: true });
  await $`rm -rf ${local_remoteDepotPath}`;
} catch (error) {
  console.error(`git err code: ${error}`);
  console.info(error.stdout.toString());
  console.info(error.stderr.toString());
  process.exit(1);
}

console.log('git仓库已构建完毕');

$.cwd(loclDepotPath);
try {
  await $`git add .`;
  await $`git commit -m "${desc}"`;
  await $`git push`;
  console.log('删除目录', dotGitPath_local);

  await $`rm -rf ${dotGitPath_local}`;
} catch (error) {
  console.error(`git err code: ${error.exitCode}`);
  console.info(error.stdout.toString());
  console.info(error.stderr.toString());
  process.exit(1);
}

console.log(`
推送成功:
https://github.com/mo7cc/vuepress-blog-source
`);
exec('start https://github.com/mo7cc/vuepress-blog-source');

await sleep(500);
process.exit(0);
