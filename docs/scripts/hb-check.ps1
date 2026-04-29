$svcHeaders = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGFwbm5seGZoeHNxcHFjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NDYyOCwiZXhwIjoyMDg3NjIwNjI4fQ.iBMN0RjFjP_woNhZPtgwsaHyAWscGF2Jc3BVOkG78cE"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGFwbm5seGZoeHNxcHFjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NDYyOCwiZXhwIjoyMDg3NjIwNjI4fQ.iBMN0RjFjP_woNhZPtgwsaHyAWscGF2Jc3BVOkG78cE"
}
$r = Invoke-RestMethod -Uri "https://zfhapnnlxfhxsqpqcuje.supabase.co/rest/v1/task_updates?order=created_at.desc&limit=10" -Headers $svcHeaders
$r | ConvertTo-Json -Depth 5
