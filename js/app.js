/**
 * 酒店订房H5 - 客人端 JavaScript
 * 使用LeanCloud存储数据
 */

// ============================================
// 配置与常量
// ============================================

// 提示：Candy需要替换为自己的LeanCloud AppID和AppKey
// 请到 https://leancloud.cn 注册并创建应用，获取AppID和AppKey
const LEANCloudConfig = {
    appId: 'YOUR_LEANCloud_APP_ID',      // 替换为你的App ID
    appKey: 'YOUR_LEANCloud_APP_KEY',     // 替换为你的App Key
    serverURL: 'https://YOUR_APP_ID.lc-cn-n1.cloudnative.cn'  // 替换为你的服务器地址
};

// 默认房型数据（LeanCloud未配置时使用）
const DEFAULT_ROOM_TYPES = [
    { id: '1', name: '标准大床房', price: 298 },
    { id: '2', name: '标准双床房', price: 328 },
    { id: '3', name: '豪华套房', price: 528 },
    { id: '4', name: '商务套房', price: 668 }
];

// ============================================
// 工具函数
// ============================================

/**
 * 显示Toast消息
 */
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 计算两日期之间晚数
 */
function calculateNights(checkIn, checkOut) {
    const diffTime = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 验证手机号
 */
function validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 获取本地存储的配置
 */
function getLocalConfig() {
    const config = localStorage.getItem('hotelConfig');
    return config ? JSON.parse(config) : null;
}

/**
 * 保存配置到本地
 */
function saveLocalConfig(config) {
    localStorage.setItem('hotelConfig', JSON.stringify(config));
}

// ============================================
// LeanCloud 数据操作
// ============================================

let AV;
let RoomTypeClass;
let BookingClass;

// 初始化LeanCloud
function initLeanCloud() {
    if (typeof AV === 'undefined') {
        AV = require('leancloud-storage');
    }
    
    AV.init({
        appId: LEANCloudConfig.appId,
        appKey: LEANCloudConfig.appKey,
        serverURL: LEANCloudConfig.serverURL
    });
    
    RoomTypeClass = AV.Object.extend('RoomType');
    BookingClass = AV.Object.extend('Booking');
}

// 检查LeanCloud是否已配置
function isLeanCloudConfigured() {
    return LEANCloudConfig.appId !== 'YOUR_LEANCloud_APP_ID';
}

// ============================================
// 页面初始化
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // 设置最小日期为今天
    const today = formatDate(new Date());
    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    
    checkInDate.min = today;
    checkOutDate.min = today;
    
    // 恢复保存的配置
    restoreConfig();
    
    // 加载房型列表
    await loadRoomTypes();
    
    // 绑定事件
    bindEvents();
});

// 恢复保存的配置
function restoreConfig() {
    const config = getLocalConfig();
    if (config) {
        // 恢复Logo
        if (config.logo) {
            const logoPreview = document.getElementById('logoPreview');
            const logoPlaceholder = document.getElementById('logoPlaceholder');
            logoPreview.src = config.logo;
            logoPreview.classList.remove('hidden');
            logoPlaceholder.classList.add('hidden');
        }
        
        // 恢复酒店名称
        if (config.hotelName) {
            document.getElementById('hotelName').textContent = config.hotelName;
        }
        
        // 恢复联系电话
        if (config.phone) {
            document.getElementById('footerPhone').textContent = config.phone;
        }
    }
}

// 加载房型列表
async function loadRoomTypes() {
    const roomTypeSelect = document.getElementById('roomType');
    
    // 如果LeanCloud已配置，从云端加载
    if (isLeanCloudConfigured()) {
        try {
            initLeanCloud();
            const query = new AV.Query('RoomType');
            query.equalTo('enabled', true);
            query.ascending('createdAt');
            const results = await query.find();
            
            if (results.length > 0) {
                roomTypeSelect.innerHTML = '<option value="">请选择房型</option>';
                results.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = `${room.get('name')} - ¥${room.get('price')}/晚`;
                    option.dataset.price = room.get('price');
                    option.dataset.name = room.get('name');
                    roomTypeSelect.appendChild(option);
                });
                return;
            }
        } catch (error) {
            console.warn('从LeanCloud加载房型失败，使用默认数据:', error);
        }
    }
    
    // 使用默认房型数据
    roomTypeSelect.innerHTML = '<option value="">请选择房型</option>';
    DEFAULT_ROOM_TYPES.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} - ¥${room.price}/晚`;
        option.dataset.price = room.price;
        option.dataset.name = room.name;
        roomTypeSelect.appendChild(option);
    });
}

// ============================================
// 事件绑定
// ============================================

function bindEvents() {
    // Logo上传
    const logoUpload = document.getElementById('logoUpload');
    const logoInput = document.getElementById('logoInput');
    const logoPreview = document.getElementById('logoPreview');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    
    logoUpload.addEventListener('click', () => logoInput.click());
    
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                logoPreview.src = dataUrl;
                logoPreview.classList.remove('hidden');
                logoPlaceholder.classList.add('hidden');
                
                // 保存到本地配置
                const config = getLocalConfig() || {};
                config.logo = dataUrl;
                saveLocalConfig(config);
                
                showToast('Logo已上传');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 入住日期变化
    document.getElementById('checkInDate').addEventListener('change', (e) => {
        const checkOut = document.getElementById('checkOutDate');
        const selectedDate = e.target.value;
        
        // 设置退房日期最小值为入住次日
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOut.min = formatDate(nextDay);
        
        // 如果退房日期早于入住日期，自动调整
        if (checkOut.value && checkOut.value <= selectedDate) {
            checkOut.value = formatDate(nextDay);
        }
        
        updateNightInfo();
    });
    
    // 退房日期变化
    document.getElementById('checkOutDate').addEventListener('change', updateNightInfo);
    
    // 房型选择变化
    document.getElementById('roomType').addEventListener('change', (e) => {
        const priceDisplay = document.getElementById('roomPriceDisplay');
        const selectedPrice = document.getElementById('selectedRoomPrice');
        const selectedOption = e.target.options[e.target.selectedIndex];
        
        if (e.target.value) {
            priceDisplay.style.display = 'flex';
            selectedPrice.textContent = `¥${selectedOption.dataset.price}`;
        } else {
            priceDisplay.style.display = 'none';
        }
    });
    
    // 表单提交
    document.getElementById('bookingForm').addEventListener('submit', handleSubmit);
    
    // 返回按钮
    document.getElementById('backBtn').addEventListener('click', () => {
        document.getElementById('successModal').classList.remove('active');
        document.getElementById('bookingForm').reset();
        document.getElementById('roomPriceDisplay').style.display = 'none';
        updateNightInfo();
    });
}

// 更新晚数信息
function updateNightInfo() {
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;
    const nightInfo = document.getElementById('nightInfo');
    
    if (checkIn && checkOut) {
        const nights = calculateNights(checkIn, checkOut);
        nightInfo.textContent = `共 ${nights} 晚`;
    } else {
        nightInfo.textContent = '请选择入住日期';
    }
}

// ============================================
// 表单提交处理
// ============================================

async function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    
    // 获取表单数据
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const guestName = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const roomTypeSelect = document.getElementById('roomType');
    const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
    
    // 表单验证
    if (!checkInDate || !checkOutDate) {
        showToast('请选择入住和退房日期');
        return;
    }
    
    if (!guestName) {
        showToast('请输入入住人姓名');
        document.getElementById('guestName').focus();
        return;
    }
    
    if (!validatePhone(phone)) {
        showToast('请输入正确的手机号码');
        document.getElementById('phone').focus();
        return;
    }
    
    if (!roomTypeSelect.value) {
        showToast('请选择房型');
        return;
    }
    
    // 显示加载状态
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const bookingData = {
        guestName,
        phone,
        checkInDate,
        checkOutDate,
        roomTypeName: selectedOption.dataset.name,
        roomPrice: parseInt(selectedOption.dataset.price),
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        // 保存到数据源
        await saveBooking(bookingData);
        
        // 显示成功弹窗
        showSuccessModal(bookingData);
        
    } catch (error) {
        console.error('保存失败:', error);
        showToast('提交失败，请稍后重试');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// 保存预约数据
async function saveBooking(data) {
    // 如果LeanCloud已配置，保存到云端
    if (isLeanCloudConfigured()) {
        try {
            initLeanCloud();
            const Booking = AV.Object.extend('Booking');
            const booking = new Booking();
            
            booking.set('guestName', data.guestName);
            booking.set('phone', data.phone);
            booking.set('checkInDate', new Date(data.checkInDate));
            booking.set('checkOutDate', new Date(data.checkOutDate));
            booking.set('roomType', data.roomTypeName);
            booking.set('roomPrice', data.roomPrice);
            booking.set('status', data.status);
            
            await booking.save();
            return;
        } catch (error) {
            console.warn('保存到LeanCloud失败:', error);
            // 如果云端保存失败，继续尝试本地保存
        }
    }
    
    // 保存到本地存储
    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    data.id = Date.now().toString();
    bookings.push(data);
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
}

// ============================================
// 成功弹窗
// ============================================

function showSuccessModal(data) {
    const modal = document.getElementById('successModal');
    const summary = document.getElementById('bookingSummary');
    const nights = calculateNights(data.checkInDate, data.checkOutDate);
    
    // 计算总房价
    const totalPrice = data.roomPrice * nights;
    
    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">入住日期</span>
            <span class="summary-value">${data.checkInDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">退房日期</span>
            <span class="summary-value">${data.checkOutDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">入住人</span>
            <span class="summary-value">${data.guestName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">手机号码</span>
            <span class="summary-value">${data.phone}</span>
        </div>
        <div class="summary-item highlight">
            <span class="summary-label">房型</span>
            <span class="summary-value">${data.roomTypeName}</span>
        </div>
        <div class="summary-item highlight">
            <span class="summary-label">房价</span>
            <span class="summary-value">¥${totalPrice} (${nights}晚)</span>
        </div>
    `;
    
    modal.classList.add('active');
}

// ============================================
// 管理员模式切换
// ============================================

// 连续点击酒店名称5次进入管理模式
let clickCount = 0;
let clickTimer = null;

document.getElementById('hotelName').addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    
    if (clickCount >= 5) {
        clickCount = 0;
        window.location.href = 'admin.html';
    }
    
    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 2000);
});

// 暴露给全局，用于管理员设置
window.HotelAdmin = {
    setHotelName(name) {
        const config = getLocalConfig() || {};
        config.hotelName = name;
        saveLocalConfig(config);
        document.getElementById('hotelName').textContent = name;
    },
    
    setPhone(phone) {
        const config = getLocalConfig() || {};
        config.phone = phone;
        saveLocalConfig(config);
        document.getElementById('footerPhone').textContent = phone;
    },
    
    // 添加新方法：保存房型到本地
    saveRoomTypes(types) {
        localStorage.setItem('hotelRoomTypes', JSON.stringify(types));
    },
    
    // 获取本地房型
    getRoomTypes() {
        const stored = localStorage.getItem('hotelRoomTypes');
        return stored ? JSON.parse(stored) : DEFAULT_ROOM_TYPES;
    }
};

console.log('%c🏨 芭堤雅酒店订房系统', 'font-size: 20px; font-weight: bold; color: #8B4513;');
console.log('%c提示: 连续点击酒店名称5次可进入管理后台', 'color: #666;');