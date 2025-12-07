// >>> FIX: globals for map & markers so location code (outside DOMContentLoaded) can use them
let map;
let agencyMarkers = [];
let userLocation = null;
let userMarker = null;
// let isFocusingOnMarker = false;

const IRAN_BOUNDS = [[20, 38], [44, 70]];

document.addEventListener('DOMContentLoaded', function () {
    map = L.map('map', {
        center: [32.4279, 53.6880],
        zoom: window.innerWidth <= 992 ? 5 : 6,
        minZoom: window.innerWidth <= 992 ? 3.5 : 5.1,
        maxZoom: 18,
        maxBounds: [[20, 38], [44, 70]],
        maxBoundsViscosity: 0.75,
        zoomSnap: 0.1,   // گام زوم
        zoomDelta: 1,  // تغییر با اسکرول/پینچ
        zoomControl: false
    });


    function updateMapView() {
        if (window.innerWidth <= 992) {
            map.setView([33.5, 52.5], 4.6);
        } else {
            map.fitBounds([[25, 44], [39.8, 63.4]], { padding: [50, 50] });
        }
    }

    updateMapView();
    window.addEventListener('resize', updateMapView);

    L.control.zoom({
        position: 'topleft',
        zoomInTitle: 'بزرگ‌نمایی',
        zoomOutTitle: 'کوچک‌نمایی'
    }).addTo(map);

    L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);



    const bluePin = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // لایه مخصوص مارکرها (برای فیلتر کردن)
    const markersLayer = L.layerGroup().addTo(map);

    const agencies = [
        { city: "تهران", name: "دفتر مرکزی", lat: 35.73700107999796, lng: 51.432455436116015, addr: "تهران، خیابان سهروردی، خیابان خرمشهر، خیابان عشقیار (نیلوفر)، کوچه چهارم (حورسی)، پلاک ۱", phone: "09127146489 / 02136483529", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "دیجی سام (سامان آذرخوش)", lat: 35.68696559794489, lng: 51.42165512396892, addr: "تهران، میدان امام خمینی، اول فردوسی، پشت شهرداری، پاساژ لباف، طبقه 1", phone: "09127146489 / 02136483529", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه موتوتیونینگ محسن (آقای شاملو)", lat: 35.654444524066555, lng: 51.49072091700788, addr: "تهران، اتوبان بسیج، ۲۰ متری افسریه، ۱۵ متری اول، نبش کوچه کنگاوری (۲۹)", phone: "02133145521 / 02138333099", type: "ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه رحمانی (آقای مهران رحمانی)", lat: 35.7012, lng: 51.3456, addr: "تهران، خیابان عباسی، نبش دومین کوچه سمت چپ، پلاک ۲۹۴", phone: "09128404537 / 02155418982", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه جام جم (آقای فرید نظری)", lat: 35.741102313508165, lng: 51.549681004715055, addr: "تهرانپارس، خیابان ۱۹۶ شرقی، پلاک ۲۲۹", phone: "09128300310 / 0217786751", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "لندرشاپ (آقای رسولی)", lat: 35.71284720177635, lng: 51.36928971854059, addr: "تهران، ستارخان، بین شادمان و بهبودی، بعد از کوچه علی نجاری، پلاک ۲۴۴، طبقه اول", phone: "09122151330 / 02166559575", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه علی (آقای احسان فکری)", lat: 35.745, lng: 51.39, addr: "خیابان شریعتی بعداز مترو قیطریه بلوار صبا پلاک ۱۶۳", phone: "09123129396", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "زنگوله (مهرداد گرجی)", lat: 35.735, lng: 51.3234, addr: "تهرانپارس، میدان شاهد، خیابان ۱۹۶ شرقی، بین خیابان ۱۳۱ و ۱۳۳، پلاک ۳۷۳", phone: "09354223037", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "کرج", name: "نمایندگی کرج", lat: 35.8321, lng: 50.9654, addr: "جهانشهر، بلوار جمهوری", phone: "026-32511223", type: "فروش و نصب" },
        { city: "مشهد", name: "نمایندگی مشهد", lat: 36.2970, lng: 59.6062, addr: "وکیل آباد، نبش وکیل آباد ۲۵", phone: "051-36081234", type: "فروش و خدمات پس از فروش" },
        { city: "اصفهان", name: "نمایندگی اصفهان", lat: 32.6539, lng: 51.6660, addr: "چهارباغ بالا، نزدیک سی و سه پل", phone: "031-36654321", type: "فروش و نصب تخصصی" },
        { city: "شیراز", name: "فول آپشن", lat: 29.5918, lng: 52.5833, addr: "چمران، نرسیده به پل چمران", phone: "071-36281900", type: "فروش و نصب + تیونینگ" },
        { city: "تبریز", name: "نمایندگی تبریز", lat: 38.0667, lng: 46.2833, addr: "امام خمینی، نزدیک میدان ساعت", phone: "041-33345678", type: "فروش و خدمات" },
        { city: "رشت", name: "نمایندگی رشت", lat: 37.2808, lng: 49.5832, addr: "میدان شهرداری، سبزه میدان", phone: "013-33398765", type: "فروش و نصب" },
        { city: "قم", name: "نمایندگی قم", lat: 34.6399, lng: 50.8759, addr: "بلوار امین، نزدیک حرم", phone: "025-37754321", type: "فروش و خدمات پس از فروش" }
    ];

    const listContainer = document.getElementById('agencyList');
    let currentProvince = '';
    let currentService = '';

    // آرایه برای نگهداری مارکر + المنت لیست (برای فیلتر همزمان)

    function getTypeColor(type) {
        return '#2563eb';
    }

    agencies.forEach(a => {
        const title = a.city + (a.name ? ' — ' + a.name : '');
        const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`;

        // ساخت مارکر
        const isMobile = window.innerWidth <= 992;

        const popupHtml = `
        <div class="popup-content">
            <h4>${title}</h4>
            <p><strong>آدرس:</strong> ${a.addr}</p>
            <p><strong>تلفن:</strong> <a href="tel:${a.phone}">${a.phone}</a></p>
            <p><strong>نوع فعالیت:</strong> 
            <span class="activity-tag" style="background:${getTypeColor(a.type)}">${a.type}</span>
            </p>
            <a href="${gmapUrl}" target="_blank" class="neshan-btn" style="background:#10b981">
            مسیریابی با گوگل مپ
            </a>
        </div>
        `;

        const popupOptions = {
            maxWidth: 340,
            minWidth: 280,
            autoPan: true,
            keepInView: true,
            autoPanPaddingTopLeft: isMobile ? L.point(60, 140) : L.point(60, 140),
            autoPanPaddingBottomRight: isMobile ? L.point(60, 100) : L.point(60, 100)
        };

        const marker = L.marker([a.lat, a.lng], { icon: bluePin })
            .bindPopup(popupHtml, popupOptions);

        marker.on('popupopen', () => {
            map.setMaxBounds(null);
            map.options.maxBoundsViscosity = 0;
            map.options.autoPan = false;
        });

        // ✅ بازگرداندن محدودیت بعد از بسته شدن پاپ‌آپ
        marker.on('popupclose', () => {
            map.setMaxBounds(IRAN_BOUNDS);
            map.options.maxBoundsViscosity = 0.75;
            map.options.autoPan = true;
        });


        // اضافه کردن مارکر به لایه
        marker.addTo(markersLayer);

        // ساخت آیتم لیست
        const item = document.createElement('div');
        item.className = 'agency-item';
        item.innerHTML = `
            <strong>${title}</strong>
            <div class="activity-badge" style="background:${getTypeColor(a.type)}">
                ${a.type}
            </div>
            <small class="agency-address">
                ${a.addr}<br>
                <a href="tel:${a.phone}" style="color:#1e40af;font-weight:600">${a.phone}</a>
            </small>
        `;

        item.onclick = () => {

            const isMobile = window.innerWidth <= 992;

            // مقدار جابجایی عمودی برای وسط قرار گرفتن پاپ‌آپ
            const offsetLat = isMobile ? 0.05 : 0.03;

            const targetCenter = [
                a.lat + offsetLat,
                a.lng
            ];

            map.setView(
                targetCenter,
                isMobile ? 14.5 : 15,
                {
                    animate: true,
                    duration: 0.6
                }
            );

            marker.openPopup();

            if (isMobile) {
                setTimeout(() => {
                    document.getElementById('map').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 600);
            }
        };


        listContainer.appendChild(item);

        // ذخیره برای فیلتر همزمان
        agencyMarkers.push({
            marker: marker,
            element: item,
            type: a.type,
            text: item.textContent.toLowerCase() // برای جستجوی سریع
        });
    });

    // تابع فیلتر جدید (همزمان لیست + نقشه)
    function filterList() {
        const term = document.getElementById('searchBox').value.trim().toLowerCase();

        markersLayer.clearLayers(); // پاک کردن همه مارکرها از نقشه

        let hasVisible = false;

        agencyMarkers.forEach(obj => {
            const el = obj.element;
            const fullText = obj.text || el.textContent.toLowerCase();

            const matchesSearch = fullText.includes(term);
            const matchesProvince = !currentProvince || fullText.includes(currentProvince);
            const matchesService = !currentService || obj.type.includes(currentService);

            const shouldShow = matchesSearch && matchesProvince && matchesService;

            el.style.display = shouldShow ? 'block' : 'none';

            if (shouldShow) {
                obj.marker.addTo(markersLayer);
                hasVisible = true;
            }
        });

        // اگر هیچ نمایندگی‌ای پیدا نشد، به نمای کلی ایران برگرد
        if (!hasVisible) {
            updateMapView();
        }
    }

    // رویدادهای فیلتر
    document.getElementById('searchBox').addEventListener('input', filterList);

    const provinceMap = {
        tehran: "تهران",
        alborz: "کرج",
        khorasan: "مشهد",
        esfahan: "اصفهان",
        fars: "شیراز",
        azerbaijan: "تبریز",
        gilan: "رشت",
        qom: "قم"
    };

    document.getElementById('provinceSelect').addEventListener('change', function () {
        currentProvince = provinceMap[this.value] || "";
        document.getElementById('searchBox').value = '';
        filterList();

        if (!this.value) {
            updateMapView();
            return;
        }

        const config = {
            tehran: { center: [35.7210, 51.3890], zoom: 11 },
            alborz: { center: [35.8350, 50.9700], zoom: 12 },
            khorasan: { center: [36.2970, 59.6062], zoom: 12 },
            esfahan: { center: [32.6539, 51.6660], zoom: 12 },
            fars: { center: [29.5918, 52.5833], zoom: 12 },
            azerbaijan: { center: [38.0667, 46.2833], zoom: 12 },
            gilan: { center: [37.2808, 49.5832], zoom: 12 },
            qom: { center: [34.6399, 50.8759], zoom: 13 }
        };

        const c = config[this.value];
        if (c) {
            map.setView(c.center, c.zoom, { animate: true });
            setTimeout(() => document.querySelector('.list-box').scrollIntoView({ behavior: 'smooth' }), 400);
        }
    });

    // فیلتر خدمات (از مودال)
    const serviceFilter = document.getElementById("serviceFilter");
    serviceFilter.onchange = () => {
        currentService = serviceFilter.value.trim();
        filterList();
    };

    // مودال خدمات (بدون تغییر — دقیقاً همون کد قبلی شما)
    (function () {
        const modal = document.getElementById("serviceModal");
        const filterBtn = document.getElementById("filterBtn");
        const closeService = document.getElementById("closeService");
        const serviceSelect = document.getElementById("serviceSelect");
        const applyBtn = document.getElementById("applyService");
        const hiddenService = document.getElementById("serviceFilter");

        function openModal() {
            if (hiddenService) {
                serviceSelect.value = hiddenService.value || "";
            }
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            serviceSelect.focus();
        }

        function closeModal() {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            filterBtn.focus();
        }

        filterBtn.addEventListener("click", openModal);
        closeService.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                closeModal();
            }
        });

        function applySelection() {
            if (!hiddenService) return closeModal();
            hiddenService.value = serviceSelect.value;
            hiddenService.dispatchEvent(new Event('change', { bubbles: true }));
            closeModal();
        }

        applyBtn.addEventListener("click", applySelection);
        serviceSelect.addEventListener("change", applySelection);
    })();
});



// دکمه پیدا کردن نزدیک‌ترین نمایندگی
function addNearestButton() {
    const buttonHTML = `
        <div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:1000;">
            <button id="findNearestBtn" style="
                background:linear-gradient(135deg,#10b981,#059669);
                color:white;font-family:Vazirmatn,sans-serif;
                font-weight:900;font-size:16px;padding:14px 28px;
                border:none;border-radius:50px;box-shadow:0 10px 30px rgba(16,185,129,0.4);
                cursor:pointer;backdrop-filter:blur(10px);transition:all .3s;
            " onmouseover="this.style.transform='translateY(-4px)'"
               onmouseout="this.style.transform='translateY(0)'">
                نزدیک‌ترین نمایندگی به من
            </button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);

    document.getElementById('findNearestBtn').addEventListener('click', findNearestAgency);
}

function findNearestAgency() {
    const btn = document.getElementById('findNearestBtn');

    if (!navigator.geolocation) {
        alert('مرورگر از موقعیت مکانی پشتیبانی نمی‌کند');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'در حال دریافت موقعیت...';

    // manual failsafe timeout (9s)
    const manualTimeout = setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'تلاش مجدد';
        alert('دریافت موقعیت بیش از حد طول کشید. GPS را فعال کنید و دوباره بزنید.');
    }, 9000);

    navigator.geolocation.getCurrentPosition(
        position => {
            clearTimeout(manualTimeout);

            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // update user marker
            if (userMarker) {
                if (userMarker.remove) userMarker.remove();
                userMarker = null;
            }

            userMarker = L.marker([userLocation.lat, userLocation.lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                })
            }).addTo(map).bindPopup('📍 شما اینجا هستید').openPopup();

            let nearest = null;
            let minDist = Infinity;

            // agencyMarkers is global now
            agencyMarkers.forEach(obj => {
                const d = map.distance([userLocation.lat, userLocation.lng], obj.marker.getLatLng());
                if (d < minDist) { minDist = d; nearest = obj; }
            });

            if (nearest) {
                map.setView(nearest.marker.getLatLng(), 16, { animate: true });
                nearest.marker.openPopup();
                nearest.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            btn.disabled = false;
            btn.textContent = 'نزدیک‌ترین نمایندگی به من';
        },
        error => {
            clearTimeout(manualTimeout);
            btn.disabled = false;
            btn.textContent = 'تلاش مجدد';

            if (error && error.code === 1) {
                alert('دسترسی به موقعیت رد شده — در تنظیمات مرورگر Allow کنید.');
            } else {
                alert('خطا در دریافت موقعیت. GPS/اینترنت را بررسی کنید.');
            }
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}


addNearestButton();


