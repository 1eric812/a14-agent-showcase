/* Static showcase adapter: the original Vue/Element Plus front end is unchanged apart from local paths and a demo user. No requests leave the page. */
(function () {
  const user = { username: 'admin', display_name: '演示管理员', role: 'admin' };
  const datasets = [
    {id: 8, name: '精馏塔仿真数据', source: '仿真生成', row_count: 3000, column_count: 8, time_span: '2026-10-14 10:00 ~ 10:49', created_at: '2026-10-14 16:30'},
    {id: 7, name: '反应器温控数据', source: 'CSV 上传', row_count: 2400, column_count: 6, time_span: '2026-10-13 08:00 ~ 08:40', created_at: '2026-10-13 14:12'},
    {id: 6, name: '换热网络运行数据', source: 'CSV 上传', row_count: 5120, column_count: 11, time_span: '2026-10-12 00:00 ~ 01:25', created_at: '2026-10-12 09:06'},
    {id: 5, name: '常减压装置数据', source: '仿真生成', row_count: 1800, column_count: 7, time_span: '2026-10-11 11:00 ~ 11:30', created_at: '2026-10-11 15:48'}
  ];
  const numeric = ['Feed_Flow', 'Steam_Flow', 'Reflux_Ratio', 'Product_Purity'];
  const curve = (offset, amp) => Array.from({length: 60}, (_, i) => Number((offset + Math.sin(i / 5) * amp + Math.sin(i / 2.8) * amp * .19 + (i > 35 ? Math.sin(i / 3) * amp * .3 : 0)).toFixed(3)));
  const rows = Array.from({length: 12}, (_, i) => ({Time: '10:' + String(20 + Math.floor(i / 6)).padStart(2,'0') + ':' + String((i % 6) * 10).padStart(2,'0'), Feed_Flow: 126.4 + i * .31, Steam_Flow: 84.2 + i * .23, Reflux_Ratio: 2.15 - i * .008, Product_Purity: 99.12 + i * .006}));
  const history = [78.4,81.2,83.7,84.1,86.9,87.3,89.4,90.8,91.1,92.8].map((fit,i)=>({fit,params:{iqr_mult:1.5,window:40,energy_ratio:.5,top_n:3},trial:i+1}));
  const result = {
    report: '精馏塔建模数据闭环寻优评估报告\n\n数据集：精馏塔仿真数据（静态演示样例）\n处理流程：异常清洗 → 动态片段优选 → 时滞与共线性处理 → 模型验证 → 闭环寻优\n\n结果：优选 1,842 个有效样本，保留 3 个输入变量。ARX 模型 FIT 为 91.6%，交叉验证最优模型 Random Forest 的 R² 为 0.914。闭环寻优后 FIT 提升至 92.8%。\n\n注意：本页用于展示前端界面，数值是预置样例，不是运行计算结果。',
    arx:{fit:91.6,na:2,nb:2}, model_eval:{best:{model:'Random Forest',r2:.914,fit:92.8}}, cv:{r2_mean:.914}, data:{rows:1842,lags:{Feed_Flow:5,Steam_Flow:12},input_cols:['Feed_Flow','Steam_Flow','Reflux_Ratio'],output_col:'Product_Purity'}, optimize:{best_fit:92.8,n_iter:10,elapsed:18.4,stopped_by_earlystop:true,best_params:{iqr_mult:1.5,window:40,energy_ratio:.5,top_n:3,max_lag:30,corr_threshold:.95},history}, segments:[{start:120,end:420,len:300,energy:1.82,score:94.2},{start:620,end:950,len:330,energy:1.65,score:89.8},{start:1210,end:1510,len:300,energy:1.59,score:87.6}],arx_candidates:[{na:1,nb:1,fit:87.2,r2:.82,aic:-218,dw:1.91},{na:2,nb:2,fit:91.6,r2:.89,aic:-263,dw:1.98},{na:3,nb:2,fit:90.8,r2:.87,aic:-251,dw:2.03}],figures:[],snapshot:{label:'精馏塔 · 闭环寻优',note:'静态演示样例'},quality:{score:87,components:{completeness:98,outlier_resilience:91,dynamic_content:84,independence:76},warnings:['回流比与进料流量相关性偏高，建议关注变量冗余。']}
  };
  const tasks = [
    {id:24024,dataset_id:8,status:'completed',progress:100,best_fit:92.8,current_stage:'评估交付',created_at:'2026-10-14 16:42:00',result:{snapshot:{label:'精馏塔 · 闭环寻优',note:'演示样例'}}},
    {id:24023,dataset_id:7,status:'completed',progress:100,best_fit:88.6,current_stage:'评估交付',created_at:'2026-10-14 14:18:00',result:{snapshot:{label:'反应器温控参数优化'}}},
    {id:24022,dataset_id:6,status:'completed',progress:100,best_fit:84.1,current_stage:'评估交付',created_at:'2026-10-13 10:27:00',result:{snapshot:{label:'换热网络动态段筛选'}}},
    {id:24021,dataset_id:8,status:'completed',progress:100,best_fit:79.5,current_stage:'评估交付',created_at:'2026-10-12 09:06:00',result:{snapshot:{label:'精馏塔基线实验'}}}
  ];
  const overview = (id) => ({dataset_id:Number(id)||8,name:(datasets.find(x=>x.id===Number(id))||datasets[0]).name,rows:3000,columns:['Time',...numeric],numeric_columns:['Time',...numeric],time_col:'Time',preview_rows:rows,raw_preview:{Feed_Flow:curve(126,5),Steam_Flow:curve(84,3),Reflux_Ratio:curve(2.1,.2),Product_Purity:curve(99,.1)},cleaned_preview:{Feed_Flow:curve(126,4.7),Steam_Flow:curve(84,2.8),Reflux_Ratio:curve(2.1,.18),Product_Purity:curve(99,.08)},corr:{Feed_Flow:{Feed_Flow:1,Steam_Flow:.82,Reflux_Ratio:.96,Product_Purity:.74},Steam_Flow:{Feed_Flow:.82,Steam_Flow:1,Reflux_Ratio:.79,Product_Purity:.81},Reflux_Ratio:{Feed_Flow:.96,Steam_Flow:.79,Reflux_Ratio:1,Product_Purity:.88},Product_Purity:{Feed_Flow:.74,Steam_Flow:.81,Reflux_Ratio:.88,Product_Purity:1}},quality:warningsQuality()});
  function warningsQuality(){return {score:87,components:{completeness:98,outlier_resilience:91,dynamic_content:84,independence:76},warnings:['回流比与进料流量相关性偏高，请在建模时复核变量选择。']};}
  function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});}
  function parseBody(init){try{return JSON.parse((init||{}).body||'{}')}catch(_){return {}}}
  function api(route,init={}){
    const method=(init.method||'GET').toUpperCase(), path=route.split('?')[0], idMatch=path.match(/^\/tasks\/([^/]+)$/);
    if(path==='/auth/login') return json({token:'a14-static-demo-token',user});
    if(path==='/dashboard/stats') return json({datasets:datasets.length});
    if(path==='/datasets'&&method==='GET') return json(datasets);
    if(path==='/tasks'&&method==='GET') return json(tasks);
    if(path==='/data/overview') return json(overview(new URLSearchParams(route.split('?')[1]||'').get('dataset_id')));
    if(path==='/config/system') return json({default_n_trials:10,max_n_trials:100,early_stop_tol:.5,max_lag:30,corr_threshold:.95,dynamic_energy_ratio:.5,llm_configured:false});
    if(path==='/config/parameter-templates') return json([{id:1,name:'精馏塔标准流程',iqr_mult:1.5,window:40,energy_ratio:.5,top_n:3,updated_by:'算法工程师'},{id:2,name:'反应器温控优化',iqr_mult:1.8,window:60,energy_ratio:.42,top_n:5,updated_by:'系统管理员'},{id:3,name:'通用高动态筛选',iqr_mult:1.5,window:30,energy_ratio:.6,top_n:3,updated_by:'算法工程师'}]);
    if(path==='/config/workflow-templates') return json([{id:1,name:'全流程闭环寻优',instruction:'清洗异常并提取动态段，处理时滞与共线性后闭环寻优',updated_by:'算法工程师',parameters:{n_trials:10,window:40,energy_ratio:.5}}]);
    if(path==='/admin/users') return json([{id:1,username:'admin',display_name:'演示管理员',role:'admin',can_upload:1,created_at:'2026-10-01'},{id:2,username:'engineer',display_name:'工艺工程师',role:'engineer',can_upload:1,created_at:'2026-10-02'},{id:3,username:'algorithm',display_name:'算法工程师',role:'algorithm',can_upload:1,created_at:'2026-10-03'},{id:4,username:'viewer',display_name:'演示访客',role:'viewer',can_upload:0,created_at:'2026-10-04'}]);
    if(path==='/audit') return json([{id:24,action:'RUN_OPTIMIZE',resource:'task#24024',operator:'admin',detail:'提交闭环寻优任务',ip:'127.0.0.1',created_at:'2026-10-14 16:42:00'},{id:23,action:'DATASET_CREATE',resource:'dataset#8',operator:'admin',detail:'生成精馏塔仿真数据',ip:'127.0.0.1',created_at:'2026-10-14 16:30:00'}]);
    if(path==='/experiments/compare') return json(tasks.slice(0,2).map(t=>({label:t.result.snapshot.label,dataset_id:t.dataset_id,best_fit:t.best_fit,r2:.914,mse:.014,aic:-263,rows:1842,variables:3})));
    if(path==='/assistant/chat') return json({reply:'这是静态界面演示。我可以带你查看数据质量、动态片段筛选和闭环寻优结果。后台计算与大模型问答未连接。',action:null});
    if(path==='/demo/dataset') return json({dataset_id:8,name:'精馏塔仿真数据'});
    if(path==='/data/generate'&&method==='POST') return json({dataset_id:8,rows:3000});
    if(path==='/data/preprocess') return json({dataset_id:9,rows:2864,selected_rows:1842,input_cols:['Feed_Flow','Steam_Flow','Reflux_Ratio'],output_col:'Product_Purity',segments:result.segments,removed_cols:[],lags:{Feed_Flow:5,Steam_Flow:12},preview_rows:rows,corr:overview(8).corr});
    if(path==='/run-optimize'||path==='/run-optimize/batch'){
      const body=parseBody(init), newId='DEMO-'+Date.now(), ds=body.dataset_id||8;
      const added={id:newId,dataset_id:ds,status:'completed',progress:100,best_fit:92.8,current_stage:'评估交付',created_at:new Date().toLocaleString('zh-CN'),result:{...result,snapshot:{label:'静态演示任务',note:'本任务为页面交互演示，不执行实际计算。'}}}; tasks.unshift(added);
      return json(path.endsWith('/batch')?{count:1,tasks:[{task_id:newId}]}:{task_id:newId});
    }
    if(idMatch) return json({...tasks.find(t=>String(t.id)===idMatch[1])||tasks[0],id:idMatch[1],result});
    if(path.startsWith('/datasets/')&&path.endsWith('/copy')&&method==='POST') return json({id:8});
    if(path.startsWith('/datasets/')&&method==='DELETE') return json({ok:true});
    if(path==='/config/parameter-templates/export') return new Response(JSON.stringify({templates:[]}),{status:200,headers:{'Content-Type':'application/json'}});
    if(path.includes('/export')||path.includes('/apply-params')||path.includes('/snapshot')) return json({ok:true});
    return json({ok:true});
  }
  function rag(path){
    if(path==='/me') return {username:'admin',can_upload:true};
    if(path==='/status') return {ready:true,vector_db:'Milvus（静态展示）',llm_configured:false,embedding_model:'BAAI/bge-m3',embedding_dim:1024,chunk_count:1246};
    if(path==='/roles') return [];
    if(path==='/users') return [];
    if(path.startsWith('/documents')) return {documents:[{doc_id:1,file_name:'精馏塔操作规程.pdf',file_size:248320,chunk_count:184,chunk_size:512,chunk_overlap:80,description:'精馏塔运行与操作规范',permissions:[{type:'public',value:''}],created_at:'2026-10-14 10:20:00'},{doc_id:2,file_name:'装置工艺指标说明.docx',file_size:86400,chunk_count:76,chunk_size:512,chunk_overlap:80,description:'工艺指标说明',permissions:[{type:'public',value:''}],created_at:'2026-10-13 11:00:00'}],chunks:[{chunk_id:1,content:'运行过程中应关注塔顶温度、回流比及产品纯度的动态变化。'}]};
    if(path==='/orphans') return {files:[]};
    return {ok:true,count:0,errors:[]};
  }
  const nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const raw=typeof input==='string'?input:input.url;
    let url; try{url=new URL(raw,location.href)}catch(_){return nativeFetch(input,init)}
    if(url.pathname.startsWith('/api/')) return Promise.resolve(api(url.pathname.slice(4)+url.search,init));
    if(url.pathname.startsWith('/rag-api/')) return Promise.resolve(json(rag(url.pathname.slice(8)+url.search)));
    return nativeFetch(input,init);
  };
  window.WebSocket=function(){this.readyState=3;this.close=function(){};};
  window.WebSocket.CONNECTING=0;window.WebSocket.OPEN=1;window.WebSocket.CLOSING=2;window.WebSocket.CLOSED=3;
  const nativeOpen=window.open.bind(window);
  window.open=function(url,...args){if(url==='/chat'){window.alert('静态展示模式未连接知识问答服务。');return null;}return nativeOpen(url,...args);};
})();
