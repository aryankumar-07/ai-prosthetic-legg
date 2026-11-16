import * as THREE from 'three';

export interface ProstheticTextureSet {
  carbonAlbedo: THREE.CanvasTexture;
  carbonBump: THREE.CanvasTexture;
  carbonRoughness: THREE.CanvasTexture;
  brushedMetalBump: THREE.CanvasTexture;
  linerAlbedo: THREE.CanvasTexture;
  linerBump: THREE.CanvasTexture;
  ventMeshAlbedo: THREE.CanvasTexture;
  ventMeshAlpha: THREE.CanvasTexture;
  controllerPcbAlbedo: THREE.CanvasTexture;
  imuPcbAlbedo: THREE.CanvasTexture;
  encoderPcbAlbedo: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  thermoplasticSkinAlbedo: THREE.CanvasTexture;
  thermoplasticSkinRoughness: THREE.CanvasTexture;
  foamCuffAlbedo: THREE.CanvasTexture;
  walkwayGridAlbedo: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  return [canvas, ctx];
}

function configureRepeatTexture(
  canvas: HTMLCanvasElement,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number,
  isColor: boolean,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createProstheticTextures(maxAnisotropy: number): ProstheticTextureSet {
  // 1. 2x2 Twill Carbon Fiber Weave (Albedo, Bump, Roughness)
  const [cAlb, ctxAlb] = makeCanvas(256, 256);
  const [cBmp, ctxBmp] = makeCanvas(256, 256);
  const [cRgh, ctxRgh] = makeCanvas(256, 256);

  const cell = 16;
  for (let y = 0; y < 256; y += cell) {
    for (let x = 0; x < 256; x += cell) {
      const ix = (x / cell) | 0;
      const iy = (y / cell) | 0;
      const phase = (ix + iy) % 4;
      const isWarp = phase < 2;

      // Albedo gradient per tow
      const g = ctxAlb.createLinearGradient(
        isWarp ? x : x,
        isWarp ? y : y,
        isWarp ? x + cell : x,
        isWarp ? y : y + cell,
      );
      if (isWarp) {
        g.addColorStop(0, '#14171c');
        g.addColorStop(0.5, '#2b313a');
        g.addColorStop(1, '#121519');
      } else {
        g.addColorStop(0, '#0d1014');
        g.addColorStop(0.5, '#1d2229');
        g.addColorStop(1, '#0b0e11');
      }
      ctxAlb.fillStyle = g;
      ctxAlb.fillRect(x, y, cell, cell);

      // Fine fiber striations
      ctxAlb.strokeStyle = 'rgba(255,255,255,0.045)';
      ctxAlb.lineWidth = 1;
      for (let s = 2; s < cell; s += 4) {
        ctxAlb.beginPath();
        if (isWarp) {
          ctxAlb.moveTo(x, y + s);
          ctxAlb.lineTo(x + cell, y + s);
        } else {
          ctxAlb.moveTo(x + s, y);
          ctxAlb.lineTo(x + s, y + cell);
        }
        ctxAlb.stroke();
      }

      // Bump map
      ctxBmp.fillStyle = isWarp ? '#c8c8c8' : '#707070';
      ctxBmp.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      ctxBmp.fillStyle = '#303030';
      ctxBmp.fillRect(x, y, cell, 1);
      ctxBmp.fillRect(x, y, 1, cell);

      // Roughness variation (glossy resin vs weave trough)
      ctxRgh.fillStyle = isWarp ? '#404040' : '#686868';
      ctxRgh.fillRect(x, y, cell, cell);
    }
  }

  const carbonAlbedo = configureRepeatTexture(cAlb, 10, 10, maxAnisotropy, true);
  const carbonBump = configureRepeatTexture(cBmp, 10, 10, maxAnisotropy, false);
  const carbonRoughness = configureRepeatTexture(cRgh, 10, 10, maxAnisotropy, false);

  // 2. Brushed Titanium Bump
  const [mBmp, ctxMetal] = makeCanvas(256, 256);
  ctxMetal.fillStyle = '#808080';
  ctxMetal.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 650; i++) {
    const y = (i * 37) % 256;
    const shade = 105 + ((i * 29) % 50);
    ctxMetal.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctxMetal.fillRect(0, y, 256, 1);
  }
  const brushedMetalBump = configureRepeatTexture(mBmp, 4, 4, maxAnisotropy, false);

  // 3. Breathable Grey Liner Fabric
  const [lAlb, ctxLiner] = makeCanvas(256, 256);
  const [lBmp, ctxLinerBmp] = makeCanvas(256, 256);
  ctxLiner.fillStyle = '#7b8088';
  ctxLiner.fillRect(0, 0, 256, 256);
  ctxLinerBmp.fillStyle = '#909090';
  ctxLinerBmp.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      const offset = (y / 8) % 2 === 0 ? 0 : 4;
      ctxLiner.fillStyle = '#5e636b';
      ctxLiner.beginPath();
      ctxLiner.arc((x + offset) % 256, y + 2, 1.5, 0, Math.PI * 2);
      ctxLiner.fill();

      ctxLinerBmp.fillStyle = '#404040';
      ctxLinerBmp.beginPath();
      ctxLinerBmp.arc((x + offset) % 256, y + 2, 1.8, 0, Math.PI * 2);
      ctxLinerBmp.fill();
    }
  }
  const linerAlbedo = configureRepeatTexture(lAlb, 6, 6, maxAnisotropy, true);
  const linerBump = configureRepeatTexture(lBmp, 6, 6, maxAnisotropy, false);

  // 4. Socket Ventilation Mesh
  const [vAlb, ctxVent] = makeCanvas(128, 128);
  const [vAlp, ctxVentAlp] = makeCanvas(128, 128);
  ctxVent.fillStyle = '#474c54';
  ctxVent.fillRect(0, 0, 128, 128);
  ctxVentAlp.fillStyle = '#505050';
  ctxVentAlp.fillRect(0, 0, 128, 128);
  for (let y = 4; y < 128; y += 10) {
    for (let x = 4; x < 128; x += 10) {
      const dx = (y / 10) % 2 === 0 ? 0 : 5;
      ctxVent.fillStyle = '#181b20';
      ctxVent.beginPath();
      ctxVent.arc((x + dx) % 128, y, 3, 0, Math.PI * 2);
      ctxVent.fill();

      ctxVentAlp.fillStyle = '#ffffff';
      ctxVentAlp.beginPath();
      ctxVentAlp.arc((x + dx) % 128, y, 2.2, 0, Math.PI * 2);
      ctxVentAlp.fill();
    }
  }
  const ventMeshAlbedo = configureRepeatTexture(vAlb, 4, 4, maxAnisotropy, true);
  const ventMeshAlpha = configureRepeatTexture(vAlp, 4, 4, maxAnisotropy, false);

  // 5. Controller PCB Texture
  const [pcbC, ctxPcb] = makeCanvas(256, 512);
  ctxPcb.fillStyle = '#0f3d28';
  ctxPcb.fillRect(0, 0, 256, 512);
  // Copper traces
  ctxPcb.strokeStyle = '#257952';
  ctxPcb.lineWidth = 2;
  for (let i = 16; i < 240; i += 14) {
    ctxPcb.beginPath();
    ctxPcb.moveTo(i, 24);
    ctxPcb.lineTo(i, 488);
    ctxPcb.stroke();
  }
  // Main SoC IC
  ctxPcb.fillStyle = '#14171c';
  ctxPcb.fillRect(68, 130, 120, 120);
  ctxPcb.strokeStyle = '#d4af37';
  ctxPcb.lineWidth = 3;
  ctxPcb.strokeRect(64, 126, 128, 128);
  // Secondary IC & Power Inductor
  ctxPcb.fillStyle = '#1a1e24';
  ctxPcb.fillRect(42, 310, 76, 68);
  ctxPcb.fillStyle = '#3e4550';
  ctxPcb.fillRect(142, 305, 68, 72);
  // Gold SMD pads & connectors
  ctxPcb.fillStyle = '#d8b44c';
  for (let y = 32; y < 100; y += 18) {
    ctxPcb.fillRect(28, y, 24, 10);
    ctxPcb.fillRect(204, y, 24, 10);
  }
  for (let x = 44; x < 210; x += 22) {
    ctxPcb.fillRect(x, 428, 12, 34);
  }
  const controllerPcbAlbedo = configureRepeatTexture(pcbC, 1, 1, maxAnisotropy, true);
  controllerPcbAlbedo.wrapS = THREE.ClampToEdgeWrapping;
  controllerPcbAlbedo.wrapT = THREE.ClampToEdgeWrapping;

  // 6. Blue IMU Breakout Texture
  const [imuC, ctxImu] = makeCanvas(256, 256);
  ctxImu.fillStyle = '#124675';
  ctxImu.fillRect(0, 0, 256, 256);
  ctxImu.strokeStyle = '#266eb0';
  ctxImu.lineWidth = 3;
  for (let i = 28; i < 230; i += 22) {
    ctxImu.beginPath();
    ctxImu.moveTo(i, 24);
    ctxImu.lineTo(128, 128);
    ctxImu.stroke();
  }
  ctxImu.fillStyle = '#111419';
  ctxImu.fillRect(80, 80, 96, 96);
  ctxImu.fillStyle = '#e0be5a';
  for (let i = 36; i <= 216; i += 30) {
    ctxImu.beginPath();
    ctxImu.arc(i, 24, 7, 0, Math.PI * 2);
    ctxImu.arc(i, 232, 7, 0, Math.PI * 2);
    ctxImu.fill();
  }
  const imuPcbAlbedo = configureRepeatTexture(imuC, 1, 1, maxAnisotropy, true);
  imuPcbAlbedo.wrapS = THREE.ClampToEdgeWrapping;
  imuPcbAlbedo.wrapT = THREE.ClampToEdgeWrapping;

  // 7. AS5600 Circular Magnetic Encoder Ring Texture
  const [encC, ctxEnc] = makeCanvas(256, 256);
  ctxEnc.fillStyle = '#135235';
  ctxEnc.fillRect(0, 0, 256, 256);
  ctxEnc.save();
  ctxEnc.translate(128, 128);
  for (let a = 0; a < 36; a++) {
    ctxEnc.rotate((Math.PI * 2) / 36);
    ctxEnc.fillStyle = a % 3 === 0 ? '#e2c15d' : '#7ae2ce';
    ctxEnc.fillRect(-2, -112, 4, a % 3 === 0 ? 18 : 10);
  }
  ctxEnc.strokeStyle = '#d4af37';
  ctxEnc.lineWidth = 4;
  ctxEnc.beginPath();
  ctxEnc.arc(0, 0, 74, 0, Math.PI * 2);
  ctxEnc.stroke();
  ctxEnc.restore();
  const encoderPcbAlbedo = configureRepeatTexture(encC, 1, 1, maxAnisotropy, true);
  encoderPcbAlbedo.wrapS = THREE.ClampToEdgeWrapping;
  encoderPcbAlbedo.wrapT = THREE.ClampToEdgeWrapping;

  // 8. Soft Radial Ground Contact Shadow
  const [shC, ctxSh] = makeCanvas(256, 256);
  const grad = ctxSh.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.34)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctxSh.fillStyle = grad;
  ctxSh.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(shC);
  contactShadow.colorSpace = THREE.SRGBColorSpace;
  contactShadow.needsUpdate = true;

  // 9. Bulky Skin-Tone Molded Thermoplastic Socket (realistic aged beige plastic wear & scuffs)
  const [skAlb, ctxSkin] = makeCanvas(256, 256);
  const [skRgh, ctxSkinRgh] = makeCanvas(256, 256);
  const skinGrad = ctxSkin.createLinearGradient(0, 0, 256, 256);
  skinGrad.addColorStop(0, '#c99f79');
  skinGrad.addColorStop(0.55, '#d2aa84');
  skinGrad.addColorStop(1, '#ba8e67');
  ctxSkin.fillStyle = skinGrad;
  ctxSkin.fillRect(0, 0, 256, 256);

  ctxSkinRgh.fillStyle = '#929292';
  ctxSkinRgh.fillRect(0, 0, 256, 256);

  // Subtle plastic thermoform grain, fine horizontal scuff marks, and wear patina
  for (let i = 0; i < 90; i++) {
    const sx = (i * 47) % 250;
    const sy = (i * 29) % 250;
    const len = 8 + (i % 18);
    ctxSkin.strokeStyle = i % 3 === 0 ? 'rgba(98, 68, 44, 0.14)' : 'rgba(235, 212, 186, 0.09)';
    ctxSkin.lineWidth = 1;
    ctxSkin.beginPath();
    ctxSkin.moveTo(sx, sy);
    ctxSkin.lineTo(sx + len, sy + ((i % 3) - 1) * 2);
    ctxSkin.stroke();

    ctxSkinRgh.fillStyle = i % 2 === 0 ? '#adadad' : '#787878';
    ctxSkinRgh.fillRect(sx, sy, len, 2);
  }
  // Vertical thermoforming mold seam line
  ctxSkin.fillStyle = 'rgba(104, 72, 46, 0.24)';
  ctxSkin.fillRect(126, 0, 3, 256);

  const thermoplasticSkinAlbedo = configureRepeatTexture(skAlb, 2, 1, maxAnisotropy, true);
  const thermoplasticSkinRoughness = configureRepeatTexture(skRgh, 2, 1, maxAnisotropy, false);

  // 10. Conventional Foam Cuff Texture
  const [fmAlb, ctxFoam] = makeCanvas(128, 128);
  ctxFoam.fillStyle = '#cdc4b5';
  ctxFoam.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 220; i++) {
    ctxFoam.fillStyle = i % 2 === 0 ? 'rgba(120, 108, 92, 0.14)' : 'rgba(245, 240, 232, 0.12)';
    ctxFoam.fillRect((i * 19) % 124, (i * 31) % 124, 3, 3);
  }
  const foamCuffAlbedo = configureRepeatTexture(fmAlb, 4, 3, maxAnisotropy, true);

  // 11. Studio Walkway / Treadmill Track Texture
  const [wkAlb, ctxWalk] = makeCanvas(256, 256);
  ctxWalk.fillStyle = '#11151d';
  ctxWalk.fillRect(0, 0, 256, 256);
  ctxWalk.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctxWalk.lineWidth = 2;
  for (let y = 0; y < 256; y += 32) {
    ctxWalk.beginPath();
    ctxWalk.moveTo(0, y);
    ctxWalk.lineTo(256, y);
    ctxWalk.stroke();
  }
  ctxWalk.strokeStyle = 'rgba(20, 184, 166, 0.16)';
  ctxWalk.lineWidth = 2;
  ctxWalk.strokeRect(12, 0, 232, 256);
  const walkwayGridAlbedo = configureRepeatTexture(wkAlb, 1, 6, maxAnisotropy, true);

  const all = [
    carbonAlbedo,
    carbonBump,
    carbonRoughness,
    brushedMetalBump,
    linerAlbedo,
    linerBump,
    ventMeshAlbedo,
    ventMeshAlpha,
    controllerPcbAlbedo,
    imuPcbAlbedo,
    encoderPcbAlbedo,
    contactShadow,
    thermoplasticSkinAlbedo,
    thermoplasticSkinRoughness,
    foamCuffAlbedo,
    walkwayGridAlbedo,
  ];

  return {
    carbonAlbedo,
    carbonBump,
    carbonRoughness,
    brushedMetalBump,
    linerAlbedo,
    linerBump,
    ventMeshAlbedo,
    ventMeshAlpha,
    controllerPcbAlbedo,
    imuPcbAlbedo,
    encoderPcbAlbedo,
    contactShadow,
    thermoplasticSkinAlbedo,
    thermoplasticSkinRoughness,
    foamCuffAlbedo,
    walkwayGridAlbedo,
    dispose: () => {
      all.forEach((t) => t.dispose());
    },
  };
}
