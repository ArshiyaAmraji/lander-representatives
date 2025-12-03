document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map', {
        center: [32.4279, 53.6880],
        zoom: 6,
        minZoom: 5.2,
        maxZoom: 18,
        maxBounds: [[22, 42], [41, 66]],
        maxBoundsViscosity: 0.75,
        zoomControl: false
    });

    function updateMapView() {
        if (window.innerWidth <= 992) {
            map.fitBounds([[24.3, 43.3], [40.7, 64.2]], { padding: [20, 20] });
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

    L.control.attribution({
        position: 'bottomleft',
        prefix: ''
    }).addTo(map);

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
        {city:"تهران",name:"دفتر مرکزی لندر",lat:35.7618,lng:51.4043,addr:"سهروردی شمالی، خیابان خرمشهر، پلاک ۱",phone:"021-91002292"},
        {city:"تهران",name:"لندر شاپ ستارخان",lat:35.7012,lng:51.3456,addr:"ستارخان، بین شادمان و بهبودی، پلاک ۲۴۴",phone:"021-66559575"},
        {city:"تهران",name:"آلارم الکترونیک",lat:35.6965,lng:51.3990,addr:"جمهوری، پاساژ یگانه، پلاک ۲۳",phone:"021-66342702"},
        {city:"کرج",name:"نمایندگی کرج",lat:35.8321,lng:50.9654,addr:"جهانشهر، بلوار جمهوری",phone:"026-32511223"},
        {city:"مشهد",name:"نمایندگی مشهد",lat:36.2970,lng:59.6062,addr:"وکیل آباد، نبش وکیل آباد ۲۵",phone:"051-36081234"},
        {city:"اصفهان",name:"نمایندگی اصفهان",lat:32.6539,lng:51.6660,addr:"چهارباغ بالا، نزدیک سی و سه پل",phone:"031-36654321"},
        {city:"شیراز",name:"فول آپشن",lat:29.5918,lng:52.5833,addr:"چمران، نرسیده به پل چمران",phone:"071-36281900"},
        {city:"تبریز",name:"نمایندگی تبریز",lat:38.0667,lng:46.2833,addr:"امام خمینی، نزدیک میدان ساعت",phone:"041-33345678"},
        {city:"رشت",name:"نمایندگی رشت",lat:37.2808,lng:49.5832,addr:"میدان شهرداری، سبزه میدان",phone:"013-33398765"},
        {city:"قم",name:"نمایندگی قم",lat:34.6399,lng:50.8759,addr:"بلوار امین، نزدیک حرم",phone:"025-37754321"}
    ];

    const listContainer = document.getElementById('agencyList');
    let currentProvince = '';

    agencies.forEach(a => {
        const title = a.city + (a.name ? ' — ' + a.name : '');
        const neshanUrl = `https://neshan.org/maps/places/@${a.lat},${a.lng},16z`;

    L.marker([a.lat, a.lng], {icon: bluePin}).addTo(map)
        .bindPopup(`<div class="popup-content">
            <h4>${title}</h4>
            <p><strong>آدرس:</strong> ${a.addr}</p>
            <p><strong>تلفن:</strong> <a href="tel:${a.phone}">${a.phone}</a></p>
            <a href="${neshanUrl}" target="_blank" class="neshan-btn">مسیریابی با نشان</a>
        </div>`, {
            maxWidth: 340,
            minWidth: 280,
            // این ۴ خط جادویی همه چیز رو حل می‌کنه!
            autoPan: true,
            autoPanPaddingTopLeft: L.point(60, 140),    // فاصله از بالا و چپ (مهم!)
            autoPanPaddingBottomRight: L.point(60, 100), // فاصله از پایین و راست
            keepInView: true,          // پاپ‌آپ حتماً کاملاً در دید باشه
            // autoClose: false,          // چند پاپ‌آپ همزمان باز بمونه (بهتره برای کلاستر نزدیک)
            // closeOnClick: false        // با کلیک روی نقشه بسته نشه (اختیاری، ولی خوبه)
        })
        // این خط خیلی مهمه: وقتی پاپ‌آپ باز میشه، مطمئن شو کاملاً دیده بشه
        .on('popupopen', function(e) {
            const px = map.project(e.popup._latlng);
            const padding = map.getSize().y * 0.25; // ۲۵٪ از ارتفاع صفحه فاصله امن
            if (px.y < padding) {
                map.panTo(e.popup._latlng, { animate: true });
            }
        });

const item = document.createElement('div');
        item.className = 'agency-item';
        item.innerHTML = `<strong>${title}</strong><small>${a.addr}<br><a href="tel:${a.phone}" style="color:#1e40af;font-weight:600">${a.phone}</a></small>`;
        
        item.onclick = () => {
            map.setView([a.lat, a.lng], 16, { animate: true });

            // اسکرول خودکار به نقشه روی موبایل
            if (window.innerWidth <= 992) {
                setTimeout(() => {
                    document.getElementById('map').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 750);
            }
        };
        
        listContainer.appendChild(item);
    });

    // const cityCenters = {"تهران":[35.73,51.40],"کرج":[35.825,50.95],"مشهد":[36.297,59.606],"اصفهان":[32.654,51.666],"شیراز":[29.592,52.583],"تبریز":[38.067,46.283],"رشت":[37.281,49.583],"قم":[34.640,50.876]};
    // Object.entries(cityCenters).forEach(([city,coord]) => {
    //     if(agencies.some(a=>a.city===city)){
    //         L.marker(coord,{icon:L.divIcon({className:'city-name',html:city,iconSize:[null,null]})}).addTo(map);
    //     }
    // });

    function filterList() {
        const term = document.getElementById('searchBox').value.trim().toLowerCase();
        document.querySelectorAll('.agency-item').forEach(el => {
            const text = el.textContent.toLowerCase();
            const matchesSearch = text.includes(term);
            const matchesProvince = !currentProvince || (
                (currentProvince==='tehran' && text.includes('تهران')) ||
                (currentProvince==='alborz' && text.includes('کرج')) ||
                (currentProvince==='khorasan' && text.includes('مشهد')) ||
                (currentProvince==='esfahan' && text.includes('اصفهان')) ||
                (currentProvince==='fars' && text.includes('شیراز')) ||
                (currentProvince==='azerbaijan' && text.includes('تبریز')) ||
                (currentProvince==='gilan' && text.includes('رشت')) ||
                (currentProvince==='qom' && text.includes('قم'))
            );
            el.style.display = matchesSearch && matchesProvince ? 'block' : 'none';
        });
    }

    document.getElementById('searchBox').addEventListener('input', filterList);

    document.getElementById('provinceSelect').addEventListener('change', function(){
        currentProvince = this.value;
        document.getElementById('searchBox').value = '';
        filterList();

        if(!this.value){
            updateMapView();
            return;
        }

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
        map.setView(c.center, c.zoom, {animate:true});
        setTimeout(() => document.querySelector('.list-box').scrollIntoView({behavior:'smooth'}), 400);
    });
});
