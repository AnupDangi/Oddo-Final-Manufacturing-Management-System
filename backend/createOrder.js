// Create Manufacturing Order for Wooden Chair
import axios from 'axios';

async function createManufacturingOrder() {
  try {
    // Use the new frontend-friendly endpoint with product name search
    const response = await axios.post('http://localhost:5000/api/v1/manufacturing-orders/by-product-search', {
      product_search: "Wooden Chair",  // Just the product name!
      quantity: 5,
      planned_start_date: "2025-09-21",
      planned_end_date: "2025-09-25"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Manufacturing order created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error creating manufacturing order:');
    console.error(error.response?.data || error.message);
  }
}

createManufacturingOrder();