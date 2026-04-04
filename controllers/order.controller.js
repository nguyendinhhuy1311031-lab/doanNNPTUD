/**
 * @file order.controller.js
 * @description Controller for Order CRUD operations
 */

const db = require('../models');
const Order = db.order;
const OrderDetail = db.orderDetail;
const Product = db.product;

// Generate unique order number
const generateOrderNumber = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, phoneNumber, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
        }

        if (!shippingAddress || !phoneNumber) {
            return res.status(400).json({ message: 'Địa chỉ giao hàng và số điện thoại là bắt buộc' });
        }

        let totalPrice = 0;
        const orderDetails = [];

        // Create order detail items and calculate total
        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({ message: `Sản phẩm ${item.productId} không tìm thấy` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng` });
            }

            const price = product.price * (1 - product.discount / 100);
            const itemTotal = price * item.quantity;
            totalPrice += itemTotal;

            const orderDetail = new OrderDetail({
                product: item.productId,
                quantity: item.quantity,
                price: price,
                totalPrice: itemTotal
            });

            await orderDetail.save();
            orderDetails.push(orderDetail._id);

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new Order({
            orderNumber: generateOrderNumber(),
            user: req.user.id,
            items: orderDetails,
            totalPrice,
            shippingAddress,
            phoneNumber,
            notes
        });

        await order.save();
        await order.populate('user', 'name email');
        await order.populate('items');

        res.status(201).json({
            message: 'Đặt hàng thành công',
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Orders (for admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User's Orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('user', 'name email')
            .populate('items')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Lấy đơn hàng của người dùng thành công',
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price discount'
                }
            });

        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
        }

        res.status(200).json({
            message: 'Lấy đơn hàng thành công',
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email')
            .populate('items');

        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
        }

        res.status(200).json({
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
        }

        if (order.status !== 'pending' && order.status !== 'confirmed') {
            return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
        }

        // Restore product stock
        for (const itemId of order.items) {
            const orderDetail = await OrderDetail.findById(itemId);
            const product = await Product.findById(orderDetail.product);
            product.stock += orderDetail.quantity;
            await product.save();
        }

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({
            message: 'Hủy đơn hàng thành công',
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
