# SMK Rooms - Full API Test Suite (Updated)
$BASE = "http://localhost:5000/api"
$PASS = 0
$FAIL = 0
$ERRORS = @()

function Test-API {
    param($Label, $Method, $Url, $Body, $Token)
    try {
        $headers = @{}
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        
        $params = @{
            Method      = $Method
            Uri         = $Url
            Headers     = $headers
            ErrorAction = "Stop"
        }
        if ($Body) {
            $params["ContentType"] = "application/json"
            $params["Body"] = ($Body | ConvertTo-Json -Depth 5)
        }
        
        $res = Invoke-RestMethod @params
        
        if ($res.success -eq $true) {
            $script:PASS++
            Write-Host "  PASS  $Label" -ForegroundColor Green
            return $res.data
        } else {
            $script:FAIL++
            $script:ERRORS += "FAIL: $Label => success=false"
            Write-Host "  FAIL  $Label (success=false)" -ForegroundColor Red
            return $null
        }
    } catch {
        $script:FAIL++
        $msg = $_.Exception.Message
        $script:ERRORS += "FAIL: $Label => $msg"
        Write-Host "  FAIL  $Label => $msg" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SMK ROOMS - FULL API TEST SUITE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. AUTH
Write-Host "[ 1 ] AUTH TESTS" -ForegroundColor Yellow
$loginData = Test-API "POST /auth/login (valid creds)" POST "$BASE/auth/login" @{email="admin@smkrooms.com";password="admin123"}
$TOKEN = $loginData.accessToken
if (-not $TOKEN) { Write-Host "  ABORT: No token" -ForegroundColor Red; exit 1 }

# 2. LODGES
Write-Host ""
Write-Host "[ 2 ] LODGE TESTS" -ForegroundColor Yellow
$lodges = Test-API "GET /lodges" GET "$BASE/lodges" $null $TOKEN
$LODGE1_ID = $lodges[0].id

# 3. ROOMS & RESERVED STATUS
Write-Host ""
Write-Host "[ 3 ] ROOM & RESERVED STATUS TESTS" -ForegroundColor Yellow
$availRooms = Test-API "GET /rooms/available" GET "$BASE/rooms/available?lodgeId=$LODGE1_ID" $null $TOKEN
$testRoom = $availRooms[0]

# Set room to RESERVED
$reservedRoom = Test-API "PUT /rooms/:id (status=RESERVED)" PUT "$BASE/rooms/$($testRoom.id)" @{status="RESERVED"} $TOKEN
if ($reservedRoom.status -eq "RESERVED") {
    Write-Host "  PASS  Room status updated to RESERVED" -ForegroundColor Green
    $script:PASS++
} else {
    Write-Host "  FAIL  Room status is $($reservedRoom.status)" -ForegroundColor Red
    $script:FAIL++
}

# Verify RESERVED room is returned in getAvailable
$availWithReserved = Test-API "GET /rooms/available (verify RESERVED included)" GET "$BASE/rooms/available?lodgeId=$LODGE1_ID" $null $TOKEN
$foundReserved = $availWithReserved | Where-Object { $_.id -eq $testRoom.id }
if ($foundReserved) {
    Write-Host "  PASS  RESERVED room $($testRoom.roomNumber) appears in getAvailable for check-in" -ForegroundColor Green
    $script:PASS++
} else {
    Write-Host "  FAIL  RESERVED room not found in getAvailable" -ForegroundColor Red
    $script:FAIL++
    $script:ERRORS += "FAIL: RESERVED room missing from getAvailable"
}

# Check dashboard counts RESERVED room
$dashReserved = Test-API "GET /dashboard (check RESERVED count)" GET "$BASE/dashboard?lodgeId=$LODGE1_ID" $null $TOKEN
$resCount = ($dashReserved.roomStatus | Where-Object { $_.status -eq "RESERVED" }).count
if ($resCount -ge 1) {
    Write-Host "  PASS  Dashboard reflects RESERVED room count: $resCount" -ForegroundColor Green
    $script:PASS++
} else {
    Write-Host "  FAIL  Dashboard RESERVED count is $resCount" -ForegroundColor Red
    $script:FAIL++
    $script:ERRORS += "FAIL: Dashboard RESERVED count wrong"
}

# 4. GUEST CHECK-IN TO RESERVED ROOM & CHECKOUT TO CLEANING
Write-Host ""
Write-Host "[ 4 ] CHECK-IN TO RESERVED ROOM & CHECKOUT TO CLEANING" -ForegroundColor Yellow
$today = (Get-Date).ToString("yyyy-MM-dd")
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$now = (Get-Date).ToString("HH:mm")

$guestPayload = @{
    lodgeId             = $LODGE1_ID
    name                = "Reserved Guest Test"
    address             = "456 Test Ave"
    phone               = "9988776655"
    gender              = "MALE"
    age                 = 28
    nationality         = "Indian"
    adults              = 1
    children            = 0
    roomId              = $testRoom.id
    arrivalDate         = $today
    arrivalTime         = $now
    expectedCheckoutDate= $tomorrow
    expectedCheckoutTime= "11:00"
    roomRent            = $testRoom.dailyPrice
    extraCharges        = 0
    discount            = 0
    advanceAmount       = 200
    totalAmount         = $testRoom.dailyPrice
}

$newGuest = Test-API "POST /guests (check-in to RESERVED room)" POST "$BASE/guests" $guestPayload $TOKEN
if ($newGuest) {
    $GUEST_ID = $newGuest.id
    $BOOKING_ID = $newGuest.bookings[0].id

    # Verify room is now OCCUPIED
    $roomOcc = (Invoke-RestMethod -Uri "$BASE/rooms/$($testRoom.id)" -Headers @{Authorization="Bearer $TOKEN"}).data
    if ($roomOcc.status -eq "OCCUPIED") {
        Write-Host "  PASS  RESERVED room successfully changed to OCCUPIED on check-in" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "  FAIL  Room status is $($roomOcc.status)" -ForegroundColor Red
        $script:FAIL++
    }

    # CHECKOUT
    $checkoutPayload = @{
        departureDate       = $today
        departureTime       = $now
        lateCheckoutCharges = 0
        additionalPayment   = 0
    }
    $checkoutRes = Test-API "POST /guests/:bookingId/checkout" POST "$BASE/guests/$BOOKING_ID/checkout" $checkoutPayload $TOKEN
    
    # Verify room is set to CLEANING after checkout!
    $roomCleaning = (Invoke-RestMethod -Uri "$BASE/rooms/$($testRoom.id)" -Headers @{Authorization="Bearer $TOKEN"}).data
    if ($roomCleaning.status -eq "CLEANING") {
        Write-Host "  PASS  Room status set to CLEANING after checkout" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "  FAIL  Room status is $($roomCleaning.status) (expected CLEANING)" -ForegroundColor Red
        $script:FAIL++
        $script:ERRORS += "FAIL: Room status not CLEANING after checkout"
    }

    # Restore room to AVAILABLE for test cleanliness
    Test-API "PUT /rooms/:id (set status back to AVAILABLE)" PUT "$BASE/rooms/$($testRoom.id)" @{status="AVAILABLE"} $TOKEN | Out-Null
    Test-API "DELETE /guests/:id" DELETE "$BASE/guests/$GUEST_ID" $null $TOKEN | Out-Null
}

# 5. REPORTS & DASHBOARD
Write-Host ""
Write-Host "[ 5 ] DASHBOARD & REPORT INTEGRITY" -ForegroundColor Yellow
Test-API "GET /dashboard" GET "$BASE/dashboard" $null $TOKEN | Out-Null
Test-API "GET /reports/daily" GET "$BASE/reports/daily?date=$today" $null $TOKEN | Out-Null
Test-API "GET /reports/revenue" GET "$BASE/reports/revenue?dateFrom=2026-07-01&dateTo=$today" $null $TOKEN | Out-Null

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PASSED: $PASS" -ForegroundColor Green
Write-Host "  FAILED: $FAIL" -ForegroundColor Red
if ($ERRORS.Count -gt 0) {
    $ERRORS | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
} else {
    Write-Host "  ALL TESTS PASSED PERFECTLY!" -ForegroundColor Green
}
Write-Host "============================================" -ForegroundColor Cyan
