// dsh-balance-plugin —— Host 半端（静态 cordis 插件形态）
// 供 `dsh plugin --profile web add <package>` 安装；与动态版（仓库根 host.js）逻辑同源。
// RPC 通过 ctx.webServer 提供 HTTP 路由（POST /bmon/api/<name>），Client 用 fetch 调用。

export const inject = ['timer', 'webServer', 'clientModules', 'credentials']

export function apply(ctx) {
  const shell = ctx.get('shell')
  const webServer = ctx.webServer
  const credentials = ctx.get('credentials')
  const clientModules = ctx.get('clientModules')
  const sessionQuery = ctx.get('sessionQuery')
  const tools = ctx.get('tools')

  const BALANCE_URL = 'https://api.deepseek.com/user/balance'
  const RECHARGE_URL = 'https://platform.deepseek.com/top_up'
  const USAGE_URL = 'https://platform.deepseek.com/usage'

  const state = {
    accounts: [],
    thresholdCny: 10,
    thresholdUsd: 2,
    intervalMs: 300000,
    showDock: true,
    last: null,
    pollError: null,
    polling: false,
    version: 0,
    nextAccountId: 1,
    configPath: null,
    configLoaded: false,
    pluginVersion: '',
  }

  function bump() { state.version += 1 }

  // 读取插件版本号
  async function loadPluginVersion() {
    if (state.pluginVersion) return state.pluginVersion
    try {
      const fs = await import('fs')
      const pathMod = await import('path')
      const candidates = [
        pathMod.join(process.cwd(), 'node_modules', 'dsh-balance-plugin', 'package.json'),
        pathMod.join(process.cwd(), 'package.json'),
      ]
      if (clientModules) {
        try {
          const clientPath = clientModules.clientPath('dsh-balance-plugin') || ''
          if (clientPath) candidates.unshift(pathMod.join(pathMod.dirname(clientPath), 'package.json'))
        } catch (e) { /* ignore */ }
      }
      for (const pkgPath of candidates) {
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
          if (pkg.name === 'dsh-balance-plugin' && pkg.version) {
            state.pluginVersion = pkg.version
            return state.pluginVersion
          }
        }
      }
    } catch (e) { /* ignore */ }
    return state.pluginVersion
  }

  // 持久化配置文件读写
  async function getConfigPath() {
    if (state.configPath) return state.configPath
    if (!clientModules) return null
    try {
      const path = clientModules.clientPath('dsh-balance-plugin') || ''
      if (path) {
        const fs = await import('fs')
        const pathMod = await import('path')
        const configDir = pathMod.dirname(path)
        state.configPath = pathMod.join(configDir, 'config.json')
        return state.configPath
      }
    } catch (e) { /* ignore */ }
    return null
  }

  async function loadConfig() {
    if (state.configLoaded) return
    const configPath = await getConfigPath()
    if (!configPath) { state.configLoaded = true; return }
    try {
      const fs = await import('fs')
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (Array.isArray(data.accounts)) state.accounts = data.accounts
        if (typeof data.thresholdCny === 'number') state.thresholdCny = data.thresholdCny
        if (typeof data.thresholdUsd === 'number') state.thresholdUsd = data.thresholdUsd
        if (typeof data.intervalMs === 'number') state.intervalMs = data.intervalMs
        if (typeof data.showDock === 'boolean') state.showDock = data.showDock
        if (typeof data.nextAccountId === 'number') state.nextAccountId = data.nextAccountId
        bump()
      }
    } catch (e) { /* ignore */ }
    state.configLoaded = true
  }

  async function saveConfig() {
    const configPath = await getConfigPath()
    if (!configPath) return
    try {
      const fs = await import('fs')
      const data = {
        accounts: state.accounts.map((a) => ({
          id: a.id,
          name: a.name,
          key: a.key,
          auto: a.auto,
          autoSource: a.autoSource,
        })),
        thresholdCny: state.thresholdCny,
        thresholdUsd: state.thresholdUsd,
        intervalMs: state.intervalMs,
        showDock: state.showDock,
        nextAccountId: state.nextAccountId,
      }
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (e) { /* ignore */ }
  }

  function keySourceOf(key) {
    const v = String(key || '').trim()
    if (!v) return { hasKey: false, source: '未配置', hint: '' }
    if (v.startsWith('$env:')) {
      const name = v.slice(5).trim()
      return { hasKey: true, source: '$env:' + name, hint: '' }
    }
    return { hasKey: true, source: 'API Key', hint: v.length > 4 ? '…' + v.slice(-4) : v }
  }

  function authHeaderFor(key) {
    const v = String(key || '').trim()
    if (!v) return { ok: false, error: '未配置 API Key' }
    if (v.startsWith('$env:')) {
      const name = v.slice(5).trim()
      if (!name) return { ok: false, error: '环境变量名为空' }
      const resolved = process.env[name]
      if (!resolved) return { ok: false, error: '环境变量 ' + name + ' 未设置' }
      return { ok: true, header: 'Bearer ' + resolved }
    }
    const escaped = v.replace(/'/g, "'\\''")
    return { ok: true, header: 'Bearer ' + v }
  }

  function parseErrorBody(text) {
    try {
      const obj = JSON.parse(text)
      if (obj && obj.error && typeof obj.error.message === 'string') return obj.error.message
      if (obj && typeof obj.message === 'string') return obj.message
    } catch (e) { /* not json */ }
    return null
  }

  async function fetchAccount(account, signal) {
    const base = { id: account.id, name: account.name }
    const auth = authHeaderFor(account.key)
    if (!auth.ok) return Object.assign({}, base, { ok: false, error: auth.error, balances: [], low: [] })
    let text = ''
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(BALANCE_URL, {
        method: 'GET',
        headers: { 'Authorization': auth.header, 'Accept': 'application/json' },
        signal: signal || controller.signal,
      })
      clearTimeout(timer)
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        const detail = body.slice(0, 300)
        return Object.assign({}, base, { ok: false, error: detail || 'HTTP ' + res.status, balances: [], low: [] })
      }
      text = await res.text()
    } catch (err) {
      return Object.assign({}, base, { ok: false, error: String(err && err.message || err).slice(0, 300), balances: [], low: [] })
    }
    let body = null
    try { body = JSON.parse(text) } catch (e) { /* fallthrough */ }
    if (!body || typeof body !== 'object') {
      return Object.assign({}, base, { ok: false, error: (text || '').slice(0, 300) || '无法解析响应', balances: [], low: [] })
    }
    const infos = Array.isArray(body.balance_infos) ? body.balance_infos : []
    if (!infos.length) {
      const message = parseErrorBody(text)
      return Object.assign({}, base, { ok: false, error: message || '响应中无余额信息', balances: [], low: [] })
    }
    const balances = infos.map((info) => ({
      currency: String(info.currency || ''),
      total: String(info.total_balance !== undefined && info.total_balance !== null ? info.total_balance : ''),
      granted: String(info.granted_balance !== undefined && info.granted_balance !== null ? info.granted_balance : ''),
      toppedUp: String(info.topped_up_balance !== undefined && info.topped_up_balance !== null ? info.topped_up_balance : ''),
    }))
    const low = []
    for (const balance of balances) {
      const total = parseFloat(balance.total)
      const threshold = balance.currency === 'CNY' ? state.thresholdCny : state.thresholdUsd
      if (Number.isFinite(total) && total < threshold) {
        low.push({ currency: balance.currency, total: balance.total, threshold: threshold })
      }
    }
    return Object.assign({}, base, { ok: true, error: null, balances: balances, low: low })
  }

  async function pollAll(signal) {
    if (state.polling) return
    const configured = state.accounts.filter((account) => String(account.key || '').trim())
    if (!configured.length) {
      state.last = null
      state.pollError = null
      bump()
      return
    }
    state.polling = true
    bump()
    try {
      const results = await Promise.all(configured.map((account) => fetchAccount(account, signal)))
      const previousLow = new Set((state.last ? state.last.low : []).map((entry) => entry.accountId + ':' + entry.currency))
      const low = []
      for (const result of results) {
        for (const entry of (result.low || [])) {
          const key = result.id + ':' + entry.currency
          if (!previousLow.has(key)) {
            console.warn('[余额监控] ' + result.name + ' ' + entry.currency + ' 余额 ' + entry.total + ' 低于阈值 ' + entry.threshold)
          }
          low.push(Object.assign({ accountId: result.id, accountName: result.name }, entry))
        }
      }
      state.last = { at: Date.now(), accounts: results, low: low }
      state.pollError = null
    } catch (error) {
      state.pollError = String(error && error.message || error).slice(0, 500)
    } finally {
      state.polling = false
      bump()
    }
  }

  // —— 自动发现 DSH 凭据中已配置的 DeepSeek Key ——
  async function discoverAutoKeys() {
    if (state.accounts.length) return
    if (!credentials) return
    let resolved = null
    try {
      resolved = await credentials.resolve('DEEPSEEK_API_KEY')
    } catch (e) { /* 读取失败则忽略 */ }
    if (!resolved || !resolved.value) return
    state.accounts = [{
      id: 'auto-1',
      name: '自动读取·DSH 凭据',
      key: resolved.value,
      auto: true,
      autoSource: resolved.source || 'credentials',
    }]
    bump()
    console.log('[余额监控] 已自动读取 DEEPSEEK_API_KEY（来源：' + (resolved.source || 'credentials') + '）')
    pollAll()
  }
  discoverAutoKeys()

  // ===== 用量统计（复刻 Miyu 用量页数据）=====
  const USAGE_KEEP_MS = 90 * 86400000
  const usage = {
    ready: false,
    error: null,
    version: 0,
    perDay: new Map(),
    perModel: new Map(),
    records: [],
    live: {
      turns: 0,
      steps: 0,
      llmMs: 0,
      toolMs: 0,
      toolCalls: 0,
      firstTokenSum: 0,
      firstTokenCount: 0,
      outputTokens: 0,
      stepStart: new Map(),
      stepToolAccum: new Map(),
      toolStart: new Map(),
      firstChunk: new Map(),
    },
  }
  const liveSeqs = new Map()

  function dayKeyOf(time) {
    const d = new Date(time)
    const pad = (n) => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  }

  function emptyAgg() {
    return { requests: 0, input: 0, output: 0, cacheRead: 0, tools: 0, turns: 0, steps: 0, total: 0 }
  }

  function mergeAgg(target, source) {
    target.requests += source.requests || 0
    target.input += source.input || 0
    target.output += source.output || 0
    target.cacheRead += source.cacheRead || 0
    target.tools += source.tools || 0
    target.turns += source.turns || 0
    target.steps += source.steps || 0
    target.total = target.input + target.output
  }

  function bumpUsage() { usage.version += 1 }

  function ingestEvent(sessionId, event) {
    const time = event.time
    const data = event.data || {}
    const live = usage.live
    if (event.type === 'assistant/message') {
      const usageInfo = data.usage
      if (usageInfo) {
        const model = data.message && data.message.source ? String(data.message.source.model || 'unknown') : 'unknown'
        const day = dayKeyOf(time)
        const agg = {
          requests: 1,
          input: usageInfo.inputTokens || 0,
          output: usageInfo.outputTokens || 0,
          cacheRead: usageInfo.cacheReadTokens || 0,
          tools: 0,
          turns: 0,
          steps: 0,
        }
        const dayAgg = usage.perDay.get(day) || emptyAgg()
        mergeAgg(dayAgg, agg)
        usage.perDay.set(day, dayAgg)
        let modelMap = usage.perModel.get(model)
        if (!modelMap) { modelMap = new Map(); usage.perModel.set(model, modelMap) }
        const modelAgg = modelMap.get(day) || emptyAgg()
        mergeAgg(modelAgg, agg)
        modelMap.set(day, modelAgg)
        live.outputTokens += usageInfo.outputTokens || 0
        usage.records.unshift({ time: time, sessionId: String(sessionId).slice(0, 8), model: model, input: agg.input + agg.cacheRead, output: agg.output, cacheRead: agg.cacheRead })
        if (usage.records.length > 50) usage.records.length = 50
        bumpUsage()
      }
      return
    }
    if (event.type === 'turn/end') {
      const day = dayKeyOf(time)
      const dayAgg = usage.perDay.get(day) || emptyAgg()
      dayAgg.turns += 1
      usage.perDay.set(day, dayAgg)
      live.turns += 1
      bumpUsage()
      return
    }
    if (event.type === 'step/start') {
      live.stepStart.set(sessionId + ':' + data.turn + ':' + data.step, time)
      return
    }
    if (event.type === 'step/end') {
      const key = sessionId + ':' + data.turn + ':' + data.step
      const start = live.stepStart.get(key)
      const toolAccum = live.stepToolAccum.get(key) || 0
      if (typeof start === 'number') live.llmMs += Math.max(0, time - start - toolAccum)
      live.stepStart.delete(key)
      live.stepToolAccum.delete(key)
      const day = dayKeyOf(time)
      const dayAgg = usage.perDay.get(day) || emptyAgg()
      dayAgg.steps += 1
      usage.perDay.set(day, dayAgg)
      live.steps += 1
      bumpUsage()
      return
    }
    if (event.type === 'tool/call') {
      live.toolStart.set(String(data.callId), time)
      return
    }
    if (event.type === 'tool/result') {
      const callId = data.message && data.message.source ? String(data.message.source.callId || '') : ''
      const start = live.toolStart.get(callId)
      if (typeof start === 'number') {
        const duration = Math.max(0, time - start)
        live.toolMs += duration
        live.toolCalls += 1
        const stepKey = sessionId + ':' + data.turn + ':' + data.step
        live.stepToolAccum.set(stepKey, (live.stepToolAccum.get(stepKey) || 0) + duration)
      }
      if (callId) live.toolStart.delete(callId)
      const day = dayKeyOf(time)
      const dayAgg = usage.perDay.get(day) || emptyAgg()
      dayAgg.tools += 1
      usage.perDay.set(day, dayAgg)
      bumpUsage()
      return
    }
    if (event.type === 'assistant/chunk') {
      const key = sessionId + ':' + data.turn + ':' + data.step
      if (!live.firstChunk.has(key)) {
        live.firstChunk.set(key, time)
        const start = live.stepStart.get(key)
        if (typeof start === 'number') {
          live.firstTokenSum += Math.max(0, time - start)
          live.firstTokenCount += 1
        }
      }
      return
    }
  }

  ctx.on('session/event', (session, event) => {
    if (!session || !event || typeof event.time !== 'number') return
    const id = String(session.id || '')
    if (!id) return
    const prev = liveSeqs.get(id) || 0
    if (typeof event.seq === 'number' && event.seq > prev) liveSeqs.set(id, event.seq)
    if (event.time >= Date.now() - USAGE_KEEP_MS) ingestEvent(id, event)
  })

  async function scanHistory() {
    if (!sessionQuery) {
      usage.ready = true
      bumpUsage()
      return
    }
    try {
      const sessions = await sessionQuery.listSessions()
      const cut = Date.now() - USAGE_KEEP_MS
      let scanned = 0
      for (const record of sessions) {
        if (!record || !record.header) continue
        const id = String(record.header.id || '')
        if (!id) continue
        try {
          const snapshot = await sessionQuery.readSession(id)
          const events = snapshot && Array.isArray(snapshot.events) ? snapshot.events : []
          const maxSeq = liveSeqs.get(id) || 0
          for (const event of events) {
            if (!event || typeof event.time !== 'number' || event.time < cut) continue
            if (typeof event.seq === 'number' && event.seq <= maxSeq) continue
            ingestEvent(id, event)
          }
          scanned += 1
        } catch (e) { /* 单会话读取失败则跳过 */ }
        if (scanned >= 60) break
      }
    } catch (e) {
      usage.error = String(e && e.message || e).slice(0, 300)
    }
    usage.ready = true
    bumpUsage()
    console.log('[余额监控] 用量统计初始化完成：' + usage.perDay.size + ' 天 · ' + usage.records.length + ' 条明细 · ' + usage.live.turns + ' 轮 / ' + usage.live.steps + ' 步')
  }
  scanHistory()

  function computeUsage(range) {
    const dayList = []
    for (const [key, agg] of usage.perDay) dayList.push({ date: key, agg: agg })
    dayList.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    const totalFor = (list) => {
      const t = emptyAgg()
      for (const d of list) mergeAgg(t, d.agg)
      return t
    }
    let current = dayList
    let previous = []
    if (range === '1d') { current = dayList.slice(-2); previous = dayList.slice(-4, -2) }
    else if (range === '7d') { current = dayList.slice(-7); previous = dayList.slice(-14, -7) }
    else if (range === '30d') { current = dayList.slice(-30); previous = dayList.slice(-60, -30) }
    const totals = totalFor(current)
    const prevTotals = previous.length ? totalFor(previous) : null
    const models = []
    for (const [model, byDay] of usage.perModel) {
      let sum = null
      for (const day of current) {
        const agg = byDay.get(day.date)
        if (agg) { if (!sum) sum = emptyAgg(); mergeAgg(sum, agg) }
      }
      if (sum) models.push({
        model: model,
        requests: sum.requests,
        input: sum.input + sum.cacheRead,
        output: sum.output,
        cacheRead: sum.cacheRead,
        total: sum.input + sum.output + sum.cacheRead,
      })
    }
    models.sort((a, b) => b.total - a.total)
    const live = usage.live
    const totalsPrompt = totals.input + totals.cacheRead
    return {
      totals: {
        total: totalsPrompt + totals.output,
        prompt: totalsPrompt,
        completion: totals.output,
        cache_read: totals.cacheRead,
        requests: totals.requests,
        turns: totals.turns,
        steps: totals.steps,
        tools: totals.tools,
      },
      prevTotals: prevTotals ? { total: prevTotals.input + prevTotals.output + prevTotals.cacheRead, requests: prevTotals.requests } : null,
      daily: current.map((d) => {
        const prompt = d.agg.input + d.agg.cacheRead
        return {
          date: d.date,
          requests: d.agg.requests,
          prompt: prompt,
          completion: d.agg.output,
          cache_read: d.agg.cacheRead,
          total: prompt + d.agg.output,
          tools: d.agg.tools,
          turns: d.agg.turns,
          steps: d.agg.steps,
        }
      }),
      models: models,
      records: usage.records,
      live: {
        turns: live.turns,
        steps: live.steps,
        llmMs: live.llmMs,
        toolMs: live.toolMs,
        toolCalls: live.toolCalls,
        firstTokenMs: live.firstTokenCount ? live.firstTokenSum / live.firstTokenCount : 0,
        firstTokenCount: live.firstTokenCount,
        tokPerSec: live.llmMs > 0 ? (live.outputTokens / live.llmMs) * 1000 : 0,
      },
    }
  }

  // ===== 私有 RPC：webServer 路由（POST /bmon/api/<name>，JSON in/out）=====
  function registerRoute(name, handler) {
    if (!webServer) return
    webServer.register({
      kind: 'exact',
      path: '/bmon/api/' + name,
      handler: async (req, res) => {
        let body = ''
        try {
          for await (const chunk of req) body += chunk
        } catch (e) { /* 忽略读流错误 */ }
        let args = {}
        try { args = body ? JSON.parse(body) : {} } catch (e) { args = {} }
        let result
        try {
          result = await handler(args)
        } catch (e) {
          result = { error: String(e && e.message || e).slice(0, 500) }
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(result))
      },
    })
  }

  registerRoute('get-state', async () => getStatePayload())
  registerRoute('refresh', async () => { await pollAll(); return getStatePayload() })
  registerRoute('recharge', async () => ({ label: 'DeepSeek 官方充值', url: RECHARGE_URL, usageUrl: USAGE_URL }))
  registerRoute('set-config', async (args) => {
    const input = args && typeof args === 'object' ? args : {}
    if (Array.isArray(input.accounts)) {
      state.accounts = input.accounts
        .filter((account) => account && typeof account.name === 'string' && account.name.trim())
        .map((account) => {
          const previous = state.accounts.find((item) => item.id === account.id)
          const id = previous ? previous.id : 'account-' + (state.nextAccountId++)
          let key = previous ? previous.key : ''
          if (account.clear === true) key = ''
          else if (typeof account.key === 'string' && account.key.trim() !== '') key = account.key.trim()
          return { id: id, name: account.name.trim(), key: key, auto: previous ? previous.auto : false, autoSource: previous ? previous.autoSource : '' }
        })
    }
    if (typeof input.thresholdCny === 'number' && Number.isFinite(input.thresholdCny)) {
      state.thresholdCny = Math.max(0, input.thresholdCny)
    }
    if (typeof input.thresholdUsd === 'number' && Number.isFinite(input.thresholdUsd)) {
      state.thresholdUsd = Math.max(0, input.thresholdUsd)
    }
    if (typeof input.intervalMs === 'number' && Number.isFinite(input.intervalMs)) {
      state.intervalMs = Math.min(3600000, Math.max(10000, Math.round(input.intervalMs)))
      restartInterval()
    }
    if (typeof input.showDock === 'boolean') {
      state.showDock = input.showDock
    }
    // 持久化配置到文件
    await saveConfig()
    await pollAll()
    return getStatePayload()
  })
  registerRoute('get-usage', async (args) => {
    const range = args && typeof args.range === 'string' && ['1d', '7d', '30d', 'all'].indexOf(args.range) !== -1 ? args.range : '7d'
    return {
      version: usage.version,
      ready: usage.ready,
      error: usage.error,
      updatedAt: Date.now(),
      range: range,
      stats: computeUsage(range),
    }
  })
  registerRoute('list-plugins', async () => {
    if (!clientModules) return { error: 'clientModules 服务不可用', total: 0, plugins: [] }
    try {
      const graph = clientModules.graph()
      const entries = graph && Array.isArray(graph.entries) ? graph.entries : []
      const fs = await import('fs')
      const pathMod = await import('path')
      const pluginPromises = entries.map(async (entry) => {
        const official = String(entry.id || '').startsWith('@deepseek-ai/')
        let path = ''
        try { path = clientModules.clientPath(entry.id) || '' } catch (e) { path = '' }
        let version = ''
        let repository = ''
        try {
          const pkgPath = pathMod.join(pathMod.dirname(path), 'package.json')
          if (path && fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
            version = pkg.version || ''
            repository = pkg.repository && pkg.repository.url ? pkg.repository.url : ''
          }
        } catch (e) { /* ignore */ }
        if (!repository && !official && shell) {
          try {
            const cmd = 'npm view ' + String(entry.id || '') + ' repository.url --json 2>/dev/null'
            const spec = shell.resolve({ command: cmd, timeoutMs: 8000 })
            const result = await shell.run(spec)
            const urlRaw = (result.stdout.text || '').trim()
            if (urlRaw && result.exitCode === 0) {
              try { repository = JSON.parse(urlRaw) } catch (e) { repository = urlRaw }
            }
          } catch (e) { /* ignore */ }
        }
        return {
          id: String(entry.id || ''),
          official: official,
          path: path,
          rev: String(entry.rev || '').slice(0, 8),
          inject: Array.isArray(entry.inject) ? entry.inject : [],
          immediately: Boolean(entry.immediately),
          version: version,
          repository: repository.replace(/^git\+/, '').replace(/\.git$/, ''),
        }
      })
      const plugins = (await Promise.all(pluginPromises)).sort((a, b) => (a.official === b.official ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) : a.official ? 1 : -1))
      return {
        rev: graph && graph.rev ? graph.rev : '',
        total: plugins.length,
        thirdParty: plugins.filter((p) => !p.official).length,
        plugins: plugins,
      }
    } catch (e) {
      return { error: String(e && e.message || e).slice(0, 300), total: 0, plugins: [] }
    }
  })
  registerRoute('open-plugin-dir', async (args) => {
    const id = args && typeof args.id === 'string' ? args.id : ''
    if (!shell || !clientModules || !id) return { ok: false, error: '不可用' }
    let path = ''
    try { path = clientModules.clientPath(id) || '' } catch (e) { path = '' }
    if (!path) return { ok: false, error: '未找到插件路径' }
    const escaped = path.replace(/'/g, "'\\''")
    try {
      const spec = shell.resolve({ command: "open -R '" + escaped + "' 2>/dev/null || open '" + escaped + "'", timeoutMs: 10000 })
      const result = await shell.run(spec)
      return { ok: result.exitCode === 0, error: result.exitCode === 0 ? '' : (result.stderr.text || '').trim().slice(0, 200) }
    } catch (e) {
      return { ok: false, error: String(e && e.message || e).slice(0, 200) }
    }
  })
  registerRoute('install-plugin', async (args) => {
    const pkg = args && typeof args.pkg === 'string' ? args.pkg.trim() : ''
    if (!shell || !pkg) return { ok: false, error: '缺少包名' }
    const profile = process.env.DSH_PROFILE || 'web'
    try {
      const cmd = 'dsh plugin --profile ' + profile + ' add ' + pkg
      const spec = shell.resolve({ command: cmd, timeoutMs: 120000 })
      const result = await shell.run(spec)
      const out = (result.stdout.text || '').trim()
      const err = (result.stderr.text || '').trim()
      if (result.exitCode !== 0) return { ok: false, error: (err || out || '安装失败').slice(0, 500) }
      return { ok: true, output: out.slice(0, 500) }
    } catch (e) {
      return { ok: false, error: String(e && e.message || e).slice(0, 300) }
    }
  })
  registerRoute('uninstall-plugin', async (args) => {
    const pkg = args && typeof args.pkg === 'string' ? args.pkg.trim() : ''
    if (!shell || !pkg) return { ok: false, error: '缺少包名' }
    const profile = process.env.DSH_PROFILE || 'web'
    try {
      const cmd = 'dsh plugin --profile ' + profile + ' rm ' + pkg
      const spec = shell.resolve({ command: cmd, timeoutMs: 60000 })
      const result = await shell.run(spec)
      const out = (result.stdout.text || '').trim()
      const err = (result.stderr.text || '').trim()
      if (result.exitCode !== 0) return { ok: false, error: (err || out || '卸载失败').slice(0, 500) }
      return { ok: true, output: out.slice(0, 500) }
    } catch (e) {
      return { ok: false, error: String(e && e.message || e).slice(0, 300) }
    }
  })
  registerRoute('update-plugin', async (args) => {
    const pkg = args && typeof args.pkg === 'string' ? args.pkg.trim() : ''
    if (!shell || !pkg) return { ok: false, error: '缺少包名' }
    const profile = process.env.DSH_PROFILE || 'web'
    const githubSrc = 'github:Francis-Xavier-code/dsh-balance-plugin'
    try {
      const rmCmd = 'dsh plugin --profile ' + profile + ' rm ' + pkg + ' 2>/dev/null || true'
      const rmResult = await shell.run(shell.resolve({ command: rmCmd, timeoutMs: 30000 }))
      const addCmd = 'UPDATE=1 dsh plugin --profile ' + profile + ' add ' + githubSrc
      const spec = shell.resolve({ command: addCmd, timeoutMs: 120000 })
      const result = await shell.run(spec)
      const out = (result.stdout.text || '').trim()
      const err = (result.stderr.text || '').trim()
      if (result.exitCode !== 0) return { ok: false, error: (err || out || '更新失败').slice(0, 500), output: (out || err || '').slice(0, 500) }
      return { ok: true, output: out.slice(0, 500), error: '' }
    } catch (e) {
      return { ok: false, error: String(e && e.message || e).slice(0, 300) }
    }
  })
  registerRoute('check-updates', async (args) => {
    const pkg = args && typeof args.pkg === 'string' ? args.pkg.trim() : ''
    const localVersion = args && typeof args.localVersion === 'string' && args.localVersion.trim() ? args.localVersion.trim() : ''
    if (!shell) return { ok: false, error: '不可用' }
    try {
      const localPkgJson = await import('path').then((pathMod) => {
        const fs = require('fs')
        const pkgJsonPath = pathMod.join(process.cwd(), 'node_modules', pkg, 'package.json')
        if (fs.existsSync(pkgJsonPath)) {
          return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
        }
        return null
      }).catch(() => null)
      const version = localPkgJson && localPkgJson.version ? localPkgJson.version : localVersion
      const repoUrl = localPkgJson && localPkgJson.repository && localPkgJson.repository.url
        ? localPkgJson.repository.url : 'https://github.com/Francis-Xavier-code/dsh-balance-plugin'
      const repoMatch = repoUrl.match(/github\.com[/:]([^/]+\/[^/.]+)/)
      const repoPath = repoMatch ? repoMatch[1] : 'Francis-Xavier-code/dsh-balance-plugin'
      const cmd = 'curl -fsSL https://raw.githubusercontent.com/' + repoPath + '/main/package.json 2>/dev/null | grep \'"version"\' | head -1'
      const spec = shell.resolve({ command: cmd, timeoutMs: 15000 })
      const result = await shell.run(spec)
      const out = (result.stdout.text || '').trim()
      const remoteMatch = out.match(/"version"\s*:\s*"([^"]+)"/)
      const remoteVersion = remoteMatch ? remoteMatch[1] : ''
      if (!remoteVersion || result.exitCode !== 0) return { ok: true, hasUpdate: false, remoteVersion: '', localVersion: version }
      const hasUpdate = version && remoteVersion && version !== remoteVersion
      return { ok: true, hasUpdate: hasUpdate, remoteVersion: remoteVersion, localVersion: version }
    } catch (e) {
      return { ok: true, hasUpdate: false, remoteVersion: '' }
    }
  })
  registerRoute('search-plugins', async (args) => {
    const query = args && typeof args.query === 'string' ? args.query.trim() : ''
    if (!shell) return { ok: false, error: '不可用' }
    if (!query) return { ok: true, results: [] }
    try {
      const cmd = 'npm search ' + query + ' --json 2>/dev/null | head -c 10000'
      const spec = shell.resolve({ command: cmd, timeoutMs: 30000 })
      const result = await shell.run(spec)
      if (result.exitCode !== 0) return { ok: true, results: [] }
      const text = (result.stdout.text || '').trim()
      if (!text) return { ok: true, results: [] }
      const items = JSON.parse(text)
      const results = (Array.isArray(items) ? items : []).slice(0, 20).map((item) => ({
        name: item.name || '',
        version: item.version || '',
        description: item.description || '',
        keywords: item.keywords || [],
        repository: item.repository && item.repository.url ? item.repository.url : '',
        author: item.author && item.author.name ? item.author.name : (typeof item.author === 'string' ? item.author : ''),
        score: item.score && item.score.final ? item.score.final : 0,
      }))
      return { ok: true, results: results }
    } catch (e) {
      return { ok: true, results: [] }
    }
  })
  registerRoute('get-plugin-info', async (args) => {
    const pkg = args && typeof args.pkg === 'string' ? args.pkg.trim() : ''
    if (!shell || !pkg) return { ok: false, error: '缺少包名' }
    try {
      const cmd = 'npm view ' + pkg + ' name version description repository.url homepage --json 2>/dev/null'
      const spec = shell.resolve({ command: cmd, timeoutMs: 15000 })
      const result = await shell.run(spec)
      if (result.exitCode !== 0) return { ok: false, error: '未找到包' }
      const text = (result.stdout.text || '').trim()
      if (!text) return { ok: false, error: '未找到包' }
      const raw = JSON.parse(text)
      const repo = (raw['repository.url'] || (raw.repository && raw.repository.url) || '')
      return {
        ok: true,
        name: raw.name || pkg,
        version: raw.version || '',
        description: raw.description || '',
        repository: repo.replace(/^git\+/, '').replace(/\.git$/, ''),
        homepage: raw.homepage || '',
      }
    } catch (e) {
      return { ok: false, error: String(e && e.message || e).slice(0, 200) }
    }
  })
  registerRoute('featured-plugins', async () => {
    const featured = [
      { pkg: 'dsh-balance-plugin', tag: '💰 余额监控', desc: 'DeepSeek API 余额监控与用量统计' },
      { pkg: 'dsh-find-plugin', tag: '🔍 插件发现', desc: '在 Agent 内实时搜索 GitHub dsh-plugin 话题下的插件' },
      { pkg: 'dsh-plugin-marketplace', tag: '🏪 插件市场', desc: 'Web UI 内置插件市场：浏览 GitHub 话题下的插件仓库' },
      { pkg: 'dsh-plugin-om', tag: '📖 论文阅读', desc: 'DSH 插件：论文阅读助手' },
      { pkg: 'dsh-plugin-ima-sync', tag: '📤 IMA 同步', desc: '自动上传会话进度到腾讯 IMA' },
      { pkg: 'dsh-plugin-install', tag: '📥 一键安装', desc: '在设置页直接安装任意 dsh 插件' },
      { pkg: 'dsh-config-manager', tag: '⚙️ 配置管理', desc: 'DSH 配置备份 / 导出 / 导入 / 迁移' },
      { pkg: '@linxin666/dsh-live-stats', tag: '📊 实时统计', desc: '实时 token 估算和生成吞吐量' },
      { pkg: '@linxin666/dsh-ssh', tag: '🔐 SSH 远程', desc: '远程 SSH 操作：主机配置 / 连接 / 命令执行' },
      { pkg: 'create-dsh-plugin', tag: '🛠 脚手架', desc: '秒级创建 DSH 插件项目模板' },
    ]
    const results = []
    for (const item of featured) {
      try {
        const cmd = 'npm view ' + item.pkg + ' version repository.url description --json 2>/dev/null'
        const spec = shell.resolve({ command: cmd, timeoutMs: 10000 })
        const result = await shell.run(spec)
        if (result.exitCode !== 0) continue
        const raw = JSON.parse((result.stdout.text || '').trim())
        const repo = (raw['repository.url'] || (raw.repository && raw.repository.url) || '')
        results.push({
          name: item.pkg,
          version: raw.version || '',
          description: raw.description || item.desc,
          repository: repo.replace(/^git\+/, '').replace(/\.git$/, ''),
          tag: item.tag,
        })
      } catch (e) { /* skip */ }
    }
    return { ok: true, results: results }
  })

  function getStatePayload() {
    return {
      version: state.version,
      configured: state.accounts.map((account) => {
        const meta = keySourceOf(account.key)
        return {
          id: account.id,
          name: account.name,
          hasKey: meta.hasKey,
          keySource: account.auto ? '自动读取' : meta.source,
          keyHint: meta.hint,
          auto: Boolean(account.auto),
          autoSource: account.auto ? String(account.autoSource || '') : '',
        }
      }),
      thresholdCny: state.thresholdCny,
      thresholdUsd: state.thresholdUsd,
      intervalMs: state.intervalMs,
      showDock: state.showDock,
      polling: state.polling,
      pollError: state.pollError,
      last: state.last,
      recharge: { label: 'DeepSeek 官方充值', url: RECHARGE_URL, usageUrl: USAGE_URL },
      configPath: state.configPath || '',
      configLoaded: state.configLoaded,
      pluginVersion: state.pluginVersion || '',
    }
  }

  let stopInterval = null
  function restartInterval() {
    if (stopInterval) { stopInterval(); stopInterval = null }
    stopInterval = ctx.interval(() => { pollAll() }, state.intervalMs)
  }

  // 启动时加载持久化配置和插件版本号
  Promise.all([loadConfig(), loadPluginVersion()]).then(() => {
    restartInterval()
    // 加载配置后触发一次轮询
    pollAll().catch(() => {})
  }).catch(() => {
    restartInterval()
  })

  // ===== 模型工具：query_api_quota（tools 注册）=====
  if (tools) {
    tools.register({
      name: 'query_api_quota',
      description: '查询已配置的 DeepSeek API 账户余额（CNY/USD 双余额池），返回各账户总余额与低余额提醒，并提示官方充值入口。',
      parameters: {
        type: 'object',
        properties: {
          account: { type: 'string', description: '可选：账户名称，省略则查询全部账户。' },
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: false, required: ['content'], properties: { content: { type: 'string' } } },
        render: (_args, value) => [{ type: 'text', text: String(value && value.content || '') }],
      },
      timeoutMs: 60000,
      async execute(args) {
        const selected = args && typeof args.account === 'string' ? args.account.trim() : ''
        await pollAll()
        if (!state.last) {
          return { content: state.pollError ? '查询失败：' + state.pollError : '尚未配置 DeepSeek API Key。' }
        }
        const accounts = selected ? state.last.accounts.filter((item) => item.name === selected) : state.last.accounts
        if (!accounts.length) return { content: '未找到账户：' + selected }
        const lines = ['## DeepSeek', '- DeepSeek API 余额按 CNY 与 USD 分为两个独立余额池，以下分别显示各币种总余额。']
        for (const account of accounts) {
          lines.push('### ' + account.name)
          if (!account.ok) {
            lines.push('- 查询失败：' + account.error)
            continue
          }
          for (const balance of account.balances) {
            lines.push('- ' + balance.currency + ' 总余额：' + (balance.total || '0'))
          }
          for (const entry of (account.low || [])) {
            lines.push('- ⚠ ' + entry.currency + ' 余额 ' + entry.total + ' 低于阈值 ' + entry.threshold)
          }
        }
        if (state.last.low && state.last.low.length) lines.push('- 建议及时前往 DeepSeek 官方平台充值（https://platform.deepseek.com/top_up）。')
        return { content: lines.join('\n') }
      },
    })
  }
}
