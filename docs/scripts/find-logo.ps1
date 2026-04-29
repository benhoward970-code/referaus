Get-ChildItem "C:\Users\Ben\Desktop\ReferAus-v2\public" -Recurse -ErrorAction SilentlyContinue | Select-Object Name, FullName, Length
Get-ChildItem "C:\Users\Ben\Desktop\ReferAus-v2\src" -Recurse -Include "*.svg","*.png","*.ico","logo*" -ErrorAction SilentlyContinue | Select-Object Name, FullName, Length
