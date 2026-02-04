// 完整的TVDB代理Worker代码，保存为tvdb-proxy.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const API_KEY = ENV_API_KEY // 可以在Worker环境变量中配置更安全
  const TVDB_BASE_URL = 'https://api.thetvdb.com'
  
  // 提取原始请求路径
  const url = new URL(request.url)
  const path = url.pathname.replace('/tvdb', '') // 移除前缀
  
  // 构建TVDB API请求URL
  const tvdbUrl = `${TVDB_BASE_URL}${path}${url.search}`
  
  // 准备请求头
  const headers = new Headers({
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Sonarr/3.0'
  })
  
  // 处理POST/PUT请求体
  let body = null
  if (['POST', 'PUT'].includes(request.method)) {
    body = await request.text()
  }
  
  // 向TVDB发送请求
  try {
    const response = await fetch(tvdbUrl, {
      method: request.method,
      headers: headers,
      body: body
    })
    
    // 返回响应（可添加缓存）
    const clonedResponse = new Response(response.body, response)
    
    // 添加CORS头，允许Sonarr访问
    clonedResponse.headers.set('Access-Control-Allow-Origin', '*')
    clonedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    
    return clonedResponse
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}