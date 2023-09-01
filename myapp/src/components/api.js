// api.js
export async function submitOrder(orderData) {
    try {
      const response = await fetch('/api/create_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      const data = await response.json().then(data => ({status: response.status,body:data}));
      return data;
    } catch (error) {
      throw new Error('Error submitting order: ' + error.message);
    }
  }  