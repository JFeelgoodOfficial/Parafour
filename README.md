# Parafour Innovations — Website

Official website for **Parafour Innovations, LLC** — manufacturer of ETL Listed and NTEP Certified LPG Propane Autogas dispensing systems. Built in Georgetown, Texas.

🌐 **Live site:** [parafour.com](https://parafour.com)

---

## Pages

| File | Page | Description |
|------|------|-------------|
| `index.html` | Home | Hero, certifications, product overview, testimonials, CTA |
| `products.html` | Products | P4-100, P4-150, P4-200 detail pages, spec comparison table, accessories |
| `documentation.html` | Documentation | Spec sheets, installation guides, compliance certs, warranty policy |
| `about.html` | About | Company story, Robin Parsons bio, team, industry memberships |
| `contact.html` | Contact | Inquiry form, direct contact cards, FAQ |

## File Structure

```
/
├── index.html
├── products.html
├── documentation.html
├── about.html
├── contact.html
├── style.css          # All shared styles — design tokens, layout, components
├── main.js            # Nav toggle, scroll reveals, counter animations, form handler
├── CNAME              # parafour.com — required for GitHub Pages custom domain
├── assets/
│   └── images/        # Add product photos here when available
└── README.md
```

## Tech Stack

- Plain HTML5, CSS3, and vanilla JavaScript — no frameworks, no build step
- [Barlow / Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) via Google Fonts
- Fully responsive — mobile, tablet, desktop
- Hosted on **GitHub Pages** with a custom domain

## Design System

Colors and spacing are defined as CSS custom properties at the top of `style.css`:

```css
--navy:        #0d2144   /* primary brand color */
--steel:       #3b6ea5   /* secondary / accent */
--steel-light: #5a8dc7   /* links, highlights */
--sky:         #e8f1fb   /* light backgrounds, cards */
```

## Deployment

This site is hosted on **GitHub Pages**.

### GitHub Pages Setup

1. Go to **Settings → Pages**
2. Set Source to `main` branch, `/ (root)`
3. GitHub assigns a `*.github.io` preview URL automatically

### Custom Domain (parafour.com)

The `CNAME` file in the repo root tells GitHub Pages to serve the site at `parafour.com`. DNS records at the registrar should be:

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   <github-username>.github.io.
```

HTTPS is handled automatically by GitHub — no certificate management needed.

## Making Updates

Since there's no build process, edits are straightforward:

- **Content changes** — edit the relevant `.html` file directly
- **Style changes** — edit `style.css` (changes apply site-wide)
- **New product photos** — add images to `assets/images/` and update the `src` in the relevant `.html` file
- **Contact details** — search for the phone number or email across all `.html` files and update in place

To update the live site, commit and push to the `main` branch. GitHub Pages deploys automatically within ~60 seconds.

## TODO

- [ ] Replace SVG dispenser illustrations with real product photography
- [ ] Add real email addresses (currently placeholder — `sales@parafour.com`, `support@parafour.com`, `accounting@parafour.com`)
- [ ] Wire up the contact form to a real backend (options: [Formspree](https://formspree.io), [Netlify Forms](https://www.netlify.com/products/forms/), or a custom endpoint)
- [ ] Add Google Analytics or similar once live
- [ ] Submit sitemap to Google Search Console after launch

## Contact

**Parafour Innovations, LLC** — Georgetown, Texas  
📞 Main: (512) 639-9186  
📞 Tech Support: (512) 639-7665  
🌐 [parafour.com](https://parafour.com)  
📘 [facebook.com/Parafourinnovations](https://www.facebook.com/Parafourinnovations/)
