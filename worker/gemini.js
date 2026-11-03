const DEFAULT_MODEL='gemini-3.1-flash-lite';
const DEFAULT_FALLBACKS=['gemini-3.5-flash-lite','gemini-3.8-flash'];
export function geminiModels(env={}){
  const primary=env.GEMINI_MODEL||DEFAULT_MODEL;
  const fallbacks=env.GEMINI_FALLBACK_MODELS===undefined?DEFAULT_FALLBACKS:String(env.GEMINI_FALLBACK_MODELS).split(',').map(s=>s.trim()).filter(Boolean);
  const models=[...new Set([primary,...fallbacks])].slice(0,3);
  if(models.some(m=>!/^gemini-[a-zA-Z0-9.-]+$/.test(m)))throw new Error('Invalid Gemini model configuration');
  return models;
}
export async function generateGemini({env,prompt,schema,remote,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
  const models=geminiModels(env),attempts=[];
  for(const [index,model] of models.entries()){
    if(index)await wait(750*2**(index-1)+Math.floor(Math.random()*250));
    try{
      const response=await remote('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{
        method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.1,responseMimeType:'application/json',responseJsonSchema:schema,maxOutputTokens:2400,...(model==='gemini-3.1-flash-lite'?{thinkingConfig:{thinkingLevel:'minimal'}}:{})}})
      },25000);
      const data=await response.json();
      attempts.push({model,status:'responded'});
      return {model,text:data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join(''),attempts};
    }catch(error){
      const timeout=['TimeoutError','AbortError'].includes(error.name);
      attempts.push({model,status:timeout?'timeout':error.status||'network_error'});
      // A different model can help with capacity or a retired model. Credentials,
      // quota, bad requests and invalid content must not trigger model hopping.
      const retryable=timeout||[404,500,502,503,504].includes(error.status);
      if(!retryable||index===models.length-1){
        const message=timeout?'The provider request timed out.':error.message;
        const failure=new Error((attempts.length>1?'Gemini could not answer after '+attempts.length+' model attempts. ':'')+message);
        failure.attempts=attempts;failure.status=error.status;throw failure;
      }
    }
  }
}
