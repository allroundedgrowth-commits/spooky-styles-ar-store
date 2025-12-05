// Test Analytics System
async function testAnalytics() {
  console.log('🎃 Testing Analytics System\n');
  
  const baseUrl = 'http://localhost:3000/api';
  const sessionId = `test_${Date.now()}`;
  
  try {
    // Test 1: Track page view
    console.log('1️⃣ Testing page view tracking...');
    const pageViewResponse = await fetch(`${baseUrl}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        pagePath: '/products',
        referrer: 'https://google.com'
      })
    });
    
    if (pageViewResponse.ok) {
      console.log('✅ Page view tracked successfully!');
    } else {
      console.log('❌ Page view tracking failed:', pageViewResponse.status);
    }

    // Test 2: Track event
    console.log('\n2️⃣ Testing event tracking...');
    const eventResponse = await fetch(`${baseUrl}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventName: 'product_view',
        eventCategory: 'ecommerce',
        eventData: {
          productId: 'test-123',
          productName: 'Test Wig'
        }
      })
    });
    
    if (eventResponse.ok) {
      console.log('✅ Event tracked successfully!');
    } else {
      console.log('❌ Event tracking failed:', eventResponse.status);
    }

    // Test 3: Login as admin
    console.log('\n3️⃣ Testing admin dashboard access...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spookystyles.com',
        password: 'Admin123!'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Admin login successful!');

    // Test 4: Get dashboard stats
    console.log('\n4️⃣ Testing dashboard stats...');
    const dashboardResponse = await fetch(`${baseUrl}/analytics/dashboard?days=7`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard stats retrieved!');
      console.log('   Page Views:', dashboardData.data.pageViews);
      console.log('   Revenue: $', dashboardData.data.revenue);
      console.log('   Conversions:', dashboardData.data.conversions);
    } else {
      console.log('❌ Dashboard stats failed:', dashboardResponse.status);
    }

    // Test 5: Get error rate
    console.log('\n5️⃣ Testing error rate...');
    const errorRateResponse = await fetch(`${baseUrl}/analytics/error-rate?hours=24`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (errorRateResponse.ok) {
      const errorRateData = await errorRateResponse.json();
      console.log('✅ Error rate retrieved!');
      console.log('   Error Rate:', errorRateData.data.errorRate.toFixed(2) + '%');
    } else {
      console.log('❌ Error rate failed:', errorRateResponse.status);
    }

    // Test 6: Get conversion funnel
    console.log('\n6️⃣ Testing conversion funnel...');
    const funnelResponse = await fetch(`${baseUrl}/analytics/funnel?days=7`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (funnelResponse.ok) {
      const funnelData = await funnelResponse.json();
      console.log('✅ Conversion funnel retrieved!');
      console.log('   Funnel:', funnelData.data);
    } else {
      console.log('❌ Conversion funnel failed:', funnelResponse.status);
    }

    console.log('\n✅ All Analytics Tests Complete!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Visit: http://localhost:3001/admin/analytics');
    console.log('   2. Login with admin credentials');
    console.log('   3. View your analytics dashboard!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnalytics();
