import dns from 'dns';

const base = 'ep-morning-credit-';
const suffixes = [
  'ankiwjd0',
  'amkiwjd0',
  'ank1wjd0',
  'amk1wjd0',
  'anklwjd0',
  'amklwjd0'
];

const endpoints = [
  '.c-6.us-east-1.aws.neon.tech',
  '-pooler.c-6.us-east-1.aws.neon.tech',
  '.us-east-1.aws.neon.tech'
];

async function testAll() {
  console.log("Testing DNS resolution for possible Neon hosts...");
  for (const suffix of suffixes) {
    for (const endpoint of endpoints) {
      const host = `${base}${suffix}${endpoint}`;
      try {
        await new Promise((resolve, reject) => {
          dns.lookup(host, (err, address) => {
            if (err) reject(err);
            else resolve(address);
          });
        });
        console.log(`✅ FOUND: ${host}`);
        return; // Stop as soon as we find the right one
      } catch (err) {
        // ENOTFOUND means wrong domain
      }
    }
  }
  console.log("❌ None of the variations were found.");
}

testAll();
