/**
 * 酒店订房H5 - 管理后台 JavaScript
 */

// ============================================
// 配置与常量
// ============================================

const DEFAULT_PASSWORD = 'admin123';
const ROOM_TYPES_KEY = 'hotelRoomTypes';
const BOOKINGS_KEY = 'hotelBookings';
const CONFIG_KEY = 'hotelConfig';
const PASSWORD_KEY = 'hotelAdminPassword';

// 默认房型
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
 * 格式化日期
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 格式化时间
 */
function formatDateTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 获取本地存储的数据
 */
function getLocalData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

/**
 * 保存数据到本地
 */
function saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 获取配置
 */
function getConfig() {
    const config = localStorage.getItem(CONFIG_KEY);
    return config ? JSON.parse(config) : {};
}

/**
 * 显示Toast
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-message">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================================
// 认证相关
// ============================================

function checkAuth() {
    return localStorage.getItem('hotelAdminLoggedIn') === 'true';
}

function login(password) {
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (password === savedPassword) {
        localStorage.setItem('hotelAdminLoggedIn', 'true');
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('hotelAdminLoggedIn');
    window.location.reload();
}

// ============================================
// 页面初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        showAdminPanel();
    } else {
        showLoginPanel();
    }
});

function showLoginPanel() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminContainer').classList.remove('active');
    
    // 绑定登录表单
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('passwordInput').value;
        
        if (login(password)) {
            showAdminPanel();
        } else {
            const errorEl = document.getElementById('loginError');
            errorEl.style.display = 'block';
            document.getElementById('passwordInput').value = '';
        }
    });
}

function showAdminPanel() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminContainer').classList.add('active');
    
    initAdminFunctions();
}

// ============================================
// 管理员功能初始化
// ============================================

function initAdminFunctions() {
    // 加载初始数据
    loadBookings();
    loadRoomTypes();
    loadSettings();
    
    // 绑定导航
    bindNavigation();
    
    // 绑定登出
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 绑定刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', loadBookings);
    
    // 绑定导出按钮
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // 绑定添加房型按钮
    document.getElementById('addRoomBtn').addEventListener('click', () => openRoomModal());
    
    // 绑定房型弹窗
    bindRoomModal();
    
    // 绑定设置保存
    bindSettings();
}

// ============================================
// 导航
// ============================================

function bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            
            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // 显示对应Tab
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`${tab}Tab`).style.display = 'block';
        });
    });
}

// ============================================
// 订单管理
// ============================================

function loadBookings() {
    const bookings = getLocalData(BOOKINGS_KEY, []);
    const today = formatDate(new Date());
    
    // 更新统计
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('todayBookings').textContent = 
        bookings.filter(b => formatDate(b.createdAt) === today).length;
    document.getElementById('pendingBookings').textContent = 
        bookings.filter(b => b.status === 'pending').length;
    
    // 渲染表格
    const tbody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // 按时间倒序
    const sortedBookings = [...bookings].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    tbody.innerHTML = sortedBookings.map((booking, index) => `
        <tr>
            <td>#${String(index + 1).padStart(4, '0')}</td>
            <td>${booking.checkInDate}</td>
            <td>${booking.checkOutDate}</td>
            <td>${booking.guestName}</td>
            <td>${booking.phone}</td>
            <td>${booking.roomTypeName}</td>
            <td>¥${booking.roomPrice}</td>
            <td><span class="status-badge status-${booking.status || 'pending'}">${getStatusText(booking.status)}</span></td>
            <td>${formatDateTime(booking.createdAt)}</td>
        </tr>
    `).join('');
    
    // 绑定日期筛选
    document.getElementById('filterDate').addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            const filtered = sortedBookings.filter(b => b.checkInDate === selectedDate);
            renderBookingsTable(filtered);
        } else {
            renderBookingsTable(sortedBookings);
        }
    });
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 32px; color: #999;">暂无订单</td></tr>';
        return;
    }
    
    tbody.innerHTML = bookings.map((booking, index) => `
        <tr>
            <td>#${String(index + 1).padStart(4, '0')}</td>
            <td>${booking.checkInDate}</td>
            <td>${booking.checkOutDate}</td>
            <td>${booking.guestName}</td>
            <td>${booking.phone}</td>
            <td>${booking.roomTypeName}</td>
            <td>¥${booking.roomPrice}</td>
            <td><span class="status-badge status-${booking.status || 'pending'}">${getStatusText(booking.status)}</span></td>
            <td>${formatDateTime(booking.createdAt)}</td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'cancelled': '已取消'
    };
    return statusMap[status] || '待确认';
}

// ============================================
// 导出Excel
// ============================================

function exportToExcel() {
    const bookings = getLocalData(BOOKINGS_KEY, []);
    
    if (bookings.length === 0) {
        showToast('暂无订单可导出');
        return;
    }
    
    // 准备CSV数据
    const headers = ['订单编号', '入住日期', '退房日期', '入住人', '手机号', '房型', '房价/晚', '状态', '下单时间'];
    const rows = bookings.map((booking, index) => [
        `#${String(index + 1).padStart(4, '0')}`,
        booking.checkInDate,
        booking.checkOutDate,
        booking.guestName,
        booking.phone,
        booking.roomTypeName,
        `¥${booking.roomPrice}`,
        getStatusText(booking.status),
        formatDateTime(booking.createdAt)
    ]);
    
    // 排序
    rows.sort((a, b) => new Date(b[8]) - new Date(a[8]));
    
    // 生成CSV
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // 添加BOM以支持Excel中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 下载
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `酒店订单_${formatDate(new Date())}.csv`;
    link.click();
    
    showToast('导出成功');
}

// ============================================
// 房型管理
// ============================================

function loadRoomTypes() {
    const roomTypes = getLocalData(ROOM_TYPES_KEY, DEFAULT_ROOM_TYPES);
    renderRoomList(roomTypes);
}

function renderRoomList(roomTypes) {
    const roomList = document.getElementById('roomList');
    
    if (roomTypes.length === 0) {
        roomList.innerHTML = '<div class="empty-state"><p>暂无房型，请添加</p></div>';
        return;
    }
    
    roomList.innerHTML = roomTypes.map(room => `
        <div class="room-item" data-id="${room.id}">
            <div class="room-info">
                <span class="room-name">${room.name}</span>
                <span class="room-price">¥${room.price}/晚</span>
            </div>
            <div class="room-actions">
                <button class="icon-btn edit" title="编辑" onclick="editRoom('${room.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="icon-btn delete" title="删除" onclick="deleteRoom('${room.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

let editingRoomId = null;

function openRoomModal(room = null) {
    const modal = document.getElementById('roomModal');
    const title = document.getElementById('roomModalTitle');
    const nameInput = document.getElementById('roomNameInput');
    const priceInput = document.getElementById('roomPriceInput');
    
    if (room) {
        title.textContent = '编辑房型';
        nameInput.value = room.name;
        priceInput.value = room.price;
        editingRoomId = room.id;
    } else {
        title.textContent = '添加房型';
        nameInput.value = '';
        priceInput.value = '';
        editingRoomId = null;
    }
    
    modal.classList.add('active');
}

function closeRoomModal() {
    document.getElementById('roomModal').classList.remove('active');
    editingRoomId = null;
}

function bindRoomModal() {
    document.getElementById('closeRoomModal').addEventListener('click', closeRoomModal);
    document.getElementById('cancelRoomBtn').addEventListener('click', closeRoomModal);
    
    document.getElementById('saveRoomBtn').addEventListener('click', () => {
        const name = document.getElementById('roomNameInput').value.trim();
        const price = document.getElementById('roomPriceInput').value.trim();
        
        if (!name) {
            showToast('请输入房型名称');
            return;
        }
        
        if (!price || isNaN(parseInt(price))) {
            showToast('请输入有效的房价');
            return;
        }
        
        const roomTypes = getLocalData(ROOM_TYPES_KEY, DEFAULT_ROOM_TYPES);
        
        if (editingRoomId) {
            // 编辑
            const index = roomTypes.findIndex(r => r.id === editingRoomId);
            if (index !== -1) {
                roomTypes[index].name = name;
                roomTypes[index].price = parseInt(price);
            }
        } else {
            // 添加
            roomTypes.push({
                id: Date.now().toString(),
                name,
                price: parseInt(price)
            });
        }
        
        saveLocalData(ROOM_TYPES_KEY, roomTypes);
        loadRoomTypes();
        closeRoomModal();
        showToast(editingRoomId ? '房型已更新' : '房型已添加');
    });
}

window.editRoom = function(id) {
    const roomTypes = getLocalData(ROOM_TYPES_KEY, DEFAULT_ROOM_TYPES);
    const room = roomTypes.find(r => r.id === id);
    if (room) {
        openRoomModal(room);
    }
};

window.deleteRoom = function(id) {
    if (confirm('确定要删除这个房型吗？')) {
        let roomTypes = getLocalData(ROOM_TYPES_KEY, DEFAULT_ROOM_TYPES);
        roomTypes = roomTypes.filter(r => r.id !== id);
        saveLocalData(ROOM_TYPES_KEY, roomTypes);
        loadRoomTypes();
        showToast('房型已删除');
    }
};

// ============================================
// 设置
// ============================================

function loadSettings() {
    const config = getConfig();
    document.getElementById('settingHotelName').value = config.hotelName || '芭堤雅酒店';
    document.getElementById('settingPhone').value = config.phone || '400-888-8888';
}

function bindSettings() {
    // 保存酒店信息
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const hotelName = document.getElementById('settingHotelName').value.trim();
        const phone = document.getElementById('settingPhone').value.trim();
        
        if (!hotelName || !phone) {
            showToast('请填写完整信息');
            return;
        }
        
        const config = getConfig();
        config.hotelName = hotelName;
        config.phone = phone;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        
        showToast('设置已保存');
    });
    
    // 修改密码
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!newPassword) {
            showToast('请输入新密码');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('两次输入的密码不一致');
            return;
        }
        
        localStorage.setItem(PASSWORD_KEY, newPassword);
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        showToast('密码已修改');
    });
}

// ============================================
// 控制台信息
// ============================================

console.log('%c🏨 芭堤雅酒店管理后台', 'font-size: 20px; font-weight: bold; color: #8B4513;');
console.log('%c订单数据存储在本地localStorage中', 'color: #666;');
console.log('%c如需云端同步，请配置LeanCloud', 'color: #666;');