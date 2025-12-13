//globals
let map;
let agencyMarkers = [];
let userLocation = null;
let userMarker = null;
let currentProvince = '';
let currentCity = '';
let currentService = '';
let markersLayer;
let currentProvinceKey = '';


const IRAN_BOUNDS = [[20, 38], [44, 70]];

function updateMapView() {
    if (window.innerWidth <= 992) {
        map.setView([33.5, 52.5], 4.6);
    } else {
        map.fitBounds([[25, 44], [39.8, 63.4]], { padding: [50, 50] });
    }
}

function normalizeText(str) {
    return str
        .trim()
        .replace(/\u200c/g, '') // حذف نیم‌فاصله
        .replace(/\s+/g, ' ');
}


document.addEventListener('DOMContentLoaded', function () {

    map = L.map('map', {
        center: [32.4279, 53.6880],
        zoom: window.innerWidth <= 992 ? 5 : 6,
        minZoom: window.innerWidth <= 992 ? 4.8 : 5.1,
        maxZoom: 18,
        maxBounds: IRAN_BOUNDS,
        maxBoundsViscosity: 0.75,
        zoomSnap: 0.1,
        zoomDelta: 1,
        zoomControl: false
    });

    function openPopupCentered(marker) {
        const latLng = marker.getLatLng();
        const isMobile = window.innerWidth <= 992;
        const zoomLevel = isMobile ? 16 : 15.5;

        map.closePopup();

        map.flyTo(latLng, zoomLevel, {
            animate: true,
            duration: 0.9
        });

        // بعد از پایان حرکت
        map.once('moveend', () => {
            marker.openPopup();
        });
    }


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({
        position: 'topleft',
        zoomInTitle: 'بزرگ‌نمایی',
        zoomOutTitle: 'کوچک‌نمایی'
    }).addTo(map);

    L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map);

    updateMapView();
    window.addEventListener('resize', updateMapView);

    // --------------------------------------------------
    // آیکون‌ها و لایه مارکرها
    // --------------------------------------------------
    const bluePin = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    markersLayer = L.layerGroup().addTo(map);

    // --------------------------------------------------
    // agencys
    // --------------------------------------------------
    const agencies = [
        { city: "تهران", name: "دفتر مرکزی", lat: 35.736942070098976, lng: 51.432493071143035, addr: "تهران، خیابان سهروردی، خیابان خرمشهر، خیابان عشقیار (نیلوفر)، کوچه چهارم (حورسی)، پلاک ۱", phone: "09127146489 / 02136483529", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "دیجی سام (سامان آذرخوش)", lat: 35.68696559794489, lng: 51.42165512396892, addr: "تهران، میدان امام خمینی، اول فردوسی، پشت شهرداری، پاساژ لباف، طبقه 1", phone: "09127146489 / 02136483529", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه موتوتیونینگ محسن (آقای شاملو)", lat: 35.654444524066555, lng: 51.49072091700788, addr: "تهران، اتوبان بسیج، ۲۰ متری افسریه، ۱۵ متری اول، نبش کوچه کنگاوری (۲۹)", phone: "02133145521 / 02138333099", type: "ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه رحمانی (آقای مهران رحمانی)", lat: 35.7012, lng: 51.3456, addr: "تهران، خیابان عباسی، نبش دومین کوچه سمت چپ، پلاک ۲۹۴", phone: "09128404537 / 02155418982", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه جام جم (آقای فرید نظری)", lat: 35.74112645085245, lng: 51.549589049711265, addr: "تهرانپارس، خیابان ۱۹۶ شرقی، پلاک ۲۲۹", phone: "09128300310 / 0217786751", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "لندرشاپ (آقای رسولی)", lat: 35.71284445034936, lng: 51.36932671244907, addr: "تهران، ستارخان، بین شادمان و بهبودی، بعد از کوچه علی نجاری، پلاک ۲۴۴، طبقه اول", phone: "09122151330 / 02166559575", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "آیبینو (محمدرضا عاشق)", lat: 35.69490268819197, lng: 51.40676256522828, addr: "تهران، خیابان جمهوری، پاساژ علاالدین ۲، طبقه همکف، واحد ۲۰", phone: "09129259105 / 02166170821", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "زنگوله (مهرداد گرجی)", lat: 35.735, lng: 51.3234, addr: "تهرانپارس، میدان شاهد، خیابان ۱۹۶ شرقی، بین خیابان ۱۳۱ و ۱۳۳، پلاک ۳۷۳", phone: "09354223037", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "علیرضا جابری (رضا اسپرت)", lat: 35.68507926936174, lng: 51.490814939322775, addr: "تهران، پیروزی، بلوار ابوذر، بین پل اول و دوم، کوچه جواهری، ششم غربی پلاک 1010", phone: "۰۹۱۲۳۳۸۶۴۵۴", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "ری", name: "جواد سیستم (آقای جواد پرتوی)", lat: 35.36543079764921, lng: 51.23044967671497, addr: "تهران، حسن آباد فشافویه، بلوار امام، جنب حوزه بسیج، پلاک ۹۱۵", phone: "۰۹۱۲۸۹۸۷۵۳۳", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه بهار سیستم (آقای اکبری)", lat: 35.68775732228994, lng: 51.42020201840585, addr: "تهران خیابان فردوسی جنوبی بالاتر از میدان امام خمینی پاساژ 26 طبقه همکف پلاک 11", phone: "۰۹۱۲۲۴۸۹۴۲۵ / ۰۲۱۶۶۷۶۹۳۵۲", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "فروشگاه بهار سیستم (آقای اکبری)", lat: 35.6703036911901, lng: 51.38341069224023, addr: "تهران، خیابان قزوین، خیابان شهید ابراهیمی (عباسی)، پلاک ۳۶۹", phone: "۰۲۱۵۵۴۲۶۷۱۲ / ۰۹۱۲۱۰۵۹۷۳۱", type: "دزدگیر اماکن و منازل / ردیاب جی‌پی‌اس خودرو" },
        { city: "تهران", name: "تعمیرگاه موتور زد (آقای امانی)", lat: 35.71967118671216, lng: 51.430824131481415, addr: "تهران، میدان هفت تیر، خیابان بهارشیراز، خیابان سلیمان خاطر، سمت چپ بلوار، پلاک ۳۴", phone: "۰۹۱۹۷۷۳۳۴۱۷", type: "دزدگیر اماکن و منازل / ردیاب جی‌پی‌اس خودرو" },
        { city: "تهران", name: "تعمیرگاه موتور زد (آقای امانی)", lat: 35.72428530254722, lng: 51.41616941976933, addr: " تهران، خیابان مطهری، نبش میرزای شیرازی، ضلع شمال غربی، پلاک ۲۸۵", phone: "۰۹۱۹۷۷۳۳۴۱۷", type: "دزدگیر اماکن و منازل / ردیاب جی‌پی‌اس خودرو" },
        { city: "تهران", name: "فروشگاه نگین غرب (آقای مرجانی)", lat: 35.735, lng: 51.3234, addr: "تهران، خیابان جلال آل احمد، نرسیده به اشرفی اصفهانی، خیابان شایق شمالی", phone: "۰۹۱۲۲۳۸۰۳۷۸", type: "ردیاب جی‌پی‌اس خودرو" },
        { city: "تهران", name: "فروشگاه آپشن سیتی (آقای مصطفی پوربخش)", lat: 35.735, lng: 51.3234, addr: "سهروردی شمالی، خیابان خلیل حسینی، سمت چپ، پلاک ۷۴", phone: "۰۲۱۸۸۷۴۶۹۶۳ / ۰۹۱۲۲۸۰۳۱۱۹", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "", lat: 35.735, lng: 51.3234, addr: "", phone: "", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "", lat: 35.735, lng: 51.3234, addr: "", phone: "", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "", lat: 35.735, lng: 51.3234, addr: "", phone: "", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "", lat: 35.735, lng: 51.3234, addr: "", phone: "", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "", lat: 35.735, lng: 51.3234, addr: "", phone: "", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },
        { city: "تهران", name: "", lat: 35.735, lng: 51.3234, addr: "", phone: "", type: "ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت" },




        { city: "کرج", name: "نمایندگی کرج", lat: 35.8321, lng: 50.9654, addr: "جهانشهر، بلوار جمهوری", phone: "026-32511223", type: "فروش و نصب" },
        { city: "مشهد", name: "نمایندگی مشهد", lat: 36.2970, lng: 59.6062, addr: "وکیل آباد، نبش وکیل آباد ۲۵", phone: "051-36081234", type: "فروش و خدمات پس از فروش" },
        { city: "اصفهان", name: "نمایندگی اصفهان", lat: 32.6539, lng: 51.6660, addr: "چهارباغ بالا، نزدیک سی و سه پل", phone: "031-36654321", type: "فروش و نصب تخصصی" },
        { city: "شیراز", name: "فول آپشن", lat: 29.5918, lng: 52.5833, addr: "چمران، نرسیده به پل چمران", phone: "071-36281900", type: "فروش و نصب + تیونینگ" },
        { city: "تبریز", name: "نمایندگی تبریز", lat: 38.0667, lng: 46.2833, addr: "امام خمینی، نزدیک میدان ساعت", phone: "041-33345678", type: "فروش و خدمات" },
        { city: "رشت", name: "نمایندگی رشت", lat: 37.2808, lng: 49.5832, addr: "میدان شهرداری، سبزه میدان", phone: "013-33398765", type: "فروش و نصب" },
        { city: "قم", name: "نمایندگی قم", lat: 34.6399, lng: 50.8759, addr: "بلوار امین، نزدیک حرم", phone: "025-37754321", type: "فروش و خدمات پس از فروش" }
    ];

    const listContainer = document.getElementById('agencyList');

    // --------------------------------------------------
    // توابع کمکی
    // --------------------------------------------------
    function getTypeColor(type) {
        return '#2563eb';
    }

    // --------------------------------------------------
    // ساخت مارکرها و آیتم‌های لیست
    // --------------------------------------------------
    function getPhoneHtml(phone, forPopup = false) {
        const phones = phone.split('/').map(p => p.trim());
        let html = '';

        phones.forEach((p, idx) => {
            if (idx > 0) {
                html += ' <span class="phone-separator">•</span> ';
            }

            if (forPopup) {
                // فقط توی پاپ‌آپ: بدون آیکون
                // html += `<a href="tel:${p}" class="phone-link popup-only">${p}</a>`;
            } else {
                // فقط توی لیست: با آیکون
                html += `
                    <a href="tel:${p}" class="phone-link">
                        <svg class="phone-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        ${p}
                    </a>`;
            }
        });

        return html;
    }

    agencies.forEach(a => {
        const title = a.name ? `${a.name}` : 'نمایندگی لندر';
        const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`;
        const isMobile = window.innerWidth <= 992;

        // پاپ‌آپ روی نقشه
        const popupHtml = `
        <div class="popup-content">
            <h4>${title}</h4>
            
            <a href="${gmapUrl}" target="_blank" class="neshan-btn" style="background:#10b981">
                مسیریابی با گوگل مپ
            </a>
        </div>`;

        const popupOptions = {
            maxWidth: 340,
            minWidth: 280,
            autoPan: false,
            closeButton: false,
        };

        const marker = L.marker([a.lat, a.lng], { icon: bluePin })
            .bindPopup(popupHtml, popupOptions);

        marker.addTo(markersLayer);

        // آیتم لیست
        const item = document.createElement('div');
        item.className = 'agency-item';
        item.innerHTML = `
            <strong>${title}</strong>
            
            <div class="activity-badge" style="background:${getTypeColor(a.type)}">
                ${a.type}
            </div>
            
            <div class="agency-address">
                ${a.addr}
            </div>
            
            <div class="phone-section">
                ${getPhoneHtml(a.phone)}
            </div>`;

        item.onclick = () => {
            openPopupCentered(marker, window.innerWidth <= 992 ? 140 : 110);

            // فقط موبایل: اسکرول به نقشه
            if (window.innerWidth <= 992) {
                setTimeout(() => {
                    document.getElementById('map').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 500);
            }
        };


        // ذخیره برای فیلتر و مرتب‌سازی
        agencyMarkers.push({
            marker: marker,
            element: item,
            text: `${a.city} ${a.name} ${a.addr} ${a.phone} ${a.type}`.toLowerCase(),
            type: a.type
        });

        listContainer.appendChild(item);
    });

    // --------------------------------------------------
    // فیلترها و انتخاب استان/شهرستان
    // --------------------------------------------------
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

    const citiesByProvince = {
        tehran: [
            { id: 'tehran', label: 'تهران' },
            { id: 'rey', label: 'ری' },
            { id: 'eslamshahr', label: 'اسلامشهر' },
            { id: 'shahrqods', label: 'شهرقدس' },
            { id: 'shahriar', label: 'شهریار' },
            { id: 'malard', label: 'ملارد' },
            { id: 'robatkarim', label: 'رباط کریم' },
            { id: 'varamin', label: 'ورامین' }
        ],
        alborz: [
            { id: 'karaj', label: 'کرج' },
            { id: 'fardis', label: 'فردیس' },
            { id: 'nazarabad', label: 'نظرآباد' },
            { id: 'hashtgerd', label: 'هشتگرد' }
        ]
    };


    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');

    const configZoom = {
        tehran: { center: [35.7210, 51.3890], zoom: 9 },
        alborz: { center: [35.864412, 50.869161], zoom: 11 },
        khorasan: { center: [36.2970, 59.6062], zoom: 12 },
        esfahan: { center: [32.6539, 51.6660], zoom: 12 },
        fars: { center: [29.5918, 52.5833], zoom: 12 },
        azerbaijan: { center: [38.0667, 46.2833], zoom: 12 },
        gilan: { center: [37.2808, 49.5832], zoom: 12 },
        qom: { center: [34.6399, 50.8759], zoom: 12 }
    };

    const cityZoom = {
        tehran: { center: [35.698, 51.436], zoom: 11 },     // مرکز واقعی نمایندگی‌های تهران، زوم مناسب برای پوشش همه
        rey: { center: [35.3654, 51.2304], zoom: 14 },      // تک نمایندگی ری – زوم بالاتر برای دید بهتر جزئیات
        eslamshahr: { center: [35.5466, 51.2350], zoom: 13 },
        shahrqods: { center: [35.7129, 51.1130], zoom: 13 },
        shahriar: { center: [35.6598, 51.0588], zoom: 12 }, // کمی گسترده‌تر
        malard: { center: [35.6670, 50.9789], zoom: 13 },
        robatkarim: { center: [35.4849, 51.0826], zoom: 12 }, // مختصات دقیق‌تر
        varamin: { center: [35.3256, 51.6470], zoom: 12 },

        karaj: { center: [35.8354, 50.9604], zoom: 12 },     // کاهش از ۱۳ به ۱۲ برای پوشش بهتر کرج
        fardis: { center: [35.7216, 50.9759], zoom: 13 },
        nazarabad: { center: [35.9560, 50.6095], zoom: 13 },
        hashtgerd: { center: [35.9614, 50.6786], zoom: 13 }
    };

    provinceSelect.addEventListener('change', function () {
        const key = this.value;

        // همه استان‌ها
        if (!key) {
            currentProvinceKey = '';
            currentProvince = '';
            currentCity = '';

            updateMapView();

            citySelect.innerHTML = '<option value="">همه شهرستان‌ها</option>';
            citySelect.style.display = 'none';

            filterList();
            return;
        }

        // استان خاص
        currentProvinceKey = key;
        currentProvince = provinceMap[key] || '';

        if (configZoom[key]) {
            map.setView(
                configZoom[key].center,
                configZoom[key].zoom,
                { animate: true }
            );
        }

        const cities = citiesByProvince[key];

        // اگر استان شهرستان ندارد
        if (!cities || !cities.length) {
            citySelect.style.display = 'none';
            return;
        }

        citySelect.style.display = 'block';
        citySelect.innerHTML = '<option value="">همه شهرستان‌ها</option>';

        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city.id;        // id
            opt.textContent = city.label; // label
            citySelect.appendChild(opt);
        });

        currentCity = '';
        filterList();
    });





    citySelect.addEventListener('change', function () {
        const cityId = this.value;
        currentCity = cityId;

        // همیشه زوم شهرستان را اعمال کن، حتی اگر هیچ نمایندگی نباشد
        if (cityId && cityZoom[cityId]) {
            map.setView(
                cityZoom[cityId].center,
                cityZoom[cityId].zoom,
                { animate: true }
            );
        } else if (!cityId && currentProvinceKey && configZoom[currentProvinceKey]) {
            // بازگشت به زوم استان
            map.setView(
                configZoom[currentProvinceKey].center,
                configZoom[currentProvinceKey].zoom,
                { animate: true }
            );
        }

        filterList();  // فیلتر بعد از زوم
    });


    // جستجو
    document.getElementById('searchBox').addEventListener('input', filterList);

    // فیلتر خدمات (از مودال)
    document.getElementById("serviceFilter").onchange = () => {
        currentService = document.getElementById("serviceFilter").value.trim();
        filterList();
    };

    // مودال انتخاب خدمات
    (function () {
        const modal = document.getElementById("serviceModal");
        const filterBtn = document.getElementById("filterBtn");
        const closeService = document.getElementById("closeService");
        const serviceSelect = document.getElementById("serviceSelect");
        const applyBtn = document.getElementById("applyService");
        const hiddenService = document.getElementById("serviceFilter");

        function openModal() {
            if (hiddenService) serviceSelect.value = hiddenService.value || "";
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
        modal.addEventListener("click", e => e.target === modal && closeModal());
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
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

    // --------------------------------------------------
    // توابع فیلتر و مرتب‌سازی
    // --------------------------------------------------
    function filterList() {
        const term = document.getElementById('searchBox').value.trim().toLowerCase();
        markersLayer.clearLayers();

        let hasVisible = false;

        agencyMarkers.forEach(obj => {
            const fullText = obj.text || obj.element.textContent.toLowerCase();

            const matchesSearch = fullText.includes(term);
            const matchesProvince = !currentProvince || fullText.includes(currentProvince);
            const matchesCity = !currentCity || obj.element.textContent.includes(citiesByProvince[currentProvinceKey]?.find(c => c.id === currentCity)?.label || '');
            const matchesService = !currentService || obj.type.includes(currentService);
            const shouldShow = matchesSearch && matchesProvince && matchesCity && matchesService;

            obj.element.style.display = shouldShow ? 'block' : 'none';

            if (shouldShow) {
                obj.marker.addTo(markersLayer);
                hasVisible = true;
            }
        });

        // if (!hasVisible) updateMapView();
    }

    function resetProvinceFilter() {
        currentProvince = '';
        currentCity = '';
        document.getElementById('provinceSelect').value = '';
        document.getElementById('searchBox').value = '';

        const citySelect = document.getElementById('citySelect');
        citySelect.style.display = 'none';
        citySelect.innerHTML = '<option value="">همه شهرستان‌ها</option>';

        filterList();
    }

    function sortAgenciesByDistance(userLatLng) {
        agencyMarkers.forEach(obj => {
            const markerLatLng = obj.marker.getLatLng();
            obj.distance = map.distance(userLatLng, markerLatLng) / 1000; // به کیلومتر
        });

        // مرتب‌سازی بر اساس فاصله
        agencyMarkers.sort((a, b) => a.distance - b.distance);

        const list = document.getElementById('agencyList');
        list.innerHTML = '';

        agencyMarkers.forEach((obj, index) => {
            // حذف کلاس قبلی نزدیک‌ترین
            obj.element.classList.remove('nearest-one');

            // فقط نزدیک‌ترین رنگ ویژه بگیره
            if (index === 0) {
                obj.element.classList.add('nearest-one');
            }

            // ساخت متن فاصله
            const km = obj.distance.toFixed(1);
            const distanceText = `<div class="distance-tag ${index === 0 ? 'nearest' : ''}">
                ${index === 0 ? 'نزدیک‌ترین • ' : ''}${km} کیلومتر
            </div>`;

            // حذف فاصله قبلی (اگر وجود داشت)
            const oldTag = obj.element.querySelector('.distance-tag');
            if (oldTag) oldTag.remove();

            // اضافه کردن تگ فاصله بعد از activity-badge
            const badge = obj.element.querySelector('.activity-badge');
            if (badge) {
                badge.insertAdjacentHTML('afterend', distanceText);
            } else {
                obj.element.querySelector('strong').insertAdjacentHTML('afterend', distanceText);
            }

            list.appendChild(obj.element);
        });
    }

    // --------------------------------------------------
    // پیدا کردن نزدیک‌ترین نمایندگی
    // --------------------------------------------------
    function findNearestAgency() {
        const btn = document.getElementById('findNearestBtn');

        if (!navigator.geolocation) {
            alert('مرورگر از موقعیت مکانی پشتیبانی نمی‌کند');
            return;
        }

        resetProvinceFilter();
        btn.disabled = true;
        btn.textContent = 'در حال دریافت موقعیت...';

        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (userMarker) map.removeLayer(userMarker);

                userMarker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                })
                    .addTo(map)
                    .bindPopup('موقعیت شما')
                    .openPopup();

                sortAgenciesByDistance([userLocation.lat, userLocation.lng]);

                markersLayer.clearLayers();
                agencyMarkers.forEach(obj => obj.marker.addTo(markersLayer));

                const nearest = agencyMarkers[0];
                if (nearest) {
                    map.setView(nearest.marker.getLatLng(), 16, { animate: true });
                    nearest.marker.openPopup();
                    nearest.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                btn.disabled = false;
                btn.textContent = 'نزدیک‌ترین نمایندگی به من';
            },
            () => {
                btn.disabled = false;
                btn.textContent = 'تلاش مجدد';
                alert('خطا در دریافت موقعیت مکانی');
            }
        );
    }

    // اتصال دکمه نزدیک‌ترین نمایندگی
    const nearestBtn = document.getElementById('findNearestBtn');
    if (nearestBtn) nearestBtn.addEventListener('click', findNearestAgency);
    // ===== اتصال دکمه موبایل به تابع نزدیک‌ترین نمایندگی =====
    const nearestBtnMobile = document.getElementById('findNearestBtnMobile');
    if (nearestBtnMobile) {
        nearestBtnMobile.addEventListener('click', findNearestAgency);
    }
});

document.querySelector('.go-to-map-btn')?.addEventListener('click', () => {
    document.getElementById('map').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});
