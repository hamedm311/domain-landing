# Host Baran - Domain Registration Landing Page

یک لندینگ پیج حرفه‌ای برای ثبت و فروش دامنه با طراحی Premium و امکانات کامل.

## 📁 ساختار پروژه

```
domain-landing/
│
├── index.html                    # صفحه اصلی
│
├── api/
│   ├── whois.php                 # API استعلام دامنه
│   └── competitor-prices.php     # API قیمت رقبا
│
├── data/
│   └── competitors/
│       ├── site-1.json           # داده‌های رقیب ۱
│       ├── site-2.json           # داده‌های رقیب ۲
│       └── site-3.json           # داده‌های رقیب ۳
│
├── assets/
│   ├── css/
│   │   ├── variables.css         # متغیرهای CSS
│   │   ├── global.css            # استایل‌های پایه
│   │   ├── components.css        # کامپوننت‌ها
│   │   ├── layout.css            # لی‌اوت صفحات
│   │   └── responsive.css        # ریسپانسیو
│   │
│   ├── js/
│   │   ├── utils.js              # توابع کمکی
│   │   ├── domain-search.js      # جستجوی دامنه
│   │   ├── comparison.js         # مقایسه قیمت
│   │   └── app.js                # کدهای اصلی
│   │
│   ├── fonts/
│   │   └── IRANSans/             # فونت فارسی
│   │
│   └── images/                   # تصاویر
│
└── README.md                     # این فایل
```

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها

- **PHP**: نسخه 7.4 یا بالاتر
- **Web Server**: Apache یا Nginx
- **Extensions**: JSON, cURL (اختیاری)

### نصب روی Apache

1. فایل‌ها را در پوشه `public_html` یا `htdocs` آپلود کنید
2. مطمئن شوید `.htaccess` فعال است
3. دسترسی‌های زیر را تنظیم کنید:

```bash
chmod 755 /path/to/domain-landing/api/
chmod 755 /path/to/domain-landing/data/
chmod 644 /path/to/domain-landing/data/rate_limits.json
```

4. مرورگر را باز کرده و به آدرس سایت بروید

### نصب روی Nginx

کانفیگ نمونه:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/domain-landing;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    }

    location /api/ {
        try_files $uri =404;
    }
}
```

## 🔧 تنظیمات

### تغییر قیمت‌ها

برای تغییر قیمت‌های هاست باران، فایل‌های زیر را ویرایش کنید:

- **HTML**: `index.html` (بخش Pricing Cards)
- **JavaScript**: `assets/js/domain-search.js` (آرایه `prices`)
- **JavaScript**: `assets/js/comparison.js` (آرایه `hostBaranPrices`)
- **PHP**: `api/whois.php` (تابع `mockWhoisLookup`)

### اضافه کردن رقیب جدید

1. یک فایل JSON جدید در `data/competitors/` ایجاد کنید
2. از ساختار زیر پیروی کنید:

```json
{
    "site_name": "نام سایت",
    "last_updated": "2024-12-19T10:00:00+03:30",
    "currency": "IRT",
    "domains": {
        "com": 2500000,
        "net": 3700000,
        "org": 3300000,
        "ir": 100000
    }
}
```

3. نام فایل باید فرمت `site-X.json` داشته باشد

### اتصال WHOIS واقعی

در فایل `api/whois.php` تابع `realWhoisLookup` را پیاده‌سازی کنید:

```php
function realWhoisLookup($domain) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.whoisprovider.com/v1/whois?domain=" . urlencode($domain));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer YOUR_API_KEY'
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

سپس در انتهای فایل، به جای `mockWhoisLookup` از `realWhoisLookup` استفاده کنید.

### اتصال Scraper برای قیمت رقبا

در فایل `api/competitor-prices.php` کلاس `CompetitorPriceScraper` را پیاده‌سازی کنید.

## 🎨 شخصی‌سازی طراحی

### تغییر رنگ‌ها

فایل `assets/css/variables.css` را ویرایش کنید:

```css
:root {
    --primary: #4DA3FF;          /* رنگ اصلی */
    --primary-dark: #0969DA;     /* رنگ اصلی تیره */
    --primary-light: #84C5FF;    /* رنگ اصلی روشن */
    --success: #10B981;          /* رنگ موفقیت */
    --error: #EF4444;            /* رنگ خطا */
}
```

### تغییر فونت

فایل‌های فونت را در `assets/fonts/IRANSans/` قرار دهید و در `assets/css/global.css` مسیرها را به‌روز کنید.

## 🔒 امنیت

### Rate Limiting

API WHOIS دارای محدودیت درخواست است (60 درخواست در دقیقه برای هر IP).

برای تغییر این مقدار، در `api/whois.php`:

```php
$maxRequestsPerMinute = 60; // تغییر به عدد دلخواه
```

### Sanitization

تمام ورودی‌ها sanitize و validate می‌شوند. هیچ خروجی PHP مستقیم به کاربر نمایش داده نمی‌شود.

## 📊 SEO

صفحه شامل موارد زیر است:

- ✅ Meta Tags کامل
- ✅ Open Graph Tags
- ✅ Twitter Card
- ✅ Schema.org Structured Data
- ✅ FAQ Schema
- ✅ Organization Schema
- ✅ Semantic HTML5
- ✅ Heading Structure صحیح
- ✅ Canonical URL

## ⚡ Performance

- CSS و JS ماژولار و بهینه
- Lazy Loading برای تصاویر
- Intersection Observer برای انیمیشن‌ها
- Debounce برای جستجو
- prefetch/preload برای منابع مهم

## ♿ Accessibility

- ARIA Labels
- Keyboard Navigation
- Focus States
- Contrast مناسب
- Reduced Motion Support

## 📱 Responsive

طراحی Mobile First با پشتیبانی از:

- موبایل (< 768px)
- تبلت (768px - 1024px)
- لپ‌تاپ (1024px - 1200px)
- دسکتاپ (> 1200px)

## 🌐 Browser Support

- Chrome (آخرین نسخه)
- Firefox (آخرین نسخه)
- Safari (آخرین نسخه)
- Edge (آخرین نسخه)
- Opera (آخرین نسخه)

## 📝 ویژگی‌ها

### جستجوی دامنه

- بررسی لحظه‌ای آزاد بودن دامنه
- تشخیص خودکار پسوند
- پیشنهاد پسوندهای جایگزین
- نمایش قیمت

### مقایسه قیمت

- جدول مقایسه با رقبا
- نمایش تفاوت قیمت
- Highlight بهترین قیمت
- آخرین زمان بروزرسانی

### پنل مدیریت دامنه

- مدیریت DNS
- پنهان کردن Whois
- قفل امنیتی
- انتقال دامنه
- تمدید آسان

## 🤝 پشتیبانی

برای سوالات و مشکلات به آدرس ایمیل support@hostbaran.com پیام دهید.

## 📄 مجوز

© 2024 هاست باران. تمامی حقوق محفوظ است.

---

**تهیه شده توسط تیم فنی هاست باران**