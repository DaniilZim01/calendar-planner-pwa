import { testConnection } from './server/db/index.ts';

console.log('Testing import...');
console.log('testConnection type:', typeof testConnection);

if (typeof testConnection === 'function') {
  console.log('✅ testConnection is a function');
  testConnection().then(result => {
    console.log('Result:', result);
  }).catch(error => {
    console.error('Error:', error);
  });
} else {
  console.log('❌ testConnection is not a function');
} 