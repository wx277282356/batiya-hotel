# 酒店在线订房H5系统

一个优雅的酒店在线预订H5页面，支持客人扫码填写预订信息，管理员后台查看订单和导出Excel。

## 功能特性

### 客人端 (index.html)
- ✅ 上传酒店Logo
- ✅ 自定义酒店名称和联系电话
- ✅ 日期选择器（入住/退房联动）
- ✅ 填写入住人姓名、手机号
- ✅ 选择房型（显示价格）
- ✅ 提交预约
- ✅ 预约成功确认页面
- ✅ 棕红渐变品牌色，简约商务风格

### 管理后台 (admin.html)
- ✅ 密码登录保护
- ✅ 查看所有订单列表
- ✅ 按日期筛选订单
- ✅ 导出订单为Excel（CSV格式）
- ✅ 管理房型（添加/编辑/删除）
- ✅ 基本设置（酒店名称、联系电话）
- ✅ 修改管理员密码

## 快速开始

### 方式一：纯本地使用（无需服务器）

1. 下载本项目所有文件
2. 直接在浏览器打开 `index.html`
3. 数据存储在浏览器localStorage中

**注意**：这种方式只能在一台电脑上管理数据。如需多设备同步，继续往下看。

### 方式二：部署到GitHub Pages（免费）

1. **创建GitHub仓库**
   - 登录 [GitHub](https://github.com)
   - 点击右上角 `+` → `New repository`
   - 仓库名称填写 `hotel-booking`（或其他名称）
   - 选择 `Public`
   - 点击 `Create repository`

2. **上传文件**
   - 在仓库页面点击 `uploading an existing file`
   - 将本项目所有文件拖入上传区域
   - 点击 `Commit changes`

3. **启用GitHub Pages**
   - 进入仓库 → `Settings` → `Pages`
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main` `/ (root)`
   - 点击 `Save`
   - 等待1-2分钟，页面显示 `Your site is published at https://xxx.github.io/hotel-booking/`

4. **访问你的订房页面**
   - 链接格式：`https://你的用户名.github.io/hotel-booking/`
   - 管理后台：`https://你的用户名.github.io/hotel-booking/admin.html`

### 方式三：配置LeanCloud云端同步

如果你有LeanCloud账号，数据可以同步到云端，实现多设备管理。

1. **注册LeanCloud**
   - 访问 [https://leancloud.cn](https://leancloud.cn)
   - 注册账号并登录

2. **创建应用**
   - 控制台 → 创建新应用
   - 名称随意，如 `hotel-booking`
   - 选择开发版（免费）

3. **获取凭证**
   - 进入应用 → 设置 → 应用凭证
   - 复制 `App ID` 和 `App Key`

4. **修改代码**
   - 打开 `js/app.js`
   - 找到以下内容并替换：

```javascript
const LEANCloudConfig = {
    appId: 'YOUR_LEANCloud_APP_ID',      // 替换为你的App ID
    appKey: 'YOUR_LEANCloud_APP_KEY',     // 替换为你的App Key
    serverURL: 'https://YOUR_APP_ID.lc-cn-n1.cloudnative.cn'  // 替换为你的服务器地址
};
```

5. **创建数据表**
   - 在LeanCloud控制台 → 存储 → 创建Class
   - 创建名为 `Booking` 的Class（不需要手动创建字段，SDK会自动创建）
   - 创建名为 `RoomType` 的Class

## 文件结构

```
hotel-booking/
├── index.html          # 客人预订页面
├── admin.html          # 管理后台
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 预订页面逻辑
│   └── admin.js        # 管理后台逻辑
├── SPEC.md             # 规格说明书
└── README.md           # 说明文档
```

## 使用说明

### 客人预订流程

1. 扫描二维码进入订房页面
2. 选择入住和退房日期
3. 填写姓名和手机号
4. 选择房型（查看价格）
5. 点击提交预约
6. 显示预约成功确认页面

### 管理员操作

1. 打开 `admin.html`
2. 输入密码登录（默认密码：`admin123`）
3. 查看订单、导出Excel、管理房型

### 如何生成二维码

可以使用以下工具生成二维码：
- 在线工具：[草料二维码](https://cli.im/)
- 或任何二维码生成器
- 将GitHub Pages链接生成二维码，让客人扫码订房

## 自定义设置

### 修改酒店信息

1. 打开管理后台
2. 进入"基本设置"
3. 修改酒店名称和联系电话

### 上传Logo

1. 在订房页面点击Logo区域
2. 选择本地图片
3. 图片会自动保存

### 修改品牌颜色

1. 打开 `css/style.css`
2. 修改 `:root` 中的颜色变量：

```css
:root {
    --brand-primary: #8B4513;      /* 主色 */
    --brand-secondary: #A0522D;     /* 辅助色 */
    --brand-light: #CD853F;         /* 浅色 */
    /* ... 其他颜色 */
}
```

### 修改房型

1. 打开管理后台
2. 进入"房型管理"
3. 添加、编辑或删除房型

## 注意事项

1. **数据存储**：未配置LeanCloud时，数据存储在浏览器localStorage中。清除浏览器缓存会丢失数据。

2. **多设备同步**：如需多设备访问同一份数据，请配置LeanCloud。

3. **订单导出**：导出的Excel为CSV格式，可用Excel打开。

4. **密码安全**：请及时修改默认管理员密码。

5. **手机适配**：页面已针对手机端优化，支持微信内置浏览器。

## 技术支持

如有问题，请联系开发者。

---

**Made with ❤️ for 芭堤雅酒店**