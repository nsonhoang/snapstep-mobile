/**
 * Script đơn giản hóa dữ liệu GeoJSON tỉnh thành Việt Nam
 * Sử dụng thuật toán Douglas-Peucker (qua @turf/turf) để giảm số lượng tọa độ
 * Chạy 1 lần duy nhất: node scratch/simplify_geojson.js
 */

const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

// Đường dẫn file đầu vào và đầu ra
const INPUT_PATH = path.join(__dirname, '..', 'assets', 'vn_iso_province.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'vn_provinces_simplified.json');

// Mức độ đơn giản hóa (tolerance) - đơn vị: độ (degrees)
// 0.005 ≈ 500m — đủ mượt cho bản đồ nhỏ trên điện thoại
const TOLERANCE = 0.005;

// Đọc file GeoJSON gốc
const rawData = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));

let totalPointsBefore = 0;
let totalPointsAfter = 0;

// Xử lý từng feature (tỉnh/thành phố)
const simplifiedFeatures = rawData.features.map((feature) => {
  const { type, coordinates } = feature.geometry;

  // Đếm số tọa độ trước khi đơn giản hóa
  if (type === 'Polygon') {
    coordinates.forEach((ring) => (totalPointsBefore += ring.length));
  } else if (type === 'MultiPolygon') {
    coordinates.forEach((poly) =>
      poly.forEach((ring) => (totalPointsBefore += ring.length))
    );
  }

  // Tạo GeoJSON Feature hợp lệ cho turf
  const turfFeature = {
    type: 'Feature',
    properties: feature.properties,
    geometry: feature.geometry,
  };

  // Áp dụng thuật toán Douglas-Peucker
  const simplified = turf.simplify(turfFeature, {
    tolerance: TOLERANCE,
    highQuality: true, // Sử dụng thuật toán chất lượng cao hơn
    mutate: false,
  });

  // Đếm số tọa độ sau khi đơn giản hóa
  const simplifiedCoords = simplified.geometry.coordinates;
  const simplifiedType = simplified.geometry.type;

  if (simplifiedType === 'Polygon') {
    simplifiedCoords.forEach((ring) => (totalPointsAfter += ring.length));
  } else if (simplifiedType === 'MultiPolygon') {
    simplifiedCoords.forEach((poly) =>
      poly.forEach((ring) => (totalPointsAfter += ring.length))
    );
  }

  // Chuyển đổi ring tọa độ [lng, lat] → [{latitude, longitude}] cho React Native MapView
  // Làm tròn 4 chữ số thập phân (~11m) để giảm dung lượng file
  const convertRing = (ring) =>
    ring.map(([lng, lat]) => ({
      la: Math.round(lat * 10000) / 10000,
      lo: Math.round(lng * 10000) / 10000,
    }));

  // Trích xuất các ring polygon đã chuyển đổi format
  const simplifiedCoords2 = simplified.geometry.coordinates;
  const simplifiedType2 = simplified.geometry.type;

  const rings = [];
  if (simplifiedType2 === 'Polygon') {
    const ring = simplifiedCoords2[0];
    if (ring && ring.length >= 3) {
      rings.push(convertRing(ring));
    }
  } else if (simplifiedType2 === 'MultiPolygon') {
    simplifiedCoords2.forEach((poly) => {
      const ring = poly[0];
      if (ring && ring.length >= 3) {
        rings.push(convertRing(ring));
      }
    });
  }

  return {
    // Chỉ giữ lại các thuộc tính cần thiết + tọa độ đã chuyển đổi sẵn
    n: feature.properties.Name_VI,   // Tên tiếng Việt (key ngắn để giảm dung lượng)
    e: feature.properties.Name_EN,   // Tên tiếng Anh
    r: rings,                         // Mảng các ring polygon đã convert sẵn {la, lo}
  };
});

// Lọc bỏ feature không có ring nào
const validFeatures = simplifiedFeatures.filter((f) => f.r.length > 0);

// Ghi file (không format JSON để giảm kích thước)
const outputData = { features: validFeatures };
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData));

// Thống kê kết quả
const inputSize = fs.statSync(INPUT_PATH).size;
const outputSize = fs.statSync(OUTPUT_PATH).size;

console.log('========================================');
console.log('  KẾT QUẢ ĐƠN GIẢN HÓA GEOJSON');
console.log('========================================');
console.log(`  Số features:        ${simplifiedFeatures.length}`);
console.log(`  Tọa độ trước:       ${totalPointsBefore.toLocaleString()} điểm`);
console.log(`  Tọa độ sau:         ${totalPointsAfter.toLocaleString()} điểm`);
console.log(`  Giảm:               ${((1 - totalPointsAfter / totalPointsBefore) * 100).toFixed(1)}%`);
console.log(`  File gốc:           ${(inputSize / 1024).toFixed(0)} KB`);
console.log(`  File mới:           ${(outputSize / 1024).toFixed(0)} KB`);
console.log(`  Giảm dung lượng:    ${((1 - outputSize / inputSize) * 100).toFixed(1)}%`);
console.log('========================================');
console.log(`  Đã lưu tại: ${OUTPUT_PATH}`);
