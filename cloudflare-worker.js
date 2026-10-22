const SITE = 'https://p9nmdyyjyp-spec.github.io';
const response=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':SITE,'Vary':'Origin','Cache-Control':'no-store'}});
export default {
 async fetch(req,env){
  const origin=req.headers.get('Origin');
  if(origin!==SITE)return response({error:'来源不允许'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':SITE,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-App-Password','Access-Control-Max-Age':'600'}});
  if(req.method!=='POST'||new URL(req.url).pathname!=='/api/ai')return response({error:'路径不存在'},404);
  if(!env.OPENAI_API_KEY||!env.APP_PASSWORD)return response({error:'Worker 未配置 Secret'},503);
  if(req.headers.get('X-App-Password')!==env.APP_PASSWORD)return response({error:'访问口令错误'},401);
  const len=Number(req.headers.get('content-length')||0);if(len>15_000_000)return response({error:'图片过大'},413);
  let data;try{data=await req.json()}catch{return response({error:'请求格式有误'},400)}
  let content, instructions;
  if(data.mode==='ocr'){
    if(!Array.isArray(data.images)||!data.images.length||data.images.length>6||data.images.some(x=>typeof x!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(x)||x.length>3_000_000))return response({error:'每次上传1至6张图片，每张压缩后需小于约2MB'},400);
    instructions='你是日语考试试卷的忠实转写助手。照片全部为横排日语，可能多页，按用户上传顺序识别。只识别清晰的正面正文和对应问题，忽略背面透字和底部阴影。不要补写、润色或凭语义杜撰；不能辨认的地方写［判読不明］。准确保留汉字假名、否定词、数字、下划线相关原句、选项编号。把题目与选项归入questions，阅读正文归入body。pages每项对应一张图片的逐页文字。warnings用中文简短说明无法识别或需人工核对之处。严格输出JSON对象，字段body、questions、pages、warnings。';
    content=[{type:'input_text',text:'请忠实转录这些按顺序排列的日语试卷照片，不要提供答案。只输出 JSON。'},...data.images.map(image_url=>({type:'input_image',image_url,detail:'high'}))];
  }else if(data.mode==='chat'){
    const question=String(data.question||'').slice(0,2000),article=String(data.article||'').slice(0,26000),questions=String(data.questions||'').slice(0,14000);
    if(!question)return response({error:'问题不能为空'},400);
    instructions='你是日语N2-N1阅读辅导老师。用中文解释日语句法、逻辑和选择题。只根据用户提供的文章回答，缺少证据时指出；避免编造引用。用户要求提示模式时先提示推理思路，不要直接给出选项编号或答案。';
    content=[{type:'input_text',text:`模式：${data.hints?'先提示不要直接揭晓答案':'可明确解释答案'}\n阅读正文：\n${article}\n问题选项：\n${questions}\n用户提问：${question}`}];
  }else return response({error:'未知模式'},400);
  const body={model:env.OPENAI_MODEL||'gpt-4.1-mini',store:false,instructions,input:[{role:'user',content}],max_output_tokens:data.mode==='ocr'?8000:3000};
  if(data.mode==='ocr')body.text={format:{type:'json_schema',name:'reading_ocr',strict:true,schema:{type:'object',additionalProperties:false,properties:{body:{type:'string'},questions:{type:'string'},pages:{type:'array',items:{type:'string'}},warnings:{type:'string'}},required:['body','questions','pages','warnings']}}};
  try{
   const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
   const j=await r.json();if(!r.ok)return response({error:'OpenAI 请求失败：'+(j.error?.message||r.status)},502);
   const t=(j.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
   if(data.mode==='ocr'){try{return response(JSON.parse(t))}catch{return response({error:'AI 识别结果无法解析，请重试'},502)}}
   return response({text:t});
  }catch(e){return response({error:'后端调用失败'},502)}
 }
};
