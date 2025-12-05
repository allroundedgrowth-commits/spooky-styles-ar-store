// Quick test to check if delete endpoint is accessible
const testProductId = '477914eb-e57f-4b31-ab98-2f58d39f63b4';

// First, let's check if the product exists
fetch(`http://localhost:3000/api/products/${testProductId}`)
  .then(res => {
    console.log('GET Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Product exists:', data);
    
    // Now try to delete (will fail without auth, but should not be 404)
    return fetch(`http://localhost:3000/api/products/${testProductId}`, {
      method: 'DELETE'
    });
  })
  .then(res => {
    console.log('DELETE Status:', res.status);
    console.log('DELETE Status Text:', res.statusText);
    return res.json();
  })
  .then(data => {
    console.log('DELETE Response:', data);
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
