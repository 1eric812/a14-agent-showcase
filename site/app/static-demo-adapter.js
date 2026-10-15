/* A14 静态演示适配器 v2 —— 一比一复刻线上界面，全部数据为浏览器内演示数据，页面不发出任何网络请求。
   覆盖：登录态、数据集/任务/模板/用户/审计、知识库、偏好同步（主题色/壁纸）、文件与头像本地持久化、
   Agent 任务运行进度模拟（WebSocket 推流）、上传模拟（XMLHttpRequest 拦截）。 */
(function () {
  window.A14_STATIC_DEMO = true;

  /* ---------- 基础演示数据 ---------- */
  const user = { id: 1, username: 'admin', display_name: '演示管理员', role: 'admin', created_at: '2026-08-12 09:30' };
  /* 账号列表可变：管理员通过开通申请后会新增账号，演示闭环 */
  const users = [
    { id: 1, username: 'admin', display_name: '演示管理员', role: 'admin', can_upload: 1, created_at: '2026-10-01' },
    { id: 2, username: 'engineer', display_name: '工艺工程师', role: 'engineer', can_upload: 1, created_at: '2026-10-02' },
    { id: 3, username: 'algorithm', display_name: '算法工程师', role: 'algorithm', can_upload: 1, created_at: '2026-10-03' },
    { id: 4, username: 'viewer', display_name: '演示访客', role: 'viewer', can_upload: 0, created_at: '2026-10-04' }
  ];
  /* 账号开通申请（演示数据，提交/审核均在浏览器内完成） */
  const applications = [
    { id: 'AP-20261015-001', name: '王芳', username: 'wangfang', role: 'engineer', contact: '138****6621', note: '工艺组，需要上传装置运行数据并跑闭环寻优', status: 'pending', created_at: '2026-10-15 20:12:44', reviewed_at: '', reviewed_by: '', reject_reason: '', user_id: null },
    { id: 'AP-20261014-002', name: '刘洋', username: 'liuyang', role: 'viewer', contact: 'liuyang@example.com', note: '先了解系统能力，查看报告样例', status: 'approved', created_at: '2026-10-14 15:38:02', reviewed_at: '2026-10-14 16:05:11', reviewed_by: 'admin', reject_reason: '', user_id: 6 },
    { id: 'AP-20261013-003', name: '赵敏', username: 'zhaomin', role: 'algorithm', contact: '135****8890', note: '想直接调参寻优', status: 'rejected', created_at: '2026-10-13 09:20:31', reviewed_at: '2026-10-13 10:02:47', reviewed_by: 'admin', reject_reason: '岗位信息不完整，请补充所属装置与用途后重新提交', user_id: null }
  ];
  const datasets = [
    { id: 8, name: '精馏塔仿真数据', source: '仿真生成', row_count: 3000, column_count: 8, time_span: '2026-10-14 10:00 ~ 10:49', created_at: '2026-10-14 16:30' },
    { id: 7, name: '反应器温控数据', source: 'CSV 上传', row_count: 2400, column_count: 6, time_span: '2026-10-13 08:00 ~ 08:40', created_at: '2026-10-13 14:12' },
    { id: 6, name: '换热网络运行数据', source: 'CSV 上传', row_count: 5120, column_count: 11, time_span: '2026-10-12 00:00 ~ 01:25', created_at: '2026-10-12 09:06' },
    { id: 5, name: '常减压装置数据', source: '仿真生成', row_count: 1800, column_count: 7, time_span: '2026-10-11 11:00 ~ 11:30', created_at: '2026-10-11 15:48' }
  ];
  const numeric = ['Feed_Flow', 'Steam_Flow', 'Reflux_Ratio', 'Product_Purity'];
  const curve = (offset, amp) => Array.from({ length: 60 }, (_, i) => Number((offset + Math.sin(i / 5) * amp + Math.sin(i / 2.8) * amp * .19 + (i > 35 ? Math.sin(i / 3) * amp * .3 : 0)).toFixed(3)));
  const rows = Array.from({ length: 12 }, (_, i) => ({ Time: '10:' + String(20 + Math.floor(i / 6)).padStart(2, '0') + ':' + String((i % 6) * 10).padStart(2, '0'), Feed_Flow: 126.4 + i * .31, Steam_Flow: 84.2 + i * .23, Reflux_Ratio: 2.15 - i * .008, Product_Purity: 99.12 + i * .006 }));
  const history = [78.4, 81.2, 83.7, 84.1, 86.9, 87.3, 89.4, 90.8, 91.1, 92.8].map((fit, i) => ({ fit, params: { iqr_mult: 1.5, window: 40, energy_ratio: .5, top_n: 3 }, trial: i + 1 }));
  const result = {
    report: '精馏塔建模数据闭环寻优评估报告\n\n数据集：精馏塔仿真数据（静态演示样例）\n处理流程：异常清洗 → 动态片段优选 → 时滞与共线性处理 → 模型验证 → 闭环寻优\n\n结果：优选 1,842 个有效样本，保留 3 个输入变量。ARX 模型 FIT 为 91.6%，交叉验证最优模型 Random Forest 的 R² 为 0.914。闭环寻优后 FIT 提升至 92.8%。\n\n注意：本页用于展示前端界面，数值是预置样例，不是运行计算结果。',
    arx: { fit: 91.6, na: 2, nb: 2 }, model_eval: { best: { model: 'Random Forest', r2: .914, fit: 92.8 } }, cv: { r2_mean: .914 }, data: { rows: 1842, lags: { Feed_Flow: 5, Steam_Flow: 12 }, input_cols: ['Feed_Flow', 'Steam_Flow', 'Reflux_Ratio'], output_col: 'Product_Purity' }, optimize: { best_fit: 92.8, n_iter: 10, elapsed: 18.4, stopped_by_earlystop: true, best_params: { iqr_mult: 1.5, window: 40, energy_ratio: .5, top_n: 3, max_lag: 30, corr_threshold: .95 }, history }, segments: [{ start: 120, end: 420, len: 300, energy: 1.82, score: 94.2 }, { start: 620, end: 950, len: 330, energy: 1.65, score: 89.8 }, { start: 1210, end: 1510, len: 300, energy: 1.59, score: 87.6 }], arx_candidates: [{ na: 1, nb: 1, fit: 87.2, r2: .82, aic: -218, dw: 1.91 }, { na: 2, nb: 2, fit: 91.6, r2: .89, aic: -263, dw: 1.98 }, { na: 3, nb: 2, fit: 90.8, r2: .87, aic: -251, dw: 2.03 }], figures: [], snapshot: { label: '精馏塔 · 闭环寻优', note: '静态演示样例' }, quality: { score: 87, components: { completeness: 98, outlier_resilience: 91, dynamic_content: 84, independence: 76 }, warnings: ['回流比与进料流量相关性偏高，建议关注变量冗余。'] }
  };
  const tasks = [
    { id: 24024, dataset_id: 8, status: 'completed', progress: 100, best_fit: 92.8, current_stage: '评估交付', created_at: '2026-10-14 16:42:00', result: { snapshot: { label: '精馏塔 · 闭环寻优', note: '演示样例' } } },
    { id: 24023, dataset_id: 7, status: 'completed', progress: 100, best_fit: 88.6, current_stage: '评估交付', created_at: '2026-10-14 14:18:00', result: { snapshot: { label: '反应器温控参数优化' } } },
    { id: 24022, dataset_id: 6, status: 'completed', progress: 100, best_fit: 84.1, current_stage: '评估交付', created_at: '2026-10-13 10:27:00', result: { snapshot: { label: '换热网络动态段筛选' } } },
    { id: 24021, dataset_id: 8, status: 'completed', progress: 100, best_fit: 79.5, current_stage: '评估交付', created_at: '2026-10-12 09:06:00', result: { snapshot: { label: '精馏塔基线实验' } } }
  ];

  /* ---------- 任务运行进度模拟 ---------- */
  const sim = { id: 'DEMO-RUN', dataset_id: 8, startAt: 0, duration: 26000 };
  const stages = [[10, '数据体检', '扫描缺失值与异常点'], [26, '动态段优选', '提取高能量片段'], [44, '时滞与共线性处理', '构建时滞矩阵'], [62, '模型辨识', 'ARX + 交叉验证'], [80, '闭环寻优', '多轮参数搜索'], [95, '评估交付', '汇总指标与报告']];
  const simProgress = () => (sim.startAt ? Math.min(100, Math.round((Date.now() - sim.startAt) / sim.duration * 100)) : 0);
  const simStage = (p) => { let s = stages[0]; stages.forEach((x) => { if (p >= x[0]) s = x; }); return { stage: s[1], msg: s[2] }; };
  function simTask() {
    const p = simProgress();
    if (!sim.startAt) return null;
    const st = simStage(Math.max(p, 1));
    const done = p >= 100;
    return { id: sim.id, dataset_id: sim.dataset_id, status: done ? 'completed' : 'running', progress: p, best_fit: done ? 93.4 : null, current_stage: done ? '评估交付' : st.stage, current_message: st.msg, created_at: new Date(sim.startAt).toLocaleString('zh-CN'), result: done ? Object.assign({}, result, { snapshot: { label: '演示运行 · 闭环寻优', note: '本次运行为页面演示，不执行实际计算。' } }) : null };
  }
  function addDataset(name, source, rowCount) {
    const nd = { id: Math.max.apply(null, datasets.map((d) => d.id)) + 1, name: String(name || '新数据集').replace(/\.[^.]+$/, ''), source: source || 'CSV 上传', row_count: rowCount || (2600 + Math.floor(Math.random() * 900)), column_count: 7, time_span: '刚刚上传', created_at: new Date().toLocaleString('zh-CN') };
    datasets.unshift(nd); return nd;
  }

  /* ---------- 工具 ---------- */
  function json(data, status) { return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }); }
  function parseBody(init) { try { return JSON.parse((init || {}).body || '{}'); } catch (_) { return {}; } }
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };

  function api(route, init) {
    const method = ((init || {}).method || 'GET').toUpperCase();
    const path = route.split('?')[0];
    const idMatch = path.match(/^\/tasks\/([^/]+)$/);
    if (path === '/auth/login') {
      // 演示：管理员/常规账号直接进入；用被审批开通的新账号登录会触发「首次登录强制改密」
      const b = parseBody(init);
      const uname = String(b.username || '').trim();
      const hit = users.find((u) => u.username === uname && u.must_change_password);
      return json({ token: 'a14-static-demo-token', user: Object.assign({}, user, { must_change_password: !!hit }) });
    }
    if (path === '/auth/me') return json(user);
    if (path === '/profile') {
      if (method === 'PATCH') { const b = parseBody(init); if (b.display_name) user.display_name = b.display_name; return json(user); }
      return json(user);
    }
    if (path === '/profile/password') return json({ ok: true, cleared_initial: true });
    if (path === '/profile/preferences') {
      if (method === 'GET') return json(store.get('a14_demo_prefs', {}));
      const b = parseBody(init); store.set('a14_demo_prefs', b); return json(Object.assign({ ok: true }, b));
    }
    if (path === '/dashboard/stats') return json({ datasets: datasets.length, tasks: tasks.length });
    if (path === '/datasets' && method === 'GET') return json(datasets);
    if (path === '/data/upload') {
      let name = '上传数据.csv';
      try { const f = init.body && init.body.get && init.body.get('file'); if (f && f.name) name = f.name; } catch (_) {}
      const nd = addDataset(name, 'CSV 上传');
      return json({ dataset_id: nd.id, rows: nd.row_count, name: nd.name });
    }
    if (path === '/data/generate' && method === 'POST') { const b = parseBody(init); const nd = addDataset((b && b.name) || '仿真数据', '仿真生成', (b && b.rows) || 3000); return json({ dataset_id: nd.id, rows: nd.row_count }); }
    if (path === '/data/overview') { const q = new URLSearchParams(route.split('?')[1] || ''); return json(overview(q.get('dataset_id'))); }
    if (path === '/data/preprocess') return json({ dataset_id: 9, rows: 2864, selected_rows: 1842, input_cols: ['Feed_Flow', 'Steam_Flow', 'Reflux_Ratio'], output_col: 'Product_Purity', segments: result.segments, removed_cols: [], lags: { Feed_Flow: 5, Steam_Flow: 12 }, preview_rows: rows, corr: overview(8).corr });
    if (path === '/tasks' && method === 'GET') { const st = simTask(); return json(st ? [st].concat(tasks) : tasks); }
    if (path === '/run-optimize' || path === '/run-optimize/batch') {
      const b = parseBody(init); sim.dataset_id = b.dataset_id || 8; sim.startAt = Date.now();
      return path === '/run-optimize/batch' ? json({ count: 1, tasks: [{ task_id: sim.id }] }) : json({ task_id: sim.id });
    }
    if (idMatch) {
      if (String(sim.id) === idMatch[1] && sim.startAt) { const t = simTask(); return json(Object.assign({ id: idMatch[1] }, t || tasks[0], { result: (t && t.result) || result })); }
      return json(Object.assign({}, tasks.find((t) => String(t.id) === idMatch[1]) || tasks[0], { id: idMatch[1], result }));
    }
    if (path.indexOf('/config/parameter-templates') === 0) {
      if (method === 'POST') return json([{ id: 1, name: (parseBody(init).name) || '新模板', iqr_mult: 1.5, window: 40, energy_ratio: .5, top_n: 3, updated_by: user.display_name }]);
      if (method === 'DELETE') return json(templates());
      return json(templates());
    }
    if (path === '/config/parameter-templates/import') return json({ ok: true });
    if (path === '/config/system') return json({ default_n_trials: 10, max_n_trials: 100, early_stop_tol: .5, max_lag: 30, corr_threshold: .95, dynamic_energy_ratio: .5, llm_configured: false });
    if (path === '/config/workflow-templates') return json([{ id: 1, name: '全流程闭环寻优', instruction: '清洗异常并提取动态段，处理时滞与共线性后闭环寻优', updated_by: '算法工程师', parameters: { n_trials: 10, window: 40, energy_ratio: .5 } }]);
    if (path === '/admin/users') return json(users);
    /* ---- 账号开通申请闭环（提交 → 审核 → 查进度）---- */
    if (path === '/auth/apply' && method === 'POST') {
      const b = parseBody(init);
      const uname = String(b.username || '').trim();
      if (!/^[A-Za-z][A-Za-z0-9_.-]{2,19}$/.test(uname)) return json({ detail: '账号需以字母开头，长度 3-20 位，可用字母、数字、下划线、点或短横线' }, 422);
      if (users.some((u) => u.username === uname)) return json({ detail: '该账号已存在，请直接登录或使用找回密码' }, 409);
      if (applications.some((a) => a.username === uname && a.status === 'pending')) return json({ detail: '该账号已有待审核的申请，请等待管理员处理' }, 409);
      const id = 'AP-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(applications.length + 1).padStart(3, '0');
      const row = { id, name: b.name, username: uname, role: b.role || 'engineer', contact: b.contact || '', note: b.note || '', status: 'pending', created_at: new Date().toLocaleString('zh-CN'), reviewed_at: '', reviewed_by: '', reject_reason: '', user_id: null };
      applications.unshift(row);
      return json({ ok: true, application_id: id, status: 'pending', created_at: row.created_at, role: row.role });
    }
    if (path === '/auth/apply/status') {
      const q = new URLSearchParams(route.split('?')[1] || '');
      const uname = q.get('username') || '';
      const nm = (q.get('name') || '').replace(/\s/g, '');
      const hit = applications.filter((a) => a.username === uname && String(a.name).replace(/\s/g, '') === nm).pop();
      if (!hit) return json({ username: uname, status: 'none', message: '没有查询到匹配的申请记录，请核对账号与姓名是否与提交时一致' });
      const msgs = { pending: '申请已提交，等待管理员审核（演示环境不会真正建号）', approved: '申请已通过，账号已开通。用该账号登录会触发首次登录强制改密演示', rejected: '申请未通过，可联系管理员了解原因后重新提交' };
      return json(Object.assign({}, hit, { username: uname, status: hit.status, message: msgs[hit.status] || '' }));
    }
    if (path === '/admin/applications') {
      const q = new URLSearchParams(route.split('?')[1] || '');
      const st = q.get('status') || '';
      const items = st ? applications.filter((a) => a.status === st) : applications.slice();
      return json({ items, pending: applications.filter((a) => a.status === 'pending').length, total: applications.length });
    }
    const appMatch = path.match(/^\/admin\/applications\/([^/]+)\/(approve|reject)$/);
    if (appMatch) {
      const row = applications.find((a) => String(a.id) === decodeURIComponent(appMatch[1]));
      if (!row) return json({ detail: '申请不存在' }, 404);
      if (row.status !== 'pending') return json({ detail: '该申请已是「' + row.status + '」状态，无需重复处理' }, 409);
      const stamp = new Date().toLocaleString('zh-CN');
      if (appMatch[2] === 'approve') {
        const b = parseBody(init);
        const manual = String(b.password || '').trim();
        const pwd = manual || 'demo' + Math.random().toString(36).slice(2, 8);
        const uid = Math.max.apply(null, users.map((u) => u.id)) + 1;
        users.push({ id: uid, username: row.username, display_name: row.name, role: row.role, can_upload: (row.role === 'engineer' || row.role === 'algorithm') ? 1 : 0, created_at: new Date().toLocaleDateString('zh-CN'), must_change_password: 1 });
        Object.assign(row, { status: 'approved', reviewed_at: stamp, reviewed_by: 'admin', reject_reason: '', user_id: uid });
        return json({ ok: true, application: row, user_id: uid, username: row.username, role: row.role, display_name: row.name, initial_password: pwd, generated: !manual, must_change_password: true });
      }
      Object.assign(row, { status: 'rejected', reviewed_at: stamp, reviewed_by: 'admin', reject_reason: String(parseBody(init).reason || '').trim() });
      return json({ ok: true, application: row });
    }
    if (path === '/audit') return json([{ id: 24, action: 'RUN_OPTIMIZE', resource: 'task#24024', operator: 'admin', detail: '提交闭环寻优任务', ip: '127.0.0.1', created_at: '2026-10-14 16:42:00' }, { id: 23, action: 'DATASET_CREATE', resource: 'dataset#8', operator: 'admin', detail: '生成精馏塔仿真数据', ip: '127.0.0.1', created_at: '2026-10-14 16:30:00' }]);
    if (path === '/experiments/compare') return json(tasks.slice(0, 2).map((t) => ({ label: (t.result.snapshot || {}).label, dataset_id: t.dataset_id, best_fit: t.best_fit, r2: .914, mse: .014, aic: -263, rows: 1842, variables: 3 })));
    if (path === '/assistant/chat') return json({ reply: '**静态界面演示** — 后台计算与大模型问答未连接，这里给出的是界面内置样例：\n\n**我能带你看的内容**\n- 数据概览：数据质量评分、缺失与异常分布\n- 预处理分析：动态片段优选、时滞与共线性\n- 闭环寻优：参数搜索轨迹与 FIT 收敛曲线\n- 分析报告：模型指标、实验对比与快照\n\n需要真实问答与计算时，接入后端并配置 DeepSeek 即可（系统设置 → 全局算法与运行设置）。', action: null });
    if (path === '/demo/dataset') return json({ dataset_id: 8, name: '精馏塔仿真数据' });
    if (path.indexOf('/datasets/') === 0 && path.endsWith('/copy') && method === 'POST') return json({ id: 8 });
    if (path.indexOf('/datasets/') === 0 && method === 'DELETE') return json({ ok: true });
    if (path.indexOf('/export') >= 0 || path.indexOf('/apply-params') >= 0 || path.indexOf('/snapshot') >= 0 || path.indexOf('/cancel') >= 0 || path.indexOf('/pause') >= 0 || path.indexOf('/resume') >= 0) return json({ ok: true });
    return json({ ok: true });
  }
  function templates() {
    return [{ id: 1, name: '精馏塔标准流程', iqr_mult: 1.5, window: 40, energy_ratio: .5, top_n: 3, updated_by: '算法工程师' }, { id: 2, name: '反应器温控优化', iqr_mult: 1.8, window: 60, energy_ratio: .42, top_n: 5, updated_by: '系统管理员' }, { id: 3, name: '通用高动态筛选', iqr_mult: 1.5, window: 30, energy_ratio: .6, top_n: 3, updated_by: '算法工程师' }];
  }
  function warningsQuality() { return { score: 87, components: { completeness: 98, outlier_resilience: 91, dynamic_content: 84, independence: 76 }, warnings: ['回流比与进料流量相关性偏高，请在建模时复核变量选择。'] }; }
  function overview(id) {
    const ds = datasets.find((x) => x.id === Number(id)) || datasets[0];
    return { dataset_id: Number(id) || 8, name: ds.name, rows: ds.row_count || 3000, columns: ['Time'].concat(numeric), numeric_columns: ['Time'].concat(numeric), time_col: 'Time', preview_rows: rows, raw_preview: { Feed_Flow: curve(126, 5), Steam_Flow: curve(84, 3), Reflux_Ratio: curve(2.1, .2), Product_Purity: curve(99, .1) }, cleaned_preview: { Feed_Flow: curve(126, 4.7), Steam_Flow: curve(84, 2.8), Reflux_Ratio: curve(2.1, .18), Product_Purity: curve(99, .08) }, corr: { Feed_Flow: { Feed_Flow: 1, Steam_Flow: .82, Reflux_Ratio: .96, Product_Purity: .74 }, Steam_Flow: { Feed_Flow: .82, Steam_Flow: 1, Reflux_Ratio: .79, Product_Purity: .81 }, Reflux_Ratio: { Feed_Flow: .96, Steam_Flow: .79, Reflux_Ratio: 1, Product_Purity: .88 }, Product_Purity: { Feed_Flow: .74, Steam_Flow: .81, Reflux_Ratio: .88, Product_Purity: 1 } }, quality: warningsQuality() };
  }

  function rag(path) {
    if (path === '/me') return { username: 'admin', can_upload: true };
    if (path === '/status') return { ready: true, vector_db: 'Milvus Lite（静态展示）', llm_configured: false, embedding_model: 'BAAI/bge-small-zh-v1.5', embedding_dim: 512, chunk_count: 1246 };
    if (path === '/roles' || path === '/users') return [];
    if (path.indexOf('/documents') === 0) return { documents: [{ doc_id: 1, file_name: '精馏塔操作规程.pdf', file_size: 248320, chunk_count: 184, chunk_size: 512, chunk_overlap: 80, description: '精馏塔运行与操作规范', permissions: [{ type: 'public', value: '' }], created_at: '2026-10-14 10:20:00' }, { doc_id: 2, file_name: '装置工艺指标说明.docx', file_size: 86400, chunk_count: 76, chunk_size: 512, chunk_overlap: 80, description: '工艺指标说明', permissions: [{ type: 'public', value: '' }], created_at: '2026-10-13 11:00:00' }], chunks: [{ chunk_id: 1, content: '运行过程中应关注塔顶温度、回流比及产品纯度的动态变化。' }] };
    if (path === '/orphans') return { files: [] };
    return { ok: true, count: 0, errors: [] };
  }

  /* ---------- 拦截网络层 ---------- */
  const nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const raw = typeof input === 'string' ? input : (input && input.url) || '';
    let url;
    try { url = new URL(raw, location.href); } catch (_) { return nativeFetch(input, init); }
    if (url.pathname === '/healthz') return json({ status: 'ok', db: true });
    if (url.pathname.startsWith('/api/')) return Promise.resolve(api(url.pathname.slice(4) + url.search, init));
    if (url.pathname.startsWith('/rag-api/')) return Promise.resolve(json(rag(url.pathname.slice(8) + url.search)));
    return nativeFetch(input, init);
  };

  /* WebSocket：演示任务推流，其余静默 */
  window.WebSocket = function (url) {
    const self = this;
    const m = String(url).match(/tasks\/([^?/]+)/);
    const tid = m ? decodeURIComponent(m[1]) : '';
    this.readyState = 1; this.url = String(url);
    this.close = function () { self.readyState = 3; };
    this.send = function () {};
    const step = () => {
      if (self.readyState !== 1) return;
      if (!sim.startAt || String(sim.id) !== String(tid)) return;
      const p = simProgress();
      if (p >= 100) { if (self.onmessage) self.onmessage({ data: JSON.stringify({ type: 'done' }) }); self.readyState = 3; return; }
      const st = simStage(Math.max(p, 1));
      if (self.onmessage) self.onmessage({ data: JSON.stringify({ type: 'progress', progress: p, stage: st.stage, msg: st.msg }) });
      setTimeout(step, sim.duration / 7);
    };
    setTimeout(step, 700);
  };
  window.WebSocket.CONNECTING = 0; window.WebSocket.OPEN = 1; window.WebSocket.CLOSING = 2; window.WebSocket.CLOSED = 3;

  /* XMLHttpRequest：知识库上传走 XHR，这里模拟成功回调 */
  const NativeXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const x = new NativeXHR();
    const origOpen = x.open.bind(x);
    const origSend = x.send.bind(x);
    let demo = false;
    x.open = function (m, u) { demo = /^\/?(rag-api|api)\//.test(String(u)); if (!demo) return origOpen.apply(x, arguments); };
    x.send = function () {
      if (!demo) return origSend.apply(x, arguments);
      setTimeout(() => {
        try {
          Object.defineProperty(x, 'readyState', { value: 4, configurable: true });
          Object.defineProperty(x, 'status', { value: 200, configurable: true });
          Object.defineProperty(x, 'responseText', { value: JSON.stringify({ ok: true, doc_id: 99, count: 1, errors: [], file_name: '演示文档.pdf', chunk_count: 64 }), configurable: true });
          if (x.upload && x.upload.onprogress) x.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
          if (x.onload) x.onload(); else if (x.onreadystatechange) x.onreadystatechange();
        } catch (_) {}
      }, 1300);
    };
    return x;
  };

  const nativeOpen = window.open.bind(window);
  window.open = function (url) {
    if (url === '/chat') { window.alert('静态展示模式未连接知识问答服务。'); return null; }
    return nativeOpen.apply(window, arguments);
  };

  /* ---------- 演示增强：自动填充演示账号（走 DOM input 事件，不依赖 Vue 内部字段） ---------- */
  function setInput(el, value) {
    if (!el || el.value) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  (function prefill(n) {
    n = n || 0;
    const u = document.querySelector('input[placeholder="请输入用户名"]');
    const p = document.querySelector('input[placeholder="请输入密码"]');
    if (u && p) { setInput(u, 'admin'); setInput(p, 'admin123'); }
    // 页面重渲染可能清空输入，重复补填直到稳定（约 6 秒）
    if (n < 60) setTimeout(() => prefill(n + 1), 100);
  })();

  /* ---------- 演示提示条：只在登录页出现，登录后自动移除 ---------- */
  (function badge() {
    const mount = () => {
      if (document.getElementById('a14-demo-badge') || !document.body) return;
      const st = document.createElement('style');
      st.textContent = '#a14-demo-badge{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(0,229,255,.24);border-radius:8px;background:rgba(8,12,24,.82);backdrop-filter:blur(10px);color:#cfe5ee;font:500 11px/1.3 "Microsoft YaHei",sans-serif;letter-spacing:.3px;box-shadow:0 0 26px rgba(0,229,255,.1);pointer-events:none;animation:a14-badge-in .5s cubic-bezier(.2,.8,.25,1) both}' +
        '#a14-demo-badge b{color:#dff8ff;font-weight:700}#a14-demo-badge .a14-demo-dot{width:6px;height:6px;border-radius:50%;background:#00E5FF;box-shadow:0 0 9px rgba(0,229,255,.75)}' +
        '#a14-demo-badge button{pointer-events:auto;border:0;background:transparent;color:#7b8ba3;font-size:14px;line-height:1;cursor:pointer;padding:0 0 0 2px}#a14-demo-badge button:hover{color:#00E5FF}' +
        '@keyframes a14-badge-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}}' +
        '@media (max-width:560px){#a14-demo-badge span:last-of-type{display:none}}';
      document.head.appendChild(st);
      const b = document.createElement('div');
      b.id = 'a14-demo-badge';
      b.innerHTML = '<span class="a14-demo-dot"></span><b>界面演示</b><span>· 账号已填好，直接点登录即可体验</span><button type="button" aria-label="关闭提示">×</button>';
      document.body.appendChild(b);
      b.querySelector('button').addEventListener('click', () => b.remove());
    };
    const start = () => {
      if (document.querySelector('.login-wrap')) mount();
      else setTimeout(start, 300);           // 等登录页渲染
      // 登录成功后（登录页卸载）移除提示，避免遮挡侧栏入口
      const tick = setInterval(() => {
        const b = document.getElementById('a14-demo-badge');
        if (!b) return;
        if (!document.querySelector('.login-wrap')) b.remove();
      }, 800);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  })();
})();
