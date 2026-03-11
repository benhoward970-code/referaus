#!/usr/bin/env node
// monitor.js - Real-time API performance monitoring with alerts

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const ALERT_THRESHOLD = parseInt(process.env.ALERT_THRESHOLD || '1000'); // ms
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60'); // seconds

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Track metrics over time
const metrics = {
  requests: [],
  errors: [],
  slowRequests: [],
};

async function measureEndpoint(method, endpoint, data = null) {
  const start = performance.now();
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
      ...(data && { data }),
    };
    
    const response = await axios(config);
    const duration = Math.round(performance.now() - start);
    
    return {
      endpoint,
      method,
      status: response.status,
      duration,
      success: true,
      timestamp: new Date().toISOString(),
      size: JSON.stringify(response.data).length,
    };
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    
    return {
      endpoint,
      method,
      status: error.response?.status || 0,
      duration,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

function formatDuration(ms) {
  if (ms < 100) return `${colors.green}${ms}ms${colors.reset}`;
  if (ms < 500) return `${colors.cyan}${ms}ms${colors.reset}`;
  if (ms < ALERT_THRESHOLD) return `${colors.yellow}${ms}ms${colors.reset}`;
  return `${colors.red}${colors.bright}${ms}ms${colors.reset}`;
}

function formatStatus(status, success) {
  if (success && status >= 200 && status < 300) {
    return `${colors.green}${status}${colors.reset}`;
  }
  return `${colors.red}${status}${colors.reset}`;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function printHeader() {
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bright}${colors.blue}🔍 API Performance Monitor${colors.reset}`);
  console.log(`${colors.cyan}Base URL:${colors.reset} ${BASE_URL}`);
  console.log(`${colors.cyan}Alert Threshold:${colors.reset} ${ALERT_THRESHOLD}ms`);
  console.log(`${colors.cyan}Check Interval:${colors.reset} ${CHECK_INTERVAL}s`);
  console.log('═'.repeat(80) + '\n');
}

function printResult(result) {
  const icon = result.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  const status = formatStatus(result.status, result.success);
  const duration = formatDuration(result.duration);
  const size = result.size ? ` [${formatSize(result.size)}]` : '';
  
  console.log(
    `${icon} ${result.method.padEnd(6)} ${result.endpoint.padEnd(40)} ` +
    `${status} ${duration}${size}`
  );
  
  if (result.error) {
    console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
  }
  
  if (result.duration > ALERT_THRESHOLD) {
    console.log(`  ${colors.red}⚠ SLOW REQUEST ALERT (>${ALERT_THRESHOLD}ms)${colors.reset}`);
  }
}

function calculateStats(results) {
  if (results.length === 0) return null;
  
  const durations = results.map(r => r.duration);
  const successCount = results.filter(r => r.success).length;
  
  return {
    count: results.length,
    successRate: ((successCount / results.length) * 100).toFixed(1),
    avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    p95Duration: percentile(durations, 0.95),
    p99Duration: percentile(durations, 0.99),
  };
}

function percentile(arr, p) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[index];
}

function printSummary() {
  const recentResults = metrics.requests.slice(-100); // Last 100 requests
  const stats = calculateStats(recentResults);
  
  if (!stats) return;
  
  console.log('\n' + '─'.repeat(80));
  console.log(`${colors.bright}📊 Statistics (last ${recentResults.length} requests)${colors.reset}`);
  console.log('─'.repeat(80));
  
  console.log(`${colors.cyan}Success Rate:${colors.reset}     ${stats.successRate}%`);
  console.log(`${colors.cyan}Avg Response:${colors.reset}     ${formatDuration(stats.avgDuration)}`);
  console.log(`${colors.cyan}Min Response:${colors.reset}     ${formatDuration(stats.minDuration)}`);
  console.log(`${colors.cyan}Max Response:${colors.reset}     ${formatDuration(stats.maxDuration)}`);
  console.log(`${colors.cyan}P95 Response:${colors.reset}     ${formatDuration(stats.p95Duration)}`);
  console.log(`${colors.cyan}P99 Response:${colors.reset}     ${formatDuration(stats.p99Duration)}`);
  
  const recentErrors = metrics.errors.slice(-10);
  if (recentErrors.length > 0) {
    console.log(`\n${colors.red}Recent Errors (${recentErrors.length}):${colors.reset}`);
    recentErrors.forEach(err => {
      console.log(`  ${err.timestamp} - ${err.method} ${err.endpoint}: ${err.error}`);
    });
  }
  
  const recentSlowRequests = metrics.slowRequests.slice(-10);
  if (recentSlowRequests.length > 0) {
    console.log(`\n${colors.yellow}Recent Slow Requests (${recentSlowRequests.length}):${colors.reset}`);
    recentSlowRequests.forEach(req => {
      console.log(`  ${req.timestamp} - ${req.method} ${req.endpoint}: ${req.duration}ms`);
    });
  }
  
  console.log('─'.repeat(80) + '\n');
}

async function runChecks() {
  console.log(`\n${colors.bright}[${new Date().toISOString()}] Running checks...${colors.reset}`);
  
  const tests = [
    { method: 'GET', endpoint: '/health' },
    { method: 'GET', endpoint: '/users?page=1&limit=20' },
    { method: 'GET', endpoint: '/users?page=1&limit=100' },
    { method: 'GET', endpoint: '/users?status=active' },
    { method: 'GET', endpoint: '/products?page=1&limit=20' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await measureEndpoint(test.method, test.endpoint, test.data);
    results.push(result);
    metrics.requests.push(result);
    
    printResult(result);
    
    if (!result.success) {
      metrics.errors.push(result);
    }
    
    if (result.duration > ALERT_THRESHOLD) {
      metrics.slowRequests.push(result);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Keep only last 1000 requests in memory
  if (metrics.requests.length > 1000) {
    metrics.requests = metrics.requests.slice(-1000);
  }
  if (metrics.errors.length > 100) {
    metrics.errors = metrics.errors.slice(-100);
  }
  if (metrics.slowRequests.length > 100) {
    metrics.slowRequests = metrics.slowRequests.slice(-100);
  }
  
  printSummary();
}

async function main() {
  printHeader();
  
  // Run immediately
  await runChecks();
  
  // Then run on interval
  setInterval(async () => {
    await runChecks();
  }, CHECK_INTERVAL * 1000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n' + '═'.repeat(80));
  console.log(`${colors.bright}Shutting down monitor...${colors.reset}`);
  printSummary();
  console.log('═'.repeat(80) + '\n');
  process.exit(0);
});

main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
