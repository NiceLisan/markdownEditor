async function test() {
  const response = await fetch('http://127.0.0.1:8800/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown: '![image](https://example.com/test.png)'
    })
  });
  const data = await response.json();
  console.log(data.html);
  if (data.html.includes('images.weserv.nl')) {
    console.error('❌ Test failed: Image proxy is still active by default.');
  } else {
    console.log('✅ Test passed: Image proxy is disabled by default.');
  }
}

test();
