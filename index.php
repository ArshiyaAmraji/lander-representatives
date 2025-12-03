<?php
/* 
Template Name: نقشه نمایندگی‌های لندر
Template Post Type: page
*/

get_header(); ?>

<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');

*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Vazirmatn',sans-serif;background:#f8fafc;color:#1e293b;direction:rtl;}

.main-wrapper{
    display:flex;
    flex-direction:row-reverse;
    min-height:100vh;
    padding-top:78px;
    gap:0;
}

#map{
    flex:1;
    height:calc(100vh - 135px);
    border-radius:20px;
    overflow:hidden;
    margin:16px;
    box-shadow:0 0 0 6px white, 0 0 0 10px #e0e7ff, 0 25px 70px rgba(0,0,0,0.25);
    background:white;
    z-index:1;
    position:relative;
}

.container{
    width:100%;
    max-width:480px;
    padding:20px 16px;
    background:#f8fafc;
    height:calc(100vh - 78px);
    display:flex;
    flex-direction:column;
}

.list-box{
    background:white;
    border-radius:20px;
    padding:24px;
    box-shadow:0 15px 50px rgba(0,0,0,.1);
    display:flex;
    flex-direction:column;
    height:100%;
    overflow:hidden;
}

.list-box h2{color:#1e40af;text-align:center;font-size:28px;margin-bottom:20px;}
#agencyList{flex:1;overflow-y:auto;padding-bottom:20px;}

#searchBox,.province-select{
    width:100%;
    padding:16px 20px;
    margin-bottom:16px;
    border:2px solid #e2e8f0;
    border-radius:16px;
    font-size:17px;
    background:#f8fafc;
    font-family:'Vazirmatn',sans-serif;
}

#searchBox:focus,.province-select:focus{
    outline:none;
    border-color:#3b82f6;
    background:white;
    box-shadow:0 0 0 4px rgba(59,130,246,.15);
}

.agency-item{
    background:#f1f5f9;
    border-right:6px solid #3b82f6;
    padding:18px;
    margin:12px 0;
    border-radius:16px;
    cursor:pointer;
    transition:all .3s;
    box-shadow:0 4px 15px rgba(0,0,0,.05);
}

.agency-item:hover{
    transform:translateY(-4px);
    background:#e0f2fe;
    box-shadow:0 12px 30px rgba(59,130,246,.25);
}

.agency-item strong{color:#1e40af;font-size:19px;display:block;margin-bottom:6px;}
.agency-item small{color:#475569;font-size:15px;line-height:1.8;}

/* راهنما */
.map-hint{
    position:absolute;
    top:16px;
    right:16px;
    background:rgba(30,64,175,0.95);
    color:white;
    padding:10px 16px;
    border-radius:16px;
    font-size:14px;
    font-weight:600;
    z-index:600;
    pointer-events:none;
    box-shadow:0 8px 32px rgba(0,0,0,0.3);
    backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,0.2);
    opacity:0;
    transition:opacity 0.8s ease;
}

/* پاپ‌آپ */
.popup-content{text-align:center;padding:20px 22px;direction:rtl;font-family:'Vazirmatn',sans-serif;}
.popup-content h4{color:#1e40af;margin:0 0 14px;font-size:19px;font-weight:900;}
.popup-content p{margin:10px 0;color:#475569;font-size:14.5px;}
.neshan-btn{display:block;margin:18px auto 0;padding:13px 32px;background:#10b981;color:white;border-radius:14px;font-weight:bold;text-decoration:none;transition:all .3s;}
.neshan-btn:hover{background:#0d9a6e;transform:translateY(-2px);}

/* موبایل - کاملاً چسبیده + اسکرول خودکار */
@media(max-width:992px){
    .main-wrapper{flex-direction:column;}
    .container{order:1;padding:16px 12px 0;}
    .list-box{border-radius:0 0 28px 28px;margin:0;padding:24px 20px;}
    #map{
        order:2;
        height:55vh;
        min-height:480px;
        margin:0 12px 12px;
        border-radius:0 0 28px 28px;
    }
    .map-hint{
        bottom:16px;
        top:auto;
        left:50%;
        right:auto;
        transform:translateX(-50%);
        font-size:13.5px;
        padding:9px 18px;
    }
}
</style>

<div class="main-wrapper">
    <div id="map">
        <div class="map-hint" id="mapHint">
            برای مشاهده اطلاعات، روی نشانگر آبی کلیک کنید
        </div>
    </div>

    <div class="container">
        <div class="list-box">
            <h2>لیست نمایندگی‌ها</h2>
            <select id="provinceSelect" class="province-select">
                <option value="">انتخاب استان</option>
                <option value="tehran">تهران</option>
                <option value="alborz">البرز (کرج)</option>
                <option value="khorasan">خراسان رضوی (مشهد)</option>
                <option value="esfahan">اصفهان</option>
                <option value="fars">فارس (شیراز)</option>
                <option value="azerbaijan">آذربایجان شرقی (تبریز)</option>
                <option value="gilan">گیلان (رشت)</option>
                <option value="qom">قم</option>
            </select>
            <input type="text" id="searchBox" placeholder="جستجو در شهر یا نمایندگی...">
            <div id="agencyList"></div>
        </div>
    </div>
</div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
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

    L.control.zoom({position:'topleft', zoomInTitle:'بزرگ‌نمایی', zoomOutTitle:'کوچک‌نمایی'}).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenStreetMap contributors'}).addTo(map);

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
                autoPan: true,
                autoPanPaddingTopLeft: [60, 140],
                autoPanPaddingBottomRight: [60, 100],
                keepInView: true
            });

        const item = document.createElement('div');
        item.className = 'agency-item';
        item.innerHTML = `<strong>${title}</strong><small>${a.addr}<br><a href="tel:${a.phone}" style="color:#1e40af;font-weight:600">${a.phone}</a></small>`;
        
        // این قسمت مهم: اسکرول خودکار روی موبایل
        item.onclick = () => {
            map.setView([a.lat, a.lng], 16, {animate: true});

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

    // نمایش راهنما + محو شدن خودکار
    setTimeout(() => {
        document.getElementById('mapHint').style.opacity = '0.95';
        setTimeout(() => {
            document.getElementById('mapHint').style.opacity = '0';
        }, 8000);
    }, 1000);

    // جستجو و فیلتر استان (ساده و سریع)
    document.getElementById('searchBox').addEventListener('input', function() {
        const term = this.value.toLowerCase();
        document.querySelectorAll('.agency-item').forEach(el => {
            el.style.display = el.textContent.toLowerCase().includes(term) ? 'block' : 'none';
        });
    });

    document.getElementById('provinceSelect').addEventListener('change', function() {
        const config = {
            tehran: [35.7210,51.3890,11],
            alborz: [35.8350,50.9700,12],
            khorasan: [36.2970,59.6062,12],
            esfahan: [32.6539,51.6660,12],
            fars: [29.5918,52.5833,12],
            azerbaijan: [38.0667,46.2833,12],
            gilan: [37.2808,49.5832,12],
            qom: [34.6399,50.8759,13]
        };
        if (this.value && config[this.value]) {
            const [lat,lng,zoom] = config[this.value];
            map.setView([lat