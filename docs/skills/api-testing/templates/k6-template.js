import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiCallDuration = new Trend('api_call_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 50 },    // Stay at 50 users for 2 minutes
    { duration: '30s', target: 100 },  // Spike to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.05'],                  // Error rate under 5%
    errors: ['rate<0.1'],                            // Custom error rate under 10%
    login_duration: ['p(95)<1000'],                  // Login under 1s
    api_call_duration: ['p(95)<300'],                // API calls under 300ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Test data
const users = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
];

export default function () {
  // Pick random user
  const user = users[Math.floor(Math.random() * users.length)];
  let authToken;

  group('Authentication', () => {
    const loginStart = Date.now();
    
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'Login' },
      }
    );

    const loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'token received': (r) => r.json('token') !== undefined,
      'response time OK': (r) => r.timings.duration < 1000,
    });

    if (!loginSuccess) {
      errorRate.add(1);
      console.error(`Login failed: ${loginRes.status} ${loginRes.body}`);
      return;
    }

    loginDuration.add(Date.now() - loginStart);
    authToken = loginRes.json('token');
  });

  group('Read Operations', () => {
    // Get list of resources
    const listStart = Date.now();
    const listRes = http.get(`${BASE_URL}/api/users?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'ListUsers' },
    });

    check(listRes, {
      'list status is 200': (r) => r.status === 200,
      'list has data': (r) => r.json('data') !== undefined,
      'pagination present': (r) => r.json('pagination') !== undefined,
    }) || errorRate.add(1);

    apiCallDuration.add(Date.now() - listStart);

    sleep(0.5);

    // Get single resource
    const detailRes = http.get(`${BASE_URL}/api/users/123`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { name: 'GetUser' },
    });

    check(detailRes, {
      'detail status is 200 or 404': (r) => [200, 404].includes(r.status),
    }) || errorRate.add(1);
  });

  group('Write Operations', () => {
    // Create resource
    const createRes = http.post(
      `${BASE_URL}/api/posts`,
      JSON.stringify({
        title: `Load Test Post ${Date.now()}`,
        content: 'This is a test post created during load testing.',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        tags: { name: 'CreatePost' },
      }
    );

    const createSuccess = check(createRes, {
      'create status is 201': (r) => r.status === 201,
      'created resource has id': (r) => r.json('id') !== undefined,
    });

    if (!createSuccess) {
      errorRate.add(1);
    }

    const resourceId = createRes.json('id');

    sleep(0.5);

    // Update resource
    if (resourceId) {
      const updateRes = http.put(
        `${BASE_URL}/api/posts/${resourceId}`,
        JSON.stringify({
          title: 'Updated Title',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          tags: { name: 'UpdatePost' },
        }
      );

      check(updateRes, {
        'update status is 200': (r) => r.status === 200,
      }) || errorRate.add(1);
    }
  });

  // Random think time between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'load-test-report.html': htmlReport(data),
    stdout: JSON.stringify(data, null, 2),
  };
}
