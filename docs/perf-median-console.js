/**
 * EE 性能测试中位数工具 — 粘贴到浏览器控制台一次即可使用。
 *
 * 场景 2 推荐流程：
 *   eePerf.begin()          // 清空埋点，开始本轮
 *   // 点击文本块 → 连续输入 20 字
 *   eePerf.snap('s2-L-817', 's2')
 *   // 重复 3 次（每次硬刷新后 begin → 输入 → snap）
 *   eePerf.report('s2-L-817')
 */
(function installEePerf() {
  const STORE = '__EE_PERF_RUNS__';

  let scenarioMark = {
    active: false,
    entryIndex: 0,
    counters: {},
  };

  function median(nums) {
    const arr = nums
      .filter(n => typeof n === 'number' && !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (!arr.length) return null;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  }

  function max(nums) {
    const arr = nums.filter(n => typeof n === 'number' && !Number.isNaN(n));
    return arr.length ? Math.max(...arr) : null;
  }

  function min(nums) {
    const arr = nums.filter(n => typeof n === 'number' && !Number.isNaN(n));
    return arr.length ? Math.min(...arr) : null;
  }

  function round1(n) {
    return typeof n === 'number' ? Math.round(n * 10) / 10 : n;
  }

  function perf() {
    if (!window.__EE_PERF__) {
      throw new Error('未找到 window.__EE_PERF__，请先 localStorage.setItem("ee-perf-debug","1") 并刷新');
    }
    return window.__EE_PERF__;
  }

  /** 开始一轮场景测试：reset 埋点，只统计 begin() 之后的事件 */
  function begin() {
    perf().reset();
    scenarioMark = {
      active: true,
      entryIndex: 0,
      counters: { ...perf().counters },
    };
    console.log('[eePerf] 场景已开始（埋点已 reset），请执行操作后 snap()');
  }

  function entriesInScenario() {
    const p = perf();
    if (!scenarioMark.active) return p.entries;
    return p.entries.slice(scenarioMark.entryIndex);
  }

  function counterDelta(name) {
    const p = perf();
    const base = scenarioMark.counters[name] ?? 0;
    return (p.counters[name] ?? 0) - base;
  }

  function pipelineMsList(tag) {
    return entriesInScenario()
      .filter(e => e.tag === tag)
      .map(e => e.metrics.pipelineMs)
      .filter(n => typeof n === 'number');
  }

  function stepDurations(tag, step) {
    return entriesInScenario()
      .filter(e => e.tag === tag && e.metrics.step === step)
      .map(e => e.metrics.durationMs)
      .filter(n => typeof n === 'number');
  }

  function collect1() {
    const p = perf();
    const canvas = p.entries.find(e => e.tag === 'editor.canvasReady');
    const initial = p.entries.find(e => e.tag === 'editor.initialRender');
    const htmlToReact = p.entries.find(
      e => e.tag === 'MjmlDomRender' && e.metrics.step === 'htmlToReact',
    );
    const longTasks = window.__LONG_TASKS__?.filter(t => t.duration > 50).length ?? 0;

    return {
      totalMs: initial?.metrics.totalMs ?? null,
      pipelineMs: initial?.metrics.pipelineMs ?? null,
      htmlToReactMs: htmlToReact?.metrics.durationMs ?? null,
      canvasReadyMs: canvas ? round1(canvas.time - p.sessionStart) : null,
      longTasks,
    };
  }

  function collect2() {
    const editMs = pipelineMsList('MjmlDomRender.pipeline');
    const previewMs = pipelineMsList('PreviewEmailProvider.pipeline');

    return {
      editPipelineCount: editMs.length,
      previewPipelineCount: previewMs.length,
      editPipelineMsList: editMs,
      previewPipelineMsList: previewMs,
      formStateChange: counterDelta('formState.change'),
      recordStackPush: counterDelta('record.stackPush'),
    };
  }

  function collect3() {
    const editMs = pipelineMsList('MjmlDomRender.pipeline');
    const previewMs = pipelineMsList('PreviewEmailProvider.pipeline');

    return {
      editPipelineCount: editMs.length,
      previewPipelineCount: previewMs.length,
      editPipelineMsList: editMs,
      previewPipelineMsList: previewMs,
      formStateChange: counterDelta('formState.change'),
      previewSynced: previewMs.length > 0,
    };
  }

  const S4_OPS = ['addBlock', 'moveBlock', 'copyBlock', 'removeBlock'];

  function pickLastUseBlockStep(step) {
    const matches = entriesInScenario().filter(
      x => x.tag === 'useBlock' && x.metrics.step === step,
    );
    return matches[matches.length - 1]?.metrics.durationMs ?? null;
  }

  function pickLastStepDuration(tag, step) {
    const matches = entriesInScenario().filter(
      e => e.tag === tag && e.metrics.step === step,
    );
    const last = matches[matches.length - 1];
    return last?.metrics.durationMs ?? null;
  }

  /** 单次块操作（addBlock / moveBlock / copyBlock / removeBlock） */
  function collect4Step(op) {
    if (!S4_OPS.includes(op)) {
      throw new Error(`未知操作: ${op}，可选: ${S4_OPS.join(', ')}`);
    }
    const editMs = pipelineMsList('MjmlDomRender.pipeline');
    const previewMs = pipelineMsList('PreviewEmailProvider.pipeline');
    return {
      op,
      cloneDeepMs: pickLastUseBlockStep(`${op}.cloneDeep`),
      totalMs: pickLastUseBlockStep(`${op}.total`),
      mjmlPipelineCount: editMs.length,
      mjmlPipelineTriggered: editMs.length > 0,
      mjmlPipelineMsList: editMs,
      previewPipelineMsList: previewMs,
      htmlToReactMs: pickLastStepDuration('MjmlDomRender', 'htmlToReact'),
      recordCloneDeepMs: pickLastStepDuration('RecordProvider', 'cloneDeep.values'),
      recordIsEqualMs: pickLastStepDuration('RecordProvider', 'isEqual.content'),
    };
  }

  /** 一轮内连续完成 4 种操作后一次性采集（取每种操作最后一次埋点） */
  function collect4() {
    const editMs = pipelineMsList('MjmlDomRender.pipeline');
    const row = {
      mjmlPipelineTriggered: editMs.length > 0,
      mjmlPipelineCount: editMs.length,
      mjmlPipelineMsList: editMs,
    };
    S4_OPS.forEach(op => {
      row[`${op}CloneDeepMs`] = pickLastUseBlockStep(`${op}.cloneDeep`);
      row[`${op}TotalMs`] = pickLastUseBlockStep(`${op}.total`);
    });
    return row;
  }

  function getS4Bucket(key) {
    const store = getStore();
    if (!store[key] || store[key].type !== 's4') {
      store[key] = {
        type: 's4',
        ops: Object.fromEntries(S4_OPS.map(op => [op, []])),
      };
    }
    return store[key];
  }

  const S6_PHASES = {
    edit5: '连续修改属性 5 次',
    undo3: 'Undo 3 次',
    redo2: 'Redo 2 次',
  };

  const S6_HINTS = {
    edit5: '选中 section/column，在右侧属性面板改背景色 5 次（每次换一个颜色）',
    undo3: '点击工具栏撤销 3 次（或 Ctrl+Z ×3）',
    redo2: '点击工具栏重做 2 次（或 Ctrl+Y / Ctrl+Shift+Z ×2）',
  };

  /** 场景 6 当前阶段起点下标 */
  let s6PhaseStartIndex = null;

  function collect6FromEntries(entries) {
    const isEqualContentMsList = entries
      .filter(e => e.tag === 'RecordProvider' && e.metrics.step === 'isEqual.content')
      .map(e => e.metrics.durationMs)
      .filter(n => typeof n === 'number');
    const cloneDeepValuesMsList = entries
      .filter(e => e.tag === 'RecordProvider' && e.metrics.step === 'cloneDeep.values')
      .map(e => e.metrics.durationMs)
      .filter(n => typeof n === 'number');
    const previewMs = entries
      .filter(e => e.tag === 'PreviewEmailProvider.pipeline')
      .map(e => e.metrics.pipelineMs)
      .filter(n => typeof n === 'number');
    const editMs = entries
      .filter(e => e.tag === 'MjmlDomRender.pipeline')
      .map(e => e.metrics.pipelineMs)
      .filter(n => typeof n === 'number');
    const htmlToReactMs = entries
      .filter(e => e.tag === 'MjmlDomRender' && e.metrics.step === 'htmlToReact')
      .map(e => e.metrics.durationMs)
      .filter(n => typeof n === 'number');
    return {
      recordStackPush: cloneDeepValuesMsList.length,
      isEqualContentMsList,
      cloneDeepValuesMsList,
      editPipelineCount: editMs.length,
      editPipelineMsList: editMs,
      previewPipelineCount: previewMs.length,
      previewPipelineMsList: previewMs,
      htmlToReactMsList: htmlToReactMs,
    };
  }

  function collect6FromIndex(startIndex) {
    return collect6FromEntries(perf().entries.slice(startIndex));
  }

  /** 场景 6：兼容旧版 begin() + 单次 snap；分阶段请用 begin6 + phase6Start + snap6After */
  function collect6(startIndex) {
    if (typeof startIndex === 'number') {
      return collect6FromIndex(startIndex);
    }
    if (s6PhaseStartIndex != null) {
      return collect6FromIndex(s6PhaseStartIndex);
    }
    return collect6FromEntries(entriesInScenario());
  }

  function getS6Bucket(key) {
    const store = getStore();
    if (!store[key] || store[key].type !== 's6') {
      store[key] = {
        type: 's6',
        phases: Object.fromEntries(Object.keys(S6_PHASES).map(phase => [phase, []])),
      };
    }
    return store[key];
  }

  function begin6() {
    perf().reset();
    scenarioMark = { active: false, entryIndex: 0, counters: {} };
    s6PhaseStartIndex = 0;
    console.log('[eePerf] 场景6 新一轮已开始（埋点已 reset）');
    console.log('[eePerf] 流程: phase6Start("edit5")→改色5次→snap6After → undo3 → redo2 → report6');
  }

  function phase6Start(phase) {
    if (!S6_PHASES[phase]) {
      throw new Error(`未知阶段: ${phase}，可选: ${Object.keys(S6_PHASES).join(', ')}`);
    }
    s6PhaseStartIndex = perf().entries.length;
    console.log(`[eePerf] ▶ ${S6_PHASES[phase]} — ${S6_HINTS[phase]}`);
  }

  function logSnap6Phase(key, phase, runNo, data) {
    console.log(`[eePerf] ${key}.${phase} (${S6_PHASES[phase]}) 第 ${runNo} 次`, {
      record_stackPush: data.recordStackPush,
      isEqual_content_ms: data.isEqualContentMsList.map(round1),
      cloneDeep_values_ms: data.cloneDeepValuesMsList.map(round1),
      mjmlPipeline_count: data.editPipelineCount,
      mjmlPipeline_ms: data.editPipelineMsList.length
        ? data.editPipelineMsList.map(round1)
        : '(无)',
      previewPipeline_count: data.previewPipelineCount,
      previewPipeline_ms: data.previewPipelineMsList.length
        ? data.previewPipelineMsList.map(round1)
        : '(无)',
      htmlToReact_ms: data.htmlToReactMsList.length
        ? data.htmlToReactMsList.map(round1)
        : '(无)',
    });
  }

  function pushSnap6(key, phase, data) {
    const bucket = getS6Bucket(key);
    bucket.phases[phase].push({ ...data, _capturedAt: new Date().toISOString() });
    logSnap6Phase(key, phase, bucket.phases[phase].length, data);
    return data;
  }

  /**
   * 场景 6：阶段操作完成后等待渲染链结束再采集
   * @param {number} [waitMs] 默认 1200ms
   */
  function snap6After(key, phase, waitMs = 1200) {
    if (!S6_PHASES[phase]) {
      throw new Error(`未知阶段: ${phase}，可选: ${Object.keys(S6_PHASES).join(', ')}`);
    }
    if (s6PhaseStartIndex == null) {
      throw new Error(`请先 phase6Start("${phase}") 再执行操作，最后 snap6After`);
    }
    const startIndex = s6PhaseStartIndex;
    console.log(`[eePerf] 等待 ${waitMs}ms 后采集 ${phase}…`);
    return new Promise(resolve => {
      setTimeout(() => {
        const data = collect6FromIndex(startIndex);
        s6PhaseStartIndex = null;
        resolve(pushSnap6(key, phase, data));
      }, waitMs);
    });
  }

  function report6RowStats(runs) {
    const isEqualFlat = runs.flatMap(r => r.isEqualContentMsList || []);
    const cloneFlat = runs.flatMap(r => r.cloneDeepValuesMsList || []);
    const editFlat = runs.flatMap(r => r.editPipelineMsList || []);
    const previewFlat = runs.flatMap(r => r.previewPipelineMsList || []);
    const htmlToReactFlat = runs.flatMap(r => r.htmlToReactMsList || []);
    const stackPushes = runs.map(r => r.recordStackPush).filter(n => typeof n === 'number');
    return {
      recordStackPush_中位数: stackPushes.length ? round1(median(stackPushes)) : '—',
      isEqual_content_中位数: isEqualFlat.length ? round1(median(isEqualFlat)) : '—',
      cloneDeep_values_中位数: cloneFlat.length ? round1(median(cloneFlat)) : '—',
      MjmlDomRender_pipeline_次数_中位数: runs.length
        ? round1(median(runs.map(r => r.editPipelineCount)))
        : '—',
      MjmlDomRender_pipeline_中位数: editFlat.length ? round1(median(editFlat)) : '—',
      MjmlDomRender_pipeline_最大值: editFlat.length ? round1(max(editFlat)) : '—',
      PreviewEmail_pipeline_次数_中位数: runs.length
        ? round1(median(runs.map(r => r.previewPipelineCount)))
        : '—',
      PreviewEmail_pipeline_中位数: previewFlat.length ? round1(median(previewFlat)) : '—',
      PreviewEmail_pipeline_最大值: previewFlat.length ? round1(max(previewFlat)) : '—',
      htmlToReact_中位数: htmlToReactFlat.length ? round1(median(htmlToReactFlat)) : '—',
    };
  }

  /** 场景 6 汇总（主表 + Undo/Redo 渲染耗时） */
  function report6(key) {
    const bucket = getStore()[key];
    if (!bucket?.phases) {
      console.warn(`[eePerf] ${key} 无场景6记录，请用 begin6() + phase6Start + snap6After`);
      return;
    }

    const rows = Object.entries(S6_PHASES).map(([phase, label]) => {
      const runs = bucket.phases[phase] || [];
      const stats = report6RowStats(runs);
      return {
        阶段: label,
        记录轮数: runs.length,
        ...stats,
      };
    });

    const edit5Runs = bucket.phases.edit5 || [];
    const edit5Stats = report6RowStats(edit5Runs);

    const fillTable = {
      record_stackPush: edit5Stats.recordStackPush_中位数,
      isEqual_content_ms: edit5Stats.isEqual_content_中位数,
      cloneDeep_values_ms: edit5Stats.cloneDeep_values_中位数,
    };

    const renderTable = {
      undo3: {
        mjmlPipeline_ms: rows.find(r => r.阶段 === S6_PHASES.undo3)?.MjmlDomRender_pipeline_中位数,
        previewPipeline_ms: rows.find(r => r.阶段 === S6_PHASES.undo3)?.PreviewEmail_pipeline_中位数,
        htmlToReact_ms: rows.find(r => r.阶段 === S6_PHASES.undo3)?.htmlToReact_中位数,
      },
      redo2: {
        mjmlPipeline_ms: rows.find(r => r.阶段 === S6_PHASES.redo2)?.MjmlDomRender_pipeline_中位数,
        previewPipeline_ms: rows.find(r => r.阶段 === S6_PHASES.redo2)?.PreviewEmail_pipeline_中位数,
        htmlToReact_ms: rows.find(r => r.阶段 === S6_PHASES.redo2)?.htmlToReact_中位数,
      },
      edit5_render: {
        mjmlPipeline_ms: edit5Stats.MjmlDomRender_pipeline_中位数,
        previewPipeline_ms: edit5Stats.PreviewEmail_pipeline_中位数,
      },
    };

    console.log(`[eePerf] ${key} — 场景6 撤销/重做（填入 PERF_BASELINE 场景6 表格）`);
    console.table(rows);
    console.log('[eePerf] 主表填表摘要（edit5 阶段，中位数）:', fillTable);
    console.log('[eePerf] 渲染耗时摘要（Undo/Redo 体感，中位数）:', renderTable);
    console.info(
      '[eePerf] 说明：Undo/Redo 不触发 RecordProvider.cloneDeep；卡顿看 MjmlDomRender + PreviewEmail pipeline',
    );
    return { phases: bucket.phases, rows, fillTable, renderTable };
  }

  const S5_PHASES = {
    editStay: '编辑 Tab 停留',
    pcPreview: '切到 PC 预览',
    mobilePreview: '切到移动预览',
    backToEdit: '切回编辑',
  };

  const S5_HINTS = {
    editStay: '保持在编辑 Tab，等待期间不要操作',
    pcPreview: '现在切换到 PC 预览 Tab',
    mobilePreview: '现在切换到移动预览 Tab',
    backToEdit: '现在切回编辑 Tab',
  };

  const S5_DEFAULT_WAIT = {
    editStay: 10000,
    pcPreview: 3000,
    mobilePreview: 3000,
    backToEdit: 1000,
  };

  /** 场景 5 整轮起点（begin5 后各 phase 用条目下标切分，不再每阶段 reset） */
  let s5RoundActive = false;

  function collect5FromEntries(entries) {
    const previewMs = entries
      .filter(e => e.tag === 'PreviewEmailProvider.pipeline')
      .map(e => e.metrics.pipelineMs)
      .filter(n => typeof n === 'number');
    const editMs = entries
      .filter(e => e.tag === 'MjmlDomRender.pipeline')
      .map(e => e.metrics.pipelineMs)
      .filter(n => typeof n === 'number');
    const tabChanges = entries.filter(e => e.tag === 'editor.tabChange');
    const tabSwitchMs = tabChanges
      .map(e => e.metrics.switchMs)
      .filter(n => typeof n === 'number');
    return {
      previewPipelineCount: previewMs.length,
      previewPipelineMsList: previewMs,
      editPipelineCount: editMs.length,
      editPipelineMsList: editMs,
      tabChangeCount: tabChanges.length,
      tabSwitchMsList: tabSwitchMs,
    };
  }

  /** 场景 5：单个 Tab 阶段内的 preview / edit pipeline 统计 */
  function collect5(startIndex) {
    const entries =
      typeof startIndex === 'number'
        ? perf().entries.slice(startIndex)
        : entriesInScenario();
    return collect5FromEntries(entries);
  }

  /** 场景 5：新一轮开始（整轮只 reset 一次，各阶段用 phase5 切分） */
  function begin5() {
    perf().reset();
    scenarioMark = { active: false, entryIndex: 0, counters: {} };
    s5RoundActive = true;
    console.log('[eePerf] 场景5 新一轮已开始（埋点已 reset）');
    console.log('[eePerf] 请按顺序执行: await phase5(key,"editStay") → pcPreview → mobilePreview → backToEdit');
  }

  function getS5Bucket(key) {
    const store = getStore();
    if (!store[key] || store[key].type !== 's5') {
      store[key] = {
        type: 's5',
        phases: Object.fromEntries(Object.keys(S5_PHASES).map(phase => [phase, []])),
      };
    }
    return store[key];
  }

  const COLLECTORS = {
    s1: collect1,
    collect1,
    s2: collect2,
    collect2,
    s3: collect3,
    collect3,
    s4: collect4,
    collect4,
    s5: collect5,
    collect5,
    s6: collect6,
    collect6,
  };

  const MS_LIST_FIELDS = new Set([
    'editPipelineMsList',
    'previewPipelineMsList',
    'isEqualContentMsList',
    'cloneDeepValuesMsList',
  ]);

  function getStore() {
    window[STORE] = window[STORE] || {};
    return window[STORE];
  }

  function snap(key, collector = 's1') {
    const fn = COLLECTORS[collector];
    if (!fn) throw new Error(`未知采集器: ${collector}`);
    const data = fn();
    const store = getStore();
    if (collector === 's4' || collector === 'collect4') {
      store[key] = store[key] || [];
      store[key].push({ ...data, _capturedAt: new Date().toISOString() });
      logSnapSummary(key, store[key].length, data);
      return data;
    }
    store[key] = store[key] || [];
    store[key].push({ ...data, _capturedAt: new Date().toISOString() });
    logSnapSummary(key, store[key].length, data);
    return data;
  }

  /**
   * 场景 4：操作完成后等待渲染链结束再采集（推荐，否则 pipeline 常为 0）
   * @param {number} waitMs 默认 1200ms，等 MjmlDomRender + Preview + Record 跑完
   */
  function snap4After(key, op, waitMs = 1200) {
    console.log(`[eePerf] 等待 ${waitMs}ms 后采集 ${op}…`);
    return new Promise(resolve => {
      setTimeout(() => resolve(snap4(key, op)), waitMs);
    });
  }

  /**
   * 场景 4：单次块操作后立即采集（可能漏记异步 pipeline，仅用于对比）
   * @param {'addBlock'|'moveBlock'|'copyBlock'|'removeBlock'} op
   */
  function snap4(key, op) {
    const data = collect4Step(op);
    const bucket = getS4Bucket(key);
    bucket.ops[op].push({ ...data, _capturedAt: new Date().toISOString() });
    const runNo = bucket.ops[op].length;
    console.log(`[eePerf] ${key}.${op} 第 ${runNo} 次`, {
      useBlock_cloneDeepMs: data.cloneDeepMs,
      useBlock_totalMs: data.totalMs,
      mjmlPipeline_ms: data.mjmlPipelineMsList.map(round1),
      previewPipeline_ms: data.previewPipelineMsList.map(round1),
      htmlToReactMs: data.htmlToReactMs,
      recordCloneDeepMs: data.recordCloneDeepMs,
    });
    return data;
  }

  function logSnapSummary(key, runNo, data) {
    const preview = data.previewPipelineMsList;
    const edit = data.editPipelineMsList;
    console.log(`[eePerf] 已记录 ${key} 第 ${runNo} 次`);
    if (preview) {
      console.log(
        `  PreviewEmailProvider.pipeline: ${preview.length} 次`,
        preview.length ? preview.map(round1) : '(无)',
        preview.length === 1 ? '← 仅 1 次时中位数=最大值' : '',
      );
    }
    if (edit) {
      console.log(
        `  MjmlDomRender.pipeline: ${edit.length} 次`,
        edit.length ? edit.map(round1) : '(无，富文本聚焦时正常为 0)',
      );
    }
    if (data.formStateChange != null) {
      console.log(`  formState.change: +${data.formStateChange}  record.stackPush: +${data.recordStackPush ?? 0}`);
    }
    if (data.addBlockCloneDeepMs != null) {
      S4_OPS.forEach(op => {
        console.log(
          `  ${op}: cloneDeep=${data[`${op}CloneDeepMs`]}ms total=${data[`${op}TotalMs`]}ms`,
        );
      });
    }
    if (data.cloneDeepMs != null) {
      console.log(
        `  ${data.op}: cloneDeep=${data.cloneDeepMs}ms total=${data.totalMs}ms pipeline=${data.mjmlPipelineCount}次`,
      );
    }
  }

  function logSnap5Phase(key, phase, runNo, data) {
    console.log(`[eePerf] ${key}.${phase} (${S5_PHASES[phase]}) 第 ${runNo} 次`, {
      previewPipeline_count: data.previewPipelineCount,
      previewPipeline_ms: data.previewPipelineMsList.length
        ? data.previewPipelineMsList.map(round1)
        : '(无 — 纯 Tab 切换不触发管线，属正常)',
      editPipeline_count: data.editPipelineCount,
      editPipeline_ms: data.editPipelineMsList.length
        ? data.editPipelineMsList.map(round1)
        : '(无)',
      tabChange_count: data.tabChangeCount,
      tabChange_switchMs: data.tabSwitchMsList.length
        ? data.tabSwitchMsList.map(round1)
        : '(无 — 本阶段内未切 Tab)',
    });
  }

  function pushSnap5(key, phase, data) {
    const bucket = getS5Bucket(key);
    bucket.phases[phase].push({ ...data, _capturedAt: new Date().toISOString() });
    logSnap5Phase(key, phase, bucket.phases[phase].length, data);
    return data;
  }

  /**
   * 场景 5：采集当前阶段（配合 phase5 或手动标记起点）
   * @param {'editStay'|'pcPreview'|'mobilePreview'|'backToEdit'} phase
   * @param {number} [phaseStartIndex] 阶段起点下标，默认从当前 entries 末尾往前不可知，需配合 phase5
   */
  function snap5(key, phase, phaseStartIndex) {
    if (!S5_PHASES[phase]) {
      throw new Error(`未知阶段: ${phase}，可选: ${Object.keys(S5_PHASES).join(', ')}`);
    }
    if (typeof phaseStartIndex !== 'number') {
      console.warn(
        '[eePerf] snap5 未传 phaseStartIndex，建议改用 begin5() + await phase5()',
      );
    }
    const data = collect5(phaseStartIndex);
    return pushSnap5(key, phase, data);
  }

  /**
   * 场景 5：单阶段 — 先提示操作，等待后采集（推荐）
   * @param {number} [waitMs] 不传则用 S5_DEFAULT_WAIT[phase]
   */
  function phase5(key, phase, waitMs) {
    if (!S5_PHASES[phase]) {
      throw new Error(`未知阶段: ${phase}，可选: ${Object.keys(S5_PHASES).join(', ')}`);
    }
    const ms = waitMs ?? S5_DEFAULT_WAIT[phase];
    const phaseStartIndex = perf().entries.length;
    console.log(`[eePerf] ▶ ${S5_PHASES[phase]}（${ms}ms）— ${S5_HINTS[phase]}`);
    return new Promise(resolve => {
      setTimeout(() => {
        const data = collect5(phaseStartIndex);
        resolve(pushSnap5(key, phase, data));
      }, ms);
    });
  }

  /** 场景 5：连续跑完 4 个阶段（需先 begin5()） */
  async function run5(key) {
    if (!s5RoundActive) {
      console.warn('[eePerf] 未调用 begin5()，已自动 begin5');
      begin5();
    }
    await phase5(key, 'editStay');
    await phase5(key, 'pcPreview');
    await phase5(key, 'mobilePreview');
    await phase5(key, 'backToEdit');
    s5RoundActive = false;
    console.log(`[eePerf] 场景5 一轮完成。硬刷新后重复 3 轮，再 report5("${key}")`);
  }

  /**
   * @deprecated 请改用 begin5() + await phase5()；每阶段 begin() 会清空埋点且纯切 Tab 不会触发 pipeline
   */
  function snap5After(key, phase, waitMs) {
    console.warn('[eePerf] snap5After 已过时，请改用 begin5() + await phase5()');
    return phase5(key, phase, waitMs);
  }

  /** 检查埋点是否正常写入 */
  function verify5() {
    const enabled = localStorage.getItem('ee-perf-debug');
    const p = perf();
    const recent = p.entries.slice(-15);
    console.log('[eePerf] verify5:', {
      eePerfDebug: enabled,
      totalEntries: p.entries.length,
      hasTabChange: p.entries.some(e => e.tag === 'editor.tabChange'),
      hasPreviewPipeline: p.entries.some(e => e.tag === 'PreviewEmailProvider.pipeline'),
      recentTags: recent.map(e => e.tag),
    });
    if (enabled !== '1') {
      console.warn('[eePerf] 请先 localStorage.setItem("ee-perf-debug","1") 并硬刷新');
    }
    if (!p.entries.some(e => e.tag === 'editor.tabChange')) {
      console.warn(
        '[eePerf] 未见 editor.tabChange — 需更新代码并硬刷新；切换 Tab 后应出现 [EE-Perf:editor.tabChange]',
      );
    }
    return { enabled, entries: p.entries };
  }

  /** 场景 5 汇总表（对应 PERF_BASELINE Tab 切换表格） */
  function report5(key) {
    const bucket = getStore()[key];
    if (!bucket?.phases) {
      console.warn(`[eePerf] ${key} 无场景5记录，请用 snap5() 采集`);
      return;
    }

    const rows = Object.entries(S5_PHASES).map(([phase, label]) => {
      const runs = bucket.phases[phase] || [];
      const previewCounts = runs.map(r => r.previewPipelineCount).filter(n => typeof n === 'number');
      const editCounts = runs.map(r => r.editPipelineCount).filter(n => typeof n === 'number');
      const tabCounts = runs.map(r => r.tabChangeCount).filter(n => typeof n === 'number');
      const previewMsFlat = runs.flatMap(r => r.previewPipelineMsList || []);
      const editMsFlat = runs.flatMap(r => r.editPipelineMsList || []);
      const tabMsFlat = runs.flatMap(r => r.tabSwitchMsList || []);
      const row = {
        阶段: label,
        记录轮数: runs.length,
      };
      runs.forEach((r, i) => {
        row[`第${i + 1}次_preview次数`] = r.previewPipelineCount;
        row[`第${i + 1}次_previewMs`] = r.previewPipelineMsList.length
          ? r.previewPipelineMsList.map(round1).join(', ')
          : '—';
        row[`第${i + 1}次_edit次数`] = r.editPipelineCount;
        row[`第${i + 1}次_tab切换Ms`] = r.tabSwitchMsList.length
          ? r.tabSwitchMsList.map(round1).join(', ')
          : '—';
      });
      row['PreviewEmail.pipeline_次数_中位数'] = previewCounts.length
        ? round1(median(previewCounts))
        : '—';
      row['PreviewEmail.pipelineMs_中位数'] = previewMsFlat.length
        ? round1(median(previewMsFlat))
        : '—';
      row['PreviewEmail.pipelineMs_最大值'] = previewMsFlat.length
        ? round1(max(previewMsFlat))
        : '—';
      row['MjmlDomRender.pipeline_次数_中位数'] = editCounts.length
        ? round1(median(editCounts))
        : '—';
      row['MjmlDomRender.pipelineMs_中位数'] = editMsFlat.length
        ? round1(median(editMsFlat))
        : '—';
      row['editor.tabChange_次数_中位数'] = tabCounts.length
        ? round1(median(tabCounts))
        : '—';
      row['editor.tabChange.switchMs_中位数'] = tabMsFlat.length
        ? round1(median(tabMsFlat))
        : '—';
      return row;
    });

    const fillTable = Object.fromEntries(
      rows.map(r => [
        r.阶段,
        {
          previewPipelineCount: r['PreviewEmail.pipeline_次数_中位数'],
          previewPipelineMs: r['PreviewEmail.pipelineMs_中位数'],
          editPipelineCount: r['MjmlDomRender.pipeline_次数_中位数'],
          tabChangeSwitchMs: r['editor.tabChange.switchMs_中位数'],
        },
      ]),
    );

    console.log(`[eePerf] ${key} — 场景5 Tab 切换（填入 PERF_BASELINE 场景5 表格）`);
    console.table(rows);
    console.log('[eePerf] 填表摘要（中位数）:', fillTable);
    console.info(
      '[eePerf] 说明：纯 Tab 切换不触发 Preview/Mjml pipeline，次数 0、pipelineMs — 属正常；' +
        '切换耗时可看 tabChangeSwitchMs（需新代码 + 硬刷新后出现 editor.tabChange 埋点）',
    );
    return { phases: bucket.phases, rows, fillTable };
  }

  /** 场景 4 汇总表（对应 PERF_BASELINE 块操作表格） */
  function report4(key) {
    const bucket = getStore()[key];
    if (!bucket?.ops) {
      console.warn(`[eePerf] ${key} 无场景4记录，请用 snap4() 采集`);
      return;
    }

    const rows = S4_OPS.map(op => {
      const runs = bucket.ops[op] || [];
      const cloneDeeps = runs.map(r => r.cloneDeepMs).filter(n => typeof n === 'number');
      const totals = runs.map(r => r.totalMs).filter(n => typeof n === 'number');
      const row = {
        操作: op,
        记录轮数: runs.length,
      };
      runs.forEach((r, i) => {
        row[`第${i + 1}次_cloneDeep`] = r.cloneDeepMs;
        row[`第${i + 1}次_total`] = r.totalMs;
        row[`第${i + 1}次_pipeline`] = r.mjmlPipelineCount;
      });
      if (cloneDeeps.length) {
        row['useBlock.cloneDeep_中位数'] = round1(median(cloneDeeps));
        row['useBlock.total_中位数'] = round1(median(totals));
      }
      const mjmlLists = runs.map(r => r.mjmlPipelineMsList || []);
      const previewLists = runs.map(r => r.previewPipelineMsList || []);
      const htmlToReact = runs.map(r => r.htmlToReactMs).filter(n => typeof n === 'number');
      const recordClone = runs.map(r => r.recordCloneDeepMs).filter(n => typeof n === 'number');
      const mjmlFlat = mjmlLists.flat();
      const previewFlat = previewLists.flat();
      row['MjmlDomRender.pipeline_中位数'] = round1(median(mjmlFlat));
      row['MjmlDomRender.pipeline_最大值'] = round1(max(mjmlFlat));
      row['PreviewEmail.pipeline_中位数'] = round1(median(previewFlat));
      row['PreviewEmail.pipeline_最大值'] = round1(max(previewFlat));
      row['htmlToReact_中位数'] = round1(median(htmlToReact));
      row['htmlToReact_最大值'] = round1(max(htmlToReact));
      row['RecordProvider.cloneDeep_中位数'] = round1(median(recordClone));
      row['RecordProvider.cloneDeep_最大值'] = round1(max(recordClone));
      row['是否触发_MjmlDomRender.pipeline'] = runs.some(r => r.mjmlPipelineTriggered)
        ? '是'
        : runs.length
          ? '否'
          : '—';
      return row;
    });

    const fillTable = Object.fromEntries(
      rows.map(r => [
        r.操作,
        {
          useBlock_cloneDeep_ms: r['useBlock.cloneDeep_中位数'],
          useBlock_total_ms: r['useBlock.total_中位数'],
          mjmlPipeline_ms: r['MjmlDomRender.pipeline_中位数'],
          mjmlPipeline_max_ms: r['MjmlDomRender.pipeline_最大值'],
          previewPipeline_ms: r['PreviewEmail.pipeline_中位数'],
          previewPipeline_max_ms: r['PreviewEmail.pipeline_最大值'],
          htmlToReact_ms: r['htmlToReact_中位数'],
          recordCloneDeep_ms: r['RecordProvider.cloneDeep_中位数'],
          pipelineTriggered: r['是否触发_MjmlDomRender.pipeline'],
        },
      ]),
    );

    console.log(`[eePerf] ${key} — 场景4 块操作（填入 PERF_BASELINE 场景4 表格）`);
    console.table(rows);
    console.log('[eePerf] 填表摘要（中位数）:', fillTable);
    return { ops: bucket.ops, rows, fillTable };
  }

  function report(key) {
    const store = getStore();
    const entry = store[key];
    if (entry?.type === 's4') {
      return report4(key);
    }
    if (entry?.type === 's5') {
      return report5(key);
    }
    if (entry?.type === 's6') {
      return report6(key);
    }
    const runs = entry;
    if (!runs?.length) {
      console.warn(`[eePerf] ${key} 无记录`);
      return;
    }

    const scalarFields = Object.keys(runs[0]).filter(
      k => !k.startsWith('_') && !MS_LIST_FIELDS.has(k),
    );

    const scalarRows = scalarFields.map(field => {
      const values = runs.map(r => r[field]);
      const nums = values.filter(v => typeof v === 'number');
      const row = { 指标: field };
      runs.forEach((r, i) => {
        row[`第${i + 1}次`] = r[field];
      });
      if (nums.length === values.length && nums.length > 0) {
        row['跨轮中位数'] = round1(median(nums));
        row['跨轮最大值'] = round1(max(nums));
      } else if (field.includes('Synced') || field.includes('Triggered')) {
        row['汇总'] = values.every(Boolean) ? '是' : values.some(Boolean) ? '部分' : '否';
      }
      return row;
    });

    console.log(`[eePerf] ${key} — 标量指标（跨 ${runs.length} 轮）`);
    console.table(scalarRows);

    MS_LIST_FIELDS.forEach(field => {
      if (!runs[0][field]) return;

      const perRunRows = runs.map((r, i) => {
        const list = r[field] || [];
        return {
          轮次: `第${i + 1}次`,
          次数: list.length,
          原始ms: list.length ? list.map(round1).join(', ') : '(无)',
          单轮中位数: round1(median(list)),
          单轮最大值: round1(max(list)),
          单轮最小值: round1(min(list)),
        };
      });

      const pooled = runs.flatMap(r => r[field] || []);

      console.log(`[eePerf] ${key} — ${field}（单轮明细）`);
      console.table(perRunRows);
      console.log(`[eePerf] ${field} 合并 ${runs.length} 轮共 ${pooled.length} 次 pipeline:`, pooled.map(round1));
      console.log({
        合并中位数: round1(median(pooled)),
        合并最大值: round1(max(pooled)),
        合并最小值: round1(min(pooled)),
      });

      if (pooled.length > 0 && median(pooled) === max(pooled)) {
        console.warn(
          `[eePerf] ${field} 合并后中位数=最大值=${round1(median(pooled))}ms。` +
            (pooled.length === 1
              ? '原因：仅触发 1 次 pipeline（富文本 debounce 后批量更新，属正常）'
              : '原因：多次 pipeline 耗时相同'),
        );
      }
    });

    const summary = buildSummary(runs);
    console.log('[eePerf] 填入 PERF_BASELINE 场景 2 可参考:', summary);
    return { runs, summary };
  }

  function buildSummary(runs) {
    const previewLists = runs.map(r => r.previewPipelineMsList || []);
    const editLists = runs.map(r => r.editPipelineMsList || []);

    return {
      editPipelineCount_跨轮中位数: round1(median(editLists.map(l => l.length))),
      previewPipelineCount_跨轮中位数: round1(median(previewLists.map(l => l.length))),
      previewPipelineMs_单轮中位数的跨轮中位数: round1(
        median(previewLists.map(l => median(l)).filter(n => n != null)),
      ),
      previewPipelineMs_单轮最大值的跨轮中位数: round1(
        median(previewLists.map(l => max(l)).filter(n => n != null)),
      ),
      previewPipelineMs_全部合并中位数: round1(median(previewLists.flat())),
      previewPipelineMs_全部合并最大值: round1(max(previewLists.flat())),
      formStateChange_跨轮中位数: round1(median(runs.map(r => r.formStateChange))),
      recordStackPush_跨轮中位数: round1(median(runs.map(r => r.recordStackPush))),
    };
  }

  /** 不 snap，直接查看当前场景内的 pipeline 原始数据（调试用） */
  function peek(collector = 's2') {
    const fn = COLLECTORS[collector];
    if (!fn) throw new Error(`未知采集器: ${collector}`);
    const data = fn();
    console.log('[eePerf] 当前场景 peek:', data);
    return data;
  }

  function reportAll() {
    Object.keys(getStore()).forEach(report);
  }

  function clear(key) {
    const store = getStore();
    if (key) {
      delete store[key];
    } else {
      Object.keys(store).forEach(k => delete store[k]);
    }
    console.log(`[eePerf] 已清除${key ? ` ${key}` : '全部'}`);
  }

  function list() {
    console.table(
      Object.entries(getStore()).map(([key, entry]) => {
        if (entry?.type === 's4') {
          return {
            key,
            type: 's4',
            addBlock: entry.ops.addBlock.length,
            moveBlock: entry.ops.moveBlock.length,
            copyBlock: entry.ops.copyBlock.length,
            removeBlock: entry.ops.removeBlock.length,
          };
        }
        if (entry?.type === 's5') {
          return {
            key,
            type: 's5',
            editStay: entry.phases.editStay.length,
            pcPreview: entry.phases.pcPreview.length,
            mobilePreview: entry.phases.mobilePreview.length,
            backToEdit: entry.phases.backToEdit.length,
          };
        }
        if (entry?.type === 's6') {
          return {
            key,
            type: 's6',
            edit5: entry.phases.edit5.length,
            undo3: entry.phases.undo3.length,
            redo2: entry.phases.redo2.length,
          };
        }
        return {
          key,
          type: 'default',
          count: entry.length,
          last: entry[entry.length - 1]?._capturedAt,
        };
      }),
    );
  }

  window.eePerf = {
    median,
    max,
    min,
    begin,
    snap,
    snap4,
    snap4After,
    peek,
    report,
    report4,
    reportAll,
    clear,
    list,
    collect1,
    collect2,
    collect3,
    collect4,
    collect4Step,
    collect5,
    collect6,
    begin6,
    phase6Start,
    snap6After,
    report6,
    begin5,
    phase5,
    run5,
    snap5,
    snap5After,
    report5,
    verify5,
    S4_OPS,
    S5_PHASES,
    S6_PHASES,
  };

  console.info(
    '[eePerf] 场景4: begin()→操作→await snap4After("s4-L-817","addBlock") ×3轮 → report4("s4-L-817")',
  );
  console.info(
    '[eePerf] 场景5: begin5()→await run5("s5-L-817") ×3轮 → report5("s5-L-817")  调试: verify5()',
  );
  console.info(
    '[eePerf] 场景6: begin6()→phase6Start→操作→await snap6After("s6-L-817","edit5") ×3阶段/轮 → report6',
  );
})();
