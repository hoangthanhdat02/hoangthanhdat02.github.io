const sharp = require('sharp');

async function processAvatar() {
  const circleSvg = Buffer.from("<svg width='232' height='232'><circle cx='116' cy='116' r='115' fill='white'/></svg>");

  await sharp('public/images/birthday-reference.png')
    .extract({ left: 602, top: 96, width: 232, height: 232 })
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toFile('public/images/birthday-avatar.png');

  console.log('Processed avatar successfully');
}

processAvatar();
