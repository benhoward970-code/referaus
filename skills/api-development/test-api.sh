#!/bin/bash
# test-api.sh - Quick API testing script with comprehensive test coverage

BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
TOKEN="${API_TOKEN:-}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Stats
TOTAL=0
PASSED=0
FAILED=0

auth_header() {
  if [ -n "$TOKEN" ]; then
    echo "-H \"Authorization: Bearer $TOKEN\""
  fi
}

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local description=$5
  
  TOTAL=$((TOTAL + 1))
  
  echo -e "${BLUE}Testing:${NC} $description"
  echo "  $method $endpoint"
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      $(auth_header) \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint" \
      $(auth_header))
  fi
  
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  
  if [ "$status" == "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Status: $status (expected: $expected_status)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} - Status: $status (expected: $expected_status)"
    FAILED=$((FAILED + 1))
  fi
  
  # Pretty print JSON if possible
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
}

# Print header
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     API Test Suite Runner             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo "Started: $(date)"
echo ""

# Health Check Tests
echo -e "${YELLOW}━━━ Health & Status Tests ━━━${NC}"
test_endpoint GET "/health" "" 200 "Health check endpoint"

# User CRUD Tests
echo -e "${YELLOW}━━━ User CRUD Tests ━━━${NC}"

# List users
test_endpoint GET "/users?page=1&limit=5" "" 200 "List users with pagination"

# List with filters
test_endpoint GET "/users?status=active" "" 200 "List active users"

# Create user - valid
EMAIL="test-$(date +%s)@example.com"
test_endpoint POST "/users" "{\"email\":\"$EMAIL\",\"name\":\"Test User\"}" 201 "Create new user"

# Create user - invalid email
test_endpoint POST "/users" '{"email":"invalid-email","name":"Test User"}' 422 "Create user with invalid email (should fail)"

# Create user - missing fields
test_endpoint POST "/users" '{"email":"test@example.com"}' 422 "Create user with missing fields (should fail)"

# Get specific user (requires ID from create response - manual test)
# test_endpoint GET "/users/{id}" "" 200 "Get specific user by ID"

# Get non-existent user
test_endpoint GET "/users/00000000-0000-0000-0000-000000000000" "" 404 "Get non-existent user (should return 404)"

# Update user (requires ID - manual test)
# test_endpoint PATCH "/users/{id}" '{"name":"Updated Name"}' 200 "Update user name"

# Delete user (requires ID - manual test)
# test_endpoint DELETE "/users/{id}" "" 204 "Delete user"

# Validation Tests
echo -e "${YELLOW}━━━ Validation Tests ━━━${NC}"

test_endpoint GET "/users?page=-1" "" 422 "Invalid page number (negative)"
test_endpoint GET "/users?limit=200" "" 422 "Invalid limit (exceeds max)"
test_endpoint GET "/users?status=invalid" "" 422 "Invalid status value"

# Error Handling Tests
echo -e "${YELLOW}━━━ Error Handling Tests ━━━${NC}"

test_endpoint GET "/nonexistent" "" 404 "Non-existent endpoint"
test_endpoint POST "/users" "invalid-json" 400 "Invalid JSON payload"

# Print summary
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Test Summary                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
