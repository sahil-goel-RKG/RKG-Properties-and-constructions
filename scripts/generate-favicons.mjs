import sharp from 'sharp'
import { resolve } from 'node:path'

const input = resolve('public', 'fevicon.png')

function circleMaskSvg(size) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  )
}

async function makeRoundPng(size, outName) {
  const mask = circleMaskSvg(size)
  await sharp(input)
    .resize(size, size, { fit: 'cover' })
    .png()
    .composite([{ input: mask, blend: 'dest-in' }])
    .toFile(resolve('public', outName))
}

async function main() {
  await makeRoundPng(16, 'favicon-16x16.png')
  await makeRoundPng(32, 'favicon-32x32.png')
  await makeRoundPng(180, 'apple-touch-icon.png')
  // Keep the original `fevicon.png` as-is; small assets above are used by browsers.
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

