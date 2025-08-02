import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🚫 Callback route accessed - redirecting to admin')
  
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/admin`)
}