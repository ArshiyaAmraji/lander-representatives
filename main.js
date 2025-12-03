document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map', {
        center: [32.4279, 53.6880],
        zoom: window.innerWidth <= 992 ? 5 : 6,
        minZoom: 5.2,
        maxZoom: 18,
        maxBounds: [[20, 38], [44, 70]],
        maxBoundsViscosity: 0.75,
        zoomControl: false
    });

    if (window.innerWidth <= 992) {
        map.setMinZoom(4);
    }

    function updateMapView() {
        if (window.innerWidth <= 992) {
            map.setView([32.4, 54], 4.8);
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

    const agencies = [
        {city:"تهران",name:"دیجی سام (سامان آذرخوش)",lat:35.68696559794489,lng:51.42165512396892,addr:"تهران، میدان امام خمینی، اول فردوسی، پشت شهرداری، پاساژ لباف، طبقه 1",phone:"۰۹۱۲۷۱۴۶۴۸۹ / ۰۲۱۳۶۴۸۳۵۲۹", type:"ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت"},
        {city:"تهران",name:"فروشگاه موتوتیونینگ محسن (آقای شاملو)",lat:35.6892,lng:51.5431,addr:"تهران، اتوبان بسیج، ۲۰ متری افسریه، ۱۵ متری اول، نبش کوچه کنگاوری (۲۹)",phone:"۰۲۱۳۳۱۴۵۵۲۱ / ۰۲۱۳۸۳۳۳۰۹۹", type:"ردیاب جی‌پی‌اس موتورسیکلت"},
        {city:"تهران",name:"فروشگاه رحمانی (آقای مهران رحمانی)",lat:35.7012,lng:51.3456,addr:"تهران، خیابان عباسی، نبش دومین کوچه سمت چپ، پلاک ۲۹۴",phone:"۰۹۱۲۸۴۰۴۵۳۷ / ۰۲۱۵۵۴۱۸۹۸۲", type:"ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت"},
        {city:"تهران",name:"فروشگاه جام جم (آقای فرید نظری)",lat:35.741102313508165,lng:51.549681004715055,addr:"تهرانپارس، خیابان ۱۹۶ شرقی، پلاک ۲۲۹",phone:"۰۹۱۲۸۳۰۰۳۱۰ / ۰۲۱۷۷۸۶۷۵۱", type:"ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت"},
        {city:"تهران",name:"لندرشاپ (آقای رسولی)",lat:35.71284720177635,lng:51.36928971854059,addr:"تهران، ستارخان، بین شادمان و بهبودی، بعد از کوچه علی نجاری، پلاک ۲۴۴، طبقه اول",phone:"۰۹۱۲۲۱۵۱۳۳۰ / ۰۲۱۶۶۵۵۹۵۷۵", type:"ردیاب جی‌پی‌اس خودرو / ردیاب جی‌پی‌اس موتورسیکلت"},
        {city:"کرج",name:"نمایندگی کرج",lat:35.8321,lng:50.9654,addr:"جهانشهر، بلوار جمهوری",phone:"026-32511223", type:"فروش و نصب"},
        {city:"مشهد",name:"نمایندگی مشهد",lat:36.2970,lng:59.6062,addr:"وکیل آباد، نبش وکیل آباد ۲۵",phone:"051-36081234", type:"فروش و خدمات پس از فروش"},
        {city:"اصفهان",name:"نمایندگی اصفهان",lat:32.6539,lng:51.6660,addr:"چهارباغ بالا، نزدیک سی و سه پل",phone:"031-36654321", type:"فروش و نصب تخصصی"},
        {city:"شیراز",name:"فول آپشن",lat:29.5918,lng:52.5833,addr:"چمران، نرسیده به پل چمران",phone:"071-36281900", type:"فروش و نصب + تیونینگ"},
        {city:"تبریز",name:"نمایندگی تبریز",lat:38.0667,lng:46.2833,addr:"امام خمینی، نزدیک میدان ساعت",phone:"041-33345678", type:"فروش و خدمات"},
        {city:"رشت",name:"نمایندگی رشت",lat:37.2808,lng:49.5832,addr:"میدان شهرداری، سبزه میدان",phone:"013-33398765", type:"فروش و نصب"},
        {city:"قم",name:"نمایندگی قم",lat:34.6399,lng:50.8759,addr:"بلوار امین، نزدیک حرم",phone:"025-37754321", type:"فروش و خدمات پس از فروش"}
    ];

    const listContainer = document.getElementById('agencyList');
    let currentProvince = '';
    let currentService = '';

    function getTypeColor(type) {
        return '#2563eb';
    }

    agencies.forEach(a => {
        const title = a.city + (a.name ? ' — ' + a.name : '');
        const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`;

        L.marker([a.lat, a.lng], {icon: bluePin}).addTo(map)
            .bindPopup(`
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
            `, {
                maxWidth: 340,
                minWidth: 280,
                autoPan: true,
                autoPanPaddingTopLeft: L.point(60, 140),
                autoPanPaddingBottomRight: L.point(60, 100),
                keepInView: true
            });

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
            map.setView([a.lat, a.lng], 16, { animate: true });
            if (window.innerWidth <= 992) {
                setTimeout(() => document.getElementById('map').scrollIntoView({behavior: 'smooth', block: 'center'}), 750);
            }
        };

        listContainer.appendChild(item);
    });

    /** -----------------------------------
     *  فیلتر بر اساس جستجو + استان + خدمات
     *  -----------------------------------
     */
    function filterList() {
        const term = document.getElementById('searchBox').value.trim().toLowerCase();

        document.querySelectorAll('.agency-item').forEach(el => {
            const text = el.textContent.toLowerCase();

            const matchesSearch = text.includes(term);
            const matchesProvince = !currentProvince || text.includes(currentProvince);
            const matchesService = !currentService || text.includes(currentService.toLowerCase());

            el.style.display =
                (matchesSearch && matchesProvince && matchesService)
                ? 'block'
                : 'none';
        });
    }

    /** -------------------------------
     *  فیلتر براساس متن (Search)
     *  -------------------------------
     */
    document.getElementById('searchBox').addEventListener('input', filterList);

    /** -------------------------------
     *  فیلتر استان
     *  -------------------------------
     */
    document.getElementById('provinceSelect').addEventListener('change', function(){
        currentProvince = this.value;
        document.getElementById('searchBox').value = '';
        filterList();

        if(!this.value){ updateMapView(); return; }

        const config = {
            tehran:{center:[35.7210,51.3890],zoom:11},
            alborz:{center:[35.8350,50.9700],zoom:12},
            khorasan:{center:[36.2970,59.6062],zoom:12},
            esfahan:{center:[32.6539,51.6660],zoom:12},
            fars:{center:[29.5918,52.5833],zoom:12},
            azerbaijan:{center:[38.0667,46.2833],zoom:12},
            gilan:{center:[37.2808,49.5832],zoom:12},
            qom:{center:[34.6399,50.8759],zoom:13}
        };

        const c = config[this.value];
        if (c) {
            map.setView(c.center, c.zoom, {animate:true});
            setTimeout(() => document.querySelector('.list-box').scrollIntoView({behavior:'smooth'}), 400);
        }
    });

    /** -------------------------------
     *  فیلتر خدمات (نوع فعالیت)
     *  -------------------------------
     */
    const serviceFilter = document.getElementById("serviceFilter");
    const filterBtn = document.getElementById("filterBtn");

    filterBtn.onclick = () => {
        serviceFilter.style.display =
            serviceFilter.style.display === "none" ? "block" : "none";
    };

    serviceFilter.onchange = () => {
        currentService = serviceFilter.value.trim();
        filterList();
    };
});
