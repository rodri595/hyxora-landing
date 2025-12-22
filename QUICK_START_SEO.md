# 🚀 Quick Start: SEO Setup for Hyxora

**For developers who want to get started immediately**

---

## ⚡ 3-Minute Setup

### 1. Update Your Domain (1 min)

Open these 3 files and replace `https://hyxora.com` with your actual domain:

```javascript
// app/layout.jsx (line ~11)
const siteUrl = "https://YOUR-DOMAIN.com";

// app/sitemap.js (line 2)
const baseUrl = "https://YOUR-DOMAIN.com";

// public/robots.txt (line 13)
Sitemap: https://YOUR-DOMAIN.com/sitemap.xml
```

### 2. Create Social Images (2 min)

Quick option - Use Canva:

1. Go to https://www.canva.com/
2. Create 1200x630px design
3. Add your logo + text: "Hyxora - Plataforma DeFi"
4. Download as JPG
5. Save to `/public/og-image.jpg`
6. Resize to 1200x675px for `/public/twitter-card.jpg`

### 3. Generate Favicons (30 sec)

1. Visit https://realfavicongenerator.net/
2. Upload your logo
3. Download the package
4. Extract all files to `/public/` folder

---

## ✅ Verification (1 min)

Run this command:

```bash
# Windows
seo-check.bat

# Mac/Linux
chmod +x seo-check.sh && ./seo-check.sh
```

Build and test:

```bash
pnpm build
pnpm start
```

Visit `http://localhost:3000` and check:

- Page title appears correctly
- View source shows meta tags

---

## 🎯 After Deployment

### 1. Google Search Console (5 min)

1. Go to https://search.google.com/search-console
2. Add property → Enter your domain
3. Choose verification method (HTML tag recommended)
4. Copy verification code
5. Update `app/layout.jsx` line 65:
   ```javascript
   verification: {
     google: "YOUR-CODE-HERE",
   }
   ```
6. Deploy and verify

### 2. Submit Sitemap (1 min)

In Google Search Console:

- Go to "Sitemaps" section
- Enter: `sitemap.xml`
- Click "Submit"

### 3. Test Social Sharing (2 min)

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

Enter your domain and verify images appear correctly.

---

## 📊 Monitor Progress

### Week 1

- Check if site is indexed: Google `site:yourdomain.com`
- Review any crawl errors in Search Console

### Month 1

- Check search impressions in Search Console
- Review which keywords are ranking
- Fix any reported issues

### Month 3+

- Analyze organic traffic growth
- Update content based on performance
- Build backlinks

---

## 🆘 Common Issues

### Images not showing in social preview?

- Clear cache in Facebook Debugger
- Verify image size is exactly 1200x630px
- Check file size is < 300 KB
- Ensure images are in `/public/` folder

### Sitemap not found?

- Check file is at `app/sitemap.js` (not `app/sitemap.xml`)
- Rebuild project: `pnpm build`
- Verify at: `https://yourdomain.com/sitemap.xml`

### Google not indexing?

- Can take 1-2 weeks for new sites
- Submit sitemap in Search Console
- Request indexing for specific URLs
- Ensure robots.txt allows crawling

---

## 📚 Full Documentation

For detailed information, see:

- [SEO_SUMMARY.md](SEO_SUMMARY.md) - Complete overview
- [SEO_CHECKLIST.md](SEO_CHECKLIST.md) - Full checklist
- [OG_IMAGE_GUIDE.md](OG_IMAGE_GUIDE.md) - Image creation guide

---

## 🎉 You're Done!

Your site now has professional-grade SEO. Results will improve over 3-6 months with consistent effort.

**Pro tip**: Add fresh content monthly and monitor Search Console weekly for best results.

Good luck! 🚀
