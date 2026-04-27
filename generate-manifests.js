const fs   = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const IMAGE_EXTS  = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const FOLDERS     = ['voxel', '2d'];
const THUMB_WIDTH = 600; // 썸네일 최대 너비 (px)

async function processFolder(folder) {
  const folderPath  = path.join(__dirname, folder);
  const thumbsPath  = path.join(folderPath, 'thumbs');

  if (!fs.existsSync(folderPath)) { console.warn(`폴더 없음: ${folder}`); return; }
  if (!fs.existsSync(thumbsPath)) fs.mkdirSync(thumbsPath);

  const files = fs.readdirSync(folderPath)
    .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()));

  // images.json 생성
  const outPath = path.join(folderPath, 'images.json');
  fs.writeFileSync(outPath, JSON.stringify(files, null, 2));
  console.log(`${folder}/images.json 생성 (${files.length}개)`);

  // 썸네일 생성
  for (const file of files) {
    const thumbFile = path.join(thumbsPath, file);
    if (fs.existsSync(thumbFile)) continue; // 이미 있으면 스킵
    try {
      const img = await Jimp.read(path.join(folderPath, file));
      if (img.width > THUMB_WIDTH) {
        img.resize({ w: THUMB_WIDTH });
      }
      await img.write(thumbFile);
      console.log(`  썸네일 생성: ${folder}/thumbs/${file}`);
    } catch (e) {
      // jimp가 처리 못하는 포맷은 원본 복사
      fs.copyFileSync(path.join(folderPath, file), thumbFile);
      console.log(`  원본 복사 (jimp 미지원): ${folder}/thumbs/${file}`);
    }
  }
}

(async () => {
  for (const folder of FOLDERS) {
    await processFolder(folder);
  }
})();
