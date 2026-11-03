# ChooseMore demo

ChooseMore is a local storefront demonstration with original sample products, illustrative specifications, a temporary cart, checkout preview, and a product-enquiry preview for damage, replacement, and service requests. Admin-style listing additions and edits are saved in the current browser's local storage only; they are not shared across browsers or devices. The app has no production catalog, payment processing, account system, order history, or persistent customer data.

## Run the site and API locally

Copy or extract the complete project folder to `C:\Users\<your-user-name>\Documents\ChooseMore` on the Windows PC. This worktree cannot write directly to that Documents folder. Install Node.js 18 or newer, then double-click `start-choosemore.bat`, or open PowerShell in the copied folder and run:

```powershell
npm.cmd start
```

Open `http://127.0.0.1:8989/` (or `http://localhost:8989/`). By default, the server binds only to this PC's loopback interface; it is not accessible from other PCs or phones. It reads `HOST` and `PORT` environment variables, so you can change the port if needed:

```powershell
$env:PORT = "8990"
npm.cmd start
```

The normal demo has no login or transport encryption. Keep it on this PC and do not expose its port to the network or public internet.

## Back up and transfer catalog data

Product additions and edits are saved in the current browser's local storage; they are not automatically written to project files or GitHub. On `products.html`, choose **Download catalog JSON** to save a backup of the current product catalog, including embedded product images. Cart, enquiry, and account data are not included. Keep the backup private unless you intend to share its product information and images.

New and amended listings include available stock (a nonnegative whole number, default `1`); older saved listings and backups without this field are treated as `1`. Each listing can include up to 10 images, kept with that specific product. Product cards and details provide previous/next controls when multiple images are available; automatic and next-image changes slide in from right to left, while previous-image changes slide in from left to right. Motion is reduced when the device requests reduced motion.

Each product in the shopping bag is shown in its own detail card with its image, category, description, unit price, line total, quantity controls, and a delete action. Increasing or decreasing a quantity adjusts reserved stock, and deleting an item returns its remaining units. The demo checkout offers **Cash and delivery (COD)** and **Store-to-Pick (STP)**; a delivery address is required only for COD. Cancelling checkout returns all reserved units. Completing checkout displays the selected method and clears the bag without restoring stock, but it does not place an actual order or process payment.

To restore a backup in another browser, choose its JSON file under **Import a catalog backup**, review the number of additions and updates, then confirm. Imports are validated and merged by product ID: matching entries are updated, new ones are added, and entries not in the file are kept. Import only writes to that browser's local storage. To include your catalog in the project/GitHub, attach the exported JSON file here and explicitly authorize adding its product details and images; nothing is uploaded or committed automatically.

## Temporary public HTTPS preview (read-only)

To let people worldwide view the sample storefront over HTTPS, install Node.js 18 or newer and Cloudflare's `cloudflared` on this Windows PC. In PowerShell, install the tunnel client with:

```powershell
winget install --id Cloudflare.cloudflared
```

Extract the project package, then double-click `start-choosemore-public-preview.bat`. The launcher starts the app bound only to `127.0.0.1:8989`, confirms the server is in read-only mode, and runs:

```powershell
cloudflared tunnel --url http://127.0.0.1:8989
```

Cloudflare prints a temporary `https://<generated-name>.trycloudflare.com` URL in the same window. Copy that exact URL and share it with visitors. No custom domain or DNS records are needed. Keep the window open while it is in use; press Ctrl+C to stop the tunnel and local server. The URL is temporary and changes when a new quick tunnel is started. Quick Tunnels are intended for testing and do not provide an uptime guarantee.

This public URL has no sign-in and is visible to anyone who receives it. The preview server accepts only `GET` and `HEAD`; all other HTTP methods are rejected with `405 Method Not Allowed`. Listing edits and enquiry submissions are disabled in the preview, and saved browser edits are ignored there. Only the original sample catalog, allowlisted storefront files, and a generated read-only runtime flag are served; local databases, project files, credentials, and the Android package are not public. Do not place real or private data in the sample storefront. The regular local launcher remains unchanged.

Cart and checkout interactions are temporary browser previews. They are not submitted or shared. The local API is still on this PC and is exposed through the tunnel only for read-only health and sample-catalog `GET` requests; no API write route is available over the public preview.

## Optional HTTPS for local development

HTTP remains the default. To enable HTTPS, provide a matching PEM certificate and private key using `TLS_CERT_PATH` and `TLS_KEY_PATH`. Keep the private key outside the project folder and never include it in the ZIP or commit it. For a self-signed certificate for this PC's browser, install OpenSSL, then run in PowerShell:

```powershell
$certDir = Join-Path $env:USERPROFILE "Documents\ChooseMore-Certs"
New-Item -ItemType Directory -Force $certDir | Out-Null
openssl req -x509 -newkey rsa:2048 -nodes `
  -keyout "$certDir\local-dev-key.pem" `
  -out "$certDir\local-dev-cert.pem" `
  -days 365 -subj "/CN=localhost" `
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
$env:TLS_CERT_PATH = "$certDir\local-dev-cert.pem"
$env:TLS_KEY_PATH = "$certDir\local-dev-key.pem"
$env:PORT = "8990"
npm.cmd start
```

Open `https://127.0.0.1:8990/` or `https://localhost:8990/`. Browsers will warn that a self-signed certificate is not trusted until you explicitly trust it; this development certificate is not publicly trusted. Use a certificate issued by a CA trusted on this PC to avoid that warning. The launcher script also prints HTTPS links when both TLS environment variables are set. If either certificate path is missing or unreadable, startup fails with an error; HTTP can be restored by clearing both variables and restarting. The same API paths work over HTTPS on the configured port.

## Public storefront (GitHub Pages)

The GitHub Actions workflow publishes only the static HTML, CSS, and browser JavaScript to GitHub Pages, which can provide managed HTTPS at `https://yaswanth469.github.io/choosemore/` after Pages is enabled and a deployment succeeds. It does not publish the Node server, Android project, local package, certificates, or private keys. Relative page and asset links keep working beneath the `/choosemore/` repository path.

GitHub Pages cannot run this Node API. On the hosted `github.io` preview, the storefront uses its built-in sample catalog and enquiry forms do not send or store submissions. Product edits and uploaded images remain in the current visitor's browser local storage; they are not shared with other visitors and do not update a server catalog. The API remains local-only at `http://127.0.0.1:8989/` except while the explicit temporary Cloudflare read-only preview is running. Public API write support would require a separately hosted backend and explicit frontend configuration.

GitHub Pages manages the site's HTTPS certificate; a separate domain and certificate are not needed for this `github.io` URL. A custom public domain would require domain ownership and DNS setup.

The Android APK defaults to the HTTP emulator bridge at `http://10.0.2.2:8989/` and is unchanged by enabling HTTPS on the server. An HTTPS APK URL requires a certificate trusted by Android and a certificate whose subject alternative names match the APK URL; self-signed certificates are not automatically trusted by the emulator. Do not disable certificate validation to work around this.

The same local server provides:

- `GET http://127.0.0.1:8989/api/health`
- `GET http://127.0.0.1:8989/api/products`
- `POST http://127.0.0.1:8989/api/enquiries` with JSON fields `productId`, `reason`, `name`, `email`, and `message`; `orderReference` is optional.

Enquiry submissions are validated by the local API but are not stored or sent to a support team. The sample catalog is in `catalog.json`. Product additions, edits, and uploaded item images are saved together in the current browser profile's local storage; they are not saved to the server's files or shared with other browsers/devices. The image picker accepts image files up to 8 MB that the browser can decode, resizes them to a storage-safe WebP (or supported PNG/JPEG fallback), and rejects unsupported formats, non-image files, and images that exceed safe size or dimensions.

## Android app (Android 6.0+)

A debug APK with minimum Android API 23 is available at `android-app/app/build/outputs/apk/debug/app-debug.apk`. Install it on an Android 6.0+ emulator; this is a debug demo APK, not a signed production release. The wrapper opens `http://10.0.2.2:8989/` by default, which lets the Android emulator on this PC reach its loopback server. Start the server on this PC first.

To rebuild locally, install JDK 17 or newer, Android SDK Platform 37 / Build Tools 36.0.0, and Gradle 9.6 or newer. From PowerShell:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
cd android-app
gradle assembleDebug
```

The server is loopback-only, so a physical phone cannot access it. `localhost` refers to the current device, not the PC; use `10.0.2.2` from an Android emulator running on this PC.
