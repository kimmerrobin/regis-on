// Utilitário para extração de vetor de características e comparação facial entre imagens no navegador (Canvas)

/**
 * Converte uma imagem (dataURL ou Image) para um canvas normalizado (64x64 em escala de cinza e histograma de cor)
 */
export async function extractFaceFeatures(imageSource) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Foca na região central (área onde o rosto fica na mira biométrica: 60% central)
      const srcW = img.width;
      const srcH = img.height;
      const cropX = srcW * 0.2;
      const cropY = srcH * 0.15;
      const cropW = srcW * 0.6;
      const cropH = srcH * 0.7;

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      // Extrai luminosidade e componentes de cor
      const grayValues = new Float32Array(size * size);
      let rSum = 0, gSum = 0, bSum = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        rSum += r;
        gSum += g;
        bSum += b;
        // Fórmula de luminância padrão ITU-R BT.601
        grayValues[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
      }

      const totalPixels = size * size;
      const avgR = rSum / totalPixels;
      const avgG = gSum / totalPixels;
      const avgB = bSum / totalPixels;

      // Normaliza o vetor de luminância (média zero, desvio unitário)
      let sum = 0;
      for (let j = 0; j < grayValues.length; j++) {
        sum += grayValues[j];
      }
      const mean = sum / grayValues.length;

      let varianceSum = 0;
      for (let j = 0; j < grayValues.length; j++) {
        grayValues[j] -= mean;
        varianceSum += grayValues[j] * grayValues[j];
      }
      const stdDev = Math.sqrt(varianceSum / grayValues.length) || 1;

      for (let j = 0; j < grayValues.length; j++) {
        grayValues[j] /= stdDev;
      }

      resolve({
        normalizedVector: grayValues,
        colorProfile: { r: avgR, g: avgG, b: avgB },
      });
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = imageSource;
  });
}

/**
 * Calcula a similaridade de cosseno e correlação estrutural entre duas fotos (0 a 100%)
 */
export async function compareFaces(photoA, photoB) {
  try {
    const featA = await extractFaceFeatures(photoA);
    const featB = await extractFaceFeatures(photoB);

    if (!featA || !featB) return 0;

    const vA = featA.normalizedVector;
    const vB = featB.normalizedVector;

    // Correlação de Pearson (similaridade de cosseno de vetores normalizados)
    let dotProduct = 0;
    for (let i = 0; i < vA.length; i++) {
      dotProduct += vA[i] * vB[i];
    }
    const correlation = dotProduct / vA.length; // Entre -1 e 1

    // Distância de cor média (pele / iluminação)
    const dR = Math.abs(featA.colorProfile.r - featB.colorProfile.r);
    const dG = Math.abs(featA.colorProfile.g - featB.colorProfile.g);
    const dB = Math.abs(featA.colorProfile.b - featB.colorProfile.b);
    const colorDist = (dR + dG + dB) / (3 * 255); // 0 a 1

    // Combinação ponderada
    let similarityScore = (correlation * 0.65 + (1 - colorDist) * 0.35) * 100;
    if (similarityScore < 0) similarityScore = 0;
    if (similarityScore > 99.8) similarityScore = 99.8;

    return Math.round(similarityScore * 10) / 10;
  } catch (err) {
    console.error('Erro na comparação facial:', err);
    return 0;
  }
}

/**
 * Busca no banco de funcionários qual deles mais se aproxima da foto capturada na câmera
 */
export async function findBestMatch(livePhoto, employeesList, minThreshold = 68) {
  if (!employeesList || employeesList.length === 0) {
    return { match: null, confidence: 0, status: 'EMPTY_DATABASE' };
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const emp of employeesList) {
    if (!emp.photo) continue;
    const score = await compareFaces(livePhoto, emp.photo);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = emp;
    }
  }

  if (highestScore >= minThreshold && bestMatch) {
    return {
      match: bestMatch,
      confidence: highestScore,
      status: 'RECOGNIZED',
    };
  }

  return {
    match: null,
    confidence: highestScore,
    status: 'NOT_RECOGNIZED',
  };
}
