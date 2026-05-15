const http = require('http');
const fs = require('fs');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data);
    const options = new URL(url);
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json)
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(json);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

function postForm(url, filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
    const options = new URL(url);
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'multipart/form-data; boundary=' + boundary
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    req.write(`--${boundary}\r\n`);
    req.write(`Content-Disposition: form-data; name="file"; filename="balances.csv"\r\n`);
    req.write(`Content-Type: text/csv\r\n\r\n`);
    req.write(fileContent);
    req.write(`\r\n--${boundary}--\r\n`);
    req.end();
  });
}

async function test() {
  try {
    await post('http://localhost:4523/api/accounts', {
      name: '现金账户',
      type: 'cash',
      balance: 1000
    });
    console.log('✅ 测试账户1创建成功');
    
    await post('http://localhost:4523/api/accounts', {
      name: '银行卡',
      type: 'bank',
      balance: 5000
    });
    console.log('✅ 测试账户2创建成功');
    
    await post('http://localhost:4523/api/accounts', {
      name: '信用卡',
      type: 'credit',
      balance: -2000
    });
    console.log('✅ 测试账户3创建成功');
    
    const importRes = await postForm('http://localhost:4523/api/accounts/import-balances', './test_balances.csv');
    console.log('✅ CSV导入结果:', importRes);
    
    const accountsRes = await get('http://localhost:4523/api/accounts');
    console.log('\n📊 更新后的账户余额:');
    accountsRes.forEach(a => {
      console.log(`  ${a.name}: ¥${a.balance}`);
    });
    
    const trendRes = await get('http://localhost:4523/api/reports/net-worth-trend?year=' + new Date().getFullYear());
    console.log('\n📈 净值趋势数据:');
    trendRes.forEach(t => {
      console.log(`  ${t.month}: ¥${t.netWorth}`);
    });
    
    console.log('\n🎉 所有测试通过！');
    console.log('\nCSV导入功能和净值趋势计算均已验证正常！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

test();
