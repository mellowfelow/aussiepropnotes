import fs from 'fs'
const dir = 'public/images'
fs.mkdirSync(dir, { recursive: true })

// Guilloche engraving motif (signature element)
const guilloche = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" fill="none">
${Array.from({length:28},(_,i)=>{const r=60+i*15;return `<circle cx="450" cy="450" r="${r}" stroke="#C9A227" stroke-opacity="${(0.5-i*0.014).toFixed(3)}" stroke-width="0.8"/>`}).join('')}
${Array.from({length:12},(_,i)=>{const a=i*30;return `<ellipse cx="450" cy="450" rx="420" ry="140" stroke="#C9A227" stroke-opacity="0.12" stroke-width="0.7" transform="rotate(${a} 450 450)"/>`}).join('')}
</svg>`
fs.writeFileSync(dir+'/guilloche.svg', guilloche)

// Logo: stacked-note mark
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
<rect x="10" y="26" width="60" height="34" rx="4" fill="#0E1B2A" transform="rotate(-6 40 43)"/>
<rect x="10" y="24" width="60" height="34" rx="4" fill="#16283C" transform="rotate(-2 40 41)"/>
<rect x="10" y="22" width="60" height="34" rx="4" fill="#C9A227"/>
<circle cx="40" cy="39" r="10" fill="none" stroke="#0E1B2A" stroke-width="2.4"/>
<text x="40" y="44" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="900" fill="#0E1B2A" text-anchor="middle">A</text>
<rect x="16" y="27" width="7" height="24" rx="1.5" fill="#0E1B2A" opacity="0.25"/>
<rect x="57" y="27" width="7" height="24" rx="1.5" fill="#0E1B2A" opacity="0.25"/>
</svg>`
fs.writeFileSync(dir+'/logo.svg', logo)
fs.writeFileSync(dir+'/favicon.svg', logo)

// Note renderer
const note = (color, denom, w=340, h=170, x=0, y=0, rot=0, op=1) => `
<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${op}">
<rect width="${w}" height="${h}" rx="10" fill="${color}"/>
<rect x="6" y="6" width="${w-12}" height="${h-12}" rx="7" fill="none" stroke="#0E1B2A" stroke-opacity="0.25" stroke-width="1.5"/>
<circle cx="${w*0.72}" cy="${h/2}" r="${h*0.32}" fill="none" stroke="#0E1B2A" stroke-opacity="0.3" stroke-width="2"/>
<text x="${w*0.72}" y="${h/2+h*0.13}" font-family="Arial" font-size="${h*0.36}" font-weight="900" fill="#0E1B2A" fill-opacity="0.55" text-anchor="middle">${denom}</text>
<text x="18" y="${h*0.28}" font-family="Arial" font-size="${h*0.13}" font-weight="800" fill="#0E1B2A" fill-opacity="0.6">PROP NOTE</text>
<text x="18" y="${h*0.88}" font-family="Arial" font-size="${h*0.09}" font-weight="700" fill="#0E1B2A" fill-opacity="0.5">FOR MOTION PICTURE USE ONLY</text>
<rect x="${w*0.42}" y="10" width="${w*0.05}" height="${h-20}" rx="4" fill="#0E1B2A" opacity="0.12"/>
</g>`

const band = (x,y,w,rot=0,label='$10,000') => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect width="${w}" height="34" rx="4" fill="#F7F5F0" stroke="#C9A227" stroke-width="2"/><text x="${w/2}" y="22" font-family="Arial" font-size="14" font-weight="800" fill="#0E1B2A" text-anchor="middle">${label}</text></g>`

const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${inner}</svg>`
const stack = (color, denom, cx, cy, n=5, spread=7) =>
  Array.from({length:n},(_,i)=>note(color,denom,300,150,cx-150,cy-75-(n-1-i)*spread,(i-n/2)*1.2,1)).join('')

// AUD colours: $100 green, $50 gold/yellow, $20 red-orange
const imgs = {
  'aud-100-full-print-prop-notes': wrap(stack('#7FBF8E','$100',200,215)+band(120,250,160)),
  'aud-50-full-print-prop-notes': wrap(stack('#E8C86A','$50',200,215)+band(120,250,160)),
  'aud-20-full-print-prop-notes': wrap(stack('#E09A6A','$20',200,215)+band(120,250,160)),
  'aged-distressed-aud-prop-notes': wrap(`<g opacity="0.92">${stack('#9AA98B','$50',200,210,5,9)}</g><path d="M90 300 L110 285 L130 302 L150 288" stroke="#5A6B7D" stroke-width="2" fill="none" opacity="0.5"/>`+band(120,252,160,-2)),
  'money-stack-bundle-100k': wrap(
    stack('#7FBF8E','$100',120,140,4,6)+stack('#7FBF8E','$100',280,140,4,6)+
    stack('#7FBF8E','$100',120,265,4,6)+stack('#7FBF8E','$100',280,265,4,6)+
    band(45,158,150,0)+band(205,158,150,0)+band(45,283,150,0)+band(205,283,150,0)),
  'briefcase-money-set': wrap(`
    <rect x="55" y="90" width="290" height="200" rx="14" fill="#3A4757"/>
    <rect x="65" y="100" width="270" height="180" rx="10" fill="#16283C"/>
    <rect x="170" y="70" width="60" height="26" rx="8" fill="#3A4757"/>
    ${note('#7FBF8E','$100',120,62,80,115,0)}${note('#7FBF8E','$100',120,62,210,115,0)}
    ${note('#7FBF8E','$100',120,62,80,190,0)}${note('#7FBF8E','$100',120,62,210,190,0)}
    ${band(95,133,90,0,'$10K')}${band(225,133,90,0,'$10K')}${band(95,208,90,0,'$10K')}${band(225,208,90,0,'$10K')}`),
  'photography-flat-lay-set': wrap(
    note('#7FBF8E','$100',260,130,40,60,-14)+note('#E8C86A','$50',260,130,110,120,8)+
    note('#E09A6A','$20',260,130,70,210,-4)+`<circle cx="330" cy="90" r="34" fill="none" stroke="#C9A227" stroke-width="3" opacity="0.6"/><circle cx="330" cy="90" r="22" fill="none" stroke="#C9A227" stroke-width="2" opacity="0.4"/>`),
  'miniature-scale-prop-notes': wrap(
    Array.from({length:9},(_,i)=>note(['#7FBF8E','#E8C86A','#E09A6A'][i%3],['$100','$50','$20'][i%3],96,48,60+(i%3)*100,100+Math.floor(i/3)*72,(i%2?3:-3))).join('')+
    `<text x="200" y="350" font-family="Arial" font-size="18" font-weight="800" fill="#5A6B7D" text-anchor="middle">1:6 SCALE</text>`),
  'money-gun-prop-bills-bundle': wrap(`
    <rect x="70" y="170" width="150" height="70" rx="12" fill="#C9A227"/>
    <rect x="200" y="150" width="80" height="55" rx="8" fill="#0E1B2A"/>
    <rect x="95" y="235" width="45" height="80" rx="10" fill="#0E1B2A" transform="rotate(12 117 275)"/>
    ${note('#7FBF8E','$100',100,50,255,90,18,0.95)}${note('#E8C86A','$50',100,50,300,150,40,0.9)}${note('#7FBF8E','$100',100,50,290,40,-8,0.85)}`),
  'photo-booth-money-props-pack': wrap(
    note('#7FBF8E','$100',320,160,40,80,-5)+
    `<g transform="translate(230 200) rotate(10)"><rect width="120" height="120" rx="12" fill="#C9A227"/><text x="60" y="52" font-family="Arial" font-size="20" font-weight="900" fill="#0E1B2A" text-anchor="middle">PAY</text><text x="60" y="80" font-family="Arial" font-size="20" font-weight="900" fill="#0E1B2A" text-anchor="middle">DAY!</text><rect x="52" y="120" width="16" height="60" fill="#8A6A12"/></g>`),
  'gold-foil-novelty-notes-set': wrap(
    note('#D9B944','$100',300,150,50,90,-6)+note('#E8CE6E','$100',300,150,60,170,3)+
    `<rect x="66" y="176" width="288" height="138" rx="10" fill="none" stroke="#8A6A12" stroke-width="2" opacity="0.6" transform="rotate(3 210 245)"/>`),
  'custom-branded-prop-notes': wrap(
    note('#9AB8D9','YOUR',300,150,50,125,0)+
    `<text x="120" y="235" font-family="Arial" font-size="17" font-weight="800" fill="#0E1B2A" fill-opacity="0.6">BRAND BANK</text>
     <circle cx="200" cy="330" r="26" fill="none" stroke="#C9A227" stroke-width="3"/>
     <text x="200" y="337" font-family="Arial" font-size="20" font-weight="900" fill="#C9A227" text-anchor="middle">+</text>`),
}
for (const [slug, svg] of Object.entries(imgs)) fs.writeFileSync(`${dir}/${slug}.svg`, svg)

// OG image
fs.writeFileSync(dir+'/og-home.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0E1B2A"/>
<g opacity="0.4" transform="translate(700 40) scale(0.9)">${Array.from({length:20},(_,i)=>`<circle cx="300" cy="300" r="${60+i*16}" stroke="#C9A227" stroke-opacity="${(0.45-i*0.02).toFixed(2)}" stroke-width="1" fill="none"/>`).join('')}</g>
${note('#7FBF8E','$100',380,190,90,300,-7)}
<text x="90" y="150" font-family="Arial" font-size="64" font-weight="900" fill="#F7F5F0">Aussie Prop Notes</text>
<text x="90" y="215" font-family="Arial" font-size="30" fill="#C9A227">Camera-Ready Prop Money. Australia-Wide.</text>
</svg>`)
console.log('images:', Object.keys(imgs).length + 4)
