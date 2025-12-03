const problemAnalyzer = require('./services/problem-analyzer.service');

async function test() {
  try {
    console.log('Loading data...');
    await problemAnalyzer.loadPreloadedData();
    
    const title = "Two Sum";
    console.log(`Analyzing "${title}"...`);
    
    const result = await problemAnalyzer.analyzeProblem(title);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.companies && result.companies.length > 0) {
      console.log('✅ Companies found:', result.companies.join(', '));
    } else {
      console.log('❌ No companies found');
    }

    if (result.patterns && result.patterns.includes('Two Pointers')) {
        console.log('✅ Two Pointers pattern found');
    } else {
        console.log('❌ Two Pointers pattern NOT found');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

test();
