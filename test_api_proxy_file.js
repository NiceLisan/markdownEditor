async function testHtmlFile() {
  const response = await fetch('http://127.0.0.1:8800/api/render/html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown: '![image](https://example.com/test.png)',
      title: 'Proxy Test'
    })
  });
  
  if (response.ok) {
    const text = await response.text();
    if (text.includes('images.weserv.nl')) {
      console.error('❌ Test failed: Image proxy is still active in HTML file output.');
    } else {
      console.log('✅ Test passed: Image proxy is disabled in HTML file output.');
    }
  } else {
    console.error('❌ API call failed:', response.status);
  }
}

testHtmlFile();
