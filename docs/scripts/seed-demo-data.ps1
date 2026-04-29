$baseUrl = "http://localhost:3002"

function Post($endpoint, $body) {
    try {
        $json = $body | ConvertTo-Json -Depth 5
        Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method POST -Body $json -ContentType "application/json" -ErrorAction Stop
        Write-Host "  OK: $endpoint"
    } catch {
        Write-Host "  ERR: $endpoint - $($_.Exception.Message)"
    }
}

Write-Host "=== Seeding Demo Data for Refer ==="

# --- 11 More Participants (we have 9, want 20) ---
Write-Host "`nAdding participants..."

$participants = @(
    @{ firstName="James"; lastName="Taylor"; email="j.taylor@example.com"; phone="0411000010"; ndisNumber="430100010"; address="55 George St, Sydney NSW 2000"; status="Active"; planStartDate="2025-07-01"; planEndDate="2026-06-30"; coreBudget=42000; coreSpent=18900; capacityBudget=15000; capacitySpent=6000; emergencyContactName="Lisa Taylor"; emergencyContactPhone="0411000099" },
    @{ firstName="Aisha"; lastName="Abdullah"; email="a.abdullah@example.com"; phone="0411000011"; ndisNumber="430100011"; address="12 Adelaide St, Brisbane QLD 4000"; status="Active"; planStartDate="2025-09-01"; planEndDate="2026-08-31"; coreBudget=55000; coreSpent=22000; capacityBudget=18000; capacitySpent=9000; emergencyContactName="Hassan Abdullah"; emergencyContactPhone="0411000098" },
    @{ firstName="Thomas"; lastName="Harris"; email="t.harris@example.com"; phone="0411000012"; ndisNumber="430100012"; address="88 Pitt St, Sydney NSW 2000"; status="Active"; planStartDate="2025-04-01"; planEndDate="2026-03-31"; coreBudget=72000; coreSpent=65000; capacityBudget=10000; capacitySpent=8500; emergencyContactName="Helen Harris"; emergencyContactPhone="0411000097" },
    @{ firstName="Mei"; lastName="Zhang"; email="m.zhang@example.com"; phone="0411000013"; ndisNumber="430100013"; address="33 Swanston St, Melbourne VIC 3000"; status="Active"; planStartDate="2026-01-01"; planEndDate="2026-12-31"; coreBudget=31000; coreSpent=5000; capacityBudget=12000; capacitySpent=2000; emergencyContactName="Wei Zhang"; emergencyContactPhone="0411000096" },
    @{ firstName="Liam"; lastName="O'Brien"; email="l.obrien@example.com"; phone="0411000014"; ndisNumber="430100014"; address="7 Hay St, Perth WA 6000"; status="Active"; planStartDate="2025-11-01"; planEndDate="2026-10-31"; coreBudget=48000; coreSpent=42000; capacityBudget=8000; capacitySpent=6500; emergencyContactName="Sean O'Brien"; emergencyContactPhone="0411000095" },
    @{ firstName="Fatima"; lastName="Al-Rashid"; email="f.alrashid@example.com"; phone="0411000015"; ndisNumber="430100015"; address="100 King William St, Adelaide SA 5000"; status="Active"; planStartDate="2026-02-01"; planEndDate="2027-01-31"; coreBudget=38000; coreSpent=3800; capacityBudget=20000; capacitySpent=1000; emergencyContactName="Ahmed Al-Rashid"; emergencyContactPhone="0411000094" },
    @{ firstName="Noah"; lastName="Thompson"; email="n.thompson@example.com"; phone="0411000016"; ndisNumber="430100016"; address="22 Murray St, Hobart TAS 7000"; status="Active"; planStartDate="2025-08-01"; planEndDate="2026-07-31"; coreBudget=29000; coreSpent=14500; capacityBudget=7000; capacitySpent=3500; emergencyContactName="Claire Thompson"; emergencyContactPhone="0411000093" },
    @{ firstName="Isabella"; lastName="Martin"; email="i.martin@example.com"; phone="0411000017"; ndisNumber="430100017"; address="45 Smith St, Darwin NT 0800"; status="Active"; planStartDate="2025-06-01"; planEndDate="2026-05-31"; coreBudget=61000; coreSpent=52000; capacityBudget=14000; capacitySpent=11000; emergencyContactName="Paul Martin"; emergencyContactPhone="0411000092" },
    @{ firstName="Ethan"; lastName="Kumar"; email="e.kumar@example.com"; phone="0411000018"; ndisNumber="430100018"; address="15 London Circuit, Canberra ACT 2600"; status="Active"; planStartDate="2026-01-01"; planEndDate="2026-12-31"; coreBudget=44000; coreSpent=11000; capacityBudget=16000; capacitySpent=4000; emergencyContactName="Priya Kumar"; emergencyContactPhone="0411000091" },
    @{ firstName="Charlotte"; lastName="Davis"; email="c.davis@example.com"; phone="0411000019"; ndisNumber="430100019"; address="77 Queen St, Melbourne VIC 3000"; status="Active"; planStartDate="2025-10-01"; planEndDate="2026-09-30"; coreBudget=35000; coreSpent=31000; capacityBudget=9000; capacitySpent=7800; emergencyContactName="Robert Davis"; emergencyContactPhone="0411000090" },
    @{ firstName="Oliver"; lastName="Wright"; email="o.wright@example.com"; phone="0411000020"; ndisNumber="430100020"; address="3 Elizabeth St, Sydney NSW 2000"; status="Inactive"; planStartDate="2025-01-01"; planEndDate="2026-01-31"; coreBudget=50000; coreSpent=49800; capacityBudget=12000; capacitySpent=11900; emergencyContactName="Sandra Wright"; emergencyContactPhone="0411000089" }
)

foreach ($p in $participants) {
    Post "/api/participants" $p
}

# --- 4 More Staff ---
Write-Host "`nAdding staff..."

$staff = @(
    @{ name="Priya Sharma"; email="p.sharma@Refer.com"; phone="0412500001"; role="Support Worker"; availability="available"; skills=@("Personal Care","Community Access","Mental Health") },
    @{ name="Jack Morrison"; email="j.morrison@Refer.com"; phone="0412500002"; role="Support Worker"; availability="available"; skills=@("Transport","Daily Activities","Domestic Assistance") },
    @{ name="Yuki Tanaka"; email="y.tanaka@Refer.com"; phone="0412500003"; role="Therapist"; availability="busy"; skills=@("OT","Sensory Processing","Autism Support") },
    @{ name="Brendan Walsh"; email="b.walsh@Refer.com"; phone="0412500004"; role="Coordinator"; availability="available"; skills=@("Plan Management","Crisis Support","Coordination of Supports") }
)

foreach ($s in $staff) {
    Post "/api/staff" $s
}

# --- Shifts ---
Write-Host "`nAdding shifts..."

$today = Get-Date
$staffIds = @(1,2,3,4,5,6,7,8)
$participantIds = @(1,2,3,4,5,6,7,8,9)
$shiftTypes = @("Personal Care","Community Access","Transport","Domestic Assistance","Therapy","Social Support")

# Generate 60 past shifts over last 90 days
for ($i = 1; $i -le 60; $i++) {
    $daysAgo = Get-Random -Minimum 1 -Maximum 90
    $shiftDate = $today.AddDays(-$daysAgo).ToString("yyyy-MM-dd")
    $hour = Get-Random -Minimum 8 -Maximum 15
    $duration = Get-Random -Minimum 2 -Maximum 5
    $startTime = "{0:D2}:00" -f $hour
    $endTime = "{0:D2}:00" -f ($hour + $duration)
    $participantId = $participantIds | Get-Random
    $staffId = $staffIds | Get-Random
    $type = $shiftTypes | Get-Random
    $statuses = @("completed","completed","completed","missed")
    $status = $statuses | Get-Random
    
    $shift = @{
        participantId = $participantId
        staffId = $staffId
        date = $shiftDate
        startTime = $startTime
        endTime = $endTime
        type = $type
        status = $status
        notes = "Routine $type session"
    }
    Post "/api/shifts" $shift
}

# Generate 20 upcoming shifts
for ($i = 1; $i -le 20; $i++) {
    $daysAhead = Get-Random -Minimum 1 -Maximum 14
    $shiftDate = $today.AddDays($daysAhead).ToString("yyyy-MM-dd")
    $hour = Get-Random -Minimum 8 -Maximum 15
    $duration = Get-Random -Minimum 2 -Maximum 4
    $startTime = "{0:D2}:00" -f $hour
    $endTime = "{0:D2}:00" -f ($hour + $duration)
    $participantId = $participantIds | Get-Random
    $type = $shiftTypes | Get-Random
    
    $shift = @{
        participantId = $participantId
        staffId = $null
        date = $shiftDate
        startTime = $startTime
        endTime = $endTime
        type = $type
        status = "scheduled"
        notes = "Upcoming $type session"
    }
    Post "/api/shifts" $shift
}

# --- Progress Notes ---
Write-Host "`nAdding progress notes..."

$noteTemplates = @(
    "Participant engaged well with today's {0} session. Goals discussed and progress noted. Participant appeared calm and motivated.",
    "Completed {0} support. Participant showed improved confidence in daily tasks. No behavioural concerns noted.",
    "{0} session completed as planned. Participant expressed satisfaction with activities. Family contact made post-session.",
    "Supported participant with {0}. Minor challenges with transitions but managed effectively. Recommend continuation of current plan.",
    "Excellent progress during {0} support. Participant achieved all session goals. Communication improving noticeably.",
    "{0} completed. Participant in good spirits. Community access activities included local shopping and park visit.",
    "Routine {0} provided. Participant cooperative and engaged. Environmental safety check completed - all clear."
)

for ($i = 1; $i -le 40; $i++) {
    $daysAgo = Get-Random -Minimum 1 -Maximum 60
    $noteDate = $today.AddDays(-$daysAgo).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $participantId = $participantIds | Get-Random
    $staffId = $staffIds | Get-Random
    $type = $shiftTypes | Get-Random
    $template = $noteTemplates | Get-Random
    $content = $template -f $type
    $qualities = @("compliant","compliant","compliant","needs_review")
    $quality = $qualities | Get-Random
    
    $note = @{
        participantId = $participantId
        staffId = $staffId
        date = $noteDate
        content = $content
        type = "Progress Note"
        qualityScore = (Get-Random -Minimum 70 -Maximum 100)
        status = $quality
    }
    Post "/api/notes" $note
}

Write-Host "`nDone! Demo data seeded successfully."
Write-Host "Total: 20 participants, 8 staff, 80 shifts, 40 progress notes"
openclaw system event --text "Done: Demo data seeded - 20 participants, 8 staff, 80 shifts loaded into Refer" --mode now
