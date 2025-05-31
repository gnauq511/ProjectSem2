import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class OrderService {
    // Get all orders for a customer
    async getOrdersByCustomerId(customerId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/customer/${customerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            throw error;
        }
    }

    // Get order by ID
    async getOrderById(orderId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    // Cancel an order (update status to CANCELLED)
    async cancelOrder(orderId) {
        try {
            // Send the status as a plain text string with proper content type
            const response = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/status`, 
                "CANCELLED", 
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }
}

const orderService = new OrderService();
export default orderService;
