# CSE Portfolio (Phase 1)

Free multi-user CSE share tracker — **Login + cloud portfolio**.

## Stack (all free)

- Frontend: static HTML/JS (this folder)
- Auth + DB: Supabase
- Hosting: Vercel free URL

## 1. Add your anon key

Edit `js/config.js`:

```js
supabaseAnonKey: 'eyJhbGciOi...'  // paste anon public key
```

URL is already set to your project:
`https://gbwfrcnrhfhfiosehdtj.supabase.co`

## 2. Push to GitHub

1. Create a new repo on GitHub (e.g. `cse-portfolio`) — **public or private**
2. Upload **all files** in this folder to the repo root

Or with Git:

```bash
git init
git add .
git commit -m "CSE Portfolio Phase 1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cse-portfolio.git
git push -u origin main
```

## 3. Deploy on Vercel (free)

1. vercel.com → Add New Project
2. Import the GitHub repo
3. Framework: **Other** (static)
4. Deploy

You get a URL like: `https://cse-portfolio.vercel.app`

## 4. Supabase Auth (testing)

Authentication → Providers → Email  
For easy testing you can turn **off** “Confirm email”.

## 5. Test

1. Open the Vercel URL  
2. Sign up with email + password  
3. Add shares — they save to your account  

## Next phases

- Live CSE price proxy on Vercel
- Dividend calendar
- News tab
- Paid plan (Rs 2,000) via PayHere
