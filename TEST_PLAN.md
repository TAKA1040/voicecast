# VoiceCast Authentication Test Plan

## Current Deployment
**URL**: https://voicecast-p0gg0rn0x-takas-projects-ebc9ff02.vercel.app

## Test Scenarios

### 1. Cross-Domain Token Test (Main Issue)
**Scenario**: User has auth tokens for old domain (`voicecast-9g0nj43ib`) but accessing new domain
- **Expected**: System should detect existing session and redirect to admin
- **Test URL**: https://voicecast-p0gg0rn0x-takas-projects-ebc9ff02.vercel.app
- **Look for**: Console logs showing "HomePage: User authenticated" and immediate redirect

### 2. Auth Code Callback Test
**Scenario**: OAuth redirects with auth code to homepage instead of callback
- **Test URL**: https://voicecast-p0gg0rn0x-takas-projects-ebc9ff02.vercel.app/?code=test123
- **Expected**: Should redirect to `/auth/callback?code=test123`
- **Look for**: Console logs showing "Found auth code on homepage, redirecting to callback..."

### 3. Direct Admin Access Test
**Scenario**: Direct admin URL access with valid session
- **Test URL**: https://voicecast-p0gg0rn0x-takas-projects-ebc9ff02.vercel.app/admin
- **Expected**: Should allow access if authenticated, or redirect to login
- **Look for**: Middleware logs showing session validation

### 4. Login Flow Test
**Scenario**: Fresh login from login page
- **Test URL**: https://voicecast-p0gg0rn0x-takas-projects-ebc9ff02.vercel.app/login
- **Expected**: Should use dynamic redirect URL (not hardcoded)
- **Look for**: Console logs showing correct redirect URL

## Debug Console Commands

Open browser console and run:

```javascript
// Check current session
const supabase = window.supabase || supabaseClient;
supabase.auth.getSession().then(({data, error}) => {
  console.log('Current session:', data.session ? 'present' : 'none');
  console.log('User:', data.session?.user?.email);
  console.log('Expires:', data.session?.expires_at);
});

// Check cookies
console.log('Auth cookies:', document.cookie.split(';').filter(c => c.includes('auth-token')));
```

## Expected Fixes

1. ✅ **Dynamic Redirect URLs**: No more hardcoded Vercel URLs
2. ✅ **Cross-Domain Cookies**: Enhanced cookie options for .vercel.app domain
3. ✅ **Session Validation**: Comprehensive logging and error handling
4. ✅ **Immediate Redirects**: No unnecessary delays for authenticated users
5. ✅ **Middleware Logging**: Detailed auth state logging for debugging

## Success Criteria

- [ ] User with existing auth tokens gets redirected to admin screen
- [ ] Auth code on homepage gets processed correctly
- [ ] No 500 errors on admin page access
- [ ] Console shows detailed auth state logs
- [ ] Audio autoplay errors resolved