// Haversine formula to compute distance in meters between two lat/lng points
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

const LAT_MIN = 12.1000;
const LAT_MAX = 13.1500;
const LNG_MIN = 76.4500;
const LNG_MAX = 77.7500;

const GRID_ROWS = 40;
const GRID_COLS = 40;

function latToY(lat) {
  const pct = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN);
  return Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(pct * GRID_ROWS)));
}

function lngToX(lng) {
  const pct = (lng - LNG_MIN) / (LNG_MAX - LNG_MIN);
  return Math.min(GRID_COLS - 1, Math.max(0, Math.floor(pct * GRID_COLS)));
}

function yToLat(y) {
  return LAT_MIN + ((y + 0.5) / GRID_ROWS) * (LAT_MAX - LAT_MIN);
}

function xToLng(x) {
  return LNG_MIN + ((x + 0.5) / GRID_COLS) * (LNG_MAX - LNG_MIN);
}

export function findOptimizedRoute(startLoc, endLoc, activeDisasters, targetDisasterId) {
  const grid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(0));

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const cellLat = yToLat(y);
      const cellLng = xToLng(x);

      for (const disaster of activeDisasters) {
        if (disaster._id === targetDisasterId) continue;

        const distance = getDistance(cellLat, cellLng, disaster.location.lat, disaster.location.lng);
        if (distance <= disaster.radius) {
          grid[y][x] = 1; // blocked
          break;
        }
      }
    }
  }

  const startX = lngToX(startLoc.lng);
  const startY = latToY(startLoc.lat);
  const endX = lngToX(endLoc.lng);
  const endY = latToY(endLoc.lat);

  grid[startY][startX] = 0;
  grid[endY][endX] = 0;

  const path = runAStar(grid, startX, startY, endX, endY);

  if (!path) {
    return [
      { lat: startLoc.lat, lng: startLoc.lng },
      { lat: endLoc.lat, lng: endLoc.lng }
    ];
  }

  const latLngPath = path.map(node => ({
    lat: yToLat(node.y),
    lng: xToLng(node.x)
  }));

  latLngPath[0] = { lat: startLoc.lat, lng: startLoc.lng };
  latLngPath[latLngPath.length - 1] = { lat: endLoc.lat, lng: endLoc.lng };

  return latLngPath;
}

function runAStar(grid, startX, startY, endX, endY) {
  const startNode = { x: startX, y: startY, g: 0, h: manhattan(startX, startY, endX, endY), f: 0, parent: null };
  startNode.f = startNode.g + startNode.h;

  const openList = [startNode];
  const closedSet = new Set();

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    const key = `${current.x},${current.y}`;

    if (current.x === endX && current.y === endY) {
      const path = [];
      let temp = current;
      while (temp !== null) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path.reverse();
    }

    closedSet.add(key);

    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    for (const [dx, dy] of dirs) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) continue;
      if (grid[ny][nx] === 1) continue;

      const neighborKey = `${nx},${ny}`;
      if (closedSet.has(neighborKey)) continue;

      const isDiagonal = dx !== 0 && dy !== 0;
      const moveCost = isDiagonal ? 1.414 : 1.0;
      const gScore = current.g + moveCost;

      let neighbor = openList.find(n => n.x === nx && n.y === ny);

      if (!neighbor) {
        neighbor = {
          x: nx,
          y: ny,
          g: gScore,
          h: manhattan(nx, ny, endX, endY),
          f: 0,
          parent: current
        };
        neighbor.f = neighbor.g + neighbor.h;
        openList.push(neighbor);
      } else if (gScore < neighbor.g) {
        neighbor.g = gScore;
        neighbor.f = gScore + neighbor.h;
        neighbor.parent = current;
      }
    }
  }

  return null;
}

function manhattan(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
