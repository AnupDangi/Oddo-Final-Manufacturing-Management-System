import http from 'http';

async function testEndToEndFlow() {
  console.log('🧪 Starting End-to-End Flow Test');
  console.log('='.repeat(50));

  // Test 1: Login to get token
  console.log('\n1️⃣ Testing Authentication...');
  const loginData = JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginResult = await makeRequest(loginOptions, loginData);
  
  if (!loginResult.success) {
    console.log('❌ Login failed:', loginResult.message);
    return;
  }
  
  console.log('✅ Login successful');
  const token = loginResult.data.token;

  // Test 2: Get Finished Goods
  console.log('\n2️⃣ Testing Product Search...');
  const productsOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/products?category=Finished%20Good',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const productsResult = await makeRequest(productsOptions);
  
  if (!productsResult.success) {
    console.log('❌ Products fetch failed:', productsResult.message);
    return;
  }
  
  console.log('✅ Products fetched successfully');
  console.log(`   Found ${productsResult.data.length} finished goods:`);
  productsResult.data.forEach(p => console.log(`   - ${p.name} (${p.sku})`));

  // Test 3: Get BOM for first product
  const firstProduct = productsResult.data[0];
  console.log(`\n3️⃣ Testing BOM Fetch for "${firstProduct.name}"...`);
  
  const bomOptions = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/boms?product=${firstProduct._id}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const bomResult = await makeRequest(bomOptions);
  
  if (!bomResult.success) {
    console.log('❌ BOM fetch failed:', bomResult.message);
    return;
  }
  
  console.log('✅ BOM fetched successfully');
  const bom = bomResult.data[0];
  console.log(`   BOM: ${bom.reference} with ${bom.components.length} components`);

  // Test 4: Create Manufacturing Order
  console.log(`\n4️⃣ Testing Manufacturing Order Creation...`);
  
  const moData = JSON.stringify({
    product_search: firstProduct.name,
    quantity: 2,
    planned_start_date: new Date().toISOString(),
    planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
    priority: 'Normal',
    description: 'Test manufacturing order from automated test'
  });

  const moOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/manufacturing-orders/by-product-search',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(moData)
    }
  };

  const moResult = await makeRequest(moOptions, moData);
  
  if (!moResult.success) {
    console.log('❌ Manufacturing Order creation failed:', moResult.message);
    return;
  }
  
  console.log('✅ Manufacturing Order created successfully!');
  const mo = moResult.data.manufacturing_order;
  console.log(`   MO Reference: ${mo.reference || mo._id}`);
  console.log(`   Product: ${mo.product?.name || 'N/A'}`);
  console.log(`   Quantity: ${mo.quantity}`);
  console.log(`   Components Required: ${mo.components_required?.length || 0}`);
  
  if (mo.components_required && mo.components_required.length > 0) {
    console.log('   Component breakdown:');
    mo.components_required.forEach(comp => {
      console.log(`   - ${comp.component_product?.name || 'Unknown'}: ${comp.quantity_required} units`);
    });
  }

  // Test 5: Verify the BOM expansion worked
  console.log(`\n5️⃣ Verifying BOM Auto-Population...`);
  const expectedComponents = bom.components.length;
  const actualComponents = mo.components_required?.length || 0;
  
  if (expectedComponents === actualComponents) {
    console.log('✅ BOM components auto-populated correctly!');
    console.log(`   Expected: ${expectedComponents}, Got: ${actualComponents}`);
  } else {
    console.log('❌ BOM component mismatch!');
    console.log(`   Expected: ${expectedComponents}, Got: ${actualComponents}`);
  }

  console.log('\n🎉 End-to-End Flow Test Completed!');
  console.log('='.repeat(50));
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Run the test
testEndToEndFlow().catch(console.error);