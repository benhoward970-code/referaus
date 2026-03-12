// Fix 1: Create a server-side API route that fetches providers using service key
// This bypasses the broken anon key issue entirely

const fs = require('fs');
const path = require('path');

const apiDir = path.join('C:\\Users\\Ben\\Desktop\\referaus\\src\\app\\api\\providers-public');
fs.mkdirSync(apiDir, { recursive: true });

// Create a public API endpoint that uses service role key server-side
const routeCode = `import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // cache for 5 min

export async function GET() {
  try {
    const res = await fetch(
      \`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/providers?select=*&order=rating.desc\`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: \`Bearer \${process.env.SUPABASE_SERVICE_ROLE_KEY}\`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      // Fallback: return empty so client uses hardcoded
      return NextResponse.json([]);
    }

    const providers = await res.json();
    return NextResponse.json(providers);
  } catch {
    return NextResponse.json([]);
  }
}
`;

fs.writeFileSync(path.join(apiDir, 'route.ts'), routeCode);
console.log('Created /api/providers-public route');

// Fix 2: Update the providers page to use the new API route instead of direct Supabase
const libDir = path.join('C:\\Users\\Ben\\Desktop\\referaus\\src\\lib');
const supabasePath = path.join(libDir, 'supabase.ts');

if (fs.existsSync(supabasePath)) {
  let content = fs.readFileSync(supabasePath, 'utf8');
  console.log('Current supabase.ts getAllProviders exists:', content.includes('getAllProviders'));
  
  // Check if there's already a function we can modify
  if (content.includes('getAllProviders')) {
    // Replace the function to use our API route instead
    const newFn = `
export async function getAllProviders() {
  try {
    // Use server-side API route (bypasses broken anon key)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://referaus.com');
    const res = await fetch(\`\${baseUrl}/api/providers-public\`, { 
      next: { revalidate: 300 } 
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}`;
    
    // Find and replace the existing getAllProviders function
    content = content.replace(
      /export\s+async\s+function\s+getAllProviders\s*\([^)]*\)\s*\{[\s\S]*?(?=\nexport|\n\/\/|\nconst|\nlet|\nvar|\ntype|\ninterface|$)/,
      newFn + '\n'
    );
    
    fs.writeFileSync(supabasePath, content);
    console.log('Updated getAllProviders to use API route');
  }
} else {
  console.log('supabase.ts not found at', supabasePath);
}

console.log('Done!');
