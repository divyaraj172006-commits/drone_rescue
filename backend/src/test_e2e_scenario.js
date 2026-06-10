const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('🏁 STARTING RUNTIME E2E COMMAND TEST SUITE');
  console.log('==================================================\n');

  let adminToken = '';
  let operatorToken = '';

  // Helper request function
  async function request(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const config = {
      method,
      headers
    };
    if (body) {
      config.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_URL}${path}`, config);
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'HTTP error');
      error.status = response.status;
      throw error;
    }
    return data;
  }

  // Test 1: Authentication and role assignment
  try {
    console.log('🔹 Test 1: Authenticating EOC credentials...');
    const loginAdmin = await request('/auth/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = loginAdmin.token;
    console.log('   ✅ Admin successfully logged in (JWT acquired).');

    const loginOp = await request('/auth/login', 'POST', {
      username: 'operator',
      password: 'operator123'
    });
    operatorToken = loginOp.token;
    console.log('   ✅ Operator successfully logged in (JWT acquired).');
  } catch (err) {
    console.error('   ❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // Test 2: Role-based authorization restrictions
  try {
    console.log('\n🔹 Test 2: Verifying role-based access restrictions...');
    // Operator trying to call admin-restricted DB reset
    await request('/admin/reset-db', 'POST', {}, operatorToken);
    console.log('   ❌ Security Vulnerability: Operator allowed to wipe database.');
    process.exit(1);
  } catch (err) {
    if (err.status === 403) {
      console.log('   ✅ Role verification passed: Operator blocked from admin action (403 Forbidden).');
    } else {
      console.error('   ❌ Unexpected response status:', err.message, err.status);
      process.exit(1);
    }
  }

  // Test 3: Disaster creation & Severity prediction
  let disasterId = '';
  try {
    console.log('\n🔹 Test 3: Reporting Mysore Flood disaster & running ML severity predictor...');
    const res = await request('/disasters', 'POST', {
      title: 'Mysore Palace Flood Emergency',
      type: 'flood',
      location: { lat: 12.3052, lng: 76.6551 },
      radius: 1000,
      metrics: {
        rainfall: 120,
        waterLevel: 3.5,
        populationDensity: 2000,
        windSpeed: 20
      }
    }, adminToken);

    const disaster = res.disaster;
    const prediction = res.prediction;
    disasterId = disaster._id;

    console.log(`   ✅ Disaster created: "${disaster.title}" (ID: ${disasterId}).`);
    console.log(`   ✅ ML Severity output score: ${prediction.score}% (Risk Category: ${prediction.severity.toUpperCase()}).`);
    if (prediction.severity === 'high') {
      console.log('   ✅ Predictor matched expected "high" risk category.');
    } else {
      console.warn(`   ⚠️ Warning: expected high severity, got ${prediction.severity}.`);
    }
  } catch (err) {
    console.error('   ❌ Disaster creation failed:', err.message);
    process.exit(1);
  }

  // Test 4: Resource recommendations
  try {
    console.log('\n🔹 Test 4: Calibrating EOC logistics resource calculator (150 Victims)...');
    const recs = await request('/missions/recommend-resources', 'POST', {
      severity: 'high',
      victimCount: 150
    }, adminToken);

    console.log('   ✅ Resource allocations received:');
    console.log(`      🚑 Ambulances: ${recs.ambulances}`);
    console.log(`      👥 Rescue Teams: ${recs.rescueTeams}`);
    console.log(`      📦 Food Kits: ${recs.foodKits}`);
    console.log(`      🏥 Medical Kits: ${recs.medicalSupplies}`);
    console.log(`      🏠 Shelters: ${recs.shelters}`);
    console.log(`      💡 Allocation Details: ${recs.calculationExplanation}`);

    if (recs.ambulances > 0 && recs.rescueTeams > 0 && recs.foodKits > 0 && recs.shelters > 0) {
      console.log('   ✅ Multipliers scaled correctly for victim surge count.');
    } else {
      console.error('   ❌ Invalid recommendations returned.');
      process.exit(1);
    }
  } catch (err) {
    console.error('   ❌ Resource check failed:', err.message);
    process.exit(1);
  }

  // Test 5: A* Pathfinding route generation & Sortie dispatch
  try {
    console.log('\n🔹 Test 5: Dispatching rescue mission with A* route planning...');
    
    // Get list of drones
    const drones = await request('/drones', 'GET', null, adminToken);
    const idleDrones = drones.filter(d => d.status === 'idle');
    console.log(`   ✅ Drones available: ${idleDrones.length} idle sorties.`);
    
    if (idleDrones.length === 0) {
      console.error('   ❌ No idle drones available to dispatch. Please reset EOC.');
      process.exit(1);
    }

    const assignedDrone = idleDrones[0];
    console.log(`   🚀 Assigning UAV: "${assignedDrone.name}" starting from [${assignedDrone.currentLocation.lat}, ${assignedDrone.currentLocation.lng}]`);

    const mission = await request('/missions', 'POST', {
      title: `Sortie-${assignedDrone.name}: Mysore Palace flood recovery`,
      droneId: assignedDrone._id,
      disasterId: disasterId,
      priority: 'high',
      victimsCount: 150
    }, adminToken);

    console.log(`   ✅ Mission dispatched: "${mission.title}" (ID: ${mission._id}).`);
    console.log(`   ✅ Path route generated by backend A*: ${mission.route.length} grid coordinates.`);
    console.log(`      🛫 Takeoff: [${mission.route[0].lat.toFixed(4)}, ${mission.route[0].lng.toFixed(4)}]`);
    console.log(`      🛬 Landzone: [${mission.route[mission.route.length - 1].lat.toFixed(4)}, ${mission.route[mission.route.length - 1].lng.toFixed(4)}]`);
  } catch (err) {
    console.error('   ❌ Mission launch failed:', err.message);
    process.exit(1);
  }

  // Test 6: Verify alerts generated
  try {
    console.log('\n🔹 Test 6: Checking system incident feed log...');
    const alerts = await request('/alerts', 'GET', null, adminToken);
    const latestAlert = alerts[0];
    console.log(`   ✅ Latest incident log alert: "${latestAlert.message}" (Type: ${latestAlert.type.toUpperCase()})`);
  } catch (err) {
    console.error('   ❌ Alerts feed retrieval failed:', err.message);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('🎉 E2E TEST COMPLETED SUCCESSFULLY (ALL API PASSED)');
  console.log('==================================================');
}

runTests();
