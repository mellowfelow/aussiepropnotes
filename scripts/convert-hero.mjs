// WebP re-encodes of this particular photo come out LARGER than the existing
// JPG at every quality tested (87KB JPG vs 87KB+ WebP) — the source is already
// efficiently encoded, so WebP is skipped. AVIF genuinely wins (~18% smaller
// at q45), so it ships as the image-set() candidate with the JPG as fallback.
import sharp from 'sharp'

await sharp('public/images/hero.jpg').avif({ quality: 45 }).toFile('public/images/hero.avif')

const fs = await import('fs')
for (const f of ['hero.jpg', 'hero.avif']) {
  console.log(f, fs.statSync('public/images/' + f).size, 'bytes')
}
