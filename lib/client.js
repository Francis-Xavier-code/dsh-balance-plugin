// dsh-balance-plugin —— Client 半端（静态 web 插件形态，ModuleLoader bundle）
// 供 `dsh plugin --profile web add <package>` 安装后经 /plugins/dsh-balance-plugin/client.js 加载。
// 与动态版（仓库根 client.js）逻辑同源；RPC 改为 fetch POST /bmon/api/<name>。

window.__ModuleLoader__.load({
  id: 'dsh-balance-plugin',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    var React = require('react');

    async function apiCall(name, args) {
      const res = await fetch('/bmon/api/' + name, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args || {}),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return await res.json()
    }

    function insertStyles(css) {
      try {
        const style = document.createElement('style')
        style.textContent = css
        document.head.appendChild(style)
        return () => { try { style.remove() } catch (e) { /* ignore */ } }
      } catch (e) {
        return () => {}
      }
    }

    const inject = ['timer']

    function apply(ctx) {
      insertStyles(`:root{
  --bmon-c1:#6b87d9;--bmon-c2:#b08427;--bmon-c3:#c65f7f;--bmon-c4:#8d7ce4;
  --bmon-h0:#262a3e;--bmon-h1:#303c66;--bmon-h2:#42549b;--bmon-h3:#5a71c4;--bmon-h4:#82a1ea;
}
@media (prefers-color-scheme: light){
  :root{
    --bmon-c1:#5d6cc4;--bmon-c2:#8f6b1e;--bmon-c3:#c2426e;--bmon-c4:#6d51c4;
    --bmon-h0:#ece4d1;--bmon-h1:#cdc7e8;--bmon-h2:#a8a0d6;--bmon-h3:#837ac0;--bmon-h4:#5b4fa0;
  }
}
.bmon-ibar{width:28px;height:28px;border-radius:8px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0;}
.bmon-ibar:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);}
.bmon-ibar-on{color:var(--dsw-alias-brand-primary);}
.bmon-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.42);display:flex;align-items:center;justify-content:center;padding:24px;}
.bmon-overlay-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;width:min(780px,100%);max-height:84vh;display:flex;flex-direction:column;box-shadow:0 14px 44px rgba(0,0,0,.38);}
.bmon-overlay-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);}
.bmon-overlay-title{font-weight:600;font-size:14px;}
.bmon-overlay-body{padding:14px;overflow:auto;}
.bmon-dock{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:1;color:var(--dsw-alias-label-secondary);padding:3px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);}
.bmon-dock.bmon-low{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);}
.bmon-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-success-primary);flex:none;}
.bmon-low .bmon-dot{background:var(--dsw-alias-state-error-primary);}
.bmon-low-tag{font-weight:600;}
.bmon-btn{border:none;background:transparent;color:var(--dsw-alias-brand-primary);cursor:pointer;font-size:12px;padding:2px 6px;border-radius:6px;text-decoration:none;font-family:inherit;}
.bmon-btn:hover{background:var(--dsw-alias-bg-layer-1);}
.bmon-panel{font-size:13px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:10px;min-width:0;}
.bmon-page{font-size:13px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:12px;min-width:0;}
.bmon-title{font-weight:600;}
.bmon-hint{font-size:11px;color:var(--dsw-alias-label-secondary);}
.bmon-table{border-collapse:collapse;width:100%;font-size:12px;}
.bmon-table th,.bmon-table td{border-bottom:1px solid var(--dsw-alias-border-l1);padding:4px 6px;text-align:left;vertical-align:top;}
.bmon-ok{color:var(--dsw-alias-state-success-primary);}
.bmon-err{color:var(--dsw-alias-state-error-primary);}
.bmon-warn{color:var(--dsw-alias-state-warn-primary);}
.bmon-field{display:flex;flex-direction:column;gap:2px;min-width:0;}
.bmon-input{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);border-radius:6px;padding:4px 8px;font-size:13px;font-family:inherit;}
.bmon-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary);}
.bmon-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.bmon-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.bmon-primary{background:var(--dsw-alias-brand-primary);color:#fff;border:none;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:13px;font-family:inherit;}
.bmon-primary:disabled{opacity:0.6;cursor:default;}
.bmon-danger{color:var(--dsw-alias-state-error-primary);}
.bmon-account{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;}
.bmon-account-head{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.bmon-flex1{flex:1;min-width:0;}
.bmon-section{font-weight:600;margin-top:4px;}
.bmon-badge{font-size:11px;padding:1px 6px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,transparent);color:var(--dsw-alias-brand-primary);white-space:nowrap;}
.bmon-badge-third{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 18%,transparent);color:var(--dsw-alias-state-warn-primary);}
.bmon-u-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.bmon-u-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden;}
.bmon-u-seg button{border:none;background:transparent;color:var(--dsw-alias-label-secondary);padding:4px 12px;font-size:12px;cursor:pointer;font-family:inherit;}
.bmon-u-seg button.on{background:var(--dsw-alias-brand-primary);color:#fff;}
.bmon-u-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;}
.bmon-u-tile{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;min-width:0;}
.bmon-u-tile-label{font-size:11px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:6px;}
.bmon-u-tile-value{font-size:20px;font-weight:600;line-height:1.2;}
.bmon-u-tile-value small{font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary);margin-left:4px;}
.bmon-u-tile-sub{font-size:11px;color:var(--dsw-alias-label-secondary);}
.bmon-u-ringwrap{display:flex;align-items:center;gap:12px;}
.bmon-u-ring{width:56px;height:56px;border-radius:50%;position:relative;flex:none;}
.bmon-u-ring::after{content:'';position:absolute;inset:9px;border-radius:50%;background:var(--dsw-alias-bg-layer-1);}
.bmon-u-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;z-index:1;}
.bmon-u-live{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 10px;font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;}
.bmon-u-heat-wrap{position:relative;padding-top:16px;}
.bmon-u-heat-months{position:absolute;top:0;left:0;right:0;height:14px;}
.bmon-u-heat-month{position:absolute;top:0;font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;}
.bmon-u-heat-body{display:flex;gap:5px;}
.bmon-u-heat-weekdays{display:flex;flex-direction:column;gap:3px;font-size:9px;color:var(--dsw-alias-label-secondary);}
.bmon-u-heat-weekdays span{height:10px;line-height:10px;}
.bmon-u-heat-cols{display:flex;gap:3px;}
.bmon-u-heat-col{display:flex;flex-direction:column;gap:3px;}
.bmon-u-heat-cell{width:10px;height:10px;border-radius:3px;background:var(--bmon-h0);}
.bmon-u-heat-cell:hover{outline:1.5px solid var(--dsw-alias-border-l2);outline-offset:1px;}
.bmon-u-heat-cell[data-l="1"]{background:var(--bmon-h1);}
.bmon-u-heat-cell[data-l="2"]{background:var(--bmon-h2);}
.bmon-u-heat-cell[data-l="3"]{background:var(--bmon-h3);}
.bmon-u-heat-cell[data-l="4"]{background:var(--bmon-h4);}
.bmon-u-heat-total{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:8px;}
.bmon-u-bars-wrap{position:relative;padding-top:22px;}
.bmon-u-bars{position:relative;height:200px;display:flex;align-items:flex-end;gap:3px;border-bottom:1px solid var(--dsw-alias-border-l1);padding-left:36px;}
.bmon-u-bar-slot{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:200px;}
.bmon-u-bar-col{display:flex;flex-direction:column;justify-content:flex-end;width:62%;max-width:38px;min-width:5px;gap:2px;}
.bmon-u-bar-col:hover{filter:brightness(1.12);}
.bmon-u-bar-col i{display:block;width:100%;min-height:1px;}
.bmon-u-bar-col i:last-child{border-radius:3px 3px 0 0;}
.bmon-u-s1{background:var(--bmon-c1);}
.bmon-u-s2{background:var(--bmon-c2);}
.bmon-u-s3{background:var(--bmon-c3);}
.bmon-u-gridline{position:absolute;left:36px;right:0;border-top:1px dashed var(--dsw-alias-border-l1);}
.bmon-u-y{position:absolute;left:0;transform:translateY(50%);font-size:9px;color:var(--dsw-alias-label-secondary);}
.bmon-u-x{display:flex;gap:3px;margin-top:2px;padding-left:36px;}
.bmon-u-x span{flex:1;min-width:0;font-size:9px;color:var(--dsw-alias-label-secondary);text-align:left;white-space:nowrap;overflow:hidden;}
.bmon-u-empty{padding:14px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12px;}
.bmon-u-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px;}
.bmon-u-card-head{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px;}
.bmon-u-modelbody{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;}
.bmon-u-donut{width:110px;height:110px;border-radius:50%;position:relative;flex:none;margin:6px auto;}
.bmon-u-donut::after{content:'';position:absolute;inset:16px;border-radius:50%;background:var(--dsw-alias-bg-layer-1);}
.bmon-u-donut b{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1;font-size:14px;}
.bmon-u-donut b small{font-size:9px;color:var(--dsw-alias-label-secondary);}
.bmon-u-num{text-align:right;}
.bmon-pg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;}
.bmon-pg-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;transition:border-color .15s;}
.bmon-pg-card:hover{border-color:var(--dsw-alias-brand-primary);}
.bmon-pg-card-name{font-weight:600;font-size:13px;display:flex;align-items:center;gap:6px;min-width:0;}
.bmon-pg-card-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bmon-pg-card-desc{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:30px;}
.bmon-pg-card-meta{font-size:10px;color:var(--dsw-alias-label-secondary);display:flex;gap:8px;flex-wrap:wrap;}
.bmon-pg-card-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;}
.bmon-pg-card-actions button,.bmon-pg-card-actions a{font-size:11px;padding:3px 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:4px;font-family:inherit;white-space:nowrap;}
.bmon-pg-card-actions button:hover,.bmon-pg-card-actions a:hover{background:var(--dsw-alias-bg-layer-2);}
.bmon-pg-card-actions .bmon-pg-primary{background:var(--dsw-alias-brand-primary);color:#fff;border-color:var(--dsw-alias-brand-primary);}
.bmon-pg-card-actions .bmon-pg-primary:hover{filter:brightness(1.1);}
.bmon-pg-card-actions .bmon-pg-danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);}
.bmon-pg-card-actions .bmon-pg-danger:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent);}
.bmon-pg-card-actions .bmon-pg-update{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-primary);}
.bmon-pg-search{display:flex;gap:8px;align-items:center;margin-bottom:4px;}
.bmon-pg-search input{flex:1;min-width:0;}
.bmon-pg-market{border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px;margin-top:8px;}
.bmon-pg-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 16px;font-size:12px;z-index:2147483001;box-shadow:0 4px 12px rgba(0,0,0,.25);opacity:0;transition:opacity .25s;pointer-events:none;}
.bmon-pg-toast.show{opacity:1;}`)

      const POLL_MS = 15000
      const IDLE_MS = 60000

      function useBalanceState() {
        const pair = React.useState(null)
        const snapshot = pair[0]
        const setSnapshot = pair[1]
        const versionRef = React.useRef(0)
        const idleRef = React.useRef(0)
        React.useEffect(() => {
          let alive = true
          const tick = () => {
            apiCall('get-state', {}).then((value) => {
              if (!alive || !value || typeof value !== 'object') return
              if (value.version === versionRef.current && idleRef.current < 3) {
                idleRef.current += 1
                return
              }
              versionRef.current = value.version || 0
              idleRef.current = 0
              setSnapshot(value)
            }).catch(() => {})
          }
          tick()
          const disposer = ctx.interval(tick, POLL_MS)
          return () => { alive = false; disposer() }
        }, [])
        return pair
      }

      function useUsageState(range) {
        const pair = React.useState(null)
        const snapshot = pair[0]
        const setSnapshot = pair[1]
        const versionRef = React.useRef(0)
        const idleRef = React.useRef(0)
        React.useEffect(() => {
          let alive = true
          const tick = () => {
            apiCall('get-usage', { range: range }).then((value) => {
              if (!alive || !value || typeof value !== 'object') return
              if (value.version === versionRef.current && idleRef.current < 3) {
                idleRef.current += 1
                return
              }
              versionRef.current = value.version || 0
              idleRef.current = 0
              setSnapshot(value)
            }).catch(() => {})
          }
          tick()
          const disposer = ctx.interval(tick, POLL_MS)
          return () => { alive = false; disposer() }
        }, [range])
        return pair
      }

      function fmtTokens(value) {
        const n = Number(value) || 0
        if (n >= 1000000000) return (n / 1000000000).toFixed(2) + 'B'
        if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
        return String(Math.round(n))
      }

      function fmtDur(ms) {
        if (!(ms > 0)) return '—'
        const s = Math.round(ms / 1000)
        if (s < 60) return s + 's'
        if (s < 3600) return Math.floor(s / 60) + 'm' + (s % 60 ? (s % 60) + 's' : '')
        return Math.floor(s / 3600) + 'h' + Math.floor((s % 3600) / 60) + 'm'
      }

      function parseDate(key) {
        const parts = String(key).split('-').map(Number)
        return new Date(parts[0], parts[1] - 1, parts[2])
      }

      function Icon({ paths, size }) {
        return React.createElement('svg', { viewBox: '0 0 24 24', width: size || 17, height: size || 17, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: paths } })
      }

      function OverlayContent({ tab, onClose }) {
        let content = null
        let title = ''
        if (tab === 'balance') { content = React.createElement(BalancePanel, null); title = '余额监控' }
        else if (tab === 'usage') { content = React.createElement(UsagePage, null); title = '用量统计' }
        else if (tab === 'plugins') { content = React.createElement(ThirdPartyPage, null); title = '三方插件' }
        return React.createElement('div', { className: 'bmon-overlay', onClick: onClose },
          React.createElement('div', { className: 'bmon-overlay-card', onClick: (e) => e.stopPropagation() },
            React.createElement('div', { className: 'bmon-overlay-head' },
              React.createElement('span', { className: 'bmon-overlay-title' }, title),
              React.createElement('button', { type: 'button', className: 'bmon-btn', onClick: onClose }, '✕ 关闭'),
            ),
            React.createElement('div', { className: 'bmon-overlay-body' }, content),
          ),
        )
      }

      function IconBarButton({ tab, paths, label }) {
        const pair = React.useState(false)
        const open = pair[0]
        const setOpen = pair[1]
        const children = [
          React.createElement('button', { key: 'b', type: 'button', className: 'bmon-ibar' + (open ? ' bmon-ibar-on' : ''), onClick: () => setOpen(!open), title: label, 'aria-label': label },
            React.createElement(Icon, { paths: paths, size: 16 })),
        ]
        if (open) {
          children.push(React.createElement(OverlayContent, { key: 'o', tab: tab, onClose: () => setOpen(false) }))
        }
        return React.createElement('div', { className: 'bmon-ibar-wrap' }, ...children)
      }

      function ThirdPartyPage() {
        const pair = React.useState(null)
        const data = pair[0]
        const setData = pair[1]
        const [seq, setSeq] = React.useState(0)
        const [searchQuery, setSearchQuery] = React.useState('')
        const [searchResults, setSearchResults] = React.useState([])
        const [searching, setSearching] = React.useState(false)
        const [toast, setToast] = React.useState('')
        const [busyId, setBusyId] = React.useState('')
        const toastTimer = React.useRef(null)
        const showToast = React.useCallback((msg) => {
          setToast(msg)
          if (toastTimer.current) clearTimeout(toastTimer.current)
          toastTimer.current = setTimeout(() => setToast(''), 2500)
        }, [])
        React.useEffect(() => {
          let alive = true
          apiCall('list-plugins', {}).then((value) => { if (alive && value && typeof value === 'object') setData(value) }).catch(() => {})
          return () => { alive = false }
        }, [seq])
        function handleSearch() {
          const q = searchQuery.trim()
          if (!q) return
          setSearching(true)
          apiCall('search-plugins', { query: q }).then((v) => {
            if (v && v.ok) setSearchResults(v.results || [])
          }).catch(() => {}).finally(() => setSearching(false))
        }
        function handleInstall(pkg) {
          if (!pkg || busyId) return
          setBusyId(pkg)
          showToast('正在安装 ' + pkg + '…')
          apiCall('install-plugin', { pkg: pkg }).then((v) => {
            if (v && v.ok) {
              showToast('✅ ' + pkg + ' 安装成功')
              setSearchResults([])
              setSearchQuery('')
              setSeq((n) => n + 1)
            } else {
              showToast('❌ 安装失败：' + (v && v.error || '未知错误'))
            }
          }).catch(() => showToast('❌ 安装失败')).finally(() => setBusyId(''))
        }
        function handleUninstall(pkg) {
          if (!pkg || busyId) return
          if (!confirm('确定卸载 ' + pkg + '？')) return
          setBusyId(pkg)
          showToast('正在卸载 ' + pkg + '…')
          apiCall('uninstall-plugin', { pkg: pkg }).then((v) => {
            if (v && v.ok) {
              showToast('✅ ' + pkg + ' 已卸载')
              setSeq((n) => n + 1)
            } else {
              showToast('❌ 卸载失败：' + (v && v.error || '未知错误'))
            }
          }).catch(() => showToast('❌ 卸载失败')).finally(() => setBusyId(''))
        }
        function handleUpdate(pkg) {
          if (!pkg || busyId) return
          setBusyId(pkg)
          showToast('正在更新 ' + pkg + '…')
          apiCall('update-plugin', { pkg: pkg }).then((v) => {
            if (v && v.ok) {
              showToast('✅ ' + pkg + ' 更新成功')
              setSeq((n) => n + 1)
            } else {
              showToast('❌ 更新失败：' + (v && v.error || '未知错误'))
            }
          }).catch(() => showToast('❌ 更新失败')).finally(() => setBusyId(''))
        }
        function openRepo(plugin) {
          const id = plugin.id || ''
          const guess = 'https://github.com/' + id.replace(/^@[^/]+\//, '')
          window.open(guess, '_blank', 'noopener')
        }
        const children = []
        children.push(React.createElement('div', { key: 'title', className: 'bmon-title' }, '插件管理'))
        if (!data) {
          children.push(React.createElement('div', { key: 'loading', className: 'bmon-hint' }, '正在读取插件表…'))
          return React.createElement('div', { className: 'bmon-page' }, ...children)
        }
        if (data.error) {
          children.push(React.createElement('div', { key: 'err', className: 'bmon-err' }, '读取失败：' + data.error))
          return React.createElement('div', { className: 'bmon-page' }, ...children)
        }
        const third = (data.plugins || []).filter((p) => !p.official)
        const official = (data.plugins || []).filter((p) => p.official)
        children.push(React.createElement('div', { key: 'stats', className: 'bmon-row' },
          React.createElement('span', { className: 'bmon-badge bmon-badge-third' }, '三方 ' + third.length),
          React.createElement('span', { className: 'bmon-badge' }, '官方 ' + official.length),
          React.createElement('span', { className: 'bmon-hint' }, '合计 ' + data.total + ' 个 Web 插件'),
          React.createElement('button', { type: 'button', className: 'bmon-btn', onClick: () => setSeq((n) => n + 1) }, '↻ 刷新'),
        ))
        function renderPluginCard(plugin) {
          const actions = []
          actions.push(React.createElement('button', { key: 'dir', type: 'button', disabled: !plugin.path, onClick: () => { apiCall('open-plugin-dir', { id: plugin.id }).then((v) => { if (v && v.error) console.log('[余额监控] open dir:', v.error) }).catch(() => {}) } }, '📁 目录'))
          if (!plugin.official) {
            actions.push(React.createElement('button', { key: 'repo', type: 'button', onClick: () => openRepo(plugin) }, '🔗 仓库'))
            actions.push(React.createElement('button', { key: 'update', type: 'button', className: 'bmon-pg-update', disabled: !!busyId, onClick: () => handleUpdate(plugin.id) }, busyId === plugin.id ? '⏳…' : '🔄 更新'))
            actions.push(React.createElement('button', { key: 'uninstall', type: 'button', className: 'bmon-pg-danger', disabled: !!busyId, onClick: () => handleUninstall(plugin.id) }, '🗑 卸载'))
          }
          const nameParts = []
          if (!plugin.official) nameParts.push(React.createElement('span', { className: 'bmon-badge bmon-badge-third' }, '三方'))
          nameParts.push(React.createElement('span', null, plugin.id))
          const deps = (plugin.inject || []).length ? plugin.inject.join(', ') : '无'
          return React.createElement('div', { key: plugin.id, className: 'bmon-pg-card' },
            React.createElement('div', { className: 'bmon-pg-card-name' }, ...nameParts),
            React.createElement('div', { className: 'bmon-pg-card-meta' },
              React.createElement('span', null, 'rev: ' + (plugin.rev || '—')),
              React.createElement('span', null, '依赖: ' + deps),
            ),
            React.createElement('div', { className: 'bmon-pg-card-meta' },
              React.createElement('span', { style: { wordBreak: 'break-all', maxWidth: '100%', flex: '1 0 100%' } }, plugin.path || '—'),
            ),
            React.createElement('div', { className: 'bmon-pg-card-actions' }, ...actions),
          )
        }
        if (third.length) {
          children.push(React.createElement('div', { key: 'third-label', className: 'bmon-section' }, '第三方插件'))
          children.push(React.createElement('div', { key: 'third-grid', className: 'bmon-pg-grid' },
            ...third.map((p) => renderPluginCard(p))
          ))
        } else {
          children.push(React.createElement('div', { key: 'empty', className: 'bmon-u-empty' }, '未发现第三方插件'))
        }
        if (official.length) {
          children.push(React.createElement('details', { key: 'official', style: { marginTop: 8 } },
            React.createElement('summary', { className: 'bmon-section', style: { cursor: 'pointer' } }, '官方插件（' + official.length + '）'),
            React.createElement('div', { className: 'bmon-pg-grid', style: { marginTop: 8 } },
              ...official.map((p) => renderPluginCard(p))
            ),
          ))
        }
        children.push(React.createElement('div', { key: 'market', className: 'bmon-pg-market' },
          React.createElement('div', { className: 'bmon-pg-market-title' }, '🏪 插件市场'),
          React.createElement('div', { className: 'bmon-hint', style: { marginBottom: 8 } }, '搜索 npm 注册表中的 DSH 插件（关键词：deepseek-harness / dsh / cordis）'),
          React.createElement('div', { className: 'bmon-pg-search' },
            React.createElement('input', { type: 'text', className: 'bmon-input', placeholder: '输入关键词搜索…', value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') handleSearch() } }),
            React.createElement('button', { type: 'button', className: 'bmon-primary', disabled: searching || !searchQuery.trim(), onClick: handleSearch }, searching ? '搜索中…' : '🔍 搜索'),
          ),
        ))
        if (searchResults.length) {
          children.push(React.createElement('div', { key: 'sresults', className: 'bmon-pg-grid' },
            ...searchResults.map((item) =>
              React.createElement('div', { key: item.name, className: 'bmon-pg-card' },
                React.createElement('div', { className: 'bmon-pg-card-name' },
                  React.createElement('span', null, item.name),
                  React.createElement('span', { className: 'bmon-badge', style: { fontSize: 9 } }, item.version),
                ),
                React.createElement('div', { className: 'bmon-pg-card-desc' }, item.description || '无描述'),
                React.createElement('div', { className: 'bmon-pg-card-meta' },
                  item.author ? React.createElement('span', null, '👤 ' + item.author) : null,
                  item.score > 0 ? React.createElement('span', null, '⭐ ' + (item.score * 100).toFixed(0) + '%') : null,
                ),
                React.createElement('div', { className: 'bmon-pg-card-actions' },
                  React.createElement('button', { type: 'button', className: 'bmon-pg-primary', disabled: !!busyId, onClick: () => handleInstall(item.name) }, busyId === item.name ? '⏳…' : '📥 安装'),
                  item.repository ? React.createElement('a', { href: item.repository.replace(/^git\+/, '').replace(/\.git$/, ''), target: '_blank', rel: 'noopener' }, '🔗 仓库') : null,
                ),
              )
            )
          ))
        }
        if (toast) {
          children.push(React.createElement('div', { key: 'toast', className: 'bmon-pg-toast' + (toast ? ' show' : '') }, toast))
        }
        return React.createElement('div', { className: 'bmon-page' }, ...children)
      }

      function BalanceTable({ snapshot }) {
        if (!snapshot || !snapshot.last) return null
        const rows = snapshot.last.accounts.map((account) => {
          const cny = account.balances.filter((b) => b.currency === 'CNY').map((b) => b.total).join('') || '—'
          const usd = account.balances.filter((b) => b.currency === 'USD').map((b) => b.total).join('') || '—'
          const lowText = account.low.map((l) => '⚠ ' + l.currency + ' ' + l.total + ' < ' + l.threshold).join(' ')
          const cells = [
            React.createElement('td', { key: 'name' }, account.name),
            React.createElement('td', { key: 'cny' }, cny),
            React.createElement('td', { key: 'usd' }, usd),
            React.createElement('td', { key: 'status', className: account.ok ? (lowText ? 'bmon-warn' : 'bmon-ok') : 'bmon-err' }, account.ok ? (lowText || '正常') : '失败：' + account.error),
          ]
          return React.createElement('tr', { key: account.id }, ...cells)
        })
        const header = React.createElement('tr', { key: 'h' },
          React.createElement('th', { key: 'n' }, '账户'),
          React.createElement('th', { key: 'c' }, 'CNY 总余额'),
          React.createElement('th', { key: 'u' }, 'USD 总余额'),
          React.createElement('th', { key: 's' }, '状态'),
        )
        return React.createElement('div', { className: 'bmon-tablewrap' },
          React.createElement('table', { className: 'bmon-table' },
            React.createElement('thead', null, header),
            React.createElement('tbody', null, ...rows),
          ),
        )
      }

      function DockReadout() {
        const snapshot = useBalanceState()[0]
        const low = snapshot && snapshot.last ? snapshot.last.low : []
        const failed = snapshot && snapshot.last ? snapshot.last.accounts.filter((a) => !a.ok).length : 0
        let text = '余额查询中…'
        if (snapshot) {
          if (!snapshot.configured.length) text = '余额监控未配置'
          else if (!snapshot.last) text = snapshot.polling ? '余额查询中…' : '查询失败'
          else {
            text = snapshot.last.accounts.map((account) => {
              if (!account.ok) return account.name + '：查询失败'
              return account.name + ' ' + account.balances.map((b) => b.currency + ' ' + b.total).join(' · ')
            }).join(' ｜ ')
          }
        }
        const elements = [
          React.createElement('span', { key: 'dot', className: 'bmon-dot' }),
          React.createElement('span', { key: 'text', className: 'bmon-dock-text' }, text),
        ]
        if (low.length) elements.push(React.createElement('span', { key: 'low', className: 'bmon-low-tag' }, '⚠ ' + low.length + ' 项低于阈值'))
        if (failed) elements.push(React.createElement('span', { key: 'failed', className: 'bmon-low-tag' }, failed + ' 项失败'))
        elements.push(React.createElement('button', { key: 'refresh', type: 'button', className: 'bmon-btn', title: '立即刷新', onClick: () => { apiCall('refresh', {}).catch(() => {}) } }, '↻'))
        if (snapshot && snapshot.recharge) {
          elements.push(React.createElement('a', { key: 'recharge', className: 'bmon-btn', href: snapshot.recharge.url, target: '_blank', rel: 'noreferrer', title: '前往 DeepSeek 官方充值页' }, '充值'))
        }
        return React.createElement('div', { className: 'bmon-dock' + (low.length ? ' bmon-low' : '') }, ...elements)
      }

      function BalancePanel() {
        const pair = useBalanceState()
        const snapshot = pair[0]
        const setSnapshot = pair[1]
        const [draft, setDraft] = React.useState(null)
        const [saving, setSaving] = React.useState(false)
        const [saveError, setSaveError] = React.useState(null)
        const [draftCounter, setDraftCounter] = React.useState(0)

        React.useEffect(() => {
          if (!snapshot || draft) return
          setDraft({
            accounts: snapshot.configured.map((c) => ({ id: c.id, name: c.name, key: '', clear: false })),
            thresholdCny: String(snapshot.thresholdCny),
            thresholdUsd: String(snapshot.thresholdUsd),
            intervalMs: String(snapshot.intervalMs),
          })
        }, [snapshot, draft])

        const updateAccount = (index, patch) => {
          setDraft((d) => ({ ...d, accounts: d.accounts.map((a, i) => (i === index ? { ...a, ...patch } : a)) }))
        }
        const addAccount = () => {
          setDraftCounter((n) => n + 1)
          setDraft((d) => ({ ...d, accounts: [...d.accounts, { id: 'draft-' + (draftCounter + 1) + '-' + Date.now(), name: '账号 ' + (d.accounts.length + 1), key: '', clear: false }] }))
        }
        const removeAccount = (index) => {
          setDraft((d) => ({ ...d, accounts: d.accounts.filter((_, i) => i !== index) }))
        }
        const save = () => {
          if (!draft || saving) return
          setSaving(true)
          setSaveError(null)
          apiCall('set-config', {
            accounts: draft.accounts.map((a) => ({ id: a.id, name: a.name, key: a.key, clear: a.clear })),
            thresholdCny: Number(draft.thresholdCny) || 0,
            thresholdUsd: Number(draft.thresholdUsd) || 0,
            intervalMs: Number(draft.intervalMs) || 300000,
          }).then((value) => {
            if (value && typeof value === 'object') {
              if (value.error) {
                setSaveError(value.error)
                setSaving(false)
                return
              }
              setSnapshot(value)
            }
            setDraft((d) => ({ ...d, accounts: d.accounts.map((a) => ({ ...a, key: '', clear: false })) }))
            setSaving(false)
          }).catch((error) => {
            setSaveError(String(error && error.message || error))
            setSaving(false)
          })
        }

        const children = []
        children.push(React.createElement('div', { key: 'title', className: 'bmon-title' }, 'DeepSeek 余额监控与充值'))
        if (!snapshot) {
          children.push(React.createElement('div', { key: 'loading', className: 'bmon-hint' }, '正在连接 Host…'))
        } else {
          const statusLine = []
          if (snapshot.polling) statusLine.push('刷新中…')
          if (snapshot.last) statusLine.push('最近更新 ' + new Date(snapshot.last.at).toLocaleTimeString())
          statusLine.push('每 ' + Math.round(snapshot.intervalMs / 1000) + ' 秒自动刷新')
          statusLine.push(snapshot.configured.length + ' 个账户')
          children.push(React.createElement('div', { key: 'status', className: 'bmon-hint' }, statusLine.join(' · ')))
          if (snapshot.pollError) children.push(React.createElement('div', { key: 'pollerr', className: 'bmon-err' }, '轮询失败：' + snapshot.pollError))
          children.push(React.createElement(BalanceTable, { key: 'table', snapshot: snapshot }))
          if (snapshot.last && !snapshot.last.accounts.length) {
            children.push(React.createElement('div', { key: 'none', className: 'bmon-hint' }, '暂无余额数据（未配置账户或查询失败）'))
          }
          if (snapshot.last && snapshot.last.low.length) {
            children.push(React.createElement('div', { key: 'alerts', className: 'bmon-warn' },
              '低余额告警：' + snapshot.last.low.map((l) => l.accountName + ' ' + l.currency + ' ' + l.total + '（阈值 ' + l.threshold + '）').join('；'),
            ))
          }
          const configChildren = []
          if (draft) {
            configChildren.push(React.createElement('div', { key: 'cfgtitle', className: 'bmon-section' }, '账户配置'))
            draft.accounts.forEach((account, index) => {
              const meta = snapshot.configured.find((c) => c.id === account.id)
              const placeholder = meta && meta.hasKey
                ? '已配置' + (meta.auto ? '（自动读取）' : '（' + meta.keySource + (meta.keyHint ? ' ' + meta.keyHint : '') + '），留空保持不变')
                : 'DeepSeek API Key 或 $env:环境变量名'
              const rowChildren = [
                React.createElement('input', { key: 'name', className: 'bmon-input', style: { width: 110 }, value: account.name, placeholder: '账户名', onChange: (e) => updateAccount(index, { name: e.target.value }) }),
                React.createElement('input', { key: 'key', className: 'bmon-input bmon-flex1', type: 'password', value: account.key, placeholder: placeholder, onChange: (e) => updateAccount(index, { key: e.target.value, clear: false }) }),
              ]
              if (meta && meta.auto) {
                rowChildren.push(React.createElement('span', { key: 'auto', className: 'bmon-badge' }, '自动读取' + (meta.autoSource ? '·' + meta.autoSource : '')))
              }
              if (meta && meta.hasKey && !meta.auto) {
                rowChildren.push(React.createElement('button', { key: 'clear', type: 'button', className: 'bmon-btn bmon-danger', onClick: () => updateAccount(index, { key: '', clear: true }) }, '清除'))
              }
              rowChildren.push(React.createElement('button', { key: 'del', type: 'button', className: 'bmon-btn bmon-danger', onClick: () => removeAccount(index) }, '删除'))
              configChildren.push(React.createElement('div', { key: account.id, className: 'bmon-account' },
                React.createElement('div', { className: 'bmon-account-head' }, ...rowChildren),
              ))
            })
            configChildren.push(React.createElement('button', { key: 'add', type: 'button', className: 'bmon-btn', onClick: addAccount }, '+ 添加账户'))
            configChildren.push(React.createElement('div', { key: 'th', className: 'bmon-row' },
              React.createElement('label', { className: 'bmon-field' }, 'CNY 告警阈值',
                React.createElement('input', { className: 'bmon-input', style: { width: 80 }, type: 'number', min: 0, step: 1, value: draft.thresholdCny, onChange: (e) => setDraft((d) => ({ ...d, thresholdCny: e.target.value })) })),
              React.createElement('label', { className: 'bmon-field' }, 'USD 告警阈值',
                React.createElement('input', { className: 'bmon-input', style: { width: 80 }, type: 'number', min: 0, step: 0.5, value: draft.thresholdUsd, onChange: (e) => setDraft((d) => ({ ...d, thresholdUsd: e.target.value })) })),
              React.createElement('label', { className: 'bmon-field' }, '刷新间隔',
                React.createElement('select', { className: 'bmon-input', value: draft.intervalMs, onChange: (e) => setDraft((d) => ({ ...d, intervalMs: e.target.value })) },
                  React.createElement('option', { value: '30000' }, '30 秒'),
                  React.createElement('option', { value: '60000' }, '1 分钟'),
                  React.createElement('option', { value: '300000' }, '5 分钟'),
                  React.createElement('option', { value: '900000' }, '15 分钟'),
                  React.createElement('option', { value: '1800000' }, '30 分钟'),
                )),
            ))
            configChildren.push(React.createElement('div', { key: 'actions', className: 'bmon-actions' },
              React.createElement('button', { type: 'button', className: 'bmon-primary', disabled: saving, onClick: save }, saving ? '保存中…' : '保存配置'),
              React.createElement('button', { type: 'button', className: 'bmon-btn', onClick: () => { apiCall('refresh', {}).catch(() => {}) } }, '立即刷新'),
              React.createElement('a', { className: 'bmon-btn', href: snapshot.recharge.url, target: '_blank', rel: 'noreferrer' }, '去充值 ↗'),
              React.createElement('a', { className: 'bmon-btn', href: snapshot.recharge.usageUrl, target: '_blank', rel: 'noreferrer' }, '用量页 ↗'),
            ))
            if (saveError) configChildren.push(React.createElement('div', { key: 'err', className: 'bmon-err' }, saveError))
          }
          children.push(React.createElement('div', { key: 'config', className: 'bmon-config' }, ...configChildren))
        }
        return React.createElement('div', { className: 'bmon-panel' }, ...children)
      }

      function UsageTiles({ stats, range }) {
        const totals = stats.totals
        const prev = stats.prevTotals
        const delta = (current, previous) => {
          if (!prev || !previous) return null
          const value = ((current || 0) / previous - 1) * 100
          return React.createElement('span', { key: 'd', title: '对比上一周期' },
            value >= 0 ? '▲' : '▼', ' ', Math.abs(value).toFixed(0) + '%')
        }
        const hit = totals.prompt > 0 ? (totals.cache_read / totals.prompt) * 100 : null
        const days = Math.max(1, stats.daily.length)
        const dailyAvg = range === '1d' ? '' : ' · 日均 ' + (totals.requests / days).toFixed(1) + ' 次'
        const fresh = Math.max(0, totals.prompt - totals.cache_read)
        const ringBg = hit === null
          ? 'rgba(128,128,128,.15)'
          : 'conic-gradient(var(--bmon-c3) ' + hit + '%, rgba(128,128,128,.15) 0)'
        const tiles = [
          React.createElement('div', { key: 't1', className: 'bmon-u-tile' },
            React.createElement('div', { className: 'bmon-u-tile-label' }, '总消耗', delta(totals.total, prev && prev.total)),
            React.createElement('div', { className: 'bmon-u-tile-value' }, fmtTokens(totals.total), React.createElement('small', null, 'tokens')),
            React.createElement('div', { className: 'bmon-u-tile-sub' }, '输入 ' + fmtTokens(totals.prompt) + ' · 输出 ' + fmtTokens(totals.completion)),
          ),
          React.createElement('div', { key: 't2', className: 'bmon-u-tile' },
            React.createElement('div', { className: 'bmon-u-tile-label' }, '轮次 / 步数'),
            React.createElement('div', { className: 'bmon-u-tile-value' }, String(totals.turns), React.createElement('small', null, '轮'), ' · ', String(totals.steps), React.createElement('small', null, '步')),
            React.createElement('div', { className: 'bmon-u-tile-sub' }, '工具调用 ' + totals.tools + ' 次'),
          ),
          React.createElement('div', { key: 't3', className: 'bmon-u-tile' },
            React.createElement('div', { className: 'bmon-u-tile-label' }, '请求数', delta(totals.requests, prev && prev.requests)),
            React.createElement('div', { className: 'bmon-u-tile-value' }, Number(totals.requests || 0).toLocaleString()),
            React.createElement('div', { className: 'bmon-u-tile-sub' }, '全部模型调用' + dailyAvg),
          ),
          React.createElement('div', { key: 't4', className: 'bmon-u-tile' },
            React.createElement('div', { className: 'bmon-u-tile-label' }, '缓存命中率'),
            React.createElement('div', { className: 'bmon-u-ringwrap' },
              React.createElement('div', { className: 'bmon-u-ring', style: { background: ringBg } },
                React.createElement('b', null, hit === null ? '—' : Math.round(hit) + '%')),
              React.createElement('div', { className: 'bmon-u-tile-sub' },
                React.createElement('div', null, '命中 ' + fmtTokens(totals.cache_read)),
                React.createElement('div', null, '新输入 ' + fmtTokens(fresh)),
              ),
            ),
          ),
        ]
        return React.createElement('div', { className: 'bmon-u-tiles' }, ...tiles)
      }

      function UsageHeatmap({ daily }) {
        if (!daily || !daily.length) return null
        const max = Math.max(1, ...daily.map((d) => d.total))
        const first = parseDate(daily[0].date)
        const lead = (first.getDay() + 6) % 7
        const columns = Math.ceil((lead + daily.length) / 7)
        const cols = []
        for (let col = 0; col < columns; col += 1) {
          const cells = []
          for (let row = 0; row < 7; row += 1) {
            const idx = col * 7 + row - lead
            const day = idx >= 0 && idx < daily.length ? daily[idx] : null
            if (day) {
              const level = day.total === 0 ? 0 : Math.min(4, 1 + Math.floor((day.total / max) * 3.99))
              cells.push(React.createElement('i', { key: row, className: 'bmon-u-heat-cell', 'data-l': String(level),
                title: day.date + '：' + fmtTokens(day.total) + ' tokens · ' + day.requests + ' 次请求' }))
            } else {
              cells.push(React.createElement('i', { key: row, className: 'bmon-u-heat-cell' }))
            }
          }
          cols.push(React.createElement('div', { key: col, className: 'bmon-u-heat-col' }, ...cells))
        }
        const monthLabels = []
        let previousMonth = -1
        for (let col = 0; col < columns; col += 1) {
          const idx = Math.min(Math.max(0, col * 7 - lead), daily.length - 1)
          const month = parseDate(daily[idx].date).getMonth()
          if (month !== previousMonth) {
            monthLabels.push(React.createElement('span', { key: col, className: 'bmon-u-heat-month', style: { left: ((col / columns) * 100) + '%' } }, (month + 1) + '月'))
            previousMonth = month
          }
        }
        const weekdays = ['一', '', '三', '', '五', '', ''].map((label, row) =>
          React.createElement('span', { key: row }, label))
        const requests = daily.reduce((sum, d) => sum + d.requests, 0)
        const tokens = daily.reduce((sum, d) => sum + d.total, 0)
        return React.createElement('div', { className: 'bmon-u-card' },
          React.createElement('div', { className: 'bmon-u-card-head' },
            React.createElement('h3', { style: { margin: 0, fontSize: 13, fontWeight: 600 } }, '用量日历'),
            React.createElement('span', { className: 'bmon-hint' }, 'GitHub 贡献图风格 · 悬停看明细'),
          ),
          React.createElement('div', { className: 'bmon-u-heat-wrap' },
            React.createElement('div', { className: 'bmon-u-heat-months' }, ...monthLabels),
            React.createElement('div', { className: 'bmon-u-heat-body' },
              React.createElement('div', { className: 'bmon-u-heat-weekdays' }, ...weekdays),
              React.createElement('div', { className: 'bmon-u-heat-cols' }, ...cols),
            ),
          ),
          React.createElement('div', { className: 'bmon-u-heat-total' }, '共 ' + requests.toLocaleString() + ' 次调用 · ' + fmtTokens(tokens) + ' tokens'),
        )
      }

      function UsageBars({ daily, range }) {
        let slice = daily || []
        let weekly = false
        if (range === '1d') slice = slice.slice(-2)
        else if (range === '7d') slice = slice.slice(-7)
        else if (range === '30d') slice = slice.slice(-30)
        else {
          weekly = true
          const merged = []
          const weeks = Math.floor(slice.length / 7)
          for (let week = 0; week < weeks; week += 1) {
            const chunk = slice.slice(slice.length - (weeks - week) * 7, slice.length - (weeks - week - 1) * 7)
            if (!chunk.length) continue
            const m = { date: chunk[0].date, requests: 0, prompt: 0, completion: 0, cache_read: 0, total: 0 }
            for (const day of chunk) {
              m.requests += day.requests; m.prompt += day.prompt; m.completion += day.completion
              m.cache_read += day.cache_read; m.total += day.total
            }
            merged.push(m)
          }
          slice = merged
        }
        const HEIGHT = 200
        const max = Math.max(...slice.map((d) => d.total), 0)
        const children = []
        if (!max) {
          children.push(React.createElement('div', { key: 'empty', className: 'bmon-u-empty' }, '该范围内没有调用记录'))
          return React.createElement('div', { className: 'bmon-u-card' }, ...children)
        }
        const rawStep = max / 4
        const stepPow = Math.pow(10, Math.floor(Math.log10(Math.max(1, rawStep))))
        const stepUnit = rawStep / stepPow
        const step = (stepUnit <= 1 ? 1 : stepUnit <= 2 ? 2 : stepUnit <= 5 ? 5 : 10) * stepPow
        const grid = [React.createElement('div', { key: 'g0', className: 'bmon-u-gridline', style: { bottom: 0 } }),
          React.createElement('span', { key: 'y0', className: 'bmon-u-y', style: { bottom: 0 } }, '0')]
        for (let value = step; value <= max; value += step) {
          grid.push(React.createElement('div', { key: 'g' + value, className: 'bmon-u-gridline', style: { bottom: (value / max) * HEIGHT + 'px' } }))
          grid.push(React.createElement('span', { key: 'y' + value, className: 'bmon-u-y', style: { bottom: (value / max) * HEIGHT + 'px' } }, fmtTokens(value)))
        }
        const bars = []
        const xlabels = []
        slice.forEach((day, index) => {
          const fresh = Math.max(0, day.prompt - day.cache_read)
          const segments = []
          for (const pair of [[fresh, 'bmon-u-s1'], [day.completion, 'bmon-u-s2'], [day.cache_read, 'bmon-u-s3']]) {
            segments.push(React.createElement('i', { key: pair[1], className: pair[1], style: { height: Math.max(pair[0] > 0 ? 1 : 0, (pair[0] / max) * HEIGHT) + 'px' } }))
          }
          const tip = day.date + (weekly ? ' 起当周' : '') + '\n新输入 ' + fmtTokens(fresh) + ' · 输出 ' + fmtTokens(day.completion) + ' · 缓存命中 ' + fmtTokens(day.cache_read) + '\n请求 ' + day.requests + ' · 合计 ' + fmtTokens(day.total)
          bars.push(React.createElement('div', { key: day.date, className: 'bmon-u-bar-slot', title: tip },
            React.createElement('div', { className: 'bmon-u-bar-col' }, ...segments)))
          let labelText = ''
          if (weekly) labelText = index % 4 ? '' : day.date.slice(5)
          else if (slice.length > 16) labelText = index % 5 ? '' : day.date.slice(5)
          else if (slice.length === 1) labelText = day.date.slice(5)
          else labelText = day.date.slice(8)
          xlabels.push(React.createElement('span', { key: day.date }, labelText))
        })
        children.push(React.createElement('div', { key: 'head', className: 'bmon-u-card-head' },
          React.createElement('h3', { style: { margin: 0, fontSize: 13, fontWeight: 600 } }, '消耗趋势'),
          React.createElement('span', { className: 'bmon-hint' }, weekly ? '按周聚合 · 悬停看明细' : '悬停看明细'),
        ))
        children.push(React.createElement('div', { key: 'legend', className: 'bmon-row', style: { marginBottom: 4 } },
          React.createElement('span', { className: 'bmon-hint' }, React.createElement('i', { style: { display: 'inline-block', width: 8, height: 8, background: 'var(--bmon-c1)', borderRadius: 2, marginRight: 4 } }), '新输入'),
          React.createElement('span', { className: 'bmon-hint' }, React.createElement('i', { style: { display: 'inline-block', width: 8, height: 8, background: 'var(--bmon-c2)', borderRadius: 2, marginRight: 4 } }), '输出'),
          React.createElement('span', { className: 'bmon-hint' }, React.createElement('i', { style: { display: 'inline-block', width: 8, height: 8, background: 'var(--bmon-c3)', borderRadius: 2, marginRight: 4 } }), '缓存命中'),
        ))
        children.push(React.createElement('div', { key: 'chart', className: 'bmon-u-bars-wrap' },
          React.createElement('div', { className: 'bmon-u-bars' }, ...grid, ...bars),
          React.createElement('div', { className: 'bmon-u-x' }, ...xlabels),
        ))
        return React.createElement('div', { className: 'bmon-u-card' }, ...children)
      }

      function UsageModels({ stats }) {
        const models = stats.models || []
        const totalTokens = stats.totals.total
        const colors = ['var(--bmon-c1)', 'var(--bmon-c2)', 'var(--bmon-c3)', 'var(--bmon-c4)']
        const children = []
        children.push(React.createElement('div', { key: 'head', className: 'bmon-u-card-head' },
          React.createElement('h3', { style: { margin: 0, fontSize: 13, fontWeight: 600 } }, '模型消耗明细'),
          React.createElement('span', { className: 'bmon-hint' }, '同一模型全页同色'),
        ))
        if (!models.length || !totalTokens) {
          children.push(React.createElement('div', { key: 'empty', className: 'bmon-u-empty' }, '该范围内没有调用记录'))
          return React.createElement('div', { className: 'bmon-u-card' }, ...children)
        }
        const segments = []
        let acc = 0
        models.forEach((model, index) => {
          const share = (model.total / totalTokens) * 100
          segments.push(colors[index % colors.length] + ' ' + acc + '% ' + (acc + share) + '%')
          acc += share
        })
        const rows = models.map((model, index) => {
          const share = totalTokens ? ((model.total / totalTokens) * 100) : 0
          const cells = [
            React.createElement('td', { key: 'm' }, React.createElement('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: colors[index % colors.length], marginRight: 6 } }), model.model),
            React.createElement('td', { key: 'share', className: 'bmon-u-num' }, share.toFixed(1) + '%'),
            React.createElement('td', { key: 'req', className: 'bmon-u-num' }, model.requests),
            React.createElement('td', { key: 'in', className: 'bmon-u-num' }, fmtTokens(model.input)),
            React.createElement('td', { key: 'out', className: 'bmon-u-num' }, fmtTokens(model.output)),
            React.createElement('td', { key: 'cache', className: 'bmon-u-num' }, model.cacheRead ? fmtTokens(model.cacheRead) : '—'),
          ]
          return React.createElement('tr', { key: model.model }, ...cells)
        })
        const donut = React.createElement('div', { className: 'bmon-u-donut', style: { background: 'conic-gradient(' + segments.join(',') + ')' } },
          React.createElement('b', null, Number(stats.totals.requests || 0).toLocaleString(), React.createElement('small', null, '次请求')))
        const table = React.createElement('div', { className: 'bmon-u-table-scroll' },
          React.createElement('table', { className: 'bmon-table' },
            React.createElement('thead', null, React.createElement('tr', { key: 'h' },
              React.createElement('th', { key: 'm' }, '模型'),
              React.createElement('th', { key: 's', className: 'bmon-u-num' }, '占比'),
              React.createElement('th', { key: 'r', className: 'bmon-u-num' }, '请求'),
              React.createElement('th', { key: 'i', className: 'bmon-u-num' }, '输入'),
              React.createElement('th', { key: 'o', className: 'bmon-u-num' }, '输出'),
              React.createElement('th', { key: 'c', className: 'bmon-u-num' }, '缓存命中'),
            )),
            React.createElement('tbody', null, ...rows),
          ),
        )
        children.push(React.createElement('div', { key: 'body', className: 'bmon-u-modelbody' }, donut, table))
        return React.createElement('div', { className: 'bmon-u-card' }, ...children)
      }

      function UsageRecords({ stats, modelFilter, onModelFilter }) {
        const models = stats.models || []
        const records = stats.records || []
        const children = []
        children.push(React.createElement('div', { key: 'head', className: 'bmon-u-card-head' },
          React.createElement('h3', { style: { margin: 0, fontSize: 13, fontWeight: 600 } }, '调用明细'),
          React.createElement('span', { className: 'bmon-hint' }, '最近 50 条'),
          React.createElement('select', { className: 'bmon-input', style: { marginLeft: 'auto' }, value: modelFilter, onChange: (e) => onModelFilter(e.target.value) },
            React.createElement('option', { value: '' }, '全部模型'),
            ...models.map((m) => React.createElement('option', { key: m.model, value: m.model }, m.model)),
          ),
        ))
        const filtered = modelFilter ? records.filter((r) => r.model === modelFilter) : records
        if (!filtered.length) {
          children.push(React.createElement('div', { key: 'empty', className: 'bmon-u-empty' }, '该范围内没有调用记录'))
          return React.createElement('div', { className: 'bmon-u-card' }, ...children)
        }
        const rows = filtered.map((record, index) => {
          const d = new Date(record.time)
          const time = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
          const cells = [
            React.createElement('td', { key: 't' }, time),
            React.createElement('td', { key: 's' }, record.sessionId),
            React.createElement('td', { key: 'm' }, record.model),
            React.createElement('td', { key: 'i', className: 'bmon-u-num' }, fmtTokens(record.input)),
            React.createElement('td', { key: 'o', className: 'bmon-u-num' }, fmtTokens(record.output)),
            React.createElement('td', { key: 'c', className: 'bmon-u-num' }, record.cacheRead ? fmtTokens(record.cacheRead) : '—'),
          ]
          return React.createElement('tr', { key: index + '-' + record.time }, ...cells)
        })
        children.push(React.createElement('table', { key: 'table', className: 'bmon-table' },
          React.createElement('thead', null, React.createElement('tr', { key: 'h' },
            React.createElement('th', { key: 't' }, '时间'),
            React.createElement('th', { key: 's' }, '会话'),
            React.createElement('th', { key: 'm' }, '模型'),
            React.createElement('th', { key: 'i', className: 'bmon-u-num' }, '输入'),
            React.createElement('th', { key: 'o', className: 'bmon-u-num' }, '输出'),
            React.createElement('th', { key: 'c', className: 'bmon-u-num' }, '缓存命中'),
          )),
          React.createElement('tbody', null, ...rows),
        ))
        return React.createElement('div', { className: 'bmon-u-card' }, ...children)
      }

      function UsagePage() {
        const [range, setRange] = React.useState('7d')
        const [modelFilter, setModelFilter] = React.useState('')
        const pair = useUsageState(range)
        const snapshot = pair[0]
        const children = []
        const ranges = [['1d', '1天'], ['7d', '7天'], ['30d', '30天'], ['all', '至今']]
        children.push(React.createElement('div', { key: 'toolbar', className: 'bmon-u-toolbar' },
          React.createElement('div', { className: 'bmon-u-seg' },
            ...ranges.map((r) => React.createElement('button', { key: r[0], type: 'button', className: r[0] === range ? 'on' : '', onClick: () => setRange(r[0]) }, r[1])),
          ),
          React.createElement('span', { className: 'bmon-hint' }, snapshot ? '更新于 ' + new Date(snapshot.updatedAt).toLocaleTimeString() : '正在载入…'),
          React.createElement('button', { type: 'button', className: 'bmon-btn', onClick: () => { apiCall('get-usage', { range: range }).then((value) => { if (value && typeof value === 'object') pair[1](value) }).catch(() => {}) } }, '↻'),
        ))
        if (!snapshot) {
          children.push(React.createElement('div', { key: 'loading', className: 'bmon-hint' }, '正在连接 Host…'))
          return React.createElement('div', { className: 'bmon-page' }, ...children)
        }
        if (snapshot.error) {
          children.push(React.createElement('div', { key: 'err', className: 'bmon-err' }, '用量统计不可用：' + snapshot.error))
          return React.createElement('div', { className: 'bmon-page' }, ...children)
        }
        if (!snapshot.ready) {
          children.push(React.createElement('div', { key: 'loading', className: 'bmon-hint' }, '正在扫描会话历史…'))
          return React.createElement('div', { className: 'bmon-page' }, ...children)
        }
        const stats = snapshot.stats
        const live = stats.live
        const liveText = '轮 ' + live.turns + ' · 步 ' + live.steps +
          ' | LLM ' + fmtDur(live.llmMs) + ' · 工具调用 ' + fmtDur(live.toolMs) +
          ' | 首 token 平均 ' + (live.firstTokenCount ? live.firstTokenMs.toFixed(1) + 's' : '—') + ' · ' + live.tokPerSec.toFixed(0) + ' tok/s'
        children.push(React.createElement(UsageTiles, { key: 'tiles', stats: stats, range: range }))
        children.push(React.createElement('div', { key: 'live', className: 'bmon-u-live', title: '轮次 / 步数 / LLM 时长 / 工具调用时长 / 首 token 延迟 / 生成速度（含历史扫描，首 token 仅统计插件运行后）' }, liveText))
        children.push(React.createElement(UsageHeatmap, { key: 'heat', daily: stats.daily }))
        children.push(React.createElement(UsageBars, { key: 'bars', daily: stats.daily, range: range }))
        children.push(React.createElement(UsageModels, { key: 'models', stats: stats }))
        children.push(React.createElement(UsageRecords, { key: 'records', stats: stats, modelFilter: modelFilter, onModelFilter: setModelFilter }))
        return React.createElement('div', { className: 'bmon-page' }, ...children)
      }

      const slots = ctx.get('slots')
      if (slots === undefined) return
      slots.inject('conversation.composer.dock', () => slots.register(
        { name: 'conversation.composer.dock', id: 'bmon-dock', order: 100, label: '余额监控' },
        () => React.createElement(DockReadout),
      ))
      slots.inject('conversation.input.right', () => slots.register(
        { name: 'conversation.input.right', id: 'bmon-balance', order: 100, label: '余额监控' },
        () => React.createElement(IconBarButton, { tab: 'balance', paths: '<path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M16 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M3 9h18"/>', label: '余额监控' }),
      ))
      slots.inject('conversation.input.right', () => slots.register(
        { name: 'conversation.input.right', id: 'bmon-usage', order: 110, label: '用量统计' },
        () => React.createElement(IconBarButton, { tab: 'usage', paths: '<path d="M6 20V10"/><path d="M12 20V4"/><path d="M18 20v-6"/>', label: '用量统计' }),
      ))
      slots.inject('conversation.input.right', () => slots.register(
        { name: 'conversation.input.right', id: 'bmon-plugins', order: 120, label: '三方插件' },
        () => React.createElement(IconBarButton, { tab: 'plugins', paths: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', label: '三方插件' }),
      ))
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
