# SessionChords hosting and stack research

## Executive recommendation

Use this as the default target stack:

- Domain and DNS: **Cloudflare Registrar + Cloudflare DNS**
- Web front door and custom domains: **Firebase Hosting**
- Application runtime: **Google Cloud Run**
- Database: **Neon Postgres**
- Deployments: **GitHub Actions** using **Google Workload Identity Federation**
- File/object storage later: **Google Cloud Storage**
- PDF generation: start with the existing Python renderer in a **separate Cloud Run service or Cloud Run Job**

This gives you:

- a cheap path to get `sessionbook.org` and `staging.sessionbook.org` live quickly
- container-based dev-to-prod parity
- room for Python PDF generation without weird platform workarounds
- a strong upgrade path as the product grows
- avoidance of the hidden fixed-cost trap in Google’s recommended Cloud Run custom-domain setup

## Why this is the best fit

### 1. Cloud Run matches the product shape

You want the flexibility to run normal web containers and also run Python for PDF generation. Cloud Run is a good fit because it:

- deploys either from source or from a container image
- supports Docker-based workflows cleanly
- is pay-per-use with a meaningful free tier
- can later split the app into a web service plus separate worker/job services

Relevant docs:

- Cloud Run deploy from source supports Dockerfile or buildpacks and automatically uses Cloud Build plus Artifact Registry: <https://cloud.google.com/run/docs/deploying-source-code>
- Cloud Run pricing is pay-per-use, with request-based free tier including **180,000 vCPU-seconds**, **360,000 GiB-seconds**, and **2 million requests** per month: <https://cloud.google.com/run/pricing>

### 2. Raw Cloud Run custom domains have an important gotcha

Google’s custom-domain docs say the recommended production path is a **global external Application Load Balancer**. The direct Cloud Run domain-mapping feature is still **Preview**, is explicitly **not recommended for production**, and has limitations around TLS and certificates.

Relevant docs:

- Cloud Run custom domains page: <https://cloud.google.com/run/docs/mapping-custom-domains>
- Load balancer pricing: first 5 global forwarding rules cost **$0.025/hour**, which is about **$18.25/month** before data-processing charges: <https://cloud.google.com/load-balancing/pricing>

This is the single biggest cost/design gotcha I found.

If you put a production-grade Google load balancer in front of Cloud Run too early, you add a fixed monthly bill before the app has real traffic.

### 3. Firebase Hosting is the clean workaround

Cloud Run’s own docs explicitly list **Firebase Hosting** as a custom-domain option in front of Cloud Run, and call it a low-price option that can also serve static content. Firebase Hosting can rewrite requests to a Cloud Run service.

Relevant docs:

- Cloud Run custom domains page mentions Firebase Hosting as a mapping option and says it has a low price: <https://cloud.google.com/run/docs/mapping-custom-domains>
- Firebase Hosting supports rewrites to a Cloud Run container via `firebase.json`: <https://firebase.google.com/docs/hosting/full-config#rewrite-cloud-run-container>
- Firebase pricing page shows classic Hosting includes **custom domain & SSL**, with **10 GB storage** and **360 MB/day** transfer on the no-cost tier: <https://firebase.google.com/pricing>

That makes Firebase Hosting the sweet spot for:

- `sessionbook.org`
- `www.sessionbook.org`
- `staging.sessionbook.org`
- a quick coming-soon page
- later serving static assets in front of the app

### 4. Neon is the best first Postgres choice

Neon is especially strong for early-stage product work because it gives you:

- generous free tier
- scale-to-zero
- branch-based workflows for staging, preview, and testing
- no minimum monthly spend on paid plans

Relevant docs:

- Neon plans: <https://neon.com/docs/introduction/plans>
- Neon pricing: <https://neon.com/pricing>
- Neon branches and branch expiration: <https://neon.com/docs/manage/branches>

Important details from current Neon docs:

- Free plan: **100 projects**, **10 branches/project**, **100 CU-hours/project**, **0.5 GB/project**, **5 GB public transfer**
- Paid Launch plan: **$0.106/CU-hour**, **$0.35/GB-month**, **$1.50/extra branch-month**, no minimum monthly fee
- Branches can be auto-expired, which is ideal for preview or feature environments

For your use case, that branching model is a particularly strong fit for:

- non-prod branches
- rehearsal/test data environments
- preview environments tied to feature work

### 5. Supabase is still a strong later option, but not my first choice

Supabase is attractive when you want the platform bundle: Auth, Storage, Realtime, Edge Functions, and Postgres in one product.

But for the first version of SessionChords, the immediate need is mostly:

- Postgres
- cheap staging/prod support
- easy iteration

And Neon is stronger there.

Relevant Supabase docs:

- Billing FAQ: <https://supabase.com/docs/guides/platform/billing-faq>
- Compute and disk: <https://supabase.com/docs/guides/platform/compute-and-disk>

Important current Supabase details:

- Free plan allows **two active free projects**
- Paid usage is organization-level
- Example in docs: a Pro org with 3 default Micro projects is **$45/month** total, calculated as **$25 Pro plan + $30 compute - $10 compute credits**
- Default Micro compute is about **$10/month**

My read:

- pick **Neon first** if you mainly want Postgres and cheap iteration
- revisit **Supabase** when integrated auth/storage/realtime become high-value enough to justify the platform opinionation and cost structure

## Recommended architecture

### Phase 0: domain + coming soon

Ship this first:

- register `sessionbook.org` at Cloudflare Registrar
- keep DNS in Cloudflare
- deploy a static coming-soon page on Firebase Hosting
- point:
  - `sessionbook.org` -> Firebase Hosting
  - `www.sessionbook.org` -> Firebase Hosting
  - `staging.sessionbook.org` -> either a second Firebase Hosting site or leave parked until staging app is ready

Why this is good:

- fastest route to having the domain live
- basically no hosting cost at this stage
- no need to decide the whole app stack before the landing page exists

Relevant Cloudflare docs:

- Registering a domain is supported directly in Cloudflare Registrar: <https://developers.cloudflare.com/registrar/get-started/register-domain/>
- Cloudflare markets Registrar as **at-cost** with **no added fees** and supports `.org`: <https://www.cloudflare.com/products/registrar/>
- `.org` page also states at-cost, no-markup pricing: <https://www.cloudflare.com/application-services/products/registrar/buy-org-domains/>

### Phase 1: staging MVP

Use:

- Firebase Hosting site: `staging`
- Cloud Run service: `sessionbook-web-staging`
- Neon non-prod project: `sessionbook-nonprod`

Flow:

- Firebase Hosting serves any static shell and rewrites app requests to the staging Cloud Run service
- Neon non-prod handles staging data
- feature or preview environments can use **Neon child branches with expiration**

### Phase 2: production MVP

Use:

- Firebase Hosting site: `prod`
- Cloud Run service: `sessionbook-web-prod`
- Neon prod project: `sessionbook-prod`

I recommend **separate Neon projects** for prod and non-prod, then branches inside non-prod for experimentation. That keeps production isolation simple while still letting you use branching where it helps most.

### Phase 3: PDF generation

Do not tightly couple PDF generation to the main web service forever.

Start with either:

- a separate Cloud Run service used for synchronous PDF generation, or
- a Cloud Run Job if generation becomes slow enough that async workflows make more sense

Why:

- your current renderer is already Python
- PDF generation is a different scaling shape than the main app
- separating it keeps the web app simpler and makes future queueing easier

Cloud Run Jobs use the same general pay-for-use model as Cloud Run services: <https://cloud.google.com/run/pricing>

## Deployment recommendation

### GitHub Actions

Use GitHub Actions for CI/CD.

Recommended auth path:

- `google-github-actions/auth@v3`
- `google-github-actions/deploy-cloudrun@v3`
- use **Workload Identity Federation**, not a long-lived service account key

Relevant docs:

- GitHub Actions billing: <https://docs.github.com/en/billing/concepts/product-billing/github-actions>
- Google auth action: <https://raw.githubusercontent.com/google-github-actions/auth/main/README.md>
- Google Cloud Run deploy action: <https://raw.githubusercontent.com/google-github-actions/deploy-cloudrun/main/README.md>

Key findings:

- GitHub Actions is **free for public repos** on standard GitHub-hosted runners
- private repos get included minutes depending on plan
- the Google auth action recommends **Workload Identity Federation** over service account keys

One gotcha: the Google auth action notes that the GitHub OIDC token expires in **5 minutes**, so keep the workflow straightforward and do auth close to the deployment steps.

### Branch and environment strategy

I recommend:

- `main` -> deploy automatically to **staging**
- manual promotion or release-tag workflow -> deploy the same image to **production**

Why:

- keeps staging current
- avoids accidental prod deploys
- lets you validate the exact built artifact before promoting it

### Build strategy

For the app, use a container-based deployment path early rather than a framework-specific platform abstraction.

Reasons:

- it matches your desire for Docker parity
- it lets Node and Python coexist cleanly
- it keeps the PDF stack portable

Cloud Run can deploy from source, but remember that source deploys still rely on:

- **Cloud Build**
- **Artifact Registry**

Relevant pricing:

- Cloud Build includes **2,500 free build-minutes/month**, then `e2-standard-2` is **$0.006/minute**: <https://cloud.google.com/build/pricing>
- Artifact Registry includes **0.5 GB free**, then **$0.10/GB-month**: <https://cloud.google.com/artifact-registry/pricing>

For this project, those costs should be negligible early on.

## Cost picture

## Stage A: domain + coming soon

Likely monthly run rate:

- domain registration/renewal: registrar cost only, verify at checkout
- Firebase Hosting static landing page: likely **$0**
- GitHub Actions: likely **$0**

Practical takeaway:

- you can get the domain live and a coming-soon page up with almost no recurring platform cost besides the domain itself

## Stage B: staging MVP with low traffic

Likely monthly run rate:

- Firebase Hosting: often **$0**
- Cloud Run: often **$0 to low single digits** if traffic is light and there are no minimum instances
- Neon: often **$0** on Free during development, or low single digits / low tens if you move to Launch and keep usage intermittent
- Build + registry: likely pennies to very low single digits

Practical takeaway:

- a realistic early staging environment can stay extremely cheap

## Stage C: early private beta

Likely monthly run rate:

- same as above, plus possible Neon paid usage if you need a more production-like database profile
- if your database must stay warm constantly, Neon Launch can stop being “almost free” and become a real line item

Example intuition from current Neon pricing:

- a continuously-on low-load database can land around the low-twenties per month once compute and storage are counted

Practical takeaway:

- the database is more likely to become your first real recurring cost than Cloud Run

## Stage D: what to avoid too early

Avoid this unless you specifically need it:

- a Google external Application Load Balancer in front of Cloud Run from day 1

Why:

- it adds a fixed baseline cost of roughly **$18.25/month** before traffic processing

That is a meaningful tax for a pre-launch product.

## Alternative platforms

### Railway

Railway is the strongest “simpler but less GCP-native” alternative.

Relevant docs:

- Pricing and plans: <https://docs.railway.com/reference/pricing/plans>

Current details:

- Free: `$0/month` with **$1** of free credit
- Hobby: **$5/month** and includes **$5** usage
- resource pricing:
  - **$10/GB/month RAM**
  - **$20/vCPU/month**
  - **$0.05/GB egress**

My take:

- use Railway if you want the simplest developer experience and are okay with a small fixed monthly bill
- do not pick it over GCP if Docker parity, future platform flexibility, and a clean Python worker path matter more

### Fly.io

Fly.io remains interesting, but I would not start there for this product.

Relevant docs:

- Pricing: <https://fly.io/docs/about/pricing/>

Current details show small machines in the rough low-single-digit monthly range, but Fly is more operationally hands-on than the stack above.

My take:

- powerful
- container-friendly
- not the best “get live fast with low ops” answer here

### Render

Relevant docs:

- Pricing overview: <https://render.com/pricing>
- Git-based auto deploys: <https://render.com/docs/deploys#deploying-from-github>

Render is reasonable, but the official pricing page I checked is less concrete than the alternatives for quick comparison, and the Cloud Run + Firebase + Neon combination looks stronger for your use case.

## What I would choose today

If I were optimizing for your actual stated goals, I would do this:

1. Buy `sessionbook.org` in Cloudflare Registrar and keep DNS there.
2. Create a Firebase Hosting site for a simple coming-soon page.
3. Stand up a GCP project for SessionChords.
4. Create two Cloud Run services:
   - `sessionbook-web-staging`
   - `sessionbook-web-prod`
5. Create two Neon projects:
   - `sessionbook-prod`
   - `sessionbook-nonprod`
6. Use Neon child branches only inside non-prod.
7. Use GitHub Actions with Workload Identity Federation to deploy staging automatically and production manually.
8. When the app exists, let Firebase Hosting rewrite to Cloud Run.
9. When PDF generation matures, split it into its own Cloud Run workload.

That gives you a path that is:

- cheap now
- production-credible later
- compatible with Docker and Python
- not overbuilt for the current stage

## Immediate next steps

### This week

- Buy `sessionbook.org`
- Put DNS on Cloudflare
- Create the GCP project
- Enable:
  - Cloud Run
  - Cloud Build
  - Artifact Registry
  - Secret Manager
- Create a Firebase Hosting site for the landing page
- Put `sessionbook.org` and `www.sessionbook.org` on that site

### Next

- Create `staging.sessionbook.org`
- Deploy a tiny staging app shell to Cloud Run
- Wire Firebase Hosting rewrite to the staging Cloud Run service
- Create Neon prod and non-prod projects
- Add GitHub Actions deployment using WIF

### Soon after

- Decide the app framework
- Keep the PDF renderer in Python and containerize it separately
- Add Cloud Storage when you need uploaded melody PDFs and generated output persistence

## Short answer

If you want the simplest strong recommendation:

**Cloudflare Registrar + DNS, Firebase Hosting for the domain front door, Cloud Run for the app and PDF workloads, Neon for Postgres, GitHub Actions with Google Workload Identity Federation.**

That is the stack I would aim at.

## Sources

- Cloud Run pricing: <https://cloud.google.com/run/pricing>
- Cloud Run custom domains: <https://cloud.google.com/run/docs/mapping-custom-domains>
- Cloud Run deploy from source: <https://cloud.google.com/run/docs/deploying-source-code>
- Google load balancer pricing: <https://cloud.google.com/load-balancing/pricing>
- Firebase Hosting rewrites to Cloud Run: <https://firebase.google.com/docs/hosting/full-config#rewrite-cloud-run-container>
- Firebase pricing: <https://firebase.google.com/pricing>
- Cloud Build pricing: <https://cloud.google.com/build/pricing>
- Artifact Registry pricing: <https://cloud.google.com/artifact-registry/pricing>
- Cloud Storage pricing: <https://cloud.google.com/storage/pricing>
- Cloudflare Registrar registration docs: <https://developers.cloudflare.com/registrar/get-started/register-domain/>
- Cloudflare Registrar product page: <https://www.cloudflare.com/products/registrar/>
- Cloudflare `.org` registrar page: <https://www.cloudflare.com/application-services/products/registrar/buy-org-domains/>
- GitHub Actions billing: <https://docs.github.com/en/billing/concepts/product-billing/github-actions>
- Google GitHub auth action README: <https://raw.githubusercontent.com/google-github-actions/auth/main/README.md>
- Google Cloud Run deploy action README: <https://raw.githubusercontent.com/google-github-actions/deploy-cloudrun/main/README.md>
- Neon pricing: <https://neon.com/pricing>
- Neon plans: <https://neon.com/docs/introduction/plans>
- Neon branches: <https://neon.com/docs/manage/branches>
- Supabase billing FAQ: <https://supabase.com/docs/guides/platform/billing-faq>
- Supabase compute and disk: <https://supabase.com/docs/guides/platform/compute-and-disk>
- Railway pricing: <https://docs.railway.com/reference/pricing/plans>
- Fly.io pricing: <https://fly.io/docs/about/pricing/>
- Render pricing: <https://render.com/pricing>
- Render deploy docs: <https://render.com/docs/deploys#deploying-from-github>
